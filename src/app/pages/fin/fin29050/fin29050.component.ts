import { AsyncPipe, DatePipe, Location } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { DropdownRangeComponent } from '@shared/components/dropdown-range/dropdown-range.component';
import { InputNumberRangeComponent } from '@shared/components/input-number-range/input-number-range.component';
import { TableSubheaderComponent } from '@others/component/table/table-subheader/table-subheader.component';
import { Column, createPaginationConfig, formatAmount, formatDate, LazyLoadEvent } from '@others/component/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize, Observable } from 'rxjs';
import { NavigationHelperService } from 'src/app/reports/services/navigation-helper.service';
import { FIN29050Data, FIN29050Service, QueryFIN29050Request } from '../../../service/api/fin/fin29050.service';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarRangeComponent } from '../../../shared/components/calendar-range/calendar-range.component';
import { RadiobuttonComponent } from '../../../shared/components/radiobutton/radiobutton.component';
import { ReportSignatureComponent } from '@shared/biz-components/report-signature/report-signature.component';

@Component({
  selector: 'app-fin29050',
  templateUrl: './fin29050.component.html',
  standalone: true,
  imports: [ReportSignatureComponent, 
    ButtonModule,
    TableSubheaderComponent,
    DropdownRangeComponent,
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeComponent,
    ButtonComponent,
    TranslateModule,
    InputNumberRangeComponent,
    RadiobuttonComponent,
    AsyncPipe
  ]
})
export class FIN29050Component extends BasicQueryPageComponent<FIN29050Data> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    VEN_No_From: [null],
    VEN_No_To: [null],
    ACP_Date_From: [new Date(), Validators.required],
    ACP_Date_To: [new Date(), Validators.required],
    ACP_Amt_From: [null],
    ACP_Amt_To: [null],
    AccNo_From: [null],
    AccNo_To: [null],
    ShowZeroBalance: ['N'],
    UnpaidIncludeReserve: ['N'],
    ...createPaginationConfig([{ field: 'VendorNo', order: 1 }]),
  });

  VendorNoOptions = this.dropdown.queryPos2013({ VEN_Flag: '' });
  AccNoOptions = this.dropdown.queryGls1005();
  data: FIN29050Data[] = [];
  totalRecords = 0;
  totalData: any[] = [];
  // 是否於查詢後自動載入剩餘頁（不修改共用元件）
  autoLoadAll = false; // 改為由 table 滾動觸發載入
  pdfBtnLoading = false;
  excelBtnLoading = false;
  // 提供給子 table 用於滾動載入
  lastQueryBody: any | null = null;
  queryFn: ((body: any) => Observable<any>) | null = null;

  columns: Column[] = [
    { field: 'VendorNo', header: '廠客代號', visible: true },
    { field: 'VendorName', header: '廠客名稱', visible: true },
    { field: 'Summary', header: '摘要', visible: true },
    { field: 'BookDate', header: '立帳日期', visible: true, format: formatDate },
    { field: 'VoucherNo', header: '傳票編號', visible: true, type: 'detail' },
    { field: 'PayableAmount', header: '應付金額', visible: true, format: formatAmount, isTotal: true },
    { field: 'OffsetAmount', header: '沖帳金額', visible: true, format: formatAmount, isTotal: true },
    { field: 'ReservationAmount', header: '保留款金額', visible: true, format: formatAmount, isTotal: true },
    { field: 'OffsetReservationAmount', header: '沖保留款金額', visible: true, format: formatAmount, isTotal: true },
    { field: 'UnpaidAmount', header: '未付金額', visible: true, format: formatAmount, isTotal: true }
  ];

  constructor(
    private fin29050Service: FIN29050Service,
    private datePipe: DatePipe,
    private location: Location,
    private readonly dropdown: DropdownApiService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN29050', '/fin/fin29050cru', this.queryForm, (frm) => this.onSubmit(frm));
  }
  private readonly navHelper = inject(NavigationHelperService);

  override onDetail(row: FIN29050Data) {
    const vouNo = row?.VoucherNo;
    if (!vouNo) {
      this.messageService?.warnBubble?.('無法開啟，缺少傳票號碼。');
      return;
    }

    const handoff = {
      vouNo,
      fromRoute: globalThis.location.pathname,
      ts: Date.now(),
    };
    this.navHelper.openInNewTab('/reports/fin/fin29050', handoff);
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const raw = frm.getRawValue();
      this.loading = true;
      const pageSize = Number(raw.pageSize) || 0;
      const pageIndex = Number(raw.pageIndex) || 0;
      const requestData: QueryFIN29050Request = {
        PageSize: pageSize,
        PageIndex: pageIndex,
        SortBy: raw.SortBy || [{ field: 'VendorNo', order: 1 }],
        VEN_No_From: raw.VEN_No_From || null,
        VEN_No_To: raw.VEN_No_To || null,
        ACP_Date_From: this.datePipe.transform(raw.ACP_Date_From, 'yyyy-MM-dd') || '',
        ACP_Date_To: this.datePipe.transform(raw.ACP_Date_To, 'yyyy-MM-dd') || '',
        ACP_Amt_From: raw.ACP_Amt_From ?? undefined,
        ACP_Amt_To: raw.ACP_Amt_To ?? undefined,
        AccNo_From: raw.AccNo_From || null,
        AccNo_To: raw.AccNo_To || null,
        ShowZeroBalance: raw.ShowZeroBalance === 'N' ? 'N' : 'A',
        UnpaidIncludeReserve: raw.UnpaidIncludeReserve === 'N' ? 'N' : 'Y'
      } as QueryFIN29050Request;

      this.fin29050Service.queryFIN29050(requestData).pipe(untilDestroyed(this), finalize(() => { this.loading = false; })).subscribe((response) => {
        if (response && response.Data) {
          const rows: any[] = response.Data || [];
          // 檢查是否有後端回傳的頁尾總計列（IsTotal===1 或 VendorNo==='TOTAL' 或 VendorName==='總計'）
          const totals = rows.filter(r => r?.IsTotal === 1 || String(r?.VendorNo) === 'TOTAL' || String(r?.VendorName) === '總計');
          if (totals && totals.length) {
            // 把總計轉成 totalData，並把原本的總計列從 data 中移除
            this.totalData = totals.map(t => ({ ...t, VendorNo: '' }));
            this.data = rows.filter(r => !(r?.IsTotal === 1 || String(r?.VendorNo) === 'TOTAL' || String(r?.VendorName) === '總計'));
          } else {
            this.totalData = [];
            this.data = rows;
          }
          this.totalRecords = response.TotalCount || 0;
        } else {
          this.data = [];
          this.totalData = [];
          this.totalRecords = 0;
        }
        this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
        // 設定給子元件，讓子元件可在滾動時以 queryFunction 載入下一頁
        // 同時提供 child 常用的 pageSize/pageIndex 小寫欄位供判斷
        this.lastQueryBody = { ...requestData, pageSize: requestData.PageSize, pageIndex: requestData.PageIndex };
        // queryFn 會接受 child 傳進來的 body (小寫 pageSize/pageIndex)，這裡把它轉回 API 要求的格式
        this.queryFn = (body: any) => {
          const pageSize = body?.pageSize ?? body?.PageSize ?? requestData.PageSize ?? 30;
          const pageIndex = body?.pageIndex ?? body?.PageIndex ?? 1;
          const sortFromEvent = body?.SortBy ?? body?.multiSortMeta ?? requestData.SortBy ?? [];
          const mapped: QueryFIN29050Request = {
            ...requestData,
            PageSize: pageSize,
            PageIndex: pageIndex,
            SortBy: sortFromEvent,
          } as QueryFIN29050Request;
          return this.fin29050Service.queryFIN29050(mapped);
        };
      });
    });
  }

  private buildExportPayload(): QueryFIN29050Request {
    const raw = this.queryForm.getRawValue();
    return {
      PageSize: 0,
      PageIndex: 0,
      OrderBy: '',
      Offset: 0,
      SortBy: raw.SortBy || [],
      VEN_No_From: raw.VEN_No_From || '',
      VEN_No_To: raw.VEN_No_To || '',
      ACP_Date_From: this.datePipe.transform(raw.ACP_Date_From, 'yyyy-MM-dd') || '',
      ACP_Date_To: this.datePipe.transform(raw.ACP_Date_To, 'yyyy-MM-dd') || '',
      ACP_Amt_From: raw.ACP_Amt_From ?? undefined,
      ACP_Amt_To: raw.ACP_Amt_To ?? undefined,
      AccNo_From: raw.AccNo_From || '',
      AccNo_To: raw.AccNo_To || '',
      ShowZeroBalance: raw.ShowZeroBalance === 'N' ? 'N' : 'A',
      UnpaidIncludeReserve: raw.UnpaidIncludeReserve === 'N' ? 'N' : 'Y'
    } as QueryFIN29050Request;
  }

  // 處理共用 table 的 lazyLoadData 事件（pageIndex, pageSize, SortBy）
  override onLazyLoadData(event: LazyLoadEvent, queryForm?: FormGroup): void {
    if (!event) return;
    const pageSize = (event as any).pageSize ?? (event as any).rows ?? 30;
    const pageIndex = (event as any).pageIndex ?? 1;
    const body = { pageIndex, pageSize, SortBy: (event as any).SortBy ?? (event as any).multiSortMeta ?? [{ field: 'VendorNo', order: 1 }] };
    console.log('[FIN29050] onLazyLoadData', { pageIndex, pageSize, body, queryFormExists: !!queryForm });

    // 把目前的分頁與排序回寫到 queryForm，讓匯出/儲存狀態時能保留排序與分頁
    if (queryForm) {
      try {
        queryForm.patchValue({ pageIndex, pageSize, SortBy: body.SortBy || [{ field: 'VendorNo', order: 1 }] });
      } catch (e) {
        // ignore patch errors
      }
    }

    if (!this.queryFn) {
      return;
    }

    this.loading = true;
    console.log('[FIN29050] calling queryFn with', body);
    this.queryFn(body)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (response) => {
          console.log('[FIN29050] queryFn response ->', { pageIndex, pageSize, dataLength: response?.Data?.length, totalCount: response?.TotalCount, firstItem: response?.Data?.[0] });
          if (response && response.Data) {
            const rows: any[] = response.Data || [];
            const totals = rows.filter(r => r?.IsTotal === 1 || String(r?.VendorNo) === 'TOTAL' || String(r?.VendorName) === '總計');
            const payloadRows = rows.filter(r => !(r?.IsTotal === 1 || String(r?.VendorNo) === 'TOTAL' || String(r?.VendorName) === '總計'));

            // 使用共用 table 的 lazy 模式時，p-table 期待收到當前頁的資料（非累積），
            // 因此每次都以後端回傳的頁資料替換 `data`。
            this.data = payloadRows;

            this.totalData = totals.map(t => ({ ...t, VendorNo: '' })) || [];
            this.totalRecords = response.TotalCount || this.totalRecords;
          }
        },
        error: () => {
          this.messageService?.warnBubble?.('資料載入失敗');
        }
      });
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
        next: (r) => this.downloadFile(r, '.xlsx', '應付帳款明細表'),
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
    const url = globalThis.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    globalThis.URL.revokeObjectURL(url);
  }
}
