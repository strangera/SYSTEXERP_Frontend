import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
// import { NavigationExtras, Router } from '@angular/router';
// Services
// Shared
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
// import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
// import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

import { TranslateModule } from '@ngx-translate/core';
import { FIN42020Data } from '@service/api/fin/fin42020.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TableSubheaderComponent } from './fin42020-table/fin42020-table.component';

@Component({
  selector: 'app-fin42020',
  templateUrl: './fin42020.component.html',
  styleUrl: './fin42020.component.scss',
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ButtonModule, ReactiveFormsModule, CalendarComponent, DropdownComponent, RadiobuttonComponent, ButtonComponent, TableComponent, TranslateModule, TableSubheaderComponent]
})
export class FIN42020Component extends BasicQueryPageComponent<FIN42020Data> implements OnInit {
  // Upload files
  // fileType: string = '';
  // uploadUrl: string = 'https://www.primefaces.org/cdn/api/upload.php';
  queryForm = this.formBuilder.group({
    year: [],
    version: [],
    organizationNumber: ['', Validators.required],
    month: [],
    amountStart: [], // 金額 起
    amountEnd: [], // 金額 迄
    remark: [],
    status: [],
    department: [],
    unit: [],
    type: [],
  });

  // Dropdown options
  FNCCodeOptions = [];
  AccountcodeOptions = [];
  departmentOptions = [{ value: 'D001', label: '總部' }, { value: 'D002', label: '人事部' }];
  displayOptions2 = [];
  AnalysisdateCOptions = [];
  vendorOptions = [];
  FlippingstateOptions = [];
  organizationNumberOptions = [];
  statusOptions = [{ value: 1, label: '是' },
  { value: 2, label: '否' }];
  unitOptions = [{ value: 1, label: '元' },
  { value: 2, label: '千' },
  { value: 3, label: '萬' }];
  typeOptions = [{ value: 1, label: '統制' },
  { value: 2, label: '明細' },];

  // Table data
  data: FIN42020Data[] = [];
  filteredData = [...this.data];

  // 控制變數
  btnLoading = false;

  constructor(
    // private router: Router,
    // private formBuilder: FormBuilder,
    private notificationService: NotificationService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.ProgNo = '140006';
    this.initializePage('FIN42020', 'fin/fin42020cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;
    this.notificationService.blockUi();

    // if (frm.valid && this.canQuery()) {
    //   // Submit logic here
    // }

    this.loading = false;
    this.notificationService.unblockUi();

    this.data = [
      {
        STYPE_NAME: '營業收入',
        MONTH_CURRENT_AMOUNT: null,
        MONTH_CURRENT_RATIO: null,
        MONTH_LAST_AMOUNT: null,
        MONTH_LAST_RATIO: null,
        MONTH_GROWTH_RATE: null,
        MONTH_BUDGET: null,
        MONTH_BUDGET_RATE: null,

        ACC_CURRENT_AMOUNT: null,
        ACC_CURRENT_RATIO: null,
        ACC_LAST_AMOUNT: null,
        ACC_LAST_RATIO: null,
        ACC_GROWTH_RATE: null,
        ACC_BUDGET: null,
        ACC_BUDGET_RATE: null,
      },
      {
        STYPE_NAME: '營業收入合計：',
        MONTH_CURRENT_AMOUNT: 0,
        MONTH_CURRENT_RATIO: 0.0,
        MONTH_LAST_AMOUNT: 0,
        MONTH_LAST_RATIO: 0.0,
        MONTH_GROWTH_RATE: 0.0,
        MONTH_BUDGET: 0,
        MONTH_BUDGET_RATE: 0.0,

        ACC_CURRENT_AMOUNT: 0,
        ACC_CURRENT_RATIO: 0.0,
        ACC_LAST_AMOUNT: 0,
        ACC_LAST_RATIO: 0.0,
        ACC_GROWTH_RATE: 0.0,
        ACC_BUDGET: 0,
        ACC_BUDGET_RATE: 0.0,
      },
      {
        STYPE_NAME: '營業成本',
        MONTH_CURRENT_AMOUNT: null,
        MONTH_CURRENT_RATIO: null,
        MONTH_LAST_AMOUNT: null,
        MONTH_LAST_RATIO: null,
        MONTH_GROWTH_RATE: null,
        MONTH_BUDGET: null,
        MONTH_BUDGET_RATE: null,

        ACC_CURRENT_AMOUNT: null,
        ACC_CURRENT_RATIO: null,
        ACC_LAST_AMOUNT: null,
        ACC_LAST_RATIO: null,
        ACC_GROWTH_RATE: null,
        ACC_BUDGET: null,
        ACC_BUDGET_RATE: null,
      },
      {
        STYPE_NAME: '營業成本合計：',
        MONTH_CURRENT_AMOUNT: 0,
        MONTH_CURRENT_RATIO: 0.0,
        MONTH_LAST_AMOUNT: 0,
        MONTH_LAST_RATIO: 0.0,
        MONTH_GROWTH_RATE: 0.0,
        MONTH_BUDGET: 0,
        MONTH_BUDGET_RATE: 0.0,

        ACC_CURRENT_AMOUNT: 0,
        ACC_CURRENT_RATIO: 0.0,
        ACC_LAST_AMOUNT: 0,
        ACC_LAST_RATIO: 0.0,
        ACC_GROWTH_RATE: 0.0,
        ACC_BUDGET: 0,
        ACC_BUDGET_RATE: 0.0,
      },
      {
        STYPE_NAME: '營業毛利：',
        MONTH_CURRENT_AMOUNT: 0,
        MONTH_CURRENT_RATIO: null,
        MONTH_LAST_AMOUNT: 0,
        MONTH_LAST_RATIO: null,
        MONTH_GROWTH_RATE: null,
        MONTH_BUDGET: 0,
        MONTH_BUDGET_RATE: null,

        ACC_CURRENT_AMOUNT: 0,
        ACC_CURRENT_RATIO: null,
        ACC_LAST_AMOUNT: 0,
        ACC_LAST_RATIO: null,
        ACC_GROWTH_RATE: null,
        ACC_BUDGET: 0,
        ACC_BUDGET_RATE: null,
      },
      {
        STYPE_NAME: '營業費用',
        MONTH_CURRENT_AMOUNT: null,
        MONTH_CURRENT_RATIO: null,
        MONTH_LAST_AMOUNT: null,
        MONTH_LAST_RATIO: null,
        MONTH_GROWTH_RATE: null,
        MONTH_BUDGET: null,
        MONTH_BUDGET_RATE: null,

        ACC_CURRENT_AMOUNT: null,
        ACC_CURRENT_RATIO: null,
        ACC_LAST_AMOUNT: null,
        ACC_LAST_RATIO: null,
        ACC_GROWTH_RATE: null,
        ACC_BUDGET: null,
        ACC_BUDGET_RATE: null,
      },
      {
        STYPE_NAME: '營業費用合計：',
        MONTH_CURRENT_AMOUNT: 0,
        MONTH_CURRENT_RATIO: 0.0,
        MONTH_LAST_AMOUNT: 0,
        MONTH_LAST_RATIO: 0.0,
        MONTH_GROWTH_RATE: 0.0,
        MONTH_BUDGET: 0,
        MONTH_BUDGET_RATE: 0.0,

        ACC_CURRENT_AMOUNT: 0,
        ACC_CURRENT_RATIO: 0.0,
        ACC_LAST_AMOUNT: 0,
        ACC_LAST_RATIO: 0.0,
        ACC_GROWTH_RATE: 0.0,
        ACC_BUDGET: 0,
        ACC_BUDGET_RATE: 0.0,
      },
      {
        STYPE_NAME: '營業淨利(淨損)：',
        MONTH_CURRENT_AMOUNT: 0,
        MONTH_CURRENT_RATIO: null,
        MONTH_LAST_AMOUNT: 0,
        MONTH_LAST_RATIO: null,
        MONTH_GROWTH_RATE: null,
        MONTH_BUDGET: 0,
        MONTH_BUDGET_RATE: null,

        ACC_CURRENT_AMOUNT: 0,
        ACC_CURRENT_RATIO: null,
        ACC_LAST_AMOUNT: 0,
        ACC_LAST_RATIO: null,
        ACC_GROWTH_RATE: null,
        ACC_BUDGET: 0,
        ACC_BUDGET_RATE: null,
      },
      {
        STYPE_NAME: '營業外收入及支出',
        MONTH_CURRENT_AMOUNT: null,
        MONTH_CURRENT_RATIO: null,
        MONTH_LAST_AMOUNT: null,
        MONTH_LAST_RATIO: null,
        MONTH_GROWTH_RATE: null,
        MONTH_BUDGET: null,
        MONTH_BUDGET_RATE: null,

        ACC_CURRENT_AMOUNT: null,
        ACC_CURRENT_RATIO: null,
        ACC_LAST_AMOUNT: null,
        ACC_LAST_RATIO: null,
        ACC_GROWTH_RATE: null,
        ACC_BUDGET: null,
        ACC_BUDGET_RATE: null,
      },
      {
        STYPE_NAME: '營業外收入及支出合計：',
        MONTH_CURRENT_AMOUNT: 0,
        MONTH_CURRENT_RATIO: 0.0,
        MONTH_LAST_AMOUNT: 0,
        MONTH_LAST_RATIO: 0.0,
        MONTH_GROWTH_RATE: 0.0,
        MONTH_BUDGET: 0,
        MONTH_BUDGET_RATE: 0.0,

        ACC_CURRENT_AMOUNT: 0,
        ACC_CURRENT_RATIO: 0.0,
        ACC_LAST_AMOUNT: 0,
        ACC_LAST_RATIO: 0.0,
        ACC_GROWTH_RATE: 0.0,
        ACC_BUDGET: 0,
        ACC_BUDGET_RATE: 0.0,
      },
      {
        STYPE_NAME: '稅前盈餘：',
        MONTH_CURRENT_AMOUNT: 0,
        MONTH_CURRENT_RATIO: null,
        MONTH_LAST_AMOUNT: 0,
        MONTH_LAST_RATIO: null,
        MONTH_GROWTH_RATE: null,
        MONTH_BUDGET: 0,
        MONTH_BUDGET_RATE: null,

        ACC_CURRENT_AMOUNT: 0,
        ACC_CURRENT_RATIO: null,
        ACC_LAST_AMOUNT: 0,
        ACC_LAST_RATIO: null,
        ACC_GROWTH_RATE: null,
        ACC_BUDGET: 0,
        ACC_BUDGET_RATE: null,
      },
      {
        STYPE_NAME: '所得稅費用',
        MONTH_CURRENT_AMOUNT: null,
        MONTH_CURRENT_RATIO: null,
        MONTH_LAST_AMOUNT: null,
        MONTH_LAST_RATIO: null,
        MONTH_GROWTH_RATE: null,
        MONTH_BUDGET: null,
        MONTH_BUDGET_RATE: null,

        ACC_CURRENT_AMOUNT: null,
        ACC_CURRENT_RATIO: null,
        ACC_LAST_AMOUNT: null,
        ACC_LAST_RATIO: null,
        ACC_GROWTH_RATE: null,
        ACC_BUDGET: null,
        ACC_BUDGET_RATE: null,
      },
      {
        STYPE_NAME: '所得稅費用合計：',
        MONTH_CURRENT_AMOUNT: 0,
        MONTH_CURRENT_RATIO: 0.0,
        MONTH_LAST_AMOUNT: 0,
        MONTH_LAST_RATIO: 0.0,
        MONTH_GROWTH_RATE: 0.0,
        MONTH_BUDGET: 0,
        MONTH_BUDGET_RATE: 0.0,

        ACC_CURRENT_AMOUNT: 0,
        ACC_CURRENT_RATIO: 0.0,
        ACC_LAST_AMOUNT: 0,
        ACC_LAST_RATIO: 0.0,
        ACC_GROWTH_RATE: 0.0,
        ACC_BUDGET: 0,
        ACC_BUDGET_RATE: 0.0,
      },
      {
        STYPE_NAME: '本期淨利(淨損)：',
        MONTH_CURRENT_AMOUNT: 0,
        MONTH_CURRENT_RATIO: null,
        MONTH_LAST_AMOUNT: 0,
        MONTH_LAST_RATIO: null,
        MONTH_GROWTH_RATE: null,
        MONTH_BUDGET: 0,
        MONTH_BUDGET_RATE: null,

        ACC_CURRENT_AMOUNT: 0,
        ACC_CURRENT_RATIO: null,
        ACC_LAST_AMOUNT: 0,
        ACC_LAST_RATIO: null,
        ACC_GROWTH_RATE: null,
        ACC_BUDGET: 0,
        ACC_BUDGET_RATE: null,
      },
    ]
  }
}