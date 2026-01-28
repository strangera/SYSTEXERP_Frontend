import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { QueryTLS2F030Data, Tls2f030Service } from '../../../service/api/tls/tls2f030.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { Column, formatAmount, formatYYYYMM } from '../../../shared/componentkit/table/table.model';

// 2.2.15.3 專櫃進項發票未開立查詢作業
@Component({
  selector: 'app-tls2f030',
  templateUrl: './tls2f030.component.html',
  styleUrl: './tls2f030.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarComponent,
    DropdownComponent,
    MultiSelectComponent,
    ButtonComponent,
    TableComponent,
    TranslateModule,
    AsyncPipe
  ]
})
export class TLS2F030Component extends BasicQueryPageComponent<QueryTLS2F030Data> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    sam_yyymm: [new Date(), [Validators.required]], // 結帳年月
    money_type: ['30' as string | null], // 結帳方式，預設月結
    sam_termno: [1 as number | null], // 帳次，預設1
    floor_no: [[] as string[]], // 樓層
    // 分頁欄位
    pageSize: [40],
    pageIndex: [1],
    SortBy: [[{ field: 'tlt_no', order: 1 }]],
  });

  // 表格資料
  data: QueryTLS2F030Data[] = [];
  totalRecords = 0;

  // 總計資料 (映射到 columns 對應的欄位名稱)
  sumData: Record<string, number> | null = null;

  // 表格欄位定義
  columns: Column[] = [
    { field: 'tlt_no', header: '專櫃代碼', visible: true },
    { field: 'tlt_name', header: '專櫃名稱', visible: true },
    { field: 'sam_yyymm', header: '結帳年月', visible: true, format: formatYYYYMM },
    { field: 'money_type_desc', header: '結帳方式', visible: true },
    { field: 'sam_termno', header: '帳次', visible: true },
    { field: 'sam_ap_namt', header: '未稅金額', visible: true, format: formatAmount, align: 'right', isTotal: true },
    { field: 'sam_ap_tax', header: '稅額', visible: true, format: formatAmount, align: 'right', isTotal: true },
    { field: 'sam_ap_amt', header: '應開立發票金額', visible: true, format: formatAmount, align: 'right', isTotal: true },
    { field: 'balance', header: '餘額', visible: true, format: formatAmount, align: 'right', isTotal: true },
    { field: 'status', header: '狀況', visible: true },
  ];

  // 下拉選項
  money_typeOptions = getSYS1000Options('money_type');
  sam_termnoOptions: { value: number; label: string }[] = []; // 帳次選項
  floor_noOptions = this.dropdown.querySys3900();

  // 結帳方式與帳次的對應關係
  private readonly SAM_TERMNO_MAP: Record<string, number[]> = {
    '10': [1, 2, 3],
    '15': [1, 2],
    '30': [1]
  };

  constructor(
    private readonly tls2f030Service: Tls2f030Service,
    private readonly dropdown: DropdownApiService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2F030', undefined, this.queryForm, (form) => this.onSubmit(form));
    this.setupFormLinkage();
    // 初始載入時更新帳次選項
    this.updateSamTermnoOptions(this.queryForm.controls.money_type.value);
  }

  /**
   * 設定 money_type 與 sam_termno 的聯動邏輯
   */
  private setupFormLinkage(): void {
    this.queryForm.controls.money_type.valueChanges.pipe(untilDestroyed(this)).subscribe(moneyType => {
      this.updateSamTermnoOptions(moneyType);
      // 重設 sam_termno 為預設值 1
      this.queryForm.controls.sam_termno.setValue(moneyType ? 1 : null);
    });
  }

  /**
   * 根據 money_type 更新 sam_termno 的選項
   */
  private updateSamTermnoOptions(moneyType: string | null): void {
    if (moneyType && this.SAM_TERMNO_MAP[moneyType]) {
      const termNumbers = this.SAM_TERMNO_MAP[moneyType];
      this.sam_termnoOptions = termNumbers.map(num => ({
        label: `${num}`,
        value: num
      }));
    } else {
      this.sam_termnoOptions = [];
    }
  }

  private formatYearMonth(value: Date | null): string | null {
    if (!value) return null;
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    return `${year}${month}`;
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const rawValue = frm.getRawValue();

      const payload = {
        PageSize: rawValue.pageSize,
        PageIndex: rawValue.pageIndex,
        SortBy: rawValue.SortBy,
        sam_yyymm: this.formatYearMonth(rawValue.sam_yyymm),
        money_type: rawValue.money_type,
        sam_termno: rawValue.sam_termno,
        floor_no: rawValue.floor_no || [],
      };

      this.tls2f030Service.queryTLS2F030(payload)
        .pipe(
          finalize(() => this.loading = false),
          untilDestroyed(this)
        )
        .subscribe(res => {
          this.data = res.Data?.QueryData || [];
          this.totalRecords = res.TotalCount;
          // 映射 SumData 到 columns 對應的欄位名稱
          const sumDataRaw = res.Data?.SumData;
          if (sumDataRaw) {
            this.sumData = {
              sam_ap_namt: sumDataRaw.sum_sam_ap_namt,
              sam_ap_tax: sumDataRaw.sum_sam_ap_tax,
              sam_ap_amt: sumDataRaw.sum_sam_ap_amt,
              balance: sumDataRaw.sum_balance,
            };
          }
          this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
        });
    });
  }

}
