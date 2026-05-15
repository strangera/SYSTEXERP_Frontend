import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ASS16050Service } from '@service/api/ass/ass16050.service';
import { Option } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import {
  formatAmount,
  ReportColumn,
} from '@shared/componentkit/table-report/table-report.model';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import {
  Ass16050GroupedRecord,
  Ass16050ItemRow,
} from '../ass16050/ass16050.model';

@UntilDestroy()
@Component({
  selector: 'app-ass16050-cru',
  templateUrl: './ass16050-cru.component.html',
  styleUrls: ['./ass16050-cru.component.scss'],
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
  extends BasicCruPageComponent<Ass16050GroupedRecord>
  implements OnInit
{
  /** 明細顯示用主檔 Form（全部欄位於 Read mode 自動 disabled） */
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
    { field: 'FASITEM_ID', header: '品項編號' },
    {
      field: 'QTY',
      header: '申請數量',
      align: 'right',
      format: (v) => formatAmount(v),
    },
    {
      // 已發數量（DISPATCH_QTY）待後端補上欄位
      field: 'DISPATCH_QTY',
      header: '已發數量',
      align: 'right',
      format: (v) => (v == null ? '' : formatAmount(v)),
    },
  ];

  detailItems: Ass16050ItemRow[] = [];
  orgOptions: Option[] = [];
  userOptions: Option[] = [];
  statusOptions: Option[] = [];
  dispatchLoading = false;

  constructor(
    private readonly ass16050Service: ASS16050Service,
    private readonly dropdownApiService: DropdownApiService,
  ) {
    super();
  }

  ngOnInit(): void {
    // initializePage 會自動 patchValue(rowdata) + form.disable() (Read mode)
    this.initializePage('ASS16050', this.dataForm);

    if (this.rowdata) {
      this.detailItems = this.rowdata.items ?? [];
      // rowdata 內的日期為 ISO 字串，patchValue 無法直接轉成 Date，需手動轉
      this.dataForm.patchValue({
        APPLY_DATE: this.rowdata.APPLY_DATE
          ? new Date(this.rowdata.APPLY_DATE)
          : null,
        CHECK_DATE: this.rowdata.CHECK_DATE
          ? new Date(this.rowdata.CHECK_DATE)
          : null,
        detailCount: String(this.rowdata.detailCount ?? 0),
      });
    }

    this.loadDropdowns();
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
  }

  // ─── 結案/發料 ────────────────────────────────────────────────────────
  onDispatch(): void {
    if (!this.rowdata) return;
    if (!this.hasPermission(this.Actions.Edit)) {
      this.messageService.errorBubble('您沒有結案權限');
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
}
