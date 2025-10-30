import { DropdownApiService } from './../../../service/utility/dropdown-api.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, convertDateToYYYYMM } from '@shared/componentkit/table/table.model';
import { Tls2e030Data, Tls2e030EstBody, Tls2e030QueryBody, Tls2e030Service } from '@service/api/tls/tls2e030.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { AsyncPipe } from '@angular/common';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { finalize } from 'rxjs';
import { formatDate, formatYYYYMM } from '@shared/componentkit/table-report/table-report.model';

// 2.2.14.3 專櫃帳款試算作業
@Component({
  selector: 'app-tls2e030',
  templateUrl: './tls2e030.component.html',
  standalone: true,
  imports: [TableReportComponent, AsyncPipe, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarComponent, DropdownComponent, TranslateModule]
})
export class TLS2E030Component extends BasicQueryPageComponent<Tls2e030Data> implements OnInit {
  // 完整的期別選項（基於您的描述）
  private readonly SAM_TERMNO_MAP = {
    '10': [1, 2, 3],
    '15': [1, 2],
    '30': [1]
  };
  totalRecords = 0;
  money_typeOptions = getSYS1000Options('money_type');
  sam_termnoOptions: { value: number, label: string }[] = []; // 期別選項
  data: Tls2e030Data[] = [];
  columns: Column[] = [
    { field: 'CRT_Date', header: '試算日期', visible: true, format: formatDate },
    { field: 'sam_yyymm', header: '試算年月', visible: true, format: formatYYYYMM },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true },
    { field: 'remarks', header: '試算說明', visible: true },
    { field: 'CRT_USR_No', header: '執行者', visible: true },
  ];
  queryForm = this.formBuilder.nonNullable.group({
    PageSize: [30],
    PageIndex: [1],
    SortBy: [[{ field: 'tlt_no', order: 1 }]],
    sam_yyymm: [new Date(), [Validators.required]],
    money_type: [this.money_typeOptions[2]?.value || null as string | null, [Validators.required]],
    sam_termno: [1, [Validators.required]],
    tlt_floor: [null],
    tlt_no: [null],
  });
  tlt_noOptions = this.dropdown.queryTltTalent();
  tlt_floorOptions = this.dropdown.querySys3900();
  historyRequestBody: any | null = null;
  constructor(
    public readonly tls2e030Service: Tls2e030Service,
    private readonly dropdown: DropdownApiService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2E030');
    this.setupFormLinkage(); // 設定表單聯動
  }/**
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
      sam_yyymm: convertDateToYYYYMM(frm.value.sam_yyymm),
      sam_termno: frm.value.sam_termno as number, // 確保型別是 number
      money_type: frm.value.money_type
    } as Tls2e030QueryBody; // 轉換為正確的 Request Body 型別
    this.handleSubmit(frm, () => {
      this.tls2e030Service.queryTls2e030(frm.value).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(res => {
        this.data = res.Data;
        this.totalRecords = res.TotalCount;
        this.historyRequestBody = body;
      })
    });
  }
  loading2 = false;
  onSam(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body = {
        ...frm.value,
        sam_yyymm: convertDateToYYYYMM(frm.value.sam_yyymm),
        sam_termno: frm.value.sam_termno as number, // 確保型別是 number
        money_type: frm.value.money_type
      } as Tls2e030EstBody; // 轉換為正確的 Request Body 型別
      this.loading2 = true;
      this.tls2e030Service.estTls2e030(body).pipe(finalize(() => { this.loading = false; this.loading2 = false }), untilDestroyed(this)).subscribe(res => {
        this.messageService.successBubble(res.Message);
      })
    });
  }
}
