import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { FIN72050Service } from '@service/api/fin/fin72050.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { Option } from '@service/utility/dropdown-api.model';
import {
  CloseFIN72050Request,
  FIN72050Detail,
  FIN72050_DENOMINATIONS,
  FIN72050_PCC_TYPE_OPTIONS,
  GetPCCNoFIN72050Request,
  InsertFIN72050Request,
  QueryFIN72050DetailRequest,
  UpdateFIN72050Request,
  VoidFIN72050Request,
  getFIN72050StatusName,
} from '@shared/models/fin/fin72050.model';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

@UntilDestroy()
@Component({
  selector: 'app-fin72050-cru',
  templateUrl: './fin72050-cru.component.html',
  styleUrl: './fin72050-cru.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    PanelModule,
    MenubarComponent,
    ButtonComponent,
    InputTextComponent,
    InputNumberComponent,
    DropdownComponent,
    CalendarComponent,
    RadiobuttonComponent,
  ],
})
export class FIN72050CRUComponent
  extends BasicCruPageComponent<FIN72050Detail>
  implements OnInit
{
  // ── 常數（給 template 使用） ─────────────────────────
  readonly denominations = FIN72050_DENOMINATIONS;
  readonly pccTypeOptions = FIN72050_PCC_TYPE_OPTIONS;

  // ── 表單 ─────────────────────────────────────────────
  dataForm = this.formBuilder.group({
    // 主檔
    id: [null as number | null],
    PCS_PST_No: [null as string | null],        // 盤點單號（自動取號）
    Keep_UsrNo: [null as string | null, Validators.required],
    Keep_UsrName: [null as string | null],
    Keep_OrgID: [null as string | null],
    PCC_Date: [null as Date | string | null, Validators.required],

    Keep_QuotaAmt: [null as number | null],     // 額度（取號取得）
    PCC_NOPAY_AMT: [null as number | null],     // 已支付未請款
    PCC_NOREC_AMT: [null as number | null],     // 已請款未撥補
    PCC_DIFF_AMT: [null as number | null],      // 零用金餘額（應有現金）= 額度 − 已支付未請款 − 已請款未撥補

    PCC_Status: [null as string | null],
    PCC_Status_Name: [null as string | null],

    PCC_Type: ['1' as string, Validators.required],   // 預設總額

    // 總額模式
    PCC_CountAmt: [null as number | null],

    // 點鈔模式（9 個面額）
    PCC_ActAmt_1: [0 as number | null],
    PCC_ActAmt_5: [0 as number | null],
    PCC_ActAmt_10: [0 as number | null],
    PCC_ActAmt_50: [0 as number | null],
    PCC_ActAmt_100: [0 as number | null],
    PCC_ActAmt_200: [0 as number | null],
    PCC_ActAmt_500: [0 as number | null],
    PCC_ActAmt_1000: [0 as number | null],
    PCC_ActAmt_2000: [0 as number | null],

    // 前端計算欄位（不送出）
    ActTotalAmt: [0 as number | null],          // 點鈔模式即時加總
    DiffAmt: [0 as number | null],              // 實際金額 − 應有餘額（前端參考）

    // 說明
    PCS_Remark: [null as string | null, Validators.maxLength(100)],
  });

  // ── 下拉資料 ────────────────────────────────────────
  keepUser_Options: Option[] = [];

  // ── 旗標 ─────────────────────────────────────────────
  /** 是否已透過取號取得四項金額（新增頁面用） */
  hasPccNo = false;
  /** 取號中 */
  isFetchingPccNo = false;
  /** 主動操作（結案 / 作廢）loading */
  closeLoading = false;
  voidLoading = false;

  constructor(
    private readonly fin72050Service: FIN72050Service,
    private readonly dropdownApi: DropdownApiService,
  ) {
    super();
  }

  // ────────────────────────────────────────────────────
  // 生命週期
  // ────────────────────────────────────────────────────
  ngOnInit(): void {
    this.initializePage('FIN72050', this.dataForm, { useReadonly: true });
    this.loadDropdownOptions();
    this.setupValueChangeListeners();

    // 編輯 / 檢視：從 router state 取得 rowdata 中的 PCS_PST_No 後撈詳細
    if (this.crudstatus !== CRUDStatus.Create && this.rowdata?.PCS_PST_No) {
      this.fetchDetail(this.rowdata.PCS_PST_No);
    } else {
      // 新增預設：盤點日期帶今天
      this.dataForm.patchValue({ PCC_Date: new Date() });
      // 預設「總額」→ 9 個面額欄位 disable
      this.applyPccTypeDisable('1');
    }
  }

  // ────────────────────────────────────────────────────
  // 表單模式判斷（給 template）
  // ────────────────────────────────────────────────────
  /** 業務上是否可編輯：只有 PCC_Status='1' 才能改 */
  get isEditableByStatus(): boolean {
    const status = this.dataForm.controls.PCC_Status.value;
    return !status || status === '1';
  }

  /** 表單是否實際可寫（綜合 crudstatus + 狀態 + 權限） */
  get canWriteForm(): boolean {
    if (this.crudstatus === CRUDStatus.Create) return this.canAdd();
    if (this.crudstatus === CRUDStatus.Edit) return this.canEdit() && this.isEditableByStatus;
    return false; // Read mode
  }

  get isTotalMode(): boolean {
    return this.dataForm.controls.PCC_Type.value === '1';
  }
  get isCountMode(): boolean {
    return this.dataForm.controls.PCC_Type.value === '2';
  }

  /** 結案 / 作廢按鈕僅在 Edit 模式 + 狀態為「盤點中」+ 有對應權限時顯示 */
  get showCloseVoidButtons(): boolean {
    return this.crudstatus === CRUDStatus.Edit && this.dataForm.controls.PCC_Status.value === '1';
  }

  // ────────────────────────────────────────────────────
  // 下拉
  // ────────────────────────────────────────────────────
  private loadDropdownOptions(): void {
    this.dropdownApi.queryTblUserOrgid()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (options) => {
          this.keepUser_Options = options ?? [];
        },
      });
  }

  // ────────────────────────────────────────────────────
  // 表單監聽
  // ────────────────────────────────────────────────────
  private setupValueChangeListeners(): void {
    // 保管人 + 盤點日期 變更 → 新增模式下自動取號
    this.dataForm.controls.Keep_UsrNo.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe((usrNo) => {
        const opt = this.keepUser_Options.find((o) => o.value === usrNo);
        if (opt) {
          this.dataForm.patchValue(
            {
              Keep_UsrName: opt['user_Name'] ?? '',
              Keep_OrgID: opt['Org_ID'] ?? '',
            },
            { emitEvent: false }
          );
        }
        if (this.crudstatus === CRUDStatus.Create) {
          this.tryFetchPccNo();
        }
      });

    this.dataForm.controls.PCC_Date.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        if (this.crudstatus === CRUDStatus.Create) {
          this.tryFetchPccNo();
        }
      });

    // PCC_Type 變更：reset 另一邊欄位 + disable/enable
    this.dataForm.controls.PCC_Type.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe((type) => {
        this.applyPccTypeDisable(type);
      });

    // 面額變更 → 即時加總
    this.denominations.forEach((d) => {
      const ctrl = this.dataForm.get(d.controlName);
      ctrl?.valueChanges.pipe(untilDestroyed(this)).subscribe(() => this.recalcCountModeTotal());
    });

    // 總額模式金額變更 → 重算差異
    this.dataForm.controls.PCC_CountAmt.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(() => this.recalcDiff());
  }

  // ────────────────────────────────────────────────────
  // 自動取號（新增第一階段）
  // ────────────────────────────────────────────────────
  private tryFetchPccNo(): void {
    const usrNo = this.dataForm.controls.Keep_UsrNo.value;
    const dateVal = this.dataForm.controls.PCC_Date.value;
    if (!usrNo || !dateVal) return;

    const req: GetPCCNoFIN72050Request = {
      DateNow: this.toIsoDate(dateVal) ?? '',
      Keep_UsrNo: usrNo,
    };

    this.isFetchingPccNo = true;
    this.fin72050Service.getPCCNoFIN72050(req)
      .pipe(untilDestroyed(this), finalize(() => (this.isFetchingPccNo = false)))
      .subscribe({
        next: (res) => {
          if (res.Status !== '0000') {
            this.messageService.errorBubble(res.Message || '取號失敗');
            return;
          }
          const d = res.Data;
          // Q-005 兩鍵備援
          const pccNo = d.PCS_PST_No ?? d.PCC_SerialNo ?? '';
          this.dataForm.patchValue({
            PCS_PST_No: pccNo,
            Keep_QuotaAmt: d.Keep_QuotaAmt ?? 0,
            PCC_NOPAY_AMT: d.PCC_NOPAY_AMT ?? 0,
            PCC_NOREC_AMT: d.PCC_NOREC_AMT ?? 0,
            PCC_DIFF_AMT: d.PCC_DIFF_AMT ?? 0,
            PCC_Status: '1',
            PCC_Status_Name: getFIN72050StatusName('1'),
          });
          this.hasPccNo = true;
          this.recalcDiff();
        },
      });
  }

  // ────────────────────────────────────────────────────
  // 編輯 / 檢視：撈詳細
  // ────────────────────────────────────────────────────
  private fetchDetail(pccNo: string): void {
    const req: QueryFIN72050DetailRequest = { PCS_PST_No: pccNo };
    this.loading = true;
    this.fin72050Service.queryFIN72050Detail(req)
      .pipe(untilDestroyed(this), finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          if (res.Status !== '0000') {
            this.messageService.errorBubble(res.Message || '讀取詳細資料失敗');
            return;
          }
          const d = res.Data;
          this.dataForm.patchValue({
            id: d.id,
            PCS_PST_No: d.PCS_PST_No,
            Keep_UsrNo: d.Keep_UsrNo,
            Keep_UsrName: d.Keep_UsrName,
            Keep_OrgID: d.Keep_OrgID,
            PCC_Date: d.PCC_Date ? new Date(d.PCC_Date) : null,
            Keep_QuotaAmt: d.Keep_QuotaAmt,
            PCC_NOPAY_AMT: d.PCC_NOPAY_AMT,
            PCC_NOREC_AMT: d.PCC_NOREC_AMT,
            PCC_DIFF_AMT: d.PCC_DIFF_AMT,
            PCC_Status: d.PCC_Status,
            PCC_Status_Name: d.PCC_Status_Name ?? getFIN72050StatusName(d.PCC_Status),
            PCC_Type: d.PCC_Type,
            PCC_CountAmt: d.PCC_CountAmt ?? 0,
            PCC_ActAmt_1: d.PCC_ActAmt_1 ?? 0,
            PCC_ActAmt_5: d.PCC_ActAmt_5 ?? 0,
            PCC_ActAmt_10: d.PCC_ActAmt_10 ?? 0,
            PCC_ActAmt_50: d.PCC_ActAmt_50 ?? 0,
            PCC_ActAmt_100: d.PCC_ActAmt_100 ?? 0,
            PCC_ActAmt_200: d.PCC_ActAmt_200 ?? 0,
            PCC_ActAmt_500: d.PCC_ActAmt_500 ?? 0,
            PCC_ActAmt_1000: d.PCC_ActAmt_1000 ?? 0,
            PCC_ActAmt_2000: d.PCC_ActAmt_2000 ?? 0,
            PCS_Remark: d.PCS_Remark ?? null,
          });
          this.hasPccNo = true;

          // 編輯時若狀態非「盤點中」，整個表單 disable（檢視模式）
          if (!this.canWriteForm) {
            this.dataForm.disable({ emitEvent: false });
          } else {
            // 重新套用面額啟用 / 停用規則
            this.applyPccTypeDisable(d.PCC_Type);
          }
          this.recalcCountModeTotal();
          this.recalcDiff();
        },
      });
  }

  // ────────────────────────────────────────────────────
  // 切換 PCC_Type 的 enable / disable 規則
  // ────────────────────────────────────────────────────
  private applyPccTypeDisable(type: string | null): void {
    if (!this.canWriteForm) {
      // 全表單不可寫 → 全部 disable，外層 disable 一次就好
      return;
    }
    if (type === '1') {
      // 總額模式：9 個面額 disable + reset 為 0；PCC_CountAmt enable
      this.denominations.forEach((d) => {
        const ctrl = this.dataForm.get(d.controlName);
        ctrl?.setValue(0, { emitEvent: false });
        ctrl?.disable({ emitEvent: false });
      });
      this.dataForm.controls.PCC_CountAmt.enable({ emitEvent: false });
    } else if (type === '2') {
      // 點鈔模式：9 個面額 enable；PCC_CountAmt readonly（由 ActTotalAmt 顯示）
      this.denominations.forEach((d) => {
        this.dataForm.get(d.controlName)?.enable({ emitEvent: false });
      });
      // 切到點鈔，原本 PCC_CountAmt reset 為 0（清掉總額殘留）
      this.dataForm.controls.PCC_CountAmt.setValue(0, { emitEvent: false });
      this.dataForm.controls.PCC_CountAmt.disable({ emitEvent: false });
    }
    this.recalcCountModeTotal();
    this.recalcDiff();
  }

  // ────────────────────────────────────────────────────
  // 即時加總 / 差異
  // ────────────────────────────────────────────────────
  private recalcCountModeTotal(): void {
    const total = this.denominations.reduce((sum, d) => {
      const v = Number(this.dataForm.get(d.controlName)?.value ?? 0);
      return sum + (isNaN(v) ? 0 : v);
    }, 0);
    this.dataForm.controls.ActTotalAmt.setValue(total, { emitEvent: false });
  }

  private recalcDiff(): void {
    const actual = this.isCountMode
      ? Number(this.dataForm.controls.ActTotalAmt.value ?? 0)
      : Number(this.dataForm.controls.PCC_CountAmt.value ?? 0);
    const expected = Number(this.dataForm.controls.PCC_DIFF_AMT.value ?? 0); // 取號階段的「應有現金」
    const diff = actual - expected;
    this.dataForm.controls.DiffAmt.setValue(diff, { emitEvent: false });
  }

  // ────────────────────────────────────────────────────
  // 送出（新增 / 修改）
  // ────────────────────────────────────────────────────
  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      switch (this.crudstatus) {
        case CRUDStatus.Create:
          if (!this.hasPccNo) {
            this.messageService.warnBubble('請先選擇保管人與盤點日期以取得盤點單號');
            this.loading = false;
            return;
          }
          this.doInsert();
          break;
        case CRUDStatus.Edit:
          this.doUpdate();
          break;
      }
    });
  }

  private doInsert(): void {
    const raw = this.dataForm.getRawValue();
    const me = this.user;
    const payload: InsertFIN72050Request = {
      SYS_StoreNo: me?.SYS_StoreNo ?? '',
      PCS_PST_No: raw.PCS_PST_No ?? '',
      PCC_Date: this.toIsoDate(raw.PCC_Date) ?? '',
      Keep_UsrNo: raw.Keep_UsrNo ?? '',
      Keep_UsrName: raw.Keep_UsrName ?? undefined,
      Keep_OrgID: raw.Keep_OrgID ?? undefined,
      Keep_QuotaAmt: Number(raw.Keep_QuotaAmt ?? 0),
      PCC_Type: (raw.PCC_Type as '1' | '2') ?? '1',
      PCC_CountAmt: this.isTotalMode ? Number(raw.PCC_CountAmt ?? 0) : Number(raw.ActTotalAmt ?? 0),
      ...this.collectDenominationsForPayload(),
      PCS_Remark: raw.PCS_Remark ?? undefined,
      CRT_USR_No: me?.user_No ?? undefined,
      CRT_USR_Name: me?.user_Name ?? undefined,
    };

    this.fin72050Service.insertFIN72050(payload)
      .pipe(untilDestroyed(this), finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          if (res.Status !== '0000' || res.Data?.IsSuccess === false) {
            this.messageService.errorBubble(res.Data?.ErrMsg || res.Message || '新增失敗');
            return;
          }
          this.messageService.successBubble('新增成功');
          this.onCancel();
        },
      });
  }

  private doUpdate(): void {
    const raw = this.dataForm.getRawValue();
    const me = this.user;
    const payload: UpdateFIN72050Request = {
      PCS_PST_No: raw.PCS_PST_No ?? '',
      PCC_Type: (raw.PCC_Type as '1' | '2') ?? '1',
      PCC_CountAmt: this.isTotalMode ? Number(raw.PCC_CountAmt ?? 0) : Number(raw.ActTotalAmt ?? 0),
      ...this.collectDenominationsForPayload(),
      PCS_Remark: raw.PCS_Remark ?? undefined,
      UPD_USR_No: me?.user_No ?? undefined,
      UPD_USR_Name: me?.user_Name ?? undefined,
    };

    this.fin72050Service.updateFIN72050(payload)
      .pipe(untilDestroyed(this), finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          if (res.Status !== '0000' || res.Data?.IsSuccess === false) {
            this.messageService.errorBubble(res.Data?.ErrMsg || res.Message || '編輯失敗');
            return;
          }
          this.messageService.successBubble('編輯成功');
          this.onCancel();
        },
      });
  }

  private collectDenominationsForPayload(): Record<string, number> {
    if (this.isTotalMode) {
      // 總額模式 → 9 個面額全送 0
      return this.denominations.reduce<Record<string, number>>((acc, d) => {
        acc[d.controlName] = 0;
        return acc;
      }, {});
    }
    // 點鈔模式 → 帶入實際輸入
    return this.denominations.reduce<Record<string, number>>((acc, d) => {
      acc[d.controlName] = Number(this.dataForm.get(d.controlName)?.value ?? 0);
      return acc;
    }, {});
  }

  // ────────────────────────────────────────────────────
  // 結案 / 作廢
  // ────────────────────────────────────────────────────
  onClose(): void {
    const pccNo = this.dataForm.controls.PCS_PST_No.value;
    if (!pccNo) {
      this.messageService.errorBubble('缺少盤點單號');
      return;
    }
    this.messageService.confirm({
      header: '確認結案',
      message: '確認將此盤點單結案？結案後不可再修改。',
      accept: () => {
        const me = this.user;
        const req: CloseFIN72050Request = {
          PCS_PST_No: pccNo,
          UserNo: me?.user_No ?? undefined,
          UserName: me?.user_Name ?? undefined,
        };
        this.closeLoading = true;
        this.fin72050Service.closeFIN72050(req)
          .pipe(untilDestroyed(this), finalize(() => (this.closeLoading = false)))
          .subscribe({
            next: (res) => {
              if (res.Status !== '0000' || res.Data?.ReturnCode !== 0) {
                this.messageService.errorBubble(res.Data?.ReturnMsg || res.Message || '結案失敗');
                return;
              }
              this.messageService.successBubble('結案成功');
              this.onCancel();
            },
          });
      },
    });
  }

  onVoid(): void {
    const pccNo = this.dataForm.controls.PCS_PST_No.value;
    if (!pccNo) {
      this.messageService.errorBubble('缺少盤點單號');
      return;
    }
    this.messageService.confirm({
      header: '確認作廢',
      message: '是否確認作廢此筆盤點單？',
      accept: () => {
        const me = this.user;
        const req: VoidFIN72050Request = {
          PCS_PST_No: pccNo,
          VoidUsrNo: me?.user_No ?? undefined,
          VoidUsrName: me?.user_Name ?? undefined,
        };
        this.voidLoading = true;
        this.fin72050Service.voidFIN72050(req)
          .pipe(untilDestroyed(this), finalize(() => (this.voidLoading = false)))
          .subscribe({
            next: (res) => {
              if (res.Status !== '0000' || res.Data?.ReturnCode !== 0) {
                this.messageService.errorBubble(res.Data?.ReturnMsg || res.Message || '作廢失敗');
                return;
              }
              this.messageService.successBubble('作廢成功');
              this.onCancel();
            },
          });
      },
    });
  }

  // ────────────────────────────────────────────────────
  // 工具
  // ────────────────────────────────────────────────────
  private toIsoDate(value: Date | string | null | undefined): string | undefined {
    if (!value) return undefined;
    if (value instanceof Date) {
      const y = value.getFullYear();
      const m = String(value.getMonth() + 1).padStart(2, '0');
      const d = String(value.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    return String(value);
  }
}
