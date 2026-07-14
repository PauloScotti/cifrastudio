import { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { users, type User } from "../db/schema";
import { hashPassword, comparePassword } from "../utils/password";
import { signToken } from "../utils/jwt";
import { registerSchema, loginSchema } from "../utils/validation.auth";

type PublicUser = Omit<User, "password">;
function toPublic(u: User): PublicUser {
  const { password: _pw, ...rest } = u;
  return rest;
}

export async function register(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: parsed.error.issues[0].message });

  const { name, username, password, role } = parsed.data;
  const existing = await db.select({ id: users.id })
    .from(users).where(eq(users.username, username)).get();
  if (existing)
    return res.status(409).json({ error: "Este nome de usuário já está em uso." });

  const hash = await hashPassword(password);
  const [user] = await db.insert(users)
    .values({ name, username, password: hash, role })
    .returning();

  const token = signToken({ sub: user.id, role: user.role as any, username: user.username });
  return res.status(201).json({ token, user: toPublic(user) });
}

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: parsed.error.issues[0].message });

  const { username, password } = parsed.data;
  const user = await db.select().from(users).where(eq(users.username, username)).get();
  if (!user)
    return res.status(401).json({ error: "Usuário ou senha incorretos." });

  const valid = await comparePassword(password, user.password);
  if (!valid)
    return res.status(401).json({ error: "Usuário ou senha incorretos." });

  const token = signToken({ sub: user.id, role: user.role as any, username: user.username });
  return res.json({ token, user: toPublic(user) });
}

export async function me(req: Request, res: Response) {
  const user = await db.select().from(users).where(eq(users.id, req.user!.sub)).get();
  if (!user) return res.status(404).json({ error: "Usuário não encontrado." });
  return res.json({ user: toPublic(user) });
}
