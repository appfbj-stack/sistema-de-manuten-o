import cors from "cors";
import express from "express";
import { authRouter } from "./routes/auth.js";
import { clientesRouter } from "./routes/clientes.js";
import { equipamentosRouter } from "./routes/equipamentos.js";
import { osRouter } from "./routes/os.js";

export function createApp() {
  const app = express();
  const corsOrigin = process.env.CORS_ORIGIN;

  app.use(
    cors({
      origin: corsOrigin ? corsOrigin.split(",").map((item) => item.trim()) : true
    })
  );
  app.use(express.json({ limit: "10mb" }));

  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      service: "nexus-os-backend",
      timestamp: new Date().toISOString()
    });
  });

  app.use("/auth", authRouter);
  app.use("/clientes", clientesRouter);
  app.use("/equipamentos", equipamentosRouter);
  app.use("/os", osRouter);

  return app;
}
