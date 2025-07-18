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
  columns: any[] = [
    {
      field: 'tlt_building',
      header: '館別',
      visible: true,
      format: (value: any) =>
        this.getLabelFromOptions(value, this.BUILDING_NO_Options),
    },
    { field: 'tlt_building', header: '館別', visible: true },
     {field: 'tlt_floor', header: '樓層', visible: true },
    { field: 'tlt_no', header: '收銀機號', visible: true },
    { field: 'tlt_name', header: '收銀員編號/姓名', visible: true },
    { field: 'PAY_NAME', header: '付款別', visible: true },
    { field: 'systemTotal', header: '系統帳', visible: true },
    { field: 'category', header: '溢欠差異(自我報帳-系統帳)', visible: true },
    { field: 'category', header: '實收帳', visible: true },
    { field: 'category', header: '溢欠差異(實收-系統帳)', visible: true },
  ];

  queryForm = this.formBuilder.group({
    TXN_Date: [null, [Validators.required]],
    ECR_No: [], // 收銀機機號
    TLT_No: [],
    cahserType: [],
    reimbursementType: [[], Validators.nullValidator],
    cashShowUp: [],
    tlt_building: [],
    tlt_floor: [],
    DecimalPipe,
    ...createPaginationConfig([{ field: 'TXN_Date', order: 1 }]),
  });
  

  constructor(
    private cahserTypeService: CahserTypeService,

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

    this.data = [
      {
        contactPerson: 'A001',
        contactDate: '2025-07-15',
        UID: '信用卡',
        industryType: '1000',
        category: '200',
      },
    ];
    this.totalRecords = this.data.length;
    this.queryStateService.setQueryState(this.ProgNo, payload);
    this.loading = false;
    this.messageService.unblockUi();
  }

  onClearForm(): void {
    this.queryForm.reset();
  }
    getLabelFromOptions(value: any, options: any[]): string {
    const found = options?.find(opt => String(opt.value) === String(value));
    return found ? found.label : value;
  }
}
