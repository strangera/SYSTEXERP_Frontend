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
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { createPaginationConfig, Column } from 'src/app/shared/componentkit/table/table.model';
import { ButtonModule } from 'primeng/button';

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
    DropdownComponent,
    ButtonModule,
  ],
})
export class TLS22010Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    TXN_Date: [null as Date | null, { validators: [Validators.required], updateOn: 'change' }],
    floor_noList: [[]],
    ECR_No: [''],
    ShowStatus: [null],
    status1: [''],
    status2: [''],
    ...createPaginationConfig([{ field: 'ECR_No', order: 1 }]),
  });

  totalRecords = 0;
  data: any[] = [];
  filteredData: any[] = [...this.data];
  columns7: Column[] = [
    { field: 'ECR_No', header: '收據機代碼', visible: true },
    { field: 'AREA_NO', header: '區域', visible: true },
    { field: 'FLOOR_NO', header: '樓層', visible: true },
    { field: 'TXN_TotSaleAmt', header: '銷售金額 (A)', visible: true },
    { field: 'sad_preorder_Amt', header: '預購金額', visible: true },
    { field: 'sad_settle_Amt', header: '預購結帳 (C2)', visible: true },
    { field: 'TXN_TotSaleAmt_Sum', header: '銷售小計(D) = (A)', visible: true },
    { field: 'TXN_TotExtraAmt', header: '代收/付金額 (L)', visible: true },
    { field: 'TXN_TotHaveTax', header: '已開發票金額 (E)', visible: true },
    { field: 'TXN_ChangeHaveTax', header: '已開溢付 (K)', visible: true },
    { field: 'TXN_TotOver', header: '已匯送付 (I)', visible: true },
    { field: 'TXN_TotGUI', header: '發票總金額 (F)', visible: true },
    { field: 'GUI_NET', header: '發票未稅金額 (M)', visible: true },
    { field: 'TXN_TotTax', header: '發票稅額 (N)', visible: true },
    { field: 'TXN_TotGUISaleNoTax', header: '發票免稅金額 (O)', visible: true },
    { field: 'TXN_TotOver_Sum', header: '溢收 (G)', visible: true },
    { field: 'GUI_REFUND', header: '折讓 (J)', visible: true },
    { field: 'TXN_TotPayAmt', header: '付款金額(H)=(D)+(G)-(C2)-(K)', visible: true },
    { field: 'SLE_SaleAmt', header: 'Z 報表總金額', visible: true },
    { field: 'TXN_Mode_P', header: '後台(作廢/補登)', visible: true },
    { field: 'Status_Code', header: '狀態', visible: true },
  ];

  expansionColumns7: Column[] = [
    { field: 'TXN_No', header: '交易序號' },
    { field: 'TXN_GUIBegNo', header: '起始發票號' },
    { field: 'TXN_GUIEndNo', header: '結束發票號' },
    { field: 'TXN_TotSaleAmt', header: '銷售金額 (A)' },
    { field: 'sad_preorder_Amt', header: '預購金額' },
    { field: 'sad_settle_Amt', header: '預購結帳 (C2)' },
    { field: 'TXN_TotSaleAmt_Sum', header: '銷售小計(D) = (A)' },
    { field: 'TXN_TotExtraAmt', header: '代收/付金額 (L)' },
    { field: 'TXN_TotHaveTax', header: '已開發票金額 (E)' },
    { field: 'TXN_ChangeHaveTax', header: '已開溢付 (K)' },
    { field: 'TXN_TotOver', header: '已匯送付 (I)' },
    { field: 'TXN_TotGUI', header: '發票總金額 (F)' },
    { field: 'GUI_NET', header: '發票未稅金額 (M)' },
    { field: 'TXN_TotTax', header: '發票稅額 (N)' },
    { field: 'TXN_TotGUISaleNoTax', header: '發票免稅金額 (O)' },
    { field: 'TXN_TotOver_Sum', header: '溢收 (G)' },
    { field: 'GUI_REFUND', header: '折讓 (J)' },
    { field: 'TXN_TotPayAmt', header: '付款金額(H)' }
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
    private tls22010Service: Tls22010Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS22010', '/TLS/TLS22010cru', this.queryForm, (form) => this.onSubmit(form));
    this.queryForm.patchValue({ TXN_Date: new Date() });

    this.floorService.getFloors().subscribe((data) => (this.floorOptions = data));
    this.machineDisplayService.getMachinedisplay().subscribe((data) => (this.machinedisplayOptions = data));
    this.ECRNoService.getECRNo().subscribe((data) => (this.ECRNoOptions = data));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const value = this.queryForm.value;
      const params = {
        TXN_Date: value.TXN_Date ? new Date(value.TXN_Date).toISOString().split('T')[0] : null,
        ECR_No: value.ECR_No,
        floor_noList: value.floor_noList,
        ShowStatus: value.ShowStatus,
      };

      this.tls22010Service.queryTLS22010(params).subscribe({
        next: (res) => {
          this.data = (res?.Data ?? []).map((item: { details?: any }) => ({ ...item, details: item.details ?? [] }));
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
  onRowExpand(event: any) {
    const rowData = event.data;

    const params = {
      TXN_Date: this.queryForm.value.TXN_Date?.toISOString().split('T')[0],
      ECR_No: rowData.ECR_No
    };

    this.tls22010Service.queryTLS22010_Detail(params).subscribe({
      next: (res) => {
        rowData.details = res?.Data ?? [];
      },
      error: (err) => {
        console.error('查詢明細失敗:', err);
        rowData.details = [];
      }
    });
  }

  exportReport = () => {
    const raw = this.queryForm.getRawValue();
    const payload = {
      FileName: '第三方支付帳差報表',
      ReportTitle: '第三方支付帳差報表',
      TXN_Date: raw.TXN_Date ? raw.TXN_Date.toISOString().split('T')[0] : null,
      ECR_No: raw.ECR_No,
      floor_noList: raw.floor_noList,
      ShowStatus: raw.ShowStatus,
    };

    this.exportExcelLoading = true;
    this.tls22010Service.queryTLS22010_Detail(payload).subscribe({
      next: (res: Blob) => {
        const blob = new Blob([res], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${payload.FileName}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        this.exportExcelLoading = false;
      },
      error: (err) => {
        console.error('TLS22010 匯出失敗', err);
        this.exportExcelLoading = false;
      },
    });
  };

}
