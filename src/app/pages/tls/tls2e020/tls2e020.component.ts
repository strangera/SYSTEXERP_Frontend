import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Tls2e020Data, Tls2e020QueryBody, Tls2e020Service } from '@service/api/tls/tls2e020.service'; // 確保 Tls2e020QueryBody 已被引入
import { getSYS1000, getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { ReportColumn } from '@shared/components/table-report/table-report.model';
import { convertDateToYYYYMM, formatDate, formatYYYYMM } from '@others/component/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarComponent } from '../../../shared/components/calendar/calendar.component';

@Component({
  selector: 'app-tls2e020',
  templateUrl: './tls2e020.component.html',
  standalone: true,
  imports: [AsyncPipe, TableReportComponent, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarComponent, DropdownComponent, TranslateModule]
})
export class TLS2E020Component extends BasicQueryPageComponent<Tls2e020Data> implements OnInit {
  money_typeOptions = getSYS1000Options('money_type');
  tltNoOptions$ = this.dropdown.queryTltTalent(); // 專櫃下拉（單選）
  queryForm = this.formBuilder.nonNullable.group({
    sam_yyymm: [new Date(), [Validators.required]], // 查詢年月
    money_type: [this.money_typeOptions[2]?.value || null as string | null, [Validators.required]], // 結帳方式 (使用 string|null 來匹配後端)
    sam_termno: [1, [Validators.required]], // 期別 (使用 number|null)
    tlt_no: ['', [Validators.maxLength(12)]], // 指定專櫃（可不選；不選=全部專櫃）
    pageSize: [1000],
    pageIndex: [1],
  });
  private readonly SAM_TERMNO_MAP = {
    '10': [1, 2, 3],
    '15': [1, 2],
    '30': [1]
  };

  totalRecords = 0;
  lastQueryBody: Tls2e020QueryBody | null = null;
  data: Tls2e020Data[] = [];
  columns: ReportColumn[] = [
    { field: 'sam_yyymm', header: '結算年月', visible: true, format: formatYYYYMM }, // 假設您有這個格式化函數
    { field: 'money_type', header: '結帳方式', visible: true, format: (value) => getSYS1000('money_type', value) },
    { field: 'sam_termno', header: '帳次', visible: true },
    { field: 'sam_type', header: '費用型態', visible: true, format: (value) => getSYS1000('sam_type', value) },
    { field: 'Final_Date', header: '關帳時間', visible: true, format: formatDate },
    { field: 'Final_USR_No', header: '關帳者', visible: true },
    { field: 'Final_USR_Name', header: '關帳者姓名', visible: true },
  ];
  sam_termnoOptions: { value: number, label: string }[] = []; // 期別選項

  constructor(
    public readonly tls2e020Service: Tls2e020Service,
    private dropdown: DropdownApiService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2E020');
    this.setupFormLinkage(); // 設定表單聯動
  }

  /**
   * 設定 money_type 與 sam_termno 的聯動邏輯
   */
  private setupFormLinkage(): void {
    // 1. 初始處理
    const initialMoneyType = this.queryForm.controls.money_type.value;
    this.updateSamTermnoOptions(initialMoneyType);

    // 2. 監聽變更
    this.queryForm.controls.money_type.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(moneyType => {
        // 先更新下拉選單的內容
        this.updateSamTermnoOptions(moneyType);

        if (moneyType) {
          // 有選結帳方式：檢查原本選的期數是否還在新的選項中
          const oldTermno = this.queryForm.controls.sam_termno.value;
          const isStillValid = this.sam_termnoOptions.some(opt => opt.value === oldTermno);

          if (!isStillValid) {
            // 如果原本的期數不在新選單裡，預設帶入該結帳方式的第一個期數（通常是 1）
            const defaultVal = this.sam_termnoOptions[0]?.value ?? null;
            this.queryForm.controls.sam_termno.setValue(defaultVal as any, { emitEvent: false });
          }
        } else {
          // 【核心修改】：當結帳方式被清空（刪掉）時，帳次直接清空
          // 因為是 nonNullable，這裡 setValue(null) 會根據定義轉為 null 或空
          this.queryForm.controls.sam_termno.setValue(null as any, { emitEvent: false });
        }
      });
  }

  private updateSamTermnoOptions(moneyType: string | null): void {
    if (moneyType && this.SAM_TERMNO_MAP[moneyType as keyof typeof this.SAM_TERMNO_MAP]) {
      const termNumbers = this.SAM_TERMNO_MAP[moneyType as keyof typeof this.SAM_TERMNO_MAP];
      this.sam_termnoOptions = termNumbers.map(num => ({ label: `${num}`, value: num }));
    } else {
      // 當結帳方式被清空時，選單選項也要清空
      this.sam_termnoOptions = [];
    }
  }

  onSubmit(frm: FormGroup) {
    this.queryForm.controls.money_type.clearValidators();
    this.queryForm.controls.sam_termno.clearValidators();
    this.queryForm.controls.money_type.updateValueAndValidity();
    this.queryForm.controls.sam_termno.updateValueAndValidity();
    this.handleSubmit(frm, () => {
      const val = frm.value;
      const body = {
        ...val,
        sam_yyymm: convertDateToYYYYMM(val.sam_yyymm),
        sam_termno: null,
        money_type: null
      } as Tls2e020QueryBody;

      this.tls2e020Service.queryTls2e020(body).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(res => {
        this.data = res.Data;
        this.totalRecords = res.TotalCount;
        this.lastQueryBody = body;
      });
    });
  }
  settleLoding = false;
  onSettle(frm: FormGroup) {
    this.queryForm.controls.money_type.setValidators([Validators.required]);
    this.queryForm.controls.sam_termno.setValidators([Validators.required]);
    // 指定專櫃：可不選（不選=全部專櫃），因此不加 required
    this.queryForm.controls.tlt_no.setValidators([Validators.maxLength(12)]);
    this.queryForm.controls.money_type.updateValueAndValidity();
    this.queryForm.controls.sam_termno.updateValueAndValidity();
    this.queryForm.controls.tlt_no.updateValueAndValidity();
    this.submitted = true;
    if (!frm.valid) {
      this.submitted = false;
      return;
    }

    this.settleLoding = true;

    const body = {
      ...frm.value,
      sam_yyymm: convertDateToYYYYMM(frm.value.sam_yyymm),
      sam_termno: frm.value.sam_termno as number,
      money_type: Number(frm.value.money_type),
      // 不選指定專櫃時送空字串，代表「全部專櫃」
      tlt_no: String(this.queryForm.controls.tlt_no.value ?? '').trim(),
    }

    this.tls2e020Service.executeTls2e020(body).pipe(finalize(() => this.settleLoding = false), untilDestroyed(this)).subscribe(res => {
      this.messageService.successBubble(`${res.Data.ErrMsg}`);
    });
  }
  // -----鎖定拿掉-----
  // lockLoding = false;
  // onLock(frm: FormGroup) {
  //   this.submitted = true;
  //   if (!frm.valid) {
  //     this.submitted = false;
  //     return;
  //   }
  //   this.lockLoding = true;
  //   const body = {
  //     ...frm.value,
  //     sam_yyymm: convertDateToYYYYMM(frm.value.sam_yyymm),
  //     money_type: frm.value.money_type,
  //     sam_termno: String(frm.value.sam_termno),
  //   }
  //   this.tls2e020Service.lockTls2e020(body).pipe(finalize(() => this.lockLoding = false), untilDestroyed(this)).subscribe(res => {
  //     this.messageService.successBubble(res.Message)
  //   })
  // }
}
