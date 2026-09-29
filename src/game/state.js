import { getRealm } from "./data/realms.js";

export function defaultPlayer() {
  const realm = getRealm(0);
  return {
    name: "Tanpa Nama",
    realm: 0,
    subLevel: 0,
    qi: 0,
    maxQi: realm.qiPerSub,
    hp: 100,
    maxHp: 100,
    lifespan: realm.lifespan,
    age: 16,
    spiritStones: 0,
    totalMeditatedSec: 0,
    lastTick: Date.now(),
    createdAt: Date.now(),
  };
}

export function initPlayer(saved) {
  const base = defaultPlayer();
  if (!saved) return base;
  const merged = { ...base, ...saved };
  // Recompute maxQi dari realm yang tersimpan
  const realm = getRealm(merged.realm);
  merged.maxQi = realm.qiPerSub * (merged.subLevel + 1);
  return merged;
}
