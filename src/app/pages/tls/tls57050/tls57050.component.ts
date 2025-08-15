import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WarehouseService } from '../../../service/basic/warehouse.service';
import { BrandCodeService } from '../../../service/basic/brand-code.service';
import { ManagementIDService } from '../../../service/basic/management-id.service';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { DisplayModeService } from '../../../service/basic/display-mode.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { Column } from '@shared/componentkit/table/table.model';

@Component({
  selector: 'app-tls57050',
  templateUrl: './tls57050.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    InputTextComponent,
    CalendarRangeComponent,
    ButtonComponent,
    TableComponent,
    TranslateModule,
  ],
})
export class TLS57050Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    warehouseCode: [],
    brandCode: [],
    managementID: [],
    salesCode: [],
    salesDateFrom: [],
    salesDateTo: [],
    receiptMachineCode: [],
    transactionSeqCode: [],
    itemCode: [],
    itemStyle: [],
    displayMethod: [],
    displayQuantity: [],
    displayMode: [],
    barcode: [],
    VendorProductNumber: [],
  });
  totalRecords = 0;
  warehouseOptions: any[] = [];
  brandCodeOptions: any[] = [];
  managementIDOptions: any[] = [];
  displayModeOptions: any[] = [];
  data: any[] = [];
  columns: Column[] = [
    { field: 'salesOrderNumber', header: '銷售單號', visible: true },
    { field: 'salesDate', header: '銷售日期', visible: true },
    { field: 'cashRegister', header: '收銀機號', visible: true },
    { field: 'transactionSequence', header: '交易序號', visible: true },
    { field: 'brand', header: '品牌', visible: true },
    { field: 'invoiceNumber', header: '發票號碼', visible: true },
    { field: 'quantity', header: '數量', visible: true },
    { field: 'salesFixedPrice', header: '銷售定價', visible: true },
    { field: 'salesAmount', header: '銷售金額', visible: true },
    { field: 'adjustmentAmount', header: '整形折價', visible: true },
    { field: 'adjustmentDiscount', header: '整形折扣', visible: true },
  ];


  constructor(
    private notificationService: NotificationService,
    private warehouseService: WarehouseService,
    private brandCodeService: BrandCodeService,
    private managementIDService: ManagementIDService,
    private displayModeService: DisplayModeService,
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS57050', 'tls/tls57050cru', this.queryForm, (form) => this.onSubmit(form));
    this.warehouseService.getWarehouseOptions().subscribe((data) => (this.warehouseOptions = data));
    this.brandCodeService.getSystemTypes().subscribe((data) => (this.brandCodeOptions = data));
    this.managementIDService.getSystemTypes().subscribe((data) => (this.managementIDOptions = data));
    this.displayModeService.getDisplayModes().subscribe((data) => (this.displayModeOptions = data));
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {

    })
  }
}
