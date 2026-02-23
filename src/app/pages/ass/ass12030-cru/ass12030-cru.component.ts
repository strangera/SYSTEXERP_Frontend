import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ASS12010Data, ASS12010DetailResponse } from '@pages/ass/ass12010/ass12010.model';
import {
  ASS12030Detail,
  ASS12030DetailItem,
  ASS12030InsertRequest,
  ASS12030UpdateRequest,
} from '@pages/ass/ass12030/ass12030.model';
import { ASS11100Service } from '@service/api/ass/ass11100.service';
import { ASS12010Service } from '@service/api/ass/ass12010.service';
import { ASS12020Detail, ASS12020QueryRow, ASS12020Service } from '@service/api/ass/ass12020.service';
import { ASS12030Service } from '@service/api/ass/ass12030.service';
import { Fin11040Service, TDS1008Data } from '@service/api/fin/fin11040.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import {
  validateMinNumber,
  validateRequired,
} from '@shared/componentkit/table-edit/validate-field.model';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column, formatDate } from '@shared/componentkit/table/table.model';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

/** 進入新增頁時的套用模式：已詢價=套用請購清單，未詢價=套用詢價清單 */
export type CreateMode = 'quoted' | 'unquoted';

/** 3.1.2.3 採購申請作業 CRU */
@UntilDestroy()
@Component({
  selector: 'app-ass12030-cru',
  templateUrl: './ass12030-cru.component.html',
  styleUrl: './ass12030-cru.component.scss',
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
    DialogComponent,
    TableComponent,
    TableEditComponent,
    TranslateModule,
  ],
})
export class ASS12030CRUComponent extends BasicCruPageComponent<ASS12030Detail> implements OnInit {
  @ViewChild('tableEdit') tableEditComponent!: TableEditComponent;

  dataForm = this.formBuilder.group({
    NOTES: [null as string | null],
    EMP_ID: [null as string | null, [Validators.required]],
    ORG_ID: [null as string | null, [Validators.required]],
    APPLY_DATE: [null as Date | null, [Validators.required]],
    SUPPLIER_ID: [null as string | null, [Validators.required]],
    SUB_PAY_TYPE: [null as string | null, [Validators.required]],
  });

  /** 明細資料（table-edit 綁定） */
  data: ASS12030DetailItem[] = [];

  /** 新增時套用模式（從查詢頁傳入） */
  createMode: CreateMode | undefined;

  /** 申請人下拉選項 */
  empIdOptions: { value: string; label: string }[] = [];
  /** 委託部門下拉選項 */
  orgIdOptions: { value: string; label: string }[] = [];
  /** 稅別下拉選項 */
  taxCodeOptions: { value: string; label: string }[] = [];
  /** 支出類型下拉選項 */
  subPayTypeOptions: { value: string; label: string }[] = getSYS1000Options('SUB_PAY_TYPE');
  /** 商品類型下拉選項 */
  prodTypeOptions: { value: string; label: string }[] = getSYS1000Options('PROD_TYPE');

  // TODO: 未實作下拉選項
  /** 品項編號下拉選項 */
  goodsIdOptions: { value: string; label: string }[] = [];
  /** 需求單號下拉選項 */
  needIdOptions: { value: string; label: string }[] = [];
  /** 供應商：queryPOS2013_DropDownList(VEN_Flag: '1') */
  supplierIdOptions: { value: string; label: string }[] = [];
  /** 倉別下拉選項 */
  whIdOptions: { value: string; label: string }[] = [];

  editColumns: EditColumn[] = [
    {
      field: 'GOODS_ID',
      header: '品項編號',
      type: 'dropdown',
      optionLabel: 'label',
      optionValue: 'value',
      options: () => this.goodsIdOptions,
      validate: [validateRequired],
    },
    {
      field: 'NEED_ID',
      header: '需求單號',
      type: 'dropdown',
      optionLabel: 'label',
      optionValue: 'value',
      options: () => this.needIdOptions,
      validate: [validateRequired],
    },
    {
      field: 'TAX_CODE',
      header: '稅別',
      type: 'dropdown',
      optionLabel: 'label',
      optionValue: 'value',
      options: () => this.taxCodeOptions,
      validate: [validateRequired],
    },
    {
      field: 'QTY',
      header: '數量',
      type: 'inputNumber',
      placeholder: '輸入數字',
      validate: [validateRequired, validateMinNumber(0)],
    },
    {
      field: 'GOODS_PRICE',
      header: '單價(未稅)',
      type: 'inputNumber',
      placeholder: '輸入數字',
      validate: [validateRequired, validateMinNumber(0)],
    },
    {
      field: 'ORG_ID',
      header: '委託部門',
      type: 'dropdown',
      optionLabel: 'label',
      optionValue: 'value',
      options: () => this.orgIdOptions,
      validate: [validateRequired],
    },
    {
      field: 'WH_ID',
      header: '倉別',
      type: 'dropdown',
      optionLabel: 'label',
      optionValue: 'value',
      options: () => this.whIdOptions,
      validate: [validateRequired],
    },
    {
      field: 'PROD_TYPE',
      header: '商品類型',
      type: 'dropdown',
      optionLabel: 'label',
      optionValue: 'value',
      options: () => this.prodTypeOptions,
      validate: [validateRequired],
    },
    { field: 'NOTES', header: '說明', type: 'input' },
  ];

  /** 套用清單 dialog */
  displayApplyDialog = false;
  applyDialogMode: 'quoted' | 'unquoted' = 'quoted';
  applyQuotedData: ASS12010Data[] = [];
  applyPurchaseData: ASS12020QueryRow[] = [];
  selectedQuotedRow: ASS12010Data | null = null;
  selectedPurchaseRow: ASS12020QueryRow | null = null;
  applyListLoading = false;
  applyQuotedColumns: Column[] = [
    { field: 'NEED_ID', header: '需求單號' },
    { field: 'EMP_NAME', header: '申請人' },
    { field: 'ORG_NAME', header: '部門' },
    { field: 'APPLY_DATE', header: '需求日期', format: formatDate },
    { field: 'NEEDS_STATUS_NAME', header: '狀態' },
    { field: 'Detail_CNT', header: '明細筆數' },
  ];
  applyPurchaseColumns: Column[] = [
    { field: 'BATCH_NO', header: '登錄批號' },
    { field: 'SUPPLIER_ID', header: '供應商' },
    { field: 'LOG_DATE', header: '登錄日期', format: formatDate },
    { field: 'EXPDATE', header: '報價期限' },
    { field: 'NOTES', header: '說明' },
  ];

  /** 編輯/明細時保留的傳票號碼 */
  private subpoenaId: string | null = null;

  constructor(
    private readonly ass12030Service: ASS12030Service,
    private readonly dropDownListService: DropDownListService,
    private readonly fin11040Service: Fin11040Service,
    private readonly ass11100Service: ASS11100Service,
    private readonly ass12010Service: ASS12010Service,
    private readonly ass12020Service: ASS12020Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS12030', this.dataForm);
    const state = this.router.lastSuccessfulNavigation?.extras?.state as Record<string, unknown> | undefined;
    if (this.crudstatus === CRUDStatus.Create && state?.['createMode']) {
      this.createMode = state['createMode'] as CreateMode;
    }
    this.loadDropdownOptions();

    const rowSubpoenaId = (this.rowdata as Record<string, unknown> | null)?.['SUBPOENA_ID'] as string | undefined;
    if (!this.isFormCreateable && rowSubpoenaId) {
      this.subpoenaId = rowSubpoenaId;
      this.loading = true;
      this.ass12030Service
        .detailASS12030({ SUBPOENA_ID: rowSubpoenaId })
        .pipe(finalize(() => (this.loading = false)), untilDestroyed(this))
        .subscribe({
          next: res => {
            if (res.Status !== '0000') return;
            const d = res.Data;
            this.subpoenaId = d?.SUBPOENA_ID ?? rowSubpoenaId;
            this.dataForm.patchValue({
              NOTES: d?.NOTES ?? '',
              EMP_ID: d?.EMP_ID ?? '',
              ORG_ID: d?.ORG_ID ?? '',
              APPLY_DATE: d?.APPLY_DATE ? new Date(d.APPLY_DATE) : null,
              SUPPLIER_ID: d?.SUPPLIER_ID ?? '',
              SUB_PAY_TYPE: d?.SUB_PAY_TYPE ?? '',
            });
            this.data = (d?.Details ?? []).map(item => ({
              GOODS_ID: item.GOODS_ID,
              TAX_CODE: item.TAX_CODE,
              QTY: item.QTY,
              GOODS_PRICE: item.GOODS_PRICE,
              NOTES: item.NOTES,
              ORG_ID: item.ORG_ID,
              WH_ID: item.WH_ID,
              NEED_ID: item.NEED_ID,
              PROD_TYPE: item.PROD_TYPE,
            }));
          },
        });
    }
  }

  loadDropdownOptions(): void {
    this.dropDownListService
      .queryTBLUSER_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        const list = res.Data ?? [];
        this.empIdOptions = list.map((item: { No?: string; Name?: string }) => ({
          value: item.No ?? '',
          label: `${item.No ?? ''} - ${item.Name ?? ''}`,
        }));
      });
    this.dropDownListService
      .queryPOS2013_DropDownList({})
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        const list = res.Data ?? [];
        this.orgIdOptions = list.map((item: { No?: string; Name?: string }) => ({
          value: item.No ?? '',
          label: `${item.No ?? ''} - ${item.Name ?? ''}`,
        }));
      });
    this.dropDownListService
      .queryPOS2013_DropDownList({ VEN_Flag: '1' })
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        const list = res.Data ?? [];
        this.supplierIdOptions = list.map((item: { VEN_No?: string; No?: string; Name?: string }) => ({
          value: item.VEN_No ?? item.No ?? '',
          label: `${item.VEN_No ?? item.No ?? ''} - ${item.Name ?? ''}`,
        }));
      });

    this.taxCodeOptions = [
      { value: '1', label: '應稅' },
      { value: '2', label: '免稅' },
    ];

    this.fin11040Service.queryFIN11040({ PageSize: 9999, PageIndex: 1 }).subscribe({
      next: res => {
        if (res.Status !== '0000') return;
        const data: TDS1008Data[] = res.Data ?? [];
        const options = data
          .filter(item => item.INV_ItemNo != null && item.INV_ItemNo !== '')
          .map(item => ({
            label: `${item.INV_ItemNo} - ${item.INV_ItemName ?? ''}`,
            value: item.INV_ItemNo,
          }));
        this.goodsIdOptions = options;
      },
    });
    this.ass11100Service.queryASS11100({ PageSize: 9999, PageIndex: 1 }).subscribe({
      next: res => {
        if (res.Status !== '0000') return;
        const options = (res.Data ?? [])
          .filter(item => item.WH_ID != null && item.WH_ID !== '')
          .map(item => ({
            label: `${item.WH_ID} - ${item.WH_NAME ?? ''}`,
            value: item.WH_ID!,
          }));
        this.whIdOptions = options;
      },
    })
  }

  /** 開啟套用請購清單 dialog（取得請購申請清單 ASS12010） */
  openApplyQuotedDialog(): void {
    this.applyDialogMode = 'quoted';
    this.applyListLoading = true;
    this.selectedQuotedRow = null;
    this.ass12010Service
      .queryASS12010({ PageSize: 9999, PageIndex: 1 })
      .pipe(finalize(() => (this.applyListLoading = false)), untilDestroyed(this))
      .subscribe({
        next: res => {
          if (res.Status !== '0000') return;
          this.applyQuotedData = res.Data ?? [];
          this.displayApplyDialog = true;
        },
      });
  }

  /** 開啟套用詢價清單 dialog（取得詢價登錄清單 ASS12020） */
  openApplyUnquotedDialog(): void {
    this.applyDialogMode = 'unquoted';
    this.applyListLoading = true;
    this.selectedPurchaseRow = null;
    this.ass12020Service
      .queryASS12020({ PageSize: 9999, PageIndex: 1 })
      .pipe(finalize(() => (this.applyListLoading = false)), untilDestroyed(this))
      .subscribe({
        next: res => {
          if (res.Status !== '0000') return;
          this.applyPurchaseData = res.Data ?? [];
          this.displayApplyDialog = true;
        },
      });
  }

  onQuotedSelectionChange(rows: ASS12010Data[]): void {
    this.selectedQuotedRow = rows?.[0] ?? null;
  }

  onPurchaseSelectionChange(rows: ASS12020QueryRow[]): void {
    this.selectedPurchaseRow = rows?.[0] ?? null;
  }

  /** 確認套用（依模式呼叫取得明細 API 並寫回表單與 data） */
  onApplyConfirm(): void {
    if (this.applyDialogMode === 'quoted') {
      const row = this.selectedQuotedRow;
      if (!row?.NEED_ID) {
        this.messageService.warnBubble('請選擇一筆請購清單');
        return;
      }
      this.applyListLoading = true;
      this.ass12010Service
        .detailASS12010({ NEED_ID: row.NEED_ID })
        .pipe(finalize(() => (this.applyListLoading = false)), untilDestroyed(this))
        .subscribe({
          next: res => {
            if (res.Status !== '0000') return;
            const d: ASS12010DetailResponse = res.Data;
            this.dataForm.patchValue({
              EMP_ID: d?.Header?.EMP_ID ?? this.dataForm.get('EMP_ID')?.value ?? '',
              ORG_ID: d?.Header?.ORG_ID ?? this.dataForm.get('ORG_ID')?.value ?? '',
              APPLY_DATE: d?.Header?.APPLY_DATE ? new Date(String(d.Header.APPLY_DATE)) : this.dataForm.get('APPLY_DATE')?.value,
              NOTES: d?.Header?.NOTE ?? this.dataForm.get('NOTES')?.value ?? '',
            });
            this.data = (d?.Details ?? []).map(item => ({
              GOODS_ID: item.GOODS_ID,
              QTY: item.QTY,
              NOTES: item.NOTES,
            }));
            this.displayApplyDialog = false;
            this.messageService.successBubble('套用成功');
          },
        });
      return;
    }
    const row = this.selectedPurchaseRow;
    const id = row?.id ?? row?.BATCH_NO;
    if (!id) {
      this.messageService.warnBubble('請選擇一筆詢價清單');
      return;
    }
    this.applyListLoading = true;
    this.ass12020Service
      .getASS12020Detail(id)
      .pipe(finalize(() => (this.applyListLoading = false)), untilDestroyed(this))
      .subscribe({
        next: res => {
          if (res.Status !== '0000') return;
          const d: ASS12020Detail = res.Data;
          this.dataForm.patchValue({
            SUPPLIER_ID: d?.SUPPLIER_ID ?? this.dataForm.get('SUPPLIER_ID')?.value ?? '',
            NOTES: d?.NOTES ?? this.dataForm.get('NOTES')?.value ?? '',
          });
          this.data = (d?.Details ?? []).map(item => ({
            GOODS_ID: item.GOODS_ID,
            GOODS_PRICE: item.GOODS_PRICE,
            QTY: item.QTY,
            WH_ID: item.WH_ID,
            NEED_ID: item.NEED_ID,
            NOTES: item.NOTES,
          }));
          this.displayApplyDialog = false;
          this.messageService.successBubble('套用成功');
        },
      });
  }

  get applyDialogTitle(): string {
    return this.applyDialogMode === 'quoted' ? '選擇請購清單（套用請購清單）' : '選擇詢價清單（套用詢價清單）';
  }

  get canConfirmApply(): boolean {
    return this.applyDialogMode === 'quoted' ? !!this.selectedQuotedRow : !!this.selectedPurchaseRow;
  }

  onTableInsert(): void {
    const newItem = this.defaultNewItem();
    this.data = [...this.data, newItem];
  }

  private defaultNewItem(): ASS12030DetailItem {
    return {
      GOODS_ID: null,
      NEED_ID: null,
      TAX_CODE: null,
      QTY: null,
      GOODS_PRICE: null,
      ORG_ID: null,
      WH_ID: null,
      PROD_TYPE: null,
      NOTES: null,
    };
  }

  private toDetails(rows: Record<string, unknown>[]): ASS12030DetailItem[] {
    return rows.map(row => ({
      GOODS_ID: (row['GOODS_ID'] as string) || undefined,
      TAX_CODE: (row['TAX_CODE'] as string) || undefined,
      QTY: (row['QTY'] as number | undefined) ?? undefined,
      GOODS_PRICE: (row['GOODS_PRICE'] as number | undefined) ?? undefined,
      NOTES: (row['NOTES'] as string) || undefined,
      ORG_ID: (row['ORG_ID'] as string) || undefined,
      WH_ID: (row['WH_ID'] as string) || undefined,
      NEED_ID: (row['NEED_ID'] as string) || undefined,
      PROD_TYPE: (row['PROD_TYPE'] as string) || undefined,
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
        const payload: ASS12030InsertRequest = {
          EMP_ID: raw.EMP_ID ?? '',
          ORG_ID: raw.ORG_ID ?? '',
          APPLY_DATE: applyDate,
          SUPPLIER_ID: raw.SUPPLIER_ID ?? '',
          SUB_PAY_TYPE: raw.SUB_PAY_TYPE ?? '',
          NOTES: raw.NOTES ?? undefined,
          SUBPOENA_TYPE: this.createMode === 'quoted' ? 'Q' : 'R',
          Details: details,
        };
        this.ass12030Service
          .insertASS12030(payload)
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
        const payload: ASS12030UpdateRequest = {
          SUBPOENA_ID: this.subpoenaId ?? '',
          EMP_ID: raw.EMP_ID ?? '',
          ORG_ID: raw.ORG_ID ?? '',
          APPLY_DATE: applyDate,
          SUPPLIER_ID: raw.SUPPLIER_ID ?? '',
          SUB_PAY_TYPE: raw.SUB_PAY_TYPE ?? '',
          NOTES: raw.NOTES ?? undefined,
          Details: details,
        };
        this.ass12030Service
          .updateASS12030(payload)
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
