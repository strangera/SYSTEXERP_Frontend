import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WarehouseService } from '../../../service/basic/warehouse.service';
import { BrandCodeService } from '../../../service/basic/brand-code.service';
import { ManagementIDService } from '../../../service/basic/management-id.service';
import { VendorService } from '../../../service/basic/vendor.service';
import { DocumentTypeService } from '../../../service/basic/document-type.service';
import { PriceChangeStatusService } from '../../../service/basic/price-change-status.service';
import { DisplayModeService } from '../../../service/basic/display-mode.service';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';

@Component({
  selector: 'app-tls57100',
  templateUrl: './tls57100.component.html',
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, DropdownComponent, CalendarRangeComponent, InputTextComponent, ButtonComponent, TableComponent, TranslateModule]
})
export class TLS57100Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    warehouseCode: [],
    brandCode: [],
    managementID: [],
    vendorCode: [],
    documentType: [],
    priceChangeStatus: [],
    displayMode: [1],
    applicationDateFrom: [],
    applicationDateTo: [],
    approvalDateFrom: [],
    approvalDateTo: [],
    inspectionReturnCode: [],
  });
  totalRecords = 0;
  warehouseOptions: any[] = [];
  brandCodeOptions: any[] = [];
  managementIDOptions: any[] = [];
  vendorOptions: any[] = [];
  documentTypeOptions: any[] = [];
  priceChangeStatusOptions: any[] = [];
  displayModeOptions: any[] = [];
  data: any[] = [];
  columns: any[] = [
    { field: 'warehouse', header: '倉別', visible: true },
    { field: 'brand', header: '品牌', visible: true },
    { field: 'applicationDate', header: '申請日期', visible: true },
    { field: 'approvalDate', header: '審核日期', visible: true },
    { field: 'orderNumber', header: '單號', visible: true },
    { field: 'orderType', header: '單據類型', visible: true },
    { field: 'orderStatus', header: '單據狀態', visible: true },
    { field: 'quantity', header: '數量', visible: true },
    { field: 'unitPrice', header: '售價', visible: true },
    { field: 'subtotal', header: '小計', visible: true },
  ];

  constructor(
    private notificationService: NotificationService,
    private warehouseService: WarehouseService,
    private brandCodeService: BrandCodeService,
    private managementIDService: ManagementIDService,
    private vendorService: VendorService,
    private documentTypeService: DocumentTypeService,
    private priceChangeStatusService: PriceChangeStatusService,
    private displayModeService: DisplayModeService,
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS57100', 'tls/tls57100cru', this.queryForm, (form) => this.onSubmit(form));
    this.warehouseService.getWarehouseOptions().subscribe((data) => (this.warehouseOptions = data));
    this.brandCodeService.getSystemTypes().subscribe((data) => (this.brandCodeOptions = data));
    this.managementIDService.getSystemTypes().subscribe((data) => (this.managementIDOptions = data));
    this.vendorService.getVendors().subscribe((data) => (this.vendorOptions = data));
    this.documentTypeService.getDocumentTypes().subscribe((data) => (this.documentTypeOptions = data));
    this.priceChangeStatusService.getPriceChangeStatusOptions().subscribe((data) => (this.priceChangeStatusOptions = data));
    this.displayModeService.getDisplayModes().subscribe((data) => (this.displayModeOptions = data));
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => { });
  }
}
