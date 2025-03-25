import { NeedPayTicketService } from './../../../service/basic/need-pay-ticket.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/service/notification.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
//

//3.1.1.9 資材中分類會計科目維護作業
@Component({
  selector: 'app-ass11090',
  templateUrl: './ass11090.component.html',
  styleUrl: './ass11090.component.scss'
})
export class ASS11090Component extends BasicQpageComponent implements OnInit{
  //
  queryForm = this.formBuilder.group({
    bigCategoryCode: [], // 大分類代碼
    bigCategoryName: ['', [Validators.maxLength(32)]], // 大分類名稱
    midCategoryCode: [], // 中分類代碼
    midCategoryName: ['', [Validators.maxLength(32)]], // 中分類名稱
    //
    accounting_Borrow: [], // 所屬會計科目(借)
    accountName_accBorrow: ['', [Validators.maxLength(40)]], // 會計科目名稱_所屬會計科目(借)
    accounting_Credit: [], // 所屬會計科目(貸)
    accountName_accCredit: ['', [Validators.maxLength(40)]], // 會計科目名稱_所屬會計科目(貸)
    tax_Borrow: [], // 進項稅額科目(借)
    accountName_taxBorrow: ['', [Validators.maxLength(40)]], // 會計科目名稱_進項稅額科目(借)
    //
    cost: [], // 費用科目
    accountName_cost: ['', [Validators.maxLength(40)]], // 會計科目名稱_費用科目
    depreciation: [, [Validators.maxLength(8)]], // 折舊科目(借)
    accountName_depreciation: ['', [Validators.maxLength(40)]], //  會計科目名稱_折舊科目(借)
    totalDepreciation: [, [Validators.maxLength(8)]], // 累計折舊科目(貸)
    accountName_totalDepreciation: ['', [Validators.maxLength(40)]], // 會計科目名稱_累計折舊科目(貸)
    //
    depreciationLife: [, [Validators.maxLength(2)]], // 折舊年限
    //
    remark: [, ], // 說明
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
    { 'bigCategoryCode': 'A', 'bigCategoryName': '裝潢工程', 'midCategoryCode': 23, 'midCategoryName': '室內裝潢工程',
      'accounting_Borrow': '裝潢設備', 'accounting_Credit': '應負費用-固資', 'tax_Borrow': '進項稅額-固資及費用', 'cost': '-',
      'depreciation': '折舊-裝潢設備', 'totalDepreciation': '累計折舊-裝潢設備', 'depreciationLife': 5, 'remark': '',
    },
    // { 'name': 'Michael', 'age': 31, 'email': 'michael@example.com', 'city': 'Taipei' },
    // { 'name': 'Sarah', 'age': 24, 'email': 'sarah@example.com', 'city': 'Tainan' },
    // 其他資料
  ];
  columns: any[]= [
    { field: 'bigCategoryCode', header: '大分類代碼', visible: true },
    { field: 'bigCategoryName', header: '大分類名稱', visible: true },
    { field: 'midCategoryCode', header: '中分類代碼', visible: true },
    { field: 'midCategoryName', header: '中分類名稱', visible: true },

    { field: 'accounting_Borrow', header: '所屬會計科目(借)', visible: true },
    { field: 'accounting_Credit', header: '所屬會計科目(貸)', visible: true },
    { field: 'tax_Borrow', header: '進項稅額科目(借)', visible: true },
    { field: 'cost', header: '費用科目', visible: true },
    { field: 'depreciation', header: '折舊科目(借)', visible: true },
    { field: 'totalDepreciation', header: '累計折舊科目(貸)', visible: true },
    { field: 'depreciationLife', header: '折舊年限', visible: true },
    { field: 'remark', header: '說明', visible: true },

    // { field: 'col13', header: '公司地址', visible: true },
    // { field: 'col14', header: '付款方式', visible: true },
    // { field: 'col15', header: '營運模式', visible: true },
    // { field: 'col16', header: '票期', visible: true },
    // { field: 'col17', header: '備註', visible: true },
    // { field: 'col18', header: '訂貨傳真', visible: true },

    // { field: 'col19', header: '工廠地址', visible: true },
    // { field: 'col20', header: '工廠電話', visible: true },
    // { field: 'col21', header: '工廠傳真', visible: true },

    // { field: 'col22', header: '送貨方式', visible: true },
    // { field: 'col23', header: '退貨處理方式', visible: true },
    // { field: 'col24', header: '廠商送貨期限', visible: true },

    // { field: 'col25', header: '附註', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  //
  bigCategoryCodeOptions: any[]=[
    { value: 1, label: 'A/裝潢工程' },
    { value: 2, label: 'B/其他工程' },
    { value: 3, label: 'C/電腦及電子零件產品' },
    { value: 4, label: 'D/電力及照明系統' },
    { value: 5, label: 'E/家電家具設備' },
    { value: 6, label: 'F/機消空電水零配件' },
    { value: 7, label: 'G/辦公及營運庶務' },
    { value: 8, label: 'K/印刷品(非廣告行銷)' },
  ];
  //
  midCategoryCodeOptions: any[]=[
    { value: 23, label: '室內裝潢工程' },
    { value: 24, label: '室內裝潢備品' },
    { value: 21, label: '弱電系統' },
    { value: 22, label: '房屋和建築設備' },
    { value: 23, label: '停車場設備' },
    { value: 24, label: '其他工程' },
    { value: 25, label: '機電消防工程' },
    { value: 22, label: '電子產品及零件' },
  ];

  accounting_Borrow_Options: any[]=[
    { value: 1, label: '150101/土地' },
    { value: 2, label: '151101/房屋' },
    { value: 3, label: '151201/累積折舊_房屋' },
    { value: 4, label: '152101/裝潢設備' },
    { value: 5, label: '152201/累積折舊_裝潢設備' },
    { value: 6, label: '153101/運輸設備' },
  ];

  accounting_Credit_Options: any[]=[
    { value: 1, label: '213101/應負帳款_專櫃' },
    { value: 2, label: '213102/應負帳款_自營' },
    { value: 3, label: '213103/應負帳款_固資及費用' },
    { value: 4, label: '213104/應負帳款_EC專櫃' },
    { value: 5, label: '213105/應負帳款_品牌' },
  ];

  tax_Borrow_Options: any[]=[
    { value: 1, label: '123201/進項稅額_專櫃' },
    { value: 2, label: '213102/進項稅額_自營' },
    { value: 3, label: '213103/進項稅額_固資及費用' },
    { value: 4, label: '213104/進項稅額_EC' },
    { value: 5, label: '213105/進項稅額_品牌' },
  ];

  costOptions: any[]=[];
  
  //
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    //
    private needPayTicketService: NeedPayTicketService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '310009';
    this.cruPage = '/ASS1000/ASS11090CRU';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    this.needPayTicketService.getNeedPayTickets().subscribe(data => {
      this.costOptions = data;
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
