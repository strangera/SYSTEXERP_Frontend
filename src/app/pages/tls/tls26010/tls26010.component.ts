
import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, effect, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TLS26010Service } from '@service/api/tls/tls26010.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { AddButton, Column, createPaginationConfig } from '@shared/componentkit/table/table.model';
import { ApprovalStatus } from '@shared/models/tls/approval-status.model';
import { NGXLogger } from 'ngx-logger';
import { AccordionModule } from 'primeng/accordion';
import { tap } from 'rxjs';
import { TLS26010Data, TLS26010Query } from './tls26010.model';

@Component({
  selector: 'app-tls26010',
  templateUrl: './tls26010.component.html',
  styleUrls: ['./tls26010.component.scss'],
  standalone: !0,
  imports: [
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    CalendarRangeComponent,
    MenubarComponent,
    MultiSelectComponent,
    TableComponent,
  ]
})
export class TLS26010Component extends BasicQueryPageComponent<TLS26010Data> implements OnInit {

  public queryForm = this.formBuilder.group({
    sys3800: new FormControl<string[] | void>(void 0), // 館別
    sys3900: new FormControl<string[] | void>(void 0), // 樓層
    sys3A00: new FormControl<string[] | void>(void 0), // 區域
    ecrNos: new FormControl<string[] | void>(void 0), // 收銀機號
    tltNos: new FormControl<string[] | void>(void 0), // 專櫃ID
    podSdateS: new FormControl<Date | void>(this.service.dateS), // 起始日期(起)
    podSdateE: new FormControl<Date | void>(void 0), // 起始日期(迄)
    podEdateS: new FormControl<Date | void>(void 0), // 截止日期(起)
    podEdateE: new FormControl<Date | void>(void 0), // 截止日期(迄)
    ...createPaginationConfig([{ field: 'id', order: 1 }]),
  }, {
    validators: [
      (group) => {
        const podSdateS = group.get('podSdateS')?.value;
        const podSdateE = group.get('podSdateE')?.value;
        const podEdateS = group.get('podEdateS')?.value;
        const podEdateE = group.get('podEdateE')?.value;
        let isValid = !0;

        // 檢查起始日期範圍
        if (podSdateS && podSdateE) {
          const start = new Date(podSdateS);
          const end = new Date(podSdateE);
          if (start > end) isValid = !1;
        }

        // 檢查截止日期範圍
        if (podEdateS && podEdateE) {
          const start = new Date(podEdateS);
          const end = new Date(podEdateE);
          if (start > end) isValid = !1;
        }

        // 檢查起始日期與截止日期的關係
        if (podSdateS && podEdateS) {
          const start = new Date(podSdateS);
          const end = new Date(podEdateS);
          if (start > end) isValid = !1;
        }

        // 檢查起始日期與截止日期的關係
        if (podSdateE && podEdateE) {
          const start = new Date(podSdateE);
          const end = new Date(podEdateE);
          if (start > end) isValid = !1;
        }

        if (!podSdateS && !podSdateE && !podEdateS && !podEdateE) return { dateRequired: !0 };
        if (!isValid) return { dateRangeInvalid: !0 };

        return null;
      }
    ]
  });
  public readonly qf = computed(() => this.queryForm.controls);

  public readonly tableData = signal<TLS26010Data[]>([]);
  public readonly totalRecords = signal<number>(0);

  // 監聽用
  private readonly sys3800Signal = toSignal(this.qf().sys3800.valueChanges);
  private readonly sys3900Signal = toSignal(this.qf().sys3900.valueChanges);
  private readonly sys3A00Signal = toSignal(this.qf().sys3A00.valueChanges);
  private readonly ecrsignal = toSignal(this.qf().ecrNos.valueChanges);
  private readonly tltsignal = toSignal(this.qf().tltNos.valueChanges);
  private readonly sdateSSignal = toSignal(this.qf().podSdateS.valueChanges, { initialValue: this.service.dateS });
  private readonly sdateESignal = toSignal(this.qf().podSdateE.valueChanges);
  private readonly edateSSignal = toSignal(this.qf().podEdateS.valueChanges);
  private readonly edateESignal = toSignal(this.qf().podEdateE.valueChanges);

  // Table 相關
  public readonly editDisabled = (rowData: TLS26010Data) =>
    (Reflect.has(rowData, 'CanEdit') && rowData.CanEdit == '1') || rowData.pod_status !== ApprovalStatus.未核准;
  public readonly addButton: AddButton[] = [
    {
      label: '核准', icon: 'pi pi-check-circle text-green-500',
      action: (rowData: TLS26010Data) => this.service.loadApproval(rowData, this.tableData),
      disabled: (rowData: TLS26010Data) => rowData.pod_status !== ApprovalStatus.未核准,
    },
    {
      label: '反核准', icon: 'pi pi-undo text-orange-500',
      action: (rowData: TLS26010Data) => this.service.loadApproval(rowData, this.tableData),
      disabled: (rowData: TLS26010Data) => rowData.pod_status !== ApprovalStatus.已核准,
    },
  ];

  // 監聽館別、樓層及區域變化，載入相關資料
  public readonly dependentDataEffect = effect(() => {
    const sys3800Value = this.sys3800Signal();
    const sys3900Value = this.sys3900Signal();
    const sys3A00Value = this.sys3A00Signal();

    const building_nos = Array.isArray(sys3800Value) ? sys3800Value.filter((val): val is string => val != null) : [];
    const floor_nos = Array.isArray(sys3900Value) ? sys3900Value.filter((val): val is string => val != null) : [];
    const area_nos = Array.isArray(sys3A00Value) ? sys3A00Value.filter((val): val is string => val != null) : [];

    this.logger.debug(`dependentDataEffect:`, [building_nos, floor_nos, area_nos]);
    if (!building_nos?.length && !floor_nos?.length && !area_nos?.length) return;
    untracked(() => {
      this.service.queryECRDropDownList({ building_nos, floor_nos, area_nos, ecr_type: '2' });
      this.service.queryTalentDropDownList({ building_nos, floor_nos, area_nos });
    });
  }, { allowSignalWrites: !0 });

  private readonly queryTLS26010 = computed<TLS26010Query>(() => {
    const { pageIndex, pageSize, SortBy, ...rest } = this.queryForm.getRawValue();
    const raw = <TLS26010Query>{
      ECR_No: this.ecrsignal(),
      tlt_nos: this.tltsignal(),
      tlt_no: '',
      pod_sdate_S: this.sdateSSignal()?.toISOString(),
      pod_sdate_E: this.sdateESignal()?.toISOString(),
      pod_edate_S: this.edateSSignal()?.toISOString(),
      pod_edate_E: this.edateESignal()?.toISOString(),
      pageIndex, pageSize, SortBy,
    };

    const payload = Object.fromEntries(Object.entries(raw).filter(([_, v]) =>
      v !== null && v !== undefined && (!(Array.isArray(v)) || v.length > 0)
    )) as TLS26010Query;

    this.logger.debug(`queryTLS26010:`, [rest, raw, payload]);
    return payload;
  });

  public readonly loadingEffect = effect(() => {
    this.loading = this.service.sys3800Loading()
      || this.service.sys3900Loading()
      || this.service.sys3A00Loading()
      || this.service.ecrLoading()
      || this.service.tltLoading()
      || this.service.tableLoading()
      || this.service.approvalStatusLoading();
  });

  public readonly columns: (Omit<Column, 'field'> & { field: keyof TLS26010Data; })[] = [
    { field: 'pod_no', header: '預售活動編號' },
    { field: 'pod_desc', header: '活動名稱' },
    { field: 'pod_sdate', header: '活動起始日期', format: v => this.datePipe.transform(v, 'YYYY/MM/dd') },
    { field: 'pod_edate', header: '活動終止日期', format: v => this.datePipe.transform(v, 'YYYY/MM/dd') },
    { field: 'pod_status', header: '核准狀態', format: this.service.approvalStatus.bind(this) },
    { field: 'approved_usr_name', header: '核准人員' },
    { field: 'approved_date', header: '核准日期', format: v => this.datePipe.transform(v, 'YYYY/MM/dd') },
  ];

  constructor(
    public readonly service: TLS26010Service,
    private readonly datePipe: DatePipe,
    private readonly logger: NGXLogger,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.initializePage('TLS26010', '/TLS/TLS26010CRU', this.queryForm, this.onSubmit.bind(this));

    // 只載入館別和樓層及區域的下拉選單資料
    this.service.loadSYS3800();
    this.service.loadSYS3900();
    this.service.loadSYS3A00();

    this.service.queryECRDropDownList({ ecr_type: '2' });
  };

  public onSubmit(): void {
    this.handleSubmit(this.queryForm, () => {
      this.service.loadTLS26010(this.queryTLS26010()).pipe(
        tap(res => {
          this.tableData.set(res.Data ?? []);
          this.totalRecords.set(res.TotalCount ?? 0);
        }),
      ).subscribe();
      this.queryStateService.setQueryState(this.ProgNo, this.queryForm.getRawValue());
    });
  };

  /** 刪除選中的活動 */
  public onDelete(data: TLS26010Data[]): void {
    this.logger.debug(`刪除活動:`, data);
    for (const item of data) this.service.deleteTLS26010(item).subscribe();
  }
}
