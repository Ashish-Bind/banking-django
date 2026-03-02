from decimal import Decimal, getcontext
from .models import EMISchedule
from datetime import date, timedelta
from decimal import Decimal
from django.utils import timezone

getcontext().prec = 12

def calculate_emi(principal, annual_rate, tenure_months):
    P = Decimal(principal)
    r = Decimal(annual_rate) / Decimal(1200)  # monthly rate
    n = Decimal(tenure_months)

    if r == 0:
        return P / n

    emi = (P * r * (1 + r) ** n) / ((1 + r) ** n - 1)
    return emi.quantize(Decimal("0.01"))

def generate_emi_schedule(loan):
    emi = loan.emi_amount
    P = loan.amount
    r = Decimal(loan.interest_rate) / Decimal(1200)  # monthly
    n = loan.tenure_months

    remaining_principal = P
    schedules = []

    for month in range(1, n + 1):
        interest = remaining_principal * r
        principal = emi - interest

        remaining_principal -= principal

        due_date = date.today() + timedelta(days=30 * month)

        schedules.append(EMISchedule(
            loan=loan,
            month_number=month,
            due_date=due_date,
            principal_component=principal.quantize(Decimal("0.01")),
            interest_component=interest.quantize(Decimal("0.01")),
            total_emi=emi
        ))

    EMISchedule.objects.bulk_create(schedules)


from datetime import timedelta
from django.utils import timezone

def calculate_credit_score_and_eligibility(customer, account):
    base_score = 300
    salary = float(customer.monthly_salary)
    balance = float(account.balance)

    # -------------------- 1. Salary Weight --------------------
    if salary >= 150000:
        base_score += 220
    elif salary >= 100000:
        base_score += 180
    elif salary >= 60000:
        base_score += 130
    elif salary >= 30000:
        base_score += 80
    else:
        base_score += 40

    # -------------------- 2. Balance Discipline --------------------
    if balance >= salary * 1.5:
        base_score += 110
    elif balance >= salary * 0.75:
        base_score += 80
    elif balance >= salary * 0.30:
        base_score += 40
    else:
        base_score -= 20

    # -------------------- 3. Past Transaction Behavior (6 Months) --------------------
    cutoff = timezone.now() - timedelta(days=180)
    txs = account.transactions.filter(timestamp__gte=cutoff)

    deposits = sum(float(t.amount) for t in txs if t.transaction_type == "DEPOSIT")
    withdrawals = sum(abs(float(t.amount)) for t in txs if t.transaction_type in ["WITHDRAW", "TRANSFER"])

    if deposits > withdrawals * 1.5:
        base_score += 140
    elif deposits > withdrawals:
        base_score += 70
    else:
        base_score -= 80

    # Spending ratio
    if salary > 0:
        spending_ratio = withdrawals / (salary * 6)
        if spending_ratio <= 0.4:
            base_score += 80
        elif spending_ratio <= 0.7:
            base_score += 30
        else:
            base_score -= 60

    # -------------------- 4. Transaction Volume / Stability --------------------
    if txs.count() >= 50:
        base_score += 60
    elif txs.count() >= 20:
        base_score += 30
    elif txs.count() < 5:
        base_score -= 20

    # -------------------- 5. Salary Frequency / Stability --------------------
    salary_tx = [t for t in txs if "salary" in (t.description or "").lower()]

    if len(salary_tx) >= 6:
        base_score += 100
    elif len(salary_tx) >= 3:
        base_score += 50
    else:
        base_score -= 40

    # -------------------- 6. Employment Type --------------------
    if customer.employment_type == "SALARIED":
        base_score += 40
    elif customer.employment_type in ["SELF_EMPLOYED", "BUSINESS"]:
        base_score += 25
    else:
        base_score += 10

    # -------------------- 7. KYC Verification --------------------
    if customer.kyc_status == "verified":
        base_score += 100

    # -------------------- 8. Final Score Bound --------------------
    score = max(300, min(base_score, 900))

    # -------------------- 9. Realistic Loan Eligibility --------------------
    # Conservative multipliers (typically banks offer 3-5x monthly salary)
    if score < 550:
        multiplier = 0  # Not eligible
    elif score < 650:
        multiplier = 2  # 2x monthly salary (low credit)
    elif score < 750:
        multiplier = 3.5  # 3.5x monthly salary (fair credit)
    elif score < 850:
        multiplier = 5  # 5x monthly salary (good credit)
    else:
        multiplier = 6  # 6x monthly salary (excellent credit)

    max_loan = salary * multiplier

    # -------------------- 10. Small bonus for good savings (capped) --------------------
    # Add up to 10% of balance or ₹25,000, whichever is lower
    savings_bonus = min(balance * 0.10, 25000)
    max_loan += savings_bonus

    # -------------------- 11. Hard Cap for Safety --------------------
    # Cap maximum loan at ₹500,000 regardless of calculations
    max_loan = min(max_loan, 500000)

    return score, round(max_loan, 2)