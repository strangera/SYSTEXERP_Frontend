import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { TLS2j030Service } from '@service/api/tls/tls2j030.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
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
    PanelModule, ReactiveFormsModule, ButtonComponent, TranslateModule, InputTextComponent, TableComponent
  ],
})
export class TLS2J030CRUComponent extends BasicCruPageComponent<TLS2J030Data> implements OnInit {
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

  // 防止重複調用 getNextGUINo 的標記
  private isGettingGUINo = false;
  private lastProcessedDate = '';
  // 使用 model 檔案中的欄位定義
  columnsnatural = COLUMNS_NATURAL_EDIT;
  columnsNaturalView = COLUMNS_NATURAL_VIEW;
  columnschange = COLUMNS_CHANGE_EDIT;
  columnsChangeView = COLUMNS_CHANGE_VIEW;
  columnsdetail = COLUMNS_DETAIL_EDIT;
  columnsDetailView = COLUMNS_DETAIL_VIEW;
  isViewMode = false;
  btnLoading = false;
  queryLoading = false;  // 專門用於查詢來源發票的 loading
  editLoading = false;   // 專門用於 table-edit 的 loading
  constructor(
    private dropDownListService: DropDownListService,
    private route: ActivatedRoute,
    public readonly tls2j030Service: TLS2j030Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2J030', this.dataForm);
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
    this.currentEcrNo = '000081';

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
          this.detailNaturalData = res.natural?.Data ?? [];
          this.detailChangeData = res.change?.Data ?? [];
          this.detailItemData = res.item?.Data ?? [];
        },
      });
  }
  initializeEditData() {
    this.isGettingGUINo = false;
    this.lastProcessedDate = '';

    const guiDingType = this.determineGUIDingType();

    // 取得今日 yyyy-MM-dd
    const today = new Date();
    const todayStr = today.toISOString().substring(0, 10);

    this.changeEditData = [{
      _TABLE_KEY: `change_${Date.now()}`,
      status: 'insert',
      TXN_Date: todayStr,          // 直接把日期塞進資料
      TXN_GUIPaper: 'E',           // 預設電子發票
      PLU_TaxType: '1',            // 預設應稅
      INV_NoneTax: '0',            // 預設正常
      GUI_DingType: guiDingType,
    }];

    // 進新增頁就自動取發票號碼
    if (this.currentEcrNo) {
      this.getNextGUINo(todayStr);
    }
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

  /**
   * 取得下一個發票號碼
   * @param selectedDate 使用者選擇的日期
   */
  private getNextGUINo(selectedDate: string) {
    if (!selectedDate) {
      return;
    }

    // 防止重複調用：檢查是否正在調用 API 或日期沒有變更
    if (this.isGettingGUINo) {
      return;
    }

    if (this.lastProcessedDate === selectedDate) {
      return;
    }

    // 將使用者選擇的日期轉換為 YYYYMM 格式（偶數月轉為前一月）
    const guiYYMM = this.formatDateToYYYYMM(selectedDate);

    // 準備 API 參數
    const payload = {
      GUI_YYMM: guiYYMM,
      ECR_No: this.currentEcrNo
    };

    // 設定標記防止重複調用
    this.isGettingGUINo = true;
    this.lastProcessedDate = selectedDate;
    this.editLoading = true;
    this.tls2j030Service.getNextGUINo(payload)
      .pipe(
        untilDestroyed(this),
        finalize(() => {
          this.editLoading = false;
          this.isGettingGUINo = false; // 重設標記，允許下次調用
        })
      )
      .subscribe({
        next: (res) => {
          if (res?.Status === '0000') {
            let nextGUINo = '';
            let guiDingType = '';

            // 根據實際後端回應格式解析資料
            if (res.Data) {
              nextGUINo = res.Data.TXN_GUINo || res.Data.NextGUINo || res.Data.TXN_GUINO || res.Data.GUINo || res.Data;
              guiDingType = res.Data.GUI_DingType || '';
            } else {
              nextGUINo = res.TXN_GUINo || res.NextGUINo || res.TXN_GUINO || res.GUINo;
              guiDingType = res.GUI_DingType || '';
            }

            if (nextGUINo && typeof nextGUINo === 'string') {
              // 更新 changeEditData 中的發票號碼和丁種發票設定
              if (this.changeEditData.length > 0) {
                this.changeEditData[0] = {
                  ...this.changeEditData[0],
                  TXN_GUINo: nextGUINo,  // 使用新的屬性名稱 TXN_GUINo
                  GUI_DingType: guiDingType || this.changeEditData[0].GUI_DingType || 'N' // 使用後端回傳值，否則保持原值或預設為 'N'
                };
                // 觸發資料更新
                this.changeEditData = [...this.changeEditData];
              }

              const dingTypeText = guiDingType === 'Y' ? '(丁種發票)' : '(非丁種發票)';
              this.messageService.successBubble(`已自動取得發票號碼：${nextGUINo} ${dingTypeText}`);
            } else {
              this.messageService.errorBubble('發票號碼格式錯誤');
            }
          } else {
            // 處理 API 錯誤回應
            const message = res?.Message || res?.Msg || '取得發票號碼失敗';

            // 根據不同的錯誤狀態給予適當的訊息
            if (res?.Status === '9999') {
              this.messageService.errorBubble(`系統錯誤：${message}。請檢查發票期別(${payload.GUI_YYMM}) 和 ECR_No(${payload.ECR_No}) 參數。`);
            } else {
              this.messageService.errorBubble(`取得發票號碼失敗：${message}`);
            }
          }
        },
      });
  }

  onChangeEditDataChange(data: any[]) {
    this.changeEditData = data;
    // 日期 now disabled，不需要再處理
  }

  /** 查詢來源發票 */
  querySourceInvoice() {
    const txnGuiBegNo = this.dataForm.get('TXN_GUIBegNo')?.value;

    if (!txnGuiBegNo) {
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
            this.messageService.warnBubble(`來源發票非當期發票 (${sourceYYMM})，無法新增`);
            return;
          }

          // 保存來源發票資料
          this.sourceInvoiceData = source;
          this.data = list;
          this.messageService.successBubble('查詢成功');

          // 初始化新增資料（換開 + 明細）
          this.initializeEditData();
        }
      });
  }



  /** 格式化新增資料 */
  private formatInsertData() {
    // POS2100List: 來源發票資料
    const pos2100List = this.data.map(item => {
      const sourceItem = item as unknown as Record<string, unknown>;
      return {
        TXN_Date: (sourceItem['TXN_Date'] as string) || new Date().toISOString().split('T')[0],
        ECR_No: (sourceItem['ECR_No'] as string) || '',
        TXN_No: (sourceItem['TXN_No'] as number) || 0,
        TXN_GUIBegNo: (sourceItem['TXN_GUIBegNo'] as string) || '',
        TXN_GUIEndNo: (sourceItem['TXN_GUIEndNo'] as string) || '',
        TXN_TotGUI: (sourceItem['TXN_TotGUI'] as number) || 0,
        TXN_TaxType: (sourceItem['TXN_TaxType'] as string) || '',
        TXN_TotSaleTax: (sourceItem['TXN_TotSaleTax'] as number) || 0,
        TXN_TotSaleNoTax: (sourceItem['TXN_TotSaleNoTax'] as number) || 0,
        TXN_TotTax: (sourceItem['TXN_TotTax'] as number) || 0
      };
    });

    // POS2101List: 換開發票資料
    const sourceEcrNo = (this.data[0] as unknown as Record<string, unknown>)?.['ECR_No'] as string || '';
    const pos2101List = this.changeEditData.map(item => ({
      TXN_Date: new Date().toISOString(),
      ECR_No: sourceEcrNo, // 使用來源發票的 ECR_No
      TXN_GUIPaper: item.TXN_GUIPaper || '',
      TXN_GUINo: item.TXN_GUINo || '',
      PLU_TaxType: item.PLU_TaxType || '',
      TXN_SaleTax: item.TXN_SaleTax || 0,
      TXN_SaleNoTax: item.TXN_SaleNoTax || 0,
      TXN_Net: item.TXN_Net || 0,
      TXN_Tax: item.TXN_Tax || 0,
      TXN_SaleAmt: item.TXN_SaleAmt || 0,
      TXN_Uniform: item.TXN_Uniform || '',
      INV_NoneTax: item.INV_NoneTax || '',
      BusTaxExmpCard: item.BusTaxExmpCard || '',
      GUI_DingType: item.GUI_DingType || '',
      TXN_GUIRemark: item.TXN_GUIRemark || '',
      TXN_Notes: item.TXN_Notes || ''
    }));

    // POS21011List: 商品明細資料
    const pos21011List = this.detailEditData.map(item => ({
      INV_ItemName: item.INV_ItemName || '',
      TXN_SaleAmt: item.TXN_SaleAmt || 0,
      INV_Qty: item.INV_Qty || 0
    }));

    return {
      POS2100List: pos2100List,
      POS2101List: pos2101List,
      POS21011List: pos21011List
    };
  }

  /** 送出 */
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.insertData();
    });
  }

  /** 新增資料 */
  private insertData() {
    if (!this.data || this.data.length === 0) {
      this.messageService.warnBubble('請先查詢來源發票');
      return;
    }

    if (!this.changeEditData || this.changeEditData.length === 0) {
      this.messageService.warnBubble('請填寫換開發票資料');
      return;
    }

    if (!this.detailEditData || this.detailEditData.length === 0) {
      this.messageService.warnBubble('請填寫商品明細資料');
      return;
    }

    const payload = this.formatInsertData();

    this.btnLoading = true;
    this.tls2j030Service.insertTLS2J030(payload)
      .pipe(
        untilDestroyed(this),
        finalize(() => this.btnLoading = false)
      )
      .subscribe({
        next: (res) => {
          if (res?.Status === '0000') {
            this.messageService.successBubble('新增成功');
            this.resetForm();
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
}
