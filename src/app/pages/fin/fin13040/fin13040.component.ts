import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Fin13040Service } from '@service/api/fin/fin13040.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputNumberRangeComponent } from '@shared/componentkit/input-number-range/input-number-range.component';
import { InputTextRangeComponent } from '@shared/componentkit/input-text-range/input-text-range.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { createPaginationConfig } from '@shared/componentkit/table2/table2.model';
import { AccordionModule } from 'primeng/accordion';
import { CalendarModule } from 'primeng/calendar';
import { Column, formatAmount } from 'src/app/shared/componentkit/table/table.model';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableReportComponent } from '../../../shared/componentkit/table-report/table-report.component';
import { YearMonthComponent } from '../fin11020/query-year-month/query-year-month.component';
//1.1.4.3 形成申報書
@Component({
  selector: 'app-fin13040',
  templateUrl: './fin13040.component.html',
  styleUrl: './fin13040.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarComponent,
    CommonModule,
    DropdownComponent,
    TableReportComponent,
    TranslateModule,
    InputTextComponent,
    CalendarRangeComponent,
    YearMonthComponent,
    CalendarModule,
    MultiSelectComponent,
    InputNumberRangeComponent,
    InputTextRangeComponent
  ],
})
export class FIN13040Component extends BasicQueryPageComponent<any> implements OnInit {
  /**
   * 取得當前或下一個雙數月的日期物件
   */
  private getEvenMonthDate(): Date {
    const now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth() + 1; // 1-12
    if (month % 2 !== 0) {
      month += 1;
      if (month > 12) {
        month = 2;
        year += 1;
      }
    }
    // 設定為該月1日
    return new Date(year, month - 1, 1);
  }

  queryForm = this.formBuilder.group({
    InvoiceType: [[]],
    GUI_Track: ['', [Validators.maxLength(2)]],
    InvoiceNo_S: ['', [Validators.maxLength(8)]],
    InvoiceNo_E: ['', [Validators.maxLength(8)]],
    InvoiceDate_S: [''],
    InvoiceDate_E: [''],
    InvoiceDateYM: [''],
    INV_DeclareYM: ['', [Validators.required]],
    INV_Data_YM_S: [''],
    INV_Data_YM_E: [''],
    Buyer_Uniform: [''],
    PUR_TaxType: [[]],
    PUR_Amt_S: [null],
    PUR_Amt_E: [null],
    PUR_Tax_S: [null],
    PUR_Tax_E: [null],
    Voucher_No_S: [''],
    Voucher_No_E: [''],
    AssetType: [[]],
    SAL_Type: [[]],
    ...createPaginationConfig([{ field: 'InvoiceType', order: 1 }]),
  });
  data: any[] = [];
  totalRecords = 0;
  footerData: any = {};
  InvoiceType_Options: { label: string; value: string }[] = [];
  SAL_Type_Options = getSYS1000Options('SAL_Type');
  taxTypeOptions = getSYS1000Options('PUR_TaxType');
  AssetNoteOptions = getSYS1000Options('AssetType');
  Buyer_Uniform_Options: { label: string; value: string }[] = [];
  columns: Column[] = [
    { field: 'InvoiceType', header: '發票格式', visible: true },
    { field: 'InvoiceNumber', header: '發票號碼', visible: true },
    { field: 'InvoiceDate', header: '發票日期', visible: true },
    { field: 'INV_DeclareYM', header: '申報年月', visible: true },
    { field: 'Buyer_Uniform', header: '買受人統一編號', visible: true },
    { field: 'PUR_TaxType', header: '課稅別', visible: true },
    { field: 'PUR_Net', header: '未稅金額', visible: true, format: formatAmount },
    { field: 'PUR_Tax', header: '稅額', visible: true, format: formatAmount },
    { field: 'PUR_Amt', header: '總金額', visible: true, format: formatAmount },
    { field: 'Voucher_No', header: '傳票編號', visible: true },
    { field: 'AssetType', header: '資產註記', visible: true },
    { field: 'SAL_Type', header: '使用別', visible: true },
  ];
  constructor(
    private dropDownListService: DropDownListService,
    private fin13040Service: Fin13040Service
  ) {
    super();
  }
  ngOnInit(): void {
    this.initializePage('FIN13040', '/FIN/FIN13040cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadBuyerUniformOptions();
    this.loadInvoiceTypeOptions();
    // 設定 INV_DeclareYM 預設為最近的雙數月（若當月為單月，跳到下個月）
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    if (currentMonth % 2 !== 0) {
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    const dp = new DatePipe('en-US');
    this.queryForm.get('INV_DeclareYM')?.setValue(dp.transform(currentDate, 'yyyyMM'));

  }

  loadGuiTrackOptions(event: any): void {
    // 根據申報年月載入字軌下拉（參考 FIN15010）
    this.dropDownListService.queryPOS1018_GUI_TRACK_DropDownList({
      GUI_YYMM: event,
      MID: 0,
      STO_No: '10',
      GUI_Type: this.queryForm.controls.InvoiceType.value ?? []
    }).pipe(untilDestroyed(this)).subscribe(r => {
      // 若回傳結構不同，嘗試從 r.Data.GuiTracks 取得陣列
      const tracks = r?.Data?.GuiTracks ?? r?.Data ?? [];
      // 不直接存到 control，僅供其他下拉使用；若需要可存到 this.guiTrackOptions
      console.log('[loadGuiTrackOptions] tracks', tracks);
    });
  }

  /** 載入買受人統一編號下拉清單 */
  loadBuyerUniformOptions(): void {
    this.dropDownListService
      .queryPOS2013_DropDownList({})
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res) => {
          const data = res?.Data ?? [];
          this.Buyer_Uniform_Options = data.map((item: any) => ({
            label: `${item.No} - ${item.Name}`,
            value: item.No,
          }));
        },
      });
  }

  /** 載入發票類型下拉清單 */
  loadInvoiceTypeOptions(): void {
    this.dropDownListService
      .queryTDS1007_DropDownList({
        mid: 0,
      })
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res) => {
          const allowed = ['31', '32', '35'];
          const data = res?.Data?.INV_GUITypes ?? [];
          this.InvoiceType_Options = data
            .filter((x: any) => allowed.includes(x.INV_GUIType))
            .map((x: any) => ({
              label: `${x.INV_GUIType} - ${x.INV_GUIName}`,
              value: x.INV_GUIType,
            }));
        },

      });
  }

  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const v = form.value;

      const dp = (d: any, key: string) => {
        if (!(d instanceof Date)) return d === '' ? null : d;
        const date = new Date(d);
        if (key.toLowerCase().includes('ym')) {

          const y = date.getFullYear();
          const m = String(date.getMonth() + 1).padStart(2, '0');
          return `${y}${m}`;
        }
        return date.toISOString().split('T')[0];
      };

      const payload = Object.fromEntries(
        Object.entries(v).map(([k, val]) => [k, dp(val, k)])
      );

      this.fin13040Service
        .queryFIN13040(payload)
        .pipe(untilDestroyed(this))
        .subscribe({
          next: (res) => {
            this.data = res?.Data?.Data ?? [];
            this.totalRecords = res?.Data?.TotalCount ?? 0;
            this.footerData = {};
            this.footerData['PUR_Net'] = res?.Data?.TotalNet ?? 0;
            this.footerData['PUR_Tax'] = res?.Data?.TotalTax ?? 0;
            this.footerData['PUR_Amt'] = res?.Data?.TotalAmt ?? 0;
            // 保存目前查詢條件，供 CRU 返回時還原
            this.queryStateService.setQueryState(this.ProgNo, v);
          },
          complete: () => (this.loading = false),
        });
    });
  }

}
