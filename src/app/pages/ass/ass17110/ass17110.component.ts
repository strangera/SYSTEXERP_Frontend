import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ASS17110Service } from '@service/api/ass/ass17110.service';
import { Option } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { FileExportService } from '@shared/service/file-export.service';
import { removeEmptyValues } from '@shared/utils/object-utils';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs/operators';
import {
  PrintASS17110Request,
  QueryASS17110Request,
  QueryASS17110Response,
} from './ass17110.model';

/**
 * ASS17110 耗材進耗存之會計科目報表
 *
 * 規格來源：
 *   - 主規格書 3159「耗材進耗存之會計科目報表」
 *   - SA 規格書 gid=1396854590 (ASS17110)
 *
 * 查詢條件（依規格）：
 *   1. 統計年月 (必填，文字方塊；前端用 dateMonthOne 選擇後轉 yyyyMM)
 *   2. 品項編號 (非必填，下拉 queryFASITEM_DropDownList MATERIAL_TYPE='3')
 *   3. 會計科目代碼 (非必填，下拉 queryFASAccNoDropDownList → 對應 /queryGLS1005_AccNo_DropDownList)
 *
 * 功能：查詢 + 匯出 PDF / Excel (依現有 ASS17 系列慣例)。
 */
@UntilDestroy()
@Component({
  selector: 'app-ass17110',
  templateUrl: './ass17110.component.html',
  styleUrl: './ass17110.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarComponent,
    DropdownComponent,
    ButtonComponent,
    TableReportComponent,
    TranslateModule,
    ButtonModule,
  ],
})
export class ASS17110Component
  extends BasicQueryPageComponent<QueryASS17110Response>
  implements OnInit
{
  readonly queryForm = this.formBuilder.group({
    DATE_YM: [null as Date | string | null, Validators.required],
    GOODS_ID: [null as string | null],
    ACC_NO: [null as string | null],
  });

  data: QueryASS17110Response[] = [];
  totalRecords = 0;
  exportPdfLoading = false;

  goodsIdOptions: Option[] = [];
  accNoOptions: Option[] = [];

  /**
   * 表格欄位 — 對齊 swagger queryASS17110 Data[]（期初/進貨/領用/退料/盤點/調撥/報廢/期末，數量＋成本成對）。
   * 代碼與名稱拆獨立欄位（會計科目、領用單位、領用會計科目）。
   */
  readonly columns: ReportColumn[] = [
    { field: 'ACC_NO', header: '會計科目代碼', visible: true },
    { field: 'ACC_NAME', header: '會計科目名稱', visible: true },
    { field: 'GOODS_ID', header: '品項編號', visible: true },
    { field: 'GOODS_NAME', header: '品項名稱', visible: true },
    { field: 'OPEN_QTY', header: '期初庫存\n數量', visible: true, align: 'right' },
    { field: 'OPEN_COST', header: '期初庫存\n成本', visible: true, align: 'right' },
    { field: 'IN_QTY', header: '本期進貨\n數量', visible: true, align: 'right' },
    { field: 'IN_COST', header: '本期進貨\n成本', visible: true, align: 'right' },
    { field: 'ISSUE_QTY', header: '本期領用\n數量', visible: true, align: 'right' },
    { field: 'ISSUE_COST', header: '本期領用\n成本', visible: true, align: 'right' },
    { field: 'ISSUE_ORG_ID', header: '領用單位\n代碼', visible: true },
    { field: 'ISSUE_ORGNAME', header: '領用單位\n名稱', visible: true },
    { field: 'ISSUE_ACC_NO', header: '領用會計科目\n代碼', visible: true },
    { field: 'ISSUE_ACC_NAME', header: '領用會計科目\n名稱', visible: true },
    { field: 'RETURN_QTY', header: '本期退料\n數量', visible: true, align: 'right' },
    { field: 'RETURN_COST', header: '本期退料\n成本', visible: true, align: 'right' },
    { field: 'ADJUST_QTY', header: '盤點調整\n數量', visible: true, align: 'right' },
    { field: 'ADJUST_COST', header: '盤點調整\n成本', visible: true, align: 'right' },
    { field: 'TRANSFER_QTY', header: '本期調撥\n數量', visible: true, align: 'right' },
    { field: 'TRANSFER_COST', header: '本期調撥\n成本', visible: true, align: 'right' },
    { field: 'DAMAGE_QTY', header: '本期報廢\n數量', visible: true, align: 'right' },
    { field: 'DAMAGE_COST', header: '本期報廢\n成本', visible: true, align: 'right' },
    { field: 'CLOSE_QTY', header: '期末庫存\n數量', visible: true, align: 'right' },
    { field: 'CLOSE_COST', header: '期末庫存\n成本', visible: true, align: 'right' },
  ];

  constructor(
    private readonly service: ASS17110Service,
    private readonly dropdownApi: DropdownApiService,
    private readonly fileExportService: FileExportService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS17110', '', this.queryForm, frm => this.onSubmit(frm));
    this.loadDropdowns();
  }

  private loadDropdowns(): void {
    // 品項編號（只顯示品項編號跟名稱，MATERIAL_TYPE=3）
    this.dropdownApi
      .queryFasItemDropdown({ MATERIAL_TYPE: '3' })
      .pipe(untilDestroyed(this))
      .subscribe(opts => (this.goodsIdOptions = opts ?? []));

    // 會計科目代碼（資材攤提會計科目下拉）
    this.dropdownApi
      .queryFasAccNoDropdown()
      .pipe(untilDestroyed(this))
      .subscribe(opts => (this.accNoOptions = opts ?? []));
  }

  /** 將 Date / 'yyyy/MM' / 'yyyyMM' 統一轉成 yyyyMM 字串；無效回 null。 */
  private toYYYYMM(value: Date | string | null | undefined): string | null {
    if (!value) return null;
    if (value instanceof Date) {
      if (Number.isNaN(value.getTime())) return null;
      const y = value.getFullYear().toString();
      const m = (value.getMonth() + 1).toString().padStart(2, '0');
      return `${y}${m}`;
    }
    const normalized = String(value).trim().replaceAll('/', '').replaceAll('-', '');
    return /^\d{6}$/.test(normalized) ? normalized : null;
  }

  private buildQueryBody(): QueryASS17110Request | null {
    const raw = this.queryForm.getRawValue();
    const dateYm = this.toYYYYMM(raw.DATE_YM);
    if (!dateYm) {
      this.messageService.warnBubble('請選擇統計年月（yyyyMM）');
      return null;
    }
    return {
      DATE_YM: dateYm,
      GOODS_ID: raw.GOODS_ID?.trim() ? raw.GOODS_ID : null,
      ACC_NO: raw.ACC_NO?.trim() ? raw.ACC_NO : null,
    };
  }

  private buildExportBody(): PrintASS17110Request | null {
    const body = this.buildQueryBody();
    if (!body) return null;
    return {
      DATE_YM: body.DATE_YM,
      GOODS_ID: body.GOODS_ID ?? null,
      ACC_NO: body.ACC_NO ?? null,
    };
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const queryBody = this.buildQueryBody();
      if (!queryBody) {
        this.data = [];
        this.totalRecords = 0;
        return;
      }
      const body = removeEmptyValues(queryBody) as QueryASS17110Request;

      this.loading = true;
      this.service
        .queryASS17110(body)
        .pipe(
          finalize(() => (this.loading = false)),
          untilDestroyed(this),
        )
        .subscribe((res: ApiResponse<QueryASS17110Response[]>) => {
          if (res?.Status === '0000') {
            this.data = res.Data ?? [];
            this.totalRecords = res.TotalCount ?? this.data.length;
            this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
          } else {
            this.data = [];
            this.totalRecords = 0;
            this.messageService.errorBubble('操作失敗：' + (res?.Message ?? ''));
          }
        });
    });
  }

  onExportPdf(): void {
    const body = this.buildExportBody();
    if (!body) return;
    if ((this.data?.length ?? 0) === 0) {
      this.messageService.warnBubble('目前無資料可供下載。');
      return;
    }
    const export$ = this.service.exportPDFASS17110(body);
    this.fileExportService
      .executeFileExport(
        export$.pipe(untilDestroyed(this)),
        '.pdf',
        v => (this.exportPdfLoading = v),
      )
      .subscribe();
  }
}
