# VNTL - Sistema de Gestão Hospitalar

Sistema web para gestão de aparelhos hospitalares de respiração (concentradores de oxigênio, CPAP, etc), pacientes e profissionais da área de saúde.

## Tecnologias

- **React 19** - Biblioteca JavaScript para interfaces de usuário
- **TypeScript** - Superset JavaScript com tipagem estática
- **Vite** - Build tool e dev server
- **React Router** - Roteamento para aplicações React
- **React Query** - Gerenciamento de estado de servidor e cache
- **Context API** - Gerenciamento de estado de sessão
- **Axios** - Cliente HTTP para requisições à API
- **JWT** - Autenticação baseada em tokens

## Funcionalidades

### Autenticação
- Login com JWT
- Acesso restrito à equipe de gestão
- Proteção de rotas

### Gerenciamento de Aparelhos
- Cadastro de aparelhos (número de patrimônio, tipo, marca, modelo, etc)
- Controle de status (Estoque, Em Uso, Manutenção, Inativo)
- Associação de aparelhos com pacientes
- Filtros por status

### Gerenciamento de Pacientes
- Cadastro completo de pacientes (nome, CPF, endereço, telefone, etc)
- Controle de status (Ativo, Inativo, Aguardando, Alta)
- Tipos de contrato (Prefeitura, Unimed, Particular, Outro)
- Gestão de visitas (última visita, próxima visita)
- Associação com aparelhos e profissionais responsáveis

### Gerenciamento de Profissionais
- Cadastro de profissionais (nome, CPF, telefone, email)
- Controle de status (Ativo/Inativo)
- Visualização de quantidade de pacientes atribuídos

### Dashboard
- Visão geral do sistema
- Estatísticas de aparelhos, pacientes e profissionais
- Visitas pendentes
- Aparelhos em manutenção

## Estrutura do Projeto

```
src/
├── components/
│   ├── common/          # Componentes comuns (ProtectedRoute)
│   ├── contexts/        # Context API (AuthContext)
│   ├── devices/         # Componentes de aparelhos
│   ├── layout/          # Componentes de layout (Sidebar, Header)
│   ├── pacients/        # Componentes de pacientes
│   └── professionals/   # Componentes de profissionais
├── pages/               # Páginas da aplicação
├── services/            # Serviços de API
└── types/               # Definições TypeScript
```

## Instalação

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env` na raiz do projeto:
```env
VITE_API_URL=http://localhost:8080/api
```

4. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

## Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera o build de produção
- `npm run preview` - Visualiza o build de produção
- `npm run lint` - Executa o linter

## API Backend

Este frontend espera uma API backend com os seguintes endpoints:

### Autenticação
- `POST /api/auth/login` - Login de usuário

### Aparelhos
- `GET /api/devices` - Lista todos os aparelhos
- `GET /api/devices/:id` - Obtém um aparelho específico
- `POST /api/devices` - Cria um novo aparelho
- `PUT /api/devices/:id` - Atualiza um aparelho
- `DELETE /api/devices/:id` - Remove um aparelho
- `GET /api/devices?status=STATUS` - Filtra por status

### Pacientes
- `GET /api/patients` - Lista todos os pacientes
- `GET /api/patients/:id` - Obtém um paciente específico
- `POST /api/patients` - Cria um novo paciente
- `PUT /api/patients/:id` - Atualiza um paciente
- `DELETE /api/patients/:id` - Remove um paciente
- `GET /api/patients?status=STATUS` - Filtra por status
- `PATCH /api/patients/:id/last-visit` - Atualiza última visita

### Profissionais
- `GET /api/professionals` - Lista todos os profissionais
- `GET /api/professionals/:id` - Obtém um profissional específico
- `POST /api/professionals` - Cria um novo profissional
- `PUT /api/professionals/:id` - Atualiza um profissional
- `DELETE /api/professionals/:id` - Remove um profissional
- `GET /api/professionals/:id/patients` - Lista pacientes do profissional
- `POST /api/professionals/:id/patients` - Associa paciente ao profissional
- `DELETE /api/professionals/:id/patients/:patientId` - Remove associação

## Autenticação

A aplicação utiliza JWT (JSON Web Tokens) para autenticação. O token é armazenado no `localStorage` e enviado automaticamente em todas as requisições via header `Authorization: Bearer <token>`.

## Build de Produção

```bash
npm run build
```

Os arquivos de produção serão gerados na pasta `dist/`.
