export type Role = "ADMIN" | "EDITOR" | "VIEWER";

// Payload embutido no token JWT
export interface JwtPayload {
  sub: number; // id do usuário
  role: Role;
  username: string;
}

// Estende o Request do Express para incluir o usuário autenticado
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export {};
