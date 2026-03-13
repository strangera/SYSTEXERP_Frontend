import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import {
  ASS12050Detail,
  ASS12050DetailItem,
  ASS12050InsertRequest,
  ASS12050TransferRow,
} from '@pages/ass/ass12050/ass12050.model';
import { ASS11100Service } from '@service/api/ass/ass11100.service';
import { ASS12050Service } from '@service/api/ass/ass12050.service';
import { Fin11040Service, TDS1008Data } from '@service/api/fin/fin11040.service';
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
import { concat, finalize, last, tap } from 'rxjs';

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
    EMP_ID: [null as string | null, [Validators.required]],
    ORG_ID: [null as string | null, [Validators.required]],
    APPLY_DATE: [null as Date | null, [Validators.required]],
    SUPPLIER_ID: [null as string | null, [Validators.required]],
    NTAX_AMT: [null as number | null],
    TAX_AMT: [null as number | null],
    AMT: [null as number | null],
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
      type: 'input',
      disabled: () => !this.isFormCreateable,
    },
    {
      field: 'APPLY_QTY',
      header: '申請數量',
      type: 'inputNumber',
      disabled: () => !this.isFormCreateable,
    },
    {
      field: 'SHIP_QTY',
      header: '出貨數量',
      type: 'inputNumber',
      disabled: () => !this.isFormCreateable,
    },
    {
      field: 'CHECK_QTY',
      header: '驗收數量',
      type: 'inputNumber',
      placeholder: '輸入數字',
      disabled: () => false,
    },
    {
      field: 'GOODS_PRICE',
      header: '單價(未稅)',
      type: 'inputNumber',
      disabled: () => !this.isFormCreateable,
    },
    {
      field: 'DIS_PRICE',
      header: '折讓單價',
      type: 'inputNumber',
      placeholder: '輸入數字',
      disabled: () => false,
    },
    {
      field: 'SITE_ID',
      header: '分店',
      type: 'input',
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
      field: 'NOTES',
      header: '說明',
      type: 'input',
      disabled: () => false,
    },
  ];

  /** 選擇採購單 Dialog */
  displayTransferDialog = false;
  transferData: ASS12050TransferRow[] = [];
  selectedTransferRow: ASS12050TransferRow | null = null;
  transferListLoading = false;
  transferColumns: Column[] = [
    { field: 'SUBPOENA_ID', header: '採購單號' },
    { field: 'EMP_NAME', header: '申請人' },
    { field: 'ORG_NAME', header: '部門' },
    { field: 'APPLY_DATE', header: '申請日期', format: formatDate },
    { field: 'SUPPLIER_NAME', header: '供應商' },
    { field: 'NTAX_AMT', header: '未稅金額' },
    { field: 'TAX_AMT', header: '稅額' },
    { field: 'AMT', header: '含稅總金額' },
    { field: 'APPLY_QTY', header: '申請數量' },
    { field: 'CHECKED_QTY', header: '已驗數量' },
    { field: 'REMAIN_QTY', header: '剩餘數量' },
  ];

  /** 編輯時保留的驗收單號 */
  private subcheckId: string | null = null;

  /** 來源採購單號（轉入時取得） */
  private sourceSubpoenaId: string | null = null;

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

    const navState = this.router.lastSuccessfulNavigation?.extras?.state;
    if (navState?.['subpoenaId']) {
      this.sourceSubpoenaId = navState['subpoenaId'] as string;
    }

    const rowSubcheckId = (this.rowdata as Record<string, unknown> | null)?.['SUBCHECK_ID'] as string | undefined;
    if (!this.isFormCreateable && rowSubcheckId) {
      this.subcheckId = rowSubcheckId;
      this.loading = true;
      this.ass12050Service
        .getDetailASS12050({ SUBCHECK_ID: rowSubcheckId })
        .pipe(finalize(() => (this.loading = false)), untilDestroyed(this))
        .subscribe({
          next: res => {
            if (res.Status !== '0000') return;
            const d = res.Data;
            this.subcheckId = d?.SUBCHECK_ID ?? rowSubcheckId;
            this.dataForm.patchValue({
              SUBCHECK_ID: d?.SUBCHECK_ID ?? null,
              EMP_ID: d?.EMP_ID ?? null,
              ORG_ID: d?.ORG_ID ?? null,
              APPLY_DATE: d?.APPLY_DATE ? new Date(d.APPLY_DATE) : null,
              SUPPLIER_ID: d?.SUPPLIER_ID ?? null,
              NTAX_AMT: d?.NTAX_AMT ?? null,
              TAX_AMT: d?.TAX_AMT ?? null,
              AMT: d?.AMT ?? null,
            });
            const details = (d?.Details ?? []).map(item => ({ ...item }));
            this.data = details;
            this.originalData = details.map(item => ({ ...item }));
          },
        });
    }
  }

  /** 覆寫：從編輯主檔進入時，返回編輯主檔而非查詢頁 */
  override onCancel(returnValue?: unknown): void {
    if (this.previousRoute?.includes('ass12050master') && this.sourceSubpoenaId) {
      this.router.navigate(['account/ass/ass12050master'], {
        state: {
          rowdata: { SUBPOENA_ID: this.sourceSubpoenaId },
          fromRoute: this.router.url,
          data: returnValue,
        },
      });
      return;
    }
    super.onCancel(returnValue);
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
  }

  /** 開啟轉入採購單 Dialog */
  openTransferDialog(): void {
    this.transferListLoading = true;
    this.selectedTransferRow = null;
    this.ass12050Service
      .listForTransferASS12050()
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

    this.transferListLoading = true;
    this.ass12050Service
      .transferASS12050({ SUBPOENA_ID: row.SUBPOENA_ID })
      .pipe(finalize(() => (this.transferListLoading = false)), untilDestroyed(this))
      .subscribe({
        next: res => {
          if (res.Status !== '0000') {
            this.messageService.errorBubble('轉入失敗：' + (res.Message ?? ''));
            this.displayTransferDialog = false;
            return;
          }
          this.sourceSubpoenaId = row.SUBPOENA_ID!;
          this.dataForm.patchValue({
            EMP_ID: row.EMP_ID ?? this.dataForm.get('EMP_ID')?.value ?? null,
            SUPPLIER_ID: row.SUPPLIER_ID ?? this.dataForm.get('SUPPLIER_ID')?.value ?? null,
            NTAX_AMT: row.NTAX_AMT ?? null,
            TAX_AMT: row.TAX_AMT ?? null,
            AMT: row.AMT ?? null,
          });
          this.displayTransferDialog = false;
          this.messageService.successBubble('轉入成功');
        },
      });
  }

  /** 驗收確認（明細級） */
  onConfirm(): void {
    const subcheckId = this.subcheckId ?? this.dataForm.get('SUBCHECK_ID')?.value;
    if (!subcheckId) {
      this.messageService.errorBubble('無可驗收的資料');
      return;
    }
    this.messageService.confirm({
      header: '驗收確認',
      message: '是否確認執行驗收確認？',
      accept: () => {
        this.loading = true;
        this.ass12050Service
          .confirmASS12050({ DETAIL_ID: subcheckId })
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

  /** 強制結案（單據級） */
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
          .forceCloseASS12050({ DETAIL_ID: subcheckId })
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

  /** 作廢（單據級） */
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
          .voidASS12050({ DETAIL_ID: subcheckId })
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
      SHIP_QTY: null,
      CHECK_QTY: null,
      GOODS_PRICE: null,
      DIS_PRICE: null,
      SITE_ID: null,
      WH_ID: null,
      NOTES: null,
    };
    this.data = [...this.data, newItem];
  }

  onSubmit(): void {
    this.handleSubmit(this.dataForm, () => {
      const valid = this.tableEditComponent?.validateAndShowErrors();
      if (valid === false) return;
      const raw = this.dataForm.getRawValue();
      const applyDate = raw.APPLY_DATE instanceof Date
        ? raw.APPLY_DATE.toISOString().slice(0, 10)
        : String(raw.APPLY_DATE ?? '');

      this.loading = true;

      if (this.crudstatus === CRUDStatus.Create) {
        const details = this.data as Record<string, unknown>[];
        if (details.length === 0) {
          this.messageService.warnBubble('請至少新增一筆明細');
          this.loading = false;
          return;
        }

        let subpoenaId = this.sourceSubpoenaId;
        const insertCalls = details.map((row, idx) => {
          const payload: ASS12050InsertRequest = {
            EMP_ID: raw.EMP_ID ?? undefined,
            M_ORG_ID: raw.ORG_ID ?? undefined,
            SUPPLIER_ID: raw.SUPPLIER_ID ?? undefined,
            APPLY_DATE: applyDate || undefined,
            SUBPOENA_ID: subpoenaId ?? undefined,
            M_NTAX_AMT: raw.NTAX_AMT ?? undefined,
            M_TAX_AMT: raw.TAX_AMT ?? undefined,
            M_AMT: raw.AMT ?? undefined,
            GOODS_ID: (row['GOODS_ID'] as string) || undefined,
            GOODS_UNIT: (row['GOODS_UNIT'] as string) || undefined,
            QTY: (row['APPLY_QTY'] as number | undefined) ?? undefined,
            SHIP_QTY: (row['SHIP_QTY'] as number | undefined) ?? undefined,
            CHECK_QTY: (row['CHECK_QTY'] as number | undefined) ?? undefined,
            GOODS_PRICE: (row['GOODS_PRICE'] as number | undefined) ?? undefined,
            DIS_PRICE: (row['DIS_PRICE'] as number | undefined) ?? undefined,
            SITE_ID: (row['SITE_ID'] as string) || undefined,
            WH_ID: (row['WH_ID'] as string) || undefined,
            NOTES: (row['NOTES'] as string) || undefined,
          };
          return this.ass12050Service.insertASS12050(payload).pipe(
            tap(res => {
              if (res.Status === '0000' && idx === 0 && res.Data?.O_SUBPOENA_ID) {
                subpoenaId = res.Data.O_SUBPOENA_ID;
              }
            }),
          );
        });

        concat(...insertCalls)
          .pipe(last(), finalize(() => (this.loading = false)), untilDestroyed(this))
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
        this.messageService.warnBubble('編輯功能需要 DETAIL_ID，待後端提供明細識別欄位後實作');
        this.loading = false;
      }
    });
  }
}
