import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { request } from "../services/api";

export default function LoginPage() {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [regForm, setRegForm] = useState({
    username: "",
    password: "",
    email: "",
    first_name: "",
    last_name: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const submitLogin = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      const data = await request("/auth/login/", { method: "POST", body: JSON.stringify({ username, password }) });
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate(data.user.must_change_password ? "/change-password" : "/");
    } catch (err) {
      setError(err.message);
    }
  };

  const submitRegister = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await request("/auth/register-cashier/", { method: "POST", body: JSON.stringify(regForm) });
      setMessage("Cashier registered successfully. Please login.");
      setMode("login");
      setUsername(regForm.username);
      setPassword("");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="center-card">
      <h1>Payment System</h1>

      {mode === "login" ? (
        <form onSubmit={submitLogin}>
          <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <p className="error">{error}</p>}
          {message && <p>{message}</p>}
          <div className="login-actions">
            <button className="small-btn" type="button" onClick={() => setMode("register")}>
              Cashier Register
            </button>
            <button type="submit">Login</button>
          </div>
        </form>
      ) : (
        <form onSubmit={submitRegister}>
          <input
            placeholder="Username"
            value={regForm.username}
            onChange={(e) => setRegForm({ ...regForm, username: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={regForm.password}
            onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
            required
          />
          <input
            placeholder="Email (optional)"
            value={regForm.email}
            onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
          />
          <input
            placeholder="First Name (optional)"
            value={regForm.first_name}
            onChange={(e) => setRegForm({ ...regForm, first_name: e.target.value })}
          />
          <input
            placeholder="Last Name (optional)"
            value={regForm.last_name}
            onChange={(e) => setRegForm({ ...regForm, last_name: e.target.value })}
          />
          {error && <p className="error">{error}</p>}
          <button type="submit">Register Cashier</button>
          <button type="button" onClick={() => setMode("login")}>
            Back to Login
          </button>
        </form>
      )}
    </div>
  );
}
