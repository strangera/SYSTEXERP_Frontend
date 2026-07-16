import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Tls11010Service } from '@service/api/tls/tls11010.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { formatAmount, formatDate, ReportColumn } from '@shared/components/table-report/table-report.model';
import { FileExportService } from '@shared/service/file-export.service';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize, map, Observable, tap } from 'rxjs';
import {
  TLS26020Data,
  TLS26020DetailData,
  TLS26020QueryRequest,
  TLS26020Service
} from '../../../service/api/tls/tls26020.service';
import { DropdownApiService } from '../../../service/utility/dropdown-api.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarRangeComponent } from '../../../shared/components/calendar-range/calendar-range.component';
import { MultiSelectComponent } from "../../../shared/components/multi-select/multi-select.component";
import { createPaginationConfig, formatToSixDigits } from '../../../others/component/table/table.model';

@Component({
  selector: 'app-tls26020',
  templateUrl: './tls26020.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    CalendarRangeComponent,
    MultiSelectComponent,
    TableReportComponent,
    ButtonModule
  ]
})
export class TLS26020Component extends BasicQueryPageComponent<TLS26020Data> implements OnInit {
  readonly enddate: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  readonly startdate: Date = (() => {
    const d = new Date(this.enddate);
    d.setMonth(d.getMonth() - 1);
    return d;
  })();

  queryForm = this.formBuilder.group({
    Sale_DateStart: [this.startdate, Validators.required],
    Sale_DateEnd: [this.enddate, Validators.required],
    tlt_building: [[]],
    Org_ID: [[]],
    Org_Name: [''],
    tlt_floor: [[]],
    ECR_No: [[]],
    TLT_No: [[]],
    ...createPaginationConfig([{ field: 'tlt_no', order: 1 }]), // 修正排序欄位
    pageSize: [1000],
  });

  totalRecords = 0;
  data: TLS26020Data[] = [];
  selectedItems: TLS26020Data[] = [];
  footerData: Record<string, unknown> = {};
  lastQueryBody: TLS26020QueryRequest | null = null;

  // 修正 columns 根據實際 API 回應
  columns: ReportColumn[] = [
    { field: 'tlt_no', header: '專櫃編號', visible: true, align: 'left' },
    { field: 'tlt_name', header: '專櫃名稱', visible: true, align: 'left' },
    { field: 'txn_TotGUI', header: '發票金額', visible: true, format: formatAmount, isTotal: true, align: 'right' },
    { field: 'txn_TotSaleAmt', header: '業績金額', visible: true, format: formatAmount, isTotal: true, align: 'right' }
  ];

  // 展開詳細資料的欄位定義
  expansionColumns: ReportColumn[] = [
    { field: 'TXN_DATE', header: '銷售日期', visible: true, format: formatDate },
    { field: 'ECR_NO', header: '機號', visible: true },
    { field: 'TXN_NO', header: '交易序號', visible: true, format: formatToSixDigits },
    { field: 'TXN_GUIBegNo_Pre', header: '字軌', visible: true },
    { field: 'TXN_GUIBegNo', header: '發票起始號碼', visible: true },
    { field: 'TXN_GUIEndNo', header: '發票結束號碼', visible: true },
    { field: 'TXN_TotGUI', header: '發票金額', visible: true, format: formatAmount, align: 'right' },
    { field: 'TXN_TotSaleAmt', header: '業績金額', visible: true, format: formatAmount, align: 'right' }
  ];

  // 下拉選單選項
  floorOptions: { label: string; value: string }[] = [];
  buildingOptions: { label: string; value: string }[] = [];
  orgOptions: { Name: string; No: string }[] = [];
  ecrOptions: { label: string; value: string }[] = [];
  tltOptions: { label: string; value: string }[] = [];

  // 列印按鈕載入狀態
  exportPdfLoading = false;
  exportExcelLoading = false;

  constructor(
    private tls26020Service: TLS26020Service,
    private tls11010Service: Tls11010Service,
    private readonly dropdownApiService: DropdownApiService,
    private datePipe: DatePipe,
    private dropDownListService: DropDownListService,
    private readonly fileExportService: FileExportService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS26020', 'tls/tls26020cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body = frm.getRawValue();
      this.tls26020Service.queryTLS26020(body)
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe(response => {
          this.data = response.Data.mainData;
          this.footerData = {
            txn_TotGUI: response.Data.totalData[0]?.txn_Total_TotGUI,
            txn_TotSaleAmt: response.Data.totalData[0]?.txn_Total_TotSaleAmt
          };
          this.totalRecords = response.TotalCount;
          this.lastQueryBody = body as TLS26020QueryRequest;
          this.queryStateService.setQueryState(this.ProgNo, body);
        });
    });
  }

  /** 供 table-report 分頁/排序時呼叫，回傳符合 { Data, TotalCount } 的 Observable 並更新 footerData */
  queryFunction = (body: TLS26020QueryRequest): Observable<{ Data: TLS26020Data[]; TotalCount: number }> => {
    return this.tls26020Service.queryTLS26020(body).pipe(
      tap(res => {
        this.footerData = {
          txn_TotGUI: res.Data?.totalData?.[0]?.txn_Total_TotGUI,
          txn_TotSaleAmt: res.Data?.totalData?.[0]?.txn_Total_TotSaleAmt
        };
      }),
      map(res => ({
        Data: res.Data?.mainData ?? [],
        TotalCount: res.TotalCount ?? 0
      }))
    );
  };

  loadOptions() {
    // 加載館別選項
    this.tls11010Service.getBuildingOptions().subscribe((data) => {
      this.buildingOptions = data;
    });

    // 加載樓層選項
    this.dropdownApiService.querySys3900().pipe(map(items => (items ?? []).map(item => ({ value: item.No, label: item.Name })))).subscribe((data) => {
      this.floorOptions = data;
    });

    // 組織代碼下拉
    this.dropDownListService.querySYS3100_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(options => {
        this.orgOptions = options.Data.map(item => ({
          Name: `${item.No} - ${item.Name}`,
          No: item.No
        }));
      });

    // 收銀機號下拉
    this.dropDownListService.queryPOS1002_DropDownList().pipe(untilDestroyed(this)).subscribe(options => {
      this.ecrOptions = options.Data.map(item => ({
        label: `${item.No} - ${item.Name}`,
        value: item.No
      }));
    });

    // 專櫃編號下拉
    this.dropDownListService.queryTLTTALENT_DropDownList().pipe(untilDestroyed(this)).subscribe(options => {
      this.tltOptions = options.Data.map(item => ({
        label: `${item.No} - ${item.Name}`,
        value: item.No
      }));
    });
  }

  loadDetails = (rowData: TLS26020Data): Observable<ApiResponse<TLS26020DetailData[]>> => {
    return this.tls26020Service.queryTLS26020Detail({
      tlt_no: rowData.tlt_no,
      Sale_DateStart: this.datePipe.transform(this.queryForm.controls.Sale_DateStart.value, 'yyyy-MM-dd') ?? '',
      Sale_DateEnd: this.datePipe.transform(this.queryForm.controls.Sale_DateEnd.value, 'yyyy-MM-dd') ?? ''
    })
  };

  onExportExcel(): void {
    if (!this.data || this.data.length === 0) {
      return;
    }

    const req$ = this.tls26020Service.exportExcelTLS26020({ ...this.lastQueryBody });
    this.fileExportService
      .executeFileExport(req$, '.xlsx', v => (this.exportExcelLoading = v))
      .subscribe();
  }

  onExportPDF(): void {
    if (!this.data || this.data.length === 0) {
      return;
    }

    const req$ = this.tls26020Service.exportPDFTLS26020({ ...this.lastQueryBody });
    this.fileExportService
      .executeFileExport(req$, '.pdf', v => (this.exportPdfLoading = v))
      .subscribe();
  }
}
