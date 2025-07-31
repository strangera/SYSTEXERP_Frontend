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
import { combineLatest, map } from 'rxjs';
import { DependentDataQuery, TLS26010Data, TLS26010Query } from './tls26010.model';

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
  private dateS: Date = new Date(this.now.getFullYear(), this.now.getMonth(), 1);
  private dateE: Date = new Date(this.now.getFullYear(), this.now.getMonth() + 1, 0);

  // 查詢表單
  public queryForm = this.formBuilder.group({
    sys3800: new FormControl<string | undefined>(undefined), // 館別
    sys3900: new FormControl<string | undefined>(undefined), // 樓層
    sys3A00: new FormControl<string | undefined>(undefined), // 區域
    ecrNos: new FormControl<string[] | undefined>(undefined), // 收銀機號
    tltNos: new FormControl<string[] | undefined>(undefined), // 專櫃ID
    podSdateS: new FormControl<Date>(this.dateS, Validators.required), // 起始日期(起)
    podSdateE: new FormControl<Date>(this.dateE, Validators.required), // 起始日期(迄)
    podEdateS: new FormControl<Date>(this.dateS, Validators.required), // 截止日期(起)
    podEdateE: new FormControl<Date>(this.dateE, Validators.required), // 截止日期(迄)
  });

  public selectedItems: TLS26010Data[] = [];

  public readonly editDisabled = (rowData: TLS26010Data) =>
    (Reflect.has(rowData, 'CanEdit') && rowData.CanEdit == '1') || rowData.pod_status !== ApprovalStatus.未核准;
  public readonly isRowSelectable = (rowData: TLS26010Data) =>
    (Reflect.has(rowData, 'CanDelete') && rowData.CanDelete == '1');

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

  // 監聽用
  private sys3800Signal = toSignal(this.queryForm.controls.sys3800.valueChanges);
  private sys3900Signal = toSignal(this.queryForm.controls.sys3900.valueChanges);
  private sys3A00Signal = toSignal(this.queryForm.controls.sys3A00.valueChanges);
  private ecrNosSignal = toSignal(this.queryForm.controls.ecrNos.valueChanges);
  private tltNosSignal = toSignal(this.queryForm.controls.tltNos.valueChanges);

  // 日期監聽與驗證
  private dateValidationSignal = toSignal(combineLatest([
    this.queryForm.controls.podSdateS.valueChanges,
    this.queryForm.controls.podSdateE.valueChanges,
    this.queryForm.controls.podEdateS.valueChanges,
    this.queryForm.controls.podEdateE.valueChanges
  ]).pipe(
    map(([podSdateS, podSdateE, podEdateS, podEdateE]) => {
      const hasAnyDate = podSdateS || podSdateE || podEdateS || podEdateE;
      let isValid = true;
      if (!hasAnyDate) return { isValid, dates: { podSdateS, podSdateE, podEdateS, podEdateE } };

      // 檢查起始日期範圍
      if (podSdateS && podSdateE) {
        const start = new Date(podSdateS);
        const end = new Date(podSdateE);
        if (start > end) isValid = false;
      }

      // 檢查截止日期範圍
      if (podEdateS && podEdateE) {
        const start = new Date(podEdateS);
        const end = new Date(podEdateE);
        if (start > end) isValid = false;
      }

      // 檢查跨範圍邏輯
      if (podSdateE && podEdateS) {
        const sdateEnd = new Date(podSdateE);
        const edateStart = new Date(podEdateS);
        if (sdateEnd > edateStart) isValid = false;
      }

      return { isValid, dates: { podSdateS, podSdateE, podEdateS, podEdateE } };
    })
  ), {
    initialValue: {
      isValid: true, dates: {
        podSdateS: this.dateS,
        podSdateE: this.dateE,
        podEdateS: this.dateS,
        podEdateE: this.dateE,
      }
    }
  });

  // 監聽館別及樓層及區域變化
  private readonly dependentDataEffect = effect(() => {
    const building_no = this.sys3800Signal();
    const floor_no = this.sys3900Signal();
    const area_no = this.sys3A00Signal();

    if (floor_no) {
      this.queryForm.patchValue({ ecrNos: [], tltNos: [] }, { emitEvent: false });
      this.service.loadPreorderECRList({ building_no, floor_no, data_type: '1' });
      this.service.loadTLTTALENT({ building_no, floor_no });
    }
  }, { allowSignalWrites: !0 });

  private queryTLS26010 = computed<TLS26010Query>(() => {
    const dates = this.dateValidationSignal().dates;
    return {
      ECR_Nos: Array.from(this.ecrNosSignal() || []),
      tlt_nos: Array.from(this.tltNosSignal() || []),
      pod_sdate_S: dates.podSdateS || this.now,
      pod_sdate_E: dates.podSdateE || this.now,
      pod_edate_S: dates.podEdateS || this.now,
      pod_edate_E: dates.podEdateE || this.now,
    };
  });

  public columns: Column[] = [
    { field: 'pod_no', header: '預售活動編號', visible: true },
    { field: 'pod_desc', header: '活動名稱', visible: true },
    { field: 'pod_sdate', header: '活動起始日期', visible: true, format: v => this.datePipe.transform(v, 'YYYY/MM/dd') },
    { field: 'pod_edate', header: '活動終止日期', visible: true, format: v => this.datePipe.transform(v, 'YYYY/MM/dd') },
    { field: 'pod_status', header: '核准狀態', visible: true, format: this.service.approvalStatus.bind(this) },
    { field: 'approved_usr_name', header: '核准人員', visible: true },
    { field: 'approved_date', header: '核准日期', visible: true, format: v => this.datePipe.transform(v, 'YYYY/MM/dd') },
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
    return true;
  }

  private canAdd(): boolean {
    return true;
  }

  private canEdit(): boolean {
    return true;
  }

  public onClearForm(): void {
    this.queryForm.reset({
      podSdateS: this.dateS,
      podSdateE: this.dateE,
      podEdateS: this.dateS,
      podEdateE: this.dateE,
    });
  }

  public onSubmitQuery(): void {
    console.log(`submit:`, [this.queryForm.value, this.sys3900Signal(), this.dateValidationSignal()]);
    if (!this.dateValidationSignal().isValid) return;
    this.onSubmit(this.queryForm);
  };

  public onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      frm.valid && this.canQuery() && this.service.loadTLS26010(this.queryTLS26010());
      this.loading = !1;
    });
  }

  /** 刪除選中的活動 */
  public onDelete(data: TLS26010Data[]): void {
    if (!this.canEdit()) return;
    this.confirmationService.confirm({
      message: '是否確認刪除選中的預售活動?',
      accept: () => {
        for (const item of data) {
          if (item.pod_status !== ApprovalStatus.未核准) continue;
          this.service.deleteTLS26010(item);
        }
        this.messageService.successBubble('刪除成功');
      },
      reject: () => this.messageService.infoBubble('已取消刪除')
    });
  }
}
