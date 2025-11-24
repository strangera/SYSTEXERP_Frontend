import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Services
// Shared
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';

@Component({
  selector: 'app-fin42020',
  templateUrl: './fin42020.component.html',
  styleUrl: './fin42020.component.scss',
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarComponent, DropdownComponent, RadiobuttonComponent, ButtonComponent, TableComponent, TranslateModule]
})
export class FIN42020Component extends BasicQpageComponent implements OnInit {
  // Upload files
  fileType: string = '';
  uploadUrl: string = 'https://www.primefaces.org/cdn/api/upload.php';
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
  });

  // Dropdown options

  FNCCodeOptions: any[] = [];
  AccountcodeOptions: any[] = [];
  departmentOptions: any[] = [];
  displayOptions2: any[] = [];
  AnalysisdateCOptions: any[] = [];
  vendorOptions: any[] = [];
  FlippingstateOptions: any[] = [];
  organizationNumberOptions: any[] = [];
  statusOptions: any[] = [{ value: 1, label: '是' },
  { value: 2, label: '否' }];
  unitOptions: any[] = [{ value: 1, label: '元' },
  { value: 2, label: '千' },
  { value: 3, label: '萬' }];
  typeOptions: any[] = [{ value: 1, label: '統制' },
  { value: 2, label: '明細' },];



  // Table data
  data: any[] = [

  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'subjectName', header: '科目名稱', visible: true },
    { field: 'currentAmount', header: '本月 - 本期 - 金額', visible: true },
    { field: 'currentRatio', header: '本月 - 本期 - 佔比(%)', visible: true },
    { field: 'lastYearAmount', header: '本月 - 去年 - 金額', visible: true },
    { field: 'lastYearRatio', header: '本月 - 去年 - 佔比(%)', visible: true },
    { field: 'growthRate', header: '本月 - 增減率(%)', visible: true },
    { field: 'budget', header: '本月 - 預算', visible: true },
    { field: 'budgetRatio', header: '本月 - 預算比', visible: true },
    { field: 'budgetGrowthRate', header: '本月 - 增減率', visible: true },
    { field: 'currentTotalAmount', header: '累計 - 本期累計 - 金額', visible: true },
    { field: 'currentTotalRatio', header: '累計 - 本期累計 - 佔比(%)', visible: true },
    { field: 'lastYearTotalAmount', header: '累計 - 去年累計 - 金額', visible: true },
    { field: 'lastYearTotalRatio', header: '累計 - 去年累計 - 佔比(%)', visible: true },
    { field: 'totalGrowthRate', header: '累計 - 增減率(%)', visible: true },
    { field: 'totalBudget', header: '累計 - 預算', visible: true },
    { field: 'totalBudgetRatio', header: '累計 - 預算比', visible: true },
    { field: 'totalBudgetGrowthRate', header: '累計 - 增減率', visible: true }
  ];



  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.ProgNo = '140006';
    // Initialize dropdown options
  }

  onSubmit(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;
    this.notificationService.blockUi();

    if (frm.valid && this.canQuery()) {
      // Submit logic here
    }

    this.loading = false;
    this.notificationService.unblockUi();
  }

  onSubmitQuery(frm: FormGroup) {
    this.onSubmit(frm);
  }

  onCreate() {
    if (this.canAdd()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: CRUDStatus.Create,
          queryform: this.queryForm,
        },
        skipLocationChange: true,
      };
      this.router.navigate(['FIN3000/FIN34030CRU'], extras);
    }
  }

  onEdit(data: any) {
    if (this.canEdit()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: CRUDStatus.Edit,
          rowdata: data,
          queryform: this.queryForm,
        },
        skipLocationChange: true,
      };
      this.router.navigate(['/demoCRU'], extras);
    }
  }

  onDetail(data: any) {
    let extras: NavigationExtras = {
      state: {
        crudstatus: CRUDStatus.Read,
        rowdata: data,
        queryform: this.queryForm,
      },
      skipLocationChange: true,
    };
    this.router.navigate(['/demoCRU'], extras);
  }
  onClearForm() {
    this.queryForm.reset(); // 重置表單
  }
}
