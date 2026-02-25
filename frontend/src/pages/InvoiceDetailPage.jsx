import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { request } from "../services/api";

const today = new Date().toISOString().slice(0, 10);

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({ payment_date: today, payment_method: "cash", amount_paid: "" });

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const canPay = user && ["admin", "cashier"].includes(user.role);
  const canDownloadPdf = user?.role !== "admin";

  const loadInvoice = async () => {
    try {
      setInvoice(await request(`/billing/invoices/${id}/`));
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => { loadInvoice(); }, [id]);

  const addPayment = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await request(`/billing/invoices/${id}/payments/`, { method: "POST", body: JSON.stringify(form) });
      setForm({ payment_date: today, payment_method: "cash", amount_paid: "" });
      await loadInvoice();
      setSuccess("Successfully saved payment.");
    } catch (err) {
      setError(err.message);
    }
  };

  const downloadPdf = async () => {
    setError("");
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      let y = 15;
      doc.setFontSize(16);
      doc.text("Invoice", 14, y);
      y += 10;
      doc.setFontSize(12);
      doc.text(`Invoice #: ${invoice.invoice_number}`, 14, y);
      y += 8;
      doc.text(`Customer: ${invoice.customer_name}`, 14, y);
      y += 8;
      doc.text(`Date: ${invoice.date}`, 14, y);
      y += 8;
      doc.text(`Due Date: ${invoice.due_date}`, 14, y);
      y += 8;
      doc.text(`Amount: ${invoice.amount}`, 14, y);
      y += 8;
      doc.text(`Status: ${invoice.status}`, 14, y);
      y += 8;
      doc.text(`Remaining Balance: ${invoice.remaining_balance}`, 14, y);
      y += 12;
      doc.setFontSize(13);
      doc.text("Payments", 14, y);
      y += 8;
      doc.setFontSize(10);
      for (const p of invoice.payments) {
        const line = `${p.payment_date} | ${p.payment_method} | Paid: ${p.amount_paid} | Balance: ${p.remaining_balance}`;
        doc.text(line, 14, y);
        y += 6;
        if (y > 280) {
          doc.addPage();
          y = 15;
        }
      }
      doc.save(`invoice_${invoice.invoice_number}.pdf`);
    } catch (err) {
      setError(err?.message || "Unable to generate PDF.");
    }
  };

  if (!invoice) return <p>Loading...</p>;

  return (
    <div className="page">
      <h1>Invoice {invoice.invoice_number}</h1>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
      <div className="card">
        <p>Customer: {invoice.customer_name}</p>
        <p>Date: {invoice.date}</p>
        <p>Due Date: {invoice.due_date}</p>
        <p>Amount: {invoice.amount}</p>
        <p>Status: {invoice.status}</p>
        <p>Remaining Balance: {invoice.remaining_balance}</p>
        {canDownloadPdf && <button onClick={downloadPdf}>Download PDF</button>}
      </div>
      {canPay && (
        <form className="card" onSubmit={addPayment}>
          <h2>Record Payment</h2>
          <input type="date" value={form.payment_date} onChange={(e) => setForm({ ...form, payment_date: e.target.value })} required />
          <select value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })}>
            <option value="cash">Cash</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="mobile_money">Mobile Money</option>
            <option value="card">Card</option>
          </select>
          <input type="number" step="0.01" placeholder="Amount Paid" value={form.amount_paid} onChange={(e) => setForm({ ...form, amount_paid: e.target.value })} required />
          <button type="submit">Save Payment</button>
        </form>
      )}
      <h2>Payments</h2>
      <table className="table">
        <thead><tr><th>Date</th><th>Method</th><th>Amount Paid</th><th>Remaining Balance</th></tr></thead>
        <tbody>
          {invoice.payments.map((p) => (
            <tr key={p.id}><td>{p.payment_date}</td><td>{p.payment_method}</td><td>{p.amount_paid}</td><td>{p.remaining_balance}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
