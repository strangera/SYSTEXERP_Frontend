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

//1.1.6.4 銷項二聯式收銀機發票明細表 
@Component({
  selector: 'app-fin16040',
  templateUrl: './fin16040.component.html',
  styleUrl: './fin16040.component.scss'
})
export class FIN16040Component extends BasicQpageComponent implements OnInit{
  //
  queryForm = this.formBuilder.group({
    declareYm: [,[Validators.required]], // 申報年月
    salesDate: [,[Validators.required]], // 銷售日期
    taxNumber: [,[Validators.required]], // 稅籍編號
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
    { field: 'col1', header: '收銀機編號', visible: true },
    { field: 'col2', header: '申報年月', visible: true },
    { field: 'col3', header: '發票年月', visible: true },
    { field: 'col4', header: '發票日期', visible: true },
    { field: 'col5', header: '字軌', visible: true },
    { field: 'col6', header: '發票號碼(起)', visible: true },
    { field: 'col7', header: '發票號碼(迄)', visible: true },
    { field: 'col8', header: '統一編號', visible: true },
    { field: 'col9', header: '發票張數', visible: true },
    { field: 'col10', header: '應稅總金額', visible: true },
    { field: 'col11', header: '稅額', visible: true },
    { field: 'col12', header: '免稅銷售額', visible: true },
    { field: 'col13', header: '零稅率銷售額', visible: true },
    { field: 'col14', header: '狀態碼', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  taxNumberOptions:any[]=[
    { value: 1, label: '701702007' },
    { value: 2, label: '703902223' },
  ];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    //
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '110034';
    this.cruPage = '/FIN1000/FIN16040CRU';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //

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
