# MiniBiz 2.0 - Frontend

Este é o frontend da aplicação MiniBiz 2.0, construído com [Next.js](https://nextjs.org) e React. O projeto foi desenvolvido para oferecer uma interface moderna, responsiva e segura para o sistema de gestão empresarial MiniBiz.

## Sumário

- [Estrutura do Projeto](#estrutura-do-projeto)
- [Instalação e Configuração](#instalação-e-configuração)
- [Sistema de Autenticação](#sistema-de-autenticação)
- [Componentes Principais](#componentes-principais)
- [Serviços e Utilitários](#serviços-e-utilitários)
- [Padrões de Código](#padrões-de-código)
- [Guia de Desenvolvimento](#guia-de-desenvolvimento)
- [Deploy](#deploy)

## Estrutura do Projeto

O projeto segue a estrutura padrão do Next.js App Router, com algumas personalizações para melhor organização do código.

```
my-app/
├── .next/              # Arquivos gerados pelo Next.js
├── app/                # Rotas e páginas (App Router)
├── components/         # Componentes React reutilizáveis
│   ├── ui/             # Componentes de UI genéricos
│   └── ...             # Outros componentes específicos
├── lib/                # Bibliotecas e utilitários
│   └── constants.ts    # Constantes da aplicação
├── public/             # Arquivos estáticos
├── src/
│   ├── services/       # Serviços para comunicação com API
│   └── types/          # Tipos TypeScript centralizados
├── middleware.ts       # Middleware Next.js para autenticação
├── next.config.mjs     # Configuração do Next.js
├── package.json        # Dependências e scripts
└── tsconfig.json       # Configuração do TypeScript
```

### Principais Diretórios e Arquivos

- **app/**: Páginas e rotas usando o App Router do Next.js 13+.
  - Cada pasta representa uma rota, com o arquivo `page.tsx` sendo a página principal.
  - `layout.tsx` define o layout compartilhado entre páginas.

- **components/**: Componentes React reutilizáveis.
  - **ui/**: Componentes básicos de UI (botões, inputs, cards, etc.).
  - Componentes específicos como `login-form.tsx`, `dashboard.tsx`, etc.

- **lib/**: Utilitários e constantes.
  - **constants.ts**: Constantes da aplicação, como rotas, chaves, etc.
  - **utils.ts**: Funções utilitárias.

- **src/services/**: Serviços para comunicação com a API.
  - **api.ts**: Classe responsável pelas requisições HTTP.
  - **auth.ts**: Serviço de autenticação.
  - Outros serviços específicos (clients.ts, products.ts, etc.).

- **src/types/**: Tipos TypeScript centralizados.
  - **index.ts**: Arquivo de definições de tipos para toda a aplicação.

- **middleware.ts**: Middleware Next.js para autenticação e segurança.

## Instalação e Configuração

### Pré-requisitos

- Node.js 18.17.0 ou superior
- npm, yarn, pnpm ou bun

### Passos para Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/minibiz.git
   cd frontend-minibiz\ 2.0/my-app
   ```

2. Instale as dependências:
   ```bash
   npm install
   # ou
   yarn install
   # ou
   pnpm install
   ```

3. Configure as variáveis de ambiente:
   - Copie o arquivo `.env.example` para `.env.local`
   - Preencha as variáveis necessárias (URL da API, etc.)

4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   # ou
   yarn dev
   # ou
   pnpm dev
   ```

5. Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

## Sistema de Autenticação

O sistema de autenticação utiliza JSON Web Tokens (JWT) com um mecanismo de refresh token para manter a sessão do usuário de forma segura.

### Fluxo de Autenticação

1. **Login**: O usuário se autentica com email e senha.
2. **Token**: O servidor retorna um token JWT e um refresh token.
3. **Armazenamento**: Os tokens são armazenados no localStorage com verificações de segurança.
4. **Requisições**: O token JWT é enviado em cada requisição no header Authorization.
5. **Expiração**: Quando o token expira, o refresh token é utilizado para obter um novo token.
6. **Logout**: Os tokens são removidos do localStorage.

### Componentes do Sistema de Autenticação

#### 1. Serviço de Autenticação (`src/services/auth.ts`)

Gerencia login, logout, verificação de autenticação e renovação de tokens.

```typescript
// Exemplo simplificado do useAuth hook
export const useAuth = () => {
  return {
    login: authService.login,
    logout: authService.logout,
    register: authService.register,
    isAuthenticated: authService.isAuthenticated,
    getCurrentUser: authService.getCurrentUser,
    // ...
  };
};
```

#### 2. Middleware de Autenticação (`middleware.ts`)

Protege rotas, verifica tokens e gerencia redirecionamentos de autenticação.

#### 3. API Client (`src/services/api.ts`)

Gerencia requisições HTTP com tratamento automático de refresh token.

#### 4. Formulário de Login (`components/login-form.tsx`)

Interface para autenticação e registro de usuários.

### Segurança

- **Token Storage**: Tokens armazenados com verificações para SSR.
- **XSS Protection**: Headers de segurança adicionados pelo middleware.
- **Token Expiration**: Verificação de expiração do token em cada requisição.
- **Role-Based Access Control**: Controle de acesso baseado em papéis do usuário.

## Componentes Principais

### Layout e Estrutura

- **Layout**: Definido em `app/layout.tsx` para estrutura compartilhada.
- **Navegação**: Componentes de menu e sidebar.
- **Auth**: Componentes de autenticação (`login-form.tsx`).

### Formulários

Os formulários utilizam o padrão controlled components do React, com validação e feedback visual.

### Componentes de UI

Usamos uma biblioteca personalizada de componentes UI baseada no Tailwind CSS:

- **Button**: Botões customizáveis com variantes.
- **Input**: Campos de entrada com validação.
- **Card**: Containers para conteúdo.
- **Alert**: Componentes para feedback ao usuário.
- **Tabs**: Componente para abas.

### Componentes de Dados

- **Table**: Tabelas para exibição de dados com paginação.
- **List**: Listas de itens.
- **Pagination**: Componente de paginação.
- **Filter**: Componentes para filtrar dados.

## Serviços e Utilitários

### Serviços

Todos os serviços estão localizados em `src/services/`:

- **auth.ts**: Gerencia autenticação e autorização.
- **api.ts**: Classe base para comunicação com a API.
- **clients.ts**, **products.ts**, **sales.ts**: Serviços específicos para cada entidade.

### Utilitários

- **lib/constants.ts**: Constantes utilizadas na aplicação.
- **lib/utils.ts**: Funções utilitárias gerais.
- **utils/**: Funções específicas (formatadores de data, calculadoras, etc.).

## Padrões de Código

### Convenções de Nomenclatura

- **Componentes**: PascalCase (ex: `LoginForm.tsx`)
- **Arquivos de utilidades**: camelCase (ex: `dateFormatter.ts`)
- **Constantes**: UPPER_SNAKE_CASE (ex: `TOKEN_KEY`)
- **Interfaces e Types**: PascalCase (ex: `User`, `Product`)

### Estrutura de Componentes

Todos os componentes seguem um padrão consistente de organização:

```tsx
// Estados e hooks no topo
// Handlers no meio
// Renderização no final
export function ExampleComponent({ prop1, prop2 }: ComponentProps) {
  const [state, setState] = useState(initialState);
  
  useEffect(() => {
    // Efeitos
  }, [dependencies]);
  
  const handleEvent = () => {
    // Lógica do handler
  };
  
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

## Guia de Desenvolvimento

### Fluxo de Trabalho

1. **Criação de Features**:
   - Crie uma branch a partir da `develop`: `feature/nome-da-feature`
   - Implemente a feature
   - Faça o commit seguindo o padrão de commits
   - Abra um PR para a branch `develop`

2. **Correção de Bugs**:
   - Crie uma branch a partir da `develop`: `fix/nome-do-bug`
   - Corrija o bug
   - Faça o commit seguindo o padrão de commits
   - Abra um PR para a branch `develop`

### Padrão de Commits

- **feat**: Nova funcionalidade
- **fix**: Correção de bug
- **docs**: Documentação
- **style**: Formatação de código
- **refactor**: Refatoração de código
- **test**: Testes
- **chore**: Tarefas de build, configuração, etc.

Exemplo:
```
feat: adiciona componente de tabela paginada - Luís H.
```

### Testes

O projeto inclui configurações para testes:

- **Testes Unitários**: Jest e React Testing Library
- **Testes E2E**: Cypress (opcional)

Execute os testes com:
```bash
npm run test
# ou
npm run test:watch
```

## Deploy

### Deploy em Desenvolvimento

Para fazer build do projeto:

```bash
npm run build
npm run start
```

### Deploy em Produção

O deploy é realizado automaticamente através de CI/CD quando há merge para a branch `main`.

Para deploy manual em produção:

```bash
npm run build
npm run start
```

### Deploy na Vercel

A maneira mais fácil de fazer deploy da aplicação é usar a [Plataforma Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme), dos criadores do Next.js.

Consulte a [documentação de deployment do Next.js](https://nextjs.org/docs/app/building-your-application/deploying) para mais detalhes.

## Recursos Adicionais

- [Next.js Documentation](https://nextjs.org/docs) - documentação oficial do Next.js
- [React Documentation](https://react.dev) - documentação oficial do React
- [Tailwind CSS](https://tailwindcss.com) - framework CSS utilizado no projeto

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para mais detalhes.
