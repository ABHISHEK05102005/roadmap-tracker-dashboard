/**
 * Vercel-native Express entrypoint (see https://vercel.com/guides/using-express-with-vercel ).
 * Must export the Express app as default — do not call listen() here.
 */
import { createApp } from "../server/src/app.js";

export default createApp();
