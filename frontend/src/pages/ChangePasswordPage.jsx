import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { request } from "../services/api";

export default function ChangePasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await request("/auth/change-password/", {
        method: "POST",
        body: JSON.stringify({ new_password: newPassword, confirm_password: confirmPassword }),
      });
      const raw = localStorage.getItem("user");
      if (raw) {
        const user = JSON.parse(raw);
        user.must_change_password = false;
        localStorage.setItem("user", JSON.stringify(user));
      }
      setSuccess("Password changed successfully.");
      setTimeout(() => navigate("/"), 700);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="center-card">
      <h1>Change Password</h1>
      <form onSubmit={submit}>
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
        <button type="submit">Save New Password</button>
      </form>
    </div>
  );
}
