import "dotenv/config";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "./client";
import { runMigrations } from "./migrate";
import { users, songs } from "./schema";

async function hash(pw: string) { return bcrypt.hash(pw, 10); }

async function main() {
  console.log("🌱 Aplicando migrações e populando banco de dados...");
  await runMigrations();

  const admin = await db.insert(users).values({
    name: "Administrador", username: "admin",
    password: await hash("admin123"), role: "ADMIN",
  }).onConflictDoNothing().returning().then(r => r[0]) ??
    await db.select().from(users).where(eq(users.username, "admin")).get();

  const editor = await db.insert(users).values({
    name: "Editor Musical", username: "editor",
    password: await hash("editor123"), role: "EDITOR",
  }).onConflictDoNothing().returning().then(r => r[0]) ??
    await db.select().from(users).where(eq(users.username, "editor")).get();

  await db.insert(users).values({
    name: "Visitante", username: "visitante",
    password: await hash("visitante123"), role: "VIEWER",
  }).onConflictDoNothing();

  const count = await db.$count(songs);
  if (count === 0) {
    await db.insert(songs).values([
      {
        title: "Reckless Love", artist: "Cory Asbury",
        key: "G", genre: "Gospel", capo: 0, createdBy: editor!.id,
        cifra: `[INTRO]\nG  D  Em  C\n\n[VERSO]\nG                D\nBefore I spoke a word, You were singing over me\nEm                    C\nYou have been so, so good to me\n\n[CORO]\nG              D\nOh, the overwhelming, never-ending, reckless love of God\nEm                    C\nOh, it chases me down, fights 'til I'm found, leaves the ninety-nine`,
        tab: `e|---3---2---0---0---|\nB|---3---3---0---1---|\nG|---0---2---0---0---|\nD|---0---0---2---2---|\nA|---2---x---2---3---|\nE|---3---x---0---3---|`,
      },
      {
        title: "Evidências", artist: "Chitãozinho & Xororó",
        key: "A", genre: "Sertanejo", capo: 0, createdBy: editor!.id,
        cifra: `[INTRO]\nA  E  D  A\n\n[VERSO]\nA                    E\nEu sei que vou te amar\nD                   A\nPor toda a minha vida, eu vou te amar\n\n[CORO]\nD              A\nE cada verso meu será\nE                 A\nPra te dizer que eu sei que vou te amar`,
        tab: `e|---0---0---2---0---|\nB|---2---0---3---2---|\nG|---2---1---2---2---|\nD|---2---2---0---2---|\nA|---0---2---x---0---|\nE|---x---0---x---x---|`,
      },
      {
        title: "No Rancho Fundo", artist: "Ary Barroso",
        key: "D", genre: "MPB", capo: 2, createdBy: admin!.id,
        cifra: `[INTRO]\nD  A7  G  D\n\n[VERSO]\nD                A7\nNo rancho fundo, longe da cidade\nG                   D\nMeu coração saudoso vive a suspirar\n\n[CORO]\nG              D\nRancho fundo, rancho meu\nA7                 D\nTerra onde nasci e onde um dia`,
        tab: `e|---2---0---3---2---|\nB|---3---2---3---3---|\nG|---2---2---4---2---|\nD|---0---2---5---0---|\nA|---x---0---5---x---|\nE|---x---x---3---x---|`,
      },
      {
        title: "Que Choro É Esse", artist: "Pixinguinha",
        key: "F", genre: "MPB", capo: 0, createdBy: admin!.id,
        cifra: `[INTRO]\nF  C7  Gm  C7  F\n\n[PARTE A]\nF              C7\nQue choro é esse, meu Deus\nGm          C7\nQue choro vai, que choro vem\nF              Bb\nQue choro não tem fim\nC7             F\nMas alegre me faz também`,
        tab: `e|---1---0---3---1---|\nB|---1---1---3---1---|\nG|---2---0---4---2---|\nD|---3---2---5---3---|\nA|---3---3---5---3---|\nE|---1---x---3---1---|`,
      },
      {
        title: "Alguém Como Tu", artist: "Gabriela Rocha",
        key: "E", genre: "Gospel", capo: 0, createdBy: editor!.id,
        cifra: `[INTRO]\nE  B  C#m  A\n\n[VERSO]\nE               B\nNinguém te ama como Tu amas\nC#m             A\nNinguém cuida de mim como Tu cuidas\n\n[CORO]\nA           E\nSó Tu és Senhor\nB           C#m\nSó Tu és digno\nA           B\nSó Tu és fiel`,
        tab: `e|---0---2---4---0---|\nB|---0---4---5---2---|\nG|---1---4---6---2---|\nD|---2---4---6---2---|\nA|---2---2---4---0---|\nE|---0---x---x---x---|`,
      },
    ]);
  }

  console.log("✓ Seed concluído!");
  console.log("  admin     / admin123    (ADMIN)");
  console.log("  editor    / editor123   (EDITOR)");
  console.log("  visitante / visitante123 (VIEWER)");
}

main().catch(e => { console.error(e); process.exit(1); });
