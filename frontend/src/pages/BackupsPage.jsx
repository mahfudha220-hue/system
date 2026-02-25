import { useEffect, useState } from "react";
import { request } from "../services/api";

export default function BackupsPage() {
  const [records, setRecords] = useState([]);
  const [error, setError] = useState("");

  const load = () => request("/backups/").then(setRecords).catch((err) => setError(err.message));
  useEffect(() => { load(); }, []);

  const createBackup = async () => {
    try {
      await request("/backups/", { method: "POST" });
      load();
    } catch (err) { setError(err.message); }
  };

  const restoreBackup = async (id) => {
    if (!window.confirm("Restore this backup? This will overwrite current database file.")) return;
    try {
      await request(`/backups/${id}/restore/`, { method: "POST" });
      alert("Restore completed.");
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="page">
      <h1>Database Backups</h1>
      {error && <p className="error">{error}</p>}
      <button onClick={createBackup}>Create Manual Backup</button>
      <table className="table">
        <thead><tr><th>ID</th><th>File</th><th>Created</th><th>Action</th></tr></thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.id}><td>{r.id}</td><td>{r.file_path}</td><td>{r.created_at}</td><td><button onClick={() => restoreBackup(r.id)}>Restore</button></td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
