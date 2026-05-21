# Central dos Desmanches

Marketplace B2B/B2C conectando desmanches credenciados (ferro-velhos) com clientes, oficinas e outros desmanches para peças automotivas, náuticas e aeronáuticas.

## Sobre o Projeto

A **Central dos Desmanches** é uma plataforma que simplifica a busca e venda de peças usadas. Em vez de ligar para desmanche por desmanche, o cliente publica um pedido e os desmanches credenciados enviam propostas com preço e condições.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 19 + TypeScript, Vite 7, Tailwind CSS 4, shadcn/ui |
| Backend | Express.js 5 + TypeScript |
| Banco de Dados | SQLite via Drizzle ORM (better-sqlite3) |
| Auth | JWT |
| Realtime | WebSockets (ws) |
| Upload | Multer |

## Estrutura do Projeto

```
├── client/          # Frontend React
├── server/          # Backend Express
├── shared/          # Schemas e tipos compartilhados (Drizzle + Zod)
└── uploads/         # Arquivos enviados pelos usuários
```

## Funcionalidades

### Para Clientes
- Publicar pedidos de peças (carro, moto, caminhão, náutico, aeronáutico)
- Receber propostas de múltiplos desmanches
- Negociar, confirmar recebimento e avaliar
- Chat integrado com desmanches

### Para Desmanches
- Painel de pedidos filtrado por tipo de veículo
- Enviar e gerenciar propostas
- Pipeline de negociações com rastreamento
- Gestão de documentação e licenças
- Mural de anúncios (busca de peças entre desmanches)

### Para Administradores
- Aprovar/rejeitar cadastros de desmanches com documentos
- Gestão de usuários, pedidos e negociações
- Relatórios financeiros e configurações do sistema

## Como Rodar

```bash
# Instalar dependências
npm install

# Desenvolvimento (Express + Vite na porta 5000)
npm run dev

# Build de produção
npm run build

# Rodar produção
npm start
```

## Credenciais de Teste

| Perfil | Email | Senha |
|--------|-------|-------|
| Admin | admin@centraldesmanches.com | admin123 |
| Desmanche | contato@irmaossilva.com | desmanche123 |
| Cliente | cliente@email.com | cliente123 |

## Variáveis de Ambiente

```env
JWT_SECRET=          # Chave secreta para tokens JWT
SESSION_SECRET=      # Chave para sessões
SMTP_HOST=           # Servidor SMTP (email)
SMTP_USER=           # Usuário SMTP
SMTP_PASS=           # Senha SMTP
```
