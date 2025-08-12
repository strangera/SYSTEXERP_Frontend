import { DatePipe } from '@angular/common';
import { Component, computed, effect } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TLS26010Service } from '@service/api/tls/tls26010.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { TableExpansionComponent } from '@shared/componentkit/table/table-expansion/table-expansion.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { AddButton, Column } from '@shared/componentkit/table/table.model';
import { ApprovalStatus } from '@shared/models/tls/approval-status.model';
import { AccordionModule } from 'primeng/accordion';
import { TLS26010Data, TLS26010Query } from './tls26010.model';

@Component({
  selector: 'app-tls26010',
  templateUrl: './tls26010.component.html',
  styleUrls: ['./tls26010.component.scss'],
  standalone: true,
  imports: [
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MenubarComponent,
    ButtonComponent,
    MultiSelectComponent,
    DropdownComponent,
    CalendarRangeComponent,
    TableComponent,
    TableExpansionComponent,
  ]
})
export class TLS26010Component extends BasicQueryPageComponent<TLS26010Data> {

  // 查詢表單
  public queryForm = this.formBuilder.group({
    sys3800: new FormControl<string[] | undefined>(void 0), // 館別
    sys3900: new FormControl<string[] | undefined>(void 0), // 樓層
    sys3A00: new FormControl<string[] | undefined>(void 0), // 區域
    ecrNos: new FormControl<string[] | undefined>(void 0), // 收銀機號
    tltNos: new FormControl<string[] | undefined>(void 0), // 專櫃ID
    podSdateS: new FormControl<Date | undefined>(this.service.dateS), // 起始日期(起)
    podSdateE: new FormControl<Date | undefined>(void 0), // 起始日期(迄)
    podEdateS: new FormControl<Date | undefined>(void 0), // 截止日期(起)
    podEdateE: new FormControl<Date | undefined>(void 0), // 截止日期(迄)
  }, {
    validators: [
      (group) => {
        const podSdateS = group.get('podSdateS')?.value;
        const podSdateE = group.get('podSdateE')?.value;
        const podEdateS = group.get('podEdateS')?.value;
        const podEdateE = group.get('podEdateE')?.value;

        if (!podSdateS && !podSdateE && !podEdateS && !podEdateE) {
          return { dateRequired: true };
        }

        return null;
      }
    ]
  });

  // 監聽用
  private sys3800Signal = toSignal(this.queryForm.controls.sys3800.valueChanges);
  private sys3900Signal = toSignal(this.queryForm.controls.sys3900.valueChanges);
  private sys3A00Signal = toSignal(this.queryForm.controls.sys3A00.valueChanges);
  private ecrNosSignal = toSignal(this.queryForm.controls.ecrNos.valueChanges);
  private tltNosSignal = toSignal(this.queryForm.controls.tltNos.valueChanges);
  private podSdateSSignal = toSignal(this.queryForm.controls.podSdateS.valueChanges);
  private podSdateESignal = toSignal(this.queryForm.controls.podSdateE.valueChanges);
  private podEdateSSignal = toSignal(this.queryForm.controls.podEdateS.valueChanges);
  private podEdateESignal = toSignal(this.queryForm.controls.podEdateE.valueChanges);

  // Table 相關
  public readonly editDisabled = (rowData: TLS26010Data) =>
    (Reflect.has(rowData, 'CanEdit') && rowData.CanEdit == '1') || rowData.pod_status !== ApprovalStatus.未核准;
  public readonly addButton: AddButton[] = [
    {
      label: '核准', icon: 'pi pi-check-circle text-green-500',
      action: (rowData: TLS26010Data) => this.service.loadApproval(rowData),
      disabled: (rowData: TLS26010Data) => rowData.pod_status !== ApprovalStatus.未核准,
    },
    {
      label: '反核准', icon: 'pi pi-undo text-orange-500',
      action: (rowData: TLS26010Data) => this.service.loadApproval(rowData),
      disabled: (rowData: TLS26010Data) => rowData.pod_status !== ApprovalStatus.已核准,
    },
  ];

  // 監聽館別、樓層及區域變化，載入相關資料
  private readonly dependentDataEffect = effect(() => {
    const sys3800Value = this.sys3800Signal();
    const sys3900Value = this.sys3900Signal();
    const sys3A00Value = this.sys3A00Signal();

    const building_nos = Array.isArray(sys3800Value) ? sys3800Value.filter((val): val is string => val != null) : [];
    const floor_nos = Array.isArray(sys3900Value) ? sys3900Value.filter((val): val is string => val != null) : [];
    const area_nos = Array.isArray(sys3A00Value) ? sys3A00Value.filter((val): val is string => val != null) : [];

    console.log(`dependentDataEffect:`, [building_nos, floor_nos, area_nos]);
    if (!building_nos?.length && !floor_nos?.length && !area_nos?.length) return;
    this.service.loadPreorderECRList({ building_nos, floor_nos, area_nos, ecr_type: '2' });
    this.service.loadTLTTALENT({ building_nos, floor_nos, area_nos });
  }, { allowSignalWrites: !0 });

  private readonly queryTLS26010 = computed<TLS26010Query & { isValid: boolean; }>(() => {
    const pod_sdate_S = this.podSdateSSignal() || this.service.dateS;
    const pod_sdate_E = this.podSdateESignal() || void 0;
    const pod_edate_S = this.podEdateSSignal() || void 0;
    const pod_edate_E = this.podEdateESignal() || void 0;

    let isValid = !0;

    // 檢查起始日期範圍
    if (pod_sdate_S && pod_sdate_E) {
      const start = new Date(pod_sdate_S);
      const end = new Date(pod_sdate_E);
      if (start > end) isValid = !1;
    }

    // 檢查截止日期範圍
    if (pod_edate_S && pod_edate_E) {
      const start = new Date(pod_edate_S);
      const end = new Date(pod_edate_E);
      if (start > end) isValid = !1;
    }

    // 檢查起始日期與截止日期的關係
    if (pod_sdate_S && pod_edate_S) {
      const start = new Date(pod_sdate_S);
      const end = new Date(pod_edate_S);
      if (start > end) isValid = !1;
    }

    // 檢查起始日期與截止日期的關係
    if (pod_sdate_E && pod_edate_E) {
      const start = new Date(pod_sdate_E);
      const end = new Date(pod_edate_E);
      if (start > end) isValid = !1;
    }

    return {
      ecr_nos: Array.isArray(this.ecrNosSignal()) ? Array.from(this.ecrNosSignal()!) : [],
      tlt_nos: Array.isArray(this.tltNosSignal()) ? Array.from(this.tltNosSignal()!) : [],
      pod_sdate_S,
      pod_sdate_E,
      pod_edate_S,
      pod_edate_E,
      isValid,
    };
  });

  public columns: Column[] = [
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
  ) {
    super();
  }

  public ngOnInit(): void {
    this.initializePage('TLS26010', '/TLS/TLS26010CRU', this.queryForm, this.onSubmit.bind(this));

    // 只載入館別和樓層及區域的下拉選單資料
    this.service.loadSYS3800();
    this.service.loadSYS3900();
    this.service.loadSYS3A00();
  };

  private canQuery(): boolean {
    return !0;
  }

  private canAdd(): boolean {
    return !0;
  }

  private canEdit(): boolean {
    return !0;
  }

  public onClear(): void {
    this.queryForm.reset({
      podSdateS: this.service.dateS,
      podSdateE: this.service.dateE,
      podEdateS: this.service.dateS,
      podEdateE: this.service.dateE,
    });
  }

  public onSubmitQuery(): void {
    const query = this.queryTLS26010();
    console.log(`submit:`, [this.queryForm.value, this.sys3900Signal(), query]);
    if (!query.isValid) return;
    this.onSubmit(this.queryForm);
  };

  public onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const query = this.queryTLS26010();
      frm.valid && this.canQuery() && this.service.loadTLS26010(query);
      this.loading = !1;
    });
  };

  /** 刪除選中的活動 */
  public onDelete(data: TLS26010Data[]): void {
    console.log(`刪除活動:`, data);
    this.confirmationService.confirm({
      message: '是否確認刪除選中的預售活動?',
      accept: () => {
        for (const item of data) this.service.deleteTLS26010(item);
        this.messageService.successBubble('刪除成功');
      },
      reject: () => this.messageService.infoBubble('已取消刪除')
    });
  }
}
