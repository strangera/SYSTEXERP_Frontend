import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { TableComponent } from '@others/component/table/table.component';
import { Column, formatDate } from '@others/component/table/table.model';
import {
  ASS12050ConfirmDetail,
  ASS12050Detail,
  ASS12050DetailItem,
  ASS12050InsertRequest,
  ASS12050TransferRow,
  ASS12050UpdateRequest
} from '@pages/ass/ass12050/ass12050.model';
import { ASS11100Service } from '@service/api/ass/ass11100.service';
import { ASS12050Service } from '@service/api/ass/ass12050.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { DialogComponent } from '@shared/components/dialog/dialog.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputNumberComponent } from '@shared/components/input-number/input-number.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { TableEditComponent } from '@shared/components/table-edit/table-edit.component';
import { EditColumn } from '@shared/components/table-edit/table-edit.model';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { CheckboxModule } from 'primeng/checkbox';
import { PanelModule } from 'primeng/panel';
import { concat, finalize, last, tap } from 'rxjs';
/** 3.1.2.5 採購單驗收作業 CRU */
@UntilDestroy()
@Component({
  selector: 'app-ass12050-cru',
  templateUrl: './ass12050-cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarComponent,
    DropdownComponent,
    InputTextComponent,
    InputNumberComponent,
    DialogComponent,
    TableComponent,
    TableEditComponent,
    TranslateModule,
    CheckboxModule,
  ],
})
export class ASS12050CRUComponent
  extends BasicCruPageComponent<ASS12050Detail>
  implements OnInit {
  @ViewChild('tableEdit') tableEditComponent!: TableEditComponent;

  dataForm = this.formBuilder.group({
  SUBCHECK_ID: [null as string | null],
  EMP_ID: [null as string | null, [Validators.required]],
  ORG_ID: [null as string | null, [Validators.required]],
  APPLY_DATE: [null as Date | null, [Validators.required]],
  SUPPLIER_ID: [null as string | null, [Validators.required]],

  // 驗收資訊
  CLOSE_EMP_ID: [null as string | null],
  CLOSE_EMP_NAME: [null as string | null],
  CHECK_DATE: [null as Date | null],

  NTAX_AMT: [null as number | null],
  TAX_AMT: [null as number | null],
  AMT: [null as number | null],
  CHK_Status: [null as string | null],
  IsAllTax: [false],
});

  /** 明細資料（table-edit 綁定） */
  data: ASS12050DetailItem[] = [];

  /** 明細原始資料（取消時還原用） */
  private originalData: ASS12050DetailItem[] = [];

  /** 申請人下拉選項 */
  empIdOptions: { value: string; label: string }[] = [];

  /** 部門下拉選項 */
  orgIdOptions: { value: string; label: string }[] = [];

  /** 供應商下拉選項 */
  supplierIdOptions: { value: string; label: string }[] = [];

  /** 品項下拉選項 */
  goodsIdOptions: { value: string; label: string }[] = [];

  /** 倉別下拉選項 */
  whIdOptions: { value: string; label: string }[] = [];


  editColumns: EditColumn[] = [
    {
      field: 'GOODS_ID',
      header: '品項編號/名稱',
      type: 'dropdown',
      optionLabel: 'label',
      optionValue: 'value',
      options: () => this.goodsIdOptions,
      disabled: () => this.isFormEditable,
    },
    {
      field: 'GOODS_UNIT',
      header: '單位',
      type: 'input',
      disabled: () => !this.isFormCreateable,
    },
    {
      field: 'APPLY_QTY',
      header: '申請數量',
      type: 'inputNumber',
      disabled: () => !this.isFormCreateable,
    },
    {
      field: 'SHIP_QTY',
      header: '應驗數量',
      type: 'inputNumber',
      disabled: () => !this.isFormCreateable,
    },
    {
      field: 'CHECK_QTY',
      header: '驗收數量',
      type: 'inputNumber',
      placeholder: '輸入數字',
      disabled: () => false,
    },
    {
      field: 'GOODS_PRICE',
      header: '單價(未稅)',
      type: 'inputNumber',
      disabled: () => !this.isFormCreateable,
    },
    {
      field: 'DIS_PRICE',
      header: '調整單價(未稅)',
      type: 'inputNumber',
      maxFractionDigits: 2,
      placeholder: '輸入數字',
      disabled: () => false,
    },
    {
      field: 'AMT',
      header: '總金額',
      type: 'inputNumber',
      disabled: () => true,
    },
    {
      field: 'SITE_ID',
      header: '分店',
      type: 'input',
      disabled: () => !this.isFormCreateable,
    },
    {
      field: 'WH_ID',
      header: '倉別',
      type: 'dropdown',
      optionLabel: 'label',
      optionValue: 'value',
      options: () => this.whIdOptions,
      disabled: () => !this.isFormCreateable,
    },
    {
      field: 'NOTES',
      header: '說明',
      type: 'input',
      disabled: () => false,
    },
  ];

  /** 選擇採購單 Dialog */
  displayTransferDialog = false;
  transferData: ASS12050TransferRow[] = [];
  selectedTransferRow: ASS12050TransferRow | null = null;
  transferListLoading = false;

  transferColumns: Column[] = [
    { field: 'SUBPOENA_ID', header: '採購單號' },
    { field: 'EMP_NAME', header: '申請人' },
    { field: 'ORG_NAME', header: '部門' },
    { field: 'APPLY_DATE', header: '申請日期', format: formatDate },
    { field: 'SUPPLIER_NAME', header: '供應商' },
    { field: 'NTAX_AMT', header: '未稅金額' },
    { field: 'TAX_AMT', header: '稅額' },
    { field: 'AMT', header: '含稅總金額' },
    { field: 'APPLY_QTY', header: '申請數量' },
    { field: 'CHECKED_QTY', header: '已驗數量' },
    { field: 'REMAIN_QTY', header: '剩餘數量' },
  ];

  /** 編輯時保留的驗收單號 */
  private subcheckId: string | null = null;

  /** 來源採購單號（轉入時取得） */
  private sourceSubpoenaId: string | null = null;

  constructor(
    private readonly ass12050Service: ASS12050Service,
    private readonly dropDownListService: DropDownListService,
    private readonly dropdownApiService: DropdownApiService,
    private readonly ass11100Service: ASS11100Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS12050', this.dataForm);
    this.loadDropdownOptions();
    this.dataForm.controls.IsAllTax.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        this.calculateHeaderAmounts();
      });
    const navState = this.router.lastSuccessfulNavigation?.extras?.state;

    if (navState?.['subpoenaId']) {
      this.sourceSubpoenaId = navState['subpoenaId'] as string;
    }

    const rowSubcheckId = (
      this.rowdata as Record<string, unknown> | null
    )?.['SUBCHECK_ID'] as string | undefined;

    if (!this.isFormCreateable && rowSubcheckId) {
      this.subcheckId = rowSubcheckId;
      this.loadDetail(rowSubcheckId);
    }
  }

  /**
   * 是否可以執行驗收。
   *
   * CHK_Status：
   * null / 其他未驗收狀態 = 可驗收
   * 1 = 已驗收待審核，不可再次驗收
   * 2 = 已審核，不可再次驗收
   */
  get canConfirm(): boolean {
    if (!this.isFormEditable || this.loading) {
      return false;
    }

    const status = this.dataForm.controls.CHK_Status.value;

    return status !== '1' && status !== '2';
  }

  /**
   * 是否可以執行審核。
   *
   * CHK_Status = 1 時，才可以執行審核。
   * CHK_Status = 2 代表已審核，不可再次審核。
   */
  get canApprove(): boolean {
    if (!this.isFormEditable || this.loading) {
      return false;
    }

    return this.dataForm.controls.CHK_Status.value === '1';
  }

  /** 覆寫：從編輯主檔進入時，返回編輯主檔而非查詢頁 */
  override onCancel(returnValue?: unknown): void {
    if (
      this.previousRoute?.includes('ass12050master') &&
      this.sourceSubpoenaId
    ) {
      this.router.navigate(['account/ass/ass12050master'], {
        state: {
          rowdata: {
            SUBPOENA_ID: this.sourceSubpoenaId,
          },
          fromRoute: this.router.url,
          data: returnValue,
        },
      });
      return;
    }

    super.onCancel(returnValue);
  }

  /** 取消按鈕：還原表單與明細表格至原始狀態 */
  onCancelButtonClick(): void {
    this.data = this.originalData.map(item => ({ ...item }));
    this.calculateHeaderAmounts();
  }

  /** 查詢驗收單主檔及明細 */
private loadDetail(subcheckId: string): void {
  this.loading = true;

  this.ass12050Service
    .getDetailASS12050({
      SUBCHECK_ID: subcheckId,
    })
    .pipe(
      finalize(() => (this.loading = false)),
      untilDestroyed(this),
    )
    .subscribe({
      next: res => {
        if (res.Status !== '0000') {
          this.messageService.errorBubble(
            '查詢失敗：' + (res.Message ?? ''),
          );
          return;
        }

        const detail = res.Data;

        this.subcheckId =
          detail?.SUBCHECK_ID ?? subcheckId;

        // 尚未驗收時，驗收日期預設今天
        const checkDate = detail?.CHECK_DATE
          ? new Date(detail.CHECK_DATE)
          : new Date();

        this.dataForm.patchValue({
          SUBCHECK_ID: detail?.SUBCHECK_ID ?? null,
          EMP_ID: detail?.EMP_ID ?? null,
          ORG_ID: detail?.ORG_ID ?? null,

          APPLY_DATE: detail?.APPLY_DATE
            ? new Date(detail.APPLY_DATE)
            : null,

          SUPPLIER_ID:
            detail?.SUPPLIER_ID ?? null,

          // 驗收資訊
          CLOSE_EMP_ID:
            detail?.CLOSE_EMP_ID ?? null,

          CLOSE_EMP_NAME:
            detail?.CLOSE_EMP_NAME ?? null,

          // DB 有驗收日期就使用 DB 日期
          // 尚未驗收則預設今天
          CHECK_DATE: checkDate,

          NTAX_AMT: detail?.NTAX_AMT ?? null,
          TAX_AMT: detail?.TAX_AMT ?? null,
          AMT: detail?.AMT ?? null,
          CHK_Status: detail?.CHK_Status ?? null,
        });

        const details =
          (detail?.Details ?? []).map(item => ({
            ...item,
          }));

        this.data = details.map(item => ({
          ...item,
          AMT:
            item.AMT ??
            this.calculateDetailAmount(item),
        }));

        this.originalData = this.data.map(item => ({
          ...item,
        }));

        if (this.data.length > 0) {
          this.calculateHeaderAmounts();
        }

        this.dataForm.markAsPristine();
        this.dataForm.markAsUntouched();
      },
    });
}
  private loadDropdownOptions(): void {
    const toOpt = (items: { No?: string; Name?: string }[]) =>
      (items ?? []).map(item => ({
        label: `${item.No ?? ''} - ${item.Name ?? ''}`,
        value: item.No ?? '',
      }));

    this.dropDownListService
      .queryTBLUSER_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.empIdOptions = toOpt(res.Data ?? []);
      });

    this.dropDownListService
      .querySYS3100_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        if (res.Status !== '0000') {
          return;
        }

        this.orgIdOptions = toOpt(res.Data ?? []);
      });

    this.dropDownListService
      .queryPOS2013_DropDownList({})
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        const list = res.Data ?? [];

        this.supplierIdOptions = list.map(
          (item: {
            VEN_No?: string;
            No?: string;
            Name?: string;
          }) => ({
            value: item.VEN_No ?? item.No ?? '',
            label: `${item.VEN_No ?? item.No ?? ''} - ${item.Name ?? ''
              }`,
          }),
        );
      });

    // 品項：queryASS11040_DropDownList（固定資產品項主檔，與整條資產採購流程一致）
    this.dropdownApiService
      .queryASS11040_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(options => {
        this.goodsIdOptions = options ?? [];
      });

    this.ass11100Service
      .queryASS11100({
        PageSize: 9999,
        PageIndex: 1,
      })
      .pipe(untilDestroyed(this))
      .subscribe({
        next: res => {
          if (res.Status !== '0000') {
            return;
          }

          this.whIdOptions = (res.Data ?? [])
            .filter(
              item =>
                item.WH_ID != null &&
                item.WH_ID !== '',
            )
            .map(item => ({
              label: `${item.WH_ID} - ${item.WH_NAME ?? ''
                }`,
              value: item.WH_ID!,
            }));
        },
      });
  }

  /** 開啟轉入採購單 Dialog */
  openTransferDialog(): void {
    this.transferListLoading = true;
    this.selectedTransferRow = null;

    this.ass12050Service
      .listForTransferASS12050()
      .pipe(
        finalize(
          () => (this.transferListLoading = false),
        ),
        untilDestroyed(this),
      )
      .subscribe({
        next: res => {
          if (res.Status !== '0000') {
            return;
          }

          this.transferData = res.Data ?? [];
          this.displayTransferDialog = true;
        },
      });
  }

  onTransferSelectionChange(
    rows: ASS12050TransferRow[],
  ): void {
    this.selectedTransferRow = rows?.[0] ?? null;
  }

  get canConfirmTransfer(): boolean {
    return !!this.selectedTransferRow;
  }

  /** 確認轉入採購單 */
  onTransferConfirm(): void {
    const row = this.selectedTransferRow;

    if (!row?.SUBPOENA_ID) {
      this.messageService.warnBubble('請選擇一筆採購單');
      return;
    }

    this.transferListLoading = true;

    this.ass12050Service
      .transferASS12050({
        SUBPOENA_ID: row.SUBPOENA_ID,
      })
      .pipe(
        finalize(() => (this.transferListLoading = false)),
        untilDestroyed(this),
      )
      .subscribe({
        next: res => {
          if (res.Status !== '0000') {
            this.messageService.errorBubble(
              '轉入失敗：' + (res.Message ?? ''),
            );

            this.displayTransferDialog = false;
            return;
          }

          const subcheckId = res.Data;

          if (!subcheckId) {
            this.messageService.errorBubble(
              '轉入成功，但未取得驗收單號',
            );
            return;
          }

          this.subcheckId = subcheckId;

          this.displayTransferDialog = false;

          this.messageService.successBubble('轉入成功');

          this.loadDetail(subcheckId);
        },
        error: error => {
          this.messageService.errorBubble(
            error?.error?.Message ??
            error?.error?.message ??
            error?.message ??
            '轉入失敗',
          );
        },
      });
  }

  /** 驗收 */
  onConfirm(): void {
    if (!this.canConfirm) {
      this.messageService.warnBubble(
        '目前驗收單狀態不可執行驗收',
      );
      return;
    }

    const subcheckId =
      this.subcheckId ??
      this.dataForm.controls.SUBCHECK_ID.value;

    if (!subcheckId) {
      this.messageService.errorBubble('無可驗收的資料');
      return;
    }

    // 尚未驗收時，驗收日期預設今天；欄位本身於 HTML 維持 disabled。
    if (!this.dataForm.controls.CHECK_DATE.value) {
      this.dataForm.patchValue({
        CHECK_DATE: new Date(),
      });
    }

    this.messageService.confirm({
      header: '驗收確認',
      message: '是否確認執行驗收確認？',
      accept: () => {
        this.loading = true;

        const details: ASS12050ConfirmDetail[] =
          this.data.map(item => ({
            DETAIL_ID: item.DETAIL_ID!,
            CHECK_QTY: item.CHECK_QTY ?? 0,
            DIS_PRICE: item.DIS_PRICE ?? 0,
            NTAX_AMT: this.calculateDetailNtaxAmount(item),
            NOTES: item.NOTES ?? null,
          }));

        this.ass12050Service
          .confirmASS12050({
            SUBCHECK_ID: subcheckId,
            DETAILS: details,
          })
          .pipe(
            untilDestroyed(this),
            finalize(() => (this.loading = false)),
          )
          .subscribe({
            next: res => {
              if (res.Status !== '0000') {
                this.messageService.errorBubble(
                  '操作失敗：' + (res.Message ?? ''),
                );
                return;
              }

              this.messageService.successBubble('驗收確認成功');

              // 後端會由 Token 寫入驗收人員，SP 寫入驗收日期，
              // 驗收完成後重新查詢即可顯示。
              this.loadDetail(subcheckId);
            },
          });
      },
    });
  }

  /** 審核驗收單 */
  onApprove(): void {
    if (!this.canApprove) {
      this.messageService.warnBubble('目前驗收單狀態不可執行審核');
      return;
    }

    const subcheckId =
      this.subcheckId ??
      this.dataForm.get('SUBCHECK_ID')?.value;

    if (!subcheckId) {
      this.messageService.warnBubble('無可審核的驗收單');
      return;
    }

    this.messageService.confirm({
      header: '驗收單審核',
      message: `是否確認審核驗收單 ${subcheckId}？`,
      accept: () => {
        this.loading = true;

        this.ass12050Service
          .approveASS12050({
            SUBCHECK_ID: subcheckId,
          })
          .pipe(
            untilDestroyed(this),
            finalize(() => (this.loading = false)),
          )
          .subscribe({
            next: res => {
              if (res.Status !== '0000') {
                this.messageService.errorBubble(
                  '審核失敗：' + (res.Message ?? ''),
                );
                return;
              }

              this.messageService.successBubble('審核成功');
              this.onCancel();
            },
          });
      },
    });
  }
  /** 作廢（單據級） */
  onVoid(): void {
    const subcheckId =
      this.subcheckId ??
      this.dataForm.get('SUBCHECK_ID')?.value;

    if (!subcheckId) {
      this.messageService.warnBubble(
        '無可作廢的資料',
      );
      return;
    }

    this.messageService.confirm({
      header: '確認作廢',
      message: '是否確認作廢此驗收單？',
      accept: () => {
        this.loading = true;

        this.ass12050Service
          .voidASS12050({
            DETAIL_ID: subcheckId,
          })
          .pipe(
            untilDestroyed(this),
            finalize(() => (this.loading = false)),
          )
          .subscribe({
            next: res => {
              if (res.Status !== '0000') {
                this.messageService.errorBubble(
                  '操作失敗：' +
                  (res.Message ?? ''),
                );
                return;
              }

              this.messageService.successBubble(
                '作廢成功',
              );
              this.onCancel();
            },
          });
      },
    });
  }

  /** 明細新增一列 */
  onTableInsert(): void {
    const newItem: ASS12050DetailItem = {
      GOODS_ID: null,
      DETAIL_ID: null,
      GOODS_NAME: null,
      GOODS_UNIT: null,
      APPLY_QTY: null,
      SHIP_QTY: null,
      CHECK_QTY: null,
      GOODS_PRICE: 0,
      DIS_PRICE: 0,
      AMT: 0,
      SITE_ID: null,
      WH_ID: null,
      NOTES: null,
    };

    this.data = [...this.data, newItem];
  }

  /**
   * 明細欄位異動。
   *
   * 驗收數量、原單價或調整單價異動時，
   * 即時重新計算每筆明細的總金額。
   */
  onDetailDataChange(rows: ASS12050DetailItem[]): void {
    let hasExceededShipQty = false;
    let hasNegativeCheckQty = false;

    this.data = (rows ?? []).map(item => {
      const shipQty = Number(item.SHIP_QTY ?? 0);
      let checkQty = Number(item.CHECK_QTY ?? 0);

      if (checkQty < 0) {
        checkQty = 0;
        hasNegativeCheckQty = true;
      }

      if (checkQty > shipQty) {
        checkQty = shipQty;
        hasExceededShipQty = true;
      }

      const updatedItem: ASS12050DetailItem = {
        ...item,
        CHECK_QTY: checkQty,
      };

      return {
        ...updatedItem,
        AMT: this.calculateDetailAmount(updatedItem),
      };
    });

    if (hasNegativeCheckQty) {
      this.messageService.warnBubble(
        '驗收數量不可小於 0，已自動調整為 0',
      );
    }

    if (hasExceededShipQty) {
      this.messageService.warnBubble(
        '驗收數量不可大於出貨數量，已自動調整為出貨數量',
      );
    }

    this.calculateHeaderAmounts();
  }

  /**
  * 儲存按鈕統一入口。
  *
  * 尚未建立驗收單：執行新增 INSERT。
  * 已經有 SUBCHECK_ID（包含 TRANSFER 成功後）：執行 UPDATE。
  */
  onUpdate(): void {
    const subcheckId =
      this.subcheckId ??
      this.dataForm.controls.SUBCHECK_ID.value;

    // 還沒有驗收單號，才是真的新增
    if (
      this.crudstatus === CRUDStatus.Create &&
      !subcheckId
    ) {
      this.onSubmit();
      return;
    }

    // 有 SUBCHECK_ID 代表資料已經存在
    // 即使原本是 Create 模式，TRANSFER 成功後也要走 UPDATE
    this.handleSubmit(this.dataForm, () => {
      const valid =
        this.tableEditComponent?.validateAndShowErrors();

      if (valid === false) {
        return;
      }

      if (!this.validateCheckQty()) {
        return;
      }

      if (!this.data || this.data.length === 0) {
        this.messageService.warnBubble(
          '沒有可更新的驗收明細',
        );
        return;
      }

      const missingDetailId = this.data.some(
        item => !item.DETAIL_ID,
      );

      if (missingDetailId) {
        this.messageService.errorBubble(
          '部分驗收明細缺少 DETAIL_ID，無法儲存',
        );
        return;
      }

      this.data = this.data.map(item => ({
        ...item,
        AMT: this.calculateDetailAmount(item),
      }));

      this.calculateHeaderAmounts();

      const updateCalls = this.data.map(item => {
        const body: ASS12050UpdateRequest = {
          DETAIL_ID: item.DETAIL_ID!,
          CHECK_QTY: item.CHECK_QTY ?? null,
          DIS_PRICE: item.DIS_PRICE ?? null,
          AMT: this.calculateDetailAmount(item),
          NOTES: item.NOTES ?? null,
        };

        return this.ass12050Service.updateASS12050(
          body,
        );
      });

      this.loading = true;

      concat(...updateCalls)
        .pipe(
          last(),
          finalize(() => {
            this.loading = false;
          }),
          untilDestroyed(this),
        )
        .subscribe({
          next: res => {
            if (res.Status !== '0000') {
              this.messageService.errorBubble(
                '儲存失敗：' +
                (res.Message ?? ''),
              );
              return;
            }

            this.messageService.successBubble('儲存成功');
this.onCancel();
          },
          error: error => {
            this.messageService.errorBubble(
              error?.error?.Message ??
              error?.error?.message ??
              error?.message ??
              '儲存失敗',
            );
          },
        });
    });
  }

  /**
   * 計算明細總金額。
   *
   * 總金額 = 驗收數量 ×（單價未稅 + 調整單價未稅）
   *
   * 調整單價可輸入正數或負數：
   * 例如原單價 100、調整單價 -10、驗收數量 5，
   * 總金額為 5 × (100 - 10)*1.05 = 472.5=473。
   */
  private calculateDetailAmount(
    item: ASS12050DetailItem,
  ): number {
    const checkQty = Number(item.CHECK_QTY ?? 0);
    const goodsPrice = Number(item.GOODS_PRICE ?? 0);
    const disPrice = Number(item.DIS_PRICE ?? 0);

    return Math.round(
      checkQty * (goodsPrice + disPrice) * 1.05,
    );
  }

  /**
   * 計算單筆明細未稅金額。
   */
  private calculateDetailNtaxAmount(
    item: ASS12050DetailItem,
  ): number {
    const checkQty = Number(item.CHECK_QTY ?? 0);
    const goodsPrice = Number(item.GOODS_PRICE ?? 0);
    const disPrice = Number(item.DIS_PRICE ?? 0);

    return Math.round(
      checkQty * (goodsPrice + disPrice),
    );
  }

  /**
 * 依明細重新計算主檔未稅總金額、稅額及含稅總金額。
 *
 * 整批計稅：
 *   稅額 = ROUND(未稅總額 × 5%)
 *
 * 非整批計稅：
 *   維持原本逐筆計稅方式
 */
  private calculateHeaderAmounts(): void {

    // 未稅總額
    const ntaxAmount = this.data.reduce(
      (total, item) =>
        total + this.calculateDetailNtaxAmount(item),
      0,
    );

    const isAllTax =
      this.dataForm.controls.IsAllTax.value === true;

    let taxAmount = 0;
    let amount = 0;

    if (isAllTax) {

      // 整批計稅：
      // 所有明細未稅金額加總後，再一次計算 5% 稅額
      taxAmount = Math.round(ntaxAmount * 0.05);

      amount = ntaxAmount + taxAmount;

    } else {

      // 非整批計稅：
      // 維持原本每筆各自計算含稅金額，再加總
      amount = this.data.reduce(
        (total, item) =>
          total + this.calculateDetailAmount(item),
        0,
      );

      taxAmount = amount - ntaxAmount;
    }

    this.dataForm.patchValue(
      {
        NTAX_AMT: ntaxAmount,
        TAX_AMT: taxAmount,
        AMT: amount,
      },
      {
        emitEvent: false,
      },
    );
  }

  /**
   * 驗證驗收數量。
   *
   * 1. 驗收數量不可小於 0。
   * 2. 驗收數量不可大於出貨數量。
   */
  private validateCheckQty(): boolean {
    const negativeItem = this.data.find(
      item => Number(item.CHECK_QTY ?? 0) < 0,
    );

    if (negativeItem) {
      this.messageService.warnBubble(
        `驗收數量不可小於 0，品項：${negativeItem.GOODS_ID ??
        negativeItem.GOODS_NAME ??
        ''
        }`,
      );
      return false;
    }

    const exceededItem = this.data.find(item => {
      const checkQty = Number(item.CHECK_QTY ?? 0);
      const shipQty = Number(item.SHIP_QTY ?? 0);

      return checkQty > shipQty;
    });

    if (exceededItem) {
      this.messageService.warnBubble(
        `驗收數量不可大於出貨數量，品項：${exceededItem.GOODS_ID ??
        exceededItem.GOODS_NAME ??
        ''
        }`,
      );
      return false;
    }

    return true;
  }

  /** 新增 */
  onSubmit(): void {
    this.handleSubmit(this.dataForm, () => {
      const valid =
        this.tableEditComponent?.validateAndShowErrors();

      if (valid === false) {
        return;
      }

      if (!this.validateCheckQty()) {
        return;
      }

      const raw = this.dataForm.getRawValue();

      const applyDate =
        raw.APPLY_DATE instanceof Date
          ? `${raw.APPLY_DATE.getFullYear()}-${String(
            raw.APPLY_DATE.getMonth() + 1,
          ).padStart(2, '0')}-${String(
            raw.APPLY_DATE.getDate(),
          ).padStart(2, '0')}`
          : String(raw.APPLY_DATE ?? '');

      this.loading = true;

      if (this.crudstatus === CRUDStatus.Create) {
        const details = this.data;

        if (details.length === 0) {
          this.messageService.warnBubble(
            '請至少新增一筆明細',
          );
          this.loading = false;
          return;
        }

        let subpoenaId = this.sourceSubpoenaId;

        const insertCalls = details.map(
          (row, idx) => {
            const payload: ASS12050InsertRequest = {
              EMP_ID: raw.EMP_ID ?? undefined,
              M_ORG_ID: raw.ORG_ID ?? undefined,
              SUPPLIER_ID:
                raw.SUPPLIER_ID ?? undefined,
              APPLY_DATE: applyDate || undefined,
              SUBPOENA_ID:
                subpoenaId ?? undefined,
              M_NTAX_AMT:
                raw.NTAX_AMT ?? undefined,
              M_TAX_AMT:
                raw.TAX_AMT ?? undefined,
              M_AMT: raw.AMT ?? undefined,
              GOODS_ID: row.GOODS_ID ?? undefined,
              GOODS_UNIT: row.GOODS_UNIT ?? undefined,
              QTY: row.APPLY_QTY ?? undefined,
              SHIP_QTY: row.SHIP_QTY ?? undefined,
              CHECK_QTY: row.CHECK_QTY ?? undefined,
              GOODS_PRICE: row.GOODS_PRICE ?? undefined,
              DIS_PRICE: row.DIS_PRICE ?? undefined,
              SITE_ID: row.SITE_ID ?? undefined,
              WH_ID: row.WH_ID ?? undefined,
              NOTES: row.NOTES ?? undefined,
            };

            return this.ass12050Service
              .insertASS12050(payload)
              .pipe(
                tap(res => {
                  if (
                    res.Status === '0000' &&
                    idx === 0 &&
                    res.Data?.O_SUBPOENA_ID
                  ) {
                    subpoenaId =
                      res.Data.O_SUBPOENA_ID;
                  }
                }),
              );
          },
        );

        concat(...insertCalls)
          .pipe(
            last(),
            finalize(() => (this.loading = false)),
            untilDestroyed(this),
          )
          .subscribe({
            next: res => {
              if (res.Status !== '0000') {
                this.messageService.errorBubble(
                  '操作失敗：' +
                  (res.Message ?? ''),
                );
                return;
              }

              this.messageService.successBubble(
                '新增成功',
              );
              this.onCancel();
            },
          });
      } else {
        this.loading = false;
        this.onUpdate();
      }
    });
  }
}