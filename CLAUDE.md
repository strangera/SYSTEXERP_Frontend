# CLAUDE.md - TSRDERP Frontend Rules

## Core Commands

- Dev Server (Requires High Memory): `npm start`
- Production Build (TSRDWEB): `npm run build:tsrdweb`
- Standard Build: `npm run build`
- Run Tests: `npm run test`
- Bundle Analyze: `npm run analyze`

## Tech Stack & Architecture

- **Framework**: Angular 18.1.0 (Standalone Pattern), TypeScript (~5.5.2), RxJS (~7.8.0)
- **UI Toolkit**: PrimeNG 17.18.15 + PrimeFlex 3.3.1.
  - **Global Header**: EVERY page/action component MUST include `app-menubar` (located in `src/app/shared/component/menubar/`) at the very top of the HTML, binding `[ProgNo]="ProgNo"`.
  - **Allowed Shared Components**: Prioritize and ONLY use these 14 valid components in `src/app/shared/componentkit/`:
    - `auto-complete`
    - `button`
    - `calendar`
    - `calendar-range`
    - `dropdown`
    - `dropdown-range`
    - `input-number`
    - `input-number-range`
    - `input-text`
    - `input-text-range`
    - `input-textarea`
    - `multi-select`
    - `table-edit`
    - `table-report`
  - **CRITICAL**: Ignore any other legacy or rogue components inside `shared/`. Never reference or mimic `src/app/pages/tls/tls13010/` (it violates architectural patterns and creates shared pollution). Page-specific components MUST stay inside their respective feature module folder (e.g., `src/app/pages/tls/`).
- **Inheritance Pattern**:
  - Query/List pages MUST extend `BasicQueryPageComponent` (located in `src/app/shared/componentextends/basic-qpage/`).
  - Create/Read/Update pages MUST extend `BasicCruPageComponent` (located in `src/app/shared/componentextends/basic-crupage/`).
  - Call `this.initializePage()` in `ngOnInit`.

## Critical Code Conventions (DO NOT VIOLATE)

1. **Type Safety**: Never use `any`. Always use explicit TypeScript interfaces/types defined within the project. Prefer type inference only when the type is obvious.
2. **Memory Leaks (Best Practice)**: For RxJS subscriptions, use Angular's native `takeUntilDestroyed()` operator (from `@angular/core/rxjs-interop`) instead of legacy decorators.
3. **Dependency Injection**: Prefer the `inject()` function over constructor injection for services (e.g., `private http = inject(HttpClient);`).
4. **Conditional Permissions**: Use `this.hasPermission()` (e.g., '20' for Create, '60' for Export) only when the specific Program (作業) requires permission control.
5. **Context-Aware Null Safety**: ERP API data can contain nulls. Use safe navigation (`?.`) and fallback default values strategically on crucial business fields (e.g., invoices, dates) to prevent UI crashes.

## Angular 18 Best Practices (Template & Style)

- **Native Control Flow**: MUST use modern control flow (`@if`, `@for`, `@switch`) instead of legacy `*ngIf`, `*ngFor`, `*ngSwitch`.
- **Forms**: Always prefer **Reactive Forms** (`FormGroup`, `FormControl`) instead of Template-driven ones.
- **Class/Style Bindings**: Do NOT use `ngClass` or `ngStyle`. Use native `[class.name]="condition"` and `[style.property]="value"` bindings instead.
- **Host Bindings**: Do NOT use `@HostBinding` or `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` decorator instead.
- **Signals**: Use Angular Signals (`signal()`, `computed()`) for local component state management where appropriate. Do NOT use `mutate` on signals; use `update` or `set`.

## Standard Query Page HTML Pattern (Use as Layout Reference)

```html
<div class="card">
  <div class="flex gap-2 mb-2">
    <app-menubar [ProgNo]="ProgNo" class="flex-1"></app-menubar>
    <app-button
      btnType="create"
      (click)="onCreateData(queryForm)"
      [disabled]="isClosed"
    />
  </div>
  <p-accordion>
    <p-accordionTab
      header="{{ 'query-conditions' | translate }}"
      [selected]="true"
      headerStyleClass="query-accordionTab"
    >
      <form [formGroup]="queryForm" (ngSubmit)="onSubmit(queryForm)">
        <div class="grid p-fluid"></div>
        <div
          class="grid justify-content-end gap-2 m-0 mt-2 border-top-1 surface-border pt-3"
        >
          <app-button btnType="clear" [form]="queryForm"></app-button>
          <app-button btnType="query" [loading]="loading"></app-button>
        </div>
      </form>
    </p-accordionTab>
  </p-accordion>
</div>
<div class="card">
  <app-table-report
    dataKey="Id"
    [lastQueryBody]="historyRequestBody"
    [data]="data"
    [columns]="columns"
    [totalRecords]="totalRecords"
    [queryFunction]="tableQueryFunction"
    [loading]="loading"
    (detail)="onDetailData($event)"
  ></app-table-report>
</div>
```

## AI Response Style

- Respond minimalistic. No long explanations or generic tutorials. Provide direct, copy-pasteable code diffs.

---

## 報表簽核欄位 (POS1032) — 共通 snippet

**說明**: 在報表特定位置顯示簽核欄 (總經理/部主管/單位主管/組長/填寫人 等)，資料來自 POS1032，由 `app-report-signature` 元件統一呈現。
**元件位置**: `src/app/shared/biz-components/report-signature/report-signature.component.ts`
**API**: `Sysbq00Service.getSignatureConfig(dataType)` → `POST /SYS0000/BAS1000/getSignatureConfig`

### 使用方式（在任意頁面 HTML 加入）
```typescript
// .component.ts — imports 陣列加入
import { ReportSignatureComponent } from '@shared/biz-components/report-signature/report-signature.component';

imports: [..., ReportSignatureComponent]
```

```html
<!-- .component.html — 放在要顯示簽核欄的位置，dataType 填入作業代碼 -->
<app-report-signature dataType="FIN15010" />
```

元件會自動呼叫 API 取資料，將 line1~line5 橫排顯示，空值的欄自動略去。
