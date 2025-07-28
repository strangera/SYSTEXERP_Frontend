import { BaseQueryResponse } from "@shared/models";

// 活動資料模型
export interface ActivityData {
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
export interface CounterData {
  id: number;
  counterCode: string;
  counterName: string;
  itemCode: string;
  commissionTypeCode: string;
  commissionTypeName: string;
  presaleStartCalculation: string;
  contractStartDate: string;
  contractEndDate: string;
  operationStartDate: string;
  operationEndDate: string;
  deductionItems: string;
  selected?: boolean;
}

// 扣款項目模型
export interface DeductionItem {
  id: number;
  counterCode: string;
  counterName: string;
  itemCode: string;
  itemName: string;
  amountOrRate: number;
  isRate: boolean; // true: 比率, false: 金額
  displayAmount?: string; // 用於顯示格式化後的金額/比率
}

export interface CampaignData {
  No: string; // 序號
  Status: string; // 狀態 (0=失效, 1=生效, Temp=暫存)
  CampaignId: string; // 活動ID
  CampaignName: string; // 活動名稱
  StartTime: string; // 開始時間
  EndTime: string; // 結束時間
  AccountingType: string; // 活動類型
  AccountingOption: '0' | '1'; // 是否參加財務扣款結算 ('0'=不參與, '1'=指定DM類型)
  Remark: string; // 備註
}

// 假資料 - 修復 mockCounterData 加入 counterName
export const mockCounterData: CounterData[] = [
  {
    id: 1,
    counterCode: '00231',
    counterName: '女裝專櫃A', // 新增 counterName
    itemCode: 'D16',
    commissionTypeCode: '1',
    commissionTypeName: '女裝專櫃',
    presaleStartCalculation: 'Y',
    contractStartDate: '2025/02/01',
    contractEndDate: '2025/01/31',
    operationEndDate: '2025/03/01',
    operationStartDate: '2025/01/01',
    deductionItems: ''
  },
  {
    id: 2,
    counterCode: '00232',
    counterName: '男裝專櫃B', // 新增 counterName
    itemCode: 'D16',
    commissionTypeCode: '1',
    commissionTypeName: '男裝專櫃',
    presaleStartCalculation: 'N',
    contractStartDate: '2025/03/01',
    contractEndDate: '2025/02/28',
    operationStartDate: '2025/01/01',
    operationEndDate: '2025/03/01',
    deductionItems: ''
  },
  {
    id: 3,
    counterCode: '00233',
    counterName: '化妝品專櫃C',
    itemCode: 'D16',
    commissionTypeCode: '3',
    commissionTypeName: '化妝品專櫃',
    presaleStartCalculation: 'Y',
    contractStartDate: '2025/04/01',
    contractEndDate: '2025/03/31',
    operationEndDate: '2025/04/01',
    operationStartDate: '2025/03/31',
    deductionItems: ''
  }
];

// 所有扣款項目的平面資料 - 修復 counterName
export const allDeductionItems: DeductionItem[] = [
  { id: 1, counterCode: '00031', counterName: '測試專櫃', itemCode: 'D16', itemName: '滿千送百(銷售)', amountOrRate: 0.5, isRate: true, displayAmount: '0.5%' },
  { id: 2, counterCode: '00031', counterName: '測試專櫃', itemCode: 'D17', itemName: '滿千送百兌回', amountOrRate: 0.3, isRate: true, displayAmount: '0.3%' },
];

// 修復 mockDeductionData 加入 counterName
export const mockDeductionData: { [counterCode: string]: DeductionItem[]; } = {
  '00031': [
    { id: 1, counterCode: '00031', counterName: '測試專櫃', itemCode: 'D16', itemName: '滿千送百(銷售)', amountOrRate: 0.5, isRate: true, displayAmount: '0.5%' },
    { id: 2, counterCode: '00031', counterName: '測試專櫃', itemCode: 'D17', itemName: '滿千送百兌回', amountOrRate: 0.3, isRate: true, displayAmount: '0.3%' }
  ],
  '00231': [
    { id: 3, counterCode: '00231', counterName: '女裝專櫃A', itemCode: 'D18', itemName: '女裝活動扣款', amountOrRate: 1000, isRate: false, displayAmount: '1000元' }
  ],
  '00232': [
    { id: 4, counterCode: '00232', counterName: '男裝專櫃B', itemCode: 'D19', itemName: '男裝活動扣款', amountOrRate: 0.8, isRate: true, displayAmount: '0.8%' }
  ],
  '00233': [
    { id: 5, counterCode: '00233', counterName: '化妝品專櫃C', itemCode: 'D20', itemName: '化妝品活動扣款', amountOrRate: 1500, isRate: false, displayAmount: '1500元' }
  ],
};

export const mockCampaignData: BaseQueryResponse<CampaignData> = {
  Status: 'success',
  Message: '查詢成功',
  TotalCount: 3,
  TotalPage: 1,
  Data: [
    {
      No: '1',
      Status: '1',
      CampaignId: 'CAMP001',
      CampaignName: '母親節活動',
      StartTime: '2025-05-01',
      EndTime: '2025-05-31',
      AccountingType: '0',
      AccountingOption: '1',
      Remark: '母親節促銷活動'
    },
    {
      No: '2',
      Status: '0',
      CampaignId: 'CAMP002',
      CampaignName: '端午節活動',
      StartTime: '2025-06-01',
      EndTime: '2025-06-30',
      AccountingType: '1',
      AccountingOption: '0',
      Remark: '端午節促銷活動'
    },
    {
      No: '3',
      Status: '1',
      CampaignId: 'CAMP003',
      CampaignName: '中秋節活動',
      StartTime: '2025-09-01',
      EndTime: '2025-09-30',
      AccountingType: '0',
      AccountingOption: '1',
      Remark: '中秋節促銷活動'
    }
  ],
};


// 下拉選單選項（與查詢頁面相同）
export const activityTypeOptions: any[] = [
  { label: '滿千送百', value: 'TYPE001' },
  { label: '滿額積點', value: 'TYPE002' }
];

export const departmentOptions: any[] = [
  { label: '營運部', value: 'DEPT001' },
  { label: '行銷部', value: 'DEPT002' }
];

export const activityGroupOptions: any[] = [
  { label: '母親節檔DM', value: 'GROUP001' }
];

export const activityNameOptions: any[] = [
  { label: '母親節滿5000送100', value: 'ACTIVITY001' }
];
