import { DatePipe } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextRangeComponent } from '@shared/componentkit/input-text-range/input-text-range.component';
import { TableSubheaderComponent } from '@shared/componentkit/table/table-subheader/table-subheader.component';
import { Column, createPaginationConfig, formatAmount, formatDate } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs';
import { FIN29100Data, FIN29100Service, QueryBankAccountResponse, QueryFIN29100Request } from '../../../service/api/fin/fin29100.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';

type TxnTypeOption = { label: string; value: string };

@Component({
  selector: 'app-fin29100',
  templateUrl: './fin29100.component.html',
  styleUrl: './fin29100.component.scss',
  standalone: true,
  imports: [
    ButtonModule,
    TableSubheaderComponent,
    // DropdownRangeComponent,
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeComponent,
    // InputTextComponent,
    // RadiobuttonComponent,
    ButtonComponent,
    // TableComponent,
    TranslateModule,
    InputTextRangeComponent,
    DropdownComponent
  ]
})
export class FIN29100Component extends BasicQueryPageComponent<FIN29100Data> implements OnInit {
  queryForm = this.formBuilder.group({
    BNK_No: [null as string | null],
    DocNo_From: [null as string | null],
    DocNo_To: [null as string | null],
    TxnDate_From: ['', Validators.required],
    TxnDate_To: ['', Validators.required],
    TxnType: [null as TxnTypeOption | null],
    ...createPaginationConfig([]),
  });

  BankOptions: (QueryBankAccountResponse & { displayLabel: string })[] = [];
  TxnTypeOptions: TxnTypeOption[] = [
    { label: '開票', value: '1' },
    { label: '匯款', value: '2' },
    { label: '調撥', value: '3' }
  ];

  TxnTypeMap: Record<string, string> = {
    '1': '開票',
    '2': '匯款',
    '3': '調撥'
  };

  data: FIN29100Data[] = [];
  totalRecords = 0;
  pdfBtnLoading = false;
  excelBtnLoading = false;

  columns: Column[] = [
    { field: 'TxnType', header: '型態', visible: true },
    {
      field: 'TxnDocumentNo',
      header: '匯款/開票/調撥單號',
      visible: true,
      htmlFormat: true,
      format: (value: string) => {
        if (!value || value === 'null' || value === 'undefined') {
          return '<span style="color: #999;">-</span>';
        }
        return `<span>${value}</span>`;
      }
    },
    { field: 'TxnDate', header: '匯款/開票/調撥日期', visible: true, format: formatDate },
    { field: 'VendorNo', header: '廠商編號', visible: true },
    { field: 'TxnAmount', header: '交易金額', visible: true, format: formatAmount },
    { field: 'TxnFee', header: '手續費', visible: true, format: formatAmount },
    { field: 'PaymentBank', header: '付款銀行', visible: true },
    { field: 'CheckNo', header: '支票號碼', visible: true },
    { field: 'CheckExpireDate', header: '支票到期日', visible: true, format: formatDate }
  ];

  constructor(
    private fin29100Service: FIN29100Service,
    private datePipe: DatePipe
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN29100', '/FIN/FIN29100CRU', this.queryForm, (frm) => this.onSubmit(frm));
    this.loadOptions();
  }

  private loadOptions(): void {
    this.fin29100Service.queryBankAccount({})
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.BankOptions = response.Data.map(item => ({
          ...item,
          displayLabel: `${item.BNK_id || item.id} - ${item.BNK_AccName}`
        }));
        console.log('Bank Options:', this.BankOptions);
      });
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const formValue = frm.getRawValue() as {
        BNK_No: string | null;
        DocNo_From: string | null;
        DocNo_To: string | null;
        TxnDate_From: string;
        TxnDate_To: string;
        TxnType: TxnTypeOption | null;
        pageSize: number;
        pageIndex: number;
        SortBy: any[];
      };

      this.loading = true;

      const requestData: QueryFIN29100Request = {
        PageSize: formValue.pageSize || 10,
        PageIndex: formValue.pageIndex || 1,
        SortBy: formValue.SortBy || [],
        BNK_No: formValue.BNK_No || '',
        DocNo_From: formValue.DocNo_From || '',
        DocNo_To: formValue.DocNo_To || '',
        TxnType: formValue.TxnType?.value || '',
        TxnDate_From: this.datePipe.transform(formValue.TxnDate_From, 'yyyy-MM-dd') || '',
        TxnDate_To: this.datePipe.transform(formValue.TxnDate_To, 'yyyy-MM-dd') || ''
      };

      this.fin29100Service
        .queryFIN29100(requestData)
        .pipe(
          untilDestroyed(this),
          finalize(() => {
            this.loading = false;
          })
        )
        .subscribe({
          next: (response) => {
            if (response && response.Data) {
              this.data = response.Data.map(x => ({
                ...x,
                TxnType: this.TxnTypeMap[x.TxnType] || x.TxnType
              }));
              this.totalRecords = response.TotalCount || 0;
            } else {
              this.data = [];
              this.totalRecords = 0;
            }
          },
          error: () => {
            this.data = [];
            this.totalRecords = 0;
            this.messageService?.warnBubble?.('查詢失敗');
          }
        });
    });
  }

  private buildExportPayload(): QueryFIN29100Request {
    const raw = this.queryForm.getRawValue() as {
      BNK_No: string | null;
      DocNo_From: string | null;
      DocNo_To: string | null;
      TxnDate_From: string;
      TxnDate_To: string;
      TxnType: TxnTypeOption | null;
      pageSize: number;
      pageIndex: number;
      SortBy: any[];
    };

    return {
      PageSize: raw.pageSize ?? 10,
      PageIndex: raw.pageIndex ?? 1,
      SortBy: raw.SortBy ?? [],
      TxnDate_From: this.datePipe.transform(raw.TxnDate_From, 'yyyy-MM-dd') || '',
      TxnDate_To: this.datePipe.transform(raw.TxnDate_To, 'yyyy-MM-dd') || '',
      BNK_No: raw.BNK_No || '',
      DocNo_From: raw.DocNo_From || '',
      DocNo_To: raw.DocNo_To || '',
      TxnType: raw.TxnType?.value || ''
    };
  }

  onExportExcel(): void {
    if (!this.data?.length) {
      this.messageService.warnBubble('目前沒有資料可匯出');
      return;
    }

    const payload = this.buildExportPayload();

    this.excelBtnLoading = true;
    this.fin29100Service.exportFIN29100_Excel(payload)
      .pipe(finalize(() => this.excelBtnLoading = false))
      .subscribe({
        next: (r) => this.downloadFile(r, '.xlsx', '支出憑單明細表'),
        error: () => this.messageService.warnBubble('匯出 Excel 失敗')
      });
  }

  onExportPDF(): void {
    if (!this.data?.length) {
      this.messageService.warnBubble('目前沒有資料可匯出');
      return;
    }

    const payload = this.buildExportPayload();

    this.pdfBtnLoading = true;
    this.fin29100Service.exportFIN29100_PDF(payload)
      .pipe(finalize(() => this.pdfBtnLoading = false))
      .subscribe({
        next: (r) => this.downloadFile(r, '.pdf', '支出憑單明細表'),
        error: () => this.messageService.warnBubble('匯出 PDF 失敗')
      });
  }

  private downloadFile(resp: HttpResponse<Blob>, ext: string, name: string): void {
    const blob = resp.body!;
    const fileName = `${name}_${new Date().getTime()}${ext}`;
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}