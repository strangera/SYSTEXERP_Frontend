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
import { WhetherService } from './../../../service/basic/whether.service';
import { AllInvoiceCategoryService } from './../../../service/basic/all-invoice-category.service';

//1.1.1.2 發票基本資料維護
@Component({
  selector: 'app-fin11020',
  templateUrl: './fin11020.component.html',
  styleUrl: './fin11020.component.scss'
})
export class FIN11020Component extends BasicQpageComponent implements OnInit{
  //
  queryForm = this.formBuilder.group({
    onedatemm: [, [Validators.required]], // 發票年月
    track: ['', [Validators.maxLength(2)]], // 字軌
    startserialticket: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 發票號碼(起)
    endserialticket: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 發票號碼(迄)
    invoiceCategory: [], // 發票類別
    viceTicket: [], // 有無副聯
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
    // 其他資料
  ];
  columns: any[]= [
    { field: 'col1', header: '發票年月', visible: true },
    { field: 'col2', header: '字軌', visible: true },
    { field: 'col3', header: '發票號碼(起)', visible: true },
    { field: 'col4', header: '發票號碼(迄)', visible: true },
    { field: 'col5', header: '發票類別', visible: true },
    { field: 'col6', header: '有無副聯', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  invoiceCategoryOptions: any[] = [];
  whetherOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    //
    private allInvoiceCategoryService: AllInvoiceCategoryService,
    private whetherService: WhetherService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '110002';
    this.cruPage = '/FIN1000/FIN11020CRU';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    this.allInvoiceCategoryService.getAllInvoiceCategorys().subscribe(data => {
      this.invoiceCategoryOptions = data;
    });
    //
    this.whetherService.getWhetherOptions().subscribe(data => {
      this.whetherOptions = data;
    });
    // ----------------------------------------------------------------

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
  onClearForm() {
    this.queryForm.reset();  // 重置表單
  }

}
