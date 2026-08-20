import { DatePipe, NgStyle } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { ReportColumn } from '@shared/components/table-report/table-report.model';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { Actions } from '@shared/service/permission-guard.service';
import { AccordionModule } from 'primeng/accordion';
import { Button, ButtonDirective } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { TooltipModule } from 'primeng/tooltip';
import { finalize } from 'rxjs';
import { Fin11200Service, SummaryData } from '../../../service/api/fin/fin11200.service';
import { DropdownApiService } from '../../../service/utility/dropdown-api.service';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { MultiSelectComponent } from '../../../shared/components/multi-select/multi-select.component';
import { AddButton, convertDateToYYYYMM } from '../../../others/component/table/table.model';
import { YearMonthComponent } from '../fin11020/query-year-month.component';
import { columns, ecrSummaryColumns, ecrTrackSummaryColumns, monthOptions, Pos1018 } from './fin11200.model';

@Component({
  selector: 'app-fin11200',
  templateUrl: './fin11200.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    MultiSelectComponent,
    TableReportComponent,
    Button,
    TooltipModule,
    ButtonDirective,
    NgStyle,
    TranslateModule,
    YearMonthComponent,
    DropdownModule,
  ],
})

//FIN11100電子發票配號作業
export class FIN11200Component extends BasicQueryPageComponent<Pos1018> implements OnInit {
  queryForm = this.formBuilder.group({
    GUI_YYMM: ['', Validators.required], // 發票年月
    ECR_NoList: [null], // 收銀機號
    GUI_StatusList: [null], // 發票狀態
    pageSize: [30],
    pageIndex: [1],
    SortBy: [[{ field: 'GUI_YYMM', order: 1 }, { field: 'ECR_No', order: 1 }, { field: 'SER_NOS', order: 1 }]],
  });
  totalRecords = 0;
  monthOptions = monthOptions;
  POS_NOSOptions: any = [];
  GUI_StatusOptions = getSYS1000Options('GUI_Status');
  data: Pos1018[] = [];
  summaryData: SummaryData[] = [];
  lastQueryBody: any;
  selectedRows: Pos1018[] = [];
  columns: ReportColumn[] = columns;
  ecrSummaryColumns: ReportColumn[] = ecrSummaryColumns;
  ecrTrackSummaryColumns: ReportColumn[] = ecrTrackSummaryColumns;

  displayMode = 1;
  readonly displayModeOptions = [
    { label: '明細表', value: 1 },
    { label: '機號彙總(依機台)', value: 2 },
    { label: '機號彙總(依機台+連續號)', value: 3 },
  ];

  addButton: AddButton[] = [
    {
      label: '停用',
      icon: 'pi pi-ban text-red-500',
      action: (rowData: Pos1018) => { this.onStop(rowData); },
      disabled: (rowData: Pos1018) => rowData.GUI_Status === '02' || rowData.GUI_Status === '03' || !this.hasPermission(Actions.Stop),
    }
  ]
  disabledMonthDates: Date[] = [];

  constructor(
    public readonly fin11200Service: Fin11200Service,
    private readonly dropdownApiService: DropdownApiService,
    private readonly datePipe: DatePipe
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('FIN11200', '/FIN/FIN11200cru', this.queryForm, (form) => this.onSubmit(form));
    this.dropdownApiService.queryPos1002().pipe(untilDestroyed(this)).subscribe(data => this.POS_NOSOptions = data?.map((item: { value: string; label: string; }) => ({ ...item, label: `${item.label}` })));
    // 設定GUI_YYMM預設值
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11
    if (currentMonth % 2 === 0) {
      currentDate.setMonth(currentDate.getMonth() - 1);
    }
    this.queryForm.get('GUI_YYMM')?.setValue(
      this.datePipe.transform((currentDate), 'yyyyMM'));
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body = {
        ...frm.value,
        DisplayMode: this.displayMode,
        ECR_NoList: frm.get('ECR_NoList')?.value,
      };
      this.fin11200Service.queryFIN11200(body)
        .pipe(finalize(() => this.loading = false), untilDestroyed(this))
        .subscribe((response) => {
          if (this.displayMode === 1) {
            this.data = response.Data;
            this.summaryData = [];
            this.totalRecords = response.TotalCount;
          } else {
            this.data = [];
            this.summaryData = response.Data;
          }
          this.lastQueryBody = body;
          this.queryStateService.setQueryState(this.ProgNo, frm.value);
        });
    });
  }
  manageLoading = false;
  onStop(rowData: Pos1018) {
    this.messageService.confirm({
      header: '是否停用?',
      accept: () => {
        const params = {
          ClosedDetail: {
            ID: rowData.ID,
            STO_No: rowData.STO_No,
            GUI_YYMM: convertDateToYYYYMM(new Date(rowData.GUI_YYMM)),
            SER_NOS: rowData.SER_NOS,
            ECR_No: rowData.ECR_No
          }
        }
        this.manageLoading = true;
        this.fin11200Service.execProcClosed(params).pipe(finalize(() => this.manageLoading = false)).pipe(untilDestroyed(this)).subscribe((response) => {
          if (response.Status === "0000") {
            this.messageService.successBubble(response.Message);
            this.onSubmit(this.queryForm);
          } else {
            this.messageService.errorBubble(response.Message);
          }
          this.selectedRows = [];
        });
      }
    })
  }
  btnLoading = false;
  onUpload() {
    const params = {
      ExportDetails: this.selectedRows.map((item) => ({
        ID: item.ID,
        STO_No: item.STO_No,
        GUI_YYMM: convertDateToYYYYMM(new Date(item.GUI_YYMM)),
        SER_NOS: item.SER_NOS,
        ECR_No: item.ECR_No
      }))
    }
    this.btnLoading = true;
    this.fin11200Service.execProcExport(params).pipe(finalize(() => this.btnLoading = false), untilDestroyed(this)).subscribe((response) => {
      this.messageService.successBubble(response.Message);
      this.selectedRows = [];
      this.onSubmit(this.queryForm);
    });
  }
  get summaryFooter() {
    return {
      TOT_NOS: this.summaryData.reduce((sum, r) => sum + (r.TOT_NOS ?? 0), 0),
      USED_NOS: this.summaryData.reduce((sum, r) => sum + (r.USED_NOS ?? 0), 0),
      FREE_NOS: this.summaryData.reduce((sum, r) => sum + (r.FREE_NOS ?? 0), 0),
    };
  }

  get summaryExportConditions() {
    if (!this.lastQueryBody) return null;
    const { GUI_YYMM, ECR_NoList, GUI_StatusList, DisplayMode } = this.lastQueryBody;
    return { GUI_YYMM, ECR_NoList, GUI_StatusList, DisplayMode };
  }

  onDisplayModeChange() {
    if (this.lastQueryBody) {
      this.onSubmit(this.queryForm);
    }
  }

  onAllocationOfNumber() {
    if (this.hasPermission(Actions.AllocateNumber)) { // '新增' 的 function_code 是 "20"
      this.navigateWithState(CRUDStatus.Create);
    }
  }

  isRowSelectable(row: Pos1018) {
    return row.GUI_Status === '00' || row.GUI_Status === '03';
  }
}
