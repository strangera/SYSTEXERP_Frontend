import { NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ASS11010Service } from '@service/api/ass/ass11010.service';
import { ASS11020Service } from '@service/api/ass/ass11020.service';
import { ASS11030Service } from '@service/api/ass/ass11030.service';
import { ASS13060Service } from '@service/api/ass/ass13060.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { DialogComponent } from '@shared/components/dialog/dialog.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { TableEditComponent } from '@shared/components/table-edit/table-edit.component';
import { EditColumn } from '@shared/components/table-edit/table-edit.model';
import { validateRequired } from '@shared/components/table-edit/validate-field.model';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { formatDate, ReportColumn } from '@shared/components/table-report/table-report.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { finalize, map } from 'rxjs';
import {
  ASS13060AssetQueryRequest,
  ASS13060AssetQueryRow,
  ASS13060DetailItem,
  QueryDetailASS13060Data,
} from '../ass13060/ass13060.model';

/** 3.1.3.6 固定資產重估作業 CRU */
@Component({
  selector: 'app-ass13060-cru',
  templateUrl: './ass13060-cru.component.html',
  standalone: true,
  imports: [
    NgIf,
    TranslateModule,
    ReactiveFormsModule,
    PanelModule,
    FormsModule,
    ButtonComponent,
    DropdownComponent,
    InputTextComponent,
    CalendarComponent,
    MenubarComponent,
    TableEditComponent,
    ButtonModule,
    DialogComponent,
    TableReportComponent,
  ],
})
export class ASS13060CRUComponent
  extends BasicCruPageComponent<ASS13060DetailItem>
  implements OnInit {
  @ViewChild(TableEditComponent) tableEditComponent!: TableEditComponent;

  public readonly dataForm = this.formBuilder.nonNullable.group({
    ASSET_EVAL_ID: [{ value: '' as string, disabled: true }],
    EMP_ID: [null as string | null, [Validators.required]],
    ORG_ID: [null as string | null, [Validators.required]],
    APPLY_DATE: [null as Date | null, [Validators.required]],
    NOTES: [''],
    EVAL_TYPE: [null as string | null],
  });

  data: ASS13060DetailItem[] = [];
  selectedItems: ASS13060DetailItem[] = [];
  private initialData: ASS13060DetailItem[] = [];

  private initialFormValue: {
    ASSET_EVAL_ID: string;
    EMP_ID: string | null;
    ORG_ID: string | null;
    APPLY_DATE: Date | null;
    NOTES: string;
    EVAL_TYPE: string | null;
  } | null = null;
  empIdOptions: { label: string; value: string }[] = [];
  orgIdOptions: { label: string; value: string }[] = [];
  assetStatusOptions: { label: string; value: string }[] = [];

  public readonly columns: EditColumn[] = [
    { field: 'ASSET_ID', header: '資產編號', type: 'input', disabled: () => true },
    { field: 'QTY', header: '數量', type: 'inputNumber', disabled: () => true },
    { field: 'GOODS_UNIT', header: '單位', type: 'input', disabled: () => true },
    { field: 'GET_COST', header: '取得成本', type: 'inputNumber', disabled: () => true },
    { field: 'EXP_YEAR', header: '折舊年限', type: 'inputNumber', disabled: () => true },
    { field: 'FIR_EXP_YEAR', header: '原折舊年限', type: 'inputNumber', disabled: () => true },
    { field: 'FIR_GET_COST', header: '原取得成本', type: 'inputNumber', disabled: () => true },
    {
      field: 'UPD_GET_COST',
      header: '異動取得成本',
      type: 'inputNumber',
      validate: [validateRequired],
    },
    {
      field: 'UPD_EXP_YEAR',
      header: '異動折舊年限',
      type: 'inputNumber',
      validate: [validateRequired],
    },
    { field: 'TAL_DEPRE_MON', header: '累計已攤月數', type: 'inputNumber', disabled: () => true },
    { field: 'TAL_DEPRE_AMT', header: '累計已攤金額', type: 'inputNumber', disabled: () => true },
    {
      field: 'STYPE_ID',
      header: '折舊科目',
      type: 'dropdown',
      optionsAsync: true,
      options: () => this.dropdownApi.queryGls1005(),
      optionLabel: 'label',
      optionValue: 'value',
      templateLabel: 'label',
      showClear: true,
    },
    {
      field: 'STYPE_ID2',
      header: '累計折舊科目',
      type: 'dropdown',
      optionsAsync: true,
      options: () => this.dropdownApi.queryGls1005(),
      optionLabel: 'label',
      optionValue: 'value',
      templateLabel: 'label',
      showClear: true,
    },
    {
      field: 'USE_ORG_ID',
      header: '使用單位',
      type: 'dropdown',
      optionsAsync: true,
      options: () => this.dropdownApi.querySys3100(),
      optionLabel: 'label',
      optionValue: 'value',
      templateLabel: 'label',
      showClear: true,
    },
    { field: 'NOTES', header: '備註', type: 'input' },
  ];

  dialogVisible = false;
  dialogLoading = false;
  dialogData: ASS13060AssetQueryRow[] = [];
  selectedItemsDialog: ASS13060AssetQueryRow[] = [];
  totalRecords = 0;
  lastQueryBody: ASS13060AssetQueryRequest & { pageSize?: number; pageIndex?: number } = {};
  private allMidClassData: { label: string; value: string; bClassId: string }[] = [];
  private allSmallClassData: { label: string; value: string; mClassId: string }[] = [];

  dialogQueryForm = this.formBuilder.nonNullable.group({
    ASSET_ID: [null as string | null],
    GOODS_NAME: [null as string | null],
    B_CLASS_ID: [null as string | null],
    M_CLASS_ID: [null as string | null],
    S_CLASS_ID: [null as string | null],
    HOLD_EMP_ID: [null as string | null],
    HOLD_ORG_ID: [null as string | null],
    ASSET_STATUS: [null as string | null],
    PageSize: [30],
    PageIndex: [1],
    SortBy: [[{ field: 'ASSET_ID', order: 1 }]],
  });

  dialogColumns: ReportColumn[] = [
    { field: 'ASSET_ID', header: '資產編號' },
    { field: 'AssetName', header: '資產名稱' },
    { field: 'Unit', header: '單位' },
    { field: 'UnitName', header: '單位名稱' },
    { field: 'ASSET_STATUSName', header: '狀態' },
    { field: 'PurchaseAmt', header: '購入金額' },
    { field: 'ChangeAmt', header: '異動金額' },
    { field: 'TotalAmt', header: '合計金額' },
    { field: 'GET_DATE', header: '取得日期', format: formatDate },
    { field: 'FIR_EXP_YEAR', header: '原折舊年限' },
    { field: 'UPD_EXP_YEAR_SUM', header: '異動折舊年限' },
    { field: 'SUM_DEPRE_MONTH', header: '累計已攤月數' },
    { field: 'SUM_DEPRE_AMOUNT', header: '累計已攤金額' },
    { field: 'user_Name', header: '保管人' },
    { field: 'Org_Name', header: '保管單位' },
  ];

  bClassOptions: { label: string; value: string }[] = [];
  mClassOptions: { label: string; value: string }[] = [];
  sClassOptions: { label: string; value: string }[] = [];
  holdEmpIdOptions: { label: string; value: string }[] = [];
  holdOrgIdOptions: { label: string; value: string }[] = [];

  constructor(
    private readonly service: ASS13060Service,
    public readonly dropDownListService: DropDownListService,
    private readonly dropdownApi: DropdownApiService,
    private readonly ass11010Service: ASS11010Service,
    private readonly ass11020Service: ASS11020Service,
    private readonly ass11030Service: ASS11030Service,
    private readonly cdr: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS13060', this.dataForm);
    this.loadDropdownOptions();
    this.setupDialogClassFilterSync();

    if (!this.isFormCreateable && this.rowdata) {
      const row = this.rowdata as unknown as {
        ID?: number;
        ASSET_EVAL_ID?: string;
        EMP_ID?: string;
        ORG_ID?: string;
        APPLY_DATE?: Date | string;
        NOTES?: string;
        EVAL_TYPE?: string;
      };
      const id = row.ID;

      // 若缺少 ID，退回使用列表帶入的基本資料以避免畫面完全空白
      if (id == null) {
        this.dataForm.patchValue({
          ASSET_EVAL_ID: row.ASSET_EVAL_ID ?? '',
          EMP_ID: row.EMP_ID ?? null,
          ORG_ID: row.ORG_ID ?? null,
          APPLY_DATE: row.APPLY_DATE ? (row.APPLY_DATE as Date) : null,
          NOTES: row.NOTES ?? '',
          EVAL_TYPE: row.EVAL_TYPE ?? null,
        });
        if (this.isFormReadable) {
          this.dataForm.disable();
        }
        return;
      }

      this.loading = true;
      this.service
        .queryDetailASS13060({ ID: id })
        .pipe(
          untilDestroyed(this),
          finalize(() => {
            this.loading = false;
          })
        )
        .subscribe({
          next: (res: ApiResponse<QueryDetailASS13060Data>) => {
            const master = res.Data?.Master;
            const details = res.Data?.Details ?? [];

            if (!master) {
              this.messageService.errorBubble(res.Message ?? '無法載入單據明細');
              return;
            }

            const applyDate =
              master.APPLY_DATE != null
                ? new Date(master.APPLY_DATE as string | number | Date)
                : null;

            this.dataForm.patchValue({
              ASSET_EVAL_ID: master.ASSET_EVAL_ID ?? '',
              EMP_ID: master.EMP_ID ?? null,
              ORG_ID: master.ORG_ID ?? null,
              APPLY_DATE: applyDate,
              NOTES: master.NOTES ?? '',
              EVAL_TYPE: master.EVAL_TYPE ?? null,
            });

            this.data = details.map(detail => ({
              ASSET_ID: detail.ASSET_ID,
              QTY: detail.QTY,
              GOODS_UNIT: detail.GOODS_UNIT,
              GET_COST: detail.GET_COST,
              EXP_YEAR: detail.EXP_YEAR,
              UPD_GET_COST: detail.UPD_GET_COST,
              UPD_EXP_YEAR: detail.UPD_EXP_YEAR,
              FIR_GET_COST: detail.FIR_GET_COST,
              FIR_EXP_YEAR: detail.FIR_EXP_YEAR,
              STYPE_ID: detail.STYPE_ID,
              STYPE_ID2: detail.STYPE_ID2,
              USE_ORG_ID: detail.USE_ORG_ID,
              TAL_DEPRE_MON: detail.TAL_DEPRE_MON,
              TAL_DEPRE_AMT: detail.TAL_DEPRE_AMT,
              NOTES: detail.NOTES,
            }));

            // ==========================================
            // 保存頁面第一次載入時的原始資料
            // ==========================================
            this.initialFormValue = {
              ASSET_EVAL_ID: master.ASSET_EVAL_ID ?? '',
              EMP_ID: master.EMP_ID ?? null,
              ORG_ID: master.ORG_ID ?? null,
              APPLY_DATE: applyDate,
              NOTES: master.NOTES ?? '',
              EVAL_TYPE: master.EVAL_TYPE ?? null,
            };

            // Deep copy，避免後續 Table 編輯一起改到原始資料
            this.initialData = this.data.map(item => ({
              ...item,
            }));

            if (this.isFormReadable) {
              this.dataForm.disable();
            }
          },
        });
    }
  }

  private loadDropdownOptions(): void {
    this.dropDownListService.queryTBLUSER_DropDownList().subscribe({
      next: (res) => {
        if (res.Status !== '0000') return;
        const options = res.Data.map((item: { No: string; Name: string }) => ({
          label: `${item.No} - ${item.Name}`,
          value: item.No,
        }));
        this.empIdOptions = options;
        this.holdEmpIdOptions = options;
      },
    });
    this.dropDownListService
      .querySYS1000_DropDownList({ SYS_Type: 'ASSET_STATUS' } as { SYS_Type: string })
      .subscribe({
        next: (res: { Status: string; Data: { No: string; Name: string }[] }) => {
          if (res.Status !== '0000') return;

          this.assetStatusOptions = res.Data.map(
            (item: { No: string; Name: string }) => ({
              label: `${item.No} - ${item.Name}`,
              value: item.No,
            })
          );
        },
      });
    this.dropDownListService.querySYS3100_DropDownList().subscribe({
      next: (res) => {
        if (res.Status !== '0000') return;
        const options = res.Data.map((item: { No: string; Name: string }) => ({
          label: `${item.No} - ${item.Name}`,
          value: item.No,
        }));
        this.orgIdOptions = options;
        this.holdOrgIdOptions = options;
      },
    });

    this.ass11010Service.queryASS11010({}).subscribe({
      next: (res) => {
        if (res.Status !== '0000') return;
        this.bClassOptions = res.Data.map((item: { CLASS_ID?: string; CLASS_NAME?: string }) => ({
          label: `${item.CLASS_ID ?? ''} - ${item.CLASS_NAME ?? ''}`,
          value: item.CLASS_ID ?? '',
        }));
      },
    });

    this.ass11020Service.queryASS11020({}).subscribe({
      next: (res) => {
        if (res.Status !== '0000') return;
        this.allMidClassData = res.Data.map((item: { M_CLASS_ID: string; M_CLASS_NAME: string; B_CLASS_ID: string }) => ({
          label: `${item.M_CLASS_ID} - ${item.M_CLASS_NAME}`,
          value: item.M_CLASS_ID,
          bClassId: item.B_CLASS_ID,
        }));
        this.filterMidClassOptions();
      },
    });

    this.ass11030Service.queryASS11030({}).subscribe({
      next: (res) => {
        if (res.Status !== '0000') return;
        this.allSmallClassData = res.Data.map((item: { S_CLASS_ID: string; S_CLASS_NAME: string; M_CLASS_ID: string }) => ({
          label: `${item.S_CLASS_ID} - ${item.S_CLASS_NAME}`,
          value: item.S_CLASS_ID,
          mClassId: item.M_CLASS_ID,
        }));
        this.filterSmallClassOptions();
      },
    });
  }

  canSave(): boolean {
    if (this.isFormReadable) return false;
    const row = this.rowdata as unknown as { ASSET_EVAL_STATUS?: string } | null;
    const status = row?.ASSET_EVAL_STATUS;
    return status !== '2' && status !== '3';
  }

  openDialog(): void {
    this.dialogVisible = true;
    this.dialogData = [];
    this.selectedItemsDialog = [];
    this.totalRecords = 0;
    this.dialogQueryForm.reset({
      ASSET_ID: null,
      GOODS_NAME: null,
      B_CLASS_ID: null,
      M_CLASS_ID: null,
      S_CLASS_ID: null,
      HOLD_EMP_ID: null,
      HOLD_ORG_ID: null,
      ASSET_STATUS: null,
      PageSize: 30,
      PageIndex: 1,
      SortBy: [{ field: 'ASSET_ID', order: 1 }],
    });
  }

  private loadDialogData(
    query: ASS13060AssetQueryRequest & { pageSize?: number; pageIndex?: number }
  ): void {
    const body: ASS13060AssetQueryRequest = {
      ASSET_ID: query.ASSET_ID || undefined,
      GOODS_NAME: query.GOODS_NAME || undefined,
      B_CLASS_ID: query.B_CLASS_ID || undefined,
      M_CLASS_ID: query.M_CLASS_ID || undefined,
      S_CLASS_ID: query.S_CLASS_ID || undefined,
      HOLD_EMP_ID: query.HOLD_EMP_ID || undefined,
      HOLD_ORG_ID: query.HOLD_ORG_ID || undefined,
      ASSET_STATUS: query.ASSET_STATUS || undefined,
      PageSize: query.PageSize ?? 30,
      PageIndex: query.PageIndex ?? 1,
      SortBy: query.SortBy ?? [{ field: 'ASSET_ID', order: 1 }],
    };

    this.dialogLoading = true;
    this.service
      .queryFAASSETChooseListASS13060(body)
      .pipe(
        untilDestroyed(this),
        finalize(() => (this.dialogLoading = false))
      )
      .subscribe({
        next: (res: ApiResponse<unknown>) => {
          let rows: ASS13060AssetQueryRow[] = [];
          const dataAny = res.Data as any;
          const rowsAny =
            Array.isArray(dataAny) ? dataAny : Array.isArray(dataAny?.QueryData) ? dataAny.QueryData : Array.isArray(dataAny?.Data) ? dataAny.Data : [];

          rows = rowsAny;

          const totalAny =
            typeof (res as any).TotalCount === 'number'
              ? (res as any).TotalCount
              : typeof dataAny?.TotalCount === 'number'
                ? dataAny.TotalCount
                : rows.length;

          this.dialogData = rows;
          this.totalRecords = totalAny ?? rows.length ?? 0;
          this.cdr.detectChanges();
        },
        error: () => {
          this.dialogData = [];
          this.totalRecords = 0;
        },
      });
  }

  assetQueryFunction = (
    body: ASS13060AssetQueryRequest & { pageSize?: number; pageIndex?: number }
  ) => {
    const raw = this.dialogQueryForm.getRawValue();
    const payload: ASS13060AssetQueryRequest = {
      ASSET_ID: raw.ASSET_ID || undefined,
      GOODS_NAME: raw.GOODS_NAME || undefined,
      B_CLASS_ID: raw.B_CLASS_ID || undefined,
      M_CLASS_ID: raw.M_CLASS_ID || undefined,
      S_CLASS_ID: raw.S_CLASS_ID || undefined,
      HOLD_EMP_ID: raw.HOLD_EMP_ID || undefined,
      HOLD_ORG_ID: raw.HOLD_ORG_ID || undefined,
      ASSET_STATUS: raw.ASSET_STATUS || undefined,
      PageSize: body.PageSize ?? body.pageSize ?? 30,
      PageIndex: body.PageIndex ?? body.pageIndex ?? 1,
      SortBy: body.SortBy ?? [{ field: 'ASSET_ID', order: 1 }],
    };
    return this.service.queryFAASSETChooseListASS13060(payload).pipe(
      map((res: ApiResponse<unknown>) => {
        const dataAny = res.Data as any;
        const rows =
          Array.isArray(dataAny) ? dataAny : Array.isArray(dataAny?.QueryData) ? dataAny.QueryData : Array.isArray(dataAny?.Data) ? dataAny.Data : [];

        const total =
          typeof (res as any).TotalCount === 'number'
            ? (res as any).TotalCount
            : typeof dataAny?.TotalCount === 'number'
              ? dataAny.TotalCount
              : rows.length;

        return {
          ...res,
          Data: rows,
          TotalCount: total,
        } as ApiResponse<ASS13060AssetQueryRow[]>;
      })
    );
  };

  onDialogQuery(): void {
    const raw = this.dialogQueryForm.getRawValue();
    this.lastQueryBody = {
      ASSET_ID: raw.ASSET_ID || undefined,
      GOODS_NAME: raw.GOODS_NAME || undefined,
      B_CLASS_ID: raw.B_CLASS_ID || undefined,
      M_CLASS_ID: raw.M_CLASS_ID || undefined,
      S_CLASS_ID: raw.S_CLASS_ID || undefined,
      HOLD_EMP_ID: raw.HOLD_EMP_ID || undefined,
      HOLD_ORG_ID: raw.HOLD_ORG_ID || undefined,
      ASSET_STATUS: raw.ASSET_STATUS || undefined,
      PageSize: 30,
      PageIndex: 1,
      SortBy: [{ field: 'ASSET_ID', order: 1 }],
    };
    this.loadDialogData(this.lastQueryBody);
  }

  saveDialog(): void {
    this.dialogVisible = false;
    const newItems: ASS13060DetailItem[] = this.selectedItemsDialog.map(
      (asset: ASS13060AssetQueryRow) => ({
        ASSET_ID: asset.ASSET_ID,
        QTY: 1,
        GOODS_UNIT: asset.Unit,
        GET_COST: asset.TotalAmt ?? asset.PurchaseAmt,
        EXP_YEAR: asset.FIR_EXP_YEAR,
        FIR_EXP_YEAR: asset.FIR_EXP_YEAR,
        FIR_GET_COST: asset.PurchaseAmt,
        STYPE_ID: asset.STYPE_ID,
        STYPE_ID2: asset.STYPE_ID2,
        USE_ORG_ID: asset.USE_ORG_ID,
        TAL_DEPRE_MON: asset.SUM_DEPRE_MONTH,
        TAL_DEPRE_AMT: asset.SUM_DEPRE_AMOUNT,
        UPD_GET_COST: undefined,
        UPD_EXP_YEAR: undefined,
        NOTES: '',
      })
    );
    this.data = [...this.data, ...newItems];
    this.selectedItemsDialog = [];
    this.cdr.detectChanges();
  }

  onSubmit(): void {
    this.handleSubmit(this.dataForm, () => {
      const valid = this.tableEditComponent?.validateAndShowErrors?.();
      if (valid === false) {
        this.loading = false;
        return;
      }

      const raw = this.dataForm.getRawValue();
      const items = this.data.map(item => ({ ...item }));

      if (this.isFormCreateable) {
        const payload = {
          ASSET_EVAL_ID: raw.ASSET_EVAL_ID || undefined,
          EMP_ID: raw.EMP_ID!,
          ORG_ID: raw.ORG_ID!,
          APPLY_DATE: raw.APPLY_DATE!,
          NOTES: raw.NOTES || undefined,
          EVAL_TYPE: raw.EVAL_TYPE || undefined,
          Items: items,
        };
        this.service
          .insertASS13060(payload)
          .pipe(finalize(() => (this.loading = false)))
          .subscribe({
            next: res => {
              if (res.Status === '0000') {
                this.messageService.successBubble('新增成功');
                this.onCancel();
              } else {
                this.messageService.errorBubble(res.Message ?? '新增失敗');
              }
            },
          });
      } else {
        const row = this.rowdata as unknown as { ASSET_EVAL_ID?: string };
        const payload = {
          ASSET_EVAL_ID: row.ASSET_EVAL_ID ?? '',
          EMP_ID: raw.EMP_ID!,
          ORG_ID: raw.ORG_ID!,
          APPLY_DATE: raw.APPLY_DATE!,
          NOTES: raw.NOTES || undefined,
          EVAL_TYPE: raw.EVAL_TYPE || undefined,
          Items: items,
        };
        this.service
          .updateASS13060(payload)
          .pipe(finalize(() => (this.loading = false)))
          .subscribe({
            next: res => {
              if (res.Status === '0000') {
                this.messageService.successBubble('編輯成功');
                this.onCancel();
              } else {
                this.messageService.errorBubble(res.Message ?? '編輯失敗');
              }
            },
          });
      }
    });
  }
onReset(): void {
  this.submitted = false;
  this.selectedItems = [];

  // ==========================================
  // 新增模式
  // 恢復成「剛進新增頁」的狀態
  // ==========================================
  if (this.isFormCreateable) {
    if (this.initialFormValue) {
      this.dataForm.reset({
        ASSET_EVAL_ID: this.initialFormValue.ASSET_EVAL_ID,
        EMP_ID: this.initialFormValue.EMP_ID,
        ORG_ID: this.initialFormValue.ORG_ID,
        APPLY_DATE: this.initialFormValue.APPLY_DATE,
        NOTES: this.initialFormValue.NOTES,
        EVAL_TYPE: this.initialFormValue.EVAL_TYPE,
      });
    } else {
      this.dataForm.reset();
    }

    this.data = this.initialData.map(item => ({
      ...item,
    }));

    this.cdr.detectChanges();
    return;
  }

  // ==========================================
  // 編輯模式
  // 恢復成 API 第一次載入進來的狀態
  // ==========================================
  if (this.isFormEditable && this.initialFormValue) {
    this.dataForm.reset({
      ASSET_EVAL_ID: this.initialFormValue.ASSET_EVAL_ID,
      EMP_ID: this.initialFormValue.EMP_ID,
      ORG_ID: this.initialFormValue.ORG_ID,
      APPLY_DATE: this.initialFormValue.APPLY_DATE,
      NOTES: this.initialFormValue.NOTES,
      EVAL_TYPE: this.initialFormValue.EVAL_TYPE,
    });

    this.data = this.initialData.map(item => ({
      ...item,
    }));

    this.cdr.detectChanges();
  }
}

  onApprove(): void {
    const row = this.rowdata as unknown as { ID?: number };
    const id = row?.ID;
    if (id == null) {
      this.messageService.warnBubble('無法取得單據 ID');
      return;
    }

    this.messageService.confirm({
      message: '確定要審核確認嗎？',
      header: '審核確認',
      icon: 'pi pi-verified',
      acceptLabel: '確定',
      rejectLabel: '取消',
      accept: () => {
        const aprvEmpId = this.authService.getUserInfo()?.user_No ?? '';
        const aprvDate = new Date().toISOString();
        this.loading = true;
        this.service
          .approveASS13060({ Ids: [id], APRV_EMP_ID: aprvEmpId, APRV_DATE: aprvDate })
          .pipe(finalize(() => (this.loading = false)))
          .subscribe({
            next: res => {
              if (res.Status === '0000') {
                this.messageService.successBubble('審核成功');
                this.onCancel();
              } else {
                this.messageService.errorBubble(res.Message ?? '審核失敗');
              }
            },
          });
      },
    });
  }

  private setupDialogClassFilterSync(): void {
    this.dialogQueryForm.controls.B_CLASS_ID.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        this.filterMidClassOptions();
        this.dialogQueryForm.controls.M_CLASS_ID.setValue(null, { emitEvent: false });
        this.dialogQueryForm.controls.S_CLASS_ID.setValue(null, { emitEvent: false });
        this.sClassOptions = [];
      });

    this.dialogQueryForm.controls.M_CLASS_ID.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        this.filterSmallClassOptions();
        this.dialogQueryForm.controls.S_CLASS_ID.setValue(null, { emitEvent: false });
      });
  }

  private filterMidClassOptions(): void {
    const selectedBClassId = this.dialogQueryForm.controls.B_CLASS_ID.value;
    if (selectedBClassId) {
      this.mClassOptions = this.allMidClassData.filter(
        item => item.bClassId === selectedBClassId
      );
    } else {
      this.mClassOptions = [];
    }
  }

  private filterSmallClassOptions(): void {
    const selectedMClassId = this.dialogQueryForm.controls.M_CLASS_ID.value;
    if (selectedMClassId) {
      this.sClassOptions = this.allSmallClassData.filter(
        item => item.mClassId === selectedMClassId
      );
    } else {
      this.sClassOptions = [];
    }
  }
}
