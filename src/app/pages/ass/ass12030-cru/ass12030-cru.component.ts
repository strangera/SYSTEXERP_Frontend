import { AsyncPipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { TableComponent } from '@others/component/table/table.component';
import { Column, formatDate } from '@others/component/table/table.model';
import { ASS12010Data, ASS12010DetailResponse } from '@pages/ass/ass12010/ass12010.model';
import { ASS12020Detail, ASS12020QueryRow } from '@pages/ass/ass12020/ass12020.model';
import {
  ASS12030Detail,
  ASS12030DetailItem,
  ASS12030InsertRequest,
  ASS12030UpdateRequest,
} from '@pages/ass/ass12030/ass12030.model';
import { ASS11100Service } from '@service/api/ass/ass11100.service';
import { ASS12010Service } from '@service/api/ass/ass12010.service';
import { ASS12020Service } from '@service/api/ass/ass12020.service';
import { ASS12030Service } from '@service/api/ass/ass12030.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { DialogComponent } from '@shared/components/dialog/dialog.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { TableEditComponent } from '@shared/components/table-edit/table-edit.component';
import { EditColumn } from '@shared/components/table-edit/table-edit.model';
import {
  validateMinNumber,
  validateRequired,
} from '@shared/components/table-edit/validate-field.model';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

/** 進入新增頁時的套用模式：已詢價=套用請購清單，未詢價=套用詢價清單 */
export type CreateMode = 'quoted' | 'unquoted';

/** 品項完整主檔資料型別定義 (包含 PROD_TYPE) */
export interface GoodsOption {
  value: string;
  label: string;
  PROD_TYPE?: string;
}

/** 3.1.2.3 採購申請作業 CRU */
@UntilDestroy()
@Component({
  selector: 'app-ass12030-cru',
  templateUrl: './ass12030-cru.component.html',
  standalone: true,
  imports: [
    AsyncPipe,
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

  /** 部門下拉選項 */
  orgIdOptions = this.dropdownApiService.querySys3100();

  /** 委託部門下拉選項：querySYS3100_DropDownList */
  entrustOrgIdOptions: { value: string; label: string }[] = [];

  /** 稅別下拉選項 */
  taxCodeOptions: { value: string; label: string }[] = [];

  /** 支出類型下拉選項 */
  subPayTypeOptions: { value: string; label: string }[] = getSYS1000Options('SUB_PAY_TYPE');

  /** 商品類型下拉選項 */
  prodTypeOptions: { value: string; label: string }[] = getSYS1000Options('PROD_TYPE');

  /** 品項編號下拉選項：包含 PROD_TYPE */
  goodsIdOptions: GoodsOption[] = [];

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
      type: 'input',
      placeholder: '輸入需求單號',
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
      options: () => this.entrustOrgIdOptions,
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
      // 【需求2】已移除 validate: [validateRequired]，免除必填檢查
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
    { field: 'BATCH_ID', header: '登錄批號' },
    { field: 'SUPPLIER_ID', header: '供應商' },
    { field: 'CRT_Date', header: '登錄日期', format: formatDate },
    { field: 'EXPDATE', header: '報價期限' },
    { field: 'NOTES', header: '說明' },
  ];

  /** 編輯/明細時保留的傳票號碼 */
  private subpoenaId: string | null = null;

  constructor(
    private readonly ass12030Service: ASS12030Service,
    private readonly dropDownListService: DropDownListService,
    private readonly dropdownApiService: DropdownApiService,
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
      .querySYS3100_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        const list = res.Data ?? [];
        this.entrustOrgIdOptions = list.map((item: { No?: string; Name?: string }) => ({
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

    // 【需求3】取得品項主檔清單（保留 PROD_TYPE，以供選擇 GOODS_ID 時連動帶入）
    this.dropdownApiService
      .queryASS11040_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe((res: any) => {
        this.goodsIdOptions = (res ?? []).map((item: any) => ({
          value: item.value ?? item.GOODS_ID ?? item.No ?? '',
          label: item.label ?? `${item.GOODS_ID ?? item.No ?? ''} - ${item.GOODS_NAME ?? item.Name ?? ''}`,
          PROD_TYPE: item.PROD_TYPE ?? item.PROD_TYPE_ID ?? item.ASSET_TYPE ?? null,
        }));
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
    });
  }

  /** 開啟套用請購清單 dialog（取得請購申請清單 ASS12010） */
  openApplyQuotedDialog(): void {
    this.applyDialogMode = 'quoted';
    this.applyListLoading = true;
    this.selectedQuotedRow = null;
    this.ass12010Service
      .queryASS12010({ PageSize: 9999, PageIndex: 1, NEEDS_STATUS: '2' })
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
            const orgId = d?.Header?.ORG_ID ?? row.ORG_ID ?? '';
            const orgName = d?.Header?.ORG_NAME ?? row.ORG_NAME ?? '';

            // 避免停用部門不在下拉選項中，導致畫面無法顯示名稱
            this.ensureEntrustOrgOption(orgId, orgName);

            // 【需求1】移除 EMP_ID 的自動帶入，保留表單現有選取的採購申請人
            this.dataForm.patchValue({
              ORG_ID: orgId || this.dataForm.get('ORG_ID')?.value || '',
              APPLY_DATE: d?.Header?.APPLY_DATE ? new Date(String(d.Header.APPLY_DATE)) : this.dataForm.get('APPLY_DATE')?.value,
              NOTES: d?.Header?.NOTE ?? this.dataForm.get('NOTES')?.value ?? '',
            });

            const needId = d?.Header?.NEED_ID ?? row.NEED_ID ?? '';

            // 【需求3】帶入明細時自動計算並填入 PROD_TYPE
            this.data = (d?.Details ?? []).map(item => {
              const matchedGoods = this.goodsIdOptions.find(g => g.value === item.GOODS_ID);
              return {
                GOODS_ID: item.GOODS_ID,
                NEED_ID: needId,
                QTY: item.QTY,
                NOTES: item.NOTES,
                TAX_CODE: '1', // 預設應稅
                ORG_ID: orgId, // 委託部門帶入請購單表頭部門
                PROD_TYPE: matchedGoods?.PROD_TYPE ?? null,
              };
            });

            this.displayApplyDialog = false;
            this.messageService.successBubble('套用成功');
          },
        });
      return;
    }

    const row = this.selectedPurchaseRow;
    const id = row?.FAQuotationM_ID;
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

          // 【需求3】帶入明細時自動計算並填入 PROD_TYPE (經由 goodsIdOptions 自動對照)
          this.data = (d?.Details ?? []).map(item => {
            const matchedGoods = this.goodsIdOptions.find(g => g.value === item.GOODS_ID);
            return {
              GOODS_ID: item.GOODS_ID,
              GOODS_PRICE: item.GOODS_PRICE,
              QTY: item.QTY,
              WH_ID: item.WH_ID,
              NEED_ID: item.NEED_ID,
              NOTES: item.NOTES,
              TAX_CODE: '1', // 預設應稅
              PROD_TYPE: matchedGoods?.PROD_TYPE ?? null,
            };
          });

          this.displayApplyDialog = false;
          this.messageService.successBubble('套用成功');
        },
      });
  }

  private ensureEntrustOrgOption(
    orgId: string | null | undefined,
    orgName: string | null | undefined
  ): void {
    if (!orgId) return;
    const exists = this.entrustOrgIdOptions.some(
      option => option.value === orgId
    );
    if (!exists) {
      this.entrustOrgIdOptions = [
        ...this.entrustOrgIdOptions,
        {
          value: orgId,
          label: `${orgId} - ${orgName ?? ''}`,
        },
      ];
    }
  }

  get applyDialogTitle(): string {
    return this.applyDialogMode === 'quoted'
      ? '選擇請購清單（套用請購清單）'
      : '選擇詢價清單（套用詢價清單）';
  }

  get canConfirmApply(): boolean {
    return this.applyDialogMode === 'quoted'
      ? !!this.selectedQuotedRow
      : !!this.selectedPurchaseRow;
  }

  onTableInsert(): void {
    const newItem = this.defaultNewItem();
    this.data = [...this.data, newItem];
  }

  private defaultNewItem(): ASS12030DetailItem {
    return {
      GOODS_ID: null,
      NEED_ID: null,
      TAX_CODE: '1', // 預設應稅
      QTY: null,
      GOODS_PRICE: null,
      ORG_ID: null,
      WH_ID: null,
      PROD_TYPE: null,
      NOTES: null,
    };
  }

  /**
   * 【需求3】當表格變更（如手動變更 GOODS_ID）時呼叫此方法，自動連動 PROD_TYPE
   */
  onTableDataChange(updatedRows: Record<string, unknown>[]): void {
    this.data = updatedRows.map(row => {
      const goodsId = row['GOODS_ID'] as string;
      let prodType = row['PROD_TYPE'] as string;

      if (goodsId) {
        const matchedOption = this.goodsIdOptions.find(opt => opt.value === goodsId);
        if (matchedOption?.PROD_TYPE) {
          prodType = matchedOption.PROD_TYPE;
        }
      }

      return {
        ...row,
        PROD_TYPE: prodType,
      } as ASS12030DetailItem;
    });
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
      this.loading = true;
      if (valid === false) {
        this.loading = false;
        return;
      }
      const raw = this.dataForm.getRawValue();
      const details = this.toDetails(this.data as Record<string, unknown>[]);
      const applyDate =
        raw.APPLY_DATE instanceof Date
          ? this.formatLocalDate(raw.APPLY_DATE)
          : String(raw.APPLY_DATE ?? '');

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

  private formatLocalDate(date: Date | null): string {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}