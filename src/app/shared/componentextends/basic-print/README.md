# 📊 共通 PDF / Excel 匯出元件使用與設定指南

本專案的報表匯出功能已全面升級為「動態雙模式引擎」**。不論是傳統的**扁平包裹報表，還是視覺層次豐富的**主從明細（Master-Detail）展開報表**，皆可透過繼承 `BasicPrintDataComponent` 來快速實現。

為了維持前端畫面的純淨，**細項欄位的配置全面與主表欄位分離**，絕對不會影響到網頁畫面的過濾清單（MultiSelect）。

---

## 💡 核心方法參數對照表

在調用 `exportPDFDownload` 或 `exportExcelDownload` 時，請參考以下核心參數設定：

| 參數名稱           | 型態          | 說明                                                                                                       |
| ------------------ | ------------- | ---------------------------------------------------------------------------------------------------------- |
| `event`            | `TableExport` | 傳入 PrimeNG Table 匯出的 Config 事件物件。                                                                |
| `columns`          | `Column[]`    | **目前畫面上可見的主表欄位清單**（通常是過濾勾選後的結果）。                                               |
| `apiUrl`           | `string`      | 可選。指定後端 Service 的 API 名稱（例如：`'queryTLS2G020'`）。若不傳，預設抓目前 ProgNo。                 |
| `DataKeyName`      | `string`      | 可選。**關鍵定位鍵**。用來指定後端提取資料或對應明細集合的屬性名稱（例如：`'TLTNoEdit'` 或 `'Mdeatil'`）。 |
| `expansionColumns` | `Column[]`    | 可選。**細項展開欄位定義**。只有在「情境二：主從明細報表」時才需要傳入。                                   |

---

## 🛠️ 開發情境設定指南

### 🔹 情境一：一般扁平報表 / 巢狀包裹報表（無展開）

**適合頁面：** 像「交易資料修正報表 (`TLS24020`)」這類點進分頁後，資料本身雖然在後端包裹於某個 Key（如 `TLTNoEdit`）內，但印出來的格式是**一筆一筆普通的單層表格**。

#### 📌 前端設定要點：

1. `columns` 傳入主表欄位。
2. `DataKeyName` 帶入後端包裹資料的 Key 值（如 `'TLTNoEdit'`）。
3. **`expansionColumns` 務必傳 `null` 或不傳。**

```typescript
// 範例：呼叫 Excel / PDF 下載
this.exportExcelDownload(
  event,
  this.selectedColumns, // 主表可見欄位
  "queryTLS24020", // 後端 API
  "TLTNoEdit", // 💡 告訴後端：請直接把這個 Key 裡面的清單當作主表印出來
);
```

---

### 🔹 情境二：主從巢狀報表（Row Expansion 展開明細）

**適合頁面：** 像「專櫃預估業績維護作業 (`TLS2G020`)」這類點開 `+` 號會原地展開子明細表格的頁面。

#### 📌 前端設定要點：

1. `columns` **只留網頁畫面的主表欄位**。
2. `DataKeyName` 帶入每筆 Row 物件內代表細項集合的屬性名稱（如 `'Mdeatil'`）。
3. 傳入獨立的 `expansionColumns` 清單。**不可將其塞入 `columns` 陣列中，否則會導致網頁畫面的欄位勾選過濾器穿幫！**

```typescript
// 1. 定義你的明細欄位 (通常寫在頁面的 config 中)
const expansionColumns: Column[] = [
  { field: "Month", header: "月", align: "center" },
  { field: "budget", header: "月預算", align: "right" },
  { field: "avg_cag_charge_rate", header: "平均抽成", align: "right" },
];

// 2. 執行匯出
this.exportPDFDownload(
  event,
  this.selectedColumns, // 主表 7 欄配置 (畫面上看的到的)
  "queryTLS2G020", // 後端 API
  "Mdeatil", // 💡 告訴後端：每筆資料底下的這個欄位是子集合
  false, // PrintRemark
  this.conditions, // 查詢條件
  null, // PrintColumn
  null, // footerData
  "專櫃預估業績維護作業", // 報表大標題
  expansionColumns, // 💡 關鍵：單獨抽離傳入的明細欄位定義
);
```

---

## 🎨 欄位樣式與對齊微調設定

我們可以在 `Column` 的配置中透過 `align` 屬性輕鬆控制報表內的文字對齊。

### 1. 主表欄位對齊

預設為 **靠左 (`left`)**。你可以在主表欄位定義時指定 `align: 'right'` 或 `align: 'center'`，後端 Excel / PDF 的欄位與總計列就會自動同步對齊。

### 2. 明細展開欄位對齊（核心優化）

明細區塊的對齊與主表獨立，且已設定「預設置中」機制：

- 如果明細的 Column **不設定 `align**` $\rightarrow$ 在 Excel 與 PDF 中會**自動居中對齊**，畫面更精緻。
- 如果明細欄位是數值（如金額、百分比），請手動設定 `align: 'right'`，它就會乖乖靠右。

```typescript
// 明細欄位對齊範例
const expansionColumns: Column[] = [
  { field: "Month", header: "月份" }, // 💡 未設定，導出時自動置中
  { field: "budget", header: "預算", align: "right" }, // 💡 設定右對齊，數值美觀
];
```

---

## 📝 團隊開發小叮嚀 (FAQ)

> ❓ **為什麼我導出的明細報表，子表格沒有顯示出來？**

**A:** 請檢查傳給 `export` 方法的最後一個參數 `expansionColumns` 是不是忘記傳了。如果沒傳，後端會判定為「情境一（扁平模式）」，就不會畫出子表格。
