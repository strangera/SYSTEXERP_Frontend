import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import {
  UntilDestroy,
  untilDestroyed,
} from '@ngneat/until-destroy';

import { TranslateModule } from '@ngx-translate/core';

import { SYS0790Service } from '@service/api/sys/sys0790.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { Option } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';

import { FileExportService } from '@shared/service/file-export.service';

import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';

import { finalize, tap } from 'rxjs';

import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';

import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';

import { ButtonComponent } from '../../../shared/components/button/button.component';

import { CalendarRangeComponent } from '../../../shared/components/calendar-range/calendar-range.component';

import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';

import { MultiSelectComponent } from '../../../shared/components/multi-select/multi-select.component';

import { TableReportComponent } from '../../../shared/components/table-report/table-report.component';

import {
  formatDateTime,
  ReportColumn,
} from '../../../shared/components/table-report/table-report.model';

import { createPaginationConfig } from '../../../others/component/table/table.model';

import {
  QuerySYS0790Request,
  SYS0790QueryData,
} from './sys0790.model';


@UntilDestroy()
@Component({
  selector: 'app-sys0790',
  templateUrl: './sys0790.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    AccordionModule,
    ButtonModule,
    MenubarComponent,
    ButtonComponent,
    DropdownComponent,
    MultiSelectComponent,
    CalendarRangeComponent,
    TableReportComponent,
  ],
})
export class SYS0790Component
  extends BasicQueryPageComponent<SYS0790QueryData>
  implements OnInit
{
  // ─────────────────────────────────────────────
  // 查詢表單
  // ─────────────────────────────────────────────

  queryForm = this.formBuilder.group({
    /** 使用者代碼 / 名稱 */
    UserNo: [
      null as string | null,
    ],

    /** LOG時間（起） */
    LogTime_S: [
      null as Date | string | null,
      Validators.required,
    ],

    /** LOG時間（迄） */
    LogTime_E: [
      null as Date | string | null,
      Validators.required,
    ],

    /** 作業代碼 */
    FunctionCodeList: [
      null as string[] | null,
    ],

    /** 分頁 + 預設排序 */
    ...createPaginationConfig([
      {
        field: 'LogTime',
        order: -1,
      },
    ]),
  });


  // ─────────────────────────────────────────────
  // Table
  // ─────────────────────────────────────────────

  data: SYS0790QueryData[] = [];

  /**
   * 保存最後一次 API request。
   *
   * TableReport 往下滾時會依據：
   *
   * data.length
   * pageSize
   *
   * 自動計算 pageIndex = 2、3、4...
   */
  lastQueryBody: QuerySYS0790Request | null = null;

  readonly totalRecords = signal(0);

  columns: ReportColumn[] = [
    {
      field: 'LogTime',
      header: 'LOG時間',
      visible: true,
      format: formatDateTime,
      showSort: true,
    },
    {
      field: 'UserNo',
      header: '使用者代碼',
      visible: true,
      showSort: true,
    },
    {
      field: 'UserName',
      header: '使用者名稱',
      visible: true,
    },
    {
      field: 'FunctionCode',
      header: '作業代碼',
      visible: true,
      showSort: true,
    },
    {
      field: 'FunctionName',
      header: '作業名稱',
      visible: true,
    },
    {
      field: 'ButtonName',
      header: '按鈕名稱',
      visible: true,
    },
    {
      field: 'LinkUrl',
      header: '連結網址',
      visible: true,
    },
  ];


  // ─────────────────────────────────────────────
  // Dropdown
  // ─────────────────────────────────────────────

  readonly userOptions = signal<Option[]>([]);

  readonly functionCodeOptions =
    getSYS1000Options('SYS_ID');


  // ─────────────────────────────────────────────
  // Export Loading
  // ─────────────────────────────────────────────

  btnLoading = false;


  constructor(
    public readonly sys0790Service: SYS0790Service,

    private readonly dropdownApi: DropdownApiService,

    private readonly fileExportService: FileExportService,
  ) {
    super();
  }


  // ─────────────────────────────────────────────
  // 初始化
  // ─────────────────────────────────────────────

  ngOnInit(): void {
    this.initializePage(
      'SYS0790',
      '',
      this.queryForm,
      (form: FormGroup) => this.onSubmit(form),
    );

    this.loadDropdownOptions();
  }


  // ─────────────────────────────────────────────
  // 查詢
  // ─────────────────────────────────────────────
onSubmit(form: FormGroup): void {
  this.handleSubmit(
    form,
    () => {
      const body = this.buildQueryBody(form);

      // 每次重新按查詢，一律從第 1 頁開始
      body.pageIndex = 1;
      body.pageSize = 30;

      this.lastQueryBody = body;

      this.sys0790Service
        .querySYS0790(body)
          .pipe(
            untilDestroyed(this),

            finalize(() => {
              this.loading = false;
            }),
          )
          .subscribe({
            next: res => {
              if (res.Status === '0000') {
                this.data =
                  res.Data ?? [];

                this.totalRecords.set(
                  res.TotalCount ??
                  this.data.length,
                );

                /**
                 * 保存查詢條件。
                 */
                this.queryStateService
                  .setQueryState(
                    this.ProgNo,
                    form.getRawValue(),
                  );

                return;
              }

              this.data = [];

              this.totalRecords.set(0);
            },

            error: () => {
              this.data = [];

              this.totalRecords.set(0);
            },
          });
      },
    );
  }


  // ─────────────────────────────────────────────
  // Table 無限滾動
  // ─────────────────────────────────────────────

  /**
   * TableReport 的 queryFunction。
   *
   * 往下滾時 TableReport 會自己修改：
   *
   * pageIndex = 2
   * pageIndex = 3
   * pageIndex = 4
   * ...
   */
 readonly queryFunction = (
  body: QuerySYS0790Request,
) => {
  const pageIndex = Number(body.pageIndex ?? 1);

  return this.sys0790Service
    .querySYS0790({
      ...body,
      pageIndex,
      pageSize: 30, // 每次固定只取 30 筆
    })
    .pipe(
      tap(res => {
        console.log(
          `SYS0790 LazyLoad：第 ${pageIndex} 頁，每頁 30 筆`
        );
      }),
    );
};

  /**
   * TableReport loadMoreData() 完成後：
   *
   * 原資料 + 新資料
   *
   * 會透過 dataChange emit 回來。
   */
  onDataChange(
    data: SYS0790QueryData[],
  ): void {
    this.data = data;
  }


  // ─────────────────────────────────────────────
  // 清除
  // ─────────────────────────────────────────────

  onClear(): void {
    this.queryForm.reset();

    this.submitted = false;

    this.data = [];

    this.totalRecords.set(0);

    this.lastQueryBody = null;
  }


  // ─────────────────────────────────────────────
  // PDF
  // ─────────────────────────────────────────────

  onExportPDF(): void {
    if (!this.lastQueryBody) {
      return;
    }

    this.fileExportService
      .executeFileExport(
        this.sys0790Service
          .exportSYS0790PDF(
            this.lastQueryBody,
          )
          .pipe(
            untilDestroyed(this),
          ),

        '.pdf',

        loading => {
          this.btnLoading = loading;
        },
      )
      .subscribe();
  }


  // ─────────────────────────────────────────────
  // Excel
  // ─────────────────────────────────────────────

  onExportExcel(): void {
    if (!this.lastQueryBody) {
      return;
    }

    this.fileExportService
      .executeFileExport(
        this.sys0790Service
          .exportExcelSYS0790(
            this.lastQueryBody,
          )
          .pipe(
            untilDestroyed(this),
          ),

        '.xlsx',

        loading => {
          this.btnLoading = loading;
        },
      )
      .subscribe();
  }


  // ─────────────────────────────────────────────
  // Query Request
  // ─────────────────────────────────────────────

  private buildQueryBody(
    form: FormGroup,
  ): QuerySYS0790Request {
    const raw =
      form.getRawValue();

    return {
      ...raw,

      LogTime_S:
        this.toIsoDateTime(
          raw.LogTime_S,
          'start',
        ),

      LogTime_E:
        this.toIsoDateTime(
          raw.LogTime_E,
          'end',
        ),
    } as QuerySYS0790Request;
  }


  // ─────────────────────────────────────────────
  // 日期
  // ─────────────────────────────────────────────

  private toIsoDateTime(
    value:
      | Date
      | string
      | null
      | undefined,

    bound:
      | 'start'
      | 'end',
  ): string | undefined {

    if (!value) {
      return undefined;
    }

    const d =
      value instanceof Date
        ? value
        : new Date(value);

    if (
      Number.isNaN(
        d.getTime(),
      )
    ) {
      return undefined;
    }

    const year =
      d.getFullYear();

    const month =
      String(
        d.getMonth() + 1,
      ).padStart(
        2,
        '0',
      );

    const day =
      String(
        d.getDate(),
      ).padStart(
        2,
        '0',
      );

    const hour =
      String(
        d.getHours(),
      ).padStart(
        2,
        '0',
      );

    const minute =
      String(
        d.getMinutes(),
      ).padStart(
        2,
        '0',
      );

    const second =
      String(
        d.getSeconds(),
      ).padStart(
        2,
        '0',
      );


    /**
     * 迄日如果時間為 00:00:00，
     * 自動改成 23:59:59。
     */
    if (
      bound === 'end' &&
      hour === '00' &&
      minute === '00' &&
      second === '00'
    ) {
      return (
        `${year}-${month}-${day}` +
        `T23:59:59`
      );
    }

    return (
      `${year}-${month}-${day}` +
      `T${hour}:${minute}:${second}`
    );
  }


  // ─────────────────────────────────────────────
  // Dropdown
  // ─────────────────────────────────────────────

  private loadDropdownOptions(): void {
    this.dropdownApi
      .queryTblUser()
      .pipe(
        untilDestroyed(this),
      )
      .subscribe({
        next: options => {
          this.userOptions.set(
            options ?? [],
          );
        },
      });
  }
}