import { createContext, useContext, useEffect, useState } from "react";
import { watchAuth, handleRedirectResult } from "../firebase/auth.js";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsub = () => {};

    (async () => {
      // 1. Tangkap hasil redirect (mobile) — jika ada, tunggu dulu
      await handleRedirectResult();

      // 2. Baru pasang watcher auth
      unsub = watchAuth(async (u) => {
        setUser(u);
        if (u) {
          try {
            const snap = await getDoc(doc(db, "users", u.uid));
            if (snap.exists()) setProfile(snap.data());
          } catch (err) {
            console.error("Gagal ambil profile:", err);
          }
        } else {
          setProfile(null);
        }
        setLoading(false);
      });
    })();

    return () => unsub();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, setProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
