import { NgIf } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';

import {
  ASS16030DetailItem,
  ASS16030InsertRequest,
  ASS16030QueryData,
  ASS16030UpdateRequest,
} from '@pages/ass/ass16030/ass16030.model';

import { ASS16030Service } from '@service/api/ass/ass16030.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { Option } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';

import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { TableEditComponent } from '@shared/components/table-edit/table-edit.component';
import { EditColumn } from '@shared/components/table-edit/table-edit.model';

import {
  validateDuplicate,
  validateMaxNumber,
} from '@shared/components/table-edit/validate-field.model';

import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { FileExportService } from '@shared/service/file-export.service';
import { toLocalIsoString } from '@shared/utils/object-utils';

import { PanelModule } from 'primeng/panel';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';

/**
 * 明細列
 *
 * MASTER_NOTES 不在這裡：
 * - MASTER_NOTES = FACONSUMEM.NOTES
 *
 * NOTES：
 * - NOTES = FACONSUMED.NOTES
 */
interface DetailRow {
  FASITEM_ID: number | null;
  UNIT: string | null;
  QTY: number | null;
  GOODS_PRICE: number;
  NOTES: string | null;
}

@UntilDestroy()
@Component({
  selector: 'app-ass16030-cru',
  templateUrl: './ass16030-cru.component.html',
  standalone: true,
  imports: [
    NgIf,
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    TableEditComponent,
    TranslateModule,
    DropdownComponent,
    CalendarComponent,
  ],
})
export class ASS16030CRUComponent
  extends BasicCruPageComponent<ASS16030QueryData>
  implements OnInit
{
  /**
   * 主檔表單
   */
  dataForm = this.formBuilder.group({
    EMP_ID: [
      null as string | null,
      [Validators.required],
    ],

    ORG_ID: [
      null as string | null,
      [Validators.required],
    ],

    APPLY_DATE: [
      null as Date | null,
      [Validators.required],
    ],

    /**
     * 建議需求(日)
     * DB：FACONSUMEM.REQUIRE_DATE
     */
    REQUIRE_DATE: [
      null as number | null,
      [
        Validators.min(0),
        Validators.max(99),
      ],
    ],

    WH_ID: [
      null as string | null,
      [Validators.required],
    ],

    /**
     * 主檔說明
     * DB：FACONSUMEM.NOTES
     */
    MASTER_NOTES: [
      null as string | null,
    ],
  });

  /**
   * 明細資料
   */
  detailData: DetailRow[] = [];

  /**
   * 表格勾選
   */
  selectedRows: DetailRow[] = [];

  /**
   * 進入頁面時的明細快照
   * Cancel 時使用
   */
  private initialDetailSnapshot: DetailRow[] = [];

  /**
   * PDF loading
   */
  printLoading = false;

  /**
   * Dropdown Options
   */
  userOptions: Option[] = [];
  orgOptions: Option[] = [];
  whOptions: Option[] = [];
  fasitemOptions: Option[] = [];
  unitOptions: Option[] = [];

  /**
   * 明細欄位
   *
   * NOTES = 明細說明
   */
  columns: EditColumn[] = [
    {
      field: 'FASITEM_ID',
      header: '品項編號',
      type: 'dropdown',

      options: () => this.fasitemOptions,

      optionLabel: 'label',
      optionValue: 'value',

      validate: [
        validateDuplicate,
      ],

      onChange: (
        value: number,
        rowData: DetailRow,
      ) => {
        const item = this.fasitemOptions.find(
          x => x['value'] === value,
        );

        rowData.UNIT =
          (item?.['UNIT'] as string | undefined) ?? null;
      },
    },

    {
      field: 'UNIT',
      header: '單位',
      type: 'dropdown',

      options: () => this.unitOptions,

      optionLabel: 'label',
      optionValue: 'value',
    },

    {
      field: 'QTY',
      header: '數量',
      type: 'inputNumber',

      validate: [
        validateMaxNumber(99999999),
      ],
    },

    {
      field: 'NOTES',
      header: '單項說明',
      type: 'input',
    },
  ];

  @ViewChild(TableEditComponent)
  tableEditComponent!: TableEditComponent;

  constructor(
    private readonly ass16030Service: ASS16030Service,
    private readonly dropDownListService: DropDownListService,
    private readonly dropdownApiService: DropdownApiService,
    private readonly fileExportService: FileExportService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage(
      'ASS16030',
      this.dataForm,
    );

    this.loadDropdowns();

    /**
     * 新增模式
     */
    if (this.crudstatus === CRUDStatus.Create) {
      this.dataForm.patchValue({
        EMP_ID: this.user?.user_No ?? null,
        APPLY_DATE: new Date(),
      });

      return;
    }

    /**
     * 修改 / 查看模式
     */
    if (
      this.crudstatus === CRUDStatus.Edit ||
      this.crudstatus === CRUDStatus.Read
    ) {
      this.loadDetail(
        this.rowdata!,
      );
    }
  }

  /**
   * 載入下拉選單
   */
  private loadDropdowns(): void {
    /**
     * 申請人
     */
    this.dropDownListService
      .queryTBLUSER_DropDownList()
      .pipe(
        untilDestroyed(this),
      )
      .subscribe(res => {
        this.userOptions = (res?.Data ?? []).map(item => ({
          ...item,
          label: `${item.No} - ${item.Name}`,
          value: item.No,
        }));
      });

    /**
     * 部門
     */
    this.dropDownListService
      .querySYS3100_DropDownList()
      .pipe(
        untilDestroyed(this),
      )
      .subscribe(res => {
        this.orgOptions = (res?.Data ?? []).map(item => ({
          ...item,
          label: `${item.No} - ${item.Name}`,
          value: item.No,
        }));
      });

    /**
     * 倉別
     */
    this.dropDownListService
      .queryFAHOS_DropDownList()
      .pipe(
        untilDestroyed(this),
      )
      .subscribe(res => {
        const list = (res?.Data ?? []) as {
          WH_ID?: string | null;
          WH_NAME?: string | null;
        }[];

        this.whOptions = list.map(item => ({
          ...item,

          No:
            item.WH_ID ?? '',

          Name:
            item.WH_NAME ?? '',

          label:
            `${item.WH_ID ?? ''} - ${item.WH_NAME ?? ''}`,

          value:
            item.WH_ID ?? '',
        }));
      });

    /**
     * 品項
     */
    this.dropdownApiService
      .queryFasItemAss1000Dropdown()
      .pipe(
        untilDestroyed(this),
      )
      .subscribe(res => {
        this.fasitemOptions =
          res ?? [];
      });

    /**
     * 單位
     */
    this.dropdownApiService
      .querySys1000({
        SYS_Type: 'UNIT',
      })
      .pipe(
        untilDestroyed(this),
      )
      .subscribe(items => {
        this.unitOptions =
          (items ?? []).map(item => ({
            value: item.No,
            label: item.Name,
          }));
      });
  }

  /**
   * Edit / Read 載入主檔 + 明細
   */
  private loadDetail(
    rowdata: ASS16030QueryData,
  ): void {
    /**
     * 先使用查詢清單資料預填
     */
    this.dataForm.patchValue({
      EMP_ID:
        rowdata.EMP_ID,

      ORG_ID:
        rowdata.ORG_ID,

      APPLY_DATE:
        rowdata.APPLY_DATE
          ? new Date(rowdata.APPLY_DATE)
          : null,

      REQUIRE_DATE:
        rowdata.REQUIRE_DATE ?? null,

      WH_ID:
        rowdata.WH_ID,

      MASTER_NOTES:
        rowdata.MASTER_NOTES ?? null,
    });

    /**
     * 同時取得：
     *
     * 1. 品項 options
     * 2. 主檔 + 明細
     */
    forkJoin({
      opts:
        this.dropdownApiService
          .queryFasItemAss1000Dropdown(),

      res:
        this.ass16030Service
          .queryASS16030({
            MTAPPLY_ID:
              rowdata.MTAPPLY_ID,
          }),
    })
      .pipe(
        untilDestroyed(this),
      )
      .subscribe({
        next: ({
          opts,
          res,
        }) => {
          const fasitemOpts =
            opts ?? [];

          /**
           * API error
           */
          if (res.Status !== '0000') {
            this.messageService.errorBubble(
              res.Message ??
                '載入單據資料失敗',
            );

            return;
          }

          const rows =
            res.Data ?? [];

          if (rows.length === 0) {
            return;
          }

          /**
           * 第一筆一定帶 Master
           */
          const master =
            rows[0];

          /**
           * 主檔資料
           */
          this.dataForm.patchValue({
            EMP_ID:
              master.EMP_ID ??
              rowdata.EMP_ID,

            ORG_ID:
              master.ORG_ID ??
              rowdata.ORG_ID,

            APPLY_DATE:
              master.APPLY_DATE
                ? new Date(
                    master.APPLY_DATE,
                  )
                : rowdata.APPLY_DATE
                  ? new Date(
                      rowdata.APPLY_DATE,
                    )
                  : null,

            /**
             * 建議需求(日)
             */
            REQUIRE_DATE:
              master.REQUIRE_DATE ??
              rowdata.REQUIRE_DATE ??
              null,

            WH_ID:
              master.WH_ID ??
              rowdata.WH_ID,

            /**
             * 主檔說明
             */
            MASTER_NOTES:
              master.MASTER_NOTES ??
              rowdata.MASTER_NOTES ??
              null,
          });

          /**
           * 只留下真正明細
           */
          const detailRows =
            rows
              .filter(
                r =>
                  r.DETAIL_ID != null,
              )
              .sort(
                (
                  a,
                  b,
                ) =>
                  (
                    a.LINE_NUM ??
                    Number.MAX_SAFE_INTEGER
                  ) -
                  (
                    b.LINE_NUM ??
                    Number.MAX_SAFE_INTEGER
                  ),
              );

          /**
           * API Detail → Table DetailRow
           */
          this.detailData =
            detailRows.map(
              (r): DetailRow => {
                const fasItem =
                  fasitemOpts.find(
                    x =>
                      x['value'] ===
                      r.FASITEM_ID,
                  );

                /**
                 * 後端有 Unit 就優先用。
                 * 沒有才從品項下拉找 UNIT。
                 */
                const fallbackUnit =
                  fasItem?.['UNIT'] as
                    | string
                    | undefined;

                const unitCode:
                  string | null =
                    r.Unit ??
                    fallbackUnit ??
                    null;

                return {
                  FASITEM_ID:
                    r.FASITEM_ID ??
                    null,

                  UNIT:
                    unitCode,

                  QTY:
                    r.QTY ??
                    null,

                  GOODS_PRICE:
                    r.GOODS_PRICE ??
                    0,

                  /**
                   * 明細說明
                   */
                  NOTES:
                    r.NOTES ??
                    null,
                };
              },
            );

          /**
           * Cancel 使用
           */
          this.initialDetailSnapshot =
            this.detailData.map(
              (d: DetailRow) => ({
                ...d,
              }),
            );
        },
      });
  }

  /**
   * 取消修改
   *
   * 明細回復原始狀態
   */
  onCancelReset(): void {
    this.detailData =
      this.initialDetailSnapshot.map(
        (d: DetailRow) => ({
          ...d,
        }),
      );

    this.selectedRows = [];

    this.submitted = false;
  }

  /**
   * Submit
   */
  onSubmit(
    frm: FormGroup,
  ): void {
    this.handleSubmit(
      frm,
      () => {
        /**
         * 驗證 Table
         */
        const tableValid =
          this.tableEditComponent
            ?.validateAndShowErrors() ??
          true;

        if (!tableValid) {
          this.loading = false;
          return;
        }

        /**
         * 至少一筆明細
         */
        if (this.detailData.length === 0) {
          this.messageService.warnBubble(
            '品項明細至少需填寫一筆',
          );

          this.loading = false;
          return;
        }

        const formVal =
          frm.getRawValue();

        /**
         * Table → API DETAILS
         */
        const details:
          ASS16030DetailItem[] =
          this.detailData
            .filter(
              (d: DetailRow) =>
                d.FASITEM_ID != null,
            )
            .map(
              (
                d: DetailRow,
              ): ASS16030DetailItem => ({
                FASITEM_ID:
                  d.FASITEM_ID as number,

                QTY:
                  d.QTY ?? 0,

                GOODS_PRICE:
                  d.GOODS_PRICE ?? 0,

                Unit:
                  d.UNIT ?? null,

                /**
                 * 明細說明
                 */
                NOTES:
                  d.NOTES ?? null,
              }),
            );

        if (details.length === 0) {
          this.messageService.warnBubble(
            '品項明細至少需填寫一筆有效品項',
          );

          this.loading = false;
          return;
        }

        /**
         * =========================
         * INSERT
         * =========================
         */
        if (
          this.isFormCreateable
        ) {
          const payload:
            ASS16030InsertRequest = {
              EMP_ID:
                formVal.EMP_ID ??
                '',

              ORG_ID:
                formVal.ORG_ID ??
                '',

              APPLY_DATE:
                toLocalIsoString(
                  formVal.APPLY_DATE,
                ) ?? '',

              /**
               * 建議需求(日)
               */
              REQUIRE_DATE:
                formVal.REQUIRE_DATE ??
                null,

              WH_ID:
                formVal.WH_ID ??
                '',

              /**
               * 主檔說明
               */
              MASTER_NOTES:
                formVal.MASTER_NOTES ??
                null,

              DETAILS:
                details,
            };

          this.ass16030Service
            .insertASS16030(
              payload,
            )
            .pipe(
              untilDestroyed(this),

              finalize(
                () =>
                  (this.loading = false),
              ),
            )
            .subscribe({
              next: res => {
                if (
                  res.Status === '0000'
                ) {
                  this.messageService
                    .successBubble(
                      '新增成功',
                    );

                  this.onCancel();

                  return;
                }

                this.messageService
                  .errorBubble(
                    '新增失敗：' +
                      (
                        res.Message ??
                        ''
                      ),
                  );
              },
            });

          return;
        }

        /**
         * =========================
         * UPDATE
         * =========================
         */
        if (
          this.isFormEditable
        ) {
          const payload:
            ASS16030UpdateRequest = {
              MTAPPLY_ID:
                this.rowdata
                  ?.MTAPPLY_ID ??
                '',

              EMP_ID:
                formVal.EMP_ID ??
                '',

              ORG_ID:
                formVal.ORG_ID ??
                '',

              APPLY_DATE:
                toLocalIsoString(
                  formVal.APPLY_DATE,
                ) ?? '',

              /**
               * 建議需求(日)
               */
              REQUIRE_DATE:
                formVal.REQUIRE_DATE ??
                null,

              WH_ID:
                formVal.WH_ID ??
                '',

              /**
               * 主檔說明
               */
              MASTER_NOTES:
                formVal.MASTER_NOTES ??
                null,

              DETAILS:
                details,
            };

          this.ass16030Service
            .updateASS16030(
              payload,
            )
            .pipe(
              untilDestroyed(this),

              finalize(
                () =>
                  (this.loading = false),
              ),
            )
            .subscribe({
              next: res => {
                if (
                  res.Status === '0000'
                ) {
                  this.messageService
                    .successBubble(
                      '修改成功',
                    );

                  this.onCancel();

                  return;
                }

                this.messageService
                  .errorBubble(
                    '修改失敗：' +
                      (
                        res.Message ??
                        ''
                      ),
                  );
              },
            });
        }
      },
    );
  }

  /**
   * 列印 PDF
   */
  onPrint(): void {
    const mtapplyId =
      this.rowdata?.MTAPPLY_ID;

    if (!mtapplyId) {
      this.messageService.warnBubble(
        '查無領用單號，無法列印',
      );

      return;
    }

    this.fileExportService
      .executeFileExport(
        this.ass16030Service
          .exportPDFASS16030({
            MTAPPLY_ID:
              mtapplyId,
          }),

        '.pdf',

        loading =>
          (this.printLoading =
            loading),
      )
      .pipe(
        untilDestroyed(this),
      )
      .subscribe();
  }

  /**
   * 刪除明細
   */
  onDeleteDetail(
    rows: DetailRow[],
  ): void {
    this.detailData =
      this.detailData.filter(
        item =>
          !rows.includes(item),
      );

    this.selectedRows = [];
  }
}