from django.db import models
from django.core.validators import MinValueValidator


class InvoiceStatus(models.TextChoices):
    PAID = "paid", "Paid"
    UNPAID = "unpaid", "Unpaid"


class Invoice(models.Model):
    invoice_number = models.CharField(max_length=40, unique=True)
    customer_name = models.CharField(max_length=200)
    date = models.DateField()
    due_date = models.DateField()
    amount = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    status = models.CharField(max_length=20, choices=InvoiceStatus.choices, default=InvoiceStatus.UNPAID)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def paid_total(self):
        return sum(p.amount_paid for p in self.payments.all())

    @property
    def remaining_balance(self):
        return max(self.amount - self.paid_total, 0)

    def refresh_status(self):
        self.status = InvoiceStatus.PAID if self.remaining_balance <= 0 else InvoiceStatus.UNPAID


class PaymentMethod(models.TextChoices):
    CASH = "cash", "Cash"
    BANK_TRANSFER = "bank_transfer", "Bank Transfer"
    MOBILE_MONEY = "mobile_money", "Mobile Money"
    CARD = "card", "Card"


class Payment(models.Model):
    invoice = models.ForeignKey(Invoice, on_delete=models.PROTECT, related_name="payments")
    payment_date = models.DateField()
    payment_method = models.CharField(max_length=30, choices=PaymentMethod.choices)
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0.01)])
    remaining_balance = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-payment_date", "-id"]
