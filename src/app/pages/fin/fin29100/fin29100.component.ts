import { DatePipe } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { DropdownRangeComponent } from '@shared/componentkit/dropdown-range/dropdown-range.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextRangeComponent } from '@shared/componentkit/input-text-range/input-text-range.component';
import { TableSubheaderComponent } from '@shared/componentkit/table/table-subheader/table-subheader.component';
import { Column, createPaginationConfig, formatAmount, formatDate } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs';
import { FIN29100Data, FIN29100Service, QueryFIN29100Request } from '../../../service/api/fin/fin29100.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { DropDownListService } from './../../../service/utility/dropDownList.service';

@Component({
  selector: 'app-fin29100',
  templateUrl: './fin29100.component.html',
  styleUrl: './fin29100.component.scss',
  standalone: true,
  imports: [
    ButtonModule,
    TableSubheaderComponent,
    DropdownRangeComponent,
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeComponent,
    InputTextComponent,
    RadiobuttonComponent,
    ButtonComponent,
    TableComponent,
    TranslateModule,
    InputTextRangeComponent,
    DropdownComponent
  ]
})
export class FIN29100Component extends BasicQueryPageComponent<FIN29100Data> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    BNK_No: [null],
    DocNo_From: [null],
    DocNo_To: [null],
    TxnDate_From: ['', Validators.required],
    TxnDate_To: ['', Validators.required],
    TxnType: [null],
    ...createPaginationConfig([]),
  });

  BankOptions: { label: string; value: string }[] = []; // 銀行選項
  TxnTypeOptions: { label: string; value: string }[] = [
    { label: '開票', value: '1' },
    { label: '匯款', value: '2' },
    { label: '調撥', value: '3' }
  ];

  data: FIN29100Data[] = [];
  totalRecords = 0;
  pdfBtnLoading = false;
  excelBtnLoading = false;

  columns: Column[] = [
    { field: 'Seqno', header: '序號', visible: true },
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
    private dropDownListService: DropDownListService,
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
    // 若系統有提供銀行下拉 API，可改為呼叫 DropDownListService；這裡示範用 service 查詢（如無資料，保持空陣列）
    this.dropDownListService.queryGLS1005_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: res => {
          // 假設回傳資料為 { No, Name }，我們把它當作銀行選項的來源
          this.BankOptions = (res?.Data || []).map((x: { No: string; Name: string }) => ({ label: `${x.No} - ${x.Name}`, value: x.No }));
        },
        error: () => {
          this.BankOptions = [];
        }
      });
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const formValue = frm.value;
      this.loading = true;

      const requestData: QueryFIN29100Request = {
        PageSize: formValue.PageSize || 10,
        PageIndex: formValue.PageIndex || 1,
        SortBy: formValue.SortBy || [],
        BNK_No: formValue.BNK_No || '',
        DocNo_From: formValue.DocNo_From || '',
        DocNo_To: formValue.DocNo_To || '',
        TxnType: formValue.TxnType || '',
        TxnDate_From: this.datePipe.transform(formValue.TxnDate_From!, 'yyyy-MM-dd') || '',
        TxnDate_To: this.datePipe.transform(formValue.TxnDate_To!, 'yyyy-MM-dd') || ''
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
              this.data = response.Data;
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
    const raw = this.queryForm.getRawValue();

    return {
      PageSize: raw.pageSize ?? 10,
      PageIndex: raw.pageIndex ?? 1,
      SortBy: raw.SortBy ?? [],
      TxnDate_From: this.datePipe.transform(raw.TxnDate_From, 'yyyy-MM-dd') || '',
      TxnDate_To: this.datePipe.transform(raw.TxnDate_To, 'yyyy-MM-dd') || '',
      BNK_No: raw.BNK_No || '',
      DocNo_From: raw.DocNo_From || '',
      DocNo_To: raw.DocNo_To || '',
      TxnType: raw.TxnType || ''
    };
  }

  onExportExcel() {
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

  onExportPDF() {
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

  private downloadFile(resp: HttpResponse<Blob>, ext: string, name: string) {
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