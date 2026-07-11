import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { DropdownRangeComponent } from '@shared/componentkit/dropdown-range/dropdown-range.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { formatAmount, formatDate, ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize, map } from 'rxjs/operators';
import { FileExportService } from 'src/app/shared/service/file-export.service';
import { ApiResponse, Fin34020Service, QueryFIN34020Request, QueryFIN34020Row, SortItem } from '../../../service/api/fin/fin34020.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';

@Component({
  selector: 'app-fin34020',
  templateUrl: './fin34020.component.html',
  standalone: true,
  imports: [
    AsyncPipe,
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeComponent,
    DropdownRangeComponent,
    MultiSelectComponent,
    RadiobuttonComponent,
    ButtonComponent,
    TranslateModule,
    TableReportComponent,
    ButtonModule,
  ],
})
export class FIN34020Component extends BasicQueryPageComponent<any> implements OnInit {
  private readonly fin34020Service = inject(Fin34020Service);
  private readonly dropDown = inject(DropdownApiService);
  private readonly fileExportService = inject(FileExportService);
  private readonly datePipe = inject(DatePipe);
  private readonly destroyRef = inject(DestroyRef);
  data: QueryFIN34020Row[] = [];
  totalRecords = 0;
  lastQueryBody: any;
  footerData: any;
  venNoOptions = this.dropDown.queryPos2013({ VEN_Flag: '' });
  accNoOptions = this.dropDown.queryGls1005();
  readonly defaultSort: SortItem[] = [
    { field: 'VEN_No', order: 1 },
    { field: 'ARS_Date', order: 1 },
    { field: 'ARS_No', order: 1 },
  ];
  columns: ReportColumn[] = [
    { field: 'VEN_No', header: '廠客代號' },
    { field: 'VEN_Name', header: '客戶名稱', align: 'left' },
    { field: 'PayType', header: '收/付' },
    { field: 'ARS_No', header: '應收帳款單號' },
    { field: 'AccNo', header: '科目代號' },
    { field: 'AccCName', header: '科目名稱', align: 'left' },
    { field: 'ARS_Date', header: '立帳日期', format: formatDate },
    { field: 'PTA_Date', header: '預計收款日', format: formatDate },
    { field: 'ARS_Amt', header: '立帳金額', format: formatAmount, align: 'right' },
    { field: 'NoteDesc', header: '摘要', align: 'left' },
    { field: 'RefNo', header: '參考單號' },
    { field: 'RCV_Date', header: '收款日期', format: formatDate },
    { field: 'VouNo', header: '傳票號碼' },
    { field: 'RcvOrAdjAmt', header: '收款/調整金額', format: formatAmount, align: 'right' },
    { field: 'UnpaidBalanceAmt', header: '未沖餘額', format: formatAmount, align: 'right' },
  ];
  showFlagOptions = [{ value: '1', label: '顯示' }, { value: '0', label: '不顯示' },];
  moneyTypeOptions = [0, 11, 15, 30, 45].map(v => ({ value: v, label: String(v) }));
  queryForm = this.formBuilder.group({
    VEN_No_From: [null as string | null],
    VEN_No_To: [null as string | null],
    ARS_Date_From: [null as Date | null],
    ARS_Date_To: [null as Date | null],
    RCV_Date_From: [null as Date | null],
    RCV_Date_To: [null as Date | null],
    ADJ_Date_From: [null as Date | null],
    ADJ_Date_To: [null as Date | null],
    AccNoList: [[] as string[]],
    MoneyTypeList: [[] as number[]],
    ShowARSAmount: ['1' as string],
    ShowZeroBalance: ['1' as string],
    pageSize: [10000],
    pageIndex: [1], // 你將初始頁碼改為 1
    SortBy: [[{ field: 'VEN_No', order: 1 }, { field: 'ARS_Date', order: 1 }, { field: 'ARS_No', order: 1 },]],
  });
  btnExportExcelLoading = false;
  btnExportPdfLoading = false;
  public queryFIN34020ForReport = (body: any) =>
    this.fin34020Service.queryFIN34020(this.buildPayload(body ?? {})).pipe(
      map((res: ApiResponse<any>) => {
        const dataAny = res?.Data as any;
        this.setFooter(dataAny?.TotalSummary);
        return {
          Data: dataAny?.QueryData ?? [],
          TotalCount: res?.TotalCount ?? 0,
          GrandTotal: dataAny?.TotalSummary,
        };
      })
    );
  ngOnInit(): void {
    this.initializePage('FIN34020', 'fin/fin34020cru', this.queryForm, (form) => this.onSubmit(form));
  }
  private buildPayload(body: any): QueryFIN34020Request {
    return {
      PageIndex: body.pageIndex ?? 1,
      PageSize: body.pageSize ?? 30,
      SortBy: body.SortBy?.length ? body.SortBy : this.defaultSort,
      VEN_No_From: body.VEN_No_From?.trim() || undefined,
      VEN_No_To: body.VEN_No_To?.trim() || undefined,
      ARS_Date_From: this.datePipe.transform(body.ARS_Date_From, 'yyyy-MM-dd') ?? undefined,
      ARS_Date_To: this.datePipe.transform(body.ARS_Date_To, 'yyyy-MM-dd') ?? undefined,
      RCV_Date_From: this.datePipe.transform(body.RCV_Date_From, 'yyyy-MM-dd') ?? undefined,
      RCV_Date_To: this.datePipe.transform(body.RCV_Date_To, 'yyyy-MM-dd') ?? undefined,
      ADJ_Date_From: this.datePipe.transform(body.ADJ_Date_From, 'yyyy-MM-dd') ?? undefined,
      ADJ_Date_To: this.datePipe.transform(body.ADJ_Date_To, 'yyyy-MM-dd') ?? undefined,
      AccNoList: body.AccNoList?.length ? body.AccNoList.join(',') : undefined,
      MoneyTypeList: body.MoneyTypeList?.length ? body.MoneyTypeList.join(',') : undefined,
      ShowARSAmount: body.ShowARSAmount ?? undefined,
      ShowZeroBalance: body.ShowZeroBalance ?? undefined,
    };
  }
  private setFooter(summary: any): void {
    this.footerData = {
      ARS_Amt: summary?.Total_ARS_Amt ?? 0,
      RcvOrAdjAmt: summary?.Total_RcvOrAdjAmt ?? 0,
      UnpaidBalanceAmt: summary?.Total_UnpaidBalanceAmt ?? 0,
    };
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      frm.patchValue({ pageIndex: 1 });
      const raw = frm.getRawValue();
      this.fin34020Service.queryFIN34020(this.buildPayload(raw)).pipe(finalize(() => this.loading = false), takeUntilDestroyed(this.destroyRef)).subscribe(response => {
        const dataAny = response?.Data as any;
        this.data = dataAny?.QueryData ?? [];
        this.setFooter(dataAny?.TotalSummary);
        this.totalRecords = response?.TotalCount ?? this.data.length;
        this.lastQueryBody = raw;
        this.queryStateService.setQueryState(this.ProgNo, raw);
      });
    })
  }
  downloadFIN34020Excel(): void {
    if (!this.lastQueryBody) {
      this.messageService.warnBubble('請先執行查詢以產生報表。');
      return;
    }
    const export$ = this.fin34020Service.exportFIN34020Excel(this.buildPayload(this.lastQueryBody));
    this.fileExportService.executeFileExport(export$.pipe(takeUntilDestroyed(this.destroyRef)), '.xlsx', (isLoading) => this.btnExportExcelLoading = isLoading, `FIN34020_客戶收款明細表`).subscribe();
  }

  downloadFIN34020PDF(): void {
    if (!this.lastQueryBody) {
      this.messageService.warnBubble('請先執行查詢以產生報表。');
      return;
    }
    const export$ = this.fin34020Service.exportFIN34020PDF(this.buildPayload(this.lastQueryBody));
    this.fileExportService.executeFileExport(export$.pipe(takeUntilDestroyed(this.destroyRef)), '.pdf', (isLoading) => this.btnExportPdfLoading = isLoading, `FIN34020_客戶收款明細表`).subscribe();
  }
}
