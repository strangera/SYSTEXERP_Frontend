import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { QueryDataItem, QueryRequest, Tls2d020Service } from '@service/api/tls/tls2d020.service';
import { getSYS1000, getSYS1000Options } from '@service/system/sys1000.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { ReportColumn } from '@shared/components/table-report/table-report.model';
import { formatAmount, formatYN, formatYYYYMM } from '@others/component/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarComponent } from '../../../shared/components/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { DropdownApiService } from './../../../service/utility/dropdown-api.service';

@Component({
  selector: 'app-tls2d020',
  templateUrl: './tls2d020.component.html',
  standalone: true,
  imports: [TableReportComponent, AsyncPipe, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarComponent, DropdownComponent, TranslateModule]
})
export class TLS2D020Component extends BasicQueryPageComponent<QueryDataItem> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    sam_yyymm: [null, [Validators.required]], // 試算年月
    money_type: [null, [Validators.required]], // 試算方式
    tlt_no: [null], // 專櫃編號
    tlt_floor: [null],
    pageSize: [30],
    pageIndex: [1],
  });
  sam_termnoOptions = getSYS1000Options('money_type')
  tlt_noOptions = this.dropdown.queryTltTalent();
  tlt_floorOptions = this.dropdown.querySys3900();
  totalRecords = 0;
  data: QueryDataItem[] = [];
  lastQueryBody: QueryRequest | null = null;
  columns: ReportColumn[] = [
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '專櫃名稱', visible: true },
    { field: 'source_type', header: '扣款來源', visible: true, format: (value) => getSYS1000('source_type', value) },
    { field: 'CAP_Item', header: '扣款代號', visible: true },
    { field: 'CAP_Name', header: '扣款名稱', visible: true },
    { field: 'AccNo', header: '會計科目代號', visible: true },
    { field: 'AccCName', header: '會計科目名稱', visible: true },
    { field: 'sam_yyymm', header: '扣款年月', visible: true, format: formatYYYYMM },
    { field: 'GUI_FLAG', header: '是否開立發票', visible: true, format: formatYN, exportFormat: [{ 'Y': '是' }, { 'N': '否' }] },
    { field: 'tpy_amt', header: '扣款金額(含稅)', visible: true, format: formatAmount, align: 'right' },
    { field: 'tpy_tax', header: '稅額', visible: true, format: formatAmount, align: 'right' },
    // { field: 'tpy_namt', header: '扣款金額(未稅)', visible: true },
  ];

  constructor(
    private readonly dropdown: DropdownApiService,
    public readonly tls2d020Service: Tls2d020Service,
    private readonly datePipe: DatePipe
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS2D020');
  }
  onSubmit(frm: FormGroup) {
    // 查詢時移除必填驗證
    ['money_type', 'sam_yyymm'].forEach(key => {
      const control = this.queryForm.get(key);
      control?.clearValidators();
      control?.updateValueAndValidity({ emitEvent: false });
    });
    this.handleSubmit(frm, () => {
      const body = {
        ...frm.value,
        sam_yyymm: this.datePipe.transform(frm.value.sam_yyymm, 'yyyyMM') as string
      }
      this.tls2d020Service.queryTLS2D020(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((res) => {
        this.totalRecords = res.TotalCount;
        this.lastQueryBody = body;
        this.data = res.Data;
      })
    })
  }
  onSam(frm: FormGroup) {
    // 試算時加回必填驗證
    this.queryForm.controls.money_type.setValidators([Validators.required]);
    this.queryForm.controls.sam_yyymm.setValidators([Validators.required]);
    this.queryForm.controls.money_type.updateValueAndValidity();
    this.queryForm.controls.sam_yyymm.updateValueAndValidity();
    this.handleSubmit(frm, () => {
      const body = {
        sam_yyymm: this.datePipe.transform(frm.value.sam_yyymm, 'yyyyMM') as string,
        money_type: frm.value.money_type,
        tlt_no: frm.value.tlt_no,
        tlt_floor: frm.value.tlt_floor
      }
      this.messageService.clearBubble();
      this.messageService.infoBubble('試算中,請稍候...');
      this.tls2d020Service.executeTLS2D020(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((res) => {
        if (res.Data.ErrCode === 1) {
          this.messageService.successBubble(res.Data.ErrMsg || '結算成功');
        } else {
          this.messageService.errorBubble(res.Data.ErrMsg || '結算失敗');
        }
      })
    })
  }
}
