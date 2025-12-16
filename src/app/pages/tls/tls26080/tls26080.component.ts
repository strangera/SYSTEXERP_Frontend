
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
import { AddButton, Column, createPaginationConfig } from '@shared/componentkit/table/table.model';
import { ApprovalStatus } from '@shared/models/tls/approval-status.model';
import { NGXLogger } from 'ngx-logger';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
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

  public readonly queryForm = this.formBuilder.group({
    pod_no: new FormControl<string | undefined>(undefined, [Validators.maxLength(10)]), // 活動單號
    pod_desc: new FormControl<string | undefined>(undefined, [Validators.maxLength(100)]), // 活動名稱
    pod_sdate: new FormControl<Date | void>(void 0), // 起始日期(起)
    pod_edate: new FormControl<Date | void>(this.service.dateE), // 起始日期(迄)
    pod_busdate: new FormControl<Date | undefined>(undefined), // 活動正檔日期
    ...createPaginationConfig([{ field: 'pod_no', order: 1 }]), // 分頁和排序參數
  });
  public readonly qf = computed(() => this.queryForm.controls);

  public readonly tableData = signal<TLS26080Data[]>([]);
  public readonly totalRecords = signal(0);
  public readonly selectedItems = signal<TLS26080Data[]>([]);

  public readonly editDisabled = (rowData: TLS26080Data) => !rowData.CanEdit;
  public readonly isRowSelectable = (rowData: TLS26080Data) => rowData.pod_status !== ApprovalStatus.刪除;

  public readonly columns: (Omit<Column, 'field'> & { field: keyof TLS26080Data; })[] = [
    { field: 'pod_no', header: '活動編號' },
    { field: 'pod_desc', header: '活動名稱' },
    { field: 'pod_sdate', header: '活動起始日期', format: v => this.datePipe.transform(v, 'yyyy/MM/dd') },
    { field: 'pod_edate', header: '活動終止日期', format: v => this.datePipe.transform(v, 'yyyy/MM/dd') },
    { field: 'pod_busdate', header: '活動正檔日期', format: v => this.datePipe.transform(v, 'yyyy/MM/dd') },
    { field: 'pod_back_sdate', header: '兌回起始日期', format: v => this.datePipe.transform(v, 'yyyy/MM/dd') },
    { field: 'pod_back_edate', header: '兌回終止日期', format: v => this.datePipe.transform(v, 'yyyy/MM/dd') },
    { field: 'pod_status', header: '狀態', format: this.service.approvalStatus.bind(this) },
  ];

  public readonly addButton = computed((): AddButton[] => {
    const approval = (rowData: TLS26080Data) => {
      this.service.loadApproval(rowData).subscribe(this.onSubmit.bind(this));
    };

    return [
      {
        label: '核准', icon: 'pi pi-check-circle text-green-500',
        action: approval,
        disabled: (rowData: TLS26080Data) => rowData.pod_status !== ApprovalStatus.未核准,
      },
      {
        label: '反核准', icon: 'pi pi-undo text-orange-500',
        action: approval,
        disabled: (rowData: TLS26080Data) => rowData.pod_status !== ApprovalStatus.已核准,
      },
    ];
  });

  public readonly tableLoading = signal<boolean>(!1);
  public readonly deleteLoading = signal<boolean>(!1);

  public readonly loadingEffect = effect(() => {
    this.loading = this.tableLoading()
      || this.deleteLoading()
      || this.service.capItemsLoading()
      || this.service.tltTalentOptionsLoading()
      || this.service.tltTalentChargeOptionsLoading();
  });

  constructor(
    public readonly service: TLS26080Service,
    private readonly datePipe: DatePipe,
    private logger: NGXLogger,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.initializePage('TLS26080', '/TLS/TLS26080CRU', this.queryForm, this.onSubmit.bind(this));

    this.service.loadAPS1003(['E']);
  }

  public onSubmit(): void {
    this.handleSubmit(this.queryForm, () => {
      const raw = <TLS26080Query>{ ...this.queryForm.getRawValue() };
      const payload = Object.fromEntries(Object.entries(raw).filter(([_, v]) =>
        v !== null && v !== void 0 && (!(Array.isArray(v)) || v.length > 0)
      )) as unknown as TLS26080Query;

      this.tableLoading.set(!0);
      this.queryStateService.setQueryState(this.ProgNo, this.queryForm.getRawValue());
      this.logger.debug(`submit:`, [payload]);
      this.service.loadTLS26080(payload).pipe(
        finalize(() => this.tableLoading.set(!1))
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
    this.deleteLoading.set(!0);
    this.service.deleteTLS26080(event.map(v => String(v.id))).pipe(
      finalize(() => this.deleteLoading.set(!1))
    ).subscribe({
      next: () => {
        this.messageService.successBubble('刪除成功');
        this.onSubmit(); // 重新查詢
      },
      error: () => this.messageService.errorBubble('刪除失敗')
    });
  }
}
