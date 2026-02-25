from django.db.models import Sum
from django.db import transaction
from django.conf import settings
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.permissions import IsCashierOrAdmin, IsManagerOrAdmin, IsAdmin
from backups.services import perform_backup
from .models import Invoice, Payment
from .serializers import InvoiceSerializer, InvoiceDetailSerializer, PaymentSerializer


class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all().order_by("-date", "-id")
    filterset_fields = ["status", "customer_name"]
    search_fields = ["invoice_number", "customer_name"]
    ordering_fields = ["date", "due_date", "amount", "created_at"]

    def get_permissions(self):
        permission_classes = [IsAuthenticated] if self.action in ["list", "retrieve"] else [IsAuthenticated, IsAdmin]
        return [p() for p in permission_classes]

    def get_serializer_class(self):
        return InvoiceDetailSerializer if self.action == "retrieve" else InvoiceSerializer

    def perform_create(self, serializer):
        serializer.save()
        if settings.AUTO_BACKUP_ON_TRANSACTION:
            perform_backup(getattr(self.request, "user", None))


class PaymentCreateView(APIView):
    permission_classes = [IsAuthenticated, IsCashierOrAdmin]

    @transaction.atomic
    def post(self, request, invoice_id):
        try:
            invoice = Invoice.objects.select_for_update().get(id=invoice_id)
        except Invoice.DoesNotExist:
            return Response({"detail": "Invoice not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = PaymentSerializer(data={**request.data, "invoice": invoice.id})
        serializer.is_valid(raise_exception=True)

        amount_paid = serializer.validated_data["amount_paid"]
        current_paid = invoice.payments.aggregate(total=Sum("amount_paid"))["total"] or 0
        remaining = invoice.amount - current_paid - amount_paid
        if remaining < 0:
            return Response({"detail": "Payment exceeds invoice balance"}, status=status.HTTP_400_BAD_REQUEST)

        payment = serializer.save(remaining_balance=remaining)
        invoice.refresh_status()
        invoice.save(update_fields=["status", "updated_at"])
        if settings.AUTO_BACKUP_ON_TRANSACTION:
            perform_backup(getattr(request, "user", None))
        return Response(PaymentSerializer(payment).data, status=status.HTTP_201_CREATED)


class ReportView(APIView):
    permission_classes = [IsAuthenticated, IsManagerOrAdmin]

    def get(self, request):
        invoices = Invoice.objects.all()
        total_invoices = invoices.count()
        total_amount = invoices.aggregate(total=Sum("amount"))["total"] or 0
        total_paid = Payment.objects.aggregate(total=Sum("amount_paid"))["total"] or 0
        unpaid_count = invoices.filter(status="unpaid").count()
        return Response({
            "total_invoices": total_invoices,
            "total_amount": total_amount,
            "total_paid": total_paid,
            "total_unpaid_balance": total_amount - total_paid,
            "unpaid_invoices": unpaid_count,
        })
