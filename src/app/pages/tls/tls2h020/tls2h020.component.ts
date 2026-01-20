import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { InputNumberRangeComponent } from '@shared/componentkit/input-number-range/input-number-range.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn, formatAmount } from '@shared/componentkit/table-report/table-report.model'; // 引入 ReportColumn
import { formatDate } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { SelectButtonModule } from 'primeng/selectbutton';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';

// 2.2.17.1 租金發票套印作業
@Component({
  selector: 'app-tls2h020',
  templateUrl: './tls2h020.component.html',
  standalone: true,
  imports: [ButtonModule, InputNumberRangeComponent, CalendarComponent, SelectButtonModule, TableReportComponent, AsyncPipe, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarRangeComponent, DropdownComponent, CheckboxModule, TranslateModule]
})
export class TLS2H020Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    // 分頁欄位
    pageSize: [30],
    pageIndex: [1],
    sam_yyymm: [null, Validators.required],
    ACP_GUITax_From: [null],
    ACP_GUITax_To: [null],
    tlt_no: [''],
    SortBy: [[{ field: 'tlt_no', order: 1 }]],
  });

  lastQueryBody: any = null;
  totalRecords = 0;
  data: any[] = [];
  tlt_noOptions = this.dropdown.queryTltTalent();

  columns: ReportColumn[] = [
    { field: 'tlt_no', header: '結算年月', visible: true, format: formatDate },
    { field: 'tlt_name', header: '專櫃編號', visible: true },
    { field: 'GUIType', header: '契約編號', visible: true },
    { field: 'GUITypeVersion', header: '版次', visible: true },
    { field: 'PUR_GUINO', header: '專櫃名稱', visible: true },
    { field: 'PUR_GUIDate', header: '代扣款發票金額', visible: true, format: formatAmount, align: 'right' },
    { field: 'sam_yyymm', header: '發票號碼', visible: true },
    { field: 'MONEY_TYPE_DESC', header: '是否已列印', visible: true },

  ];
  constructor(
    private readonly dropdown: DropdownApiService,
    private readonly dropDownListService: DropDownListService,
  ) {
    super();
  }
  ngOnInit(): void {
    this.initializePage('TLS2H020', 'tls/tls2h020cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;
    this.messageService.blockUi();

    this.loading = false;
    this.messageService.unblockUi();
  }


}
