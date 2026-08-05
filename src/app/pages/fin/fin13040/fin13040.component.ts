import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Fin13040Service } from '@service/api/fin/fin13040.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { AutoCompleteComponent } from '@shared/components/auto-complete/auto-complete.component';
import { CalendarRangeComponent } from '@shared/components/calendar-range/calendar-range.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputNumberRangeComponent } from '@shared/components/input-number-range/input-number-range.component';
import { InputTextRangeComponent } from '@shared/components/input-text-range/input-text-range.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { MultiSelectComponent } from '@shared/components/multi-select/multi-select.component';
import { AddButton, formatAmount, formatYYYYMMDD, ReportColumn } from '@shared/components/table-report/table-report.model';
import { createPaginationConfig } from '@others/component/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { CalendarModule } from 'primeng/calendar';
import { finalize, map } from 'rxjs/operators';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { TableReportComponent } from '../../../shared/components/table-report/table-report.component';
import { YearMonthComponent } from '../fin11020/query-year-month.component';

//1.1.4.3 形成申報書
@Component({
  selector: 'app-fin13040',
  templateUrl: './fin13040.component.html',
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
    InputTextRangeComponent,
    AutoCompleteComponent
  ],
})
export class FIN13040Component extends BasicQueryPageComponent<any> implements OnInit {
  // --- 關鍵：將變數名稱恢復與 HTML 綁定一致 ---
  SAL_Type_Options = getSYS1000Options('T205');
  taxTypeOptions = getSYS1000Options('PUR_TaxType');
  AssetNoteOptions = getSYS1000Options('AssetType');
  Buyer_Uniform_Options: any[] = []; // 對應 HTML: [options]="Buyer_Uniform_Options"
  InvoiceType_Options: any[] = [];   // 對應 HTML: [options]="InvoiceType_Options"

  data: any[] = [];
  totalRecords = 0;
  lastQueryBody: any = null;
  footerData: any = {};

  addButton: AddButton[] = [
    {
      label: '列印', icon: 'pi pi-file-pdf',
      action: (row: any) => this.onPrint(row),
      disabled: () => !this.hasPermission(this.Actions.Query)
    },
    {
      label: '作廢', icon: 'pi pi-ban',
      action: (row: any) => this.onVoid(row),
      disabled: (row: any) => row?.INV_Cancel === 'Y' || !row?.CanEdit || !this.hasPermission(this.Actions.Edit)
    }
  ];

  queryFn = (body: any) => this.fin13040Service.queryFIN13040(body).pipe(
    map(res => ({
      Data: res?.Data?.Data ?? [],
      TotalCount: res?.Data?.TotalCount ?? 0,
      extra: res?.Data
    }))
  );

 editDisabled = (row: any) => !row?.CanEdit;

  queryForm = this.formBuilder.group({
    ...createPaginationConfig([{ field: 'InvoiceType', order: 1 }]),
    InvoiceType: [['35']],
    GUI_Track: [null, [Validators.maxLength(2)]],
    InvoiceNo_S: [null, [Validators.maxLength(8)]],
    InvoiceNo_E: [null, [Validators.maxLength(8)]],
    InvoiceDate_S: [null], InvoiceDate_E: [null],
    InvoiceDateYM: [null],
    INV_DeclareYM: [null as any, [Validators.required]],
    INV_Data_YM_S: [null], INV_Data_YM_E: [null],
    Buyer_Uniform: [null],
    PUR_TaxType: [[]],
    PUR_Amt_S: [null], PUR_Amt_E: [null],
    PUR_Tax_S: [null], PUR_Tax_E: [null],
    Voucher_No_S: [null], Voucher_No_E: [null],
    AssetType: [null], SAL_Type: [null],
  });

  columns: ReportColumn[] = [
    { field: 'InvoiceType', header: '發票格式' },
    { field: 'InvoiceNumber', header: '發票號碼' },
    { field: 'InvoiceDate', header: '發票日期' },
    { field: 'INV_DeclareYM', header: '申報年月' },
    { field: 'Buyer_Uniform', header: '買受人統一編號' },
    { field: 'PUR_TaxType', header: '課稅別' },
    { field: 'PUR_Net', header: '未稅金額', format: formatAmount, align: 'right' },
    { field: 'PUR_Tax', header: '稅額', format: formatAmount, align: 'right' },
    { field: 'PUR_Amt', header: '總金額', format: formatAmount, align: 'right' },
    { field: 'Voucher_No', header: '傳票編號' },
    { field: 'AssetType', header: '資產註記' },
    { field: 'SAL_Type', header: '使用別' },
    { field: 'INV_Cancel', header: '發票狀態', format: (v: any) => v === 'Y' ? '作廢' : '開立' },
    { field: 'TXN_VoidDT', header: '作廢日期', format: formatYYYYMMDD },
  ];

  constructor(
    private dropDownListService: DropDownListService,
    private fin13040Service: Fin13040Service,
    private datePipe: DatePipe
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('FIN13040', '/FIN/FIN13040cru', this.queryForm, (f) => this.onSubmit(f));
    this.initOptions();
    this.setDefaultDeclareYM();
  }

  private initOptions() {
    // 買受人統編
    this.dropDownListService.queryPOS2013_DropDownList({}).pipe(untilDestroyed(this)).subscribe(res => {
      const data = res?.Data ?? [];
      this.Buyer_Uniform_Options = Array.from(new Map(data.map((i: any) => [i.No, i])).values())
        .map((item: any) => ({ label: `${item.No} - ${item.Name}`, value: item.No }));
    });

    // 發票類型
    this.dropDownListService.queryTDS1007_DropDownList({ mid: 0 }).pipe(untilDestroyed(this)).subscribe(res => {
      const allowed = ['31', '32', '35'];
      this.InvoiceType_Options = (res?.Data?.INV_GUITypes ?? [])
        .filter((x: any) => allowed.includes(x.INV_GUIType))
        .map((x: any) => ({ label: `${x.INV_GUIType} - ${x.INV_GUIName}`, value: x.INV_GUIType }));
    });
  }

  private setDefaultDeclareYM() {
    const now = new Date();
    const targetM = (now.getMonth() + 1) % 2 === 0 ? now.getMonth() + 1 : now.getMonth() + 2;
    const date = new Date(now.getFullYear(), (targetM > 12 ? 12 : targetM) - 1, 1);
    this.queryForm.get('INV_DeclareYM')?.setValue(this.datePipe.transform(date, 'yyyyMM'));
  }

  loadGuiTrackOptions(event: any): void {
    if (!event) return;
    this.dropDownListService.queryPOS1018_GUI_TRACK_DropDownList({
      GUI_YYMM: event, MID: 0, STO_No: '10', GUI_Type: this.queryForm.get('InvoiceType')?.value ?? []
    }).pipe(untilDestroyed(this)).subscribe();
  }

  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const v = form.getRawValue();
      const transform = (val: any, isYM = false) => {
        if (!val) return undefined;
        const actualVal = (typeof val === 'object' && 'value' in val && !(val instanceof Date)) ? val.value : val;
        if (actualVal instanceof Date) {
          return this.datePipe.transform(actualVal, isYM ? 'yyyyMM' : 'yyyy-MM-dd');
        }
        return actualVal;
      };

      const payload = {
        ...v,
        InvoiceDate_S: transform(v.InvoiceDate_S),
        InvoiceDate_E: transform(v.InvoiceDate_E),
        INV_Data_YM_S: transform(v.INV_Data_YM_S, true),
        INV_Data_YM_E: transform(v.INV_Data_YM_E, true),
        InvoiceDateYM: transform(v.InvoiceDateYM, true),
        Buyer_Uniform: transform(v.Buyer_Uniform),
        SAL_Type: v.SAL_Type ? [v.SAL_Type] : undefined,
        AssetType: v.AssetType?.length ? v.AssetType : undefined,
        InvoiceType: v.InvoiceType?.length ? v.InvoiceType : ['35'],
        PUR_TaxType: v.PUR_TaxType?.length ? v.PUR_TaxType : undefined,
      };

      this.fin13040Service.queryFIN13040(payload).pipe(
        finalize(() => this.loading = false),
        untilDestroyed(this)
      ).subscribe(res => {
        const d = res?.Data;
        this.data = d?.Data ?? [];
        this.totalRecords = d?.TotalCount ?? 0;
        this.lastQueryBody = payload;
        this.footerData = { PUR_Net: d?.TotalNet, PUR_Tax: d?.TotalTax, PUR_Amt: d?.TotalAmt };
        this.queryStateService.setQueryState(this.ProgNo, v);
      });
    });
  }

  onVoid(row: any): void {
    if (!row?.ID) return;
    this.messageService.confirm({
      header: '確認作廢',
      message: `確定要作廢發票 ${row.InvoiceNumber} 嗎？此操作無法復原。`,
      type: 'delete',
      accept: () => {
        this.fin13040Service.voidFIN13040({ ID: row.ID }).pipe(untilDestroyed(this)).subscribe({
          next: (res) => {
            if (res?.Status === '0000') {
              this.messageService.successBubble(`發票 ${row.InvoiceNumber} 已作廢`);
              this.onSubmit(this.queryForm);
            }
          }
        });
      }
    });
  }

  onPrint(row: any): void {
    if (!row?.ID) return;
    this.fin13040Service.printFIN13040({ MID: 0, STO_No: '10', ID: row.ID }).subscribe(res => {
      const blob = new Blob([res.body as Blob], { type: 'application/pdf' });
      const url = globalThis.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${row.InvoiceNumber || 'report'}.pdf`;
      a.click();
      globalThis.URL.revokeObjectURL(url);
    });
  }
}
