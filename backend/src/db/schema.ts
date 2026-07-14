import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";

// ──────────────────────────────────────────
// USERS
// ──────────────────────────────────────────
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(), // hash bcrypt — nunca texto puro
  role: text("role", { enum: ["ADMIN", "EDITOR", "VIEWER"] })
    .notNull()
    .default("VIEWER"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

// ──────────────────────────────────────────
// SONGS (Cifras)
// ──────────────────────────────────────────
export const songs = sqliteTable(
  "songs",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    artist: text("artist").notNull(),
    key: text("key").notNull(), // Tom original: C, C#, D, ...
    genre: text("genre").notNull(),
    capo: integer("capo").notNull().default(0),
    cifra: text("cifra").notNull(), // Corpo com marcadores [INTRO], [VERSO]...
    tab: text("tab"), // Tablatura opcional
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    createdBy: integer("created_by")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [index("idx_songs_genre").on(table.genre), index("idx_songs_title").on(table.title)]
);

// ──────────────────────────────────────────
// RELATIONS (usadas pelo Query API do Drizzle)
// ──────────────────────────────────────────
export const usersRelations = relations(users, ({ many }) => ({
  songs: many(songs),
}));

export const songsRelations = relations(songs, ({ one }) => ({
  author: one(users, { fields: [songs.createdBy], references: [users.id] }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Song = typeof songs.$inferSelect;
export type NewSong = typeof songs.$inferInsert;
