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

/** 3.1.6.4 領用審核作業 — CRU 頁（SPEC §5 / F-003 / F-004） */
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
  /**
   * 主檔表單（全部唯讀 — SPEC §5.2「不可手輸」）。
   * 依 CLAUDE.local.md §1：使用 formBuilder.group()，預設值 null 配聯合型別。
   */
readonly dataForm = this.formBuilder.group({
  MTAPPLY_ID:
    new FormControl<string | null>({
      value: null,
      disabled: true,
    }),

  EMP_ID:
    new FormControl<string | null>({
      value: null,
      disabled: true,
    }),

  ORG_ID:
    new FormControl<string | null>({
      value: null,
      disabled: true,
    }),

  APPLY_DATE:
    new FormControl<Date | null>({
      value: null,
      disabled: true,
    }),

  /**
   * 建議需求(日)
   */
  REQUIRE_DATE:
    new FormControl<number | null>({
      value: null,
      disabled: true,
    }),

  WH_ID:
    new FormControl<string | null>({
      value: null,
      disabled: true,
    }),

  /**
   * 主檔說明
   */
  MASTER_NOTES:
    new FormControl<string | null>({
      value: null,
      disabled: true,
    }),
});

  /** 明細資料（唯讀，由 queryASS16040 取得） */
  detailData: ASS16040DetailRow[] = [];

  /**
   * 明細表格欄位（SPEC §5.3）— 代碼/名稱拆兩欄，UNIT 由 FASITEM lookup。
   * 用唯讀型 app-table-report（無 lazy 分頁）。
   */
  readonly detailColumns: ReportColumn[] = [
    { field: 'GOODS_ID',   header: '品項代號' },
    { field: 'GOODS_NAME', header: '品項名稱' },
    { field: 'UNIT_NAME',  header: '單位' },
    { field: 'QTY',   header: '數量',     align: 'right' },
    { field: 'NOTES', header: '單項說明' },
  ];

  // 主檔下拉選項（代碼/名稱合併顯示，label 格式 `<code> - <name>`）
  readonly empIdOptions = signal<{ label: string; value: string }[]>([]);
  readonly orgIdOptions = signal<{ label: string; value: string }[]>([]);
  readonly whIdOptions = signal<{ label: string; value: string }[]>([]);

  // FASITEM lookup map（SPEC §10.1）
  private readonly fasItemGoodsIdMap = new Map<number, string>();
  private readonly fasItemGoodsNameMap = new Map<number, string>();
  private readonly fasItemUnitMap = new Map<number, string>();

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
   * 同步載入下拉資料 + 主檔/明細，避免明細「品項 / 單位」欄位於 lookup 完成前閃空白。
   * SPEC §10.1 同步策略：forkJoin([detail$, fasItem$])。
   */
  private loadAll(): void {
    const mtapplyId = this.rowdata?.MTAPPLY_ID;
    if (!mtapplyId) return;

    const detailReq: ASS16040QueryRequest = {
      MTAPPLY_ID: mtapplyId,
      PageSize: 0,
      PageIndex: 1,
    };

    this.loading = true;
    forkJoin({
      detail: this.ass16040Service.queryASS16040(detailReq),
      fasItem: this.dropdownApiService.queryFasItemRawList(),
      tblUser: this.dropdownApiService.queryTblUser(),
      sys3100: this.dropdownApiService.querySys3100(),
      faHos: this.dropdownApiService.queryFaHos(),
    })
      .pipe(
        untilDestroyed(this),
        finalize(() => (this.loading = false)),
      )
      .subscribe({
        next: ({ detail, fasItem, tblUser, sys3100, faHos }) => {
          // 建立合併顯示用下拉選項（代碼/名稱合併為 label）
          this.empIdOptions.set(
            (tblUser ?? []).map(item => ({
              label: item.label,
              value: String(item.value ?? ''),
            })),
          );

          this.orgIdOptions.set(
            (sys3100 ?? []).map(item => ({
              label: item.label,
              value: String(item.value ?? ''),
            })),
          );

          this.whIdOptions.set(
            (faHos ?? []).map(item => ({
              label: item.label,
              value: String(item.value ?? ''),
            })),
          );

          // FASITEM lookup（FASITEM_ID → GOODS_ID / GOODS_NAME / UNIT_NAME）
          (fasItem ?? []).forEach(r => {
            if (r?.ID == null) return;
            const id = Number(r.ID);
            this.fasItemGoodsIdMap.set(id, String(r.GOODS_ID ?? ''));
            this.fasItemGoodsNameMap.set(id, String(r.GOODS_NAME ?? ''));
            this.fasItemUnitMap.set(id, String(r.UNIT_NAME ?? ''));
          });

          // 主檔 + 明細
          if (detail.Status !== '0000') {
            this.messageService.errorBubble('操作失敗：' + (detail.Message ?? ''));
            return;
          }
          const rows = detail.Data ?? [];
          // 攤平 FASITEM lookup 到每一列，讓前端排序有真實 key 可比（顯示欄無底層欄位會排不動）
          this.detailData = rows.map(r => ({
            ...r,
            GOODS_ID:   this.fasItemGoodsIdMap.get(r.FASITEM_ID) ?? '',
            GOODS_NAME: this.fasItemGoodsNameMap.get(r.FASITEM_ID) ?? '',
            UNIT_NAME:  this.fasItemUnitMap.get(r.FASITEM_ID) ?? '',
          }));

          // 主檔欄位：以第一筆（後端 join 在每筆明細）取，回填到 rowdata（如有）
          const master = rows[0] ?? this.rowdata;
          if (master) this.patchMasterForm(master);
        },
      });
  }

  /** 將主檔資料填入唯讀表單（SPEC §5.2 全欄位唯讀） */
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

    /**
     * 建議需求(日)
     */
    REQUIRE_DATE:
      row.REQUIRE_DATE ?? null,

    WH_ID:
      row.WH_ID ?? null,

    /**
     * 主檔說明
     */
    MASTER_NOTES:
      row.MASTER_NOTES ?? null,
  });
}
  /**
   * F-004 確認審核：先彈確認對話框 → approveASS16040（只傳 MTAPPLY_ID，
   * APRV_EMP_ID 由後端從 JWT 取）→ 成功訊息 + 返回查詢頁。
   */
  onApprove(): void {
    if (!this.canEdit() || !this.isFormEditable) return;
    const mtapplyId = this.dataForm.getRawValue().MTAPPLY_ID;
    if (!mtapplyId) {
      this.messageService.warnBubble('找不到領用單號');
      return;
    }
    this.messageService.confirm({
      header: '確認審核',
      message: '是否確認審核此筆領用單？',
      accept: () => this.executeApprove(mtapplyId),
    });
  }

  private executeApprove(mtapplyId: string): void {
    const payload: ASS16040ApproveRequest = { MTAPPLY_ID: mtapplyId };
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
            this.messageService.errorBubble('操作失敗：' + (res.Message ?? ''));
            return;
          }
          this.messageService.successBubble('審核成功');
          this.onCancel();
        },
      });
  }

  /** 表單送出（本頁僅審核） */
  onSubmit(): void {
    this.onApprove();
  }
}
