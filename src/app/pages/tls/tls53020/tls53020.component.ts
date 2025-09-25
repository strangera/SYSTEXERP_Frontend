import { Component } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule, } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AddButton, createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';

// Component Kit
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';

// Services
import { TLS53020Data, TLS53020Service } from '../../../service/api/tls/tls53020.service';
import { WarehouseService } from '../../../service/basic/warehouse.service';
import { BrandCodeService } from '../../../service/basic/brand-code.service';
import { InventoryCategoryService } from '../../../service/basic/inventory-category.service';
import { StorageInventoryStatusService } from '../../../service/basic/storage-inventory-status.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { finalize } from 'rxjs';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';

@Component({
  selector: 'app-tls53020',
  templateUrl: './tls53020.component.html',
  styleUrl: './tls53020.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    CalendarRangeComponent,
    ButtonComponent,
    TableComponent,
    TranslateModule,
    RadiobuttonComponent
  ],
})
export class TLS53020Component extends BasicQueryPageComponent<TLS53020Data> {
  queryForm = this.formBuilder.group({
    warehouseCode: [null], // 倉別
    inventorySerialNo: [null], // 盤點單號
    brandCode: [null], // 品牌代碼
    inventoryCategory: [null], // 盤點類別
    inventoryDateFrom: [null], // 盤點基準開始日期
    inventoryDateTo: [null], // 盤點基準結束日期
    storageInventoryStatus: [null], // 盤點單狀態
    ...createPaginationConfig([{ field: 'ID', order: 1 }]),
  });

  data: TLS53020Data[] = [];
  totalRecords = 0;
  selectedItems: TLS53020Data[] = [];

  // 下拉選單資料
  warehouseOptions: any[] = [];
  brandCodeOptions: any[] = [];
  inventoryCategoryOptions: any[] = [];
  storageInventoryStatusOptions: any[] = [];

  columns = [
    { field: 'inventorySerialNo', header: '盤點單號', visible: true },
    { field: 'brandCode', header: '品牌', visible: true },
    { field: 'warehouseCode', header: '倉別', visible: true },
    { field: 'inventoryDate', header: '盤點基準日', visible: true },
    { field: 'inventoryCategory', header: '盤點類別', visible: true },
    { field: 'storageInventoryStatus', header: '狀態', visible: true },
  ];

  addButton: AddButton[] = [
    {
      label: '匯入',
      icon: 'pi pi-file-import',
      action: (rowData: TLS53020Data) => { this.onImport(rowData); },
    }
  ];

  constructor(
    private warehouseService: WarehouseService,
    private brandCodeService: BrandCodeService,
    private inventoryCategoryService: InventoryCategoryService,
    private storageInventoryStatusService: StorageInventoryStatusService,
    private tls53020Service: TLS53020Service,
    public validationService: ValidationService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS53020', '/tls/tls53020cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(this.queryForm, () => {
      this.tls53020Service.queryTLS53020(frm.getRawValue())
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe(res => {
          this.data = res.Data;
          this.totalRecords = res.TotalCount;
          this.queryStateService.setQueryState(this.ProgNo, frm.value);
        });
    });
  }

  loadOptions(): void {
    this.warehouseService.getWarehouseOptions().subscribe(data => {
      this.warehouseOptions = data;
    });

    this.brandCodeService.getSystemTypes().subscribe(data => {
      this.brandCodeOptions = data;
    });

    this.inventoryCategoryService.getInventoryCategoryOptions().subscribe(data => {
      this.inventoryCategoryOptions = data;
    });

    this.storageInventoryStatusService.getStorageInventoryStatusOptions().subscribe(data => {
      this.storageInventoryStatusOptions = data;
    });
  }

  onImport(rowData: TLS53020Data): void {
    // 處理匯入邏輯
    console.log('處理匯入邏輯', rowData);
  }
}
