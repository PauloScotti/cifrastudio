import { Request, Response } from "express";
import { eq, like, and, SQL, sql, asc } from "drizzle-orm";
import { db } from "../db/client";
import { songs, users } from "../db/schema";
import { songSchema, songUpdateSchema, songQuerySchema } from "../utils/validation.song";

export async function listSongs(req: Request, res: Response) {
  const parsed = songQuerySchema.safeParse(req.query);
  if (!parsed.success)
    return res.status(400).json({ error: parsed.error.issues[0].message });

  const { search, genre, page, pageSize } = parsed.data;

  const conditions: SQL[] = [];
  if (search) {
    conditions.push(
      sql`(${songs.title} LIKE ${"%" + search + "%"} OR ${songs.artist} LIKE ${"%" + search + "%"})`
    );
  }
  if (genre) conditions.push(eq(songs.genre, genre));

  const where = conditions.length ? and(...conditions) : undefined;
  const offset = (page - 1) * pageSize;

  const [rows, [{ count }]] = await Promise.all([
    db.select({
      id: songs.id, title: songs.title, artist: songs.artist,
      key: songs.key, genre: songs.genre, capo: songs.capo,
      cifra: songs.cifra, tab: songs.tab,
      createdAt: songs.createdAt, updatedAt: songs.updatedAt,
      authorName: users.name, authorUsername: users.username,
    })
    .from(songs)
    .leftJoin(users, eq(songs.createdBy, users.id))
    .where(where)
    .orderBy(asc(songs.title))
    .limit(pageSize)
    .offset(offset),

    db.select({ count: sql<number>`count(*)` })
    .from(songs).where(where),
  ]);

  return res.json({
    songs: rows,
    total: count,
    page,
    pageSize,
    totalPages: Math.ceil(count / pageSize),
  });
}

export async function getSong(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: "ID inválido." });

  const row = await db.select({
    id: songs.id, title: songs.title, artist: songs.artist,
    key: songs.key, genre: songs.genre, capo: songs.capo,
    cifra: songs.cifra, tab: songs.tab,
    createdAt: songs.createdAt, updatedAt: songs.updatedAt,
    authorName: users.name, authorUsername: users.username,
  })
  .from(songs)
  .leftJoin(users, eq(songs.createdBy, users.id))
  .where(eq(songs.id, id))
  .get();

  if (!row) return res.status(404).json({ error: "Cifra não encontrada." });
  return res.json({ song: row });
}

export async function createSong(req: Request, res: Response) {
  const parsed = songSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: parsed.error.issues[0].message });

  const { tab, ...data } = parsed.data;
  const [song] = await db.insert(songs)
    .values({ ...data, tab: tab || null, createdBy: req.user!.sub })
    .returning();

  return res.status(201).json({ song });
}

export async function updateSong(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: "ID inválido." });

  const parsed = songUpdateSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: parsed.error.issues[0].message });

  const existing = await db.select({ id: songs.id }).from(songs).where(eq(songs.id, id)).get();
  if (!existing) return res.status(404).json({ error: "Cifra não encontrada." });

  const now = new Date().toISOString();
  const [song] = await db.update(songs)
    .set({ ...parsed.data, updatedAt: now })
    .where(eq(songs.id, id))
    .returning();

  return res.json({ song });
}

export async function deleteSong(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: "ID inválido." });

  const existing = await db.select({ id: songs.id }).from(songs).where(eq(songs.id, id)).get();
  if (!existing) return res.status(404).json({ error: "Cifra não encontrada." });

  await db.delete(songs).where(eq(songs.id, id));
  return res.status(204).send();
}

export async function listGenres(_req: Request, res: Response) {
  const rows = await db.selectDistinct({ genre: songs.genre })
    .from(songs).orderBy(asc(songs.genre));
  return res.json({ genres: rows.map((r) => r.genre) });
}
