import { Router } from "express";
import rateLimit from "express-rate-limit";
import { register, login, me } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

// Limita tentativas de login para mitigar brute-force
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Muitas tentativas. Tente novamente em alguns minutos." },
});

router.post("/register", register);
router.post("/login", loginLimiter, login);
router.get("/me", authenticate, me);

export default router;
