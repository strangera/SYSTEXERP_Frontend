import { DatePipe } from '@angular/common';
import { NgIf } from '@angular/common';
import { Component, computed, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ASS11040Service } from '@service/api/ass/ass11040.service';
import { ASS13010Service } from '@service/api/ass/ass13010.service';
import { ASS13080Service } from '@service/api/ass/ass13080.service';
import { DropDownListService, ISYS1000Request, IPOS2013Request } from '@service/utility/dropDownList.service';
import { QueryASS11040DataWrapper, QueryASS11040Request, QueryASS11040Response } from '@pages/ass/ass11040/ass11040.model';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { PanelModule } from 'primeng/panel';
import { distinctUntilChanged, finalize, map, switchMap, throwError } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { DetailASS13010Response } from '../ass13010/ass13010.model';
import {
  ApproveASS13080Request,
  ASS13080Detail,
  CancelASS13080Request,
  CreateASS13080Request,
  QueryFAASSETChooseListASS13060Request,
  QueryFAASSETChooseListASS13060Response,
} from '../ass13080/ass13080.model';

/** 3.1.3.8 資產變賣作業 CRU */
@UntilDestroy()
@Component({
  selector: 'app-ass13080-cru',
  templateUrl: './ass13080-cru.component.html',
  styleUrl: './ass13080-cru.component.scss',
  standalone: true,
  providers: [DatePipe],
  imports: [
    MenubarComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    InputNumberComponent,
    CalendarComponent,
    ButtonComponent,
    NgIf,
    TranslateModule,
  ],
})
export class ASS13080CRUComponent extends BasicCruPageComponent<ASS13080Detail> implements OnInit {
  public readonly CRUDStatus = CRUDStatus;
  public readonly dataForm = this.formBuilder.group({
    id: new FormControl<number | null>(null),
    soldNo: new FormControl<string | null>(null),
    assetNo: new FormControl<string | null>(null, { nonNullable: false }),
    goodsId: new FormControl<string | null>(null),
    assetStatus: new FormControl<string | null>(null),
    /** DEPRE_YN 1:資產 2:列管品 */
    assetType: new FormControl<string | null>(null),
    acpNo: new FormControl<string | null>(null),
    poNo: new FormControl<string | null>(null),
    buyDate: new FormControl<Date | null>(null),
    buyAmt: new FormControl<number | null>(null),
    chgAmt: new FormControl<number | null>(null),
    vendorNo: new FormControl<string | null>(null),
    deviceNo: new FormControl<string | null>(null),
    accNoDr: new FormControl<string | null>(null),
    accNoCr: new FormControl<string | null>(null),
    txnDate: new FormControl<Date | null>(null),
    deprAccNo: new FormControl<string | null>(null),
    accuDeprAccNo: new FormControl<string | null>(null),
    deprYears: new FormControl<number | null>(null),
    chgYears: new FormControl<number | null>(null),
    residualAmt: new FormControl<number | null>(null),
    deprDue: new FormControl<number | null>(null),
    unamortAmt: new FormControl<number | null>(null),
    amortAmt: new FormControl<number | null>(null),
    amortMonths: new FormControl<number | null>(null),
    keepUserNo: new FormControl<string | null>(null),
    keepOrgId: new FormControl<string | null>(null),
    useUserNo: new FormControl<string | null>(null),
    useOrgId: new FormControl<string | null>(null),
    locNo: new FormControl<string | null>(null),
    maintContractNo: new FormControl<string | null>(null),

    soldDate: new FormControl<Date | null>(null, [Validators.required]),
    soldVendorNo: new FormControl<string | null>(null, [Validators.required]),
    soldVoucherNo: new FormControl<string | null>(null),
    soldAmtTax: new FormControl<number | null>(null, [Validators.required]),
    soldRemark: new FormControl<string | null>(null, [Validators.required]),

    assetRemark: new FormControl<string | null>(null),
  });
  public readonly df = computed(() => this.dataForm.controls);

  assetsOptions: { value: string; label: string }[] = [];
  goodsOptions: { value: string; label: string }[] = [];
  assetStatusOptions: { value: string; label: string }[] = [];
  assetTypeOptions: { value: string; label: string }[] = [
    { value: '1', label: '資產' },
    { value: '2', label: '列管品' },
  ];
  acpOptions: { value: string; label: string }[] = [];
  orgOptions: { value: string; label: string }[] = [];
  userOptions: { value: string; label: string }[] = [];
  accOptions: { value: string; label: string }[] = [];
  vendorOptions: { value: string; label: string }[] = [];

  constructor(
    private readonly ass13010Service: ASS13010Service,
    private readonly ass13080Service: ASS13080Service,
    private readonly dropDownListService: DropDownListService,
    private readonly ass11040Service: ASS11040Service,
    private readonly datePipe: DatePipe,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS13080', this.dataForm, { useReadonly: true });
    this.loadDropdownOptions();

    // 編輯/明細：全部唯讀；新增：僅「變賣」相關欄位可輸入
    if (this.crudstatus === CRUDStatus.Create) {
      this.dataForm.enable({ emitEvent: false });
      this.disableReadonlyFieldsForCreate();
      this.wireAssetSelectionOnCreate();
    } else {
      this.dataForm.disable({ emitEvent: false });
    }

    if (this.rowdata) this.patchFormFromRow(this.rowdata as Partial<ASS13080Detail>);
  }

  /** 新增：選擇資產編號後載入 detailASS13010 + queryFAASSETChooseListASS13060 並帶入唯讀欄位 */
  private wireAssetSelectionOnCreate(): void {
    this.df()
      .assetNo.valueChanges.pipe(distinctUntilChanged(), untilDestroyed(this))
      .subscribe(v => {
        const id = (v ?? '').trim();
        if (!id) {
          this.clearAssetDerivedFieldsForCreate();
          return;
        }
        this.loadAssetDetailForCreate(id);
      });
  }

  /**
   * 先以 ASSET_ID 查 queryFAASSETChooseListASS13060 取得主鍵 ID，再呼叫 detailASS13010（Swagger 要求 body: { ID }）
   */
  private loadAssetDetailForCreate(assetId: string): void {
    this.loading = true;
    this.ass13080Service
      .queryFAASSETChooseListASS13060({
        ASSET_ID: assetId,
        PageIndex: 1,
        PageSize: 10,
      })
      .pipe(
        switchMap(cRes => {
          if (cRes.Status !== '0000') {
            return throwError(() => new Error(cRes.Message ?? '載入資產列表失敗'));
          }
          const rows = cRes.Data ?? [];
          const choose =
            rows.find(r => (r.ASSET_ID ?? '').trim() === assetId) ?? (rows.length > 0 ? rows[0] : null);
          if (!choose?.ID) {
            return throwError(() => new Error('查無資產主鍵，無法載入明細'));
          }
          return this.ass13010Service.detailASS13010({ ID: String(choose.ID) }).pipe(
            map(dRes => ({ dRes, choose }))
          );
        }),
        untilDestroyed(this),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: ({ dRes, choose }) => {
          if (dRes.Status !== '0000') {
            this.messageService.errorBubble('操作失敗：' + (dRes.Message ?? '載入資產明細失敗'));
            return;
          }
          const detail = dRes.Data;
          if (!detail) {
            this.messageService.warnBubble('查無資產明細');
            return;
          }
          this.applyAssetDetailToForm(detail, choose);
        },
        error: (err: unknown) => {
          const msg = err instanceof Error ? err.message : '請稍後再試';
          this.messageService.errorBubble('操作失敗：' + msg);
        },
      });
  }

  /** 清空資產帶入欄位（資產編號清空時） */
  private clearAssetDerivedFieldsForCreate(): void {
    this.dataForm.patchValue(
      {
        goodsId: null,
        assetStatus: null,
        assetType: null,
        acpNo: null,
        poNo: null,
        buyDate: null,
        buyAmt: null,
        chgAmt: null,
        vendorNo: null,
        deviceNo: null,
        accNoDr: null,
        accNoCr: null,
        txnDate: null,
        deprAccNo: null,
        accuDeprAccNo: null,
        deprYears: null,
        chgYears: null,
        residualAmt: null,
        deprDue: null,
        unamortAmt: null,
        amortAmt: null,
        amortMonths: null,
        keepUserNo: null,
        keepOrgId: null,
        useUserNo: null,
        useOrgId: null,
        locNo: null,
        maintContractNo: null,
        assetRemark: null,
      },
      { emitEvent: false }
    );
  }

  private computeUnamortAmt(
    buyAmt: number | null,
    chgAmt: number | null,
    amortAmt: number | null
  ): number | null {
    const b = buyAmt ?? 0;
    const c = chgAmt ?? 0;
    const a = amortAmt ?? 0;
    const result = b + c - a;
    return Number.isFinite(result) ? result : null;
  }

  /** 後端明細欄位 → 表單資產區塊（不含 id、變賣單號、資產編號、變賣欄位） */
  private buildAssetFieldsFromBackend(row: Partial<ASS13080Detail>) {
    const depreYn = row.DEPRE_YN;
    return {
      goodsId: row.GOODS_ID ?? null,
      assetStatus: row.ASSET_STATUS ?? null,
      assetType: depreYn != null && String(depreYn).trim() !== '' ? String(depreYn) : null,
      acpNo: row.DEPRE_ID ?? null,
      poNo: row.PO_NO ?? null,
      buyDate: row.BUY_DATE ? new Date(row.BUY_DATE) : null,
      buyAmt: row.BUY_AMT ?? null,
      chgAmt: row.CHG_AMT ?? null,
      vendorNo: row.VENDOR_NO ?? null,
      deviceNo: row.DEVICE_NO ?? null,
      accNoDr: row.ACC_NO_DR ?? null,
      accNoCr: row.ACC_NO_CR ?? null,
      txnDate: row.TXN_DATE ? new Date(row.TXN_DATE) : null,
      deprAccNo: row.DEPR_ACC_NO ?? null,
      accuDeprAccNo: row.ACCU_DEPR_ACC_NO ?? null,
      deprYears: row.DEPR_YEARS ?? null,
      chgYears: row.CHG_YEARS ?? null,
      residualAmt: row.RESIDUAL_AMT ?? null,
      deprDue: row.DEPR_DUE ?? null,
      unamortAmt: row.UNAMORT_AMT ?? null,
      amortAmt: row.AMORT_AMT ?? null,
      amortMonths: row.AMORT_MONTHS ?? null,
      keepUserNo: row.HOLD_EMP_ID ?? null,
      keepOrgId: row.HOLD_ORG_ID ?? null,
      useUserNo: row.USE_EMP_ID ?? null,
      useOrgId: row.USE_ORG_ID ?? null,
      locNo: row.LOC_NO ?? null,
      maintContractNo: row.MAINT_CONTRACT_NO ?? null,
      assetRemark: row.ASSET_REMARK ?? null,
    };
  }

  /** detailASS13010（Swagger 欄位）→ 表單資產區塊 */
  private mapDetailASS13010ToFormFields(d: DetailASS13010Response): {
    goodsId: string | null;
    assetStatus: string | null;
    assetType: string | null;
    acpNo: string | null;
    poNo: string | null;
    buyDate: Date | null;
    buyAmt: number | null;
    chgAmt: number | null;
    vendorNo: string | null;
    deviceNo: string | null;
    accNoDr: string | null;
    accNoCr: string | null;
    txnDate: Date | null;
    deprAccNo: string | null;
    accuDeprAccNo: string | null;
    deprYears: number | null;
    chgYears: number | null;
    residualAmt: number | null;
    deprDue: number | null;
    unamortAmt: number | null;
    amortAmt: number | null;
    amortMonths: number | null;
    keepUserNo: string | null;
    keepOrgId: string | null;
    useUserNo: string | null;
    useOrgId: string | null;
    locNo: string | null;
    maintContractNo: string | null;
    assetRemark: string | null;
  } {
    const depreYn = d.DEPRE_YN;
    return {
      goodsId: d.GOODS_ID ?? null,
      assetStatus: d.ASSET_STATUS ?? null,
      assetType: depreYn != null && String(depreYn).trim() !== '' ? String(depreYn) : null,
      acpNo: d.DEPRE_ID ?? null,
      poNo: d.SUBPOENA_ID ?? null,
      buyDate: d.GET_DATE ? new Date(d.GET_DATE) : null,
      buyAmt: d.GET_COST ?? null,
      chgAmt: null,
      vendorNo: d.SUPPLIER_ID ?? null,
      deviceNo: d.EQUIP_ID ?? null,
      accNoDr: d.STYPE_D ?? null,
      accNoCr: d.STYPE_C ?? null,
      txnDate: d.BILL_DATE ? new Date(d.BILL_DATE) : null,
      deprAccNo: d.STYPE_ID ?? null,
      accuDeprAccNo: d.STYPE_ID2 ?? null,
      deprYears: d.EXP_YEAR ?? null,
      chgYears: null,
      residualAmt: d.RESI_VALUE ?? null,
      deprDue: null,
      unamortAmt: null,
      amortAmt: d.TAL_DEPRE_AMT ?? null,
      amortMonths: d.TAL_DEPRE_MON ?? null,
      keepUserNo: d.HOLD_EMP_ID ?? null,
      keepOrgId: d.HOLD_ORG_ID ?? null,
      useUserNo: d.USE_EMP_ID ?? null,
      useOrgId: d.USE_ORG_ID ?? null,
      locNo: d.LOCATION_ID ?? null,
      maintContractNo: d.FIX_N ?? null,
      assetRemark: d.NOTES ?? null,
    };
  }

  private applyAssetDetailToForm(
    detail: DetailASS13010Response,
    chooseRow: QueryFAASSETChooseListASS13060Response
  ): void {
    const base = this.mapDetailASS13010ToFormFields(detail);
    base.chgAmt = chooseRow.ChangeAmt ?? null;
    base.chgYears = chooseRow.UPD_EXP_YEAR_SUM ?? null;
    base.unamortAmt = this.computeUnamortAmt(base.buyAmt, base.chgAmt, base.amortAmt);
    this.dataForm.patchValue(base, { emitEvent: false });
  }

  private toDateStr(d: Date | null): string | undefined {
    if (!d) return undefined;
    return this.datePipe.transform(d, 'yyyy-MM-dd') ?? undefined;
  }

  private toOpt(items: { No?: string | null; Name?: string | null }[]) {
    return (items ?? []).map(item => ({
      value: item.No ?? '',
      label: `${item.No ?? ''} - ${item.Name ?? ''}`,
    }));
  }

  private faAssetChooseListToOpts(rows: QueryFAASSETChooseListASS13060Response[]) {
    return (rows ?? []).map(r => ({
      value: r.ASSET_ID ?? '',
      label: `${r.ASSET_ID ?? ''} - ${r.AssetName ?? ''}`,
    }));
  }

  private loadDropdownOptions(): void {
    const assetListReq: QueryFAASSETChooseListASS13060Request = {
      PageSize: 9999,
      PageIndex: 1,
      ...(this.rowdata?.ASSET_ID
        ? { ASSET_ID: String(this.rowdata.ASSET_ID) }
        : {}),
    };
    this.ass13080Service
      .queryFAASSETChooseListASS13060(assetListReq)
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        if (res.Status !== '0000') return;
        this.assetsOptions = this.faAssetChooseListToOpts(res.Data ?? []);
      });

    const q11040: QueryASS11040Request = { PageSize: 9999, PageIndex: 1 };
    this.ass11040Service
      .queryASS11040(q11040)
      .pipe(
        untilDestroyed(this),
        map(res => (res.Data as QueryASS11040DataWrapper | null | undefined)?.QueryData ?? []),
        map((rows: QueryASS11040Response[]) =>
          rows
            .filter(x => (x.GOODS_ID ?? '') !== '')
            .map(x => ({
              value: String(x.GOODS_ID ?? ''),
              label: `${x.GOODS_ID ?? ''} - ${x.GOODS_NAME ?? ''}`,
            }))
        )
      )
      .subscribe(options => {
        this.goodsOptions = options;
      });

    this.dropDownListService
      .querySYS1000_DropDownList({ SYS_Type: 'ASSET_STATUS' } as ISYS1000Request)
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        if (res.Status !== '0000') return;
        this.assetStatusOptions = this.toOpt(res.Data ?? []);
      });

    this.dropDownListService
      .querySYS3100_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        if (res.Status !== '0000') return;
        this.orgOptions = this.toOpt(res.Data ?? []);
      });

    this.dropDownListService
      .queryTBLUSER_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        if (res.Status !== '0000') return;
        this.userOptions = this.toOpt(res.Data ?? []);
      });

    this.dropDownListService
      .queryGLS1005_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        if (res.Status !== '0000') return;
        this.accOptions = this.toOpt(res.Data ?? []);
      });

    this.dropDownListService
      .queryPOS2013_DropDownList({} as IPOS2013Request)
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        if (res.Status !== '0000') return;
        this.vendorOptions = this.toOpt(res.Data ?? []);
      });
  }

  private disableReadonlyFieldsForCreate(): void {
    // 新增頁：規格要求固定欄位唯讀不可改，只允許變賣資訊可輸入
    const readonlyControls = [
      this.df().soldNo,
      // this.df().assetNo,
      this.df().goodsId,
      this.df().assetStatus,
      this.df().assetType,
      this.df().acpNo,
      this.df().poNo,
      this.df().buyDate,
      this.df().buyAmt,
      this.df().chgAmt,
      this.df().vendorNo,
      this.df().deviceNo,
      this.df().accNoDr,
      this.df().accNoCr,
      this.df().txnDate,
      this.df().deprAccNo,
      this.df().accuDeprAccNo,
      this.df().deprYears,
      this.df().chgYears,
      this.df().residualAmt,
      this.df().deprDue,
      this.df().unamortAmt,
      this.df().amortAmt,
      this.df().amortMonths,
      this.df().keepUserNo,
      this.df().keepOrgId,
      this.df().useUserNo,
      this.df().useOrgId,
      this.df().locNo,
      this.df().maintContractNo,
      this.df().assetRemark,
    ];
    readonlyControls.forEach(c => c.disable({ emitEvent: false }));
  }

  private patchFormFromRow(row: Partial<ASS13080Detail>): void {
    const asset = this.buildAssetFieldsFromBackend(row);
    const unamortAmt =
      row.UNAMORT_AMT ?? this.computeUnamortAmt(asset.buyAmt, asset.chgAmt, asset.amortAmt);
    this.dataForm.patchValue(
      {
        id: row.ID ?? null,
        soldNo: row.ASSET_SALENO ?? null,
        assetNo: row.ASSET_ID ?? null,
        ...asset,
        unamortAmt,
        soldDate: row.SOLD_DATE ? new Date(row.SOLD_DATE) : null,
        soldVendorNo: row.SOLD_VENDOR_NO ?? null,
        soldVoucherNo: row.SOLD_VOUCHER_NO ?? null,
        soldAmtTax: row.SOLD_AMT_TAX ?? null,
        soldRemark: row.SOLD_REMARK ?? null,
      },
      { emitEvent: false }
    );
  }

  /** 確認變賣（新增） */
  onCreateSold(): void {
    if (!this.isFormCreateable) return;
    if (this.dataForm.invalid) {
      this.submitted = true;
      this.messageService.errorBubble('表單驗證失敗，請檢查必填欄位');
      return;
    }
    const raw = this.dataForm.getRawValue();
    if (!raw.assetNo) {
      this.messageService.warnBubble('缺少資產代號，無法送出');
      return;
    }
    if (!raw.soldVendorNo) {
      this.messageService.warnBubble('缺少變賣廠商，無法送出');
      return;
    }
    const payload: CreateASS13080Request = {
      ASSET_ID: raw.assetNo,
      SALDATE: raw.soldDate ? raw.soldDate.toISOString() : '',
      BUYER_VENNO: raw.soldVendorNo,
      SALE_AMT: raw.soldAmtTax ?? 0,
      HANDLE_NOTE: raw.soldRemark ?? undefined,
    };
    this.messageService.confirm({
      header: '確認變賣',
      message: '是否確認變賣？',
      accept: () => {
        this.messageService.blockUi();
        this.loading = true;
        this.ass13080Service
          .insertASS13080(payload)
          .pipe(
            untilDestroyed(this),
            finalize(() => {
              this.loading = false;
              this.messageService.unblockUi();
            })
          )
          .subscribe({
            next: res => {
              if (res.Status !== '0000') {
                this.messageService.errorBubble('操作失敗：' + (res.Message ?? ''));
                return;
              }
              this.messageService.successBubble('新增成功');
              this.onCancel(res.Data);
            },
            error: () => this.messageService.errorBubble('操作失敗：請稍後再試'),
          });
      },
    });
  }

  /** 取消變賣 */
  onCancelSold(): void {
    if (!this.isFormEditable && !this.isFormReadable) return;
    const id = this.dataForm.getRawValue().id;
    if (!id) {
      this.messageService.warnBubble('缺少 ID，無法取消變賣');
      return;
    }
    const payload: CancelASS13080Request = { ID: id };
    this.messageService.confirm({
      header: '取消變賣',
      message: '是否確認取消變賣？',
      accept: () => {
        this.messageService.blockUi();
        this.loading = true;
        this.ass13080Service
          .cancelASS13080(payload)
          .pipe(
            untilDestroyed(this),
            finalize(() => {
              this.loading = false;
              this.messageService.unblockUi();
            })
          )
          .subscribe({
            next: res => {
              if (res.Status !== '0000') {
                this.messageService.errorBubble('操作失敗：' + (res.Message ?? ''));
                return;
              }
              this.messageService.successBubble('取消成功');
              this.onCancel();
            },
            error: () => this.messageService.errorBubble('操作失敗：請稍後再試'),
          });
      },
    });
  }

  /** 變賣審核 */
  onApproveSold(): void {
    if (!this.isFormEditable && !this.isFormReadable) return;
    const id = this.dataForm.getRawValue().id;
    if (!id) {
      this.messageService.warnBubble('缺少 ID，無法審核');
      return;
    }
    const payload: ApproveASS13080Request = { ID: id };
    this.messageService.confirm({
      header: '變賣審核',
      message: '是否確認進行變賣審核？',
      accept: () => {
        this.messageService.blockUi();
        this.loading = true;
        this.ass13080Service
          .approveASS13080(payload)
          .pipe(
            untilDestroyed(this),
            finalize(() => {
              this.loading = false;
              this.messageService.unblockUi();
            })
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
            error: () => this.messageService.errorBubble('操作失敗：請稍後再試'),
          });
      },
    });
  }
}
