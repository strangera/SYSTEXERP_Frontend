import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PanelModule } from 'primeng/panel';
import { Observable, finalize, forkJoin, map, of, shareReplay } from 'rxjs';

import { getSYS1000Options$ } from '@service/system/sys1000.service';
import { Option } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { InputTextComponent } from 'src/app/shared/components/input-text/input-text.component';
import {
  DetailFIN23040Response,
  FIN23040InvoiceItem,
  Fin23040Service,
  QueryFIN23040Type1Response,
  QueryFIN23040Type2Response,
  QueryFIN23040Type3Response,
  SaveFIN23040Request,
} from '../../../service/api/fin/fin23040.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/components/input-number/input-number.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { TableEditComponent } from '../../../shared/components/table-edit/table-edit.component';
import { EditColumn } from '../../../shared/components/table-edit/table-edit.model';
import { validateRequired } from '../../../shared/components/table-edit/validate-field.model';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

/**
 * 暫付款核銷明細列(對應 table-edit 一列)。
 */
interface DetailRow {
  redeemNo: string | null;
  accNo: string | null;
  purRemark: string | null;
  acpType: string | null;
  purVoucherType: string | null;
  purGUINo: string | null;
  purGUIDate: Date | null;
  purExpGLDate: Date | null;
  purVenUniform: string | null;
  purDirectType: string | null;
  purAmt: number | null;
  purTaxType: string | null;
  purNet: number | null;
  purTax: number | null;
  projectNo: string | null;
  purDiscNo: string | null;
  purType: string | null;
  purCombCnt: number | null;
  _isAutoInsertCandidate?: boolean;
  _dataStatus?: string;
}

// 1.2.3.4 暫付款核銷作業 CRU
@Component({
  selector: 'app-fin23040-cru',
  templateUrl: './fin23040-cru.component.html',
  standalone: true,
  imports: [MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, InputNumberComponent, DropdownComponent,
    ButtonComponent, TableEditComponent, AsyncPipe, TranslateModule, InputTextComponent]
})
export class FIN23040CRUComponent extends BasicCruPageComponent<QueryFIN23040Type1Response> implements OnInit {
  private readonly fin23040Service = inject(Fin23040Service);
  private readonly dropdown = inject(DropdownApiService);
  private readonly datePipe = inject(DatePipe);
  private readonly destroyRef = inject(DestroyRef);
  readonly CRUDStatus = CRUDStatus;
  @ViewChild(TableEditComponent) private readonly tableEditComponent!: TableEditComponent;

  dataForm = this.formBuilder.group({
    redeemNo: [{ value: '系統自動產生', disabled: true }], // 核銷單號(系統帶出或由後端產出)
    prepNo: [null as string | null, [Validators.required]],       // 預支單號
    prepAmt: [{ value: null as number | null, disabled: true }],  // 預支金額
  });

  readonly accNoOptions$ = this.dropdown.queryGls1005_ledgerMD();
  readonly acpTypeOptions$ = getSYS1000Options$(this.systemDataService, 'PCS_DtlType');
  readonly purVoucherTypeOptions$ = getSYS1000Options$(this.systemDataService, 'PUR_VoucherType').pipe(map(options => options.filter(x => ['21', '22', '25', '26', '27'].includes(x.value))));
  readonly purVenUniformOptions$ = this.dropdown.queryPos2013VenUniform();
  readonly purDirectTypeOptions$ = getSYS1000Options$(this.systemDataService, 'PUR_DirectType');
  readonly purTaxTypeOptions$ = getSYS1000Options$(this.systemDataService, 'PUR_TaxType');
  readonly projectNoOptions$ = this.dropdown.queryTALPORDERM_DropDownList({ pod_typeList: [], pod_statusList: [] });
  readonly purDiscNoOptions$ = getSYS1000Options$(this.systemDataService, 'PUR_DiscNo');
  readonly purTypeOptions$ = getSYS1000Options$(this.systemDataService, 'PUR_Type');

  prepNoOptions$: Observable<Option[] | null> = of(null);

  data: DetailRow[] = [];
  detailDisabled = false;
  /** 核銷明細初始載入(或新增頁初始空表)後的原始快照，供「取消」按鈕還原編輯內容用 */
  private originalData: DetailRow[] = [];

  /**
   * 明細類別(acpType)="0"不扣抵憑證時，發票/收據相關欄位(號碼/日期/申報年月/課稅別/未稅金額)不需填寫，
   * 只有選「發票」(1)或「收據」(2)才強制必填(設計方式同FIN72010零用金維護作業的validateGUINoRequired，
   * 本頁因為有多個發票相關欄位而擴大套用同一條規則)。
   */
  private readonly requiredWhenInvoiceOrReceipt = (value: unknown, rowData: DetailRow, _data: unknown[], _field: string, header: string) => {
    const needRequired = rowData?.acpType === '1' || rowData?.acpType === '2';
    if (!needRequired) return { isValid: true, errorMessage: [] };
    const isValid = value !== null && value !== undefined && value !== '';
    return { isValid, errorMessage: isValid ? [] : [`${header}為必填`] };
  };
  private maxLengthRule(max: number) {
    return (value: unknown, _rowData: unknown, _data: unknown[], _field: string, header: string) => {
      const len = value ? String(value).length : 0;
      return { isValid: len <= max, errorMessage: len <= max ? [] : [`${header}長度不可超過${max}字`] };
    };
  }
  private readonly guiNoRule = (value: unknown, _rowData: unknown, _data: unknown[], _field: string, header: string) => {
    if (value === null || value === undefined || value === '') {
      return { isValid: true, errorMessage: [] };
    }
    const v = String(value).trim();
    const isValid = /^[A-Z]{2}\d{8}$/.test(v) || v === '0000000000';
    return {
      isValid,
      errorMessage: isValid ? [] : [`${header}格式錯誤，應為前2碼大寫英文+後8碼數字(如AB12345678)，或全為'0000000000'`],
    };
  };

  // 💡 表格欄位已移除「核銷單號 (redeemNo)」
  columns: EditColumn[] = [
    {
      field: 'accNo', header: '費用會計科目', width: '200px', type: 'dropdown', textAlign: 'left',
      optionsAsync: true, options: () => this.accNoOptions$, optionLabel: 'label', optionValue: 'value',
      templateLabel: 'label', validate: [validateRequired],
    },
    { field: 'purRemark', header: '項目摘要', width: '160px', type: 'input', textAlign: 'left', validate: [validateRequired, this.maxLengthRule(100)] },
    {
      field: 'acpType', header: '明細類別', width: '120px', type: 'dropdown', textAlign: 'left',
      optionsAsync: true, options: () => this.acpTypeOptions$, optionLabel: 'label', optionValue: 'value',
      templateLabel: 'label', validate: [validateRequired],
      calculate: (rowData: DetailRow, value: unknown) => {
        const amt = Number(rowData.purAmt) || 0;
        if (String(value) === '1') {
          const net = Math.round(amt / 1.05);
          return { purTaxType: '1', purNet: net, purTax: amt - net };
        }
        if (String(value) === '2') {
          return { purTaxType: '0', purNet: amt, purTax: 0 };
        }
        if (String(value) === '0') {
          // 明細類別=不扣抵憑證時，比照FIN72010零用金維護作業的設計主動代入固定值並鎖定欄位(見下方
          // purVoucherType/purDiscNo/purTaxType 的 disabled)。FIN23040 沒有 SP_FIN23040Save 那種 SP
          // 端覆蓋保底(SP完全不做驗證/覆蓋，單純把TVP資料原樣寫入)，這幾個欄位必須由前端自己做對。
          // 扣抵代號'3'＝SYS1000 PUR_DiscNo 代碼表「進項不可扣抵之進貨及費用」。
          return { purTaxType: '0', purNet: amt, purTax: 0, purDiscNo: '3', purVoucherType: null };
        }
        return {};
      },
      // 切成「不扣抵憑證」時，table-edit 只會重新驗證被改動的 acpType 欄位本身，
      // 之前殘留在發票格式/發票號碼/日期/申報年月/課稅別/未稅金額/扣抵代號上的必填錯誤提示不會自動消失，
      // 這裡手動清掉，避免畫面看起來「明細類別改了但錯誤還在」。
      onChange: (value: unknown, rowData: DetailRow & { _validationErrors?: Record<string, string> }) => {
        if (String(value) !== '0' || !rowData._validationErrors) return;
        for (const field of ['purVoucherType', 'purGUINo', 'purGUIDate', 'purExpGLDate', 'purTaxType', 'purNet', 'purDiscNo']) {
          delete rowData._validationErrors[field];
        }
      },
    },
    {
      field: 'purVoucherType', header: '發票格式', width: '110px', type: 'dropdown', textAlign: 'left',
      optionsAsync: true, options: () => this.purVoucherTypeOptions$, optionLabel: 'label', optionValue: 'value',
      templateLabel: 'label', validate: [validateRequired], disabled: (value, index, rowData) => rowData?.acpType === '0',
    },
    {
      field: 'purGUINo', header: '發票/收據號碼', width: '140px', type: 'input', textAlign: 'left',
      validate: [this.requiredWhenInvoiceOrReceipt, this.guiNoRule, this.maxLengthRule(10)],
    },
    { field: 'purGUIDate', header: '發票日期', width: '130px', type: 'date', dateFormat: 'yy/mm/dd', validate: [this.requiredWhenInvoiceOrReceipt] },
    { field: 'purExpGLDate', header: '申報年月', width: '110px', type: 'date', dateFormat: 'yy/mm', view: 'month', validate: [this.requiredWhenInvoiceOrReceipt] },
    {
      field: 'purVenUniform', header: '廠商統一編號', width: '150px', type: 'dropdown', textAlign: 'left',
      optionsAsync: true, options: () => this.purVenUniformOptions$, optionLabel: 'label', optionValue: 'value',
      templateLabel: 'label', validate: [this.maxLengthRule(8)],
    },
    {
      field: 'purDirectType', header: '發票用途', width: '120px', type: 'dropdown', textAlign: 'left',
      optionsAsync: true, options: () => this.purDirectTypeOptions$, optionLabel: 'label', optionValue: 'value',
      templateLabel: 'label',
    },
    {
      field: 'purAmt', header: '發票總金額', width: '120px', type: 'inputNumber', textAlign: 'right', aggregate: 'sum',
      calculate: (rowData: DetailRow, value: unknown) => {
        const amt = Number(value) || 0;
        if (String(rowData.purTaxType) === '1') {
          const net = Math.round(amt / 1.05);
          return { purNet: net, purTax: amt - net };
        }
        return { purNet: amt, purTax: 0 };
      },
    },
    {
      field: 'purTaxType', header: '課稅別', width: '100px', type: 'dropdown', textAlign: 'left',
      optionsAsync: true, options: () => this.purTaxTypeOptions$, optionLabel: 'label', optionValue: 'value',
      templateLabel: 'label', validate: [this.requiredWhenInvoiceOrReceipt],
      disabled: (value, index, rowData) => rowData?.acpType === '0',
      calculate: (rowData: DetailRow, value: unknown) => {
        const amt = Number(rowData.purAmt) || 0;
        if (String(value) === '1') {
          const net = Math.round(amt / 1.05);
          return { purNet: net, purTax: amt - net };
        }
        return { purNet: amt, purTax: 0 };
      },
    },
    {
      field: 'purNet', header: '發票未稅金額', width: '120px', type: 'inputNumber', textAlign: 'right', aggregate: 'sum', validate: [this.requiredWhenInvoiceOrReceipt],
      calculate: (_rowData: DetailRow, value: unknown) => {
        const net = Number(value) || 0;
        const tax = Math.round(net * 0.05);
        return { purTax: tax, purAmt: net + tax };
      },
    },
    {
      field: 'purTax', header: '發票稅額', width: '110px', type: 'inputNumber', textAlign: 'right', aggregate: 'sum',
      calculate: (rowData: DetailRow, value: unknown) => {
        const tax = Number(value) || 0;
        const net = Number(rowData.purNet) || 0;
        return { purAmt: net + tax };
      },
    },
    {
      field: 'projectNo', header: '活動代碼', width: '160px', type: 'dropdown', textAlign: 'left',
      optionsAsync: true, options: () => this.projectNoOptions$, optionLabel: 'label', optionValue: 'value',
      templateLabel: 'label', validate: [this.maxLengthRule(20)],
    },
    {
      field: 'purDiscNo', header: '扣抵代號', width: '180px', type: 'dropdown', textAlign: 'left',
      optionsAsync: true, options: () => this.purDiscNoOptions$, optionLabel: 'label', optionValue: 'value',
      templateLabel: 'label', validate: [validateRequired], disabled: (value, index, rowData) => rowData?.acpType === '0',
    },
    {
      field: 'purType', header: '類別區分', width: '120px', type: 'dropdown', textAlign: 'left',
      optionsAsync: true, options: () => this.purTypeOptions$, optionLabel: 'label', optionValue: 'value',
      templateLabel: 'label',
    },
    { field: 'purCombCnt', header: '彙總張數', width: '100px', type: 'inputNumber' },
  ];

  readonly defaultInsertData: Partial<DetailRow> = {
    acpType: '1',
    purGUIDate: new Date(),
    purExpGLDate: new Date(),
    purDirectType: '2',
    purTaxType: '1',
    purDiscNo: '1',
    purType: '1',
  };
  private canEditRow = true;

  ngOnInit(): void {
    this.initializePage('FIN23040');
    this.prepNoOptions$ = this.loadPendingPrepNoOptions$();
    this.dataForm.controls.prepNo.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(prepNo => {
      // btnType="cancel" 會呼叫 form.reset()，prepNo 被清空時不應再打 API（PREP_NO 為後端必填參數）
      if (!prepNo) {
        this.dataForm.patchValue({ prepAmt: null }, { emitEvent: false });
        return;
      }
      this.fin23040Service.queryFIN23040({ Type: 3, PREP_NO: prepNo }).subscribe(res => {
        const row = (res.Data ?? [])[0] as QueryFIN23040Type3Response | undefined;
        this.dataForm.patchValue({ prepAmt: row?.PREP_Amt ?? null });
      });
    });
    if (!this.isFormCreateable) {
      this.loadDetail();
    }
  }

  private loadPendingPrepNoOptions$(): Observable<Option[]> {
    return this.fin23040Service.queryFIN23040({ Type: 2 }).pipe(
      map(res => {
        const rows = (res.Data ?? []) as QueryFIN23040Type2Response[];
        return rows.map(r => ({
          label: `${r.PREP_NO} - ${r.VEN_Name ?? ''}`,
          value: r.PREP_NO,
        }));
      }),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
  }

  private loadDetail(): void {
    const prepNo = this.rowdata?.PREP_NO;
    const redeemNo = this.rowdata?.REDEEM_NO; // 點擊修改時清單帶入的核銷單號
    if (!prepNo) {
      this.messageService.warnBubble('缺少預支單號，無法載入資料。');
      return;
    }
    this.prepNoOptions$ = of([{ label: prepNo, value: prepNo }]);
    this.dataForm.patchValue({ prepNo, redeemNo: redeemNo || null });
    this.dataForm.controls.prepNo.disable();

    this.loading = true;
    forkJoin({
      list: this.fin23040Service.queryFIN23040({ Type: 1, PREP_NO: prepNo }),
      amt: this.fin23040Service.queryFIN23040({ Type: 3, PREP_NO: prepNo }),
    }).pipe(
      finalize(() => (this.loading = false)),
    ).subscribe(({ list, amt }) => {
      const records = (list.Data ?? []) as QueryFIN23040Type1Response[];
      const amtRow = (amt.Data ?? [])[0] as QueryFIN23040Type3Response | undefined;
      this.dataForm.patchValue({ prepAmt: amtRow?.PREP_Amt ?? null });
      if (records.length === 0) {
        this.messageService.warnBubble('查無此預支單號的核銷紀錄。');
        return;
      }
      this.canEditRow = records.every(r => r.YN !== 'N');

      // 若有指定 redeemNo，僅載入該張單的明細；若無則預設抓第一筆或全部
      const targetRecords = redeemNo ? records.filter(r => r.REDEEM_NO === redeemNo) : records;
      this.loadAllDetails(targetRecords, prepNo);
    });
  }

  private loadAllDetails(records: QueryFIN23040Type1Response[], prepNo: string): void {
    this.loading = true;
    const requests = records.map(r => this.fin23040Service.detailFIN23040({ REDEEM_NO: r.REDEEM_NO, PREP_NO: prepNo }));
    forkJoin(requests).pipe(
      finalize(() => (this.loading = false)),
    ).subscribe(results => {
      this.data = results
        .flatMap((res, idx) => (res.Data ?? []).map(d => this.toDetailRow(d, records[idx].REDEEM_NO)))
        .filter((r): r is DetailRow => r !== null);
      this.originalData = this.data.map(row => ({ ...row }));

      this.detailDisabled = this.crudstatus === CRUDStatus.Read || !this.canEditRow;
      if (this.detailDisabled) {
        this.dataForm.disable();
      }
    });
  }

  private toDetailRow(d: DetailFIN23040Response, redeemNo: string): DetailRow | null {
    if (!d) return null;
    return {
      redeemNo,
      accNo: d.AccNo,
      purRemark: d.Remark,
      acpType: d.ACP_Type,
      purVoucherType: d.PUR_VoucherType,
      purGUINo: d.PUR_GUINo,
      purGUIDate: d.PUR_GUIDate ? new Date(d.PUR_GUIDate) : null,
      purExpGLDate: this.parseYearMonth(d.PUR_ExpGLDate),
      purVenUniform: d.PUR_VenUniform,
      purDirectType: d.PUR_DirectType,
      purAmt: d.PUR_Amt,
      purTaxType: d.PUR_TaxType,
      purNet: d.PUR_Net,
      purTax: d.PUR_Tax,
      projectNo: d.ProjectNo,
      purDiscNo: d.PUR_DiscNo,
      purType: d.PUR_Type,
      purCombCnt: d.PUR_Comb_Cnt,
    };
  }

  /** 「取消」按鈕：把核銷明細還原成初始載入(或新增頁初始空表)時的內容 */
  onResetDetail(): void {
    this.data = this.originalData.map(row => ({ ...row }));
  }

  onSubmit(frm: FormGroup): void {
    if (!this.tableEditComponent.validateAndShowErrors()) {
      return;
    }
    this.handleSubmit(frm, () => this.doSave());
  }

  /** 
   * 💡 整批存檔對應後端 TVP：
   * 將表格中所有明細打包成一個 InvoiceList 陣列，呼叫一次 saveFIN23040 送出整張核銷單。
   */
  private doSave(): void {
    const v = this.dataForm.getRawValue();
    const prepNo = v.prepNo ?? '';
    const redeemNo = v.redeemNo ?? (this.data.find(r => r.redeemNo)?.redeemNo || null);
    const storeNo = this.authService.currentUserValue?.SYS_StoreNo || '10';

    // 將表格的所有資料列轉換成後端所需的 FIN23040InvoiceItem 清單
    const invoiceList: FIN23040InvoiceItem[] = this.data.map(detail => ({
      AccNo: detail.accNo ?? '',
      PUR_Remark: detail.purRemark ?? '',
      ACP_Type: detail.acpType ?? '',
      PUR_VoucherType: detail.purVoucherType || null,
      PUR_GUINo: detail.purGUINo || null,
      PUR_GUIDate: this.toDateString(detail.purGUIDate),
      PUR_ExpGLDate: this.toYearMonthString(detail.purExpGLDate),
      PUR_VenUniform: detail.purVenUniform || null,
      PUR_DirectType: detail.purDirectType || null,
      PUR_Amt: detail.purAmt != null ? Number(detail.purAmt) : null,
      PUR_TaxType: detail.purTaxType ?? '',
      PUR_Net: Number(detail.purNet ?? 0),
      PUR_Tax: detail.purTax != null ? Number(detail.purTax) : null,
      ProjectNo: detail.projectNo || null,
      PUR_DiscNo: detail.purDiscNo || null,
      PUR_Type: detail.purType || null,
      PUR_Comb_Cnt: detail.purCombCnt != null ? Number(detail.purCombCnt) : null,
    }));

    const payload: SaveFIN23040Request = {
      ActionMode: this.isFormCreateable ? 'I' : 'U',
      STO_No: storeNo,
      PREP_NO: prepNo,
      REDEEM_NO: redeemNo,
      InvoiceList: invoiceList // 💡 包含所有明細列的整批陣列
    };

    this.loading = true;
    this.fin23040Service.saveFIN23040(payload).pipe(
      finalize(() => (this.loading = false)),
    ).subscribe(res => {
      if (res.Data?.Success) {
        this.messageService.successBubble('儲存成功');
        // 若為新增，可將後端回傳的新核銷單號填回表單
        if (!redeemNo && res.Data.REDEEM_NO) {
          this.dataForm.patchValue({ redeemNo: res.Data.REDEEM_NO });
        }
        this.onCancel();
      } else {
        this.messageService.errorBubble(res.Data?.Message || '儲存失敗', '儲存失敗');
      }
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