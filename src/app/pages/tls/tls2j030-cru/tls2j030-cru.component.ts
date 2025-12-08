

import { NgIf } from '@angular/common';
import { AfterViewInit, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { TLS2j030Service } from '@service/api/tls/tls2j030.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';

import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { DropdownModule } from 'primeng/dropdown';
import { PanelModule } from 'primeng/panel';
import { finalize, forkJoin } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import {
  COLUMNS_CHANGE_EDIT,
  COLUMNS_CHANGE_VIEW,
  COLUMNS_DETAIL_EDIT,
  COLUMNS_DETAIL_VIEW,
  COLUMNS_NATURAL_EDIT,
  COLUMNS_NATURAL_VIEW,
  TLS2J030Data
} from '../tls2j030/tls2j030.model';
import { DropDownListService } from './../../../service/utility/dropDownList.service';
@Component({
  selector: 'app-tls2j030-cru',
  templateUrl: './tls2j030-cru.component.html',
  styleUrl: './tls2j030-cru.component.scss',
  standalone: true,
  imports: [
    TableEditComponent, MenubarComponent, NgIf,
    PanelModule, ReactiveFormsModule, FormsModule, ButtonComponent, TranslateModule, InputTextComponent, TableComponent,
    DialogComponent, DropdownModule
  ],
})
export class TLS2J030CRUComponent extends BasicCruPageComponent<TLS2J030Data> implements OnInit, AfterViewInit {
  /** 表單定義 */
  dataForm = this.formBuilder.nonNullable.group({
    TXN_GUIBegNo: ['', [Validators.maxLength(10)]],
  });

  detailNaturalData: TLS2J030Data[] = [];  // 來源發票
  detailChangeData: TLS2J030Data[] = [];   // 換開發票
  detailItemData: TLS2J030Data[] = [];     // 換開發票明細
  selectedItems: TLS2J030Data[] = [];
  data: TLS2J030Data[] = [];

  // 編輯模式的資料 - 只允許一筆
  changeEditData: (TLS2J030Data & { _TABLE_KEY?: string; status?: string })[] = [];     // 換開發票編輯資料
  detailEditData: (TLS2J030Data & { _TABLE_KEY?: string; status?: string })[] = [];     // 商品明細編輯資料

  // 儲存查詢來源發票的結果，用於取得 GUI_YYMM
  sourceInvoiceData: (TLS2J030Data & { TXN_Date?: string; ECR_No?: string }) | null = null;

  // 儲存查詢到的 ECR_No
  currentEcrNo = '';
  // (已移除即時暫存警告，改為按送出時統一驗證)


  // 使用 model 檔案中的欄位定義
  columnsnatural = COLUMNS_NATURAL_EDIT;
  columnsNaturalView = COLUMNS_NATURAL_VIEW;
  columnschange = COLUMNS_CHANGE_EDIT;
  columnsChangeView = COLUMNS_CHANGE_VIEW;
  columnsdetail = COLUMNS_DETAIL_EDIT;
  columnsDetailView = COLUMNS_DETAIL_VIEW;
  isViewMode = false;
  queryLoading = false;  // 專門用於查詢來源發票的 loading
  editLoading = false;   // 專門用於 table-edit 的 loading

  // 項目名稱選擇相關
  showItemDialog = false;
  itemDialogLoading = false;
  selectedBusType = '';
  selectedItemName = '';
  currentEditingRow: TLS2J030Data | null = null;

  // 下拉選項
  busTypeOptions: { label: string; value: string; data?: unknown }[] = [];
  itemNameOptions: { label: string; value: string }[] = [];

  // ViewChild 取得模板
  @ViewChild('itemNameTemplate')
  itemNameTemplate!: TemplateRef<any>;
  @ViewChild('detailEdit') tableDetailEdit!: TableEditComponent;
  ngAfterViewInit() {
    const col = this.columnsdetail.find(c => c.field === 'INV_ItemName');
    if (col) col.templateRef = this.itemNameTemplate;
  }


  constructor(
    private route: ActivatedRoute,
    public readonly tls2j030Service: TLS2j030Service,
    private dropDownListService: DropDownListService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2J030', this.dataForm);
    this.loadItemOptions(); // 載入項目選項

    const nav = this.router.getCurrentNavigation();
    const routeRow = nav?.extras?.state?.['rowdata'] as TLS2J030Data;
    const row = this.rowdata || routeRow;
    if (row?.CHG_No) {
      this.loadDetails(row.CHG_No);
      this.isViewMode = true;
    } else {
      this.isViewMode = false;

      this.initializeEcrNo();

      setTimeout(() => {
        this.initializeEditData();
      });
    }

  }


  /**
   * 初始化 ECR_No - 可以從設定檔或預設值取得
   */
  private initializeEcrNo() {
    // 如果 queryEcrNo API 目前無法使用，可以直接設定預設值
    // 根據你的範例，ECR_No 是 "000081"
    this.currentEcrNo = '890000';

    // 如果需要使用 API 查詢，可以取消註解下面幾行
    // const defaultIP = '192.168.1.81'; // 根據你的範例，使用 000081 對應的 IP
    // this.queryEcrNo(defaultIP);
  }



  loadDetails(chgNo: string) {
    const payload = {
      PageSize: 0,
      PageIndex: 0,
      OrderBy: "",
      Offset: 0,
      SortBy: [],
      CHG_No: chgNo
    };
    this.loading = true;
    forkJoin({
      natural: this.tls2j030Service.queryTLS2J030Detail1(payload),
      change: this.tls2j030Service.queryTLS2J030Detail2(payload),
      item: this.tls2j030Service.queryTLS2J030Detail3(payload),
    })
      .pipe(
        untilDestroyed(this),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (res) => {
          this.detailNaturalData = this.formatTxnNoInData(res.natural?.Data ?? []);
          this.detailChangeData = this.formatTxnNoInData(res.change?.Data ?? []);
          this.detailItemData = this.formatTxnNoInData(res.item?.Data ?? []);
        },
      });
  }
  initializeEditData() {
    const guiDingType = this.determineGUIDingType();

    // 取得今日日期 - p-calendar 需要 Date 物件
    const today = new Date();
    // 建立當地時間的今天日期 (避免時區問題)
    const todayLocal = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    console.log('Setting TXN_Date to Date object:', todayLocal); // Debug log

    this.changeEditData = [{
      _TABLE_KEY: `change_${Date.now()}`,
      status: 'insert',
      TXN_Date: todayLocal as unknown as string,          // 使用 Date 物件讓 p-calendar 能正確顯示
      TXN_GUIPaper: 'E',           // 預設電子發票
      PLU_TaxType: '1',            // 預設應稅
      INV_NoneTax: '0',            // 預設正常
      GUI_DingType: guiDingType,
    }];

    this.detailEditData = [{
      _TABLE_KEY: `detail_${Date.now()}`,
      status: 'insert',
      INV_ItemName: '',
      INV_Qty: 0,
      INV_SaleAmt: 0,
      _isAutoInsertCandidate: true
    }];

    // 強制觸發變更檢測，確保日期控制項能正確顯示預設值
    setTimeout(() => {
      this.changeEditData = [...this.changeEditData];
      console.log('After timeout, changeEditData:', this.changeEditData);
    }, 100);
  }



  /**
   * 根據 POS1018 的 ecr_type 判斷 GUI_DingType
   * 如果 ecr_type = '07' 則為 Y (丁種)，否則為 N (非丁種)
   */
  private determineGUIDingType(): string {
    // TODO: 這裡需要根據當前的 ECR_No 查詢 POS1018 資料
    // 目前先預設為 'N'，需要實作 POS1018 查詢邏輯

    // 假設的邏輯 (需要實際的 API 支援):
    // if (this.currentEcrNo) {
    //   // 查詢 POS1018 where ECR_No = this.currentEcrNo
    //   // if (pos1018Data.ecr_type === '07') return 'Y';
    // }

    return 'N'; // 預設為非丁種
  }  /**
   * 將日期轉換為 YYYYMM 格式，偶數月轉換為前一個月
   * @param dateString 日期字串 (YYYY-MM-DD 或其他格式)
   * @returns YYYYMM 格式字串，偶數月會轉為前一個月
   */
  private formatDateToYYYYMM(dateString: string): string {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        // 如果日期無效，使用當前日期
        const now = new Date();
        return this.convertToInvoiceFormat(now.getFullYear(), now.getMonth() + 1);
      }

      const year = date.getFullYear();
      const month = date.getMonth() + 1; // getMonth() 返回 0-11，需要 +1

      return this.convertToInvoiceFormat(year, month);
    } catch {
      // 錯誤時使用當前日期
      const now = new Date();
      return this.convertToInvoiceFormat(now.getFullYear(), now.getMonth() + 1);
    }
  }

  /**
   * 轉換為發票格式：偶數月轉為前一個月
   * @param year 年份
   * @param month 月份 (1-12)
   * @returns YYYYMM 格式字串
   */
  private convertToInvoiceFormat(year: number, month: number): string {
    let invoiceMonth = month;

    // 偶數月轉換為前一個月
    if (month % 2 === 0) {
      invoiceMonth = month - 1;
    }

    // 確保月份在有效範圍內
    if (invoiceMonth < 1) {
      invoiceMonth = 1;
    }

    const yearStr = year.toString();
    const monthStr = invoiceMonth.toString().padStart(2, '0');
    return yearStr + monthStr;
  }



  /**
   * 查詢 ECR 號碼
   * @param ip IP 地址
   */
  private queryEcrNo(ip: string) {
    this.tls2j030Service.queryEcrNo(ip)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res: { Status?: string; Data?: { ECR_No?: string } }) => {
          if (res && res.Status === '0000') {
            this.currentEcrNo = res.Data?.ECR_No || '';
          } else {
            this.currentEcrNo = '';
          }
        },
      });
  }

  onChangeEditDataChange(data: any[]) {
    this.changeEditData = data;

    // 檢查換開發票的銷售金額是否與商品明細總計一致
    if (data.length > 0 && this.detailEditData.length > 0) {
      const detailTotal = this.detailEditData.reduce((sum, item) => sum + (Number(item.INV_SaleAmt) || 0), 0);
      const changeTotal = Number(data[0]?.TXN_SaleAmt) || 0;

      // 不在編輯時顯示警告，改為在按送出時統一驗證與提示
      // （保留邏輯但不顯示）
    }
  }

  /** 查詢來源發票 */
  querySourceInvoice() {
    const txnGuiBegNo = this.dataForm.get('TXN_GUIBegNo')?.value;

    if (!txnGuiBegNo) {
      // 不在查詢按鈕或輸入時顯示警告，改為在送出時統一驗證
      this.messageService.warnBubble('請輸入來源發票號碼');
      return;
    }

    this.queryLoading = true;

    this.tls2j030Service.queryTLS2J030TXN_GUI({ TXN_GUIBegNo: txnGuiBegNo })
      .pipe(finalize(() => this.queryLoading = false))
      .subscribe({
        next: res => {

          if (res?.Status !== '0000') {
            this.messageService.errorBubble('查詢失敗');
            return;
          }

          const list = res.Data || [];
          if (list.length === 0) {
            this.messageService.infoBubble('查無資料');
            return;
          }

          const source = list[0];
          const sourceDate = source.TXN_Date;

          // ① 判斷是否為當期發票
          const sourceYYMM = this.formatDateToYYYYMM(sourceDate);
          const todayYYMM = this.formatDateToYYYYMM(new Date().toISOString());

          if (sourceYYMM !== todayYYMM) {
            // 查詢時仍需即時回饋使用者查詢結果（來源發票非當期）
            this.messageService.warnBubble(`來源發票非當期發票 (${sourceYYMM})，無法新增`);
            return;
          }

          // 保存來源發票資料（格式化TXN_No）
          this.sourceInvoiceData = this.formatTxnNoInSingleData(source);
          this.data = this.formatTxnNoInData(list);
          this.messageService.successBubble('查詢成功');

          // 初始化新增資料（換開 + 明細）
          this.initializeEditData();
        }
      });
  }
  onDetailEditDataChange(data: any[]) {
    this.detailEditData = data;

    const total = data.reduce((sum, item) => sum + (Number(item.INV_SaleAmt) || 0), 0);

    if (this.changeEditData.length > 0) {
      const row = this.changeEditData[0] as any;
      const currentSaleAmt = Number(row.TXN_SaleAmt) || 0;

      // 檢查金額是否一致，如果不一致則顯示警告
      // 不在編輯時顯示警告，僅自動調整數值；提醒將在送出時顯示
      // （若要在此處提示使用者請改用 messageService.warnBubble）

      row.TXN_SaleAmt = total;

      // 逐欄位觸發 calculate
      for (const col of this.columnschange) {
        if (col.calculate) {
          const val = row[col.field];
          const result = col.calculate(row, val);
          Object.assign(row, result);
        }
      }

      this.changeEditData = [...this.changeEditData];
    }
  }




  /** 格式化新增資料 */
  private formatInsertData() {
    console.log('formatInsertData - changeEditData:', this.changeEditData);
    console.log('formatInsertData - detailEditData:', this.detailEditData);
    console.log('formatInsertData - sourceData:', this.data);

    // POS2100List: 來源發票資料
    const pos2100List = this.data.map(item => {
      const sourceItem = item as unknown as Record<string, unknown>;
      const txnNo = (sourceItem['TXN_No'] as number) || 0;
      return {
        TXN_Date: (sourceItem['TXN_Date'] as string) || new Date().toISOString().split('T')[0],
        ECR_No: (sourceItem['ECR_No'] as string) || this.currentEcrNo,
        TXN_No: this.formatTxnNo(txnNo),
        TXN_GUIBegNo: (sourceItem['TXN_GUIBegNo'] as string) || '',
        TXN_GUIEndNo: (sourceItem['TXN_GUIEndNo'] as string) || '',
        TXN_TotGUI: (sourceItem['TXN_TotGUI'] as number) || 0,
        TXN_TaxType: (sourceItem['TXN_TaxType'] as string) || '',
        TXN_TotSaleTax: Number(sourceItem['TXN_TotGUISaleTax']) || 0,
        TXN_TotSaleNoTax: Number(sourceItem['TXN_TotGUISaleNoTax']) || 0,
        TXN_TotTax: (sourceItem['TXN_TotTax'] as number) || 0
      };
    });

    // POS2101List: 換開發票資料
    const sourceEcrNo = (this.data[0] as unknown as Record<string, unknown>)?.['ECR_No'] as string || this.currentEcrNo;
    const pos2101List = this.changeEditData.map(item => ({
      TXN_Date: item.TXN_Date ? new Date(item.TXN_Date as string).toISOString() : new Date().toISOString(),
      ECR_No: sourceEcrNo, // 使用來源發票的 ECR_No
      TXN_GUIPaper: item.TXN_GUIPaper || '',
      PLU_TaxType: item.PLU_TaxType || '',
      TXN_SaleTax: item.TXN_SaleTax || 0,
      TXN_SaleNoTax: item.TXN_SaleNoTax || 0,
      TXN_Net: item.TXN_Net || 0,
      TXN_Tax: item.TXN_Tax || 0,
      TXN_SaleAmt: item.TXN_SaleAmt || 0,
      TXN_Uniform: item.TXN_Uniform || '',
      INV_NoneTax: item.INV_NoneTax || '',
      BusTaxExmpCard: item.BusTaxExmpCard || '',
      TXN_Notes: item.TXN_Notes || ''
    }));

    // POS21011List: 商品明細資料
    const pos21011List = this.detailEditData.map(item => ({
      INV_ItemName: item.INV_ItemName || '',
      TXN_SaleAmt: item.INV_SaleAmt || 0, // 注意：後端期望的是 TXN_SaleAmt
      INV_Qty: item.INV_Qty || 0
    }));

    const payload = {
      POS2100List: pos2100List,
      POS2101List: pos2101List,
      POS21011List: pos21011List
    };

    console.log('Final payload to be sent:', JSON.stringify(payload, null, 2));
    return payload;
  }

  /** 送出 */
  onSubmit(frm: FormGroup) {
    // 在按送出時統一驗證：收集警告，顯示後中止送出；若為錯誤則顯示錯誤並中止
    const warnings = new Set<string>();

    if (!this.data || this.data.length === 0) {
      warnings.add('請先查詢來源發票');
    }

    if (!this.changeEditData || this.changeEditData.length === 0) {
      warnings.add('請填寫換開發票資料');
    }

    if (!this.detailEditData || this.detailEditData.length === 0) {
      warnings.add('請填寫商品明細資料');
    }

    // 若存在換開與明細，檢查金額一致性（這裡視為錯誤，與 insertData 的檢查一致）
    // 先檢查：來源發票合計（應稅 + 免稅 + 交易稅）必須等於換開發票的銷售金額
    if (this.data && this.data.length > 0 && this.changeEditData.length > 0) {
      const sourceSum = this.data.reduce((sum, item) => {
        const tax = Number((item as any).TXN_TotGUISaleTax) || 0;
        const notax = Number((item as any).TXN_TotGUISaleNoTax) || 0;
        const txnTax = Number((item as any).TXN_TotTax) || 0;
        return sum + tax + notax + txnTax;
      }, 0);
      const changeTotalCheck = Number(this.changeEditData[0]?.TXN_SaleAmt) || 0;
      if (Math.abs(sourceSum - changeTotalCheck) > 0.01) {
        this.messageService.errorBubble(
          `來源發票金額合計 (${sourceSum.toFixed(2)}) 與換開發票銷售金額 (${changeTotalCheck.toFixed(2)}) 不一致，請檢查來源或換開發票金額`
        );
        return;
      }
    }

    if (this.changeEditData.length > 0 && this.detailEditData.length > 0) {
      const detailTotal = this.detailEditData.reduce((sum, item) => sum + (Number(item.INV_SaleAmt) || 0), 0);
      const changeTotal = Number(this.changeEditData[0]?.TXN_SaleAmt) || 0;
      if (Math.abs(detailTotal - changeTotal) > 0.01) {
        this.messageService.errorBubble(
          `商品明細金額總計 (${detailTotal.toFixed(2)}) 與換開發票銷售金額 (${changeTotal.toFixed(2)}) 不一致，請檢查資料`
        );
        return;
      }
    }

    if (warnings.size > 0) {
      for (const msg of warnings) {
        this.messageService.warnBubble(msg);
      }
      return; // 中止送出，讓使用者先處理警告
    }

    this.handleSubmit(frm, () => {
      this.insertData();
    });
  }

  /** 新增資料 */
  private insertData() {
    if (!this.data || this.data.length === 0) {
      this.loading = false;
      this.messageService.warnBubble('請先查詢來源發票');
      return;
    }

    if (!this.changeEditData || this.changeEditData.length === 0) {
      this.loading = false;
      this.messageService.warnBubble('請填寫換開發票資料');
      return;
    }

    if (!this.detailEditData || this.detailEditData.length === 0) {
      this.loading = false;
      this.messageService.warnBubble('請填寫商品明細資料');
      return;
    }

    // 驗證商品明細金額總計與換開發票銷售金額是否一致
    const detailTotal = this.detailEditData.reduce((sum, item) => sum + (Number(item.INV_SaleAmt) || 0), 0);
    const changeTotal = Number(this.changeEditData[0]?.TXN_SaleAmt) || 0;

    if (Math.abs(detailTotal - changeTotal) > 0.01) {
      this.loading = false;
      this.messageService.errorBubble(
        `商品明細金額總計 (${detailTotal.toFixed(2)}) 與換開發票銷售金額 (${changeTotal.toFixed(2)}) 不一致，請檢查資料`
      );
      return;
    }

    const payload = this.formatInsertData();

    this.tls2j030Service.insertTLS2J030(payload)
      .pipe(
        untilDestroyed(this),
        finalize(() => { this.loading = false })
      )
      .subscribe({
        next: (res) => {
          console.log('insertTLS2J030 response:', res);
          if (res?.Status === '0001' || res?.Message === '成功') {
            this.messageService.successBubble(`新增成功 (處理了 ${res?.Data || 0} 筆資料)`);
            this.resetForm();

            setTimeout(() => {
              this.router.navigate(['/tls/tls2j030']);
            }, 1500);
          } else {
            this.messageService.errorBubble(res?.Message || '新增失敗');
          }
        },
      });
  }

  /** 重置表單 */
  private resetForm() {
    this.dataForm.reset();
    this.data = [];
    this.changeEditData = [];
    this.detailEditData = [];
    this.sourceInvoiceData = null;
  }

  /**
   * 格式化交易序號，小於6碼時前面蠇0補足6碼
   * @param txnNo 交易序號
   * @returns 格式化後的6位數字串
   */
  private formatTxnNo(txnNo: number | string): string {
    const txnNoStr = txnNo.toString();
    return txnNoStr.padStart(6, '0');
  }

  /**
   * 格式化陣列資料中的TXN_No欄位
   * @param dataArray 資料陣列
   * @returns 格式化後的資料陣列
   */
  private formatTxnNoInData(dataArray: any[]): any[] {
    return dataArray.map(item => {
      if (item && typeof item.TXN_No !== 'undefined') {
        return {
          ...item,
          TXN_No: this.formatTxnNo(item.TXN_No)
        };
      }
      return item;
    });
  }

  /**
   * 格式化單筆資料中的TXN_No欄位
   * @param data 單筆資料
   * @returns 格式化後的資料
   */
  private formatTxnNoInSingleData(data: any): any {
    if (data && typeof data.TXN_No !== 'undefined') {
      return {
        ...data,
        TXN_No: this.formatTxnNo(data.TXN_No)
      };
    }
    return data;
  }

  /**
   * 載入項目選項資料
   */
  loadItemOptions(): void {
    this.dropDownListService.queryTDS1010_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (response) => {
          console.log('loadItemOptions response:', response);
          if (response?.Data) {
            // 建立 bus_type + bus_type_name 的唯一組合選項
            const uniqueBusTypes = response.Data.reduce((acc, item) => {
              const key = `${item.bus_type}_${item.bus_type_name}`;
              if (!acc.find(existing => existing.value === key)) {
                acc.push({
                  label: `${item.bus_type} - ${item.bus_type_name}`,
                  value: key,
                  data: item
                });
              }
              return acc;
            }, [] as { label: string; value: string; data: unknown }[]);

            console.log('Generated busTypeOptions:', uniqueBusTypes);
            this.busTypeOptions = uniqueBusTypes;
          }
        },
        error: (error) => {
          console.error('載入項目選項失敗:', error);
          this.messageService.errorBubble('載入項目選項失敗');
        }
      });
  }

  /**
   * 當 bus_type 變更時載入對應的 bus_type_name
   */
  onBusTypeChange(event: { value: string }): void {
    const busTypeKey = event.value;
    console.log('onBusTypeChange called with busTypeKey:', busTypeKey);
    this.selectedBusType = busTypeKey;
    this.selectedItemName = '';
    this.itemNameOptions = [];

    if (!busTypeKey) return;

    // 從 busTypeKey 中解析出 bus_type 和 bus_type_name
    const [busType, busTypeName] = busTypeKey.split('_');
    console.log('Parsed busType:', busType, 'busTypeName:', busTypeName);

    this.dropDownListService.queryTDS1010_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (response) => {
          if (response?.Data) {
            // 篩選對應 bus_type 和 bus_type_name 的 CHG_ItemName_List
            const filteredItems = response.Data.filter(item =>
              item.bus_type === busType && item.bus_type_name === busTypeName
            );
            console.log('Filtered items:', filteredItems); if (filteredItems.length > 0 && filteredItems[0].CHG_ItemName_List) {
              const itemList = filteredItems[0].CHG_ItemName_List;
              let itemNames: string[] = [];

              console.log('CHG_ItemName_List original:', itemList);
              console.log('CHG_ItemName_List type:', typeof itemList);

              // 處理字串格式的 CHG_ItemName_List (用分號分隔)
              if (typeof itemList === 'string') {
                itemNames = itemList.split(';').filter(item => item.trim() !== '');
              } else if (Array.isArray(itemList)) {
                itemNames = itemList;
              }

              console.log('Processed itemNames:', itemNames);

              this.itemNameOptions = itemNames.map((itemName: string) => ({
                label: itemName.trim(),
                value: itemName.trim()
              }));

              console.log('Final itemNameOptions:', this.itemNameOptions);
            } else {
              console.log('No CHG_ItemName_List found, filteredItems:', filteredItems);
            }
          }
        },
        error: (error) => {
          console.error('載入品項名稱失敗:', error);
          this.messageService.errorBubble('載入品項名稱失敗');
        }
      });
  }

  /**
   * 當 bus_type_name 變更時載入對應的 CHG_ItemName_List
   */


  /**
   * 開啟項目選擇對話框
   */
  openItemDialog(rowData: TLS2J030Data): void {
    const idx = this.detailEditData.findIndex(r => r._TABLE_KEY === rowData._TABLE_KEY);

    // 如果找不到 _TABLE_KEY → 用 index 建立
    if (idx !== -1 && !this.detailEditData[idx]._TABLE_KEY) {
      this.detailEditData[idx]._TABLE_KEY = 'detail_' + Date.now() + '_' + Math.random();
    }

    this.currentEditingRow = this.detailEditData[idx];
    this.selectedBusType = '';
    this.selectedItemName = '';
    this.itemNameOptions = [];
    this.showItemDialog = true;
  }

  /**
   * 確認選擇項目名稱
   */
  confirmItemSelection(): void {
    if (this.currentEditingRow && this.selectedItemName) {

      const key = this.currentEditingRow._TABLE_KEY;
      const idx = this.detailEditData.findIndex(r => r._TABLE_KEY === key);

      if (idx !== -1) {
        const row = this.detailEditData[idx];

        // ① 寫入值
        row.INV_ItemName = this.selectedItemName;

        // ② 標示為已輸入（讓 table-edit 自動新增下一筆）
        row._isAutoInsertCandidate = false;

        // ③ 觸發共通元件更新
        this.tableDetailEdit?.onValueChange(
          row,
          this.selectedItemName,
          { field: 'INV_ItemName', header: '項目名稱' } as any,
          idx
        );

        // ④ 新增下一筆空白列
        this.tableDetailEdit.insertRow();

        // ⑤ 更新
        this.detailEditData = [...this.detailEditData];
      }
    }

    this.resetDialogData();
    this.showItemDialog = false;
  }


  /**
   * 取消項目選擇
   */
  cancelItemSelection(): void {
    this.showItemDialog = false;
    this.resetDialogData();
  }

  /**
   * 重置對話框資料
   */
  private resetDialogData(): void {
    this.currentEditingRow = null;
    this.selectedBusType = '';
    this.selectedItemName = '';
    this.itemNameOptions = [];
  }

  // 模板選擇相關方法（用於 OverlayPanel）
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  cancelTemplateSelection(_rowData?: unknown, _overlayPanel?: unknown): void {
    // 清空選擇
    this.selectedBusType = '';
    this.selectedItemName = '';
    this.itemNameOptions = [];
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  confirmTemplateSelection(_rowData?: unknown, _overlayPanel?: unknown): void {
    if (this.selectedItemName && this.currentEditingRow) {
      // 將選中的項目名稱設定到當前編輯行
      this.currentEditingRow.INV_ItemName = this.selectedItemName;
      // 觸發資料更新
      this.detailEditData = [...this.detailEditData];
    }
  }
}
