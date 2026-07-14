import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { listUsers, createUser, updateUserRole, deleteUser } from "../controllers/user.controller";

const router = Router();

// Toda rota de usuários exige autenticação + papel ADMIN
router.use(authenticate, authorize("ADMIN"));

router.get("/", listUsers);
router.post("/", createUser);
router.put("/:id/role", updateUserRole);
router.delete("/:id", deleteUser);

export default router;
