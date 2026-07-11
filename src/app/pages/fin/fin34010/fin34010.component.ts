import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize, map } from 'rxjs/operators';
import { formatDate, } from 'src/app/shared/componentkit/table-edit/table-edit-format';
import { FileExportService } from 'src/app/shared/service/file-export.service';
import { Fin34010Row, Fin34010Service, } from '../../../service/api/fin/fin34010.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { TableReportComponent } from '../../../shared/componentkit/table-report/table-report.component';
import { formatAmount, ReportColumn } from '../../../shared/componentkit/table-report/table-report.model';

@Component({
  selector: 'app-fin34010',
  templateUrl: './fin34010.component.html',
  standalone: true,
  imports: [
    AsyncPipe,
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeComponent,
    RadiobuttonComponent,
    ButtonComponent,
    TranslateModule,
    TableReportComponent,
    DropdownComponent,
    ButtonModule,
  ],
})
export class FIN34010Component extends BasicQueryPageComponent<any> implements OnInit {
  private readonly fin34010Service = inject(Fin34010Service);
  private readonly dropDown = inject(DropdownApiService);
  private readonly fileExportService = inject(FileExportService);
  private readonly datePipe = inject(DatePipe);
  private readonly destroyRef = inject(DestroyRef);
  data: Fin34010Row[] = [];
  totalRecords = 0;
  lastQueryBody: any;
  footerData: any;
  AccNo_ParamOptions = this.dropDown.queryGls1005();
  venNoOptions = this.dropDown.queryPos2013({ VEN_Flag: '' });
  columns: ReportColumn[] = [
    { field: 'ARS_Date', header: '立帳日期', format: formatDate, width: '80px' },
    { field: 'VEN_No', header: '客戶代號', width: '100px' },
    { field: 'VEN_Name', header: '客戶名稱', width: '170px', align: 'left' },
    { field: 'ARS_No', header: '帳款單號', width: '130px' },
    { field: 'AccNo', header: '科目代號', width: '60px' },
    { field: 'AccCName', header: '科目名稱', width: '140px', align: 'left' },
    { field: 'ARS_Amt', header: '帳款金額', format: formatAmount, isTotal: true, width: '80px', align: 'right' },
    { field: 'REC_Amt', header: '收/付款金額', format: formatAmount, isTotal: true, width: '80px', align: 'right' },
    { field: 'PTA_Amt', header: '已沖帳金額', format: formatAmount, isTotal: true, visible: false, width: '80px', align: 'right' },
    { field: 'ADJ_Amt', header: '調整金額', format: formatAmount, isTotal: true, width: '80px', align: 'right' },
    { field: 'Unpaid_Amt', header: '未收金額', format: formatAmount, isTotal: true, width: '80px', align: 'right' },
  ];
  showFlagOptions = [{ value: 'Y', label: '顯示' }, { value: 'N', label: '不顯示' },];
  queryForm = this.formBuilder.group({
    VEN_No: [null as string | null],
    AccNo: [null as string | null],
    ARSDateFrom: [null as Date | null],
    ARSDateTo: [null as Date | null],
    ShowArsAmt: ['Y' as string],
    ShowZeroAmt: ['Y' as string],
    pageSize: [10000],
    pageIndex: [1], // 你將初始頁碼改為 1
    SortBy: [[{ field: 'ARS_Date', order: 1 }]],
  });
  btnExportExcelLoading = false;
  btnExportPdfLoading = false;
  public queryFIN34010ForReport = (body: any) =>
    this.fin34010Service.queryFIN34010(body).pipe(
      map((res: any) => {
        const rows = res?.Data?.List;
        const dataAny = res?.Data as any;
        const summary = dataAny?.Summary ?? null;
        this.footerData = {
          ARS_Amt: summary.SumARS_Amt ?? 0,
          REC_Amt: summary.SumREC_Amt ?? 0,
          PTA_Amt: summary.SumPTA_Amt ?? 0,
          ADJ_Amt: summary.SumADJ_Amt ?? 0,
          Unpaid_Amt: summary.SumUnpaid_Amt ?? 0,
        };
        const totalCount = res.TotalCount;
        return {
          Data: rows,
          TotalCount: totalCount,
          GrandTotal: summary,
        };
      })
    );
  ngOnInit(): void {
    this.initializePage('FIN34010', '/FIN3000/FIN34010CRU', this.queryForm, (form) => this.onSubmit(form));
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const raw = frm.getRawValue();
      const payload = {
        ...raw,
        ARSDateFrom: this.datePipe.transform(raw.ARSDateFrom, 'yyyy-MM-dd'),
        ARSDateTo: this.datePipe.transform(raw.ARSDateTo, 'yyyy-MM-dd'),
      };
      this.fin34010Service.queryFIN34010(payload).pipe(finalize(() => this.loading = false), takeUntilDestroyed(this.destroyRef)).subscribe(response => {
        this.data = (response?.Data as any).List;
        const dataAny = (response.Data as any).Summary as any;
        this.footerData = {
          ARS_Amt: dataAny.SumARS_Amt ?? 0,
          REC_Amt: dataAny.SumREC_Amt ?? 0,
          PTA_Amt: dataAny.SumPTA_Amt ?? 0,
          ADJ_Amt: dataAny.SumADJ_Amt ?? 0,
          Unpaid_Amt: dataAny.SumUnpaid_Amt ?? 0,
        };
        this.totalRecords = response.TotalCount;
        this.lastQueryBody = payload;
        this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
      });
    })
  }
  downloadFIN34010Excel(): void {
    if (!this.lastQueryBody) {
      this.messageService.warnBubble('請先執行查詢以產生報表。');
      return;
    }
    const export$ = this.fin34010Service.exportFIN34010Excel(this.lastQueryBody);
    this.fileExportService.executeFileExport(export$.pipe(takeUntilDestroyed(this.destroyRef)), '.xlsx', (isLoading) => this.btnExportExcelLoading = isLoading, `FIN34010_應收帳款明細表`).subscribe();
  }

  downloadFIN34010PDF(): void {
    if (!this.lastQueryBody) {
      this.messageService.warnBubble('請先執行查詢以產生報表。');
      return;
    }
    const export$ = this.fin34010Service.exportFIN34010PDF(this.lastQueryBody);
    this.fileExportService.executeFileExport(export$.pipe(takeUntilDestroyed(this.destroyRef)), '.pdf', (isLoading) => this.btnExportPdfLoading = isLoading, `FIN34010_應收帳款明細表`).subscribe();
  }
}
