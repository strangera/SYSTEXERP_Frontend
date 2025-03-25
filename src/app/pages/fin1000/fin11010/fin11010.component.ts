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
import { AllpayCodeService } from './../../../service/basic/allpay-code.service';
import { WhetherService } from './../../../service/basic/whether.service';

//1.1.1.1 營業人申報設定
@Component({
  selector: 'app-fin11010',
  templateUrl: './fin11010.component.html',
  styleUrl: './fin11010.component.scss'
})
export class FIN11010Component extends BasicQpageComponent implements OnInit{
  //
  queryForm = this.formBuilder.group({
    bId: [, [Validators.maxLength(8)]], // 營業人統編
    bName: ['', [Validators.maxLength(60)]], // 營業人名稱
    bAddress: ['', [Validators.maxLength(100)]], // 營業地址
    allPayCode: [[] as number[]], // 總繳代號
    status: [[] as number[]], // 審核狀態
    startdate: [], // 申報年月起
    enddate: [], // 申報年月迄
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
    { field: 'col1', header: '營業人統編', visible: true },
    { field: 'col2', header: '營業人名稱', visible: true },
    { field: 'col3', header: '縣市別', visible: true },
    { field: 'col4', header: '營業地址', visible: true },
    { field: 'col5', header: '總繳代號', visible: true },
    { field: 'col6', header: '直接扣抵法(Y/N)', visible: true },
    { field: 'col7', header: '審核狀態', visible: true },
    { field: 'col8', header: '申報年月起', visible: true },
    { field: 'col9', header: '申報年月迄', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  payMethodOptions: any[] = [];
  whetherOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    //
    private allpayCodeService: AllpayCodeService,
    private whetherService: WhetherService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '110001';
    this.cruPage = '/FIN1000/FIN11010CRU';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    // ----------------------------------------------------------------
    this.whetherService.getWhetherOptions().subscribe(data => {
      this.whetherOptions = data;

      // 全選填入
      // let allValues = this.whetherOptions.map(system => system.value);
      // this.queryForm.patchValue({
      //   status: allValues
      // });
    });
    //
    this.allpayCodeService.getAllpayCodes().subscribe(data => {
      this.payMethodOptions = data;

      // 全選填入
      // let allValues = this.payMethodOptions.map(system => system.value);
      // this.queryForm.patchValue({
      //   allPayCode: allValues
      // });
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
  // 匯出申報資料
  onExportReporting() {

  }
}
