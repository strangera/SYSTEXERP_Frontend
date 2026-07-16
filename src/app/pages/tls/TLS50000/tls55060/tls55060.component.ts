import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { QueryTLS55060Request, TLS55060QueryItem, TLS55060Service } from '@service/api/tls/tls55060.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { IDropdownItem } from '@service/utility/dropDownList.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarRangeComponent } from '@shared/components/calendar-range/calendar-range.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { MultiSelectComponent } from '@shared/components/multi-select/multi-select.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { AddButton, formatDate, ReportColumn } from '@shared/components/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-tls55060',
  templateUrl: './tls55060.component.html',
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
export class TLS55060Component extends BasicQueryPageComponent<TLS55060QueryItem> implements OnInit {
  queryForm = this.formBuilder.group({
    SrcSheetTypeList: [[]],                                    // 傳票種類(多選)
    VouDate_Start: [''],                                       // 傳票日期(起)
    VouDate_End: [''],                                         // 傳票日期(迄)
    PostFlagList: [[]],                                        // 傳票狀態(多選)
    No: ['', Validators.maxLength(12)],                         // 結帳單號
    pageSize: [30],
    pageIndex: [1], // 你將初始頁碼改為 1
  });

  data: TLS55060QueryItem[] = [];
  selectedItems: TLS55060QueryItem[] = [];
  totalRecords = 0;
  lastQueryBody: QueryTLS55060Request | null = null;

  addButton: AddButton[] = [
    {
      label: '應收',
      action: (rowData: TLS55060QueryItem) => { this.onDetail(rowData, '應收') },
    },
    {
      label: '應付',
      action: (rowData: TLS55060QueryItem) => { this.onDetail(rowData, '應付') },
    },
  ];

  //#region 下拉選單選項
  // 傳票種類 - 從 SYS1000(ENTRY_TYPE) 取得並過濾只顯示 WT、WD
  srcSheetTypeOptions = getSYS1000Options('ENTRY_TYPE').filter(option => option.value === 'WT' || option.value === 'WD').map(option => ({
    No: option.value,
    Name: option.label,
    Display: `${option.value} - ${option.label}`
  }));
  // 傳票狀態
  postFlagOptions: IDropdownItem[] = [
    { No: '0', Name: '作廢' },
    { No: '1', Name: '建立' },
    { No: '2', Name: '確認' },
    { No: '3', Name: '過帳' }
  ];
  //#endregion

  columns: ReportColumn[] = [
    { field: 'VouNo', header: '傳票編號', visible: true },
    {
      field: 'SrcSheetType', header: '傳票種類', visible: true, format: (value: string) => {
        const it = this.srcSheetTypeOptions.find(item => item.No === value);
        return it ? (it.Display ?? `${it.No}-${it.Name}`) : value;
      }
    },
    { field: 'VouDate', header: '傳票日期', visible: true, format: formatDate },
    { field: 'PostFlag', header: '傳票狀態', visible: true, format: (value: string) => this.postFlagOptions.find(item => item.No === value)?.Name || value },
    { field: 'Remark', header: '傳票摘要', visible: true },
    { field: 'No', header: '結帳單號', visible: true }
  ];

  constructor(
    public readonly tls55060Service: TLS55060Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS55060', 'tls/tls55060cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(form: FormGroup) {
    this.handleSubmit(form, () => {
      this.tls55060Service.queryTLS55060(form.getRawValue()).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(response => {
        this.data = response.Data;
        this.totalRecords = response.TotalCount;
        this.lastQueryBody = form.getRawValue();
        this.queryStateService.setQueryState(this.ProgNo, form.getRawValue());
      });
    });
  }
}
