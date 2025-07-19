import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { FunsrightInfo, PermissionsInfo } from '../../../shared/models/system/funsrightInfo';
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { FloorService } from '../../../service/basic/floor.service';
import { MachineAttributeService } from '../../../service/basic/machine-attribute.service';
import { PaymentTimingService } from '../../../service/basic/payment-timing.service';
import { ViolationStatusService } from '../../../service/basic/violation-status.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TranslateModule } from '@ngx-translate/core';


const now = new Date();

@Component({
  selector: 'app-tls28030',
  templateUrl: './tls28030.component.html',
  styleUrls: ['./tls28030.component.scss'],
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarRangeComponent, InputTextComponent, CheckboxModule, DropdownComponent, ButtonComponent, TranslateModule]
})
export class TLS28030Component {

  // 程式編號
  ProgNo: string = '220046';
  // 權限變數
  funInfo?: FunsrightInfo;




  // 查詢表單
  loading: boolean = false;
  submitted: boolean = false;
  queryForm = this.formBuilder.group({
    bagBarcode: [],  // 袋子條碼
    cashierCode: [],  // 收銀機號
    counterCode: [],  // 專櫃編號
    startAccountDate: [now],  // 入帳日開始
    endAccountDate: [now],  // 入帳日結束
    startPaymentDate: [now],  // 繳袋日期開始
    endPaymentDate: [now],  // 繳袋日期結束
    paymentTiming: [],  // 繳袋時機
    showVirtualMachine: [],  // 只顯示虛擬機台
    building: [], //館別
    floor: [],  // 樓層
    machineAttribute: [],  // 機台屬性
    status: [],  // 狀態
  });

  // 表格資料
  data: any[] = [
    { name: 'John', age: 25, email: 'john@example.com' },
    { name: 'Jane', age: 30, email: 'jane@example.com' }
  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'name', header: 'Name', visible: true },
    { field: 'age', header: 'Age', visible: true },
    { field: 'email', header: 'Email', visible: true }
  ];

  // 下拉選單選項
  paymentTimingOptions: any[] = [];
  floorOptions: any[] = [];
  machineAttributeOptions: any[] = [];
  statusOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private floorService: FloorService,
    private machineAttributeService: MachineAttributeService,
    private paymentTimingService: PaymentTimingService,
    private violationStatusService: ViolationStatusService,

  ) { }

  ngOnInit(): void {
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    // Initialize dropdown options
    this.paymentTimingService.getPaymentTiming().subscribe(data => {
      this.paymentTimingOptions = data;
    });
    this.floorService.getFloors().subscribe(data => {
      this.floorOptions = data;
    });
    this.machineAttributeService.getMachineAttributes().subscribe(data => {
      this.machineAttributeOptions = data;
    });
    this.violationStatusService.getViolationStatuses().subscribe(data => {
      this.statusOptions = data;
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
          queryform: this.queryForm
        },
        skipLocationChange: true
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
          queryform: this.queryForm
        },
        skipLocationChange: true
      };
      this.router.navigate(['/demoCRU'], extras);
    }
  }

  onDetail(data: any) {
    let extras: NavigationExtras = {
      state: {
        crudstatus: CRUDStatus.Read,
        rowdata: data,
        queryform: this.queryForm
      },
      skipLocationChange: true
    };
    this.router.navigate(['/demoCRU'], extras);
  }
}
