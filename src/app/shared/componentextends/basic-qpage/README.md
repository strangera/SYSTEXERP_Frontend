# Angular 18 企業級前端開發架構規範 (適用於 TSRDERP)

本文件定義了專案中「查詢維護頁面 (Query Page)」的最高指導原則與代碼最佳實踐。未來的 AI 協作夥伴與開發人員在生成或重構代碼時，**必須 100% 嚴格遵守**本規範中所提及的命名、架構與技術棧框架。

---

## 🎯 核心技術棧與設計思維
* **Angular 版本**：v18+ 獨立組件 (Standalone Components) 生態。
* **狀態管理**：全面導入 **Angular Signals** (`signal()`) 管理 UI 變更偵測，捨棄傳統成員變數，以獲取極致的渲染效能。
* **響應式非同步**：善用 `AsyncPipe (| async)` 處理下拉數據流。非同步 HTTP 請求嚴格執行單次釋放處理。
* **組合式架構 (Composition)**：Page 層將查詢函數 (`query`) 作為策略對象直接注入共用表格元件，達成高度解耦。

---

## 🛠️ 開發規範與實作細節

### 1. 表單定義 (FormGroup)
* 必須使用 `this.formBuilder.nonNullable.group` 建立嚴格型態安全的表單。
* **禁止**從外部 utils 引入或 import 分頁排序配置方法。
* **必須**在表單內部直接一行宣告專案標準的分頁與排序欄位，格式如下：
  ```typescript
  readonly queryForm = this.formBuilder.nonNullable.group({
    // 業務查詢欄位
    CAT_MNo: ['', [Validators.maxLength(3), this.validationService.numberValidator]],
    CAT_MName: ['', [Validators.maxLength(32)]],
    CAT_LNo: [[] as string[]],
    // 專案標準分頁與初始排序 (直接於內部定義，禁止外部 import 方法)
    pageSize: [100],
    pageIndex: [1],
    SortBy: [[{ field: 'CAT_MNo', order: 1 }]], // 注意：欄位與預設排序欄位保持一致
  });

```

### 2. 下拉選單處理 (DropdownApiService)

* 所有標準下拉選單數據流**必須**直接呼叫 `inject(DropdownApiService)` 的公開方法取得。
* **必須**直接宣告為 `readonly` 屬性並加上 `$` 尾碼（代表 Observable），在 HTML 中一律搭配 `| async` 渲染。
* **實作範例**：
```typescript
// TS 層：乾淨的一行定義
readonly bigCategoryOptions$ = this.dropDown.queryPos2003();

```


```html
<app-multi-select [options]="bigCategoryOptions$ | async" ...></app-multi-select>

```



### 3. 策略查詢函數 (`query`) 封裝與傳遞

* 為了將查詢行為完美傳入 `<app-table-report>`，**必須**使用**箭頭函式 (Arrow Function)** 將 Service 的 Method 抽離成組件屬性。
* 箭頭函式天生綁定組件的 `this` 上下文，名稱統一命名為 `query`（不帶 `$` 符號，因為它是 Function 而非現成的 Observable）。
* **實作範例**：
```typescript
readonly query = (payload: QueryTLS51020Request) => this.tls51020Service.queryTLS51020(payload);

```


* 在 HTML 傳遞給共用元件時，型態需對齊 `ReportColumn`：
```html
<app-table-report ... [queryFunction]="query"></app-table-report>

```



### 4. 數據流訂閱管理 (Subscription & RxJS)

* 對於按鈕驅動的單次 HTTP 請求（如查詢、刪除、存檔），**必須**在 `pipe()` 鏈中使用 `take(1)` 代替過往的取消訂閱機制。
* **必須**搭配 `finalize()` 算子來確保不論 API 成功或失敗，皆能正確將 `this.loading = false` 狀態還原。
* 由於專案底層 `handleSubmit` 已全權在異常時拋出錯誤提示並處理 `blockUi()`，在組件層的 `.subscribe()` **只需專注處理成功狀況**。
* **標準查詢範例**：
```typescript
onSubmit(frm: FormGroup): void {
  this.handleSubmit(frm, () => {
    this.loading = true;
    const formValue = frm.getRawValue() as QueryTLS51020Request;

    this.query(formValue)
      .pipe(
        take(1),
        finalize(() => this.loading = false)
      )
      .subscribe((response) => {
        this.data.set(response.Data || []);
        this.totalRecords.set(response.TotalCount || 0);
        this.lastQueryBody.set(formValue);
        this.queryStateService.setQueryState(this.ProgNo, formValue);
      });
  });
}

```



### 5. UI 狀態全面 Signal 化

* 組件內部的異動狀態變數，一律改用 Angular 16+ 的 `signal` 宣告。
* TS 更新值時使用 `.set()`，HTML 讀取值時必須加上**括號 `()**` 求值。
```typescript
readonly data = signal<QueryTLS51020Response[]>([]);
readonly selectedItems = signal<QueryTLS51020Response[]>([]);
readonly totalRecords = signal(0);
readonly lastQueryBody = signal<QueryTLS51020Request | null>(null);

```



---

## 📐 經典範本程式碼 (正典)

未來的 AI 請以此結構為黃金標準（Gold Standard）來建構全新的作業：

### 【Component TS 範本】

```typescript
import { AsyncPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { Column } from '@shared/componentkit/table/table.model';
import { ValidationService } from '@shared/service/validation.service';
import { AccordionModule } from 'primeng/accordion';
import { finalize, take } from 'rxjs';
import { QueryXxxRequest, QueryXxxResponse, TlsXxxService } from 'src/app/service/api/tls/tlsXxx.service';
import { DropdownApiService } from 'src/app/service/utility/dropdown-api.service';
import { TableReportComponent } from 'src/app/shared/componentkit/table-report/table-report.component';

@Component({
  selector: 'app-tls-xxx',
  templateUrl: './tls-xxx.component.html',
  standalone: true,
  imports: [
    MenubarComponent, ButtonComponent, AccordionModule, FormsModule, 
    ReactiveFormsModule, InputTextComponent, MultiSelectComponent, 
    TableReportComponent, TranslateModule, AsyncPipe
  ]
})
export class TLSXxxComponent extends BasicQueryPageComponent<QueryXxxResponse> implements OnInit {
  private readonly validationService = inject(ValidationService);
  private readonly dropDown = inject(DropdownApiService);
  private readonly tlsXxxService = inject(TlsXxxService);

  readonly queryForm = this.formBuilder.nonNullable.group({
    FOO_No: ['', [Validators.maxLength(3), this.validationService.numberValidator]],
    pageSize: [100],
    pageIndex: [1],
    SortBy: [[{ field: 'FOO_No', order: 1 }]],
  });

  readonly query = (payload: QueryXxxRequest) => this.tlsXxxService.queryXxx(payload);

  readonly data = signal<QueryXxxResponse[]>([]);
  readonly selectedItems = signal<QueryXxxResponse[]>([]);
  readonly totalRecords = signal(0);
  readonly lastQueryBody = signal<QueryXxxRequest | null>(null);

  readonly columns: ReportColumn[] = [
    { field: 'FOO_No', header: '程式代碼', visible: true }
  ];

  readonly bigCategoryOptions$ = this.dropDown.queryPos2003();

  ngOnInit(): void {
    this.initializePage('TLSXXXXX', '/TLS/TLSXXXXXcru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      this.loading = true;
      const formValue = frm.getRawValue() as QueryXxxRequest;
      this.query(formValue)
        .pipe(take(1), finalize(() => this.loading = false))
        .subscribe((response) => {
          this.data.set(response.Data || []);
          this.totalRecords.set(response.TotalCount || 0);
          this.lastQueryBody.set(formValue);
          this.queryStateService.setQueryState(this.ProgNo, formValue);
        });
    });
  }
}
```
