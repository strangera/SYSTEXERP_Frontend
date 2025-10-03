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
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';

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
    NgFor,
    InputNumberComponent
  ],
})
export class TLS2G020CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  editMode: 'month' | 'day' = 'month';
  currentMonthData: any = null;
  daysInMonth: number[] = [];
  weeks: (number | null)[][] = [];

  // 左側項目固定的五行
  leftLabels: string[] = ['預算別', '日期', '實際預算', '抽成率', '抽成額'];

  dataForm = this.formBuilder.group({
    budget_yymm: [null as string | null],
    budget_mm: [{ value: null as string | null, disabled: true }],
    budget_yy: [{ value: null as string | null, disabled: true }],
    tlt_no: [{ value: null as string | null, disabled: true }],
    tlt_name: [{ value: null as string | null, disabled: true }],
    budget: [{ value: null as number | null, disabled: true }],
    BUDGET_Mbudget: [{ value: null as number | null, disabled: true }],
    charge_amt: [{ value: null as number | null, disabled: true }],
    talent_id: [null as number | null],
    avg_cag_charge_rate: [{ value: null as number | null, disabled: true }],
  });


  tltNoOptions: IDropdownItem[] = [];

  // /** 月畫面明細 */
  data: any[] = [];
  /** 月份欄位設定 */
  columns: Column[] = [
    { field: 'Month', header: '月', format: (v: string) => v ? v.slice(-2) : '' },
    { field: 'budget', header: '月預算' },
    { field: 'avg_cag_charge_rate', header: '平均抽成' },
    { field: 'charge_amt', header: '抽成額' },
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
        talent_id: this.rowdata.talent_id,
        avg_cag_charge_rate: this.rowdata.avg_cag_charge_rate
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

    // 年度優先順序：表單 > row > 系統當前年
    const year =
      Number(this.dataForm.controls['budget_yy'].value) ||
      Number(row.budget_yy) ||
      new Date().getFullYear();

    // 月份取 row.Month 後兩位，不存在則給 1
    const month = Number(row.Month?.slice(-2)) || 1;

    // 組合 budget_yymm (YYYYMM)
    const budget_yymm = `${year}${month.toString().padStart(2, '0')}`;

    // 更新表單的主要欄位
    this.dataForm.patchValue({
      budget_yy: year.toString(),
      budget_mm: month.toString().padStart(2, '0'),
      budget_yymm,                          //  關鍵：帶入年月
      budget: row.budget ?? 0,
      avg_cag_charge_rate: row.avg_cag_charge_rate ?? 0
    });

    // 查詢該年月的日明細
    const payload = {
      talent_id: this.dataForm.controls['talent_id'].value,
      budget_yymm
    };

    // 取得本月的 avg_cag_charge_nurate（抽成額）計算用
    const avg_cag_charge_nurate = row.avg_cag_charge_nurate ?? 0;

    this.tls2g020Service.queryTLS2G020Deatil(payload).subscribe({
      next: (res) => {
        const apiData = res?.Data || [];

        this.currentMonthData.days = {};
        apiData.forEach((d: any) => {
          const day = new Date(d.budget_date).getDate();
          // 若 API 有回傳 commission 欄位，優先帶入，否則用公式計算
          this.currentMonthData.days[day] = {
            DayID: d.DayID ?? 0,
            budget: d.budget ?? null,
            rate: row.avg_cag_charge_rate ?? 0,
            commission: d.commission != null ? Number(d.commission) : Number(((d.budget ?? 0) * avg_cag_charge_nurate).toFixed(2)),
            disabled: !d.DayID
          };
        });

        this.generateCalendar(year, month);
        this.updateMonthTotals();
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

    if (!this.currentMonthData.days) {
      this.currentMonthData.days = {};
    }
    for (let d = 1; d <= days; d++) {
      if (!this.currentMonthData.days[d]) {
        this.currentMonthData.days[d] = {
          budget: null,
          rate: 0,
          commission: 0,
          disabled: true
        };
      }
    }
  }



  /** 當月回日編輯 */
  onBackToMonthTable() {
    this.editMode = 'month';
    this.currentMonthData = null;
  }

  onBudgetChange(day: number) {
    const data = this.currentMonthData.days[day];
    const rate = this.dataForm.controls['avg_cag_charge_rate'].value || 0;

    const budget = Number(data.budget) || 0;
    const commission = budget * (Number(rate) / 100);

    // 固定兩位小數
    data.budget = Number(budget.toFixed(2));
    data.rate = Number(rate.toFixed(2));
    data.commission = Number(commission.toFixed(2));

    this.updateMonthTotals();
  }

  private updateMonthTotals() {
    if (!this.currentMonthData?.days) return;

    const values = Object.values(this.currentMonthData.days) as any[];

    const totalBudget = values.reduce((sum, d) => sum + (Number(d.budget) || 0), 0);
    const totalCommission = values.reduce((sum, d) => sum + (Number(d.commission) || 0), 0);

    const avgRate = this.currentMonthData.avg_cag_charge_rate ?? 0;

    this.dataForm.patchValue({
      BUDGET_Mbudget: Number(totalBudget.toFixed(2)),
      charge_amt: Number(totalCommission.toFixed(2)),
      avg_cag_charge_rate: Number(avgRate.toFixed(2))
    }, { emitEvent: false });

    this.currentMonthData.budget = Number(totalBudget.toFixed(2));
    this.currentMonthData.charge_amt = Number(totalCommission.toFixed(2));
    this.currentMonthData.avg_cag_charge_rate = Number(avgRate.toFixed(2));
  }
  onSubmit(frm: FormGroup): void {
    if (!this.currentMonthData) return;

    const formVal = frm.getRawValue();
    const monthID = this.currentMonthData.MonthID ?? 0;
    const budget_yymm = formVal.budget_yymm ?? `${formVal.budget_yy}${formVal.budget_mm}`;

    const detailList = Object.keys(this.currentMonthData.days).map(day => {
      const d = this.currentMonthData.days[+day];
      return {
        DayID: d.DayID && d.DayID !== 0 ? d.DayID : null,
        budget_date: `${formVal.budget_yy}-${formVal.budget_mm}-${day.toString().padStart(2, '0')}T00:00:00`,
        budget_D: d.budget ?? 0
      };
    });


    const payload = {
      budget_yymm,
      talent_id: formVal.talent_id ?? 0,
      MonthID: monthID,
      budget_M: Math.min(formVal.BUDGET_Mbudget ?? 0, 2147483647),
      Data: detailList
    };


    this.tls2g020Service.updateTLS2G020Deatil(payload).subscribe({
      next: (res) => {
        if (res.Status === '0000' || res.Status === 0) {
          this.messageService.successBubble("更新成功");

          //  只更新前端，不打 query
          detailList.forEach(item => {
            const day = new Date(item.budget_date).getDate();
            this.currentMonthData.days[day] = {
              DayID: item.DayID,
              budget: item.budget_D,
              rate: this.dataForm.controls['avg_cag_charge_rate'].value,
              commission: Number(((item.budget_D ?? 0) *
                ((this.dataForm.controls['avg_cag_charge_rate']?.value ?? 0) / 100)).toFixed(2))
            };
          });

          this.updateMonthTotals();

        }
      }
    });
  }


}
