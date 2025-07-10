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

@Component({
  selector: 'app-ass15060',
  templateUrl: './ass15060.component.html',
  styleUrl: './ass15060.component.scss',
})
export class ASS15060Component extends BasicQpageComponent implements OnInit {
  queryForm = this.formBuilder.group({
    bigCategoryCode: [],
    midCategoryCode: [],
    smallCategoryCode: [],
    Querybystatus: [],
    propertynumber: [],
    propertytype: [],
    Itemnumber: [],
  });
  // Table data
  data: any[] = [];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'assetNumber', header: '財產編號', visible: true },
    { field: 'majorCategory', header: '大分類', visible: true },
    { field: 'middleCategory', header: '中分類', visible: true },
    { field: 'smallCategory', header: '小分類', visible: true },
    { field: 'assetType', header: '財產類型', visible: true },
    { field: 'managementUnit', header: '保管單位', visible: true },
    { field: 'custodian', header: '保管人', visible: true },
    { field: 'status', header: '狀態', visible: true },
    { field: 'initiator', header: '異動者', visible: true },
    { field: 'changeTime', header: '異動時間', visible: true },
  ];


  // Dropdown options

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
  propertytype
    : any[] = [
      { value: 1, label: '資產' },
      { value: 2, label: '列管品' },
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



  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private authService: AuthService,
    private bigCategoryService: BigCategoryService,
    private midCategoryService: MidCategoryService,
    private smallCategoryService: SmallCategoryService
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.ProgNo = '310037';
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
