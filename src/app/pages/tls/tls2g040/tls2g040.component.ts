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
import { BusClassItem, BusSClassItem } from '@service/utility/dropdown-api.model';
import { untilDestroyed } from '@ngneat/until-destroy';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputGroupColumn, InputGroupComponent } from '@shared/componentkit/input-group/input-group.component';

// 2.2.16.4 預算日報表
@Component({
  selector: 'app-tls2g040',
  templateUrl: './tls2g040.component.html',
  standalone: true,
  imports: [InputGroupComponent, DropdownComponent, RadiobuttonComponent, AsyncPipe, MultiSelectComponent, TableReportComponent, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarComponent, TranslateModule]
})
export class TLS2G040Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    budget_date: [null, [Validators.required]], // 年月
    bus_type: [null], // 大分類
    bus_class: [null as any], // 中分類
    bus_sclass: [null as any], // 小分類
    org_id: [null], // 組織
    tlt_no: [null], // 專櫃
    report_type: ['bus_type', [Validators.required]]
  });
  bus_type_name = '';
  bus_class_name = '';
  bus_sclass_name = '';
  bus_typeOptions = this.dropdown.queryTltBusType();
  bus_typeColumns: InputGroupColumn[] = [
    { field: 'No', header: '大分類代碼', visible: true },
    { field: 'Name', header: '大分類名稱', visible: true }
  ];
  bus_classOptions?: BusClassItem[] = [];
  bus_classColumns: InputGroupColumn[] = [
    { field: 'bus_type', header: '大分類代碼', visible: true },
    { field: 'bus_type_name', header: '大分類名稱', visible: true },
    { field: 'No', header: '小分類代碼', visible: true },
    { field: 'Name', header: '小分類名稱', visible: true }
  ];
  bus_sclassOptions?: BusSClassItem[] = [];
  bus_sclassColumns: InputGroupColumn[] = [
    { field: 'bus_type', header: '大分類代碼', visible: true },
    { field: 'bus_type_name', header: '大分類名稱', visible: true },
    { field: 'bus_class', header: '中分類名稱', visible: true },
    { field: 'bus_class_name', header: '中分類名稱', visible: true },
    { field: 'No', header: '小分類代碼', visible: true },
    { field: 'Name', header: '小分類名稱', visible: true }
  ]
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
    this.dropdown.queryTltBusClass().pipe(untilDestroyed(this)).subscribe(data => {
      this.bus_classOptions = data?.map(item => ({
        ...item,
        label: item.bus_type + ' - ' + item.bus_type_name + ' - ' + item.No + ' - ' + item.Name,
      }));
    });
    this.dropdown.queryTltBusSClass().pipe(untilDestroyed(this)).subscribe(data => {
      this.bus_sclassOptions = data?.map(item => ({
        ...item,
        label: item.bus_type + ' - ' + item.bus_type_name + ' - ' + item.bus_class + ' - ' + item.bus_class_name + ' - ' + item.No + ' - ' + item.Name,
      }));
    });
    this.queryForm.valueChanges.pipe(debounceTime(200)).subscribe(() => {
      this.updateColumns();
    });
    // 監聽大分類的變化
    this.queryForm.get('bus_type')?.valueChanges.pipe(untilDestroyed(this)).subscribe(() => {
      this.queryForm.get('bus_class')?.setValue(null, { emitEvent: false });
      this.bus_class_name = '';
      this.queryForm.get('bus_sclass')?.setValue(null, { emitEvent: false });
      this.bus_sclass_name = '';
    });
    // 監聽中分類的變化
    this.queryForm.get('bus_class')?.valueChanges.pipe(untilDestroyed(this)).subscribe(value => {
      this.queryForm.get('bus_sclass')?.setValue(null, { emitEvent: false });
      this.queryForm.get('bus_type')?.setValue(value?.bus_type, { emitEvent: false });
      this.bus_type_name = value?.bus_type_name ?? '';
      this.bus_sclass_name = '';
    });
    this.queryForm.get('bus_sclass')?.valueChanges.pipe(untilDestroyed(this)).subscribe(value => {
      this.queryForm.get('bus_type')?.setValue(value?.bus_type, { emitEvent: false });
      this.queryForm.get('bus_class')?.setValue(value?.bus_class, { emitEvent: false });
      this.bus_type_name = value?.bus_type_name ?? '';
      this.bus_class_name = value?.bus_class_name ?? '';
    });
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
