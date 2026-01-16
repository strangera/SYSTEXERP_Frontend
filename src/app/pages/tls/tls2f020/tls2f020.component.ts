import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model'; // 引入 ReportColumn
import { formatDate } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';

// 2.2.15.2 專櫃暫存應付帳款產生作業
@Component({
  selector: 'app-tls2f020',
  templateUrl: './tls2f020.component.html',
  styleUrl: './tls2f020.component.scss',
  standalone: true,
  imports: [TableReportComponent, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarComponent, DropdownComponent, TranslateModule, MultiSelectComponent]
})
export class TLS2F020Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    POS1: [null, Validators.required],
    POS2: [[]],
    // 分頁欄位
    pageSize: [30],
    pageIndex: [1],
    SortBy: [[{ field: 'tlt_no', order: 1 }]],
  });

  totalRecords = 0;
  data: any[] = [];
  columns: ReportColumn[] = [
    { field: 'CRT_USR_No', header: '建立者', visible: true },
    { field: 'CRT_Date', header: '建立日期', visible: true, format: formatDate },
  ];
  money_typeOptions = getSYS1000Options('money_type');

  constructor(
    private readonly dropdown: DropdownApiService,
    private readonly dropDownListService: DropDownListService,

  ) {
    super();
  }
  ngOnInit(): void {
    this.initializePage('TLS2F020', 'tls/tls2f020cru', this.queryForm, (form) => this.onSubmit(form));
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {


    });
  }
}
