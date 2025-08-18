import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FloorService } from '../../../service/basic/floor.service';
import { MachinedisplayService } from '../../../service/basic/machinedisplay.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ECRNoService } from '../../../service/basic/ECRNo.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { DropdownModule } from 'primeng/dropdown';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { Tls22010Service } from '../../../service/api/tls/tls22010.service';
import { createPaginationConfig, Column, formatAmount } from 'src/app/shared/componentkit/table/table.model';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { yesterday } from '@shared/models/system/query-form.model';
import { take } from 'rxjs';



@Component({
  templateUrl: './tls22010.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarComponent,
    MultiSelectComponent,
    DropdownModule,
    RadiobuttonComponent,
    ButtonComponent,
    TableComponent,
    TranslateModule,
    ButtonModule,
  ],
})
export class TLS22010Component extends BasicQueryPageComponent<any> implements OnInit {
  // ------ UI 狀態 / 表單 ------
  queryForm = this.formBuilder.group({
    TXN_DATE: [yesterday, { validators: [Validators.required], updateOn: 'change' }],
    floor_noList: [[]],
    ECR_No: [[]],
    ShowStatus: ['1'],
    status1: [''],
    status2: [''],
    ...createPaginationConfig([{ field: 'ECR_No', order: 1 }]),
  });

  selectedItems: any[] = [];
  totalRecords = 0;
  data: any[] = [];
  filteredData: any[] = [];

  // ------ 欄位定義 ------
  columns7: Column[] = [
    { field: 'ECR_No', header: '收據機代碼', visible: true },
    { field: 'TXN_DATE', header: '交易日期', visible: true },
    { field: 'AREA_NO', header: '區域', visible: true },
    { field: 'FLOOR_NO', header: '樓層', visible: true },
    { field: 'TXN_TotSaleAmt', header: '銷售金額 (A)', visible: true, format: formatAmount },
    { field: 'sad_preorder_Amt', header: '預購金額', visible: true, format: formatAmount },
    { field: 'sad_settle_Amt', header: '預購結帳 (C2)', visible: true, format: formatAmount },
    { field: 'TXN_TotSaleAmt_Sum', header: '銷售小計(D) = (A)', visible: true, format: formatAmount },
    { field: 'TXN_TotExtraAmt', header: '代收/付金額 (L)', visible: true, format: formatAmount },
    { field: 'TXN_TotHaveTax', header: '已開發票金額 (E)', visible: true, format: formatAmount },
    { field: 'TXN_ChangeHaveTax', header: '已開溢付 (K)', visible: true, format: formatAmount },
    { field: 'TXN_TotOver', header: '已匯送付 (I)', visible: true, format: formatAmount },
    { field: 'TXN_TotGUI', header: '發票總金額 (F)', visible: true, format: formatAmount },
    { field: 'GUI_NET', header: '發票未稅金額 (M)', visible: true, format: formatAmount },
    { field: 'TXN_TotTax', header: '發票稅額 (N)', visible: true, format: formatAmount },
    { field: 'TXN_TotGUISaleNoTax', header: '發票免稅金額 (O)', visible: true, format: formatAmount },
    { field: 'TXN_TotOver_Sum', header: '溢收 (G)', visible: true, format: formatAmount },
    { field: 'GUI_REFUND', header: '折讓 (J)', visible: true, format: formatAmount },
    { field: 'TXN_TotPayAmt', header: '付款金額(H)=(D)+(G)-(C2)-(K)', visible: true, format: formatAmount },
    { field: 'SLE_SaleAmt', header: 'Z 報表總金額', visible: true, format: formatAmount },
    { field: 'TXN_Mode_P', header: '後台(作廢/補登)', visible: true },
    { field: 'Status_Code', header: '狀態', visible: true },
  ];

  statusOptions = [
    { label: '全部', value: 'all' },
    { label: '正常', value: 'normal' },
    { label: '異常', value: 'abnormal' },
  ];

  exportExcelLoading = false;
  floorOptions: any[] = [];
  machinedisplayOptions: any[] = [];
  ECRNoOptions: any[] = [];

  private skipAutoQueryOnce = false;

  constructor(
    private floorService: FloorService,
    private machineDisplayService: MachinedisplayService,
    private ECRNoService: ECRNoService,
    private tls22010Service: Tls22010Service,
    public override router: Router
  ) {
    super();
  }

  // --------- 生命週期 ----------
  ngOnInit(): void {
    // initializePage 會還原 queryState（我們在 onSubmit 內用 frm.value 存），包含 TXN_Date
    this.initializePage('TLS22010', '/TLS/TLS22010cru', this.queryForm, (frm) => this.onSubmit(frm));
    // 載入下拉選項
    this.floorService.getFloors().subscribe((data) => (this.floorOptions = data));
    this.machineDisplayService.getMachinedisplay().subscribe((data) => (this.machinedisplayOptions = data));
    this.ECRNoService.getECRNo().subscribe((data) => (this.ECRNoOptions = data));
  }

  /** 避免時區影響：以本地時間組 YYYY-MM-DD */
  private toYMD(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  // --------- 事件 ----------
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const value = this.queryForm.value as any;

      const params = {
        TXN_DATE: value.TXN_DATE ? this.toYMD(value.TXN_DATE) : null,
        ECR_No: value.ECR_No,
        floor_noList: value.floor_noList,
        ShowStatus: value.ShowStatus,
      };

      this.tls22010Service.queryTLS22010(params).subscribe({
        next: (res) => {
          this.data = (res?.Data ?? []).map((item: any) => ({
            ...item,
            // 統一提供 TXN_Date 為 YYYY-MM-DD
            details: item.details ?? [],
          }));
          this.filteredData = [...this.data];
          this.totalRecords = res?.TotalCount ?? this.data.length;

          // 保留「表單值」到查詢狀態（initializePage 才能正確還原 Date 型別）
          this.queryStateService.setQueryState(this.ProgNo, frm.value);
          this.loading = false;
        },
        error: (err) => {
          console.error('查詢 TLS22010 失敗:', err);
          this.loading = false;
        },
      });
    });
  }
}
