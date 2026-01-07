import { DatePipe } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { DropdownRangeComponent } from '@shared/componentkit/dropdown-range/dropdown-range.component';
import { InputNumberRangeComponent } from '@shared/componentkit/input-number-range/input-number-range.component';
import { TableSubheaderComponent } from '@shared/componentkit/table/table-subheader/table-subheader.component';
import { Column, createPaginationConfig, formatAmount, formatDate } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs';
import { FIN29050Data, FIN29050Service, QueryFIN29050Request } from '../../../service/api/fin/fin29050.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { DropDownListService } from './../../../service/utility/dropDownList.service';

@Component({
  selector: 'app-fin29050',
  templateUrl: './fin29050.component.html',
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
    ButtonComponent,
    TableComponent,
    TranslateModule,
    InputNumberRangeComponent
  ]
})
export class FIN29050Component extends BasicQueryPageComponent<FIN29050Data> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    VEN_No_From: [null],
    VEN_No_To: [null],
    ACP_Date_From: ['', Validators.required],
    ACP_Date_To: ['', Validators.required],
    ACP_Amt_From: [null],
    ACP_Amt_To: [null],
    AccNo_From: [null],
    AccNo_To: [null],
    ...createPaginationConfig([]),
  });

  VendorNoOptions: any[] = []; // 廠商編號選項
  AccNoOptions: any[] = []; // 科目代號選項

  data: FIN29050Data[] = [];
  totalRecords = 0;
  pdfBtnLoading = false;
  excelBtnLoading = false;

  columns: Column[] = [
    { field: 'VendorNo', header: '廠客代號', visible: true },
    { field: 'VendorName', header: '廠客名稱', visible: true },
    { field: 'Summary', header: '摘要', visible: true },
    { field: 'BookDate', header: '立帳日期', visible: true, format: formatDate },
    { field: 'VoucherNo', header: '傳票編號', visible: true, type: 'detail' },
    { field: 'PayableAmount', header: '應付金額', visible: true, format: formatAmount },
    { field: 'OffsetAmount', header: '沖帳金額', visible: true, format: formatAmount },
    { field: 'ReservationAmount', header: '保留款金額', visible: true, format: formatAmount },
    { field: 'OffsetReservationAmount', header: '沖保留款金額', visible: true, format: formatAmount },
    { field: 'UnpaidAmount', header: '未付金額', visible: true, format: formatAmount }
  ];

  constructor(
    private dropDownListService: DropDownListService,
    private fin29050Service: FIN29050Service,
    private datePipe: DatePipe
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN29050', '/fin/fin29050cru', this.queryForm, (frm) => this.onSubmit(frm));
    this.loadOptions();
  }

  private loadOptions(): void {
    // 廠商編號
    this.dropDownListService.queryPOS2013_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: res => {
          this.VendorNoOptions = (res?.Data || []).map((x) => ({ label: `${x.VEN_No} - ${x.Name}`, value: x.VEN_No }));
        },
        error: () => {
          this.VendorNoOptions = [];
        }
      });

    // 科目代號
    this.dropDownListService.queryGLS1005_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: res => {
          this.AccNoOptions = (res?.Data || []).map((x) => ({ label: `${x.No} - ${x.Name}`, value: x.No }));
        },
        error: () => {
          this.AccNoOptions = [];
        }
      });
  }

  override onDetail(row: FIN29050Data) {
    const vouNo = row?.VoucherNo;
    if (!vouNo) {
      this.messageService?.warnBubble?.('無法開啟，缺少傳票號碼。');
      return;
    }

    try {
      const handoff = {
        vouNo,
        fromRoute: window.location.pathname,
        ts: Date.now(),
      };
      localStorage.setItem('FIN29050_CRU_HANDOFF', JSON.stringify(handoff));
      localStorage.setItem('FIN29050_CRU_PROGNO', 'FIN29050');
      console.log('[FIN29050] 已儲存 handoff:', handoff);
    } catch (err) {
      console.error('[FIN29050] handoff save failed:', err);
      this.messageService?.warnBubble?.('寫入交接資料失敗。');
    }

    window.open('/account/fin/fin29050cru', '_blank', 'noopener');
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const formValue = frm.value;
      this.loading = true;

      const requestData: QueryFIN29050Request = {
        ...formValue,
        VEN_No_From: formValue.VEN_No_From || '',
        VEN_No_To: formValue.VEN_No_To || '',
        ACP_Date_From: this.datePipe.transform(formValue.ACP_Date_From!, 'yyyy-MM-dd') || '',
        ACP_Date_To: this.datePipe.transform(formValue.ACP_Date_To!, 'yyyy-MM-dd') || '',
        ACP_Amt_From: formValue.ACP_Amt_From ?? undefined,
        ACP_Amt_To: formValue.ACP_Amt_To ?? undefined,
        AccNo_From: formValue.AccNo_From || '',
        AccNo_To: formValue.AccNo_To || ''
      };

      this.fin29050Service
        .queryFIN29050(requestData)
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

  private buildExportPayload(): QueryFIN29050Request {
    const raw = this.queryForm.getRawValue();

    return {
      ...raw,
      VEN_No_From: raw.VEN_No_From || '',
      VEN_No_To: raw.VEN_No_To || '',
      ACP_Date_From: this.datePipe.transform(raw.ACP_Date_From, 'yyyy-MM-dd') || '',
      ACP_Date_To: this.datePipe.transform(raw.ACP_Date_To, 'yyyy-MM-dd') || '',
      ACP_Amt_From: raw.ACP_Amt_From ?? undefined,
      ACP_Amt_To: raw.ACP_Amt_To ?? undefined,
      AccNo_From: raw.AccNo_From || '',
      AccNo_To: raw.AccNo_To || ''
    };
  }

  onExportExcel() {
    if (!this.data?.length) {
      this.messageService.warnBubble('目前沒有資料可匯出');
      return;
    }

    const payload = this.buildExportPayload();

    this.excelBtnLoading = true;
    this.fin29050Service.exportFIN29050_Excel(payload)
      .pipe(finalize(() => this.excelBtnLoading = false))
      .subscribe({
        next: (r) => this.downloadFile(r, '. xlsx', '應付帳款明細表'),
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
    this.fin29050Service.exportFIN29050_PDF(payload)
      .pipe(finalize(() => this.pdfBtnLoading = false))
      .subscribe({
        next: (r) => this.downloadFile(r, '.pdf', '應付帳款明細表'),
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
