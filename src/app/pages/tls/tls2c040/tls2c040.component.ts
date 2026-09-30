import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { QueryTLS2C040Request } from '@service/api/tls/tls55060.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { AddButton, formatDate, ReportColumn } from '@shared/components/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { TLS2C040Service } from '../../../service/api/tls/tls2c040.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarRangeComponent } from '../../../shared/components/calendar-range/calendar-range.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { MultiSelectComponent } from '../../../shared/components/multi-select/multi-select.component';

@Component({
  selector: 'app-tls2c040',
  templateUrl: './tls2c040.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    MultiSelectComponent,
    CalendarRangeComponent,
    TableReportComponent,
    TranslateModule
  ]
})
export class TLS2C040Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    SrcSheetTypeList: [[]],                                    // 傳票種類(多選)
    VouDate_Start: [''],                                       // 傳票日期(起)
    VouDate_End: [''],                                         // 傳票日期(迄)
    TransStatusList: [[]],                                        // 傳票狀態(多選)
    No: ['', Validators.maxLength(12)],                         // 結帳單號
    pageSize: [1000],
    pageIndex: [1],
  });

  data: any[] = [];
  totalRecords = 0;
  lastQueryBody: QueryTLS2C040Request | null = null;

  // 修正 addButton：呼叫底層的 onDetail 並帶入「類型」字串作為 queryConditions
  addButton: AddButton[] = [
    {
      label: '應收',
      action: (rowData: any) => { this.onDetail(rowData, '應收') },
    },
    {
      label: '應付',
      action: (rowData: any) => { this.onDetail(rowData, '應付') },
    },
  ];
  srcSheetTypeOptions = getSYS1000Options('ENTRY_TYPE')
    .filter(option => option.value !== 'WT' && option.value !== 'WD' && option.value !== 'PNC')
    .map(option => {
      const name = option.value === 'PN' ? '進貨帳款' : option.label;
      return {
        No: option.value,
        Name: name,
        Display: `${option.value} - ${name}`
      };
    });

  transStatusOptions = getSYS1000Options('Trans_Status');
  columns: ReportColumn[] = [
    { field: 'TransVouNo', header: '傳票編號', visible: true },
    {
      field: 'SrcSheetType', header: '傳票種類', visible: true, format: (value: string) => {
        const it = this.srcSheetTypeOptions.find(item => item.No === value);
        return it ? (it.Display ?? `${it.No}-${it.Name}`) : value;
      }
    },
    { field: 'VouDate', header: '傳票日期', visible: true, format: formatDate },
    { field: 'Trans_Status', header: '傳票狀態', visible: true, format: (value: string) => this.transStatusOptions.find(item => item.value === value)?.label || value },
    { field: 'Remark', header: '傳票摘要', visible: true },
    { field: 'No', header: '結帳單號', visible: true }
  ];

  constructor(
    public readonly tls2c040Service: TLS2C040Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2C040', 'tls/tls2c040cru', this.queryForm, (form) => this.onSubmit(form));
  }

onSubmit(form: FormGroup) {
  this.handleSubmit(form, () => {

    const rawValue = form.getRawValue();

    const requestBody = {
      ...rawValue,
      SrcSheetTypeList: rawValue.SrcSheetTypeList ?? [],
      TransStatusList: rawValue.TransStatusList ?? []
    };

    this.tls2c040Service.queryTLS2C040(requestBody)
      .pipe(
        untilDestroyed(this),
        finalize(() => this.loading = false)
      )
      .subscribe(response => {
        this.data = response.Data || [];
        this.totalRecords = response.TotalCount || 0;

        this.lastQueryBody = requestBody;
        this.queryStateService.setQueryState(
          this.ProgNo,
          this.lastQueryBody
        );
      });
  });
}
}
