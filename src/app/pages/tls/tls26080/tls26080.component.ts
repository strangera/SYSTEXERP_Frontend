
import { DatePipe } from '@angular/common';
import { Component, computed, effect, OnInit, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TLS26080Service } from '@service/api/tls/tls26080.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column, createPaginationConfig } from '@shared/componentkit/table/table.model';
import { ApprovalStatus } from '@shared/models/tls/approval-status.model';
import { AccordionModule } from 'primeng/accordion';
import { tap } from 'rxjs';
import { TLS26080Data, TLS26080Query } from './tls26080.model';

@Component({
  selector: 'app-tls26080',
  templateUrl: './tls26080.component.html',
  styleUrl: './tls26080.component.scss',
  standalone: !0,
  imports: [
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    CalendarComponent,
    CalendarRangeComponent,
    InputTextComponent,
    MenubarComponent,
    TableComponent,
  ],
})
export class TLS26080Component extends BasicQueryPageComponent<TLS26080Data> implements OnInit {

  public queryForm = this.formBuilder.group({
    pod_no: new FormControl<string | undefined>(undefined, [Validators.maxLength(10)]), // 活動單號
    pod_desc: new FormControl<string | undefined>(undefined, [Validators.maxLength(100)]), // 活動名稱
    pod_status: new FormControl<ApprovalStatus>(ApprovalStatus.未核准), // 核准狀態
    org_id: new FormControl<string | undefined>(undefined), // 部門
    pod_date: new FormControl<{ start: Date | null; end: Date | null; }>({ start: this.service.dateS, end: this.service.dateE }), // 活動起始日期
    pod_sdate: new FormControl<Date>(this.service.dateS), // 起始日期(起)
    pod_edate: new FormControl<Date>(this.service.dateE), // 起始日期(迄)
    pod_busdate: new FormControl<Date | undefined>(undefined), // 活動正檔日期
    ...createPaginationConfig([{ field: 'pod_no', order: 1 }]), // 分頁和排序參數
  });
  public readonly qf = computed(() => this.queryForm.controls);

  public readonly tableData = signal<TLS26080Data[]>([]);
  public readonly totalRecords = signal(0);
  public readonly selectedItems = signal<TLS26080Data[]>([]);

  public readonly editDisabled = (rowData: TLS26080Data) => {
    if (!rowData) return !0;
    const hasCanEditFlag = Object.hasOwn(rowData, 'CanEdit');
    const notPending = rowData.pod_status !== ApprovalStatus.未核准;
    return hasCanEditFlag || notPending;
  };
  public readonly isRowSelectable = (rowData: TLS26080Data) => {
    if (!rowData) return !1;
    const hasCanDeleteFlag = Object.hasOwn(rowData, 'CanDelete');
    const isPending = rowData.pod_status === ApprovalStatus.未核准;
    return hasCanDeleteFlag || isPending;
  };

  private payload = computed((): TLS26080Query => {
    const { org_id, ...rest } = this.qf();
    return Object.fromEntries(Object.entries(rest)
      .map(([k, v]) => [k, v.value])
      .filter(([_, v]) => v !== null && v !== void 0 && v !== '')
    );
  });

  public readonly loadingEffect = effect(() => {
    this.loading = this.service.tableLoading()
      || this.service.campaignLoading()
      || this.service.capItemsLoading()
      || this.service.fileUploadLoading()
      || this.service.exampleDownLoading()
      || this.service.approvalStatusLoading();
  });

  public readonly columns: (Omit<Column, 'field'> & { field: keyof TLS26080Data; })[] = [
    { field: 'pod_no', header: '活動編號' },
    { field: 'pod_desc', header: '活動名稱' },
    { field: 'pod_sdate', header: '活動起始日期', format: v => this.datePipe.transform(v, 'YYYY/MM/dd') },
    { field: 'pod_edate', header: '活動終止日期', format: v => this.datePipe.transform(v, 'YYYY/MM/dd') },
    { field: 'pod_busdate', header: '活動正檔日期', format: v => this.datePipe.transform(v, 'YYYY/MM/dd') },
    { field: 'pod_edate', header: '兌回起始日期', format: v => this.datePipe.transform(v, 'YYYY/MM/dd') },
    { field: 'pod_edate', header: '兌回終止日期', format: v => this.datePipe.transform(v, 'YYYY/MM/dd') },
    { field: 'pod_status', header: '狀態', format: this.service.approvalStatus.bind(this) },
  ];

  constructor(
    public readonly service: TLS26080Service,
    private readonly datePipe: DatePipe,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.initializePage('TLS26080', '/TLS/TLS26080CRU', this.queryForm, this.onSubmit.bind(this));

    this.service.loadAPS1003(['E']);
  }

  public onSubmit(): void {
    this.handleSubmit(this.queryForm, () => {
      this.service.loadTLS26080(this.payload()).pipe(
        tap(res => {
          this.tableData.set(res.Data);
          this.totalRecords.set(res.TotalCount || 0);
        }),
      ).subscribe();
      this.queryStateService.setQueryState(this.ProgNo, this.queryForm.getRawValue());
    });
  }

  public onDelete(event: TLS26080Data[]): void {
    this.service.deleteTLS26080(event.map(v => String(v.id))).pipe()
      .subscribe({
        next: () => this.messageService.successBubble('刪除成功'),
        error: () => this.messageService.errorBubble('刪除失敗')
      });
  }
}
