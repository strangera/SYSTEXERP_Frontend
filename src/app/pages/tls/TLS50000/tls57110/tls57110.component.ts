
import { NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { TLS57110Service } from '@service/api/tls/tls57110.service';
import { DropDownListService, IDropdownItem } from '@service/utility/dropDownList.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { Column, formatAmount, LazyLoadEvent } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CustomFooterTableComponent } from './custom-footer-table/customFooterTable.component';
interface TLS57110Data {
  LOGO_No: string;
  LOGO_CH_NAME: string;
  PLU_MagNo?: string;
  PLU_Name?: string;
  STK_PRIORQTY: number;
  STK_STOCKQTY: number;
  STK_REJECTQTY: number;
  STK_SALEQTY: number;
  STK_MOVEINQTY: number;
  STK_MOVEOUTQTY: number;
  STK_DIFFQTY: number;
  STK_SCRAPQTY: number;
  STK_TAKEQTY: number;
  STK_RETAKEQTY: number;
  STK_TRDINQTY: number;
  STK_TRDOUTQTY: number;
  STK_CURRENTQTY: number;
}

interface TLS57110Response {
  Status: string;
  Data: {
    Datas: TLS57110Data[];
    SumData: Partial<TLS57110Data>;
    DetailSumData: Partial<TLS57110Data>[];
  };
  TotalCount: number;
}

@Component({
  selector: 'app-tls57110',
  templateUrl: './tls57110.component.html',
  standalone: true,
  imports: [
    NgIf,
    MenubarComponent,
    CustomFooterTableComponent,
    ButtonModule,
    MultiSelectComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    CalendarComponent,
    InputNumberComponent,
    ButtonComponent,
    TranslateModule,
  ],
})
export class TLS57110Component extends BasicQueryPageComponent<TLS57110Response> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    ShowType: ['M', [Validators.required]],
    ODM_No: [null],
    HOS_NOList: [[]],
    LOGO_NoList: [[]],
    STK_YM: ['', [Validators.required]],
    pgSize: [30, [Validators.required]],
  });
  expansionRowsPerPageOptions: number[] = [30, 60, 90, 120, 150];

  pdfBtnLoading = false;
  excelBtnLoading = false;
  data: TLS57110Data[] = [];
  totalRecords = 0;
  footerData: Partial<TLS57110Data>[] = [];
  lastQueryBody: any = null;
  subTotalData: any[] = [];
  columns: Column[] = [];
  displayModeOptions = [
    { value: 'M', label: '彙總' },
    { value: 'D', label: '明細' },
  ];
  warehouseOptions: IDropdownItem[] = [];
  brandCodeOptions: IDropdownItem[] = [];

  constructor(
    private readonly dropDownListService: DropDownListService,
    public readonly tls57110Service: TLS57110Service,
    private readonly cdr: ChangeDetectorRef,
  ) {
    super();
  }

  /** getter：安全取得當前顯示模式 */
  get showType(): 'M' | 'D' {
    return (this.queryForm.get('ShowType')?.value as 'M' | 'D') ?? 'M';
  }

  ngOnInit(): void {
    this.initializePage('TLS57110', 'tls/tls57110cru');
    this.updateTableColumns('M');

    this.queryForm.get('ShowType')?.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(val => {
        setTimeout(() => {
          this.updateTableColumns(val);
          this.data = [];
          this.footerData = [];
          this.totalRecords = 0;
          this.cdr.detectChanges();
        });
      });


    // 下拉選單載入
    this.dropDownListService
      .getPOS2034Options()
      .pipe(untilDestroyed(this))
      .subscribe((res) => {
        this.warehouseOptions = res.Data.map((item) => ({
          ...item,
          label: `${item.No} - ${item.Name}`,
          No: item.No,
        }));
      });

    this.dropDownListService
      .queryPLULOGO_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe((res) => {
        this.brandCodeOptions = res.Data.map((item) => ({
          ...item,
          label: `${item.No} - ${item.Name}`,
          No: item.No,
        }));
      });
  }

  /**  根據顯示模式切換欄位 */
  updateTableColumns(showType: string) {

    if (showType === 'D') {
      this.columns = [
        { field: 'LOGO_CH_NAME', header: '品牌', visible: true, showSort: true },
        { field: 'PLU_MagNo', header: '管理編號', visible: true, showSort: true },
        { field: 'PLU_Name', header: '品名', visible: true, showSort: true },
        { field: 'STK_PRIORQTY', header: '期初存貨', visible: true, format: formatAmount, isSubTotal: true, isTotal: true },
        { field: 'STK_STOCKQTY', header: '進貨量', visible: true, format: formatAmount, isSubTotal: true, isTotal: true },
        { field: 'STK_REJECTQTY', header: '進退量', visible: true, format: formatAmount, isSubTotal: true, isTotal: true },
        { field: 'STK_SALEQTY', header: '銷貨量', visible: true, format: formatAmount, isSubTotal: true, isTotal: true },
        { field: 'STK_MOVEINQTY', header: '撥入量', visible: true, format: formatAmount, isSubTotal: true, isTotal: true },
        { field: 'STK_MOVEOUTQTY', header: '撥出量', visible: true, format: formatAmount, isSubTotal: true, isTotal: true },
        { field: 'STK_DIFFQTY', header: '盤點量', visible: true, format: formatAmount, isSubTotal: true, isTotal: true },
        { field: 'STK_SCRAPQTY', header: '報廢量', visible: true, format: formatAmount, isSubTotal: true, isTotal: true },
        { field: 'STK_TAKEQTY', header: '領用量', visible: true, format: formatAmount, isSubTotal: true, isTotal: true },
        { field: 'STK_RETAKEQTY', header: '領用退回量', visible: true, format: formatAmount, isSubTotal: true, isTotal: true },
        { field: 'STK_TRDINQTY', header: '同業調入量', visible: true, format: formatAmount, isSubTotal: true, isTotal: true },
        { field: 'STK_TRDOUTQTY', header: '同業調出量', visible: true, format: formatAmount, isSubTotal: true, isTotal: true },
        { field: 'STK_CURRENTQTY', header: '期末存貨', visible: true, format: formatAmount, isSubTotal: true, isTotal: true },
      ];
    } else {
      this.columns = [
        { field: 'LOGO_CH_NAME', header: '品牌', visible: true, showSort: true },
        { field: 'STK_PRIORQTY', header: '期初存貨', visible: true, format: formatAmount, isTotal: true },
        { field: 'STK_STOCKQTY', header: '進貨量', visible: true, format: formatAmount, isTotal: true },
        { field: 'STK_REJECTQTY', header: '進退量', visible: true, format: formatAmount, isTotal: true },
        { field: 'STK_SALEQTY', header: '銷貨量', visible: true, format: formatAmount, isTotal: true },
        { field: 'STK_MOVEINQTY', header: '撥入量', visible: true, format: formatAmount, isTotal: true },
        { field: 'STK_MOVEOUTQTY', header: '撥出量', visible: true, format: formatAmount, isTotal: true },
        { field: 'STK_DIFFQTY', header: '盤點量', visible: true, format: formatAmount, isTotal: true },
        { field: 'STK_SCRAPQTY', header: '報廢量', visible: true, format: formatAmount, isTotal: true },
        { field: 'STK_TAKEQTY', header: '領用量', visible: true, format: formatAmount, isTotal: true },
        { field: 'STK_RETAKEQTY', header: '領用退回量', visible: true, format: formatAmount, isTotal: true },
        { field: 'STK_TRDINQTY', header: '同業調入量', visible: true, format: formatAmount, isTotal: true },
        { field: 'STK_TRDOUTQTY', header: '同業調出量', visible: true, format: formatAmount, isTotal: true },
        { field: 'STK_CURRENTQTY', header: '期末存貨', visible: true, format: formatAmount, isTotal: true },
      ]
    }
  }

  onSubmit(frm: FormGroup, event?: LazyLoadEvent) {
    this.handleSubmit(frm, () => {
      this.loading = true;

      const rawValue = frm.value;
      const pageIndex = event?.pageIndex ?? 1;
      const pageSize = event?.pageSize ?? rawValue.pgSize ?? 30;

      const body = {
        ...rawValue,
        STK_YM: rawValue.STK_YM ? this.formatToYearMonth(rawValue.STK_YM) : '',
        pageIndex,
        pageSize,
        SortBy: frm.value.ShowType === 'M' ?
          [
            { field: 'LOGO_CH_NAME', order: 1 }] :
          [
            { field: 'LOGO_No', order: 1 }, { field: 'PLU_MagNo', order: 1 },
          ]
      };


      this.lastQueryBody = body;
      this.tls57110Service.queryTLS57110(body)
        .pipe(untilDestroyed(this))
        .subscribe({
          next: (res) => {
            if (res.Status === '0000') {
              this.data = res.Data?.Datas ?? [];
              this.totalRecords = res.TotalCount ?? this.data.length;

              this.footerData = res.Data?.SumData ? [{ ...res.Data.SumData }] : [];
              this.subTotalData = res.Data?.DetailSumData ?? [];
              console.log('🔹 小計資料:', this.subTotalData);
            } else {
              this.data = [];
              this.footerData = [];
              this.subTotalData = [];
            }
          },
          complete: () => (this.loading = false),
        });


    });
  }

  /**改成這樣，從 lazy 事件傳進 pageIndex */
  override onLazyLoadData(event: LazyLoadEvent, form: FormGroup) {
    form.value.pageIndex = event.pageIndex;
    form.value.pageSize = event.pageSize;
    form.value.SortBy = event.SortBy;
    this.onSubmit(form, event);
  }

  private formatToYearMonth(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    return `${year}${month}`;
  }



  /**  匯出 Excel */
  onExportXLSX() {
    if (!this.lastQueryBody) return;
    this.excelBtnLoading = true;
    this.tls57110Service.exportTLS57110(this.lastQueryBody).pipe(untilDestroyed(this)).subscribe({
      next: (blob) => {
        const url = globalThis.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `庫存月結存貨表_${this.lastQueryBody!.STK_YM}.xlsx`;
        a.click();
        globalThis.URL.revokeObjectURL(url);
      },
      complete: () => (this.excelBtnLoading = false),
    });
  }

  /**  匯出 PDF */
  onExportPDF() {
    if (!this.lastQueryBody) return;
    this.pdfBtnLoading = true;
    this.tls57110Service.exportTLS57110PDF(this.lastQueryBody).pipe(untilDestroyed(this)).subscribe({
      next: (blob) => {
        const url = globalThis.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `庫存月結存貨表_${this.lastQueryBody!.STK_YM}.pdf`;
        a.click();
        globalThis.URL.revokeObjectURL(url);
      },
      complete: () => (this.pdfBtnLoading = false),
    });
  }
}
