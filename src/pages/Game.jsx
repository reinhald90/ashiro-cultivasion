import { useAuth } from "../contexts/AuthContext.jsx";
import { logoutUser } from "../firebase/auth.js";

export default function Game() {
  const { profile } = useAuth();

  return (
    <div style={{ padding: 24 }}>
      <h1>Selamat datang, {profile?.username || "Cultivator"} 🧘</h1>
      <p style={{ color: "var(--muted)", marginTop: 8 }}>
        Game engine akan dibuat di Batch 2.
      </p>
      <button
        className="btn btn-primary"
        style={{ width: 200, marginTop: 24 }}
        onClick={logoutUser}
      >
        Logout
      </button>
    </div>
  );
}
