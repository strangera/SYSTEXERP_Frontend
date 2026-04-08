import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ITLS27050Data, QueryTLS27050Request, TLS27050Service } from '@service/api/tls/tls27050.service';
import { IDropdownItem } from '@service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { formatAmountWithFraction } from '@shared/componentkit/table/table.model';
import { yesterday } from '@shared/models/system/query-form.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';

@Component({
  selector: 'app-tls27050',
  templateUrl: './tls27050.component.html',
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarComponent, MultiSelectComponent, ButtonComponent, TableReportComponent, TranslateModule]
})
export class TLS27050Component extends BasicQueryPageComponent<ITLS27050Data> implements OnInit {
  queryForm = this.formBuilder.group({
    TXN_Date: [yesterday, [Validators.required]], // 銷售日期
    PAY_TypeList: [], // 支付工具別
    pageSize: [30],
    pageIndex: [1], // 你將初始頁碼改為 1
    SortBy: [[{ field: 'id', order: 1 }]],
  });
  totalRecords = 0;
  pos1006DropDownList: IDropdownItem[] = [
    { No: '1', Name: '現金' },
    { No: '0', Name: '信用卡' },
  ];
  lastQueryBody: QueryTLS27050Request | null = null;
  data: ITLS27050Data[] = [];
  columns: ReportColumn[] = [
    { field: 'PAY_NO', header: '付款別編號' },
    { field: 'PAY_Name', header: '付款別名稱' },
    { field: 'TLT_NO', header: '專櫃編號' },
    { field: 'ECR_No', header: '收銀機號' },
    { field: 'ACT_PayAmt', header: '金額', format: formatAmountWithFraction },
  ];
  constructor(
    public readonly tls27050Service: TLS27050Service,
    private readonly datePipe: DatePipe
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS27050');
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body = {
        ...frm.value,
        TXN_Date: this.datePipe.transform(frm.value.TXN_Date, 'yyyy-MM-dd')
      }
      this.tls27050Service.queryTLS27050(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((res) => {
        this.data = res.Data;
        this.lastQueryBody = body;
        this.totalRecords = res.TotalCount;
      });
    });
  }
}
