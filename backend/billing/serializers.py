from rest_framework import serializers
from .models import Invoice, Payment


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ["id", "invoice", "payment_date", "payment_method", "amount_paid", "remaining_balance", "created_at"]
        read_only_fields = ["remaining_balance", "created_at"]


class InvoiceSerializer(serializers.ModelSerializer):
    paid_total = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    remaining_balance = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = Invoice
        fields = ["id", "invoice_number", "customer_name", "date", "due_date", "amount", "status", "paid_total", "remaining_balance", "created_at", "updated_at"]
        read_only_fields = ["status", "created_at", "updated_at"]


class InvoiceDetailSerializer(InvoiceSerializer):
    payments = PaymentSerializer(many=True, read_only=True)

    class Meta(InvoiceSerializer.Meta):
        fields = InvoiceSerializer.Meta.fields + ["payments"]
