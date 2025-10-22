import { StockRangeService } from './../../../service/basic/stock-range.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WarehouseService } from '../../../service/basic/warehouse.service';
import { BrandCodeService } from '../../../service/basic/brand-code.service';
import { ManagementIDService } from '../../../service/basic/management-id.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';

@Component({
  selector: 'app-tls57030',
  templateUrl: './tls57030.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    InputTextComponent,
    CalendarComponent,
    RadiobuttonComponent,
    InputNumberComponent,
    ButtonComponent,
    TranslateModule,
  ],
})
export class TLS57030Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    radiolist: [1],
    warehouseCode: [],
    brandCode: [],
    managementID: [],
    supplierCode: [],
    warehouseNumber: [],
    inventoryDate: [],
    displayInventoryType: [],
    displayInactive: [],
  });

  // Dropdown options
  warehouseOptions: any[] = [];
  brandCodeOptions: any[] = [];
  managementIDOptions: any[] = [];
  stockRangeOptions: any[] = [];

  // Table data
  data: any[] = [
  ];
  columns: any[] = [
    { field: 'brandName', header: '品牌名稱', visible: true },
    { field: 'warehouse', header: '倉別', visible: true },
    { field: 'managementID', header: '管理編號', visible: true },
    { field: 'productName', header: '商品名稱', visible: true },
    { field: 'barcode', header: '國際條碼', visible: true },
    { field: 'vendorCode', header: '廠商代號', visible: true },
    { field: 'bigCategory', header: '大分類', visible: true },
    { field: 'midCategory', header: '中分類', visible: true },
    { field: 'smallCategory', header: '小分類', visible: true },
    { field: 'purchasePriceExclTax', header: '進價(未稅)', visible: true },
    { field: 'sellingPriceInclTax', header: '售價(含稅)', visible: true },
    { field: 'totalQuantity', header: '數量合計', visible: true },
    { field: 'totalPurchaseExclTax', header: '合計進價(未稅)', visible: true },
    { field: 'totalSellingInclTax', header: '合計售價(含稅)', visible: true },
  ];


  constructor(
    private warehouseService: WarehouseService,
    private brandCodeService: BrandCodeService,
    private managementIDService: ManagementIDService,
    private stockRangeService: StockRangeService
  ) {
    super();
  }

  ngOnInit(): void {
    // Initialize dropdown options
    this.initializePage('TLS57030');
    this.warehouseService.getWarehouseOptions().subscribe((data) => (this.warehouseOptions = data));
    this.brandCodeService.getSystemTypes().subscribe((data) => (this.brandCodeOptions = data));
    this.managementIDService.getSystemTypes().subscribe((data) => (this.managementIDOptions = data));

    this.stockRangeService.getStockRangeOptions().subscribe((data) => (this.stockRangeOptions = data));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {

    })
  }
}
