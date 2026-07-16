import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Tls55040Data, Tls55040QueryBody, Tls55040Service } from '@service/api/tls/tls55040.service';
import { getSYS1000 } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { MultiSelectComponent } from "@shared/components/multi-select/multi-select.component";
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { formatAmount, formatYYYYMM, ReportColumn } from '@shared/components/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';

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
  VEN_NoOptions = this.dropDown.queryPos2013TltTalent();
  data: Tls55040Data[] = [];
  selectedItems: Tls55040Data[] = [];
  totalRecords = 0;
  lastQueryBody: Tls55040QueryBody | null = null;
  columns: ReportColumn[] = [
    { field: 'OTA_No', header: '請款編號' },
    { field: 'ACP_YYYYMM', header: '結帳年月', format: formatYYYYMM },
    { field: 'VEN_NAME', header: '廠商資料' },
    { field: 'TABTYPE', header: '單據種類', format: value => getSYS1000('TABTYPE', value) },
    { field: 'PUR_VoucherType', header: '格式', format: value => getSYS1000('PUR_VoucherType', value) },
    { field: 'OTA_Status', header: '狀況', format: value => getSYS1000('OTA_Status', value) },
    { field: 'PUR_TotNet', header: '未稅金額', format: formatAmount },
  ];
  isRowSelectable = (data: Tls55040Data) => data.OTA_Status !== '2';
  editDisabled = (data: Tls55040Data) => data.OTA_Status === '2';

  constructor(
    public readonly tls55040Service: Tls55040Service,
    private readonly dropDown: DropdownApiService,
    private readonly datePipe: DatePipe
  ) { super(); }

  ngOnInit(): void {
    const returnedOtaNo = history.state?.data;
    if (returnedOtaNo) {
      this.queryForm.patchValue({ OTA_No: returnedOtaNo });
      this.queryStateService.setQueryState(this.ProgNo, this.queryForm.value);
    }
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
  onDelete(event: Tls55040Data[]) {
    this.messageService.confirm({
      header: '刪除確認',
      message: '確定要刪除選取的資料嗎？',
      accept: () => {
        this.tls55040Service.deleteTLS55040({ OTA_NoList: event.map(x => x.OTA_No) }).pipe(untilDestroyed(this)).subscribe(res => {
          this.messageService.successBubble(res.Message);
          this.selectedItems = [];
          this.onSubmit(this.queryForm);
        });
      },
    });
  }
}
