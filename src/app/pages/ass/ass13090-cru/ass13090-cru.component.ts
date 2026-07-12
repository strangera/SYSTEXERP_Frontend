import { DatePipe, NgIf } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ASS13090Service } from '@service/api/ass/ass13090.service';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { InputTextareaComponent } from '../../../shared/componentkit/input-textarea/input-textarea.component';
import { TableReportComponent } from '../../../shared/componentkit/table-report/table-report.component';
import { ReportColumn, formatAmount } from '../../../shared/componentkit/table-report/table-report.model';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { ValidationService } from '../../../shared/service/validation.service';
import { DetailASS13090DetailItem, DetailASS13090MasterInfo } from '../ass13090/ass13090.model';

// 3.1.3.9 資產攤提作業 CRU
@UntilDestroy()
@Component({
  selector: 'app-ass13090-cru',
  templateUrl: './ass13090-cru.component.html',
  standalone: true,
  providers: [DatePipe],
  imports: [
    MenubarComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    InputNumberComponent,
    CalendarComponent,
    InputTextareaComponent,
    ButtonComponent,
    TableReportComponent,
    NgIf,
    TranslateModule,
  ],
})
export class ASS13090CRUComponent extends BasicCruPageComponent<DetailASS13090MasterInfo> implements OnInit {
  private readonly validationService = inject(ValidationService);
  private readonly translate = inject(TranslateService);
  private readonly ass13090Service = inject(ASS13090Service);
  private readonly datePipe = inject(DatePipe);

  /** 攤提紀錄（明細列表，API 就緒後改為查詢結果） */
  readonly amortRecordTableLoading = signal(false);
  amortRecordColumns: ReportColumn[] = [
    { field: 'DEPRE_YM_B', header: '攤提起始', visible: true },
    { field: 'DEPRE_YM_E', header: '攤提結束', visible: true },
    {
      field: 'DEPRE_AMOUNT',
      header: '攤提金額',
      visible: true,
      align: 'right',
      format: v => (v == null || v === '' ? '' : formatAmount(Number(v))),
    },
    { field: 'DEPRE_DATE', header: '攤提日期', visible: true },
    { field: 'VOUCHER_ID', header: '傳票編號', visible: true },
    { field: 'REPNOTE', header: '重估單號', visible: true },
  ];
  amortRecordData: DetailASS13090DetailItem[] = [];
  amortRecordTotal = 0;
  /** 取消鈕還原用：進頁當下表單快照 */
  private formBaseline: Record<string, unknown> | null = null;

  dataForm = this.formBuilder.group({
    assetsCode: [undefined, [Validators.maxLength(20)]],
    itemCode: [],
    assetStatus: [undefined, [Validators.maxLength(13)]],
    assetType: [undefined, [Validators.maxLength(13)]],
    purchaseNumber: [],
    purchaseDate: [],
    purchaseAmount: [undefined, [this.validationService.numberValidator, Validators.maxLength(8)]],
    alteredAmount: [undefined, [this.validationService.numberValidator, Validators.maxLength(8)]],
    supplierCode: [undefined, [Validators.maxLength(10)]],
    accounting_Borrow: [undefined, [Validators.maxLength(8)]],
    accounting_Credit: [undefined, [Validators.maxLength(8)]],
    entryDate: [],
    amortizedDate: [],
    depreciation: [],
    totalDepreciation: [],
    depreciationLife: [undefined, [Validators.maxLength(8)]],
    alteredLife: [undefined, [Validators.maxLength(8)]],
    depreciationLifeMM: [undefined, [Validators.required, Validators.maxLength(8)]],
    residual: [undefined, [Validators.maxLength(8)]],
    amortizedAmount: [undefined, [Validators.maxLength(8)]],
    amortizedMonth: [undefined, [Validators.maxLength(8)]],
    keepingPerson: [undefined, [Validators.required]],
    keepingUnit: [],
    user: [],
    userUnit: [],
    locationCode: [],
    renewalNumber: [undefined, [Validators.maxLength(25)]],
    renewalAmount: [undefined, [Validators.required, Validators.maxLength(8)]],
    remark: [undefined],
  });

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS13090', this.dataForm);
    this.loadDetailData();
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      switch (this.crudstatus) {
        case CRUDStatus.Edit:
          if (this.canEdit()) {
            this.submitContinued();
          }
          break;
        default:
          this.loading = false;
          break;
      }
    });
  }

  submitForm(frm: FormGroup): void {
    this.onSubmit(frm);
  }

  /** 取消鈕：還原成進入頁面時的原始資料 */
  onCancelFormReset(): void {
    if (this.formBaseline == null) {
      return;
    }
    this.dataForm.reset(this.formBaseline);
    this.submitted = false;
    this.applyEditFieldLock();
  }

  /** 編輯模式僅允許「續攤攤入金額」與「攤提備註」可編輯 */
  private applyEditFieldLock(): void {
    if (this.crudstatus !== CRUDStatus.Edit) {
      return;
    }

    const editable = new Set(['renewalAmount', 'remark']);
    for (const key of Object.keys(this.dataForm.controls) as Array<keyof typeof this.dataForm.controls>) {
      const ctrl = this.dataForm.controls[key];
      if (editable.has(key as string)) {
        ctrl.enable({ emitEvent: false });
      } else {
        ctrl.disable({ emitEvent: false });
      }
    }
  }

  private captureFormBaseline(): void {
    try {
      this.formBaseline = structuredClone(this.dataForm.getRawValue()) as Record<string, unknown>;
    } catch {
      this.formBaseline = { ...(this.dataForm.getRawValue() as Record<string, unknown>) };
    }
  }

  private loadDetailData(): void {
    this.loading = true;
    this.amortRecordTableLoading.set(true);
    this.ass13090Service
      .detailASS13090({
        STO_NO:
          this.authService.getUserInfo()?.SYS_StoreNo ??
          this.authService.currentUserValue?.SYS_StoreNo ??
          null,
        DEPRE_ID: this.rowdata?.ASSET_ID ?? '',
      })
      .pipe(
        untilDestroyed(this),
        finalize(() => {
          this.loading = false;
          this.amortRecordTableLoading.set(false);
        }),
      )
      .subscribe({
        next: res => {
          if (res.Status !== '0000' || !res.Data) {
            this.messageService.warnBubble(res.Message || '明細載入失敗');
            return;
          }
          this.applyMasterInfo(res.Data.MasterInfo ?? null);
          this.applyDetailList(res.Data.DetailList ?? []);
          this.applyEditFieldLock();
          queueMicrotask(() => this.captureFormBaseline());
        },
        error: () => {
          this.messageService.warnBubble('明細載入失敗，請稍後再試');
        },
      });
  }

  private toDateOrNull(v?: string | null): Date | null {
    if (!v) return null;
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  private toYm(v?: string | null): string {
    if (!v) return '';
    const d = new Date(v);
    if (!Number.isNaN(d.getTime())) {
      return this.datePipe.transform(d, 'yyyyMM') ?? '';
    }
    return v.replaceAll(/\D/g, '');
  }

  private applyMasterInfo(master: DetailASS13090MasterInfo | null): void {
    if (!master) return;
    this.dataForm.patchValue(
      {
        assetsCode: master.ASSET_ID ?? null,
        itemCode: [master.GOODS_ID, master.GOODS_NAME].filter(Boolean).join(' / ') || null,
        assetStatus: master.ASSET_STATUS_NAME ?? master.ASSET_STATUS ?? null,
        assetType: master.DEPRE_YN_NAME ?? master.DEPRE_YN ?? null,
        purchaseNumber: master.SUBPOENA_ID ?? null,
        purchaseDate: this.toDateOrNull(master.GET_DATE),
        purchaseAmount: master.GET_COST ?? null,
        alteredAmount: master.CHANGE_AMT ?? null,
        supplierCode: master.SUPPLIER_ID ?? null,
        accounting_Borrow: master.STYPE_D ?? null,
        accounting_Credit: master.STYPE_C ?? null,
        entryDate: this.toDateOrNull(master.BILL_DATE),
        amortizedDate: this.toDateOrNull(master.DEPRE_SDATE),
        depreciation: master.STYPE_ID ?? null,
        totalDepreciation: master.STYPE_ID2 ?? null,
        depreciationLife: master.EXP_YEAR ?? null,
        alteredLife: master.CHANGE_EXP_YEAR ?? null,
        depreciationLifeMM: master.EXP_MONTH ?? null,
        residual: master.RESI_VALUE ?? null,
        amortizedAmount: master.TAL_DEPRE_AMT ?? null,
        amortizedMonth: master.TAL_DEPRE_MON ?? null,
        keepingPerson: master.HOLD_EMP_ID ?? null,
        keepingUnit: master.HOLD_ORG_ID ?? null,
        user: master.USE_EMP_ID ?? null,
        userUnit: master.USE_ORG_ID ?? null,
        locationCode: master.LOCATION_ID ?? null,
      } as never,
      { emitEvent: false },
    );
  }

  private applyDetailList(list: DetailASS13090DetailItem[]): void {
    this.amortRecordData = (list ?? []).map(item => ({
      ...item,
      DEPRE_YM_B: this.toYm(item.DEPRE_YM_B),
      DEPRE_YM_E: this.toYm(item.DEPRE_YM_E),
      DEPRE_DATE: this.datePipe.transform(this.toDateOrNull(item.DEPRE_DATE), 'yyyy/MM/dd') ?? '',
    }));
    this.amortRecordTotal = this.amortRecordData.length;
  }

  private submitContinued(): void {
    const assetId = this.rowdata?.ASSET_ID ?? null;
    if (!assetId) {
      this.loading = false;
      this.messageService.warnBubble('缺少資產編號，無法續提');
      return;
    }
    const stoNo =
      this.authService.getUserInfo()?.SYS_StoreNo ?? null;

    const raw = this.dataForm.getRawValue();
    this.ass13090Service
      .continuedASS13090({
        STO_NO: stoNo,
        ASSET_ID: assetId,
        DEPRE_AMOUNT: raw.renewalAmount ?? null,
        RESI_VALUE: raw.residual ?? null,
        MEMO: raw.remark ?? null,
      })
      .pipe(
        untilDestroyed(this),
        finalize(() => (this.loading = false)),
      )
      .subscribe({
        next: res => {
          if (res.Status !== '0000' || res.Data?.Result !== 1) {
            this.messageService.warnBubble(res.Data?.ResultMsg || res.Message || '續提失敗');
            return;
          }
          this.messageService.successBubble(res.Data?.ResultMsg || this.translate.instant('updated-successfully'));
          this.onCancel();
        },
        error: () => this.messageService.warnBubble('續提失敗，請稍後再試'),
      });
  }
}
