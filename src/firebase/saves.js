import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./config.js";

export async function loadGame(uid) {
  console.log("[save] loadGame() uid:", uid);
  const ref = doc(db, "saves", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    console.log("[save] No document at saves/" + uid);
    return null;
  }
  console.log("[save] Loaded:", snap.data());
  return snap.data();
}

export async function saveGame(uid, player) {
  console.log("[save] saveGame() uid:", uid);
  const ref = doc(db, "saves", uid);
  await setDoc(
    ref,
    {
      ...player,
      lastTick: Date.now(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
  console.log("[save] Saved OK at", new Date().toISOString());
}

export async function debugFirebase() {
  try {
    const { getDoc, doc } = await import("firebase/firestore");
    const { db } = await import("./config.js");
    console.log("[debug] Testing Firestore read...");
    const snap = await getDoc(doc(db, "____test____", "ping"));
    console.log("[debug] Firestore reachable. exists:", snap.exists());
  } catch (err) {
    console.error("[debug] Firestore FAILED:", err.code, err.message);
  }
}
