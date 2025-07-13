import { UserStatusService } from './../../../service/basic/user-status.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
import { OrganizationNumberService } from '../../../service/basic/organization-number.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { EditorTextComponent } from '../../../shared/componentkit/editor-text/editor-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
//

//5.2.1.3  活動場地資料維護
@Component({
    selector: 'app-cpm21030',
    templateUrl: './cpm21030.component.html',
    styleUrl: './cpm21030.component.scss',
    standalone: true,
    imports: [MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, DropdownComponent, InputTextComponent, InputNumberComponent, MultiSelectComponent, EditorTextComponent, TableComponent, TranslateModule]
})
export class CPM21030Component extends BasicQpageComponent implements OnInit {
  //
  queryForm = this.formBuilder.group({
    filedCode: [], // 場地代號
    filedName: ['', [Validators.maxLength(60)]], // 場地名稱
    area: [], // 區域
    //
    organizationNumber: [], // 管理部門
    square: [], // 面積(坪)
    sitNumber: [], // 座位數量
    //
    capacity: [], // 可容納人數
    fieldStatus: [[] as number[]], // 場地狀況
    remark: [,], // 備註
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
    { field: 'col1', header: '場地代號', visible: true },
    { field: 'col2', header: '場地名稱', visible: true },
    // { field: 'col3', header: '區域', visible: true },
    // { field: 'col4', header: '管理部門', visible: true },
    { field: 'col5', header: '面積(坪)', visible: true },
    { field: 'col6', header: '座位數量', visible: true },

    { field: 'col7', header: '可容納人數', visible: true },
    { field: 'col8', header: '場地狀況', visible: true },
    { field: 'col9', header: '備註', visible: true },
    // { field: 'col10', header: '負責人電話', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  //
  filedCodeOptions: any[] = [
    { value: 1, label: 'B00000001/星巴克' },
    { value: 2, label: 'B00000001/廣場' },
  ];
  areaOptions: any[] = [
    { value: 1, label: 'A/1F' },
    { value: 2, label: 'B/2F' },
  ];
  organizationNumberOptions: any[] = [];
  fieldStatusOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    //
    private organizationNumberService: OrganizationNumberService,
    private userStatusService: UserStatusService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '520003';
    this.cruPage = '/CPM2000/CPM21030CRU';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    this.organizationNumberService.getOrganizationNumbers().subscribe((data) => {
      this.organizationNumberOptions = data;
    });
    //
    this.userStatusService.getUserStatus().subscribe((data) => {
      this.fieldStatusOptions = data;
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
