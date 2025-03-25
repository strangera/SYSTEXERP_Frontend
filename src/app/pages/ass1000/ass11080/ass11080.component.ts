import { NeedPayTicketService } from './../../../service/basic/need-pay-ticket.service';
import { WhetherService } from './../../../service/basic/whether.service';
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

//3.1.1.8 處分資產基本設定 
@Component({
  selector: 'app-ass11080',
  templateUrl: './ass11080.component.html',
  styleUrl: './ass11080.component.scss'
})
export class ASS11080Component extends BasicQpageComponent implements OnInit{
  //
  queryForm = this.formBuilder.group({
    active_SellofSummons: [], // 變賣傳票是否啟用
    active_ScrappedSummons: [], // 變賣傳票是否啟用
    // 資產報廢 會計科目設定
    assetsALoss: [,[Validators.required]], // 處分資產損失
    // 資產變賣 會計科目設定
    receiveAccount: [,[Validators.required]], // 應收帳款
    assetsCLoss: [,[Validators.required]], // 處分資產損失
    assetsCIncome: [,[Validators.required]], // 處分資產收入
    // 耗材報廢 會計科目設定
    consumables_Scrapped: [,[Validators.required]], // 耗材報廢會科
    // 耗材盤點 會計科目設定
    consumables_Income: [,[Validators.required]], // 耗材盤盈會科
    consumables_Loss: [,[Validators.required]], // 耗材盤損會科
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
    // { 'name': 'Emily', 'age': 28, 'email': 'emily@example.com', 'city': 'Kaohsiung' },
    // { 'name': 'Michael', 'age': 31, 'email': 'michael@example.com', 'city': 'Taipei' },
    // { 'name': 'Sarah', 'age': 24, 'email': 'sarah@example.com', 'city': 'Tainan' },
    // 其他資料
  ];
  columns: any[]= [
    { field: 'col1', header: '建檔日期', visible: true },
    { field: 'col2', header: '接洽人員', visible: true },
    { field: 'col3', header: '廠商統一編號', visible: true },
    { field: 'col4', header: '廠商名稱', visible: true },
    { field: 'col5', header: '廠商名稱(英文)', visible: true },

    { field: 'col6', header: '聯絡人', visible: true },
    { field: 'col7', header: '聯絡人職稱', visible: true },
    { field: 'col8', header: '聯絡人電話(O)', visible: true },
    { field: 'col9', header: '聯絡人行動電話', visible: true },
    { field: 'col10', header: '聯絡人電子郵件', visible: true },
    { field: 'col11', header: '聯絡人傳真', visible: true },

    { field: 'col12', header: '公司負責人', visible: true },
    { field: 'col13', header: '公司地址', visible: true },

    { field: 'col14', header: '付款方式', visible: true },
    { field: 'col15', header: '營運模式', visible: true },

    { field: 'col16', header: '票期', visible: true },
    { field: 'col17', header: '備註', visible: true },
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
  WhetherOptions: any[] = [];
  payOptions: any[] = [];
  
  //
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    //
    private whetherService: WhetherService,
    private needPayTicketService: NeedPayTicketService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '310008';
    this.cruPage = '/ASS1000/ASS11080CRU';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    this.whetherService.getWhetherOptions().subscribe(data => {
      this.WhetherOptions = data;
    });
    //
    this.needPayTicketService.getNeedPayTickets().subscribe(data => {
      this.payOptions = data;
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
