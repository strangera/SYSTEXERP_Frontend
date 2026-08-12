import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import {
  ASS12010DetailItem,
  ASS12010DetailResponse,
  ASS12010QueryRequest,
} from '@pages/ass/ass12010/ass12010.model';
import {
  ASS12020Detail,
  ASS12020DetailItem,
  ASS12020InsertRequest,
  ApplyPurchaseRequestRow,
} from '@pages/ass/ass12020/ass12020.model';
import { ASS11100Service } from '@service/api/ass/ass11100.service';
import { ASS12010Service } from '@service/api/ass/ass12010.service';
import { ASS12020Service } from '@service/api/ass/ass12020.service';
import { Fin11040Service } from '@service/api/fin/fin11040.service';
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
import { EditColumn, FieldChangeEvent } from '@shared/components/table-edit/table-edit.model';
import { validateMaxLength, validateMinNumber, validateRequired } from '@shared/components/table-edit/validate-field.model';
import { TableComponent } from '@others/component/table/table.component';
import { Column, LazyLoadEvent, formatDate, formatDateToYYYY_MM_DD } from '@others/component/table/table.model';
import { PanelModule } from 'primeng/panel';
import { finalize, forkJoin } from 'rxjs';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

/** 3.1.2.2 詢價登錄作業 CRU */
@UntilDestroy()
@Component({
  selector: 'app-ass12020-cru',
  templateUrl: './ass12020-cru.component.html',
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
export class ASS12020CRUComponent extends BasicCruPageComponent<ASS12020Detail> implements OnInit {
  @ViewChild('tableEdit') tableEditComponent!: TableEditComponent;

  dataForm = this.formBuilder.nonNullable.group({
    SUPPLIER_ID: ['', [Validators.required]],
    EXPDATE: [null as Date | null, [Validators.required]],
    NOTES: [''],
  });

  /** 明細資料（table-edit 綁定） */
  data: ASS12020DetailItem[] = [];


  /** 供應商下拉：queryPOS2013_DropDownList */
  supplierOptions: { value: string; label: string }[] = [];
  /** 品項編號下拉：queryFIN11040 */
  itemCodeOptions: { value: string; label: string }[] = [];
  itemUnitOptions = getSYS1000Options('UNIT');
  /** 倉別下拉：queryASS11100 */
  whIdOptions: { value: string; label: string }[] = [];

  /** table-edit 欄位設定 */
  editColumns: EditColumn[] = [
    { field: 'NEED_ID', header: '請購單號', type: 'input', maxLength: 12, validate: [validateMaxLength(12)] },
    {
      field: 'GOODS_ID',
      header: '品項編號',
      type: 'dropdown',
      optionLabel: 'label',
      optionValue: 'value',
      options: () => this.itemCodeOptions,
      validate: [validateRequired],
    },
    {
      field: 'GOODS_PRICE',
      header: '單價(未稅)',
      type: 'inputNumber',
      placeholder: '輸入數字',
      validate: [validateRequired, validateMinNumber(0)],
    },
    { field: 'PURCHASE_QTY', header: '請購數量', type: 'inputNumber', disabled: () => true },
    { field: 'QTY', header: '數量', type: 'inputNumber', placeholder: '輸入數字', validate: [validateRequired, validateMinNumber(0)] },
    {
      field: 'GOODS_UNIT',
      header: '品項單位',
      type: 'dropdown',
      optionLabel: 'label',
      optionValue: 'value',
      options: () => this.itemUnitOptions,
      validate: [validateRequired],
    },
    { field: 'TOTAL_AMT', header: '總金額', type: 'inputNumber', disabled: () => true, validate: [validateRequired] },
    { field: 'EXPIRE_LIMIT', header: '保存期限(月)', type: 'inputNumber', placeholder: '輸入數字' },
    {
      field: 'WH_ID',
      header: '倉別',
      type: 'dropdown',
      optionLabel: 'label',
      optionValue: 'value',
      options: () => this.whIdOptions,
    },
    { field: 'NOTES', header: '說明', type: 'input' },
  ];

  /** 套用請購申請單：是否顯示 dialog */
  displayApplyDialog = false;
  /** 套用請購申請單清單資料 */
  applyListData: ApplyPurchaseRequestRow[] = [];
  /** 套用請購申請單：總筆數（供分頁器） */
  applyTotalRecords = 0;
  /** 套用請購申請單：已選一筆 */
  selectedApplyRow: ApplyPurchaseRequestRow | null = null;
  applyListLoading = false;
  /** 套用視窗表格欄位 */
  applyListColumns: Column[] = [
    { field: 'NEED_ID', header: '需求編號' },
    { field: 'APPLICANT', header: '申請人' },
    { field: 'DEPT', header: '申請部門' },
    { field: 'REQ_DATE', header: '日期', format: formatDate },
    { field: 'ROW_COUNT', header: '筆數' },
  ];

  constructor(
    private readonly ass12020Service: ASS12020Service,
    private readonly ass12010Service: ASS12010Service,
    private readonly fin11040Service: Fin11040Service,
    private readonly ass11100Service: ASS11100Service,
    private readonly dropDownListService: DropDownListService,
    private readonly dropdownApiService: DropdownApiService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS12020', this.dataForm);
    this.loadOptions();
    const id = this.getRowdataId();
    if (!this.isFormCreateable && id != null) {
      this.loading = true;
      this.ass12020Service
        .getASS12020Detail(id)
        .pipe(finalize(() => (this.loading = false)), untilDestroyed(this))
        .subscribe({
          next: res => {
            if (res.Status !== '0000') return;
            const d = res.Data;
            this.dataForm.patchValue({
              SUPPLIER_ID: d?.SUPPLIER_ID ?? '',
              EXPDATE: d?.EXPDATE ? new Date(d.EXPDATE) : null,
              NOTES: d?.NOTES ?? '',
            });
            this.data = d?.Details ?? [];
          },
        });
    }
  }

  /** 取得列資料主鍵 (FAQuotationM_ID 或 id)，供 detail/update/export 使用 */
  private getRowdataId(): number | undefined {
    const r = this.rowdata
    return r?.FAQuotationM_ID;
  }

  /** 載入供應商 (queryPOS2013)、品項編號 (queryFIN11040)、倉別 (queryASS11100) 下拉選項 */
  private loadOptions(): void {
    forkJoin({
      suppliers: this.dropdownApiService.queryPos2013({ VEN_Flag: '' }),
      items: this.dropdownApiService.queryASS11040_DropDownList(),
      wh: this.ass11100Service.queryASS11100({ PageSize: 100, PageIndex: 1 }),
    })
      .pipe(untilDestroyed(this))
      .subscribe({
        next: ({ suppliers, items, wh }) => {
          this.supplierOptions = suppliers ?? [];
          this.itemCodeOptions = items ?? [];
          if (wh.Status === '0000' && Array.isArray(wh.Data)) {
            this.whIdOptions = wh.Data.map(item => ({
              value: item.WH_ID ?? '',
              label: `${item.WH_ID ?? ''} - ${item.WH_NAME ?? ''}`,
            }));
          }
        },
      });
  }

  /** 開啟套用請購申請單 dialog */
  openApplyDialog(): void {
    this.applyListLoading = true;
    this.selectedApplyRow = null;
    const payload: ASS12010QueryRequest = {
      PageSize: 30,
      PageIndex: 1,
    };
    this.ass12010Service
      .queryASS12010(payload)
      .pipe(finalize(() => (this.applyListLoading = false)), untilDestroyed(this))
      .subscribe({
        next: res => {
          if (res.Status !== '0000') return;
          const list = res.Data ?? [];
          this.applyListData = list.map(row => ({
            NEED_ID: row.NEED_ID ?? null,
            APPLICANT: row.EMP_NAME ?? null,
            DEPT: row.ORG_NAME ?? null,
            REQ_DATE: row.APPLY_DATE != null ? String(row.APPLY_DATE) : null,
            ROW_COUNT: row.Detail_CNT ?? null,
          }));
          this.applyTotalRecords = res.TotalCount ?? this.applyListData.length;
          this.displayApplyDialog = true;
        },
      });
  }

  /** 套用請購 dialog 內表格 lazy 換頁／排序時呼叫 */
  onApplyLazyLoad(event: LazyLoadEvent): void {
    const pageSize = event.pageSize ?? 30;
    const pageIndex = event.pageIndex ?? 1;
    const sortBy = event.SortBy;

    this.applyListLoading = true;
    const payload: ASS12010QueryRequest = {
      PageSize: pageSize,
      PageIndex: pageIndex,
      SortBy: sortBy,
    };

    this.ass12010Service
      .queryASS12010(payload)
      .pipe(finalize(() => (this.applyListLoading = false)), untilDestroyed(this))
      .subscribe({
        next: res => {
          if (res.Status !== '0000') return;
          const list = res.Data ?? [];
          this.applyListData = list.map(row => ({
            NEED_ID: row.NEED_ID ?? null,
            APPLICANT: row.EMP_NAME ?? null,
            DEPT: row.ORG_NAME ?? null,
            REQ_DATE: row.APPLY_DATE != null ? String(row.APPLY_DATE) : null,
            ROW_COUNT: row.Detail_CNT ?? null,
          }));
          this.applyTotalRecords = res.TotalCount ?? this.applyListData.length;
        },
      });
  }

  onApplySelectionChange(rows: ApplyPurchaseRequestRow[]): void {
    this.selectedApplyRow = rows?.[0] ?? null;
  }

  /** 確認套用請購申請單 */
  onApplyConfirm(): void {
    const row = this.selectedApplyRow;
    if (!row?.NEED_ID) {
      this.messageService.warnBubble('請選擇一筆請購申請單');
      return;
    }
    this.applyListLoading = true;
    this.ass12010Service
      .detailASS12010({ NEED_ID: row.NEED_ID })
      .pipe(finalize(() => (this.applyListLoading = false)), untilDestroyed(this))
      .subscribe({
        next: res => {
          if (res.Status !== '0000') return;
          const data = res.Data as ASS12010DetailResponse | undefined;
          if (!data?.Header || !data?.Details) {
            this.displayApplyDialog = false;
            return;
          }
          const header = data.Header;
          const needId = header.NEED_ID ?? row.NEED_ID ?? '';
          const whId = header.WH_ID ?? null;
          const currentNotes = header.NOTE ?? '';
          this.dataForm.patchValue({
            NOTES: currentNotes,
          });
          // 明細：ASS12010DetailItem[] → ASS12020DetailItem[]
          this.data = (data.Details ?? []).map((detail: ASS12010DetailItem) => ({
            NEED_ID: needId || null,
            GOODS_ID: detail.GOODS_ID ?? null,
            GOODS_PRICE: null,
            PURCHASE_QTY: detail.PURCHASE_QTY ?? 0,
            QTY: detail.QTY ?? null,
            GOODS_UNIT: null,
            TOTAL_AMT: 0,
            EXPIRE_LIMIT: null,
            WH_ID: whId ?? null,
            NOTES: detail.NOTES ?? null,
          }));
          this.displayApplyDialog = false;
          this.messageService.successBubble('套用成功');
        },
      });
  }

  /** 明細欄位變更：候選列轉正時補預設 0；單價(未稅) × 數量 → 總金額（自動計算） */
  onDetailFieldChange(event: FieldChangeEvent): void {
    const row = event.rowData;
    if (!row) return;
    // 使用者首次在候選列輸入任何欄位 → 此列已轉為真實列，補預設 0
    if (row.PURCHASE_QTY == null) row.PURCHASE_QTY = 0;
    if (row.TOTAL_AMT == null) row.TOTAL_AMT = 0;
    if (event.field === 'GOODS_PRICE' || event.field === 'QTY') {
      const price = Number(row.GOODS_PRICE) || 0;
      const qty = Number(row.QTY) || 0;
      row.TOTAL_AMT = price * qty;
    }
  }

  /** table-edit 新增按鈕：新增一列 */
  onTableInsert(): void {
    const newItem = this.defaultNewItem() as ASS12020DetailItem;
    const currentData = this.data;
    this.data = [...currentData, newItem as ASS12020DetailItem];
  }

  private defaultNewItem(): ASS12020DetailItem {
    return {
      NEED_ID: null,
      GOODS_ID: null,
      GOODS_PRICE: null,
      PURCHASE_QTY: 0,
      QTY: null,
      GOODS_UNIT: null,
      TOTAL_AMT: 0,
      EXPIRE_LIMIT: null,
      WH_ID: null,
      NOTES: null,
    };
  }

  /** 從 table-edit data 過濾出 API 用的明細（排除內部欄位） */
  private toDetails(rows: Record<string, unknown>[]): ASS12020DetailItem[] {
    return rows.map(row => ({
      NEED_ID: (row['NEED_ID'] as string) || undefined,
      GOODS_ID: (row['GOODS_ID'] as string) || undefined,
      GOODS_PRICE: (row['GOODS_PRICE'] as number | undefined) ?? undefined,
      PURCHASE_QTY: (row['PURCHASE_QTY'] as number | undefined) ?? undefined,
      QTY: (row['QTY'] as number | undefined) ?? undefined,
      GOODS_UNIT: (row['GOODS_UNIT'] as string) || undefined,
      TOTAL_AMT: (row['TOTAL_AMT'] as number | undefined) ?? undefined,
      EXPIRE_LIMIT: (row['EXPIRE_LIMIT'] as number | undefined) ?? undefined,
      WH_ID: (row['WH_ID'] as string) || undefined,
      NOTES: (row['NOTES'] as string) || undefined,
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
      const basePayload: ASS12020InsertRequest = {
        SUPPLIER_ID: raw.SUPPLIER_ID,
        EXPDATE: raw.EXPDATE ? formatDateToYYYY_MM_DD(raw.EXPDATE) ?? "" : "",
        NOTES: raw.NOTES ?? undefined,
        Details: details,
      };
      if (this.crudstatus !== CRUDStatus.Create) {
        const id = this.getRowdataId();
        if (id == null || typeof id !== 'number') {
          this.messageService.errorBubble('無法更新：缺少主鍵');
          return;
        }
      }
      const req =
        this.crudstatus === CRUDStatus.Create
          ? this.ass12020Service.insertASS12020(basePayload)
          : this.ass12020Service.updateASS12020({
            ...basePayload,
            FAQuotationM_ID: this.getRowdataId() as number,
          });
      req
        .pipe(finalize(() => (this.loading = false)), untilDestroyed(this))
        .subscribe({
          next: res => {
            if (res.Status !== '0000') {
              this.messageService.errorBubble('操作失敗：' + (res.Message ?? ''));
              return;
            }
            this.messageService.successBubble(
              this.crudstatus === CRUDStatus.Create ? '新增成功' : '編輯成功'
            );
            this.onCancel();
          },
        });
    });
  }
}
