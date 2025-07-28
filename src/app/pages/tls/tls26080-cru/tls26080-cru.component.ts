
import { NgIf } from '@angular/common';
import { Component, effect, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TLS26080Service } from '@service/api';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent, CalendarComponent, CalendarRangeComponent, DropdownComponent, InputTextComponent, MultiSelectComponent, TableComponent } from '@shared/componentkit';
import { Column } from '@shared/componentkit/table/table.model';
import { MenubarComponent } from '@shared/index';
import { ApprovalStatus, CRUDStatus } from '@shared/models';
import { PanelModule } from 'primeng/panel';
import { ActivityData, CounterData, DeductionItem } from './ts26080-cru.model';


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

  // 主表單：活動基本資料
  public dataForm = this.formBuilder.nonNullable.group({
    pod_no: ['', Validators.maxLength(10)], // 活動單號
    pod_desc: ['', Validators.maxLength(100)], // 活動名稱
    pod_sdate: [new Date()], // 起始日期(起)
    pod_edate: [new Date()], // 起始日期(迄)
    pod_busdate: [new Date()], // 活動正檔日期
    pod_status: ['未核准'], // 核准狀態
    org_id: [''], // 部門
    cap_item: [''], // 扣款代碼
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

  private campaignDataEffect = effect(() => {
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

  ngOnInit(): void {
    this.initializePage('TLS26080', this.dataForm);
    // this.dataForm.get('pod_no')?.setValue('20250401');
    // this.loadMockData();

    const state = this.router.lastSuccessfulNavigation?.extras.state as {
      crudstatus: CRUDStatus,
      rowdata: any,
    };

    switch (state.crudstatus) {
      // 創建
      case CRUDStatus.Create:
        this.formTitle = 'create-conditions';
        this.crudstatus = CRUDStatus.Create;
        break;
      // 修改
      case CRUDStatus.Edit:
        this.formTitle = 'edit-conditions';
        this.crudstatus = CRUDStatus.Edit;
        break;
      // 讀檔
      case CRUDStatus.Read:
        this.formTitle = 'display-conditions';
        this.crudstatus = CRUDStatus.Read;
        break;
    }

    const rowData = state?.rowdata;

    if (this.isFormEditable && rowData) {
      rowData.pod_status = this.service.approvalStatus(rowData.pod_status);

      // 載入既有的表單資料（編輯模式）
      this.dataForm.patchValue({
        pod_no: rowData.pod_no || '自動給號',
        pod_desc: rowData.pod_desc || '',
        pod_sdate: rowData.pod_sdate ? new Date(rowData.pod_sdate) : new Date(),
        pod_edate: rowData.pod_edate ? new Date(rowData.pod_edate) : new Date(),
        pod_status: rowData.pod_status || '未核准',
        org_id: rowData.org_id || '',
        cap_item: rowData.cap_item || [],
        pod_busdate: rowData.pod_busdate ? new Date(rowData.pod_busdate) : new Date(),
      });
    }
  }

  /** 讀取環友資料 */
  queryCampaign(): void {
    this.service.loadCampaignData({});
  }

  // 載入假資料
  loadMockData(): void {
    // this.counterData = [...this.mockCounterData];
    // 直接載入所有扣款項目
    // this.deductionData = [...this.allDeductionItems];
  }

  // 專櫃選擇事件
  onCounterSelect(counter: CounterData): void {
    this.selectedCounter = counter;
    this.loadDeductionItems(counter.counterCode);
  }

  // 載入扣款項目
  loadDeductionItems(counterCode: string): void {
    // this.deductionData = this.mockDeductionData[counterCode] || [];
  }

  // 新增專櫃 - 修復加入 counterName
  onAddCounter(): void {
    const newCounter: CounterData = {
      id: this.counterData.length + 1,
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
    this.counterData = [...this.counterData, newCounter];
  }

  // 刪除專櫃
  onDeleteCounter(counter: CounterData): void {
    this.counterData = this.counterData.filter(item => item.id !== counter.id);
    if (this.selectedCounter?.id === counter.id) {
      this.selectedCounter = void 0;
      this.deductionData = [];
    }
  }

  // 新增扣款項目 - 修復加入 counterName
  onAddDeductionItem(): void {
    if (!this.selectedCounter) {
      this.messageService.warnBubble('請先選擇專櫃');
      return;
    }

    const newItem: DeductionItem = {
      id: Date.now(), // 使用時間戳作為暫時 ID
      counterCode: this.selectedCounter.counterCode,
      counterName: this.selectedCounter.counterName, // 加入 counterName
      itemCode: '',
      itemName: '',
      amountOrRate: 0,
      isRate: false
    };

    this.deductionData = [...this.deductionData, newItem];

    // 更新 mock 資料
    // if (!this.mockDeductionData[this.selectedCounter.counterCode]) {
    //   this.mockDeductionData[this.selectedCounter.counterCode] = [];
    // }
    // this.mockDeductionData[this.selectedCounter.counterCode].push(newItem);
  }

  // 刪除扣款項目
  onDeleteDeductionItem(item: DeductionItem): void {
    this.deductionData = this.deductionData.filter(deduction => deduction.id !== item.id);

    // 更新 mock 資料
    // if (this.selectedCounter) {
    //   this.mockDeductionData[this.selectedCounter.counterCode] =
    //     this.mockDeductionData[this.selectedCounter.counterCode]?.filter(d => d.id !== item.id) || [];
    // }
  }

  onClearForm(): void {
    this.dataForm.reset();
  };

  onSubmitQuery(): void {
    this.onSubmit(this.dataForm);
  };

  // 表單提交
  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const formValue = frm.getRawValue();

      // 組合完整的提交資料
      const submitData = {
        ...formValue,
        counterData: this.counterData,
        // deductionData: this.mockDeductionData
      };

      switch (this.crudstatus) {
        case CRUDStatus.Create:
          if (this.canAdd()) {
            // 模擬 API 新增
            setTimeout(() => {
              this.messageService.successBubble('新增成功');
              this.onCancel();
            }, 1000);
          }
          break;
        case CRUDStatus.Edit:
          if (this.canEdit()) {
            // 模擬 API 更新
            setTimeout(() => {
              this.messageService.successBubble('更新成功');
              this.onCancel();
            }, 1000);
          }
          break;
      }
    });
  }
}
