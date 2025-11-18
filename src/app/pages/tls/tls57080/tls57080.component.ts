import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Shared
import { NotificationService } from '../../../shared/component/notification-message/notification.service';

import { FunsrightInfo } from '../../../shared/models/system/funsrightInfo';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-tls57080',
  templateUrl: './tls57080.component.html',
  styleUrls: ['./tls57080.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    CalendarComponent,
    InputTextComponent,
    ButtonComponent,
    TableComponent,
    TranslateModule,
  ],
})
export class TLS57080Component {
  ProgNo: string = '250047';
  funInfo?: FunsrightInfo;



  loading: boolean = false;
  submitted: boolean = false;

  queryForm = this.formBuilder.group({
    warehouseCode: [],
    initialDate: [],
    managementCode: [],
    productName: [],
    vendorCode: [],
  });

  // Dropdown options
  warehouseOptions: any[] = [];
  managementIDOptions: any[] = [];

  // Table data
  data: any[] = [

    // Other data
  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'date', header: '日期', visible: true },
    { field: 'order', header: '單號', visible: true },
    { field: 'vendorCode', header: '廠商編號', visible: true },
    { field: 'warehouse', header: '倉別', visible: true },
    { field: 'operation', header: '作業', visible: true },
    { field: 'quantityChange', header: '異動量', visible: true },
    { field: 'stockQuantity', header: '庫存量', visible: true },
    { field: 'batchNumber', header: '批號', visible: true },
    { field: 'unit', header: '單價', visible: true },
    { field: 'amount', header: '金額', visible: true },
  ];


  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
  ) { }

  ngOnInit(): void {
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
