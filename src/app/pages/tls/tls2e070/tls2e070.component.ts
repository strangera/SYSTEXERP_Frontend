import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Tls2e070Data, Tls2e070QueryBody, Tls2e070QueryRecEstBody, Tls2e070Service } from '@service/api/tls/tls2e070.service';
import { getSYS1000, getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { formatDate, formatDateTime, formatYN, formatYYYYMM, ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { convertDateToYYYYMM } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';

// 2.2.14.7 專櫃帳款結算作業
@Component({
  selector: 'app-tls2e070',
  templateUrl: './tls2e070.component.html',
  standalone: true,
  imports: [ButtonModule, AsyncPipe, TableReportComponent, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarComponent, DropdownComponent, TranslateModule]
})
export class TLS2E070Component extends BasicQueryPageComponent<Tls2e070Data> implements OnInit {
  /** 1. 查詢結果 (Query) 欄位 */
  readonly queryColumns: ReportColumn[] = [
    { field: 'cls_Month', header: '結算年月', visible: true, format: formatYYYYMM },
    { field: 'money_type', header: '結帳方式', visible: true, format: (value) => getSYS1000('money_type', value) },
    { field: 'cls_termno', header: '結算期別', visible: true },
    { field: 'sale_proc_date', header: '結帳日期', visible: true, format: formatDate },
    { field: 'sale_proc_USR_Name', header: '結帳人員', visible: true },
    { field: 'sale_lock', header: '是否鎖定', visible: true, format: formatYN },
    { field: 'sale_lock_date', header: '鎖定日期', visible: true, format: formatDate },
    { field: 'sale_lock_USR_Name', header: '鎖定人員', visible: true },
  ];

  /** 2. 試算紀錄 (Record) 欄位 */
  readonly recordColumns: ReportColumn[] = [
    { field: 'CRT_Date', header: '試算日期', visible: true, format: formatDateTime },
    { field: 'sam_yyymm', header: '試算年月', visible: true, format: formatYYYYMM },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true },
    { field: 'remarks', header: '試算說明', visible: true },
    { field: 'CRT_USR_No', header: '執行者', visible: true },
  ];

  /** 3. 結算檢查 (Settle) 欄位 */
  readonly settleColumns: ReportColumn[] = [
    { field: 'step_num', header: '檢查順序', visible: true },
    { field: 'step_desc', header: '檢查步驟', visible: true },
    // { field: 'master_key', header: '主鍵/關鍵碼', visible: true },
    { field: 'isPass', header: '是否通過', visible: true },
    { field: 'check_result', header: '檢查明細', visible: true },
  ];

  tlt_noOptions = this.dropdown.queryTltTalent();
  tlt_floorOptions = this.dropdown.querySys3900();
  sam_termnoOptions: { value: number, label: string }[] = []; // 期別選項
  money_typeOptions = getSYS1000Options('money_type');

  // 將 data 型別改為 any[] 以容納不同結構的資料
  data: any = [];
  // columns 不再固定，初始化為空或預設查詢欄位
  columns: ReportColumn[] = [];

  queryForm = this.formBuilder.nonNullable.group({
    PageSize: [30],
    PageIndex: [1],
    sam_yyymm: [new Date(), Validators.required],
    // 試算
    money_type: [this.money_typeOptions[2]?.value || null as string | null],
    sam_termno: [1],
    tlt_no: [null],
  });
  totalRecords = 0;
  historyRequestBody: any;
  isSettle = false;

  constructor(
    public readonly tls2e070Service: Tls2e070Service,
    private readonly dropdown: DropdownApiService,
    private readonly datePipe: DatePipe
  ) {
    super();
    // 預設欄位為查詢結果欄位
    this.columns = this.queryColumns;
  }

  ngOnInit(): void {
    this.initializePage('TLS2E070');
    this.setupFormLinkage(); // 設定表單聯動
  }

  /**
   * 設定 money_type 與 sam_termno 的聯動邏輯
   */
  private setupFormLinkage(): void {
    this.queryForm.controls.money_type.valueChanges.pipe(untilDestroyed(this)).subscribe(moneyType => {
      this.updateSamTermnoOptions(moneyType);
      // 重設 sam_termno，避免選了不合法的組合
      this.queryForm.controls.sam_termno.setValue(1);
    });

    // 初始載入時，如果 money_type 有預設值，也要更新 sam_termno 選項
    const initialMoneyType = this.queryForm.controls.money_type.value;
    if (initialMoneyType) {
      this.updateSamTermnoOptions(initialMoneyType);
    }
  }

  private readonly SAM_TERMNO_MAP = {
    '10': [1, 2, 3],
    '15': [1, 2],
    '30': [1]
  };
  /**
   * 根據 money_type 更新 sam_termno 的選項
   * @param moneyType 結帳方式的值 (e.g., "10", "15", "30")
   */
  private updateSamTermnoOptions(moneyType: string | null): void {
    if (moneyType && this.SAM_TERMNO_MAP[moneyType as keyof typeof this.SAM_TERMNO_MAP]) {
      // 根據 money_type 取得對應的期數陣列 (e.g., [1, 2, 3])
      const termNumbers = this.SAM_TERMNO_MAP[moneyType as keyof typeof this.SAM_TERMNO_MAP];
      // 轉換成 Dropdown 需要的格式 { label: string, value: number }
      this.sam_termnoOptions = termNumbers.map(num => ({
        label: `${num}`,
        value: num
      }));
    } else {
      this.sam_termnoOptions = [];
    }
  }

  /**
   * 1. 執行查詢 (onSubmit) - 顯示結算鎖定紀錄
   * @param frm 表單
   */
  onSubmit(frm: FormGroup) {
    this.columns = this.queryColumns;
    this.isSettle = false;
    this.handleSubmit(frm, () => {
      const body = {
        ...frm.value,
        sam_yyymm: this.datePipe.transform(frm.value.sam_yyymm, 'yyyyMM'),
      } as Tls2e070QueryBody;
      this.tls2e070Service.queryTLS2E070(body).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(res => {
        this.data = res.Data;
        this.totalRecords = res.TotalCount;
        this.historyRequestBody = body;
      });
    });
  }

  /**
   * 2. 執行結算 (onSettle) - 顯示結算檢查結果
   */
  onSettle(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      if (!frm.value.money_type || !frm.value.sam_termno) {
        this.messageService.errorBubble('請選擇結帳方式與帳次');
        this.loading = false;
        return;
      }
      // 1. 設定欄位為結算檢查欄位
      this.columns = this.settleColumns;
      this.isSettle = true;
      this.loading = true;
      const body = {
        ...frm.value,
        sam_yyymm: this.datePipe.transform(frm.value.sam_yyymm, 'yyyyMM'),
        sam_termno: frm.value.sam_termno as number,
        money_type: frm.value.money_type
      } as Tls2e070QueryRecEstBody;

      this.tls2e070Service.estTLS2E070(body).pipe(finalize(() => { this.loading = false; this.loading = false }), untilDestroyed(this)).subscribe(res => {
        this.data = res.Data;
        this.totalRecords = res.TotalCount;
        if (res.Status === '0000') {
          this.messageService.successBubble(res.Message || '結算成功');
        } else if (res.Status === '9999') {
          this.messageService.errorBubble(res.Message || '結算失敗');
        }
      });
    });
  }

  /**
   * 3. 查詢試算紀錄 (onQueryRecord) - 顯示試算紀錄列表
   * * @param frm 表單
   */
  onQueryRecord(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      if (!frm.value.money_type || !frm.value.sam_termno) {
        this.messageService.errorBubble('請選擇結帳方式與帳次');
        this.loading = false;
        return;
      }
      // 1. 設定欄位為試算紀錄欄位
      this.columns = this.recordColumns;
      this.isSettle = false;
      this.loading = true;
      const body = {
        ...frm.value,
        sam_yyymm: convertDateToYYYYMM(frm.value.sam_yyymm),
        sam_termno: frm.value.sam_termno as number,
        money_type: frm.value.money_type
      } as Tls2e070QueryRecEstBody;

      this.tls2e070Service.queryRecTLS2E070(body).pipe(finalize(() => { this.loading = false; this.loading = false }), untilDestroyed(this)).subscribe(res => {
        this.data = res.Data;
        this.totalRecords = res.TotalCount;
        this.historyRequestBody = body;
      });
    });
  }
  onUpdate(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      if (!frm.value.money_type || !frm.value.sam_termno) {
        this.messageService.errorBubble('請選擇結帳方式與帳次');
        this.loading = false;
        return;
      }
      const body = {
        ...frm.value,
        sam_yyymm: convertDateToYYYYMM(frm.value.sam_yyymm),
        sam_termno: frm.value.sam_termno as number,
        money_type: frm.value.money_type
      }
      this.tls2e070Service.updateTLS2E070(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
        this.messageService.successBubble(res.Message);
        this.onSubmit(this.queryForm);
      });
    })
  }
}
