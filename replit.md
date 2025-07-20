# TaskFlow - Project Management Application

## Overview

TaskFlow is a modern full-stack project management application built with React frontend and Express backend. It features workspace-based task organization, real-time collaboration, and role-based access control. The application uses a PostgreSQL database with Drizzle ORM and includes comprehensive authentication through Replit's OIDC provider.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite with hot module replacement

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit OIDC with Passport.js
- **Session Management**: Express sessions with PostgreSQL store
- **File Upload**: Multer for handling attachments
- **API**: RESTful endpoints with role-based authorization

### Database Design
- **ORM**: Drizzle with PostgreSQL dialect
- **Schema**: Relational model with users, workspaces, tasks, comments, and attachments
- **Migrations**: Handled through drizzle-kit
- **Connection**: Neon serverless PostgreSQL adapter

## Key Components

### Authentication System
- **Provider**: Replit OIDC integration
- **Session Storage**: PostgreSQL-backed sessions
- **Authorization**: Role-based access control (admin/worker)
- **Security**: HTTP-only cookies, CSRF protection

### Workspace Management
- **Multi-tenant**: Users can belong to multiple workspaces
- **Permissions**: Workspace-level member management
- **Customization**: Color themes and icons for workspaces
- **Archive**: Soft delete functionality for workspaces

### Task Management
- **Kanban Board**: Visual task organization by status
- **Priority Levels**: High, medium, low priority classification
- **Assignments**: User assignment with due dates
- **Comments**: Threaded discussions on tasks
- **Attachments**: File upload support (images, PDFs)

### User Interface
- **Responsive Design**: Mobile-first approach with desktop optimization
- **Component Library**: Comprehensive UI components from shadcn/ui
- **Theme System**: CSS variables for consistent styling
- **Accessibility**: ARIA compliance through Radix UI primitives

## Data Flow

### Client-Server Communication
1. **API Requests**: RESTful endpoints with JSON payloads
2. **Authentication**: Session-based auth with automatic redirects
3. **Error Handling**: Centralized error management with user feedback
4. **Caching**: TanStack Query for optimistic updates and cache management

### Database Interactions
1. **Schema Validation**: Zod schemas for runtime type checking
2. **Query Building**: Drizzle ORM with type-safe query construction
3. **Transactions**: Atomic operations for complex data updates
4. **Relationships**: Proper foreign key constraints and joins

### File Handling
1. **Upload Process**: Multer middleware for multipart form handling
2. **Storage**: Local filesystem storage with configurable limits
3. **Validation**: File type and size restrictions
4. **Serving**: Static file serving through Express

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Query
- **UI Components**: Radix UI primitives, Lucide icons
- **Styling**: Tailwind CSS, class-variance-authority, clsx
- **Forms**: React Hook Form with Zod validation

### Backend Dependencies
- **Server**: Express.js with TypeScript support
- **Database**: Drizzle ORM, Neon PostgreSQL adapter
- **Authentication**: Passport.js, OpenID Connect client
- **File Upload**: Multer for multipart handling
- **Sessions**: connect-pg-simple for PostgreSQL session store

### Development Tools
- **Build**: Vite for frontend bundling, esbuild for backend
- **TypeScript**: Full type coverage across frontend and backend
- **Development**: tsx for TypeScript execution, hot reloading

## Deployment Strategy

### Build Process
1. **Frontend**: Vite builds React app to `dist/public`
2. **Backend**: esbuild bundles server code to `dist/index.js`
3. **Database**: Drizzle migrations applied via `db:push` command

### Environment Configuration
- **Database**: `DATABASE_URL` for PostgreSQL connection
- **Auth**: `SESSION_SECRET`, `REPL_ID`, `ISSUER_URL` for OIDC
- **File Storage**: Configurable upload directory

### Runtime Requirements
- **Node.js**: ESM module support required
- **PostgreSQL**: Database with session storage table
- **File System**: Write access for file uploads

### Production Considerations
- **Session Management**: Persistent session store in PostgreSQL
- **File Storage**: Local filesystem (could be extended to cloud storage)
- **Security**: HTTPS required for secure cookies and OIDC
- **Scaling**: Stateless design allows horizontal scaling