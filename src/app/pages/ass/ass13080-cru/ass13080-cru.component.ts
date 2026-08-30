import { NgIf } from '@angular/common';
import { Component, OnInit, computed } from '@angular/core';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import {
  UntilDestroy,
  untilDestroyed,
} from '@ngneat/until-destroy';

import { TranslateModule } from '@ngx-translate/core';

import {
  QueryASS11040DataWrapper,
  QueryASS11040Request,
  QueryASS11040Response,
} from '@pages/ass/ass11040/ass11040.model';

import { ASS11040Service } from '@service/api/ass/ass11040.service';
import { ASS13010Service } from '@service/api/ass/ass13010.service';
import { ASS13080Service } from '@service/api/ass/ass13080.service';

import {
  DropDownListService,
  IPOS2013Request,
  ISYS1000Request,
} from '@service/utility/dropDownList.service';

import {
  BasicCruPageComponent,
} from '@shared/componentextends/basic-crupage/basic-cru-page.component';

import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputNumberComponent } from '@shared/components/input-number/input-number.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';

import { CRUDStatus } from '@shared/models/system/CRUDstatus';

import { PanelModule } from 'primeng/panel';

import {
  Observable,
  distinctUntilChanged,
  finalize,
  map,
  switchMap,
  throwError,
} from 'rxjs';

import {
  MenubarComponent,
} from '../../../shared/components/menubar/menubar.component';

import {
  DetailASS13010Response,
} from '../ass13010/ass13010.model';

import {
  ASS13080Detail,
  ApproveASS13080Request,
  CancelASS13080Request,
  CreateASS13080Request,
  QueryFAASSETChooseListASS13060Request,
  QueryFAASSETChooseListASS13060Response,
} from '../ass13080/ass13080.model';


/**
 * 3.1.3.8 資產變賣作業 CRU
 */
@UntilDestroy()
@Component({
  selector: 'app-ass13080-cru',
  templateUrl: './ass13080-cru.component.html',
  standalone: true,
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
export class ASS13080CRUComponent
  extends BasicCruPageComponent<ASS13080Detail>
  implements OnInit {

  public readonly CRUDStatus = CRUDStatus;

  public readonly dataForm = this.formBuilder.group({

    /** FAASSSALEM.ID */
    id: new FormControl<number | null>(null),

    /** 變賣單號 */
    soldNo: new FormControl<string | null>(null),

    /** 資產編號 */
    assetNo: new FormControl<string | null>(null),

    /** 品項編號 */
    goodsId: new FormControl<string | null>(null),

    /** 資產狀態 */
    assetStatus: new FormControl<string | null>(null),

    /** 資產類型 */
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
    soldDate: new FormControl<Date | null>(
      null,
      [Validators.required]
    ),

    /** 變賣廠商 */
    soldVendorNo: new FormControl<string | null>(
      null,
      [Validators.required]
    ),

    /** 原始購入傳票編號 */
    soldVoucherNo: new FormControl<string | null>(null),

    /** 變賣金額(含稅) */
    soldAmtTax: new FormControl<number | null>(
      null,
      [Validators.required]
    ),

    /** 變賣說明 */
    soldRemark: new FormControl<string | null>(
      null,
      [Validators.required]
    ),

    /** 資產註記 */
    assetRemark: new FormControl<string | null>(null),
  });


  public readonly df =
    computed(() => this.dataForm.controls);


  assetsOptions: {
    value: string;
    label: string;
  }[] = [];

  goodsOptions: {
    value: string;
    label: string;
  }[] = [];

  assetStatusOptions: {
    value: string;
    label: string;
  }[] = [];

  assetTypeOptions: {
    value: string;
    label: string;
  }[] = [
      {
        value: '1',
        label: '資產',
      },
      {
        value: '2',
        label: '列管品',
      },
    ];

  acpOptions: {
    value: string;
    label: string;
  }[] = [];

  orgOptions: {
    value: string;
    label: string;
  }[] = [];

  userOptions: {
    value: string;
    label: string;
  }[] = [];

  accOptions: {
    value: string;
    label: string;
  }[] = [];

  vendorOptions: {
    value: string;
    label: string;
  }[] = [];


  constructor(
    private readonly ass13010Service: ASS13010Service,
    private readonly ass13080Service: ASS13080Service,
    private readonly dropDownListService: DropDownListService,
    private readonly ass11040Service: ASS11040Service,
  ) {
    super();
  }


  // ============================================================
  // 初始化
  // ============================================================

  ngOnInit(): void {

    this.initializePage(
      'ASS13080',
      this.dataForm,
      {
        useReadonly: true,
      }
    );


    /**
     * 先將 ASS13080 Query 回傳資料帶入畫面。
     *
     * 這裡主要負責：
     *
     * ID
     * ASSET_SALENO
     * ASSET_ID
     * SALDATE
     * BUYER_VENNO
     * SALE_AMT
     * ...
     */
    if (this.rowdata) {

      this.patchFormFromRow(
        this.rowdata as Partial<ASS13080Detail>
      );
    }


    // ==========================================================
    // 新增
    // ==========================================================
    if (
      this.crudstatus === CRUDStatus.Create
    ) {

      this.dataForm.enable({
        emitEvent: false,
      });

      /**
       * 除資產編號、變賣資訊外，
       * 其他欄位唯讀。
       */
      this.disableReadonlyFieldsForCreate();

      /**
       * 使用者選擇資產後：
       *
       * queryFAASSETChooseListASS13060
       * ↓
       * 取得 FAASSET.ID
       * ↓
       * detailASS13010
       */
      this.wireAssetSelectionOnCreate();
    }


    // ==========================================================
    // 查看 / 編輯
    // ==========================================================
    else {

      this.dataForm.disable({
        emitEvent: false,
      });


      /**
       * ASS13080 Query 現在必須回：
       *
       * ID          = FAASSSALEM.ID
       * ASSET_PK_ID = FAASSET.ID
       */
      const row =
        this.rowdata as
        | (
          Partial<ASS13080Detail> & {
            ASSET_PK_ID?: number | null;
          }
        )
        | undefined;


      const assetPkId =
        row?.ASSET_PK_ID;


      const assetId =
        String(
          row?.ASSET_ID ??
          ''
        ).trim();


      console.log(
        '[ASS13080] View/Edit initialization',
        {
          saleId:
            row?.ID,

          assetPkId,

          assetId,

          crudstatus:
            this.crudstatus,
        }
      );


      /**
       * ★ 第一次進查看畫面直接打 detailASS13010
       *
       * 完全不走 ChooseList。
       */
      if (
        assetPkId != null &&
        Number(assetPkId) > 0
      ) {

        this.loadAssetDetailById(
          assetPkId,
          assetId
        );
      }

      else {

        this.messageService.errorBubble(
          `無法載入資產明細：ASS13080 Query 未回傳 ASSET_PK_ID。` +
          ` ASSET_ID=${assetId || '(空)'}`
        );

        console.error(
          '[ASS13080] ASSET_PK_ID missing',
          row
        );
      }
    }


    /**
     * Dropdown 跟 Detail 分開載入，
     * 不互相依賴。
     */
    this.loadDropdownOptions();
  }


  // ============================================================
  // Create：選資產
  // ============================================================

  private wireAssetSelectionOnCreate(): void {

    this.df()
      .assetNo
      .valueChanges
      .pipe(
        distinctUntilChanged(),
        untilDestroyed(this)
      )
      .subscribe(value => {

        const assetId =
          String(
            value ?? ''
          ).trim();


        if (!assetId) {

          this.clearAssetDerivedFieldsForCreate();

          return;
        }


        this.loadAssetDetailForCreate(
          assetId
        );
      });
  }


  /**
   * Create 才需要 ChooseList。
   *
   * 因為新增時資產必須在
   * 「可以變賣的資產清單」內。
   */
  private loadAssetDetailForCreate(
    assetId: string
  ): void {

    const trimmedAssetId =
      assetId.trim();


    if (!trimmedAssetId) {
      return;
    }


    this.loading = true;


    this.ass13080Service
      .queryFAASSETChooseListASS13060({
        ASSET_ID:
          trimmedAssetId,

        PageIndex:
          1,

        PageSize:
          10,
      })
      .pipe(

        switchMap(cRes => {

          if (
            cRes.Status !== '0000'
          ) {

            return throwError(
              () =>
                new Error(
                  cRes.Message ??
                  '載入資產列表失敗'
                )
            );
          }


          const rows =
            (cRes.Data ?? []).filter(
              row =>
                String(row.MATERIAL_TYPE ?? '').trim() !== '4'
            );


          const choose =
            this.resolveChooseRowForAssetId(
              rows,
              trimmedAssetId
            );


          if (!choose?.ID) {

            return throwError(
              () =>
                new Error(
                  `查無資產 ${trimmedAssetId} 的主鍵 ID`
                )
            );
          }


          return this.fetchDetailForChooseRow(
            choose
          );
        }),

        untilDestroyed(this),

        finalize(() => {

          this.loading =
            false;
        })
      )
      .subscribe({

        next: ({
          detail,
          choose,
        }) => {

          /**
           * Create：
           *
           * 資產資訊 + ChooseList 折舊資訊一起帶。
           */
          this.patchCreateAssetDetail(
            detail,
            choose
          );
        },


        error: (
          err: unknown
        ) => {

          const msg =
            err instanceof Error
              ? err.message
              : '請稍後再試';


          this.messageService.errorBubble(
            '操作失敗：' +
            msg
          );
        },
      });
  }


  // ============================================================
  // View / Edit：直接 detailASS13010
  // ============================================================

  /**
   * 查看 / 編輯第一次進入直接呼叫。
   *
   * ASSET_PK_ID
   * ↓
   * detailASS13010
   *
   * 不再經過 ChooseList。
   */
  private loadAssetDetailById(
    assetPkId: number | string,
    expectedAssetId: string
  ): void {

    this.loading = true;


    console.log(
      '[ASS13080] detailASS13010 request',
      {
        ID:
          assetPkId,

        expectedAssetId,
      }
    );


    this.ass13010Service
      .detailASS13010({
        ID:
          String(
            assetPkId
          ),
      })
      .pipe(

        untilDestroyed(this),

        finalize(() => {

          this.loading =
            false;
        })
      )
      .subscribe({

        next: res => {

          if (
            res.Status !== '0000'
          ) {

            this.messageService.errorBubble(
              '載入資產明細失敗：' +
              (
                res.Message ??
                ''
              )
            );

            return;
          }


          const detail =
            Array.isArray(res.Data)
              ? res.Data[0]
              : res.Data;


          if (!detail) {

            this.messageService.errorBubble(
              `detailASS13010 查無資料，ID=${assetPkId}`
            );

            return;
          }


          /**
           * 防呆：
           * 確定查回來的是同一個資產。
           */
          const returnedAssetId =
            String(
              detail.ASSET_ID ??
              ''
            ).trim();


          if (
            expectedAssetId &&
            returnedAssetId &&
            expectedAssetId !==
            returnedAssetId
          ) {

            this.messageService.errorBubble(
              `資產資料錯誤：` +
              `目前=${expectedAssetId}，` +
              `detailASS13010=${returnedAssetId}`
            );

            return;
          }


          /**
           * ★ View/Edit：
           *
           * detailASS13010 回來後
           * 將資產 + 變賣資訊補完整。
           */
          this.patchViewDetail(
            detail
          );
        },


        error: err => {

          console.error(
            '[ASS13080] detailASS13010 error',
            err
          );


          this.messageService.errorBubble(
            '載入資產明細失敗'
          );
        },
      });
  }


  /**
   * 已取得 ChooseList Row，
   * 再查 detailASS13010。
   */
  private fetchDetailForChooseRow(
    choose: QueryFAASSETChooseListASS13060Response
  ): Observable<{
    detail: DetailASS13010Response;
    choose: QueryFAASSETChooseListASS13060Response;
  }> {

    return this.ass13010Service
      .detailASS13010({
        ID:
          String(
            choose.ID
          ),
      })
      .pipe(

        map(res => {

          if (
            res.Status !== '0000'
          ) {

            throw new Error(
              res.Message ??
              '載入資產明細失敗'
            );
          }


          const detail =
            Array.isArray(res.Data)
              ? res.Data[0]
              : res.Data;


          if (!detail) {

            throw new Error(
              '查無資產明細'
            );
          }


          return {
            detail,
            choose,
          };
        })
      );
  }


  private resolveChooseRowForAssetId(
    rows: QueryFAASSETChooseListASS13060Response[],
    assetId: string
  ): QueryFAASSETChooseListASS13060Response | null {

    const target =
      assetId.trim();


    return (
      rows.find(
        row =>
          String(
            row.ASSET_ID ??
            ''
          ).trim() === target
      ) ??
      null
    );
  }


  // ============================================================
  // Detail Mapping
  // ============================================================

  /**
   * detailASS13010
   * →
   * 資產基本資料
   */
  private mapDetailASS13010ToFormFields(
    d: DetailASS13010Response
  ) {

    const depreYn =
      d.DEPRE_YN;


    return {

      goodsId:
        d.GOODS_ID ??
        null,

      assetStatus:
        d.ASSET_STATUS ??
        null,

      assetType:
        depreYn != null &&
          String(
            depreYn
          ).trim() !== ''
          ? String(
            depreYn
          )
          : null,

      acpNo:
        d.DEPRE_ID ??
        null,

      poNo:
        d.SUBPOENA_ID ??
        null,

      buyDate:
        d.GET_DATE
          ? new Date(
            d.GET_DATE
          )
          : null,

      buyAmt:
        d.GET_COST ??
        null,

      vendorNo:
        d.SUPPLIER_ID ??
        null,

      deviceNo:
        d.EQUIP_ID ??
        null,

      accNoDr:
        d.STYPE_D ??
        null,

      accNoCr:
        d.STYPE_C ??
        null,

      txnDate:
        d.BILL_DATE
          ? new Date(
            d.BILL_DATE
          )
          : null,

      residualAmt:
        d.RESI_VALUE ??
        null,

      locNo:
        d.LOCATION_ID ??
        null,

      maintContractNo:
        d.FIX_N ??
        null,

      assetRemark:
        d.NOTES ??
        null,


      // ========================================================
      // 處分資訊
      // ========================================================

      soldDate:
        d.HANDLE_DATE
          ? new Date(
            d.HANDLE_DATE
          )
          : null,

      soldVendorNo:
        d.HANDLE_VENDOR ??
        null,

      soldVoucherNo:
        d.HANDLE_VID ??
        null,

      soldAmtTax:
        d.ONSALE_AMT ??
        null,

      soldRemark:
        d.HANDLE_NOTE ??
        null,
    };
  }


  /**
   * ChooseList
   * →
   * 折舊 / 保管資訊
   */
  private mapChooseToFormFields(
    choose: QueryFAASSETChooseListASS13060Response
  ) {

    return {

      deprAccNo:
        choose.STYPE_ID ??
        null,

      accuDeprAccNo:
        choose.STYPE_ID2 ??
        null,

      deprYears:
        choose.FIR_EXP_YEAR ??
        null,

      chgYears:
        choose.UPD_EXP_YEAR_SUM ??
        null,

      amortAmt:
        choose.SUM_DEPRE_AMOUNT ??
        null,

      amortMonths:
        choose.SUM_DEPRE_MONTH ??
        null,

      chgAmt:
        choose.ChangeAmt ??
        null,

      deprDue:
        Number(
          choose.DEPRE_YM_E ??
          ''
        ) ||
        null,

      keepUserNo:
        choose.HOLD_EMP_ID ??
        null,

      keepOrgId:
        choose.HOLD_ORG_ID ??
        null,

      useUserNo:
        choose.USE_EMP_ID ??
        null,

      useOrgId:
        choose.USE_ORG_ID ??
        null,
    };
  }


  /**
   * ============================================================
   * Create Patch
   * ============================================================
   *
   * Create 選資產時：
   *
   * 不要把 FAASSET 原本的 HANDLE_* 帶入新增表單。
   *
   * 因為新增的處分資料要讓使用者自己輸入。
   */
  private patchCreateAssetDetail(
    detail: DetailASS13010Response,
    choose: QueryFAASSETChooseListASS13060Response
  ): void {

    const d =
      this.mapDetailASS13010ToFormFields(
        detail
      );


    const c =
      this.mapChooseToFormFields(
        choose
      );


    this.dataForm.patchValue(
      {

        // 資產
        goodsId:
          d.goodsId,

        assetStatus:
          d.assetStatus,

        assetType:
          d.assetType,

        acpNo:
          d.acpNo,


        // 採購
        poNo:
          d.poNo,

        buyDate:
          d.buyDate,

        buyAmt:
          d.buyAmt,

        chgAmt:
          c.chgAmt,

        vendorNo:
          d.vendorNo,

        deviceNo:
          d.deviceNo,


        // 會計
        accNoDr:
          d.accNoDr,

        accNoCr:
          d.accNoCr,

        txnDate:
          d.txnDate,


        // 折舊
        deprAccNo:
          c.deprAccNo,

        accuDeprAccNo:
          c.accuDeprAccNo,

        deprYears:
          c.deprYears,

        chgYears:
          c.chgYears,

        residualAmt:
          d.residualAmt,

        deprDue:
          c.deprDue,

        amortAmt:
          c.amortAmt,

        amortMonths:
          c.amortMonths,

        unamortAmt:
          this.computeUnamortAmt(
            d.buyAmt,
            c.chgAmt,
            c.amortAmt
          ),


        // 保管
        keepUserNo:
          c.keepUserNo,

        keepOrgId:
          c.keepOrgId,

        useUserNo:
          c.useUserNo,

        useOrgId:
          c.useOrgId,


        // 其他
        locNo:
          d.locNo,

        maintContractNo:
          d.maintContractNo,

        assetRemark:
          d.assetRemark,


        /**
         * ★ Create 不帶以下資料：
         *
         * soldDate
         * soldVendorNo
         * soldVoucherNo
         * soldAmtTax
         * soldRemark
         */
      },
      {
        emitEvent: false,
      }
    );
  }


  /**
   * ============================================================
   * View / Edit Patch
   * ============================================================
   *
   * detailASS13010 回來後：
   *
   * 資產資訊
   * +
   * HANDLE_DATE
   * HANDLE_VENDOR
   * HANDLE_VID
   * ONSALE_AMT
   * HANDLE_NOTE
   *
   * 全部帶入。
   */
  private patchViewDetail(
    detail: DetailASS13010Response
  ): void {

    const d =
      this.mapDetailASS13010ToFormFields(
        detail
      );


    /**
     * rowdata 原本可能已經從
     * FAASSSALEM 取得變賣資訊。
     *
     * detail 如果有值就優先使用 detail，
     * detail 是 null 則保留 rowdata。
     */
    const current =
      this.dataForm.getRawValue();


    this.dataForm.patchValue(
      {

        // 資產
        goodsId:
          d.goodsId,

        assetStatus:
          d.assetStatus,

        assetType:
          d.assetType,

        acpNo:
          d.acpNo,


        // 採購
        poNo:
          d.poNo,

        buyDate:
          d.buyDate,

        buyAmt:
          d.buyAmt,

        vendorNo:
          d.vendorNo,

        deviceNo:
          d.deviceNo,


        // 會計
        accNoDr:
          d.accNoDr,

        accNoCr:
          d.accNoCr,

        txnDate:
          d.txnDate,


        residualAmt:
          d.residualAmt,

        locNo:
          d.locNo,

        maintContractNo:
          d.maintContractNo,

        assetRemark:
          d.assetRemark,


        // ======================================================
        // ★ 變賣資訊
        // ======================================================

        soldDate:
          d.soldDate ??
          current.soldDate ??
          null,

        soldVendorNo:
          d.soldVendorNo ??
          current.soldVendorNo ??
          null,

        soldVoucherNo:
          d.soldVoucherNo ??
          current.soldVoucherNo ??
          null,

        soldAmtTax:
          d.soldAmtTax ??
          current.soldAmtTax ??
          null,

        soldRemark:
          d.soldRemark ??
          current.soldRemark ??
          null,
      },
      {
        emitEvent: false,
      }
    );


    console.log(
      '[ASS13080] detail patched',
      this.dataForm.getRawValue()
    );
  }


  // ============================================================
  // ASS13080 Query Row → Form
  // ============================================================

  private patchFormFromRow(
    row: Partial<ASS13080Detail>
  ): void {

    /**
     * 因為 model 可能還沒補欄位，
     * 先兼容目前欄位。
     */
    const r =
      row as Partial<ASS13080Detail> & {

        ASSET_PK_ID?: number | null;

        SALDATE?: string | Date | null;

        BUYER_VENNO?: string | null;

        Voucher_No?: string | null;

        SALE_AMT?: number | null;

        HANDLE_DATE?: string | Date | null;

        HANDLE_VENDOR?: string | null;

        HANDLE_VID?: string | null;

        ONSALE_AMT?: number | null;

        HANDLE_NOTE?: string | null;
      };


    this.dataForm.patchValue(
      {

        /**
         * FAASSSALEM.ID
         *
         * 取消 / 審核使用。
         */
        id:
          r.ID ??
          null,


        soldNo:
          r.ASSET_SALENO ??
          null,


        assetNo:
          r.ASSET_ID ??
          null,


        /**
         * Query 基本資料
         */
        goodsId:
          r.GOODS_ID ??
          null,

        assetStatus:
          r.ASSET_STATUS ??
          null,

        assetType:
          r.ASSET_TYPE != null
            ? String(
              r.ASSET_TYPE
            )
            : null,

        acpNo:
          r.DEPRE_ID ??
          null,

        buyAmt:
          r.GET_COST ??
          null,

        keepUserNo:
          r.HOLD_EMP_ID ??
          null,

        keepOrgId:
          r.HOLD_ORG_ID ??
          null,

        useUserNo:
          r.USE_EMP_ID ??
          null,

        useOrgId:
          r.USE_ORG_ID ??
          null,


        // ======================================================
        // 變賣資訊
        // ======================================================

        /**
         * 第一來源：
         * FAASSSALEM.SALDATE
         *
         * 第二來源：
         * FAASSET.HANDLE_DATE
         */
        soldDate:
          r.SALDATE
            ? new Date(
              r.SALDATE
            )
            : r.HANDLE_DATE
              ? new Date(
                r.HANDLE_DATE
              )
              : null,


        /**
         * 第一來源：
         * FAASSSALEM.BUYER_VENNO
         *
         * 第二來源：
         * FAASSET.HANDLE_VENDOR
         */
        soldVendorNo:
          r.BUYER_VENNO ??
          r.HANDLE_VENDOR ??
          null,


        soldVoucherNo:
          r.Voucher_No ??
          r.HANDLE_VID ??
          null,


        /**
         * 第一來源：
         * FAASSSALEM.SALE_AMT
         *
         * 第二來源：
         * FAASSET.ONSALE_AMT
         */
        soldAmtTax:
          r.SALE_AMT ??
          r.ONSALE_AMT ??
          null,


        /**
         * HANDLE_NOTE 現在存於 FAASSET。
         *
         * 所以第一次 rowdata 可能沒有，
         * detailASS13010 回來後會再補。
         */
        soldRemark:
          r.HANDLE_NOTE ??
          null,
      },
      {
        emitEvent: false,
      }
    );
  }


  // ============================================================
  // 清除資產欄位
  // ============================================================

  private clearAssetDerivedFieldsForCreate(): void {

    this.dataForm.patchValue(
      {

        goodsId:
          null,

        assetStatus:
          null,

        assetType:
          null,

        acpNo:
          null,

        poNo:
          null,

        buyDate:
          null,

        buyAmt:
          null,

        chgAmt:
          null,

        vendorNo:
          null,

        deviceNo:
          null,

        accNoDr:
          null,

        accNoCr:
          null,

        txnDate:
          null,

        deprAccNo:
          null,

        accuDeprAccNo:
          null,

        deprYears:
          null,

        chgYears:
          null,

        residualAmt:
          null,

        deprDue:
          null,

        unamortAmt:
          null,

        amortAmt:
          null,

        amortMonths:
          null,

        keepUserNo:
          null,

        keepOrgId:
          null,

        useUserNo:
          null,

        useOrgId:
          null,

        locNo:
          null,

        maintContractNo:
          null,

        assetRemark:
          null,
      },
      {
        emitEvent: false,
      }
    );
  }


  private computeUnamortAmt(
    buyAmt: number | null,
    chgAmt: number | null,
    amortAmt: number | null
  ): number | null {

    const result =
      (buyAmt ?? 0) +
      (chgAmt ?? 0) -
      (amortAmt ?? 0);


    return Number.isFinite(result)
      ? result
      : null;
  }


  // ============================================================
  // Dropdown
  // ============================================================

  private toOpt(
    items: {
      No?: string | null;
      Name?: string | null;
    }[]
  ) {

    return (
      items ?? []
    ).map(
      item => ({

        value:
          item.No ??
          '',

        label:
          `${item.No ?? ''} - ${item.Name ?? ''}`,
      })
    );
  }


  private faAssetChooseListToOpts(
    rows: QueryFAASSETChooseListASS13060Response[]
  ) {

    return (
      rows ?? []
    ).map(
      row => ({

        value:
          row.ASSET_ID ??
          '',

        label:
          `${row.ASSET_ID ?? ''} - ${row.AssetName ?? ''}`,
      })
    );
  }


  private loadDropdownOptions(): void {

    // ==========================================================
    // 資產
    // ==========================================================

    const assetListReq:
      QueryFAASSETChooseListASS13060Request = {

      PageSize:
        9999,

      PageIndex:
        1,
    };


    this.ass13080Service
      .queryFAASSETChooseListASS13060(
        assetListReq
      )
      .pipe(
        untilDestroyed(this)
      )
      .subscribe(res => {

        if (
          res.Status !== '0000'
        ) {
          return;
        }


        const rows =
          (res.Data ?? []).filter(
            row =>
              String(row.MATERIAL_TYPE ?? '').trim() !== '4'
          );


        this.assetsOptions =
          this.faAssetChooseListToOpts(
            rows
          );


        /**
         * View/Edit：
         *
         * 已變賣資產可能已不在 ChooseList，
         * 但 Dropdown 還是要顯示資產編號。
         */
        if (
          this.crudstatus !==
          CRUDStatus.Create
        ) {

          const currentAssetId =
            String(
              this.df()
                .assetNo
                .value ??
              ''
            ).trim();


          if (
            currentAssetId &&
            !this.assetsOptions.some(
              x =>
                x.value ===
                currentAssetId
            )
          ) {

            this.assetsOptions = [

              {
                value:
                  currentAssetId,

                label:
                  currentAssetId,
              },

              ...this.assetsOptions,
            ];
          }
        }
      });


    // ==========================================================
    // 品項
    // ==========================================================

    const q11040:
      QueryASS11040Request = {

      PageSize:
        9999,

      PageIndex:
        1,
    };


    this.ass11040Service
      .queryASS11040(
        q11040
      )
      .pipe(

        untilDestroyed(this),

        map(
          res =>
            (
              res.Data as
              | QueryASS11040DataWrapper
              | null
              | undefined
            )?.QueryData ??
            []
        ),

        map(
          (
            rows:
              QueryASS11040Response[]
          ) =>
            rows

              .filter(
                row =>
                  String(
                    row.GOODS_ID ??
                    ''
                  ).trim() !== ''
              )

              .map(
                row => ({

                  value:
                    String(
                      row.GOODS_ID ??
                      ''
                    ),

                  label:
                    `${row.GOODS_ID ?? ''} - ${row.GOODS_NAME ?? ''}`,
                })
              )
        )
      )
      .subscribe(
        options => {

          this.goodsOptions =
            options;


          const currentGoodsId =
            String(
              this.df()
                .goodsId
                .value ??
              ''
            ).trim();


          if (
            currentGoodsId &&
            !this.goodsOptions.some(
              x =>
                x.value ===
                currentGoodsId
            )
          ) {

            this.goodsOptions = [

              {
                value:
                  currentGoodsId,

                label:
                  currentGoodsId,
              },

              ...this.goodsOptions,
            ];
          }
        }
      );


    // ==========================================================
    // 資產狀態
    // ==========================================================

    this.dropDownListService
      .querySYS1000_DropDownList({
        SYS_Type:
          'ASSET_STATUS',
      } as ISYS1000Request)
      .pipe(
        untilDestroyed(this)
      )
      .subscribe(res => {

        if (
          res.Status !== '0000'
        ) {
          return;
        }


        this.assetStatusOptions =
          this.toOpt(
            res.Data ??
            []
          );
      });


    // ==========================================================
    // 組織
    // ==========================================================

    this.dropDownListService
      .querySYS3100_DropDownList()
      .pipe(
        untilDestroyed(this)
      )
      .subscribe(res => {

        if (
          res.Status !== '0000'
        ) {
          return;
        }


        this.orgOptions =
          this.toOpt(
            res.Data ??
            []
          );
      });


    // ==========================================================
    // 人員
    // ==========================================================

    this.dropDownListService
      .queryTBLUSER_DropDownList()
      .pipe(
        untilDestroyed(this)
      )
      .subscribe(res => {

        if (
          res.Status !== '0000'
        ) {
          return;
        }


        this.userOptions =
          this.toOpt(
            res.Data ??
            []
          );
      });


    // ==========================================================
    // 會計科目
    // ==========================================================

    this.dropDownListService
      .queryGLS1005_DropDownList()
      .pipe(
        untilDestroyed(this)
      )
      .subscribe(res => {

        if (
          res.Status !== '0000'
        ) {
          return;
        }


        this.accOptions =
          this.toOpt(
            res.Data ??
            []
          );
      });


    // ==========================================================
    // 變賣廠商
    // ==========================================================

    this.dropDownListService
      .queryPOS2013_DropDownList(
        {} as IPOS2013Request
      )
      .pipe(
        untilDestroyed(this)
      )
      .subscribe(res => {

        if (
          res.Status !== '0000'
        ) {
          return;
        }


        /**
         * 你目前送出的 BUYER_VENNO：
         *
         * 00087184
         *
         * 與 POS2013 Dropdown 的 No 相同，
         * 所以這裡使用 No 是正確的。
         */
        this.vendorOptions =
          this.toOpt(
            res.Data ??
            []
          );


        /**
         * 查看舊資料時，
         * 如果目前值已不存在下拉，
         * 至少補一筆避免顯示空白。
         */
        const currentVendorNo =
          String(
            this.df()
              .soldVendorNo
              .value ??
            ''
          ).trim();


        if (
          currentVendorNo &&
          !this.vendorOptions.some(
            x =>
              x.value ===
              currentVendorNo
          )
        ) {

          this.vendorOptions = [

            {
              value:
                currentVendorNo,

              label:
                currentVendorNo,
            },

            ...this.vendorOptions,
          ];
        }
      });
  }


  // ============================================================
  // Create 欄位權限
  // ============================================================

  private disableReadonlyFieldsForCreate(): void {

    const readonlyControls = [

      this.df().soldNo,

      /**
       * assetNo 不 disable
       */

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


    readonlyControls.forEach(
      control =>
        control.disable({
          emitEvent: false,
        })
    );
  }


  // ============================================================
  // 新增
  // ============================================================

  onCreateSold(): void {

    if (
      !this.isFormCreateable
    ) {
      return;
    }


    if (
      this.dataForm.invalid
    ) {

      this.submitted =
        true;


      this.messageService.errorBubble(
        '表單驗證失敗，請檢查必填欄位'
      );


      return;
    }


    const raw =
      this.dataForm.getRawValue();


    if (!raw.assetNo) {

      this.messageService.warnBubble(
        '缺少資產代號，無法送出'
      );

      return;
    }


    if (!raw.soldVendorNo) {

      this.messageService.warnBubble(
        '缺少變賣廠商，無法送出'
      );

      return;
    }


    const payload:
      CreateASS13080Request = {

      ASSET_ID:
        raw.assetNo,

      SALDATE:
        raw.soldDate
          ? raw.soldDate.toISOString()
          : '',

      BUYER_VENNO:
        raw.soldVendorNo,

      SALE_AMT:
        raw.soldAmtTax ??
        0,

      HANDLE_NOTE:
        raw.soldRemark ??
        undefined,
    };


    console.log(
      '[ASS13080] Insert payload',
      payload
    );


    this.messageService.confirm({

      header:
        '確認變賣',

      message:
        '是否確認變賣？',

      accept: () => {

        this.messageService.blockUi();

        this.loading =
          true;


        this.ass13080Service
          .insertASS13080(
            payload
          )
          .pipe(

            untilDestroyed(this),

            finalize(() => {

              this.loading =
                false;

              this.messageService
                .unblockUi();
            })
          )
          .subscribe({

            next: res => {

              if (
                res.Status !==
                '0000'
              ) {

                this.messageService.errorBubble(
                  '操作失敗：' +
                  (
                    res.Message ??
                    ''
                  )
                );

                return;
              }


              this.messageService.successBubble(
                '新增成功'
              );


              this.onCancel(
                res.Data
              );
            },


            error: () => {

              this.messageService.errorBubble(
                '操作失敗：請稍後再試'
              );
            },
          });
      },
    });
  }


  // ============================================================
  // 取消變賣
  // ============================================================

  onCancelSold(): void {

    if (
      !this.isFormEditable &&
      !this.isFormReadable
    ) {
      return;
    }


    /**
     * 這個 ID 是：
     *
     * FAASSSALEM.ID
     *
     * 不是 FAASSET.ID。
     */
    const id =
      this.dataForm
        .getRawValue()
        .id;


    if (!id) {

      this.messageService.warnBubble(
        '缺少變賣單 ID，無法取消變賣'
      );

      return;
    }


    const payload:
      CancelASS13080Request = {

      ID:
        id,
    };


    this.messageService.confirm({

      header:
        '取消變賣',

      message:
        '是否確認取消變賣？',

      accept: () => {

        this.messageService.blockUi();

        this.loading =
          true;


        this.ass13080Service
          .cancelASS13080(
            payload
          )
          .pipe(

            untilDestroyed(this),

            finalize(() => {

              this.loading =
                false;

              this.messageService
                .unblockUi();
            })
          )
          .subscribe({

            next: res => {

              if (
                res.Status !==
                '0000'
              ) {

                this.messageService.errorBubble(
                  '操作失敗：' +
                  (
                    res.Message ??
                    ''
                  )
                );

                return;
              }


              this.messageService.successBubble(
                '取消成功'
              );


              this.onCancel();
            },


            error: () => {

              this.messageService.errorBubble(
                '操作失敗：請稍後再試'
              );
            },
          });
      },
    });
  }


  // ============================================================
  // 審核
  // ============================================================

  onApproveSold(): void {

    if (
      !this.isFormEditable &&
      !this.isFormReadable
    ) {
      return;
    }


    /**
     * 同樣是 FAASSSALEM.ID。
     */
    const id =
      this.dataForm
        .getRawValue()
        .id;


    if (!id) {

      this.messageService.warnBubble(
        '缺少變賣單 ID，無法審核'
      );

      return;
    }


    const payload:
      ApproveASS13080Request = {

      ID:
        id,
    };


    this.messageService.confirm({

      header:
        '變賣審核',

      message:
        '是否確認進行變賣審核？',

      accept: () => {

        this.messageService.blockUi();

        this.loading =
          true;


        this.ass13080Service
          .approveASS13080(
            payload
          )
          .pipe(

            untilDestroyed(this),

            finalize(() => {

              this.loading =
                false;

              this.messageService
                .unblockUi();
            })
          )
          .subscribe({

            next: res => {

              if (
                res.Status !==
                '0000'
              ) {

                this.messageService.errorBubble(
                  '操作失敗：' +
                  (
                    res.Message ??
                    ''
                  )
                );

                return;
              }


              this.messageService.successBubble(
                '審核成功'
              );


              this.onCancel();
            },


            error: () => {

              this.messageService.errorBubble(
                '操作失敗：請稍後再試'
              );
            },
          });
      },
    });
  }
}