import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { CommonModule } from '@angular/common';
import { createPaginationConfig } from '@shared/componentkit/table2/table2.model';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { CalendarModule } from 'primeng/calendar';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { InputNumberRangeComponent } from '@shared/componentkit/input-number-range/input-number-range.component';
import { InputTextRangeComponent } from '@shared/componentkit/input-text-range/input-text-range.component';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { Column, formatAmount } from 'src/app/shared/componentkit/table/table.model';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { Fin13040Service } from '@service/api/fin/fin13040.service';
import { finalize } from 'rxjs';
import { environment } from 'src/environments/environment';
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
    TableComponent,
    TranslateModule,
    InputTextComponent,
    CalendarRangeComponent,
    CalendarModule,
    MultiSelectComponent,
    InputNumberRangeComponent,
    InputTextRangeComponent
  ],
})
export class FIN13040Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    InvoiceType: [[]],
    GUI_Track: ['', [Validators.maxLength(2)]],
    InvoiceNo_S: ['', [Validators.maxLength(8)]],
    InvoiceNo_E: ['', [Validators.maxLength(8)]],
    InvoiceDate_S: [''],
    InvoiceDate_E: [''],
    InvoiceDateYM: [''],
    INV_DeclareYM: [new Date(), [Validators.required]],
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
  btnLoading = false;
  btnLoading2 = false;
  data: any[] = [];
  totalRecords = 0;
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
          },
          complete: () => (this.loading = false),
        });
    });
  }
  onExportPDF(): void {
    this.exportReport(false);
  }

  onExportExcel(): void {
    this.exportReport(true);
  }

  lastExportUrl: string | null = null;
  private exportReport(isExcel: boolean): void {
    if (isExcel) this.btnLoading2 = true;
    else this.btnLoading = true;

    const v = this.queryForm.value;
    const payload = {
      PageSize: 0,
      PageIndex: 0,
      OrderBy: '',
      Offset: 0,
      SortBy: [],
      MID: 0,
      STO_No: '10',
      ID: 0, // 匯出整體報表時可給 0
    };

    console.log('[PrintFIN13040 payload]', payload);

    this.fin13040Service
      .printFIN13040(payload)
      .pipe(
        finalize(() => {
          if (isExcel) this.btnLoading2 = false;
          else this.btnLoading = false;
        })
      )
      .subscribe({
        next: (res: any) => {
          if (res?.Status === '0000' && res?.Data?.Print_URL) {
            const url = res.Data.Print_URL;
            const fullUrl = `${environment.ApiUrl.replace(/\/$/, '')}${url}`;
            this.lastExportUrl = fullUrl;

            const filename = decodeURIComponent(
              url.split('/').pop() ?? (isExcel ? '三聯式發票.xlsx' : '三聯式發票.pdf')
            );

            const a = document.createElement('a');
            a.href = fullUrl;
            a.setAttribute('download', filename);
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            this.messageService.successBubble(`匯出 ${isExcel ? 'Excel' : 'PDF'} 成功`);
          } else if (res?.body instanceof Blob) {
            const blob = res.body;
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `三聯式發票匯出.${isExcel ? 'xlsx' : 'pdf'}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            this.messageService.successBubble(`匯出 ${isExcel ? 'Excel' : 'PDF'} 成功`);
          } else {
            this.messageService.errorBubble(res?.Message ?? '匯出失敗');
          }
        },

      });
  }

}
