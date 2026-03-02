# loans/tasks.py  OR  management/commands/update_credit_scores.py

import google.generativeai as genai
from decimal import Decimal
from django.utils import timezone
from datetime import timedelta
from customers.models import Customer
from accounts.models import Account
from django.conf import settings
import json
import logging

logger = logging.getLogger(__name__)

# Configure Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)  # Set in .env or settings.py
model = genai.GenerativeModel('gemini-1.5-flash')  # Fast & cheap


def calculate_credit_score_and_eligibility(customer: Customer):
    """
    Analyzes customer's financial behavior using Gemini AI
    Updates: credit_score (300–900) and max_eligible_loan
    """
    try:
        account = Account.objects.filter(customer__user=customer.user).first()
        if not account:
            logger.warning(f"No account found for {customer.user}")
            return

        # Last 3 months transactions
        three_months_ago = timezone.now() - timedelta(days=90)
        recent_transactions = account.transactions.filter(
            timestamp__gte=three_months_ago
        ).order_by('-timestamp')[:100]

        # Basic stats
        total_deposits = sum(
            t.amount for t in recent_transactions if t.transaction_type == "DEPOSIT"
        )
        total_withdrawals = sum(
            abs(t.amount) for t in recent_transactions if t.transaction_type == "WITHDRAW"
        )
        avg_balance = account.balance  # or compute monthly avg if needed
        bounced_or_failed = account.transactions.filter(description__icontains="failed").count()
        salary_credits = sum(
            t.amount for t in recent_transactions
            if t.transaction_type == "DEPOSIT" and ("salary" in t.description.lower() or t.amount > customer.monthly_salary * 0.8)
        )

        # Format recent 20 transactions for AI
        tx_lines = []
        for t in recent_transactions[:20]:
            sign = "+" if t.transaction_type in ["DEPOSIT", "DEPOSIT"] else "-"
            tx_lines.append(f"{t.timestamp.strftime('%b %d')} | {sign}₹{abs(t.amount):,.0f} | {t.description or t.transaction_type}")

        transaction_summary = "\n".join(tx_lines) if tx_lines else "No recent transactions"

        prompt = f"""
You are an expert credit risk officer at a digital bank.

Analyze this customer and return ONLY valid JSON with:
- credit_score: integer from 300 to 900
- max_eligible_loan: amount in rupees they can safely borrow (0 if risky)
- short_reason: 1 sentence explanation

Customer Profile:
- Monthly Salary: ₹{customer.monthly_salary:,.0f}
- Current Balance: ₹{account.balance:,.0f}
- Employment: {customer.get_employment_type_display()}
- Estimated Monthly Salary Credits: ₹{salary_credits:,.0f}
- Total Deposits (3 months): ₹{total_deposits:,.0f}
- Total Withdrawals (3 months): ₹{total_withdrawals:,.0f}
- Failed Transactions: {bounced_or_failed}

Recent 20 Transactions:
{transaction_summary}

Return only JSON like this:
{{
  "credit_score": 762,
  "max_eligible_loan": 650000,
  "short_reason": "Consistent salary credits and healthy savings pattern"
}}
"""

        response = model.generate_content(prompt)
        text = response.text.strip().strip("```json").strip("```").strip()

        try:
            result = json.loads(text)
            credit_score = int(result["credit_score"])
            max_loan = Decimal(str(result["max_eligible_loan"]))

            # Apply safety caps
            credit_score = max(300, min(900, credit_score))
            max_loan = max(Decimal('0'), min(max_loan, customer.monthly_salary * 12))  # Max 12x salary

            # Update customer
            customer.credit_score = credit_score
            customer.max_eligible_loan = max_loan
            customer.save(update_fields=['credit_score', 'max_eligible_loan'])

            logger.info(f"Credit score updated → {customer.user.email}: {credit_score} | Eligible: ₹{max_loan:,.0f}")

        except (json.JSONDecodeError, KeyError, ValueError) as e:
            logger.error(f"Gemini response parsing failed for {customer.user}: {text[:200]} | Error: {e}")

    except Exception as e:
        logger.error(f"Error processing {customer.user}: {e}")


# Run for all customers (use in Celery beat or management command)
def run_for_all_customers():
    customers = Customer.objects.filter(kyc_verified=True, monthly_salary__gt=10000)
    print(f"Updating credit scores for {customers.count()} customers...")
    for customer in customers:
        calculate_credit_score_and_eligibility(customer)
    print("Done!")