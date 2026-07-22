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
  - **Allowed Shared Components**: Prioritize and ONLY use these 14 valid components in `src/app/shared/components/`:
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
  - **🚫 FORBIDDEN — do NOT use these in new code**: `expandable-edit-table`, `selector-panel`, and the plain `table` (`app-table`) component have been moved out of `shared/` to `src/app/others/component/` because they are NOT common/shared components (they were historically misplaced there). Do not import them for new pages. For tabular data use `table-edit` or `table-report` from `shared/components/`; for any other need, import PrimeNG's own modules directly (e.g. `primeng/table`) in your own component instead of relying on a shared wrapper.
- **Inheritance Pattern**:
  - Query/List pages MUST extend `BasicQueryPageComponent` (located in `src/app/shared/componentextends/basic-qpage/`).
  - Create/Read/Update pages MUST extend `BasicCruPageComponent` (located in `src/app/shared/componentextends/basic-crupage/`).
  - Call `this.initializePage()` in `ngOnInit`.

## Critical Code Conventions (DO NOT VIOLATE)

1. **Type Safety**: Never use `any`. Always use explicit TypeScript interfaces/types defined within the project. Prefer type inference only when the type is obvious.
2. **Memory Leaks (Best Practice)**: For RxJS subscriptions, use Angular's native `takeUntilDestroyed()` operator (from `@angular/core/rxjs-interop`) instead of legacy decorators.
3. **Dependency Injection**: Prefer the `inject()` function over constructor injection for services (e.g., `private http = inject(HttpClient);`).
4. **Conditional Permissions**: For `app-button`, use `[permissionCode]="Actions.X"` to auto-gate — do NOT hand-write `[disabled]="!hasPermission(...)"` on buttons (see 按鈕權限控制 snippet below). For non-button gating (table row actions, method-level checks, `*appHasPermission` directive), use `this.hasPermission()` directly. Apply only when the specific Program (作業) requires permission control.
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

---

## 共通下拉選單 (Dropdown) — 固定寫法，禁止在頁面內手刻 http.post

所有下拉一律走 `DropdownApiService`（`src/app/service/utility/dropdown-api.service.ts`），型別放 `dropdown-api.model.ts`。SYS1000 靜態代碼表用 `getSYS1000Options(sysType)`（`sys1000.service.ts`），不是 API 下拉。

**唯一標準寫法**（新增下拉、消費下拉都照抄這個模式，範例見 `tls52010.component.ts:168`）：

`.component.ts` — inject `DropdownApiService`，欄位直接指派 Observable，不 subscribe：

```typescript
private readonly dropdown = inject(DropdownApiService);
warehouseOptions = this.dropdown.queryPos2034(); // 倉別
brandOptions = this.dropdown.queryPluLogo();     // 品牌代碼
```

`.component.html` — 搭配 `| async`，`optionLabel`/`optionValue` 固定 `label`/`value`（imports 記得加 `AsyncPipe`）：

```html
<app-multi-select
  class="col-12 md:col-6 lg:col-3"
  label="倉庫代碼/名稱"
  controlName="HOS_No"
  [options]="warehouseOptions | async"
  optionLabel="label"
  optionValue="value"
  [control]="queryForm.controls.HOS_NoList"
  [submitted]="submitted"
/>
```

若該下拉還不存在：在 `dropdown-api.model.ts` 補 Item/Query interface，在 `dropdown-api.service.ts` 用 `queryAndMapDropdown`（回傳 `"No - Name"` label）或 `queryDropdown`/`queryDropdownWithParams`（原始陣列）新增一個 `query{XXX}()` 方法，接 `shareReplay({ bufferSize: 1, refCount: true })`。

**⚠️ `getSYS1000Options(sysType)` 呼叫時機地雷**：production 有開 `PreloadAllModules`（`main.ts`），lazy route 的 module 頂層常數會在 App 啟動後就提早被 evaluate，很可能早於登入完成、SYS1000 尚未寫入 `localStorage` 的時間點，導致拿到空陣列且永久定型（module 常數只算一次，不會重算）。

- 禁止在 module 頂層常數（如 `export const COLUMNS_XXX = [{ options: getSYS1000Options('X') }]`）或 class field 初始化式中直接呼叫 `getSYS1000Options()`。
- 一律包成 function 在 render 時才呼叫：`options: () => getSYS1000Options('X')`（`EditColumn.options` 支援 function 形式），或改用 reactive 版本 `getSYS1000Options$()`。

## 按鈕權限控制 (Permission Code) — 固定寫法，禁止手動寫 hasPermission 布林判斷式

**說明**: `create`/`edit`/`delete`/`query` 四種標準 `btnType` 已在 `button.component.ts` 的 `buttonConfig` 內建對應 `permissionCode`（'20'/'30'/'40'/'10'），會自動根據使用者權限算 disabled，不需額外處理。其餘功能性按鈕（審核、結算、配號、匯出、上傳等，`btnType="default"` 或自訂 label）**一律**透過 `app-button` 的 `[permissionCode]` Input 宣告對應的 `Actions` 代碼，交由元件自動判斷，禁止在 template 手動寫 `[disabled]="!hasPermission(Actions.X)"`。

**唯一標準寫法**：

```html
<!-- 正確 -->
<app-button
  label="配號"
  icon="pi pi-receipt"
  (click)="onAllocationOfNumber()"
  [permissionCode]="Actions.AllocateNumber"
/>

<!-- 禁止：手動布林判斷式，容易被漏加，也難以稽核 -->
<app-button
  label="配號"
  icon="pi pi-receipt"
  (click)="onAllocationOfNumber()"
  [disabled]="!hasPermission(Actions.AllocateNumber)"
/>
```

若 disabled 還需疊加業務狀態判斷（例如已結案不可操作），額外傳入 `[disabled]` 即可，元件內部會自動合併（權限判斷 OR 外部 disabled）：

```html
<app-button
  label="繳票"
  [permissionCode]="Actions.PayCheck"
  [disabled]="rowData.Status !== '0'"
/>
```

**既有程式碼**: 目前仍有大量頁面使用手動 `[disabled]="!hasPermission(...)"` 寫法，不需為此規則單獨開全庫重構；比照下拉選單稽核規則，**修改到該頁面時再順手改寫**即可。

## 維護時下拉選單稽核規則（修改既有作業時執行，非全庫掃描）

修改任一既有 `.component.ts` 前，若該檔案觸及下拉邏輯，依序檢查：

1. **舊版 service 淘汰**：若 import 來源是 `dropDownList.service.ts` 而非 `dropdown-api.service.ts`，
   先跟使用者確認是否要在本次一併改寫成 `DropdownApiService`（`DropdownApiService` 無對應方法時比照
   既有模式新增一個 `query{XXX}()`）。舊版目前仍有大量檔案在用，屬於中大型改動，不要在無關 bugfix
   裡順手夾帶。

2. **寫死選單比對 SYS1000**：若檔案內有寫死的下拉選項陣列，比對 `scripts/reference/sys1000.json`（`scripts/reference/`
   目錄純供比對用，不在 `src/assets` 內、不會被打包進正式產物）是否有 SYS_Type 的 SYS_Code/SYS_Name
   完全對應。對應到就改用 `getSYS1000Options('<SYS_Type>')`（module 頂層/欄位初始化式要包成 function，
   見上方地雷章節）或 reactive 版 `getSYS1000Options$()`。

   **限制**：`reference/sys1000.json` 是離線快照（透過 `npm run sync:sys1000` 重新產生，時間戳記在同目錄
   `sys1000.meta.json`），可能與正式環境資料表不同步，僅作「候選判斷」用；轉換後程式讀的是執行期
   localStorage 即時快取，正確性不受此檔案新舊影響。若比對時發現程式內選項比 json 多/少，或找不到
   預期 SYS_Type，先看 `sys1000.meta.json` 的 `snapshotDate` 判斷是否過舊，必要時提醒使用者執行
   `npm run sync:sys1000` 重新產生，不要自行臆測是新增代碼還是快照過舊。

3. 兩項檢查若判定要改，先跟使用者確認範圍再動手。

## Maintenance & Evolution Rules (CRITICAL)

- **Do NOT easily modify this file**: This file defines strict global project architecture and proven practices.
- **High Threshold for Common Snippets**: Only add code snippets or components to this file if they are **globally and heavily utilized across the entire system** (e.g., report signatures, global dropdown handlers). Never promote page-specific, historical, or localized code patterns as global standard rules.
- **Consult the Owner**: Any additions or behavioral updates to `CLAUDE.md` must be proposed and approved by the project owner first.

## Secure Coding Rules (Anti-Vulnerability Standards)

1. **No InnerHTML (XSS Prevention)**: Never use `innerHTML` or Angular's `bypassSecurityTrust...` methods. Always rely on standard Angular template data-binding to let the framework sanitize content.
2. **No Production Logs**: Remove or strip all `console.log/error` in production builds to prevent exposing ERP data structures or sensitive business logic in the browser console.
3. **No Dynamic SQL (SQLi Prevention)**: On the C# backend, all database queries must use parameterized commands or ORM. Never concatenate raw strings for SQL execution.
4. **Input & Path Validation**: Never trust user input. Validate all input lengths/types, and strictly sanitize file paths or names to prevent directory traversal vulnerabilities.
