import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
import { VendorService } from '../../../service/basic/vendor.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TranslateModule } from '@ngx-translate/core';
//

//1.2.9.7 廠商應付對科目明細表
@Component({
  selector: 'app-fin29070',
  templateUrl: './fin29070.component.html',
  styleUrl: './fin29070.component.scss',
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, DropdownComponent, CalendarRangeComponent, ButtonComponent, TranslateModule]
})
export class FIN29070Component extends BasicQpageComponent implements OnInit {
  //
  queryForm = this.formBuilder.group({
    factoryID: [, [Validators.required]], // 廠商代號
    startBillDate: [, [Validators.required]], //立帳日期
    endBillDate: [, [Validators.required]], //立帳日期
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
    // { 'name': 'Emily', 'age': 28, '電子信箱': 'emily@example.com', 'city': 'Kaohsiung' },
    // { 'name': 'Michael', 'age': 31, '電子信箱': 'michael@example.com', 'city': 'Taipei' },
    // { 'name': 'Sarah', 'age': 24, '電子信箱': 'sarah@example.com', 'city': 'Tainan' },
    // 其他資料
  ];
  columns: any[] = [
    { field: 'col1', header: '廠商代號', visible: true },
    { field: 'col2', header: '廠商名稱	', visible: true },
    { field: 'col3', header: '應付帳款單號', visible: true },
    { field: 'col4', header: '科目代號', visible: true },
    { field: 'col5', header: '摘要', visible: true },
    { field: 'col6', header: '立帳日期', visible: true },
    { field: 'col7', header: '立帳金額', visible: true },
    { field: 'col8', header: '電匯/開票/單號', visible: true },
    { field: 'col9', header: '開票/匯款日期', visible: true },
    { field: 'col10', header: '傳票號碼', visible: true },
    { field: 'col11', header: '付款金額', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  factoryIDOptions: any[] = [];

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
    this.ProgNo = '120030';
    this.cruPage = '/FIN2000/FIN29070CRU';
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
