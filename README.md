# Nexus OS

PWA para gestão de serviços técnicos com fluxo de OS, checklist, fotos, assinaturas, relatório em PDF e persistência offline via IndexedDB.

## Frontend

Requisitos:

- Node.js 20+

Rodar localmente:

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

Variáveis de ambiente do frontend:

- `VITE_SYNC_INTERVAL_MS`: intervalo da rotina de sync local em ms. Exemplo: `5000`
- `VITE_API_URL`: URL futura da API. Pode ficar vazia enquanto o teste for só com IndexedDB

Arquivo exemplo:

- [.env.example](C:\Users\ferna\OneDrive\Documentos\SISTEMA DE MANUTENÇÃO\.env.example)

## Backend

O backend está isolado em `backend/`.

Rodar localmente:

```bash
cd backend
npm install
npm run dev
```

Build:

```bash
cd backend
npm run build
```

Variáveis de ambiente do backend:

- `PORT`: porta da API. Exemplo: `3333`
- `CORS_ORIGIN`: origem liberada no CORS. Exemplo: `http://localhost:5173`

Arquivo exemplo:

- [backend/.env.example](C:\Users\ferna\OneDrive\Documentos\SISTEMA DE MANUTENÇÃO\backend\.env.example)

## Vercel

Para testar agora na Vercel usando só IndexedDB no frontend, você pode subir apenas a raiz do projeto e configurar:

- `VITE_SYNC_INTERVAL_MS=5000`
- `VITE_API_URL=` vazio

Se depois você ligar o frontend ao backend, ajuste:

- `VITE_API_URL=https://sua-api.exemplo.com`

## Status Atual

Fluxos já prontos:

- login
- dashboard
- clientes
- equipamentos
- ordens de serviço
- checklist dinâmico
- fotos
- assinaturas
- relatório com exportação PDF
- fila offline visual
- sincronização local simulada
