import { Request, Response, NextFunction } from "express";
import { Role } from "../types/express";
import { verifyToken } from "../utils/jwt";

/** Exige um token JWT válido no header Authorization: Bearer <token> */
export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token de autenticação não fornecido." });
  }

  const token = header.slice(7);
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido ou expirado." });
  }
}

/** Exige que o usuário autenticado tenha um dos papéis informados */
export function authorize(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Não autenticado." });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Você não tem permissão para esta ação." });
    }
    next();
  };
}
