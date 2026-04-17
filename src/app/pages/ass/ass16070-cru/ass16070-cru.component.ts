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

import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';

import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

import {
  ASS16070Service,
  Ass16070ApproveRequest,
  Ass16070DetailResponse,
  Ass16070InsertRequest,
  Ass16070Row,
  Ass16070UpdateRequest,
  Ass16070VoidRequest,
  QueryDDLASS16070Request,
  QueryDDLASS16070Response,
} from '../../../service/api/ass/ass16070.service';

import { ASS11100Service } from '@service/api/ass/ass11100.service';
import { DropDownListService } from '@service/utility/dropDownList.service';

/** 共用 FIN32020 的 table-edit */
import { FIN32020TableEditComponent } from '../../fin/fin32020-cru/fin32020table-edit/fin32020table-edit.component';
import {
  EditColumn,
  FieldChangeEvent,
} from '../../fin/fin32020-cru/fin32020table-edit/fin32020table-edit.model';

/** Dialog 查詢結果 table */
import { Table2Component } from '../../../shared/componentkit/table2/table2.component';
import { Column } from '../../../shared/componentkit/table2/table2.model';

@UntilDestroy()
@Component({
  selector: 'app-ass16070-cru',
  templateUrl: './ass16070-cru.component.html',
  styleUrl: './ass16070-cru.component.scss',
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
export class ASS16070CRUComponent
  extends BasicCruPageComponent<Ass16070Row>
  implements OnInit
{
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
    WHMOVE_ID: [{ value: '系統自動帶入', disabled: true } as any],
    OUT_WH_ID: [
      null as string | null,
      [Validators.required, Validators.maxLength(20)],
    ],
    IN_WH_ID: [
      null as string | null,
      [Validators.required, Validators.maxLength(20)],
    ],
    EMP_ID: [
      null as string | null,
      [Validators.required, Validators.maxLength(20)],
    ],
    ORG_ID: [
      null as string | null,
      [Validators.required, Validators.maxLength(20)],
    ],
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
    UNIT: null,
    QTY: null,
    NOTES: '',

    /** 比照 ASS16090，保留 Dialog 帶回欄位 */
    APPLYABLE_QTY: null,
    ACTUAL_STOCK_QTY: null,
    SAFE_QTY: null,
    STOCK_SAFE: null,
  };

  /** Dialog 狀態 */
  goodsDialogVisible = false;
  goodsLoading = false;
  goodsList: QueryDDLASS16070Response[] = [];
  goodsSelectedRows: QueryDDLASS16070Response[] = [];

  /** 記錄目前點到哪一列 */
  currentDetailIndex: number | null = null;
  currentDetailRowData: any = null;

  /** Dialog 搜尋表單 */
  goodsSearchForm = this.formBuilder.nonNullable.group({
    GoodsPrefix: [''],
    Keyword: [''],
  });

  /** Dialog table 欄位：比照 ASS16090 */
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

  /** 明細表格欄位 */
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
      field: 'UNIT',
      header: '單位',
      type: 'input',
      width: '120px',
      textAlign: 'left',
      disabled: () => true,
    },
    {
      field: 'QTY',
      header: '調撥數量',
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
      header: '說明',
      type: 'input',
      width: '240px',
      textAlign: 'left',
      maxLength: 200,
      placeholder: '請輸入說明',
    },
  ];

  @ViewChild(FIN32020TableEditComponent)
  detailTableEdit!: FIN32020TableEditComponent;

  constructor(
    private readonly ass16070Service: ASS16070Service,
    private readonly ass11100Service: ASS11100Service,
    private readonly dropDownListService: DropDownListService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS16070', this.dataForm);

    this.loadDropdownOptions();

    if (this.rowdata?.ID) {
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
    this.router.navigate(['account/ass/ass16070']);
  }

  private loadDropdownOptions(): void {
    this.ass11100Service
      .queryASS11100({ PageSize: 9999, PageIndex: 1 })
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res) => {
          if (res.Status !== '0000') return;

          const options = (res.Data ?? [])
            .filter((item) => item.WH_ID != null && item.WH_ID !== '')
            .map((item) => ({
              label: `${item.WH_ID} - ${item.WH_NAME ?? ''}`,
              value: item.WH_ID!,
            }));

          this.whIdOptions.set(options);
        },
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
      .queryPOS2013_DropDownList({})
      .pipe(untilDestroyed(this))
      .subscribe((res) => {
        const list = res.Data ?? [];
        this.orgIdOptions = list.map(
          (item: { No?: string; Name?: string }) => ({
            value: item.No ?? '',
            label: `${item.No ?? ''} - ${item.Name ?? ''}`,
          })
        );
      });
  }

  private patchFromDetail(data: Ass16070DetailResponse): void {
    this.dataForm.patchValue({
      ID: data?.ID ?? null,
      WHMOVE_ID: data?.WHMOVE_ID ?? '',
      OUT_WH_ID: data?.OUT_WH_ID ?? null,
      IN_WH_ID: data?.IN_WH_ID ?? null,
      EMP_ID: data?.EMP_ID ?? null,
      ORG_ID: data?.ORG_ID ?? null,
      APPLY_DATE: data?.APPLY_DATE ? new Date(data.APPLY_DATE) : null,
      NOTES: data?.NOTES ?? '',
    });

    const list = (data?.Details ?? []).map((d, idx) => ({
      ID: d.ID ?? null,
      LINE_NUM: d.LINE_NUM ?? idx + 1,
      GOODS_ID: d.GOODS_ID ?? null,
      GOODS_NAME: d.GOODS_NAME ?? null,
      UNIT: d.UNIT ?? null,
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
      list.length > 0
        ? list
        : [{ ...this.defaultDetailRow, LINE_NUM: 1, _isAutoInsertCandidate: true }];
  }

  private loadDetail(): void {
    this.loading = true;

    this.ass16070Service
      .queryDetailASS16070({
        ID: Number(this.rowdata?.ID ?? 0),
      })
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res) => {
          const data = res?.Data;
          if (data) {
            this.patchFromDetail(data);
          } else {
            this.detailData = [
              { ...this.defaultDetailRow, LINE_NUM: 1, _isAutoInsertCandidate: true },
            ];
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('ASS16070 queryDetail error:', err);
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

  onDetailFieldChange(_event: FieldChangeEvent): void {}

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
    const outWhId = this.dataForm.controls.OUT_WH_ID.value;

    if (!outWhId) {
      this.messageService?.warnBubble?.('請先選擇調出倉別');
      return;
    }

    const raw = this.goodsSearchForm.getRawValue();

    const payload: QueryDDLASS16070Request = {
      Keyword: String(raw.Keyword ?? '').trim(),
      GoodsPrefix: String(raw.GoodsPrefix ?? '').trim(),
      WH_ID: String(outWhId ?? '').trim(),
    };

    this.goodsLoading = true;

    this.ass16070Service
      .queryASS16070_DropDownList(payload)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res) => {
          this.goodsList = Array.isArray(res?.Data) ? res.Data : [];
          this.goodsLoading = false;
        },
        error: (err) => {
          console.error('queryASS16070_DropDownList error:', err);
          this.goodsLoading = false;
        },
      });
  }

  onGoodsSelectionChange(rows: QueryDDLASS16070Response[]): void {
    this.goodsSelectedRows = rows ?? [];
  }

  onGoodsRowDetail(row: QueryDDLASS16070Response): void {
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
      UNIT: selected.UNIT ?? null,
      APPLYABLE_QTY: selected.APPLYABLE_QTY ?? null,
      ACTUAL_STOCK_QTY: selected.ACTUAL_STOCK_QTY ?? null,
      SAFE_QTY: selected.SAFE_QTY ?? null,
      STOCK_SAFE: selected.STOCK_SAFE ?? null,
      _isAutoInsertCandidate: false,
    };

    let finalList: any[] = [];

    /** 1. 如果點的是新增候選列，直接新增正式列 */
    if (this.isSelectingCandidateRow) {
      finalList = [
        ...(this.detailData || []).filter((x) => !x?._isAutoInsertCandidate),
        selectedRow,
        { ...this.defaultDetailRow, _isAutoInsertCandidate: true },
      ];
    } else {
      /** 2. 一般列用 index 回填 */
      finalList = (this.detailData || []).map((row, idx) => {
        if (idx !== this.currentDetailIndex) {
          return row;
        }

        return {
          ...row,
          GOODS_ID: selected.GOODS_ID ?? null,
          GOODS_NAME: selected.GOODS_NAME ?? null,
          UNIT: selected.UNIT ?? null,
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
      .filter((row) => !row?._isAutoInsertCandidate)
      .map((row) => {
        const goodsId = String(row?.GOODS_ID ?? '').trim();
        const qty = Number(row?.QTY ?? 0);

        return {
          GOODS_ID: goodsId,
          QTY: Number.isFinite(qty) ? qty : 0,
          NOTES: String(row?.NOTES ?? '').trim() || null,
        };
      })
      .filter((d) => !!d.GOODS_ID);
  }

  private buildInsertPayload(): Ass16070InsertRequest {
    const raw = this.dataForm.getRawValue();

    return {
      MID: 0,
      STO_NO: null,
      OUT_WH_ID: String(raw.OUT_WH_ID ?? '').trim() || null,
      IN_WH_ID: String(raw.IN_WH_ID ?? '').trim() || null,
      EMP_ID: String(raw.EMP_ID ?? '').trim() || null,
      ORG_ID: String(raw.ORG_ID ?? '').trim() || null,
      APPLY_DATE: this.formatDateToDateTime(raw.APPLY_DATE),
      NOTES: String(raw.NOTES ?? '').trim() || null,
      DetailList: this.buildDetailList(),
    };
  }

  private buildUpdatePayload(): Ass16070UpdateRequest {
    const raw = this.dataForm.getRawValue();

    return {
      ID: Number(raw.ID ?? this.rowdata?.ID ?? 0),
      MID: 0,
      STO_NO: null,
      OUT_WH_ID: String(raw.OUT_WH_ID ?? '').trim() || null,
      IN_WH_ID: String(raw.IN_WH_ID ?? '').trim() || null,
      EMP_ID: String(raw.EMP_ID ?? '').trim() || null,
      ORG_ID: String(raw.ORG_ID ?? '').trim() || null,
      APPLY_DATE: this.formatDateToDateTime(raw.APPLY_DATE),
      NOTES: String(raw.NOTES ?? '').trim() || null,
      DetailList: this.buildDetailList(),
    };
  }

  private afterSaveSuccess(): void {
    this.loading = false;
    this.submitted = false;

    this.router.navigate(['account/ass/ass16070'], {
      queryParams: { refresh: 1 },
      state: { fromCru: true },
    });
  }

  onSubmit(frm: FormGroup): void {
    if (this.detailTableEdit) {
      const tableValid = this.detailTableEdit.validateAndShowErrors();
      if (!tableValid) return;
    }

    if (this.buildDetailList().length === 0) {
      this.messageService?.warnBubble?.('請至少新增一筆明細');
      return;
    }

    this.handleSubmit(frm, () => {
      if (this.crudstatus === CRUDStatus.Create && this.canAdd()) {
        const payload = this.buildInsertPayload();

        this.ass16070Service.insertASS16070(payload).subscribe({
          next: () => this.afterSaveSuccess(),
          error: (err) => {
            console.error('ASS16070 insert error:', err);
            this.loading = false;
          },
        });
        return;
      }

      if (this.crudstatus === CRUDStatus.Edit && this.canEdit()) {
        const payload = this.buildUpdatePayload();

        this.ass16070Service.updateASS16070(payload).subscribe({
          next: () => this.afterSaveSuccess(),
          error: (err) => {
            console.error('ASS16070 update error:', err);
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
      this.detailData = [
        { ...this.defaultDetailRow, LINE_NUM: 1, _isAutoInsertCandidate: true },
      ];
      this.submitted = false;
      return;
    }

    if (this.crudstatus === CRUDStatus.Edit) {
      if (this.rowdata?.ID) {
        this.loadDetail();
      }
      this.submitted = false;
      return;
    }

    super.onCancel();
  }

  onApprove(): void {
    const raw = this.dataForm.getRawValue();
    const payload: Ass16070ApproveRequest = {
      ID: Number(raw.ID ?? this.rowdata?.ID ?? 0),
    };

    this.loading = true;
    this.ass16070Service.approveASS16070(payload).subscribe({
      next: () => this.afterSaveSuccess(),
      error: (err) => {
        console.error('ASS16070 approve error:', err);
        this.loading = false;
      },
    });
  }

  onVoid(): void {
    const raw = this.dataForm.getRawValue();
    const payload: Ass16070VoidRequest = {
      ID: Number(raw.ID ?? this.rowdata?.ID ?? 0),
    };

    this.loading = true;
    this.ass16070Service.voidASS16070(payload).subscribe({
      next: () => this.afterSaveSuccess(),
      error: (err) => {
        console.error('ASS16070 void error:', err);
        this.loading = false;
      },
    });
  }
}