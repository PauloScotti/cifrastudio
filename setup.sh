#!/usr/bin/env bash
# setup.sh — Configura e inicia o CifraStudio em modo desenvolvimento
set -e

BOLD="\033[1m"
GREEN="\033[32m"
YELLOW="\033[33m"
CYAN="\033[36m"
RESET="\033[0m"

echo -e "${BOLD}${CYAN}"
echo "╔═══════════════════════════════════════╗"
echo "║        CifraStudio — Setup Dev        ║"
echo "╚═══════════════════════════════════════╝"
echo -e "${RESET}"

# Verificar Node
NODE_VERSION=$(node -v 2>/dev/null | sed 's/v//' | cut -d. -f1)
if [ -z "$NODE_VERSION" ] || [ "$NODE_VERSION" -lt 18 ]; then
  echo -e "${YELLOW}⚠  Node.js 18+ é necessário. Versão detectada: $(node -v 2>/dev/null || echo 'não encontrado')${RESET}"
  exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v)${RESET}"

# Backend
echo -e "\n${BOLD}[1/4] Configurando backend...${RESET}"
cd backend
[ ! -f .env ] && cp .env.example .env && echo "  → .env criado a partir do .env.example"
npm install --silent
echo -e "${GREEN}  ✓ Dependências instaladas${RESET}"

echo -e "\n${BOLD}[2/4] Migrando banco de dados e populando dados iniciais...${RESET}"
npm run seed
echo -e "${GREEN}  ✓ Banco pronto${RESET}"
cd ..

# Frontend
echo -e "\n${BOLD}[3/4] Configurando frontend...${RESET}"
cd frontend
[ ! -f .env ] && echo "VITE_API_URL=http://localhost:3333/api" > .env && echo "  → .env criado"
npm install --silent
echo -e "${GREEN}  ✓ Dependências instaladas${RESET}"
cd ..

echo -e "\n${BOLD}[4/4] Tudo pronto! Para iniciar:${RESET}"
echo ""
echo -e "  ${CYAN}Terminal 1${RESET} — Backend:"
echo "    cd backend && npm run dev"
echo ""
echo -e "  ${CYAN}Terminal 2${RESET} — Frontend:"
echo "    cd frontend && npm run dev"
echo ""
echo -e "  ${CYAN}Acesso:${RESET}"
echo "    Frontend → http://localhost:5173"
echo "    API      → http://localhost:3333"
echo ""
echo -e "  ${CYAN}Logins de teste:${RESET}"
echo "    admin     / admin123    (Administrador)"
echo "    editor    / editor123   (Editor)"
echo "    visitante / visitante123 (Visualizador)"
echo ""
