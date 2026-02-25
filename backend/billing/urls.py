from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InvoiceViewSet, PaymentCreateView, ReportView

router = DefaultRouter()
router.register(r"invoices", InvoiceViewSet, basename="invoice")

urlpatterns = [
    path("", include(router.urls)),
    path("invoices/<int:invoice_id>/payments/", PaymentCreateView.as_view(), name="invoice_payment_create"),
    path("reports/summary/", ReportView.as_view(), name="reports_summary"),
]
