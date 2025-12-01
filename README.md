# AceBook Frontend

Frontend em Next.js + TypeScript para o sistema de reservas de quadras de tênis desenvolvido na disciplina de Programação para Web. O projeto replica o mesmo domínio do primeiro trabalho (gestão de quadras de tênis), mas agora com foco em uma experiência completa separada do backend em Django.

## Principais decisões

- **Stack**: Next.js 16 (App Router) com TypeScript, Tailwind v4 e componentes do shadcn/ui.
- **Design system**: paleta inspirada em quadras de tênis, layouts responsivos e componentes reutilizáveis em `src/components`.
- **Rotas**:
  - `/` portal do atleta (login direto para clientes).
  - `/login` painel de administradores do clube.
  - `/register/player` e `/register/admin` para criação de contas (cada uma com seu formulário).
  - `/forgot-password`, `/reset-password` para gerenciamento de senha.
  - `/dashboard/*` (overview, quadras, reservas, usuários, configurações) com layout próprio.
- **Mock data**: `src/lib/mock-data.ts` fornece dados temporários até a integração com o backend.
- **Contratos de API**: definidos em `src/lib/api.ts` apontando para `http://localhost:8000/api` (pode ser sobrescrito via `NEXT_PUBLIC_API_BASE_URL`).

## Como rodar

```bash
npm install
npm run dev
# abra http://localhost:3000
```

Variáveis úteis:

- `NEXT_PUBLIC_API_BASE_URL`: URL base do backend Django publicado.
- `NEXT_PUBLIC_USE_MOCK_API=true`: força o modo mock, útil enquanto a API não estiver acessível.

## Integração prevista com o backend

Endpoints esperados (seguindo o enunciado e prontos para documentação em Swagger no backend):

| Domínio        | Método | Endpoint                         | Descrição                                     |
| -------------- | ------ | -------------------------------- | --------------------------------------------- |
| Autenticação   | POST   | `/auth/login/`                   | Login e retorno de tokens JWT.                |
| Autenticação   | POST   | `/auth/register/`                | Cadastro de usuário/academia.                 |
| Autenticação   | POST   | `/auth/password/forgot/`         | Solicitação de redefinição de senha.          |
| Autenticação   | POST   | `/auth/password/reset/`          | Aplicação do token de redefinição.            |
| Quadras        | GET    | `/courts/`                       | Listagem com filtros.                         |
| Quadras        | POST   | `/courts/`                       | Criação de quadra (restrito/admin).          |
| Quadras        | PATCH  | `/courts/<id>/`                  | Atualização parcial.                          |
| Quadras        | DELETE | `/courts/<id>/`                  | Exclusão (se não houver reservas ativas).     |
| Reservas       | GET    | `/reservations/`                 | Listagem e busca.                             |
| Reservas       | POST   | `/reservations/`                 | Criação de reserva (usuário autenticado).     |
| Reservas       | PATCH  | `/reservations/<id>/`            | Reprogramar/cancelar.                         |
| Usuários       | GET    | `/users/`                        | Lista de jogadores do clube (visão filtrada). |
| Usuários       | PATCH  | `/users/<id>/`                   | Atualização de perfis/planos.                 |
| Coaches        | GET    | `/coaches/`                      | Listagem de instrutores (admin).              |
| Coaches        | POST   | `/coaches/`                      | Cadastro de coach.                            |
| Coaches        | PATCH  | `/coaches/<id>/`                 | Atualização de coach.                         |
| Coaches        | DELETE | `/coaches/<id>/`                 | Remoção do coach.                             |

Todos os métodos que alteram dados serão protegidos via JWT e com grupos de permissão distintos para `player` e `admin`. A gestão de coaches acontece via o novo CRUD dedicado, apenas para administradores. O frontend já prepara o header `Authorization` em `src/lib/api.ts` e trata respostas `JSON` padrão.

## Próximos passos

1. Ajustar o resumo do pré-projeto e enviar ao professor para validação do escopo.
2. Subir o backend em Django com os endpoints descritos e habilitar Swagger.
3. Conectar as chamadas reais no frontend (substituindo os dados mock) e publicar o app.

## Scripts disponíveis

- `npm run dev`: ambiente de desenvolvimento com hot reload.
- `npm run build`: build de produção otimizado.
- `npm run start`: serve o build produzido.
- `npm run lint`: validação com ESLint.

## Estrutura

```
src/
  app/                 # Rotas do Next.js
  components/          # shadcn/ui + componentes de layout/dashboard
  lib/                 # Tipos, mocks, rotas e cliente de API
```

As imagens solicitadas e instruções detalhadas de deploy serão adicionadas após o desenvolvimento completo e publicação.
