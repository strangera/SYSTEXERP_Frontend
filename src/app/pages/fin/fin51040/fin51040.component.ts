import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Services
import { IfdisplayService } from './../../../service/basic/ifdisplay.service';
import { AnalysisdateCService } from './../../../service/basic/analysisdate-c.service';
import { FlippingstateService } from './../../../service/basic/flippingstate.service';
// Shared
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
import { VendorService } from '../../../service/basic/vendor.service';
import { FileType } from '../../../shared/componentkit/file-upload/file-upload.component';
import { OrganizationNumberService } from '../../../service/basic/organization-number.service';
import { AccountingaccountService } from '../../../service/basic/accountingaccount.service';

@Component({
  selector: 'app-fin51040',
  templateUrl: './fin51040.component.html',
  styleUrl: './fin51040.component.scss',
})
export class FIN51040Component extends BasicQpageComponent implements OnInit {
  // Upload files
  fileType: FileType = FileType.PNG;
  uploadUrl: string = 'https://www.primefaces.org/cdn/api/upload.php';
  queryForm = this.formBuilder.group({
    year: [],
    version: [],
    organizationNumber: [, Validators.required],
    month: [],
    amountStart: [], // 金額 起
    amountEnd: [], // 金額 迄
    remark: [],
    status: [],
    department: [],
    unit: [],
    type: [],
    compareyear: [],
    version1: [],
    version2: [],
    year1: [],
    year2: [],
    Subpoenatype: [],
    startdate: [],
    enddate: [],
    Subpoenastatus: [],
    Subpoenacode: [],
    SummonsSummary: [],
    accountingaccount: [],
    vendorCode: [],
    code: [],
    Summonscode: [],
    Summary: [],
  });

  // Dropdown options

  FNCCodeOptions: any[] = [];
  AccountcodeOptions: any[] = [];
  departmentOptions: any[] = [];
  displayOptions2: any[] = [];
  AnalysisdateCOptions: any[] = [];
  vendorOptions: any[] = [];
  FlippingstateOptions: any[] = [];
  organizationNumberOptions: any[] = [];
  statusOptions: any[] = [
    { value: 1, label: '未拋轉' },
    { value: 2, label: '已拋轉' },
    { value: 2, label: '已退回' },
  ];
  unitOptions: any[] = [
    { value: 1, label: '元' },
    { value: 2, label: '千' },
    { value: 3, label: '萬' },
  ];
  typeOptions: any[] = [
    { value: 1, label: '統制' },
    { value: 2, label: '明細' },
  ];

  SubpoenatypeOptions: any[] = [
    { value: 1, label: '專櫃代扣款' },
    { value: 2, label: '租金傳票' },
    { value: 3, label: '專櫃進貨傳票' },
    { value: 4, label: '抽成傳票' },
    { value: 5, label: '進貨帳款傳票' },
    { value: 6, label: '銷售傳票' },
  ];
  SubpoenastatusOptions: any[] = [
    { value: 1, label: '作廢' },
    { value: 2, label: '建立' },
    { value: 2, label: '確認' },
    { value: 2, label: '過帳' },
    { value: 2, label: '刪除' },
  ];
  accountingaccountOptions: any[] = [];
  codeOptions: any[] = [
    { value: 1, label: '68919301_臺南紡織股份有限公司' },
    { value: 2, label: '73251209_統一企業股份有限公司' },
    { value: 3, label: '96978370_統正開發股份有限公司' },
  ];

  // Table data
  data: any[] = [

  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [

    { field: 'isCarryOver', header: '是否拋轉', visible: true },
    { field: 'voucherDate', header: '傳票日期', visible: true },
    { field: 'voucherTransferStatus', header: '傳票拋轉狀態', visible: true },
    { field: 'voucherStatus', header: '傳票狀態', visible: true },
    { field: 'voucherNumber', header: '傳票編號', visible: true },
    { field: 'voucherSummary', header: '傳票摘要', visible: true },

    // Debit Section
    { field: 'debitRecoveryPayable', header: '借方 - 應收帳款-有價券(含稅)', visible: true },
    { field: 'debitPreIncomeGoodsVoucher', header: '借方 - 預收款項-商品提貨單', visible: true },
    { field: 'debitPreIncomeUntaxed', header: '借方 - 預收款項-未抵銷項稅額', visible: true },
    { field: 'debitPreIncomeOther', header: '借方 - 預收款項-其他', visible: true },
    { field: 'debitSalesTax', header: '借方 - 銷項稅額-有價券', visible: true },
    { field: 'debitSalesDiscount', header: '借方 - 銷售折讓-商品損壞單據折扣', visible: true },
    { field: 'debitTotal', header: '借方合計', visible: true },

    // Credit Section
    { field: 'creditRecoveryPayable', header: '貸方 - 應付帳款-有價券(含稅)', visible: true },
    { field: 'creditPreExpenseGoodsVoucher', header: '貸方 - 預收款項-商品提貨單', visible: true },
    { field: 'creditPreExpenseUntaxed', header: '貸方 - 預收款項-未抵銷項稅額', visible: true },
    { field: 'creditPreExpenseOther', header: '貸方 - 預收款項-其他', visible: true },
    { field: 'creditSalesTax', header: '貸方 - 銷項稅額-有價券', visible: true },
    { field: 'creditSalesDiscount', header: '貸方 - 銷售折讓-商品損壞單據折扣', visible: true },
    { field: 'creditTotal', header: '貸方合計', visible: true },
    { field: 'deductionExpenseTravel', header: '扣款收入-行銷贊助費', visible: true },
    { field: 'deductionExpenseMedical', header: '扣款收入-運年醫療助費', visible: true },
    { field: 'deductionExpenseMother', header: '扣款收入-母親節助贈費', visible: true },
    { field: 'deductionExpensePaper', header: '扣款收入-紙袋贈送費', visible: true },
    { field: 'deductionExpenseFlower', header: '扣款收入-花車道具', visible: true },
    { field: 'deductionExpenseElectric', header: '扣款收入-電器', visible: true },
    { field: 'deductionExpenseBC', header: '扣款收入-A,B,C工程費用', visible: true },
    { field: 'deductionExpenseMisc', header: '扣款收入-雜項費', visible: true },
    { field: 'deductionExpenseOther', header: '扣款收入-其他', visible: true },
    { field: 'receivableVouchersForeignCoupon', header: '應收帳款-外來禮券', visible: true },
    { field: 'debitTotal', header: '借方合計', visible: true },
    { field: 'receivableVouchersMixedGoods', header: '應收帳款-外來混合單', visible: true },
    { field: 'receivableVouchersProductExchange', header: '應收帳款-商品兌換券', visible: true },
    { field: 'receivableVouchersTimeCoupon', header: '應收帳款-時限券', visible: true },
    { field: 'receivableVouchersMonthly', header: '應收帳款-外來禮券(月結)', visible: true },
    { field: 'receivableVouchersTrueValue', header: '應收帳款-外來禮券收入正負差', visible: true },
    { field: 'receivableVouchersCashEquivalent', header: '其他應收款-兌換收入正負差(統收)', visible: true },
    { field: 'receivableVouchersOtherIncome', header: '其他應收款-收入正負差(統收)', visible: true },
    { field: 'payableAccount', header: '暫付款帳款-專櫃', visible: true },
    { field: 'deductionExpenseCommission', header: '銷項稅額-扣款', visible: true },
    { field: 'deductionExpenseOther', header: '代扣款-其他', visible: true },
    { field: 'salesRevenueRental', header: '營業租金-收入-場租租金', visible: true },
    { field: 'salesRevenueService', header: '營業租金-收入-停車場', visible: true },
    { field: 'salesRevenueOtherIncome', header: '其他營業收入-顧客停車及接駁專車補助費', visible: true },
    { field: 'deductionIncomeOne', header: '扣款收入-合營卡結算贊助費', visible: true },
    { field: 'deductionIncomeTwo', header: '扣款收入-商品紙消費贊助費', visible: true },
    { field: 'deductionIncomeThree', header: '扣款收入-贊助', visible: true },
    { field: 'deductionIncomeFour', header: '扣款收入-夾印費', visible: true },
    { field: 'deductionIncomeFive', header: '扣款收入-紙袋贈品費', visible: true },
    { field: 'deductionIncomeSix', header: '扣款收入-表單費用', visible: true },
    { field: 'deductionIncomeSeven', header: '扣款收入-活源費', visible: true },
    { field: 'deductionIncomeEight', header: '扣款收入-停車費', visible: true },
    { field: 'deductionIncomeNine', header: '扣款收入-場地租借', visible: true },
    { field: 'deductionIncomeTen', header: '扣款收入-美工POP', visible: true },
    { field: 'deductionIncomeEleven', header: '扣款收入-DM名條', visible: true },
    { field: 'deductionIncomeTwelve', header: '扣款收入-羅蘭活動贊助費', visible: true },
    { field: 'deductionIncomeThirteen', header: '扣款收入-合營手續費', visible: true },
    { field: 'deductionIncomeFourteen', header: '扣款收入-合營水費', visible: true },
    { field: 'deductionIncomeFifteen', header: '扣款收入-空調費/水費', visible: true },
    { field: 'deductionIncomeSixteen', header: '扣款收入-B.C工程費用', visible: true },
    { field: 'deductionIncomeSeventeen', header: '扣款收入-修繕費', visible: true },
    { field: 'deductionIncomeEighteen', header: '扣款收入-封板施工費', visible: true },
    { field: 'deductionIncomeNineteen', header: '扣款收入-電話費', visible: true },
    { field: 'deductionIncomeCallMachine', header: '扣款收入-取餐CALL機', visible: true },
    { field: 'deductionIncomeOutdoorCost', header: '扣款收入-戶外店招費用', visible: true },
    { field: 'deductionIncomeAdvertisement', header: '扣款收入-廣宣費助費(行銷)', visible: true },
    { field: 'deductionIncomeRepairCost', header: '扣款收入-修配費', visible: true },
    { field: 'deductionIncomeAccessories', header: '扣款收入-設備備品', visible: true },
    { field: 'deductionIncomeReceptionCost', header: '扣款收入-收禮費', visible: true },
    { field: 'deductionIncomeOnlineDiscount', header: '扣款收入-線停車折抵機', visible: true },
    { field: 'deductionIncomeMaintenanceInsurance', header: '扣款收入-設備維護保養', visible: true },
    { field: 'deductionIncomeLinePay', header: '扣款收入-LINE PAY', visible: true },
    { field: 'deductionIncomeOthers', header: '扣款收入-其他', visible: true },
    { field: 'totalCredit', header: '貸方合計', visible: true }
  ];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private authService: AuthService,
    private IfdisplayService: IfdisplayService,
    private AnalysisdateCService: AnalysisdateCService,
    private vendorService: VendorService,
    private flippingstateService: FlippingstateService,
    private organizationNumberService: OrganizationNumberService,
    private accountingaccountService: AccountingaccountService
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.ProgNo = '150004';
    // Initialize dropdown options
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    this.IfdisplayService.getOptions().subscribe(
      (data) => (this.displayOptions2 = data)
    );
    this.AnalysisdateCService.getOptions().subscribe(
      (data) => (this.AnalysisdateCOptions = data)
    );
    this.vendorService.getVendors().subscribe((data) => {
      this.vendorOptions = data;
    });
    this.flippingstateService.getOptions().subscribe((data) => {
      this.FlippingstateOptions = data;
    });
    this.organizationNumberService
      .getOrganizationNumbers()
      .subscribe((data) => {
        this.departmentOptions = data;
      });
    this.accountingaccountService.getOptions().subscribe((data) => {
      this.accountingaccountOptions = data;
    });
  }

  onSubmit(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;
    this.notificationService.blockUi();

    if (frm.valid && this.canQuery()) {
      // Submit logic here
    }

    this.loading = false;
    this.notificationService.unblockUi();
  }

  onSubmitQuery(frm: FormGroup) {
    this.onSubmit(frm);
    this.router.navigate(['FIN5000/FIN51040CRU']);
  }

  onCreate() {
    if (this.canAdd()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: CRUDStatus.Create,
          queryform: this.queryForm,
        },
        skipLocationChange: true,
      };
      this.router.navigate(['FIN3000/FIN34030CRU'], extras);
    }
  }

  onEdit(data: any) {
    if (this.canEdit()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: CRUDStatus.Edit,
          rowdata: data,
          queryform: this.queryForm,
        },
        skipLocationChange: true,
      };
      this.router.navigate(['/demo/demoinputtableCRU'], extras);
    }
  }

  onDetail(data: any) {
    let extras: NavigationExtras = {
      state: {
        crudstatus: CRUDStatus.Read,
        rowdata: data,
        queryform: this.queryForm,
      },
      skipLocationChange: true,
    };
    this.router.navigate(['/demo/demoinputtableCRU'], extras);
  }
  onClearForm() {
    this.queryForm.reset(); // 重置表單
  }
}
