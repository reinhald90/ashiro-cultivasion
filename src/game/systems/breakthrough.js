import { getRealm, REALMS } from "../data/realms.js";

/** Hitung chance sukses breakthrough */
export function breakthroughChance(player) {
  // Makin tinggi realm, makin susah
  const base = 0.85;
  const penalty = player.realm * 0.12;
  const subBonus = player.subLevel * 0.02;
  return Math.max(0.15, Math.min(0.95, base - penalty + subBonus));
}

/** Coba naik realm */
export function attemptBreakthrough(player) {
  const realm = getRealm(player.realm);
  if (player.qi < player.maxQi) {
    return { ok: false, msg: "Qi belum penuh." };
  }

  const chance = breakthroughChance(player);
  const roll = Math.random();

  if (roll < chance) {
    // Naik sub-level dulu
    if (player.subLevel + 1 < realm.subLevels) {
      player.subLevel += 1;
      player.maxQi = realm.qiPerSub * (player.subLevel + 1);
      player.qi = 0;
      return {
        ok: true,
        type: "sub",
        msg: `Naik ke ${realm.name} · ${player.subLevel + 1}`,
      };
    }

    // Naik realm besar
    if (player.realm + 1 >= REALMS.length) {
      return { ok: false, msg: "Kamu sudah di puncak kultivasi." };
    }

    player.realm += 1;
    player.subLevel = 0;
    const next = getRealm(player.realm);
    player.maxQi = next.qiPerSub;
    player.qi = 0;
    player.lifespan = next.lifespan;
    player.maxHp += 50;
    player.hp = player.maxHp;
    return {
      ok: true,
      type: "realm",
      msg: `🎉 Breakthrough ke ${next.name}!`,
    };
  } else {
    // Gagal → kehilangan sebagian Qi
    const loss = Math.floor(player.qi * 0.5);
    player.qi -= loss;
    return {
      ok: false,
      type: "fail",
      msg: `Gagal breakthrough. Kehilangan ${loss} Qi.`,
      chance,
    };
  }
}
