
import { DatePipe, NgIf } from '@angular/common';
import { Component, OnInit, effect, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TLS26080Service } from '@service/api/tls/tls26080.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column } from '@shared/componentkit/table/table.model';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { ApprovalStatus } from '@shared/models/tls/approval-status.model';
import { PanelModule } from 'primeng/panel';
import { CampaignCounterData, CampaignData, CounterData, DeductionItem, TLS26080Data } from '../tls26080/tls26080.model';

@Component({
  selector: 'app-tls26080-cru',
  templateUrl: './tls26080-cru.component.html',
  styleUrl: './tls26080-cru.component.scss',
  standalone: !0,
  imports: [
    NgIf,
    FormsModule,
    PanelModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    CalendarComponent,
    CalendarRangeComponent,
    DropdownComponent,
    InputTextComponent,
    MenubarComponent,
    MultiSelectComponent,
    TableComponent,
  ]
})
export class TLS26080CRUComponent extends BasicCruPageComponent<TLS26080Data> implements OnInit {
  private dateS: Date = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  private dateE: Date = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

  // 主表單：活動基本資料
  public dataForm = this.formBuilder.nonNullable.group({
    pod_no: new FormControl<string>('自動給號', [Validators.maxLength(10)]), // 活動單號
    pod_desc: new FormControl<string>('', [Validators.maxLength(100)]), // 活動名稱
    pod_sdate: new FormControl<Date>(this.dateS, [Validators.required]), // 起始日期(起)
    pod_edate: new FormControl<Date>(this.dateE, [Validators.required]), // 起始日期(迄)
    pod_busdate: new FormControl<Date | undefined>(undefined), // 活動正檔日期
    pod_status: new FormControl<string>(ApprovalStatus.未核准), // 核准狀態
    pod_type: new FormControl<string | undefined>(undefined), // 扣款名稱
    org_id: new FormControl<string | undefined>(undefined), // 部門
    cap_item: new FormControl<string | undefined>(undefined, [Validators.minLength(3), Validators.maxLength(10), Validators.required]), // 扣款代碼
  });

  private counterData = new Map<string, CounterData>();
  private deductionData = new Map<string, DeductionItem>();

  public selectedCounter?: CounterData;

  private readonly campaignDataEffect = effect(() => {
    const data = this.service.campaignData();
    console.log('Campaign Data:', [data]);
  }, { allowSignalWrites: !0 });

  // 專櫃資料表
  public counterColumns: Column[] = [
    { field: 'tlt_no', header: '專櫃編號', visible: !0 },
    { field: 'tlt_name', header: '櫃位名稱', visible: !0 },
    { field: 'tlt_id', header: '抽成類別', visible: !0 },
    { field: 'calc_date_type', header: '預售起日計算', visible: !0, format: v => v === 'Y' ? '活動起始日至截止日' : '正檔日至截止日' },
    { field: 'tpy_rate', header: '抽成率', visible: !0, format: v => `${v * 100}%` },
  ];

  // 環友資料表
  campaignColumns: Column[] = [
    { field: 'CampaignName', header: '活動名稱', visible: !0 },
    { field: 'StartTime', header: '活動開始時間', visible: !0, format: v => this.datePipe.transform(v, 'YYYY/MM/dd') },
    { field: 'EndTime', header: '活動結束時間', visible: !0, format: v => this.datePipe.transform(v, 'YYYY/MM/dd') },
    { field: 'AccountingType', header: '帳務拆分類別', visible: !0 },
    { field: 'Remark', header: '活動備註', visible: !0 },
  ];

  // 環友專櫃資料表
  campaignCounterColumns: Column[] = [
    { field: 'CampaignId', header: '活動編號', visible: !0 },
    { field: 'CounterCode', header: '專櫃編號', visible: !0 },
    { field: 'ProductType', header: '專櫃抽成類別', visible: !0 },
  ];

  // 扣款項目資料表
  deductionColumns: Column[] = [
    { field: 'itemCode', header: '扣款項目編號', visible: !0 },
    { field: 'itemName', header: '扣款項目名稱', visible: !0 },
    { field: 'amountOrRate', header: '金額/比率', visible: !0 }
  ];

  // 靜態資料: 用於表單初始化和重置
  private staticData: TLS26080Data = this.dataForm.value as TLS26080Data;

  constructor(
    public service: TLS26080Service,
    private datePipe: DatePipe,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.initializePage('TLS26080', this.dataForm);
    if (this.crudstatus !== CRUDStatus.Create)
      this.service.loadTLS26080Detail({ pod_no: this.rowdata!.pod_no || '' });
    this.service.loadAPS1003DropDownList(['E']);
    this.staticData = this.dataForm.value as TLS26080Data;
    console.log(`init:`, [this.rowdata, this.crudstatus, this.dataForm.value]);
  }

  /** 讀取環友資料 */
  public queryCampaign(): void {
    this.service.loadCampaignData();
    let ids: string[] = [];
    for (const campaign of this.service.campaignData()) {
      campaign.CampaignId !== this.rowdata!.pod_no && ids.push(campaign.CampaignId);
    }
    this.service.loadCampaignCounter({ CampaignIdList: ids });
  }

  public onClear(): void {
    this.crudstatus === CRUDStatus.Edit
      ? this.dataForm.reset(this.staticData)
      : this.dataForm.reset({
        pod_no: '自動給號',
        pod_sdate: this.dateS,
        pod_edate: this.dateE,
        pod_status: ApprovalStatus.未核准,
      });
  };

  public onSubmitQuery(): void {
    this.onSubmit(this.dataForm);
  };

  // 表單提交
  public onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      console.log(`submit:`, [frm]);
    });
  }

  // 專櫃選擇事件
  private onCounterSelect(counter: CounterData): void {
    this.selectedCounter = counter;
    this.loadDeductionItems(counter.counterCode);
  }

  // 載入扣款項目
  private loadDeductionItems(counterCode: string): void {
    // this.deductionData = this.mockDeductionData[counterCode] || [];
  }

  // 新增專櫃 - 修復加入 counterName
  private onAddCounter(): void {
    const newId = this.counterData.size + 1;
    const newCounter: CounterData = {
      id: newId,
      counterCode: '',
      counterName: '',
      itemCode: '',
      commissionTypeCode: '',
      commissionTypeName: '',
      presaleStartCalculation: '',
      contractStartDate: '',
      contractEndDate: '',
      operationStartDate: '',
      operationEndDate: '',
      deductionItems: ''
    };
    this.counterData.set(String(newId), newCounter);
  }

  // 刪除專櫃
  public onDeleteCounter(counter: CounterData): void {
    for (const [key, value] of this.counterData.entries()) {
      if (value.id === counter.id) { this.counterData.delete(key); break; }
    }
    if (this.selectedCounter?.id !== counter.id) return;
    this.selectedCounter = void 0;
    this.deductionData.clear();
  }

  // 新增扣款項目 - 修復加入 counterName
  private onAddDeductionItem(): void {
    if (!this.selectedCounter) return void this.messageService.warnBubble('請先選擇專櫃');

    const newItem: DeductionItem = {
      id: new Date().getTime(), // 使用時間戳作為暫時 ID
      counterCode: this.selectedCounter.counterCode,
      counterName: this.selectedCounter.counterName, // 加入 counterName
      itemCode: '',
      itemName: '',
      amountOrRate: 0,
      isRate: !1
    };

    this.deductionData.set(String(newItem.id), newItem);

    // 更新 mock 資料
    // if (!this.mockDeductionData[this.selectedCounter.counterCode]) {
    //   this.mockDeductionData[this.selectedCounter.counterCode] = [];
    // }
    // this.mockDeductionData[this.selectedCounter.counterCode].push(newItem);
  }

  // 刪除扣款項目
  private onDeleteDeductionItem(item: DeductionItem): void {
    for (const [key, value] of this.deductionData.entries()) {
      if (value.id === item.id) { this.deductionData.delete(key); break; }
    }

    // 更新 mock 資料
    // if (this.selectedCounter) {
    //   this.mockDeductionData[this.selectedCounter.counterCode] =
    //     this.mockDeductionData[this.selectedCounter.counterCode]?.filter(d => d.id !== item.id) || [];
    // }
  }
}
