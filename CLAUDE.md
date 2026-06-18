# CLAUDE.md - TSRDERP Frontend Rules

## Core Commands

- Dev Server: `ng serve` (http://localhost:4200/)
- Build: `ng build`
- Lint/Format: `npm run lint`
- Test: `ng test`

## Tech Stack & Architecture

- **Framework**: Angular 18, TypeScript (Strict Mode), RxJS, SCSS.
- **UI Toolkit**: PrimeNG 17.18.15 + PrimeFlex. (Use components from `src/app/shared/componentkit/` first).
- **Inheritance Pattern**:
  - Query/List pages MUST extend `BasicQueryPageComponent`.
  - Create/Read/Update pages MUST extend `BasicCruPageComponent`.
  - Call `this.initializePage()` in `ngOnInit`.

## Critical Code Conventions (DO NOT VIOLATE)

1. **Type Safety**: Never use `any`. Always use explicit TypeScript interfaces/types.
2. **Memory Leaks**: Always use `pipe(untilDestroyed(this))` with `@UntilDestroy()` decorator for subscriptions.
3. **Navigation**: Use `this.navigateWithState(CRUDStatus.Edit, rowdata)` for CRUD routing.
4. **Permissions**: Use `this.hasPermission('20')` (Create), `'30'` (Edit), `'40'` (Delete).
5. **Null Safety**: ERP data is prone to nulls. Always use safe navigation (`?.`) and handle undefined API responses gracefully.

## Complex Workflow Reference

- Look at `src/app/pages/tls/tls13010/` and `ContractFlowService` as the gold standard for multi-step form validation, state persistence (sessionStorage + memory cache), and change tracking.

## AI Response Style

- Respond minimalistically. No long explanations, generic tutorials, or markdown tables in code reviews unless explicitly asked.
- Provide direct, copy-pasteable code diffs.
