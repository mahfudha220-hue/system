import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { request } from "../services/api";

const today = new Date().toISOString().slice(0, 10);
const generateInvoiceNumber = () => {
  const d = new Date();
  const y = String(d.getFullYear()).slice(-2);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const suffix = Math.floor(100 + Math.random() * 900);
  return `INV-${y}${m}${day}-${suffix}`;
};

export default function InvoiceListPage() {
  const [invoices, setInvoices] = useState([]);
  const [error, setError] = useState("");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isAdmin = user?.role === "admin";
  const isCashier = user?.role === "cashier";
  const shouldAutoFillInvoice = isAdmin;
  const [form, setForm] = useState({ invoice_number: "", customer_name: "", date: today, due_date: today, amount: "" });

  const canCreate = isAdmin;

  const loadInvoices = async () => {
    try {
      setInvoices(await request("/billing/invoices/"));
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadInvoices();
    const timer = setInterval(loadInvoices, 10000);
    return () => clearInterval(timer);
  }, []);

  const createInvoice = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      if (shouldAutoFillInvoice && !payload.invoice_number) {
        payload.invoice_number = generateInvoiceNumber();
      }
      await request("/billing/invoices/", { method: "POST", body: JSON.stringify(payload) });
      setForm({
        invoice_number: shouldAutoFillInvoice ? generateInvoiceNumber() : "",
        customer_name: "",
        date: today,
        due_date: today,
        amount: "",
      });
      loadInvoices();
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteInvoice = async (invoiceId) => {
    setError("");
    if (!window.confirm("Delete this invoice?")) return;
    try {
      await request(`/billing/invoices/${invoiceId}/`, { method: "DELETE" });
      await loadInvoices();
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (shouldAutoFillInvoice && !form.invoice_number) {
      setForm((prev) => ({ ...prev, invoice_number: generateInvoiceNumber() }));
    }
  }, [shouldAutoFillInvoice, form.invoice_number]);

  return (
    <div className="page">
      <h1>Invoices</h1>
      {error && <p className="error">{error}</p>}
      {canCreate && (
        <form className="card" onSubmit={createInvoice}>
          <h2>Invoice</h2>
          <input
            placeholder="Invoice Number"
            value={form.invoice_number}
            onChange={(e) => setForm({ ...form, invoice_number: e.target.value })}
            required
            readOnly={isCashier}
          />
          <input placeholder="Customer Name" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} required />
          <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
          <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} required />
          <input type="number" step="0.01" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
          <button type="submit">Create Invoice</button>
        </form>
      )}

      {isCashier && (
        <div className="card">
          <p>Invoices are created by Admin and automatically shown here for cashier payments.</p>
        </div>
      )}
      <table className="table">
        <thead>
          <tr>
            <th>Invoice #</th><th>Customer</th><th>Date</th><th>Due</th><th>Amount</th><th>Status</th><th>Balance</th>
            <th>{isAdmin ? "Delete" : "Action"}</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv.id}>
              <td>{inv.invoice_number}</td><td>{inv.customer_name}</td><td>{inv.date}</td><td>{inv.due_date}</td><td>{inv.amount}</td><td>{inv.status}</td><td>{inv.remaining_balance}</td>
              <td>
                {isAdmin ? (
                  <button onClick={() => deleteInvoice(inv.id)}>Delete</button>
                ) : (
                  <Link to={`/invoices/${inv.id}`}>View</Link>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
