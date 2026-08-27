import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { AddButton, formatAmount } from '@others/component/table/table.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarRangeComponent } from '@shared/components/calendar-range/calendar-range.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { ReportColumn } from '@shared/components/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize, map } from 'rxjs';
import {
  ass14010mainData,
  Ass14010Service
} from './../../../service/api/ass/ass14010.service';

// 3.1.4.1 進貨發票建檔作業
@Component({
  selector: 'app-ass14010',
  templateUrl: './ass14010.component.html',
  standalone: true,
  imports: [
    AccordionModule,
    ButtonComponent,
    ButtonModule,
    CalendarRangeComponent,
    DropdownComponent,
    FormsModule,
    InputTextComponent,
    MenubarComponent,
    ReactiveFormsModule,
    TableReportComponent,
    TranslateModule
  ]
})
export class ASS14010Component
  extends BasicQueryPageComponent<ass14010mainData>
  implements OnInit {

  // ============================================================
  // 查詢條件
  // ============================================================
  queryForm = this.formBuilder.group({
    MID: [this.authService.getUserInfo()?.mid || null],
    STO_NO: [this.authService.getUserInfo()?.SYS_StoreNo || null],

    RECEIPT_NO: ['', [Validators.maxLength(10)]],       // 發票/收據號碼
    SUPPLIER_ID: ['', [Validators.maxLength(50)]],      // 供應商代碼
    RECEIPT_TYPE: ['', [Validators.maxLength(1)]],      // 請款單據種類
    TOKEN_NO: ['', [Validators.maxLength(20)]],         // 驗收單號
    RECEIPT_INS_ID: ['', [Validators.maxLength(20)]],   // 發票維護單號
    INV_FORMAT: ['', [Validators.maxLength(20)]],       // 發票格式

    TAX_CODE: ['', [Validators.maxLength(20)]],         // 課稅別
    REDU_CODE: ['', [Validators.maxLength(20)]],        // 扣抵別

    RECEIPT_DATE_S: [null],                             // 發票日期(起)
    RECEIPT_DATE_E: [null],                             // 發票日期(迄)

    // 分頁
    pageSize: [1000],
    pageIndex: [1],

    // ★ 預設主要排序：TOKEN_NO DESC
    SortBy: [[
      {
        field: 'TOKEN_NO',
        order: -1
      }
    ]]
  });

  // ============================================================
  // Table
  // ============================================================
  lastQueryBody: any;
  totalRecords = 0;

  SUPPLIER_ID_Options: { value: string; label: string }[] = [];

  RECEIPT_TYPE_Options: { value: string; label: string }[] = [
    { value: '0', label: '發票' },
    { value: '1', label: '單據' }
  ];

  TOKEN_NO_Options: { value: string; label: string }[] = [];

  INV_FORMAT_Options: { value: string; label: string }[] = [];

  TAX_CODE_Options: { value: string; label: string }[] = [
    { value: '1', label: '應稅' },
    { value: '3', label: '免稅' }
  ];

  REDU_CODE_Options: { value: string; label: string }[] = [];

  data: ass14010mainData[] = [];

  columns: ReportColumn[] = [
    {
      field: 'RECEIPT_NO',
      header: '發票/收據號碼',
      visible: true
    },
    {
      field: 'TOKEN_NO',
      header: '進貨單號',
      visible: true
    },
    {
      field: 'RECEIPT_INS_ID',
      header: '發票維護單號',
      visible: true
    },
    {
      field: 'SUPPLIER_ID',
      header: '供應商代碼',
      visible: true
    },
    {
      field: 'SUPPLIER_NAME',
      header: '供應商名稱',
      visible: true
    },
    {
      field: 'RECEIPT_TYPE_NAME',
      header: '單據種類',
      visible: true
    },
    {
      field: 'INV_FORMAT',
      header: '發票格式',
      visible: true
    },
    {
      field: 'TAX_CODE_NAME',
      header: '稅別',
      visible: true
    },
    {
      field: 'NTX_AMT',
      header: '未稅金額',
      visible: true,
      format: formatAmount
    },
    {
      field: 'TX_AMT',
      header: '稅額',
      visible: true,
      format: formatAmount
    },
    {
      field: 'AMT',
      header: '含稅金額',
      visible: true,
      format: formatAmount
    },
    {
      field: 'REDU_CODE_NAME',
      header: '扣抵別',
      visible: true
    }
  ];

  btnVoucharLoading = false;

  addButton: AddButton[] = [
    {
      label: '列印請款單',
      icon: 'pi pi-print',
      loading: () => this.btnVoucharLoading,
      action: (rowData: ass14010mainData) => {
        this.printVouchar(rowData.RECEIPT_INS_ID);
      }
    }
  ];

  selectedItems: ass14010mainData[] = [];

  constructor(
    public readonly ass14010Service: Ass14010Service,
    private readonly dropDownListService: DropDownListService,
    private readonly dropdownApiService: DropdownApiService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage(
      'ASS14010',
      'ASS/ASS14010cru',
      this.queryForm,
      (form) => this.onSubmit(form)
    );

    this.loadOptions();
  }

  // ============================================================
  // 查詢
  // ============================================================
  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {

      const payload = {
        ...frm.value,

        // 分頁參數轉成後端 QueryBase 使用的名稱
        PageIndex: frm.value.pageIndex ?? 1,
        PageSize: frm.value.pageSize ?? 1000,

        // ★ TOKEN_NO 為預設主要排序 DESC
        SortBy: frm.value.SortBy ?? [
          {
            field: 'TOKEN_NO',
            order: -1
          }
        ]
      };

      console.log(
        '進貨發票 request:',
        JSON.stringify(payload, null, 2)
      );

      this.loading = true;

      // ★ 注意：這裡要傳 payload，不是 frm.value
      this.ass14010Service
        .queryASS14010(payload)
        .subscribe({
          next: (response) => {

            if (response.Status === '0000') {

              // Table 後續分頁、排序使用
              this.lastQueryBody = payload;

              this.data = response.Data?.QueryData || [];

              this.totalRecords =
                response.TotalCount || this.data.length;

              this.queryStateService.setQueryState(
                this.ProgNo,
                payload
              );

              console.log('Result', this.data);

            } else {
  console.error(
    'API error:',
    response.Status
  );

  this.messageService.errorBubble('查詢失敗');
}

            this.loading = false;
            this.messageService.unblockUi();
          },

          error: (err: string) => {

            console.error(
              'API error:',
              err
            );

            this.loading = false;
            this.messageService.unblockUi();
          }
        });
    });
  }

  // ============================================================
  // 刪除
  // ============================================================
  onDelete(
    data: ass14010mainData | ass14010mainData[]
  ): void {

    console.log(
      'Delete data:',
      JSON.stringify(data, null, 2)
    );

    const items = Array.isArray(data)
      ? data
      : [data];

    if (items.length === 0) {

      console.error('No items to delete');

      this.messageService.errorBubble(
        '無法刪除：沒有選中的項目'
      );

      return;
    }

    const idList = items
      .filter(
        item =>
          item &&
          item.ID != null &&
          item.ID !== undefined
      )
      .map(item => item.ID);

    if (idList.length === 0) {

      console.error('No valid IDs to delete');

      this.messageService.errorBubble(
        '無法刪除：選中的項目缺少有效 ID'
      );

      return;
    }

    const canDelete = items.every(
      item => item.RECEIPT_STATUS
    );

    if (!canDelete) {

      console.error(
        'Some items cannot be deleted'
      );

      this.messageService.errorBubble(
        '無法刪除：組織階層互相關連'
      );

      return;
    }

    const RECEIPT_INS_IDs = items
      .filter(
        item =>
          item &&
          item.ID != null
      )
      .map(
        item => item.RECEIPT_INS_ID
      )
      .join(',');

    this.messageService.confirm({
      header: '確認刪除',

      message:
        `是否確認刪除發票${RECEIPT_INS_IDs}`,

      accept: () => {

        const deleteBody = {
          RECEIPT_INS_IDs:
            RECEIPT_INS_IDs
        };

        console.log(
          'deleteBody',
          deleteBody
        );

        this.ass14010Service
          .deleteASS14010(deleteBody)
          .subscribe({

            next: response => {

              if (
                response.Status === '0000'
              ) {

                this.messageService
                  .successBubble(
                    '刪除成功'
                  );

                this.onSubmit(
                  this.queryForm
                );

              } else {

                console.error(
                  'API error:',
                  response.Status,
                  response.Message
                );

                this.messageService
                  .errorBubble(
                    `刪除失敗: ${response.Message}`
                  );
              }
            },

            error: (err: string) => {

              console.error(
                'API error:',
                err
              );

              this.messageService
                .errorBubble(
                  '刪除失敗'
                );
            }
          });

        this.selectedItems = [];
      }
    });
  }

  // ============================================================
  // Dropdown
  // ============================================================
  loadOptions(): void {

    // 供應商編號
    this.dropDownListService
      .queryPOS2013_DropDownList({})
      .pipe(
        untilDestroyed(this)
      )
      .subscribe(res => {

        const list = res.Data ?? [];

        this.SUPPLIER_ID_Options =
          list.map(
            (
              item: {
                VEN_No?: string;
                No?: string;
                Name?: string
              }
            ) => ({

              value:
                item.VEN_No ??
                item.No ??
                '',

              label:
                `${item.VEN_No ?? item.No ?? ''} - ${item.Name ?? ''}`
            })
          );
      });

    // 進貨單號
    this.dropdownApiService
      .queryFAASSCHKMASS15070_DropDownList()
      .pipe(
        untilDestroyed(this)
      )
      .subscribe(options => {

        this.TOKEN_NO_Options =
          (options ?? []).map(
            res => ({
              label: res.label,
              value: res.value
            })
          );
      });

    // 發票格式
    this.dropDownListService
      .queryTDS1007_DropDownList({
        mid: 0
      })
      .subscribe(r => {

        this.INV_FORMAT_Options =
          r.Data.INV_GUITypes

            .filter(item =>
              ['21', '22', '25']
                .includes(
                  item.INV_GUIType
                )
            )

            .sort(
              (a, b) =>
                a.INV_GUIType
                  .localeCompare(
                    b.INV_GUIType
                  )
            )

            .map(item => ({
              label:
                `${item.INV_GUIType}-${item.INV_GUIName}`,

              value:
                item.INV_GUIType
            }));
      });

    // 扣抵別
    this.dropdownApiService
      .querySys1000({
        SYS_Type: 'PUR_DiscNo'
      })
      .pipe(
        untilDestroyed(this)
      )
      .subscribe(res => {

        console.log(
          '扣抵別',
          res
        );

        this.REDU_CODE_Options =
          (res ?? []).map(
            res => ({
              label:
                res.No +
                '-' +
                res.Name,

              value:
                res.No
            })
          );
      });
  }

  // ============================================================
  // 是否可選
  // ============================================================
  isRowSelectable(
    rowData: ass14010mainData
  ): boolean {

    return (
      rowData.RECEIPT_STATUS === '1'
    );
  }

  // ============================================================
  // Table Report 查詢
  // ============================================================

  // table-report 需要 res.Data 直接是陣列
  // 這支 API 回傳資料多包一層 QueryData
  queryFn = (body: any) =>
    this.ass14010Service
      .queryASS14010(body)
      .pipe(
        map((res: any) => ({
          ...res,
          Data:
            res?.Data?.QueryData ??
            []
        }))
      );

  // ============================================================
  // 匯出報表
  // ============================================================
  btnInvoiceLoading = false;

  onReport(
    frm: FormGroup,
    PDFType: string
  ): void {

    if (PDFType === 'Invoice') {

      this.btnInvoiceLoading = true;

      this.ass14010Service
        .exportPDFASS14010(
          frm.value
        )
        .pipe(
          untilDestroyed(this),

          finalize(
            () =>
              this.btnInvoiceLoading =
              false
          )
        )
        .subscribe(blob => {

          if (blob) {

            this.downloadBlob(
              blob,
              `進貨發票建檔查詢_${this.getTimestamp()}`
            );
          }
        });
    }
  }

  // ============================================================
  // 列印請款單
  // ============================================================
  printVouchar(
    RECEIPT_INS_IDS: string
  ): void {

    if (!RECEIPT_INS_IDS) {

      this.messageService
        .errorBubble(
          '必須輸入請款單號'
        );

      return;
    }

    this.btnVoucharLoading = true;

    this.ass14010Service
      .exportPDFPaymentVoucher({
        RECEIPT_INS_IDS:
          RECEIPT_INS_IDS
      })
      .pipe(
        untilDestroyed(this),

        finalize(
          () =>
            this.btnVoucharLoading =
            false
        )
      )
      .subscribe(blob => {

        if (blob) {

          this.downloadBlob(
            blob,
            `請款單_${this.getTimestamp()}`
          );
        }
      });
  }

  // ============================================================
  // Timestamp
  // ============================================================
  private getTimestamp(): string {

    const now = new Date();

    return (
      now.getFullYear().toString() +

      (now.getMonth() + 1)
        .toString()
        .padStart(2, '0') +

      now.getDate()
        .toString()
        .padStart(2, '0') +

      '_' +

      now.getHours()
        .toString()
        .padStart(2, '0') +

      now.getMinutes()
        .toString()
        .padStart(2, '0')
    );
  }

  // ============================================================
  // Download
  // ============================================================
  private downloadBlob(
    blob: Blob,
    fileName: string
  ): void {

    const blobUrl =
      URL.createObjectURL(blob);

    const a =
      document.createElement('a');

    a.href = blobUrl;
    a.download = fileName;
    a.click();

    URL.revokeObjectURL(
      blobUrl
    );
  }
}