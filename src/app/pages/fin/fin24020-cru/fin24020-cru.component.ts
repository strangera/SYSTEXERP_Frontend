import { DatePipe, NgIf } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Fin24020Service } from '@service/api/fin/fin24020.service';
import { DropDownListService, IAPS3001Item } from '@service/utility/dropDownList.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { validateRequired } from '@shared/componentkit/table-edit/validate-field.model';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { Column, formatAmount, formatDate } from '@shared/componentkit/table/table.model';
import { DialogModule } from 'primeng/dialog';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-fin24020-cru',
  templateUrl: './fin24020-cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    NgIf,
    ReactiveFormsModule,
    FormsModule,
    TranslateModule,
    InputNumberComponent,
    CalendarComponent,
    CalendarRangeQuickComponent,
    InputTextComponent,
    TableEditComponent,
    DialogModule,
    TableReportComponent
  ]
})
export class FIN24020CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  @ViewChild(TableEditComponent) tableEditComponent!: TableEditComponent;
  dataForm = this.formBuilder.group({
    ACP_No: ['', Validators.required],        // string
    VEN_No: [{ value: '', disabled: true }],        // string
    VEN_Name: [{ value: '', disabled: true }],      // string
    ACP_Amt: [{ value: 0, disabled: true }],        // number
    ACP_Date: [{ value: null as Date | null, disabled: true }], // Date | null
    ACP_ReserveAmt: [0, Validators.required],
    ACP_YYYYMM: [''],
    acp_termno: [0, Validators.required],
    RET_Date: [null as Date | null],
    RET_Amt: [{ value: 0, disabled: true }],
    ACP_BalanceAmt: [{ value: 0, disabled: true }],
    sam: [{ value: 0, disabled: true }],
  }, { validators: [reserveAmtLessThanAcpAmtValidator] });
  displaySearchDialog = false; // 控制 Dialog 顯示隱私
  // APS3001 應付ID 下拉查詢相關
  dialogQueryForm = this.formBuilder.group({
    VEN_No: [null, [Validators.maxLength(16)]],
    VEN_Name: [null, [Validators.maxLength(100)]],
    ACP_Date_From: [null],
    ACP_Date_To: [null],
  });
  apsRawData: IAPS3001Item[] = [];
  apsDialogData: IAPS3001Item[] = [];
  apsDialogColumns: Column[] = [
    { field: 'ACP_No', header: '應付帳款編號' },
    { field: 'ACP_Date', header: '立帳日期', format: formatDate },
    { field: 'VEN_No', header: '廠客代號' },
    { field: 'VEN_Name', header: '廠客名稱' },
    { field: 'ACP_Amt', header: '應付金額', format: formatAmount },
    { field: 'acp_reserveamt', header: '應付帳款餘額', format: formatAmount },
  ];
  editColumns: EditColumn[] = [
    { field: 'acp_termno', header: '帳次', type: 'inputNumber', textAlign: 'left' },
    { field: 'RET_Date', header: '保留退款日期', type: 'date', validate: [validateRequired], width: '10rem' },
    { field: 'RET_Amt', header: '保留退款金額', type: 'inputNumber', validate: [validateRequired], width: '10rem' },
    { field: 'Remark', header: '備註', type: 'input', textAlign: 'left' },
    { field: 'STATUS', header: '是否已付款', type: 'dropdown', options: [{ label: '是', value: 'Y' }, { label: '否', value: 'N' },], optionLabel: 'label', optionValue: 'value', width: '8rem', hidden: () => this.isFormCreateable, validate: [validateRequired], disabled: () => !this.isFormCreateable, },
  ];
  tableData: any[] = [];
  tableDefaults: any = {};
  constructor(
    private readonly datePipe: DatePipe,
    public readonly fin24020Service: Fin24020Service,
    private readonly dropDownListService: DropDownListService,
  ) {
    super();
  }
  // 暫存上一次送出的明細 key 順序（用於在後端未儲存 SortIndex 時還原順序）
  private readonly lastSentDetailKeyOrder: string[] = [];
  // 讀取時的原始明細快照（用於 local cancel 還原）
  private originalTableDataSnapshot: any[] = [];

  ngOnInit(): void {
    this.initializePage('FIN24020', this.dataForm, { useReadonly: true });
    if (this.isFormCreateable) {
      this.editColumns = (this.editColumns || []).filter(c => c.field !== 'STATUS');
    }
    this.loadAPS3001List();
    this.initializeFormFromRowData();
    // 控制編輯與檢視狀態下的主欄位狀態
    if (!this.isFormCreateable) {
      this.dataForm.get('ACP_No')?.disable({ emitEvent: false });
    }
  }
  private initializeFormFromRowData(): void {
    const row: any = this.rowdata;
    if (row) {
      const retDate = row.RET_Date ? new Date(row.RET_Date + 'T00:00:00') : null;
      const retAmt = Number(row.RET_Amt ?? row.ACP_ReserveAmt ?? 0);
      this.dataForm.patchValue({
        ACP_No: row.ACP_No ?? '',
        VEN_No: row.VEN_No ?? '',
        VEN_Name: row.VEN_Name ?? '',
        ACP_ReserveAmt: row.ACP_ReserveAmt ?? 0,
        ACP_YYYYMM: row.ACP_YYYYMM ?? '',
        acp_termno: row.acp_termno ?? 0,
        RET_Date: retDate,
        sam: retAmt,
      });
      if (row.ACP_Amt != null) {
        this.dataForm.patchValue({ ACP_Amt: row.ACP_Amt });
      }
      if (row.ACP_Date) {
        this.dataForm.patchValue({ ACP_Date: new Date(row.ACP_Date + 'T00:00:00') });
      } else if (row.ACP_YYYYMM) {
        const yyyymm = String(row.ACP_YYYYMM);
        if (yyyymm.length === 6) {
          const year = Number(yyyymm.substring(0, 4));
          const month = Number(yyyymm.substring(4, 6));
          if (!Number.isNaN(year) && !Number.isNaN(month) && month >= 1 && month <= 12) {
            this.dataForm.patchValue({
              ACP_Date: new Date(year, month - 1, 1),
            });
          }
        }
      }
      if (row.ACP_BalanceAmt != null) {
        this.dataForm.patchValue({ ACP_BalanceAmt: row.ACP_BalanceAmt });
      }
      const queryBody = { pageSize: 9999, pageIndex: 1, ACP_No: row.ACP_No ?? '' };
      this.fin24020Service.queryFIN24020(queryBody).pipe(untilDestroyed(this)).subscribe(res => {
        let items = res.Data;
        if (items?.length) {
          const first = items[0];
          if (first?.Data && Array.isArray(first.Details)) {
            const header = first.Data || {};
            this.dataForm.patchValue({
              ACP_Amt: header.ACP_Amt ?? this.dataForm.value.ACP_Amt,
              ACP_ReserveAmt: header.ACP_ReserveAmt ?? this.dataForm.value.ACP_ReserveAmt,
              ACP_BalanceAmt: header.ACP_BalanceAmt ?? this.dataForm.value.ACP_BalanceAmt,
              ACP_Date: header.ACP_Date ? new Date(header.ACP_Date + 'T00:00:00') : this.dataForm.value.ACP_Date,
            }, { emitEvent: false });
            let details = (first.Details || []);
            // 排序優先順序：1) SortIndex 2) SeqNo（後端常回傳）3) 不變（維持回傳順序）
            if (details?.length) {
              if (details.some((d: any) => d.SortIndex !== undefined && d.SortIndex !== null)) {
                details = details.slice().sort((a: any, b: any) => (Number(a.SortIndex) || 0) - (Number(b.SortIndex) || 0));
              } else if (details.some((d: any) => d.SeqNo !== undefined && d.SeqNo !== null)) {
                details = details.slice().sort((a: any, b: any) => (Number(a.SeqNo) || 0) - (Number(b.SeqNo) || 0));
              }
            }
            // 若後端未回傳 SortIndex，嘗試以最近一次送出的明細 key 還原原本順序（best-effort）
            if ((!details.some((d: any) => d.SortIndex !== undefined && d.SortIndex !== null))
              && this.lastSentDetailKeyOrder?.length) {
              const keyed = details.map((d: any) => ({
                d,
                key: `${d.RET_Date ? new Date(d.RET_Date + 'T00:00:00').toISOString().split('T')[0] : ''}|${Number(d.RET_Amt) || 0}|${(d.STATUS || '').toString().trim()}|${(d.NoteDesc || '').toString().trim()}`
              }));
              keyed.sort((a: any, b: any) => {
                const ai = this.lastSentDetailKeyOrder.indexOf(a.key);
                const bi = this.lastSentDetailKeyOrder.indexOf(b.key);
                if (ai === -1 && bi === -1) return 0;
                if (ai === -1) return 1;
                if (bi === -1) return -1;
                return ai - bi;
              });
              details = keyed.map((k: any) => k.d);
            }
            this.tableData = details.map((d: any) => ({
              acp_termno: d.acp_termno, // 帳次
              RET_Date: d.RET_Date ? new Date(d.RET_Date + 'T00:00:00') : null, // 退保留款日期
              RET_Amt: Number(d.RET_Amt ?? d.ACP_ReserveAmt ?? 0), // 退保留款金額
              Remark: d.Remark ?? '', // 應付主檔摘要
              STATUS: this.toStatusCode(d.STATUS), // 是否已付款(Y/N)
              ACP_Amt: d.ACP_Amt, // 應付金額
              ACP_BalanceAmt: d.ACP_BalanceAmt // 應付帳款餘額
              , _sortIndex: d.SortIndex
            }));
            // 儲存原始快照以便 local cancel 還原
            this.originalTableDataSnapshot = structuredClone(this.tableData || []);
            // 如果 header 沒有金額，嘗試從第一筆明細帶入
            const firstDetail = details[0];
            const totalRet = details.reduce((s: number, it: any) => s + (Number(it.RET_Amt) || 0), 0);
            this.dataForm.patchValue({
              ACP_Amt: header.ACP_Amt ?? firstDetail?.ACP_Amt ?? this.dataForm.value.ACP_Amt,
              ACP_BalanceAmt: header.ACP_BalanceAmt ?? firstDetail?.ACP_BalanceAmt ?? this.dataForm.value.ACP_BalanceAmt,
              RET_Amt: totalRet ?? this.dataForm.value.RET_Amt,
              sam: totalRet ?? this.dataForm.value.sam
            }, { emitEvent: false });
          } else {
            // 非 wrapper，items 為明細列
            // 如果回傳的明細包含 SortIndex，依 SortIndex 排序
            if (items?.length) {
              if (items.some((it: any) => it.SortIndex !== undefined && it.SortIndex !== null)) {
                items = items.slice().sort((a: any, b: any) => (Number(a.SortIndex) || 0) - (Number(b.SortIndex) || 0));
              } else if (items.some((it: any) => it.SeqNo !== undefined && it.SeqNo !== null)) {
                items = items.slice().sort((a: any, b: any) => (Number(a.SeqNo) || 0) - (Number(b.SeqNo) || 0));
              }
            }

            // 嘗試以 lastSentDetailKeyOrder 還原順序（若沒有 SortIndex）
            if ((!items.some((it: any) => it.SortIndex !== undefined && it.SortIndex !== null))
              && this.lastSentDetailKeyOrder?.length) {
              const keyed = items.map((it: any) => ({
                it,
                key: `${it.RET_Date ? new Date(it.RET_Date + 'T00:00:00').toISOString().split('T')[0] : ''}|${Number(it.RET_Amt) || 0}|${(it.STATUS || '').toString().trim()}|${(it.NoteDesc || '').toString().trim()}`
              }));
              keyed.sort((a: any, b: any) => {
                const ai = this.lastSentDetailKeyOrder.indexOf(a.key);
                const bi = this.lastSentDetailKeyOrder.indexOf(b.key);
                if (ai === -1 && bi === -1) return 0;
                if (ai === -1) return 1;
                if (bi === -1) return -1;
                return ai - bi;
              });
              items = keyed.map((k: any) => k.it);
            }
            this.tableData = items.map(it => ({
              acp_termno: it.acp_termno,
              RET_Date: it.RET_Date ? new Date(it.RET_Date + 'T00:00:00') : null,
              RET_Amt: Number(it.RET_Amt ?? it.ACP_ReserveAmt ?? 0),
              Remark: it.Remark ?? '',
              STATUS: this.toStatusCode(it.STATUS)
              , _sortIndex: it.SortIndex
            }));
            this.originalTableDataSnapshot = structuredClone(this.tableData || []);
          }
        } else {
          this.tableData = [{
            acp_termno: row.acp_termno,
            RET_Date: retDate,
            RET_Amt: retAmt,
            Remark: row.Remark ?? '',
          }];
          this.originalTableDataSnapshot = structuredClone(this.tableData || []);
        }
      }, () => {
        this.tableData = [{
          acp_termno: row.acp_termno,
          RET_Date: retDate,
          RET_Amt: retAmt,
          Remark: row.Remark ?? '',
        }];
      });
    } else {
      this.tableData = [{
        acp_termno: this.dataForm.value.acp_termno,
        RET_Date: this.dataForm.value.RET_Date,
        RET_Amt: this.dataForm.value.RET_Amt,
      }];
    }
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const valid = this.tableEditComponent.validateAndShowErrors();
      if (!valid) {
        this.loading = false;
        return;
      }

      // 【核心修正】這行很棒，繼續維持使用 getRawValue() 獲取包含 disabled 的完整主檔欄位
      const formData = frm.getRawValue();

      if (!this.tableData.length) {
        this.loading = false;
        return;
      }

      const acpAmt = Number(formData.ACP_Amt) || 0;
      const reserveAmt = Number(formData.ACP_ReserveAmt) || 0;

      // 加強防呆：過濾掉共通 Table 內部的自動新增候選列再進行明細加總
      const actualDetails = this.tableData.filter(r => !r._isAutoInsertCandidate);
      const totalRetAmt = actualDetails.reduce((sum, r) => sum + (Number(r.RET_Amt) || 0), 0);

      if (this.isFormCreateable) {
        const anyRowTooLarge = actualDetails.some(r => (Number(r.RET_Amt) || 0) > reserveAmt);
        if (anyRowTooLarge) {
          this.loading = false;
          this.messageService.errorBubble('保留退款金額不可大於保留款金額');
          return;
        }
        if (totalRetAmt > reserveAmt) {
          this.loading = false;
          this.messageService.errorBubble('保留款退款金額合計不可大於保留款金額');
          return;
        }
        const acpBalance = Number(formData.ACP_BalanceAmt) || 0;
        if ((reserveAmt - totalRetAmt) > acpBalance) {
          this.loading = false;
          this.messageService.errorBubble('保留款金額減退保留款金額不可大於應付帳款餘額');
          return;
        }
      }

      if (totalRetAmt > acpAmt) {
        this.loading = false;
        this.messageService.errorBubble('保留款退款金額不可大於應付金額');
        return;
      }

      // === 【關鍵Bug修正 1】日期獲取來源全面從 frm 改為 formData ===
      const rawAcpDate = formData.ACP_Date;
      let acpDate: string | null = null;
      let acpYyyymm = '';

      if (rawAcpDate) {
        const d = new Date(rawAcpDate);
        if (!Number.isNaN(d.getTime())) {
          // 1. 轉成主檔需要的 yyyy-MM-dd
          acpDate = this.datePipe.transform(d, 'yyyy-MM-dd');
          // 2. 直接拿正確的 Date 物件來轉 yyyyMM，絕對不會再變 1970！
          acpYyyymm = this.datePipe.transform(d, 'yyyyMM') ?? '';
        } else {
          // 如果本來就是字串格式 (防呆處理)
          acpDate = this.datePipe.transform(rawAcpDate, 'yyyy-MM-dd');
          acpYyyymm = this.datePipe.transform(rawAcpDate, 'yyyyMM') ?? '';
        }
      }

      // 如果上面透過 Date 轉失敗了，而且原本表單裡有既存的 yyyyMM 字串，就直接沿用，不要再送給 DatePipe 摧殘
      if (!acpYyyymm && formData.ACP_YYYYMM) {
        // 檢查如果原本就是 6 位數純數字 (例如 "202402")，直接拿來用
        const cleanYm = String(formData.ACP_YYYYMM).trim();
        if (cleanYm.length === 6 && !Number.isNaN(Number(cleanYm))) {
          acpYyyymm = cleanYm;
        }
      }

      if (!acpYyyymm) {
        this.loading = false;
        this.messageService.unblockUi();
        this.submitted = false; // 確保重置狀態
        this.messageService.errorBubble('帳款年月不可空白');
        return;
      }

      // 組裝送出後端 Body
      const body: any = {
        ACP_No: formData.ACP_No ?? '',
        VEN_No: formData.VEN_No ?? '',
        VEN_Name: formData.VEN_Name ?? '',
        ACP_Amt: formData.ACP_Amt ?? 0,
        ACP_Date: acpDate,
        ACP_ReserveAmt: formData.ACP_ReserveAmt ?? 0,
        Items: actualDetails.map((row, idx) => {
          const rawRetDate = row.RET_Date;
          let retDate: string | null = null;
          if (rawRetDate) {
            const d = new Date(rawRetDate);
            retDate = Number.isNaN(d.getTime()) ? this.datePipe.transform(rawRetDate, 'yyyy-MM-dd') ?? null : this.datePipe.transform(d, 'yyyy-MM-dd') ?? null;
          }
          return {
            ACP_No: formData.ACP_No ?? '', // 修正點：改由 formData 取得穩定的應付ID
            ACP_YYYYMM: acpYyyymm,
            acp_termno: row.acp_termno ?? 0,
            RET_Date: retDate,
            RET_Amt: row.RET_Amt ?? 0,
            STATUS: this.toStatusCode(row.STATUS),
            Remark: row.Remark ?? '',
            SortIndex: idx
          };
        })
      };

      const request$ = this.isFormCreateable ? this.fin24020Service.createFIN24020(body) : this.fin24020Service.updateFIN24020(body);
      request$.pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
        this.messageService.successBubble(res.Message);
        this.onCancel();
      });
    });
  }

  // 保留退款明細異動時，更新 tableData 並即時計算「已產生保留款」
  onTableDataChange(data: any[]): void {
    this.tableData = data || [];
    const effectiveRows = this.tableData.filter(r => !r._isAutoInsertCandidate);
    const totalRetAmt = effectiveRows.reduce((sum, r) => sum + (Number(r.RET_Amt) || 0), 0);
    this.dataForm.patchValue({ sam: totalRetAmt }, { emitEvent: false });
  }

  // 當使用者按下 local Cancel 時，恢復成讀取時的原始明細與計算值
  onLocalCancel(): void {
    this.tableData = structuredClone(this.originalTableDataSnapshot || []);
    this.onTableDataChange(this.tableData);
    if (this.rowdata) {
      this.initializeFormFromRowData();
    }
  }

  // APS3001 應付ID 下拉資料
  private loadAPS3001List(): void {
    this.dropDownListService.queryAPS3001_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      const data = res.Data ?? [];
      this.apsRawData = data;
      this.apsDialogData = data;
    });
  }
  /**
  * 【優化】AutoComplete 欄位手動輸入文字時的即時過濾 (純前端)
  */
  onApsInputChange(event: Record<string, string>): void {
    const keyword = (event?.['ACP_No'] || '').trim().toLowerCase();

    if (!keyword) {
      this.apsDialogData = [...this.apsRawData];
      return;
    }

    const filtered = this.apsRawData.filter(item =>
      (item.ACP_No ?? '').toLowerCase().includes(keyword)
    );

    this.apsDialogData = filtered;
  }

  private toStatusCode(status: string | null | undefined): string {
    const s = (status ?? '').toString();
    if (s === '是') { return 'Y'; }
    if (s === '否') { return 'N'; }
    return s;
  }
  /**
 * 【優化】當使用者在下拉 Table 選取一筆應付憑證時
 */
  onApsSelect(item: IAPS3001Item): void {
    if (!item) return;

    // 1. 同步寫入主表單 dataForm
    this.dataForm.patchValue({
      ACP_No: item.ACP_No ?? '',
      VEN_No: item.VEN_No ?? '',
      VEN_Name: item.VEN_Name ?? '',
      ACP_Amt: item.ACP_Amt ?? 0,
      ACP_Date: item.ACP_Date ? new Date(item.ACP_Date + 'T00:00:00') : null
    });

    // 3. 還原 suggestions 與對話框資料清單為完整資料
    this.apsDialogData = [...this.apsRawData];

    // 4. 重置查詢對話框中的其他過濾條件（排除 ACP_No），同樣不發出事件
    this.dialogQueryForm.reset();
  }
  /**
   * 【需求 2】在主畫面上直接輸入應付ID後失焦 (Blur)，立即檢查是否有資料
   */
  onAcpNoBlur(inputValue: string): void {
    if (!this.isFormCreateable) return; // 非新增模式不執行自動檢查
    const targetId = inputValue.trim();
    if (!targetId) {
      this.clearAcpRelatedFields();
      return;
    }
    const matchedItem = this.apsRawData.find(item => item.ACP_No === targetId);
    if (matchedItem) {
      this.fillFormFromApsItem(matchedItem);
    } else {
      this.messageService.errorBubble('輸入的應付ID不存在，請重新輸入或使用查詢功能');
      this.clearAcpRelatedFields();
    }
  }
  /**
 * 填入應付主檔欄位共通邏輯
 */
  private fillFormFromApsItem(item: IAPS3001Item): void {
    const remainAmt = Number(item.acp_reserveamt ?? 0);

    this.dataForm.patchValue({
      ACP_No: item.ACP_No ?? '',
      VEN_No: item.VEN_No ?? '',
      VEN_Name: item.VEN_Name ?? '',
      ACP_Amt: item.ACP_Amt ?? 0,
      ACP_Date: item.ACP_Date ? new Date(item.ACP_Date + 'T00:00:00') : null,
      ACP_BalanceAmt: remainAmt,
      ACP_ReserveAmt: remainAmt, // 預設保留款金額等於可用餘額
      sam: remainAmt             // 同步更新 sam 統計值
    });

    // 【需求 5 調整】活用共通元件！設定點擊新增列時要自動帶入的預設值物件
    this.tableDefaults = {
      acp_termno: 1,           // DEFAULT 1
      RET_Date: new Date(),    // DEFAULT 系統日期
      RET_Amt: remainAmt,      // DEFAULT 帶入剩餘可用金額 (APS3001.ACP_ReserveAmt - RET_Amt)
      Remark: '',
      STATUS: 'N'
    };

    // 【需求 5 調整】主動塞入第一筆預設資料（結構與 tableDefaults 一致）
    this.tableData = [{ ...this.tableDefaults }];
  }

  /**
   * 清空應付相關連動欄位
   */
  private clearAcpRelatedFields(): void {
    this.dataForm.patchValue({
      ACP_No: '',
      VEN_No: '',
      VEN_Name: '',
      ACP_Amt: 0,
      ACP_Date: null,
      ACP_BalanceAmt: 0,
      ACP_ReserveAmt: 0,
      sam: 0
    }, { emitEvent: false });

    this.tableData = [];
    this.tableDefaults = {}; // 同步清空預設值
  }

  /**
   * 彈出對話框 Table 點選整列帶回
   */
  onApsRowClick(rowData: IAPS3001Item): void {
    if (!rowData) return;
    this.fillFormFromApsItem(rowData);
    this.displaySearchDialog = false; // 關閉對話框
  }

  /**
   * 彈出視窗：純前端搜尋過濾
   */
  onApsDialogSearch(): void {
    const { VEN_No, VEN_Name, ACP_Date_From, ACP_Date_To } = this.dialogQueryForm.value;
    const sVenNo = (VEN_No || '').trim().toLowerCase();
    const sVenName = (VEN_Name || '').trim().toLowerCase();
    const fromTime = ACP_Date_From ? new Date(ACP_Date_From).setHours(0, 0, 0, 0) : null;
    const toTime = ACP_Date_To ? new Date(ACP_Date_To).setHours(23, 59, 59, 999) : null;

    this.apsDialogData = this.apsRawData.filter(item => {
      const matchVenNo = !sVenNo || (item.VEN_No ?? '').toLowerCase().includes(sVenNo);
      const matchVenName = !sVenName || (item.VEN_Name ?? '').toLowerCase().includes(sVenName);
      let matchDate = true;
      if (fromTime || toTime) {
        if (item.ACP_Date) {
          const itemTime = new Date(item.ACP_Date).getTime();
          matchDate = (!fromTime || itemTime >= fromTime) && (!toTime || itemTime <= toTime);
        } else {
          matchDate = false;
        }
      }
      return matchVenNo && matchVenName && matchDate;
    });
  }
}

/**
 * 自訂表單群組驗證器：檢查 保留款金額 (ACP_ReserveAmt) 是否小於等於 應付金額 (ACP_Amt)
 */
export const reserveAmtLessThanAcpAmtValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const acpAmt = control.get('ACP_Amt')?.value;
  const reserveAmt = control.get('ACP_ReserveAmt')?.value;

  // 當欄位有值且 保留款金額 > 應付金額 時，回傳錯誤標記
  if (acpAmt !== null && reserveAmt !== null && Number(reserveAmt) > Number(acpAmt)) {
    // 將錯誤同時掛在群組，並設定到該欄位上，讓 input 元件能觸發變紅與顯示錯誤
    control.get('ACP_ReserveAmt')?.setErrors({ reserveAmtTooLarge: true });
    return { reserveAmtTooLarge: true };
  }

  // 如果檢查過關，且該欄位原本只有這個錯誤，就清除它
  const errors = control.get('ACP_ReserveAmt')?.errors;
  if (errors?.['reserveAmtTooLarge']) {
    delete errors['reserveAmtTooLarge'];
    control.get('ACP_ReserveAmt')?.setErrors(Object.keys(errors).length ? errors : null);
  }

  return null;
};
