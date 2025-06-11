import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { Column } from '../../../shared/componentkit/table/table.model';

// 活動資料模型
interface ActivityData {
  id: number;
  activityType: string;
  department: string;
  activityGroup: string;
  activityName: string;
  activityStartDate: string;
  activityEndDate: string;
  activityOfficialDate: string;
}

// 專櫃資料模型
interface CounterData {
  id: number;
  counterCode: string;
  commissionTypeCode: string;
  commissionTypeName: string;
  presaleStartCalculation: string;
  contractStartDate: string;
  contractEndDate: string;
  operationEndDate: string;
  deductionItems: string;
  selected?: boolean;
}

// 扣款項目模型
interface DeductionItem {
  id: number;
  counterCode: string;
  itemCode: string;
  itemName: string;
  amountOrRate: number;
  isRate: boolean; // true: 比率, false: 金額
  displayAmount?: string; // 用於顯示格式化後的金額/比率
}

@Component({
  selector: 'app-tls26080-cru',
  templateUrl: './tls26080-cru.component.html',
  styleUrl: './tls26080-cru.component.scss'
})
export class TLS26080CRUComponent extends BasicCruPageComponent<ActivityData> implements OnInit {

  // 主表單：活動基本資料
  dataForm = this.formBuilder.nonNullable.group({
    id: [0],
    activityType: ['', [Validators.required]],
    department: ['', [Validators.required]],
    activityGroup: ['', [Validators.required]],
    activityName: ['', [Validators.required]],
    activityStartDate: [null, [Validators.required]],
    activityEndDate: [null, [Validators.required]],
    activityOfficialDate: [null, [Validators.required]]
  });

  // 下拉選單選項（與查詢頁面相同）
  activityTypeOptions: any[] = [
    { label: '滿千送百', value: 'TYPE001' },
    { label: '滿額積點', value: 'TYPE002' }
  ];

  departmentOptions: any[] = [
    { label: '營運部', value: 'DEPT001' },
    { label: '行銷部', value: 'DEPT002' }
  ];

  activityGroupOptions: any[] = [
    { label: '母親節檔DM', value: 'GROUP001' }
  ];

  activityNameOptions: any[] = [
    { label: '母親節滿5000送100', value: 'ACTIVITY001' }
  ];

  // 專櫃資料表格
  counterData: CounterData[] = [];
  counterColumns: Column[] = [
    { field: 'counterCode', header: '專櫃編號', visible: true },
    { field: 'commissionTypeCode', header: '抽成類別代碼', visible: true },
    { field: 'commissionTypeName', header: '抽成類別名稱', visible: true },
    { field: 'presaleStartCalculation', header: '預售起日計算', visible: true },
    { field: 'contractStartDate', header: '合約起始', visible: true },
    { field: 'contractEndDate', header: '合約截止日', visible: true },
    { field: 'operationEndDate', header: '營運結束', visible: true },
    { field: 'deductionItems', header: '扣款項目', visible: true }
  ];
  selectedCounter: CounterData | null = null;

  // 扣款項目資料表格
  deductionData: DeductionItem[] = [];
  deductionColumns: Column[] = [
    { field: 'itemCode', header: '扣款項目編號', visible: true },
    { field: 'itemName', header: '扣款項目名稱', visible: true },
    {
      field: 'amountOrRate',
      header: '金額/比率',
      visible: true,
    }
  ];

  // 假資料
  mockCounterData: CounterData[] = [
    {
      id: 1,
      counterCode: '00231',
      commissionTypeCode: '1',
      commissionTypeName: '女裝專櫃',
      presaleStartCalculation: 'Y',
      contractStartDate: '2021/02/01',
      contractEndDate: '2023/01/31',
      operationEndDate: '2023/02/01',
      deductionItems: '現金折扣'
    },
    {
      id: 2,
      counterCode: '00232',
      commissionTypeCode: '1',
      commissionTypeName: '男裝專櫃',
      presaleStartCalculation: 'N',
      contractStartDate: '2021/03/01',
      contractEndDate: '2023/02/28',
      operationEndDate: '2023/03/01',
      deductionItems: '折價券'
    },
    {
      id: 3,
      counterCode: '00233',
      commissionTypeCode: '3',
      commissionTypeName: '化妝品專櫃',
      presaleStartCalculation: 'Y',
      contractStartDate: '2021/04/01',
      contractEndDate: '2023/03/31',
      operationEndDate: '2023/04/01',
      deductionItems: '滿額贈'
    }
  ];

  // 所有扣款項目的平面資料
  allDeductionItems: DeductionItem[] = [
    { id: 1, counterCode: '00031', itemCode: 'D16', itemName: '滿千送百(銷售)', amountOrRate: 0.5, isRate: true, displayAmount: '0.5%' },
    { id: 2, counterCode: '00031', itemCode: 'D17', itemName: '滿千送百兌回', amountOrRate: 0.3, isRate: true, displayAmount: '0.3%' },
  ];

  mockDeductionData: { [counterCode: string]: DeductionItem[] } = {
    '00031': [
      { id: 1, counterCode: '00031', itemCode: 'D16', itemName: '滿千送百(銷售)', amountOrRate: 0.5, isRate: true, displayAmount: '0.5%' },
      { id: 2, counterCode: '00031', itemCode: 'D17', itemName: '滿千送百兌回', amountOrRate: 0.3, isRate: true, displayAmount: '0.3%' }
    ],
  };

  constructor(
    private validationService: ValidationService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS26080', this.dataForm);
    this.loadMockData();
  }

  // 載入假資料
  loadMockData(): void {
    this.counterData = [...this.mockCounterData];
    // 直接載入所有扣款項目
    this.deductionData = [...this.allDeductionItems];
  }

  // 專櫃選擇事件
  onCounterSelect(counter: CounterData): void {
    this.selectedCounter = counter;
    this.loadDeductionItems(counter.counterCode);
  }

  // 載入扣款項目
  loadDeductionItems(counterCode: string): void {
    this.deductionData = this.mockDeductionData[counterCode] || [];
  }

  // 新增專櫃
  onAddCounter(): void {
    const newCounter: CounterData = {
      id: this.counterData.length + 1,
      counterCode: '',
      commissionTypeCode: '',
      commissionTypeName: '',
      presaleStartCalculation: '',
      contractStartDate: '',
      contractEndDate: '',
      operationEndDate: '',
      deductionItems: ''
    };
    this.counterData = [...this.counterData, newCounter];
  }

  // 刪除專櫃
  onDeleteCounter(counter: CounterData): void {
    this.counterData = this.counterData.filter(item => item.id !== counter.id);
    if (this.selectedCounter?.id === counter.id) {
      this.selectedCounter = null;
      this.deductionData = [];
    }
  }

  // 新增扣款項目
  onAddDeductionItem(): void {
    if (!this.selectedCounter) {
      this.messageService.warnBubble('請先選擇專櫃');
      return;
    }

    const newItem: DeductionItem = {
      id: Date.now(), // 使用時間戳作為暫時 ID
      counterCode: this.selectedCounter.counterCode,
      itemCode: '',
      itemName: '',
      amountOrRate: 0,
      isRate: false
    };

    this.deductionData = [...this.deductionData, newItem];

    // 更新 mock 資料
    if (!this.mockDeductionData[this.selectedCounter.counterCode]) {
      this.mockDeductionData[this.selectedCounter.counterCode] = [];
    }
    this.mockDeductionData[this.selectedCounter.counterCode].push(newItem);
  }

  // 刪除扣款項目
  onDeleteDeductionItem(item: DeductionItem): void {
    this.deductionData = this.deductionData.filter(deduction => deduction.id !== item.id);

    // 更新 mock 資料
    if (this.selectedCounter) {
      this.mockDeductionData[this.selectedCounter.counterCode] =
        this.mockDeductionData[this.selectedCounter.counterCode]?.filter(d => d.id !== item.id) || [];
    }
  }

  // 表單提交
  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const formValue = frm.getRawValue();

      // 組合完整的提交資料
      const submitData = {
        ...formValue,
        counterData: this.counterData,
        deductionData: this.mockDeductionData
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

  // 清除表單
  clearForm(): void {
    this.dataForm.reset();
    this.dataForm.patchValue({ id: 0 });
    this.counterData = [...this.mockCounterData];
    this.deductionData = [...this.allDeductionItems];
    this.selectedCounter = null;
  }
}
