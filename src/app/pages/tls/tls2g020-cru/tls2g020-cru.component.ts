import { NgFor, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { InputNumberComponent } from '@shared/components/input-number/input-number.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { ReportColumn } from '@shared/components/table-report/table-report.model';
import { formatAmount } from '@others/component/table/table.model';
import { InputNumberModule } from 'primeng/inputnumber';
import { PanelModule } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { Tls2g020Service } from '../../../service/api/tls/tls2g020.service';
import { DropDownListService, IDropdownItem } from '../../../service/utility/dropDownList.service';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';

// 定義日期資料的類型
interface DayData {
  DayID?: number;
  budget: number | null;
  rate: number;
  commission: number;
  disabled?: boolean;
}

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
    TableReportComponent,
    TableModule,
    NgIf,
    NgFor,
    InputNumberComponent
  ],
})
export class TLS2G020CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  editMode: 'month' | 'day' = 'month';
  currentMonthData: any = null;
  // 儲存當前月份日明細的原始複本，用於還原
  private originalMonthDays: Record<number, any> | null = null;
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
  columns: ReportColumn[] = [
    { field: 'Month', header: '月', format: (v: string) => v ? v.slice(-2) : '' },
    { field: 'budget', header: '月預算', format: formatAmount },
    { field: 'avg_cag_charge_rate', header: '平均抽成', format: formatAmount },
    { field: 'charge_amt', header: '抽成額', format: formatAmount },
  ];

  constructor(
    private route: ActivatedRoute,
    private dropDownListService: DropDownListService,
    private tls2g020Service: Tls2g020Service,
    private cdr: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2G020', this.dataForm);

    console.log('rowdata', this.rowdata);

    this.data = this.rowdata?.Mdeatil ?? [];

    if (this.data.length > 0) {
      this.data.forEach(monthData => {
        // 如果沒有 charge_amt，用 avg_cag_charge_nurate 設定
        if (!monthData.charge_amt && monthData.avg_cag_charge_nurate) {
          monthData.charge_amt = monthData.avg_cag_charge_nurate;
        }
      });
    }

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

    this.currentMonthData.avg_cag_charge_nurate = row.avg_cag_charge_nurate ?? 0;

    const year =
      Number(this.dataForm.controls['budget_yy'].value) ||
      Number(row.budget_yy) ||
      new Date().getFullYear();

    const month = Number(row.Month?.slice(-2)) || 1;

    const budget_yymm = `${year}${month.toString().padStart(2, '0')}`;

    this.dataForm.patchValue({
      budget_yy: year.toString(),
      budget_mm: month.toString().padStart(2, '0'),
      budget_yymm,
      budget: row.budget ?? 0,
      avg_cag_charge_rate: row.avg_cag_charge_rate ?? 0
    });

    // 查詢該年月的日明細
    const payload = {
      budget_yymm,
      talent_id: this.dataForm.controls['talent_id'].value
    };
    this.tls2g020Service.queryTLS2G020Deatil(payload).subscribe({
      next: (res) => {
        const apiData = res?.Data || [];

        this.currentMonthData.days = {};

        // 取得合約期間
        const contractStartDate = this.rowdata?.Contract_bdate ? new Date(this.rowdata.Contract_bdate) : null;
        const contractEndDate = this.rowdata?.Contract_edate ? new Date(this.rowdata.Contract_edate) : null;

        apiData.forEach((d: any) => {
          const day = new Date(d.budget_date).getDate();
          const rate = row.avg_cag_charge_rate ?? 0;

          // 判斷該日期是否在合約期間內
          const currentDate = new Date(d.budget_date);
          const isInContractPeriod = contractStartDate && contractEndDate &&
            currentDate >= contractStartDate && currentDate <= contractEndDate;

          this.currentMonthData.days[day] = {
            DayID: d.DayID ?? null,
            budget: d.budget ?? null,
            rate: rate,
            commission: d.commission != null ? Number(d.commission) : Math.round((d.budget ?? 0) * Number(rate)),
            disabled: !isInContractPeriod
          };
        });

        this.generateCalendar(year, month);
        this.updateMonthTotals();
        // 儲存原始複本
        this.originalMonthDays = JSON.parse(JSON.stringify(this.currentMonthData.days || {}));
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

    // 取得合約期間
    const contractStartDate = this.rowdata?.Contract_bdate ? new Date(this.rowdata.Contract_bdate) : null;
    const contractEndDate = this.rowdata?.Contract_edate ? new Date(this.rowdata.Contract_edate) : null;

    for (let d = 1; d <= days; d++) {
      if (!this.currentMonthData.days[d]) {
        const currentDate = new Date(year, month - 1, d);

        // 判斷是否在合約期間內
        const isInContractPeriod = contractStartDate && contractEndDate &&
          currentDate >= contractStartDate && currentDate <= contractEndDate;
        const defaultRate = this.currentMonthData.avg_cag_charge_rate ?? 0;

        this.currentMonthData.days[d] = {
          budget: isInContractPeriod ? 0 : null,
          rate: defaultRate,
          commission: 0,
          disabled: !isInContractPeriod
        };
      }
    }
  }



  /** 當月回日編輯 */
  onBackToMonthTable() {
    this.editMode = 'month';
    this.currentMonthData = null;
  }

  // 還原當前月份的 day 明細為原始查詢值
  onRestore(): void {
    if (!this.currentMonthData) return;
    if (this.originalMonthDays) {
      this.currentMonthData.days = JSON.parse(JSON.stringify(this.originalMonthDays));
    } else {
      // 沒有原始資料就清空
      this.currentMonthData.days = {};
    }
    this.updateMonthTotals();
    this.cdr.detectChanges();
  }

  onBudgetChange(day: number) {
    const data = this.currentMonthData.days[day];
    const rate = this.dataForm.controls['avg_cag_charge_rate'].value || 0;

    const budget = Number(data.budget) || 0;
    // 正確公式：實際預算 × 抽成率 = 抽成額
    const commission = budget * Number(rate);

    // 四捨五入到整數
    data.budget = budget;
    data.rate = rate;
    data.commission = Math.round(commission);

    this.updateMonthTotals();
  }

  private updateMonthTotals() {
    if (!this.currentMonthData?.days) return;

    const values = Object.values(this.currentMonthData.days) as DayData[];

    const totalBudget = values.reduce((sum, d) => sum + (Number(d.budget) || 0), 0);
    const totalCommission = values.reduce((sum, d) => sum + (Number(d.commission) || 0), 0);

    const avgRate = this.currentMonthData.avg_cag_charge_rate ?? 0;

    this.dataForm.patchValue({
      BUDGET_Mbudget: totalBudget,
      charge_amt: Math.round(totalCommission),
      avg_cag_charge_rate: avgRate
    }, { emitEvent: false });

    this.currentMonthData.budget = totalBudget;
    this.currentMonthData.charge_amt = Math.round(totalCommission);
    this.currentMonthData.avg_cag_charge_rate = avgRate;
  }
  onSubmit(frm: FormGroup): void {
    if (!this.currentMonthData) return;

    const formVal = frm.getRawValue();

    // 驗證：預估營業額 (budget) 必須等於 本月預算營業額合計 (BUDGET_Mbudget)
    const expectedBudget = Number(formVal.budget ?? this.currentMonthData?.budget ?? 0);
    const totalBudget = Number(formVal.BUDGET_Mbudget ?? 0);
    if (Math.abs(expectedBudget - totalBudget) > 0.0001) {
      this.messageService.errorBubble('預估營業額與本月預算營業額合計不相同，請確認後再儲存');
      return; // 中止儲存，並確保不會停留在 loading
    }
    const monthID = this.currentMonthData.MonthID ?? 0;
    const budget_yymm = formVal.budget_yymm ?? `${formVal.budget_yy}${formVal.budget_mm}`;

    const detailList = Object.keys(this.currentMonthData.days).map(day => {
      const d = this.currentMonthData.days[+day];
      return {
        DayID: d.DayID && d.DayID !== 0 ? d.DayID : 0,  // 新增記錄使用 0 而不是 null
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

          const contractStartDate = this.rowdata?.Contract_bdate ? new Date(this.rowdata.Contract_bdate) : null;
          const contractEndDate = this.rowdata?.Contract_edate ? new Date(this.rowdata.Contract_edate) : null;
          const rate = this.dataForm.controls['avg_cag_charge_rate'].value || 0;

          const newDays: any = {};

          detailList.forEach(item => {
            const day = new Date(item.budget_date).getDate();
            const currentDate = new Date(item.budget_date);
            const isInContractPeriod = contractStartDate && contractEndDate &&
              currentDate >= contractStartDate && currentDate <= contractEndDate;

            console.log(`處理第 ${day} 天:`, {
              item,
              isInContractPeriod,
              existsInDays: !!this.currentMonthData.days[day]
            });

            newDays[day] = {
              DayID: item.DayID,
              budget: item.budget_D,
              rate: rate,
              commission: Math.round((item.budget_D ?? 0) * Number(rate)),
              disabled: !isInContractPeriod
            };

            console.log(`第 ${day} 天新資料:`, newDays[day]);
          });

          this.currentMonthData.days = newDays;

          console.log('更新後的 currentMonthData.days:', JSON.stringify(this.currentMonthData.days));
          this.updateMonthTotals();

          this.cdr.detectChanges();
          console.log('已觸發變更偵測，完全替換了 days 物件');
          // 更新成功後自動返回查詢頁（並保留原本查詢狀態）
          setTimeout(() => {
            this.onCancel();
          }, 800);
        }
      }
    });
  }


}
