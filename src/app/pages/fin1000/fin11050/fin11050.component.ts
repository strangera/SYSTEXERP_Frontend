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
import { QueryConditionService } from './../../../service/basic/query-condition.service';

@Component({
  selector: 'app-fin11050',
  templateUrl: './fin11050.component.html',
  styleUrl: './fin11050.component.scss'
})

//1.1.1.5 二聯式電子發票上送狀況表
export class FIN11050Component extends BasicQpageComponent implements OnInit{
  //
  queryForm = this.formBuilder.group({
    salesStartdate: [, [Validators.required]], // 銷售日期
    salesEnddate: [, [Validators.required]], // 銷售日期
    imgStartdate: [], // 產檔日期
    imgEnddate: [], // 產檔日期
    startserialInvoice: [, [this.validationService.numberValidator, Validators.maxLength(10)]], // 發票號碼(含字軌)
    endserialInvoice: [, [this.validationService.numberValidator, Validators.maxLength(10)]], // 發票號碼(含字軌)
    startserialRegister: [, [this.validationService.numberValidator, Validators.maxLength(6)]], // 收銀機代號
    endserialRegister: [, [this.validationService.numberValidator, Validators.maxLength(6)]], // 收銀機代號
    queryCondition: [[] as number[]], // 查詢條件依據
    errorCheck: [1, []], // 是否只顯示異常
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
    { field: 'col1', header: '交易日', visible: true },
    { field: 'col2', header: '發票日期', visible: true },
    { field: 'col3', header: '上傳日期', visible: true },
    { field: 'col4', header: '一般交易(正常)', visible: true },
    { field: 'col5', header: '作廢交易(正常)', visible: true },
    { field: 'col6', header: '發票註銷(正常)', visible: true },
    { field: 'col7', header: '跨期折讓(正常)', visible: true },
    { field: 'col8', header: '一般交易(異常)', visible: true },
    { field: 'col9', header: '作廢交易(異常)', visible: true },
    { field: 'col10', header: '發票註銷(異常)', visible: true },
    { field: 'col11', header: '跨期折讓(異常)', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  queryOptions:any[]=[];
  whetherOptions:any[]=[];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    //
    private queryConditionService: QueryConditionService,
    private whetherService: WhetherService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '110005';
    this.cruPage = '/FIN1000/FIN11050CRU';
    //
    // ----------------------------------------------------------------
    this.queryConditionService.getQueryConditions().subscribe(data => {
      this.queryOptions = data;
      // 全選填入
      // let allSystemValues = this.queryOptions.map(system => system.value);
      // this.queryForm.patchValue({
      //   queryCondition: allSystemValues
      // });
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
