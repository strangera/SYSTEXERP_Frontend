import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
//

//5.1.1.2 客服設備資料維護作業
@Component({
  selector: 'app-cpm11020',
  templateUrl: './cpm11020.component.html',
  styleUrl: './cpm11020.component.scss',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, DropdownComponent, InputTextComponent, TableComponent, TranslateModule]
})
export class CPM11020Component extends BasicQpageComponent implements OnInit {
  //
  queryForm = this.formBuilder.group({
    equipmentCode: [], // 設備代號
    equipmentName: ['', [Validators.maxLength(60)]], // 設備名稱
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
    { isdelete: false, 'equipmentCode': '01', 'equipmentName': '輕便娃娃車', 'equipmentNumber': 60 },
    { isdelete: false, 'equipmentCode': '02', 'equipmentName': '愛心輪椅', 'equipmentNumber': 3 },
    { isdelete: false, 'equipmentCode': 'A0001', 'equipmentName': '測試', 'equipmentNumber': 1 },
    { isdelete: true, 'equipmentCode': '', 'equipmentName': '', 'equipmentNumber': 0 },
    // 其他資料
  ];
  columns: any[] = [
    { field: 'equipmentCode', header: '設備代號', visible: true },
    { field: 'equipmentName', header: '設備名稱', visible: true },
    { field: 'equipmentNumber', header: '設備數量', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  equipmentCodeOptions: any[] = [
    { value: 1, label: '奇哥Joie輕便娃娃車' },
    { value: 2, label: '愛心輪椅' },
  ]

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
    this.ProgNo = '510002';
    this.cruPage = '/CPM1000/CPM11020CRU';
    //

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
