import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import {
  ApplyPurchaseListRow,
  ApplyQuotedListRow,
  ASS12030Detail,
  ASS12030DetailItem,
  ASS12030InsertRequest,
} from '@pages/ass/ass12030/ass12030.model';
import { ASS12030Service } from '@service/api/ass/ass12030.service';
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
import { Column } from '@shared/componentkit/table/table.model';
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
    EXPEND_TYPE: [null as string | null, [Validators.required]],
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
  taxTypeOptions: { value: string; label: string }[] = [];
  /** 支出類型下拉選項 */
  expendTypeOptions: { value: string; label: string }[] = getSYS1000Options('SUB_PAY_TYPE');

  // TODO: 未實作下拉選項
  /** 品項編號下拉選項 */
  goodsIdOptions: { value: string; label: string }[] = [];
  /** 需求單號下拉選項 */
  needIdOptions: { value: string; label: string }[] = [];
  /** 供應商下拉選項 */
  supplierIdOptions: { value: string; label: string }[] = [];
  /** 倉別下拉選項 */
  whIdOptions: { value: string; label: string }[] = [];
  /** 商品類型下拉選項 */
  goodsTypeOptions: { value: string; label: string }[] = getSYS1000Options('PROD_TYPE');

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
      field: 'TAX_TYPE',
      header: '稅別',
      type: 'dropdown',
      optionLabel: 'label',
      optionValue: 'value',
      options: () => this.taxTypeOptions,
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
      field: 'UNIT_PRICE',
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
      field: 'GOODS_TYPE',
      header: '商品類型',
      type: 'dropdown',
      optionLabel: 'label',
      optionValue: 'value',
      options: () => this.goodsTypeOptions,
      validate: [validateRequired],
    },
    { field: 'NOTES', header: '說明', type: 'input' },
  ];

  /** 套用清單 dialog */
  displayApplyDialog = false;
  applyDialogMode: 'quoted' | 'unquoted' = 'quoted';
  applyQuotedData: ApplyQuotedListRow[] = [];
  applyPurchaseData: ApplyPurchaseListRow[] = [];
  selectedQuotedRow: ApplyQuotedListRow | null = null;
  selectedPurchaseRow: ApplyPurchaseListRow | null = null;
  applyListLoading = false;
  applyQuotedColumns: Column[] = [
    { field: 'id', header: '編號' },
    { field: 'BATCH_NO', header: '批號' },
    { field: 'SUPPLIER_ID', header: '供應商' },
    { field: 'LOG_DATE', header: '日期' },
    { field: 'ROW_COUNT', header: '筆數' },
  ];
  applyPurchaseColumns: Column[] = [
    { field: 'NEED_ID', header: '需求編號' },
    { field: 'APPLICANT', header: '申請人' },
    { field: 'DEPT', header: '申請部門' },
    { field: 'REQ_DATE', header: '日期' },
    { field: 'ROW_COUNT', header: '筆數' },
  ];

  constructor(
    private readonly ass12030Service: ASS12030Service,
    private readonly dropDownListService: DropDownListService,
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
    if (!this.isFormCreateable && this.rowdata?.id != null) {
      this.loading = true;
      this.ass12030Service
        .getASS12030Detail((this.rowdata as ASS12030Detail).id!)
        .pipe(finalize(() => (this.loading = false)), untilDestroyed(this))
        .subscribe({
          next: res => {
            if (res.Status !== '0000') return;
            const d = res.Data;
            this.dataForm.patchValue({
              NOTES: d?.NOTES ?? '',
              EMP_ID: d?.EMP_ID ?? '',
              ORG_ID: d?.ORG_ID ?? '',
              APPLY_DATE: d?.APPLY_DATE ? new Date(d.APPLY_DATE) : null,
              SUPPLIER_ID: d?.SUPPLIER_ID ?? '',
              EXPEND_TYPE: d?.EXPEND_TYPE ?? '',
            });
            this.data = d?.Details ?? [];
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

    this.taxTypeOptions = [
      { value: '1', label: '應稅' },
      { value: '2', label: '免稅' },
    ]

    // TODO: 未實作下拉選項
  }

  /** 開啟套用請購清單 dialog（取得詢價清單） */
  openApplyQuotedDialog(): void {
    this.applyDialogMode = 'quoted';
    this.applyListLoading = true;
    this.selectedQuotedRow = null;
    this.ass12030Service
      .getQuotedList()
      .pipe(finalize(() => (this.applyListLoading = false)), untilDestroyed(this))
      .subscribe({
        next: res => {
          if (res.Status !== '0000') return;
          this.applyQuotedData = res.Data ?? [];
          this.displayApplyDialog = true;
        },
      });
  }

  /** 開啟套用詢價清單 dialog（取得請購清單） */
  openApplyUnquotedDialog(): void {
    this.applyDialogMode = 'unquoted';
    this.applyListLoading = true;
    this.selectedPurchaseRow = null;
    this.ass12030Service
      .getPurchaseRequestList()
      .pipe(finalize(() => (this.applyListLoading = false)), untilDestroyed(this))
      .subscribe({
        next: res => {
          if (res.Status !== '0000') return;
          this.applyPurchaseData = res.Data ?? [];
          this.displayApplyDialog = true;
        },
      });
  }

  onQuotedSelectionChange(rows: ApplyQuotedListRow[]): void {
    this.selectedQuotedRow = rows?.[0] ?? null;
  }

  onPurchaseSelectionChange(rows: ApplyPurchaseListRow[]): void {
    this.selectedPurchaseRow = rows?.[0] ?? null;
  }

  /** 確認套用（依模式呼叫取得明細 API 並寫回表單與 data） */
  onApplyConfirm(): void {
    if (this.applyDialogMode === 'quoted') {
      const row = this.selectedQuotedRow;
      const id = row?.id ?? row?.BATCH_NO;
      if (!id) {
        this.messageService.warnBubble('請選擇一筆詢價清單');
        return;
      }
      this.applyListLoading = true;
      this.ass12030Service
        .getQuotedDetail(String(id))
        .pipe(finalize(() => (this.applyListLoading = false)), untilDestroyed(this))
        .subscribe({
          next: res => {
            if (res.Status !== '0000') return;
            const d = res.Data;
            this.dataForm.patchValue({
              NOTES: d?.NOTES ?? this.dataForm.get('NOTES')?.value ?? '',
              EMP_ID: d?.EMP_ID ?? this.dataForm.get('EMP_ID')?.value ?? '',
              ORG_ID: d?.ORG_ID ?? this.dataForm.get('ORG_ID')?.value ?? '',
              APPLY_DATE: d?.APPLY_DATE ? new Date(d.APPLY_DATE) : this.dataForm.get('APPLY_DATE')?.value,
              SUPPLIER_ID: d?.SUPPLIER_ID ?? this.dataForm.get('SUPPLIER_ID')?.value ?? '',
              EXPEND_TYPE: d?.EXPEND_TYPE ?? this.dataForm.get('EXPEND_TYPE')?.value ?? '',
            });
            this.data = d?.Details ?? [];
            this.displayApplyDialog = false;
            this.messageService.successBubble('套用成功');
          },
        });
      return;
    }
    const row = this.selectedPurchaseRow;
    if (!row?.NEED_ID) {
      this.messageService.warnBubble('請選擇一筆請購清單');
      return;
    }
    this.applyListLoading = true;
    this.ass12030Service
      .getPurchaseRequestDetail(row.NEED_ID)
      .pipe(finalize(() => (this.applyListLoading = false)), untilDestroyed(this))
      .subscribe({
        next: res => {
          if (res.Status !== '0000') return;
          const d = res.Data;
          this.dataForm.patchValue({
            NOTES: d?.NOTES ?? this.dataForm.get('NOTES')?.value ?? '',
            EMP_ID: d?.EMP_ID ?? this.dataForm.get('EMP_ID')?.value ?? '',
            ORG_ID: d?.ORG_ID ?? this.dataForm.get('ORG_ID')?.value ?? '',
            APPLY_DATE: d?.APPLY_DATE ? new Date(d.APPLY_DATE) : this.dataForm.get('APPLY_DATE')?.value,
            SUPPLIER_ID: d?.SUPPLIER_ID ?? this.dataForm.get('SUPPLIER_ID')?.value ?? '',
            EXPEND_TYPE: d?.EXPEND_TYPE ?? this.dataForm.get('EXPEND_TYPE')?.value ?? '',
          });
          this.data = d?.Details ?? [];
          this.displayApplyDialog = false;
          this.messageService.successBubble('套用成功');
        },
      });
  }

  get applyDialogTitle(): string {
    return this.applyDialogMode === 'quoted' ? '選擇詢價清單（套用請購清單）' : '選擇請購清單（套用詢價清單）';
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
      TAX_TYPE: null,
      QTY: null,
      UNIT_PRICE: null,
      ORG_ID: null,
      WH_ID: null,
      GOODS_TYPE: null,
      NOTES: null,
    };
  }

  private toDetails(rows: Record<string, unknown>[]): ASS12030DetailItem[] {
    return rows.map(row => ({
      GOODS_ID: (row['GOODS_ID'] as string) || undefined,
      NEED_ID: (row['NEED_ID'] as string) || undefined,
      TAX_TYPE: (row['TAX_TYPE'] as string) || undefined,
      QTY: (row['QTY'] as number | undefined) ?? undefined,
      UNIT_PRICE: (row['UNIT_PRICE'] as number | undefined) ?? undefined,
      ORG_ID: (row['ORG_ID'] as string) || undefined,
      WH_ID: (row['WH_ID'] as string) || undefined,
      GOODS_TYPE: (row['GOODS_TYPE'] as string) || undefined,
      NOTES: (row['NOTES'] as string) || undefined,
    }));
  }

  onSubmit(): void {
    this.handleSubmit(this.dataForm, () => {
      const valid = this.tableEditComponent?.validateAndShowErrors();
      if (valid === false) return;
      const raw = this.dataForm.getRawValue();
      const details = this.toDetails(this.data as Record<string, unknown>[]);
      const payload: ASS12030InsertRequest = {
        NOTES: raw.NOTES ?? undefined,
        EMP_ID: raw.EMP_ID ?? '',
        ORG_ID: raw.ORG_ID ?? '',
        APPLY_DATE: raw.APPLY_DATE instanceof Date ? raw.APPLY_DATE.toISOString().slice(0, 10) : String(raw.APPLY_DATE ?? ''),
        SUPPLIER_ID: raw.SUPPLIER_ID ?? '',
        EXPEND_TYPE: raw.EXPEND_TYPE ?? '',
        Details: details,
      };
      this.loading = true;
      const req =
        this.crudstatus === CRUDStatus.Create
          ? this.ass12030Service.insertASS12030(payload)
          : this.ass12030Service.updateASS12030((this.rowdata as ASS12030Detail)?.id as number | string, {
            ...payload,
            id: (this.rowdata as ASS12030Detail)?.id as number | string,
          });
      req
        .pipe(finalize(() => (this.loading = false)), untilDestroyed(this))
        .subscribe({
          next: res => {
            if (res.Status !== '0000') {
              this.messageService.errorBubble('操作失敗：' + (res.Message ?? ''));
              return;
            }
            this.messageService.successBubble(this.crudstatus === CRUDStatus.Create ? '新增成功' : '編輯成功');
            this.onCancel();
          },
        });
    });
  }
}
