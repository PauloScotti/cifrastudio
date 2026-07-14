import { Request, Response } from "express";
import { eq, asc } from "drizzle-orm";
import { db } from "../db/client";
import { users, type User } from "../db/schema";
import { hashPassword } from "../utils/password";
import { createUserSchema, updateRoleSchema } from "../utils/validation.user";

type PublicUser = Omit<User, "password">;
function toPublic(u: User): PublicUser {
  const { password: _pw, ...rest } = u;
  return rest;
}

export async function listUsers(_req: Request, res: Response) {
  const rows = await db.select().from(users).orderBy(asc(users.name));
  return res.json({ users: rows.map(toPublic) });
}

export async function createUser(req: Request, res: Response) {
  const parsed = createUserSchema.safeParse(req.body);
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

  return res.status(201).json({ user: toPublic(user) });
}

export async function updateUserRole(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: "ID inválido." });

  const parsed = updateRoleSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: parsed.error.issues[0].message });

  if (id === req.user!.sub && parsed.data.role !== "ADMIN")
    return res.status(400).json({ error: "Você não pode remover seu próprio acesso de administrador." });

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.id, id)).get();
  if (!existing) return res.status(404).json({ error: "Usuário não encontrado." });

  const [user] = await db.update(users)
    .set({ role: parsed.data.role })
    .where(eq(users.id, id))
    .returning();

  return res.json({ user: toPublic(user) });
}

export async function deleteUser(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: "ID inválido." });

  if (id === req.user!.sub)
    return res.status(400).json({ error: "Você não pode remover sua própria conta." });

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.id, id)).get();
  if (!existing) return res.status(404).json({ error: "Usuário não encontrado." });

  await db.delete(users).where(eq(users.id, id));
  return res.status(204).send();
}
