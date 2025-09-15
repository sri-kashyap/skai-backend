# Authentication Setup with Supabase

This NestJS application includes a complete authentication system using Supabase as the backend service.

## Prerequisites

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Get your project URL and API keys from the Supabase dashboard

## Environment Setup

1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Supabase credentials in the `.env` file:
   ```env
   SUPABASE_URL=your_supabase_url_here
   SUPABASE_ANON_KEY=your_supabase_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
   JWT_SECRET=your_jwt_secret_here
   JWT_EXPIRES_IN=7d
   ```

## API Endpoints

### Authentication Endpoints

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login with email and password
- `POST /auth/logout` - Logout (requires authentication)
- `POST /auth/refresh` - Refresh JWT token (requires authentication)
- `GET /auth/profile` - Get user profile (requires authentication)

### Protected Endpoints

- `GET /protected` - Example protected route (requires authentication)

## Usage Examples

### Register a new user
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Access protected route
```bash
curl -X GET http://localhost:3000/protected \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Features

- ✅ User registration with Supabase
- ✅ User login with email/password
- ✅ JWT token generation and validation
- ✅ Protected routes with JWT guards
- ✅ User profile management
- ✅ Token refresh functionality
- ✅ Logout functionality
- ✅ Input validation with class-validator
- ✅ TypeScript support
- ✅ Error handling

## Project Structure

```
src/
├── auth/
│   ├── dto/
│   │   └── auth.dto.ts          # Data Transfer Objects
│   ├── guards/
│   │   └── jwt-auth.guard.ts    # JWT Authentication Guard
│   ├── strategies/
│   │   └── jwt.strategy.ts      # JWT Strategy for Passport
│   ├── auth.controller.ts       # Authentication Controller
│   ├── auth.service.ts          # Authentication Service
│   └── auth.module.ts           # Authentication Module
├── config/
│   └── supabase.config.ts       # Supabase Configuration
├── supabase/
│   ├── supabase.service.ts      # Supabase Service
│   └── supabase.module.ts       # Supabase Module
└── ...
```

## Running the Application

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run start:dev
   ```

3. The application will be available at `http://localhost:3000`

## Testing

Run the test suite:
```bash
npm run test
```

Run e2e tests:
```bash
npm run test:e2e
```
