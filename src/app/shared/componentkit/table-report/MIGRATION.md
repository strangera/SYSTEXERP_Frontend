# app-table → app-table-report 轉換指南

適用於：把既有頁面裡的 `app-table` 換成 `app-table-report`。

這份文件說明 `table-report` **實際的運作機制**，不是「情境 A/情境 B 兩種寫法」——它只有一套引擎（無限滾動 + `queryFunction`），`showCheckBox`／`showManage`／`groupRowsBy` 等只是這套引擎上的功能開關，依頁面需求開關即可，不是要挑一種模式抄。

## 1. 核心機制：資料怎麼進來、怎麼往下捲

- **必填**：`data`、`columns`（`ReportColumn[]`，見 `table-report.model.ts`）、`totalRecords`。
- **分頁/排序引擎**：不是傳統 paginator，是 **virtual scroll 無限捲動**。捲到底時 `onScroll()` 觸發 `loadMoreData()`，用 `lastQueryBody` 算出下一頁的 `pageIndex`，呼叫 `queryFunction(body)`，回來的資料 **append** 到 `data` 後面。
- `lastQueryBody` / `queryFunction` 都是 **optional**。兩者都不給時，`table-report` 就是純前端陣列表格，資料一次给完，排序靠 `customSort` 前端排，不會發 API。
- `lastQueryBody` 的 pageSize/pageIndex/SortBy 命名沿用 `createPaginationConfig()`（`table.model.ts`），跟 `app-table` 共用同一套分頁參數格式，這塊不用改。
- 排序（點欄位標頭）一樣是呼叫 `queryFunction`，把 `pageIndex` 重設為 1 重新查一次；不是本地排序（除非有效 lazy 為 `false`）。
- `lazy` 有效值是 `effectiveLazy = lazy && !!queryFunction`（見 component 內 getter），**不用手動關 `[lazy]="false"`**：沒接 `queryFunction` 時會自動視為前端排序/分頁模式，接了 `queryFunction` 才會走後端排序/無限捲動。

## 2. 跟 app-table 的關鍵差異（轉換時最容易漏改的地方）

| app-table 用法 | table-report 對應 | 說明 |
|---|---|---|
| `(lazyLoadData)="onLazyLoadData($event, form)"` | **不存在**，改用 `[lastQueryBody]` + `[queryFunction]` | 不用再手動接 `LazyLoadEvent`，`table-report` 自己管分頁參數 |
| `[multiSortMeta]="[...]"`（可綁 Input） | **只有 getter，不能綁 Input** | 初始排序改成把預設值放進 `lastQueryBody.SortBy`（`createPaginationConfig(defaultSortBy)` 的參數） |
| `[showHeader]="false"` | **不存在** | 用 `[showCaption]="false"` 關閉上方工具列；欄位標頭列一定會顯示（沒有整體隱藏開關） |
| `Column`（`table.model.ts`） | `ReportColumn`（`table-report.model.ts`） | 欄位形狀幾乎相同，多了 `exportFormat`/`reportType`/`isSubTotal` 等報表專用欄位 |
| `[lazy]="true"` 手動指定 | 預設就是 `true`，且沒接 `queryFunction` 時會自動視為 `false` | 完全不用寫這個 input |

## 3. Inputs 分類總覽（依用途分組，不是「選一組」）

**選取（多選/checkbox）**
`showCheckBox`、`selectedItems`（雙向，配 `(selectionChange)`）、`isRowSelectable`、`tableHeaderCheckboxLabel`
→ 選取邏輯全部在 `TableReportSelectionService`：全選只選「當前已載入且 `isRowSelectable` 為真」的資料；`isAllSelected` 用快取筆數比對，捲動載入更多資料時 (`onLazyLoad`) 若之前是全選狀態會自動把新資料也選上。

**CRUD 列按鈕（右側管理欄）**
`showManage`、`showEdit`/`edit`、`showDetail`/`detail`、`showDelete`/`delete`、`showInsert`/`insert`、`addButton`（自訂按鈕陣列）
→ 這些按鈕會自動用 `hasPermission('10'/'20'/'30'/'40')` 檔權限（對應查/增/改/刪），不用手動包 `*ngIf`。

**工具列 / 報表模式（Caption）**
`showCaption`（整條工具列開關）、`showFilter`（欄位篩選 multi-select）、`showReportMode`（報表模式切換鈕，會影響底下增刪按鈕是否顯示）、`showExcel`/`showExcelExport`/`showExcelImport`（Excel 匯出/匯入）
→ 這些都在 `TableReportCaptionComponent`，`showReportMode=true` 時預設是「報表檢視」（IsPrint），要按一次切換鈕才會顯示增刪按鈕；`Dialog` 選擇器場景通常整組關掉（`showCaption=false`）。

**小計/分組**
`groupRowsBy`、欄位上標 `isSubTotal: true`、`subTotalData`（後端算好的小計，優先用；沒給才前端累加）、`subTotalLabel`
→ 邏輯在 `TableReportSubtotalService`，前端累加是「增量」計算（每次 append 新資料才加總，不會整批重算）。

**展開列**
`expansionColumns`、`expansionDataKey`、`expansionLoadFn`（子列資料的載入函式，沒給就直接讀 `rowData[expansionDataKey]`）

**其他**
`groupField`（欄位分組表頭，`columnGroup` 那種雙層表頭）、`customTemplates`（依 `col.field` 客製 cell 內容）、`footerData`/`footerLabelField`（頁尾合計列）、`emptyMessage`。

## 4. 轉換 Checklist

1. Import 換成 `TableReportComponent`（`@shared/componentkit/table-report/table-report.component`），型別用 `ReportColumn`。
2. 原本 `(lazyLoadData)` 那行整條刪掉，改成組一個 `queryFunction`（通常就是原本 API service 的呼叫方法本身，签名 `(body) => Observable<...>`）+ 一個 `xxxLastQueryBody` 欄位，在原本觸發查詢（`onQuery`/表單送出）的地方順手把 `this.xxxLastQueryBody = body` 存起來。
3. 原本 `[multiSortMeta]="[{field, order}]"` 的預設排序，搬進 `createPaginationConfig([{field, order}])` 或直接在初始 `lastQueryBody.SortBy` 塞值。
4. 原本 `[showHeader]="false"`（隱藏整個表格工具列）→ 改用 `[showCaption]="false"`；如果原本用途只是想關掉篩選/匯出，改用對應的 `showFilter`/`showExcel` 更精準。
5. 檢查 `data.length >= 30` 才會啟用 virtual scroll（見 component 內 `dt.virtualScroll` 判斷），資料筆數少的小表格不受影響，正常顯示。
6. 跑一次 `tsc --noEmit`，確認沒有殘留引用 `app-table`/`Column`/`onLazyLoadData` 未刪乾淨。

## 5. 已知限制

- `multiSortMeta` 沒有 setter，模板上寫 `[multiSortMeta]="..."` 會編譯失敗（unknown property），只能透過 `lastQueryBody.SortBy` 間接控制初始排序。
- `queryFunction` 沒給時，`effectiveLazy` 會自動變 `false`，`onSort()` 會走前端排序分支；不需要也不建議再手動加 `[lazy]="false"`。
- 報表模式 (`showReportMode=true`) 預設先顯示「報表檢視」，增刪按鈕要點一次切換鈕才會出現；如果頁面需要「進來就能編輯」，記得把 `showReportMode` 關掉，否則使用者會找不到新增/刪除按鈕。

## 參考範例

- 一般查詢頁列表（CRUD + 分頁）：`TLS50000/tls51070` 系列頁面，或 `CLAUDE.md` 裡的 Standard Query Page Pattern。
- Dialog 選擇器（多選 + 無限捲動）：`tls2d010-cru`、`tls52050-cru`（`dialogColumns`/`queryDialogDetail` 那段）。
- 這兩個都是**同一套機制**，只是開關組合不同，不是兩種不同引擎。
