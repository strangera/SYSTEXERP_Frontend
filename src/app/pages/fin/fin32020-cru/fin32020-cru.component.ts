/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PanelModule } from 'primeng/panel';

import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';

import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';

import {
  FIN32020Service,
  Fin32020Row,
  Fin32020InsertRequest,
  Fin32020UpdateRequest,
  Fin32020DetailRow,
  Fin32020ARSRow,
  Fin32020AdjAccRow,
} from '../../../service/api/fin/fin32020.service';

// ⭐ 改用 Table2Component
import { Table2Component } from '../../../shared/componentkit/table2/table2.component';
import { Column } from '../../../shared/componentkit/table2/table2.model';

// 專屬 FIN32020 的 table-edit 元件
import { FIN32020TableEditComponent } from './fin32020table-edit/fin32020table-edit.component';
import {
  EditColumn,
  FieldChangeEvent,
} from './fin32020table-edit/fin32020table-edit.model';

// Dialog 元件
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-fin32020-cru',
  templateUrl: './fin32020-cru.component.html',
  styleUrl: './fin32020-cru.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    // InputNumberComponent,
    CalendarComponent,
    InputTextComponent,
    ButtonComponent,
    TranslateModule,
    Table2Component,          // ⭐ 這裡換成 Table2
    DialogComponent,
     DropdownComponent,
    CalendarRangeComponent,
    AsyncPipe,
    FIN32020TableEditComponent,
  ],
})
export class FIN32020CRUComponent
  extends BasicCruPageComponent<Fin32020Row>
  implements OnInit
{
  /** 主檔表單 */
  dataForm = this.formBuilder.nonNullable.group({
    adjust_ID: [{ value: '', disabled: true } as any], // ADJ_No（顯示用）
    adjust_Date: [null as Date | null, [Validators.required]], // ADJ_Date
    remark: ['', [Validators.maxLength(30)]], // Remark 長度 30
  });

  /** 明細資料（畫面用的 model） */
  detailData: any[] = [
    {
      SeqNo: 1,
      receiveID: null, // ARS_No
      adjustID: null, // AccNo
      adjustAmount: null, // ADJ_Amt
      adjustRemark: '', // Detail_Remark
      gls3001_id: null, // 傳票 ID
    },
  ];
  detailLoading = false;

  /** 新增列預設值 */
  defaultDetailRow = {
    SeqNo: null,
    receiveID: null,
    adjustID: null,
    adjustAmount: null,
    adjustRemark: '',
    gls3001_id: null,
  };

  /** 金額格式化 */
  moneyFormat = (value: number): string =>
    value != null ? Number(value || 0).toLocaleString('en-US') : '0';

  /** 目前點擊的是哪一列（給 Dialog 回填用） */
  currentDetailIndex: number | null = null;

  /** 明細欄位定義（給 FIN32020TableEditComponent 用） */
  detailColumns: EditColumn[] = [
    {
      field: 'receiveID',
      header: '應收帳款單號',
      type: 'input',
      width: '200px',
      textAlign: 'left',
    },
    {
      field: 'adjustID',
      header: '調整科目代號',
      type: 'input',
      width: '160px',
      textAlign: 'left',
    },
    {
      field: 'adjustAmount',
      header: '調整金額',
      type: 'inputNumber',
      width: '140px',
      textAlign: 'right',
      format: this.moneyFormat,
    },
    {
      field: 'adjustRemark',
      header: '備註',
      type: 'input',
      width: '240px',
      textAlign: 'left',
    },
  ];

  // ===== 應收帳款查詢 Dialog =====
  arsDialogVisible = false;
  arsLoading = false;
  arsList: Fin32020ARSRow[] = [];
  arsSelectedRows: Fin32020ARSRow[] = [];
  VEN_No_Options = this.dropDown.queryPos2013({ VEN_Flag: '' }); // 廠商代號
  arsColumns: Column[] = [
    { field: 'ARS_No', header: '應收帳款單號' },
    { field: 'VEN_No', header: '廠客代號' },
    { field: 'ARS_Date', header: '立帳日' },
    { field: 'PTA_Date', header: '預計收款日' },
    {
      field: 'ARS_Amt',
      header: '應收金額',
      format: this.moneyFormat,
    },
    { field: 'NoteDesc', header: '備註' },
  ];

  // 查詢條件
  arsSearchForm = this.formBuilder.nonNullable.group({
    VEN_No: [''],
    ARS_Date_From: [null as Date | null],
    ARS_Date_To: [null as Date | null],
  });

  // ===== 調整科目查詢 Dialog =====
  adjAccDialogVisible = false;
  adjAccLoading = false;
  adjAccList: Fin32020AdjAccRow[] = [];
  adjAccSelectedRows: Fin32020AdjAccRow[] = [];
  adjAccColumns: Column[] = [
    { field: 'CAR_AccNo', header: '調整科目代號' },
    { field: 'AccCName', header: '科目名稱' },
    { field: 'CAR_type', header: '加減項' },
  ];

  @ViewChild(FIN32020TableEditComponent)
  detailTableEdit!: FIN32020TableEditComponent;

  constructor(private fin32020Service: FIN32020Service,private readonly dropDown: DropdownApiService,) {
    super();
  }

  /* ================= LifeCycle ================= */

  ngOnInit(): void {
    this.initializePage('FIN32020', this.dataForm);

    if (this.rowdata) {
      this.patchFromRowdata(this.rowdata);
    }

    if (this.crudstatus === CRUDStatus.Create) {
      this.dataForm.patchValue({
        adjust_Date: new Date(),
      });
    }
  }

  /** Query row → CRU mapping */
  private patchFromRowdata(row: Fin32020Row): void {
    this.dataForm.patchValue({
      adjust_ID: row.ADJ_No ?? '',
      adjust_Date: row.ADJ_Date ? new Date(row.ADJ_Date) : null,
      remark: row.Remark ?? '',
    });

    const list = (row._Details ?? []).map((d, idx) => ({
      SeqNo: d.SeqNo ?? idx + 1,
      receiveID: d.ARS_No ?? null,
      adjustID: d.AccNo ?? null,
      adjustAmount: d.ADJ_Amt ?? null,
      adjustRemark: d.Detail_Remark ?? '',
      gls3001_id: d.gls3001_id ?? null,
    }));

    this.detailData =
      list.length > 0 ? list : [{ ...this.defaultDetailRow, SeqNo: 1 }];
  }

  /* ================= 明細 table 事件 ================= */

  onDetailDataChange(data: any[]): void {
    this.detailData = data ?? [];
    this.reCalcSeqNo();
  }

  onDetailFieldChange(_event: FieldChangeEvent): void {
    // 目前暫時沒特別邏輯，先保留
  }

  onDetailCellClick(e: {
    col: EditColumn;
    rowData: any;
    index: number;
    event: MouseEvent;
  }): void {
    if (this.isFormReadable) return;

    this.currentDetailIndex = e.index;

    if (e.col.field === 'receiveID') {
      this.openARSDialog();
    } else if (e.col.field === 'adjustID') {
      this.openAdjAccDialog();
    }
  }

  onDetailDelete(_: any): void {
    this.reCalcSeqNo();
  }

  private reCalcSeqNo(): void {
    this.detailData = (this.detailData || []).map((row, idx) => ({
      ...row,
      SeqNo: idx + 1,
    }));
  }

  /* ================= 應收帳款 Dialog ================= */

  openARSDialog(): void {
    if (this.isFormReadable) return;
    this.arsDialogVisible = true;
  }

  onSearchARS(): void {
    const raw = this.arsSearchForm.getRawValue();

    const venNo = raw.VEN_No?.trim() || null;
    const arsDateFrom = raw.ARS_Date_From
      ? this.toYMD(raw.ARS_Date_From as Date)
      : null;
    const arsDateTo = raw.ARS_Date_To
      ? this.toYMD(raw.ARS_Date_To as Date)
      : null;

    if (!venNo && !arsDateFrom && !arsDateTo) {
      console.warn('請至少輸入廠客代號或立帳日');
      return;
    }

    this.arsLoading = true;

    const req = {
      VEN_No: venNo,
      ARS_Date_From: arsDateFrom,
      ARS_Date_To: arsDateTo,
      PageIndex: 1,
      PageSize: 50,
    };

    this.fin32020Service.getARS(req).subscribe({
      next: (res) => {
        this.arsList = Array.isArray(res.Data) ? res.Data : [];
        this.arsLoading = false;
      },
      error: (err) => {
        console.error('FIN32020 getARS error:', err);
        this.arsList = [];
        this.arsLoading = false;
      },
    });
  }

  /** 單點選擇（固定高光） */
  onARSSelectionChange(selected: Fin32020ARSRow[] | Fin32020ARSRow): void {
    this.arsSelectedRows = Array.isArray(selected)
      ? selected
      : selected
      ? [selected]
      : [];
  }

  /** 雙擊列 → 直接當成選取 + 確定 */
  onARSRowDetail(row: Fin32020ARSRow): void {
    if (!row) return;
    this.arsSelectedRows = [row];
    this.confirmARSSelection();
  }

  /** 按「確定」或雙擊完成選擇 */
  confirmARSSelection(): void {
    if (!this.arsSelectedRows.length) return;

    const row = this.arsSelectedRows[0];
    const idx = this.currentDetailIndex ?? 0;
    if (!this.detailData[idx]) return;

    this.detailData[idx] = {
      ...this.detailData[idx],
      receiveID: row.ARS_No ?? null,
    };
    this.detailData = [...this.detailData];

    this.reCalcSeqNo();
    this.arsDialogVisible = false;
    this.currentDetailIndex = null;
    this.arsSelectedRows = [];
  }

  /* ================= 調整科目 Dialog ================= */

  openAdjAccDialog(): void {
    if (this.isFormReadable) return;
    this.adjAccDialogVisible = true;
    if (!this.adjAccList.length) {
      this.onSearchAdjAcc();
    }
  }

  onSearchAdjAcc(): void {
    this.adjAccLoading = true;
    this.fin32020Service.getAdjAcc().subscribe({
      next: (res) => {
        this.adjAccList = Array.isArray(res.Data) ? res.Data : [];
        this.adjAccLoading = false;
      },
      error: (err) => {
        console.error('FIN32020 getAdjAcc error:', err);
        this.adjAccList = [];
        this.adjAccLoading = false;
      },
    });
  }

  /** 單點選擇（固定高光） */
  onAdjAccSelectionChange(selected: Fin32020AdjAccRow[] | Fin32020AdjAccRow): void {
    this.adjAccSelectedRows = Array.isArray(selected)
      ? selected
      : selected
      ? [selected]
      : [];
  }

  /** 雙擊列 → 直接當成選取 + 確定 */
  onAdjAccRowDetail(row: Fin32020AdjAccRow): void {
    if (!row) return;
    this.adjAccSelectedRows = [row];
    this.confirmAdjAccSelection();
  }

  /** 按「確定」或雙擊完成選擇 */
  confirmAdjAccSelection(): void {
    if (!this.adjAccSelectedRows.length) return;

    const row = this.adjAccSelectedRows[0];
    const idx = this.currentDetailIndex ?? 0;
    if (!this.detailData[idx]) return;

    this.detailData[idx] = {
      ...this.detailData[idx],
      adjustID: row.CAR_AccNo ?? null,
    };
    this.detailData = [...this.detailData];

    this.reCalcSeqNo();
    this.adjAccDialogVisible = false;
    this.currentDetailIndex = null;
    this.adjAccSelectedRows = [];
  }

  /* ================= 組 payload ================= */

  private toYMD(d: Date | null | undefined): string {
    if (!d) return '';
    const yyyy = d.getFullYear();
    const mm = `${d.getMonth() + 1}`.padStart(2, '0');
    const dd = `${d.getDate()}`.padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private buildDetailList(): Fin32020DetailRow[] {
    return (this.detailData || [])
      .map((row, idx) => {
        const accNo = String(row.adjustID ?? '').trim();
        const arsNo = String(row.receiveID ?? '').trim();
        const amt = Number(row.adjustAmount ?? 0);

        return {
          SeqNo: idx + 1,
          AccNo: accNo || null,
          ADJ_Amt: amt,
          Detail_Remark: row.adjustRemark ?? null,
          ARS_No: arsNo || null,
          VouNo: null,
          gls3001_id: row.gls3001_id ?? null,
        } as Fin32020DetailRow;
      })
      .filter(
        (d) =>
          (d.ARS_No && d.ARS_No.trim() !== '') ||
          (d.AccNo && d.AccNo.trim() !== '') ||
          (d.ADJ_Amt ?? 0) !== 0
      );
  }

  private buildInsertPayload(): Fin32020InsertRequest {
    const raw = this.dataForm.getRawValue();
    const detailList = this.buildDetailList();

    const payload: Fin32020InsertRequest = {
      ADJ_Date: this.toYMD(raw.adjust_Date as Date),
      Remark: raw.remark ?? null,
      _Details: detailList,
    };

    return payload;
  }

  private buildUpdatePayload(): Fin32020UpdateRequest {
    const raw = this.dataForm.getRawValue();
    const detailList = this.buildDetailList();

    const adjNo =
      (this.rowdata?.ADJ_No ?? '') ||
      String(raw.adjust_ID ?? '').trim();

    const payload: Fin32020UpdateRequest = {
      ADJ_No: adjNo,
      ADJ_Date: this.toYMD(raw.adjust_Date as Date),
      Remark: raw.remark ?? null,
      _Details: detailList,
    };

    return payload;
  }

  /* ================= Submit ================= */

  onSubmit(frm: FormGroup) {
    if (this.detailTableEdit) {
      const tableValid = this.detailTableEdit.validateAndShowErrors();
      if (!tableValid) {
        return;
      }
    }

    this.handleSubmit(frm, () => {
      if (this.crudstatus === CRUDStatus.Create && this.canAdd()) {
        const payload = this.buildInsertPayload();

        this.fin32020Service.insertFIN32020(payload).subscribe({
          next: (res) => {
            console.log('FIN32020 Insert success:', res);
          },
          error: (err) => {
            console.error('FIN32020 Insert error:', err);
          },
        });
      } else if (this.crudstatus === CRUDStatus.Edit && this.canEdit()) {
        const payload = this.buildUpdatePayload();

        this.fin32020Service.updateFIN32020(payload).subscribe({
          next: (res) => {
            console.log('FIN32020 Update success:', res);
          },
          error: (err) => {
            console.error('FIN32020 Update error:', err);
            this.loading = false;
          },
        });
      }
    });
  }

  submitForm(frm: FormGroup) {
    this.onSubmit(frm);
  }
}
