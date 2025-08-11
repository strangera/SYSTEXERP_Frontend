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
import { createPaginationConfig, Column } from 'src/app/shared/componentkit/table/table.model';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { yesterday } from '@shared/models/system/query-form.model';

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

  formatNumber(value: any): string {
    if (value == null || value === '') return '';
    const num = Number(value);
    return isNaN(num) ? value : num.toLocaleString('en-US');
  }

  queryForm = this.formBuilder.group({
    TXN_Date: [yesterday, { validators: [Validators.required], updateOn: 'change' }],
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
  filteredData: any[] = [...this.data];
  columns7: Column[] = [
    { field: 'ECR_No', header: '收據機代碼', visible: true },
    { field: 'TXN_Date', header: '交易日期', visible: true },
    { field: 'AREA_NO', header: '區域', visible: true },
    { field: 'FLOOR_NO', header: '樓層', visible: true },
    { field: 'TXN_TotSaleAmt', header: '銷售金額 (A)', visible: true, format: (v) => this.formatNumber(v) },
    { field: 'sad_preorder_Amt', header: '預購金額', visible: true, format: (v) => this.formatNumber(v) },
    { field: 'sad_settle_Amt', header: '預購結帳 (C2)', visible: true, format: (v) => this.formatNumber(v) },
    { field: 'TXN_TotSaleAmt_Sum', header: '銷售小計(D) = (A)', visible: true, format: (v) => this.formatNumber(v) },
    { field: 'TXN_TotExtraAmt', header: '代收/付金額 (L)', visible: true, format: (v) => this.formatNumber(v) },
    { field: 'TXN_TotHaveTax', header: '已開發票金額 (E)', visible: true, format: (v) => this.formatNumber(v) },
    { field: 'TXN_ChangeHaveTax', header: '已開溢付 (K)', visible: true, format: (v) => this.formatNumber(v) },
    { field: 'TXN_TotOver', header: '已匯送付 (I)', visible: true, format: (v) => this.formatNumber(v) },
    { field: 'TXN_TotGUI', header: '發票總金額 (F)', visible: true, format: (v) => this.formatNumber(v) },
    { field: 'GUI_NET', header: '發票未稅金額 (M)', visible: true, format: (v) => this.formatNumber(v) },
    { field: 'TXN_TotTax', header: '發票稅額 (N)', visible: true, format: (v) => this.formatNumber(v) },
    { field: 'TXN_TotGUISaleNoTax', header: '發票免稅金額 (O)', visible: true, format: (v) => this.formatNumber(v) },
    { field: 'TXN_TotOver_Sum', header: '溢收 (G)', visible: true, format: (v) => this.formatNumber(v) },
    { field: 'GUI_REFUND', header: '折讓 (J)', visible: true, format: (v) => this.formatNumber(v) },
    { field: 'TXN_TotPayAmt', header: '付款金額(H)=(D)+(G)-(C2)-(K)', visible: true, format: (v) => this.formatNumber(v) },
    { field: 'SLE_SaleAmt', header: 'Z 報表總金額', visible: true, format: (v) => this.formatNumber(v) },
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

  constructor(
    private floorService: FloorService,
    private machineDisplayService: MachinedisplayService,
    private ECRNoService: ECRNoService,
    private tls22010Service: Tls22010Service,
    public override router: Router
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS22010', '/TLS/TLS22010cru', this.queryForm, (form) => this.onSubmit(form));
    this.queryForm.patchValue({ TXN_Date: yesterday });
    this.floorService.getFloors().subscribe((data) => (this.floorOptions = data));
    this.machineDisplayService.getMachinedisplay().subscribe((data) => (this.machinedisplayOptions = data));
    this.ECRNoService.getECRNo().subscribe((data) => (this.ECRNoOptions = data));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const value = this.queryForm.value;

      // 工具：本地組 YYYY-MM-DD（不經過 toISOString，不受時區影響）
      const toYMD = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

      const params = {
        TXN_Date: value.TXN_Date ? toYMD(value.TXN_Date) : null,
        ECR_No: value.ECR_No,
        floor_noList: value.floor_noList,
        ShowStatus: value.ShowStatus,
      };

      // 小工具：把 "06/03/2025 00:00:00" 轉成 "2025-06-03"
      const toIsoDate = (mdyWithTime?: string) => {
        if (!mdyWithTime) return null;
        const mdy = mdyWithTime.split(' ')[0]; // 先拿掉時間
        const [mm, dd, yyyy] = mdy.split('/');
        return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
      };

      this.tls22010Service.queryTLS22010(params).subscribe({
        next: (res) => {
          this.data = (res?.Data ?? []).map((item: any) => ({
            ...item,
            // 統一提供 TXN_Date 給畫面用 YYYY-MM-DD
            TXN_Date: item.TXN_Date ?? toIsoDate(item.TXN_DATE),
            details: item.details ?? [],
          }));
          this.filteredData = [...this.data];
          this.totalRecords = res?.TotalCount ?? this.data.length;
          this.queryStateService.setQueryState(this.ProgNo, params);
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
