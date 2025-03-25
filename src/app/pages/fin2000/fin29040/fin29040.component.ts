import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/service/notification.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
import { VendorService } from '../../../service/basic/vendor.service';
//

//1.2.9.4 AP及ARNET之報表
@Component({
  selector: 'app-fin29040',
  templateUrl: './fin29040.component.html',
  styleUrl: './fin29040.component.scss'
})
export class FIN29040Component extends BasicQpageComponent implements OnInit{
  //
  queryForm = this.formBuilder.group({
    startdate: [, [Validators.required]], // 查詢年月
    enddate: [, [Validators.required]], // 查詢年月
    showUp: [1, [Validators.required]], // 報表方式
    factoryID: [], // 廠客代號
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
    { field: 'col1', header: '廠客代號', visible: true },
    { field: 'col2', header: '廠客名稱', visible: true },
    { field: 'col3', header: '資料來源別', visible: true },
    { field: 'col4', header: '付款金額', visible: true },
    { field: 'col5', header: '應收/付ID', visible: true },
    { field: 'col6', header: '立帳日期', visible: true },
    { field: 'col7', header: '預計收/付款日，退保留款/貼現日', visible: true },
    { field: 'col8', header: '備註', visible: true },
    { field: 'col9', header: '會計科目', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  factoryIDOptions: any[] = [];
  showUpOptions: any[] = [
    { value: 1, label: '顯示全部' },
    { value: 2, label: '顯示負值' },
  ];
  statusOptions: any[] = [
    { value: 1, label: '作廢' },
    { value: 2, label: '未異動' },
    { value: 3, label: '到期' },
    { value: 4, label: '兌現' },
    { value: 5, label: '撤票' },
    { value: 6, label: '退票' },
  ];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    //
    private vendorService: VendorService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '120027';
    this.cruPage = '/FIN2000/FIN29040CRU';
    //
    // ----------------------------------------------------------------
    //
    this.vendorService.getVendors().subscribe(data => {
      this.factoryIDOptions = data;
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
