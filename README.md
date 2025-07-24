# AIAlpha - Multi-tenant SaaS Data Visualization Platform

A comprehensive data visualization platform built with React, TypeScript, Node.js, Express.js, and Supabase.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm 9+
- Docker Desktop (optional)
- Supabase account

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd AIAlpha
   npm run install:all
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```
   
   Fill in your Supabase credentials and other configuration values.

3. **Start development servers:**
   ```bash
   npm run dev
   ```
   
   This starts both backend (port 3001) and frontend (port 5173) concurrently.

## 📁 Project Structure

```
AIAlpha/
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Business logic
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Data models
│   │   ├── routes/          # API routes
│   │   ├── utils/           # Utility functions
│   │   └── types/           # TypeScript types
│   └── package.json
├── frontend/                # React application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # API services
│   │   ├── types/           # TypeScript types
│   │   ├── utils/           # Utility functions
│   │   └── pages/           # Page components
│   └── package.json
├── shared/                  # Shared TypeScript types
└── package.json            # Root package.json
```

## 🛠 Available Scripts

### Root Level
- `npm run dev` - Start both backend and frontend in development mode
- `npm run build` - Build both backend and frontend for production
- `npm run test` - Run all tests
- `npm run lint` - Lint all code
- `npm run typecheck` - Type check all TypeScript code

### Backend Specific
- `cd backend && npm run dev` - Start backend development server
- `cd backend && npm run build` - Build backend for production
- `cd backend && npm run test` - Run backend tests
- `cd backend && npm run test:watch` - Run backend tests in watch mode

### Frontend Specific
- `cd frontend && npm run dev` - Start frontend development server
- `cd frontend && npm run build` - Build frontend for production
- `cd frontend && npm run test` - Run frontend tests
- `cd frontend && npm run test:watch` - Run frontend tests in watch mode

## 🧪 Testing

The project uses a comprehensive testing strategy:

- **Backend**: Jest with Supertest for API testing
- **Frontend**: Vitest with React Testing Library
- **Coverage**: 85% minimum coverage requirement
- **E2E**: Cypress/Playwright (to be added)

Run tests:
```bash
# All tests
npm run test

# Backend tests only
npm run test:backend

# Frontend tests only  
npm run test:frontend

# Watch mode
npm run test:watch
```

## 🐳 Docker Development

Start with Docker Compose:
```bash
# Development environment
docker-compose -f docker-compose.dev.yml up

# Production environment
docker-compose up
```

## 🏗 Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript (strict mode)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Validation**: Zod
- **Testing**: Jest + Supertest
- **Logging**: Winston

### Frontend
- **Framework**: React 18
- **Language**: TypeScript (strict mode)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + Shadcn UI
- **State Management**: Zustand + TanStack Query
- **Forms**: React Hook Form + Zod
- **Charts**: ECharts
- **Testing**: Vitest + React Testing Library

### DevOps
- **Containerization**: Docker
- **Linting**: ESLint
- **Formatting**: Prettier
- **CI/CD**: GitHub Actions (to be added)

## 🔒 Security Features

- **Multi-tenant Architecture**: Schema-per-tenant isolation
- **Authentication**: JWT-based with Supabase Auth
- **Input Validation**: Comprehensive Zod validation
- **Security Headers**: Helmet.js middleware
- **Rate Limiting**: Express rate limiter
- **CORS**: Configured for frontend domain

## 📊 Multi-tenancy

The platform uses a **schema-per-tenant** approach:

- Each tenant gets an isolated PostgreSQL schema
- All database queries are schema-qualified
- Application-layer enforcement of tenant boundaries
- Automated schema creation during tenant provisioning

## 🚀 Deployment

### Environment Variables

Required environment variables:

**Backend (.env)**:
```env
NODE_ENV=production
PORT=3001
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
```

**Frontend (.env)**:
```env
VITE_API_URL=https://your-api-domain.com/api
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Production Build

```bash
# Build both applications
npm run build

# Start production server
cd backend && npm start
```

## 🤝 Contributing

1. Follow the established code style (ESLint + Prettier)
2. Write tests for new features (TDD approach)
3. Ensure 85%+ test coverage
4. Use conventional commit messages
5. Update documentation as needed

## 📝 Development Guidelines

- **TDD Mandatory**: Write tests before implementation
- **Type Safety**: Strict TypeScript configuration
- **Code Style**: Enforced via ESLint and Prettier
- **Security First**: Multi-tenant isolation and input validation
- **Performance**: Optimized queries and efficient React patterns

## 🔧 Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 3001 and 5173 are available
2. **Environment variables**: Verify all required env vars are set
3. **Dependencies**: Run `npm run install:all` if packages are missing
4. **TypeScript errors**: Run `npm run typecheck` to identify issues

### Getting Help

- Check the [Development Playbook](./live-coding/Dev%20Playbook%20(v4.3).md)
- Review the [Implementation Plan](./live-coding/Implementation%20Plan.md)
- Consult the [Solution Architecture](./live-coding/SA%20(v1.2).md)

## 📄 License

MIT License - see LICENSE file for details.