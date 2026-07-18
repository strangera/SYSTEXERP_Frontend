import { AsyncPipe, DatePipe, Location } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { MultiSelectComponent } from '@shared/components/multi-select/multi-select.component';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs/operators';
import { FileExportService } from 'src/app/shared/service/file-export.service';
import { Fin34030Request, Fin34030Response, Fin34030Service } from '../../../service/api/fin/fin34030.service';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarRangeComponent } from '../../../shared/components/calendar-range/calendar-range.component';
import { RadiobuttonComponent } from '../../../shared/components/radiobutton/radiobutton.component';
import { TableReportComponent } from '../../../shared/components/table-report/table-report.component';
import { formatAmount, formatDate, ReportColumn } from '../../../shared/components/table-report/table-report.model';

//1.3.4 應收/應付帳款查詢(FIN34030)
@Component({
  selector: 'app-fin34030',
  templateUrl: './fin34030.component.html',
  standalone: true,
  imports: [
    AsyncPipe,
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeComponent,
    MultiSelectComponent,
    RadiobuttonComponent,
    ButtonComponent,
    TranslateModule,
    TableReportComponent,
    ButtonModule,
  ],
})
export class FIN34030Component extends BasicQueryPageComponent<any> implements OnInit {
  private readonly fin34030Service = inject(Fin34030Service);
  private readonly dropDown = inject(DropdownApiService);
  private readonly fileExportService = inject(FileExportService);
  private readonly datePipe = inject(DatePipe);
  private readonly destroyRef = inject(DestroyRef);
  private readonly location = inject(Location);
  data: Fin34030Response[] = [];
  totalRecords = 0;
  lastQueryBody: any;
  footerData: any;
  partyNoOptions = this.dropDown.queryPos2013({ VEN_Flag: '1' });
  columns: ReportColumn[] = [
    { field: 'PartyNo', header: '廠客代號', width: '90px' },
    { field: 'PartyName', header: '廠客名稱', width: '170px', align: 'left' },
    { field: 'SystemName', header: '系統別', width: '80px' },
    { field: 'RP_Flag', header: '收/付', width: '30px' },
    { field: 'ARAP_DocNo', header: '應收/應付帳款單號', width: '130px', type: 'link', linkDisabled: (row: Fin34030Response) => !row.ARAP_DocNo },
    { field: 'VoucherNo', header: '立帳傳票號碼', width: '110px', type: 'link', linkDisabled: (row: Fin34030Response) => !row.VoucherNo },
    { field: 'AccNo', header: '會計科目編號', width: '50px' },
    { field: 'AccName', header: '會計科目名稱', width: '120px', align: 'left' },
    { field: 'DocDate', header: '立帳日期', format: formatDate, width: '80px' },
    { field: 'DueDate', header: '到期日', format: formatDate, width: '80px' },
    { field: 'DocAmount', header: '應收(付)立帳金額', format: formatAmount, isSubTotal: true, width: '80px', align: 'right' },
    { field: 'PayAmount', header: '收(付)款金額', format: formatAmount, isSubTotal: true, width: '80px', align: 'right' },
    { field: 'AdjAmount', header: '調整金額', format: formatAmount, isSubTotal: true, width: '80px', align: 'right' },
    { field: 'BalanceAmount', header: '應收(付)帳款餘額', format: formatAmount, isSubTotal: true, width: '80px', align: 'right' },
  ];
  showFlagOptions = [{ value: 'Y', label: '顯示' }, { value: 'N', label: '隱藏' },];
  onlyTLTOptions = [{ value: 'Y', label: '是' }, { value: 'N', label: '否' },];
  queryForm = this.formBuilder.group({
    PartyNoList: [[] as string[]],
    DocDateFrom: [null as Date | null],
    DocDateTo: [null as Date | null],
    PayDateFrom: [null as Date | null],
    PayDateTo: [null as Date | null],
    AdjDateFrom: [null as Date | null],
    AdjDateTo: [null as Date | null],
    ShowAPAmount: ['Y' as string],
    ShowZeroBalance: ['Y' as string],
    OnlyTLT: ['N' as string],
    pageSize: [10000],
    pageIndex: [1],
    SortBy: [[{ field: 'PartyNo', order: 1 }]],
  });
  btnExportPdfLoading = false;
  ngOnInit(): void {
    this.initializePage('FIN34030', '', this.queryForm, (form) => this.onSubmit(form));
  }
  /** 不送 PageIndex/PageSize：一次載入全部資料，才能在前端算正確的廠客小計與總計 */
  private buildPayload(body: any): Fin34030Request {
    return {
      PartyNoList: (body.PartyNoList ?? []).filter((x: string) => !!x),
      DocDateFrom: this.datePipe.transform(body.DocDateFrom, 'yyyy-MM-dd'),
      DocDateTo: this.datePipe.transform(body.DocDateTo, 'yyyy-MM-dd'),
      PayDateFrom: this.datePipe.transform(body.PayDateFrom, 'yyyy-MM-dd'),
      PayDateTo: this.datePipe.transform(body.PayDateTo, 'yyyy-MM-dd'),
      AdjDateFrom: this.datePipe.transform(body.AdjDateFrom, 'yyyy-MM-dd'),
      AdjDateTo: this.datePipe.transform(body.AdjDateTo, 'yyyy-MM-dd'),
      ShowAPAmount: body.ShowAPAmount || 'Y',
      ShowZeroBalance: body.ShowZeroBalance || 'Y',
      OnlyTLT: body.OnlyTLT || 'N',
      SortBy: body.SortBy?.length ? body.SortBy : [{ field: 'PartyNo', order: 1 }],
    };
  }
  private setFooter(rows: Fin34030Response[]): void {
    this.footerData = rows.reduce(
      (acc, row) => ({
        DocAmount: acc.DocAmount + (Number(row.DocAmount) || 0),
        PayAmount: acc.PayAmount + (Number(row.PayAmount) || 0),
        AdjAmount: acc.AdjAmount + (Number(row.AdjAmount) || 0),
        BalanceAmount: acc.BalanceAmount + (Number(row.BalanceAmount) || 0),
      }),
      { DocAmount: 0, PayAmount: 0, AdjAmount: 0, BalanceAmount: 0 }
    );
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const raw = frm.getRawValue();
      this.fin34030Service.queryFIN34030(this.buildPayload(raw)).pipe(finalize(() => this.loading = false), takeUntilDestroyed(this.destroyRef)).subscribe(response => {
        this.data = response?.Data ?? [];
        this.totalRecords = this.data.length;
        this.setFooter(this.data);
        this.lastQueryBody = raw;
        this.queryStateService.setQueryState(this.ProgNo, raw);
      });
    })
  }
  downloadFIN34030PDF(): void {
    if (!this.lastQueryBody) {
      this.messageService.warnBubble('請先執行查詢以產生報表。');
      return;
    }
    const export$ = this.fin34030Service.exportFIN34030PDF(this.buildPayload(this.lastQueryBody));
    this.fileExportService.executeFileExport(export$.pipe(takeUntilDestroyed(this.destroyRef)), '.pdf', (isLoading) => this.btnExportPdfLoading = isLoading, `FIN34030_應收應付帳款查詢`).subscribe();
  }
  onLinkClick(event: { rowData: Fin34030Response; field: string }): void {
    const { rowData, field } = event;
    if (field === 'VoucherNo') {
      this.openVoucherPage(rowData);
    } else if (field === 'ARAP_DocNo') {
      this.openARAPPage(rowData);
    }
  }
  /** 開啟傳票頁面 FIN55010CRU */
  private openVoucherPage(rowData: Fin34030Response): void {
    const vouNo = rowData?.VoucherNo;
    if (!vouNo) return;
    try {
      const handoff = {
        vouNo,
        fromRoute: globalThis.location.pathname,
        ts: Date.now(),
      };
      localStorage.setItem('FIN55010_CRU_HANDOFF', JSON.stringify(handoff));
      localStorage.setItem('FIN55010_CRU_PROGNO', 'FIN55010');
    } catch (err) {
      console.error('[FIN34030] handoff save failed:', err);
      return;
    }
    const externalUrl = this.location.prepareExternalUrl('/account/fin/fin55010cru');
    globalThis.open(`${globalThis.location.origin}${externalUrl}`, '_blank', 'noopener');
  }
  /** 開啟應收/應付帳款頁面 - 收: FIN32010CRU, 付: FIN24010CRU */
  private openARAPPage(rowData: Fin34030Response): void {
    const docNo = rowData?.ARAP_DocNo;
    if (!docNo) return;
    const isAR = rowData?.RP_Flag === '收';
    const route = isAR ? '/account/fin/fin32010cru' : '/account/fin/fin24010cru';
    const localStorageKey = isAR ? 'FIN32010_CRU_HANDOFF' : 'FIN24010_CRU_HANDOFF';
    try {
      const handoff = {
        arsId: docNo,
        fromRoute: globalThis.location.pathname,
        ts: Date.now(),
      };
      localStorage.setItem(localStorageKey, JSON.stringify(handoff));
    } catch (err) {
      console.error('[FIN34030] handoff save failed:', err);
      return;
    }
    const externalUrl = this.location.prepareExternalUrl(route);
    globalThis.open(`${globalThis.location.origin}${externalUrl}`, '_blank', 'noopener');
  }
}
