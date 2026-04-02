export function todayISO() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function isoToDayNumber(iso) {
  // Convert YYYY-MM-DD to an integer day number in UTC to avoid TZ issues.
  const [y, m, d] = iso.split("-").map((v) => Number(v));
  const utcMs = Date.UTC(y, m - 1, d);
  return Math.floor(utcMs / 86400000);
}

