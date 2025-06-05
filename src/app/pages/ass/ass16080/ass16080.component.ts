import { UserCodeService } from './../../../service/basic/user-code.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Services

// Shared
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
import { BigCategoryService } from '../../../service/basic/big-category.service';
import { MidCategoryService } from '../../../service/basic/mid-category.service';
import { SmallCategoryService } from '../../../service/basic/small-category.service';
import { OrganizationNumberService } from '../../../service/basic/organization-number.service';

@Component({
  selector: 'app-ass16080',
  templateUrl: './ass16080.component.html',
  styleUrl: './ass16080.component.scss'
})
export class ASS16080Component extends BasicQpageComponent implements OnInit {
  queryForm = this.formBuilder.group({
    bigCategoryCode: [],
    midCategoryCode: [],
    smallCategoryCode: [],
    Querybystatus: [],
    propertynumber: [],
    propertytype: [],
    Itemnumber: [],
    Accountcode: [],
    custodyunit: [],
    SApplicationdate: [],
    EApplicationdate: [],
    SReviewdate: [],
    EReviewdate: [],
    basedate: [],
    Inventoryordernumber: [],
    Inventorystatus: [],
    SInventorydate: [],
    EInventorydate: [],
    SClosingdate: [],
    EClosingdate: [],
    Counter: [],
    illustrate: [],
    Reporttype: [],
    Receiptnumber: [],
    Applicantcode: [],
    reviewer: [],
    Shippingdate: [],
    Kurabe: [],
    status: [],
    Departmentcode: [],

  });
  // Table data
  data: any[] = [];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'transferNote', header: '調撥單號', visible: true },
    { field: 'applicantCode', header: '申請人代號', visible: true },
    { field: 'departmentCode', header: '部門代號', visible: true },
    { field: 'applicationDate', header: '申請日期', visible: true },
    { field: 'outWarehouse', header: '調出倉別', visible: true },
    { field: 'outDate', header: '撥出日期', visible: true },
    { field: 'inWarehouse', header: '調入倉別', visible: true },
    { field: 'inDate', header: '撥入日期', visible: true },
    { field: 'transferStatus', header: '調撥狀態', visible: true },
    { field: 'detailCount', header: '明細筆數', visible: true },
  ];





  // Dropdown options
  Reporttype: any[] = [{ value: 1, label: '全部' },
  { value: 2, label: '差異' },];
  Departmentcode: any[] = [];
  Kurabe: any[] = [
    { value: 1, label: '001' },
    { value: 2, label: '002' },


  ];
  Itemnumber
    : any[] = [

      { value: 1, label: '3A24210000001' },
      { value: 2, label: '3A24210000002' },
      { value: 3, label: '3A24210000003' },
      { value: 4, label: '3A24210000004' },
      { value: 5, label: '3A24210000005' },
      { value: 6, label: '3A24210000006' },
      { value: 7, label: '3A24210000007' },
      { value: 8, label: '3A24210000008' },
      { value: 9, label: '3A24210000009' },
      { value: 10, label: '3A24210000010' },
    ];
  Inventorystatus: any[] = [
    { value: 1, label: '盤點中' },
    { value: 2, label: '登錄完成' },
    { value: 3, label: '已結案' },

  ];
  Inventoryordenumber: any[] = [
    { value: 1, label: '202406002' },

  ];
  custodyunit: any[] = [
    { value: 1, label: '101000' },
    { value: 2, label: '102000' },
    { value: 3, label: '103000' },
    { value: 4, label: '104000' },
    { value: 5, label: '105000' },
    { value: 6, label: '106000' },
    { value: 7, label: '107000' },
    { value: 8, label: '108000' },
    { value: 9, label: '109000' },
    { value: 10, label: '10A000' },
  ];
  Accountcode: any[] = [
    { value: 1, label: '1501' },
    { value: 2, label: '150101' },
    { value: 3, label: '1511' },
    { value: 4, label: '151101' },
    { value: 5, label: '1512' },
    { value: 6, label: '151201' },
    { value: 7, label: '1521' },
    { value: 8, label: '152101' },
    { value: 9, label: '1522' },
    { value: 10, label: '152201' },
  ];
  reviewer: any[] = [];
  usercode: any[] = [];
  bigCategoryOptions: any[] = [
    { value: 1, label: '裝潢工程' },
    { value: 2, label: '其他工程' },
    { value: 3, label: '電腦及電子零件產品' },
    { value: 4, label: '電力及照明系統' },
    { value: 5, label: '家電家俱設備' },
    { value: 6, label: '機消空電水零配件' },
    { value: 7, label: '辦公及營運庶務' },
    { value: 8, label: '印刷品(非廣告行銷)' },
    { value: 9, label: '印刷品(廣告行銷)' },
    { value: 10, label: '衛生及醫療庶務用品' },
  ];
  midCategoryOptions: any[] = [
    { value: 1, label: '室內裝潢工程' },
    { value: 2, label: '室內裝潢備品' },
    { value: 3, label: '弱電系統' },
    { value: 4, label: '房屋及建築設備' },
    { value: 5, label: '停車場設備' },
    { value: 6, label: '其他工程' },
    { value: 7, label: '機電消防工程' },
    { value: 8, label: '電子產品及零件' },
    { value: 9, label: '電子儀器設備' },
    { value: 10, label: '電子儀器設備-資產' },
  ];
  smallCategoryOptions: any[] = [
    { value: 1, label: '機電空調工程' },
    { value: 2, label: '水電消防工程' },
    { value: 3, label: '排油煙工程' },
    { value: 4, label: '商場高壓電節能工程' },
    { value: 5, label: '商場弱電系統工程' },
    { value: 6, label: '網路佈線工程' },
    { value: 7, label: '鐵路自動測試儀' },
    { value: 8, label: '風車零件' },
    { value: 9, label: '資收場回收用品' },
    { value: 10, label: '瓦斯鍋及滅斷設備工程' },
  ];
  Querybystatus: any[] = [
    { value: 1, label: '移轉' },
    { value: 2, label: '報廢除帳' },
    { value: 3, label: '變賣除帳' },
    { value: 4, label: '新購' },
  ];
  assetCodeOptions: any[] = [
    { value: 1, label: '1A232300000010000001' },
    { value: 2, label: '1A232300000020000001' },
    { value: 3, label: '1A232300000040000001' },
    { value: 4, label: '1A232300000050000001' },
    { value: 5, label: '1A232300000060000001' },
    { value: 6, label: '1A232300000090000001' },
    { value: 7, label: '1A232400000010000001' },
    { value: 8, label: '1A232400000040000001' },
    { value: 9, label: '1A232400000060000001' },
  ];
  propertytype: any[] = [
    { value: 1, label: '資產' },
    { value: 2, label: '列管品' },
  ];
  status
    : any[] = [
      { value: 1, label: '已申請' },
      { value: 2, label: '已審核' },
      { value: 3, label: '已調撥' },

    ];


  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private authService: AuthService,
    private bigCategoryService: BigCategoryService,
    private midCategoryService: MidCategoryService,
    private smallCategoryService: SmallCategoryService,
    private userCodeService: UserCodeService,
    private organizationNumberService: OrganizationNumberService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.ProgNo = '310047';
    // Initialize dropdown options
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    // this.bigCategoryService
    //   .getCategories()
    //   .subscribe((data) => (this.bigCategoryOptions = data));
    // this.midCategoryService
    //   .getSubCategories()
    //   .subscribe((data) => (this.midCategoryOptions = data));
    // this.smallCategoryService
    //   .getSmallCategories()
    //   .subscribe((data) => (this.smallCategoryOptions = data));

    this.userCodeService.getUserCode()
      .subscribe((data) => (this.reviewer = data));
    this.userCodeService.getUserCode()
      .subscribe((data) => (this.usercode = data));
    this.organizationNumberService.getOrganizationNumbers()
      .subscribe((data) => (this.Departmentcode = data));
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
