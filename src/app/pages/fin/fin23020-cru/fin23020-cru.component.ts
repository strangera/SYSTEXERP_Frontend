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


/**
 * 查詢頁勾選多筆後帶進本頁的資料
 */
interface Fin23020CruState {

  items: QueryFIN23020Response[];

  /**
   * 查詢頁選擇的傳票日期
   */
  VouDate?: string | null;

}


/**
 * 傳票明細
 *
 * _sourceId：
 * 原始暫付款 ID
 *
 * _prepNo：
 * 暫付款申請單號
 *
 * _isDebit：
 * true  = 借方
 * false = 貸方
 *
 * _isManual：
 * true  = 使用者自行新增的會科
 * false = API 原始資料
 */
interface PostingLine extends DetailFIN23020Line {

  _sourceId: number;

  _prepNo: string;

  _isDebit: boolean;

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


  private readonly fin23020Service =
    inject(Fin23020Service);

  private readonly dropdown =
    inject(DropdownApiService);


  // ============================================================
  // 下拉選單
  // ============================================================

  /**
   * 科目
   */
  private readonly ledgerOptions$ =
    this.dropdown.queryGls1005_ledgerMD();


  /**
   * 組織
   */
  private readonly orgOptions$ =
    this.dropdown.querySys3100();


  /**
   * 科目代號 -> 科目名稱
   */
  private readonly ledgerNameMap =
    new Map<string, string>();


  /**
   * 組織代號 -> 組織名稱
   */
  private readonly orgNameMap =
    new Map<string, string>();


  // ============================================================
  // 手續費會科
  // ============================================================

  /**
   * 如果未指定預設手續費科目，
   * 保持空字串即可，
   * 新增列後讓使用者自己選。
   */
  private readonly HANDLING_FEE_ACCT_CODE = '';

  private readonly HANDLING_FEE_ACCT_NAME = '';


  // ============================================================
  // 表頭
  // ============================================================

  dataForm = this.formBuilder.group({

    /**
     * 傳票編號
     */
    VouNo: [
      {
        value: null as string | null,
        disabled: true
      }
    ],


    /**
     * 傳票種類
     */
    VouTypeName: [
      {
        value: null as string | null,
        disabled: true
      }
    ],


    /**
     * 傳票型態
     */
    VouForm: [
      {
        value: null as string | null,
        disabled: true
      }
    ],


    /**
     * 傳票日期
     */
    VouDate: [
      {
        value: null as Date | string | null,
        disabled: true
      }
    ],


    /**
     * 傳票摘要
     */
    VouSummary: [
      null as string | null
    ],


    /**
     * 建立者代號
     */
    CRT_USR_No: [
      {
        value: null as string | null,
        disabled: true
      }
    ],


    /**
     * 建立者名稱
     */
    CRT_USR_Name: [
      {
        value: null as string | null,
        disabled: true
      }
    ],


    /**
     * 建立日
     */
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
   * Table Checkbox 目前勾選的資料。
   *
   * 這裡只允許存放：
   * _isManual === true
   * 的手動新增會科。
   */
  selectedItems: PostingLine[] = [];


  /**
   * Checkbox 是否允許勾選。
   *
   * 規則：
   *
   * 原始 API 資料
   * _isManual = false
   * => 不可勾選 / 不可刪除
   *
   * 手動新增資料
   * _isManual = true
   * => 可以勾選 / 可以刪除
   */
  isRowSelectable = (
    rowData: PostingLine,
    _rowIndex: number,
    _data: PostingLine[]
  ): boolean => {

    return rowData._isManual === true;

  };


  /**
   * 傳票明細欄位
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
       * 規則：
       *
       * 1. 原始借方不可修改
       * 2. 原始貸方可以修改
       * 3. 手動新增的借方會科可以修改
       */
      disabled: (
        _value,
        _index,
        rowData: PostingLine
      ) => {

        return (
          rowData._isDebit === true &&
          rowData._isManual !== true
        );

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
       * 借方列可以修改。
       *
       * 貸方列的 DebitAmt 鎖住。
       */
      disabled: (
        _value,
        _index,
        rowData: PostingLine
      ) => {

        return rowData._isDebit !== true;

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

      /**
       * 目前貸方金額維持不可修改。
       */
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
       * 全部不可修改
       */
      disabled: () => true
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


    const requests =
      items.map(item =>
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
              {
                ...firstHeader,

                /**
                 * app-calendar 只有在收到 Date 物件時，
                 * 才會用 dateFormat('yy/mm/dd') 格式化顯示，
                 * 後端回傳的字串（帶時間）需先轉成 Date，
                 * 避免畫面直接顯示原始字串（含時間）。
                 */
                VouDate:
                  firstHeader.VouDate
                    ? new Date(firstHeader.VouDate)
                    : null
              },
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
                  new Date(this.rowdata.VouDate)
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

              const item =
                items[idx];


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
                   * 視為借方。
                   */
                  _isDebit:
                    Number(line.DebitAmt) > 0,

                  /**
                   * API 原始資料。
                   *
                   * 不允許 checkbox 勾選，
                   * 也不能透過垃圾桶刪除。
                   */
                  _isManual:
                    false

                });

              });

            }
          );


          this.data = lines;

          /**
           * 初始化時沒有任何選取資料。
           */
          this.selectedItems = [];

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
  // Checkbox
  // ============================================================

  /**
   * Table checkbox 選取變更。
   */
  onSelectionChange(
    rows: PostingLine[]
  ): void {

    /**
     * 再做一次防護。
     *
     * 即使 TableEdit 未來選取邏輯變更，
     * 父層仍只接受 _isManual === true 的資料。
     */
    this.selectedItems =
      (rows ?? []).filter(
        row =>
          row._isManual === true
      );

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

      rowData.AcctCode =
        value;

      rowData.AcctName =
        this.ledgerNameMap.get(
          String(value)
        ) ?? '';

    }


    // ==========================================================
    // 組織代號 -> 組織名稱
    // ==========================================================

    if (field === 'DeptCode') {

      rowData.DeptCode =
        value;

      rowData.DeptName =
        this.orgNameMap.get(
          String(value)
        ) ?? '';

    }


    // ==========================================================
    // 借方金額
    // ==========================================================

    if (
      field === 'DebitAmt' &&
      rowData._isDebit
    ) {

      rowData.DebitAmt =
        Number(value ?? 0);

      rowData.CreditAmt = 0;

    }


    /**
     * 重新給 Array Reference，
     * 確保 TableEdit 合計列更新。
     */
    this.data = [
      ...this.data
    ];

  }


  // ============================================================
  // Table dataChange
  // ============================================================

  onTableDataChange(
    rows: PostingLine[]
  ): void {

    this.data = rows;


    /**
     * TableEdit 刪除資料之後，
     * 把已經不存在的 selectedItems 一併清掉。
     *
     * 避免：
     * UI 已刪除，
     * 但父元件 selectedItems 還保留舊 reference。
     */
    this.selectedItems =
      this.selectedItems.filter(
        selected =>
          this.data.includes(selected) &&
          selected._isManual === true
      );

  }


  // ============================================================
  // 新增會科
  // ============================================================

  onAddAccountingLine(): void {

    if (!this.isFormCreateable) {
      return;
    }


    if (this.data.length === 0) {

      this.messageService.errorBubble(
        '目前沒有可新增的傳票資料'
      );

      return;

    }


    /**
     * 找原始借方。
     *
     * 新增列的：
     *
     * 廠商
     * 組織
     * sourceId
     *
     * 先沿用原借方。
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


    const newLine: PostingLine = {

      /**
       * 後端 Model 仍保留 SeqNo。
       */
      SeqNo:
        (this.data.length + 1) * 10,


      // --------------------------------------------------------
      // 科目
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
       * 新增會科為借方
       */
      _isDebit: true,

      /**
       * 使用者新增。
       *
       * 只有這種資料可以：
       *
       * 1. checkbox 勾選
       * 2. 點垃圾桶刪除
       */
      _isManual: true

    };


    /**
     * 使用新的 Array reference
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
    // 手動新增會科檢查
    // ==========================================================

    const manualLines =
      this.data.filter(
        row =>
          row._isManual === true
      );


    for (const row of manualLines) {

      /**
       * 科目必填
       */
      if (!row.AcctCode) {

        this.messageService.errorBubble(
          '新增會科尚未選擇科目代號'
        );

        return;

      }


      /**
       * 借方金額必須大於 0
       */
      if (
        !row.DebitAmt ||
        Number(row.DebitAmt) <= 0
      ) {

        this.messageService.errorBubble(
          '請輸入新增會科借方金額'
        );

        return;

      }

    }


    // ==========================================================
    // 借貸平衡檢查
    // ==========================================================

    const totalDebit =
      this.data.reduce(
        (sum, row) =>
          sum + Number(row.DebitAmt ?? 0),
        0
      );


    const totalCredit =
      this.data.reduce(
        (sum, row) =>
          sum + Number(row.CreditAmt ?? 0),
        0
      );


    /**
     * 轉成分比較，
     * 避免 JS 小數浮點誤差。
     */
    const debitAmount =
      Math.round(
        totalDebit * 100
      );


    const creditAmount =
      Math.round(
        totalCredit * 100
      );


    if (
      debitAmount !== creditAmount
    ) {

      this.messageService.errorBubble(
        '借貸方金額不一致，不可拋轉'
      );

      return;

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
        // Request
        // ======================================================

        /**
         * 注意：
         *
         * 目前 PostingFIN23020Request
         * 還是舊結構。
         *
         * 目前 API 真正送出的內容仍然是：
         *
         * 原始借方
         * +
         * 原始貸方
         *
         * 手動新增會科目前只存在畫面。
         *
         * 如果後端要真正新增第 3、4 筆傳票明細，
         * Request / API / SP 必須一起改 Details[]。
         */
        const requests =
          entries.map(
            ([id, lines]) => {


              /**
               * 原始借方
               *
               * 排除新增會科。
               */
              const debit =
                lines.find(
                  line =>
                    line._isDebit &&
                    !line._isManual
                );


              /**
               * 原始貸方
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

              const successMessages:
                string[] = [];

              const failMessages:
                string[] = [];


              results.forEach(
                (res, idx) => {

                  const prepNo =
                    entries[idx][1][0]
                      ?._prepNo;


                  if (
                    res?.Data?.Success
                  ) {

                    /**
                     * 顯示後端回傳的訊息
                     * （已含傳票號），
                     * 沒有訊息時用傳票號補上。
                     */
                    const detail =
                      res.Data.Message
                      || (
                        res.Data.VouNo
                          ? `拋轉成功，傳票號：${res.Data.VouNo}`
                          : '拋轉成功'
                      );

                    successMessages.push(
                      `${prepNo}: ${detail}`
                    );

                  } else {

                    failMessages.push(
                      `${prepNo}: ${
                        res?.Data?.Message
                        || '拋轉失敗'
                      }`
                    );

                  }

                }
              );


              const successCount =
                successMessages.length;


              const successBlock =
                successMessages.length
                  ? `成功 ${successCount} 筆：<br>${successMessages.join('<br>')}`
                  : `成功 ${successCount} 筆`;


              const summary =
                failMessages.length
                  ? `${successBlock}<br>失敗 ${failMessages.length} 筆：<br>${failMessages.join('<br>')}`
                  : successBlock;


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