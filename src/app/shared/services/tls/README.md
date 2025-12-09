# TLS 合約表單共用服務

這個目錄包含 TLS13010 (專櫃合約) 和 TLS12040 (專櫃要約書) 的共用邏輯。

## 檔案說明

### 1. `tls-form-defaults.constants.ts`
集中管理所有預設值常數，避免在兩個模組重複定義。

**預設值層級：**
- `TLS_COMMON_FORM_DEFAULTS` - 兩個模組共用的預設值
- `TLS13010_SPECIFIC_DEFAULTS` - TLS13010 特有的預設值（會覆蓋共用預設值）
- `TLS12040_SPECIFIC_DEFAULTS` - TLS12040 特有的預設值（會覆蓋共用預設值）
- `TLS_CREATE_MODE_DEFAULTS` - 新增模式的預設值
- `TLS_CONDITIONAL_DEFAULTS_BY_TERM_TYPE` - 根據抽成別自動調整的預設值

**主要差異：**
| 欄位 | TLS13010 預設值 | TLS12040 預設值 |
|------|----------------|----------------|
| `cash_yn` | `'Y'` | `'N'` |
| `total_amt` | `''` (空字串) | `0` (數字) |
| `total_amt_vendor` | `''` (空字串) | `0` (數字) |
| `credit_card` | `''` (空字串) | `0` (數字) |
| `cap_saletype1~5` | `''` (空字串) | `'N'` |

**TLS12040 額外欄位：**
- `apply_type` - 申請案件內容
- `apply_date` - 申請日期
- `apply_status` - 申請案件狀態
- `contract_type` - 申請案件型態

### 2. `tls-contract-base.service.ts`
提供共用的表單初始化和驗證邏輯。

**主要方法：**

#### 初始化相關
- `initializeFormByMode()` - 根據模式（新增/編輯/檢視）初始化表單
- `initializeEmptyForm()` - 初始化空白表單（新增模式）
- `setCurrentUserAsNegotiator()` - 設定當前使用者為洽談者

#### 監聽器相關
- `setupTermTypeListener()` - 設定抽成別變更監聽
- `setupContractDateSync()` - 設定契約日期與營運日期的同步監聽
- `updateDefaultsByTermType()` - 根據抽成別更新相關欄位

#### 實用方法
- `resetToDefaults()` - 重置表單為預設值（可保留特定欄位）
- `getFieldDefault()` - 取得單一欄位的預設值
- `isUsingDefaults()` - 檢查表單是否使用預設值
- `validateDateRange()` - 日期區間驗證
- `getFieldDisplayName()` - 取得欄位的顯示名稱（用於錯誤訊息）

## 使用方式

### 在 Component 中使用

```typescript
import { TlsContractBaseService } from '@shared/services/tls/tls-contract-base.service';

export class TLS13010CRUComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];

  constructor(
    private tlsBaseService: TlsContractBaseService,
    // ... 其他服務
  ) { }

  ngOnInit() {
    // 1. 初始化表單
    const existingData = this.flowService.getCruData();
    this.tlsBaseService.initializeFormByMode(
      this.dataForm,
      'TLS13010', // 或 'TLS12040'
      this.crudstatus,
      existingData
    );

    // 2. 設定當前使用者為洽談者（僅新增模式）
    if (this.crudstatus === CRUDStatus.Create) {
      this.tlsBaseService.setCurrentUserAsNegotiator(this.dataForm);
    }

    // 3. 設定抽成別監聽（記得在 ngOnDestroy 取消訂閱）
    const termTypeSub = this.tlsBaseService.setupTermTypeListener(this.dataForm);
    if (termTypeSub) {
      this.subscriptions.push(termTypeSub);
    }

    // 4. 設定契約日期與營運日期的同步監聽
    const dateSyncSubs = this.tlsBaseService.setupContractDateSync(this.dataForm);
    this.subscriptions.push(...dateSyncSubs);
  }

  ngOnDestroy() {
    // 取消所有訂閱
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // 清除表單
  onClearForm(): void {
    if (confirm('確定要清除所有輸入的資料嗎？')) {
      this.tlsBaseService.resetToDefaults(
        this.dataForm,
        'TLS13010', // 或 'TLS12040'
        ['apply_no', 'tlt_no'] // 保留這些欄位
      );
      this.messageService.infoBubble('表單已清除');
    }
  }
}
```

### 直接使用常數

```typescript
import {
  getTLS13010FormDefaults,
  getTLS12040FormDefaults,
  TLS_CONDITIONAL_DEFAULTS_BY_TERM_TYPE
} from '@shared/services/tls/tls-form-defaults.constants';

// 取得 TLS13010 完整預設值
const defaults = getTLS13010FormDefaults();

// 取得特定抽成別的預設值
const termTypeDefaults = TLS_CONDITIONAL_DEFAULTS_BY_TERM_TYPE['3']; // 一般抽成
```

## 維護注意事項

1. **新增共用欄位**：在 `TLS_COMMON_FORM_DEFAULTS` 中新增
2. **修改特定模組的預設值**：在對應的 `SPECIFIC_DEFAULTS` 中修改
3. **新增卡控邏輯**：在 `TlsContractBaseService` 中新增方法
4. **抽成別相關邏輯**：在 `TLS_CONDITIONAL_DEFAULTS_BY_TERM_TYPE` 中設定

## 優點

- ✅ 避免重複程式碼
- ✅ 集中管理預設值
- ✅ 易於維護和修改
- ✅ 兩個模組保持一致性
- ✅ 清楚標示差異點
