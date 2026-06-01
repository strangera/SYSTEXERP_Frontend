import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { PanelModule } from 'primeng/panel';
import { finalize, forkJoin } from 'rxjs';

import { ASS16040Service } from '@service/api/ass/ass16040.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';

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
  styleUrl: './ass16040-cru.component.scss',
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
    MTAPPLY_ID:     new FormControl<string | null>({ value: null, disabled: true }),
    EMP_ID:         new FormControl<string | null>({ value: null, disabled: true }),
    ORG_ID:         new FormControl<string | null>({ value: null, disabled: true }),
    APPLY_DATE:     new FormControl<Date | null>({ value: null, disabled: true }),
    SUGGEST_DAYS:   new FormControl<number | null>({ value: null, disabled: true }),
    WH_ID:          new FormControl<string | null>({ value: null, disabled: true }),
    NOTES:          new FormControl<string | null>({ value: null, disabled: true }),
    APRV_EMP_ID:    new FormControl<string | null>({ value: null, disabled: true }),
    APRV_DATE:      new FormControl<Date | null>({ value: null, disabled: true }),
    MTAPPLY_STATUS: new FormControl<string | null>({ value: null, disabled: true }),
  });

  /** 明細資料（唯讀，由 queryASS16040 取得） */
  detailData: ASS16040DetailRow[] = [];

  /**
   * 明細表格欄位（SPEC §5.3）— 代碼/名稱拆兩欄，UNIT 由 FASITEM lookup。
   * 用唯讀型 app-table-report（無 lazy 分頁）。
   */
  readonly detailColumns: ReportColumn[] = [
    {
      field: 'GOODS_ID',
      header: '品項代號',
      format: (_v, _i, row: ASS16040DetailRow) =>
        this.fasItemGoodsIdMap.get(row?.FASITEM_ID) ?? '',
    },
    {
      field: 'GOODS_NAME',
      header: '品項名稱',
      format: (_v, _i, row: ASS16040DetailRow) =>
        this.fasItemGoodsNameMap.get(row?.FASITEM_ID) ?? '',
    },
    {
      field: 'UNIT_NAME',
      header: '單位',
      format: (_v, _i, row: ASS16040DetailRow) =>
        this.fasItemUnitMap.get(row?.FASITEM_ID) ?? '',
    },
    { field: 'QTY',   header: '數量',     align: 'right' },
    { field: 'NOTES', header: '單項說明' },
  ];

  // 主檔的代碼 → 名稱 map（顯示用）
  empNameMap = new Map<string, string>();
  orgNameMap = new Map<string, string>();
  whNameMap = new Map<string, string>();
  statusNameMap = new Map<string, string>();

  // FASITEM lookup map（SPEC §10.1）
  private fasItemGoodsIdMap = new Map<number, string>();
  private fasItemGoodsNameMap = new Map<number, string>();
  private fasItemUnitMap = new Map<number, string>();

  /** 用於唯讀顯示主檔的名稱欄位（HTML 透過 getter 取） */
  get empName(): string {
    const id = this.dataForm.getRawValue().EMP_ID ?? '';
    return id ? this.empNameMap.get(id) ?? '' : '';
  }
  get orgName(): string {
    const id = this.dataForm.getRawValue().ORG_ID ?? '';
    return id ? this.orgNameMap.get(id) ?? '' : '';
  }
  get whName(): string {
    const id = this.dataForm.getRawValue().WH_ID ?? '';
    return id ? this.whNameMap.get(id) ?? '' : '';
  }
  get aprvEmpName(): string {
    const id = this.dataForm.getRawValue().APRV_EMP_ID ?? '';
    return id ? this.empNameMap.get(id) ?? '' : '';
  }
  get statusName(): string {
    const code = this.dataForm.getRawValue().MTAPPLY_STATUS ?? '';
    return code ? this.statusNameMap.get(code) ?? '' : '';
  }

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
    const mtapplyId = (this.rowdata as ASS16040MasterRow | null)?.MTAPPLY_ID;
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
      sys1000Status: this.dropdownApiService.querySys1000({ SYS_Type: 'MTAPPLY_STATUS' }),
    })
      .pipe(
        untilDestroyed(this),
        finalize(() => (this.loading = false)),
      )
      .subscribe({
        next: ({ detail, fasItem, tblUser, sys3100, faHos, sys1000Status }) => {
          // 建立顯示用 lookup map
          (tblUser ?? []).forEach(item => {
            const code = String(item.value ?? '').trim();
            const name = String(item['Name'] ?? item['label'] ?? '').trim();
            if (code) this.empNameMap.set(code, name || code);
          });
          (sys3100 ?? []).forEach(item => {
            const code = String(item.value ?? '').trim();
            const name = String(item['Name'] ?? item['label'] ?? '').trim();
            if (code) this.orgNameMap.set(code, name || code);
          });
          (faHos ?? []).forEach(item => {
            const code = String(item.value ?? '').trim();
            const name = String(item['Name'] ?? item['WH_NAME'] ?? item['label'] ?? '').trim();
            if (code) this.whNameMap.set(code, name || code);
          });
          (sys1000Status ?? []).forEach(item => {
            const code = String(item.No ?? '').trim();
            const name = String(item.Name ?? '').trim();
            if (code) this.statusNameMap.set(code, name || code);
          });

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
          this.detailData = rows;

          // 主檔欄位：以第一筆（後端 join 在每筆明細）取，回填到 rowdata（如有）
          const master = rows[0] ?? (this.rowdata as ASS16040MasterRow | null);
          if (master) this.patchMasterForm(master);
        },
      });
  }

  /** 將主檔資料填入唯讀表單（SPEC §5.2 全欄位唯讀） */
  private patchMasterForm(row: ASS16040MasterRow): void {
    this.dataForm.patchValue({
      MTAPPLY_ID:     row.MTAPPLY_ID ?? null,
      EMP_ID:         row.EMP_ID ?? null,
      ORG_ID:         row.ORG_ID ?? null,
      APPLY_DATE:     row.APPLY_DATE ? new Date(row.APPLY_DATE) : null,
      SUGGEST_DAYS:   row.SUGGEST_DAYS ?? null,
      WH_ID:          row.WH_ID ?? null,
      NOTES:          row.NOTES ?? null,
      APRV_EMP_ID:    row.APRV_EMP_ID ?? null,
      APRV_DATE:      row.APRV_DATE ? new Date(row.APRV_DATE) : null,
      MTAPPLY_STATUS: row.MTAPPLY_STATUS ?? null,
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
