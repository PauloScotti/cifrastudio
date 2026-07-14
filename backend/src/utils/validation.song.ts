import { z } from "zod";

const KEY_REGEX = /^[A-G](#|b)?$/;

export const songSchema = z.object({
  title: z.string().trim().min(1, "Título é obrigatório").max(200),
  artist: z.string().trim().min(1, "Artista é obrigatório").max(150),
  key: z.string().regex(KEY_REGEX, "Tom inválido (use formato C, C#, Db, ...)"),
  genre: z.string().trim().min(1, "Gênero é obrigatório").max(60),
  capo: z.coerce.number().int().min(0).max(12).default(0),
  cifra: z.string().trim().min(1, "O conteúdo da cifra é obrigatório"),
  tab: z.string().trim().max(5000).optional().or(z.literal("")),
});

export const songUpdateSchema = songSchema.partial();

export const songQuerySchema = z.object({
  search: z.string().trim().optional(),
  genre: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type SongInput = z.infer<typeof songSchema>;
export type SongUpdateInput = z.infer<typeof songUpdateSchema>;
export type SongQuery = z.infer<typeof songQuerySchema>;
