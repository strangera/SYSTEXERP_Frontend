import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import {
  ASS11060Service,
  DetailASS11060Response,
  QueryASS11060Response,
  UpdateASS11060Request
} from '../../../service/api/ass/ass11060.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/components/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { InputTextareaComponent } from '../../../shared/components/input-textarea/input-textarea.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';

//3.1.1.6 供應商資料維護作業 CRU
@Component({
  selector: 'app-ass11060-cru',
  templateUrl: './ass11060-cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    InputNumberComponent,
    DropdownComponent,
    InputTextareaComponent,
    ButtonComponent,
    TranslateModule,
  ]
})
export class ASS11060CRUComponent extends BasicCruPageComponent<QueryASS11060Response> implements OnInit {

  detailData: DetailASS11060Response | null = null;

  dataForm = this.formBuilder.nonNullable.group({

    // =========================
    // 基本資料 - 僅顯示，不可修改
    // =========================

    /** 廠商編號 */
    VEN_No: [{ value: '', disabled: true }],

    /** 統一編號 */
    VEN_Uniform: [{ value: '', disabled: true }],

    /** 廠商名稱/姓名(中文) */
    VEN_Name: [{ value: '', disabled: true }],

    /** 廠商名稱/姓名(英文) */
    VEN_EngName: [{ value: '', disabled: true }],

    /** 廠商簡稱 */
    VEN_ShortName: [{ value: '', disabled: true }],

    // =========================
    // 公司資料 - 僅顯示，不可修改
    // =========================

    /** 公司登記地址 */
    VEN_GUIAddr: [{ value: '', disabled: true }],

    /** 通訊地址 */
    VEN_PostAddr: [{ value: '', disabled: true }],

    /** 公司登記電話 */
    VEN_Tel: [{ value: '', disabled: true }],

    /** 公司傳真 */
    VEN_Fax: [{ value: '', disabled: true }],

    // =========================
    // 付款資料 - 僅顯示，不可修改
    // =========================
    /** 銀行代號 */
    VEN_BNK_No: [{ value: '', disabled: true }],

    /** 銀行分行代號 */
    VEN_BNK_BranchNo: [{ value: '', disabled: true }],

    /** 銀行帳號 */
    VEN_BankAccountNo: [{ value: '', disabled: true }],
    // =========================
    // 原本欄位 - 可修改
    // =========================

    /** 訂貨地址 */
    ORDER_ADDR: ['', [Validators.maxLength(100)]],

    /** 訂貨電話 */
    ORDER_TEL: ['', [Validators.maxLength(12)]],

    /** 訂貨傳真 */
    ORDER_FAX: ['', [Validators.maxLength(12)]],

    /** 工廠地址 */
    FACTO_ADDR: ['', [Validators.maxLength(100)]],

    /** 工廠電話 */
    FACTO_TEL: ['', [Validators.maxLength(12)]],

    /** 工廠傳真 */
    FACTO_FAX: ['', [Validators.maxLength(12)]],

    /** 送貨方式 */
    DELIVERY: [null as string | null],

    /** 廠商送貨期限（只能 1 碼：0–9） */
    DELIVERY_LIMIT: [
      null as number | null,
      [
        Validators.min(0),
        Validators.max(9)
      ]
    ],

    /** 退貨處理方式 */
    RETURN_ORDER: [null as string | null],

    /** 附註 */
    VEN_Remark: [''],
  });

  /** 送貨方式下拉選項 */
  deliveryMethodOptions = [
    { value: '1', label: '自行送貨' },
    { value: '2', label: '貨運' },
    { value: '3', label: '快遞' },
    { value: '4', label: '其它' },
  ];

  /** 退貨處理方式下拉選項 */
  returnMethodOptions = [
    { value: '1', label: '貨運' },
    { value: '2', label: '自取' },
    { value: '3', label: '其他' },
  ];

  constructor(
    private readonly ass11060Service: ASS11060Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS11060', this.dataForm);
    this.loadDetail();
  }

  private loadDetail(): void {
    const venNo = this.rowdata?.VEN_No;
    const venUniform = (this.rowdata as DetailASS11060Response)?.VEN_Uniform;

    if (!venNo || !venUniform) {
      return;
    }

    this.loading = true;

    this.ass11060Service
      .detailASS11060({
        VEN_No: venNo,
        VEN_Uniform: venUniform
      })
      .pipe(
        finalize(() => this.loading = false),
        untilDestroyed(this),
      )
      .subscribe({
        next: (res) => {
          if (res.Status !== '0000' || !res.Data) {
            return;
          }

          this.detailData = res.Data;

          const d = res.Data;

          this.dataForm.patchValue({

            // =========================
            // 基本資料
            // =========================

            VEN_No: d.VEN_No ?? '',
            VEN_Uniform: d.VEN_Uniform ?? '',
            VEN_Name: d.VEN_Name ?? '',
            VEN_EngName: d.VEN_EngName ?? '',
            VEN_ShortName: d.VEN_ShortName ?? '',

            // =========================
            // 公司資料
            // =========================

            VEN_GUIAddr: d.VEN_GUIAddr ?? '',
            VEN_PostAddr: d.VEN_PostAddr ?? '',
            VEN_Tel: d.VEN_Tel ?? '',
            VEN_Fax: d.VEN_Fax ?? '',
            // =========================
            // 公司資料
            // =========================
            VEN_BNK_No: d.VEN_BNK_No ?? '',
            VEN_BNK_BranchNo: d.VEN_BNK_BranchNo ?? '',
            VEN_BankAccountNo: d.VEN_BankAccountNo ?? '',
            // =========================
            // 原本可修改資料
            // =========================

            ORDER_ADDR: d.VEN_ORDER_ADDR ?? '',
            ORDER_TEL: d.VEN_ORDER_TEL ?? '',
            ORDER_FAX: d.VEN_ORDER_FAX ?? '',

            FACTO_ADDR: d.VEN_FACTO_ADDR ?? '',
            FACTO_TEL: d.VEN_FACTO_TEL ?? '',
            FACTO_FAX: d.VEN_FACTO_FAX ?? '',

            DELIVERY: d.VEN_DELIVERY ?? null,
            DELIVERY_LIMIT: d.VEN_DELIVERY_LIMIT ?? null,
            RETURN_ORDER: d.VEN_RETURN_ORDER ?? null,

            VEN_Remark: d.VEN_Remark ?? '',
          });
        },
      });
  }

  onSubmit(): void {
    this.handleSubmit(this.dataForm, () => {

      const rawValue = this.dataForm.getRawValue();

      /**
       * 只送原本允許修改的欄位。
       * 上方新增的基本資料、公司資料均不更新。
       */
      const payload: UpdateASS11060Request = {

        VEN_No: this.rowdata?.VEN_No ?? '',

        ORDER_ADDR: rawValue.ORDER_ADDR || null,
        ORDER_TEL: rawValue.ORDER_TEL || null,
        ORDER_FAX: rawValue.ORDER_FAX || null,

        FACTO_ADDR: rawValue.FACTO_ADDR || null,
        FACTO_TEL: rawValue.FACTO_TEL || null,
        FACTO_FAX: rawValue.FACTO_FAX || null,

        DELIVERY: rawValue.DELIVERY || null,
        DELIVERY_LIMIT: rawValue.DELIVERY_LIMIT ?? null,
        RETURN_ORDER: rawValue.RETURN_ORDER || null,

        VEN_Remark: rawValue.VEN_Remark || null,
      };

      this.loading = true;

      this.ass11060Service
        .updateASS11060(payload)
        .pipe(
          finalize(() => {
            this.loading = false;
            this.messageService.unblockUi();
          }),
          untilDestroyed(this),
        )
        .subscribe({
          next: () => {
            this.messageService.successBubble('編輯成功');
            this.onCancel();
          },
          error: (err) => {
            this.messageService.errorBubble(
              '操作失敗：' + (err.message || '未知錯誤')
            );
          },
        });
    });
  }
}