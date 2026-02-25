import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="nav">
      <div>
        <Link to="/">Invoices</Link>
        {(user?.role === "manager" || user?.role === "admin") && <Link to="/reports">Reports</Link>}
        {user?.role === "admin" && <Link to="/backups">Backups</Link>}
      </div>
      <div>
        <span>{user?.username} ({user?.role})</span>
        <button onClick={logout}>Logout</button>
      </div>
    </nav>
  );
}
