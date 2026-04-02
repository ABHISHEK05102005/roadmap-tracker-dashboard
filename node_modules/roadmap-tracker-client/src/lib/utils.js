export function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

export function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

export function formatPercent(p) {
  if (Number.isNaN(Number(p))) return "0%";
  return `${p}%`;
}

