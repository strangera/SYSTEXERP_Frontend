import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Services
import { WarehouseService } from '../../../service/basic/warehouse.service';
import { BrandCodeService } from '../../../service/basic/brand-code.service';
import { InventoryCategoryService } from '../../../service/basic/inventory-category.service';
import { StorageInventoryStatusService } from '../../../service/basic/storage-inventory-status.service';
// Shared
import { NotificationService } from '../../../shared/component/notification-message/notification.service';

import { FunsrightInfo, PermissionsInfo } from '../../../shared/models/system/funsrightInfo';
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-tls53030',
  templateUrl: './tls53030.component.html',
  styleUrls: ['./tls53030.component.scss'],
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputTextComponent, DropdownComponent, CalendarRangeComponent, ButtonComponent, TranslateModule]
})
export class TLS53030Component {

  ProgNo: string = '250023';
  funInfo?: FunsrightInfo;



  loading: boolean = false;
  submitted: boolean = false;

  queryForm = this.formBuilder.group({
    storageInventoryCode: [],
    inventoryCode: [],
    warehouseCode: [],
    inventoryDateFrom: [],
    inventoryDateTo: [],
    storageInventoryStatus: [],
    brandId: [],
  });

  // Dropdown options
  warehouseOptions: any[] = [];
  brandCodeOptions: any[] = [];
  inventoryCategoryOptions: any[] = [];
  storageInventoryStatusOptions: any[] = [];

  // Table data
  data: any[] = [
    { name: 'John', age: 25, 電子信箱: 'john@example.com' },
    { name: 'Jane', age: 30, 電子信箱: 'jane@example.com' },
    // Other data
  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'name', header: 'Name', visible: true },
    { field: 'age', header: 'Age', visible: true },
    { field: '電子信箱', header: '電子信箱', visible: true },
    // Other columns
  ];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private warehouseService: WarehouseService,
    private brandCodeService: BrandCodeService,
    private inventoryCategoryService: InventoryCategoryService,
    private storageInventoryStatusService: StorageInventoryStatusService,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    // Initialize dropdown options
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    this.warehouseService.getWarehouseOptions().subscribe(data => this.warehouseOptions = data);
    this.brandCodeService.getSystemTypes().subscribe(data => this.brandCodeOptions = data);
    this.inventoryCategoryService.getInventoryCategoryOptions().subscribe(data => this.inventoryCategoryOptions = data);
    this.storageInventoryStatusService.getStorageInventoryStatusOptions().subscribe(data => this.storageInventoryStatusOptions = data);
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
