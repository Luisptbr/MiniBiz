# MiniBiz - Backend

## Descrição
Backend do sistema MiniBiz, uma aplicação para gestão de pequenos negócios desenvolvida com Spring Boot. Este sistema oferece funcionalidades para gerenciamento de clientes, produtos, vendas e autenticação de usuários.

## Tecnologias Utilizadas
- Java 17
- Spring Boot
- Spring Security
- Spring Data JPA
- JWT Authentication (com Auth0 java-jwt)
- PostgreSQL
- H2 Database (para testes)
- Spring Mail
- dotenv-java (para configuração de ambiente)
- Maven
- JUnit 5
- Mockito

## Estrutura do Projeto
O projeto segue uma arquitetura em camadas:

- **Controllers**: Responsáveis por receber as requisições HTTP
- **Services**: Contêm a lógica de negócio da aplicação
- **Repositories**: Interface com o banco de dados
- **Models**: Entidades do sistema
- **DTOs**: Objetos de transferência de dados
- **Config**: Configurações do Spring e segurança
- **Exception**: Classes para tratamento de exceções

## Funcionalidades Principais

### Autenticação e Usuários
- Registro de novos usuários
- Login com JWT
- Recuperação de senha por e-mail
- Gerenciamento de perfis de usuário

### Gestão de Clientes
- Cadastro completo de clientes
- Listagem paginada
- Busca por ID
- Atualização de dados
- Remoção de clientes

### Gerenciamento de Produtos
- Cadastro de produtos com informações detalhadas
- Controle de estoque
- Categorização de produtos
- Listagem, busca, atualização e remoção de produtos

### Sistema de Vendas
- Registro de vendas com múltiplos produtos
- Controle de status das vendas (aguardando, concluída, cancelada)
- Relatórios de vendas por período
- Relatórios financeiros
- Possibilidade de edição e cancelamento de vendas

## Endpoints da API

### Autenticação
- `POST /auth/login`: Autenticação de usuários
- `POST /auth/register`: Registro de novos usuários
- `POST /auth/forgot-password`: Solicitar recuperação de senha
- `POST /auth/reset-password`: Redefinir senha com token

### Clientes
- `GET /api/clients`: Listar todos os clientes (paginado)
- `GET /api/clients/{id}`: Buscar cliente por ID
- `POST /api/clients`: Criar novo cliente
- `PUT /api/clients/{id}`: Atualizar cliente existente
- `DELETE /api/clients/{id}`: Remover cliente

### Produtos
- `GET /api/products`: Listar todos os produtos (paginado)
- `GET /api/products/{id}`: Buscar produto por ID
- `POST /api/products`: Criar novo produto
- `PUT /api/products/{id}`: Atualizar produto existente
- `DELETE /api/products/{id}`: Remover produto

### Vendas
- `GET /api/vendas`: Listar todas as vendas (paginado)
- `GET /api/vendas/{id}`: Buscar venda por ID
- `POST /api/vendas`: Registrar nova venda
- `PUT /api/vendas/editar/{id}`: Editar venda existente
- `PUT /api/vendas/cancelar/{id}`: Cancelar venda
- `POST /api/vendas/relatorio`: Gerar relatório de vendas
- `POST /api/vendas/relatorio-financeiro`: Gerar relatório financeiro

## Testes
O projeto inclui uma cobertura abrangente de testes unitários e de integração:

### Testes Unitários
- Testes para camada de serviço (Services)
  - ClientService: testes completos para CRUD e regras de negócio
  - Cobertura para cenários de sucesso e de erro

### Testes de Integração
- Testes para controladores (Controllers) usando MockMvc:
  - ClientController: testes completos para todas as operações REST
  - AuthController: testes para autenticação, registro e recuperação de senha
  - ProductController: testes para gerenciamento de produtos
  - VendaController: testes para sistema de vendas e relatórios

### Recursos de Teste Implementados
- Mocking com Mockito
- Assertions JUnit
- Testes para APIs RESTful
- Testes para validação de exceções
- Testes para cenários de erro
- Banco de dados H2 em memória para testes
- Spring Security Test para testes de autenticação

## Configuração e Execução

### Pré-requisitos
- Java 17 ou superior
- PostgreSQL
- Maven

### Configuração do Banco de Dados
Configure as credenciais do banco de dados no arquivo `application.properties`:

```
spring.datasource.url=jdbc:postgresql://localhost:5432/minibiz
spring.datasource.username=seu_usuario
spring.datasource.password=sua_senha
```

### Configuração de Variáveis de Ambiente
O projeto utiliza dotenv-java para gerenciar variáveis de ambiente. Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```
JWT_SECRET=seu_segredo_jwt
MAIL_USERNAME=seu_email@exemplo.com
MAIL_PASSWORD=sua_senha_email
```

### Executando a Aplicação
```bash
mvn spring-boot:run
```

### Executando os Testes
```bash
mvn test
```

## Atualizações Recentes
- **Implementação de testes unitários**: Adicionados testes detalhados para Services
- **Implementação de testes de integração**: Adicionados testes com MockMvc para Controllers
- **Melhorias na segurança**: Reforço na autenticação JWT
- **Relatórios avançados**: Implementação de relatórios financeiros e de vendas

## Próximos Passos
- Implementação de testes de integração com banco de dados
- Adição de testes end-to-end (E2E)
- Expansão da cobertura de testes

## Licença
Este projeto está licenciado sob a licença MIT.

