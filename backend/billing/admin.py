from django.contrib import admin
from .models import Invoice, Payment


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ("invoice_number", "customer_name", "date", "due_date", "amount", "status")


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("invoice", "payment_date", "payment_method", "amount_paid", "remaining_balance")
