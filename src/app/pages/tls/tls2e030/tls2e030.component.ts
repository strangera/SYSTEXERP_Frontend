import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Tls2e030Data, Tls2e030EstBody, Tls2e030QueryBody, Tls2e030Service } from '@service/api/tls/tls2e030.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { formatDate, formatYYYYMM, ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { DropdownApiService } from './../../../service/utility/dropdown-api.service';

// 2.2.14.3 專櫃帳款試算作業
@Component({
  selector: 'app-tls2e030',
  templateUrl: './tls2e030.component.html',
  standalone: true,
  imports: [TableReportComponent, AsyncPipe, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarComponent, DropdownComponent, TranslateModule]
})
export class TLS2E030Component extends BasicQueryPageComponent<Tls2e030Data> implements OnInit {
  // 定義查詢結果欄位配置
  private readonly QUERY_COLUMNS: ReportColumn[] = [
    { field: 'CRT_Date', header: '試算日期', visible: true, format: formatDate },
    { field: 'sam_yyymm', header: '試算年月', visible: true, format: formatYYYYMM },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true },
    { field: 'remarks', header: '試算說明', visible: true },
    { field: 'CRT_USR_No', header: '執行者', visible: true },
  ];

  // 定義試算 Log 欄位配置
  private readonly LOG_COLUMNS: ReportColumn[] = [
    { field: 'step_num', header: '檢查順序', visible: true },
    { field: 'step_desc', header: '檢查步驟', visible: true },
    // { field: 'master_key', header: '主鍵/關鍵碼', visible: true },
    { field: 'isPass', header: '是否通過', visible: true },
    { field: 'check_result', header: '檢查明細', visible: true },
  ];

  // 完整的期別選項（基於您的描述）
  private readonly SAM_TERMNO_MAP = {
    '10': [1, 2, 3],
    '15': [1, 2],
    '30': [1]
  };
  totalRecords = 0;
  money_typeOptions = getSYS1000Options('money_type');
  sam_termnoOptions: { value: number, label: string }[] = []; // 期別選項
  // 將 data 型別改為 any[] 以容納兩種不同結構的資料
  data: any[] = [];

  // 新增：當前使用的欄位配置
  currentColumns: ReportColumn[] = [];

  queryForm = this.formBuilder.nonNullable.group({
    PageSize: [30],
    PageIndex: [1],
    SortBy: [[{ field: 'tlt_no', order: 1 }]],
    sam_yyymm: [new Date(), [Validators.required]],
    money_type: [this.money_typeOptions[2]?.value || null as string | null, [Validators.required]],
    sam_termno: [1, [Validators.required]],
    tlt_no: [null],
  });
  tlt_noOptions = this.dropdown.queryTltTalent();
  tlt_floorOptions = this.dropdown.querySys3900();
  historyRequestBody: any | null = null;

  // 注入 FormBuilder 和 MessageService 以確保功能完整
  constructor(
    public readonly tls2e030Service: Tls2e030Service,
    private readonly dropdown: DropdownApiService,
    private readonly datePipe: DatePipe
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2E030');
    this.setupFormLinkage(); // 設定表單聯動
    // 預設使用查詢欄位
    this.currentColumns = this.QUERY_COLUMNS;
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
  onSubmit(frm: FormGroup) {
    const body = {
      ...frm.value,
      sam_yyymm: this.datePipe.transform(frm.value.sam_yyymm, 'yyyyMM'),
      sam_termno: frm.value.sam_termno as number, // 確保型別是 number
      money_type: frm.value.money_type
    } as Tls2e030QueryBody; // 轉換為正確的 Request Body 型別
    this.handleSubmit(frm, () => {
      // 1. 切換顯示查詢欄位
      this.currentColumns = this.QUERY_COLUMNS;

      // 2. 執行查詢
      this.tls2e030Service.queryTls2e030(body).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(res => {
        this.data = res.Data; // 這裡的資料型別是 Tls2e030Data[]
        this.totalRecords = res.TotalCount;
        this.historyRequestBody = body;
      })
    });
  }
  onSam(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const baseBody = {
        ...frm.value,
        sam_yyymm: this.datePipe.transform(frm.value.sam_yyymm, 'yyyyMM'),
        sam_termno: frm.value.sam_termno as number,
        money_type: frm.value.money_type,
        isForce: false // 預設先不強制
      } as Tls2e030EstBody;

      this.executeTrialCalculation(baseBody);
    });
  }
  /**
 * 執行試算的邏輯封裝
 * @param body 請求參數
 */
  private executeTrialCalculation(body: Tls2e030EstBody) {
    this.loading = true;

    this.tls2e030Service.estTls2e030(body).pipe(finalize(() => { this.loading = false; }), untilDestroyed(this)).subscribe(res => {
      // 判斷是否為「已存在」的特殊代碼 (假設後端 ReturnCode 為 'EXISTED')
      if (res.Status === 'EXISTED') {
        this.messageService.confirm({
          header: '確認重算',
          message: res.Message || `已有試算資料，是否重新計算?`,
          accept: () => {
            // 使用者同意重算，帶入 isForce = true 再次執行
            this.executeTrialCalculation({ ...body, isForce: true });
          },
        });
        return; // 中斷，不繼續跑後面的顯示 logic
      }

      // 2. 處理「執行失敗」 (例如：9999, 或者 ErrCode != 0)
      // 根據你後端的邏輯，失敗時會回傳 ErrMsg 並帶上檢查 Log 列表
      if (res.Status !== '0000') {
        this.messageService.errorBubble(res.Message || '試算失敗，請檢查下方明細');

        // 即便失敗也要顯示 Log，讓使用者知道哪一步錯了
        this.currentColumns = this.LOG_COLUMNS;
        this.data = res.Data || [];
        this.totalRecords = this.data.length;
        return;
      }

      // 3. 正常的試算完成 (0000)
      this.messageService.successBubble(res.Message || '試算完成');
      this.currentColumns = this.LOG_COLUMNS;
      this.data = res.Data || [];
      this.totalRecords = this.data.length;
    });
  }
}
