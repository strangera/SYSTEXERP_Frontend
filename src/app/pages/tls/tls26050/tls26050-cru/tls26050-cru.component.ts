import {
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

import { DialogModule } from 'primeng/dialog';

import { formatAmount } from '@others/component/table/table.model';

import { TableReportComponent } from '@shared/components/table-report/table-report.component';

import {
  formatAmountWithDecimals,
  ReportColumn
} from '@shared/components/table-report/table-report.model';

import {
  TLS26050Data,
  TLS26050QueryRequest
} from 'src/app/service/api/tls/tls26050.service';

import {
  TLS26070Data,
  TLS26070QueryRequest,
  TLS26070Service
} from 'src/app/service/api/tls/tls26070.service';


@Component({
  selector: 'app-tls26050-cru',
  standalone: true,
  imports: [
    TableReportComponent,
    DialogModule
  ],
  templateUrl: './tls26050-cru.component.html'
})
export class Tls26050CRUComponent implements OnChanges {

  private readonly tls26070Service = inject(TLS26070Service);
  private readonly destroyRef = inject(DestroyRef);


  // =========================================================
  // Input / Output
  // =========================================================

  @Input()
  visible = false;

  @Input()
  rowData: TLS26050Data | null = null;

  @Input()
  queryConditions: TLS26050QueryRequest | null = null;

  @Output()
  visibleChange = new EventEmitter<boolean>();


  // =========================================================
  // Table
  // =========================================================

  loading = false;

  totalRecords = 0;

  data: TLS26070Data[] = [];

  historyRequestBody: TLS26070QueryRequest | null = null;

  columns: ReportColumn[] = [];


  // =========================================================
  // API
  // =========================================================

  /**
   * TableReportComponent 分頁 / 排序時使用。
   *
   * TLS26070 實際 Response：
   *
   * Data: {
   *   QueryData: [],
   *   SumData: [],
   *   AllData: []
   * }
   *
   * 因目前後端會出現：
   *
   * QueryData = []
   * SumData = 有資料
   * TotalCount = 有筆數
   *
   * 所以：
   * 1. QueryData 有資料 -> 使用 QueryData
   * 2. QueryData 沒資料 -> 暫時使用 SumData
   */
  readonly detailQueryFn = (body: TLS26070QueryRequest) =>
    this.tls26070Service
      .queryTLS26070(body)
      .pipe(

        map((response: any) => {

          const queryData: TLS26070Data[] =
            response?.Data?.QueryData ?? [];

          const sumData: TLS26070Data[] =
            response?.Data?.SumData ?? [];

          const allData: TLS26070Data[] =
            response?.Data?.AllData ?? [];


          // =============================================
          // Table 實際顯示資料
          // =============================================

          const tableData: TLS26070Data[] =
            queryData.length > 0
              ? queryData
              : sumData;


          console.log('========================================');
          console.log('TLS26070 API Response');
          console.log('========================================');

          console.log('完整 Response =', response);

          console.log(
            'QueryData =',
            queryData
          );

          console.log(
            'QueryData 筆數 =',
            queryData.length
          );

          console.log(
            'SumData =',
            sumData
          );

          console.log(
            'SumData 筆數 =',
            sumData.length
          );

          console.log(
            'AllData =',
            allData
          );

          console.log(
            'Table 實際顯示 =',
            tableData
          );

          console.log(
            'TotalCount =',
            response?.TotalCount
          );


          return {

            Data: tableData,

            QueryData: queryData,

            SumData: sumData,

            AllData: allData,

            TotalCount:
              response?.TotalCount ??
              tableData.length
          };

        }),

        takeUntilDestroyed(this.destroyRef)
      );


  // =========================================================
  // Life Cycle
  // =========================================================

  ngOnChanges(changes: SimpleChanges): void {

    if (
      changes['visible']?.currentValue === true &&
      this.rowData
    ) {

      this.data = [];

      this.totalRecords = 0;

      this.columns = this.buildColumns(
        this.queryConditions?.tax ?? true
      );

      this.queryDetail();
    }
  }


  // =========================================================
  // 建立 TLS26070 Request
  // =========================================================

  private buildRequest(): TLS26070QueryRequest {

    const q = this.queryConditions;
    const row = this.rowData!;


    const request: TLS26070QueryRequest = {

      // =====================================================
      // 分頁
      // =====================================================

      pageSize:
        q?.pageSize ?? 30,

      pageIndex:
        q?.pageIndex ?? 1,

      SortBy:
        q?.SortBy ?? [
          {
            field: 'team_name',
            order: -1
          }
        ],


      // =====================================================
      // 報表類型
      // =====================================================

      reportType:
        q?.reportType ?? '1',


      // =====================================================
      // 日報
      // =====================================================

      onedatedd:
        q?.onedatedd,

      onedatedd_c:
        q?.onedatedd_c,


      // =====================================================
      // 週報
      // =====================================================

      onedateyy:
        q?.onedateyy,

      weeks:
        q?.weeks,

      startdate:
        q?.startdate,

      enddate:
        q?.enddate,

      onedateyy_c:
        q?.onedateyy_c,

      weeks_c:
        q?.weeks_c,

      startdate_c:
        q?.startdate_c,

      enddate_c:
        q?.enddate_c,


      // =====================================================
      // 月報
      // =====================================================

      onedatemm:
        q?.onedatemm,

      onedatemm_c:
        q?.onedatemm_c,


      // =====================================================
      // 半年報
      // =====================================================

      halfyear_onedateyy:
        q?.halfyear_onedateyy,

      halfyear:
        q?.halfyear,

      halfyear_onedateyy_c:
        q?.halfyear_onedateyy_c,

      halfyear_c:
        q?.halfyear_c,


      // =====================================================
      // 年報
      // =====================================================

      year_onedateyy:
        q?.year_onedateyy,

      year_onedateyy_c:
        q?.year_onedateyy_c,


      // =====================================================
      // 區間
      // =====================================================

      sad_startdate:
        q?.sad_startdate,

      sad_enddate:
        q?.sad_enddate,

      sad_startdate_c:
        q?.sad_startdate_c,

      sad_enddate_c:
        q?.sad_enddate_c,


      // =====================================================
      // 活動
      // =====================================================

      eventID:
        q?.eventID,

      event_startdate:
        q?.event_startdate,

      event_enddate:
        q?.event_enddate,

      eventID_c:
        q?.eventID_c,

      event_startdate_c:
        q?.event_startdate_c,

      event_enddate_c:
        q?.event_enddate_c,


      // =====================================================
      // 查詢條件
      // =====================================================

      floor:
        q?.floor,

      region:
        q?.region,


      // =====================================================
      // 大分類
      // =====================================================

      bus_type:
        row.bus_type
          ? [row.bus_type]
          : q?.bus_type,


      // =====================================================
      // 中分類
      // =====================================================

      bus_class:
        q?.bus_class,


      // =====================================================
      // 櫃別
      // =====================================================

      tlt_kind:
        row.tlt_kind
          ? [row.tlt_kind]
          : q?.tlt_kind,


      // =====================================================
      // 抽成別
      // =====================================================

      tlt_term_type:
        q?.tlt_term_type,


      // =====================================================
      // 組織
      //
      // 注意：
      // 不使用 division_no 覆蓋 org_id
      // 沿用 TLS26050 原始查詢條件
      // =====================================================

      org_id:
        q?.org_id,


      // =====================================================
      // 專櫃
      // =====================================================

      tlt_no:
        q?.tlt_no,


      // =====================================================
      // 稅別
      // =====================================================

      tax:
        q?.tax ?? true,


      // =====================================================
      // 館別
      //
      // TLS26050：
      // string[]
      //
      // TLS26070：
      // string
      //
      // ["A1"] -> "A1"
      // =====================================================

      tlt_building:
        row.tlt_building ??
        q?.tlt_building?.[0] ??
        undefined
    };


    console.log('========================================');
    console.log('TLS26070 最終 Request');
    console.log('========================================');

    console.log('rowData =', row);

    console.log(
      'pageSize =',
      request.pageSize
    );

    console.log(
      'pageIndex =',
      request.pageIndex
    );

    console.log(
      'reportType =',
      request.reportType
    );

    console.log(
      'onedatedd =',
      request.onedatedd
    );

    console.log(
      'onedatedd_c =',
      request.onedatedd_c
    );

    console.log(
      'tlt_building =',
      request.tlt_building
    );

    console.log(
      'bus_type =',
      request.bus_type
    );

    console.log(
      'bus_class =',
      request.bus_class
    );

    console.log(
      'tlt_kind =',
      request.tlt_kind
    );

    console.log(
      'org_id =',
      request.org_id
    );

    console.log(
      'tax =',
      request.tax
    );

    console.log(
      '完整 Request =',
      request
    );


    return request;
  }


  // =========================================================
  // 查詢
  // =========================================================

  private queryDetail(): void {

    if (!this.rowData) {
      return;
    }


    const request =
      this.buildRequest();


    this.historyRequestBody =
      request;


    this.loading = true;


    this.detailQueryFn(request)
      .subscribe({

        next: (res) => {

          console.log('========================================');
          console.log('TLS26070 Table Result');
          console.log('========================================');

          console.log(
            'Table Data =',
            res.Data
          );

          console.log(
            'Table Data 筆數 =',
            res.Data?.length ?? 0
          );

          console.log(
            'QueryData =',
            res.QueryData
          );

          console.log(
            'SumData =',
            res.SumData
          );

          console.log(
            'AllData =',
            res.AllData
          );

          console.log(
            'TotalCount =',
            res.TotalCount
          );


          // =============================================
          // 給 app-table-report
          // =============================================

          this.data =
            res.Data ?? [];


          /**
           * 注意：
           *
           * 如果現在使用的是 SumData fallback，
           * 後端雖然 TotalCount = 4，
           * 但 SumData 可能只有 1 筆。
           *
           * 目前先維持後端 TotalCount。
           */
          this.totalRecords =
            res.TotalCount ??
            this.data.length;


          this.loading = false;
        },


        error: (error) => {

          console.error(
            'TLS26070 查詢失敗',
            error
          );


          this.data = [];

          this.totalRecords = 0;

          this.loading = false;
        }
      });
  }


  // =========================================================
  // Dialog
  // =========================================================

  onHide(): void {

    this.visibleChange.emit(false);
  }


  // =========================================================
  // Columns
  // =========================================================

  private buildColumns(
    tax: boolean
  ): ReportColumn[] {

    return [

      {
        field: 'tlt_building',
        header: '館別',
        visible: true,
        align: 'left'
      },

      {
        field: 'talent_id',
        header: '專櫃編號',
        visible: true,
        align: 'left'
      },

      {
        field: 'team_name',
        header: 'TEAM',
        visible: true,
        align: 'left'
      },

      {
        field: 'division_name',
        header: '組別',
        visible: true,
        align: 'left'
      },

      {
        field: 'tlt_kind',
        header: '櫃別',
        visible: true,
        align: 'left'
      },

      {
        field: 'bus_class_name',
        header: '大分類',
        visible: false,
        align: 'left'
      },

      {
        field: 'bus_sclass_name',
        header: '小分類',
        visible: true,
        align: 'left'
      },

      {
        field: 'tlt_name',
        header: '專櫃名稱',
        visible: true,
        align: 'left'
      },


      // =====================================================
      // 目標
      // =====================================================

      {
        field: 'budget_now',
        header: '目標',
        visible: true,
        format: formatAmount,
        isTotal: true,
        align: 'right'
      },


      // =====================================================
      // 當期預售金額
      // =====================================================

      {
        field: 'preorder_amt_now',
        header: '當期預售金額',
        visible: tax,
        format: formatAmount,
        isTotal: true,
        align: 'right'
      },

      {
        field: 'preorder_namt_now',
        header: '當期預售金額',
        visible: !tax,
        format: formatAmount,
        isTotal: true,
        align: 'right'
      },


      // =====================================================
      // 目標達成率
      // =====================================================

      {
        field: 'Achievement_rate_now',
        header: '目標達成率',
        visible: tax,
        format: (value: number) =>
          value
            ? `${value.toFixed(2)}%`
            : '0%',
        isTotal: true,
        align: 'right',
        exportFormat: 'percentage'
      },

      {
        field: 'nAchievement_rate_now',
        header: '目標達成率',
        visible: !tax,
        format: (value: number) =>
          value
            ? `${value.toFixed(2)}%`
            : '0%',
        isTotal: true,
        align: 'right',
        exportFormat: 'percentage'
      },


      // =====================================================
      // 當期交易筆數
      // =====================================================

      {
        field: 'preorder_custcnt_now',
        header: '當期交易筆數',
        visible: true,
        isTotal: true,
        format: formatAmount,
        align: 'right'
      },


      // =====================================================
      // 當期客單價
      // =====================================================

      {
        field: 'avg_ordervalue_now',
        header: '當期客單價',
        visible: tax,
        format: formatAmount,
        isTotal: true,
        align: 'right'
      },

      {
        field: 'navg_ordervalue_now',
        header: '當期客單價',
        visible: !tax,
        format: formatAmount,
        isTotal: true,
        align: 'right'
      },


      // =====================================================
      // 去年同期預售金額
      // =====================================================

      {
        field: 'preorder_amt_last',
        header: '去年同期預售金額',
        visible: tax,
        format: formatAmount,
        isTotal: true,
        align: 'right'
      },

      {
        field: 'preorder_namt_last',
        header: '去年同期預售金額',
        visible: !tax,
        format: formatAmount,
        isTotal: true,
        align: 'right'
      },


      // =====================================================
      // 去年同期交易筆數
      // =====================================================

      {
        field: 'preorder_custcnt_last',
        header: '去年同期交易筆數',
        visible: true,
        isTotal: true,
        format: formatAmount,
        align: 'right'
      },


      // =====================================================
      // 去年同期客單價
      // =====================================================

      {
        field: 'avg_ordervalue_last',
        header: '去年同期客單價',
        visible: tax,
        format: formatAmount,
        isTotal: true,
        align: 'right'
      },

      {
        field: 'navg_ordervalue_last',
        header: '去年同期客單價',
        visible: !tax,
        format: formatAmount,
        isTotal: true,
        align: 'right'
      },


      // =====================================================
      // 成長比
      // =====================================================

      {
        field: 'Growth',
        header: '成長比',
        visible: tax,
        format: (value: number) =>
          value
            ? `${value.toFixed(2)}%`
            : '0%',
        isTotal: true,
        align: 'right',
        exportFormat: 'percentage'
      },

      {
        field: 'nGrowth',
        header: '成長比',
        visible: !tax,
        format: (value: number) =>
          value
            ? `${value.toFixed(2)}%`
            : '0%',
        isTotal: true,
        align: 'right',
        exportFormat: 'percentage'
      },


      // =====================================================
      // 業績差異
      // =====================================================

      {
        field: 'PerformanceDiff',
        header: '業績差異',
        visible: tax,
        format: formatAmount,
        isTotal: true,
        align: 'right'
      },

      {
        field: 'nPerformanceDiff',
        header: '業績差異',
        visible: !tax,
        format: formatAmount,
        isTotal: true,
        align: 'right'
      },


      // =====================================================
      // 交易筆數差異
      // =====================================================

      {
        field: 'TransactionsNumber',
        header: '交易筆數差異',
        visible: true,
        format: formatAmount,
        isTotal: true,
        align: 'right'
      },


      // =====================================================
      // 客單差異
      // =====================================================

      {
        field: 'OrdervalueDiff',
        header: '客單差異',
        visible: tax,
        format: formatAmount,
        isTotal: true,
        align: 'right'
      },

      {
        field: 'nOrdervalueDiff',
        header: '客單差異',
        visible: !tax,
        format: formatAmount,
        isTotal: true,
        align: 'right'
      },


      // =====================================================
      // 營業坪數
      // =====================================================

      {
        field: 'tlt_space',
        header: '營業坪數',
        visible: true,
        format: (value) =>
          formatAmountWithDecimals(
            value,
            2
          ),
        isTotal: true,
        align: 'right',
        exportFormat: 'decimal2'
      },


      // =====================================================
      // 月坪效
      // =====================================================

      {
        field: 'MonthlyFloorEffect',
        header: '月坪效',
        visible: tax,
        format: formatAmount,
        isTotal: true,
        align: 'right'
      },

      {
        field: 'nMonthlyFloorEffect',
        header: '月坪效',
        visible: !tax,
        format: formatAmount,
        isTotal: true,
        align: 'right'
      }
    ];
  }
}