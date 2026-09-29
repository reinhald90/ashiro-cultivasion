import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../firebase/auth.js";

export default function Register() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!/^[a-zA-Z0-9_]{3,16}$/.test(username)) {
      return setError("Username: 3-16 karakter, huruf/angka/underscore saja.");
    }
    if (password.length < 6) return setError("Password minimal 6 karakter.");
    if (password !== confirm) return setError("Konfirmasi password tidak cocok.");

    setBusy(true);
    try {
      await registerUser(email, password, username);
      nav("/");
    } catch (err) {
      setError(err.message || "Gagal mendaftar.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <img src="/logo.svg" alt="Ashiro" />
          <div>
            <h1>Ashiro Cultivation</h1>
            <span>Idle Xianxia RPG</span>
          </div>
        </div>

        <h2>Buat Akun</h2>
        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Username</label>
            <input
              required value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Pilih nama dao kamu"
              maxLength={16}
            />
          </div>
          <div className="field">
            <label>Email</label>
            <input
              type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password" required value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Konfirmasi Password</label>
            <input
              type="password" required value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" disabled={busy}>
            {busy ? "Membuat akun..." : "Daftar"}
          </button>
        </form>

        <div className="auth-footer">
          Sudah punya akun? <Link to="/login">Masuk</Link>
        </div>
      </div>
    </div>
  );
}
