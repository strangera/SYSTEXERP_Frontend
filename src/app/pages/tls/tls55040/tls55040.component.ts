import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Tls55040Data, Tls55040QueryBody, Tls55040Service } from '@service/api/tls/tls55040.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { MultiSelectComponent } from "@shared/componentkit/multi-select/multi-select.component";
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';

@Component({
  selector: 'app-tls55040',
  templateUrl: './tls55040.component.html',
  standalone: true,
  imports: [CalendarComponent, AsyncPipe, TableReportComponent, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputTextComponent, TranslateModule, MultiSelectComponent]
})
export class TLS55040Component extends BasicQueryPageComponent<Tls55040Data> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    PageSize: [30],
    PageIndex: [1],
    VEN_NoList: [null],
    OTA_No: [null, [Validators.maxLength(16)]],
    PUR_GUINo: [null, [Validators.maxLength(16)]],
    ACP_YYYYMM: [null],
  });
  VEN_NoOptions = this.dropDown.queryPos2013({ VEN_Flag: '' });
  data: Tls55040Data[] = [];
  totalRecords = 0;
  lastQueryBody: Tls55040QueryBody | null = null;
  columns: ReportColumn[] = [
    { field: 'OTA_No', header: '請款編號', visible: true },
    { field: 'ACP_YYYYMM', header: '結帳年月', visible: true },
    { field: 'VEN_NAME', header: '廠商資料', visible: true },
    { field: 'TABTYPE', header: '單據種類', visible: true },
    { field: 'PUR_VoucherType', header: '格式', visible: true },
    { field: 'OTA_Status', header: '狀況', visible: true },
    { field: 'PUR_TotNet', header: '未銷金額', visible: true },
  ];

  constructor(
    public readonly tls55040Service: Tls55040Service,
    private readonly dropDown: DropdownApiService,
    private readonly datePipe: DatePipe
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS55040', 'tls/tls55040cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const payload = {
        PageSize: frm.value.PageSize,
        PageIndex: frm.value.PageIndex,
        VEN_NoList: frm.value.VEN_NoList,
        OTA_No: frm.value.OTA_No,
        PUR_GUINo: frm.value.PUR_GUINo,
        ACP_YYYYMM: this.datePipe.transform(frm.value.ACP_YYYYMM, 'yyyyMM') ?? '',
      }
      this.tls55040Service.queryTLS55040(payload).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
        this.lastQueryBody = payload;
        this.data = res.Data;
        this.totalRecords = res.TotalCount;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      })
    })
  }
}
