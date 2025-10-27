import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { OrganizationNumberService } from '../../../service/basic/organization-number.service';
import { RoleCodeService } from '../../../service/basic/role-code.service';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';

const now = new Date();

@Component({
  selector: 'app-sys0620',
  templateUrl: './sys0620.component.html',
  styleUrl: './sys0620.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    CalendarRangeComponent,
    ButtonComponent,
    TableComponent,
    TranslateModule,
  ],
})
// 角色基本資料異動查詢
export class SYS0620Component extends BasicQpageComponent implements OnInit {
  // 查詢
  queryForm = this.formBuilder.group({
    roleCode: [], // 角色代號
    userCodeMod: [], // 異動使用者編號
    changeStartTime: [, [Validators.required]], // 變更時間起始 (日期範圍)
    changeEndTime: [, [Validators.required]], // 變更時間結束 (日期範圍)
  });

  // 表格
  data: any[] = [
  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'User_id', header: '使用者', visible: true },
    { field: 'Role_id', header: '角色', visible: true },
    { field: 'State', header: '狀態(新增/刪除/修改)', visible: true },
    { field: 'CRT_Date', header: '變更時間', visible: true },
    { field: 'CRT_User_id', header: '變更者', visible: true },
  ];
  // Options
  userCodeModOptions: any[] = [];
  roleCodeOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private organizationNumber: OrganizationNumberService,
    private roleCodeService: RoleCodeService
  ) {
    super();
  }

  ngOnInit(): void {
    this.ProgNo = '420008';
    // 初始化權限資訊
    this.organizationNumber.getOrganizationNumbers().subscribe((data) => {
      this.userCodeModOptions = data;
    });
    this.roleCodeService.getRoleCodes().subscribe((data) => {
      this.roleCodeOptions = data;
    });
  }

  onSubmit(frm: FormGroup) {
    this.submitted = true;
    this.loading = true;
    this.messageService.blockUi();

    if (frm.valid && this.canQuery()) {
      // 提交邏輯
    }

    this.loading = false;
    this.messageService.unblockUi();
  }

  onSubmitQuery(frm: FormGroup) {
    // 查詢邏輯
    this.onSubmit(frm);
  }

  onClearForm() {
    this.queryForm.reset(); // 重置表單
  }

  onCreate() {
    if (this.canAdd()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: CRUDStatus.Create,
          queryform: this.queryForm,
        },
        skipLocationChange: true,
      };
      this.router.navigate(['/demoCRU'], extras);
    }
  }

  onEdit(data: any) {
    if (this.canEdit()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: CRUDStatus.Edit,
          rowdata: data,
          queryform: this.queryForm,
        },
        skipLocationChange: true,
      };
      this.router.navigate(['/demoCRU'], extras);
    }
  }

  onDetail(data: any) {
    let extras: NavigationExtras = {
      state: {
        crudstatus: CRUDStatus.Read,
        rowdata: data,
        queryform: this.queryForm,
      },
      skipLocationChange: true,
    };
    this.router.navigate(['/demoCRU'], extras);
  }
}
