import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./config.js";

const googleProvider = new GoogleAuthProvider();

// Register dengan username unik
export async function registerUser(email, password, username) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);

  // Cek username unik di collection "usernames"
  const usernameRef = doc(db, "usernames", username.toLowerCase());
  const usernameSnap = await getDoc(usernameRef);
  if (usernameSnap.exists()) {
    await cred.user.delete();
    throw new Error("Username sudah dipakai, coba yang lain.");
  }

  await updateProfile(cred.user, { displayName: username });

  // Simpan profile + klaim username
  await setDoc(doc(db, "users", cred.user.uid), {
    uid: cred.user.uid,
    email,
    username,
    createdAt: serverTimestamp(),
    usernameChangedAt: serverTimestamp(),
  });
  await setDoc(usernameRef, { uid: cred.user.uid, createdAt: serverTimestamp() });

  return cred.user;
}

export async function loginUser(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function loginWithGoogle() {
  const cred = await signInWithPopup(auth, googleProvider);
  const user = cred.user;

  // Kalau belum ada profile di Firestore, buat baru
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
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
    await setDoc(doc(db, "usernames", username), { uid: user.uid });
  }
  return user;
}

export async function logoutUser() {
  await signOut(auth);
}

export function watchAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

// Aturan: username tidak bisa diubah dalam 7 hari
export const USERNAME_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

export function canChangeUsername(usernameChangedAt) {
  if (!usernameChangedAt) return true;
  const last = usernameChangedAt.toDate
    ? usernameChangedAt.toDate().getTime()
    : new Date(usernameChangedAt).getTime();
  return Date.now() - last >= USERNAME_COOLDOWN_MS;
}

export function remainingCooldown(usernameChangedAt) {
  const last = usernameChangedAt.toDate
    ? usernameChangedAt.toDate().getTime()
    : new Date(usernameChangedAt).getTime();
  const diff = USERNAME_COOLDOWN_MS - (Date.now() - last);
  if (diff <= 0) return null;
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  return { days, hours };
}
