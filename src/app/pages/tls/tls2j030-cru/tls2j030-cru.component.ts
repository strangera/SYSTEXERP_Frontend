import { NgIf } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy } from '@ngneat/until-destroy'; // 引入 UntilDestroy
import { TranslateModule } from '@ngx-translate/core';
import { TLS2j030Service } from '@service/api/tls/tls2j030.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { validateRequired } from '@shared/componentkit/table-edit/validate-field.model';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { DividerModule } from "primeng/divider";
import { DropdownModule } from 'primeng/dropdown';
import { PanelModule } from 'primeng/panel';
import { finalize, forkJoin } from 'rxjs'; // 引入 of
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
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
  columnsdetail = COLUMNS_DETAIL_EDIT;
  columnsDetailView = COLUMNS_DETAIL_VIEW;

  isViewMode = false;
  queryLoading = false;

  @ViewChild('changeEdit') tableChangeEdit!: TableEditComponent;
  @ViewChild('detailEdit') tableDetailEdit!: TableEditComponent;

  // 儲存 TDS1010 項目對應，用於動態生成下拉選單
  private itemMap: Record<string, { label: string; value: string }[]> = {};


  constructor(
    public readonly tls2j030Service: TLS2j030Service,
    private dropDownListService: DropDownListService,
  ) {
    super();
  }
  private updateColumnsChange(): void {
    // 基礎欄位
    let baseColumns: EditColumn[] = [
      {
        field: 'TXN_Date', header: '發票日期', type: 'date', validate: [validateRequired], width: '150px',
        disabled: (v: any, i?: number, row?: any) => String(row?.['TXN_GUIPaper']) === 'E'
      },
      {
        field: 'TXN_GUIPaper', header: '發票聯式', type: 'dropdown', options: GUI_PAPER_OPTIONS,
        optionLabel: 'label', optionValue: 'value', validate: [validateRequired],
        onChange: (value: any, rowData: any) => {
          if (value === 'E' && rowData) {
            // 當選擇 'E' 時，強制將日期設為當日
            const today = new Date();
            const todayLocal = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            rowData.TXN_Date = todayLocal as unknown as string;

            // 強制更新陣列參考，以確保 table-edit 畫面正確重繪
            this.changeEditData = [...this.changeEditData];
          }
          this.updateColumnsChange();
        },
      },
    ];
    // 判斷是否要顯示發票號碼
    const paperValue = String(this.changeEditData[0]?.TXN_GUIPaper ?? '');
    const showGuiNo = ['2', '3'].includes(paperValue);
    if (showGuiNo) {
      baseColumns.push({ field: 'TXN_GUINo', header: '發票號碼', type: 'input', maxLength: 10, minWidth: '120px', validate: [validateRequired], });
    }

    // 加入剩餘欄位
    baseColumns = [...baseColumns, ...COLUMNS_CHANGE_EDIT]

    this.columnschange = baseColumns;
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

  onChangeEditDataChange(data: any[]) {
    this.changeEditData = data;
    // 檢查邏輯（若有，但不影響功能）已簡化移除，因為主要驗證在 onSubmit
  }

  onDetailEditDataChange(data: any[]) {
    this.detailEditData = data;

    const total = data.reduce((sum, item) => sum + (Number(item.INV_SaleAmt) || 0), 0);

    if (this.changeEditData.length > 0) {
      const row = this.changeEditData[0] as any;
      // 自動調整換開發票金額
      row.TXN_SaleAmt = total;

      // 逐欄位觸發 calculate，使用 forEach/map 比 for 迴圈更具功能性
      this.columnschange.filter(col => col.calculate).forEach(col => {
        const result = col.calculate!(row, row[col.field]); // 加上 ! 確保 calculate 存在
        Object.assign(row, result);
      });

      this.changeEditData = [...this.changeEditData];
    }
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
      error: () => this.messageService.errorBubble('查詢失敗')
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
    const today = new Date().toISOString();

    if (source.GUI_Message !== '') {
      this.messageService.warnBubble(`${source.GUI_Message}`);
      return;
    }

    // 1. 判斷是否為當期發票
    if (this.formatDateToYYYYMM(sourceDate) !== this.formatDateToYYYYMM(today)) {
      this.messageService.warnBubble(`來源發票非當期發票，無法新增`);
      return;
    }

    // 2. 檢查是否已日關帳(拿掉，改判斷發票鎖定)
    // if (source.isClose === 'Y') {
    //   this.messageService.warnBubble(`發票日期已關帳，不可登入發票`);
    //   return;
    // }
    // 2. 檢查發票是否鎖定
    if (source.isInvoiceClose === 'Y') {
      this.messageService.warnBubble(`發票日期已鎖定，不可換開發票`);
      return;
    }

    // 3. 檢查交易日期是否與第一筆一致
    if (this.data.length > 0) {
      const firstDate = this.data[0].TXN_Date;
      if (this.formatDateToYYYYMM(source.TXN_Date) !== this.formatDateToYYYYMM(firstDate)) {
        this.messageService.warnBubble('來源發票交易日期須與第一筆一致，無法新增');
        return;
      }
    }

    // 4. 檢查是否已存在
    const formatted = this.formatTxnNoInSingleData(source);

    if (this.data.some(d => d.TXN_GUIBegNo === formatted.TXN_GUIBegNo && d.TXN_No === formatted.TXN_No)) {
      this.messageService.infoBubble('來源發票已存在，已略過');
      this.dataForm.get('TXN_GUIBegNo')?.setValue('');
      return;
    }

    // 5. 加入來源發票
    this.data = [...this.data, formatted];
    this.sourceInvoiceData = formatted;
    this.messageService.successBubble('查詢並加入來源發票成功');

    // 6. 初始化編輯資料 (如果尚未初始化)
    if (!this.changeEditData || this.changeEditData.length === 0) {
      this.initializeEditData();
    }

    // 7. 自動計算來源合計並同步到換開發票的 TXN_SaleAmt
    this.syncSourceSumToChangeInvoice();

    // 8. 清空輸入欄位
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
    const row = this.changeEditData[0] as any;
    // 換開發票的備註欄位，自動帶入所有來源發票的發票號碼
    row.TXN_Notes = this.data.map(item => item.TXN_GUIBegNo).join('、');
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
    const changeData = this.changeEditData[0];

    // 必填資料檢查
    if (this.data.length === 0) warnings.push('請先查詢來源發票');
    if (!changeData) warnings.push('請填寫換開發票資料');
    if (this.detailEditData.length === 0) warnings.push('請填寫商品明細資料');

    if (warnings.length > 0) return { warnings, errors };

    // 【已修正】來源發票總計只取應稅 + 免稅金額，排除 TXN_TotTax 稅額
    const sourceSum = this.data.reduce((sum, item) =>
      sum + (Number(item.TXN_TotGUISaleTax) || 0) + (Number(item.TXN_TotGUISaleNoTax) || 0), 0);
    const changeTotalCheck = Number(changeData.TXN_SaleAmt) || 0;
    if (Math.abs(sourceSum - changeTotalCheck) > 0.01) {
      errors.push(`來源發票金額 (應稅+免稅) (${sourceSum.toFixed(2)}) 與換開發票金額 (${changeTotalCheck.toFixed(2)}) 不一致，請檢查來源或換開發票金額`);
    }

    if (String(changeData.PLU_TaxType) === '1') {
      const net = Number(changeData.TXN_Net) || 0;
      const tax = Number(changeData.TXN_Tax) || 0;
      const saleTax = Number(changeData.TXN_SaleTax) || 0;
      // 判斷 未稅 + 稅額 是否等於 應稅
      if (Math.abs((net + tax) - saleTax) > 0.01) {
        errors.push(`未稅發票金額(${net}) + 稅額(${tax}) 須等於應稅發票金額(${saleTax})`);
      }
    }

    // 2. 商品明細總計 vs. 換開發票銷售金額
    const detailTotal = this.detailEditData.reduce((sum, item) => sum + (Number(item.INV_SaleAmt) || 0), 0);
    if (Math.abs(detailTotal - changeTotalCheck) > 0.01) {
      errors.push(`商品明細金額總計 (${detailTotal.toFixed(2)}) 與換開發票銷售金額 (${changeTotalCheck.toFixed(2)}) 不一致，請檢查資料`);
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
    const changeItem = this.changeEditData[0];

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

    // 2. POS2101List: 換開發票資料 (簡化日期處理)
    const pos2101List = [{
      TXN_Date: changeItem.TXN_Date ? new Date(changeItem.TXN_Date as string).toISOString() : new Date().toISOString(),
      ECR_No: this.changeEcrNo,
      TXN_GUINo: changeItem.TXN_GUIPaper === '2' || changeItem.TXN_GUIPaper === '3' ? changeItem.TXN_GUINo || '' : '', // 根據發票聯式決定是否傳入發票號碼
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
    }];

    // 3. POS21011List: 商品明細資料
    const pos21011List = this.detailEditData.map(item => ({
      INV_ItemName: item.INV_ItemName || '',
      TXN_SaleAmt: item.INV_SaleAmt || 0, // 使用 INV_SaleAmt 傳入
      INV_Qty: item.INV_Qty || 0
    }));

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

  /** 將日期轉換為發票所屬期 (YYYYMM 格式，偶數月轉為前一個月) */
  private formatDateToYYYYMM(dateString: string): string {
    try {
      let date = new Date(dateString);
      if (isNaN(date.getTime())) {
        date = new Date(); // 使用當前日期作為 fallback
      }
      const year = date.getFullYear();
      let month = date.getMonth() + 1;

      // 偶數月轉換為前一個月
      if (month % 2 === 0) {
        month -= 1;
      }
      if (month < 1) {
        month = 1; // 邊界處理
      }

      return year.toString() + month.toString().padStart(2, '0');
    } catch {
      const now = new Date();
      const year = now.getFullYear();
      let month = now.getMonth() + 1;
      if (month % 2 === 0) month -= 1;
      if (month < 1) month = 1;
      return year.toString() + month.toString().padStart(2, '0');
    }
  }
}
