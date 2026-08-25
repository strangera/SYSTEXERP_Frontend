import { Component, OnInit, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { finalize, Observable } from 'rxjs';

import { ASS16040Service } from '@service/api/ass/ass16040.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';

import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarRangeComponent } from '@shared/components/calendar-range/calendar-range.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import {
  formatDate,
  ReportColumn,
} from '@shared/components/table-report/table-report.model';

import {
  removeEmptyValues,
  toLocalIsoString,
} from '@shared/utils/object-utils';

import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';

import {
  ASS16040MasterRow,
  ASS16040QueryRequest,
} from './ass16040.model';


/**
 * 「領用申請」狀態
 */
const MTAPPLY_STATUS_APPLIED = '1';


@UntilDestroy()
@Component({
  selector: 'app-ass16040',
  templateUrl: './ass16040.component.html',
  standalone: true,
  imports: [
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MenubarComponent,
    ButtonComponent,
    CalendarRangeComponent,
    CalendarComponent,
    DropdownComponent,
    InputTextComponent,
    TableReportComponent,
  ],
})
export class ASS16040Component
  extends BasicQueryPageComponent<ASS16040MasterRow>
  implements OnInit {
  /**
   * ================================
   * 查詢條件
   * ================================
   */
  readonly queryForm = this.formBuilder.group({
    MTAPPLY_ID:
      new FormControl<string | null>(
        null,
        [Validators.maxLength(15)],
      ),

    EMP_ID:
      new FormControl<string | null>(null),

    /**
     * 品項 ID
     */
    FASITEM_ID:
      new FormControl<number | null>(null),

    /**
     * 申請日期
     */
    APPLY_DATE_S:
      new FormControl<Date | null>(null),

    APPLY_DATE_E:
      new FormControl<Date | null>(null),

    /**
     * 審核日期
     */
    APRV_DATE_S:
      new FormControl<Date | null>(null),

    APRV_DATE_E:
      new FormControl<Date | null>(null),

    ORG_ID:
      new FormControl<string | null>(null),

    /**
     * 發料日期
     */
    CHECK_DATE:
      new FormControl<Date | null>(null),

    APRV_EMP_ID:
      new FormControl<string | null>(null),

    /**
     * 倉別
     */
    WH_ID:
      new FormControl<string | null>(null),

    STATUS:
      new FormControl<string | null>(null),

    PageSize:
      new FormControl<number>(30),

    PageIndex:
      new FormControl<number>(1),
  });


  /**
   * ================================
   * Table
   * ================================
   */
  readonly tableData =
    signal<ASS16040MasterRow[]>([]);

  readonly totalRecords =
    signal<number>(0);

  readonly tableLoading =
    signal<boolean>(false);

  lastQueryBody?: ASS16040QueryRequest;


  /**
   * ================================
   * Lookup map
   * ================================
   */
  private readonly empNameMap =
    new Map<string, string>();

  private readonly orgNameMap =
    new Map<string, string>();

  private readonly statusNameMap =
    new Map<string, string>();

  private readonly whNameMap =
    new Map<string, string>();


  /**
   * ================================
   * Table columns
   * ================================
   */
  readonly columns: ReportColumn[] = [
    {
      field: 'MTAPPLY_ID',
      header: '領用單號',
    },

    {
      field: 'EMP_ID',
      header: '申請人代號',
    },

    {
      field: 'EMP_NAME',
      header: '申請人名稱',
      format: (
        _v,
        _i,
        row: ASS16040MasterRow,
      ) =>
        this.empNameMap.get(
          row?.EMP_ID ?? '',
        ) ?? '',
    },

    {
      field: 'ORG_ID',
      header: '部門代號',
    },

    {
      field: 'ORG_NAME',
      header: '部門名稱',
      format: (
        _v,
        _i,
        row: ASS16040MasterRow,
      ) =>
        this.orgNameMap.get(
          row?.ORG_ID ?? '',
        ) ?? '',
    },

    {
      field: 'APPLY_DATE',
      header: '申請日期',
      format: v =>
        v ? formatDate(v) : '',
    },

    {
      field: 'MTAPPLY_STATUS',
      header: '領用單狀態代碼',
    },

    {
      field: 'MTAPPLY_STATUS_NAME',
      header: '領用單狀態名稱',
      format: (
        _v,
        _i,
        row: ASS16040MasterRow,
      ) =>
        this.statusNameMap.get(
          row?.MTAPPLY_STATUS ?? '',
        ) ?? '',
    },

    {
      field: 'APRV_EMP_ID',
      header: '審核者代號',
    },

    {
      field: 'APRV_EMP_NAME',
      header: '審核者名稱',
      format: (
        _v,
        _i,
        row: ASS16040MasterRow,
      ) =>
        this.empNameMap.get(
          row?.APRV_EMP_ID ?? '',
        ) ?? '',
    },

    {
      field: 'APRV_DATE',
      header: '審核日期',
      format: v =>
        v ? formatDate(v) : '',
    },

    {
      field: 'WH_ID',
      header: '倉別代號',
    },

    {
      field: 'WH_NAME',
      header: '倉別名稱',
      format: (
        _v,
        _i,
        row: ASS16040MasterRow,
      ) =>
        this.whNameMap.get(
          row?.WH_ID ?? '',
        ) ?? '',
    },

    {
      field: 'CHECK_DATE',
      header: '發料日期',
      format: v =>
        v ? formatDate(v) : '',
    },

    {
      field: 'TOTAL_COUNT',
      header: '明細筆數',
      align: 'right',
    },
  ];


  /**
   * ================================
   * Dropdown
   * ================================
   */
  readonly empIdOptions =
    signal<
      {
        label: string;
        value: string;
      }[]
    >([]);

  readonly aprvEmpIdOptions =
    signal<
      {
        label: string;
        value: string;
      }[]
    >([]);

  readonly orgIdOptions =
    signal<
      {
        label: string;
        value: string;
      }[]
    >([]);

  readonly fasItemOptions =
    signal<
      {
        label: string;
        value: number;
      }[]
    >([]);

  readonly whIdOptions =
    signal<
      {
        label: string;
        value: string;
      }[]
    >([]);

  readonly statusOptions =
    signal<
      {
        label: string;
        value: string;
      }[]
    >([]);


  constructor(
    private readonly ass16040Service: ASS16040Service,
    private readonly dropdownApiService: DropdownApiService,
  ) {
    super();
  }


  ngOnInit(): void {
    this.initializePage(
      'ASS16040',
      'ass/ass16040cru',
      this.queryForm,
      this.onSubmit.bind(this),
    );

    this.loadDropdownOptions();
  }


  /**
   * ================================
   * Dropdown options
   * ================================
   */
  private loadDropdownOptions(): void {
    /**
     * 申請人 / 審核者
     */
    this.dropdownApiService
      .queryTblUser()
      .pipe(
        untilDestroyed(this),
      )
      .subscribe(options => {
        const list =
          options ?? [];

        const mapped =
          list.map(item => ({
            label:
              item.label,

            value:
              String(
                item.value ?? '',
              ),
          }));

        this.empIdOptions.set(
          mapped,
        );

        this.aprvEmpIdOptions.set(
          mapped,
        );


        this.empNameMap.clear();

        list.forEach(item => {
          const code =
            String(
              item.value ?? '',
            ).trim();

          const name =
            String(
              item['Name'] ??
              item['label'] ??
              '',
            ).trim();

          if (code) {
            this.empNameMap.set(
              code,
              name || code,
            );
          }
        });
      });


    /**
     * 部門
     */
    this.dropdownApiService
      .querySys3100()
      .pipe(
        untilDestroyed(this),
      )
      .subscribe(options => {
        const list =
          options ?? [];

        this.orgIdOptions.set(
          list.map(item => ({
            label:
              item.label,

            value:
              String(
                item.value ?? '',
              ),
          })),
        );


        this.orgNameMap.clear();

        list.forEach(item => {
          const code =
            String(
              item.value ?? '',
            ).trim();

          const name =
            String(
              item['Name'] ??
              item['label'] ??
              '',
            ).trim();

          if (code) {
            this.orgNameMap.set(
              code,
              name || code,
            );
          }
        });
      });


    /**
     * 品項
     *
     * ★ FASITEM_ID 一定送數字 ID
     */
 /**
 * 品項編號/名稱
 *
 * value = FASITEM.ID
 * label = GOODS_ID - GOODS_NAME
 */
this.dropdownApiService
  .queryFasItemAss1000Dropdown()
  .pipe(
    untilDestroyed(this),
  )
  .subscribe(options => {
    this.fasItemOptions.set(
      (options ?? []).map(item => ({
        label: String(item.label ?? ''),
        value: Number(item.value),
      })),
    );
  });


    /**
     * 倉別
     *
     * ★ WH_ID 一定送 value
     */
    this.dropdownApiService
      .queryFaHos()
      .pipe(
        untilDestroyed(this),
      )
      .subscribe(options => {
        const list =
          options ?? [];

        this.whIdOptions.set(
          list.map(item => ({
            label:
              item.label,

            value:
              String(
                item.value ?? '',
              ),
          })),
        );


        this.whNameMap.clear();

        list.forEach(item => {
          const code =
            String(
              item.value ?? '',
            ).trim();

          const name =
            String(
              item['Name'] ??
              item['WH_NAME'] ??
              item['label'] ??
              '',
            ).trim();

          if (code) {
            this.whNameMap.set(
              code,
              name || code,
            );
          }
        });
      });


    /**
     * 狀態
     */
    this.dropdownApiService
      .querySys1000({
        SYS_Type:
          'MTAPPLY_STATUS',
      })
      .pipe(
        untilDestroyed(this),
      )
      .subscribe(rows => {
        const list =
          rows ?? [];

        this.statusOptions.set(
          list.map(item => ({
            label:
              `${item.No} - ${item.Name}`,

            value:
              item.No,
          })),
        );


        this.statusNameMap.clear();

        list.forEach(item => {
          const code =
            String(
              item.No ?? '',
            ).trim();

          const name =
            String(
              item.Name ?? '',
            ).trim();

          if (code) {
            this.statusNameMap.set(
              code,
              name || code,
            );
          }
        });
      });
  }


  /**
   * ================================
   * 組查詢 Payload
   * ================================
   *
   * 這裡是這次最重要的修改。
   */
  private buildQueryBody(
    extra?: Partial<ASS16040QueryRequest>,
  ): ASS16040QueryRequest {
    const raw =
      this.queryForm.getRawValue();


    const body:
      ASS16040QueryRequest = {

      MTAPPLY_ID:
        raw.MTAPPLY_ID,

      EMP_ID:
        raw.EMP_ID,

      /**
       * ★ 品項 ID
       */
      FASITEM_ID:
        raw.FASITEM_ID,

      /**
       * ★ 申請日期
       */
      APPLY_DATE_S:
        toLocalIsoString(
          raw.APPLY_DATE_S,
        ),

      APPLY_DATE_E:
        toLocalIsoString(
          raw.APPLY_DATE_E,
        ),

      /**
       * ★ 審核日期
       */
      APRV_DATE_S:
        toLocalIsoString(
          raw.APRV_DATE_S,
        ),

      APRV_DATE_E:
        toLocalIsoString(
          raw.APRV_DATE_E,
        ),

      ORG_ID:
        raw.ORG_ID,

      /**
       * ★ 發料日期
       */
      CHECK_DATE:
        toLocalIsoString(
          raw.CHECK_DATE,
        ),

      APRV_EMP_ID:
        raw.APRV_EMP_ID,

      /**
       * ★ 倉別
       */
      WH_ID:
        raw.WH_ID,

      STATUS:
        raw.STATUS,

      PageSize:
        extra?.PageSize ??
        raw.PageSize ??
        30,

      PageIndex:
        extra?.PageIndex ??
        raw.PageIndex ??
        1,

      /**
       * Repository：
       * order == 1 → ASC
       * 其他 → DESC
       */
      SortBy:
        extra?.SortBy ??
        [
          {
            field:
              'APPLY_DATE',

            order:
              -1,
          },
        ],
    };


    /**
     * null / undefined / ''
     * 移除
     */
    return removeEmptyValues(
      body,
    ) as ASS16040QueryRequest;
  }


  /**
   * ================================
   * Table lazy query
   * ================================
   */
  public queryFunction = (
    body:
      ASS16040QueryRequest & {
        pageSize?: number;
        pageIndex?: number;
      },
  ): Observable<
    ApiResponse<
      ASS16040MasterRow[]
    >
  > => {

    const payload =
      this.buildQueryBody({
        /**
         * 同時支援大寫 / 小寫
         */
        PageSize:
          body?.PageSize ??
          body?.pageSize ??
          30,

        PageIndex:
          body?.PageIndex ??
          body?.pageIndex ??
          1,

        SortBy:
          body?.SortBy,
      });


    return this.ass16040Service
      .queryASS16040M(
        payload,
      );
  };


  /**
   * ================================
   * 編輯
   * ================================
   */
  override onEdit(
    row: ASS16040MasterRow,
  ): void {
    const canApprove =
      this.hasPermission('30') &&
      row?.MTAPPLY_STATUS ===
      MTAPPLY_STATUS_APPLIED;


    this.navigateWithState(
      canApprove
        ? CRUDStatus.Edit
        : CRUDStatus.Read,

      row,
    );
  }


  /**
   * ================================
   * 查詢
   * ================================
   */
  onSubmit(
    frm: FormGroup,
  ): void {
    this.handleSubmit(
      frm,
      () => {
        /**
         * 查詢永遠從第一頁
         */
        this.lastQueryBody =
          this.buildQueryBody({
            PageIndex:
              1,
          });


        /**
         * 先看 Network Request，
         * 這五組值應該真的存在。
         */
        console.log(
          'ASS16040 query payload:',
          this.lastQueryBody,
        );


        this.tableLoading.set(
          true,
        );


        this.queryStateService
          .setQueryState(
            this.ProgNo,
            frm.getRawValue(),
          );


        this.ass16040Service
          .queryASS16040M(
            this.lastQueryBody,
          )
          .pipe(
            untilDestroyed(this),

            finalize(
              () => {
                this.tableLoading
                  .set(false);

                this.loading =
                  false;
              },
            ),
          )
          .subscribe({
            next: res => {
              if (
                res.Status !==
                '0000'
              ) {
                this.messageService
                  .errorBubble(
                    '操作失敗：' +
                    (
                      res.Message ??
                      ''
                    ),
                  );

                return;
              }


              this.tableData.set(
                res.Data ?? [],
              );


              this.totalRecords.set(
                res.TotalCount ?? 0,
              );
            },
          });
      },
    );
  }
}