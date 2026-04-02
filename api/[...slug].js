import serverless from "serverless-http";
import { createApp } from "../server/src/app.js";

/** @type {{ maxDuration?: number }} */
export const config = {
  maxDuration: 30
};

function buildExpressUrl(req) {
  const slug = req.query.slug;
  const parts = slug == null ? [] : Array.isArray(slug) ? slug : [slug];
  const pathname = parts.length ? `/${parts.map((p) => decodeURIComponent(String(p))).join("/")}` : "/";
  const raw = typeof req.url === "string" ? req.url : "";
  const q = raw.includes("?") ? raw.slice(raw.indexOf("?")) : "";
  return `${pathname}${q}`;
}

let handlerPromise;

async function getHandler() {
  if (!handlerPromise) {
    handlerPromise = createApp().then((app) => serverless(app));
  }
  return handlerPromise;
}

export default async function vercelHandler(req, res) {
  req.url = buildExpressUrl(req);
  const handler = await getHandler();
  return handler(req, res);
}
