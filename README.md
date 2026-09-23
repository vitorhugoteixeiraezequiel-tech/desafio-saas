# Descritiva — descrições de produto com IA

SaaS simples que gera **descrições de produto prontas para lojas virtuais e marketplaces** usando a API do **Google Gemini**.

O usuário cria uma conta, informa o nome e as características do produto, escolhe um tom de voz e recebe um texto estruturado (título, apresentação, benefícios e chamada para ação). Todas as descrições ficam salvas em um histórico por usuário.

## Funcionalidades

**Usuário (CRUD completo)**
- **Create** — cadastro com nome, e-mail e senha (senha salva com hash bcrypt)
- **Read** — login e página de perfil com os dados da conta
- **Update** — edição de nome/e-mail e troca de senha (exige a senha atual)
- **Delete** — exclusão da conta (exige confirmação de senha e apaga o histórico junto)

**Funcionalidade principal: gerador com IA**
- Formulário com nome do produto, características e tom de voz (profissional, descontraído, luxo, técnico ou persuasivo)
- Requisição ao Google Gemini feita **no servidor**, com a chave nunca exposta ao navegador
- Prompt de sistema que instrui o modelo a não inventar especificações e a seguir uma estrutura fixa
- Histórico das descrições geradas, com opção de copiar e excluir
- **Fallback entre modelos**: se um modelo do Gemini estiver sobrecarregado (comum no plano gratuito), o sistema tenta o próximo da lista automaticamente, com tempo máximo de 12s por modelo
- Mensagens de erro amigáveis (chave inválida, limite gratuito atingido etc.)

## Tecnologias

| Camada | Escolha | Por quê |
|---|---|---|
| Framework | **Next.js 16** (App Router, Server Actions) | Front e back no mesmo projeto, sem API separada |
| Linguagem | **TypeScript** | Tipagem de ponta a ponta |
| Estilo | **Tailwind CSS 4** | Interface rápida de construir e responsiva |
| Banco | **SQLite** via `node:sqlite` (nativo do Node) | Zero configuração e nenhuma dependência nativa para compilar |
| IA | **Google Gemini** via `@google/genai` | API gratuita para testes |
| Autenticação | JWT em cookie `httpOnly` (`jose`) + `bcryptjs` | Sessão sem estado, segue o guia oficial do Next.js |
| Validação | **Zod** | Valida todos os formulários no servidor |

## Como rodar

**Pré-requisito:** Node.js **22.13 ou superior** (testado no Node 24).

```bash
# 1. Instalar as dependências
npm install

# 2. Criar o arquivo de variáveis de ambiente
cp .env.example .env        # no Windows: copy .env.example .env
```

Abra o `.env` e preencha:

```env
GEMINI_API_KEY=sua_chave_aqui      # gere grátis em https://aistudio.google.com/api-keys
SESSION_SECRET=um_texto_longo_e_aleatorio
```

Para gerar um `SESSION_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

```bash
# 3. Iniciar
npm run dev
```

Acesse **http://localhost:3000**, crie uma conta e gere sua primeira descrição.

O banco SQLite é criado automaticamente em `data/app.db` no primeiro acesso.

## Estrutura do projeto

```
src/
├── app/
│   ├── page.tsx                 # Landing page
│   ├── (auth)/login, cadastro   # Páginas públicas de autenticação
│   ├── (app)/dashboard          # Gerador de descrições + histórico (protegido)
│   ├── (app)/perfil             # Editar dados, trocar senha, excluir conta (protegido)
│   └── actions/                 # Server Actions
│       ├── auth.ts              #   cadastro, login, logout
│       ├── user.ts              #   atualizar perfil, trocar senha, excluir conta
│       └── generate.ts          #   gerar descrição com IA, excluir do histórico
├── components/                  # Formulários e componentes de interface
├── lib/
│   ├── db.ts                    # Conexão SQLite, criação das tabelas e consultas
│   ├── gemini.ts                # Integração com a API do Google Gemini
│   ├── session.ts               # Criação e validação do cookie de sessão (JWT)
│   ├── dal.ts                   # Verificação de usuário autenticado
│   └── validation.ts            # Schemas Zod
└── proxy.ts                     # Redireciona visitantes não logados (antigo middleware)
```

## Segurança

- Senhas nunca são salvas em texto puro (bcrypt).
- Sessão em cookie `httpOnly` e `sameSite=lax`, inacessível via JavaScript.
- O `proxy.ts` faz apenas uma checagem rápida. **Toda página protegida e toda Server Action** revalidam o usuário no banco (`requireUser`).
- Cada usuário só acessa e exclui as próprias descrições (filtro por `user_id` nas consultas).
- As chaves ficam no `.env`, que está no `.gitignore`.

## Possíveis evoluções

- Limite de gerações por plano (free/pro) e cobrança via Stripe
- Geração de variações e de títulos para SEO
- Envio de foto do produto para a IA descrever (Gemini é multimodal)
- Exportar descrições em CSV para importar na loja
