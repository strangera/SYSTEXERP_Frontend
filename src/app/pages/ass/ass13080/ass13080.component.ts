import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
import { ItemCodeService } from '../../../service/basic/item-code.service';
import { AssetStatusService } from '../../../service/basic/asset-status.service';
import { AssetsTypeService } from '../../../service/basic/assets-type.service';
import { NeedPayTicketService } from '../../../service/basic/need-pay-ticket.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
//

//3.1.3.8  資產變賣作業
@Component({
    selector: 'app-ass13080',
    templateUrl: './ass13080.component.html',
    styleUrl: './ass13080.component.scss',
    standalone: true,
    imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputNumberComponent, DropdownComponent, CalendarRangeComponent, MultiSelectComponent, InputNumberRangeComponent, CheckboxModule, ButtonComponent, TableComponent, TranslateModule]
})
export class ASS13080Component extends BasicQpageComponent implements OnInit {
  //
  queryForm = this.formBuilder.group({
    assetsCode: [, [Validators.maxLength(20)]], // 資產代號
    itemCode: [], // 	品項編號
    shareCode: [, [Validators.maxLength(20)]], // 攤提代號
    purchaseDateFrom: [], // 	購入日期
    purchaseDateTo: [], // 	購入日期
    assetStatus: [[] as number[]], // 資產狀態
    //
    keeper: [], // 保管人
    keeperUnit: [], // 保管單位
    user: [], // 使用人
    userUnit: [], // 使用單位
    //
    assetType: [[] as number[]], // 資產類型
    accountingCode: [], // 會計科目代號
    purchaseAmountFrom: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 購入金額
    purchaseAmountTo: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 購入金額
    orderNumber: [], // 驗收單號
    entryDateFrom: [], // 入帳日期
    entryDateTo: [], // 入帳日期
    outofLimit: [,], // 已達耐用年限
    displayNumber: [, [this.validationService.numberValidator, Validators.maxLength(160)]], // 	顯示筆數
  });
  // 下拉資料多個呈現
  // ----------------------------------------------------------------
  roles: any[] = [
    { id: 1, roleCode: 'ADMIN', roleName: 'Administrator' },
    { id: 2, roleCode: 'USER', roleName: 'User' },
    { id: 3, roleCode: 'GUEST', roleName: 'Guest' },
  ];
  // 表格
  // ----------------------------------------------------------------
  data: any[] = [
    {
      'assetsCode': '1A232300040001', 'itemCode': '1A232300040004/3F', 'entryDateFrom': '2014/12/31', 'assetStatus': '使用中',
      'keeper': '楊先生', 'user': '', 'purchaseAmountFrom': 56108772, 'shareCode': '1A232300040004001',
    },
    // { 'name': 'Michael', 'age': 31, 'email': 'michael@example.com', 'city': 'Taipei' },
    // { 'name': 'Sarah', 'age': 24, 'email': 'sarah@example.com', 'city': 'Tainan' },
    // 其他資料
  ];
  columns: any[] = [
    { field: 'assetsCode', header: '資產代號', visible: true },
    { field: 'itemCode', header: '品項編號', visible: true },
    { field: 'entryDateFrom', header: '入帳日期', visible: true },
    { field: 'assetStatus', header: '資產狀態', visible: true },

    { field: 'keeper', header: '保管人', visible: true },
    { field: 'user', header: '使用人', visible: true },
    { field: 'purchaseAmountFrom', header: '購入金額', visible: true },
    { field: 'shareCode', header: '攤提代號', visible: true },

    // 其他欄位
  ];
  // ----------------------------------------------------------------
  //
  itemCodeOptions: any[] = [];
  assetsStatusOptions: any[] = [];
  assetTypeOptions: any[] = [];
  accountingCodeOptions: any[] = [];
  orderNumberOptions: any[] = [
    { value: 1, label: '201410300001' },
    { value: 2, label: '201410300002' },
    { value: 3, label: '201410300003' },
  ];

  //
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    //
    private itemCodeService: ItemCodeService,
    private assetStatusService: AssetStatusService,
    private assetsTypeService: AssetsTypeService,
    private needPayTicketService: NeedPayTicketService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '310023';
    this.cruPage = '/ASS1000/ASS13080CRU';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    this.itemCodeService.getSystemTypes().subscribe(data => {
      this.itemCodeOptions = data;
    });
    //
    this.assetStatusService.getAssetStatus().subscribe(data => {
      this.assetsStatusOptions = data;
    });
    //
    this.assetStatusService.getAssetStatus().subscribe(data => {
      this.assetTypeOptions = data;
    });
    //
    this.needPayTicketService.getNeedPayTickets().subscribe(data => {
      this.accountingCodeOptions = data;
    });
    // ----------------------------------------------------------------
  }

  // ----------------------------------------------------------------
  onSubmit(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;
    this.messageService.blockUi();

    if (frm.valid && this.canQuery()) {
      // 提交邏輯
      // Service
      // this.xxxService.queryMachine(frm.value as xxxInterface)
      //  .subscribe((response: any) => {
      //    this.rows = response.xxx;
      // });
    }

    this.loading = false;
    this.messageService.unblockUi();
  }

  onSubmitQuery(frm: FormGroup) {
    // 查詢邏輯
    this.onSubmit(frm);
  }

  onClearForm() {
    this.queryForm.reset();  // 重置表單
  }
  // ----------------------------------------------------------------
  onCreate() {
    if (this.canAdd()) {
      this.navigateWithState(this.router, CRUDStatus.Create, null, this.cruPage);
    }
  }

  onEdit(data: any) {
    if (this.canEdit()) {
      this.navigateWithState(this.router, CRUDStatus.Edit, data, this.cruPage);
    }
  }

  onDetail(data: any) {
    this.navigateWithState(this.router, CRUDStatus.Read, data, this.cruPage);
  }
}
