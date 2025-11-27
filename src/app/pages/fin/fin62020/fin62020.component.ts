import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Fin62020Service } from '@service/api/fin/fin62020.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
@Component({
  selector: 'app-fin62020',
  templateUrl: './fin62020.component.html',
  standalone: true,
  imports: [TableReportComponent, MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputTextComponent, CalendarRangeComponent, DropdownComponent, RadiobuttonComponent, ButtonComponent, TranslateModule]
})
export class FIN62020Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    startserialticket: [],
    endserialticket: [],
    Subpoenatype: [],
    SSubpoenadate: [],
    ESubpoenadate: [],
    Subpoenastatus: [],
    Subpoenasummary: [],
    builder: [],
    Residualvalueyears: [],
    Depreciation: [],
    accountsummary: [],
    Subpoenatype2: [],
    Postingmethod: [],
    year: [],
    buildnumber: [],
    confirmationnumber: [],
    postingnumber: [],
    yearmm: [],
    Sbuilddate: [],
    Ebuilddate: [],
    printtype: [],
    department: [],
    activity: [],
    vander: [],
    Accountcode: [],
    code: [],
    Subpoenacode: [],
    whether: [],
    ifOptions: [],
    summary: [],
    reportingmethod: [],
    Printingmethod: [],
    Printingcolumn: [],
    display: [],
    Approvalcolumn: [],
    category: [],
    CSdate: [],
    Companybankcode: [],
    status: [],
    Salespersoncode: [],
    Employeenumber: [],
    Employeename: [],
    Organizationcode: [],
    dialnumber: [],
    ScreationDate: [],
    EcreationDate: [],
    Stransferdate: [],
    Etransferdate: [],
    TCBAC: [],
    TOCBAC: [],
  });
  ifOptions: any[] = [
    { value: 1, label: '是' },
    { value: 2, label: '否' },
  ];
  TCBACOptions: any[] = [];
  TOCBACOptions: any[] = [];
  data: any[] = [];
  selectedItems: any[] = [];
  lastQueryBody: any;
  totalRecords = 0;
  columns: ReportColumn[] = [
    { field: 'voucherNumber', header: '傳票號碼' },
    { field: 'transactionDate', header: '事槼日期' },
    { field: 'transferInBank', header: '調入銀行' },
    { field: 'transferInAccount', header: '調入帳號' },
    { field: 'transferOutBank', header: '調出銀行' },
    { field: 'transferOutAccount', header: '調出帳號' },
    { field: 'amount', header: '金額' },
    { field: 'handlingFee', header: '手續費' },
    { field: 'total', header: '合計' }
  ];

  constructor(
    public readonly fin62020Service: Fin62020Service
  ) {
    super();
  }
  ngOnInit(): void {
    this.initializePage('FIN62020', 'fin/fin62020cru', this.queryForm, (from) => this.onSubmit(from));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.fin62020Service.queryFIN62020(frm.value).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((res) => {
        // this.data = res.Data;
        // this.totalRecords = res.TotalCount;
        this.lastQueryBody = frm.value;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      })
    })
  }

  onDelete(selectedRows: any[]) {
    // const idList = selectedRows.map(row => row.ID);
    // this.fin62020Service.deleteFIN62020({ idList }).pipe(untilDestroyed(this)).subscribe(res => {
    //   this.onSubmit(this.queryForm);
    //   this.selectedRows = [];
    //   this.messageService.successBubble(res.Message);
    // });
  }
}
