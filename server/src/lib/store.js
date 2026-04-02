import path from "node:path";
import { fileURLToPath } from "node:url";
import { readJson, writeJsonAtomic } from "./jsonStore.js";
import { seedTasks } from "../data/seedTasks.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, "..", "..", "data");
const TASKS_FILE = path.join(DATA_DIR, "tasks.json");
const PROGRESS_FILE = path.join(DATA_DIR, "progress.json");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");

const REDIS_TASKS = "tracker:tasks";
const REDIS_PROGRESS = "tracker:progress";
const REDIS_SETTINGS = "tracker:settings";

function useRedis() {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

function onVercelWithoutRedis() {
  return process.env.VERCEL === "1" && !useRedis();
}

export function createStore() {
  if (useRedis()) return createRedisStore();
  if (onVercelWithoutRedis()) {
    // eslint-disable-next-line no-console
    console.warn(
      "[tracker] Vercel detected without UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN. Using in-memory store (data resets on cold starts). Add the Vercel Redis (Upstash) integration for persistence."
    );
    return createMemoryStore();
  }
  return createFileStore();
}

function createFileStore() {
  return {
    async ensureSeed() {
      const tasks = await readJson(TASKS_FILE, null);
      if (!Array.isArray(tasks) || tasks.length === 0) {
        await writeJsonAtomic(TASKS_FILE, seedTasks());
      }
      const settings = await readJson(SETTINGS_FILE, null);
      if (!settings || typeof settings !== "object") {
        await writeJsonAtomic(SETTINGS_FILE, { lastActivityDate: null });
      }
    },
    async getTasks() {
      return readJson(TASKS_FILE, []);
    },
    async getProgressRaw() {
      return readJson(PROGRESS_FILE, {});
    },
    async setProgress(progress) {
      await writeJsonAtomic(PROGRESS_FILE, progress);
    },
    async getSettings() {
      return readJson(SETTINGS_FILE, { lastActivityDate: null });
    },
    async setSettings(settings) {
      await writeJsonAtomic(SETTINGS_FILE, settings);
    }
  };
}

function createMemoryStore() {
  let tasks = null;
  let progress = {};
  let settings = { lastActivityDate: null };

  return {
    async ensureSeed() {
      if (!Array.isArray(tasks) || tasks.length === 0) {
        tasks = seedTasks();
      }
      if (!settings || typeof settings !== "object") settings = { lastActivityDate: null };
    },
    async getTasks() {
      return tasks ?? [];
    },
    async getProgressRaw() {
      return progress;
    },
    async setProgress(next) {
      progress = next;
    },
    async getSettings() {
      return settings;
    },
    async setSettings(next) {
      settings = next;
    }
  };
}

function createRedisStore() {
  let redisPromise;
  async function getRedis() {
    if (!redisPromise) {
      const { Redis } = await import("@upstash/redis");
      redisPromise = Redis.fromEnv();
    }
    return redisPromise;
  }

  return {
    async ensureSeed() {
      const redis = await getRedis();
      const existing = await redis.get(REDIS_TASKS);
      if (!Array.isArray(existing) || existing.length === 0) {
        await redis.set(REDIS_TASKS, seedTasks());
      }
      const settings = await redis.get(REDIS_SETTINGS);
      if (settings == null || typeof settings !== "object") {
        await redis.set(REDIS_SETTINGS, { lastActivityDate: null });
      }
    },
    async getTasks() {
      const redis = await getRedis();
      const v = await redis.get(REDIS_TASKS);
      return Array.isArray(v) ? v : seedTasks();
    },
    async getProgressRaw() {
      const redis = await getRedis();
      const v = await redis.get(REDIS_PROGRESS);
      if (v == null) return {};
      return typeof v === "object" ? v : {};
    },
    async setProgress(next) {
      const redis = await getRedis();
      await redis.set(REDIS_PROGRESS, next);
    },
    async getSettings() {
      const redis = await getRedis();
      const v = await redis.get(REDIS_SETTINGS);
      return v && typeof v === "object" ? v : { lastActivityDate: null };
    },
    async setSettings(next) {
      const redis = await getRedis();
      await redis.set(REDIS_SETTINGS, next);
    }
  };
}
