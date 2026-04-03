import { Router } from "express";
import { loginSchema } from "../schemas.js";

export const authRouter = Router();

authRouter.post("/login", (req, res) => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Dados de login inválidos",
      issues: parsed.error.flatten()
    });
  }

  const { email } = parsed.data;

  return res.json({
    token: "dev-token",
    user: {
      id: "1",
      name: "Fernando Borges",
      email,
      role: "admin"
    }
  });
});
