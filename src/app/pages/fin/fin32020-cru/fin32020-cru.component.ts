/* eslint-disable @typescript-eslint/no-explicit-any */
import { AsyncPipe, NgIf } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PanelModule } from 'primeng/panel';
import { catchError, map, of, shareReplay } from 'rxjs';

import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';

import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

import {
  FIN32020Service,
  Fin32020DetailRow,
  Fin32020InsertRequest,
  Fin32020Row,
  Fin32020UpdateRequest,
} from '../../../service/api/fin/fin32020.service';

// 專屬 table-edit
import { FIN32020TableEditComponent } from './fin32020table-edit/fin32020table-edit.component';
import {
  EditColumn,
  FieldChangeEvent,
} from './fin32020table-edit/fin32020table-edit.model';

// Dialog
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';

import { DropdownApiService } from '@service/utility/dropdown-api.service';

@Component({
  selector: 'app-fin32020-cru',
  templateUrl: './fin32020-cru.component.html',
  styleUrl: './fin32020-cru.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    PanelModule,
    FormsModule,
    NgIf,
    ReactiveFormsModule,
    CalendarComponent,
    InputTextComponent,
    ButtonComponent,
    TranslateModule,
    DialogComponent,
    DropdownComponent,
    CalendarRangeComponent,
    AsyncPipe,
    FIN32020TableEditComponent,
  ],
})
export class FIN32020CRUComponent
  extends BasicCruPageComponent<Fin32020Row>
  implements OnInit {
  /** 主檔表單 */
  dataForm = this.formBuilder.nonNullable.group({
    adjust_ID: [{ value: '系統自動帶入', disabled: true } as any],
    adjust_Date: [null as Date | null, [Validators.required]],
    remark: ['', [Validators.maxLength(30)]],
  });
  private readonly scrollBounceOffset = 80;
  /** 明細資料（畫面用 model） */
  detailData: any[] = [];


  // GLS1005 科目下拉（只顯示 value 六位）
  adjAccNoOptions$ = this.fin32020Service.getGLS1005DropDown().pipe(
    map((res) => {
      const list = Array.isArray(res?.Data) ? res.Data : [];

      return list
        .map((x) => {
          const no = String(x.No ?? '').trim();
          const name = String(x.Name ?? '').trim();

          return {
            label: `${no}-${name}`,
            value: no,
          };
        })
        .filter((x) => x.value.length === 6);
    }),
    catchError((err) => {
      console.error('getGLS1005DropDown error:', err);
      return of([]);
    }),
    shareReplay(1)
  );

  defaultDetailRow = {
    SeqNo: null,
    receiveID: null, // ARS_No（可手輸）
    adjustID: null, // AccNo
    AccCName: null, // 科目名稱
    adjustDisplay: '', // AccNo-AccCName
    adjustAmount: null,
    adjustRemark: '',
    vouNo: null, // 傳票單號（永遠顯示、永遠 disable）
    gls3001_id: null,
  };

  detailLoading = false;

  /** 金額格式化 */
  moneyFormat = (value: number): string =>
    value != null ? Number(value || 0).toLocaleString('en-US') : '0';

  /** 合計（前端即時加總） */
  get totalAdjustAmount(): number {
    const list = this.detailData || [];
    return list.reduce((sum: number, r: any) => {
      const n = Number(r?.adjustAmount ?? 0);
      return sum + (Number.isFinite(n) ? n : 0);
    }, 0);
  }

  /** 目前點擊列 index（Dialog 回填用） */
  currentDetailIndex: number | null = null;

  /** 目前點擊到的實際 rowData（table-edit 內部那列） */
  currentDetailRowData: any = null;

  /** 明細欄位定義 */
  detailColumns: EditColumn[] = [
    {
      field: 'receiveID',
      header: '應收帳款單號',
      width: '200px',
      textAlign: 'left',
    },
    {
      field: 'adjustDisplay',
      header: '調整科目代號',
      width: '220px',
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
    {
      field: 'vouNo',
      header: '傳票單號',
      type: 'input',
      width: '180px',
      textAlign: 'left',
      disabled: () => true,
    },
  ];

  // ================== 應收帳款 Dialog ==================
  arsDialogVisible = false;
  arsLoading = false;
  arsList: any[] = [];
  arsSelectedRow: any = null;

  // ✅ 新增這 4 個
  arsPageIndex = 1;
  arsPageSize = 20;
  arsHasMore = true;
  arsQuerying = false;
  adjAccSelectedRow: any = null;
  adjAccPageIndex = 1;
  adjAccPageSize = 20;
  adjAccHasMore = true;
  adjAccQuerying = false;
  VEN_No_Options = this.dropDown.queryPos2013({ VEN_Flag: '' });

  arsDialogColumns: EditColumn[] = [
    {
      field: 'ARS_No',
      header: '應收帳款單號',
      width: '180px',
      textAlign: 'left',
    },
    {
      field: 'VEN_No',
      header: '廠客代號',
      width: '140px',
      textAlign: 'left',
    },
    {
      field: 'ARS_Date',
      header: '立帳日',
      width: '120px',
      textAlign: 'center',
      format: (v: any) => this.formatYMD(v),
    },
    {
      field: 'PTA_Date',
      header: '預計收款日',
      width: '120px',
      textAlign: 'center',
      format: (v: any) => this.formatYMD(v),
    },
    {
      field: 'ARS_Amt',
      header: '應收金額',
      width: '120px',
      textAlign: 'right',
      format: (v: any) => this.moneyFormat(v),
    },
    {
      field: 'NoteDesc',
      header: '備註',
      width: '180px',
      textAlign: 'left',
    },
  ];

  arsRowMarkedFn = (row: any, _rowIndex: number, _data: any[]) =>
    this.isARSAlreadySelected(row);

  /** 後端可能回 yyyy-MM-dd / yyyy-MM-ddTHH:mm:ss / Date，都統一顯示 yyyy/MM/dd */
  formatYMD = (v: any): string => {
    if (v === null || v === undefined || v === '') return '';

    if (v instanceof Date) {
      if (isNaN(v.getTime())) return '';
      const y = v.getFullYear();
      const m = String(v.getMonth() + 1).padStart(2, '0');
      const d = String(v.getDate()).padStart(2, '0');
      return `${y}/${m}/${d}`;
    }

    const dt = new Date(v);
    if (isNaN(dt.getTime())) return String(v);

    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const d = String(dt.getDate()).padStart(2, '0');
    return `${y}/${m}/${d}`;
  };

  arsSearchForm = this.formBuilder.nonNullable.group({
    VEN_No: [''],
    ARS_No: [''],
    ARS_Date_From: [null as Date | null],
    ARS_Date_To: [null as Date | null],
  });

  // ================== 調整科目 Dialog ==================
  adjAccDialogVisible = false;
  adjAccLoading = false;
  adjAccList: any[] = [];


  adjAccDialogColumns: EditColumn[] = [
    {
      field: 'CAR_AccNo',
      header: '調整科目代號',
      width: '160px',
      textAlign: 'left',
    },
    {
      field: 'AccCName',
      header: '科目名稱',
      width: '200px',
      textAlign: 'left',
    },
    {
      field: 'CAR_type',
      header: '加減項',
      width: '100px',
      textAlign: 'center',
      format: (v: any) =>
        String(v) === '1'
          ? '加項'
          : String(v) === '2'
            ? '減項'
            : (v ?? ''),
    },
  ];

  adjAccRowMarkedFn = (row: any, _rowIndex: number, _data: any[]) =>
    this.isAdjAccAlreadySelected(row);

  // 1=加 2=減
  carTypeOptions = [
    { label: '全部', value: '' },
    { label: '1-加項', value: '1' },
    { label: '2-減項', value: '2' },
  ];

  adjAccSearchForm = this.formBuilder.nonNullable.group({
    CAR_AccNo: [''],
    CAR_type: [''],
  });

  @ViewChild(FIN32020TableEditComponent)
  detailTableEdit!: FIN32020TableEditComponent;

  constructor(
    private fin32020Service: FIN32020Service,
    private readonly dropDown: DropdownApiService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN32020', this.dataForm);

    if (this.rowdata) {
      this.patchFromRowdata(this.rowdata);
    } else {
      this.detailData = [{ ...this.defaultDetailRow, SeqNo: 1 }];
    }

    if (this.crudstatus === CRUDStatus.Create) {
      this.dataForm.patchValue({ adjust_Date: new Date() });
    }
  }

  private afterSaveSuccess(): void {
    this.loading = false;
    this.submitted = false;

    this.router.navigate(['account/fin/fin32020'], {
      queryParams: { refresh: 1 },
      state: { fromCru: true },
    });
  }

  private patchFromRowdata(row: Fin32020Row): void {
    this.dataForm.patchValue({
      adjust_ID: row.ADJ_No ?? '',
      adjust_Date: row.ADJ_Date ? new Date(row.ADJ_Date) : null,
      remark: row.Remark ?? '',
    });

    const list = (row._Details ?? []).map((d, idx) => {
      const accNo = d.AccNo ?? null;
      const accName = (d as any).AccCName ?? null;

      return {
        SeqNo: d.SeqNo ?? idx + 1,
        receiveID: d.ARS_No ?? null,
        adjustID: accNo,
        AccCName: accName,
        adjustDisplay: accName ? `${accNo}-${accName}` : (accNo ?? ''),
        adjustAmount: d.ADJ_Amt ?? null,
        adjustRemark: d.Detail_Remark ?? '',
        vouNo: d.VouNo ?? null,
        gls3001_id: d.gls3001_id ?? null,
      };
    });

    if (this.crudstatus === CRUDStatus.Read) {
      this.detailData = list;
      return;
    }

    this.detailData =
      list.length > 0 ? list : [{ ...this.defaultDetailRow, SeqNo: 1 }];
  }

  onDetailDataChange(data: any[]): void {
    this.detailData = (data ?? []).map((row, idx) => ({
      ...row,
      SeqNo: idx + 1,
    }));
    this.refreshDialogSelectedFlags();
  }

  onDetailFieldChange(_event: FieldChangeEvent): void { }

  onDetailCellClick(e: {
    col: EditColumn;
    rowData: any;
    index: number;
    event: MouseEvent;
  }): void {
    if (this.isFormReadable) return;

    const rowChanged = this.currentDetailIndex !== e.index;
    this.currentDetailIndex = e.index;
    this.currentDetailRowData = e.rowData;

    if (rowChanged) {
      this.resetARSDialogState();
      this.resetAdjAccDialogState();
    }

    this.refreshDialogSelectedFlags();

    if (e.col.field === 'receiveID') {
      this.openARSDialog();
    } else if (e.col.field === 'adjustDisplay') {
      this.openAdjAccDialog();
    }
  }

  onDetailDelete(_: any): void {
    this.reCalcSeqNo();
    this.refreshDialogSelectedFlags();
  }

  private reCalcSeqNo(): void {
    this.detailData = (this.detailData || []).map((row, idx) => ({
      ...row,
      SeqNo: idx + 1,
    }));
  }

  private syncDetailDataFromTableEdit(): void {
    if (!this.detailTableEdit) return;

    this.detailData = this.detailTableEdit._tableData
      .filter((item: any) => !item._isAutoInsertCandidate)
      .map((item: any, idx: number) => ({
        ...item,
        SeqNo: idx + 1,
      }));

    this.refreshDialogSelectedFlags();
  }

  onBack(): void {
    this.router.navigate(['account/fin/fin32020'], {
      state: { fromCru: true },
    });
  }

  openARSDialog(): void {
    if (this.isFormReadable) return;

    const current = (this.currentDetailRowData?.receiveID ?? '')
      .toString()
      .trim();

    this.resetARSDialogState(current);
    this.arsDialogVisible = true;
  }

  onSearchARS(): void {
    this.arsPageIndex = 1;
    this.arsHasMore = true;
    this.arsList = [];
    this.loadMoreARS();
  }

  confirmARSSelection(): void {
    const idx = this.currentDetailIndex ?? 0;
    const targetRow = this.currentDetailRowData;

    if (!targetRow) {
      this.arsDialogVisible = false;
      this.currentDetailIndex = null;
      this.currentDetailRowData = null;
      this.arsSelectedRow = null;
      return;
    }

    let arsNoToFill: string | null = null;

    if (this.arsSelectedRow) {
      arsNoToFill = (this.arsSelectedRow.ARS_No ?? '').trim() || null;
    }

    if (!arsNoToFill) {
      const inputArsNo = (this.arsSearchForm.controls.ARS_No.value ?? '').trim();
      arsNoToFill = inputArsNo || null;
    }

    if (!arsNoToFill) {
      this.messageService?.warnBubble?.('請先選擇應收帳款單號');
      return;
    }

    if (this.isDuplicateARSNo(arsNoToFill, idx)) {
      this.messageService?.warnBubble?.(
        `應收帳款單號【${arsNoToFill}】已存在，請勿重複選擇`
      );
      return;
    }

    this.detailTableEdit?.applyDialogValue(targetRow, idx, {
      receiveID: arsNoToFill,
    });

    this.syncDetailDataFromTableEdit();

    this.arsDialogVisible = false;
    this.currentDetailIndex = null;
    this.currentDetailRowData = null;
    this.arsSelectedRow = null;
  }

  private isDuplicateARSNo(arsNo: string, currentIndex: number): boolean {
    const target = String(arsNo ?? '').trim();
    if (!target) return false;

    return (this.detailData || []).some((row: any, idx: number) => {
      if (idx === currentIndex) return false;

      const existing = String(row?.receiveID ?? '').trim();
      return !!existing && existing === target;
    });
  }

  openAdjAccDialog(): void {
    if (this.isFormReadable) return;

    const current = (this.currentDetailRowData?.adjustID ?? '')
      .toString()
      .trim();

    this.resetAdjAccDialogState(current);
    this.adjAccDialogVisible = true;
  }

  onSearchAdjAcc(): void {
    this.adjAccPageIndex = 1;
    this.adjAccHasMore = true;
    this.adjAccList = [];
    this.loadMoreAdjAcc();
  }

  confirmAdjAccSelection(): void {
    if (!this.adjAccSelectedRow) return;

    const row = this.adjAccSelectedRow;
    const idx = this.currentDetailIndex ?? 0;
    const targetRow = this.currentDetailRowData;

    if (!targetRow) {
      this.adjAccDialogVisible = false;
      this.currentDetailIndex = null;
      this.currentDetailRowData = null;
      this.adjAccSelectedRow = null;
      return;
    }

    const accNo = row.CAR_AccNo ?? null;
    const accName = row.AccCName ?? null;

    this.detailTableEdit?.applyDialogValue(targetRow, idx, {
      adjustID: accNo,
      AccCName: accName,
      adjustDisplay: accName ? `${accNo}-${accName}` : (accNo ?? ''),
    });

    this.syncDetailDataFromTableEdit();

    this.adjAccDialogVisible = false;
    this.currentDetailIndex = null;
    this.currentDetailRowData = null;
    this.adjAccSelectedRow = null;
  }

  override onCancel(): void {
    if (this.crudstatus === CRUDStatus.Create) {
      this.dataForm.reset();
      this.dataForm.patchValue({ adjust_Date: new Date(), remark: '' });
      this.detailData = [{ ...this.defaultDetailRow, SeqNo: 1 }];
      this.submitted = false;
      this.currentDetailIndex = null;
      this.currentDetailRowData = null;
      return;
    }

    if (this.crudstatus === CRUDStatus.Edit) {
      if (this.rowdata) this.patchFromRowdata(this.rowdata);
      this.submitted = false;
      this.currentDetailIndex = null;
      this.currentDetailRowData = null;
      return;
    }

    super.onCancel();
  }

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
          ADJ_Amt: Number.isFinite(amt) ? amt : 0,
          Detail_Remark: row.adjustRemark ?? null,
          ARS_No: arsNo || null,
          gls3001_id: row.gls3001_id ?? null,
        } as Fin32020DetailRow;
      })
      .filter(
        (d) => !!(d.ARS_No?.trim() || d.AccNo?.trim() || (d.ADJ_Amt ?? 0) !== 0)
      );
  }

  private buildInsertPayload(): Fin32020InsertRequest {
    const raw = this.dataForm.getRawValue();
    return {
      ADJ_Date: this.toYMD(raw.adjust_Date as Date),
      Remark: raw.remark ?? null,
      _Details: this.buildDetailList(),
    };
  }

  private buildUpdatePayload(): Fin32020UpdateRequest {
    const raw = this.dataForm.getRawValue();

    const adjNo =
      (this.rowdata?.ADJ_No ?? '') || String(raw.adjust_ID ?? '').trim();

    return {
      ADJ_No: adjNo,
      ADJ_Date: this.toYMD(raw.adjust_Date as Date),
      Remark: raw.remark ?? null,
      _Details: this.buildDetailList(),
    };
  }

  onSubmit(frm: FormGroup) {
    if (this.detailTableEdit) {
      const tableValid = this.detailTableEdit.validateAndShowErrors();
      if (!tableValid) return;
    }

    this.handleSubmit(frm, () => {
      if (this.crudstatus === CRUDStatus.Create && this.canAdd()) {
        const payload = this.buildInsertPayload();

        this.fin32020Service.insertFIN32020(payload).subscribe({
          next: () => this.afterSaveSuccess(),
          error: (err) => {
            console.error('FIN32020 Insert error:', err);
            this.loading = false;
          },
        });
      } else if (this.crudstatus === CRUDStatus.Edit && this.canEdit()) {
        const payload = this.buildUpdatePayload();

        this.fin32020Service.updateFIN32020(payload).subscribe({
          next: () => this.afterSaveSuccess(),
          error: (err) => {
            console.error('FIN32020 Update error:', err);
            this.loading = false;
          },
        });
      } else {
        this.loading = false;
      }
    });
  }

  submitForm(frm: FormGroup) {
    this.onSubmit(frm);
  }

  private resetARSDialogState(defaultARSNo?: string): void {
    this.arsSearchForm.reset({
      VEN_No: '',
      ARS_No: defaultARSNo ?? '',
      ARS_Date_From: null,
      ARS_Date_To: null,
    });

    this.arsList = [];
    this.arsSelectedRow = null;
    this.arsLoading = false;

    this.arsPageIndex = 1;
    this.arsHasMore = true;
    this.arsQuerying = false;
  }

  private resetAdjAccDialogState(defaultAccNo?: string): void {
    this.adjAccSearchForm.reset({
      CAR_AccNo: defaultAccNo ?? '',
      CAR_type: '',
    });

    this.adjAccList = [];
    this.adjAccSelectedRow = null;
    this.adjAccLoading = false;

    this.adjAccPageIndex = 1;
    this.adjAccHasMore = true;
    this.adjAccQuerying = false;
  }
  onARSCancel(): void {
    this.resetARSDialogState();
  }

  onAdjAccCancel(): void {
    this.resetAdjAccDialogState();
  }

  private isARSAlreadySelected(row: any): boolean {
    const arsNo = String(row?.ARS_No ?? '').trim();
    if (!arsNo) return false;

    return (this.detailData || []).some((item: any, idx: number) => {
      if (idx === (this.currentDetailIndex ?? -1)) return false;
      return String(item?.receiveID ?? '').trim() === arsNo;
    });
  }

  private isAdjAccAlreadySelected(row: any): boolean {
    const accNo = String(row?.CAR_AccNo ?? '').trim();
    if (!accNo) return false;

    return (this.detailData || []).some((item: any, idx: number) => {
      if (idx === (this.currentDetailIndex ?? -1)) return false;
      return String(item?.adjustID ?? '').trim() === accNo;
    });
  }

  private refreshARSListSelectedFlag(): void { }
  private refreshAdjAccListSelectedFlag(): void { }
  private refreshDialogSelectedFlags(): void { }
  onARSDoubleClick(event: { rowData: any; index: number }): void {
    if (!event?.rowData) return;
    this.arsSelectedRow = event.rowData;
    this.confirmARSSelection();
  }

  onAdjAccDoubleClick(event: { rowData: any; index: number }): void {
    if (!event?.rowData) return;
    this.adjAccSelectedRow = event.rowData;
    this.confirmAdjAccSelection();
  }
  private buildARSQuery(pageIndex: number) {
    const raw = this.arsSearchForm.getRawValue();

    const venNo = raw.VEN_No?.trim() || null;
    const arsNo = raw.ARS_No?.trim() || null;
    const arsDateFrom = raw.ARS_Date_From
      ? this.toYMD(raw.ARS_Date_From as Date)
      : null;
    const arsDateTo = raw.ARS_Date_To
      ? this.toYMD(raw.ARS_Date_To as Date)
      : null;

    return {
      VEN_No: venNo,
      ARS_No: arsNo,
      ARS_Date_From: arsDateFrom,
      ARS_Date_To: arsDateTo,
      PageIndex: pageIndex,
      PageSize: this.arsPageSize,
      SortBy: [],
    };
  }
 loadMoreARS(container?: HTMLElement): void {
  if (this.arsLoading || this.arsQuerying || !this.arsHasMore) return;

  this.arsLoading = true;
  this.arsQuerying = true;

  const req = this.buildARSQuery(this.arsPageIndex);

  this.fin32020Service.getARS(req).subscribe({
    next: (res) => {
      const rawList = Array.isArray(res.Data) ? res.Data : [];

      if (this.arsPageIndex === 1) {
        this.arsList = rawList;
      } else {
        const existingKeys = new Set(
          (this.arsList || []).map((x: any) => String(x.ARS_No ?? '').trim())
        );

        const appendList = rawList.filter((x: any) => {
          const key = String(x?.ARS_No ?? '').trim();
          return key && !existingKeys.has(key);
        });

        this.arsList = [...this.arsList, ...appendList];
      }

      if (rawList.length < this.arsPageSize) {
        this.arsHasMore = false;
      } else {
        this.arsPageIndex += 1;
      }

      this.arsLoading = false;
      this.arsQuerying = false;

      // 資料 append 後，如果使用者還停在底部附近，就繼續下一頁
      if (container && this.arsHasMore) {
        requestAnimationFrame(() => {
          if (this.isNearBottom(container)) {
            this.loadMoreARS(container);
          }
        });
      }
    },
    error: (err) => {
      console.error('FIN32020 getARS error:', err);
      this.arsLoading = false;
      this.arsQuerying = false;
    },
  });
}

  private buildAdjAccQuery(pageIndex: number) {
    const raw = this.adjAccSearchForm.getRawValue();

    return {
      CAR_AccNo: raw.CAR_AccNo?.trim() || null,
      CAR_type: raw.CAR_type?.trim() || null,
      pageIndex: pageIndex,
      pageSize: this.adjAccPageSize,
      SortBy: [{ field: 'CAR_AccNo', order: 1 }],
    };
  }
  loadMoreAdjAcc(container?: HTMLElement): void {
  if (this.adjAccLoading || this.adjAccQuerying || !this.adjAccHasMore) return;

  this.adjAccLoading = true;
  this.adjAccQuerying = true;

  const body = this.buildAdjAccQuery(this.adjAccPageIndex);

  this.fin32020Service.getAdjAcc(body).subscribe({
    next: (res) => {
      const rawList = Array.isArray(res.Data) ? res.Data : [];

      if (this.adjAccPageIndex === 1) {
        this.adjAccList = rawList.sort((a: any, b: any) => {
          const aNo = String(a?.CAR_AccNo ?? '');
          const bNo = String(b?.CAR_AccNo ?? '');
          return aNo.localeCompare(bNo, 'zh-Hant', { numeric: true });
        });
      } else {
        const existingKeys = new Set(
          (this.adjAccList || []).map((x: any) =>
            String(x.CAR_AccNo ?? '').trim()
          )
        );

        const appendList = rawList.filter((x: any) => {
          const key = String(x?.CAR_AccNo ?? '').trim();
          return key && !existingKeys.has(key);
        });

        this.adjAccList = [...this.adjAccList, ...appendList].sort(
          (a: any, b: any) => {
            const aNo = String(a?.CAR_AccNo ?? '');
            const bNo = String(b?.CAR_AccNo ?? '');
            return aNo.localeCompare(bNo, 'zh-Hant', { numeric: true });
          }
        );
      }

      if (rawList.length < this.adjAccPageSize) {
        this.adjAccHasMore = false;
      } else {
        this.adjAccPageIndex += 1;
      }

      this.adjAccLoading = false;
      this.adjAccQuerying = false;

      if (container && this.adjAccHasMore) {
        requestAnimationFrame(() => {
          if (this.isNearBottom(container)) {
            this.loadMoreAdjAcc(container);
          }
        });
      }
    },
    error: (err) => {
      console.error('FIN32020 getAdjAcc error:', err);
      this.adjAccLoading = false;
      this.adjAccQuerying = false;
    },
  });
}
private isNearBottom(container?: HTMLElement, threshold = 80): boolean {
  if (!container) return false;

  return (
    container.scrollTop + container.clientHeight >=
    container.scrollHeight - threshold
  );
}
}