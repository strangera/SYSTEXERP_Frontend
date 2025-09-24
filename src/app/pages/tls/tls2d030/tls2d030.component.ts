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
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { AsyncPipe } from '@angular/common';
import { Tls2d030Service } from '@service/api/tls/tls2d030.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { finalize } from 'rxjs';

// 2.2.13.3 專櫃代扣款結算作業
@Component({
  selector: 'app-tls2d030',
  templateUrl: './tls2d030.component.html',
  standalone: true,
  imports: [AsyncPipe, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarComponent, DropdownComponent, TableComponent, TranslateModule]
})
export class TLS2D030Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    sam_yyymm: [null, [Validators.required]], // 試算年月
    money_type: [null, [Validators.required]], // 試算方式
    tlt_no: [null], // 專櫃編號
    floor_no: [null],
    ...createPaginationConfig([{ field: 'TLT_NO', order: 1 }]),
  });
  money_typeOptions = getSYS1000Options('money_type')
  tlt_noOptions = this.dropdown.queryTltTalent();
  totalRecords = 0;
  data: any[] = [];
  columns: Column[] = [
    { field: 'sam_yyymm', header: '結算年月', visible: true },
    { field: 'money_type', header: '結帳方式', visible: true },
    { field: 'term_no', header: '帳次', visible: true },
    { field: 'industryType', header: '費用型態', visible: true },
    { field: 'category', header: '關帳時間', visible: true },
    { field: 'version', header: '關帳時間', visible: true },
    { field: 'rentNumber', header: '關帳者', visible: true },
  ];

  constructor(
    private readonly dropdown: DropdownApiService,
    private readonly tls2d030Service: Tls2d030Service
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS2D030', 'tls/tls2d030cru', this.queryForm, (form) => this.onSubmit(form));
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      // this.tls2d030Service.queryTLS2D030(frm.value).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((res) => {
      //   this.totalRecords = res.totalRecords;
      //   this.data = res.data;
      // })
    })
  }
}
