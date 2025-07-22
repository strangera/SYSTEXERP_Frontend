import { Component } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { TLS2B020Service } from '../../../service/api/tls/tls2-b020.service';
import { CashierDistinctionService } from '../../../service/basic/cashier-distinction.service';
import { OverflowStatusService } from '../../../service/basic/overflow-status.service';

// UI Imports
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { CashierService } from '../../../service/basic/cashier.service';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { FloorService } from '../../../service/basic/floor.service';
import { DecimalPipe, NgIf } from '@angular/common';

@Component({
  selector: 'app-tls2b020',
  templateUrl: './tls2b020.component.html',
  styleUrl: './tls2b020.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarComponent,
    DropdownComponent,
    RadiobuttonComponent,
    ButtonComponent,
    TableComponent,
    DecimalPipe,
    MultiSelectComponent,
    TranslateModule,
    NgIf
  ],
})
export class TLS2B020Component extends BasicQueryPageComponent<any> {
  // 下拉選單
  cashierDistinctionOptions: any[] = [];
  overflowStatusOptions: any[] = [];
  cashierOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  floorOptions: any[] = [];
  subtotalFields: string[] = [];
  overpaidAmount: number = 0; // 溢付金額（合計）
  underpaidAmount: number = 0; // 欠收金額（API回傳）
    // 表格資料與欄位
  data: any[] = [];
  totalRecords = 0;
  selectedItems: any[] = [];
  columns: any[] = [];

  // 查詢表單
// 查詢表單
queryForm = this.formBuilder.group({
  tlt_building: [null],                            // 館別
  tlt_floor: [[]],                                 // 樓層（多選）
  TXN_Date: [null, [Validators.required]],         // 銷售年月（yyyyMM）
  USR_No: [[]],                                    // 收銀員代號清單
  cashierDistinction: [1],                         // 收銀員區分
  overflowStatus: [1],                             // 溢欠狀態
  ...createPaginationConfig([{ field: 'TXN_Date', order: 1 }])
});



  constructor(
    private cashierDistinctionService: CashierDistinctionService,
    private overflowStatusService: OverflowStatusService,
    private tls2b020Service: TLS2B020Service,
    private cashierService: CashierService,
    private tls11010Service: Tls11010Service,
    private floorService: FloorService,
    public override messageService: NotificationService,
  ) {
    super();
  }
  calculateAmounts(): void {
    const overpaid = this.data.reduce(
      (sum, row) => sum + (parseFloat(row.total) || 0),
      0,
    );
    this.overpaidAmount = overpaid;

    // 欠收金額來自 API，如果有對應欄位，請替換這裡的邏輯：
    const apiUnderpaidField = 'underpaid'; // 假設 API 中每筆 row 都有欠收欄位
    const underpaid = this.data.reduce(
      (sum, row) => sum + (parseFloat(row[apiUnderpaidField]) || 0),
      0,
    );
    this.underpaidAmount = underpaid;
  }
  ngOnInit(): void {
    this.initializePage(
      'TLS2B020',
      '/TLS2000/TLS2B020CRU',
      this.queryForm,
      (form) => this.onSubmit(form),
    );

    this.cashierDistinctionService.getSystemTypes().subscribe((res) => {
      this.cashierDistinctionOptions = res;
    });

    this.overflowStatusService.getSystemTypes().subscribe((res) => {
      this.overflowStatusOptions = res;
    });
    this.cashierService.getCashierOptions().subscribe((res) => {
      this.cashierOptions =
        res?.map((x: any) => ({
          label: x.label, // 給 table 用
          formLabel: `${x.value} - ${x.label}`, // 給下拉選單用
          value: x.value,
        })) || [];
    });
    this.floorService
      .getFloors()
      .subscribe((data) => (this.floorOptions = data));
    this.tls11010Service
      .getBuildingOptions()
      .subscribe((res) => (this.BUILDING_NO_Options = res));
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const currentMonthStr = `${year}${month}`; // e.g., "202507"

    this.buildColumnsByMonth(currentMonthStr);
    this.queryForm.get('overflowStatus')?.valueChanges.subscribe(() => {
      this.calculateAmounts();
    });
  }
  buildColumnsByMonth(monthStr: string): void {
    if (!monthStr || monthStr.length !== 6) return;

    const year = +monthStr.substring(0, 4);
    const month = +monthStr.substring(4, 6);
    const daysInMonth = new Date(year, month, 0).getDate();

    const staticColumns = [
      { field: 'building', header: '館別', visible: true },
      { field: 'floor', header: '樓層', visible: true },
      { field: 'cashier', header: '收銀員', visible: true },
    ];

    const dayColumns = Array.from({ length: daysInMonth }, (_, i) => ({
      field: `day${i + 1}`,
      header: `${i + 1}`,
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    }));

    const totalColumn = {
      field: 'total',
      header: '合計',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    };

    this.columns = [...staticColumns, ...dayColumns, totalColumn];
    this.subtotalFields = [
      ...dayColumns.map((col) => col.field),
      totalColumn.field,
    ];
  }

  onSubmit(form: FormGroup): void {
    this.submitted = true;

    if (form.invalid) {
      this.messageService.warnBubble('請完整填寫查詢條件');
      return;
    }

    const payload = { ...form.value };
    Object.keys(payload).forEach((key) => {
      if (typeof payload[key] === 'string') {
        payload[key] = payload[key].trim() || null;
      }
    });

    // ⬇️ 加入動態產欄位邏輯
    if (payload.onedatemm) {
      const rawValue = payload.onedatemm;
      const yyyymm =
        typeof rawValue === 'string'
          ? rawValue
          : `${rawValue.getFullYear()}${(rawValue.getMonth() + 1).toString().padStart(2, '0')}`;
      this.buildColumnsByMonth(yyyymm);
    }

    this.loading = true;
    this.messageService.blockUi();

    this.tls2b020Service.queryTLS2B020(payload).subscribe({
      next: (res) => {
        this.data = res?.Data ?? [];
        this.totalRecords = res?.TotalCount ?? this.data.length;
        this.queryStateService.setQueryState(this.ProgNo, payload);
        this.messageService.successBubble('查詢成功');
      },
      error: () => {
        this.messageService.errorBubble('查詢失敗');
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
        this.messageService.unblockUi();
      },
    });
  }
  moneyFormat(value: number): string {
    return value != null ? value.toLocaleString('en-US') : '0';
  }

  onClearForm(): void {
    this.queryForm.reset();
  }
}
