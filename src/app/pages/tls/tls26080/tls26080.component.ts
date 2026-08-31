import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ApprovalStatus, TLS26080Service } from '@service/api/tls/tls26080.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarRangeComponent } from '@shared/components/calendar-range/calendar-range.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { MultiSelectComponent } from '@shared/components/multi-select/multi-select.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { AddButton, ReportColumn } from '@shared/components/table-report/table-report.model';
import { createPaginationConfig } from '@others/component/table/table.model';
import { FileExportService } from '@shared/service/file-export.service';
import { NGXLogger } from 'ngx-logger';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs';
import { ExportTLS26080PDFRequest, TLS26080Data, TLS26080Query } from './tls26080.model';

@Component({
  selector: 'app-tls26080',
  templateUrl: './tls26080.component.html',
  standalone: true,
  imports: [
    AccordionModule,
    AsyncPipe,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    ButtonModule,
    CalendarComponent,
    CalendarRangeComponent,
    InputTextComponent,
    MenubarComponent,
    MultiSelectComponent,
    TableReportComponent,
  ],
})
export class TLS26080Component extends BasicQueryPageComponent<TLS26080Data> implements OnInit {

  private readonly dropdown = inject(DropdownApiService);

  private readonly defaultSort = [{ field: 'pod_no', order: 1 }] as const;
  public readonly queryForm = this.formBuilder.group({
    pod_no: new FormControl<string | undefined>(undefined, [Validators.maxLength(25)]), // 活動單號
    pod_desc: new FormControl<string | undefined>(undefined, [Validators.maxLength(100)]), // 活動名稱
    tlt_noList: new FormControl<string[] | undefined>(undefined), // 專櫃編號(多選)
    pod_sdate: new FormControl<Date | undefined>(undefined), // 起始日期(起)
    pod_edate: new FormControl<Date | undefined>(this.service.dateE), // 起始日期(迄)
    pod_busdate: new FormControl<Date | undefined>(undefined), // 活動正檔日期
    ...createPaginationConfig([...this.defaultSort]),
    pageSize: [30], // 查詢頁面預設 30 筆
  });
  public readonly qf = computed(() => this.queryForm.controls);

  // 專櫃編號選項
  public readonly tltNoOptions = this.dropdown.queryTltTalent();

  public lastQueryBody?: TLS26080Query;
  public readonly tableData = signal<TLS26080Data[]>([]);
  public readonly totalRecords = signal(0);
  public readonly selectedItems = signal<TLS26080Data[]>([]);

  public readonly editDisabled = (rowData: TLS26080Data) => rowData.pod_status === ApprovalStatus.已核准;

  public readonly printLoading = signal(false);

  public readonly addButton: AddButton[] = [
    {
      label: '列印',
      icon: 'pi pi-print',
      action: (rowData: TLS26080Data) => {
        if (!rowData?.pod_no) {
          this.messageService.errorBubble('無活動編號，無法列印');
          return;
        }
        const payload: ExportTLS26080PDFRequest = {
          PageSize: 0,
          PageIndex: 0,
          Offset: 0,
          SortBy: [{ field: 'pod_no', order: 1 }],
          POD_No: rowData.pod_no,
          POD_Desc: rowData.pod_desc,
          POD_SDate_start: rowData.pod_sdate
            ? this.datePipe.transform(rowData.pod_sdate, 'yyyy-MM-dd') ?? undefined
            : undefined,
          POD_SDate_end: rowData.pod_edate
            ? this.datePipe.transform(rowData.pod_edate, 'yyyy-MM-dd') ?? undefined
            : undefined,
          POD_BusDate: rowData.pod_busdate
            ? this.datePipe.transform(rowData.pod_busdate, 'yyyy-MM-dd') ?? undefined
            : undefined,
          ...(rowData.cap_item ? { CAP_ItemList: [rowData.cap_item] } : {}),
        };
        this.fileExportService.executeFileExport(
          this.service.exportTLS26080PDF(payload),
          '.pdf',
          isLoading => this.printLoading.set(isLoading),
        ).subscribe();
      },
    },
  ];

  /** 組裝查詢 payload，供 onSubmit 與 queryFunction 使用 */
 private buildQueryPayload(
  overrides?: Partial<TLS26080Query>
): TLS26080Query {
  const formValue = this.queryForm.getRawValue();

  const payload: TLS26080Query = {
    POD_No: formValue.pod_no || undefined,
    POD_Desc: formValue.pod_desc || undefined,
    TLT_NoList: formValue.tlt_noList?.length ? formValue.tlt_noList : undefined,

    POD_SDate_start: formValue.pod_sdate
      ? this.datePipe.transform(formValue.pod_sdate, 'yyyy-MM-dd') ?? undefined
      : undefined,

    POD_SDate_end: formValue.pod_edate
      ? this.datePipe.transform(formValue.pod_edate, 'yyyy-MM-dd') ?? undefined
      : undefined,

    POD_BusDate: formValue.pod_busdate
      ? this.datePipe.transform(formValue.pod_busdate, 'yyyy-MM-dd') ?? undefined
      : undefined,

    pageIndex: formValue.pageIndex ?? 1,
    pageSize: formValue.pageSize ?? 30,
    SortBy: formValue.SortBy?.length
      ? formValue.SortBy
      : [...this.defaultSort],

    ...overrides,
  };

  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) =>
      value !== null &&
      value !== undefined &&
      value !== '' &&
      (!Array.isArray(value) || value.length > 0)
    )
  ) as TLS26080Query;
}
 public readonly queryFunction = (body: unknown) => {
  return this.service.loadTLS26080(body as TLS26080Query);
};

  public readonly columns: ReportColumn[] = [
    { field: 'pod_no', header: '活動編號' },
    { field: 'pod_desc', header: '活動名稱' },
    { field: 'pod_sdate', header: '活動起始日期', format: v => this.datePipe.transform(v, 'yyyy/MM/dd') },
    { field: 'pod_edate', header: '活動終止日期', format: v => this.datePipe.transform(v, 'yyyy/MM/dd') },
    { field: 'pod_busdate', header: '活動正檔日期', format: v => this.datePipe.transform(v, 'yyyy/MM/dd') },
    { field: 'pod_back_sdate', header: '兌回起始日期', format: v => this.datePipe.transform(v, 'yyyy/MM/dd') },
    { field: 'pod_back_edate', header: '兌回終止日期', format: v => this.datePipe.transform(v, 'yyyy/MM/dd') },
    { field: 'pod_status', header: '狀態', format: this.service.approvalStatus.bind(this) },
  ];

  public readonly tableLoading = signal<boolean>(false);
  public readonly deleteLoading = signal<boolean>(false);
  public readonly approveLoading = signal<boolean>(false);
  public readonly revokeLoading = signal<boolean>(false);

  public readonly loadingEffect = effect(() => {
    this.loading = this.tableLoading() || this.deleteLoading() || this.approveLoading() || this.revokeLoading()
  }, { allowSignalWrites: true });

  constructor(
    public readonly service: TLS26080Service,
    private readonly datePipe: DatePipe,
    private logger: NGXLogger,
    private readonly fileExportService: FileExportService,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.initializePage('TLS26080', '/TLS/TLS26080CRU', this.queryForm, this.onSubmit.bind(this));

    this.service.loadAPS1003(['E']);
  }

  public onSubmit(): void {
    this.handleSubmit(this.queryForm, () => {
      const payload = this.buildQueryPayload({ pageSize: 30, pageIndex: 1 });
      this.lastQueryBody = payload;
      this.tableLoading.set(true);
      this.queryStateService.setQueryState(this.ProgNo, this.queryForm.getRawValue());
      this.logger.debug(`submit:`, [payload]);
      this.queryFunction(payload).pipe(
        finalize(() => this.tableLoading.set(false))
      ).subscribe({
        next: res => {
          if (res.Status !== '0000') return;
          this.tableData.set(res.Data || []);
          this.totalRecords.set(res.TotalCount || 0);
        },
      });
    });
  }

  public onDelete(event: TLS26080Data[]): void {
    if (event.some(item => item.pod_status !== ApprovalStatus.未核准)) {
      this.messageService.warnBubble('已核准資料不可刪除');
      return;
    }
    this.messageService.confirm({
      header: '確認刪除',
      message: `是否確認刪除 ${event.length} 筆資料？`,
      accept: () => {
        this.deleteLoading.set(true);
        const podNoList = event.map(v => v.pod_no);
        this.service.deleteTLS26080(podNoList).pipe(finalize(() => this.deleteLoading.set(false))).subscribe(res => {
          this.messageService.successBubble(res.Message || '刪除成功');
          this.onSubmit(); // 重新查詢
        });
      },
    });
  }

  public onApprove(): void {
    const selected = this.selectedItems();
    if (selected.some(item => item.pod_status !== ApprovalStatus.未核准)) {
      this.messageService.warnBubble('您選取包含已核准的資料，無法進行審核。');
      return;
    }
    this.messageService.confirm({
      header: '確認審核',
      message: `是否確認審核 ${selected.length} 筆活動？`,
      accept: () => {
        this.approveLoading.set(true);
        const podNoList = selected.map(v => v.pod_no);
        this.service.updateTLS26080Status(podNoList, ApprovalStatus.已核准).pipe(finalize(() => this.approveLoading.set(false))).subscribe(res => {
          this.messageService.successBubble(res.Message || '審核成功');
          this.selectedItems.set([]);
          this.onSubmit(); // 重新查詢
        });
      },
    });
  }

  public onRevoke(): void {
    const selected = this.selectedItems();
    if (selected.some(item => item.pod_status !== ApprovalStatus.已核准)) {
      this.messageService.warnBubble('您選取包含未核准的資料，無法進行反審核。');
      return;
    }
    this.messageService.confirm({
      header: '確認反審核',
      message: `是否確認反審核 ${selected.length} 筆活動？`,
      accept: () => {
        this.revokeLoading.set(true);
        const podNoList = selected.map(v => v.pod_no);
        this.service.updateTLS26080Status(podNoList, ApprovalStatus.未核准).pipe(finalize(() => this.revokeLoading.set(false))).subscribe(res => {
          this.messageService.successBubble(res.Message || '反審核成功');
          this.selectedItems.set([]);
          this.onSubmit(); // 重新查詢
        });
      },
    });
  }
}
