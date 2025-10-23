import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WarehouseService } from '../../../service/basic/warehouse.service';
import { BrandCodeService } from '../../../service/basic/brand-code.service';
import { ManagementIDService } from '../../../service/basic/management-id.service';
import { StockRangeService } from './../../../service/basic/stock-range.service';
import { TLS57030Service } from '../../../service/api/tls/tls57030.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { finalize } from 'rxjs';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { formatAmount } from '@shared/componentkit/table/table.model';

@Component({
  selector: 'app-tls57030',
  templateUrl: './tls57030.component.html',
  styleUrls: ['./tls57030.component.scss'],
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
    TableReportComponent
  ],
})
export class TLS57030Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    HOS_No: [''],
    LOGO_No: [''],
    PLU_MagNo: [''],
    PLU_No: [''],
    PLU_OrgPLUNo: [''],
    STK_Date: [new Date()],
    ShowStockRange: [''],
    DisplayRowNumber: [20],
    radiolist: [1],
  });

  // Dropdown options
  warehouseOptions: any[] = [];
  brandCodeOptions: any[] = [];
  managementIDOptions: any[] = [];
  stockRangeOptions: any[] = [];

  // Table data
  data: any[] = [];
  totalRecords = 0;
  historyRequestBody: any;
  columnGroup = [
    { field: '合計', header: '合計' }
  ];

  columns = [
    { field: 'LOGO_CH_NAME', header: '品牌名稱', visible: true },
    { field: 'HOS_NAME', header: '倉別', visible: true },
    { field: 'PLU_MagNo', header: '管理編號', visible: true },
    { field: 'PLU_Name', header: '商品名稱', visible: true },
    { field: 'PLU_No', header: '國際條碼', visible: true },
    { field: 'MID', header: '廠商編號', visible: true },
    { field: 'CAT_LName', header: '大分類', visible: true },
    { field: 'CAT_MName', header: '中分類', visible: true },
    { field: 'CAT_SName', header: '小分類', visible: true },
    { field: 'PLU_OrderPrc', header: '進價(未稅)', visible: true, format: formatAmount },
    { field: 'PLU_SalePrc', header: '售價(含稅)', visible: true, format: formatAmount },
    { field: 'sumCount', header: '數量合計', visible: true, format: formatAmount },
    { field: 'sumPLU_OrderPrc', header: '進價(未稅)', visible: true, groupField: '合計' },
    { field: 'sumPLU_SalePrc', header: '售價(含稅)', visible: true, groupField: '合計' },
  ];

  constructor(
    private warehouseService: WarehouseService,
    private brandCodeService: BrandCodeService,
    private managementIDService: ManagementIDService,
    private stockRangeService: StockRangeService,
    public tls57030Service: TLS57030Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS57030');

    this.warehouseService.getWarehouseOptions().subscribe((data) => (this.warehouseOptions = data));
    this.brandCodeService.getSystemTypes().subscribe((data) => (this.brandCodeOptions = data));
    this.managementIDService.getSystemTypes().subscribe((data) => (this.managementIDOptions = data));
    this.stockRangeService.getStockRangeOptions().subscribe((data) => (this.stockRangeOptions = data));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const formValue = frm.getRawValue();
      const pageSize = formValue.DisplayRowNumber || 20;

      const requestBody = {
        PageSize: pageSize,
        PageIndex: 1,
        OrderBy: '',
        Offset: 0,
        SortBy: [],
        HOS_No: formValue.warehouseCode ?? '',
        LOGO_No: formValue.brandCode ?? '',
        PLU_MagNo: formValue.managementID ?? '',
        PLU_No: formValue.supplierCode ?? '',
        PLU_OrgPLUNo: formValue.warehouseNumber ?? '',
        STK_Date: formValue.inventoryDate ?? null,
        ShowStockRange: formValue.displayInventoryType ?? '',
        DisplayRowNumber: pageSize.toString(),
      };

      this.historyRequestBody = requestBody;
      this.loading = true;

      this.tls57030Service
        .queryTLS57030(requestBody)
        .pipe(
          untilDestroyed(this),
          finalize(() => (this.loading = false))
        )
        .subscribe({
          next: (res) => {
            if (res?.Status === '0000' && res.Data) {
              this.data = res.Data;
              this.totalRecords = res.TotalCount ?? res.Data.length;
              const tableEl = document.querySelector('p-table');
              if (tableEl) {
                (tableEl as any).rows = pageSize;
              }
            } else {
              this.data = [];
              this.totalRecords = 0;
              console.warn('查詢失敗:', res?.Message);
            }
          },
        });
    });
  }
}
