import { Router } from "express";
import authRoutes from "./auth.routes";
import songRoutes from "./song.routes";
import userRoutes from "./user.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/songs", songRoutes);
router.use("/users", userRoutes);

export default router;
