from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from authentication.permissions import IsAdmin, IsEmployee
from .serializers import LoanApplicationSerializer, EMIScheduleSerializer, LoanSerializer
from rest_framework.response import Response
from .models import Loan, EMISchedule
from django.utils import timezone
from .utils import calculate_emi, generate_emi_schedule

from authentication.auth import JWTCookieAuthentication
from accounts.models import Account
from customers.models import Customer
from notifications.utils import send_notification

from datetime import timedelta
import google.generativeai as genai
import json
import os

# Create your views here.

@api_view(["POST"])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTCookieAuthentication])
def apply_loan(request):
    customer = Customer.objects.get(user=request.user)
    account = Account.objects.get(customer=customer)

    serializer = LoanApplicationSerializer(data=request.data, context={'request': request})
    serializer.is_valid(raise_exception=True)

    # This will auto-generate loan_id
    loan = serializer.save(account=account)

    send_notification(
        title="New Loan Application",
        message=f"{request.user.get_full_name()} applied for ₹{loan.amount:,.0f} {loan.get_loan_type_display()}",
        notification_type="LOAN_APPLICATION",
        group="employees"
    )

    return Response({
        "message": "Loan application submitted successfully!",
        "loan_id": loan.loan_id
    }, status=201)

@api_view(["POST"])
@permission_classes([IsAdmin | IsEmployee])
@authentication_classes([JWTCookieAuthentication])
def approve_loan(request, loan_id):
    loan = Loan.objects.get(loan_id=loan_id)

    if loan.status != "PENDING":
        return Response({"error": "Loan is already processed"}, status=400)

    # calculate EMI
    emi = calculate_emi(loan.principal_amount, loan.interest_rate, loan.tenure_months)

    loan.emi_amount = emi
    loan.status = "APPROVED"
    loan.approved_at = timezone.now()
    loan.save()

    # generate EMI schedule
    generate_emi_schedule(loan)

    return Response({"message": "Loan approved", "emi": emi})

@api_view(["GET"])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTCookieAuthentication])
def get_emi_schedule(request, loan_id):
    loan = Loan.objects.get(loan_id=loan_id)
    schedule = EMISchedule.objects.filter(loan=loan)

    data = EMIScheduleSerializer(schedule, many=True).data
    return Response(data)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTCookieAuthentication])
def my_loans(request):
    loans = Loan.objects.filter(account__customer__user=request.user)
    return Response(LoanSerializer(loans, many=True).data)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTCookieAuthentication])
def loan_detail(request, loan_id):
    try:
        loan = Loan.objects.get(loan_id=loan_id, account__customer__user=request.user)
    except Loan.DoesNotExist:
        return Response({"error": "Loan not found"}, status=404)

    data = {
        "loan": LoanSerializer(loan).data,
        "emi_schedule": EMIScheduleSerializer(loan.emi_schedule.all(), many=True).data
    }

    return Response(data)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTCookieAuthentication])
def pay_emi(request, loan_id):
    try:
        loan = Loan.objects.get(loan_id=loan_id, account__customer__user=request.user)
    except Loan.DoesNotExist:
        return Response({"error": "Loan not found"}, status=404)

    emi = loan.emi_schedule.filter(is_paid=False).order_by("month_number").first()
    if not emi:
        return Response({"message": "Loan fully repaid!"}, status=200)

    account = loan.account
    if account.balance < emi.total_emi:
        return Response({"error": "Insufficient balance"}, status=400)

    account.balance -= emi.total_emi
    account.save()

    emi.is_paid = True
    emi.paid_at = timezone.now()
    emi.save()

    remaining = loan.emi_schedule.filter(is_paid=False).count()

    # Notify Customer
    send_notification(
        user=request.user,
        title="EMI Paid Successfully",
        message=f"EMI {emi.month_number} of ₹{emi.total_emi:,.2f} paid for your loan",
        notification_type="EMI_PAID",
        related_url="/customer/loans"
    )

    # If loan is now fully paid
    if remaining == 0:
        loan.status = "CLOSED"
        loan.closed_at = timezone.now()
        loan.save()

        send_notification(
            user=request.user,
            title="Congratulations! Loan Fully Repaid",
            message=f"You have successfully closed your loan of ₹{loan.amount:,}",
            notification_type="LOAN_CLOSED",
            related_url="/customer/loans"
        )

        # Optional: Notify employees too
        send_notification(
            title="Loan Closed",
            message=f"Customer {request.user.get_full_name()} fully repaid loan ({loan.loan_id})",
            notification_type="LOAN_CLOSED",
            group="employees"
        )

    return Response({
        "message": f"EMI {emi.month_number} paid successfully",
        "amount": f"₹{emi.total_emi:,.2f}",
        "remaining_emis": remaining
    })

@api_view(["GET"])
@permission_classes([IsAuthenticated, IsEmployee])
@authentication_classes([JWTCookieAuthentication])
def pending_loans(request):
    """Get all pending loan applications for employees with full details"""
    loans = Loan.objects.filter(status="PENDING").select_related(
        'account',
        'account__customer',
        'account__customer__user'
    )
    serializer = LoanSerializer(loans, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdmin | IsEmployee])
@authentication_classes([JWTCookieAuthentication])
def loan_application_detail(request, loan_id):
    """Get detailed loan application + customer info"""
    try:
        loan = Loan.objects.select_related('account__customer__user').get(loan_id=loan_id, status="PENDING")
    except Loan.DoesNotExist:
        return Response({"error": "Loan application not found or already processed"}, status=404)

    data = {
        "loan": LoanSerializer(loan).data,
        "customer": {
            "name": f"{loan.account.customer.user.first_name} {loan.account.customer.user.last_name}",
            "email": loan.account.customer.user.email,
            "phone": loan.account.customer.phone,
            "account_number": loan.account.account_number,
            "balance": str(loan.account.balance),
            "cibil_score": getattr(loan.account.customer, 'cibil_score', 'N/A'),
        }
    }
    return Response(data)

@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdmin | IsEmployee])
@authentication_classes([JWTCookieAuthentication])
def approved_loans(request):
    """
    Get all APPROVED and CLOSED loans with full EMI schedule and overdue status
    Used by Employee Dashboard
    """
    loans = Loan.objects.filter(status__in=["APPROVED", "CLOSED"]) \
        .select_related('account__customer__user') \
        .prefetch_related('emi_schedule')

    data = []
    today = timezone.now().date()

    for loan in loans:
        schedule = loan.emi_schedule.all().order_by('month_number')
        overdue_count = schedule.filter(is_paid=False, due_date__lt=today).count()

        loan_data = LoanSerializer(loan).data
        loan_data.update({
            "overdue_emis": overdue_count,
            "emi_schedule": EMIScheduleSerializer(schedule, many=True).data,
            "customer_name": f"{loan.account.customer.user.first_name} {loan.account.customer.user.last_name}",
            "customer_email": loan.account.customer.user.email,
        })
        data.append(loan_data)

    return Response(data)

@api_view(["POST"])
@permission_classes([IsAdmin | IsEmployee])
@authentication_classes([JWTCookieAuthentication])
def process_loan_application(request, loan_id):
    try:
        loan = Loan.objects.select_related('account__customer__user').get(loan_id=loan_id, status="PENDING")
    except Loan.DoesNotExist:
        return Response({"error": "Loan not found or already processed"}, status=404)

    action = request.data.get("action")
    interest_rate = request.data.get("interest_rate")

    if action not in ["APPROVE", "REJECT"]:
        return Response({"error": "Action must be APPROVE or REJECT"}, status=400)

    employee_name = request.user.get_full_name() or request.user.username
    customer_user = loan.account.customer.user

    if action == "APPROVE":
        if not interest_rate or not (8 <= float(interest_rate) <= 18):
            return Response({"error": "Interest rate must be between 8% and 18%"}, status=400)

        emi = calculate_emi(
            principal=loan.amount,
            annual_rate=float(interest_rate),
            tenure_months=loan.tenure_months
        )

        loan.interest_rate = float(interest_rate)
        loan.emi_amount = emi
        loan.status = "APPROVED"
        loan.approved_at = timezone.now()
        loan.approved_by = request.user
        loan.save()

        generate_emi_schedule(loan)

        # 1. Notify Customer - Loan Approved
        send_notification(
            user=customer_user,
            title="Loan Approved!",
            message=f"Your ₹{loan.amount:,} loan has been approved at {interest_rate}% p.a.\nEMI: ₹{emi:,.2f}/month",
            notification_type="LOAN_APPROVED",
            related_url="/customer/loans"
        )

        # 2. Notify All Employees - Audit Trail
        send_notification(
            title="Loan Approved",
            message=f"{employee_name} approved ₹{loan.amount:,} loan for {customer_user.get_full_name() or customer_user.username}",
            notification_type="ACTION_LOG",
            related_url=f"/employee/loans/approved/",
            group="employees"
        )

        return Response({
            "message": "Loan approved successfully",
            "emi_amount": f"₹{emi:,.2f}",
            "interest_rate": f"{interest_rate}%"
        })

    elif action == "REJECT":
        reason = request.data.get("reason", "Application did not meet eligibility criteria")
        loan.status = "REJECTED"
        loan.rejected_at = timezone.now()
        loan.rejected_by = request.user
        loan.rejection_reason = reason
        loan.save()

        # 1. Notify Customer - Loan Rejected
        send_notification(
            user=customer_user,
            title="Loan Application Rejected",
            message=f"We're sorry, your loan application was not approved.\nReason: {reason}",
            notification_type="LOAN_REJECTED",
            related_url="/customer/loans"
        )

        # 2. Notify Employees - Audit
        send_notification(
            title="Loan Rejected",
            message=f"{employee_name} rejected loan application of {customer_user.get_full_name() or customer_user.username}\nReason: {reason}",
            notification_type="ACTION_LOG",
            related_url=f"/employee/loans/rejected/",
            group="employees"
        )

        return Response({
            "message": "Loan application rejected",
            "reason": reason
        })
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTCookieAuthentication])
def get_loan_eligibility(request):
    try:
        customer = Customer.objects.get(user=request.user)
        account = Account.objects.filter(customer__user=request.user).first()

        if not account:
            return Response({"error": "No account found"}, status=400)

        if customer.kyc_status != "verified":
            return Response({
                "credit_score": None,
                "max_eligible_loan": 0,
                "message": "Complete KYC to check eligibility"
            })

        from .utils import calculate_credit_score_and_eligibility
        credit_score, eligible_amount = calculate_credit_score_and_eligibility(customer, account)

        # Save for future
        customer.credit_score = credit_score
        customer.max_eligible_loan = eligible_amount
        customer.save(update_fields=['credit_score', 'max_eligible_loan'])

        return Response({
            "credit_score": credit_score,
            "max_eligible_loan": eligible_amount,
            "message": "Eligibility calculated successfully",
            "salary": float(customer.monthly_salary),
            "balance": float(account.balance)
        })

    except Exception as e:
        import traceback
        print("ELIGIBILITY ERROR ->", str(e))
        print(traceback.format_exc())
        
        return Response({
            "credit_score": 500,
            "max_eligible_loan": 50000,
            "message": "Temporary issue — try again later."
        }, status=200)