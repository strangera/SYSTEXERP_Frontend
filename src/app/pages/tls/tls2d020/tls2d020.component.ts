import { DropdownApiService } from './../../../service/utility/dropdown-api.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, convertDateToYYYYMM, createPaginationConfig, formatAmount, formatYN, formatYYYYMM } from '@shared/componentkit/table/table.model';
import { QueryDataItem, Tls2d020Service } from '@service/api/tls/tls2d020.service';
import { getSYS1000, getSYS1000Options } from '@service/system/sys1000.service';
import { AsyncPipe } from '@angular/common';
import { finalize } from 'rxjs';
import { untilDestroyed } from '@ngneat/until-destroy';

@Component({
  selector: 'app-tls2d020',
  templateUrl: './tls2d020.component.html',
  standalone: true,
  imports: [AsyncPipe, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarComponent, DropdownComponent, TableComponent, TranslateModule]
})
export class TLS2D020Component extends BasicQueryPageComponent<QueryDataItem> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    sam_yyymm: [null, [Validators.required]], // 試算年月
    money_type: [null, [Validators.required]], // 試算方式
    tlt_no: [null], // 專櫃編號
    tlt_floor: [null],
    ...createPaginationConfig([{ field: 'tlt_no', order: 1 }]),
  });
  sam_termnoOptions = getSYS1000Options('money_type')
  tlt_noOptions = this.dropdown.queryTltTalent();
  tlt_floorOptions = this.dropdown.querySys3900();
  totalRecords = 0;
  data: QueryDataItem[] = [];
  columns: Column[] = [
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'source_type', header: '來源系統別', visible: true, format: (value) => getSYS1000('source_type', value) },
    { field: 'CAP_Item', header: '扣款代號', visible: true },
    { field: 'CAP_Name', header: '扣款名稱', visible: true },
    { field: 'AccNo', header: '會計科目代號', visible: true },
    { field: 'sam_yyymm', header: '扣款年月', visible: true, format: formatYYYYMM },
    { field: 'GUI_FLAG', header: '是否開立發票', visible: true, format: formatYN, exportFormat: [{ 'Y': '是' }, { 'N': '否' }] },
    { field: 'tpy_amt', header: '扣款金額(含稅)', visible: true, format: formatAmount },
    { field: 'tpy_tax', header: '稅額', visible: true, format: formatAmount },
    // { field: 'tpy_namt', header: '扣款金額(未稅)', visible: true },
  ];


  constructor(
    private readonly dropdown: DropdownApiService,
    private readonly tls2d020Service: Tls2d020Service
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS2D020', 'tls/tls2d020cru');
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body = {
        ...frm.value,
        sam_yyymm: convertDateToYYYYMM(frm.value.sam_yyymm),
      }
      this.tls2d020Service.queryTLS2D020(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((res) => {
        this.totalRecords = res.TotalCount;
        this.data = res.Data;
      })
    })
  }
  loading2 = false;
  onSam(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.loading = false;
      this.loading2 = true;
      const body = {
        sam_yyymm: convertDateToYYYYMM(frm.value.sam_yyymm),
        money_type: frm.value.money_type,
        tlt_no: frm.value.tlt_no,
        tlt_floor: frm.value.tlt_floor
      }
      this.tls2d020Service.executeTLS2D020(body).pipe(untilDestroyed(this), finalize(() => this.loading2 = false)).subscribe((res) => {
        this.onSubmit(frm);
        this.messageService.successBubble(res.Message);
      })
    })
  }
}
