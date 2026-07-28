import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { formatAmount } from '@others/component/table/table.model';
import { TLS31080DetailResponse, TLS31080Request, TLS31080Response, Tls31080Service } from '@service/api/tls/tls31080.service';
import { DropDownListService, IDropdownItem } from '@service/utility/dropDownList.service';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { DialogModule } from 'primeng/dialog';
import { finalize } from 'rxjs';
import { ReportColumn } from '../../tls2f010-cru/tls2f010-table-report.model';

@Component({
  selector: 'app-tls31080-cru',
  standalone: true,
  imports: [TableReportComponent, DialogModule],
  templateUrl: './tls31080-cru.component.html'
})
export class Tls31080CRUComponent implements OnChanges, OnInit {
  private readonly tls31080Service = inject(Tls31080Service);
  private readonly dropDownListService = inject(DropDownListService);

  @Input() visible = false;
  @Input() rowData: TLS31080Response | null = null;
  @Input() queryConditions: TLS31080Request | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();

  loading = false;
  totalRecords = 0;
  data: TLS31080DetailResponse[] = [];
  footerData: Partial<TLS31080DetailResponse> | null = null;
  historyRequestBody: TLS31080Request | null = null;
  columns: ReportColumn[] = [];

  private floorOptions: IDropdownItem[] = [];

  readonly detailQueryFn = (body: TLS31080Request) =>
    this.tls31080Service.queryTLS31080Detail(body);

  private readonly ALL_HOUR_COLUMNS: ReportColumn[] = [
    { field: 'H00', header: '00時段', visible: true, format: formatAmount, align: 'right' },
    { field: 'H01', header: '01時段', visible: true, format: formatAmount, align: 'right' },
    { field: 'H02', header: '02時段', visible: true, format: formatAmount, align: 'right' },
    { field: 'H03', header: '03時段', visible: true, format: formatAmount, align: 'right' },
    { field: 'H04', header: '04時段', visible: true, format: formatAmount, align: 'right' },
    { field: 'H05', header: '05時段', visible: true, format: formatAmount, align: 'right' },
    { field: 'H06', header: '06時段', visible: true, format: formatAmount, align: 'right' },
    { field: 'H07', header: '07時段', visible: true, format: formatAmount, align: 'right' },
    { field: 'H08', header: '08時段', visible: true, format: formatAmount, align: 'right' },
    { field: 'H09', header: '09時段', visible: true, format: formatAmount, align: 'right' },
    { field: 'H10', header: '10時段', visible: true, format: formatAmount, align: 'right' },
    { field: 'H11', header: '11時段', visible: true, format: formatAmount, align: 'right' },
    { field: 'H12', header: '12時段', visible: true, format: formatAmount, align: 'right' },
    { field: 'H13', header: '13時段', visible: true, format: formatAmount, align: 'right' },
    { field: 'H14', header: '14時段', visible: true, format: formatAmount, align: 'right' },
    { field: 'H15', header: '15時段', visible: true, format: formatAmount, align: 'right' },
    { field: 'H16', header: '16時段', visible: true, format: formatAmount, align: 'right' },
    { field: 'H17', header: '17時段', visible: true, format: formatAmount, align: 'right' },
    { field: 'H18', header: '18時段', visible: true, format: formatAmount, align: 'right' },
    { field: 'H19', header: '19時段', visible: true, format: formatAmount, align: 'right' },
    { field: 'H20', header: '20時段', visible: true, format: formatAmount, align: 'right' },
    { field: 'H21', header: '21時段', visible: true, format: formatAmount, align: 'right' },
    { field: 'H22', header: '22時段', visible: true, format: formatAmount, align: 'right' },
    { field: 'H23', header: '23時段', visible: true, format: formatAmount, align: 'right' },
  ];

  ngOnInit(): void {
    this.dropDownListService.querySYS3900_DropDownList().subscribe(res => {
      this.floorOptions = res.Data;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']?.currentValue === true && this.rowData && this.queryConditions) {
      this.data = [];
      this.footerData = null;
      this.totalRecords = 0;
      this.buildColumns();
      this.queryDetail();
    }
  }

  // --- 動態欄位重構點 ---
  private buildColumns(): void {
    const { TimeMode, TimeFromHH, TimeToHH, PreSale, ConsumerNum } = this.queryConditions!;
    const filteredHours = this.ALL_HOUR_COLUMNS.filter(col => {
      if (TimeMode !== 'T' || TimeFromHH === null || TimeToHH === null) return true;
      const hourNum = Number.parseInt(col.field.substring(1), 10);
      if (TimeFromHH <= TimeToHH) return hourNum >= TimeFromHH && hourNum <= TimeToHH;
      return hourNum >= TimeFromHH || hourNum <= TimeToHH;
    });

    this.columns = [
      { field: 'tlt_no', header: '專櫃代號', visible: true, align: 'left' },
      { field: 'tlt_name', header: '專櫃名稱', visible: true, align: 'left' },
      { field: 'floor_desc', header: '樓層名稱', visible: true, align: 'left' },
      { field: 'TimeType', header: '時段類型', visible: true, align: 'left' },
      ...filteredHours,
      { field: 'ReentryAmt', header: '補登金額或筆數', visible: true, format: formatAmount, align: 'right' },
      { field: 'PresaleCheckoutAmt', header: '預售結帳', visible: true, format: formatAmount, align: 'right' },
      // --- 動態欄位重構點 (移除 PreOrderAmt，同步主表 visible 狀態) ---
      { field: 'PrePerformance', header: '預售業績', visible: PreSale === true, format: formatAmount, align: 'right' },
      { field: 'ConsumerNum', header: '消費人數', visible: ConsumerNum === true, format: formatAmount, align: 'right' },
      { field: 'ConsumerOrder', header: '消費客單', visible: ConsumerNum === true, format: formatAmount, align: 'right' },
      { field: 'SubTotal', header: '小計', visible: true, format: formatAmount, align: 'right' },
    ];
  }

  // --- 動態欄位重構點 ---
  private buildRequest(): TLS31080Request {
    const matched = this.floorOptions.find(x => x.Name === this.rowData!.floor_desc);
    return {
      ...this.queryConditions!,
      Floors: matched?.No ?? '',
      // 同步帶入開關條件
      PreSale: this.queryConditions?.PreSale,
      ConsumerNum: this.queryConditions?.ConsumerNum,
      pageIndex: 1,
      pageSize: 1000
    };
  }

  // --- 動態欄位重構點 ---
  private queryDetail(): void {
    const request = this.buildRequest();
    this.historyRequestBody = request;
    this.loading = true;
    this.tls31080Service.queryTLS31080Detail(request)
      .pipe(finalize(() => this.loading = false))
      .subscribe(res => {
        this.data = res.Data?.QueryData ?? [];
        const t = res.Data?.TotalData;
        this.footerData = t ? {
          H00: t.H00 ?? 0, H01: t.H01 ?? 0, H02: t.H02 ?? 0, H03: t.H03 ?? 0,
          H04: t.H04 ?? 0, H05: t.H05 ?? 0, H06: t.H06 ?? 0, H07: t.H07 ?? 0,
          H08: t.H08 ?? 0, H09: t.H09 ?? 0, H10: t.H10 ?? 0, H11: t.H11 ?? 0,
          H12: t.H12 ?? 0, H13: t.H13 ?? 0, H14: t.H14 ?? 0, H15: t.H15 ?? 0,
          H16: t.H16 ?? 0, H17: t.H17 ?? 0, H18: t.H18 ?? 0, H19: t.H19 ?? 0,
          H20: t.H20 ?? 0, H21: t.H21 ?? 0, H22: t.H22 ?? 0, H23: t.H23 ?? 0,
          ReentryAmt: t.ReentryAmt ?? 0,
          PresaleCheckoutAmt: t.PresaleCheckoutAmt ?? 0,
          // --- 動態欄位重構點 (對應 Footer 欄位) ---
          PrePerformance: t.PrePerformance ?? 0,
          ConsumerNum: t.ConsumerNum ?? 0,
          ConsumerOrder: t.ConsumerOrder ?? 0,
          SubTotal: t.SubTotal ?? 0,
        } : null;
        this.totalRecords = this.data.length;
      });
  }
}
