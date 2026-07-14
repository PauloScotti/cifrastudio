import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import {
  listSongs,
  getSong,
  createSong,
  updateSong,
  deleteSong,
  listGenres,
} from "../controllers/song.controller";

const router = Router();

// Toda rota de cifras exige autenticação
router.use(authenticate);

router.get("/", listSongs);
router.get("/genres", listGenres);
router.get("/:id", getSong);

// Criar e editar: ADMIN e EDITOR
router.post("/", authorize("ADMIN", "EDITOR"), createSong);
router.put("/:id", authorize("ADMIN", "EDITOR"), updateSong);

// Excluir: apenas ADMIN
router.delete("/:id", authorize("ADMIN"), deleteSong);

export default router;
