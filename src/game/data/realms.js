export const REALMS = [
  { id: 0, name: "Qi Refining",              subLevels: 9, qiPerSub: 100,     lifespan: 100 },
  { id: 1, name: "Foundation Establishment", subLevels: 3, qiPerSub: 800,     lifespan: 200 },
  { id: 2, name: "Golden Core",              subLevels: 3, qiPerSub: 5000,    lifespan: 500 },
  { id: 3, name: "Nascent Soul",             subLevels: 3, qiPerSub: 35000,   lifespan: 1000 },
  { id: 4, name: "Soul Formation",           subLevels: 3, qiPerSub: 200000,  lifespan: 2000 },
  { id: 5, name: "Void Refinement",          subLevels: 3, qiPerSub: 1500000, lifespan: 5000 },
  { id: 6, name: "Immortal Ascension",       subLevels: 1, qiPerSub: 99999999, lifespan: 99999 },
];

export function getRealm(id) {
  return REALMS[Math.min(id, REALMS.length - 1)];
}

export function getSubLabel(realmId, subLevel) {
  const realm = getRealm(realmId);
  if (realm.subLevels === 9) {
    return `Lv ${subLevel + 1}`;
  }
  if (realm.subLevels === 3) {
    return ["Early", "Mid", "Late"][subLevel] || "Peak";
  }
  return "Peak";
}

export function getSubLabelText(realmId, subLevel) {
  const realm = getRealm(realmId);
  return `${realm.name} · ${getSubLabel(realmId, subLevel)}`;
}
