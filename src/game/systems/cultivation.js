import { getRealm } from "../data/realms.js";

/** Qi per detik berdasarkan realm */
export function qiPerSecond(player) {
  const base = 1;
  return base * Math.pow(2.2, player.realm) * (1 + player.subLevel * 0.15);
}

/** Tambah Qi selama `dtSec` detik */
export function meditate(player, dtSec, efficiency = 1) {
  const gain = qiPerSecond(player) * dtSec * efficiency;
  player.qi = Math.min(player.qi + gain, player.maxQi);
  player.totalMeditatedSec += dtSec;
  return gain;
}

/** Apakah siap breakthrough */
export function canBreakthrough(player) {
  return player.qi >= player.maxQi;
}

/** Umur naik sedikit tiap detik (efek samping kultivasi) */
export function tickAge(player, dtSec) {
  // 1 tahun = 365 hari game ≈ 1 jam real-time (biar kerasa)
  const yearPerSec = 1 / 3600;
  player.age += yearPerSec * dtSec;
  if (player.age >= player.lifespan) {
    player.hp = 0; // mati karena umur
  }
}
