import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Tls2e020Data, Tls2e020QueryBody, Tls2e020Service } from '@service/api/tls/tls2e020.service'; // 確保 Tls2e020QueryBody 已被引入
import { getSYS1000, getSYS1000Options } from '@service/system/sys1000.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { convertDateToYYYYMM, formatDate, formatYYYYMM } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';

@Component({
  selector: 'app-tls2e020',
  templateUrl: './tls2e020.component.html',
  standalone: true,
  imports: [TableReportComponent, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarComponent, DropdownComponent, TranslateModule]
})
export class TLS2E020Component extends BasicQueryPageComponent<Tls2e020Data> implements OnInit {
  money_typeOptions = getSYS1000Options('money_type');
  queryForm = this.formBuilder.nonNullable.group({
    sam_yyymm: [new Date(), [Validators.required]], // 查詢年月
    money_type: [this.money_typeOptions[2]?.value || null as string | null, [Validators.required]], // 結帳方式 (使用 string|null 來匹配後端)
    sam_termno: [1, [Validators.required]], // 期別 (使用 number|null)
    PageSize: [30],
    PageIndex: [1],
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
    { field: 'CRT_Date', header: '關帳時間', visible: true, format: formatDate },
    { field: 'CRT_USR_No', header: '關帳者', visible: true },
    { field: 'CRT_USR_Name', header: '關帳者姓名', visible: true },
  ];
  sam_termnoOptions: { value: number, label: string }[] = []; // 期別選項

  constructor(
    public readonly tls2e020Service: Tls2e020Service
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
    // 1. 取得初始值並立即更新下拉選單內容
    const initialMoneyType = this.queryForm.controls.money_type.value;
    if (initialMoneyType) {
      this.updateSamTermnoOptions(initialMoneyType);
    }

    // 2. 監聽後續變更
    this.queryForm.controls.money_type.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(moneyType => {
        const oldTermno = this.queryForm.controls.sam_termno.value;
        this.updateSamTermnoOptions(moneyType);

        if (moneyType) {
          // 檢查原本選的期數是否還在「新」的選項中
          const isStillValid = this.sam_termnoOptions.some(opt => opt.value === oldTermno);

          // 只有當原本的值失效時，才強制重置為 1
          // 這樣你在手動選 2 的時候，就不會因為 updateValueAndValidity 而被重置回 1
          if (!isStillValid) {
            this.queryForm.controls.sam_termno.setValue(1, { emitEvent: false });
          }
        } else {
          this.queryForm.controls.sam_termno.setValue(null as any, { emitEvent: false });
        }
      });
  }

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
    // 移除必填驗證
    ['money_type', 'sam_termno'].forEach(key => {
      const control = this.queryForm.get(key);
      control?.clearValidators();
      control?.updateValueAndValidity({ emitEvent: false });
    });

    this.handleSubmit(frm, () => {
      const val = frm.value;
      const body = {
        ...val,
        sam_yyymm: convertDateToYYYYMM(val.sam_yyymm),
        // 修正：如果沒選值就傳 null 或 undefined，不要強轉成 0
        sam_termno: val.sam_termno ? Number(val.sam_termno) : null,
        money_type: val.money_type ? val.money_type : null
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
    this.queryForm.controls.money_type.updateValueAndValidity();
    this.queryForm.controls.sam_termno.updateValueAndValidity();
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
      money_type: frm.value.money_type as number,
      tlt_no: ''
    }

    this.tls2e020Service.executeTls2e020(body).pipe(finalize(() => this.settleLoding = false), untilDestroyed(this)).subscribe(res => {
      this.messageService.successBubble(`${res.Data.ErrMsg}`);
    });
  }
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
