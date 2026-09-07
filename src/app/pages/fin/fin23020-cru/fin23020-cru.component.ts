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
   * 科目。
   *
   * 用 Fin23020Service.queryGls1005Fin23020()，
   * 不用 DropdownApiService.queryGls1005_ledgerMD()：
   * 後者多處共用，不帶 AccDC(借貸方屬性)，
   * 本頁需要 AccDC 判斷選擇科目後開放借方或貸方金額欄位。
   */
  private readonly ledgerOptions$ =
    this.fin23020Service.queryGls1005Fin23020();


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
   * 科目代號 -> 借貸方屬性(AccDC，D:借方 C:貸方)
   */
  private readonly ledgerDCMap =
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

  private initialFormDataSnapshot: Record<string, any> | null = null;
  private initialDataSnapshot: PostingLine[] = [];


  // ============================================================
  // Table
  // ============================================================

  data: PostingLine[] = [];

  initTable = false;


  /**
   * Table Checkbox 目前勾選的資料。
   *
   * 原始 API 資料與手動新增會科皆可勾選 / 刪除。
   */
  selectedItems: PostingLine[] = [];


  /**
   * Checkbox 是否允許勾選。
   *
   * 所有列（含原始 API 資料與手動新增會科）皆開放勾選 / 刪除。
   */
  isRowSelectable = (): boolean => true;


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

      showClear: false

      /**
       * 借貸方科目代號皆開放編輯，
       * 選擇後由 onTableFieldChange 同步更新科目名稱。
       */

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

      type: 'inputNumber',

      format: formatAmount,

      textAlign: 'right',

      aggregate: 'sum',

      /**
       * 貸方列可以修改。
       *
       * 借方列的 CreditAmt 鎖住。
       */
      disabled: (
        _value,
        _index,
        rowData: PostingLine
      ) => {

        return rowData._isDebit !== false;

      }
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

        this.ledgerDCMap.clear();

        options?.forEach(option => {

          this.ledgerNameMap.set(
            String(option.value),
            String(option.label)
          );

          this.ledgerDCMap.set(
            String(option.value),
            String(option['AccDC'] ?? '')
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

          // ====================================================
          // 儲存原始快照（包含 disabled 欄位的值與原始明細）
          // ====================================================
          this.initialFormDataSnapshot = this.dataForm.getRawValue();
          this.initialDataSnapshot = lines.map(line => ({ ...line }));

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

    this.selectedItems =
      rows ?? [];

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


      /**
       * 依科目本身的借貸方屬性(AccDC)，
       * 決定這一列要開放借方金額還是貸方金額，
       * 並把另一邊金額歸零。
       */
      const accDC =
        this.ledgerDCMap.get(
          String(value)
        );


      if (accDC === 'D') {

        rowData._isDebit = true;

        rowData.CreditAmt = 0;

      } else if (accDC === 'C') {

        rowData._isDebit = false;

        rowData.DebitAmt = 0;

      }

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


    // ==========================================================
    // 貸方金額
    // ==========================================================

    if (
      field === 'CreditAmt' &&
      !rowData._isDebit
    ) {

      rowData.CreditAmt =
        Number(value ?? 0);

      rowData.DebitAmt = 0;

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
          this.data.includes(selected)
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
    // 原始借貸科目代號檢查
    //
    // 借貸科目代號已開放編輯且為後端必填欄位，
    // 需再次確認原始借方/貸方列的科目代號未被清空。
    // ==========================================================

    const originalLines =
      this.data.filter(
        row =>
          row._isManual !== true
      );


    for (const row of originalLines) {

      if (!row.AcctCode) {

        this.messageService.errorBubble(
          `${row._isDebit ? '借方' : '貸方'}科目代號不可為空`
        );

        return;

      }

    }


    // ==========================================================
    // 每筆暫付款申請至少須保留一筆借方、一筆貸方
    //
    // Checkbox 已開放刪除原始資料，
    // 需防止使用者把某筆暫付款申請的借方或貸方整筆刪光。
    // ==========================================================

    const sourceGroups =
      new Map<number, PostingLine[]>();


    this.data.forEach(row => {

      const arr =
        sourceGroups.get(row._sourceId) ?? [];


      arr.push(row);


      sourceGroups.set(
        row._sourceId,
        arr
      );

    });


    for (const [, rows] of sourceGroups) {

      const hasDebit =
        rows.some(row => row._isDebit === true);

      const hasCredit =
        rows.some(row => row._isDebit === false);


      if (!hasDebit || !hasCredit) {

        this.messageService.errorBubble(
          `${rows[0]._prepNo}：借方與貸方明細皆不可整筆刪除`
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


    /**
     * 按 sourceId 分組（沿用上方已建立的 sourceGroups）
     */
    const grouped =
      sourceGroups;


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
        // Request：所有 id 合併成一張傳票，借/貸科目取第一筆
        // ======================================================

        const firstLines =
          entries[0][1];

        const debit =
          firstLines.find(
            line =>
              line._isDebit &&
              !line._isManual
          );

        const credit =
          firstLines.find(
            line =>
              !line._isDebit
          );

        const request:
          PostingFIN23020Request = {

          ids:
            entries.map(
              ([id]) => id
            ),

          DebitAccNo:
            debit?.AcctCode
            ?? undefined,

          CreditAccNo:
            credit?.AcctCode
            ?? undefined,

          DebitOrgId:
            debit?.DeptCode
            ?? undefined,

          CreditOrgId:
            credit?.DeptCode
            ?? undefined,

          DebitOffsetNo:
            debit?.OffsetCode
            ?? undefined,

          DebitSummary:
            debit?.Summary
            ?? undefined,

          CreditSummary:
            credit?.Summary
            ?? undefined,

          VouSummary:
            vouSummary,

          VouDate:
            vouDate

        };


        // ======================================================
        // API：單一呼叫，一張傳票
        // ======================================================

        this.fin23020Service
          .postingFIN23020(request)
          .pipe(

            finalize(
              () =>
                this.loading = false
            ),

            untilDestroyed(this)

          )
          .subscribe({

            next: res => {

              const message =
                res?.Data?.Message
                || (
                  res?.Data?.VouNo
                    ? `拋轉成功，傳票號：${res.Data.VouNo}`
                    : '拋轉成功'
                );


              setTimeout(() => {

                this.messageService.confirm({

                  header:
                    res?.Data?.Success
                      ? '拋轉成功'
                      : '拋轉失敗',

                  message,

                  icon:
                    res?.Data?.Success
                      ? 'pi pi-check-circle'
                      : 'pi pi-exclamation-triangle',

                  acceptLabel:
                    '確定',

                  showRejectButton:
                    false,

                  accept:
                    () => {
                      if (res?.Data?.Success) {
                        this.onCancel();
                      }
                    }

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

  onResetEditableFields(): void {
    // 1. 還原主表（使用 patchValue + 快照，不會清空 disabled 欄位）
    if (this.initialFormDataSnapshot) {
      this.dataForm.patchValue(this.initialFormDataSnapshot);
    }

    // 2. 還原明細（深拷貝還原，自動移除手動新增的行，並復原編輯過的金額/科目）
    if (this.initialDataSnapshot) {
      this.data = this.initialDataSnapshot.map(line => ({ ...line }));
    }

    // 3. 清空表格選取項目
    this.selectedItems = [];
  }
}