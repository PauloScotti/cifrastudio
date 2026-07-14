# CifraStudio

Sistema completo de cadastro e gestão de cifras musicais com controle de acesso por papéis, transposição de tom, capotraste, tablatura e diagramas de acordes para violão e teclado.

---

## ✨ Funcionalidades

### Cifras
- Cadastro completo (título, artista, tom, gênero, capo, cifra, tablatura)
- Visualizador com renderização de seções `[INTRO]`, `[VERSO]`, `[CORO]`, `[PONTE]`
- **Transposição de tom** em tempo real (±12 semitons)
- **Capotraste** ajustável (0–12)
- **Tablatura** em texto monoespaçado (toggle)
- Busca por título/artista + filtro por gênero + paginação

### Diagramas de Acordes
- **Violão** — SVG com casa, cordas abertas/mutadas e pestanas
- **Teclado** — SVG com teclas brancas e pretas destacadas
- Clique no acorde para ampliar (modal com os dois instrumentos)

### Autenticação & Controle de Acesso
| Papel | Permissões |
|-------|-----------|
| **ADMIN** | CRUD completo + gerenciar usuários |
| **EDITOR** | Criar e editar cifras |
| **VIEWER** | Somente leitura |

- Autenticação via JWT (7 dias de validade)
- Rate limiting no endpoint de login (proteção brute-force)
- Senhas com hash bcrypt

---

## 🛠 Stack

### Backend
| Tecnologia | Versão | Motivo |
|-----------|--------|--------|
| Node.js | 22 | LTS atual |
| Express | 4.21 | Framework HTTP estável |
| Drizzle ORM | 0.45 | Type-safe, sem binários nativos |
| libSQL (`@libsql/client`) | 0.14 | SQLite moderno, puro JS, compatível com Turso |
| Zod | 3.24 | Validação de schemas com inferência de tipos |
| JWT | 9.0 | Autenticação stateless |
| bcryptjs | 2.4 | Hash de senhas |
| Helmet + CORS | latest | Segurança HTTP |

### Frontend
| Tecnologia | Versão | Motivo |
|-----------|--------|--------|
| React | 19 | Concurrent features, React Compiler |
| Vite | 8 | Build ultrarrápido |
| TypeScript | 5.7 | Segurança de tipos |
| TanStack Query | 5 | Cache server state, mutations |
| Zustand | 4 | Estado global com persist |
| React Hook Form + Zod | latest | Forms performáticos, sem re-renders |
| React Router | 6 | SPA routing |
| Axios | latest | HTTP client com interceptors |

---

## 🚀 Início Rápido

### Opção 1 — Script automático (recomendado)

```bash
git clone <repo>
cd cifrastudio
chmod +x setup.sh
./setup.sh
```

### Opção 2 — Manual

```bash
# Backend
cd backend
cp .env.example .env
npm install
npm run seed       # migra banco + dados iniciais
npm run dev        # http://localhost:3333

# Frontend (outro terminal)
cd frontend
echo "VITE_API_URL=http://localhost:3333/api" > .env
npm install
npm run dev        # http://localhost:5173
```

### Opção 3 — Docker Compose

```bash
# Criar arquivo de variáveis de ambiente
cat > .env << EOF
JWT_SECRET=$(openssl rand -base64 48)
CORS_ORIGIN=http://localhost:5173
VITE_API_URL=http://localhost:3333/api
EOF

docker compose up -d

# Popular banco na primeira vez
docker compose exec backend node -e "
  const {runMigrations}=require('./dist/db/migrate');
  runMigrations();
"
# Depois execute o seed manualmente se desejar dados de exemplo
```

---

## 👤 Usuários de Exemplo (após seed)

| Usuário | Senha | Papel |
|---------|-------|-------|
| `admin` | `admin123` | ADMIN |
| `editor` | `editor123` | EDITOR |
| `visitante` | `visitante123` | VIEWER |

---

## 📁 Estrutura do Projeto

```
cifrastudio/
├── setup.sh                    # Script de setup rápido
├── docker-compose.yml          # Orquestração Docker
│
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── schema.ts       # Modelos Drizzle (users, songs)
│   │   │   ├── client.ts       # Instância libSQL + Drizzle
│   │   │   ├── migrate.ts      # Executor de migrações
│   │   │   └── seed.ts         # Dados iniciais
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── song.controller.ts
│   │   │   └── user.controller.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts         # JWT authenticate + authorize(roles)
│   │   │   └── errorHandler.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── song.routes.ts
│   │   │   └── user.routes.ts
│   │   └── utils/
│   │       ├── jwt.ts
│   │       ├── password.ts
│   │       ├── validation.auth.ts
│   │       ├── validation.song.ts
│   │       └── validation.user.ts
│   ├── drizzle/                # Migrações SQL geradas
│   ├── .env.example
│   ├── drizzle.config.ts
│   └── Dockerfile
│
└── frontend/
    └── src/
        ├── services/
        │   ├── api.ts          # Axios + interceptors JWT
        │   └── index.ts        # authService, songService, userService
        ├── context/
        │   └── authStore.ts    # Zustand com persist
        ├── hooks/
        │   ├── useTranspose.ts # Transposição de acordes
        │   └── useChordDiagrams.ts  # SVG violão + teclado
        ├── components/
        │   ├── Layout.tsx
        │   ├── ProtectedRoute.tsx
        │   ├── SongModal.tsx
        │   ├── ChordDiagram.tsx
        │   └── Toast.tsx
        └── pages/
            ├── AuthPage.tsx
            ├── SongsPage.tsx
            ├── SongViewPage.tsx
            └── AdminPage.tsx
```

---

## 🔌 API Reference

### Auth
```
POST /api/auth/register   { name, username, password, role }
POST /api/auth/login      { username, password } → { token, user }
GET  /api/auth/me         → { user }
```

### Songs (todas exigem Bearer token)
```
GET    /api/songs?search=&genre=&page=&pageSize=
GET    /api/songs/genres
GET    /api/songs/:id
POST   /api/songs         → ADMIN, EDITOR
PUT    /api/songs/:id     → ADMIN, EDITOR
DELETE /api/songs/:id     → ADMIN
```

### Users (exige ADMIN)
```
GET    /api/users
POST   /api/users         { name, username, password, role }
PUT    /api/users/:id/role { role }
DELETE /api/users/:id
```

---

## 🗄 Migrar para PostgreSQL (produção)

1. Em `backend/src/db/schema.ts`, troque os imports de `drizzle-orm/sqlite-core` para `drizzle-orm/pg-core`
2. Em `backend/src/db/client.ts`, troque `@libsql/client` + `drizzle-orm/libsql` por `pg` + `drizzle-orm/node-postgres`
3. Em `drizzle.config.ts`, troque `dialect: "turso"` por `dialect: "postgresql"`
4. Defina `DATABASE_URL` com a string de conexão Postgres
5. Rode `npm run db:generate && npm run db:migrate`

---

## 🔒 Segurança Implementada

- Senhas com **bcrypt** (custo 10) — nunca armazenadas em texto puro
- **JWT** com expiração configurável
- **Rate limiting** no login (20 req/15min por IP)
- **Helmet** — cabeçalhos HTTP de segurança
- **CORS** restrito à origem configurada
- **Zod** — validação de todos os inputs antes de chegar no banco
- Mensagens de erro de login **genéricas** (evita enumeração de usuários)
- **RBAC** — controle de acesso verificado em nível de rota, não só de interface

---

## 📝 Scripts úteis

```bash
# Backend
npm run dev             # Desenvolvimento com hot-reload
npm run build           # Build TypeScript → dist/
npm run start           # Produção (requer build)
npm run db:generate     # Gerar nova migração após mudança no schema
npm run db:migrate      # Aplicar migrações pendentes
npm run db:studio       # Interface visual Drizzle Studio
npm run seed            # Popular banco com dados iniciais

# Frontend
npm run dev             # Dev server Vite
npm run build           # Build produção → dist/
npm run preview         # Preview do build produção
```
