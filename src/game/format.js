export function fmt(n) {
  if (!isFinite(n)) return "∞";
  if (n < 1000) return Math.floor(n).toString();
  if (n < 1e6) return (n / 1e3).toFixed(1) + "K";
  if (n < 1e9) return (n / 1e6).toFixed(2) + "M";
  if (n < 1e12) return (n / 1e9).toFixed(2) + "B";
  return (n / 1e12).toFixed(2) + "T";
}

export function fmtAge(years) {
  const y = Math.floor(years);
  const m = Math.floor((years - y) * 12);
  return `${y} thn ${m} bln`;
}

export function fmtTime(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return `${h}j ${m}m`;
  return `${m}m`;
}
