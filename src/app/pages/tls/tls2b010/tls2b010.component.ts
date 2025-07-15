import { CashShowupByService } from './../../../service/basic/cash-showup-by.service';
import { ReimbursementYypeService } from './../../../service/basic/reimbursement-yype.service';
import { CahserTypeService } from './../../../service/basic/cahser-type.service';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Permissions
import { FunsrightInfo, PermissionsInfo } from '../../../shared/models/system/funsrightInfo';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';

import { ValidationService } from '../../../shared/service/validation.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';

// 2.2.11.1 收銀員溢欠表(日)
@Component({
    selector: 'app-tls2b010',
    templateUrl: './tls2b010.component.html',
    styleUrl: './tls2b010.component.scss',
    standalone: true,
    imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarComponent, InputNumberRangeComponent, DropdownComponent, MultiSelectComponent, RadiobuttonComponent, ButtonComponent, TableComponent, TranslateModule]
})
export class TLS2B010Component {
  ProgNo: string = '220055';
  // 權限
  funInfo?: FunsrightInfo;

  // 查詢
  // ----------------------------------------------------------------
  loading: boolean = false;
  submitted: boolean = false;
  queryForm = this.formBuilder.group({
    onedatedd: [, [Validators.required]], // 銷售日期
    cahserStart: [, [Validators.max(999999), this.validationService.numberValidator]], // 收銀機號
    cahserEnd: [, [Validators.max(999999), this.validationService.numberValidator]], // 收銀機號
    counterStart: [, [Validators.max(999999), this.validationService.numberValidator]], // 專櫃編號
    counterEnd: [, [Validators.max(999999), this.validationService.numberValidator]], // 專櫃編號
    cahserType: [], // 收銀機類型
    reimbursementType: [[] as number[]], // 顯示欄位
    cashShowUp: [[] as number[]], // 顯示方式
    usagecount: [0, [Validators.required]], // 次數限制 (0 不限制)
  });
  // 表格
  // ----------------------------------------------------------------
  data: any[] = [
    // { contactPerson: 'A先生', contactDate: '2024-08-08', UID: '123' ,industryType: '停車管理', category: '專櫃。意向書',version: 1, rentNumber: 1, progress: '未審核'},
    // { contactPerson: 'B先生', contactDate: '2024-08-09', UID: '456' ,industryType: '停車管理', category: '專櫃。意向書',version: 1, rentNumber: 2, progress: '已審核'},
    // { contactPerson: 'C先生', contactDate: '2024-08-10', UID: '789' ,industryType: '停車管理', category: '專櫃。意向書',version: 1, rentNumber: 3, progress: '未審核'},
    // 其他資料
  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'contactPerson', header: '收銀機號', visible: true },
    { field: 'contactDate', header: '收銀員編號 / 姓名', visible: true },
    { field: 'UID', header: '付款別', visible: true },
    { field: 'industryType', header: '系統帳', visible: true },
    { field: 'category', header: '溢欠差異(實收-系統帳)', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  cahserTypeOptions: any[] = [];
  reimbursementOptions: any[] = [];
  CashShowupByOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    private cahserTypeService: CahserTypeService,
    private reimbursementYypeService: ReimbursementYypeService,
    private cashShowupByService: CashShowupByService,
  ) {
  }

  ngOnInit(): void {
    //
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    this.cahserTypeService.getSystemTypes().subscribe(data => {
      this.cahserTypeOptions = data;
    });
    //
    this.reimbursementYypeService.getSystemTypes().subscribe(data => {
      this.reimbursementOptions = data;

      // 全選填入
      // let allSystemValues = this.reimbursementOptions.map(system => system.value);
      // this.queryForm.patchValue({
      //   reimbursementType: allSystemValues
      // });
    });
    //
    this.cashShowupByService.getSystemTypes().subscribe(data => {
      this.CashShowupByOptions = data;

      // 全選填入
      // let allSystemValues = this.CashShowupByOptions.map(system => system.value);
      // this.queryForm.patchValue({
      //   cashShowUp: allSystemValues
      // });
    });
  }

  canQuery(): boolean {
    return true;
  }

  canAdd(): boolean {
    return true;
  }

  canEdit(): boolean {
    return true;
  }

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

  onCreate() {
    if (this.canAdd()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: CRUDStatus.Create,
          queryform: this.queryForm,
        },
        skipLocationChange: true
      };

      //console.log("extra", extras);
      this.router.navigate(['/TLS2000/TLS2B010CRU'], extras);
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
        skipLocationChange: true
      };

      this.router.navigate(['/TLS2000/TLS2B010CRU'], extras);
    }
  }

  onDetail(data: any) {
    let extras: NavigationExtras = {
      state: {
        crudstatus: CRUDStatus.Read,
        rowdata: data,
        queryform: this.queryForm,
      },
      skipLocationChange: true
    };

    this.router.navigate(['/TLS2000/TLS2B010CRU'], extras);
  }
}
