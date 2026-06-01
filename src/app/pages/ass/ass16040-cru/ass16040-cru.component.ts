import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { finalize } from 'rxjs';
import { PanelModule } from 'primeng/panel';

import { ASS16040Service } from '@service/api/ass/ass16040.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';

import { ASS16040MasterRow } from '../ass16040/ass16040.model';

/** 3.1.6.4 領用審核作業 — 審核頁 */
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
    TableEditComponent,
  ],
})
export class ASS16040CRUComponent extends BasicCruPageComponent<ASS16040MasterRow> implements OnInit {

  // ─── 頭檔表單（全部唯讀：由帶回資料填入，不可手輸）───────────────────────────
  readonly dataForm = this.formBuilder.group({
    MTAPPLY_ID:  new FormControl<string | null>({ value: null, disabled: true }),
    EMP_ID:      new FormControl<string | null>({ value: null, disabled: true }, [Validators.required]),
    ORG_ID:      new FormControl<string | null>({ value: null, disabled: true }, [Validators.required]),
    APPLY_DATE:  new FormControl<Date | null>({ value: null, disabled: true }, [Validators.required]),
    NOTES:       new FormControl<string | null>({ value: null, disabled: true }),
    WH_ID:       new FormControl<string | null>({ value: null, disabled: true }, [Validators.required]),
    DESCRIPTION: new FormControl<string | null>({ value: null, disabled: true }),
  });

  // ─── 明細（唯讀；F-003 改為呼叫 queryASS16040 取明細，此 stub 待 F-003 完整重寫）
  detailData: { FASITEM_ID: number; UNIT?: string; QTY: number; ITEM_REMARK?: string }[] = [];

  readonly detailColumns: EditColumn[] = [
    { field: 'FASITEM_ID',   header: '品項編號', type: 'input',       disabled: () => true },
    { field: 'UNIT',         header: '單位',     type: 'input',       disabled: () => true },
    { field: 'QTY',          header: '數量',     type: 'inputNumber', disabled: () => true },
    { field: 'ITEM_REMARK',  header: '單項說明', type: 'input',       disabled: () => true },
  ];

  // ─── Dropdown options（唯讀用，for 顯示 label）────────────────────────────────
  empIdOptions: { label: string; value: string }[] = [];
  orgIdOptions: { label: string; value: string }[] = [];
  whIdOptions:  { label: string; value: string }[] = [];

  constructor(
    private readonly ass16040Service: ASS16040Service,
    private readonly dropdownApiService: DropdownApiService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS16040', this.dataForm);
    this.loadDropdownOptions();
    this.populateFromRowdata();
  }

  // ─── Load dropdown data for label display ─────────────────────────────────────
  private loadDropdownOptions(): void {
    this.dropdownApiService.queryTblUser()
      .pipe(untilDestroyed(this))
      .subscribe(options => {
        this.empIdOptions = (options ?? []).map(item => ({
          label: item.label,
          value: String(item.value),
        }));
      });

    this.dropdownApiService.querySys3100()
      .pipe(untilDestroyed(this))
      .subscribe(options => {
        this.orgIdOptions = (options ?? []).map(item => ({
          label: item.label,
          value: String(item.value),
        }));
      });

    this.dropdownApiService.queryFaHos()
      .pipe(untilDestroyed(this))
      .subscribe(options => {
        this.whIdOptions = (options ?? []).map(item => ({
          label: item.label,
          value: String(item.value),
        }));
      });
  }

  // ─── Populate form and detail from query rowdata ──────────────────────────────
  private populateFromRowdata(): void {
    if (!this.rowdata) return;

    const row = this.rowdata as ASS16040MasterRow;

    // 頭檔資料填入（全部唯讀）
    this.dataForm.patchValue({
      MTAPPLY_ID:  row.MTAPPLY_ID ?? null,
      EMP_ID:      row.EMP_ID     ?? null,
      ORG_ID:      row.ORG_ID     ?? null,
      APPLY_DATE:  row.APPLY_DATE ? new Date(row.APPLY_DATE) : null,
      WH_ID:       row.WH_ID      ?? null,
    });

    // 明細：F-003 改為呼叫 queryASS16040 取明細（待 F-003 commit 完整實作）
    this.detailData = [];
  }

  // ─── 確認審核 ─────────────────────────────────────────────────────────────────
  onApprove(): void {
    if (!this.canEdit()) {
      this.messageService.warnBubble('您沒有審核權限');
      return;
    }
    if (this.crudstatus !== CRUDStatus.Edit) return;

    const mtapplyId = this.dataForm.getRawValue().MTAPPLY_ID;
    if (!mtapplyId) {
      this.messageService.warnBubble('找不到領用單號');
      return;
    }

    this.loading = true;
    this.ass16040Service
      .approveASS16040({ MTAPPLY_ID: mtapplyId })
      .pipe(
        untilDestroyed(this),
        finalize(() => (this.loading = false)),
      )
      .subscribe({
        next: res => {
          if (res.Status !== '0000') {
            this.messageService.errorBubble(res.Message ?? '審核失敗');
            return;
          }
          this.messageService.successBubble('審核完成');
          this.onCancel();
        },
      });
  }

  // ─── 表單送出（此頁面僅審核，不走 handleSubmit 的 CRUD flow）────────────────
  onSubmit(): void {
    this.onApprove();
  }
}
