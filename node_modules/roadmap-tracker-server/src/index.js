import { createApp } from "./app.js";

const port = Number(process.env.PORT ?? 3001);
const app = await createApp();

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${port}`);
});
