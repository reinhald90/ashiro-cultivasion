import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./config.js";

export async function loadGame(uid) {
  try {
    const snap = await getDoc(doc(db, "saves", uid));
    if (!snap.exists()) return null;
    return snap.data();
  } catch (err) {
    console.error("loadGame error:", err);
    return null;
  }
}

export async function saveGame(uid, player) {
  try {
    await setDoc(
      doc(db, "saves", uid),
      {
        ...player,
        lastTick: Date.now(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error("saveGame error:", err);
  }
}
