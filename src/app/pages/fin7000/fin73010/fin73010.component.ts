import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Services
import { IfdisplayService } from './../../../service/basic/ifdisplay.service';
// Shared
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
import { VendorService } from '../../../service/basic/vendor.service';
import { UserCodeService } from '../../../service/basic/user-code.service';
import { CounterCodeService } from '../../../service/basic/counter-code.service';
import { FloorService } from '../../../service/basic/floor.service';
import { ViolationCategoryService } from '../../../service/basic/violation-category.service';
import { ViolationStatusService } from '../../../service/basic/violation-status.service';
import { DeductionItemService } from '../../../service/basic/deduction-item.service';
import { OrganizationNumberService } from './../../../service/basic/organization-number.service';

@Component({
  selector: 'app-fin73010',
  templateUrl: './fin73010.component.html',
  styleUrl: './fin73010.component.scss'
})
export class FIN73010Component extends BasicQpageComponent implements OnInit {
  queryForm = this.formBuilder.group({
    counterCode: [],  // 專櫃編號
    counterName: [],  // 專櫃名稱
    violationCategory: [],  // 違規類別編號
    deductionItem: [],  // 扣款項目
    amountStart: [],  // 金額開始
    amountEnd: [],  // 金額結束
    deductionDateStart: [],  // 扣款日期起
    deductionDateEnd: [],  // 扣款日期迄
    violationDateStart: [],  // 違規日期起
    violationDateEnd: [],  // 違規日期迄
    documentNumber: [],  // 單據編號
    issuingUnit: [],  // 開立單位
    createdBy: [],  // 建立者(輸入代號)
    floor: [],  // 樓層
    Applicationdate: [],  // 維護日
    status: [],  // 狀態
    PettyCashOrderNumber: [],
    Pettycashapplicant: [],
    Pettycashcustodian: [],
    Inventoryordernumber: [],
    SQuota: [],
    EQuota: [],
    startdate: [],
    enddate: [],
    description: [],
    SCountbalance: [],
    ECountbalance: [],

  });

  // Dropdown options
  PettyCashOrderNumber: any[] = [{ value: 201407170001, label: 'C201407170001' },
  { value: 201407170002, label: 'TC201407170002' },
  { value: 201407170003, label: 'TC201407170003' },
  { value: 201407170004, label: 'TC201407170004' },
  { value: 201407210001, label: 'TC201407210001' },
  { value: 201407210002, label: 'TC201407210002' },
  { value: 201407280001, label: 'TC201407280001' },
  { value: 201407280002, label: 'TC201407280002' },
  { value: 201407280003, label: 'TC201407280003' },
  { value: 201407290002, label: 'TC201407290002' },];
  usercode: any[] = [];
  Feespayable: any[] = [
    { value: 210101, label: '銀行短期借款' },
    { value: 210201, label: '應付商業本票-中華' },
    { value: 210202, label: '應付商業本票-合庫' },
    { value: 210203, label: '應付商業本票-聯邦' },
    { value: 210301, label: '應付商業本票折價' },
    { value: 210401, label: '一年或一年營業週期內到期長期負債' },
    { value: 2111, label: '應付票據' },
    { value: 211101, label: '應付票據-專櫃' },
    { value: 211102, label: '應付票據-自營' },
    { value: 211103, label: '應付票據-固資及費用' },
  ];
  Inputtax: any[] = [
    { value: 1, label: '1101_庫存現金' },
    { value: 2, label: '110101_庫存現金-營收及正負差' },
    { value: 3, label: '110102_庫存現金-其他收入' },
    { value: 4, label: '110103_庫存現金-財務部' },
    { value: 5, label: '110111_庫存現金-外幣' },
    { value: 6, label: '110112_庫存現金-人民幣' },
    { value: 7, label: '110199_庫存現金-其他' },
    { value: 8, label: '1102_零用金' },
    { value: 9, label: '110200_零用金-總經理室' },
    { value: 10, label: '110201_零用金-採購組' }
  ];
  statusOptions: any[] = [
    { value: 1, label: '建立' },
    { value: 2, label: '請款' },
    { value: 3, label: '拋轉' },
    { value: 4, label: '撥補' },

  ];
  FNCCodeOptions: any[] = [];
  AccountcodeOptions: any[] = [];
  displayOptions: any[] = [];
  displayOptions2: any[] = [];
  Billingordernumber: any[] = [
    { value: 1, label: 'B20150208001' },
    { value: 2, label: 'B20150208002' },
    { value: 3, label: 'B20150410001' },
  ];
  // Table data
  data: any[] = [
    {
      pettyCashNumber: 'C201407170001',
      applyDate: '2014/7/10',
      applicant: '2014000044-王小明',
      applicantOrg: '104200-營運部',
      custodian: '2014000044-王小明',
      custodianOrg: '101000-經營企劃部(停用)',
      status: '撥補',
      expenseAccountCode: '620401/國內差旅費',
      accountOrgCode: '101000-經營企劃部(停用)',
      itemDescription: '10305-5/14出差-鄧宇媛',
      detailType: '收據',
      invoiceReceiptNumber: '2014051401',
      date: '2014/5/14',
      preTaxAmount: 1410,
      tax: 70,
      totalAmount: 1480,
    },
    {
      pettyCashNumber: 'C201407170001',
      applyDate: '2014/7/10',
      applicant: '2014000044-王小明',
      applicantOrg: '104200-營運部',
      custodian: '2014000044-王小明',
      custodianOrg: '101000-經營企劃部(停用)',
      status: '撥補',
      expenseAccountCode: '620401/國內差旅費',
      accountOrgCode: '101000-經營企劃部(停用)',
      itemDescription: '10305-5/14出差-鄧宇媛',
      detailType: '收據',
      invoiceReceiptNumber: '2014051402',
      date: '2014/5/14',
      preTaxAmount: 1367,
      tax: 68,
      totalAmount: 1435,
    },
    {
      pettyCashNumber: 'C201407170001',
      applyDate: '2014/7/10',
      applicant: '2014000044-王小明',
      applicantOrg: '104200-營運部',
      custodian: '2014000044-王小明',
      custodianOrg: '101000-經營企劃部(停用)',
      status: '撥補',
      expenseAccountCode: '620401/國內差旅費',
      accountOrgCode: '101000-經營企劃部(停用)',
      itemDescription: '10305-5/14出差-鄧宇媛',
      detailType: '不扣抵憑證',
      invoiceReceiptNumber: '',
      date: '2014/5/14',
      preTaxAmount: 440,
      tax: 0,
      totalAmount: 440,
    },
    {
      pettyCashNumber: 'C201407170001',
      applyDate: '2014/7/10',
      applicant: '2014000044-王小明',
      applicantOrg: '104200-營運部',
      custodian: '2014000044-王小明',
      custodianOrg: '101000-經營企劃部(停用)',
      status: '撥補',
      expenseAccountCode: '622201/交際費-招待費',
      accountOrgCode: '101000-經營企劃部(停用)',
      itemDescription: '10305-招商會議餐-晉邦',
      detailType: '不扣抵憑證',
      invoiceReceiptNumber: '',
      date: '2014/5/14',
      preTaxAmount: 2074,
      tax: 0,
      totalAmount: 2074,
    },
    {
      pettyCashNumber: 'C201407170001',
      applyDate: '2014/7/10',
      applicant: '2014000044-王小明',
      applicantOrg: '104200-營運部',
      custodian: '2014000044-王小明',
      custodianOrg: '101000-經營企劃部(停用)',
      status: '撥補',
      expenseAccountCode: '620401/國內差旅費',
      accountOrgCode: '101000-經營企劃部(停用)',
      itemDescription: '10305-5/28出差-李慧玉',
      detailType: '收據',
      invoiceReceiptNumber: '2014052801',
      date: '2014/5/28',
      preTaxAmount: 1238,
      tax: 62,
      totalAmount: 1300,
    },
    {
      pettyCashNumber: 'C201407170001',
      applyDate: '2014/7/10',
      applicant: '2014000044-王小明',
      applicantOrg: '104200-營運部',
      custodian: '2014000044-王小明',
      custodianOrg: '101000-經營企劃部(停用)',
      status: '撥補',
      expenseAccountCode: '620401/國內差旅費',
      accountOrgCode: '101000-經營企劃部(停用)',
      itemDescription: '10305-5/28出差-李慧玉',
      detailType: '收據',
      invoiceReceiptNumber: '2014052802',
      date: '2014/5/28',
      preTaxAmount: 1238,
      tax: 62,
      totalAmount: 1300,
    },
    {
      pettyCashNumber: 'C201407170001',
      applyDate: '2014/7/10',
      applicant: '2014000044-王小明',
      applicantOrg: '104200-營運部',
      custodian: '2014000044-王小明',
      custodianOrg: '101000-經營企劃部(停用)',
      status: '撥補',
      expenseAccountCode: '620401/國內差旅費',
      accountOrgCode: '101000-經營企劃部(停用)',
      itemDescription: '10306-5/5出差-江宜婷',
      detailType: '不扣抵憑證',
      invoiceReceiptNumber: '',
      date: '2014/5/14',
      preTaxAmount: 502,
      tax: 0,
      totalAmount: 502,
    },
    {
      pettyCashNumber: 'C201407170001',
      applyDate: '2014/7/10',
      applicant: '2014000044-王小明',
      applicantOrg: '104200-營運部',
      custodian: '2014000044-王小明',
      custodianOrg: '101000-經營企劃部(停用)',
      status: '撥補',
      expenseAccountCode: '622999/其他費用-其他',
      accountOrgCode: '101000-經營企劃部(停用)',
      itemDescription: '10306-6/16主管會議餐點',
      detailType: '不扣抵憑證',
      invoiceReceiptNumber: '',
      date: '2014/6/16',
      preTaxAmount: 935,
      tax: 0,
      totalAmount: 935,
    },
  ];

  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'pettyCashNumber', header: '零用金單號', visible: true },
    { field: 'applyDate', header: '申請日期', visible: true },
    { field: 'applicant', header: '零用金申請人', visible: true },
    { field: 'applicantOrg', header: '申請人組織', visible: true },
    { field: 'custodian', header: '零用金保管人', visible: true },
    { field: 'status', header: '狀態', visible: true },
    { field: 'expenseAccountCode', header: '費用會計科目', visible: true },
    { field: 'accountOrgCode', header: '費用科目組織', visible: true },
    { field: 'itemDescription', header: '項目摘要', visible: true },
    { field: 'detailType', header: '明細類別', visible: true },
    { field: 'invoiceReceiptNumber', header: '發票/收據號碼', visible: true },
    { field: 'date', header: '日期', visible: true },
    { field: 'preTaxAmount', header: '未稅金額', visible: true },
    { field: 'tax', header: '稅額', visible: true },
    { field: 'totalAmount', header: '總額', visible: true }
  ];





  vendorOptions: any[] = [];
  counterCodeOptions: any[] = [];
  violationCategoryOptions: any[] = [];
  floorOptions: any[] = [];

  deductionItemOptions: any[] = [];
  organizationNumberOptions: any[] = [];
  Pettycashapplicant: any[] = [];


  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private authService: AuthService,
    private IfdisplayService: IfdisplayService,
    private vendorService: VendorService,
    private userCodeService: UserCodeService,
    private counterCodeService: CounterCodeService,  // 專櫃編號 service
    private violationCategoryService: ViolationCategoryService,  // 違規類別編號 service
    private floorService: FloorService,  // 樓層 service
    private deductionItemService: DeductionItemService,  // 扣款項目 service
    private OrganizationNumberService: OrganizationNumberService
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.ProgNo = '170008';
    // Initialize dropdown options
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    this.IfdisplayService.getOptions().subscribe(
      (data) => (this.displayOptions = data)
    );
    this.IfdisplayService.getOptions().subscribe(
      (data) => (this.displayOptions2 = data)
    );
    this.vendorService.getVendors().subscribe((data) => {
      this.vendorOptions = data;
    });
    this.userCodeService
      .getUserCode()
      .subscribe((data) => (this.usercode = data));
    this.userCodeService
      .getUserCode()
      .subscribe((data) => (this.Pettycashapplicant = data));
    this.counterCodeService.getCounterCodes().subscribe((data) => {
      this.counterCodeOptions = data;
    });

    this.violationCategoryService.getViolationCategories().subscribe((data) => {
      this.violationCategoryOptions = data;
    });

    this.floorService.getFloors().subscribe((data) => {
      this.floorOptions = data;
    });



    this.deductionItemService.getDeductionItems().subscribe((data) => {
      this.deductionItemOptions = data;
    });
    this.OrganizationNumberService.getOrganizationNumbers().subscribe((data) => {
      this.organizationNumberOptions = data;
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
      this.router.navigate(['/demo/demoInputTableCRU'], extras);
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
    this.router.navigate(['/demo/demoInputTableCRU'], extras);
  }
  onClearForm() {
    this.queryForm.reset(); // 重置表單
  }
}
