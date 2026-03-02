import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import {
  ASS12050Detail,
  ASS12050DetailItem,
  ASS12050InsertRequest,
  ASS12050TransferRow,
  ASS12050UpdateRequest,
} from '@pages/ass/ass12050/ass12050.model';
import { ASS11100Service } from '@service/api/ass/ass11100.service';
import { ASS12050Service } from '@service/api/ass/ass12050.service';
import { Fin11040Service, TDS1008Data } from '@service/api/fin/fin11040.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column, formatDate } from '@shared/componentkit/table/table.model';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';

/** 3.1.2.5 採購單驗收作業 CRU */
@UntilDestroy()
@Component({
  selector: 'app-ass12050-cru',
  templateUrl: './ass12050-cru.component.html',
  styleUrl: './ass12050-cru.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarComponent,
    DropdownComponent,
    InputTextComponent,
    InputNumberComponent,
    DialogComponent,
    TableComponent,
    TableEditComponent,
    TranslateModule,
  ],
})
export class ASS12050CRUComponent extends BasicCruPageComponent<ASS12050Detail> implements OnInit {
  @ViewChild('tableEdit') tableEditComponent!: TableEditComponent;

  dataForm = this.formBuilder.group({
    SUBCHECK_ID: [null as string | null],
    CHECK_STATUS: [null as string | null],
    EMP_ID: [null as string | null, [Validators.required]],
    ORG_ID: [null as string | null, [Validators.required]],
    APPLY_DATE: [null as Date | null, [Validators.required]],
    SUPPLIER_ID: [null as string | null, [Validators.required]],
    M_NTAX_AMT: [null as number | null],
    M_TAX_AMT: [null as number | null],
    M_AMT: [null as number | null],
    ADJ_AMT: [null as number | null],
  });

  /** 明細資料（table-edit 綁定） */
  data: ASS12050DetailItem[] = [];

  /** 明細原始資料（取消時還原用） */
  private originalData: ASS12050DetailItem[] = [];

  /** 申請人下拉選項 */
  empIdOptions: { value: string; label: string }[] = [];
  /** 部門下拉選項 */
  orgIdOptions: { value: string; label: string }[] = [];
  /** 供應商下拉選項 */
  supplierIdOptions: { value: string; label: string }[] = [];
  /** 品項下拉選項 */
  goodsIdOptions: { value: string; label: string }[] = [];
  /** 倉別下拉選項 */
  whIdOptions: { value: string; label: string }[] = [];
  /** 分店下拉選項 */
  branchIdOptions: { value: string; label: string }[] = [];
  /** 驗收單狀態下拉選項 */
  checkStatusOptions: { value: string; label: string }[] = [];

  editColumns: EditColumn[] = [
    {
      field: 'GOODS_ID',
      header: '品項代號/名稱',
      type: 'dropdown',
      optionLabel: 'label',
      optionValue: 'value',
      options: () => this.goodsIdOptions,
      disabled: () => this.isFormEditable,
    },
    {
      field: 'GOODS_UNIT',
      header: '單位',
      type: 'dropdown',
      optionLabel: 'label',
      optionValue: 'value',
      options: () => getSYS1000Options('UNIT'),
      disabled: () => !this.isFormCreateable,
    },
    {
      field: 'APPLY_QTY',
      header: '申請數量',
      type: 'inputNumber',
      disabled: () => !this.isFormCreateable,
    },
    {
      field: 'CHECKED_QTY',
      header: '已驗數量',
      type: 'inputNumber',
      disabled: () => false,
    },
    {
      field: 'CHECK_QTY',
      header: '驗收數量',
      type: 'inputNumber',
      placeholder: '輸入數字',
      disabled: () => !this.isFormCreateable,
    },
    {
      field: 'GOODS_PRICE',
      header: '單價(未稅)',
      type: 'inputNumber',
      disabled: () => !this.isFormCreateable,
    },
    {
      field: 'ADJ_PRICE',
      header: '調整單價(未稅)',
      type: 'inputNumber',
      placeholder: '輸入數字',
      disabled: () => false,
    },
    {
      field: 'TOTAL_AMT',
      header: '總金額',
      type: 'inputNumber',
      disabled: () => false,
    },
    {
      field: 'BRANCH_ID',
      header: '分店',
      type: 'dropdown',
      optionLabel: 'label',
      optionValue: 'value',
      options: () => this.branchIdOptions,
      disabled: () => !this.isFormCreateable,
    },
    {
      field: 'WH_ID',
      header: '倉別',
      type: 'dropdown',
      optionLabel: 'label',
      optionValue: 'value',
      options: () => this.whIdOptions,
      disabled: () => !this.isFormCreateable,
    },
    {
      field: 'ENTRUST_ORG_ID',
      header: '委託部門代號/名稱',
      type: 'dropdown',
      optionLabel: 'label',
      optionValue: 'value',
      options: () => this.orgIdOptions,
      disabled: () => !this.isFormCreateable,
    },
    {
      field: 'NOTES',
      header: '說明',
      type: 'input',
      disabled: () => !this.isFormCreateable,
    },
  ];

  /** 選擇採購單 Dialog */
  displayTransferDialog = false;
  transferData: ASS12050TransferRow[] = [];
  selectedTransferRow: ASS12050TransferRow | null = null;
  transferListLoading = false;
  transferColumns: Column[] = [
    { field: 'SUBPOENA_ID', header: '採購單號' },
    { field: 'EMP_NAME', header: '申請人代號' },
    { field: 'ORG_NAME', header: '部門名稱' },
    { field: 'APPLY_DATE', header: '申請日期', format: formatDate },
    { field: 'SUPPLIER_ID', header: '供應商代號' },
    { field: 'TAX_AMT', header: '稅額' },
    { field: 'AMT', header: '含稅總金額' },
    { field: 'NEEDS_STATUS_NAME', header: '採購單狀態' },
    { field: 'APRV_EMP_ID', header: '審核人代碼' },
    { field: 'APRV_DATE', header: '審核日期', format: formatDate },
    { field: 'DETAIL_CNT', header: '明細數量' },
  ];

  /** 編輯時保留的驗收單號 */
  private subcheckId: string | null = null;

  constructor(
    private readonly ass12050Service: ASS12050Service,
    private readonly dropDownListService: DropDownListService,
    private readonly fin11040Service: Fin11040Service,
    private readonly ass11100Service: ASS11100Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS12050', this.dataForm);
    this.loadDropdownOptions();

    const rowSubcheckId = (this.rowdata as Record<string, unknown> | null)?.['SUBCHECK_ID'] as string | undefined;
    if (!this.isFormCreateable && rowSubcheckId) {
      this.subcheckId = rowSubcheckId;
      this.loading = true;
      this.ass12050Service
        .detailASS12050({ SUBCHECK_ID: rowSubcheckId })
        .pipe(finalize(() => (this.loading = false)), untilDestroyed(this))
        .subscribe({
          next: res => {
            if (res.Status !== '0000') return;
            const d = res.Data;
            this.subcheckId = d?.SUBCHECK_ID ?? rowSubcheckId;
            this.dataForm.patchValue({
              SUBCHECK_ID: d?.SUBCHECK_ID ?? null,
              CHECK_STATUS: d?.CHECK_STATUS_NAME ?? d?.CHECK_STATUS ?? null,
              EMP_ID: d?.EMP_ID ?? null,
              ORG_ID: d?.ORG_ID ?? null,
              APPLY_DATE: d?.APPLY_DATE ? new Date(d.APPLY_DATE) : null,
              SUPPLIER_ID: d?.SUPPLIER_ID ?? null,
              M_NTAX_AMT: d?.M_NTAX_AMT ?? null,
              M_TAX_AMT: d?.M_TAX_AMT ?? null,
              M_AMT: d?.M_AMT ?? null,
              ADJ_AMT: d?.ADJ_AMT ?? null,
            });
            const details = (d?.Details ?? []).map(item => ({ ...item }));
            this.data = details;
            this.originalData = details.map(item => ({ ...item }));
          },
        });
    }
  }

  /** 取消按鈕：還原表單與明細表格至原始狀態 */
  onCancelButtonClick(): void {
    this.data = this.originalData.map(item => ({ ...item }));
  }

  private loadDropdownOptions(): void {
    const toOpt = (items: { No?: string; Name?: string }[]) =>
      (items ?? []).map(item => ({
        label: `${item.No ?? ''} - ${item.Name ?? ''}`,
        value: item.No ?? '',
      }));

    this.dropDownListService
      .queryTBLUSER_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.empIdOptions = toOpt(res.Data ?? []);
      });

    this.dropDownListService
      .querySYS3100_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        if (res.Status !== '0000') return;
        this.orgIdOptions = toOpt(res.Data ?? []);
      });

    this.dropDownListService
      .queryPOS2013_DropDownList({})
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        const list = res.Data ?? [];
        this.supplierIdOptions = list.map((item: { VEN_No?: string; No?: string; Name?: string }) => ({
          value: item.VEN_No ?? item.No ?? '',
          label: `${item.VEN_No ?? item.No ?? ''} - ${item.Name ?? ''}`,
        }));
      });

    this.fin11040Service
      .queryFIN11040({ PageSize: 9999, PageIndex: 1 })
      .pipe(untilDestroyed(this))
      .subscribe({
        next: res => {
          if (res.Status !== '0000') return;
          const data: TDS1008Data[] = res.Data ?? [];
          this.goodsIdOptions = data
            .filter(item => item.INV_ItemNo != null && item.INV_ItemNo !== '')
            .map(item => ({
              label: `${item.INV_ItemNo} - ${item.INV_ItemName ?? ''}`,
              value: item.INV_ItemNo,
            }));
        },
      });

    this.ass11100Service
      .queryASS11100({ PageSize: 9999, PageIndex: 1 })
      .pipe(untilDestroyed(this))
      .subscribe({
        next: res => {
          if (res.Status !== '0000') return;
          this.whIdOptions = (res.Data ?? [])
            .filter(item => item.WH_ID != null && item.WH_ID !== '')
            .map(item => ({
              label: `${item.WH_ID} - ${item.WH_NAME ?? ''}`,
              value: item.WH_ID!,
            }));
        },
      });

    this.dropDownListService
      .querySYS3100_join_POS1001_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        if (res.Status !== '0000') return;
        this.branchIdOptions = toOpt(res.Data ?? []);
      });
  }

  /** 開啟轉入採購單 Dialog */
  openTransferDialog(): void {
    this.transferListLoading = true;
    this.selectedTransferRow = null;
    this.ass12050Service
      .listForTransferASS12050({ PageSize: 9999, PageIndex: 1 })
      .pipe(finalize(() => (this.transferListLoading = false)), untilDestroyed(this))
      .subscribe({
        next: res => {
          if (res.Status !== '0000') return;
          this.transferData = res.Data ?? [];
          this.displayTransferDialog = true;
        },
      });
  }

  onTransferSelectionChange(rows: ASS12050TransferRow[]): void {
    this.selectedTransferRow = rows?.[0] ?? null;
  }

  get canConfirmTransfer(): boolean {
    return !!this.selectedTransferRow;
  }

  /** 確認轉入採購單 */
  onTransferConfirm(): void {
    const row = this.selectedTransferRow;
    if (!row?.SUBPOENA_ID) {
      this.messageService.warnBubble('請選擇一筆採購單');
      return;
    }

    this.dataForm.patchValue({
      EMP_ID: row.EMP_ID ?? this.dataForm.get('EMP_ID')?.value ?? null,
      ORG_ID: row.ORG_NAME ?? this.dataForm.get('ORG_ID')?.value ?? null,
      APPLY_DATE: row.APPLY_DATE ? new Date(row.APPLY_DATE) : this.dataForm.get('APPLY_DATE')?.value,
      SUPPLIER_ID: row.SUPPLIER_ID ?? this.dataForm.get('SUPPLIER_ID')?.value ?? null,
      M_TAX_AMT: row.TAX_AMT ?? null,
      M_AMT: row.AMT ?? null,
    });

    this.transferListLoading = true;
    this.ass12050Service
      .detailASS12050({ SUBCHECK_ID: row.SUBPOENA_ID })
      .pipe(finalize(() => (this.transferListLoading = false)), untilDestroyed(this))
      .subscribe({
        next: res => {
          if (res.Status !== '0000') {
            this.displayTransferDialog = false;
            this.messageService.successBubble('轉入成功');
            return;
          }
          const d = res.Data;
          if (d?.Details) {
            const details = d.Details.map(item => ({ ...item }));
            this.data = details;
            this.originalData = details.map(item => ({ ...item }));
          }
          this.displayTransferDialog = false;
          this.messageService.successBubble('轉入成功');
        },
      });
  }

  /** 驗收確認 */
  onConfirm(): void {
    const subcheckId = this.subcheckId ?? this.dataForm.get('SUBCHECK_ID')?.value;
    if (!subcheckId) {
      this.messageService.warnBubble('請先儲存驗收單');
      return;
    }
    this.messageService.confirm({
      header: '驗收確認',
      message: '是否確認執行驗收確認？',
      accept: () => {
        this.loading = true;
        this.ass12050Service
          .confirmASS12050({ SUBCHECK_ID: subcheckId })
          .pipe(untilDestroyed(this), finalize(() => (this.loading = false)))
          .subscribe({
            next: res => {
              if (res.Status !== '0000') {
                this.messageService.errorBubble('操作失敗：' + (res.Message ?? ''));
                return;
              }
              this.messageService.successBubble('驗收確認成功');
              this.onCancel();
            },
          });
      },
    });
  }

  /** 強制結案 */
  onForceClose(): void {
    const subcheckId = this.subcheckId ?? this.dataForm.get('SUBCHECK_ID')?.value;
    if (!subcheckId) {
      this.messageService.warnBubble('無可結案的資料');
      return;
    }
    this.messageService.confirm({
      header: '確認強制結案',
      message: '是否確認強制結案此驗收單？',
      accept: () => {
        this.loading = true;
        this.ass12050Service
          .forceCloseASS12050({ SUBCHECK_ID: subcheckId })
          .pipe(untilDestroyed(this), finalize(() => (this.loading = false)))
          .subscribe({
            next: res => {
              if (res.Status !== '0000') {
                this.messageService.errorBubble('操作失敗：' + (res.Message ?? ''));
                return;
              }
              this.messageService.successBubble('強制結案成功');
              this.onCancel();
            },
          });
      },
    });
  }

  /** 作廢 */
  onVoid(): void {
    const subcheckId = this.subcheckId ?? this.dataForm.get('SUBCHECK_ID')?.value;
    if (!subcheckId) {
      this.messageService.warnBubble('無可作廢的資料');
      return;
    }
    this.messageService.confirm({
      header: '確認作廢',
      message: '是否確認作廢此驗收單？',
      accept: () => {
        this.loading = true;
        this.ass12050Service
          .voidASS12050({ SUBCHECK_ID: subcheckId })
          .pipe(untilDestroyed(this), finalize(() => (this.loading = false)))
          .subscribe({
            next: res => {
              if (res.Status !== '0000') {
                this.messageService.errorBubble('操作失敗：' + (res.Message ?? ''));
                return;
              }
              this.messageService.successBubble('作廢成功');
              this.onCancel();
            },
          });
      },
    });
  }

  /** 明細新增一列 */
  onTableInsert(): void {
    const newItem: ASS12050DetailItem = {
      GOODS_ID: null,
      GOODS_NAME: null,
      GOODS_UNIT: null,
      APPLY_QTY: null,
      CHECKED_QTY: null,
      CHECK_QTY: null,
      GOODS_PRICE: null,
      ADJ_PRICE: null,
      TOTAL_AMT: null,
      BRANCH_ID: null,
      WH_ID: null,
      ENTRUST_ORG_ID: null,
      ENTRUST_ORG_NAME: null,
      NOTES: null,
    };
    this.data = [...this.data, newItem];
  }

  private toDetails(rows: Record<string, unknown>[]): ASS12050DetailItem[] {
    return rows.map(row => ({
      GOODS_ID: (row['GOODS_ID'] as string) || undefined,
      GOODS_NAME: (row['GOODS_NAME'] as string) || undefined,
      GOODS_UNIT: (row['GOODS_UNIT'] as string) || undefined,
      APPLY_QTY: (row['APPLY_QTY'] as number | undefined) ?? undefined,
      CHECKED_QTY: (row['CHECKED_QTY'] as number | undefined) ?? undefined,
      CHECK_QTY: (row['CHECK_QTY'] as number | undefined) ?? undefined,
      GOODS_PRICE: (row['GOODS_PRICE'] as number | undefined) ?? undefined,
      ADJ_PRICE: (row['ADJ_PRICE'] as number | undefined) ?? undefined,
      TOTAL_AMT: (row['TOTAL_AMT'] as number | undefined) ?? undefined,
      BRANCH_ID: (row['BRANCH_ID'] as string) || undefined,
      WH_ID: (row['WH_ID'] as string) || undefined,
      ENTRUST_ORG_ID: (row['ENTRUST_ORG_ID'] as string) || undefined,
      ENTRUST_ORG_NAME: (row['ENTRUST_ORG_NAME'] as string) || undefined,
      NOTES: (row['NOTES'] as string) || undefined,
    }));
  }

  onSubmit(): void {
    this.handleSubmit(this.dataForm, () => {
      const valid = this.tableEditComponent?.validateAndShowErrors();
      if (valid === false) return;
      const raw = this.dataForm.getRawValue();
      const details = this.toDetails(this.data as Record<string, unknown>[]);
      const applyDate = raw.APPLY_DATE instanceof Date
        ? raw.APPLY_DATE.toISOString().slice(0, 10)
        : String(raw.APPLY_DATE ?? '');

      this.loading = true;

      if (this.crudstatus === CRUDStatus.Create) {
        const payload: ASS12050InsertRequest = {
          EMP_ID: raw.EMP_ID ?? '',
          ORG_ID: raw.ORG_ID ?? '',
          APPLY_DATE: applyDate,
          SUPPLIER_ID: raw.SUPPLIER_ID ?? '',
          Details: details,
        };
        this.ass12050Service
          .insertASS12050(payload)
          .pipe(finalize(() => (this.loading = false)), untilDestroyed(this))
          .subscribe({
            next: res => {
              if (res.Status !== '0000') {
                this.messageService.errorBubble('操作失敗：' + (res.Message ?? ''));
                return;
              }
              this.messageService.successBubble('新增成功');
              this.onCancel();
            },
          });
      } else {
        const payload: ASS12050UpdateRequest = {
          SUBCHECK_ID: this.subcheckId ?? '',
          EMP_ID: raw.EMP_ID ?? '',
          ORG_ID: raw.ORG_ID ?? '',
          APPLY_DATE: applyDate,
          SUPPLIER_ID: raw.SUPPLIER_ID ?? '',
          Details: details,
        };
        this.ass12050Service
          .updateASS12050(payload)
          .pipe(finalize(() => (this.loading = false)), untilDestroyed(this))
          .subscribe({
            next: res => {
              if (res.Status !== '0000') {
                this.messageService.errorBubble('操作失敗：' + (res.Message ?? ''));
                return;
              }
              this.messageService.successBubble('編輯成功');
              this.onCancel();
            },
          });
      }
    });
  }
}
