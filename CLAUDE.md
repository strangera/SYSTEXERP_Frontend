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

## Standard Query Page Pattern (Use as Layout Reference)

Query 頁面 extends `BasicQueryPageComponent<T>`；`ngOnInit()` 呼叫 `initializePage(progNo, cruPage, queryForm, onSubmit)`，`cruPage` 是導去維護頁的路由片段（例如 `'TLS/TLS52010cru'`），讓使用者從維護頁「返回」查詢頁時能自動還原上次查詢條件。

**TS 骨架**：

```typescript
import { DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export class {代碼}Component extends BasicQueryPageComponent<{代碼}Data> implements OnInit {
  private readonly service = inject({代碼}Service);
  private readonly destroyRef = inject(DestroyRef);

  queryForm = this.formBuilder.group({
    someField: [null as string | null, [Validators.maxLength(20)]],
    pageSize: [1000],
    pageIndex: [1],
    SortBy: [[{ field: 'SomeField', order: -1 }]],
  });

  totalRecords = 0;
  data: {代碼}Data[] = [];
  lastQueryBody: I{代碼}Request | null = null; // 給 app-table-report 內部分頁/排序直接呼叫 queryFunction 用，欄位名稱固定叫這個

  columns: ReportColumn[] = [
    { field: 'SomeField', header: '欄位名稱', visible: true },
  ];

  ngOnInit(): void {
    this.initializePage('{代碼}', '{模組}/{代碼小寫}cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      this.service.query{代碼}(frm.value).pipe(
        this.withLoading(),                 // 基底提供的收尾 operator：關 loading + unblockUi，不要自己手刻 finalize
        takeUntilDestroyed(this.destroyRef),
      ).subscribe(res => {
        this.data = res.Data;
        this.totalRecords = res.TotalCount;
        this.lastQueryBody = frm.value;
        this.queryStateService.setQueryState(this.ProgNo, frm.value); // 讓「返回」查詢頁時能還原這次查詢條件
      });
    });
  }

  onCreateData(frm: FormGroup): void {
    this.onCreate(frm.value); // 導去 CRU 頁新增，權限檢查已包在 BasicQueryPageComponent.onCreate() 裡
  }

  onDetailData(row: {代碼}Data): void {
    this.onDetail(row, this.queryForm.value); // 導去 CRU 頁明細
  }
}
```

**HTML 骨架**：

```html
<div class="card">
  <div class="flex gap-2 mb-2">
    <app-menubar [ProgNo]="ProgNo" class="flex-1"></app-menubar>
    <app-button btnType="create" (click)="onCreateData(queryForm)" />
  </div>
  <p-accordion>
    <p-accordionTab
      header="{{ 'query-conditions' | translate }}"
      [selected]="true"
      headerStyleClass="query-accordionTab"
    >
      <form [formGroup]="queryForm" (ngSubmit)="onSubmit(queryForm)">
        <div class="grid p-fluid"><!-- 查詢欄位依此重複，範例見上方共通下拉/共通元件章節 --></div>
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
    [data]="data"
    [columns]="columns"
    [totalRecords]="totalRecords"
    [loading]="loading"
    [lastQueryBody]="lastQueryBody"
    [queryFunction]="service.query{代碼}.bind(service)"
    (detail)="onDetailData($event)"
  ></app-table-report>
</div>
```

**要點**：
- 不寫 constructor：依賴一律用 `inject()` 當 class field（跟維護頁一致）。
- 送出固定走 `handleSubmit(frm, callback)`，callback 裡才真正打 API。
- API 呼叫接基底的 `this.withLoading()`（內建關 `loading` + `unblockUi`）再接 `takeUntilDestroyed(this.destroyRef)`，不要手刻 `finalize(() => this.loading = false)` 或用舊版 `untilDestroyed(this)` decorator。
- 查詢成功記得呼叫 `this.queryStateService.setQueryState(this.ProgNo, frm.value)`——使用者從 CRU 頁「返回」查詢頁時，`initializePage()` 才能自動還原上次查詢條件，漏掉這行「返回」功能就會失效。
- **`[queryFunction]` 務必綁定 `service.query{代碼}.bind(service)`（或等效的 bound function），不要包一層頁面自己的方法再轉呼叫**——`app-table-report` 內部分頁/排序/捲動載入（`loadMoreData()`/`onSort()`）會直接呼叫這個 function 打 API，完全不經過頁面的 `onSubmit()`。`[lastQueryBody]` 綁的欄位名稱必須跟 TS 裡存查詢條件的欄位一致（固定叫 `lastQueryBody`，不要自創別的名字，`app-table-report` 內部也是讀這個變數名的語意在用，改名字不會壞但會跟其他頁面不一致）。
- 新增/明細/編輯導頁一律呼叫基底的 `onCreate()`/`onDetail()`/`onEdit()`（內部已包裝權限檢查 + `navigateWithState()`），不要自己手刻 `router.navigate`。

**⚠️ 現成頁面範例的落差**：作為下拉選單共通寫法範例引用的 `tls52010.component.ts`（查詢頁本體，非 CRU 那支）本身，建構子仍是舊式參數注入（不是 `inject()`）、subscribe 仍用舊版 `untilDestroyed(this)`、也沒有用基底類別 `BasicQueryPageComponent` 自己文件裡建議的 `this.withLoading()`，改用手刻 `finalize()`——這些都是既有技術負債，**新查詢頁不要照抄這部分**，表單欄位/`columns`/`addButton` 結構仍可參考。

## Standard Maintenance (CRU) Page Pattern (Use as Layout Reference)

Query 頁面 extends `BasicQueryPageComponent`；**新增/修改/明細（維護）頁面一律 extends `BasicCruPageComponent<T>`**（`src/app/shared/componentextends/basic-crupage/`）。`crudstatus`（Create/Edit/Read）由 `initializePage()` 依路由 state 自動判斷，不用自己讀 query param。

**TS 骨架**（單純表單版；有主檔+明細表格的版本見下方「明細表格」段落）：

```typescript
import { DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export class {代碼}CRUComponent extends BasicCruPageComponent<{代碼}Data> implements OnInit {
  private readonly service = inject({代碼}Service);
  private readonly destroyRef = inject(DestroyRef); // 給下面每個 subscribe 的 takeUntilDestroyed() 用

  // 欄位是否留 null 依業務語意決定（下拉/日期「未選」是合法狀態的話就留 null），
  // 不用為了少打幾個 `as X | null` 硬套 formBuilder.nonNullable。
  dataForm = this.formBuilder.group({
    someNo: [{ value: '系統自動產生', disabled: true }],       // 單號類：系統編碼，disabled
    someRequiredField: [null as string | null, [Validators.required]],
    someRemark: ['', [Validators.maxLength(200)]],
  });

  // 不寫 constructor：BasicCruPageComponent 本身沒有自訂建構子，所有依賴都用上面的
  // inject() 當 class field 取得即可，不需要 constructor() { super(); } 這種舊寫法殘留。

  ngOnInit(): void {
    // 清單頁傳回的列資料欄位命名常跟本頁表單不同，不要傳 dataForm 給 initializePage 自動 patch，
    // 一律自己依 id 呼叫 getById 拿完整資料後手動 patchValue（見 fin23010-cru 範例）。
    this.initializePage('{代碼}');
    // 用 crudstatus 判斷「新增 vs 編輯/明細」，不要用 isFormCreateable —— 那個 getter
    // 疊加了權限判斷（crudstatus === Create && canAdd()），拿來判斷「要不要載入既有資料」
    // 遇到使用者剛好沒新增權限的情況會誤判，跟本來要問的「這筆是不是新資料」是兩件事。
    if (this.crudstatus !== CRUDStatus.Create) this.loadDetail();
  }

  private loadDetail(): void {
    const id = this.rowdata?.id;
    if (!id) { this.messageService.warnBubble('缺少識別碼，無法載入資料。'); return; }
    this.loading = true;
    this.service.getById{代碼}(id).pipe(
      this.withLoading(),                 // 基底提供的收尾 operator：關 loading + unblockUi，不要自己手刻 finalize
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(res => {
      // 不用寫 error callback：400 以上一律由全局 errorInterceptor 統一跳錯誤提示
      // （見下方「全局 HTTP 錯誤處理機制」章節），自己再寫一次只會讓使用者看到兩則錯誤訊息。
      const d = res.Data;
      if (!d) { this.messageService.warnBubble('查無此筆資料。'); return; }
      this.dataForm.patchValue({ someRequiredField: d.SomeField, someRemark: d.Remark });
      // 唯讀模式，或業務上已不可編輯（已核准/已作廢等）一併鎖表單
      if (this.crudstatus === CRUDStatus.Read || !d.CanEdit) this.dataForm.disable();
    });
  }

  onSubmit(frm: FormGroup): void {
    // 存檔邏輯直接寫在 callback 裡，不用另外拆一個 doSave()——handleSubmit 本身
    // 就是唯一呼叫點，多一層函式沒有降低複雜度，只是多一次跳轉。
    this.handleSubmit(frm, () => {
      const v = this.dataForm.getRawValue();
      const isCreate = this.crudstatus === CRUDStatus.Create; // 同上，用 crudstatus 不用 isFormCreateable
      const payload = {
        ActionMode: (isCreate ? 'I' : 'U') as 'I' | 'U',
        id: isCreate ? null : this.rowdata?.id,
        SomeField: v.someRequiredField,
        Remark: v.someRemark || null,
      };
      this.service.save{代碼}(payload).pipe(
        this.withLoading(),                 // 基底提供的收尾 operator：關 loading + unblockUi，不要自己手刻 finalize
        takeUntilDestroyed(this.destroyRef),
      ).subscribe(res => {
        if (!res.Data?.Success) { this.messageService.errorBubble(res.Data?.Message || '儲存失敗'); return; }
        this.messageService.successBubble(res.Data.Message || '儲存成功');
        this.onCancel(); // 固定導回查詢頁，不要自己組路由字串
      });
    });
  }
}
```

**⚠️ 現成頁面範例的落差**：`fin23010-cru`/`ass12030-cru`/`tls52010-cru` 這三支被拿來當參考的既有頁面，實際上用的是舊版 `untilDestroyed(this)` decorator 取消訂閱寫法，跟本檔案「Critical Code Conventions」第 2 條訂的 `takeUntilDestroyed()` 不一致——那是既有程式碼的技術負債，**新頁面一律照上面骨架用 `takeUntilDestroyed(this.destroyRef)`，不要照抄舊範例的取消訂閱寫法**（表單結構/API 呼叫方式仍可參考那三支)。

**HTML 骨架**：

```html
<div class="card">
  <div class="flex gap-2 mb-2">
    <app-menubar [ProgNo]="ProgNo" class="flex-1"></app-menubar>
    <app-button btnType="back" (click)="onCancel()"></app-button>
  </div>
  <p-panel [header]="formTitle | translate" class="line-height-3 m-0">
    <form [formGroup]="dataForm" id="dataForm" (ngSubmit)="onSubmit(dataForm)">
      <div class="grid p-fluid">
        <div class="col-12 md:col-6 lg:col-4">
          <app-input-text
            label="欄位名稱"
            controlName="someRequiredField"
            [control]="dataForm.controls.someRequiredField"
            [submitted]="submitted"
          ></app-input-text>
        </div>
        <!-- 其餘欄位依此重複；下拉一律走 DropdownApiService（見上方共通下拉章節），
             不要在頁面手刻 http.post -->
      </div>
      @if (!isFormReadable) {
        <div class="grid justify-content-end gap-2 m-0 mt-2 border-top-1 surface-border pt-3">
          <app-button btnType="cancel" [form]="dataForm"></app-button>
          <app-button btnType="submit" [loading]="loading"></app-button>
        </div>
      }
    </form>
  </p-panel>
</div>
```

**要點**：
- `isFormReadable` 為 true 時整個 `dataForm.disable()`；`isFormCreateable`/`isFormEditable` 用來控制欄位是否可編輯或按鈕是否顯示，不要自己另外宣告布林旗標判斷 CRU 狀態。
- 送出固定走 `handleSubmit(frm, callback)`，不要自己手刻 `loading`/`submitted` 賦值。
- API 呼叫（`loadDetail`/存檔）一律接基底的 `this.withLoading()`（內建關 `loading` + `unblockUi`）再接 `takeUntilDestroyed(this.destroyRef)`，不要手刻 `finalize(() => this.loading = false)`——跟 Query 頁面同一套標準，`BasicCruPageComponent` 自己也有這個 `withLoading()`。
- 儲存成功一律呼叫 `this.onCancel()` 導回查詢頁。
- **主檔+明細表格版**（例如審核類、單據類作業常見）：明細用 `app-table-edit`（`EditColumn[]` 定義欄位），儲存時額外把明細陣列組進 payload 的 `Details` 欄位一起送出。完整範例見 `src/app/pages/tls/TLS50000/tls52010/tls52010-cru/tls52010-cru.component.ts`（含雙向連動下拉＋商品挑選 dialog）與 `src/app/pages/ass/ass12030-cru/ass12030-cru.component.ts`（含套用清單 dialog）。
- 表單欄位命名兩種都可接受：直接對應 DB 欄位（如 `ass12030-cru`）或用 camelCase 業務名稱在組 `payload` 時轉換（如 `fin23010-cru`）——跟該模組其他既有頁面保持一致即可，不要自創第三種風格。

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

## 全局 HTTP 錯誤處理機制 — subscribe 通常不需要自己寫 error callback

**說明**：`core/interceptors/error.interceptor.ts`(`errorInterceptor`) 已攔截**所有**非 2xx 的 HTTP 回應，交給
`core/services/error-handler.service.ts`(`ErrorHandlerService.handleError`) 統一處理：跳出通用 `errorBubble`
錯誤提示(含後端 `Message`)、記錄到 sessionStorage、回報後端錯誤監控，最後把原始 `HttpErrorResponse` `throwError`
重新拋出。

**這代表兩件事**：

1. 一般頁面在 `.subscribe({ next: ... })` **不需要**額外寫 `error:` callback 只為了「跳錯誤訊息」——攔截器已經跳過了，
   自己再寫一次會變成使用者看到兩則錯誤訊息，或是做重複勞動。只有需要**針對特定狀態碼做客製化行為**(例如 409 衝突要
   跳確認框、或要從 `err.error` 撈特殊欄位做非「純顯示訊息」的 UI 行為)時才需要在 component 補 `error:` callback。
2. **地雷**：如果某支 API 在「業務邏輯驗證失敗」(不是系統例外/請求格式錯誤，而是「有具體明細要給前端客製化顯示」的情境，
   例如匯入資料檢核失敗要附上錯誤明細/錯誤檔路徑供下載) 時，後端 Controller 回傳 **400/500**，Angular `HttpClient`
   會直接走 `error` 分支，`next` 完全收不到那包 body——就算 body 裡確實帶了 `Errors`/`ErrorFilePath` 等客製化欄位，
   前端也沒機會用上，只會看到全局攔截器跳出的通用文字提示。這種「需要 body 內容做客製化 UI」的情境，後端必須改回
   **200**，靠 body 內的 `Status`/自訂欄位讓前端在 `next` 分支判斷成功/失敗(參考寫法見 `TLS2G010Controller.ImportTLS2G010`
   與 `FIN41010Controller.importYearBudgetFIN41010`：只有請求格式錯誤如檔案為空才用 400，業務驗證失敗一律 200)。
   400/500 應保留給「真的沒有客製化 body 需求、丟給全局攔截器處理就夠」的系統例外。

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
