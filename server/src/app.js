import express from "express";
import cors from "cors";
import {
  computeProgressOverTime,
  computeStats,
  loadProgressFromRaw,
  applyComplete,
  applyUncomplete
} from "./lib/progress.js";
import { todayISO } from "./lib/date.js";
import { createStore } from "./lib/store.js";

export function buildApp({ store }) {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (req, res) => res.json({ ok: true }));

  app.get("/tasks", async (_req, res) => {
    try {
      await store.ensureSeed();
      const tasks = await store.getTasks();
      const progressRaw = await store.getProgressRaw();
      const progress = loadProgressFromRaw(progressRaw);
      res.json({
        tasks,
        progress,
        today: todayISO()
      });
    } catch {
      res.status(500).json({ error: "Failed to load tasks" });
    }
  });

  app.post("/complete", async (req, res) => {
    try {
      const { taskId } = req.body ?? {};
      if (!taskId) return res.status(400).json({ error: "taskId is required" });

      await store.ensureSeed();
      const tasks = await store.getTasks();
      const exists = tasks.some((t) => t.id === taskId);
      if (!exists) return res.status(404).json({ error: "Task not found" });

      const progress = loadProgressFromRaw(await store.getProgressRaw());
      const next = applyComplete(progress, taskId, todayISO());
      await store.setProgress(next);
      await store.setSettings({ lastActivityDate: todayISO() });

      res.json({ ok: true, progress: next });
    } catch {
      res.status(500).json({ error: "Failed to mark complete" });
    }
  });

  app.post("/uncomplete", async (req, res) => {
    try {
      const { taskId } = req.body ?? {};
      if (!taskId) return res.status(400).json({ error: "taskId is required" });

      await store.ensureSeed();
      const tasks = await store.getTasks();
      const exists = tasks.some((t) => t.id === taskId);
      if (!exists) return res.status(404).json({ error: "Task not found" });

      const progress = loadProgressFromRaw(await store.getProgressRaw());
      const next = applyUncomplete(progress, taskId);
      await store.setProgress(next);

      res.json({ ok: true, progress: next });
    } catch {
      res.status(500).json({ error: "Failed to mark uncomplete" });
    }
  });

  app.get("/stats", async (_req, res) => {
    try {
      await store.ensureSeed();
      const tasks = await store.getTasks();
      const progress = loadProgressFromRaw(await store.getProgressRaw());
      const stats = computeStats({ tasks, progress });
      res.json(stats);
    } catch {
      res.status(500).json({ error: "Failed to compute stats" });
    }
  });

  app.get("/charts/progress", async (req, res) => {
    try {
      const days = Math.max(7, Math.min(90, Number(req.query.days ?? 14)));
      await store.ensureSeed();
      const tasks = await store.getTasks();
      const progress = loadProgressFromRaw(await store.getProgressRaw());
      const series = computeProgressOverTime({ tasks, progress, days });
      res.json({ days, series });
    } catch {
      res.status(500).json({ error: "Failed to load chart data" });
    }
  });

  return app;
}

export async function createApp() {
  const store = createStore();
  await store.ensureSeed();
  return buildApp({ store });
}
