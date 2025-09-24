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
import { TLS53030Data, TLS53030Service } from '../../../service/api/tls/tls53030.service';
import { WarehouseService } from '../../../service/basic/warehouse.service';
import { BrandCodeService } from '../../../service/basic/brand-code.service';
import { InventoryCategoryService } from '../../../service/basic/inventory-category.service';
import { StorageInventoryStatusService } from '../../../service/basic/storage-inventory-status.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { finalize } from 'rxjs';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';

@Component({
  selector: 'app-tls53030',
  templateUrl: './tls53030.component.html',
  styleUrl: './tls53030.component.scss',
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
export class TLS53030Component extends BasicQueryPageComponent<TLS53030Data> {
  queryForm = this.formBuilder.group({
    warehouseCode: [null], // 倉別
    inventorySerialNo: [null], // 盤點單號
    brandCode: [null], // 品牌代碼
    inventoryCategory: [null], // 盤點類別
    inventoryDateFrom: [null], // 盤點基準開始日期
    inventoryDateTo: [null], // 盤點基準結束日期
    storageInventoryStatus: [null], // 盤點單狀態
    showDifference: ['0'], // 顯示差異
    ...createPaginationConfig([{ field: 'ID', order: 1 }]),
  });

  data: TLS53030Data[] = [];
  totalRecords = 0;
  selectedItems: TLS53030Data[] = [];

  // 下拉選單資料
  warehouseOptions: any[] = [];
  brandCodeOptions: any[] = [];
  storageInventoryStatusOptions: any[] = [
    { label: '盤點單開立，待盤點', value: '0' },
    { label: '初盤，盤點中', value: '1' },
    { label: '複盤，盤點完成', value: '2' },
    { label: '抽盤，小盤結案', value: '3' },
    { label: '已結案', value: '4' },
    { label: '作廢', value: '9' },
  ];
  showDifferenceOptions: any[] = [
    { label: '只顯示有差異資料', value: '0' },
    { label: '全部', value: '1' },
  ];

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
      label: '結案',
      icon: 'pi pi-check text-green-500',
      action: (rowData: TLS53030Data) => { this.onClose(rowData); },
      disabled: (rowData: TLS53030Data) => rowData.storageInventoryStatus == '4'
    },
    {
      label: '反結案',
      icon: 'pi pi-undo text-orange-500',
      action: (rowData: TLS53030Data) => { this.onReopen(rowData); },
      disabled: (rowData: TLS53030Data) => rowData.storageInventoryStatus !== '4'
    },
    {
      label: '作廢',
      icon: 'pi pi-times text-red-500',
      action: (rowData: TLS53030Data) => { this.onVoid(rowData); },
      disabled: (rowData: TLS53030Data) => !['0', '1', '2', '3'].includes(rowData.storageInventoryStatus)
    },
    {
      label: '查詢',
      icon: 'pi pi-search',
      action: (rowData: TLS53030Data) => { this.onQuery(rowData); },
    },
    {
      label: '列印',
      icon: 'pi pi-print',
      action: (rowData: TLS53030Data) => { this.onPrint(rowData); },
    }
  ];

  constructor(
    private warehouseService: WarehouseService,
    private brandCodeService: BrandCodeService,
    private inventoryCategoryService: InventoryCategoryService,
    private storageInventoryStatusService: StorageInventoryStatusService,
    private tls53030Service: TLS53030Service,
    public validationService: ValidationService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS53030', '/tls/tls53030cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(this.queryForm, () => {
      this.tls53030Service.queryTLS53030(frm.getRawValue())
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

    this.storageInventoryStatusService.getStorageInventoryStatusOptions().subscribe(data => {
      this.storageInventoryStatusOptions = data;
    });
  }

  onClose(rowData: TLS53030Data): void {
    // 處理結案邏輯
    console.log('處理結案邏輯', rowData);
  }

  onReopen(rowData: TLS53030Data): void {
    // 處理反結案邏輯
    console.log('處理反結案邏輯', rowData);
  }

  onVoid(rowData: TLS53030Data): void {
    // 處理作廢邏輯
    console.log('處理作廢邏輯', rowData);
  }

  onQuery(rowData: TLS53030Data): void {
    // 處理查詢邏輯
    console.log('處理查詢邏輯', rowData);
  }

  onPrint(rowData: TLS53030Data): void {
    // 處理列印邏輯
    console.log('處理列印邏輯', rowData);
  }
}
