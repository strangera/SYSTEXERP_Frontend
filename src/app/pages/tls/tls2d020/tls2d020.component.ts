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
import { Column, createPaginationConfig } from '@shared/componentkit/table/table.model';
import { Tls2d020Service } from '@service/api/tls/tls2d020.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { AsyncPipe } from '@angular/common';
import { finalize } from 'rxjs';
import { untilDestroyed } from '@ngneat/until-destroy';

@Component({
  selector: 'app-tls2d020',
  templateUrl: './tls2d020.component.html',
  standalone: true,
  imports: [AsyncPipe, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarComponent, DropdownComponent, TableComponent, TranslateModule]
})
export class TLS2D020Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    sam_yyymm: [null, [Validators.required]], // 試算年月
    money_type: [null, [Validators.required]], // 試算方式
    tlt_no: [null], // 專櫃編號
    floor_no: [null],
    ...createPaginationConfig([{ field: 'TLT_NO', order: 1 }]),
  });
  money_typeOptions = getSYS1000Options('money_type')
  tlt_noOptions = this.dropdown.queryTltTalent();
  floor_no = this.dropdown.querySys3900();
  totalRecords = 0;
  data: any[] = [];
  columns: Column[] = [
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'source_type', header: '來源系統別', visible: true },
    { field: 'CAP_Item', header: '扣款代號', visible: true },
    { field: 'CAP_Name', header: '扣款名稱', visible: true },
    { field: 'AccNo', header: '會計科目代號', visible: true },
    { field: 'sam_yyymm', header: '扣款年月', visible: true },
    { field: 'GUI_FLAG', header: '是否開立發票', visible: true },
    { field: 'tpy_amt', header: '扣款金額(含稅)', visible: true },
    { field: 'tpy_tax', header: '稅額', visible: true },
    { field: 'tpy_namt', header: '扣款金額(未稅)', visible: true },
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
      // this.tls2d020Service.queryTLS2D020(frm.value).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((res) => {
      //   this.totalRecords = res.totalRecords;
      //   this.data = res.data;
      // })
    })
  }
}
