import { NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ASS11010Service } from '@service/api/ass/ass11010.service';
import { ASS11020Service } from '@service/api/ass/ass11020.service';
import { ASS11030Service } from '@service/api/ass/ass11030.service';
import { ASS13060Service } from '@service/api/ass/ass13060.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { validateRequired } from '@shared/componentkit/table-edit/validate-field.model';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { formatDate, ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import {
  ASS13060AssetQueryRequest,
  ASS13060AssetQueryRow,
  ASS13060DetailItem,
} from '../ass13060/ass13060.model';

/** 3.1.3.6 固定資產重估作業 CRU */
@Component({
  selector: 'app-ass13060-cru',
  templateUrl: './ass13060-cru.component.html',
  styleUrl: './ass13060-cru.component.scss',
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
    RevaluationNo: [{ value: '' as string, disabled: true }, [Validators.required]],
    UserCode: [null as string | null, [Validators.required]],
    OrganizationNumber: [null as string | null, [Validators.required]],
    ApplicationDate: [null as Date | null, [Validators.required]],
    Remark: [''],
  });

  data: ASS13060DetailItem[] = [];
  selectedItems: ASS13060DetailItem[] = [];

  userCodeOptions: { label: string; value: string }[] = [];
  organizationNumberOptions: { label: string; value: string }[] = [];

  public readonly columns: EditColumn[] = [
    {
      field: 'GoodsId',
      header: '商品編號/名稱',
      type: 'input',
      disabled: () => true,
      format: (_v, _i, row) =>
        row ? `${(row as ASS13060DetailItem).GoodsId ?? ''} - ${(row as ASS13060DetailItem).GoodsName ?? ''}` : '',
    },
    { field: 'Unit', header: '商品單位', type: 'input', disabled: () => true },
    { field: 'Quantity', header: '數量', type: 'inputNumber', disabled: () => true },
    { field: 'DepreciationLife', header: '折舊年限', type: 'inputNumber', disabled: () => true },
    {
      field: 'AlteredDepreciationLife',
      header: '已異動折舊年限',
      type: 'inputNumber',
      disabled: () => true,
    },
    {
      field: 'AlteredLife',
      header: '異動年限',
      type: 'inputNumber',
      validate: [validateRequired],
    },
    { field: 'ReceivePrice', header: '取得價格', type: 'inputNumber', disabled: () => true },
    { field: 'AlteredPrice', header: '已異動價格', type: 'inputNumber', disabled: () => true },
    {
      field: 'TotalSharedPrice',
      header: '累計已攤提金額',
      type: 'inputNumber',
      disabled: () => true,
    },
    {
      field: 'TotalSharedMonth',
      header: '累計已攤提月數',
      type: 'inputNumber',
      disabled: () => true,
    },
    {
      field: 'AlteredBuyPrice',
      header: '異動購入金額',
      type: 'inputNumber',
      validate: [validateRequired],
    },
    { field: 'Depreciation', header: '折舊科目', type: 'input', disabled: () => true },
    {
      field: 'TotalDepreciation',
      header: '累計折舊科目',
      type: 'input',
      disabled: () => true,
    },
    { field: 'UsageUnit', header: '使用單位', type: 'input', disabled: () => true },
    {
      field: 'SingleRemark',
      header: '單項報廢說明',
      type: 'input',
      validate: [validateRequired],
    },
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
    AssetNo: [null as string | null],
    BClassId: [null as string | null],
    MClassId: [null as string | null],
    SClassId: [null as string | null],
    CustodianCode: [null as string | null],
    CustodyUnitCode: [null as string | null],
    ItemName: [null as string | null],
    pageSize: [30],
    pageIndex: [1],
    SortBy: [[{ field: 'AssetNo', order: 1 }]],
  });

  dialogColumns: ReportColumn[] = [
    { field: 'AssetNo', header: '資產編號' },
    { field: 'AssetName', header: '資產名稱' },
    { field: 'Unit', header: '單位' },
    { field: 'Status', header: '狀態' },
    { field: 'PurchaseAmount', header: '購入金額' },
    { field: 'AlteredAmount', header: '異動金額' },
    { field: 'TotalAmount', header: '合計金額' },
    { field: 'PurchaseDate', header: '購入日期', format: formatDate },
    { field: 'OriginalDepreciationLife', header: '原折舊年限' },
    { field: 'AlteredDepreciationLife', header: '異動折舊年限' },
    { field: 'TotalSharedPrice', header: '累計已攤提金額' },
    { field: 'TotalSharedMonth', header: '累計已攤提月數' },
    { field: 'Depreciation', header: '折舊會科' },
    { field: 'TotalDepreciation', header: '累計折舊會科' },
    { field: 'UsageUnit', header: '使用單位' },
  ];

  bClassOptions: { label: string; value: string }[] = [];
  mClassOptions: { label: string; value: string }[] = [];
  sClassOptions: { label: string; value: string }[] = [];
  custodianOptions: { label: string; value: string }[] = [];
  custodyUnitOptions: { label: string; value: string }[] = [];

  constructor(
    private readonly service: ASS13060Service,
    public readonly dropDownListService: DropDownListService,
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
      const row = this.rowdata as unknown as { Details?: ASS13060DetailItem[]; RevaluationNo?: string };
      this.data = row.Details ?? [];
      this.dataForm.patchValue({
        RevaluationNo: row.RevaluationNo ?? '',
      });
      if (this.isFormReadable) {
        this.dataForm.disable();
      }
    }
  }

  private loadDropdownOptions(): void {
    this.dropDownListService.queryTBLUSER_DropDownList().subscribe({
      next: (res) => {
        if (res.Status !== '0000') return;
        const options = res.Data.map((item) => ({
          label: `${item.No} - ${item.Name}`,
          value: item.No,
        }));
        this.userCodeOptions = options;
        this.custodianOptions = options;
      },
    });

    this.dropDownListService.querySYS3100_DropDownList().subscribe({
      next: (res) => {
        if (res.Status !== '0000') return;
        const options = res.Data.map((item) => ({
          label: `${item.No} - ${item.Name}`,
          value: item.No,
        }));
        this.organizationNumberOptions = options;
        this.custodyUnitOptions = options;
      },
    });

    this.ass11010Service.queryASS11010({}).subscribe({
      next: (res) => {
        if (res.Status !== '0000') return;
        this.bClassOptions = res.Data.map((item) => ({
          label: `${item.CLASS_ID} - ${item.CLASS_NAME}`,
          value: item.CLASS_ID,
        }));
      },
    });

    this.ass11020Service.queryASS11020({}).subscribe({
      next: (res) => {
        if (res.Status !== '0000') return;
        this.allMidClassData = res.Data.map((item) => ({
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
        this.allSmallClassData = res.Data.map((item) => ({
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
    const row = this.rowdata as unknown as { StatusCode?: string; Status?: string } | null;
    const status = row?.StatusCode ?? row?.Status;
    return status !== '2' && status !== '3';
  }

  openDialog(): void {
    this.dialogVisible = true;
    this.dialogData = [];
    this.selectedItemsDialog = [];
    this.totalRecords = 0;
    this.dialogQueryForm.reset({
      AssetNo: null,
      BClassId: null,
      MClassId: null,
      SClassId: null,
      CustodianCode: null,
      CustodyUnitCode: null,
      ItemName: null,
      pageSize: 30,
      pageIndex: 1,
      SortBy: [{ field: 'AssetNo', order: 1 }],
    });
  }

  private loadDialogData(query: ASS13060AssetQueryRequest & { pageSize?: number; pageIndex?: number }): void {
    const body: ASS13060AssetQueryRequest = {
      AssetNo: query.AssetNo || undefined,
      BClassId: query.BClassId || undefined,
      MClassId: query.MClassId || undefined,
      SClassId: query.SClassId || undefined,
      CustodianCode: query.CustodianCode || undefined,
      CustodyUnitCode: query.CustodyUnitCode || undefined,
      ItemName: query.ItemName || undefined,
      PageSize: query.PageSize ?? 30,
      PageIndex: query.PageIndex ?? 1,
      SortBy: query.SortBy ?? [{ field: 'AssetNo', order: 1 }],
    };

    this.dialogLoading = true;
    this.service
      .queryASS13060Asset(body)
      .pipe(
        untilDestroyed(this),
        finalize(() => (this.dialogLoading = false))
      )
      .subscribe({
        next: (res: ApiResponse<ASS13060AssetQueryRow[]>) => {
          this.dialogData = res.Data ?? [];
          this.totalRecords = res.TotalCount ?? 0;
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
      AssetNo: raw.AssetNo || undefined,
      BClassId: raw.BClassId || undefined,
      MClassId: raw.MClassId || undefined,
      SClassId: raw.SClassId || undefined,
      CustodianCode: raw.CustodianCode || undefined,
      CustodyUnitCode: raw.CustodyUnitCode || undefined,
      ItemName: raw.ItemName || undefined,
      PageSize: body.PageSize ?? body.pageSize ?? 30,
      PageIndex: body.PageIndex ?? body.pageIndex ?? 1,
      SortBy: body.SortBy ?? [{ field: 'AssetNo', order: 1 }],
    };
    return this.service.queryASS13060Asset(payload);
  };

  onDialogQuery(): void {
    const raw = this.dialogQueryForm.getRawValue();
    this.lastQueryBody = {
      AssetNo: raw.AssetNo || undefined,
      BClassId: raw.BClassId || undefined,
      MClassId: raw.MClassId || undefined,
      SClassId: raw.SClassId || undefined,
      CustodianCode: raw.CustodianCode || undefined,
      CustodyUnitCode: raw.CustodyUnitCode || undefined,
      ItemName: raw.ItemName || undefined,
      PageSize: 30,
      PageIndex: 1,
      SortBy: [{ field: 'AssetNo', order: 1 }],
    };
    this.loadDialogData(this.lastQueryBody);
  }

  saveDialog(): void {
    this.dialogVisible = false;
    const newItems: ASS13060DetailItem[] = this.selectedItemsDialog.map((asset) => ({
      GoodsId: asset.AssetNo,
      GoodsName: asset.AssetName,
      Unit: asset.Unit,
      Quantity: 1,
      DepreciationLife: asset.OriginalDepreciationLife,
      AlteredDepreciationLife: asset.AlteredDepreciationLife,
      AlteredLife: undefined,
      ReceivePrice: asset.PurchaseAmount,
      AlteredPrice: asset.AlteredAmount,
      TotalSharedPrice: asset.TotalSharedPrice,
      TotalSharedMonth: asset.TotalSharedMonth,
      AlteredBuyPrice: undefined,
      Depreciation: asset.Depreciation,
      TotalDepreciation: asset.TotalDepreciation,
      UsageUnit: asset.UsageUnit,
      SingleRemark: '',
    }));
    this.data = [...this.data, ...newItems];
    this.selectedItemsDialog = [];
    this.cdr.detectChanges();
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(this.dataForm, () => {
      const valid = this.tableEditComponent?.validateAndShowErrors?.();
      if (valid === false) {
        this.loading = false;
        return;
      }

      const raw = this.dataForm.getRawValue();
      const payload = {
        UserCode: raw.UserCode,
        OrganizationNumber: raw.OrganizationNumber,
        ApplicationDate: raw.ApplicationDate,
        Remark: raw.Remark,
        Details: this.data,
      };

      if (this.isFormCreateable) {
        this.service
          .insertASS13060(payload as Parameters<ASS13060Service['insertASS13060']>[0])
          .pipe(finalize(() => (this.loading = false)))
          .subscribe({
            next: (res) => {
              if (res.Status === '0000') {
                this.messageService.successBubble('新增成功');
                this.onCancel();
              } else {
                this.messageService.errorBubble(res.Message || '新增失敗');
              }
            },
            error: (err) => {
              this.messageService.errorBubble('新增失敗：' + (err?.message ?? '請重試'));
            },
          });
      } else {
        const row = this.rowdata as unknown as { RevaluationNo?: string };
        this.service
          .updateASS13060({
            RevaluationNo: row.RevaluationNo ?? '',
            ...payload,
          } as Parameters<ASS13060Service['updateASS13060']>[0])
          .pipe(finalize(() => (this.loading = false)))
          .subscribe({
            next: (res) => {
              if (res.Status === '0000') {
                this.messageService.successBubble('編輯成功');
                this.onCancel();
              } else {
                this.messageService.errorBubble(res.Message || '編輯失敗');
              }
            },
            error: (err) => {
              this.messageService.errorBubble('編輯失敗：' + (err?.message ?? '請重試'));
            },
          });
      }
    });
  }

  onReset(): void {
    this.submitted = false;
    this.selectedItems = [];

    if (this.isFormCreateable) {
      this.dataForm.reset();
      this.data = [];
    } else if (this.isFormEditable && this.rowdata) {
      const row = this.rowdata as unknown as {
        Details?: ASS13060DetailItem[];
        RevaluationNo?: string;
      };
      this.dataForm.reset();
      this.dataForm.patchValue(this.rowdata as any);
      this.dataForm.patchValue({ RevaluationNo: row.RevaluationNo ?? '' });
      this.data = row.Details ? [...row.Details] : [];
    }
  }

  onApprove(): void {
    // TODO: 審核確認
    this.messageService.confirm({
      message: '確定要審核確認嗎？',
      header: '審核確認',
      icon: 'pi pi-verified',
      acceptLabel: '確定',
      rejectLabel: '取消',
    });
  }

  private setupDialogClassFilterSync(): void {
    this.dialogQueryForm.controls.BClassId.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        this.filterMidClassOptions();
        this.dialogQueryForm.controls.MClassId.setValue(null, { emitEvent: false });
        this.dialogQueryForm.controls.SClassId.setValue(null, { emitEvent: false });
        this.sClassOptions = [];
      });

    this.dialogQueryForm.controls.MClassId.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        this.filterSmallClassOptions();
        this.dialogQueryForm.controls.SClassId.setValue(null, { emitEvent: false });
      });
  }

  private filterMidClassOptions(): void {
    const selectedBClassId = this.dialogQueryForm.controls.BClassId.value;
    if (selectedBClassId) {
      this.mClassOptions = this.allMidClassData.filter(item => item.bClassId === selectedBClassId);
    } else {
      this.mClassOptions = [];
    }
  }

  private filterSmallClassOptions(): void {
    const selectedMClassId = this.dialogQueryForm.controls.MClassId.value;
    if (selectedMClassId) {
      this.sClassOptions = this.allSmallClassData.filter(item => item.mClassId === selectedMClassId);
    } else {
      this.sClassOptions = [];
    }
  }
}
