import { WhetherService } from './../../../service/basic/whether.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DisplayService } from '../../../service/basic/display.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ECRNoService } from '../../../service/basic/ECRNo.service';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
// import { LocationOptionsService } from '../../../service/API/dropdownservice/location-options.service';
@Component({
    selector: 'app-tls22030',
    templateUrl: './tls22030.component.html',
    standalone: true,
    imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarRangeQuickComponent, MultiSelectComponent, InputTextComponent, RadiobuttonComponent, ButtonComponent, TableComponent, TranslateModule]
})

export class TLS22030Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    ECR_No: [[]],
    tlt_no: [''],
    tlt_bdate_start: [null, Validators.required],
    tlt_bdate_end: [null, Validators.required],
    cashRegisterCode: [], // 收銀機編號
    counterCode: [], // 專櫃編號
    listZeroDifference: [1, []], // 差異為0是否列出
    displayCondition: [1, []], // 顯示條件
    radioOption: [null],
    ...createPaginationConfig([{ field: 'paymentTool', order: 1 }])
  });

  data: any[] = [];
  ECRNoOptions: any[] = [];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'transactionTotal', header: '總合', visible: true },
    { field: 'counterCode', header: '專櫃編號', visible: true },
    { field: 'counterName', header: '櫃位名稱', visible: true },
    { field: 'date', header: '日期', visible: true },
    { field: 'backendTransactionCode', header: '後台交易電腦', visible: true },
    { field: 'backendTransactionDetails', header: '後台交易記錄', visible: true },
    { field: 'frontendTransactionCode', header: '前台清機電腦', visible: true },
    { field: 'frontendTransactionDetails', header: '前台清機記錄', visible: true },
    { field: 'invoiceStartNumber', header: '發票號碼(起)', visible: true },
    { field: 'invoiceEndNumber', header: '發票號碼(迄)', visible: true },
    { field: 'isSameDay', header: '當日是否欠發', visible: true },
    { field: 'isCrossDay', header: '跨日是否欠發', visible: true },
  ];


  listZeroDifferenceOptions: any[] = [];
  displayConditionOptions: any[] = [];
  tlt_no?: string;
  constructor(
    private ECRNoService: ECRNoService,
    private whetherService: WhetherService,
    private displayService: DisplayService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS22030', '/TLS/TLS22030cru', this.queryForm, (form) => this.onSubmit(form));
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    this.whetherService.getWhetherOptions().subscribe((data) => {
      this.listZeroDifferenceOptions = data;
    });

    this.ECRNoService.getECRNo().subscribe((data) => {
      this.ECRNoOptions = data;
    });
  }

  canQuery(): boolean {
    return true;
  }

  canAdd(): boolean {
    return true;
  }

  canEdit(): boolean {
    return true;
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      // ✅ 假資料模擬
      this.data = [
        {
          transactionTotal: 23000,
          counterCode: 'A001',
          counterName: '男裝專櫃',
          date: '2025-06-26',
          backendTransactionCode: 'TXB123',
          backendTransactionDetails: '退款一筆、取消一筆',
          frontendTransactionCode: 'TXF456',
          frontendTransactionDetails: '現金銷售兩筆',
          invoiceStartNumber: 'AA12345678',
          invoiceEndNumber: 'AA12345680',
          isSameDay: '否',
          isCrossDay: '是',
        },
        {
          transactionTotal: 15800,
          counterCode: 'B002',
          counterName: '化妝品專櫃',
          date: '2025-06-25',
          backendTransactionCode: 'TXB789',
          backendTransactionDetails: '補登一筆',
          frontendTransactionCode: 'TXF987',
          frontendTransactionDetails: '發票開立正常',
          invoiceStartNumber: 'BB98765432',
          invoiceEndNumber: 'BB98765433',
          isSameDay: '是',
          isCrossDay: '否',
        }
      ];
    });
  }

}

