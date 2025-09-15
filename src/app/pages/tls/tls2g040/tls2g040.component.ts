import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { Column } from '@shared/componentkit/table-report/table-report.model';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { AsyncPipe } from '@angular/common';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { bus_classColumns, bus_sclassColumns, bus_typeColumns, org_idColumns, tlt_noColumns } from './tls2g040.model';
import { debounceTime } from 'rxjs';

// 2.2.16.4 預算日報表
@Component({
  selector: 'app-tls2g040',
  templateUrl: './tls2g040.component.html',
  standalone: true,
  imports: [RadiobuttonComponent, AsyncPipe, MultiSelectComponent, TableReportComponent, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarComponent, TranslateModule]
})
export class TLS2G040Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    budget_date: [null, [Validators.required]], // 年月
    bus_type: [null], // 大分類
    bus_class: [null], // 中分類
    bus_sclass: [null], // 小分類
    org_id: [null], // 組織
    tlt_no: [null], // 專櫃
    report_type: ['bus_type', [Validators.required]]
  });
  bus_typeOptions = this.dropdown.queryTltBusType();
  bus_classOptions = [];
  bus_sclassOptions = [];
  org_idOptions = this.dropdown.querySys3100();
  tlt_noOptions = this.dropdown.queryTltTalent();
  report_typeOptions = [
    { label: '依大分類統計', value: 'bus_type' },
    { label: '依中分類統計', value: 'bus_class' },
    { label: '依小分類統計', value: 'bus_sclass' },
    { label: '依組織統計', value: 'org_id' },
    { label: '依專櫃統計', value: 'tlt_no' }
  ];
  totalRecords = 0;
  data: any[] = [];
  columns: Column[] = bus_typeColumns;
  constructor(
    private readonly dropdown: DropdownApiService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2G040', '/tls/tls2g040cru');
    // 監聽 report_type 和 budget_date 的變化
    this.queryForm.valueChanges.pipe(debounceTime(200)).subscribe(() => {
      this.updateColumns();
    });

    // 初始化時先呼叫一次，以顯示預設欄位
    this.updateColumns();
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
    });
  }
  private updateColumns(): void {
    const reportType = this.queryForm.get('report_type')?.value;
    const budgetDate = this.queryForm.get('budget_date')?.value;

    if (!reportType) {
      this.columns = [];
      return;
    }
    let baseColumns: Column[];
    switch (reportType) {
      case 'bus_type':
        baseColumns = bus_typeColumns;
        break;
      case 'bus_class':
        baseColumns = bus_classColumns;
        break;
      case 'bus_sclass':
        baseColumns = bus_sclassColumns;
        break;
      case 'org_id':
        baseColumns = org_idColumns;
        break;
      case 'tlt_no':
        baseColumns = tlt_noColumns;
        break;
      default:
        baseColumns = [];
        break;
    }

    // 建立每日欄位
    const dailyColumns: Column[] = [];
    if (budgetDate) {
      const date = new Date(budgetDate);
      const year = date.getFullYear();
      const month = date.getMonth();
      const lastDay = new Date(year, month + 1, 0).getDate(); // 取得該月的最後一天
      const daysOfWeek = ['日', '一', '二', '三', '四', '五', '六'];

      for (let i = 1; i <= lastDay; i++) {
        const dayDate = new Date(year, month, i);
        const dayOfWeek = daysOfWeek[dayDate.getDay()];
        dailyColumns.push({
          field: `daily_${i}`, // 建議使用 unique 的 field 名稱，例如 daily_1, daily_2
          header: `${i}(${dayOfWeek})`,
          groupField: 'daily' // 可以考慮新增一個 'daily' 的群組
        });
      }
    }

    // 將所有欄位合併
    this.columns = [...baseColumns, ...dailyColumns];
  }
}
