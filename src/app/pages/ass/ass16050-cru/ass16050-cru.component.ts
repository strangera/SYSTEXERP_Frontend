import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ASS16050Service } from '@service/api/ass/ass16050.service';
import { Option } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import {
  formatAmount,
  ReportColumn,
} from '@shared/components/table-report/table-report.model';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import {
  Ass16050DetailRow,
  Ass16050MasterDisplayRow,
} from '../ass16050/ass16050.model';

@UntilDestroy()
@Component({
  selector: 'app-ass16050-cru',
  templateUrl: './ass16050-cru.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MenubarComponent,
    ButtonComponent,
    InputTextComponent,
    DropdownComponent,
    CalendarComponent,
    PanelModule,
    TableReportComponent,
  ],
})
export class ASS16050CRUComponent
  extends BasicCruPageComponent<Ass16050MasterDisplayRow>
  implements OnInit {
  /** 主檔顯示用 form（Read mode 自動 disabled） */
  readonly dataForm = this.formBuilder.group({
    MTAPPLY_ID: new FormControl<string | null>(null),
    ORG_ID: new FormControl<string | null>(null),
    EMP_ID: new FormControl<string | null>(null),
    APPLY_DATE: new FormControl<Date | null>(null),
    CHECK_DATE: new FormControl<Date | null>(null),
    MTAPPLY_STATUS: new FormControl<string | null>(null),
    detailCount: new FormControl<string | null>(null),
  });

  detailColumns: ReportColumn[] = [
    // { field: 'LINE_NUM', header: '序號', align: 'right' },
    { field: 'FASITEM_ID', header: '品項編號' },
    {
      field: 'FASITEM_NAME',
      header: '品項名稱',
      format: (_v, _i, row) =>
        this.getOptionName(String(row?.FASITEM_ID ?? ''), this.fasItemOptions),
    },
    {
      field: 'QTY',
      header: '申請數量',
      align: 'right',
      format: (v) => formatAmount(v),
    },
    {
      field: 'CHECK_QTY',
      header: '已發數量',
      align: 'right',
      format: (v) => (v == null ? '' : formatAmount(v)),
    },
  ];

  detailItems: Ass16050DetailRow[] = [];
  orgOptions: Option[] = [];
  userOptions: Option[] = [];
  statusOptions: Option[] = [];
  fasItemOptions: Option[] = [];
  dispatchLoading = false;
  detailLoading = false;

  /** 領用單狀態為「審核確認 (4)」時才可結案 */
  get canDispatch(): boolean {
    return this.dataForm.controls.MTAPPLY_STATUS.value === '4';
  }

  constructor(
    private readonly ass16050Service: ASS16050Service,
    private readonly dropdownApiService: DropdownApiService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS16050', this.dataForm);
    this.loadDropdowns();

    if (this.rowdata?.MTAPPLY_ID) {
      this.patchMasterForm(this.rowdata);
      this.loadDetail(this.rowdata.MTAPPLY_ID);
    }
  }

  private patchMasterForm(row: Ass16050MasterDisplayRow): void {
    this.dataForm.patchValue({
      MTAPPLY_ID: row.MTAPPLY_ID ?? null,
      ORG_ID: row.ORG_ID ?? null,
      EMP_ID: row.EMP_ID ?? null,
      APPLY_DATE: this.toLocalDate(row.APPLY_DATE),
      CHECK_DATE: this.toLocalDate(row.CHECK_DATE),
      MTAPPLY_STATUS: row.MTAPPLY_STATUS ?? null,
      detailCount: String(row.detailCount ?? 0),
    });
  }

  /** 用 MTAPPLY_ID 呼叫 queryASS16050 取得該單據主檔+明細，並覆寫主檔表單與明細列表 */
  private loadDetail(mtApplyId: string): void {
    this.detailLoading = true;
    this.ass16050Service
      .queryASS16050({ MTAPPLY_ID: mtApplyId, PageSize: 999, PageIndex: 1 })
      .pipe(
        finalize(() => (this.detailLoading = false)),
        untilDestroyed(this),
      )
      .subscribe({
        next: (res) => {
          if (res.Status !== '0000') {
            this.messageService.errorBubble(res.Message || '取得明細失敗');
            return;
          }
          const rows = res.Data ?? [];
          this.detailItems = rows;
          // 取首筆 row 之主檔欄位回寫，確保 STATUS / 日期等與後端一致
          if (rows.length > 0) {
            const head = rows[0];
            this.dataForm.patchValue({
              MTAPPLY_ID: head.MTAPPLY_ID ?? null,
              ORG_ID: head.ORG_ID ?? null,
              EMP_ID: head.EMP_ID ?? null,
              APPLY_DATE: this.toLocalDate(head.APPLY_DATE),
              CHECK_DATE: this.toLocalDate(head.CHECK_DATE),
              MTAPPLY_STATUS: head.MTAPPLY_STATUS ?? null,
              detailCount: String(rows.length),
            });
          }
        },
      });
  }

  /**
   * 安全把後端日期字串解為 Date 物件：
   * - `YYYY-MM-DD`（純日期）→ 解為當地零時，避免被 new Date 視為 UTC 而漂移一天
   * - 其他（含 ISO 帶 T、帶時區）→ 交給 new Date 處理
   */
  private toLocalDate(value: string | null | undefined): Date | null {
    if (!value) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [y, m, d] = value.split('-').map(Number);
      return new Date(y, m - 1, d);
    }
    return new Date(value);
  }

  private loadDropdowns(): void {
    this.dropdownApiService
      .querySys3100()
      .pipe(untilDestroyed(this))
      .subscribe((opts) => {
        this.orgOptions = opts ?? [];
      });

    this.dropdownApiService
      .queryTblUser()
      .pipe(untilDestroyed(this))
      .subscribe((opts) => {
        this.userOptions = opts ?? [];
      });

    this.dropdownApiService
      .querySys1000({ SYS_Type: 'MTAPPLY_STATUS' })
      .pipe(untilDestroyed(this))
      .subscribe((res) => {
        this.statusOptions = (res ?? []).map((item) => ({
          value: item.No,
          label: `${item.No} - ${item.Name}`,
        }));
      });

    this.dropdownApiService
      .queryFasItemDropDownList()
      .pipe(untilDestroyed(this))
      .subscribe((opts) => {
        this.fasItemOptions = opts ?? [];
        // 若明細已先到（race），重新指派陣列 reference 觸發 OnPush table-report 重 render，
        // 使「品項名稱」欄能拿到剛載入的 fasItemOptions
        if (this.detailItems.length > 0) {
          this.detailItems = [...this.detailItems];
        }
      });
  }

  // ─── 結案/發料 ────────────────────────────────────────────────────────
  onDispatch(): void {
    if (!this.rowdata) return;
    if (!this.hasPermission(this.Actions.Edit)) {
      this.messageService.errorBubble('您沒有結案權限');
      return;
    }
    if (!this.canDispatch) {
      this.messageService.warnBubble('僅「審核確認」狀態的單據可結案發料');
      return;
    }

    this.messageService.confirm({
      header: '結案確認',
      message: `確定要對領用單 ${this.rowdata.MTAPPLY_ID} 執行結案/發料嗎？`,
      acceptLabel: '確定',
      rejectLabel: '取消',
      accept: () => this.executeDispatch(),
    });
  }

  private executeDispatch(): void {
    if (!this.rowdata) return;

    this.dispatchLoading = true;
    this.ass16050Service
      .dispatchASS16050({ MTAPPLY_ID: this.rowdata.MTAPPLY_ID })
      .pipe(
        finalize(() => (this.dispatchLoading = false)),
        untilDestroyed(this),
      )
      .subscribe({
        next: (res) => {
          if (res.Status !== '0000') {
            this.messageService.errorBubble(res.Message || '結案失敗');
            return;
          }
          this.messageService.successBubble(res.Message || '結案成功');
          this.onCancel();
        },
      });
  }

  /** 從下拉 options 中取出對應的「名稱」部分（label 格式 `<code> - <name>`） */
  private getOptionName(
    value: string | number | null | undefined,
    options: Option[],
  ): string {
    if (value === null || value === undefined || value === '') return '';
    const opt = options.find((o) => String(o.value) === String(value));
    if (!opt) return '';
    const dashIdx = opt.label.indexOf(' - ');
    return dashIdx >= 0 ? opt.label.substring(dashIdx + 3) : opt.label;
  }
}
