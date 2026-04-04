import "dotenv/config";
import { createApp } from "./app.js";

const app = createApp();
const port = Number(process.env.PORT || 3333);

app.listen(port, () => {
  console.log(`Nexus OS backend running on http://localhost:${port}`);
});
