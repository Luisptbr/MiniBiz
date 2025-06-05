# Documentação Frontend - MiniBiz 2.0

Este documento descreve a arquitetura, componentes e padrões utilizados no frontend da aplicação MiniBiz 2.0. A aplicação é construída utilizando Next.js e React, com foco em performance, segurança e manutenibilidade.

## Sumário

- [Estrutura do Projeto](#estrutura-do-projeto)
- [Sistema de Autenticação](#sistema-de-autenticação)
- [Componentes Principais](#componentes-principais)
- [Serviços e Utilitários](#serviços-e-utilitários)
- [Padrões de Código](#padrões-de-código)
- [Guia de Desenvolvimento](#guia-de-desenvolvimento)

## Estrutura do Projeto

O projeto segue a estrutura padrão do Next.js, com algumas personalizações para melhor organização do código.

```
frontend-minibiz 2.0/
├── my-app/
│   ├── .next/              # Arquivos gerados pelo Next.js
│   ├── components/         # Componentes React reutilizáveis
│   │   ├── ui/             # Componentes de UI genéricos
│   │   └── ...             # Outros componentes específicos
│   ├── lib/                # Bibliotecas e utilitários
│   │   └── constants.ts    # Constantes da aplicação
│   ├── public/             # Arquivos estáticos
│   ├── src/
│   │   ├── app/            # Estrutura de rotas do Next.js App Router
│   │   ├── services/       # Serviços para comunicação com API
│   │   └── types/          # Tipos TypeScript centralizados
│   ├── middleware.ts       # Middleware Next.js para autenticação e segurança
│   ├── next.config.js      # Configuração do Next.js
│   ├── package.json        # Dependências e scripts
│   └── tsconfig.json       # Configuração do TypeScript
└── ...
```

### Principais Diretórios e Arquivos

- **components/**: Componentes React reutilizáveis.
  - **ui/**: Componentes básicos de UI (botões, inputs, cards, etc.).
  - Outros componentes específicos da aplicação.

- **lib/**: Utilitários e constantes.
  - **constants.ts**: Constantes da aplicação, como rotas, chaves, etc.

- **src/app/**: Estrutura de rotas do Next.js App Router.
  - Cada pasta representa uma rota, com o arquivo `page.tsx` sendo a página principal.

- **src/services/**: Serviços para comunicação com a API.
  - **api.ts**: Classe responsável pelas requisições HTTP.
  - **auth.ts**: Serviço de autenticação.

- **src/types/**: Tipos TypeScript centralizados.
  - **index.ts**: Arquivo de definições de tipos para toda a aplicação.

- **middleware.ts**: Middleware Next.js para autenticação e segurança.

## Sistema de Autenticação

O sistema de autenticação utiliza JSON Web Tokens (JWT) com um mecanismo de refresh token para manter a sessão do usuário de forma segura.

### Fluxo de Autenticação

1. **Login**: O usuário se autentica com email e senha.
2. **Token**: O servidor retorna um token JWT e um refresh token.
3. **Armazenamento**: Os tokens são armazenados no localStorage.
4. **Requisições**: O token JWT é enviado em cada requisição no header Authorization.
5. **Expiração**: Quando o token expira, o refresh token é utilizado para obter um novo token.
6. **Logout**: Os tokens são removidos do localStorage.

### Componentes do Sistema de Autenticação

#### 1. Serviço de Autenticação (`auth.ts`)

```typescript
// Exemplo simplificado do serviço de autenticação
export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    // Implementação do login
  },
  
  isAuthenticated: (): boolean => {
    // Verifica se o usuário está autenticado
  },
  
  refreshToken: async (): Promise<boolean> => {
    // Atualiza o token utilizando o refresh token
  },
  
  logout: (): void => {
    // Efetua logout removendo os tokens
  }
};
```

#### 2. Middleware de Autenticação (`middleware.ts`)

O middleware do Next.js intercepta todas as requisições para proteger rotas que exigem autenticação.

```typescript
// Exemplo simplificado do middleware
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Se o caminho é público, permite acesso
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }
  
  // Verifica se há token
  const token = request.cookies.get(TOKEN_KEY)?.value;
  
  // Se não há token, redireciona para login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Verifica permissões
  const role = extractRoleFromToken(token);
  if (!hasPermission(pathname, role)) {
    return NextResponse.redirect(new URL('/acesso-negado', request.url));
  }
  
  return NextResponse.next();
}
```

#### 3. API Client (`api.ts`)

Classe que gerencia as requisições HTTP, incluindo tratamento de tokens.

```typescript
// Exemplo simplificado do API client
class Api {
  async fetchApi<T>(endpoint: string, method: string, data?: any, options?: RequestOptions): Promise<T> {
    // Implementação das requisições HTTP
    // Com tratamento automático de refresh token
  }
  
  // Métodos para requisições HTTP
  get<T>(endpoint: string, options?: RequestOptions) { /*...*/ }
  post<T>(endpoint: string, data?: any, options?: RequestOptions) { /*...*/ }
  // ...
}
```

#### 4. Formulário de Login (`login-form.tsx`)

Componente que implementa o formulário de login e registro.

### Segurança

- **Token Storage**: Os tokens são armazenados no localStorage com verificações de segurança.
- **XSS Protection**: Headers de segurança são adicionados pelo middleware.
- **CSRF Protection**: Implementado através de tokens específicos para formulários.
- **Token Expiration**: Verificação de expiração do token em cada requisição.
- **Role-Based Access Control**: Controle de acesso baseado em papéis do usuário.

## Componentes Principais

### Layout e Estrutura

- **Layout**: Componentes de layout para estruturar as páginas.
- **Navigation**: Componentes de navegação (menu, sidebar, etc.).
- **Auth**: Componentes relacionados à autenticação.

### Formulários

Os formulários utilizam o padrão controlled components do React, com validação e feedback visual.

```tsx
// Exemplo de implementação de formulário
const Form = () => {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const validateForm = () => {
    // Implementação da validação
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Submete o formulário
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Campos do formulário */}
    </form>
  );
};
```

### Componentes de UI

- **Button**: Botões customizáveis com variantes.
- **Input**: Campos de entrada com validação.
- **Card**: Containers para conteúdo.
- **Alert**: Componentes para feedback ao usuário.
- **Modal**: Janelas modais para ações específicas.

### Componentes de Dados

- **Table**: Tabelas para exibição de dados com paginação.
- **List**: Listas de itens.
- **Pagination**: Componente de paginação.
- **Filter**: Componentes para filtrar dados.

## Serviços e Utilitários

### Serviços

- **auth.service.ts**: Gerencia autenticação e autorização.
- **api.ts**: Classe base para comunicação com a API.
- **Serviços específicos**: Implementações para cada entidade (clientes, produtos, vendas).

### Utilitários

- **constants.ts**: Constantes utilizadas na aplicação.
- **Formatadores**: Funções para formatação de dados (datas, moedas, etc.).
- **Validadores**: Funções para validação de dados.

## Padrões de Código

### Convenções de Nomenclatura

- **Componentes**: PascalCase (ex: `LoginForm.tsx`)
- **Arquivos de utilidades**: camelCase (ex: `authUtils.ts`)
- **Constantes**: UPPER_SNAKE_CASE (ex: `TOKEN_KEY`)
- **Interfaces e Types**: PascalCase com prefixo I (ex: `IUser` ou apenas `User`)

### Estrutura de Componentes

```tsx
// Exemplo de estrutura de componente
import { useState, useEffect } from 'react';
import { ComponentProps } from './types';

export function ExampleComponent({ prop1, prop2 }: ComponentProps) {
  // Estado local
  const [state, setState] = useState(initialState);
  
  // Efeitos
  useEffect(() => {
    // Lógica do efeito
  }, [dependencies]);
  
  // Handlers
  const handleEvent = () => {
    // Lógica do handler
  };
  
  // Renderização condicional
  if (condition) {
    return <AlternativeRender />;
  }
  
  // JSX principal
  return (
    <div>
      {/* Conteúdo do componente */}
    </div>
  );
}
```

### Hooks Customizados

```tsx
// Exemplo de hook customizado
function useCustomHook(params) {
  // Estado e lógica do hook
  
  return {
    // Valores e funções retornados pelo hook
  };
}
```

## Guia de Desenvolvimento

### Pré-requisitos

- Node.js 16+ 
- npm ou yarn
- Git

### Configuração do Ambiente

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/minibiz.git
   ```

2. Instale as dependências:
   ```bash
   cd frontend-minibiz 2.0/my-app
   npm install
   ```

3. Configure as variáveis de ambiente:
   - Crie um arquivo `.env.local` baseado no `.env.example`

4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

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

- **Testes Unitários**: Jest e React Testing Library
- **Testes E2E**: Cypress

### Deploy

O deploy é realizado automaticamente através de CI/CD quando há merge para a branch `main`.

## Contribuição

1. Faça um fork do projeto
2. Crie sua branch de feature (`git checkout -b feature/nome-da-feature`)
3. Faça commit das suas alterações (`git commit -m 'feat: adiciona nova funcionalidade'`)
4. Faça push para a branch (`git push origin feature/nome-da-feature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para mais detalhes.

