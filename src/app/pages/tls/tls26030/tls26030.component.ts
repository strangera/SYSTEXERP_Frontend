import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Tls11010Service } from '@service/api/tls/tls11010.service';
import { TLS26030Data, TLS26030QueryRequest, TLS26030Service } from '@service/api/tls/tls26030.service';
import { Tls51080Service } from '@service/api/tls/tls51080.service';
import { FloorService } from '@service/basic/querySYS3900.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { formatAmount, formatDate, ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { FileExportService } from '@shared/service/file-export.service';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize, map, Observable, tap } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { MultiSelectComponent } from "../../../shared/componentkit/multi-select/multi-select.component";
import { createPaginationConfig, formatToSixDigits } from '../../../shared/componentkit/table/table.model';

@Component({
  selector: 'app-tls26030',
  templateUrl: './tls26030.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeComponent,
    MultiSelectComponent,
    TranslateModule,
    TableReportComponent,
    ButtonModule
  ]
})
export class TLS26030Component extends BasicQueryPageComponent<TLS26030Data> implements OnInit {
  readonly enddate: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  readonly startdate: Date = (() => {
    const d = new Date();
    d.setMonth(0, 1); // 1月1號
    d.setHours(0, 0, 0, 0);
    return d;
  })();

  queryForm = this.formBuilder.group({
    Sale_DateStart: [this.startdate, Validators.required],
    Sale_DateEnd: [this.enddate, Validators.required],
    tlt_building: [[]],                               // 館別
    Org_ID: [[]],                                     // 組織代碼
    tlt_floor: [[]],                                  // 樓層
    ECR_No: [[]],
    TLT_No: [[]],
    ...createPaginationConfig([{ field: 'TXN_Date', order: -1 }, { field: 'ECR_No', order: 1 }, { field: 'TXN_No', order: -1 }])
  });

  totalRecords = 0;
  data: TLS26030Data[] = [];
  selectedItems: TLS26030Data[] = [];
  footerData: any[] = [];
  lastQueryBody: TLS26030QueryRequest | null = null;

  columns: ReportColumn[] = [
    { field: 'TXN_Date', header: '銷售日期', visible: true, format: formatDate },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'TXN_No', header: '交易序號', visible: true, format: formatToSixDigits },
    { field: 'TLT_No', header: '專櫃編號', visible: true, align: 'left' },
    { field: 'tlt_name', header: '專櫃名稱', visible: true, align: 'left' },
    { field: 'TXN_TotSaleAmt', header: '預售金額', visible: true, format: formatAmount, isTotal: true, align: 'right' },
    { field: 'Recog_Amt', header: '認列金額', visible: true, format: formatAmount, isTotal: true, align: 'right' },
    { field: 'Batch_No', header: '認列批號', visible: true },
    { field: 'Preorder_status', header: '預售狀態', visible: true },
    { field: 'CANCEL_Date', header: '作廢日期', visible: true, format: formatDate },
    { field: 'CANCEL_ECR_No', header: '作廢機號', visible: true },
    { field: 'CANCEL_TXN_No', header: '作廢序號', visible: true },
    { field: 'Close_Date', header: '結帳日期', visible: true, format: formatDate },
    { field: 'Close_Ecr_No', header: '結帳機號', visible: true },
    { field: 'Close_Txn_No', header: '結帳序號', visible: true, format: formatToSixDigits }
  ];

  // 下拉選單選項
  floorOptions: any[] = [];
  buildingOptions: any[] = [];
  orgOptions: any[] = [];
  ecrOptions: any[] = [];
  tltOptions: any[] = [];

  // 列印按鈕載入狀態
  exportPdfLoading = false;
  exportExcelLoading = false;

  constructor(
    private tls26030Service: TLS26030Service,
    private tls11010Service: Tls11010Service,
    private floorService: FloorService,
    private tls51080Service: Tls51080Service,
    private datePipe: DatePipe,
    private dropDownListService: DropDownListService,
    private readonly fileExportService: FileExportService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS26030', 'tls/tls26030cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body = frm.getRawValue() as TLS26030QueryRequest;
      this.tls26030Service.queryTLS26030(body)
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe(response => {
          this.data = response.Data;
          this.footerData = response.footerData;
          this.totalRecords = response.TotalCount;
          this.lastQueryBody = body;
          this.queryStateService.setQueryState(this.ProgNo, body);
        });
    });
  }

  /** 供 table-report 分頁/排序時呼叫，回傳符合 { Data, TotalCount } 的 Observable 並更新 footerData */
  queryFunction = (body: TLS26030QueryRequest): Observable<{ Data: TLS26030Data[]; TotalCount: number }> => {
    return this.tls26030Service.queryTLS26030(body).pipe(
      tap(res => {
        this.footerData = res.footerData ?? [];
      }),
      map(res => ({
        Data: res.Data ?? [],
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
    this.floorService.getFloors().subscribe((data) => {
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

  onExportExcel(): void {
    if (!this.data || this.data.length === 0) {
      return;
    }

    const req$ = this.tls26030Service.exportExcelTLS26030({ ...this.lastQueryBody });
    this.fileExportService
      .executeFileExport(req$, '.xlsx', v => (this.exportExcelLoading = v))
      .subscribe();
  }

  onExportPDF(): void {
    if (!this.data || this.data.length === 0) {
      return;
    }

    const req$ = this.tls26030Service.exportPDFTLS26030({ ...this.lastQueryBody });
    this.fileExportService
      .executeFileExport(req$, '.pdf', v => (this.exportPdfLoading = v))
      .subscribe();
  }
}
