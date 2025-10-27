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
import { createPaginationConfig, Column, formatAmount } from '@shared/componentkit/table/table.model';
import { finalize } from 'rxjs';
import { DatePipe } from '@angular/common';
import { FIN15110Service} from '@service/api/fin/fin15110.service';
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
  ],
})
export class FIN15110Component extends BasicQueryPageComponent <any> implements OnInit {
  queryForm = this.formBuilder.group({
    TXN_DT_S: [new Date(), [Validators.required]],
    TXN_DT_E: [new Date(), [Validators.required]],
    ...createPaginationConfig([{ field: 'ECR_NO', order: 1 }]),
  });

  data: any[] = [];
  totalRecords = 0;
  footerData: any[] = [];
  btnLoading = false;
  btnLoading2 = false;

  columns: Column[] = [
    { field: 'Ecr_No', header: '收銀機號', visible: true, showSort: true },
    { field: 'TXN_Date', header: '發票日期', visible: true, showSort: true },
    { field: 'TXN_GUINo', header: '發票號碼', visible: true, showSort: true },
    { field: 'TXN_Uniform', header: '統一編號', visible: true, showSort: true },
    { field: 'TXN_SaleAmt', header: '銷售金額', visible: true, showSort: true, format: formatAmount, isTotal: true },
    { field: 'TXN_SaleTax', header: '應稅銷售金額', visible: true, showSort: true, format: formatAmount, isTotal: true },
    { field: 'TXN_SaleNoTax', header: '免稅銷售金額', visible: true, showSort: true, format: formatAmount, isTotal: true },
    { field: 'TXN_Net', header: '未稅銷售金額', visible: true, showSort: true, format: formatAmount, isTotal: true },
    { field: 'TXN_Tax', header: '稅額', visible: true, showSort: true, format: formatAmount, isTotal: true },
    { field: 'TXN_VoidDT', header: '發票作廢日', visible: true, showSort: true },
  ];

  constructor(
    private readonly fin15110Service: FIN15110Service,
    private readonly datePipe: DatePipe
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN15110', '/FIN/FIN15110CRU', this.queryForm, (frm) => this.onSubmit(frm));
  }

  /** 查詢 */
  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      this.loading = true;
      const v = frm.value;

      const payload = {
        PageSize: v.PageSize || 0,
        PageIndex: v.PageIndex || 0,
        OrderBy: '',
        Offset: 0,
        SortBy: [],
        MID: '0',
        STO_No: '10',
        TXN_DT_S: this.datePipe.transform(v.TXN_DT_S, 'yyyy-MM-dd'),
        TXN_DT_E: this.datePipe.transform(v.TXN_DT_E, 'yyyy-MM-dd'),
      };

      this.fin15110Service
        .QueryFIN15110(payload)
        .pipe(finalize(() => (this.loading = false)))
        .subscribe({
          next: (res) => {
            if (res?.Data) {
              this.data = res.Data.FIN15110s || [];
              this.footerData = [
                {
                  TXN_SaleAmt: res.Data.TotalTXN_SaleAmt,
                  TXN_SaleTax: res.Data.TotalTXN_SaleTax,
                  TXN_SaleNoTax: res.Data.TotalTXN_SaleNoTax,
                  TXN_Net: res.Data.TotalNet,
                  TXN_Tax: res.Data.TotalTax,
                },
              ];
              this.totalRecords = res.Data.TotalCount || this.data.length;
            } else {
              this.data = [];
              this.footerData = [];
              this.totalRecords = 0;
            }

          },
          error: (err) => {
            console.error('查詢失敗:', err);
            this.messageService.errorBubble('查詢失敗');
          },
        });
    });
  }

  /** 匯出 PDF */
  onExportPDF(): void {
    this.btnLoading = true;
    const v = this.queryForm.value;

    const payload = {
      PageSize: 0,
      PageIndex: 0,
      OrderBy: '',
      Offset: 0,
      SortBy: [],
      MID: '0',
      STO_No: '10',
      TXN_DT_S: this.datePipe.transform(v.TXN_DT_S, 'yyyy-MM-dd'),
      TXN_DT_E: this.datePipe.transform(v.TXN_DT_E, 'yyyy-MM-dd'),
      IsMerge: true,
      IsExcel: false,
    };

    this.fin15110Service
      .PrintFIN15110(payload)
      .pipe(finalize(() => (this.btnLoading = false)))
      .subscribe({
        next: (res) => {
          const blob = res.body;
          if (blob) {
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = '二電發票表.pdf';
            link.click();
          } else {
            this.messageService.warnBubble('沒有可匯出的資料');
          }
        },
        error: (err) => {
          console.error('匯出 PDF 失敗:', err);
          this.messageService.errorBubble('匯出 PDF 失敗');
        },
      });
  }

  /** 匯出 Excel */
  onExportExcel(): void {
    this.btnLoading2 = true;
    const v = this.queryForm.value;

    const payload = {
      PageSize: 0,
      PageIndex: 0,
      OrderBy: '',
      Offset: 0,
      SortBy: [],
      MID: '0',
      STO_No: '10',
      TXN_DT_S: this.datePipe.transform(v.TXN_DT_S, 'yyyy-MM-dd'),
      TXN_DT_E: this.datePipe.transform(v.TXN_DT_E, 'yyyy-MM-dd'),
      IsMerge: true,
      IsExcel: true,
    };

    this.fin15110Service
      .PrintFIN15110(payload)
      .pipe(finalize(() => (this.btnLoading2 = false)))
      .subscribe({
        next: (res) => {
          const blob = res.body;
          if (blob) {
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = '二電發票表.xlsx';
            link.click();
          } else {
            this.messageService.warnBubble('沒有可匯出的資料');
          }
        },
        error: (err) => {
          console.error('匯出 Excel 失敗:', err);
          this.messageService.errorBubble('匯出 Excel 失敗');
        },
      });
  }

}
