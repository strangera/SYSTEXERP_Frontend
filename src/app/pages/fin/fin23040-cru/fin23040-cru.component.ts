import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';

import { getSYS1000Options$ } from '@service/system/sys1000.service';
import { Option } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import {
  DetailFIN23040Response,
  Fin23040Service,
  QueryFIN23040Type1Response,
  QueryFIN23040Type2Response,
  QueryFIN23040Type3Response,
  SaveFIN23040Request,
} from '../../../service/api/fin/fin23040.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarComponent } from '../../../shared/components/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/components/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

//1.2.3.4 暫付款核銷作業 CRU
@Component({
  selector: 'app-fin23040-cru',
  templateUrl: './fin23040-cru.component.html',
  standalone: true,
  imports: [MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, InputNumberComponent, DropdownComponent,
    InputTextComponent, CalendarComponent, ButtonComponent, AsyncPipe, TranslateModule]
})
export class FIN23040CRUComponent extends BasicCruPageComponent<QueryFIN23040Type1Response> implements OnInit {
  private readonly fin23040Service = inject(Fin23040Service);
  private readonly dropdown = inject(DropdownApiService);
  private readonly datePipe = inject(DatePipe);
  private readonly destroyRef = inject(DestroyRef);

  readonly CRUDStatus = CRUDStatus;

  // ----------------------------------------------------------------
  dataForm = this.formBuilder.group({
    redeemNo: [{ value: '', disabled: true }], // 核銷單號(系統自動產生/既有單號，唯讀)
    prepNo: [null as string | null, [Validators.required]], // 預支單號
    prepAmt: [{ value: null as number | null, disabled: true }], // 預支金額(顯示用)
    accNo: [null as string | null, [Validators.required]], // 費用會計科目
    purRemark: ['', [Validators.required, Validators.maxLength(100)]], // 項目摘要
    acpType: [null as string | null, [Validators.required]], // 明細類別
    purVoucherType: [null as string | null], // 發票格式
    purGUINo: [null as string | null, [Validators.maxLength(10)]], // 發票號碼
    purGUIDate: [null as Date | null, [Validators.required]], // 發票日期
    purExpGLDate: [null as Date | null, [Validators.required]], // 申報年月
    purVenUniform: [null as string | null, [Validators.maxLength(8)]], // 廠商統一編號
    purDirectType: [null as string | null], // 發票用途
    purAmt: [null as number | null], // 發票總金額
    purTaxType: [null as string | null, [Validators.required]], // 課稅別
    purNet: [null as number | null, [Validators.required]], // 發票未稅金額
    purTax: [null as number | null], // 發票稅額
    projectNo: [null as string | null, [Validators.maxLength(20)]], // 活動代碼
    purDiscNo: [null as string | null], // 扣抵代號
    purType: [null as string | null], // 類別區分
    purCombCnt: [null as number | null], // 彙總張數
  });

  readonly accNoOptions$ = this.dropdown.queryFasAccNoDropdown();
  readonly acpTypeOptions$ = getSYS1000Options$(this.systemDataService, 'ACP_Type');
  readonly purVoucherTypeOptions$ = getSYS1000Options$(this.systemDataService, 'PUR_VoucherType');
  readonly purVenUniformOptions$ = this.dropdown.queryPos2013VenUniform();
  readonly purDirectTypeOptions$ = getSYS1000Options$(this.systemDataService, 'PUR_DirectType');
  readonly purTaxTypeOptions$ = getSYS1000Options$(this.systemDataService, 'PUR_TaxType');
  // 活動代碼：目前不確定 pod_typeList/pod_statusList 篩選條件的正確值，先以空陣列(不篩選)呼叫，後續如需限定類型/狀態再調整
  readonly projectNoOptions$ = this.dropdown.queryTALPORDERM_DropDownList({ pod_typeList: [], pod_statusList: [] });
  readonly purDiscNoOptions$ = getSYS1000Options$(this.systemDataService, 'PUR_DiscNo');
  readonly purTypeOptions$ = getSYS1000Options$(this.systemDataService, 'PUR_Type');

  /** 新增模式下，可核銷的預支單號選項(來自 Type=2 查詢) */
  prepNoOptions: Option[] = [];

  /** 目前核銷單號(修改模式使用) */
  private currentRedeemNo: string | null = null;
  /** 是否允許刪修(對應清單 YN 欄位，'N'=已結案不可刪修) */
  private canEditRow = true;

  constructor() {
    super();
  }

  ngOnInit(): void {
    // 不把 dataForm 傳給 initializePage：清單頁傳回的列資料欄位命名(preP_NO/redeeM_NO/redeemAmt)與本頁表單不同，
    // 交由本頁自行依情境(新增/修改)取得完整資料後再 patch。
    this.initializePage('FIN23040');

    switch (this.crudstatus) {
      case CRUDStatus.Create:
        this.loadPendingPrepNoOptions();
        this.dataForm.controls.prepNo.valueChanges.pipe(
          takeUntilDestroyed(this.destroyRef),
        ).subscribe(prepNo => this.onPrepNoChanged(prepNo));
        break;
      case CRUDStatus.Edit:
      case CRUDStatus.Read:
        this.loadDetail();
        break;
    }
  }

  /** 新增模式：載入尚未核銷的預支單號下拉(呼叫 SP_FIN23040Query Type=2) */
  private loadPendingPrepNoOptions(): void {
    this.loading = true;
    this.fin23040Service.queryFIN23040({ Type: 2 }).pipe(
      finalize(() => (this.loading = false)),
    ).subscribe({
      next: res => {
        const rows = (res.Data ?? []) as QueryFIN23040Type2Response[];
        this.prepNoOptions = rows.map(r => ({
          label: `${r.preP_NO} - ${r.veN_Name ?? ''}`,
          value: r.preP_NO,
        }));
      },
      error: () => {
        this.messageService.errorBubble('載入待核銷預支單號清單失敗，請稍後再試。', '載入失敗');
      },
    });
  }

  /** 新增模式：選定預支單號後，查詢該單預支金額(呼叫 SP_FIN23040Query Type=3) */
  private onPrepNoChanged(prepNo: string | null): void {
    if (!prepNo) {
      this.dataForm.patchValue({ prepAmt: null });
      return;
    }
    this.fin23040Service.queryFIN23040({ Type: 3, PREP_NO: prepNo }).subscribe({
      next: res => {
        const row = (res.Data ?? [])[0] as QueryFIN23040Type3Response | undefined;
        this.dataForm.patchValue({ prepAmt: row?.preP_Amt ?? null });
      },
      error: () => {
        this.messageService.errorBubble('查詢預支金額失敗，請稍後再試。', '查詢失敗');
      },
    });
  }

  /** 修改/顯示模式：從清單列資料(redeeM_NO/preP_NO)載入核銷明細(呼叫 SP_FIN23040Detail) */
  private loadDetail(): void {
    const row = this.rowdata;
    const redeemNo = row?.redeeM_NO;
    const prepNo = row?.preP_NO;
    if (!redeemNo || !prepNo) {
      this.messageService.warnBubble('缺少核銷單號/預支單號，無法載入資料。');
      return;
    }
    this.currentRedeemNo = redeemNo;
    this.canEditRow = row?.yn !== 'N';
    this.prepNoOptions = [{ label: `${prepNo}`, value: prepNo }];
    this.dataForm.patchValue({
      redeemNo,
      prepNo,
      prepAmt: row?.redeemAmt ?? null,
    });

    this.loading = true;
    this.fin23040Service.detailFIN23040({ REDEEM_NO: redeemNo, PREP_NO: prepNo }).pipe(
      finalize(() => (this.loading = false)),
    ).subscribe({
      next: res => {
        const d: DetailFIN23040Response | undefined = res.Data?.[0];
        if (!d) {
          this.messageService.warnBubble('查無此筆暫付款核銷明細資料。');
          return;
        }
        this.dataForm.patchValue({
          accNo: d.accNo,
          purRemark: d.remark,
          acpType: d.acP_Type,
          purVoucherType: d.puR_VoucherType,
          purGUINo: d.puR_GUINo,
          purGUIDate: d.puR_GUIDate ? new Date(d.puR_GUIDate) : null,
          purExpGLDate: this.parseYearMonth(d.puR_ExpGLDate),
          purVenUniform: d.puR_VenUniform,
          purDirectType: d.puR_DirectType,
          purAmt: d.puR_Amt,
          purTaxType: d.puR_TaxType,
          purNet: d.puR_Net,
          purTax: d.puR_Tax,
          projectNo: d.projectNo,
          purDiscNo: d.puR_DiscNo,
          purType: d.puR_Type,
          purCombCnt: d.puR_Comb_Cnt,
        });
        // 「預支單號」既有資料不可改綁其他預支單，且已結案(YN=N)或顯示模式一律鎖定唯讀
        this.dataForm.controls.prepNo.disable();
        if (this.crudstatus === CRUDStatus.Read || !this.canEditRow) {
          this.dataForm.disable();
        }
      },
      error: () => {
        this.messageService.errorBubble('載入暫付款核銷明細失敗，請稍後再試。', '載入失敗');
      },
    });
  }

  // ----------------------------------------------------------------
  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => this.doSave());
  }

  private doSave(): void {
    const v = this.dataForm.getRawValue();
    const storeNo = this.authService.currentUserValue?.SYS_StoreNo || '10';

    const payload: SaveFIN23040Request = {
      ActionMode: this.crudstatus === CRUDStatus.Create ? 'I' : 'U',
      STO_No: storeNo,
      PREP_NO: v.prepNo ?? '',
      REDEEM_NO: this.crudstatus === CRUDStatus.Create ? null : this.currentRedeemNo,
      AccNo: v.accNo ?? '',
      PUR_Remark: v.purRemark ?? '',
      ACP_Type: v.acpType ?? '',
      PUR_VoucherType: v.purVoucherType || null,
      PUR_GUINo: v.purGUINo || null,
      PUR_GUIDate: this.toDateString(v.purGUIDate),
      PUR_ExpGLDate: this.toYearMonthString(v.purExpGLDate),
      PUR_VenUniform: v.purVenUniform || null,
      PUR_DirectType: v.purDirectType || null,
      PUR_Amt: v.purAmt != null ? Number(v.purAmt) : null,
      PUR_TaxType: v.purTaxType ?? '',
      PUR_Net: Number(v.purNet ?? 0),
      PUR_Tax: v.purTax != null ? Number(v.purTax) : null,
      ProjectNo: v.projectNo || null,
      PUR_DiscNo: v.purDiscNo || null,
      PUR_Type: v.purType || null,
      PUR_Comb_Cnt: v.purCombCnt != null ? Number(v.purCombCnt) : null,
    };

    this.fin23040Service.saveFIN23040(payload).pipe(
      finalize(() => (this.loading = false)),
    ).subscribe({
      next: res => {
        if (!res.Data?.success) {
          this.messageService.errorBubble(res.Data?.message || '儲存失敗', '儲存失敗');
          return;
        }
        this.messageService.successBubble(res.Data.message || '儲存成功');
        this.onCancel();
      },
      error: () => {
        this.messageService.errorBubble('儲存暫付款核銷資料失敗，請稍後再試。', '儲存失敗');
      },
    });
  }

  private toDateString(value: Date | string | null | undefined): string {
    if (!value) return '';
    if (value instanceof Date) {
      return this.datePipe.transform(value, 'yyyy-MM-dd') ?? '';
    }
    return value;
  }

  private toYearMonthString(value: Date | string | null | undefined): string {
    if (!value) return '';
    if (value instanceof Date) {
      return this.datePipe.transform(value, 'yyyyMM') ?? '';
    }
    return value;
  }

  private parseYearMonth(value: string | null | undefined): Date | null {
    if (!value || value.length < 6) return null;
    const year = Number(value.slice(0, 4));
    const month = Number(value.slice(4, 6));
    if (!year || !month) return null;
    return new Date(year, month - 1, 1);
  }
}
