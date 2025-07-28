import { Component, computed, effect } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TLS26010Service } from '@service/api/tls/tls26010.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent, CalendarRangeComponent, DropdownComponent, MultiSelectComponent, TableComponent } from '@shared/componentkit';
import { TableExpansionComponent } from '@shared/componentkit/table/table-expansion/table-expansion.component';
import { AddButton, Column } from '@shared/componentkit/table/table.model';
import { MenubarComponent } from '@shared/index';
import { ApprovalStatus } from '@shared/models';
import { AccordionModule } from 'primeng/accordion';
import { combineLatest, map } from 'rxjs';
import { QueryPayload, TLS26010Data, TLS26010Query } from './tls26010.model';

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
export class TLS26010Component extends BasicQueryPageComponent<any> {

  // 查詢表單
  queryForm = this.formBuilder.group({
    sys3800: [''], // 館別
    sys3900: [''], // 樓層
    sys3A00: [''], // 區域
    ecrNos: [[] as string[]], // 收銀機號
    tltNos: [[] as string[]], // 專櫃ID
    podSdateS: [''], // 起始日期(起)
    podSdateE: [''], // 起始日期(迄)
    podEdateS: [''], // 截止日期(起)
    podEdateE: [''], // 截止日期(迄)
  });

  selectedItems: TLS26010Data[] = [];

  editDisabled = (rowData: TLS26010Data) => rowData.pod_status !== ApprovalStatus.未核准;

  addButton: AddButton[] = [
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
      if (!hasAnyDate) return { isValid: true, dates: { podSdateS, podSdateE, podEdateS, podEdateE } };

      let isValid = true;

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
        const podEnd = new Date(podSdateE);
        const edateStart = new Date(podEdateS);
        if (podEnd > edateStart) isValid = false;
      }

      return { isValid, dates: { podSdateS, podSdateE, podEdateS, podEdateE } };
    })
  ), { initialValue: { isValid: true, dates: { podSdateS: '', podSdateE: '', podEdateS: '', podEdateE: '' } } });

  // 監聽館別及樓層及區域變化
  readonly dependentDataEffect = effect(() => {
    const build_no = this.sys3800Signal();
    const floor_no = this.sys3900Signal();
    const area_no = this.sys3A00Signal();

    if (floor_no) {
      this.queryForm.patchValue({ ecrNos: [], tltNos: [] }, { emitEvent: false });
      this.service.loadPreorderECRList({ ...this.queryPayload(), data_type: '1' }).subscribe();
      this.service.loadTLTTALENT(this.queryPayload()).subscribe();
    }
  }, { allowSignalWrites: !0 });

  // API queries
  private queryPayload = computed<QueryPayload>(() => {
    const startDate = this.dateValidationSignal().dates.podSdateS;
    const endDate = this.dateValidationSignal().dates.podEdateE;
    const sys3800 = this.sys3800Signal();
    const sys3900 = this.sys3900Signal();

    return {
      building_no: sys3800 || '',
      floor_no: sys3900 || '',
      sdate: startDate || '',
      edate: endDate || '',
    };
  });

  private queryTLS26010 = computed<TLS26010Query>(() => {
    const dateValidation = this.dateValidationSignal();
    const dates = dateValidation.dates;

    return {
      ECR_Nos: Array.from(this.ecrNosSignal() || []),
      tlt_nos: Array.from(this.tltNosSignal() || []),
      pod_sdate_S: dates.podSdateS || '',
      pod_sdate_E: dates.podSdateE || '',
      pod_edate_S: dates.podEdateS || '',
      pod_edate_E: dates.podEdateE || '',
    };
  });

  columns: Column[] = [
    { field: 'pod_no', header: '預售活動編號', visible: true },
    { field: 'pod_desc', header: '活動名稱', visible: true },
    { field: 'pod_sdate', header: '活動起始日期', visible: true },
    { field: 'pod_edate', header: '活動終止日期', visible: true },
    { field: 'area_no', header: '區域', visible: true },
    { field: 'pod_status', header: '核准狀態', visible: true, format: this.service.approvalStatus.bind(this) },
    { field: 'approved_usr_name', header: '核准人員', visible: true },
    { field: 'approved_date', header: '核准日期', visible: true },
  ];

  subColumns: Column[] = [
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'ECR_Name', header: '收銀機名稱', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '專櫃名稱', visible: true },
    { field: 'area_no', header: '區域', visible: true },
  ];

  constructor(public service: TLS26010Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS26010', '/TLS/TLS26010CRU', this.queryForm, this.onSubmit.bind(this));

    // 只載入館別和樓層及區域的下拉選單資料
    this.service.loadSYS3800();
    this.service.loadSYS3900();
    this.service.loadSYS3A00();

    // 僅供測試
    // this.service.loadTLS26010(this.queryTLS26010());
  };

  canQuery(): boolean {
    return true;
  }

  canAdd(): boolean {
    return true;
  }

  canEdit(): boolean {
    return true;
  }

  onClearForm(): void {
    this.queryForm.reset();
  };

  onSubmitQuery(): void {
    const dateValidation = this.dateValidationSignal();
    if (!this.sys3900Signal()?.length && dateValidation.isValid) return;
    // 查詢邏輯
    this.onSubmit(this.queryForm);
  };

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      frm.valid && this.canQuery() && this.service.loadTLS26010(this.queryTLS26010());
    });
  }

  /** 刪除選中的活動 */
  onDelete(data: TLS26010Data[]): void {
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
