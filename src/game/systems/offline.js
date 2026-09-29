import { meditate } from "./cultivation.js";

const MAX_OFFLINE_SEC = 8 * 3600; // cap 8 jam
const OFFLINE_EFFICIENCY = 0.5;   // 50% rate saat offline

export function applyOfflineProgress(player) {
  const now = Date.now();
  const elapsedSec = Math.min((now - (player.lastTick || now)) / 1000, MAX_OFFLINE_SEC);
  player.lastTick = now;

  if (elapsedSec < 30) return { gained: 0, seconds: 0 };

  const before = player.qi;
  meditate(player, elapsedSec, OFFLINE_EFFICIENCY);
  const gained = player.qi - before;
  return { gained, seconds: elapsedSec };
}
