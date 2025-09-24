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
import { Tls2g020Service } from '../../../service/api/tls/tls2g020.service';
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
    budget_yymm: [null],
    budget_mm: [{ value: null as string | null, disabled: true }],
    budget_yy: [{ value: null as string | null, disabled: true }],
    tlt_no: [{ value: null, disabled: true }],
    tlt_name: [{ value: null, disabled: true }],
    BUDGET_Mbudget: [{ value: null, disabled: true }],
    cag_charge_rate: [{ value: null, disabled: true }],
    charge_amt: [{ value: null, disabled: true }],
    talent_id: [null],
  });

  tltNoOptions: IDropdownItem[] = [];

  // /** 月畫面明細 */
  data: any[] = [];

  /** 月份欄位設定 */
  columns: Column[] = [
    { field: 'Month', header: '月', format: (v: string) => v ? v.slice(-2) : '' },
    { field: 'budget', header: '月預算' },
    { field: 'avg_cag_charge_rate', header: '平均抽成' },
  ];

  constructor(
    private route: ActivatedRoute,
    private dropDownListService: DropDownListService,
    private tls2g020Service: Tls2g020Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2G020', this.dataForm);

    console.log('rowdata', this.rowdata);

    this.data = this.rowdata?.Mdeatil ?? [];

    if (this.rowdata) {
      this.dataForm.patchValue({
        budget_yy: this.rowdata.budget_yy,
        tlt_no: this.rowdata.tlt_no,
        tlt_name: this.rowdata.tlt_name,
        talent_id: this.rowdata.talent_id
      });
    }



    // 下拉選單
    this.dropDownListService.queryTLTTALENT_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        if (res?.Data) {
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

    const year =
      Number(this.dataForm.controls['budget_yy'].value) ||
      Number(row.budget_yy) ||
      new Date().getFullYear();

    const month = Number(row.Month?.slice(-2)) || 1;

    // 更新表單月份
    this.dataForm.patchValue({
      budget_mm: month.toString().padStart(2, '0')
    });

    const payload = {
      talent_id: this.dataForm.controls['talent_id'].value,
      budget_yymm: `${year}${month.toString().padStart(2, '0')}`
    };

    this.tls2g020Service.queryTLS2G020Deatil(payload).subscribe({
      next: (res) => {
        const apiData = res?.Data || [];

        // 初始化 days
        this.currentMonthData.days = {};

        apiData.forEach((d: any) => {
          const day = new Date(d.budget_date).getDate();
          this.currentMonthData.days[day] = {
            budget: d.budget ?? 0,
            rate: 0,
            commission: 0
          };
        });


        this.generateCalendar(year, month);
      },
    });

  }

  private generateCalendar(year: number, month: number) {
    // 計算當月天數
    const days = new Date(year, month, 0).getDate();
    this.daysInMonth = Array.from({ length: days }, (_, i) => i + 1);

    // 計算第一天是星期幾，生成週陣列
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
      while (week.length < 7) week.push(null);
      weeks.push(week);
    }
    this.weeks = weeks;

    // 初始化缺失的天：只補沒有 API 資料的日期
    if (!this.currentMonthData.days) {
      this.currentMonthData.days = {};
    }
    for (let d = 1; d <= days; d++) {
      if (!this.currentMonthData.days[d]) {
        this.currentMonthData.days[d] = {
          budget: 0,
          rate: 0,
          commission: 0
        };
      }
    }
  }



  /** 當月回日編輯 */
  onBackToMonthTable() {
    this.editMode = 'month';
    this.currentMonthData = null;
  }

  /** 預算變更即時計算抽成額 */
  onBudgetChange(day: number) {
    const data = this.currentMonthData.days[day];
    data.commission = data.budget * (data.rate / 100);
  }

  onSubmit(frm: FormGroup): void {

  }
}
