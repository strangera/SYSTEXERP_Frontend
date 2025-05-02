import { Component, OnInit } from '@angular/core';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';
import { NavigationExtras, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from '../../../service/system/auth.service';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { PermissionsInfo } from '../../../shared/models/system/funsrightInfo';

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
  startYear: number;
  startMonth: string;
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
  startYear: number;
  startMonth: string;
  endYear: number;
  endMonth: string;
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
  deductionName: string;
  startYear: number;
  startMonth: string;
  endYear: number;
  endMonth: string;
  unit: string;
  rateOrAmount: number;
  organization: number;
  invoiceStatus: string;
}
interface Deduction3 {
  serialNumber: number;
  isNew: boolean;
  deductionCode: string;
  startYear: number;
  startMonth: string;
  endYear: number;
  endMonth: string;
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

@Component({
  selector: 'app-tls13010-next1',
  templateUrl: './tls13010-next1.component.html',
  styleUrls: ['./tls13010-next1.component.scss']
})
export class TLS13010Next1Component extends BasicCrupageComponent implements OnInit {
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
  loading: boolean = false;
  dataForm = this.formBuilder.group({})
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.ProgNo = '210010';
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
      { serialNumber: 1, isNew: true, deductionCode: 'A01', deductionName: '開標費財費', startYear: 2015, startMonth: '1月', unit: '', unitPrice: 10000, quantity: 1, amount: 10000, organization: 102220, invoiceStatus: '開立' },
      { serialNumber: 2, isNew: false, deductionCode: 'A02', deductionName: '識別證', startYear: 2014, startMonth: '12月', unit: '', unitPrice: 0, quantity: 0, amount: 0, organization: 102220, invoiceStatus: '開立' },
      { serialNumber: 3, isNew: false, deductionCode: 'A03', deductionName: '影印費', startYear: 2014, startMonth: '12月', unit: '', unitPrice: 0, quantity: 0, amount: 0, organization: 102220, invoiceStatus: '開立' },
      { serialNumber: 4, isNew: false, deductionCode: 'A04', deductionName: '紙袋、包裝費', startYear: 2014, startMonth: '12月', unit: '', unitPrice: 0, quantity: 0, amount: 0, organization: 102220, invoiceStatus: '開立' },
      { serialNumber: 5, isNew: false, deductionCode: 'A05', deductionName: '簽票費用', startYear: 2014, startMonth: '12月', unit: '', unitPrice: 0, quantity: 0, amount: 0, organization: 102220, invoiceStatus: '開立' }
    ];

    // 每月扣款資料
    this.deductions1 = [
      { serialNumber: 1, isNew: true, deductionCode: 'B01', deductionName: '公區管理費', startYear: 2014, startMonth: '12月', endYear: 2016, endMonth: '12月', unit: '坪數', unitPrice: 300, quantity: 8.2, amount: 2460, invoiceStatus: '開立', isCalculatedByDay: '是', deductionPeriod: 1 },
      { serialNumber: 2, isNew: true, deductionCode: 'B04', deductionName: 'POS租金', startYear: 2014, startMonth: '12月', endYear: 2016, endMonth: '12月', unit: '收銀機台數', unitPrice: 700, quantity: 1, amount: 700, invoiceStatus: '開立', isCalculatedByDay: '是', deductionPeriod: 1 },
      { serialNumber: 3, isNew: true, deductionCode: 'B07', deductionName: '行銷贊助費', startYear: 2014, startMonth: '12月', endYear: 2016, endMonth: '12月', unit: '', unitPrice: 3000, quantity: 1, amount: 3000, invoiceStatus: '開立', isCalculatedByDay: '否', deductionPeriod: 1 },
      { serialNumber: 4, isNew: true, deductionCode: 'B09', deductionName: '週年慶贊助費', startYear: 2015, startMonth: '11月', endYear: 2016, endMonth: '11月', unit: '', unitPrice: 6000, quantity: 1, amount: 6000, invoiceStatus: '開立', isCalculatedByDay: '否', deductionPeriod: 12 },
      { serialNumber: 5, isNew: true, deductionCode: 'B10', deductionName: '母親節贊助費', startYear: 2015, startMonth: '05月', endYear: 2016, endMonth: '05月', unit: '', unitPrice: 6000, quantity: 1, amount: 6000, invoiceStatus: '開立', isCalculatedByDay: '否', deductionPeriod: 12 }
    ];

    // 比率分攤資料
    this.deductions2 = [
      { serialNumber: 1, isNew: true, deductionCode: 'D01', deductionName: '中信信用卡手續費-一刷', startYear: 2014, startMonth: '12月', endYear: 2016, endMonth: '12月', unit: '', rateOrAmount: 0.02, organization: 102220, invoiceStatus: '開立' },
      { serialNumber: 2, isNew: true, deductionCode: 'D03', deductionName: '中信信用卡手續費-三刷', startYear: 2014, startMonth: '12月', endYear: 2016, endMonth: '12月', unit: '', rateOrAmount: 0.01, organization: 102220, invoiceStatus: '開立' },
      { serialNumber: 3, isNew: true, deductionCode: 'D04', deductionName: '中信信用卡手續費-六刷', startYear: 2014, startMonth: '12月', endYear: 2016, endMonth: '12月', unit: '', rateOrAmount: 0.025, organization: 102220, invoiceStatus: '開立' },
      { serialNumber: 4, isNew: true, deductionCode: 'D07', deductionName: '中信信用卡手續費-十二刷', startYear: 2014, startMonth: '12月', endYear: 2016, endMonth: '12月', unit: '', rateOrAmount: 0.04, organization: 102220, invoiceStatus: '開立' },
      { serialNumber: 5, isNew: true, deductionCode: 'D12', deductionName: '聯合信用卡手續費-一刷', startYear: 2014, startMonth: '12月', endYear: 2016, endMonth: '12月', unit: '', rateOrAmount: 0.02, organization: 102220, invoiceStatus: '開立' }
    ];

    this.deductions3 = [
      {
        serialNumber: 1,
        isNew: true,
        deductionCode: 'C01',
        startYear: 2015,
        startMonth: '1月',
        endYear: 2016,
        endMonth: '12月',
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
        startYear: 2014,
        startMonth: '12月',
        endYear: 2016,
        endMonth: '12月',
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
    this.router.navigate(['TLS1000/TLS13010NEXT2']);
  }
  onCancel() {
    this.router.navigate(['TLS1000/TLS13010']);
  }//CRU
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
    return this.funInfo?.PrivilegeBehavior?.includes(PermissionsInfo.query) as boolean;
  }
}
