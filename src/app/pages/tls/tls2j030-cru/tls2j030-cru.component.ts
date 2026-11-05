import { NgIf } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy } from '@ngneat/until-destroy'; // 引入 UntilDestroy
import { TranslateModule } from '@ngx-translate/core';
import { TLS2j030Service } from '@service/api/tls/tls2j030.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { TableEditComponent } from '@shared/components/table-edit/table-edit.component';
import { EditColumn, FieldChangeEvent } from '@shared/components/table-edit/table-edit.model';
import { validateRequired } from '@shared/components/table-edit/validate-field.model';
import { TableComponent } from '@others/component/table/table.component';
import { DividerModule } from "primeng/divider";
import { DropdownModule } from 'primeng/dropdown';
import { PanelModule } from 'primeng/panel';
import { finalize, forkJoin } from 'rxjs'; // 引入 of
import { ValidationService } from 'src/app/shared/service/validation.service';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import {
  COLUMNS_CHANGE_EDIT,
  COLUMNS_CHANGE_VIEW,
  COLUMNS_DETAIL_EDIT,
  COLUMNS_DETAIL_VIEW,
  COLUMNS_NATURAL_EDIT,
  COLUMNS_NATURAL_VIEW,
  GUI_PAPER_OPTIONS,
  TLS2J030Data,
  TLS2J030Source
} from '../tls2j030/tls2j030.model';
import { getSYS1000Options } from 'src/app/service/system/sys1000.service';
import { DropDownListService } from './../../../service/utility/dropDownList.service';

// 移除 @Component 裝飾器中的冗餘 imports，只保留必要的
@UntilDestroy() // 使用 @UntilDestroy 簡化 untilDestroyed(this)
@Component({
  selector: 'app-tls2j030-cru',
  templateUrl: './tls2j030-cru.component.html',
  standalone: true,
  imports: [
    TableEditComponent, MenubarComponent, NgIf,
    PanelModule, ReactiveFormsModule, FormsModule, ButtonComponent, TranslateModule, InputTextComponent, TableComponent,
    DropdownModule,
    DividerModule
  ],
})
export class TLS2J030CRUComponent extends BasicCruPageComponent<TLS2J030Data> implements OnInit {

  // ===== 屬性定義 (簡化型別註記，合併相關屬性) =====
  dataForm = this.formBuilder.nonNullable.group({
    TXN_GUIBegNo: ['', [Validators.maxLength(10)]],
  });

  // 查閱模式資料 (View Mode)
  detailNaturalData: TLS2J030Data[] = [];
  detailChangeData: TLS2J030Data[] = [];
  detailItemData: TLS2J030Data[] = [];

  // 新增/編輯模式資料 (Create/Edit Mode)
  data: TLS2J030Source[] = []; // 來源發票清單 (用 TLS2J030Source 更精確)
  changeEditData: (TLS2J030Data & { _TABLE_KEY?: string; status?: string })[] = [];
  detailEditData: (TLS2J030Data & { _TABLE_KEY?: string; status?: string })[] = [];

  sourceInvoiceData: (TLS2J030Source & { TXN_Date?: string; ECR_No?: string }) | null = null;
  changeEcrNo = '';

  // 欄位定義 (直接使用 model 檔案中的常數)
  columnsnatural = COLUMNS_NATURAL_EDIT;
  columnsNaturalView = COLUMNS_NATURAL_VIEW;
  columnschange: EditColumn[] = [];
  columnsChangeView = COLUMNS_CHANGE_VIEW;
  // 明細未稅/稅額僅「應稅且非零稅率」可手動輸入；其餘（免稅、零稅率）打銷售金額時帶入 未稅 = 銷售金額、稅額 = 0
  columnsdetail: EditColumn[] = COLUMNS_DETAIL_EDIT.map(col => {
    if (col.field === 'INV_Net' || col.field === 'INV_Tax') {
      return { ...col, disabled: (_v: unknown, _i?: number, row?: TLS2J030Data) => !this.isDetailNetTaxEditable(row) };
    }
    if (col.field === 'INV_SaleAmt') {
      return {
        ...col,
        calculate: (row) => this.isDetailNetTaxEditable(row as TLS2J030Data)
          ? {}
          : { INV_Net: Number(row['INV_SaleAmt']) || 0, INV_Tax: 0 },
      };
    }
    return col;
  });
  columnsDetailView = COLUMNS_DETAIL_VIEW;

  isViewMode = false;
  queryLoading = false;
  invoiceLockDate = '';

  @ViewChild('changeEdit') tableChangeEdit!: TableEditComponent;
  @ViewChild('detailEdit') tableDetailEdit!: TableEditComponent;

  // 儲存 TDS1010 項目對應，用於動態生成下拉選單
  private itemMap: Record<string, { label: string; value: string }[]> = {};

  // 非第一列需鎖定（自動跟隨第一列）的欄位
  private readonly lockedChangeFields: (keyof TLS2J030Data)[] = [
    'TXN_Date', 'TXN_GUIPaper',
    'INV_CompanyName', 'TXN_Uniform', 'INV_NoneTax', 'BusTaxExmpCard', 'TXN_Notes',
  ];


  constructor(
    public readonly tls2j030Service: TLS2j030Service,
    private dropDownListService: DropDownListService,
    private readonly validationService: ValidationService,
  ) {
    super();
  }
  private validateInvoiceDateAfterLockDate(
    value: unknown,
    _rowData: Record<string, unknown>,
    _data: unknown[],
    _field: string,
    _header: string
  ): { isValid: boolean; errorMessage: string[] } {
    if (!this.invoiceLockDate || value == null) return { isValid: true, errorMessage: [] };
    const dateVal = new Date(value as string | number | Date);
    const lockDateVal = new Date(this.invoiceLockDate);
    if (Number.isNaN(dateVal.getTime()) || Number.isNaN(lockDateVal.getTime())) return { isValid: true, errorMessage: [] };
    if (dateVal <= lockDateVal) {
      return { isValid: false, errorMessage: [`發票日期需大於發票鎖定日(${this.invoiceLockDate})`] };
    }
    return { isValid: true, errorMessage: [] };
  }

  private validateUniformNumber(
    value: any,
    _rowData: unknown,
    _data: unknown[],
    _field: string,
    _header: string
  ): { isValid: boolean; errorMessage: string[] } {
    if (value === '' || value === null || value === undefined) {
      return { isValid: true, errorMessage: [] };
    }
    const error = this.validationService.companyIdValidator({ value: String(value) });
    if (error) {
      return { isValid: false, errorMessage: ['統一編號格式錯誤'] };
    }
    return { isValid: true, errorMessage: [] };
  }
  private updateColumnsChange(): void {
    // 第二列起可獨立調整的欄位（其餘欄位對非第一列 disabled）
    const freeFields = new Set(['PLU_TaxType', 'TXN_SaleTax', 'TXN_SaleNoTax', 'TXN_Net', 'TXN_Tax', 'TXN_SaleAmt']);
    // 發票號碼欄只在二/三聯式時才顯示（所有列聯式相同，取第一列判斷即可）
    const showGuiNo = ['2', '3'].includes(String(this.changeEditData[0]?.TXN_GUIPaper ?? ''));

    const baseColumns: EditColumn[] = [
      {
        field: 'TXN_Date', header: '發票日期', type: 'date',
        validate: [validateRequired, this.validateInvoiceDateAfterLockDate.bind(this)],
        width: '150px',
        // 非第一列鎖定；第一列：選電子發票時 disabled
        disabled: (_v: unknown, i?: number, row?: Record<string, unknown>) =>
          (i ?? 0) > 0 || String(row?.['TXN_GUIPaper']) === 'E',
      },
      {
        field: 'TXN_GUIPaper', header: '發票聯式', type: 'dropdown', options: GUI_PAPER_OPTIONS,
        optionLabel: 'label', optionValue: 'value', validate: [validateRequired],
        // 非第一列鎖定
        disabled: (_v: unknown, i?: number) => (i ?? 0) > 0,
        onChange: (value: unknown, rowData: Record<string, unknown>) => {
          if (value === 'E' && rowData) {
            const today = new Date();
            const todayLocal = new Date(today.getFullYear(), today.getMonth(), today.getDate()) as unknown as string;
            // 切換電子發票時：所有列日期設為今天、發票號碼清空
            this.changeEditData.forEach(row => {
              const r = row as Record<string, unknown>;
              r['TXN_Date'] = todayLocal;
              r['TXN_GUINo'] = null;
            });
            this.changeEditData = [...this.changeEditData];
          }
          this.updateColumnsChange();
          if (rowData) {
            const result = this.validateInvoiceDateAfterLockDate(rowData['TXN_Date'], rowData, [], 'TXN_Date', '發票日期');
            if (!rowData['_validationErrors']) rowData['_validationErrors'] = {};
            if (!result.isValid) {
              (rowData['_validationErrors'] as Record<string, string>)['TXN_Date'] = result.errorMessage[0];
              this.messageService.warnBubble(result.errorMessage[0]);
            } else {
              delete (rowData['_validationErrors'] as Record<string, string>)['TXN_Date'];
            }
            this.changeEditData = [...this.changeEditData];
          }
        },
      },
      // 發票號碼：僅二/三聯式時顯示，每列各自填寫
      ...(showGuiNo ? [{
        field: 'TXN_GUINo', header: '發票號碼', type: 'input', maxLength: 10, minWidth: '120px',
        validate: [validateRequired],
      } as EditColumn] : []),
    ];

    const changeEditColumns = COLUMNS_CHANGE_EDIT.map(col => {
      let processedCol: EditColumn;
      if (col.field === 'PLU_TaxType') {
        processedCol = {
          ...col,
          options: (row: Record<string, unknown>) => {
            const allOptions = getSYS1000Options('PLU_TaxType');
            const usedByOthers = new Set(
              this.changeEditData
                .filter(r => (r as unknown) !== row)
                .map(r => String((r as Record<string, unknown>)['PLU_TaxType'] ?? ''))
                .filter(v => v !== '')
            );
            return allOptions.filter(opt => !usedByOthers.has(opt.value));
          },
          onChange: () => { this.updateColumnsChange(); },
        };
      } else if (col.field === 'TXN_Uniform') {
        processedCol = { ...col, validate: [this.validateUniformNumber.bind(this)] };
      } else if (col.field === 'INV_NoneTax') {
        processedCol = {
          ...col,
          onChange: (value: unknown, rowData: Record<string, unknown>) => {
            // 切回「正常」時清空免徵營業稅證明卡卡號，並清除其驗證錯誤提示
            if (value !== '1') {
              rowData['BusTaxExmpCard'] = null;
              const errors = rowData['_validationErrors'] as Record<string, string> | undefined;
              if (errors) delete errors['BusTaxExmpCard'];
              this.changeEditData = [...this.changeEditData];
            }
          },
        };
      } else {
        processedCol = col;
      }

      // 不在 freeFields 的欄位，對非第一列強制 disabled
      if (!freeFields.has(processedCol.field)) {
        const orig = processedCol.disabled;
        processedCol = {
          ...processedCol,
          disabled: (_v: unknown, i?: number, row?: unknown) => {
            if ((i ?? 0) > 0) return true;
            if (typeof orig === 'function') return orig(_v, i, row);
            return Boolean(orig);
          },
        };
      }
      return processedCol;
    });

    this.columnschange = [...baseColumns, ...changeEditColumns];
  }
  // ===== 生命周期與初始化 =====

  ngOnInit(): void {
    this.initializePage('TLS2J030', this.dataForm);
    this.loadItemDropdownOptions();

    if (!this.isFormCreateable && this.rowdata && this.rowdata.CHG_No) {
      this.loadDetails(this.rowdata.CHG_No);
      this.isViewMode = true;
    } else {
      // 新增
      this.changeEcrNo = this.rowdata?.changeEcrNo || ''; // 目前收銀機號(一進查詢頁面取得)
      this.isViewMode = false;
      this.tls2j030Service.queryTLS2J030InvoiceLockDate().subscribe({
        next: (res: any) => { this.invoiceLockDate = res?.Data.cls_date ?? ''; }
      });
      // 使用 setTimeout 確保 EditTable 相關物件已渲染
      setTimeout(() => this.initializeEditData());
    }
    this.updateColumnsChange();
  }

  /**
   * 載入 TDS1010 的項目名稱選項，並設定給 `columnsdetail`
   */
  private loadItemDropdownOptions(): void {
    this.dropDownListService.queryTDS1010_DropDownList()
      .subscribe({
        next: (res) => {
          if (!res?.Data || !Array.isArray(res.Data)) return;

          const busTypeOptions: { label: string; value: string }[] = [];

          res.Data.forEach((d: any) => {
            const name = String(d.bus_type_name || '').trim();
            const code = String(d.bus_type || '').trim();
            if (!name) return;

            // 1. 建立 bus_type_name 的選項
            busTypeOptions.push({ label: `${code} - ${name}`, value: name });

            // 2. 處理 CHG_ItemName_List 並建立 itemMap
            const list = d.CHG_ItemName_List;
            let items: string[] = [];
            if (typeof list === 'string') {
              items = list.split(';').map((s: string) => s?.trim()).filter((t: string) => t);
            } else if (Array.isArray(list)) {
              items = list.map((s: string) => String(s || '').trim()).filter((t: string) => t);
            }
            this.itemMap[name] = items.map(v => ({ label: v, value: v }));
          });

          // 3. 更新 columnsdetail
          this.columnsdetail = this.columnsdetail.map(col => {
            if (col.field === 'bus_type_name') {
              return { ...col, options: busTypeOptions, optionLabel: 'label', optionValue: 'value' };
            }
            if (col.field === 'INV_ItemName') {
              // INV_ItemName 的 options 函數，動態從 itemMap 取得
              return {
                ...col,
                options: (rowData: any) => this.itemMap[rowData?.bus_type_name] || [],
                optionLabel: 'label',
                optionValue: 'value'
              } as any;
            }
            return col;
          });
        },
        error: (err) => console.error('載入 TDS1010 下拉選項失敗', err)
      });
  }


  /**
   * 初始化新增模式下的換開發票和商品明細資料
   */
  initializeEditData(): void {
    const today = new Date();
    // 建立當地時間的今天日期 (避免 p-calendar 的時區問題)
    const todayLocal = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    this.changeEditData = [{
      _TABLE_KEY: `change_${Date.now()}`,
      status: 'insert',
      TXN_Date: todayLocal as unknown as string,
      TXN_GUIPaper: 'E',
      PLU_TaxType: '1',
      INV_NoneTax: '0',
      GUI_DingType: this.determineGUIDingType(),
    }];

    this.detailEditData = [{
      _TABLE_KEY: `detail_${Date.now()}`,
      status: 'insert',
      INV_ItemName: '',
      INV_Qty: 1,
      INV_SaleAmt: 0,
      _isAutoInsertCandidate: true
    }];

    // 強制觸發變更檢測，確保日期控制項能正確顯示預設值
    // 使用 spread 語法簡化：
    this.changeEditData = [...this.changeEditData];
  }

  /** 根據 CHG_No 載入查閱模式的資料 */
  loadDetails(chgNo: string): void {
    const payload = { PageSize: 0, PageIndex: 0, CHG_No: chgNo };
    this.loading = true;

    forkJoin({
      natural: this.tls2j030Service.queryTLS2J030Detail1(payload),
      change: this.tls2j030Service.queryTLS2J030Detail2(payload),
      item: this.tls2j030Service.queryTLS2J030Detail3(payload),
    }).pipe(finalize(() => this.loading = false)).subscribe({
      next: (res) => {
        // 簡化資料格式化，直接使用一個 helper function
        this.detailNaturalData = this.formatTxnNoInData(res.natural?.Data ?? []);
        this.detailChangeData = this.formatTxnNoInData(res.change?.Data ?? []);
        this.detailItemData = this.formatTxnNoInData(res.item?.Data ?? []);
      },
    });
  }


  // ===== 事件處理與資料更新 =====

  onDetailFieldChange(event: { field?: string, rowData: any, index?: number }) {
    if (event.field !== 'bus_type_name') return;

    try {
      const row = event.rowData;
      row.INV_ItemName = null; // 清除選擇的 INV_ItemName

      // 觸發 table-edit 的 onValueChange 以更新狀態
      if (this.tableDetailEdit) {
        const invCol = this.columnsdetail.find(c => c.field === 'INV_ItemName');
        if (invCol) {
          this.tableDetailEdit.onValueChange(row, null, invCol as any, event.index ?? 0);
        }
      } else {
        // fallback: 更新 data reference
        this.detailEditData = [...this.detailEditData];
      }
    } catch (e) {
      console.error('onDetailFieldChange error', e);
    }
  }

  onChangeEditDataChange(data: (TLS2J030Data & { _TABLE_KEY?: string; status?: string })[]): void {
    const rowCountChanged = data.length !== this.changeEditData.length;
    // 第二列起：自動同步鎖定欄位的值（跟隨第一列）
    if (data.length > 1) {
      const source = data[0] as Record<string, unknown>;
      for (let i = 1; i < data.length; i++) {
        const row = data[i] as Record<string, unknown>;
        this.lockedChangeFields.forEach(field => { row[field] = source[field]; });
      }
      this.changeEditData = [...data];
    } else {
      this.changeEditData = data;
    }
    // 只在 row 數量變動（新增/刪除）時重建 columns，避免 calendar popup 被打斷
    if (rowCountChanged) {
      this.updateColumnsChange();
    }
  }

  onChangeFieldChange(event: FieldChangeEvent): void {
    if (event.field !== 'TXN_Date') return;
    const result = this.validateInvoiceDateAfterLockDate(event.value, event.rowData as Record<string, unknown>, [], 'TXN_Date', '發票日期');
    if (!result.isValid) {
      this.messageService.warnBubble(result.errorMessage[0]);
    }
  }

  onDetailEditDataChange(data: any[]) {
    this.detailEditData = data;
  }

  /** 零稅率註記跟隨換開發票第一列 */
  private isZeroTaxRate(): boolean {
    return String(this.changeEditData[0]?.INV_NoneTax ?? '0') === '1';
  }

  /** 明細未稅/稅額是否可手動調整：應稅且非零稅率 */
  private isDetailNetTaxEditable(row?: TLS2J030Data): boolean {
    return String(row?.PLU_TaxType ?? '') === '1' && !this.isZeroTaxRate();
  }

  /** 明細實際送出的未稅/稅額：可輸入的列取使用者填的值；免稅、零稅率列為 未稅 = 銷售金額、稅額 = 0 */
  private getDetailNetTax(item: TLS2J030Data): { net: number; tax: number } {
    if (this.isDetailNetTaxEditable(item)) {
      return { net: Number(item.INV_Net) || 0, tax: Number(item.INV_Tax) || 0 };
    }
    return { net: Number(item.INV_SaleAmt) || 0, tax: 0 };
  }

  /** 查詢來源發票 */
  querySourceInvoice(): void {
    const txnGuiBegNo = this.dataForm.get('TXN_GUIBegNo')?.value;
    if (!txnGuiBegNo) {
      this.messageService.warnBubble('請輸入來源發票號碼');
      return;
    }

    this.queryLoading = true;
    this.tls2j030Service.queryTLS2J030TXN_GUI({ TXN_GUIBegNo: txnGuiBegNo }).pipe(finalize(() => this.queryLoading = false)).subscribe({
      next: res => this.handleQuerySourceInvoiceSuccess(res?.Data || []),
    });
  }

  /** 處理來源發票查詢成功後的邏輯 */
  private handleQuerySourceInvoiceSuccess(list: TLS2J030Source[]): void {
    if (list.length === 0) {
      this.messageService.infoBubble('查無資料');
      return;
    }

    const source = list[0];
    const sourceDate = source.TXN_Date;
    const today = new Date();
    const todayMonth = today.getMonth() + 1;
    const todayDay = today.getDate();
    const todayYear = today.getFullYear();
    const sourceD = new Date(sourceDate);
    const sourceMonth = sourceD.getMonth() + 1;
    const sourceYear = sourceD.getFullYear();

    // 每期 2 個月：1-2, 3-4, 5-6, 7-8, 9-10, 11-12；periodStart 為期初奇數月
    const periodStart = todayMonth % 2 === 1 ? todayMonth : todayMonth - 1;
    const allowed = new Set([
      `${todayYear}${String(periodStart).padStart(2, '0')}`,
      `${todayYear}${String(periodStart + 1).padStart(2, '0')}`,
    ]);

    // 今天是奇數月且 <= 15 日：同時允許上一期
    if (todayMonth % 2 === 1 && todayDay <= 15) {
      if (periodStart > 2) {
        allowed.add(`${todayYear}${String(periodStart - 2).padStart(2, '0')}`);
        allowed.add(`${todayYear}${String(periodStart - 1).padStart(2, '0')}`);
      } else {
        // 第一期(1-2月)寬限至去年 11-12 月
        allowed.add(`${todayYear - 1}11`);
        allowed.add(`${todayYear - 1}12`);
      }
    }

    // 1. 判斷是否為當期（或寬限上一期）發票
    const sourceYYYYMM = `${sourceYear}${String(sourceMonth).padStart(2, '0')}`;
    if (!allowed.has(sourceYYYYMM)) {
      this.messageService.warnBubble(`來源發票非當期發票，無法新增`);
      return;
    }

    // 2. 檢查是否已存在
    const formatted = this.formatTxnNoInSingleData(source);

    if (this.data.some(d => d.TXN_GUIBegNo === formatted.TXN_GUIBegNo && d.TXN_No === formatted.TXN_No)) {
      this.messageService.infoBubble('來源發票已存在，已略過');
      this.dataForm.get('TXN_GUIBegNo')?.setValue('');
      return;
    }

    // 3. 加入來源發票
    this.data = [...this.data, formatted];
    this.sourceInvoiceData = formatted;
    this.messageService.successBubble('查詢並加入來源發票成功');

    // 4. 初始化編輯資料 (如果尚未初始化)
    if (!this.changeEditData || this.changeEditData.length === 0) {
      this.initializeEditData();
    }

    // 5. 自動計算來源合計並同步到換開發票的 TXN_SaleAmt
    this.syncSourceSumToChangeInvoice();

    // 6. 清空輸入欄位
    this.dataForm.get('TXN_GUIBegNo')?.setValue('');
    this.txnNotesChange(); // 同步更新換開發票的備註欄位
  }

  /**
   * 自動計算來源合計並同步到換開發票的 TXN_SaleAmt
   */
  private syncSourceSumToChangeInvoice(): void {
    try {
      // 只需要來源發票的 應稅金額 (TXN_TotSaleTax) + 免稅金額 (TXN_TotSaleNoTax)
      const sourceSum = this.data.reduce((sum, item) => {
        const tax = Number(item.TXN_TotSaleTax) || 0;
        const notax = Number(item.TXN_TotSaleNoTax) || 0;
        // 【已修正】來源發票合計金額 = 應稅 + 免稅 (排除稅額)
        return sum + tax + notax;
      }, 0);

      if (this.changeEditData.length > 0) {
        const row = this.changeEditData[0] as any;
        row.TXN_SaleAmt = sourceSum;

        // 觸發換開發票的欄位計算 (此處的邏輯是正確的)
        this.columnschange.filter(col => col.calculate).forEach(col => {
          const result = col.calculate!(row, row[col.field]);
          Object.assign(row, result);
        });

        this.changeEditData = [...this.changeEditData];
      }
    } catch (e) {
      console.error('同步來源發票合計至換開發票失敗', e);
    }
  }

  txnNotesChange(): void {
    const notes = this.data.map(item => item.TXN_GUIBegNo).join('、');
    this.changeEditData.forEach(row => { row.TXN_Notes = notes; });
    this.changeEditData = [...this.changeEditData];
  }

  // ===== 送出與驗證 =====

  /** 送出 (簡化了重複的錯誤判斷，將其提取到 private 方法) */
  onSubmit(frm: FormGroup): void {
    // 先執行兩個 table-edit 的欄位/列驗證
    const changeValid = this.tableChangeEdit?.validateAndShowErrors() ?? true;
    const detailValid = this.tableDetailEdit?.validateAndShowErrors() ?? true;
    if (!changeValid || !detailValid) {
      return;
    }

    // 統一進行所有前置驗證
    const { warnings, errors } = this.validateBeforeSubmit();

    if (errors.length > 0) {
      errors.forEach(msg => this.messageService.errorBubble(msg));
      return;
    }

    if (warnings.length > 0) {
      warnings.forEach(msg => this.messageService.warnBubble(msg));
      return;
    }

    this.handleSubmit(frm, () => this.insertData());
  }

  /** 取消：清空換開發票與商品明細 table 資料 */
  onCancelDetail(): void {
    // 表單本身由 app-button 的 [form] 機制還原初始值
    // 這裡專責處理下方兩個編輯 table 的資料：重置為初始一筆可編輯列
    this.data = [];
    this.sourceInvoiceData = null;
    this.initializeEditData();
  }

  /** 集中驗證邏輯，返回錯誤和警告 */
  private validateBeforeSubmit(): { warnings: string[], errors: string[] } {
    const warnings: string[] = [];
    const errors: string[] = [];

    // 必填資料檢查
    if (this.data.length === 0) warnings.push('請先查詢來源發票');
    if (this.changeEditData.length === 0) warnings.push('請填寫換開發票資料');
    if (this.detailEditData.length === 0) warnings.push('請填寫商品明細資料');

    if (warnings.length > 0) return { warnings, errors };

    // 應稅發票金額加總
    const sourceSaleTax = this.data.reduce((sum, item) => sum + (Number(item.TXN_TotGUISaleTax) || 0), 0);
    const changeSaleTax = this.changeEditData.reduce((sum, row) => sum + (Number(row.TXN_SaleTax) || 0), 0);
    if (Math.abs(sourceSaleTax - changeSaleTax) > 0.01) {
      errors.push(`來源發票應稅金額合計 (${sourceSaleTax.toFixed(2)}) 與換開發票應稅發票金額合計 (${changeSaleTax.toFixed(2)}) 不一致`);
    }

    // 免稅發票金額加總
    const sourceSaleNoTax = this.data.reduce((sum, item) => sum + (Number(item.TXN_TotGUISaleNoTax) || 0), 0);
    const changeSaleNoTax = this.changeEditData.reduce((sum, row) => sum + (Number(row.TXN_SaleNoTax) || 0), 0);
    if (Math.abs(sourceSaleNoTax - changeSaleNoTax) > 0.01) {
      errors.push(`來源發票免稅金額合計 (${sourceSaleNoTax.toFixed(2)}) 與換開發票免稅發票金額合計 (${changeSaleNoTax.toFixed(2)}) 不一致`);
    }

    // 每列各自驗證稅額
    this.changeEditData.forEach((row, idx) => {
      if (String(row.PLU_TaxType) === '1') {
        const net = Number(row.TXN_Net) || 0;
        const tax = Number(row.TXN_Tax) || 0;
        const saleTax = Number(row.TXN_SaleTax) || 0;
        if (Math.abs((net + tax) - saleTax) > 0.01) {
          errors.push(`換開發票第 ${idx + 1} 筆：未稅(${net}) + 稅額(${tax}) 須等於應稅金額(${saleTax})`);
        }
      }
    });

    // 商品明細應稅金額加總 vs. 換開應稅發票金額加總
    const detailSaleTax = this.detailEditData
      .filter(item => item.PLU_TaxType === '1')
      .reduce((sum, item) => sum + (Number(item.INV_SaleAmt) || 0), 0);
    if (Math.abs(detailSaleTax - changeSaleTax) > 0.01) {
      errors.push(`明細應稅金額加總 (${detailSaleTax.toFixed(2)}) 與換開應稅發票金額加總 (${changeSaleTax.toFixed(2)}) 不一致，請檢查資料`);
    }

    // 商品明細免稅金額加總 vs. 換開免稅發票金額加總
    const detailSaleNoTax = this.detailEditData
      .filter(item => item.PLU_TaxType === '0')
      .reduce((sum, item) => sum + (Number(item.INV_SaleAmt) || 0), 0);
    if (Math.abs(detailSaleNoTax - changeSaleNoTax) > 0.01) {
      errors.push(`明細免稅金額加總 (${detailSaleNoTax.toFixed(2)}) 與換開免稅發票金額加總 (${changeSaleNoTax.toFixed(2)}) 不一致，請檢查資料`);
    }

    // 商品明細逐筆：未稅 + 稅額 = 銷售金額
    this.detailEditData.forEach((item, idx) => {
      const amt = Number(item.INV_SaleAmt) || 0;
      const { net, tax } = this.getDetailNetTax(item);
      if (Math.abs((net + tax) - amt) > 0.01) {
        errors.push(`商品明細第 ${idx + 1} 筆：未稅(${net}) + 稅額(${tax}) 須等於銷售金額(${amt})`);
      }
    });

    // 應稅明細未稅/稅額加總 vs. 應稅換開發票未稅/稅額（TLS2J040 三聯式列印直接取明細值，兩邊必須一致）
    const taxInvoice = this.changeEditData.find(row => String(row.PLU_TaxType) === '1');
    if (taxInvoice) {
      const taxItems = this.detailEditData.filter(item => item.PLU_TaxType === '1');
      const detailNet = taxItems.reduce((sum, item) => sum + this.getDetailNetTax(item).net, 0);
      const detailTax = taxItems.reduce((sum, item) => sum + this.getDetailNetTax(item).tax, 0);
      const changeNet = Number(taxInvoice.TXN_Net) || 0;
      const changeTax = Number(taxInvoice.TXN_Tax) || 0;
      if (Math.abs(detailNet - changeNet) > 0.01) {
        errors.push(`明細應稅未稅金額加總 (${detailNet.toFixed(2)}) 與換開應稅發票未稅金額 (${changeNet.toFixed(2)}) 不一致，請檢查資料`);
      }
      if (Math.abs(detailTax - changeTax) > 0.01) {
        errors.push(`明細應稅稅額加總 (${detailTax.toFixed(2)}) 與換開應稅發票稅額 (${changeTax.toFixed(2)}) 不一致，請檢查資料`);
      }
    }

    return { warnings, errors };
  }

  /** 新增資料 (僅包含 API 呼叫與結果處理) */
  private insertData(): void {
    // 由於 onSubmit 已經做了驗證，這裡直接假設資料完整
    this.loading = true;
    const payload = this.formatInsertData();
    this.tls2j030Service.insertTLS2J030(payload)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (res) => {
          if (res?.Status === '0001' || res?.Message === '成功') {
            this.messageService.successBubble(`新增成功`);
            this.resetForm();
            setTimeout(() => this.router.navigate(['/account/tls/tls2j030']), 1500);
          } else {
            this.messageService.errorBubble(res?.Message || '新增失敗');
          }
        },
      });
  }

  /**
   * 格式化新增資料的 Payload
   */
  private formatInsertData(): any {
    // 1. POS2100List: 來源發票資料 (使用更精簡的語法)
    const pos2100List = this.data.map(item => ({
      TXN_Date: item.TXN_Date || new Date().toISOString().split('T')[0],
      ECR_No: item.ECR_No,
      TXN_No: this.formatTxnNo(item.TXN_No),
      TXN_GUIBegNo: item.TXN_GUIBegNo || '',
      TXN_GUIEndNo: item.TXN_GUIEndNo || '',
      TXN_TotGUI: item.TXN_TotGUI || 0,
      TXN_TaxType: item.TXN_TaxType || '',
      TXN_TotSaleTax: Number(item.TXN_TotSaleTax) || 0, // 修正欄位名
      TXN_TotSaleNoTax: Number(item.TXN_TotSaleNoTax) || 0, // 修正欄位名
      TXN_TotTax: item.TXN_TotTax || 0
    }));

    // 2. POS2101List: 換開發票資料（支援多筆）
    const pos2101List = this.changeEditData.map(changeItem => ({
      TXN_Date: changeItem.TXN_Date ? new Date(changeItem.TXN_Date as string).toISOString() : new Date().toISOString(),
      ECR_No: this.changeEcrNo,
      TXN_GUINo: changeItem.TXN_GUIPaper === '2' || changeItem.TXN_GUIPaper === '3' ? changeItem.TXN_GUINo || '' : '',
      TXN_GUIPaper: changeItem.TXN_GUIPaper || '',
      PLU_TaxType: changeItem.PLU_TaxType || '',
      TXN_SaleTax: changeItem.TXN_SaleTax || 0,
      TXN_SaleNoTax: changeItem.TXN_SaleNoTax || 0,
      TXN_Net: changeItem.TXN_Net || 0,
      TXN_Tax: changeItem.TXN_Tax || 0,
      TXN_SaleAmt: changeItem.TXN_SaleAmt || 0,
      TXN_Uniform: changeItem.TXN_Uniform ?? null,
      INV_NoneTax: changeItem.INV_NoneTax || '',
      INV_CompanyName: changeItem.INV_CompanyName ?? null,
      BusTaxExmpCard: changeItem.BusTaxExmpCard ?? null,
      TXN_Notes: changeItem.TXN_Notes || ''
    }));

    // 3. POS21011List: 商品明細資料
    const pos21011List = this.detailEditData.map(item => {
      const { net, tax } = this.getDetailNetTax(item);
      return {
        INV_ItemName: item.INV_ItemName || '',
        PLU_TaxType: item.PLU_TaxType || '',
        TXN_SaleAmt: item.INV_SaleAmt || 0,
        TXN_Net: net,
        TXN_Tax: tax,
        INV_Qty: item.INV_Qty || 0
      };
    });

    return { POS2100List: pos2100List, POS2101List: pos2101List, POS21011List: pos21011List };
  }

  // ===== Utility 輔助方法 (沒有改動邏輯，只稍微整理了格式) =====

  private resetForm(): void {
    this.dataForm.reset();
    this.data = [];
    this.changeEditData = [];
    this.detailEditData = [];
    this.sourceInvoiceData = null;
  }

  /**
   * 格式化交易序號，小於6碼時前面蠇0補足6碼
   */
  private formatTxnNo(txnNo: number | string): string {
    return String(txnNo).padStart(6, '0');
  }

  /** 格式化陣列資料中的 TXN_No 欄位 */
  private formatTxnNoInData(dataArray: any[]): any[] {
    return dataArray.map(item =>
      (item && typeof item.TXN_No !== 'undefined') ? { ...item, TXN_No: this.formatTxnNo(item.TXN_No) } : item
    );
  }

  /** 格式化單筆資料中的 TXN_No 欄位 */
  private formatTxnNoInSingleData(data: any): any {
    return (data && typeof data.TXN_No !== 'undefined') ? { ...data, TXN_No: this.formatTxnNo(data.TXN_No) } : data;
  }

  private determineGUIDingType(): string {
    // 實際的 POS1018 查詢邏輯應該在這裡實作
    return 'N';
  }

}
