import { NgIf } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { PanelModule } from 'primeng/panel';
import { finalize, forkJoin } from 'rxjs';

import { ASS16040Service } from '@service/api/ass/ass16040.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { ReportColumn } from '@shared/components/table-report/table-report.model';

import {
  ASS16040ApproveRequest,
  ASS16040DetailRow,
  ASS16040MasterRow,
  ASS16040QueryRequest,
} from '../ass16040/ass16040.model';

@UntilDestroy()
@Component({
  selector: 'app-ass16040-cru',
  templateUrl: './ass16040-cru.component.html',
  standalone: true,
  imports: [
    NgIf,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    PanelModule,
    MenubarComponent,
    ButtonComponent,
    CalendarComponent,
    DropdownComponent,
    InputTextComponent,
    TableReportComponent,
  ],
})
export class ASS16040CRUComponent
  extends BasicCruPageComponent<ASS16040MasterRow>
  implements OnInit
{
  readonly dataForm = this.formBuilder.group({
    MTAPPLY_ID: new FormControl<string | null>({
      value: null,
      disabled: true,
    }),

    EMP_ID: new FormControl<string | null>({
      value: null,
      disabled: true,
    }),

    ORG_ID: new FormControl<string | null>({
      value: null,
      disabled: true,
    }),

    APPLY_DATE: new FormControl<Date | null>({
      value: null,
      disabled: true,
    }),

    REQUIRE_DATE: new FormControl<number | null>({
      value: null,
      disabled: true,
    }),

    WH_ID: new FormControl<string | null>({
      value: null,
      disabled: true,
    }),

    MASTER_NOTES: new FormControl<string | null>({
      value: null,
      disabled: true,
    }),
  });

  /** 明細資料 */
  detailData: ASS16040DetailRow[] = [];

  /**
   * 後端 SP 直接回：
   * GOODS_ID
   * GOODS_NAME
   * Unit
   * QTY
   * NOTES
   */
readonly detailColumns: ReportColumn[] = [
  { field: 'GOODS_ID', header: '品項編號' },
  { field: 'GOODS_NAME', header: '品項名稱' },
  { field: 'UNIT_NAME', header: '單位' },
  { field: 'QTY', header: '數量', align: 'right' },
  { field: 'NOTES', header: '單項說明' },
];

  /** 主檔下拉選項 */
  readonly empIdOptions =
    signal<{ label: string; value: string }[]>([]);

  readonly orgIdOptions =
    signal<{ label: string; value: string }[]>([]);

  readonly whIdOptions =
    signal<{ label: string; value: string }[]>([]);

  constructor(
    private readonly ass16040Service: ASS16040Service,
    private readonly dropdownApiService: DropdownApiService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS16040', this.dataForm);

    this.loadAll();
  }

  /**
   * 載入：
   * 1. 領用單明細
   * 2. 申請人
   * 3. 部門
   * 4. 倉別
   *
   * 品項資料不再從前端 lookup，
   * 直接使用 SP 回傳的 GOODS_ID / GOODS_NAME / Unit。
   */
  private loadAll(): void {
    const mtapplyId = this.rowdata?.MTAPPLY_ID;

    if (!mtapplyId) {
      return;
    }

    const detailReq: ASS16040QueryRequest = {
      MTAPPLY_ID: mtapplyId,

      // CRU 要取得該張單全部明細
      PageSize: 99999,
      PageIndex: 1,
    };

    this.loading = true;

    forkJoin({
      detail:
        this.ass16040Service.queryASS16040(detailReq),

      tblUser:
        this.dropdownApiService.queryTblUser(),

      sys3100:
        this.dropdownApiService.querySys3100(),

      faHos:
        this.dropdownApiService.queryFaHos(),
    })
      .pipe(
        untilDestroyed(this),
        finalize(() => (this.loading = false)),
      )
      .subscribe({
        next: ({
          detail,
          tblUser,
          sys3100,
          faHos,
        }) => {
          /** 申請人 */
          this.empIdOptions.set(
            (tblUser ?? []).map(item => ({
              label: item.label,
              value: String(item.value ?? ''),
            })),
          );

          /** 部門 */
          this.orgIdOptions.set(
            (sys3100 ?? []).map(item => ({
              label: item.label,
              value: String(item.value ?? ''),
            })),
          );

          /** 倉別 */
          this.whIdOptions.set(
            (faHos ?? []).map(item => ({
              label: item.label,
              value: String(item.value ?? ''),
            })),
          );

          /** API 錯誤 */
          if (detail.Status !== '0000') {
            this.messageService.errorBubble(
              '操作失敗：' + (detail.Message ?? ''),
            );

            return;
          }

          const rows = detail.Data ?? [];

          /**
           * SP 已經直接回：
           * GOODS_ID
           * GOODS_NAME
           * Unit
           *
           * 所以不需要 map / lookup。
           */
          this.detailData = rows;

          /**
           * 主檔欄位會重複出現在每一筆明細，
           * 取第一筆即可。
           */
          const master =
            rows[0] ?? this.rowdata;

          if (master) {
            this.patchMasterForm(master);
          }
        },
        error: err => {
          this.messageService.errorBubble(
            '操作失敗：' +
              (err?.message ?? '查詢資料失敗'),
          );
        },
      });
  }

  /**
   * 主檔資料回填
   */
  private patchMasterForm(
    row: ASS16040MasterRow,
  ): void {
    this.dataForm.patchValue({
      MTAPPLY_ID:
        row.MTAPPLY_ID ?? null,

      EMP_ID:
        row.EMP_ID ?? null,

      ORG_ID:
        row.ORG_ID ?? null,

      APPLY_DATE:
        row.APPLY_DATE
          ? new Date(row.APPLY_DATE)
          : null,

      REQUIRE_DATE:
        row.REQUIRE_DATE ?? null,

      WH_ID:
        row.WH_ID ?? null,

      MASTER_NOTES:
        row.MASTER_NOTES ?? null,
    });
  }

  /**
   * 確認審核
   */
  onApprove(): void {
    if (
      !this.canEdit() ||
      !this.isFormEditable
    ) {
      return;
    }

    const mtapplyId =
      this.dataForm
        .getRawValue()
        .MTAPPLY_ID;

    if (!mtapplyId) {
      this.messageService.warnBubble(
        '找不到領用單號',
      );

      return;
    }

    this.messageService.confirm({
      header: '確認審核',
      message: '是否確認審核此筆領用單？',
      accept: () =>
        this.executeApprove(mtapplyId),
    });
  }

  /**
   * 執行審核
   */
  private executeApprove(
    mtapplyId: string,
  ): void {
    const payload: ASS16040ApproveRequest = {
      MTAPPLY_ID: mtapplyId,
    };

    this.loading = true;

    this.ass16040Service
      .approveASS16040(payload)
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
            '審核成功',
          );

          this.onCancel();
        },
        error: err => {
          this.messageService.errorBubble(
            '操作失敗：' +
              (err?.message ?? '審核失敗'),
          );
        },
      });
  }

  /**
   * 本頁只有審核
   */
  onSubmit(): void {
    this.onApprove();
  }
}