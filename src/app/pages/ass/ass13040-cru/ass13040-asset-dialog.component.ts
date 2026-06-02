import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ASS13040CRUService } from '@service/api/ass/ass13040-cru.service';
import {
  ASS13040AssetQueryRequest,
  ASS13040AssetQueryRow,
} from '@pages/ass/ass13040-cru/ass13040-cru.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { Option } from '@service/utility/dropdown-api.model';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { finalize, forkJoin } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'app-ass13040-asset-dialog',
  standalone: true,
  imports: [
    DialogComponent,
    TableReportComponent,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    ButtonComponent,
  ],
  templateUrl: './ass13040-asset-dialog.component.html',
})
export class ASS13040AssetDialogComponent implements OnInit {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() assetsSelected = new EventEmitter<ASS13040AssetQueryRow[]>();
  @Input() existingAssetNos: string[] = [];

  queryForm = this.formBuilder.nonNullable.group({
    assetNo: [null as string | null],
    bClassId: [null as string | null],
    mClassId: [null as string | null],
    sClassId: [null as string | null],
    custodianNo: [null as string | null],
    custodyOrgId: [null as string | null],
    itemName: [null as string | null],
  });

  bClassOptions: Option[] = [];
  mClassOptions: Option[] = [];
  sClassOptions: Option[] = [];
  custodianOptions: Option[] = [];
  custodyOrgOptions: Option[] = [];

  data: ASS13040AssetQueryRow[] = [];
  selectedItems: ASS13040AssetQueryRow[] = [];
  totalRecords = 0;
  loading = false;
  lastQueryBody: ASS13040AssetQueryRequest | null = null;

  columns: ReportColumn[] = [
    { field: 'ASSET_ID', header: '資產編號', visible: true },
    { field: 'AssetName', header: '資產名稱', visible: true },
    { field: 'UnitName', header: '單位', visible: true },
    { field: 'ASSET_STATUSName', header: '狀態', visible: true },
    { field: 'PurchaseAmt', header: '購入金額', visible: true },
    { field: 'ChangeAmt', header: '異動金額', visible: true },
    { field: 'TotalAmt', header: '合計金額', visible: true },
  ];

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly ass13040CruService: ASS13040CRUService,
    private readonly dropdownApiService: DropdownApiService,
  ) { }

  ngOnInit(): void {
    this.loadBaseOptions();
    this.setupClassChain();
  }

  queryFunction = (body: unknown): ReturnType<ASS13040CRUService['queryASS13040Assets']> => {
    const raw = this.queryForm.getRawValue();
    const b = body as Record<string, unknown>;
    const payload: ASS13040AssetQueryRequest = {
      ASSET_ID: raw.assetNo ?? undefined,
      GOODS_NAME: raw.itemName ?? undefined,
      B_CLASS_ID: raw.bClassId ?? undefined,
      M_CLASS_ID: raw.mClassId ?? undefined,
      S_CLASS_ID: raw.sClassId ?? undefined,
      HOLD_EMP_ID: raw.custodianNo ?? undefined,
      HOLD_ORG_ID: raw.custodyOrgId ?? undefined,
      PageSize: (b['PageSize'] ?? b['pageSize'] ?? 30) as number,
      PageIndex: (b['PageIndex'] ?? b['pageIndex'] ?? 1) as number,
      SortBy: b['SortBy'] as ASS13040AssetQueryRequest['SortBy'],
    };
    return this.ass13040CruService.queryASS13040Assets(payload);
  };

  onQuery(): void {
    this.loading = true;
    const raw = this.queryForm.getRawValue();
    this.lastQueryBody = {
      ASSET_ID: raw.assetNo ?? undefined,
      GOODS_NAME: raw.itemName ?? undefined,
      B_CLASS_ID: raw.bClassId ?? undefined,
      M_CLASS_ID: raw.mClassId ?? undefined,
      S_CLASS_ID: raw.sClassId ?? undefined,
      HOLD_EMP_ID: raw.custodianNo ?? undefined,
      HOLD_ORG_ID: raw.custodyOrgId ?? undefined,
      PageSize: 30,
      PageIndex: 1,
    };
    this.queryFunction(this.lastQueryBody)
      .pipe(finalize(() => (this.loading = false)), untilDestroyed(this))
      .subscribe({
        next: res => {
          if (res.Status !== '0000') return;
          this.data = res.Data ?? [];
          this.totalRecords = res.TotalCount ?? 0;
          this.selectedItems = [];
        },
      });
  }

  onSave(): void {
    this.assetsSelected.emit(this.selectedItems);
    this.selectedItems = [];
    this.visible = false;
    this.visibleChange.emit(false);
  }

  onVisibleChange(v: boolean): void {
    this.visible = v;
    this.visibleChange.emit(v);
  }

  isRowSelectable = (rowData: ASS13040AssetQueryRow): boolean => {
    const assetNo = rowData.ASSET_ID ?? '';
    return !!assetNo && !this.existingAssetNos.includes(assetNo);
  };

  private loadBaseOptions(): void {
    forkJoin({
      bClass: this.dropdownApiService.queryFaClassM({}),
      users: this.dropdownApiService.queryTblUser(),
      orgs: this.dropdownApiService.querySys3100(),
    })
      .pipe(untilDestroyed(this))
      .subscribe({
        next: ({ bClass, users, orgs }) => {
          this.bClassOptions = bClass ?? [];
          this.custodianOptions = users ?? [];
          this.custodyOrgOptions = orgs ?? [];
        },
      });
  }

  private setupClassChain(): void {
    this.queryForm.controls.bClassId.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe((value: string | null) => {
        this.mClassOptions = [];
        this.sClassOptions = [];
        this.queryForm.controls.mClassId.setValue(null);
        this.queryForm.controls.sClassId.setValue(null);
        if (!value) return;
        this.dropdownApiService
          .queryFaClass1({ CLASS_ID: value })
          .pipe(untilDestroyed(this))
          .subscribe(opts => {
            this.mClassOptions = opts ?? [];
          });
      });

    this.queryForm.controls.mClassId.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe((value: string | null) => {
        this.sClassOptions = [];
        this.queryForm.controls.sClassId.setValue(null);
        if (!value) return;
        const bVal = this.queryForm.controls.bClassId.value ?? undefined;
        this.dropdownApiService
          .queryFaClass2({ B_CLASS_ID: bVal, CLASS_ID: value })
          .pipe(untilDestroyed(this))
          .subscribe(opts => {
            this.sClassOptions = opts ?? [];
          });
      });
  }
}
