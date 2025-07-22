import { Component } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { CahserTypeService } from '../../../service/basic/cahser-type.service';
import { CashShowupByService } from '../../../service/basic/cash-showup-by.service';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
// UI Imports
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { ECRNoService } from '../../../service/basic/ECRNo.service';
import { CounterNameService } from '../../../service/basic/counter-name.service';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { FloorService } from '../../../service/basic/floor.service';
import { DecimalPipe } from '@angular/common';
import { TLS2B010Service } from '../../../service/api/tls/tls2-b010.service';
import { DatePipe } from '@angular/common';

import { ReimbursementYypeService } from './../../../service/basic/reimbursement-yype.service';

@Component({
  selector: 'app-tls2b010',
  templateUrl: './tls2b010.component.html',
  styleUrl: './tls2b010.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarComponent,
    DropdownComponent,
    MultiSelectComponent,
    RadiobuttonComponent,
    ButtonComponent,
    TableComponent,
    TranslateModule,
    DatePipe
  ],
})
export class TLS2B010Component extends BasicQueryPageComponent<any> {
  ECRNoOptions: any[] = []; // 收銀機號下拉選單
  data: any[] = [];
  cahserTypeOptions: any[] = [];
  CashShowupByOptions: any[] = [];
  selectedItems: any[] = [];
  totalRecords = 0;
  CounterOptions: any[] = []; // 專櫃選項
  BUILDING_NO_Options: any[] = [];
  floorOptions: any[] = [];
  reimbursementOptions: any[] =    [
    { value: 1, label: '系統帳', disabled: true },
    { value: 2, label: '自我報帳' },
    { value: 3, label: '實收帳' },
  ];
columns: any[] = [

 {
    field: 'tlt_building',
    header: '館別',
    visible: true,
  },
  {
    field: 'tlt_floor',
    header: '樓層',
    visible: true,
  },

  {
    field: 'ECR_No',
    header: '收銀機號',
    visible: true,
  },
    {
    field: 'USR_No',
    header: '收銀員編號/姓名',
    visible: true,
  },
  // {
  //   field: 'TLT_NO',
  //   header: '專櫃編號',
  //   visible: true,
  // },
  {
    field: 'PAY_NO',
    header: '付款別',
    visible: true,
  },
    {
    field: 'BOOK_PayAmt',
    header: '系統帳',
    visible: true, style: 'text-right', format: this.moneyFormat


  },
  {
    field: 'BOOK_PayAmt',
    header: '自我報帳',
    visible: true, style: 'text-right', format: this.moneyFormat


  },
    {
    field: 'MOD_PayAmt',
    header: '溢欠差異(自我報帳 - 系統帳)',
    visible: false,
  },
  {
    field: 'ACT_PayAmt',
    header: '實收帳',
    visible: true, style: 'text-right', format: this.moneyFormat


  },
  {
    field: 'OVER_PayAmt',
    header: '溢欠差異(實收 - 系統帳)',
    visible: true
    , style: 'text-right', format: this.moneyFormat


  },


];


queryForm = this.formBuilder.group({
  TXN_Date: [null, [Validators.required]],    // 單日查詢（必填）
  DateStart: [null],                          // 區間查詢（簡表用）
  DateEnd: [null],

  ECR_No_List: [[]],                          // 收銀機號（多選）
  TLT_No_List: [[]],                          // 專櫃編號（多選）
  ECR_Type: [null],                           // 收銀機類型（統收/自收）

  tlt_building: [null],                       // 館別
  tlt_floor: [null],                          // 樓層
  area_no: [null],                            // 區域

  reimbursementType: [[1], Validators.nullValidator], // 顯示欄位
  cashShowUp: [null],                         // 顯示方式（radio）

  ...createPaginationConfig([{ field: 'TXN_Date', order: 1 }]),
});


  
  moneyFormat(value: number): string {
    return value != null ? value.toLocaleString('en-US') : '0'; // ✅ 使用美式格式
  }
  constructor(
    private cahserTypeService: CahserTypeService,
    private tls2B010Service:TLS2B010Service,
    private cashShowupByService: CashShowupByService,
    public override messageService: NotificationService,
    private ECRNoService: ECRNoService,
    private counterNameService: CounterNameService,
    private tls11010Service: Tls11010Service,
    private floorService: FloorService,
    
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage(
      'TLS2B010',
      '/tls2000/tls2B010cru',
      this.queryForm,
      (form) => this.onSubmit(form),
    );
    this.ECRNoService.getECRNo().subscribe((res) => {
      this.ECRNoOptions =
        res?.map((x: any) => ({
          label: x.label, // 給 table 用
          formLabel: `${x.value} - ${x.label}`, // 給下拉選單用
          value: x.value,
        })) || [];
    });
    this.counterNameService.getCounters().subscribe((res) => {
      this.CounterOptions =
        res?.map((x: any) => ({
          label: x.label, // 給 table 用
          formLabel: `${x.value} - ${x.label}`, // 給下拉選單用
          value: x.value,
        })) || [];
    });

    this.cahserTypeService.getSystemTypes().subscribe((data) => {
      this.cahserTypeOptions = data;
    });

    this.cashShowupByService.getSystemTypes().subscribe((data) => {
      this.CashShowupByOptions = data;
    });
    this.floorService
      .getFloors()
      .subscribe((data) => (this.floorOptions = data));
    this.tls11010Service
      .getBuildingOptions()
      .subscribe((res) => (this.BUILDING_NO_Options = res));
        
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
      payload[key] = payload[key].trim();
      if (payload[key] === '') payload[key] = null;
    }
  });

  this.loading = true;
  this.messageService.blockUi();

  this.tls2B010Service.queryTLS2B010(payload).subscribe({
    next: (res) => {
      if (res?.Status === '0000') {
        this.data = res.Data || [];
        this.totalRecords = res.TotalCount || 0;
        this.queryStateService.setQueryState(this.ProgNo, payload);
      } else {
        this.messageService.errorBubble(res?.Message || '查詢失敗');
      }
    },
    error: () => {
      this.messageService.errorBubble('查詢失敗，請稍後再試');
    },
    complete: () => {
      this.loading = false;
      this.messageService.unblockUi();
    }
  });
}


  onClearForm(): void {
    this.queryForm.reset();
  }
    getLabelFromOptions(value: any, options: any[]): string {
    const found = options?.find(opt => String(opt.value) === String(value));
    return found ? found.label : value;
  }
}
