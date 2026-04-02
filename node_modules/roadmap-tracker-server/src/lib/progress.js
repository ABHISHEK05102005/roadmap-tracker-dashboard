import { isoToDayNumber, todayISO } from "./date.js";

const STATUS_DONE = "done";
const STATUS_TODO = "todo";

export function normalizeProgress(progressRaw) {
  // Supports legacy:
  // { "taskId": "done" }
  // and new:
  // { "taskId": { "status": "done", "date": "YYYY-MM-DD" } }
  const out = {};
  if (!progressRaw || typeof progressRaw !== "object") return out;

  for (const [taskId, v] of Object.entries(progressRaw)) {
    if (typeof v === "string") {
      out[taskId] = v === STATUS_DONE ? { status: STATUS_DONE, date: null } : { status: STATUS_TODO, date: null };
      continue;
    }
    if (v && typeof v === "object") {
      const status = v.status === STATUS_DONE ? STATUS_DONE : STATUS_TODO;
      const date = typeof v.date === "string" ? v.date : null;
      out[taskId] = { status, date };
      continue;
    }
    out[taskId] = { status: STATUS_TODO, date: null };
  }
  return out;
}

export function isDone(progressEntry) {
  return progressEntry && progressEntry.status === STATUS_DONE;
}

export function computeStats({ tasks, progress }) {
  const total = tasks.length;
  let completed = 0;
  const doneDates = new Set();

  for (const t of tasks) {
    const p = progress[t.id];
    if (isDone(p)) {
      completed += 1;
      if (p.date) doneDates.add(p.date);
    }
  }

  const percentage = total === 0 ? 0 : Math.round((completed / total) * 1000) / 10; // 1 decimal
  const streak = computeStreakFromDoneDates(doneDates);

  return {
    total,
    completed,
    remaining: Math.max(0, total - completed),
    percentage,
    streak
  };
}

export function computeStreakFromDoneDates(doneDatesSet) {
  // Rule: if user completes >=1 task on a day, that day counts.
  // Streak counts consecutive days ending today (inclusive) if today has activity.
  const today = todayISO();
  const todayN = isoToDayNumber(today);
  const doneNumbers = new Set();
  for (const iso of doneDatesSet) {
    if (typeof iso !== "string") continue;
    doneNumbers.add(isoToDayNumber(iso));
  }

  if (!doneNumbers.has(todayN)) return 0;
  let streak = 0;
  for (let d = todayN; doneNumbers.has(d); d -= 1) streak += 1;
  return streak;
}

export function computeProgressOverTime({ tasks, progress, days = 14 }) {
  const today = todayISO();
  const todayN = isoToDayNumber(today);

  // Build map dayNumber -> completedCountAtEndOfDay
  // We approximate by counting tasks whose completion date <= that day.
  const completionDayByTask = new Map();
  for (const t of tasks) {
    const p = progress[t.id];
    if (isDone(p) && p.date) completionDayByTask.set(t.id, isoToDayNumber(p.date));
  }

  const points = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const dayN = todayN - i;
    const dateIso = dayNumberToISO(dayN);
    let completed = 0;
    for (const t of tasks) {
      const cDay = completionDayByTask.get(t.id);
      if (typeof cDay === "number" && cDay <= dayN) completed += 1;
    }
    const percentage = tasks.length === 0 ? 0 : Math.round((completed / tasks.length) * 1000) / 10;
    points.push({ date: dateIso, completed, percentage });
  }
  return points;
}

function dayNumberToISO(dayNumber) {
  const ms = dayNumber * 86400000;
  const d = new Date(ms);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/** @param {unknown} raw */
export function loadProgressFromRaw(raw) {
  const obj = raw && typeof raw === "object" ? raw : {};
  return normalizeProgress(obj);
}

export function applyComplete(progress, taskId, dateIso) {
  const next = { ...progress };
  next[taskId] = { status: STATUS_DONE, date: dateIso ?? todayISO() };
  return next;
}

export function applyUncomplete(progress, taskId) {
  const next = { ...progress };
  next[taskId] = { status: STATUS_TODO, date: null };
  return next;
}

