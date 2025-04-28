import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
//

//1.1.6.7 零稅率銷售額清單 
@Component({
  selector: 'app-fin16070',
  templateUrl: './fin16070.component.html',
  styleUrl: './fin16070.component.scss'
})
export class FIN16070Component extends BasicQpageComponent implements OnInit {
  //
  queryForm = this.formBuilder.group({
    declareYm: [, [Validators.required]], // 	申報年月
    taxNumber: [, [Validators.maxLength(5), Validators.required]], // 稅籍編號
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
  columns: any[] = [
    { field: 'col1', header: '開立發票(日期)', visible: true },
    { field: 'col2', header: '開立發票(字軌號碼)', visible: true },
    { field: 'col3', header: '買受人(名稱)', visible: true },
    { field: 'col4', header: '買受人(統一編號)', visible: true },
    { field: 'col5', header: '貨務或勞務(名稱)', visible: true },
    { field: 'col6', header: '貨務或勞務(數量)', visible: true },
    { field: 'col7', header: '外銷方式', visible: true },
    { field: 'col8', header: '證明文件(證明文件)', visible: true },
    { field: 'col9', header: '證明文件(號碼)', visible: true },
    { field: 'col10', header: '金額(元)', visible: true },
    { field: 'col11', header: '稅額', visible: true },
    { field: 'col12', header: '出口報單(類別)', visible: true },
    { field: 'col13', header: '出口報單(號碼)', visible: true },
    { field: 'col14', header: '金額(元)', visible: true },
    { field: 'col15', header: '輸期1關出(、日或外者)結銷應匯方填日式報', visible: true },
    { field: 'col16', header: '備註', visible: true },
    { field: 'col17', header: '審核結果', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  taxNumberOptions: any[] = [
    { value: 1, label: 701702007 },
    { value: 2, label: 703902223 },
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
    this.ProgNo = '110037';
    this.cruPage = '/FIN1000/FIN16070CRU';
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
