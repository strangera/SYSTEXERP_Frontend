import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, ColumnGroup } from '@shared/componentkit/table-report/table-report.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { AsyncPipe } from '@angular/common';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';

// 2.2.16.3 專櫃預估業績報表
@Component({
  selector: 'app-tls2g030',
  templateUrl: './tls2g030.component.html',
  standalone: true,
  imports: [MultiSelectComponent, AsyncPipe, TableReportComponent, MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarComponent, ButtonComponent, TranslateModule]
})
export class TLS2G030Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    budget_yy: [null, [Validators.required]], // 年
    bus_type: [null], // 大分類
    tlt_no: [null], // 專櫃
  });
  bus_typeOptions = this.dropdown.queryTltBusType();
  tlt_noOptions = this.dropdown.queryTltTalent();
  totalRecords = 0;// 分頁和排序參數 // 排序需要
  data: any[] = [];
  columns: Column[] = [
    // 固定欄位
    { field: 'tlt_no', header: '專櫃編號' },
    { field: 'tlt_name', header: '櫃位名稱' },

    // 一月欄位
    { field: 'budget_01', header: '月預算', groupField: 'january' },
    { field: 'cag_charge_rate_01', header: '平均抽成率', groupField: 'january' },
    { field: 'profit_01', header: '抽成額', groupField: 'january' },

    // 二月欄位
    { field: 'budget_02', header: '月預算', groupField: 'february' },
    { field: 'cag_charge_rate_02', header: '平均抽成率', groupField: 'february' },
    { field: 'profit_02', header: '抽成額', groupField: 'february' },

    // 三月欄位
    { field: 'budget_03', header: '月預算', groupField: 'march' },
    { field: 'cag_charge_rate_03', header: '平均抽成率', groupField: 'march' },
    { field: 'profit_03', header: '抽成額', groupField: 'march' },

    // 四月欄位
    { field: 'budget_04', header: '月預算', groupField: 'april' },
    { field: 'cag_charge_rate_04', header: '平均抽成率', groupField: 'april' },
    { field: 'profit_04', header: '抽成額', groupField: 'april' },

    // 五月欄位
    { field: 'budget_05', header: '月預算', groupField: 'may' },
    { field: 'cag_charge_rate_05', header: '平均抽成率', groupField: 'may' },
    { field: 'profit_05', header: '抽成額', groupField: 'may' },

    // 六月欄位
    { field: 'budget_06', header: '月預算', groupField: 'june' },
    { field: 'cag_charge_rate_06', header: '平均抽成率', groupField: 'june' },
    { field: 'profit_06', header: '抽成額', groupField: 'june' },

    // 七月欄位
    { field: 'budget_07', header: '月預算', groupField: 'july' },
    { field: 'cag_charge_rate_07', header: '平均抽成率', groupField: 'july' },
    { field: 'profit_07', header: '抽成額', groupField: 'july' },

    // 八月欄位
    { field: 'budget_08', header: '月預算', groupField: 'august' },
    { field: 'cag_charge_rate_08', header: '平均抽成率', groupField: 'august' },
    { field: 'profit_08', header: '抽成額', groupField: 'august' },

    // 九月欄位
    { field: 'budget_09', header: '月預算', groupField: 'september' },
    { field: 'cag_charge_rate_09', header: '平均抽成率', groupField: 'september' },
    { field: 'profit_09', header: '抽成額', groupField: 'september' },

    // 十月欄位
    { field: 'budget_10', header: '月預算', groupField: 'october' },
    { field: 'cag_charge_rate_10', header: '平均抽成率', groupField: 'october' },
    { field: 'profit_10', header: '抽成額', groupField: 'october' },

    // 十一月欄位
    { field: 'budget_11', header: '月預算', groupField: 'november' },
    { field: 'cag_charge_rate_11', header: '平均抽成率', groupField: 'november' },
    { field: 'profit_11', header: '抽成額', groupField: 'november' },

    // 十二月欄位
    { field: 'budget_12', header: '月預算', groupField: 'december' },
    { field: 'cag_charge_rate_12', header: '平均抽成率', groupField: 'december' },
    { field: 'profit_12', header: '抽成額', groupField: 'december' },
  ];
  columnGroup: ColumnGroup[] = [
    { field: 'january', header: '一月' },
    { field: 'february', header: '二月' },
    { field: 'march', header: '三月' },
    { field: 'april', header: '四月' },
    { field: 'may', header: '五月' },
    { field: 'june', header: '六月' },
    { field: 'july', header: '七月' },
    { field: 'august', header: '八月' },
    { field: 'september', header: '九月' },
    { field: 'october', header: '十月' },
    { field: 'november', header: '十一月' },
    { field: 'december', header: '十二月' }
  ];

  constructor(
    private readonly dropdown: DropdownApiService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2G030', '/tls/tls2g030cru');
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      // this.loading = true;
      // this.fin11040Service.queryFIN11040(frm.value).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(res => {
      //   this.data = res.Data
      //   this.totalRecords = res.TotalCount;
      //   this.queryStateService.setQueryState(this.ProgNo, frm.value);
      // });
    });
  }
}
