import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Tls55050Body, Tls55050Data, Tls55050Service } from '@service/api/tls/tls55050.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';

@Component({
  selector: 'app-tls55050',
  templateUrl: './tls55050.component.html',
  standalone: true,
  imports: [AsyncPipe, DropdownComponent, TableReportComponent, MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarComponent, ButtonComponent, TranslateModule]
})
export class TLS55050Component extends BasicQueryPageComponent<Tls55050Data> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    PageSize: [30],
    PageIndex: [1],
    cls_Month: [null, [Validators.required]],
    VEN_No: [null],
  });
  VEN_NoOptions = this.dropDown.queryPos2013({ VEN_Flag: '' })
  data: Tls55050Data[] = [];
  lastQueryBody: Tls55050Body | null = null;
  totalRecords = 0;
  columns: ReportColumn[] = [
    { field: 'ACP_YYYYMM', header: '結帳年月' },
    { field: 'VEN_No', header: '廠商代號' },
    { field: 'VEN_Name', header: '廠商名稱' },
    { field: 'LOGO_CH_NAME', header: '品牌中文名稱' },
    { field: 'OTA_Status', header: '狀態' },
    { field: 'TotalCount', header: '總筆數' },
  ];
  constructor(
    public readonly tls55050Service: Tls55050Service,
    private readonly dropDown: DropdownApiService,
    private readonly datePipe: DatePipe
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS55050', 'tls/tls55050cru', this.queryForm, (frm) => this.onSubmit(frm));
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body = {
        ...frm.value,
        cls_Month: this.datePipe.transform(frm.value.cls_Month, 'yyyyMM')
      }
      this.tls55050Service.queryTLS55050(body).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe((res) => {
        this.data = res.Data;
        this.totalRecords = res.TotalCount;
        this.lastQueryBody = body;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      })
    });
  }
}
