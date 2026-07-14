import { Request, Response, NextFunction } from "express";

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: `Rota não encontrada: ${req.method} ${req.path}` });
}

function isUniqueConstraintError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /UNIQUE constraint failed/i.test(msg);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  console.error(err);

  if (isUniqueConstraintError(err)) {
    return res.status(409).json({ error: "Registro duplicado." });
  }

  const message =
    process.env.NODE_ENV === "development" && err instanceof Error ? err.message : "Erro interno do servidor.";
  res.status(500).json({ error: message });
}
