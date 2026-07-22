import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PanelModule } from 'primeng/panel';
import { Observable, catchError, finalize, forkJoin, map, of, shareReplay } from 'rxjs';

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
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/components/input-number/input-number.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { TableEditComponent } from '../../../shared/components/table-edit/table-edit.component';
import { EditColumn } from '../../../shared/components/table-edit/table-edit.model';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

/**
 * 暫付款核銷明細列(對應 table-edit 一列)。
 * 多筆化重點：一列 = 一張核銷單(呼叫一次 SP_FIN23040Save 產生/更新一個 REDEEM_NO)，
 * 所以每列自己帶 redeemNo 追蹤是否已存檔(null=尚未存檔的新列，存檔後才會有值)。
 * _isAutoInsertCandidate/_dataStatus 是 table-edit 內部會塞進來的簿記欄位，宣告出來
 * 避免存取時要用 any。
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

//1.2.3.4 暫付款核銷作業 CRU
@Component({
  selector: 'app-fin23040-cru',
  templateUrl: './fin23040-cru.component.html',
  standalone: true,
  imports: [MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, InputNumberComponent, DropdownComponent,
    ButtonComponent, TableEditComponent, AsyncPipe, TranslateModule]
})
export class FIN23040CRUComponent extends BasicCruPageComponent<QueryFIN23040Type1Response> implements OnInit {
  private readonly fin23040Service = inject(Fin23040Service);
  private readonly dropdown = inject(DropdownApiService);
  private readonly datePipe = inject(DatePipe);
  private readonly destroyRef = inject(DestroyRef);
  readonly CRUDStatus = CRUDStatus;
  @ViewChild(TableEditComponent) private readonly tableEditComponent!: TableEditComponent;

  dataForm = this.formBuilder.group({
    prepNo: [null as string | null, [Validators.required]], // 預支單號
    prepAmt: [{ value: null as number | null, disabled: true }], // 預支金額(這張預支單的原始金額，顯示用)
    /**
     * 可核銷餘額(對應 SP_FIN23040Query Type=2 的 BalanceAmt = 預支金額-已核銷金額)。
     * 只有新增模式、且從下拉選單挑選過預支單號後才會有值(直接沿用 Type=2 已抓回來的資料，不用多打一次 API)；
     * 修改模式沒有可靠來源可算「排除本次正在編輯這幾筆之後的餘額」，範圍內先不處理，維持空白。
     */
    balanceAmt: [{ value: null as number | null, disabled: true }],
  });

  readonly accNoOptions$ = this.dropdown.queryFasAccNoDropdown();
  // 明細類別下拉：SYS_Type 是 PCS_DtlType(0=不扣抵憑證/1=發票/2=收據)，不是 ACP_Type(那是應付帳款類別，語意不同)。
  readonly acpTypeOptions$ = getSYS1000Options$(this.systemDataService, 'PCS_DtlType');
  readonly purVoucherTypeOptions$ = getSYS1000Options$(this.systemDataService, 'PUR_VoucherType');
  readonly purVenUniformOptions$ = this.dropdown.queryPos2013VenUniform();
  readonly purDirectTypeOptions$ = getSYS1000Options$(this.systemDataService, 'PUR_DirectType');
  readonly purTaxTypeOptions$ = getSYS1000Options$(this.systemDataService, 'PUR_TaxType');
  readonly projectNoOptions$ = this.dropdown.queryTALPORDERM_DropDownList({ pod_typeList: [], pod_statusList: [] });
  readonly purDiscNoOptions$ = getSYS1000Options$(this.systemDataService, 'PUR_DiscNo');
  readonly purTypeOptions$ = getSYS1000Options$(this.systemDataService, 'PUR_Type');

  /**
   * 預支單號下拉選項。改用 Observable + async pipe(對齊本頁其他下拉的標準寫法)，
   * 初始值為 null 時 app-dropdown 會顯示「載入中」而不是「查無資料」的空清單。
   */
  prepNoOptions$: Observable<Option[] | null> = of(null);
  /** 新增模式：Type=2 查詢回來的原始列表(含 PREP_Amt/BalanceAmt)，選定預支單號時查表用，避免重打 API */
  private prepNoRows: QueryFIN23040Type2Response[] = [];

  /** 核銷明細(多筆)，canInsert=true 讓使用者可自行增删列 */
  data: DetailRow[] = [];
  /** 明細表格是否禁用(顯示模式或任一筆已結案不可刪修) */
  detailDisabled = false;

  private readonly requiredRule = (value: unknown, _rowData: unknown, _data: unknown[], _field: string, header: string) => {
    const isValid = value !== null && value !== undefined && value !== '';
    return { isValid, errorMessage: isValid ? [] : [`${header}為必填`] };
  };
  private maxLengthRule(max: number) {
    return (value: unknown, _rowData: unknown, _data: unknown[], _field: string, header: string) => {
      const len = value ? String(value).length : 0;
      return { isValid: len <= max, errorMessage: len <= max ? [] : [`${header}長度不可超過${max}字`] };
    };
  }
  /** 發票/收據號碼格式：前兩碼大寫英文+後八碼數字，或全為'0000000000' */
  private readonly guiNoRule = (value: unknown, _rowData: unknown, _data: unknown[], _field: string, header: string) => {
    if (value === null || value === undefined || value === '') {
      return { isValid: true, errorMessage: [] }; // 是否必填交由其他 rule 處理，這裡只管格式
    }
    const v = String(value).trim();
    const isValid = /^[A-Z]{2}\d{8}$/.test(v) || v === '0000000000';
    return {
      isValid,
      errorMessage: isValid ? [] : [`${header}格式錯誤，應為前2碼大寫英文+後8碼數字(如AB12345678)，或全為'0000000000'`],
    };
  };

  columns: EditColumn[] = [
    { field: 'redeemNo', header: '核銷單號', width: '110px', textAlign: 'center', disabled: () => true },
    {
      field: 'accNo', header: '費用會計科目', width: '200px', type: 'dropdown', textAlign: 'left',
      optionsAsync: true, options: () => this.accNoOptions$, optionLabel: 'label', optionValue: 'value',
      templateLabel: 'label', validate: [this.requiredRule],
    },
    { field: 'purRemark', header: '項目摘要', width: '160px', type: 'input', textAlign: 'left', validate: [this.requiredRule, this.maxLengthRule(100)] },
    {
      field: 'acpType', header: '明細類別', width: '120px', type: 'dropdown', textAlign: 'left',
      optionsAsync: true, options: () => this.acpTypeOptions$, optionLabel: 'label', optionValue: 'value',
      templateLabel: 'label', validate: [this.requiredRule],
      // PCS_DtlType：1=發票→課稅別預設應稅並依目前總金額重算未稅/稅額；2=收據→預設免稅，稅額歸零
      calculate: (rowData: DetailRow, value: unknown) => {
        const amt = Number(rowData.purAmt) || 0;
        if (String(value) === '1') {
          const net = Math.round(amt / 1.05);
          return { purTaxType: '1', purNet: net, purTax: amt - net };
        }
        if (String(value) === '2') {
          return { purTaxType: '0', purNet: amt, purTax: 0 };
        }
        return {};
      },
    },
    {
      field: 'purVoucherType', header: '發票格式', width: '110px', type: 'dropdown', textAlign: 'left',
      optionsAsync: true, options: () => this.purVoucherTypeOptions$, optionLabel: 'label', optionValue: 'value',
      templateLabel: 'label',
    },
    {
      field: 'purGUINo', header: '發票/收據號碼', width: '140px', type: 'input', textAlign: 'left',
      validate: [this.guiNoRule, this.maxLengthRule(10)],
    },
    { field: 'purGUIDate', header: '發票日期', width: '130px', type: 'date', dateFormat: 'yy/mm/dd', validate: [this.requiredRule] },
    { field: 'purExpGLDate', header: '申報年月', width: '110px', type: 'date', dateFormat: 'yy/mm', view: 'month', validate: [this.requiredRule] },
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
      // 應稅：未稅=總金額/1.05(四捨五入)，稅額=總金額-未稅；免稅/零稅：未稅=總金額，稅額=0
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
      templateLabel: 'label', validate: [this.requiredRule],
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
      field: 'purNet', header: '發票未稅金額', width: '120px', type: 'inputNumber', textAlign: 'right', aggregate: 'sum', validate: [this.requiredRule],
      // 手動改未稅金額：連動重算稅額(未稅*0.05)與總金額(未稅+稅額)
      calculate: (_rowData: DetailRow, value: unknown) => {
        const net = Number(value) || 0;
        const tax = Math.round(net * 0.05);
        return { purTax: tax, purAmt: net + tax };
      },
    },
    {
      field: 'purTax', header: '發票稅額', width: '110px', type: 'inputNumber', textAlign: 'right', aggregate: 'sum',
      // 手動改稅額：只連動重算總金額(未稅+稅額)，未稅金額不動
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
      templateLabel: 'label',
    },
    {
      field: 'purType', header: '類別區分', width: '120px', type: 'dropdown', textAlign: 'left',
      optionsAsync: true, options: () => this.purTypeOptions$, optionLabel: 'label', optionValue: 'value',
      templateLabel: 'label',
    },
    { field: 'purCombCnt', header: '彙總張數', width: '100px', type: 'inputNumber' },
  ];

  /**
   * 新增候選列的預設值。
   * 注意：這裡故意用「建構時算一次的欄位」而不是 getter/method。
   * 若改成 getter，每次 CD 都會回傳新物件(新 reference)，會讓 table-edit 的
   * ngOnChanges 誤判 defaultInsertData 每次都變了，進而呼叫
   * updateCandidateRowDefaults() 無條件覆寫使用者正在填的候選列，
   * 導致多筆新增時打到一半資料被重設回預設值。
   */
  readonly defaultInsertData: Partial<DetailRow> = {
    acpType: '1',
    purGUIDate: new Date(),
    purExpGLDate: new Date(),
    purDirectType: '2',
    purTaxType: '1',
    purDiscNo: '1',
    purType: '1',
  };
  /** 是否允許刪修(對應清單 YN 欄位，任一筆'N'=已結案，整組鎖定唯讀避免部分可刪修/部分不可造成操作混淆) */
  private canEditRow = true;

  ngOnInit(): void {
    this.initializePage('FIN23040');
    switch (this.crudstatus) {
      case CRUDStatus.Create:
        this.prepNoOptions$ = this.loadPendingPrepNoOptions$();
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

  /** 新增模式：載入尚未核銷的預支單號下拉(呼叫 SP_FIN23040Query Type=2)，順便快取原始資料供帶出可核銷餘額用 */
  private loadPendingPrepNoOptions$(): Observable<Option[]> {
    return this.fin23040Service.queryFIN23040({ Type: 2 }).pipe(
      map(res => {
        const rows = (res.Data ?? []) as QueryFIN23040Type2Response[];
        this.prepNoRows = rows;
        return rows.map(r => ({
          label: `${r.PREP_NO} - ${r.VEN_Name ?? ''}`,
          value: r.PREP_NO,
        }));
      }),
      catchError(() => {
        this.messageService.errorBubble('載入待核銷預支單號清單失敗，請稍後再試。', '載入失敗');
        return of([]);
      }),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
  }

  /**
   * 新增模式：選定預支單號後，查詢該單預支金額(呼叫 SP_FIN23040Query Type=3)，
   * 並從剛剛 Type=2 抓回來的清單直接查表帶出可核銷餘額(BalanceAmt = 預支金額-已核銷金額)，不用多打一次 API。
   */
  private onPrepNoChanged(prepNo: string | null): void {
    if (!prepNo) {
      this.dataForm.patchValue({ prepAmt: null, balanceAmt: null });
      return;
    }
    const cached = this.prepNoRows.find(r => r.PREP_NO === prepNo);
    this.dataForm.patchValue({ balanceAmt: cached?.BalanceAmt ?? null });
    this.fin23040Service.queryFIN23040({ Type: 3, PREP_NO: prepNo }).subscribe(res => {
      const row = (res.Data ?? [])[0] as QueryFIN23040Type3Response | undefined;
      this.dataForm.patchValue({ prepAmt: row?.PREP_Amt ?? null });
    });
  }

  /**
   * 修改/顯示模式：清單頁點進來只帶單一列(REDEEM_NO+PREP_NO)，但改成多筆編輯後，
   * 要抓的是「這張預支單底下全部核銷紀錄」，所以改用 PREP_NO 查 Type=1 拿到全部 REDEEM_NO 清單，
   * 再對每個 REDEEM_NO 各自查一次明細(SP_FIN23040Detail)組成多列。
   */
  private loadDetail(): void {
    const prepNo = this.rowdata?.PREP_NO;
    if (!prepNo) {
      this.messageService.warnBubble('缺少預支單號，無法載入資料。');
      return;
    }
    this.prepNoOptions$ = of([{ label: prepNo, value: prepNo }]);
    this.dataForm.patchValue({ prepNo });
    this.dataForm.controls.prepNo.disable(); // 既有資料不可改綁其他預支單

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
      this.loadAllDetails(records, prepNo);
    });
  }

  /** 對多筆核銷紀錄各自呼叫 SP_FIN23040Detail，組成多列 table-edit 資料 */
  private loadAllDetails(records: QueryFIN23040Type1Response[], prepNo: string): void {
    this.loading = true;
    const requests = records.map(r => this.fin23040Service.detailFIN23040({ REDEEM_NO: r.REDEEM_NO, PREP_NO: prepNo }));
    forkJoin(requests).pipe(
      finalize(() => (this.loading = false)),
    ).subscribe(results => {
      this.data = results
        .map((res, idx) => this.toDetailRow(res.Data?.[0], records[idx].REDEEM_NO))
        .filter((r): r is DetailRow => r !== null);

      this.detailDisabled = this.crudstatus === CRUDStatus.Read || !this.canEditRow;
      if (this.detailDisabled) {
        this.dataForm.disable();
      }
    });
  }

  private toDetailRow(d: DetailFIN23040Response | undefined, redeemNo: string): DetailRow | null {
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

  /** 排除 table-edit 內部用來讓使用者輸入下一筆的「新增候選行」 */
  private get savedOrPendingRows(): DetailRow[] {
    return this.data.filter(r => !r._isAutoInsertCandidate);
  }

  // ----------------------------------------------------------------
  onSubmit(frm: FormGroup): void {
    if (!this.tableEditComponent.validateAndShowErrors()) {
      return;
    }
    const balance = this.dataForm.getRawValue().balanceAmt;
    const total = this.savedOrPendingRows.reduce((sum, r) => sum + (Number(r.purAmt) || 0), 0);
    if (balance != null && total > balance) {
      this.messageService.confirm({
        header: '核銷金額超過可核銷餘額',
        message: `本次核銷合計 ${total}，已超過這張預支單目前的可核銷餘額 ${balance}，是否仍要送出？`,
        accept: () => this.handleSubmit(frm, () => this.doSave()),
      });
      return;
    }
    this.handleSubmit(frm, () => this.doSave());
  }

  /** 多筆存檔：每列各自呼叫一次 saveFIN23040(對應一張核銷單)，已存在的列(有redeemNo)用 'U'，新列用 'I' */
  private doSave(): void {
    const rows = this.savedOrPendingRows;
    if (rows.length === 0) {
      this.messageService.warnBubble('請至少填寫一筆核銷明細。');
      this.loading = false;
      return;
    }
    const v = this.dataForm.getRawValue();
    const prepNo = v.prepNo ?? '';
    const storeNo = this.authService.currentUserValue?.SYS_StoreNo || '10';

    const requests = rows.map(detail => {
      const payload: SaveFIN23040Request = {
        ActionMode: detail.redeemNo ? 'U' : 'I',
        STO_No: storeNo,
        PREP_NO: prepNo,
        REDEEM_NO: detail.redeemNo ?? null,
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
      };
      return this.fin23040Service.saveFIN23040(payload);
    });

    forkJoin(requests).pipe(
      finalize(() => (this.loading = false)),
    ).subscribe(results => {
      const failMessages: string[] = [];
      let successCount = 0;
      results.forEach((res, idx) => {
        if (res.Data?.Success) {
          successCount++;
        } else {
          failMessages.push(`第${idx + 1}筆：${res.Data?.Message || '儲存失敗'}`);
        }
      });
      if (failMessages.length === 0) {
        this.messageService.successBubble(`儲存成功，共 ${successCount} 筆`);
        this.onCancel();
      } else {
        this.messageService.errorBubble(`成功 ${successCount} 筆，失敗 ${failMessages.length} 筆：${failMessages.join('；')}`, '部分儲存失敗');
      }
    });
  }

  /**
   * 刪除列：table-edit 對「本來就存在(有redeemNo)、被使用者刪除」的列，(delete)事件會emit狀態為
   * Deleted 的完整資料(還沒存檔的新列刪除則直接消失，不會出現在這裡)。刪除一列=作廢一張核銷單，
   * 語意上是獨立動作，比照清單頁的刪除慣例立即呼叫 voidFIN23040，不等到整張表單送出才處理。
   */
  onDeleteRows(fullData: DetailRow[]): void {
    const toVoid = fullData.filter(r => r._dataStatus === 'deleted' && r.redeemNo);
    if (toVoid.length === 0) return;

    const prepNo = this.dataForm.getRawValue().prepNo ?? '';
    const storeNo = this.authService.currentUserValue?.SYS_StoreNo || '10';

    this.messageService.confirm({
      header: '作廢確認',
      message: `刪除將立即作廢 ${toVoid.length} 筆已存檔的核銷單，確定要繼續嗎？`,
      accept: () => {
        this.loading = true;
        const requests = toVoid.map(r => this.fin23040Service.voidFIN23040({
          STO_No: storeNo,
          PREP_NO: prepNo,
          REDEEM_NO: r.redeemNo as string,
        }));
        forkJoin(requests).pipe(
          finalize(() => (this.loading = false)),
        ).subscribe(results => {
          const failCount = results.filter(res => !res.Data?.Success).length;
          if (failCount > 0) {
            this.messageService.errorBubble(`有 ${failCount} 筆作廢失敗，請重新整理頁面確認資料狀態`, '作廢失敗');
          } else {
            this.messageService.successBubble('作廢成功');
          }
        });
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
