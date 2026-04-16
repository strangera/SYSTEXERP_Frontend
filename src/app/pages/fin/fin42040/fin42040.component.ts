import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
// Services
// Shared
import { NotificationService } from '../../../shared/component/notification-message/notification.service';

import { TranslateModule } from '@ngx-translate/core';
import { FIN42040Data } from '@service/api/fin/fin42040.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { AccordionModule } from 'primeng/accordion';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TableSubheaderComponent } from './fin42040-table/fin42040-table.component';

@Component({
  selector: 'app-fin42040',
  templateUrl: './fin42040.component.html',
  styleUrl: './fin42040.component.scss',
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarComponent, DropdownComponent, RadiobuttonComponent, ButtonComponent, TableComponent, TranslateModule, TableSubheaderComponent]
})
export class FIN42040Component extends BasicQueryPageComponent<FIN42040Data> implements OnInit {
  // Upload files
  // fileType: string = '';
  // uploadUrl: string = 'https://www.primefaces.org/cdn/api/upload.php';
  queryForm = this.formBuilder.group({
    year: [],
    version: [],
    organizationNumber: [, Validators.required],
    month: [],
    amountStart: [], // 金額 起
    amountEnd: [], // 金額 迄
    remark: [],
    status: [],
    department: [],
    unit: [],
    type: [],
    compareyear: [],
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


  // 用於顯示在表格標題上的比較年月，例如 "2026年01月"
  compareMonthLabel = '';
  compareYearValue = this.queryForm.get('compareyear')?.value;

  isShowCompareMonthLabel = false; // 是否顯示比較年月標籤

  // Table data
  data: FIN42040Data[] = [];
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
    this.ProgNo = '140008';
    this.initializePage('FIN42040', 'fin/fin42040cru', this.queryForm, (form) => this.onSubmit(form));
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

    this.compareYearValue = frm.value.compareyear;
    // 根據 compareyear 的值動態設定 compareMonthLabel，例如 "2026年01月"
    if (this.compareYearValue) {
      const date = new Date(this.compareYearValue);
      const year = date.getFullYear() - 1911; // 西元年轉民國年
      const month = String(date.getMonth() + 1).padStart(2, '0');

      this.compareMonthLabel = `${year}年${month}月`;
    } else {
      this.compareMonthLabel = '';
    }
    // 如果 compareDate 有值則顯示比較年月標籤，否則隱藏
    this.isShowCompareMonthLabel = !!this.compareYearValue;

    this.data = [
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
        totalGrowthRate: null,
      },
      {
        subjectName: '4101銷貨收入',
        currentAmount: 59736807,
        currentRatio: 81.0,
        budgetAmount: 52432592,
        budgetRatio: 77.25,
        growthRate: 13.93,
        currentTotalAmount: 59736807,
        currentTotalRatio: 81.0,
        totalBudgetAmount: 52432592,
        totalBudgetRatio: 77.25,
        totalGrowthRate: 13.93,
      },
      {
        subjectName: '4121銷貨折讓',
        currentAmount: -1615089,
        currentRatio: -2.19,
        budgetAmount: -845372,
        budgetRatio: -1.25,
        growthRate: 91.04,
        currentTotalAmount: -1615089,
        currentTotalRatio: -2.19,
        totalBudgetAmount: -845372,
        totalBudgetRatio: -1.25,
        totalGrowthRate: 91.04,
      },
      {
        subjectName: '4201營業租金收入',
        currentAmount: 7344077,
        currentRatio: 9.96,
        budgetAmount: 7531472,
        budgetRatio: 11.10,
        growthRate: -2.49,
        currentTotalAmount: 7344077,
        currentTotalRatio: 9.96,
        totalBudgetAmount: 7531472,
        totalBudgetRatio: 11.10,
        totalGrowthRate: -2.49,
      },
      {
        subjectName: '4301其他營業收入',
        currentAmount: 1574000,
        currentRatio: 2.13,
        budgetAmount: 1891572,
        budgetRatio: 2.79,
        growthRate: -16.79,
        currentTotalAmount: 1574000,
        currentTotalRatio: 2.13,
        totalBudgetAmount: 1891572,
        totalBudgetRatio: 2.79,
        totalGrowthRate: -16.79,
      },
      {
        subjectName: '4302其他營業收入扣款',
        currentAmount: 6713066,
        currentRatio: 9.10,
        budgetAmount: 6861445,
        budgetRatio: 10.11,
        growthRate: -2.16,
        currentTotalAmount: 6713066,
        currentTotalRatio: 9.10,
        totalBudgetAmount: 6861445,
        totalBudgetRatio: 10.11,
        totalGrowthRate: -2.16,
      },
      {
        subjectName: '營業收入合計：',
        currentAmount: 73752921,
        currentRatio: 100.0,
        budgetAmount: 67871109,
        budgetRatio: 100.0,
        growthRate: 8.67,
        currentTotalAmount: 73752921,
        currentTotalRatio: 100.0,
        totalBudgetAmount: 67871109,
        totalBudgetRatio: 100.0,
        totalGrowthRate: 8.67,
      },
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
        totalGrowthRate: null,
      },
      {
        subjectName: '5101銷貨成本',
        currentAmount: 14559353,
        currentRatio: 19.74,
        budgetAmount: 12421952,
        budgetRatio: 18.30,
        growthRate: 17.21,
        currentTotalAmount: 14559353,
        currentTotalRatio: 19.74,
        totalBudgetAmount: 12421952,
        totalBudgetRatio: 18.30,
        totalGrowthRate: 17.21,
      },
      {
        subjectName: '5201其他營業支出',
        currentAmount: 916550,
        currentRatio: 1.24,
        budgetAmount: 794930,
        budgetRatio: 1.17,
        growthRate: 15.30,
        currentTotalAmount: 916550,
        currentTotalRatio: 1.24,
        totalBudgetAmount: 794930,
        totalBudgetRatio: 1.17,
        totalGrowthRate: 15.30,
      },
      {
        subjectName: '營業成本合計：',
        currentAmount: 15475903,
        currentRatio: 20.98,
        budgetAmount: 13216882,
        budgetRatio: 19.47,
        growthRate: 17.09,
        currentTotalAmount: 15475903,
        currentTotalRatio: 20.98,
        totalBudgetAmount: 13216882,
        totalBudgetRatio: 19.47,
        totalGrowthRate: 17.09,
      },
      {
        subjectName: '營業毛利：',
        currentAmount: 58277018,
        currentRatio: null,
        budgetAmount: 54654227,
        budgetRatio: null,
        growthRate: null,
        currentTotalAmount: 58277018,
        currentTotalRatio: null,
        totalBudgetAmount: 54654227,
        totalBudgetRatio: null,
        totalGrowthRate: null,
      },
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
        totalGrowthRate: null,
      },
      {
        subjectName: '6101薪資',
        currentAmount: 3378008,
        currentRatio: 4.58,
        budgetAmount: 3415298,
        budgetRatio: 5.03,
        growthRate: -1.09,
        currentTotalAmount: 3378008,
        currentTotalRatio: 4.58,
        totalBudgetAmount: 3415298,
        totalBudgetRatio: 5.03,
        totalGrowthRate: -1.09,
      },
      {
        subjectName: '6102租金支出',
        currentAmount: 26285949,
        currentRatio: 35.64,
        budgetAmount: 25811484,
        budgetRatio: 38.03,
        growthRate: 1.84,
        currentTotalAmount: 26285949,
        currentTotalRatio: 35.64,
        totalBudgetAmount: 25811484,
        totalBudgetRatio: 38.03,
        totalGrowthRate: 1.84,
      },
      {
        subjectName: '6103文具用品',
        currentAmount: 53785,
        currentRatio: 0.07,
        budgetAmount: 42156,
        budgetRatio: 0.06,
        growthRate: 27.59,
        currentTotalAmount: 53785,
        currentTotalRatio: 0.07,
        totalBudgetAmount: 42156,
        totalBudgetRatio: 0.06,
        totalGrowthRate: 27.59,
      },
      {
        subjectName: '6104旅費',
        currentAmount: 14165,
        currentRatio: 0.02,
        budgetAmount: 113951,
        budgetRatio: 0.17,
        growthRate: -87.57,
        currentTotalAmount: 14165,
        currentTotalRatio: 0.02,
        totalBudgetAmount: 113951,
        totalBudgetRatio: 0.17,
        totalGrowthRate: -87.57,
      },
      {
        subjectName: '6105運費',
        currentAmount: 32828,
        currentRatio: 0.04,
        budgetAmount: 42119,
        budgetRatio: 0.06,
        growthRate: -22.06,
        currentTotalAmount: 32828,
        currentTotalRatio: 0.04,
        totalBudgetAmount: 42119,
        totalBudgetRatio: 0.06,
        totalGrowthRate: -22.06,
      },
      {
        subjectName: '6106郵電費',
        currentAmount: 81305,
        currentRatio: 0.11,
        budgetAmount: 137368,
        budgetRatio: 0.20,
        growthRate: -40.81,
        currentTotalAmount: 81305,
        currentTotalRatio: 0.11,
        totalBudgetAmount: 137368,
        totalBudgetRatio: 0.20,
        totalGrowthRate: -40.81,
      },
      {
        subjectName: '6107修繕費',
        currentAmount: 290424,
        currentRatio: 0.39,
        budgetAmount: 421165,
        budgetRatio: 0.62,
        growthRate: -31.04,
        currentTotalAmount: 290424,
        currentTotalRatio: 0.39,
        totalBudgetAmount: 421165,
        totalBudgetRatio: 0.62,
        totalGrowthRate: -31.04,
      },
      {
        subjectName: '6108維護費',
        currentAmount: 7378896,
        currentRatio: 10.00,
        budgetAmount: 7511593,
        budgetRatio: 11.07,
        growthRate: -1.77,
        currentTotalAmount: 7378896,
        currentTotalRatio: 10.00,
        totalBudgetAmount: 7511593,
        totalBudgetRatio: 11.07,
        totalGrowthRate: -1.77,
      },
      {
        subjectName: '6109廣告費',
        currentAmount: 4014865,
        currentRatio: 5.44,
        budgetAmount: 3795596,
        budgetRatio: 5.59,
        growthRate: 5.78,
        currentTotalAmount: 4014865,
        currentTotalRatio: 5.44,
        totalBudgetAmount: 3795596,
        totalBudgetRatio: 5.59,
        totalGrowthRate: 5.78,
      },
    ];
  }

}
