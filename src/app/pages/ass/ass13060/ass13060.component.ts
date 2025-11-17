import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
import { UserCodeService } from '../../../service/basic/user-code.service';
import { OrganizationNumberService } from '../../../service/basic/organization-number.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
//

//3.1.3.6  固定資產重估作業
@Component({
  selector: 'app-ass13060',
  templateUrl: './ass13060.component.html',
  styleUrl: './ass13060.component.scss',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputNumberComponent, DropdownComponent, CalendarRangeComponent, MultiSelectComponent, TableComponent, TranslateModule]
})
export class ASS13060Component extends BasicQpageComponent implements OnInit {
  //
  queryForm = this.formBuilder.group({
    requestCode: [], // 申請編號
    managementCode: [], // 商品管理編號
    userCode: [], // 申請人員編號
    organizationNumber: [], // 部門代號
    applicationDateFrom: [], // 申請日期
    applicationDateTo: [], // 申請日期
    requestStatus: [[] as number[]], // 申請單狀態
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
    { field: 'col1', header: '固資重估單編號', visible: true },
    { field: 'col2', header: '申請人員編號', visible: true },
    { field: 'col3', header: '部門代號', visible: true },
    { field: 'col4', header: '狀態', visible: true },
    { field: 'col5', header: '申請日期', visible: true },
    { field: 'col6', header: '說明', visible: true },

    // { field: 'col7', header: '原保管(保管人)', visible: true },
    // { field: 'col8', header: '原保管(使用單位	)', visible: true },
    // { field: 'col9', header: '原保管(使用人)', visible: true },

    // { field: 'col10', header: '新保管(保管單位)', visible: true },
    // { field: 'col11', header: '新保管(保管人)', visible: true },
    // { field: 'col12', header: '新保管(使用單位)', visible: true },
    // { field: 'col13', header: '新保管(使用人)', visible: true },

    // { field: 'col14', header: '資產狀態', visible: true },
    // { field: 'col15', header: '原始取得金額', visible: true },
    // { field: 'col16', header: '備註', visible: true },

    // { field: 'col17', header: '報廢日期前之帳面價值', visible: true },
    // { field: 'col18', header: '報廢損失', visible: true },

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
  userCodeOptions: any[] = [];
  organizationNumberOptions: any[] = [];
  requestStatusOptions: any[] = [
    { value: 1, label: '已審核' },
    { value: 2, label: '已申請' },
  ];
  //
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    //
    private userCodeService: UserCodeService,
    private organizationNumberService: OrganizationNumberService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '310021';
    this.cruPage = '/ASS1000/ASS13060CRU';
    //

    //
    this.userCodeService.getUserCode().subscribe(data => {
      this.userCodeOptions = data;
    });
    //
    this.organizationNumberService.getOrganizationNumbers().subscribe(data => {
      this.organizationNumberOptions = data;
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
