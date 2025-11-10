import { Component, OnInit } from '@angular/core';
import {
  Validators,
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
} from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TranslateModule } from '@ngx-translate/core';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { CustomFooterTableComponent } from '@shared/componentkit/custom-footer-table/customFooterTable.component';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import {
  createPaginationConfig,
  Column,
  formatAmount,
} from '@shared/componentkit/table/table.model';
import { finalize } from 'rxjs';
import { DatePipe } from '@angular/common';
import { FIN15110Service } from '@service/api/fin/fin15110.service';
import { environment } from 'src/environments/environment';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import {
  DropDownListService,
  IDropdownItem,
} from './../../../service/utility/dropDownList.service';
import { DropdownRangeComponent } from '@shared/componentkit/dropdown-range/dropdown-range.component';

@Component({
  selector: 'app-fin15110',
  templateUrl: './fin15110.component.html',
  styleUrls: ['./fin15110.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonComponent,
    TranslateModule,
    CalendarRangeQuickComponent,
    TableModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    CalendarModule,
    ButtonModule,
    CustomFooterTableComponent,
    DatePipe,
    MultiSelectComponent,
    DropdownRangeComponent
  ],
})
export class FIN15110Component
  extends BasicQueryPageComponent<any>
  implements OnInit {
  /** 查詢條件表單 */
  queryForm = this.formBuilder.nonNullable.group({
    TXN_DT_S: [new Date(), [Validators.required]],
    TXN_DT_E: [new Date(), [Validators.required]],
    ECR_No_S: [''],
    ECR_No_E: [''],
    DataType: [['1', '2'] as string[]],
    ...createPaginationConfig([{ field: 'Ecr_No', order: 1 }]),
  });

  /** 表格資料 */
  data: any[] = [];
  totalRecords = 0;
  footerData: any[] = [];

  /** 匯出按鈕 Loading 狀態 */
  btnLoading = false;
  btnLoading2 = false;

  /** 下拉選項 */
  ECRNoOptions: IDropdownItem[] = [];
  DATE_TYPEOptions = [
    { label: '開立', value: '1' },
    { label: '作廢', value: '2' },
  ];

  /** 表格欄位設定 */
  columns: Column[] = [
    { field: 'Ecr_No', header: '收銀機號', visible: true, showSort: true },
    { field: 'TXN_Date', header: '發票日期', visible: true, showSort: true },
    { field: 'TXN_GUINo', header: '發票號碼', visible: true, showSort: true },
    { field: 'TXN_Uniform', header: '統一編號', visible: true, showSort: true },
    {
      field: 'TXN_SaleAmt',
      header: '銷售金額',
      visible: true,
      showSort: true,
      format: formatAmount,
      isTotal: true,
    },
    {
      field: 'TXN_SaleTax',
      header: '應稅銷售金額',
      visible: true,
      showSort: true,
      format: formatAmount,
      isTotal: true,
    },
    {
      field: 'TXN_SaleNoTax',
      header: '免稅銷售金額',
      visible: true,
      showSort: true,
      format: formatAmount,
      isTotal: true,
    },
    {
      field: 'TXN_Net',
      header: '未稅銷售金額',
      visible: true,
      showSort: true,
      format: formatAmount,
      isTotal: true,
    },
    {
      field: 'TXN_Tax',
      header: '稅額',
      visible: true,
      showSort: true,
      format: formatAmount,
      isTotal: true,
    },
    { field: 'TXN_VoidDT', header: '發票作廢日期', visible: true, showSort: true },
  ];


  constructor(
    private readonly fin15110Service: FIN15110Service,
    private readonly dropDownListService: DropDownListService,
    private readonly datePipe: DatePipe
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage(
      'FIN15110',
      '/FIN/FIN15110CRU',
      this.queryForm,
      (frm) => this.onSubmit(frm)
    );

    this.dropDownListService
      .queryPOS1002_DropDownList()
      .subscribe((data) => (this.ECRNoOptions = data.Data));

  }

  /** 查詢 */
  onSubmit(frm: FormGroup): void {
    if (this.loading) return;

    this.handleSubmit(frm, () => {
      this.loading = true;
      const v = frm.value;
      const payload = {
        PageSize: v.pageSize || 20,
        PageIndex: v.pageIndex ?? 1,
        OrderBy: '',
        Offset: 0,
        SortBy: v.SortBy ?? [],
        TXN_DT_S: this.datePipe.transform(v.TXN_DT_S, 'yyyy-MM-dd'),
        TXN_DT_E: this.datePipe.transform(v.TXN_DT_E, 'yyyy-MM-dd'),
        DataType: v.DataType || [],
        ECR_No_S: v.ECR_No_S || '',
        ECR_No_E: v.ECR_No_E || '',
      };

      this.fin15110Service
        .QueryFIN15110(payload)
        .pipe(finalize(() => (this.loading = false)))
        .subscribe({
          next: (res) => {
            if (res?.Data) {
              // 兼容 Data 是物件 或 陣列的情況
              const d = Array.isArray(res.Data) ? res.Data[0] : res.Data;

              this.data = d.FIN15110s ?? [];
              this.totalRecords = d.TotalCount ?? this.data.length;
              this.footerData = [
                {
                  TXN_SaleAmt: d.TotalTXN_SaleAmt,
                  TXN_SaleTax: d.TotalTXN_SaleTax,
                  TXN_SaleNoTax: d.TotalTXN_SaleNoTax,
                  TXN_Net: d.TotalNet,
                  TXN_Tax: d.TotalTax,
                },
              ];
            } else {
              this.data = [];
              this.footerData = [];
              this.totalRecords = 0;
            }
          },

        });
    });
  }

  /** 分頁／懶加載 */
  override onLazyLoadData(event: any): void {
    if (this.loading) return;

    this.queryForm.patchValue({
      pageSize: event.pageSize,
      pageIndex: event.pageIndex,
      SortBy: event.SortBy,
    });

    this.onSubmit(this.queryForm);
  }

  /** 匯出 PDF */
  onExportPDF(): void {
    this.exportReport(false);
  }

  /** 匯出 Excel */
  onExportExcel(): void {
    this.exportReport(true);
  }

  /** 匯出共用邏輯 */
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
      TXN_DT_S: this.datePipe.transform(v.TXN_DT_S, 'yyyy-MM-dd'),
      TXN_DT_E: this.datePipe.transform(v.TXN_DT_E, 'yyyy-MM-dd'),
      DataType: v.DataType || [],
      ECR_No_S: v.ECR_No_S || '',
      ECR_No_E: v.ECR_No_E || '',
      IsExcel: isExcel,
    };

    console.log('匯出 payload:', payload);

    this.fin15110Service
      .printFIN15110(payload)
      .pipe(
        finalize(() => {
          if (isExcel) this.btnLoading2 = false;
          else this.btnLoading = false;
        })
      )
      .subscribe({
        next: (res) => {
          if (!res || res.Status !== '0000') {
            this.messageService.errorBubble(res?.Message ?? '匯出失敗');
            return;
          }

          const url = res?.Data?.Print_URL;
          if (!url) {
            this.messageService.warnBubble('後端未回傳報表連結');
            return;
          }

          const fileUrl = `${environment.ApiUrl.replace(/\/$/, '')}${url}`;
          const a = document.createElement('a');
          a.href = fileUrl;
          a.setAttribute(
            'download',
            decodeURIComponent(
              url.split('/').pop() ??
              (isExcel ? '二電發票表.xlsx' : '二電發票表.pdf')
            )
          );
          a.style.display = 'none';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);

          this.messageService.successBubble(
            `匯出 ${isExcel ? 'Excel' : 'PDF'} 成功`
          );
        },
      });
  }
}
