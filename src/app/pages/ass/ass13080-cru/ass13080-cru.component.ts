import { DatePipe, NgIf } from '@angular/common';
import { Component, OnInit, computed } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { QueryASS11040DataWrapper, QueryASS11040Request, QueryASS11040Response } from '@pages/ass/ass11040/ass11040.model';
import { ASS11040Service } from '@service/api/ass/ass11040.service';
import { ASS13010Service } from '@service/api/ass/ass13010.service';
import { ASS13080Service } from '@service/api/ass/ass13080.service';
import { DropDownListService, IPOS2013Request, ISYS1000Request } from '@service/utility/dropDownList.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputNumberComponent } from '@shared/components/input-number/input-number.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { PanelModule } from 'primeng/panel';
import {
  EMPTY,
  Observable,
  catchError,
  distinctUntilChanged,
  finalize,
  map,
  switchMap,
  throwError,
} from 'rxjs';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { DetailASS13010Response } from '../ass13010/ass13010.model';
import {
  ASS13080Detail,
  ApproveASS13080Request,
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
    /** 變賣單號 */
    soldNo: new FormControl<string | null>(null),
    /** 資產編號 */
    assetNo: new FormControl<string | null>(null, { nonNullable: false }),
    /** 品項編號 */
    goodsId: new FormControl<string | null>(null),
    /** 資產狀態 */
    assetStatus: new FormControl<string | null>(null),
    /** 資產類型 DEPRE_YN 1:資產 2:列管品 */
    assetType: new FormControl<string | null>(null),
    /** 攤提代號 */
    acpNo: new FormControl<string | null>(null),
    /** 採購單號 */
    poNo: new FormControl<string | null>(null),
    /** 購入日期 */
    buyDate: new FormControl<Date | null>(null),
    /** 購入金額 */
    buyAmt: new FormControl<number | null>(null),
    /** 異動金額 */
    chgAmt: new FormControl<number | null>(null),
    /** 供應商編號 */
    vendorNo: new FormControl<string | null>(null),
    /** 設備編號 */
    deviceNo: new FormControl<string | null>(null),
    /** 會計科目(借) */
    accNoDr: new FormControl<string | null>(null),
    /** 會計科目(貸) */
    accNoCr: new FormControl<string | null>(null),
    /** 入帳日期 */
    txnDate: new FormControl<Date | null>(null),
    /** 折舊會計科目 */
    deprAccNo: new FormControl<string | null>(null),
    /** 累計折舊科目 */
    accuDeprAccNo: new FormControl<string | null>(null),
    /** 折舊年限 */
    deprYears: new FormControl<number | null>(null),
    /** 異動年限 */
    chgYears: new FormControl<number | null>(null),
    /** 預留殘值 */
    residualAmt: new FormControl<number | null>(null),
    /** 折舊到期 */
    deprDue: new FormControl<number | null>(null),
    /** 未攤提金額 */
    unamortAmt: new FormControl<number | null>(null),
    /** 已攤提金額 */
    amortAmt: new FormControl<number | null>(null),
    /** 已攤提月數 */
    amortMonths: new FormControl<number | null>(null),
    /** 保管人 */
    keepUserNo: new FormControl<string | null>(null),
    /** 保管單位 */
    keepOrgId: new FormControl<string | null>(null),
    /** 使用人 */
    useUserNo: new FormControl<string | null>(null),
    /** 使用單位 */
    useOrgId: new FormControl<string | null>(null),
    /** 位置編號 */
    locNo: new FormControl<string | null>(null),
    /** 維修合約編號 */
    maintContractNo: new FormControl<string | null>(null),
    /** 變賣日期 */
    soldDate: new FormControl<Date | null>(null, [Validators.required]),
    /** 變賣廠商 */
    soldVendorNo: new FormControl<string | null>(null, [Validators.required]),
    /** 原始購入傳票編號 */
    soldVoucherNo: new FormControl<string | null>(null),
    /** 變賣金額(含稅) */
    soldAmtTax: new FormControl<number | null>(null, [Validators.required]),
    /** 變賣說明 */
    soldRemark: new FormControl<string | null>(null, [Validators.required]),
    /** 資產註記 */
    assetRemark: new FormControl<string | null>(null),
  });
  public readonly df = computed(() => this.dataForm.controls);

  assetsOptions: { value: string; label: string }[] = [];
  goodsOptions: { value: string; label: string }[] = [];
  assetStatusOptions: { value: string; label: string }[] = [];
  /** 資產類型：對應 DEPRE_YN（1:資產 2:列管品），與 ASS13010 保持一致 */
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

  /** 自 ASS13060 列表依 ASSET_ID 解析一筆（與新增選資產邏輯一致） */
  private resolveChooseRowForAssetId(
    rows: QueryFAASSETChooseListASS13060Response[],
    assetId: string
  ): QueryFAASSETChooseListASS13060Response | null {
    const trimmed = assetId.trim();
    return (
      rows.find(r => (r.ASSET_ID ?? '').trim() === trimmed) ?? (rows.length > 0 ? rows[0] : null)
    );
  }

  /** 已有 choose 列時呼叫 detailASS13010（body.ID = 資產主鍵） */
  private fetchDetailForChooseRow(
    choose: QueryFAASSETChooseListASS13060Response
  ): Observable<{ detail: DetailASS13010Response; choose: QueryFAASSETChooseListASS13060Response }> {
    return this.ass13010Service.detailASS13010({ ID: String(choose.ID) }).pipe(
      map(dRes => {
        if (dRes.Status !== '0000') {
          throw new Error(dRes.Message ?? '載入資產明細失敗');
        }
        const detail = Array.isArray(dRes.Data) ? dRes.Data[0] : dRes.Data;
        if (!detail) {
          throw new Error('查無資產明細');
        }
        return { detail, choose };
      })
    );
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
          const choose = this.resolveChooseRowForAssetId(rows, assetId);
          if (!choose?.ID) {
            return throwError(() => new Error('查無資產主鍵，無法載入明細'));
          }
          return this.fetchDetailForChooseRow(choose);
        }),
        untilDestroyed(this),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: ({ detail, choose }) => this.applyAssetDetailToForm(detail, choose),
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
      assetRemark: row.NOTES ?? null,
    };
  }

  /** detailASS13010（Swagger 欄位）→ 表單資產區塊 */
  private mapDetailASS13010ToFormFields(d: DetailASS13010Response): {
    /** 品項編號 */
    goodsId: string | null;
    /** 資產狀態 */
    assetStatus: string | null;
    /** 資產類型 */
    assetType: string | null;
    /** 攤提代號 */
    acpNo: string | null;
    /** 採購單號 */
    poNo: string | null;
    /** 購入日期 */
    buyDate: Date | null;
    /** 購入金額 */
    buyAmt: number | null;
    /** 異動金額 */
    chgAmt: number | null;
    /** 供應商編號 */
    vendorNo: string | null;
    /** 設備編號 */
    deviceNo: string | null;
    /** 會計科目(借) */
    accNoDr: string | null;
    /** 會計科目(貸) */
    accNoCr: string | null;
    /** 入帳日期 */
    txnDate: Date | null;
    /** 折舊會計科目 */
    deprAccNo: string | null;
    /** 累計折舊科目 */
    accuDeprAccNo: string | null;
    /** 折舊年限 */
    deprYears: number | null;
    /** 異動年限 */
    chgYears: number | null;
    /** 預留殘值 */
    residualAmt: number | null;
    /** 折舊到期 */
    deprDue: number | null;
    /** 未攤提金額 */
    unamortAmt: number | null;
    /** 已攤提金額 */
    amortAmt: number | null;
    /** 已攤提月數 */
    amortMonths: number | null;
    /** 保管人 */
    keepUserNo: string | null;
    /** 保管單位 */
    keepOrgId: string | null;
    /** 使用人 */
    useUserNo: string | null;
    /** 使用單位 */
    useOrgId: string | null;
    /** 位置編號 */
    locNo: string | null;
    /** 維修合約編號 */
    maintContractNo: string | null;
    /** 變賣日期 */
    soldDate: Date | null;
    /** 變賣廠商 */
    soldVendorNo: string | null;
    /** 原始購入傳票編號 */
    soldVoucherNo: string | null;
    /** 變賣金額(含稅) */
    soldAmtTax: number | null;
    /** 變賣說明 */
    soldRemark: string | null;
    /** 資產註記 */
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
      deprAccNo: null,
      accuDeprAccNo: null,
      deprYears: null,
      chgYears: null,
      residualAmt: d.RESI_VALUE ?? null,
      deprDue: null,
      unamortAmt: null,
      amortAmt: null,
      amortMonths: null,
      keepUserNo: null,
      keepOrgId: null,
      useUserNo: null,
      useOrgId: null,
      locNo: d.LOCATION_ID ?? null,
      maintContractNo: d.FIX_N ?? null,
      soldDate: d.HANDLE_DATE ? new Date(d.HANDLE_DATE) : null,
      soldVendorNo: d.HANDLE_VENDOR ?? null,
      soldVoucherNo: d.HANDLE_VID ?? null,
      soldAmtTax: d.ONSALE_AMT ?? null,
      soldRemark: d.HANDLE_NOTE ?? null,
      assetRemark: d.NOTES ?? null,
    };
  }

  /** queryFAASSETChooseListASS13060 → 保管/折舊欄位 */
  private mapChooseToFormFields(choose: QueryFAASSETChooseListASS13060Response) {
    return {
      deprAccNo: choose.STYPE_ID ?? null,
      accuDeprAccNo: choose.STYPE_ID2 ?? null,
      deprYears: choose.FIR_EXP_YEAR ?? null,
      chgYears: choose.UPD_EXP_YEAR_SUM ?? null,
      amortAmt: choose.SUM_DEPRE_AMOUNT ?? null,
      amortMonths: choose.SUM_DEPRE_MONTH ?? null,
      chgAmt: choose.ChangeAmt ?? null,
      deprDue: Number(choose.DEPRE_YM_E ?? '') || null,
      keepUserNo: choose.HOLD_EMP_ID ?? null,
      keepOrgId: choose.HOLD_ORG_ID ?? null,
      useUserNo: choose.USE_EMP_ID ?? null,
      useOrgId: choose.USE_ORG_ID ?? null,
    };
  }

  /** 編輯／明細：僅以主檔覆寫「資產」區塊，不碰變賣欄位 */
  private patchAssetFieldsFromDetail(
    detail: DetailASS13010Response,
    chooseRow: QueryFAASSETChooseListASS13060Response
  ): void {
    const fromDetail = this.mapDetailASS13010ToFormFields(detail);
    const fromChoose = this.mapChooseToFormFields(chooseRow);
    const patch = {
      ...fromDetail,
      ...fromChoose,
      unamortAmt: this.computeUnamortAmt(fromDetail.buyAmt, fromChoose.chgAmt, fromChoose.amortAmt),
    };
    this.dataForm.patchValue(patch, { emitEvent: false });
  }

  /** 新增：選定資產後帶入明細（同 patchAssetFieldsFromDetail） */
  private applyAssetDetailToForm(
    detail: DetailASS13010Response,
    chooseRow: QueryFAASSETChooseListASS13060Response
  ): void {
    this.patchAssetFieldsFromDetail(detail, chooseRow);
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
      .pipe(
        untilDestroyed(this),
        switchMap(cRes => {
          if (cRes.Status !== '0000') {
            return EMPTY;
          }
          const rows = cRes.Data ?? [];
          this.assetsOptions = this.faAssetChooseListToOpts(rows);

          const isViewOrEdit =
            this.crudstatus === CRUDStatus.Edit || this.crudstatus === CRUDStatus.Read;
          const assetId = String((this.rowdata as Partial<ASS13080Detail> | undefined)?.ASSET_ID ?? '').trim();
          if (!isViewOrEdit || !assetId) {
            return EMPTY;
          }
          const choose = this.resolveChooseRowForAssetId(rows, assetId);
          if (!choose?.ID) {
            this.messageService.warnBubble('查無資產主鍵，無法載入資產明細');
            return EMPTY;
          }
          this.loading = true;
          return this.fetchDetailForChooseRow(choose).pipe(
            finalize(() => {
              this.loading = false;
            }),
            catchError((err: unknown) => {
              const msg = err instanceof Error ? err.message : '請稍後再試';
              this.messageService.warnBubble(msg);
              return EMPTY;
            })
          );
        })
      )
      .subscribe(({ detail, choose }) => this.patchAssetFieldsFromDetail(detail, choose));

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
        soldDate: row.HANDLE_DATE ? new Date(row.HANDLE_DATE) : row.SOLD_DATE ? new Date(row.SOLD_DATE) : null,
        soldVendorNo: row.HANDLE_VENDOR ?? row.SOLD_VENDOR_NO ?? null,
        soldVoucherNo: row.HANDLE_VID ?? row.SOLD_VOUCHER_NO ?? null,
        soldAmtTax: row.ONSALE_AMT ?? row.SOLD_AMT_TAX ?? null,
        soldRemark: row.HANDLE_NOTE ?? row.SOLD_REMARK ?? null,
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
