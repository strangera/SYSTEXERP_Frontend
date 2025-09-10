import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { PanelModule } from 'primeng/panel';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropDownListService, IDropdownItem } from '../../../service/utility/dropDownList.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TableModule } from 'primeng/table';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column } from '../../../shared/componentkit/table/table.model';
import { NgIf, NgFor } from '@angular/common';
import { InputNumberModule } from 'primeng/inputnumber';
@Component({
  selector: 'app-tls2g020-cru',
  templateUrl: './tls2g020-cru.component.html',
  styleUrl: './tls2g020-cru.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    TranslateModule,
    ButtonComponent,
    InputNumberModule,
    TableComponent,
    TableModule,
    NgIf,
    NgFor
  ],
})

export class TLS2G020CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  editMode: 'month' | 'day' = 'month';
  currentMonthData: any = null;
  daysInMonth: number[] = [];
  weeks: (number | null)[][] = [];

  // 左側項目固定的五行
  leftLabels: string[] = ['預算別', '日期', '實際預算', '抽成率', '抽成額'];

  dataForm = this.formBuilder.nonNullable.group({
    budget_yymm: [{ value: null, disabled: true }],
    tlt_no_tlt_name: [{ value: null, disabled: true }],
  });

  tltNoOptions: IDropdownItem[] = [];

  data: any[] = Array.from({ length: 12 }, (_, i) => ({
    budget_yymm: `${i + 1}月`,
    budget: null,
    cag_charge_rate: null,
    charge_amt: null
  }));

  columns: Column[] = [
    { field: 'budget_yymm', header: '月份' },
    { field: 'budget', header: '月預算' },
    { field: 'cag_charge_rate', header: '平均抽成' },
    { field: 'charge_amt', header: '抽成額' },
  ];
  constructor(
    private route: ActivatedRoute,
    private dropDownListService: DropDownListService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2G020', this.dataForm);
    const year = 2024;
    const month = 9; // 9月 (注意：JS 月份 0=1月, 所以這裡放 9 表示 10 月)

    const totalDays = new Date(year, month, 0).getDate(); // 當月天數
    const firstDayOfWeek = new Date(year, month - 1, 1).getDay(); // 1號星期幾

    this.weeks = [];
    let week: (number | null)[] = new Array(firstDayOfWeek).fill(null);

    for (let d = 1; d <= totalDays; d++) {
      week.push(d);
      if (week.length === 7) {
        this.weeks.push(week);
        week = [];
      }
    }

    if (week.length > 0) {
      while (week.length < 7) {
        week.push(null); // 補滿 7 格
      }
      this.weeks.push(week);
    }

    this.dropDownListService.queryTLTTALENT_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        if (res && res.Data) {
          this.tltNoOptions = res.Data.map(item => ({
            label: `${item.No} ${item.Name}`,
            value: item.No,
            No: item.No,
            Name: item.Name
          }));
        }
      });
  }

  onMonthEdit(row: any): void {
    this.editMode = 'day';
    this.currentMonthData = row;
    const year = new Date().getFullYear(); // 或根據 row 帶入年份
    const month = Number(row.budget_yymm.replace('月', ''));
    const days = new Date(year, month, 0).getDate();
    this.daysInMonth = Array.from({ length: days }, (_, i) => i + 1);

    // 星期排版
    const firstDayOfWeek = new Date(year, month - 1, 1).getDay();
    const weeks: (number | null)[][] = [];
    let week: (number | null)[] = new Array(firstDayOfWeek).fill(null);
    for (let d = 1; d <= days; d++) {
      week.push(d);
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    }
    if (week.length > 0) {
      while (week.length < 7) {
        week.push(null); // 補滿 7 格
      }
      weeks.push(week);
    }
    this.weeks = weeks;

    // 初始化每一天的資料
    if (!this.currentMonthData.days) this.currentMonthData.days = {};
    for (let d = 1; d <= days; d++) {
      if (!this.currentMonthData.days[d]) {
        this.currentMonthData.days[d] = { budget: 0, rate: 0, commission: 0 };
      }
    }
  }
  // 預算改變時即時計算抽成額
  onBudgetChange(day: number) {
    const data = this.currentMonthData.days[day];
    data.commission = data.budget * (data.rate / 100);
  }

  onBackToMonthTable() {
    this.editMode = 'month';
    this.currentMonthData = null;
  }
  onSubmit(frm: FormGroup): void {
    if (frm.valid) {
      // Handle form submission
    }
  }
}
