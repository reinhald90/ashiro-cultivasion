import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./config.js";

const googleProvider = new GoogleAuthProvider();

// Deteksi mobile untuk pilih method login Google
const isMobile =
  typeof navigator !== "undefined" &&
  /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
    navigator.userAgent
  );

// ============ EMAIL / PASSWORD ============

export async function registerUser(email, password, username) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);

  // Cek username unik
  const usernameRef = doc(db, "usernames", username.toLowerCase());
  const usernameSnap = await getDoc(usernameRef);
  if (usernameSnap.exists()) {
    await cred.user.delete();
    throw new Error("Username sudah dipakai, coba yang lain.");
  }

  await updateProfile(cred.user, { displayName: username });

  await setDoc(doc(db, "users", cred.user.uid), {
    uid: cred.user.uid,
    email,
    username,
    createdAt: serverTimestamp(),
    usernameChangedAt: serverTimestamp(),
  });
  await setDoc(usernameRef, {
    uid: cred.user.uid,
    createdAt: serverTimestamp(),
  });

  return cred.user;
}

export async function loginUser(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

// ============ GOOGLE ============

async function ensureUserProfile(user) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return;

  const base = (user.displayName || user.email.split("@")[0])
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "");
  const username = base + "_" + user.uid.slice(0, 4);

  await setDoc(ref, {
    uid: user.uid,
    email: user.email,
    username,
    createdAt: serverTimestamp(),
    usernameChangedAt: serverTimestamp(),
  });
  await setDoc(doc(db, "usernames", username), {
    uid: user.uid,
    createdAt: serverTimestamp(),
  });
}

export async function loginWithGoogle() {
  if (isMobile) {
    // Mobile: pakai redirect (anti popup-block)
    await signInWithRedirect(auth, googleProvider);
    return null; // halaman akan redirect, hasil ditangkap di handleRedirectResult
  }
  // Desktop: popup biasa
  const cred = await signInWithPopup(auth, googleProvider);
  await ensureUserProfile(cred.user);
  return cred.user;
}

// Tangkap hasil redirect saat app pertama load (khusus mobile)
export async function handleRedirectResult() {
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      await ensureUserProfile(result.user);
      return result.user;
    }
  } catch (err) {
    console.error("Redirect result error:", err);
  }
  return null;
}

// ============ LOGOUT & WATCH ============

export async function logoutUser() {
  await signOut(auth);
}

export function watchAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

// ============ USERNAME COOLDOWN ============

export const USERNAME_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

export function canChangeUsername(usernameChangedAt) {
  if (!usernameChangedAt) return true;
  const last = usernameChangedAt.toDate
    ? usernameChangedAt.toDate().getTime()
    : new Date(usernameChangedAt).getTime();
  return Date.now() - last >= USERNAME_COOLDOWN_MS;
}

export function remainingCooldown(usernameChangedAt) {
  if (!usernameChangedAt) return null;
  const last = usernameChangedAt.toDate
    ? usernameChangedAt.toDate().getTime()
    : new Date(usernameChangedAt).getTime();
  const diff = USERNAME_COOLDOWN_MS - (Date.now() - last);
  if (diff <= 0) return null;
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  return { days, hours };
}
