import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
  ],
})
export class TLS22010Component extends BasicQueryPageComponent<any> implements OnInit {

  queryForm = this.formBuilder.group({
    TXN_Date: [null],           // 對應原本的 salesDate
    floor_noList: [[]],         // 對應原本的 tlt_floor
    ECR_No: [[]],               // 名稱已正確
    ShowStatus: [null],         // 對應原本的 radioOption
    status1: [''],
    status2: [''],
  });

  // 表格資料
  data: any[] = [];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'collectionMachineCode', header: '收據機代碼', visible: true },
    { field: 'line', header: '線號', visible: true },
    { field: 'district', header: '區域', visible: true },
    { field: 'floor', header: '樓層', visible: true },
    { field: 'salesAmountA', header: '銷售金額 (A)', visible: true },
    { field: 'depositAmount', header: '預購金額', visible: true },
    { field: 'refundAmountC2', header: '預購結帳 (C2)', visible: true },
    { field: 'discountD', header: '銷售小計(D) = (A)', visible: true },
    { field: 'agencyFeeL', header: '代收/付金額 (L)', visible: true },
    { field: 'invoicedAmountE', header: '已開發票金額 (E)', visible: true },
    { field: 'reportedAmountK', header: '已開溢付 (K)', visible: true },
    { field: 'remittedAmountI', header: '已匯送付 (I)', visible: true },
    { field: 'invoiceTotalAmountF', header: '發票總金額 (F)', visible: true },
    { field: 'invoiceNoTaxAmountM', header: '發票未稅金額 (M)', visible: true },
    { field: 'invoiceTaxAmountN', header: '發票稅額 (N)', visible: true },
    { field: 'invoiceCashAmountO', header: '發票免稅金額 (O)', visible: true },
    { field: 'collectionAmountG', header: '溢收 (G)', visible: true },
    { field: 'discountJ', header: '折讓 (J)', visible: true },
    { field: 'paymentAmountH', header: '付款金額(H)=(D)+(G)-(C2)-(K)', visible: true },
    { field: 'zReportAmount', header: 'Z 報表總金額', visible: true },
    { field: 'kioskOperation', header: '後台(作廢/補登)', visible: true },
    { field: 'status', header: '狀態', visible: true },
  ];
  statusOptions = [
    { label: '全部', value: 'all' },
    { label: '正常', value: 'normal' },
    { label: '異常', value: 'abnormal' }
  ];

  // 樓層選項
  floorOptions: any[] = [];
  // 收銀機顯示選項
  machinedisplayOptions: any[] = [];
  ECRNoOptions: any[] = [];
  constructor(
    private floorService: FloorService,
    private machineDisplayService: MachinedisplayService,
    private ECRNoService: ECRNoService
    // private messageService: NotificationService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS22010', '/TLS/TLS22010cru', this.queryForm, (form) => this.onSubmit(form));
    // 初始化權限
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    // 加載樓層選項
    this.floorService.getFloors().subscribe((data) => {
      this.floorOptions = data;
    });

    // 加載收銀機顯示選項
    this.machineDisplayService.getMachinedisplay().subscribe((data) => {
      this.machinedisplayOptions = data;
    });

    this.ECRNoService.getECRNo().subscribe((data) => {
      this.ECRNoOptions = data;
    });

  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const value = this.queryForm.value;


      const params = {
        TXN_Date: value.TXN_Date
          ? new Date(value.TXN_Date).toISOString().split('T')[0]
          : null,
        ECR_No: value.ECR_No,
        floor_noList: value.floor_noList,
        ShowStatus: value.ShowStatus,
      };
      console.log('Query Parameters:', params); // Example usage

      this.data = [];
    });
  }



  // // Handle Radio Button Selection
  // onRadioSelect(selected: string): void {
  //   if (selected === 'floor') {
  //     this.queryForm.controls.floorRadio.setValue('floor');
  //     this.queryForm.controls.machineCodeRadio.setValue(''); // Deselect 收銀機代碼
  //   } else if (selected === 'machineCode') {
  //     this.queryForm.controls.machineCodeRadio.setValue('machineCode');
  //     this.queryForm.controls.floorRadio.setValue(''); // Deselect 樓層
  //   }
  // }

}
