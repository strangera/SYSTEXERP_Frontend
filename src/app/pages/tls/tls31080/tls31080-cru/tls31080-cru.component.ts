import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { formatAmount } from '@others/component/table/table.model';
import { TLS31080DetailResponse, TLS31080Request, TLS31080Response, Tls31080Service } from '@service/api/tls/tls31080.service';
import { DropDownListService, IDropdownItem } from '@service/utility/dropDownList.service';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { DialogModule } from 'primeng/dialog';
import { finalize } from 'rxjs';
import { ReportColumn } from '../../tls2f010-cru/tls2f010-table-report.model';
import { filterHourColumns } from '../../TLS30000/common/report-hour-columns.const';

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
  footerData: Partial<TLS31080DetailResponse>[] = [];
  historyRequestBody: TLS31080Request | null = null;
  columns: ReportColumn[] = [];
  private floorOptions: IDropdownItem[] = [];

  readonly detailQueryFn = (body: TLS31080Request) => this.tls31080Service.queryTLS31080Detail(body);

  ngOnInit(): void {
    this.dropDownListService.querySYS3900_DropDownList().subscribe(res => {
      this.floorOptions = res.Data;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']?.currentValue === true && this.rowData && this.queryConditions) {
      this.data = [];
      this.footerData = [];
      this.totalRecords = 0;
      this.buildColumns();
      this.queryDetail();
    }
  }

  private buildColumns(): void {
    const { TimeMode, TimeFromHH, TimeToHH, PreSale, ConsumerNum } = this.queryConditions!;
    const filteredHours = filterHourColumns(TimeMode, TimeFromHH, TimeToHH);

    this.columns = [
      { field: 'tlt_no', header: '專櫃代號', visible: true, align: 'left' },
      { field: 'tlt_name', header: '專櫃名稱', visible: true, align: 'left' },
      { field: 'floor_desc', header: '樓層名稱', visible: true, align: 'left' },
      { field: 'TimeType', header: '時段類型', visible: true, align: 'left' },
      ...filteredHours,
      { field: 'ReentryAmt', header: '補登金額或筆數', visible: true, format: formatAmount, align: 'right' },
      { field: 'PresaleCheckoutAmt', header: '預售結帳', visible: true, format: formatAmount, align: 'right' },
      { field: 'PrePerformance', header: '預售業績', visible: PreSale === true, format: formatAmount, align: 'right' },
      { field: 'ConsumerNum', header: '消費人數', visible: ConsumerNum === true, format: formatAmount, align: 'right' },
      { field: 'ConsumerOrder', header: '消費客單', visible: ConsumerNum === true, format: formatAmount, align: 'right' },
      { field: 'SubTotal', header: '小計', visible: true, format: formatAmount, align: 'right' },
    ];
  }

  private buildRequest(): TLS31080Request {
    const matched = this.floorOptions.find(x => x.Name === this.rowData!.floor_desc);
    return {
      ...this.queryConditions!,
      Floors: matched?.No ?? '',
      TaxType: this.queryConditions?.IncludeTax ? 1 : 0, // ✅ 轉成後端 Detail SP 接收的 TaxType
      PreSale: this.queryConditions?.PreSale,
      ConsumerNum: this.queryConditions?.ConsumerNum,
      pageIndex: 1,
      pageSize: 1000
    };
  }

  private queryDetail(): void {
    const request = this.buildRequest();
    this.historyRequestBody = request;
    this.loading = true;

    this.tls31080Service.queryTLS31080Detail(request)
      .pipe(finalize(() => this.loading = false))
      .subscribe(res => {

        const resultObj: any = res?.Data ?? {};

        const queryData: TLS31080DetailResponse[] =
          Array.isArray(res?.Data)
            ? res.Data
            : Array.isArray(resultObj?.Data)
              ? resultObj.Data
              : [];

        const totalData: TLS31080DetailResponse[] =
          Array.isArray(res?.TotalData)
            ? res.TotalData
            : Array.isArray(resultObj?.TotalData)
              ? resultObj.TotalData
              : [];

        // ★ 只補 Detail 小計欄位名稱相容
        this.data = queryData.map((x: any) => ({
          ...x,
          SubTotal: x.SubTotal ?? x.Subtotal ?? 0
        }));

        this.footerData = totalData.map((t: TLS31080DetailResponse) => ({
          TimeType: t.TimeType,
          H00: t.H00 ?? 0,
          H01: t.H01 ?? 0,
          H02: t.H02 ?? 0,
          H03: t.H03 ?? 0,
          H04: t.H04 ?? 0,
          H05: t.H05 ?? 0,
          H06: t.H06 ?? 0,
          H07: t.H07 ?? 0,
          H08: t.H08 ?? 0,
          H09: t.H09 ?? 0,
          H10: t.H10 ?? 0,
          H11: t.H11 ?? 0,
          H12: t.H12 ?? 0,
          H13: t.H13 ?? 0,
          H14: t.H14 ?? 0,
          H15: t.H15 ?? 0,
          H16: t.H16 ?? 0,
          H17: t.H17 ?? 0,
          H18: t.H18 ?? 0,
          H19: t.H19 ?? 0,
          H20: t.H20 ?? 0,
          H21: t.H21 ?? 0,
          H22: t.H22 ?? 0,
          H23: t.H23 ?? 0,
          ReentryAmt: t.ReentryAmt ?? 0,
          PresaleCheckoutAmt: t.PresaleCheckoutAmt ?? 0,
          PrePerformance: t.PrePerformance ?? 0,
          ConsumerNum: t.ConsumerNum ?? 0,
          ConsumerOrder: t.ConsumerOrder ?? 0,
          SubTotal: t.SubTotal ?? 0,
        }));

        this.totalRecords = this.data.length;
      });
  }
}
