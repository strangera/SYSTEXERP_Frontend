import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { PanelModule } from 'primeng/panel';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropDownListService } from './../../../service/utility/dropDownList.service';
import { TranslateModule } from '@ngx-translate/core';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { NgIf } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {
  COLUMNS_NATURAL_EDIT,
  COLUMNS_NATURAL_VIEW,
  COLUMNS_CHANGE_EDIT,
  COLUMNS_CHANGE_VIEW,
  COLUMNS_DETAIL_EDIT,
  COLUMNS_DETAIL_VIEW,
  TLS2J030Data
} from '../tls2j030/tls2j030.model';
import { finalize, forkJoin } from 'rxjs';
import { TLS2j030Service } from '@service/api/tls/tls2j030.service';
import { untilDestroyed } from '@ngneat/until-destroy';
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
      // 初始化時嘗試查詢預設的 ECR_No (可以根據需要調整)
      this.initializeEcrNo();
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
    // 重置防重複調用的標記
    this.isGettingGUINo = false;
    this.lastProcessedDate = '';

    const guiDingType = this.determineGUIDingType();

    this.changeEditData = [{
      _TABLE_KEY: `change_${Date.now()}`,
      status: 'insert',
      TXN_GUIPaper: 'E', // 預設為電子發票
      PLU_TaxType: '1', // 預設為應稅
      INV_NoneTax: '0', // 預設為正常
      GUI_DingType: guiDingType, // 根據 ECR_Type 判斷
    }];
    this.detailEditData = [{
      _TABLE_KEY: `detail_${Date.now()}`,
      status: 'insert',
    }];
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

  /** 處理換開發票資料異動 - 監聽日期變更 */
  onChangeEditDataChange(data: (TLS2J030Data & { status?: string })[]) {
    this.changeEditData = data;

    // 檢查是否有資料且日期已選擇
    if (data.length > 0) {
      const record = data[0];
      const selectedDate = record.TXN_Date;

      // 只有當日期存在且與上次處理的日期不同時才調用 API
      if (selectedDate && selectedDate !== this.lastProcessedDate && this.currentEcrNo) {
        // 日期變更時自動調用 getNextGUINo
        this.getNextGUINo(selectedDate);
      } else if (selectedDate && selectedDate !== this.lastProcessedDate && !this.currentEcrNo) {
        // 如果沒有 ECR_No，嘗試從預設 IP 查詢
        // 這裡可以根據需要調整 IP 來源
        const defaultIP = '192.168.1.1'; // 或從其他地方取得
        this.queryEcrNo(defaultIP);
      }
    }
  }

  /** 查詢來源發票 */
  querySourceInvoice() {
    const txnGuiBegNo = this.dataForm.get('TXN_GUIBegNo')?.value;
    if (!txnGuiBegNo) {
      this.messageService.warnBubble('請輸入來源發票號碼', '警告');
      return;
    }
    this.queryLoading = true;
    const payload = {
      TXN_GUIBegNo: txnGuiBegNo
    };
    this.tls2j030Service
      .queryTLS2J030TXN_GUI(payload)
      .pipe(finalize(() => (this.queryLoading = false)))
      .subscribe({
        next: (res) => {
          if (res?.Status === '0000') {
            this.data = res.Data || [];
            if (this.data.length === 0) {
              this.messageService.infoBubble('查無資料', '查詢結果');
              this.sourceInvoiceData = null;
            } else {
              // 儲存第一筆來源發票資料
              this.sourceInvoiceData = this.data[0] || null;
              this.messageService.successBubble('查詢成功');
              this.initializeEditData();

              // 初始化時先查詢 ECR_No (如果來源發票有 ECR_No 或 IP 資訊)
              if (this.sourceInvoiceData) {
                const sourceData = this.sourceInvoiceData as TLS2J030Data & { ECR_No?: string; ECR_IP?: string; IP?: string };
                const ecrNo = sourceData.ECR_No;
                const ip = sourceData.ECR_IP || sourceData.IP;

                if (ecrNo) {
                  this.currentEcrNo = ecrNo;
                } else if (ip) {
                  this.queryEcrNo(ip);
                }
              }
            }
          } else {
            this.messageService.errorBubble('查詢失敗');
            this.sourceInvoiceData = null;
          }
        },
      });
  }

  /** 送出 */
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.querySourceInvoice();
    });
  }
}
