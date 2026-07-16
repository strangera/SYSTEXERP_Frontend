/* eslint-disable @typescript-eslint/no-explicit-any */
import { NgIf } from '@angular/common';
import { Component, OnInit, ViewChild, signal } from '@angular/core';
import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { PanelModule } from 'primeng/panel';

import { DialogComponent } from '@shared/components/dialog/dialog.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarComponent } from '../../../shared/components/calendar/calendar.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';

import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

import {
  ASS16090Service,
  Ass16090ApproveRequest,
  Ass16090DetailResponse,
  Ass16090InsertRequest,
  Ass16090Row,
  Ass16090UpdateRequest,
  Ass16090VoidRequest,
  QueryDDLASS16090Request,
  QueryDDLASS16090Response,
} from '../../../service/api/ass/ass16090.service';

import { ASS11100Service } from '@service/api/ass/ass11100.service';
import { DropDownListService } from '@service/utility/dropDownList.service';

/** 共用 FIN32020 的 table-edit */
import { FIN32020TableEditComponent } from '../../fin/fin32020-cru/fin32020table-edit/fin32020table-edit.component';
import {
  EditColumn,
  FieldChangeEvent,
} from '../../fin/fin32020-cru/fin32020table-edit/fin32020table-edit.model';

/** Dialog 查詢結果 table */
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { Table2Component } from '@others/component/table2/table2.component';
import { Column } from '@others/component/table2/table2.model';

@UntilDestroy()
@Component({
  selector: 'app-ass16090-cru',
  templateUrl: './ass16090-cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    PanelModule,
    FormsModule,
    NgIf,
    ReactiveFormsModule,
    CalendarComponent,
    InputTextComponent,
    DropdownComponent,
    ButtonComponent,
    TranslateModule,
    FIN32020TableEditComponent,
    DialogComponent,
    Table2Component,
  ],
})
export class ASS16090CRUComponent
  extends BasicCruPageComponent<Ass16090Row>
  implements OnInit {
  isSelectingCandidateRow = false;
  /** 倉別選項 */
  public readonly whIdOptions = signal<{ label: string; value: string }[]>([]);

  /** 申請人下拉 */
  empIdOptions: { value: string; label: string }[] = [];

  /** 部門下拉 */
  orgIdOptions: { value: string; label: string }[] = [];

  /** 主檔表單 */
  dataForm = this.formBuilder.nonNullable.group({
    ID: [null as number | null],
    DAMAGEM_ID: [{ value: '系統自動帶入', disabled: true } as any],
    WH_ID: ['001' as string | null, [Validators.required, Validators.maxLength(20)]],
    EMP_ID: [null as string | null, [Validators.required, Validators.maxLength(20)]],
    ORG_ID: [null as string | null, [Validators.required, Validators.maxLength(20)]],
    APPLY_DATE: [null as Date | null, [Validators.required]],
    NOTES: ['', [Validators.maxLength(200)]],
  });

  /** 明細資料 */
  detailData: any[] = [];
  detailLoading = false;

  /** 預設空白列 */
  defaultDetailRow = {
    LINE_NUM: null,
    GOODS_ID: null,
    GOODS_NAME: null,
    GOODS_UNIT_NAME: null,
    QTY: null,
    NOTES: '',

    /** 這些不顯示，但可以保留在 row 裡 */
    APPLYABLE_QTY: null,
    ACTUAL_STOCK_QTY: null,
    SAFE_QTY: null,
    STOCK_SAFE: null,
  };

  /** Dialog 狀態 */
  goodsDialogVisible = false;
  goodsLoading = false;
  goodsList: QueryDDLASS16090Response[] = [];
  goodsSelectedRows: QueryDDLASS16090Response[] = [];

  /** 記錄目前點到哪一列，跟 FIN32020 一樣 */
  currentDetailIndex: number | null = null;
  currentDetailRowData: any = null;

  /** Dialog 搜尋表單 */
  goodsSearchForm = this.formBuilder.nonNullable.group({
    GoodsPrefix: [''],
    Keyword: [''],
  });

  /** Dialog table 欄位 */
  goodsColumns: Column[] = [

    { field: 'GOODS_ID', header: '品項編號' },
    { field: 'GOODS_NAME', header: '品項名稱' },
    { field: 'UNIT', header: '單位' },
    { field: 'APPLYABLE_QTY', header: '可申請數量' },
    { field: 'ACTUAL_STOCK_QTY', header: '實際庫存量' },
    { field: 'SAFE_QTY', header: '安全庫存量' },
    { field: 'STOCK_SAFE', header: '庫存安全' },
  ];

  qtyFormat(value: any): string {
    const num = Number(value ?? 0);
    if (!Number.isFinite(num)) return '0';
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  }

  /** 表格欄位維持原本顯示 */
  detailColumns: EditColumn[] = [
    {
      field: 'GOODS_ID',
      header: '品項編號',
      type: 'input',
      width: '220px',
      textAlign: 'left',
      placeholder: '點擊後搜尋帶入',
      validate: [
        (value, _rowData, _data, _field, header) => {
          const v = String(value ?? '').trim();
          return {
            isValid: !!v,
            errorMessage: !!v ? [] : [`${header}不可為空白`],
          };
        },
      ],
    },
    {
      field: 'GOODS_NAME',
      header: '品項名稱',
      type: 'input',
      width: '220px',
      textAlign: 'left',
      placeholder: '點擊後搜尋帶入',
    },
    {
      field: 'GOODS_UNIT_NAME',
      header: '單位',
      type: 'input',
      width: '120px',
      textAlign: 'left',
      disabled: () => true,
    },
    {
      field: 'QTY',
      header: '報廢數量',
      type: 'inputNumber',
      width: '140px',
      textAlign: 'right',
      min: 0,
      minFractionDigits: 0,
      maxFractionDigits: 2,
      format: this.qtyFormat,
      validate: [
        (value, rowData, _data, _field, header) => {
          const num = Number(value ?? 0);
          const applyableQty = Number(rowData?.APPLYABLE_QTY ?? 0);

          if (!(Number.isFinite(num) && num > 0)) {
            return {
              isValid: false,
              errorMessage: [`${header}需大於 0`],
            };
          }

          if (
            Number.isFinite(applyableQty) &&
            applyableQty > 0 &&
            num > applyableQty
          ) {
            return {
              isValid: false,
              errorMessage: [`${header}不可大於可申請數量`],
            };
          }

          return {
            isValid: true,
            errorMessage: [],
          };
        },
      ],
    },
    {
      field: 'NOTES',
      header: '明細說明',
      type: 'input',
      width: '240px',
      textAlign: 'left',
      maxLength: 200,
      placeholder: '請輸入明細說明',
    },
  ];

  @ViewChild(FIN32020TableEditComponent)
  detailTableEdit!: FIN32020TableEditComponent;

  constructor(
    private readonly ass16090Service: ASS16090Service,
    private readonly ass11100Service: ASS11100Service,
    private readonly dropdownApiService: DropdownApiService,
    private readonly dropDownListService: DropDownListService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS16090', this.dataForm);

    this.loadDropdownOptions();

    if (this.rowdata?.ID || this.rowdata?.DAMAGEM_ID) {
      this.loadDetail();
    } else {
      this.detailData = [
        { ...this.defaultDetailRow, LINE_NUM: 1, _isAutoInsertCandidate: true },
      ];

      if (this.crudstatus === CRUDStatus.Create) {
        this.dataForm.patchValue({ APPLY_DATE: new Date() });
      }
    }
  }

  get isEditMode(): boolean {
    return this.crudstatus === CRUDStatus.Edit;
  }

  onBack(): void {
    this.router.navigate(['account/ass/ass16090'], {
      state: { fromCru: true },
    });
  }

  private loadDropdownOptions(): void {

    //倉別
    this.dropdownApiService
      .queryFaHos()
      .pipe(untilDestroyed(this))
      .subscribe((res) => {
        this.whIdOptions.set(
          (res ?? []).map((item: any) => ({
            value: item.value ?? item.No ?? item.WH_ID ?? '',
            label: item.label ?? item.Name ?? item.WH_NAME ?? '',
          }))
        );
      });

    this.dropDownListService
      .queryTBLUSER_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe((res) => {
        const list = res.Data ?? [];
        this.empIdOptions = list.map(
          (item: { No?: string; Name?: string }) => ({
            value: item.No ?? '',
            label: `${item.No ?? ''} - ${item.Name ?? ''}`,
          })
        );
      });

    this.dropDownListService
      .querySYS3100_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        const list = res.Data ?? [];
        this.orgIdOptions = list.map((item: { No?: string; Name?: string }) => ({
          value: item.No ?? '',
          label: `${item.No ?? ''} - ${item.Name ?? ''}`,
        }));
      });
  }

  private patchFromDetail(data: Ass16090DetailResponse): void {
    this.dataForm.patchValue({
      ID: data?.ID ?? null,
      DAMAGEM_ID: data?.DAMAGEM_ID ?? '',
      WH_ID: data?.WH_ID ?? null,
      EMP_ID: data?.EMP_ID ?? null,
      ORG_ID: data?.ORG_ID ?? null,
      APPLY_DATE: data?.APPLY_DATE ? new Date(data.APPLY_DATE) : null,
      NOTES: data?.NOTES ?? '',
    });

    const list = (data?.Details ?? []).map((d, idx) => ({
      D_ID: d.D_ID ?? null,
      DAMAGEM_M_ID: d.DAMAGEM_M_ID ?? data?.ID ?? null,
      LINE_NUM: d.LINE_NUM ?? idx + 1,
      GOODS_ID: d.GOODS_ID ?? null,
      GOODS_NAME: d.GOODS_NAME ?? null,
      GOODS_UNIT_NAME: d.GOODS_UNIT_NAME ?? d.GOODS_UNIT ?? null,
      QTY: d.QTY ?? null,
      NOTES: d.NOTES ?? '',

      APPLYABLE_QTY: d.APPLYABLE_QTY ?? null,
      ACTUAL_STOCK_QTY: d.ACTUAL_STOCK_QTY ?? null,
      SAFE_QTY: d.SAFE_QTY ?? null,
      STOCK_SAFE: d.STOCK_SAFE ?? null,
    }));

    if (this.crudstatus === CRUDStatus.Read) {
      this.detailData = list;
      return;
    }

    this.detailData =
      list.length > 0 ? list : [{ ...this.defaultDetailRow, LINE_NUM: 1 }];
  }

  private loadDetail(): void {
    this.loading = true;

    this.ass16090Service
      .queryDetailASS16090({
        MID: 0,
        ID: this.rowdata?.ID ?? null,
        DAMAGEM_ID: this.rowdata?.DAMAGEM_ID ?? null,
      })
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res) => {
          const data = res?.Data;
          if (data) {
            this.patchFromDetail(data);
          } else {
            this.detailData = [{ ...this.defaultDetailRow, LINE_NUM: 1 }];
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('ASS16090 queryDetail error:', err);
          this.loading = false;
        },
      });
  }

  onDetailDataChange(data: any[]): void {
    this.detailData = (data ?? []).map((row, idx) => ({
      ...row,
      LINE_NUM: idx + 1,
    }));
  }

  onDetailFieldChange(_event: FieldChangeEvent): void { }

  onDetailDelete(_: any): void {
    this.reCalcLineNum();
  }

  private reCalcLineNum(): void {
    this.detailData = (this.detailData || []).map((row, idx) => ({
      ...row,
      LINE_NUM: idx + 1,
    }));
  }

  onDetailCellClick(e: {
    col: EditColumn;
    rowData: any;
    index: number;
    event: MouseEvent;
  }): void {
    if (this.isFormReadable) return;

    const field = String(e?.col?.field ?? '');

    if (field !== 'GOODS_ID' && field !== 'GOODS_NAME') return;

    this.currentDetailIndex = e.index;
    this.currentDetailRowData = e.rowData;
    this.isSelectingCandidateRow = !!e.rowData?._isAutoInsertCandidate;
    this.resetGoodsDialogState();

    this.goodsSearchForm.patchValue({
      GoodsPrefix: String(e.rowData?.GOODS_ID ?? '').trim(),
      Keyword: String(e.rowData?.GOODS_NAME ?? '').trim(),
    });

    this.goodsDialogVisible = true;
    this.onSearchGoods();
  }

  private resetGoodsDialogState(): void {
    this.goodsSelectedRows = [];
    this.goodsList = [];
  }

  onSearchGoods(): void {
    const whId = this.dataForm.controls.WH_ID.value;

    if (!whId) {
      this.messageService?.warnBubble?.('請先選擇倉別');
      return;
    }

    const raw = this.goodsSearchForm.getRawValue();

    const payload: QueryDDLASS16090Request = {
      Keyword: String(raw.Keyword ?? '').trim(),
      WH_ID: String(whId ?? '').trim(),
      GoodsPrefix: String(raw.GoodsPrefix ?? '').trim(),
    };

    this.goodsLoading = true;

    this.ass16090Service
      .queryASS16090_DropDownList(payload)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res) => {
          this.goodsList = Array.isArray(res?.Data) ? res.Data : [];
          this.goodsLoading = false;
        },
        error: (err) => {
          console.error('queryASS16090_DropDownList error:', err);
          this.goodsLoading = false;
        },
      });
  }

  onGoodsSelectionChange(rows: QueryDDLASS16090Response[]): void {
    this.goodsSelectedRows = rows ?? [];
  }

  onGoodsRowDetail(row: QueryDDLASS16090Response): void {
    this.goodsSelectedRows = row ? [row] : [];
    this.confirmGoodsSelection();
  }

  onGoodsCancel(): void {
    this.goodsSelectedRows = [];
    this.goodsDialogVisible = false;
  }

  confirmGoodsSelection(): void {
    if (!this.goodsSelectedRows || !this.goodsSelectedRows.length) {
      return;
    }

    const selected = this.goodsSelectedRows[0];

    const selectedRow = {
      ...this.defaultDetailRow,
      GOODS_ID: selected.GOODS_ID ?? null,
      GOODS_NAME: selected.GOODS_NAME ?? null,
      GOODS_UNIT_NAME: selected.UNIT ?? null,
      APPLYABLE_QTY: selected.APPLYABLE_QTY ?? null,
      ACTUAL_STOCK_QTY: selected.ACTUAL_STOCK_QTY ?? null,
      SAFE_QTY: selected.SAFE_QTY ?? null,
      STOCK_SAFE: selected.STOCK_SAFE ?? null,
      _isAutoInsertCandidate: false,
    };

    let finalList: any[] = [];

    // 1. 如果點的是新增候選列，不要 map 蓋資料，直接新增正式列
    if (this.isSelectingCandidateRow) {
      finalList = [
        ...(this.detailData || []),
        selectedRow,
        { ...this.defaultDetailRow, _isAutoInsertCandidate: true },
      ];
    } else {
      // 2. 一般列才用 index 回填
      finalList = (this.detailData || []).map((row, idx) => {
        if (idx !== this.currentDetailIndex) {
          return row;
        }

        return {
          ...row,
          GOODS_ID: selected.GOODS_ID ?? null,
          GOODS_NAME: selected.GOODS_NAME ?? null,
          GOODS_UNIT_NAME: selected.UNIT ?? null,
          APPLYABLE_QTY: selected.APPLYABLE_QTY ?? null,
          ACTUAL_STOCK_QTY: selected.ACTUAL_STOCK_QTY ?? null,
          SAFE_QTY: selected.SAFE_QTY ?? null,
          STOCK_SAFE: selected.STOCK_SAFE ?? null,
          _isAutoInsertCandidate: false,
        };
      });
    }

    this.detailData = finalList.map((row, idx) => ({
      ...row,
      LINE_NUM: idx + 1,
    }));

    this.goodsSelectedRows = [];
    this.goodsDialogVisible = false;
    this.currentDetailIndex = null;
    this.currentDetailRowData = null;
    this.isSelectingCandidateRow = false;
  }

  private formatDateToYMD(
    date: Date | string | null | undefined
  ): string | null {
    if (!date) return null;

    const d = typeof date === 'string' ? new Date(date) : new Date(date);
    if (Number.isNaN(d.getTime())) return null;

    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private formatDateToDateTime(
    date: Date | string | null | undefined
  ): string | null {
    const ymd = this.formatDateToYMD(date);
    return ymd ? `${ymd}T00:00:00` : null;
  }

  private buildDetailList() {
    return (this.detailData || [])
      .map((row, idx) => {
        const goodsId = String(row?.GOODS_ID ?? '').trim();
        const qty = Number(row?.QTY ?? 0);

        return {
          LINE_NUM: idx + 1,
          GOODS_ID: goodsId || null,
          QTY: Number.isFinite(qty) ? qty : 0,
          NOTES: String(row?.NOTES ?? '').trim() || null,
        };
      })
      .filter((d) => !!d.GOODS_ID);
  }

  private buildInsertPayload(): Ass16090InsertRequest {
    const raw = this.dataForm.getRawValue();

    return {
      MID: 0,
      STO_NO: null,
      WH_ID: String(raw.WH_ID ?? '').trim(),
      EMP_ID: String(raw.EMP_ID ?? '').trim(),
      ORG_ID: String(raw.ORG_ID ?? '').trim(),
      APPLY_DATE: this.formatDateToDateTime(raw.APPLY_DATE) ?? '',
      NOTES: String(raw.NOTES ?? '').trim() || null,
      DetailList: this.buildDetailList(),
    };
  }

  private buildUpdatePayload(): Ass16090UpdateRequest {
    const raw = this.dataForm.getRawValue();

    return {
      ID: Number(raw.ID ?? this.rowdata?.ID ?? 0),
      DAMAGEM_ID:
        String(raw.DAMAGEM_ID ?? this.rowdata?.DAMAGEM_ID ?? '').trim() || null,
      MID: 0,
      STO_NO: null,
      WH_ID: String(raw.WH_ID ?? '').trim(),
      EMP_ID: String(raw.EMP_ID ?? '').trim(),
      ORG_ID: String(raw.ORG_ID ?? '').trim(),
      APPLY_DATE: this.formatDateToDateTime(raw.APPLY_DATE) ?? '',
      NOTES: String(raw.NOTES ?? '').trim() || null,
      DetailList: this.buildDetailList(),
    };
  }

  private afterSaveSuccess(): void {
    this.loading = false;
    this.submitted = false;

    this.router.navigate(['account/ass/ass16090'], {
      queryParams: { refresh: 1 },
      state: { fromCru: true },
    });
  }

private hasValidDetail(): boolean {
  return this.buildDetailList().length > 0;
}

onSubmit(frm: FormGroup): void {
  this.submitted = true;

  if (!this.hasValidDetail()) {
    this.messageService?.warnBubble?.('請至少輸入一筆報廢明細');
    return;
  }

  if (this.detailTableEdit) {
    const tableValid = this.detailTableEdit.validateAndShowErrors();
    if (!tableValid) return;
  }

  this.handleSubmit(frm, () => {
    if (this.crudstatus === CRUDStatus.Create && this.canAdd()) {
      const payload = this.buildInsertPayload();

      this.ass16090Service.insertASS16090(payload).subscribe({
        next: () => this.afterSaveSuccess(),
        error: (err) => {
          console.error('ASS16090 insert error:', err);
          this.loading = false;
        },
      });
      return;
    }

    if (this.crudstatus === CRUDStatus.Edit && this.canEdit()) {
      const payload = this.buildUpdatePayload();

      this.ass16090Service.updateASS16090(payload).subscribe({
        next: () => this.afterSaveSuccess(),
        error: (err) => {
          console.error('ASS16090 update error:', err);
          this.loading = false;
        },
      });
    }
  });
}
  override onCancel(): void {
    if (this.crudstatus === CRUDStatus.Create) {
      this.dataForm.reset();
      this.dataForm.patchValue({
        APPLY_DATE: new Date(),
      });
      this.detailData = [{ ...this.defaultDetailRow, LINE_NUM: 1 }];
      this.submitted = false;
      return;
    }

    if (this.crudstatus === CRUDStatus.Edit) {
      if (this.rowdata?.ID || this.rowdata?.DAMAGEM_ID) {
        this.loadDetail();
      }
      this.submitted = false;
      return;
    }

    super.onCancel();
  }

  onApprove(): void {
    const raw = this.dataForm.getRawValue();
    const payload: Ass16090ApproveRequest = {
      MID: 0,
      STO_NO: null,
      ID: Number(raw.ID ?? this.rowdata?.ID ?? 0) || null,
    };

    this.loading = true;
    this.ass16090Service.approveASS16090(payload).subscribe({
      next: () => this.afterSaveSuccess(),
      error: (err) => {
        console.error('ASS16090 approve error:', err);
        this.loading = false;
      },
    });
  }

  onVoid(): void {
    const raw = this.dataForm.getRawValue();
    const payload: Ass16090VoidRequest = {
      MID: 0,
      STO_NO: null,
      ID: Number(raw.ID ?? this.rowdata?.ID ?? 0) || null,
    };

    this.loading = true;
    this.ass16090Service.voidASS16090(payload).subscribe({
      next: () => this.afterSaveSuccess(),
      error: (err) => {
        console.error('ASS16090 void error:', err);
        this.loading = false;
      },
    });
  }
}