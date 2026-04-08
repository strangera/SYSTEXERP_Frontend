import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
// import { NavigationExtras, Router } from '@angular/router';
// Services
// Shared
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
// import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
// import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

import { TranslateModule } from '@ngx-translate/core';
import { FIN42030Data } from '@service/api/fin/fin42030.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { AccordionModule } from 'primeng/accordion';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TableSubheaderComponent } from './fin42030-table/fin42030-table.component';

@Component({
  selector: 'app-fin42030',
  templateUrl: './fin42030.component.html',
  styleUrl: './fin42030.component.scss',
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarComponent, DropdownComponent, RadiobuttonComponent, ButtonComponent, TableComponent, TranslateModule, TableSubheaderComponent]
})
export class FIN42030Component extends BasicQueryPageComponent<FIN42030Data> implements OnInit {
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
  departmentOptions = [];
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
  data: FIN42030Data[] = [];
  filteredData = [...this.data];
  columns = [
    { field: 'subjectName', header: '科目名稱', visible: true },
    { field: 'currentAmount', header: '本期金額', visible: true },
    { field: 'currentRatio', header: '本期佔比(%)', visible: true },
    { field: 'budgetAmount', header: '預算同期金額', visible: true },
    { field: 'budgetRatio', header: '預算同期佔比(%)', visible: true },
    { field: 'growthRate', header: '預算同期增減率(%)', visible: true },
    { field: 'currentTotalAmount', header: '本期累計金額', visible: true },
    { field: 'currentTotalRatio', header: '本期累計佔比(%)', visible: true },
    { field: 'totalBudgetAmount', header: '預算累計金額', visible: true },
    { field: 'totalBudgetRatio', header: '預算累計佔比(%)', visible: true },
    { field: 'totalGrowthRate', header: '增減率(%)', visible: true }
  ];


  constructor(
    // private router: Router,
    // private formBuilder: FormBuilder,
    private notificationService: NotificationService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.ProgNo = '140007';
    this.initializePage('FIN42030', 'fin/fin42030cru', this.queryForm, (form) => this.onSubmit(form));
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
      // 營業收入
      {
        subjectName: '營業收入',
        currentAmount: null,
        currentRatio: null,
        budgetAmount: null,
        budgetRatio: null,
        growthRate: null,
        currentTotalAmount: null,
        currentTotalRatio: null,
        totalBudgetAmount: null,
        totalBudgetRatio: null,
        totalGrowthRate: null
      },
      {
        subjectName: '4101銷貨收入',
        currentAmount: 0,
        currentRatio: 0,
        budgetAmount: 0,
        budgetRatio: 0,
        growthRate: 0,
        currentTotalAmount: 0,
        currentTotalRatio: 0,
        totalBudgetAmount: 0,
        totalBudgetRatio: 0,
        totalGrowthRate: 0
      },
      {
        subjectName: '4121銷貨折讓',
        currentAmount: 0,
        currentRatio: 0,
        budgetAmount: 0,
        budgetRatio: 0,
        growthRate: 0,
        currentTotalAmount: 0,
        currentTotalRatio: 0,
        totalBudgetAmount: 0,
        totalBudgetRatio: 0,
        totalGrowthRate: 0
      },
      {
        subjectName: '4201營業租金收入',
        currentAmount: 0,
        currentRatio: 0,
        budgetAmount: 0,
        budgetRatio: 0,
        growthRate: 0,
        currentTotalAmount: 0,
        currentTotalRatio: 0,
        totalBudgetAmount: 0,
        totalBudgetRatio: 0,
        totalGrowthRate: 0
      },
      {
        subjectName: '4301其他營業收入',
        currentAmount: 0,
        currentRatio: 0,
        budgetAmount: 0,
        budgetRatio: 0,
        growthRate: 0,
        currentTotalAmount: 0,
        currentTotalRatio: 0,
        totalBudgetAmount: 0,
        totalBudgetRatio: 0,
        totalGrowthRate: 0
      },
      {
        subjectName: '4304其他營業收入-扣款',
        currentAmount: 0,
        currentRatio: 0,
        budgetAmount: 0,
        budgetRatio: 0,
        growthRate: 0,
        currentTotalAmount: 0,
        currentTotalRatio: 0,
        totalBudgetAmount: 0,
        totalBudgetRatio: 0,
        totalGrowthRate: 0
      },
      {
        subjectName: '營業收入合計：',
        currentAmount: 0,
        currentRatio: 0,
        budgetAmount: 0,
        budgetRatio: 0,
        growthRate: 0,
        currentTotalAmount: 0,
        currentTotalRatio: 0,
        totalBudgetAmount: 0,
        totalBudgetRatio: 0,
        totalGrowthRate: 0
      },

      // 營業成本
      {
        subjectName: '營業成本',
        currentAmount: null,
        currentRatio: null,
        budgetAmount: null,
        budgetRatio: null,
        growthRate: null,
        currentTotalAmount: null,
        currentTotalRatio: null,
        totalBudgetAmount: null,
        totalBudgetRatio: null,
        totalGrowthRate: null
      },
      {
        subjectName: '5101銷貨成本',
        currentAmount: 0,
        currentRatio: 0,
        budgetAmount: 0,
        budgetRatio: 0,
        growthRate: 0,
        currentTotalAmount: 0,
        currentTotalRatio: 0,
        totalBudgetAmount: 0,
        totalBudgetRatio: 0,
        totalGrowthRate: 0
      },
      {
        subjectName: '5111進貨',
        currentAmount: 0,
        currentRatio: 0,
        budgetAmount: 0,
        budgetRatio: 0,
        growthRate: 0,
        currentTotalAmount: 0,
        currentTotalRatio: 0,
        totalBudgetAmount: 0,
        totalBudgetRatio: 0,
        totalGrowthRate: 0
      },
      {
        subjectName: '5115進貨退回',
        currentAmount: 0,
        currentRatio: 0,
        budgetAmount: 0,
        budgetRatio: 0,
        growthRate: 0,
        currentTotalAmount: 0,
        currentTotalRatio: 0,
        totalBudgetAmount: 0,
        totalBudgetRatio: 0,
        totalGrowthRate: 0
      },
      {
        subjectName: '5201其他營業支出',
        currentAmount: 0,
        currentRatio: 0,
        budgetAmount: 0,
        budgetRatio: 0,
        growthRate: 0,
        currentTotalAmount: 0,
        currentTotalRatio: 0,
        totalBudgetAmount: 0,
        totalBudgetRatio: 0,
        totalGrowthRate: 0
      },
      {
        subjectName: '營業成本合計：',
        currentAmount: 0,
        currentRatio: 0,
        budgetAmount: 0,
        budgetRatio: 0,
        growthRate: 0,
        currentTotalAmount: 0,
        currentTotalRatio: 0,
        totalBudgetAmount: 0,
        totalBudgetRatio: 0,
        totalGrowthRate: 0
      },

      // 毛利
      {
        subjectName: '營業毛利：',
        currentAmount: 0,
        currentRatio: null,
        budgetAmount: 0,
        budgetRatio: null,
        growthRate: null,
        currentTotalAmount: 0,
        currentTotalRatio: null,
        totalBudgetAmount: 0,
        totalBudgetRatio: null,
        totalGrowthRate: null
      },

      // 營業費用
      {
        subjectName: '營業費用',
        currentAmount: null,
        currentRatio: null,
        budgetAmount: null,
        budgetRatio: null,
        growthRate: null,
        currentTotalAmount: null,
        currentTotalRatio: null,
        totalBudgetAmount: null,
        totalBudgetRatio: null,
        totalGrowthRate: null
      },
      {
        subjectName: '6101薪資',
        currentAmount: 0,
        currentRatio: 0,
        budgetAmount: 0,
        budgetRatio: 0,
        growthRate: 0,
        currentTotalAmount: 0,
        currentTotalRatio: 0,
        totalBudgetAmount: 0,
        totalBudgetRatio: 0,
        totalGrowthRate: 0
      },
      {
        subjectName: '6102租金支出',
        currentAmount: 0,
        currentRatio: 0,
        budgetAmount: 0,
        budgetRatio: 0,
        growthRate: 0,
        currentTotalAmount: 0,
        currentTotalRatio: 0,
        totalBudgetAmount: 0,
        totalBudgetRatio: 0,
        totalGrowthRate: 0
      },
      {
        subjectName: '6103文具用品',
        currentAmount: 0,
        currentRatio: 0,
        budgetAmount: 0,
        budgetRatio: 0,
        growthRate: 0,
        currentTotalAmount: 0,
        currentTotalRatio: 0,
        totalBudgetAmount: 0,
        totalBudgetRatio: 0,
        totalGrowthRate: 0
      },
      {
        subjectName: '6104旅費',
        currentAmount: 0,
        currentRatio: 0,
        budgetAmount: 0,
        budgetRatio: 0,
        growthRate: 0,
        currentTotalAmount: 0,
        currentTotalRatio: 0,
        totalBudgetAmount: 0,
        totalBudgetRatio: 0,
        totalGrowthRate: 0
      },
      {
        subjectName: '6105運費',
        currentAmount: 0,
        currentRatio: 0,
        budgetAmount: 0,
        budgetRatio: 0,
        growthRate: 0,
        currentTotalAmount: 0,
        currentTotalRatio: 0,
        totalBudgetAmount: 0,
        totalBudgetRatio: 0,
        totalGrowthRate: 0
      },
      {
        subjectName: '6106郵電費',
        currentAmount: 0,
        currentRatio: 0,
        budgetAmount: 0,
        budgetRatio: 0,
        growthRate: 0,
        currentTotalAmount: 0,
        currentTotalRatio: 0,
        totalBudgetAmount: 0,
        totalBudgetRatio: 0,
        totalGrowthRate: 0
      },
      {
        subjectName: '6107修繕費',
        currentAmount: 0,
        currentRatio: 0,
        budgetAmount: 0,
        budgetRatio: 0,
        growthRate: 0,
        currentTotalAmount: 0,
        currentTotalRatio: 0,
        totalBudgetAmount: 0,
        totalBudgetRatio: 0,
        totalGrowthRate: 0
      },
      {
        subjectName: '6108雜費',
        currentAmount: 0,
        currentRatio: 0,
        budgetAmount: 0,
        budgetRatio: 0,
        growthRate: 0,
        currentTotalAmount: 0,
        currentTotalRatio: 0,
        totalBudgetAmount: 0,
        totalBudgetRatio: 0,
        totalGrowthRate: 0
      }
    ];
  }

}
