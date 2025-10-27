import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Services
import { WarehouseService } from '../../../service/basic/warehouse.service';
import { ManagementIDService } from '../../../service/basic/management-id.service';
// Shared
import { NotificationService } from '../../../shared/component/notification-message/notification.service';

import { FunsrightInfo, PermissionsInfo } from '../../../shared/models/system/funsrightInfo';
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { BrandCodeService } from '../../../service/basic/brand-code.service';
import { DisplayModeService } from '../../../service/basic/display-mode.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
const now = new Date();
@Component({
  selector: 'app-tls57170',
  templateUrl: './tls57170.component.html',
  styleUrl: './tls57170.component.scss',
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarComponent, DropdownComponent, InputTextComponent, ButtonComponent, TableComponent, TranslateModule]
})
export class TLS57170Component {
  ProgNo: string = '250056';
  funInfo?: FunsrightInfo;



  loading: boolean = false;
  submitted: boolean = false;

  queryForm = this.formBuilder.group({
    warehouseCode: [],
    initialDate: [],
    managementCode: [],
    productName: [],
    vendorCode: [],
    brandCode: [],
    displayMode: [],
    displayCount: [],
    inventoryDateFrom: [now, Validators.required],
  });

  // Dropdown options
  warehouseOptions: any[] = [];
  managementIDOptions: any[] = [];
  brandCodeOptions: any[] = [];
  displayModeOptions: any[] = [];

  // Table data
  data: any[] = [

  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'vendorDescription', header: '廠商編號說明', visible: true },
    { field: 'vendorName', header: '廠商名稱', visible: true },
    { field: 'brandCodeDescription', header: '品牌代碼說明', visible: true },
    { field: 'managementDescription', header: '管理編號', visible: true },
    { field: 'productName', header: '品名', visible: true },
    { field: 'image', header: '圖像', visible: true },
    { field: 'endStockSellingPriceA', header: '期末存貨售價(A)', visible: true },
    { field: 'suggestedUsageRateB', header: '建議費用率(B)', visible: true },
    { field: 'netSellingPriceC', header: '淨銷貨價值(C)(A*(1-B))', visible: true },
    { field: 'endStockCostD', header: '期末成本價(D)', visible: true },
    { field: 'recoveryProfit', header: '回升利益(C-D=0)', visible: true },
    { field: 'costImpairment', header: '跌價損失(C-D<0)', visible: true },
  ];



  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private warehouseService: WarehouseService,
    private managementIDService: ManagementIDService,
    private authService: AuthService,
    private brandCodeService: BrandCodeService,
    private displayModeService: DisplayModeService,
  ) { }

  ngOnInit(): void {
    // Initialize dropdown options
    // this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    this.warehouseService.getWarehouseOptions().subscribe((data) => (this.warehouseOptions = data));
    this.managementIDService.getSystemTypes().subscribe((data) => (this.managementIDOptions = data));
    this.displayModeService.getDisplayModes().subscribe((data) => (this.displayModeOptions = data));
    this.brandCodeService.getSystemTypes().subscribe((data) => (this.brandCodeOptions = data));
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

  /*************  ✨ Windsurf Command ⭐  *************/
  /**
   * Called when the form is submitted.
   * @param frm The FormGroup instance for the form.
   */
  /*******  61ed7e22-f955-4d3d-a876-de267d598d5e  *******/
  onSubmit(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;
    this.notificationService.blockUi();

    if (frm.valid && this.canQuery()) {
      // Submit logic here
    }

    this.loading = false;
    this.notificationService.unblockUi();
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
