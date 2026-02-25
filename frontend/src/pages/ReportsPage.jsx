import { useEffect, useState } from "react";
import { request } from "../services/api";

export default function ReportsPage() {
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    request("/billing/reports/summary/").then(setReport).catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!report) return <p>Loading...</p>;

  return (
    <div className="page">
      <h1>Reports</h1>
      <div className="grid">
        <div className="card"><h3>Total Invoices</h3><p>{report.total_invoices}</p></div>
        <div className="card"><h3>Total Amount</h3><p>{report.total_amount}</p></div>
        <div className="card"><h3>Total Paid</h3><p>{report.total_paid}</p></div>
        <div className="card"><h3>Outstanding Balance</h3><p>{report.total_unpaid_balance}</p></div>
        <div className="card"><h3>Unpaid Invoices</h3><p>{report.unpaid_invoices}</p></div>
      </div>
    </div>
  );
}
