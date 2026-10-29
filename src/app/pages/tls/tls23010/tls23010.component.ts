import { AsyncPipe, CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { getSYS1000, getSYS1000Options, getSYS1000Options$ } from '@service/system/sys1000.service';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { finalize, map } from 'rxjs/operators';
import { DropdownApiService } from 'src/app/service/utility/dropdown-api.service';
import {
  formatAmount,
  formatDate,
  formatISOToHHMMSS,
  formatYN,
  ReportColumn
} from 'src/app/shared/components/table-report/table-report.model';
import { yesterday } from 'src/app/shared/models/system/query-form.model';
import { FileExportService } from 'src/app/shared/service/file-export.service';
import { TLS23010Data, TLS23010Service } from '../../../service/api/tls/tls23010.service';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarRangeComponent } from '../../../shared/components/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { MultiSelectComponent } from '../../../shared/components/multi-select/multi-select.component';
import { InputTextRange2Component } from './input-text-range2/input-text-range2.component';


@Component({
  selector: 'app-tls23010',
  templateUrl: './tls23010.component.html',
  standalone: true,
  imports: [
    CommonModule,
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeComponent,
    MultiSelectComponent,
    InputTextComponent,
    DropdownComponent,
    InputTextModule,
    ButtonComponent,
    DialogModule,
    RadioButtonModule,
    TranslateModule,
    ButtonModule,
    CheckboxModule,
    TableReportComponent,
    InputTextRange2Component,
    AsyncPipe
  ],
})
export class TLS23010Component extends BasicQueryPageComponent<any> implements OnInit {

  queryForm = this.formBuilder.group({
    TXN_DateStart: [yesterday, [Validators.required]],
    TXN_DateEnd: [yesterday, [Validators.required]],
    ECR_No: [null],
    TLT_No: [null],
    TXN_Status: [null],
    TXN_FlagStatus: [null],
    TXN_GUI_CarrType: [null],
    tlt_floor: [null],
    org_id: [null],

    TXN_No_Start: [
      null,
      [Validators.maxLength(8)]
    ],

    TXN_No_End: [
      null,
      [Validators.maxLength(8)]
    ],

    TXN_GUIBegNo: [
      null,
      [
        Validators.maxLength(8),
        Validators.minLength(8)
      ]
    ],

    TXN_GUIEndNo: [
      null,
      [
        Validators.maxLength(8),
        Validators.minLength(8)
      ]
    ],

    USR_No: [
      '',
      [Validators.maxLength(16)]
    ],

    TXN_PreOrderNo: [
      '',
      [Validators.maxLength(40)]
    ],

    TXN_PkngUID: [
      '',
      [Validators.maxLength(20)]
    ],

    TXN_MemCard: [
      '',
      [Validators.maxLength(50)]
    ],

    TXN_Uniform: [
      '',
      [
        Validators.maxLength(8),
        Validators.minLength(8)
      ]
    ],

    TXN_GUILoveCode: [
      '',
      [Validators.maxLength(20)]
    ],

    TXN_GUIVehicle: [
      '',
      [Validators.maxLength(20)]
    ],

    rece_yn: [null],
    cash_yn: [null],
    tlt_building: [null],

    showSummary: [false],

    pageSize: [1000],
    pageIndex: [1],

    SortBy: [[
      { field: 'TXN_Date', order: 1 },
      { field: 'tlt_no', order: 1 },
      { field: 'ECR_No', order: 1 },
      { field: 'TXN_No', order: 1 },
    ]],
  });


  // =====================================================
  // 下拉選單資料源
  // =====================================================

  BUILDING_NO_Options = this.dropDown.querySys3800();

  floorOptions = this.dropDown.querySys3900();

  OrganizationCodeOptions = this.dropDown.querySys3100();

  cashierOptions = this.dropDown.queryPos2001();

  ECRNoOptions = this.dropDown.queryPos1002();


  // 下拉選單API會將已過期專櫃排在後面
  // 此處依櫃號重新排序，確保選單依櫃號順序顯示
  CounterOptions = this.dropDown.queryTltTalent().pipe(
    map(list =>
      list
        ? [...list].sort(
            (a, b) =>
              String(a.value).localeCompare(String(b.value))
          )
        : list
    )
  );


  readonly statusFlagOptions = [
    {
      value: '1',
      label: '外交官零稅'
    },
    {
      value: '2',
      label: '事後登錄'
    },
    {
      value: '3',
      label: '預售'
    },
  ];


  readonly whetherOptions = [
    {
      value: 'Y',
      label: '是'
    },
    {
      value: 'N',
      label: '否'
    },
    {
      value: null,
      label: '全部'
    },
  ];


  readonly txnStatusOptions$ = getSYS1000Options$(this.systemDataService, 'TXN_Type');


  readonly carrierTypeOptions =
    getSYS1000Options('TXN_GUI_CarrType');


  // =====================================================
  // 狀態管理
  // =====================================================

  pdfSummary: string[] = [];

  data: TLS23010Data[] = [];

  summaryData: any[] = [];

  totalRecords = 0;

  btnLoading = false;

  historyRequestBody: any = null;


  detailTotals: Record<string, number> = {};

  summaryTotals: Record<string, number> = {};


  private readonly detailTotalFieldMap:
    Record<string, string> = {

      TXN_TotGUI: 'Total_TXN_TotGUI',

      TXN_TotSaleAmt: 'Total_TXN_TotSaleAmt',

      TXN_TotOver: 'Total_TXN_TotOver',

      TXN_TotDisc: 'Total_TXN_TotDisc',

      TXN_PayAmt: 'Total_TXN_PayAmt',
    };


  constructor(
    private readonly tls23010Service: TLS23010Service,
    private readonly dropDown: DropdownApiService,
    private readonly datePipe: DatePipe,
    private readonly fileExportService: FileExportService
  ) {
    super();
  }


  ngOnInit(): void {

    this.initializePage(
      'TLS23010',
      'tls/tls23010',
      this.queryForm,
      (form) => this.onSubmit(form)
    );

  }


  // =====================================================
  // 查詢（明細 / 彙總）
  // =====================================================

  onSubmit(frm: FormGroup): void {

    this.handleSubmit(frm, () => {

      const val =
        this.queryForm.getRawValue();


      const payload = {

        ...val,

        TXN_DateStart:
          this.datePipe.transform(
            val.TXN_DateStart,
            'yyyy-MM-dd'
          ) || undefined,

        TXN_DateEnd:
          this.datePipe.transform(
            val.TXN_DateEnd,
            'yyyy-MM-dd'
          ) || undefined,

        TXN_No_Start:
          String(
            val.TXN_No_Start ?? ''
          )
            .trim()
            .replaceAll(/\D+/g, '')
            .padStart(6, '0')
          || undefined,

        TXN_No_End:
          String(
            val.TXN_No_End ?? ''
          )
            .trim()
            .replaceAll(/\D+/g, '')
            .padStart(6, '0')
          || undefined,
      };


      const request$ =
        this.isSummaryMode

          ? this.tls23010Service
              .queryTLS23010Summary(payload)

          : this.tls23010Service
              .queryTLS23010(payload);


      request$
        .pipe(

          untilDestroyed(this),

          finalize(
            () =>
              (this.loading = false)
          )

        )
        .subscribe((resp) => {

          this.historyRequestBody =
            payload;


          if (this.isSummaryMode) {

            // ================================
            // 彙總報表
            // ================================

            this.summaryData =
              resp.Data[0]
                ?.tLS23010Summary_Details
              || [];


            this.totalRecords =
              this.summaryData.length;


            this.summaryTotals =
              resp.Data[0];

          } else {

            // ================================
            // 明細報表
            // ================================

            this.data =
              resp.Data.QueryData;


            this.detailTotals =
              resp.Data.TotalSummary;


            this.totalRecords =
              resp.TotalCount;
          }


          this.updatePdfSummary?.();


          this.queryStateService
            ?.setQueryState?.(
              this.ProgNo,
              this.queryForm.value
            );

        });

    });

  }


  // =====================================================
  // Report 查詢
  // =====================================================

  public queryTLS23010ForReport =
    (body: any) => {

      const commonBody = {

        ...body,

        TXN_DateStart:
          this.datePipe.transform(
            body?.TXN_DateStart
              ?? this.queryForm.value?.TXN_DateStart,
            'yyyy-MM-dd'
          ),

        TXN_DateEnd:
          this.datePipe.transform(
            body?.TXN_DateEnd
              ?? this.queryForm.value?.TXN_DateEnd,
            'yyyy-MM-dd'
          ),

      };


      if (this.isSummaryMode) {

        return this.tls23010Service
          .queryTLS23010Summary(commonBody)
          .pipe(

            map((resp) => {

              const dataArr =
                Array.isArray(resp?.Data)
                  ? resp.Data
                  : [];


              const head =
                dataArr[0] ?? {};


              const all =
                head?.tLS23010Summary_Details
                ?? head?.TLS23010Summary_Details
                ?? [];


              return {

                Data:
                  Array.isArray(all)
                    ? all
                    : [],

                TotalCount:
                  all.length || 0,

                GrandTotal:
                  null,
              };

            })

          );

      } else {

        return this.tls23010Service
          .queryTLS23010(commonBody)
          .pipe(

            map((res) => ({

              Data:
                res?.Data?.QueryData
                ?? res?.Data
                ?? [],

              TotalCount:
                Number(
                  res?.TotalCount
                  ?? res?.Data?.TotalCount
                  ?? 0
                ),

              GrandTotal:
                res?.Data?.TotalSummary
                ?? null,

            }))

          );

      }

    };


  // =====================================================
  // 明細展開
  // =====================================================

  loadDetails =
    (row: TLS23010Data) => {

      return this.tls23010Service
        .queryTLS23010Detail(row)
        .pipe(

          map(
            (list) => ({
              Data: list ?? []
            })
          )

        );

    };


  // =====================================================
  // PDF
  // =====================================================

  onExportPDF(): void {

    const body =
      this.historyRequestBody;


    const export$ =
      this.isSummaryMode

        ? this.tls23010Service
            .exportTLS23010SummaryPDF(body)

        : this.tls23010Service
            .exportTLS23010PDF(body);


    this.fileExportService
      .executeFileExport(

        export$.pipe(
          untilDestroyed(this)
        ),

        '.pdf',

        (isLoading) =>
          this.btnLoading = isLoading

      )
      .subscribe();

  }


  // =====================================================
  // Excel
  // =====================================================

  onExportXLSX(): void {

    const body =
      this.historyRequestBody;


    const export$ =
      this.isSummaryMode

        ? this.tls23010Service
            .exportTLS23010SummaryExcel(body)

        : this.tls23010Service
            .exportTLS23010Excel(body);


    this.fileExportService
      .executeFileExport(

        export$.pipe(
          untilDestroyed(this)
        ),

        '.xlsx',

        (isLoading) =>
          this.btnLoading = isLoading

      )
      .subscribe();

  }


  // =====================================================
  // 資料計算
  // =====================================================

  private getSum(
    field: string
  ): number {

    if (!this.isSummaryMode) {

      const mapped =
        this.detailTotalFieldMap[field];


      if (
        mapped != null
        &&
        typeof this.detailTotals?.[mapped]
          === 'number'
      ) {

        return this.detailTotals[mapped];

      }


      return (this.data ?? [])
        .reduce(

          (sum, row: any) =>
            sum
            +
            (
              Number(
                row?.[field]
              )
              || 0
            ),

          0

        );

    }


    return (this.summaryData ?? [])
      .reduce(

        (sum, row) =>
          sum
          +
          (
            Number(
              row?.[field]
            )
            || 0
          ),

        0

      );

  }


 // =====================================================
// A ~ J 摘要設定
// =====================================================

private readonly SUMMARY_CONFIG = [
  {
    key: 'A',
    label: '(A)發票金額'
  },
  {
    key: 'B',
    label: '(B)已開發票的支付工具'
  },
  {
    key: 'C',
    label: '(C)已開發票的支付工具溢收'
  },
  {
    key: 'D',
    label: '(D)訂金'
  },
  {
    key: 'E',
    label: '(E)訂金結帳全額'
  },
  {
    key: 'F',
    label: '(F)訂金結帳的訂金'
  },
  {
    key: 'G',
    label: '(G)預售'
  },
  {
    key: 'H',
    label: '(H)預售結帳金額'
  },
  {
    key: 'I',
    label: '(I)非開業主發票業績金額'
  },
  {
    key: 'J',
    label: '(J)已開發票的支付工具找零'
  }
];


  // =====================================================
  // 更新 PDF 下方統計資訊
  // =====================================================

  private updatePdfSummary(): void {

    // 彙總模式不顯示此區塊
    if (this.isSummaryMode) {

      this.pdfSummary = [];

      return;

    }


    const req =
      this.historyRequestBody;


    // 如果沒有查詢條件
    // 走前端本地資料
    if (!req) {

      this.processSummaryData(null);

      return;

    }


    // 查詢 A ~ J
    this.tls23010Service
      .queryOtherData(req)
      .pipe(
        untilDestroyed(this)
      )
      .subscribe((data) => {

        this.processSummaryData(data);

      });

  }


  private processSummaryData(apiData: any): void {

  const values: Record<string, number> = {};

  // ===================================================
  // 取得 A ~ J
  // ===================================================

  this.SUMMARY_CONFIG.forEach(({ key }) => {

    // queryOtherData API 有回資料
    if (apiData) {

      values[key] = Number(apiData[key] ?? 0);

      return;
    }

    // API 無資料時的前端備援計算
    const fieldMap: Record<string, string> = {

      A: 'TXN_TotGUI',

      B: 'TXN_TotPayAmt',

      C: 'TXN_TotOver',

      D: 'TXN_Deposit',

      E: 'TXN_DepositSettle',

      F: 'TXN_DepositUsed',

      G: 'TXN_TotDisc',

      H: this.getSum('TXN_PresaleSettle')
        ? 'TXN_PresaleSettle'
        : 'TXN_TaxFreeCertNo'
    };

    /*
     * I = 非開業主發票業績金額
     * J = 已開發票的支付工具找零
     *
     * 目前 I、J 都由 queryOtherData API 提供。
     * 如果 API 沒有資料，前端備援先當成 0。
     */
    if (key === 'I' || key === 'J') {

      values[key] = 0;

      return;
    }

    const field = fieldMap[key];

    values[key] =
      (this.data ?? []).reduce(
        (sum, row: any) =>
          sum + (Number(row?.[field]) || 0),
        0
      );
  });


  // ===================================================
  // 折扣別（專櫃業績）
  //
  // A + B - C + E - G + H + I - J
  // ===================================================

  const disc =
    values['A']
    + values['B']
    - values['C']
    + values['E']
    - values['G']
    + values['H']
    + values['I']
    - values['J'];


  // ===================================================
  // 付款別（支付工具）
  //
  // A + B + D - F + I - J
  // ===================================================

  const pay =
    values['A']
    + values['B']
    + values['D']
    - values['F']
    + values['I']
    - values['J'];


  // ===================================================
  // 顯示內容
  // ===================================================

  this.pdfSummary = [

    ...this.SUMMARY_CONFIG.map(
      ({ key, label }) =>
        `${label} =\t${values[key].toLocaleString()}`
    ),

    '====================================================',

    `折扣別(專櫃業績) = (A)+(B)-(C)+(E)-(G)+(H)+(I)-(J) =\t${disc.toLocaleString()}`,

    `付款別(支付工具) = (A)+(B)+(D)-(F)+(I)-(J) =\t${pay.toLocaleString()}`
  ];
}


  // =====================================================
  // 明細 Footer
  // =====================================================

  buildFooterFromTotals():
    Record<string, any>
    | undefined {

    if (!this.detailTotals) {

      return undefined;

    }


    return {

      TXN_TotGUI:
        this.detailTotals[
          'Total_TXN_TotGUI'
        ] ?? 0,

      TXN_TotSaleAmt:
        this.detailTotals[
          'Total_TXN_TotSaleAmt'
        ] ?? 0,

      TXN_TotOver:
        this.detailTotals[
          'Total_TXN_TotOver'
        ] ?? 0,

      TXN_TotDisc:
        this.detailTotals[
          'Total_TXN_TotDisc'
        ] ?? 0,

      TXN_PayAmt:
        this.detailTotals[
          'Total_TXN_PayAmt'
        ] ?? 0,

    };

  }


  // =====================================================
  // 彙總 Footer
  // =====================================================

  buildFooterFromSummaryTotals():
    Record<string, any>
    | undefined {

    if (!this.summaryTotals) {

      return undefined;

    }


    return {

      TXN_TotGUI:
        this.summaryTotals[
          'Total_TXN_TotGUI'
        ] ?? 0,

    };

  }


  // =====================================================
  // Number map
  // =====================================================

  private coerceNumberMap(
    src: any
  ): Record<string, number> {

    const out:
      Record<string, number> = {};


    if (!src) {

      return out;

    }


    for (
      const key of Object.keys(src)
    ) {

      out[key] =
        Number(src[key]) || 0;

    }


    return out;

  }


  // =====================================================
  // 是否彙總模式
  // =====================================================

  get isSummaryMode(): boolean {

    return !!this.queryForm
      .get('showSummary')
      ?.value;

  }


  // =====================================================
  // 主表欄位
  // =====================================================

  columns: ReportColumn[] = [

    {
      field: 'TXN_Date',
      header: '銷售日期',
      format: formatDate
    },

    {
      field: 'ECR_No',
      header: '收銀機號'
    },

    {
      field: 'TXN_No',
      header: '交易序號',
      align: 'right',
      format: (v) =>
        String(v ?? '')
          .trim()
          .replaceAll(/\D+/g, '')
          .padStart(6, '0')
    },

    {
      field: 'tlt_no',
      header: '專櫃編號'
    },

    {
      field: 'tlt_name',
      header: '櫃位名稱',
      align: 'left'
    },

    {
      field: 'TXN_Uniform',
      header: '統一編號'
    },

    {
      field: 'gui_track',
      header: '字軌'
    },

    {
      field: 'GUIBegNo',
      header: '發票起始號碼'
    },

    {
      field: 'GUIEndNo',
      header: '發票結束號碼'
    },

    {
      field: 'TXN_TotGUI',
      header: '發票金額',
      align: 'right',
      format: formatAmount,
      isTotal: true
    },

    {
      field: 'TXN_TotSaleAmt',
      header: '銷售金額',
      align: 'right',
      format: formatAmount,
      isTotal: true
    },

    {
      field: 'TXN_TotOver',
      header: '溢收金額',
      align: 'right',
      format: formatAmount,
      isTotal: true
    },

    {
      field: 'TXN_VIP',
      header: '外交官零稅',
      format: formatYN
    },

    {
      field: 'TXN_Mode',
      header: '事後登錄',

      format: (val) =>
        String(val ?? '')
          .trim()
          .toUpperCase() === 'P'
          ? '是'
          : '否',

      showSort: false
    },

    {
      field: 'TXN_PreOrder',
      header: '預售',

      format: (val) =>
        String(val ?? '')
          .trim()
          .toUpperCase() === 'N'
          ? '否'
          : '是',

      showSort: false
    },

    {
      field: 'TXN_StatusName',
      header: '交易型態'
    },

    {
      field: 'TXN_TaxFreeCertNo',
      header: '外交官免稅卡號'
    },

    {
      field: 'TXN_Time',
      header: '交易時間',
      format: formatISOToHHMMSS
    },

    {
      field: 'USR_No',
      header: '收銀員',
      align: 'left'
    },

    {
      field: 'TXN_PreOrderNo',
      header: '預售/訂金單號'
    },

    {
      field: 'ORG_TXN_Date',
      header: '原交易日期',
      format: formatDate
    },

    {
      field: 'ORG_ECR_No',
      header: '原收銀機號'
    },

    {
      field: 'ORG_TXN_No',
      header: '原交易序號',
      align: 'right'
    },

    {
      field: 'TXN_PkngUID',
      header: '停車車牌'
    },

    {
      field: 'TXN_MemCard',
      header: '會員卡號'
    },

    {
      field: 'TXN_TotDisc',
      header: '折扣/讓金額',
      align: 'right',
      format: formatAmount,
      isTotal: true
    },

    {
      field: 'GUILoveStatus',
      header: '捐贈狀態',
      format: formatYN
    },

    {
      field: 'TXN_GUILoveCode',
      header: '捐贈社福團體代碼'
    },

    {
      field: 'TXN_GUIRemark',
      header: '防偽隨機碼'
    },

    {
      field: 'TXN_GUI_CarrType',
      header: '載具種類',

      format: (v) =>
        getSYS1000(
          'TXN_GUI_CarrType',
          v
        )
    },

    {
      field: 'TXN_GUIVehicle',
      header: '載具號碼'
    },

    {
      field: 'TXN_PrintTimes',
      header: '發票列印次數',
      align: 'right'
    },

    {
      field: 'TXN_PrintGUI',
      header: '電子發票是否列印',
      format: formatYN
    },

    {
      field: 'CRD_Name',
      header: '信用卡別'
    },

    {
      field: 'CRD_No',
      header: '號碼'
    },

    {
      field: 'TERM_No',
      header: '分期期數',
      align: 'right'
    },

    {
      field: 'TXN_PayAmt',
      header: '金額',
      align: 'right',
      format: formatAmount,
      isTotal: true
    },

  ];


  // =====================================================
  // Detail 欄位
  // =====================================================

  detailcolumns: ReportColumn[] = [

    {
      field: 'TXN_Date',
      header: '銷售日期',
      format: formatDate
    },

    {
      field: 'ECR_No',
      header: '收銀機號'
    },

    {
      field: 'TXN_No',
      header: '交易序號',
      align: 'right',

      format: (v) =>
        String(v ?? '')
          .trim()
          .replaceAll(/\D+/g, '')
          .padStart(6, '0')
    },

    {
      field: 'tlt_no',
      header: '專櫃編號'
    },

    {
      field: 'tlt_name',
      header: '櫃位名稱'
    },

    {
      field: 'PAY_NAME',
      header: '付款別'
    },

    {
      field: 'CRD_Name',
      header: '卡別'
    },

    {
      field: 'CRD_No',
      header: '號碼'
    },

    {
      field: 'TERM_No',
      header: '分期期數',
      align: 'right'
    },

    {
      field: 'TXN_PayAmt',
      header: '金額',
      align: 'right',
      format: formatAmount,
      isTotal: true
    },

  ];


  // =====================================================
  // 彙總欄位
  // =====================================================

  summaryColumns: ReportColumn[] = [

    {
      field: 'tlt_no',
      header: '專櫃編號'
    },

    {
      field: 'tlt_name',
      header: '櫃位名稱',
      align: 'left'
    },

    {
      field: 'TXN_DateStart',
      header: '銷售日期(起)',
      format: formatDate
    },

    {
      field: 'TXN_DateEnd',
      header: '銷售日期(迄)',
      format: formatDate
    },

    {
      field: 'TXN_TotGUI',
      header: '發票金額',
      align: 'right',
      format: formatAmount,
      isTotal: true
    },

  ];

}