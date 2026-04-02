import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readJson, writeJsonAtomic } from "./lib/jsonStore.js";
import { seedTasks } from "./data/seedTasks.js";
import { computeProgressOverTime, computeStats, loadProgress, markComplete, markUncomplete } from "./lib/progress.js";
import { todayISO } from "./lib/date.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, "..", "data");
const TASKS_FILE = path.join(DATA_DIR, "tasks.json");
const PROGRESS_FILE = path.join(DATA_DIR, "progress.json");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

async function ensureSeedData() {
  const tasks = await readJson(TASKS_FILE, null);
  if (!Array.isArray(tasks) || tasks.length === 0) {
    await writeJsonAtomic(TASKS_FILE, seedTasks());
  }
  const settings = await readJson(SETTINGS_FILE, null);
  if (!settings || typeof settings !== "object") {
    await writeJsonAtomic(SETTINGS_FILE, { lastActivityDate: null });
  }
  // progress.json can remain absent; handled by loadProgress()
}

app.get("/health", (req, res) => res.json({ ok: true }));

app.get("/tasks", async (req, res) => {
  try {
    const tasks = await readJson(TASKS_FILE, []);
    const progress = await loadProgress(PROGRESS_FILE);
    res.json({
      tasks,
      progress,
      today: todayISO()
    });
  } catch (e) {
    res.status(500).json({ error: "Failed to load tasks" });
  }
});

app.post("/complete", async (req, res) => {
  try {
    const { taskId } = req.body ?? {};
    if (!taskId) return res.status(400).json({ error: "taskId is required" });

    const tasks = await readJson(TASKS_FILE, []);
    const exists = tasks.some((t) => t.id === taskId);
    if (!exists) return res.status(404).json({ error: "Task not found" });

    const progress = await loadProgress(PROGRESS_FILE);
    const next = await markComplete({ progressFilePath: PROGRESS_FILE, progress, taskId, dateIso: todayISO() });
    await writeJsonAtomic(SETTINGS_FILE, { lastActivityDate: todayISO() });

    res.json({ ok: true, progress: next });
  } catch (e) {
    res.status(500).json({ error: "Failed to mark complete" });
  }
});

app.post("/uncomplete", async (req, res) => {
  try {
    const { taskId } = req.body ?? {};
    if (!taskId) return res.status(400).json({ error: "taskId is required" });

    const tasks = await readJson(TASKS_FILE, []);
    const exists = tasks.some((t) => t.id === taskId);
    if (!exists) return res.status(404).json({ error: "Task not found" });

    const progress = await loadProgress(PROGRESS_FILE);
    const next = await markUncomplete({ progressFilePath: PROGRESS_FILE, progress, taskId });

    res.json({ ok: true, progress: next });
  } catch (e) {
    res.status(500).json({ error: "Failed to mark uncomplete" });
  }
});

app.get("/stats", async (req, res) => {
  try {
    const tasks = await readJson(TASKS_FILE, []);
    const progress = await loadProgress(PROGRESS_FILE);
    const stats = computeStats({ tasks, progress });
    res.json(stats);
  } catch (e) {
    res.status(500).json({ error: "Failed to compute stats" });
  }
});

app.get("/charts/progress", async (req, res) => {
  try {
    const days = Math.max(7, Math.min(90, Number(req.query.days ?? 14)));
    const tasks = await readJson(TASKS_FILE, []);
    const progress = await loadProgress(PROGRESS_FILE);
    const series = computeProgressOverTime({ tasks, progress, days });
    res.json({ days, series });
  } catch (e) {
    res.status(500).json({ error: "Failed to load chart data" });
  }
});

const port = Number(process.env.PORT ?? 3001);
await ensureSeedData();
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${port}`);
});

