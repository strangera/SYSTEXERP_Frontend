
import { DatePipe } from '@angular/common';
import { Component, computed, effect, OnInit } from '@angular/core';
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
    pod_sdate: new FormControl<Date>(this.service.dateS), // 起始日期(起)
    pod_edate: new FormControl<Date>(this.service.dateE), // 起始日期(迄)
    pod_busdate: new FormControl<Date | undefined>(undefined), // 活動正檔日期
    ...createPaginationConfig([{ field: 'pod_no', order: 1 }]), // 分頁和排序參數
  });
  public readonly qf = computed(() => this.queryForm.controls);

  public selectedItems: TLS26080Data[] = [];

  public readonly editDisabled = (rowData: TLS26080Data) =>
    (Reflect.has(rowData, 'CanEdit') && !!rowData) || rowData.pod_status !== ApprovalStatus.未核准;
  public readonly isRowSelectable = (rowData: TLS26080Data) =>
    Reflect.has(rowData, 'CanDelete') && !!rowData || rowData.pod_status === ApprovalStatus.未核准;

  public readonly totalRecords = computed(() => this.service.TLS26080Data().length);

  private queryTLS26080 = computed(() => {
    const { pod_no, pod_desc, pod_status, pod_sdate, pod_edate, pod_busdate } = this.queryForm.getRawValue();
    return <TLS26080Query>{
      pod_sdate_start: pod_sdate!,
      pod_sdate_end: pod_edate!,
      ...(pod_no && { pod_no }),
      ...(pod_desc && { pod_desc }),
      ...(pod_status && { pod_status }),
      ...(pod_busdate && { pod_busdate }),
    };
  });

  public columns: Column[] = [
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

  // 提交查詢
  public onSubmit(): void {
    this.handleSubmit(this.queryForm, () => {
      this.service.loadTLS26080(this.queryTLS26080());
      this.queryStateService.setQueryState(this.ProgNo, this.queryForm.getRawValue());
      this.loading = !1;
    });
  }

  // 刪除項目
  public onDelete(data: TLS26080Data | TLS26080Data[]): void {
    this.confirmationService.confirm({
      message: '是否確認刪除?',
      accept: () => {

        this.messageService.successBubble('刪除成功');
        this.loading = !1;
      },
    });
    //   const items = Array.isArray(data) ? data : [data];
    //   if (items.length === 0) return;

    //   const idList = items
    //     .filter(item => item && item.id != null)
    //     .map(item => item.id);

    //   if (idList.length === 0) {
    //     this.messageService.warnBubble('未找到有效的刪除項目');
    //     return;
    //   }

    //   // 模擬 API 刪除
    //   setTimeout(() => {
    //     this.mockData = this.mockData.filter(item => !idList.includes(item.id));
    //     this.messageService.successBubble('選中項目刪除成功');
    //     this.onSubmit(this.queryForm); // 刷新資料
    //   }, 500);

    //   this.selectedItems = [];
  }
}
