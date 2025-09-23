import { QueryTLS2G030Params, TLS2G030DataResponse, Tls2g030Service } from './../../../service/api/tls/tls2g030.service';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ReportColumn, ColumnGroup, formatAmount } from '@shared/componentkit/table-report/table-report.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { AsyncPipe } from '@angular/common';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { finalize } from 'rxjs';
import { untilDestroyed } from '@ngneat/until-destroy';

// 2.2.16.3 專櫃預估業績報表
@Component({
  selector: 'app-tls2g030',
  templateUrl: './tls2g030.component.html',
  standalone: true,
  imports: [MultiSelectComponent, AsyncPipe, TableReportComponent, MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarComponent, ButtonComponent, TranslateModule]
})
export class TLS2G030Component extends BasicQueryPageComponent<TLS2G030DataResponse> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    budget_yy: [null, [Validators.required]], // 年
    bus_type: [null], // 大分類
    tlt_no: [null], // 專櫃
  });
  bus_typeOptions = this.dropdown.queryTltBusType();
  tlt_noOptions = this.dropdown.queryTltTalent();
  lastQueryFormValue: QueryTLS2G030Params | null = null;
  totalRecords = 0;// 分頁和排序參數 // 排序需要
  data: TLS2G030DataResponse[] = [];
  columns: ReportColumn[] = [
    // 固定欄位
    { field: 'tlt_no', header: '專櫃編號' },
    { field: 'tlt_name', header: '櫃位名稱' },

    // 一月欄位
    { field: 'SalesAmount01', header: '月預算', groupField: 'january', format: formatAmount },
    { field: 'AvgCommRate01', header: '平均抽成率', groupField: 'january', format: formatAmount },
    { field: 'CommAmount01', header: '抽成額', groupField: 'january', format: formatAmount },

    // 二月欄位
    { field: 'SalesAmount02', header: '月預算', groupField: 'february', format: formatAmount },
    { field: 'AvgCommRate02', header: '平均抽成率', groupField: 'february', format: formatAmount },
    { field: 'CommAmount02', header: '抽成額', groupField: 'february', format: formatAmount },

    // 三月欄位
    { field: 'SalesAmount03', header: '月預算', groupField: 'march', format: formatAmount },
    { field: 'AvgCommRate03', header: '平均抽成率', groupField: 'march', format: formatAmount },
    { field: 'CommAmount03', header: '抽成額', groupField: 'march', format: formatAmount },

    // 四月欄位
    { field: 'SalesAmount04', header: '月預算', groupField: 'april', format: formatAmount },
    { field: 'AvgCommRate04', header: '平均抽成率', groupField: 'april', format: formatAmount },
    { field: 'CommAmount04', header: '抽成額', groupField: 'april', format: formatAmount },

    // 五月欄位
    { field: 'SalesAmount05', header: '月預算', groupField: 'may', format: formatAmount },
    { field: 'AvgCommRate05', header: '平均抽成率', groupField: 'may', format: formatAmount },
    { field: 'CommAmount05', header: '抽成額', groupField: 'may', format: formatAmount },

    // 六月欄位
    { field: 'SalesAmount06', header: '月預算', groupField: 'june', format: formatAmount },
    { field: 'AvgCommRate06', header: '平均抽成率', groupField: 'june', format: formatAmount },
    { field: 'CommAmount06', header: '抽成額', groupField: 'june', format: formatAmount },

    // 七月欄位
    { field: 'SalesAmount07', header: '月預算', groupField: 'july', format: formatAmount },
    { field: 'AvgCommRate07', header: '平均抽成率', groupField: 'july', format: formatAmount },
    { field: 'CommAmount07', header: '抽成額', groupField: 'july', format: formatAmount },

    // 八月欄位
    { field: 'SalesAmount08', header: '月預算', groupField: 'august', format: formatAmount },
    { field: 'AvgCommRate08', header: '平均抽成率', groupField: 'august', format: formatAmount },
    { field: 'CommAmount08', header: '抽成額', groupField: 'august', format: formatAmount },

    // 九月欄位
    { field: 'SalesAmount09', header: '月預算', groupField: 'september', format: formatAmount },
    { field: 'AvgCommRate09', header: '平均抽成率', groupField: 'september', format: formatAmount },
    { field: 'CommAmount09', header: '抽成額', groupField: 'september', format: formatAmount },

    // 十月欄位
    { field: 'SalesAmount10', header: '月預算', groupField: 'october', format: formatAmount },
    { field: 'AvgCommRate10', header: '平均抽成率', groupField: 'october', format: formatAmount },
    { field: 'CommAmount10', header: '抽成額', groupField: 'october', format: formatAmount },

    // 十一月欄位
    { field: 'SalesAmount11', header: '月預算', groupField: 'november', format: formatAmount },
    { field: 'AvgCommRate11', header: '平均抽成率', groupField: 'november', format: formatAmount },
    { field: 'CommAmount11', header: '抽成額', groupField: 'november', format: formatAmount },

    // 十二月欄位
    { field: 'SalesAmount12', header: '月預算', groupField: 'december', format: formatAmount },
    { field: 'AvgCommRate12', header: '平均抽成率', groupField: 'december', format: formatAmount },
    { field: 'CommAmount12', header: '抽成額', groupField: 'december', format: formatAmount },
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
    private readonly dropdown: DropdownApiService,
    public readonly tls2g030Service: Tls2g030Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2G030', '/tls/tls2g030cru');
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.tls2g030Service.queryTLS2G030(frm.value).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(res => {
        this.data = res.Data
        this.lastQueryFormValue = frm.value;
        this.totalRecords = res.TotalCount;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      });
    });
  }
}
