# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TSRDERP_Frontend is an Angular 18 application for a Taiwan ERP (Enterprise Resource Planning) system built with TypeScript, PrimeNG UI components, and SCSS styling. The application serves as the frontend for南紡ERP (Tainan Spinning ERP) with multiple business modules including Asset Management (ASS), Customer/Personnel Management (CPM), Finance (FIN), System (SYS), and Tenant Lease System (TLS).

## Development Commands

### Core Development
- `ng serve` - Start development server at http://localhost:4200/
- `ng build` - Build for production
- `ng build --watch --configuration development` - Build in watch mode for development
- `ng test` - Run unit tests with Karma
- `ng generate component component-name` - Generate new component

### Environment-Specific Builds
- GitHub Pages: `ng build --base-href="/TSRDERP_Frontend/" --deploy-url="/TSRDERP_Frontend/"`
- AWS Deployment: `ng build --base-href="/TSRDWEB/" --deploy-url="/TSRDWEB/"`

### Code Quality
- ESLint configuration with Angular rules is configured in `eslint.config.js`
- Prettier is configured for code formatting
- TypeScript strict mode enabled

## Architecture

### Module Structure
The application follows Angular's modular architecture with feature modules:

- **Layout Module** (`src/app/layout/`) - Contains main layout components (menubar, topbar, dynamic tab view)
- **Pages Module** (`src/app/pages/`) - Feature modules organized by business domain:
  - `ass/` - Asset management (100+ components)
  - `base/` - Base functionality (login, dashboard, password change)
  - `cpm/` - Customer/Personnel management 
  - `fin/` - Finance
  - `sys/` - System administration
  - `tls/` - Tenant Lease System (contract management)

### Component Architecture Patterns

#### Base Component Classes
The application uses inheritance-based component architecture:

- **BasicQueryPageComponent** (`src/app/shared/componentextends/basic-qpage/`) - Base class for query/list pages
- **BasicCruPageComponent** (`src/app/shared/componentextends/basic-crupage/`) - Base class for Create/Read/Update pages

These base components provide:
- User authentication and permissions (`funInfo`)
- Form state management
- Navigation helpers
- Query state persistence
- Standard CRUD operations

#### Component Kit System
Reusable UI components in `src/app/shared/componentkit/`:
- Form controls (input-text, dropdown, calendar, etc.)
- Data tables with export functionality
- File upload components
- Multi-select and tree components
- Advanced table components (expandable-edit-table)

### Service Architecture

#### Service Categories
- **API Services** (`src/app/service/api/`) - Direct API communication
- **Basic Services** (`src/app/service/basic/`) - 100+ dropdown/lookup services for form options
- **System Services** (`src/app/service/system/`) - Authentication, user management

#### Key Services
- **AuthService** - Handles authentication and user permissions
- **NotificationService** - Centralized messaging and UI blocking
- **QueryStateService** - Persists query states across navigation

### Complex Workflow Implementation (TLS13010)

The TLS13010 series demonstrates a sophisticated multi-step workflow pattern:

#### Workflow Components
- `tls13010/` - Query/list page
- `tls13010-cru/` - Contract basic information (Step 1)
- `tls13010-next1/` - Deduction settings (Step 2)  
- `tls13010-next2/` - Commission settings (Step 3)
- `tls13010-next3/` - Condition settings (Step 4)

#### Workflow Services
- **ContractFlowService** - Manages multi-step workflow state with sessionStorage + memory caching
- **TLS13010Service** - API communication layer
- **TLS13010DropdownService** - Manages dropdown options

#### Data Management
- **Workflow State Persistence** - Automatic saving to sessionStorage with memory cache
- **Multi-step Validation** - Each step validates before proceeding
- **Data Change Tracking** - Complex change tracking for insert/update/delete operations
- **Unified Commission API** - Handles different commission types with data migration

### State Management

The application uses Angular services for state management without external libraries:
- Session storage for workflow persistence
- Memory caching for performance
- Service-based state sharing between components

### UI Framework

Built on PrimeNG 17.18.15 with:
- Saga Blue theme
- PrimeFlex for layout utilities  
- PrimeIcons for iconography
- Custom SCSS styling

### Internationalization

Basic i18n support with JSON files in `src/assets/i18n/`:
- `zh-tw.json` (Traditional Chinese)
- `en.json` (English)
- `ja.json` (Japanese)

## Development Environment

### API Configuration
Development API endpoints configured in `src/environments/environment.ts`:
- Default: `https://localhost:7271`
- Multiple environment options commented for easy switching

### Proxy Configuration
`proxy.conf.json` configured for local development with CORS headers.

## Code Conventions

### Component Naming
- Use kebab-case for component selectors
- Prefix components with `app-`
- Feature components follow pattern: `{module}{number}-{action}` (e.g., `tls13010-cru`)

### File Organization
- Each component has `.html`, `.scss`, `.ts`, and `.spec.ts` files
- Services grouped by functionality in dedicated folders
- Models organized by business domain in `src/app/shared/models/`

### TypeScript Patterns
- Extensive use of interfaces for type safety
- Enum usage for constants (e.g., `WorkflowStep`)
- Generic base classes for reusable component logic

## Testing

- Jasmine and Karma configured for unit testing
- Spec files co-located with components and services
- Testing setup includes Angular testing utilities

## Security Considerations

- JWT token authentication via `@auth0/angular-jwt`
- Route guards for authentication (`auth.guard.ts`) and public access (`public.guard.ts`)
- HTTP interceptors for auth tokens and error handling
- Environment-specific API keys and encryption settings

## Performance Considerations

- Lazy loading modules by feature
- OnPush change detection where appropriate
- Session storage with memory caching for workflow state
- Component reusability through base classes and component kit

When working with this codebase, focus on maintaining the established patterns for component inheritance, service architecture, and the complex workflow implementations, especially in the TLS13010 contract management system which serves as the most sophisticated example of the application's capabilities.
