# CifraStudio — Backend

API REST para gestão de cifras musicais com autenticação JWT e controle de acesso por papel (RBAC).

## Stack

- **Node.js** + **TypeScript**
- **Express 4** — framework HTTP
- **Prisma ORM** + **SQLite** (troque facilmente para PostgreSQL em produção)
- **JWT** (jsonwebtoken) — autenticação stateless
- **bcryptjs** — hash de senhas
- **Zod** — validação de schemas
- **Helmet**, **CORS**, **express-rate-limit** — segurança

## Como rodar

```bash
cp .env.example .env
npm install
npm run prisma:migrate   # cria o banco SQLite e as tabelas
npm run seed              # popula com usuários e cifras de exemplo
npm run dev                # inicia em modo desenvolvimento (http://localhost:3333)
```

Para build de produção:

```bash
npm run build
npm start
```

## Usuários de exemplo (após `npm run seed`)

| Usuário     | Senha          | Papel   |
|-------------|----------------|---------|
| admin       | admin123       | ADMIN   |
| editor      | editor123      | EDITOR  |
| visitante   | visitante123   | VIEWER  |

## Endpoints principais

### Autenticação
- `POST /api/auth/register` — cria conta (role: VIEWER ou EDITOR)
- `POST /api/auth/login` — retorna `{ token, user }`
- `GET /api/auth/me` — perfil do usuário autenticado

### Cifras (`/api/songs`) — exige autenticação
- `GET /api/songs?search=&genre=&page=&pageSize=` — lista com busca/filtro/paginação
- `GET /api/songs/genres` — lista de gêneros distintos
- `GET /api/songs/:id` — detalhe
- `POST /api/songs` — criar (ADMIN, EDITOR)
- `PUT /api/songs/:id` — editar (ADMIN, EDITOR)
- `DELETE /api/songs/:id` — excluir (ADMIN apenas)

### Usuários (`/api/users`) — exige papel ADMIN
- `GET /api/users` — lista
- `POST /api/users` — criar
- `PUT /api/users/:id/role` — alterar papel
- `DELETE /api/users/:id` — remover

## Migrar para PostgreSQL (produção)

1. Em `prisma/schema.prisma`, troque `provider = "sqlite"` por `provider = "postgresql"`.
2. Defina `DATABASE_URL` no `.env` com a string de conexão do Postgres.
3. Rode `npx prisma migrate dev` novamente.

## Segurança implementada

- Senhas com hash bcrypt (nunca texto puro)
- JWT com expiração configurável
- Rate limiting no login (proteção contra brute-force)
- Helmet (cabeçalhos HTTP seguros)
- CORS restrito à origem do frontend
- Validação de entrada com Zod em todas as rotas
- Mensagens de erro de login genéricas (evita enumeração de usuários)
- Controle de acesso por papel em nível de rota (RBAC)
