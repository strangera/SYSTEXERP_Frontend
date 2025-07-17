import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Permissions
import {
  FunsrightInfo,
  PermissionsInfo,
} from '../../../shared/models/system/funsrightInfo';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { FloorService } from '../../../service/basic/floor.service';
import { PaymentToolService } from '../../../service/basic/payment-tool.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';


const now = new Date();

@Component({
  selector: 'app-tls2a010',
  templateUrl: './tls2a010.component.html',
  styleUrls: ['./tls2a010.component.scss'],
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarComponent, DropdownComponent, InputNumberRangeComponent, ButtonComponent, TableComponent, TranslateModule]
})
export class TLS2A010Component {

  // 程式編號
  ProgNo: string = '220050';

  // 權限
  funInfo?: FunsrightInfo;




  // 查詢表單
  loading: boolean = false;
  submitted: boolean = false;
  queryForm = this.formBuilder.group({
    salesDate: [now, [Validators.required]],
    floor: [],
    cashRegisterNumberstartSerial: [, [Validators.required]],
    cashRegisterNumberendSerial: [, [Validators.required]],
    paymentMethod: []
  });
  // 表格数据
  data: any[] = [

    // 其他数据
  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'cashRegisterCode', header: '收銀機號', visible: true },
    { field: 'specialCounter', header: '專櫃', visible: true },
    { field: 'generalReceiptAmount', header: '條碼紙/貨收據金額', visible: true },
    { field: 'medicalReceiptAmount', header: '條碼醫療/貨收據金額', visible: true },
    { field: 'status', header: '狀況', visible: true },
    { field: 'approver', header: '審核者', visible: true },
  ];

  // 下拉選單選項
  floorOptions: any[] = [];
  paymentToolOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private authService: AuthService,
    private floorService: FloorService,
    private paymentToolService: PaymentToolService,
    private validationService: ValidationService,
  ) { }

  ngOnInit(): void {
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    // 載入樓層選項
    this.floorService.getFloors().subscribe((data) => {
      this.floorOptions = data;
    });

    // 載入付款別選項
    this.paymentToolService.getPaymentToolOptions().subscribe((data) => {
      this.paymentToolOptions = data;
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

  onSubmit(form: FormGroup) {
    console.log(form.value);
    this.submitted = true;
    this.loading = true;
    this.notificationService.blockUi();

    if (form.valid && this.canQuery()) {
      // 提交查詢邏輯
    }

    this.loading = false;
    this.notificationService.unblockUi();
  }

  onSubmitQuery(form: FormGroup) {
    this.onSubmit(form);
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
