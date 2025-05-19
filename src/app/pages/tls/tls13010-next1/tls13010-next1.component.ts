import { Column } from './../../../shared/componentkit/table/table.model';
import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';

//資料欄位還需要調整 這是一個範例
interface CategoryItem {
  id: number;
  CAT_LNo: string;
  CAT_LName: string;
  CAT_LRemark: string | null;
  CRT_USR_No: string | "";
  CRT_USR_Name: string | "";
}


interface StockData {
  recruitmentNumber: string;
  counterNumber: string;
  brandName: string;
  vendorId: string;
  vendorName: string;
  versionNumber: string;
  commissionType: string;
  contractStartDate: string;
  contractEndDate: string;
  operationStartDate: string;
  operationEndDate: string;
}

interface Deduction {
  serialNumber: number;
  isNew: boolean;
  deductionCode: string;
  deductionName: string;
  startDate: string;
  unit: string;
  unitPrice: number;
  quantity: number;
  amount: number;
  organization: number;
  invoiceStatus: string;
}

interface Deduction1 {
  serialNumber: number;
  isNew: boolean;
  deductionCode: string;
  deductionName: string;
  startDate: string;
  endDate: string;
  unit: string;
  unitPrice: number;
  quantity: number;
  amount: number;
  invoiceStatus: string;
  isCalculatedByDay: string;
  deductionPeriod: number;
}

interface Deduction2 {
  serialNumber: number;
  isNew: boolean;
  deductionCode: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  advancePayment: number;
  installmentCount: number;
  monthlyAmount: number;
  firstInstallmentAmount: number;
  monthlyInterestRate: number;
  endTermAmount: number; // New field for 期末金額
  organization: number;
  invoiceStatus: string;
}
interface Deduction3 {
  serialNumber: number;
  isNew: boolean;
  deductionCode: string;
  deductionName: string;
  startDate: string;
  endDate: string;
  unit: string;
  rateOrAmount: number;
  organization: number;
  invoiceStatus: string;
}

@Component({
  selector: 'app-tls13010-next1',
  templateUrl: './tls13010-next1.component.html',
  styleUrls: ['./tls13010-next1.component.scss']
})
export class TLS13010Next1Component extends BasicCruPageComponent<CategoryItem> implements OnInit {
  deductionColumns: Column[] = [// 表格欄位定義
    {
      field: 'isNew',
      header: '是否新增',
      visible: true,
      type: 'checkbox',
      checkboxTrueLabel: '是', // 非編輯模式顯示「新增」表示 true
      checkboxFalseLabel: '否', // 非編輯模式顯示「非新增」表示 false
      maxWidth: '150px' // 可選：確保單元格寬度
    },
    { field: 'deductionCode', header: '扣款代號', visible: true, type: 'input' },
    { field: 'deductionName', header: '扣款名稱', visible: true, type: 'input' },
    { field: 'startDate', header: '扣款起始年月', visible: true, type: 'date' },
    { field: 'unit', header: '單位', visible: true, type: 'input' },
    { field: 'unitPrice', header: '單價', visible: true, type: 'inputNumber' },
    { field: 'quantity', header: '數量', visible: true, type: 'inputNumber' },
    { field: 'amount', header: '扣款金額', visible: true, type: 'inputNumber' },
    { field: 'organization', header: '組織', visible: true, type: 'input' },
    {
      field: 'invoiceStatus', header: '是否開立發票', visible: true, type: 'dropdown',
      options: [
        { label: '開立', value: 'true' },
        { label: '未開立', value: 'false' },
      ],
    },
  ];

  stocksColumns: Column[] = [
    { field: 'recruitmentNumber', header: '專櫃招募編號', visible: true },
    { field: 'counterNumber', header: '專櫃編號', visible: true },
    { field: 'brandName', header: '品牌(專櫃)名稱', visible: true },
    { field: 'vendorId', header: '廠商統編', visible: true },
    { field: 'vendorName', header: '廠商名稱', visible: true },
    { field: 'versionNumber', header: '版本編號', visible: true },
    { field: 'commissionType', header: '抽成別', visible: true },
    { field: 'contractStartDate', header: '合約起始日', visible: true },
    { field: 'contractEndDate', header: '合約終止日', visible: true },
    { field: 'operationStartDate', header: '營運起始日', visible: true },
    { field: 'operationEndDate', header: '營運終止日', visible: true },
  ];

  deduction1Columns: Column[] = [
    {
      field: 'isNew',
      header: '是否新增',
      visible: true,
      type: 'checkbox',
      checkboxTrueLabel: '是', // 非編輯模式顯示「新增」表示 true
      checkboxFalseLabel: '否', // 非編輯模式顯示「非新增」表示 false
      maxWidth: '150px' // 可選：確保單元格寬度
    },
    { field: 'deductionCode', header: '扣款代號', visible: true, type: 'input' },
    { field: 'deductionName', header: '扣款名稱', visible: true, type: 'input' },
    { field: 'startDate', header: '扣款起始年月', visible: true, type: 'date' },
    { field: 'endDate', header: '扣款結束年月', visible: true, type: 'date' },
    { field: 'unit', header: '單位', visible: true, type: 'input' },
    { field: 'unitPrice', header: '單價', visible: true, type: 'inputNumber' },
    { field: 'quantity', header: '數量', visible: true, type: 'inputNumber' },
    { field: 'amount', header: '扣款金額(未稅)', visible: true, type: 'inputNumber' },
    {
      field: 'invoiceStatus', header: '是否開立發票', visible: true, type: 'dropdown',
      options: [
        { label: '開立', value: 'true' },
        { label: '未開立', value: 'false' },
      ],
      // optionValue: '是', // 非編輯模式顯示「非新增」表示 false
    },
    {
      field: 'isCalculatedByDay', header: '是否以日計算', visible: true, type: 'dropdown',
      options: [
        { label: '是', value: 'true' },
        { label: '否', value: 'false' },
      ],
      optionValue: '', // 非編輯模式顯示「非新增」表示 false
    },
    {
      field: 'deductionPeriod', header: '扣款週期數(月)', visible: true, type: 'inputNumber',
    },
  ];

  deduction2Columns: Column[] = [
    {
      field: 'isNew',
      header: '是否新增',
      visible: true,
      type: 'checkbox',
      checkboxTrueLabel: '是', // 非編輯模式顯示「新增」表示 true
      checkboxFalseLabel: '否', // 非編輯模式顯示「非新增」表示 false
    },
    { field: 'deductionCode', header: '扣款代號', visible: true, type: 'input' },
    { field: 'startDate', header: '扣款起始年月', visible: true, type: 'date' },
    { field: 'endDate', header: '扣款結束年月', visible: true, type: 'date' },
    { field: 'totalAmount', header: '總金額', visible: true, type: 'input' },
    { field: 'advancePayment', header: '預收款', visible: true, type: 'inputNumber' },
    { field: 'installmentCount', header: '期數', visible: true, type: 'inputNumber' },
    { field: 'monthlyAmount', header: '每月金額', visible: true, type: 'inputNumber' },
    {
      field: 'firstInstallmentAmount', header: '首期金額', visible: true, type: 'input',
    },
    {
      field: 'endTermAmount', header: '期末金額', visible: true, type: 'inputNumber',
    },
    {
      field: 'monthlyInterestRate', header: '月利率', visible: true, type: 'inputNumber',
    },
    {
      field: 'organization', header: '組織', visible: true, type: 'dropdown',
      options: [
        { label: '是', value: 'true' },
        { label: '否', value: 'false' },
      ],
    }, {
      field: 'invoiceStatus', header: '是否開立發票', visible: true, type: 'dropdown',
      options: [
        { label: '開立', value: 'true' },
        { label: '未開立', value: 'false' },
      ],
    },
  ];
  // 比率分攤資料
  deduction3Columns: Column[] = [
    {
      field: 'isNew',
      header: '是否新增',
      visible: true,
      type: 'checkbox',
      checkboxTrueLabel: '是', // 非編輯模式顯示「新增」表示 true
      checkboxFalseLabel: '否', // 非編輯模式顯示「非新增」表示 false
    },
    { field: 'deductionCode', header: '扣款代號', visible: true, type: 'input' },
    { field: 'startDate', header: '扣款起始年月', visible: true, type: 'date' },
    { field: 'endDate', header: '扣款結束年月', visible: true, type: 'date' },
    { field: 'unit', header: '單位', visible: true, type: 'input' },
    { field: 'rateOrAmount', header: '比率或元', visible: true, type: 'inputNumber' },
    {
      field: 'organization', header: '組織', visible: true, type: 'dropdown',
      options: [
        { label: '102220', value: 102220 },
        { label: '102221', value: 102221 },
        { label: '102222', value: 102222 },
      ],
    },
    {
      field: 'invoiceStatus', header: '是否開立發票', visible: true, type: 'dropdown',
      options: [
        { label: '開立', value: 'true' },
        { label: '未開立', value: 'false' },
      ],
    },
  ];


  stocks: StockData[] = [];
  deductions: Deduction[] = [];
  deductions1: Deduction1[] = [];
  deductions2: Deduction2[] = [];
  deductions3: Deduction3[] = [];

  years = [2014, 2015, 2016, 2017, 2018, 2019, 2020];
  months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  organizations = [102220, 102221, 102222];
  invoiceStatuses = ['開立', '未開立'];
  units = ['坪數', '收銀機台數'];
  calculatedByDayOptions = ['是', '否'];
  dataForm = this.formBuilder.group({})
  constructor(
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    // this.ProgNo = '210010';
    this.initializePage('TLS13010', this.dataForm);
    this.stocks = [
      {
        recruitmentNumber: '001',
        counterNumber: 'A123',
        brandName: '品牌A',
        vendorId: '55667788',
        vendorName: '公司A',
        versionNumber: 'v1.0',
        commissionType: '固定',
        contractStartDate: '2021/01/01',
        contractEndDate: '2023/12/31',
        operationStartDate: '2021/02/01',
        operationEndDate: '2023/11/30'
      }
    ];


    // 一次扣款資料
    this.deductions = [
      { serialNumber: 1, isNew: true, deductionCode: 'A01', deductionName: '開標費財費', startDate: '2015/1', unit: '', unitPrice: 10000, quantity: 1, amount: 10000, organization: 102220, invoiceStatus: 'true' },
      { serialNumber: 2, isNew: false, deductionCode: 'A02', deductionName: '識別證', startDate: '2014/12', unit: '', unitPrice: 0, quantity: 0, amount: 0, organization: 102220, invoiceStatus: 'true' },
      { serialNumber: 3, isNew: false, deductionCode: 'A03', deductionName: '影印費', startDate: '2014/12', unit: '', unitPrice: 0, quantity: 0, amount: 0, organization: 102220, invoiceStatus: 'true' },
      { serialNumber: 4, isNew: false, deductionCode: 'A04', deductionName: '紙袋、包裝費', startDate: '2014/12', unit: '', unitPrice: 0, quantity: 0, amount: 0, organization: 102220, invoiceStatus: 'true' },
      { serialNumber: 5, isNew: false, deductionCode: 'A05', deductionName: '簽票費用', startDate: '2014/12', unit: '', unitPrice: 0, quantity: 0, amount: 0, organization: 102220, invoiceStatus: 'true' }
    ];

    // 每月扣款資料
    this.deductions1 = [
      { serialNumber: 1, isNew: true, deductionCode: 'B01', deductionName: '公區管理費', startDate: '2014/12', endDate: '2016/12', unit: '坪數', unitPrice: 300, quantity: 8.2, amount: 2460, invoiceStatus: 'true', isCalculatedByDay: 'true', deductionPeriod: 1 },
      { serialNumber: 2, isNew: true, deductionCode: 'B04', deductionName: 'POS租金', startDate: '2014/12', endDate: '2016/12', unit: '收銀機台數', unitPrice: 700, quantity: 1, amount: 700, invoiceStatus: 'true', isCalculatedByDay: 'true', deductionPeriod: 1 },
      { serialNumber: 3, isNew: true, deductionCode: 'B07', deductionName: '行銷贊助費', startDate: '2014/12', endDate: '2016/12', unit: '', unitPrice: 3000, quantity: 1, amount: 3000, invoiceStatus: 'true', isCalculatedByDay: 'false', deductionPeriod: 1 },
      { serialNumber: 4, isNew: true, deductionCode: 'B09', deductionName: '週年慶贊助費', startDate: '2015/11', endDate: '2016/11', unit: '', unitPrice: 6000, quantity: 1, amount: 6000, invoiceStatus: 'true', isCalculatedByDay: 'false', deductionPeriod: 12 },
      { serialNumber: 5, isNew: true, deductionCode: 'B10', deductionName: '母親節贊助費', startDate: '2015/05', endDate: '2016/05', unit: '', unitPrice: 6000, quantity: 1, amount: 6000, invoiceStatus: 'true', isCalculatedByDay: 'false', deductionPeriod: 12 }
    ];

    //平均分攤資料
    this.deductions2 = [
      {
        serialNumber: 1,
        isNew: true,
        deductionCode: 'C01',
        startDate: '2015/01',
        endDate: '2016/12',
        totalAmount: 164000,
        advancePayment: 0,
        installmentCount: 24,
        monthlyAmount: 6800,
        firstInstallmentAmount: 7600,
        monthlyInterestRate: 0,
        endTermAmount: 1600, // Added end-of-term amount
        organization: 102220,
        invoiceStatus: '開立'
      },
      {
        serialNumber: 2,
        isNew: false,
        deductionCode: 'C02',
        startDate: '2014/12',
        endDate: '2016/12',
        totalAmount: 0,
        advancePayment: 0,
        installmentCount: 0,
        monthlyAmount: 0,
        firstInstallmentAmount: 0,
        monthlyInterestRate: 0,
        endTermAmount: 0, // Added end-of-term amount
        organization: 102220,
        invoiceStatus: '開立'
      }
    ];
    // 比率分攤資料
    this.deductions3 = [
      { serialNumber: 1, isNew: true, deductionCode: 'D01', deductionName: '中信信用卡手續費-一刷', startDate: '2014/12', endDate: '2016/12', unit: '', rateOrAmount: 0.02, organization: 102220, invoiceStatus: 'true' },
      { serialNumber: 2, isNew: true, deductionCode: 'D03', deductionName: '中信信用卡手續費-三刷', startDate: '2014/12', endDate: '2016/12', unit: '', rateOrAmount: 0.01, organization: 102220, invoiceStatus: 'true' },
      { serialNumber: 3, isNew: true, deductionCode: 'D04', deductionName: '中信信用卡手續費-六刷', startDate: '2014/12', endDate: '2016/12', unit: '', rateOrAmount: 0.025, organization: 102220, invoiceStatus: 'true' },
      { serialNumber: 4, isNew: true, deductionCode: 'D07', deductionName: '中信信用卡手續費-十二刷', startDate: '2014/12', endDate: '2016/12', unit: '', rateOrAmount: 0.04, organization: 102220, invoiceStatus: 'true' },
      { serialNumber: 5, isNew: true, deductionCode: 'D12', deductionName: '聯合信用卡手續費-一刷', startDate: '2014/12', endDate: '2016/12', unit: '', rateOrAmount: 0.02, organization: 102220, invoiceStatus: 'true' }
    ];
  }

  selectAllDeductions3(): void {
    this.deductions3.forEach(deduction => deduction.isNew = true);
  }

  deselectAllDeductions3(): void {
    this.deductions3.forEach(deduction => deduction.isNew = false);
  }

  // 全部選擇與取消選擇的函式
  selectAllDeductions(): void {
    this.deductions.forEach(deduction => deduction.isNew = true);
  }

  deselectAllDeductions(): void {
    this.deductions.forEach(deduction => deduction.isNew = false);
  }

  selectAllDeductions1(): void {
    this.deductions1.forEach(deduction => deduction.isNew = true);
  }

  deselectAllDeductions1(): void {
    this.deductions1.forEach(deduction => deduction.isNew = false);
  }

  selectAllDeductions2(): void {
    this.deductions2.forEach(deduction => deduction.isNew = true);
  }

  deselectAllDeductions2(): void {
    this.deductions2.forEach(deduction => deduction.isNew = false);
  }
  onSubmitNext(): void {
    this.router.navigate(['TLS/TLS13010NEXT2']);
  }

  submitForm(frm: FormGroup) {
    // 查詢邏輯
    this.onSubmit(frm);
  }//CRU
  onSubmit(frm: FormGroup) {
    this.submitted = true;
    this.loading = true;
    this.messageService.blockUi();

    if (frm.valid && this.canQuery()) {
      // Implement your form submission logic here
      console.log(frm.value);
    }

    this.loading = false;
    this.messageService.unblockUi();
  }
  // Check if the user has query permission
  canQuery(): boolean {
    return true;
  }
}
