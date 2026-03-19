import { DatePipe } from '@angular/common';
import { NgIf } from '@angular/common';
import { Component, computed, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ASS11040Service } from '@service/api/ass/ass11040.service';
import { ASS13080Service } from '@service/api/ass/ass13080.service';
import { DropDownListService, ISYS1000Request, IPOS2013Request } from '@service/utility/dropDownList.service';
import { QueryASS11040DataWrapper, QueryASS11040Request, QueryASS11040Response } from '@pages/ass/ass11040/ass11040.model';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { EditorTextComponent } from '@shared/componentkit/editor-text/editor-text.component';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { PanelModule } from 'primeng/panel';
import { finalize, map } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import {
  ApproveASS13080Request,
  ASS13080Detail,
  CancelASS13080Request,
  CreateASS13080Request,
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
    EditorTextComponent,
    ButtonComponent,
    NgIf,
    TranslateModule,
  ],
})
export class ASS13080CRUComponent extends BasicCruPageComponent<ASS13080Detail> implements OnInit {
  public readonly CRUDStatus = CRUDStatus;
  public readonly dataForm = this.formBuilder.group({
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
    } else {
      this.dataForm.disable({ emitEvent: false });
    }

    // 由 rowdata 直接帶入（若後端有 detail API 再改成呼叫後端）
    if (this.rowdata) this.patchFormFromRow(this.rowdata as Partial<ASS13080Detail>);
  }

  private toDateStr(d: Date | null): string | undefined {
    if (!d) return undefined;
    return this.datePipe.transform(d, 'yyyy-MM-dd') ?? undefined;
  }

  private toOpt(items: { No?: string; Name?: string }[]) {
    return (items ?? []).map(item => ({
      value: item.No ?? '',
      label: `${item.No ?? ''} - ${item.Name ?? ''}`,
    }));
  }

  private loadDropdownOptions(): void {
    this.ass13080Service
      .queryFAASSET_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        if (res.Status !== '0000') return;
        this.assetsOptions = this.toOpt(res.Data ?? []);
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
      this.df().assetNo,
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
    // 將後端（或查詢 rowdata）欄位對應到表單
    this.dataForm.patchValue(
      {
        soldNo: row.SOLD_NO ?? null,
        assetNo: row.ASSET_NO ?? null,
        goodsId: row.GOODS_ID ?? null,
        assetStatus: row.ASSET_STATUS ?? null,
        assetType: row.DEPRE_YN ?? null,
        acpNo: row.ACP_NO ?? null,
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
        keepUserNo: row.KEEP_USER_NO ?? null,
        keepOrgId: row.KEEP_ORG_ID ?? null,
        useUserNo: row.USE_USER_NO ?? null,
        useOrgId: row.USE_ORG_ID ?? null,
        locNo: row.LOC_NO ?? null,
        maintContractNo: row.MAINT_CONTRACT_NO ?? null,
        soldDate: row.SOLD_DATE ? new Date(row.SOLD_DATE) : null,
        soldVendorNo: row.SOLD_VENDOR_NO ?? null,
        soldVoucherNo: row.SOLD_VOUCHER_NO ?? null,
        soldAmtTax: row.SOLD_AMT_TAX ?? null,
        soldRemark: row.SOLD_REMARK ?? null,
        assetRemark: row.ASSET_REMARK ?? null,
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
    const payload: CreateASS13080Request = {
      SOLD_NO: raw.soldNo ?? undefined,
      ASSET_NO: raw.assetNo ?? undefined,
      SOLD_DATE: this.toDateStr(raw.soldDate) ?? '',
      SOLD_VENDOR_NO: raw.soldVendorNo ?? '',
      SOLD_VOUCHER_NO: raw.soldVoucherNo ?? undefined,
      SOLD_AMT_TAX: raw.soldAmtTax ?? 0,
      SOLD_REMARK: raw.soldRemark ?? '',
    };
    this.messageService.confirm({
      header: '確認變賣',
      message: '是否確認變賣？',
      accept: () => {
        this.messageService.blockUi();
        this.loading = true;
        this.ass13080Service
          .createASS13080(payload)
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
    const soldNo = this.dataForm.getRawValue().soldNo;
    if (!soldNo) {
      this.messageService.warnBubble('缺少變賣單號，無法取消變賣');
      return;
    }
    const payload: CancelASS13080Request = { SOLD_NO: soldNo };
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
    const soldNo = this.dataForm.getRawValue().soldNo;
    if (!soldNo) {
      this.messageService.warnBubble('缺少變賣單號，無法審核');
      return;
    }
    const payload: ApproveASS13080Request = { SOLD_NO: soldNo };
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
