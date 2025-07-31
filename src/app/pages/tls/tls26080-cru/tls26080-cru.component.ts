
import { NgIf } from '@angular/common';
import { Component, OnInit, effect } from '@angular/core';
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
import { ApprovalStatus } from '@shared/models/tls/approval-status.model';
import { PanelModule } from 'primeng/panel';
import { ActivityData, CounterData, DeductionItem } from '../tls26080/tls26080.model';

@Component({
  selector: 'app-tls26080-cru',
  templateUrl: './tls26080-cru.component.html',
  styleUrl: './tls26080-cru.component.scss',
  standalone: true,
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
export class TLS26080CRUComponent extends BasicCruPageComponent<ActivityData> implements OnInit {
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
    cap_item: new FormControl<string | undefined>(undefined), // 扣款代碼
  });

  // 專櫃資料表格
  counterData: CounterData[] = [];
  selectedCounter?: CounterData;
  public counterColumns: Column[] = [
    { field: 'counterCode', header: '專櫃編號', visible: true },
    { field: 'counterName', header: '櫃位名稱', visible: true },
    { field: 'commissionTypeCode', header: '抽成類別', visible: true },
    { field: 'presaleStartCalculation', header: '預售起日計算', visible: true },
    { field: 'commissionPersent', header: '抽成率', visible: true },
  ];

  // 扣款項目資料表格
  deductionData: DeductionItem[] = [];
  deductionColumns: Column[] = [
    { field: 'itemCode', header: '扣款項目編號', visible: true },
    { field: 'itemName', header: '扣款項目名稱', visible: true },
    { field: 'amountOrRate', header: '金額/比率', visible: true }
  ];

  private readonly campaignDataEffect = effect(() => {
    const data = this.service.campaignData();
    if (!Reflect.ownKeys(data).length) return;
    console.log('Campaign Data:', data);
    this.dataForm.patchValue({
      pod_no: data.No || '',
      pod_desc: data.CampaignName || '',
      pod_status: data.Status || '',
      pod_sdate: data.StartTime ? new Date(data.StartTime) : new Date(),
      pod_edate: data.EndTime ? new Date(data.EndTime) : new Date(),
      pod_busdate: data.AccountingType ? new Date(data.AccountingType) : new Date(),
      cap_item: data.AccountingType,
    });
  }, { allowSignalWrites: true });

  constructor(public service: TLS26080Service) {
    super();
  }

  public ngOnInit(): void {
    this.initializePage('TLS26080', this.dataForm);
  }

  /** 讀取環友資料 */
  public queryCampaign(): void {
    this.service.loadCampaignData({});
  }

  public onClear(): void {
    this.dataForm.reset({
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

  // // 專櫃選擇事件
  // onCounterSelect(counter: CounterData): void {
  //   this.selectedCounter = counter;
  //   this.loadDeductionItems(counter.counterCode);
  // }

  // // 載入扣款項目
  // loadDeductionItems(counterCode: string): void {
  //   // this.deductionData = this.mockDeductionData[counterCode] || [];
  // }

  // // 新增專櫃 - 修復加入 counterName
  // onAddCounter(): void {
  //   const newCounter: CounterData = {
  //     id: this.counterData.length + 1,
  //     counterCode: '',
  //     counterName: '',
  //     itemCode: '',
  //     commissionTypeCode: '',
  //     commissionTypeName: '',
  //     presaleStartCalculation: '',
  //     contractStartDate: '',
  //     contractEndDate: '',
  //     operationStartDate: '',
  //     operationEndDate: '',
  //     deductionItems: ''
  //   };
  //   this.counterData = [...this.counterData, newCounter];
  // }

  // // 刪除專櫃
  // onDeleteCounter(counter: CounterData): void {
  //   this.counterData = this.counterData.filter(item => item.id !== counter.id);
  //   if (this.selectedCounter?.id === counter.id) {
  //     this.selectedCounter = void 0;
  //     this.deductionData = [];
  //   }
  // }

  // // 新增扣款項目 - 修復加入 counterName
  // onAddDeductionItem(): void {
  //   if (!this.selectedCounter) {
  //     this.messageService.warnBubble('請先選擇專櫃');
  //     return;
  //   }

  //   const newItem: DeductionItem = {
  //     id: Date.now(), // 使用時間戳作為暫時 ID
  //     counterCode: this.selectedCounter.counterCode,
  //     counterName: this.selectedCounter.counterName, // 加入 counterName
  //     itemCode: '',
  //     itemName: '',
  //     amountOrRate: 0,
  //     isRate: false
  //   };

  //   this.deductionData = [...this.deductionData, newItem];

  //   // 更新 mock 資料
  //   // if (!this.mockDeductionData[this.selectedCounter.counterCode]) {
  //   //   this.mockDeductionData[this.selectedCounter.counterCode] = [];
  //   // }
  //   // this.mockDeductionData[this.selectedCounter.counterCode].push(newItem);
  // }

  // // 刪除扣款項目
  // onDeleteDeductionItem(item: DeductionItem): void {
  //   this.deductionData = this.deductionData.filter(deduction => deduction.id !== item.id);

  //   // 更新 mock 資料
  //   // if (this.selectedCounter) {
  //   //   this.mockDeductionData[this.selectedCounter.counterCode] =
  //   //     this.mockDeductionData[this.selectedCounter.counterCode]?.filter(d => d.id !== item.id) || [];
  //   // }
  // }
}
