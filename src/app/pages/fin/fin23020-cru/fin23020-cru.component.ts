import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';

import {
  DetailFIN23020Line,
  Fin23020Service,
  PostingFIN23020Request,
  QueryFIN23020Response
} from '@service/api/fin/fin23020.service';

import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { TableEditComponent } from '@shared/components/table-edit/table-edit.component';
import { EditColumn } from '@shared/components/table-edit/table-edit.model';
import { formatAmount } from '@shared/components/table-report/table-report.model';

import { PanelModule } from 'primeng/panel';
import { finalize, forkJoin } from 'rxjs';

import { CalendarComponent } from 'src/app/shared/components/calendar/calendar.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';


/** 查詢頁勾選多筆後帶進本頁的資料 */
interface Fin23020CruState {
  items: QueryFIN23020Response[];

  /** 查詢頁選擇的傳票日期 */
  VouDate?: string | null;
}


/**
 * 傳票明細
 *
 * _sourceId：
 * 原始暫付款 ID，用來知道這筆明細屬於哪張傳票
 *
 * _isDebit：
 * true  = 借方
 * false = 貸方
 *
 * _isManual：
 * true = 使用者自行新增的手續費會科
 */
interface PostingLine extends DetailFIN23020Line {
  _sourceId: number;
  _prepNo: string;

  _isDebit: boolean;

  /** 是否為使用者手動新增 */
  _isManual?: boolean;
}


@Component({
  selector: 'app-fin23020-cru',
  templateUrl: './fin23020-cru.component.html',
  standalone: true,
  imports: [
    CalendarComponent,
    MenubarComponent,
    PanelModule,
    ReactiveFormsModule,
    InputTextComponent,
    ButtonComponent,
    TableEditComponent,
    TranslateModule
  ]
})
export class FIN23020CRUComponent
  extends BasicCruPageComponent<Fin23020CruState>
  implements OnInit {

  private readonly fin23020Service = inject(Fin23020Service);
  private readonly dropdown = inject(DropdownApiService);


  // ============================================================
  // 下拉選單
  // ============================================================

  /** 科目 */
  private readonly ledgerOptions$ =
    this.dropdown.queryGls1005_ledgerMD();

  /** 組織 */
  private readonly orgOptions$ =
    this.dropdown.querySys3100();


  /**
   * 科目代號 -> 科目名稱
   *
   * 例如：
   * 215101 -> 應付帳款-關係人
   */
  private readonly ledgerNameMap = new Map<string, string>();


  /**
   * 組織代號 -> 組織名稱
   */
  private readonly orgNameMap = new Map<string, string>();


  // ============================================================
  // 手續費會科
  // ============================================================

  /**
   * TODO：
   * 這兩個請改成你們實際的「手續費科目」
   *
   * 如果還沒有固定科目，
   * 可以先保持空字串。
   */
  private readonly HANDLING_FEE_ACCT_CODE = '';

  private readonly HANDLING_FEE_ACCT_NAME = '';


  // ============================================================
  // 表頭
  // ============================================================

  dataForm = this.formBuilder.group({

    /** 傳票編號 */
    VouNo: [
      {
        value: null as string | null,
        disabled: true
      }
    ],

    /** 傳票種類 */
    VouTypeName: [
      {
        value: null as string | null,
        disabled: true
      }
    ],

    /** 傳票型態 */
    VouForm: [
      {
        value: null as string | null,
        disabled: true
      }
    ],

    /** 傳票日期 */
    VouDate: [
      {
        value: null as string | null,
        disabled: true
      }
    ],

    /** 傳票摘要 */
    VouSummary: [
      null as string | null
    ],

    /** 建立者代號 */
    CRT_USR_No: [
      {
        value: null as string | null,
        disabled: true
      }
    ],

    /** 建立者名稱 */
    CRT_USR_Name: [
      {
        value: null as string | null,
        disabled: true
      }
    ],

    /** 建立日 */
    CRT_Date: [
      {
        value: null as string | null,
        disabled: true
      }
    ]

  });


  // ============================================================
  // Table
  // ============================================================

  data: PostingLine[] = [];

  initTable = false;


  /**
   * 傳票明細欄位
   *
   * 注意：
   * 不再放 SeqNo。
   *
   * TableEdit 本身就會顯示：
   *
   * 1
   * 2
   * 3
   */
  columns: EditColumn[] = [

    // ==========================================================
    // 科目代號
    // ==========================================================

    {
      field: 'AcctCode',
      header: '科目代號',
      width: '130px',

      type: 'dropdown',

      textAlign: 'left',

      optionsAsync: true,

      options: () => this.ledgerOptions$,

      optionLabel: 'value',

      optionValue: 'value',

      templateLabel: 'label',

      showClear: false,

      /**
       * 借方不可修改
       *
       * 原始借方：
       * _isDebit = true
       *
       * 新增手續費：
       * _isDebit = true
       *
       * 貸方：
       * _isDebit = false
       */
      disabled: (
        _value,
        _index,
        rowData: PostingLine
      ) => {
        return rowData._isDebit === true;
      }
    },


    // ==========================================================
    // 科目名稱
    // ==========================================================

    {
      field: 'AcctName',
      header: '科目名稱',
      width: '180px',

      textAlign: 'left',

      disabled: () => true
    },


    // ==========================================================
    // 廠商代號
    // ==========================================================

    {
      field: 'VenNo',
      header: '廠商代號',
      width: '120px',

      textAlign: 'left',

      disabled: () => true
    },


    // ==========================================================
    // 摘要
    // ==========================================================

    {
      field: 'Summary',
      header: '摘要',
      width: '220px',

      type: 'input',

      textAlign: 'left'
    },


    // ==========================================================
    // 借方金額
    // ==========================================================

    {
      field: 'DebitAmt',
      header: '借方金額',
      width: '120px',

      type: 'inputNumber',

      format: formatAmount,

      textAlign: 'right',

      aggregate: 'sum',

      /**
       * 原始資料不可修改。
       *
       * 只有自行新增的「手續費借方」
       * 可以輸入借方金額。
       */
      disabled: (
        _value,
        _index,
        rowData: PostingLine
      ) => {
        return rowData._isManual !== true;
      }
    },


    // ==========================================================
    // 貸方金額
    // ==========================================================

    {
      field: 'CreditAmt',
      header: '貸方金額',
      width: '120px',

      format: formatAmount,

      textAlign: 'right',

      aggregate: 'sum',

      disabled: () => true
    },


    // ==========================================================
    // 組織代號
    // ==========================================================

    {
      field: 'DeptCode',
      header: '組織代號',
      width: '130px',

      type: 'dropdown',

      textAlign: 'left',

      optionsAsync: true,

      options: () => this.orgOptions$,

      optionLabel: 'value',

      optionValue: 'value',

      templateLabel: 'label',

      showClear: false
    },


    // ==========================================================
    // 組織名稱
    // ==========================================================

    {
      field: 'DeptName',
      header: '組織名稱',
      width: '160px',

      textAlign: 'left',

      disabled: () => true
    },


    // ==========================================================
    // 立沖代號
    // ==========================================================

    {
      field: 'OffsetCode',
      header: '立沖代號',
      width: '120px',

      type: 'input',

      textAlign: 'left',

      /**
       * 原始 SP 如果不讓修改，
       * 可以改回：
       *
       * disabled: () => true
       */
      disabled: () => true
    },


    // ==========================================================
    // 活動代號
    // ==========================================================

    {
      field: 'ActivityCode',
      header: '活動代號',
      width: '130px',

      type: 'input',

      textAlign: 'left',

      /**
       * 新增的手續費會科可以輸入活動代號。
       * 原始資料維持唯讀。
       */
      disabled: (
        _value,
        _index,
        rowData: PostingLine
      ) => {
        return rowData._isManual !== true;
      }
    }

  ];


  // ============================================================
  // Init
  // ============================================================

  ngOnInit(): void {

    this.initializePage(
      'FIN23020',
      this.dataForm
    );

    this.formTitle =
      '暫付款申請拋轉傳票預覽';


    // ==========================================================
    // 科目 Map
    // ==========================================================

    this.ledgerOptions$
      .pipe(
        untilDestroyed(this)
      )
      .subscribe(options => {

        this.ledgerNameMap.clear();

        options?.forEach(option => {

          this.ledgerNameMap.set(
            String(option.value),
            String(option.label)
          );

        });

      });


    // ==========================================================
    // 組織 Map
    // ==========================================================

    this.orgOptions$
      .pipe(
        untilDestroyed(this)
      )
      .subscribe(options => {

        this.orgNameMap.clear();

        options?.forEach(option => {

          this.orgNameMap.set(
            String(option.value),
            String(option.label)
          );

        });

      });


    // ==========================================================
    // 查詢頁帶進來的資料
    // ==========================================================

    const items =
      this.rowdata?.items ?? [];

    if (items.length === 0) {
      return;
    }


    this.loading = true;


    const requests = items.map(item =>
      this.fin23020Service.detailFIN23020({
        id: item.id
      })
    );


    forkJoin(requests)
      .pipe(

        finalize(() => {
          this.loading = false;
        }),

        untilDestroyed(this)

      )
      .subscribe({

        next: results => {

          // ====================================================
          // Header
          // ====================================================

          const firstHeader =
            results[0]?.Data?.Header;

          if (firstHeader) {

            this.dataForm.patchValue(
              firstHeader,
              {
                emitEvent: false
              }
            );

          }


          /**
           * 使用查詢頁選的傳票日期
           */
          if (this.rowdata?.VouDate) {

            this.dataForm.patchValue(
              {
                VouDate:
                  this.rowdata.VouDate
              },
              {
                emitEvent: false
              }
            );

          }


          // ====================================================
          // Detail
          // ====================================================

          const lines: PostingLine[] = [];


          results.forEach(
            (res, idx) => {

              const item = items[idx];

              const details =
                res.Data?.Details ?? [];


              details.forEach(line => {

                lines.push({

                  ...line,

                  _sourceId:
                    item.id,

                  _prepNo:
                    item.PrepNo,

                  /**
                   * DebitAmt > 0
                   * 就視為借方。
                   */
                  _isDebit:
                    Number(line.DebitAmt) > 0,

                  _isManual:
                    false

                });

              });

            }
          );


          /**
           * SeqNo 不顯示了，
           * 但後端 Model 還有這個欄位，
           * 先保留原本資料即可。
           *
           * 不再重新做：
           *
           * 10
           * 20
           * 30
           */
          this.data = lines;


          this.initTable = true;

        },


        error: () => {

          this.messageService.errorBubble(
            '讀取拋轉預覽資料失敗，請返回查詢頁重新查詢後再試一次'
          );

        }

      });

  }


  // ============================================================
  // Table 欄位修改
  // ============================================================

  onTableFieldChange(event: any): void {

    const {
      rowData,
      field,
      value
    } = event;


    // ==========================================================
    // 科目代號 -> 科目名稱
    // ==========================================================

    if (field === 'AcctCode') {

      rowData.AcctName =
        this.ledgerNameMap.get(
          String(value)
        ) ?? '';

    }


    // ==========================================================
    // 組織代號 -> 組織名稱
    // ==========================================================

    if (field === 'DeptCode') {

      rowData.DeptName =
        this.orgNameMap.get(
          String(value)
        ) ?? '';

    }


    // ==========================================================
    // 手續費借方
    // ==========================================================

    if (
      field === 'DebitAmt' &&
      rowData._isManual
    ) {

      rowData.DebitAmt =
        Number(value ?? 0);

      rowData.CreditAmt = 0;

    }

  }


  // ============================================================
  // Table dataChange
  // ============================================================

  onTableDataChange(
    rows: PostingLine[]
  ): void {

    /**
     * TableEdit 的內部資料同步回父元件。
     */
    this.data = rows;

  }


  // ============================================================
  // 新增手續費會科
  // ============================================================

  onAddAccountingLine(): void {

    if (!this.isFormCreateable) {
      return;
    }


    /**
     * 目前這張傳票至少要有原始資料。
     */
    if (this.data.length === 0) {

      this.messageService.errorBubble(
        '目前沒有可新增的傳票資料'
      );

      return;
    }


    /**
     * 找原始借方。
     *
     * 新增列的組織 / 廠商 /
     * sourceId 都先跟原借方相同。
     */
    const sourceDebit =
      this.data.find(
        row =>
          row._isDebit === true &&
          row._isManual !== true
      );


    if (!sourceDebit) {

      this.messageService.errorBubble(
        '找不到原始借方資料'
      );

      return;
    }


    /**
     * 新增手續費會科。
     *
     * TableEdit 左邊序號會自動顯示：
     *
     * 3
     *
     * 所以不用另外顯示 SeqNo。
     */
    const newLine: PostingLine = {

      /**
       * 後端 Model 仍要求 SeqNo，
       * 這裡給一個內部值即可。
       */
      SeqNo:
        (this.data.length + 1) * 10,


      // --------------------------------------------------------
      // 手續費科目
      // --------------------------------------------------------

      AcctCode:
        this.HANDLING_FEE_ACCT_CODE,

      AcctName:
        this.HANDLING_FEE_ACCT_NAME,


      // --------------------------------------------------------
      // 廠商
      // --------------------------------------------------------

      VenNo:
        sourceDebit.VenNo ?? '',


      // --------------------------------------------------------
      // 摘要
      // --------------------------------------------------------

      Summary:
        this.dataForm.controls.VouSummary.value
        ?? sourceDebit.Summary
        ?? '',


      // --------------------------------------------------------
      // 金額
      // --------------------------------------------------------

      DebitAmt: 0,

      CreditAmt: 0,


      // --------------------------------------------------------
      // 組織
      // --------------------------------------------------------

      DeptCode:
        sourceDebit.DeptCode ?? '',

      DeptName:
        sourceDebit.DeptName ?? '',


      // --------------------------------------------------------
      // 立沖 / 活動
      // --------------------------------------------------------

      OffsetCode: '',

      ActivityCode: '',


      // --------------------------------------------------------
      // Internal
      // --------------------------------------------------------

      _sourceId:
        sourceDebit._sourceId,

      _prepNo:
        sourceDebit._prepNo,

      /**
       * 手續費是借方
       */
      _isDebit: true,

      /**
       * 使用者新增列
       */
      _isManual: true

    };


    /**
     * 使用新的 Array reference，
     * 讓 TableEdit OnPush 可以偵測到。
     */
    this.data = [
      ...this.data,
      newLine
    ];

  }


  // ============================================================
  // 確定拋轉
  // ============================================================

  onConfirmPosting(): void {

    if (!this.isFormCreateable) {
      return;
    }


    if (this.data.length === 0) {
      return;
    }


    // ==========================================================
    // 基本檢查
    // ==========================================================

    const manualLines =
      this.data.filter(
        row =>
          row._isManual === true
      );


    for (const row of manualLines) {

      if (!row.AcctCode) {

        this.messageService.errorBubble(
          '手續費會科尚未設定科目代號'
        );

        return;
      }


      if (
        !row.DebitAmt ||
        Number(row.DebitAmt) <= 0
      ) {

        this.messageService.errorBubble(
          '請輸入手續費借方金額'
        );

        return;
      }

    }


    // ==========================================================
    // 按 sourceId 分組
    // ==========================================================

    const grouped =
      new Map<number, PostingLine[]>();


    this.data.forEach(line => {

      const arr =
        grouped.get(
          line._sourceId
        ) ?? [];

      arr.push(line);

      grouped.set(
        line._sourceId,
        arr
      );

    });


    const vouSummary =
      this.dataForm.controls
        .VouSummary.value
      ?? undefined;


    const vouDate =
      this.rowdata?.VouDate
      ?? undefined;


    const entries =
      Array.from(
        grouped.entries()
      );


    // ==========================================================
    // Confirm
    // ==========================================================

    this.messageService.confirm({

      header:
        '拋轉確認',

      message:
        `是否確定拋轉這 ${entries.length} 筆暫付款申請?`,

      accept: () => {

        this.loading = true;


        // ======================================================
        // 注意
        // ======================================================
        /**
         * 目前 PostingFIN23020Request
         * 還是舊版：
         *
         * 只能傳：
         *
         * 1 個 Debit
         * 1 個 Credit
         *
         * 所以目前 SP 還沒有辦法真正接第 3 筆手續費。
         *
         * 這裡先維持既有 posting 行為，
         * 避免破壞原本 API。
         *
         * 後端之後如果改 Details[]，
         * 這裡再一起換掉。
         */


        const requests =
          entries.map(
            ([id, lines]) => {


              /**
               * 原始借方
               *
               * 排除手動新增的手續費。
               */
              const debit =
                lines.find(
                  line =>
                    line._isDebit &&
                    !line._isManual
                );


              /**
               * 貸方
               */
              const credit =
                lines.find(
                  line =>
                    !line._isDebit
                );


              const request:
                PostingFIN23020Request = {

                id,


                // ----------------------------------------------
                // 貸方科目
                // ----------------------------------------------

                CreditAccNo:
                  credit?.AcctCode
                  ?? undefined,


                // ----------------------------------------------
                // 組織
                // ----------------------------------------------

                DebitOrgId:
                  debit?.DeptCode
                  ?? undefined,

                CreditOrgId:
                  credit?.DeptCode
                  ?? undefined,


                // ----------------------------------------------
                // 立沖
                // ----------------------------------------------

                DebitOffsetNo:
                  debit?.OffsetCode
                  ?? undefined,


                // ----------------------------------------------
                // 摘要
                // ----------------------------------------------

                DebitSummary:
                  debit?.Summary
                  ?? undefined,

                CreditSummary:
                  credit?.Summary
                  ?? undefined,

                VouSummary:
                  vouSummary,


                // ----------------------------------------------
                // 傳票日期
                // ----------------------------------------------

                VouDate:
                  vouDate

              };


              return this.fin23020Service
                .postingFIN23020(
                  request
                );

            }
          );


        // ======================================================
        // API
        // ======================================================

        forkJoin(requests)
          .pipe(

            finalize(
              () =>
                this.loading = false
            ),

            untilDestroyed(this)

          )
          .subscribe({

            next: results => {

              const failMessages:
                string[] = [];

              let successCount = 0;


              results.forEach(
                (res, idx) => {

                  const prepNo =
                    entries[idx][1][0]
                      ?._prepNo;


                  if (
                    res?.Data?.Success
                  ) {

                    successCount++;

                  } else {

                    failMessages.push(
                      `${prepNo}：${
                        res?.Data?.Message
                        || '拋轉失敗'
                      }`
                    );

                  }

                }
              );


              const summary =
                failMessages.length
                  ? `成功 ${successCount} 筆，失敗 ${failMessages.length} 筆：<br>${failMessages.join('<br>')}`
                  : `成功 ${successCount} 筆`;


              setTimeout(() => {

                this.messageService.confirm({

                  header:
                    failMessages.length
                      ? '拋轉完成(部分失敗)'
                      : '拋轉成功',

                  message:
                    summary,

                  icon:
                    failMessages.length
                      ? 'pi pi-exclamation-triangle'
                      : 'pi pi-check-circle',

                  acceptLabel:
                    '確定',

                  showRejectButton:
                    false,

                  accept:
                    () =>
                      this.onCancel()

                });

              }, 0);

            },


            error: () => {

              this.messageService.errorBubble(
                '拋轉傳票時發生錯誤'
              );

            }

          });

      }

    });

  }

}