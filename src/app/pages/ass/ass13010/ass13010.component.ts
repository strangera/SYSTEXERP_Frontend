import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
// Shared
import { Option } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ValidationService } from '@shared/service/validation.service';
//
import { TranslateModule } from '@ngx-translate/core';
import { ASS13010Service } from '@service/api/ass/ass13010.service';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { formatAmount, formatDate, ReportColumn } from '@shared/components/table-report/table-report.model';
import { Actions } from '@shared/service/permission-guard.service';
import { removeEmptyValues } from '@shared/utils/object-utils';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize, Observable } from 'rxjs';
import { getSYS1000Options } from 'src/app/service/system/sys1000.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarRangeComponent } from '../../../shared/components/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputNumberRangeComponent } from '../../../shared/components/input-number-range/input-number-range.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { DeleteASS13010Request, ExportPDFASS13010Request, QueryASS13010Request, QueryASS13010Response } from './ass13010.model';

//3.1.3.1 資產維護作業
@UntilDestroy()
@Component({
  selector: 'app-ass13010',
  templateUrl: './ass13010.component.html',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, ButtonModule, AccordionModule, FormsModule, ReactiveFormsModule, InputTextComponent, DropdownComponent, CalendarRangeComponent, InputNumberRangeComponent, TableReportComponent, TranslateModule]
})
export class ASS13010Component extends BasicQueryPageComponent<QueryASS13010Response> implements OnInit {
  private validationService = inject(ValidationService);
  private dropdownApiService = inject(DropdownApiService);
  //
  queryForm = this.formBuilder.group({
    assetsCode: [], // 資產編號
    itemCode: [], // 品項編號
    original_assetsCode: [, [Validators.maxLength(20)]], // 原資產編號
    assetsStatus: [], // 資產狀態
    assetsType: [], // 資產類型
    purchaseNumber: [], // 採購單號
    //
    purchaseDateFrom: [], // 購入日期
    purchaseDateTo: [], // 購入日期
    original_priceFrom: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 原購入金額
    original_priceTo: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 原購入金額
    supplierCode: [], // 供應商編號
    //
    accounting_Borrow: [], // 所屬會計科目(借)
    accounting_Credit: [], // 所屬會計科目(貸)
    entryDateFrom: [], // 入帳日期
    entryDateTo: [], // 入帳日期
    //
    deviceCode: [, [Validators.maxLength(20)]], // 設備編號
    depreciation: [], // 折舊會計科目
    totalDepreciation: [], // 累計折舊科目
    //
    depreciationLifeFrom: [, [Validators.maxLength(8)]], // 折舊年限
    depreciationLifeTo: [, [Validators.maxLength(8)]], // 折舊年限
    residualFrom: [, [Validators.maxLength(8)]], // 預留殘值
    residualTo: [, [Validators.maxLength(8)]], // 預留殘值
    keepingPerson: [], // 保管人
    keepingUnit: [], // 保管單位
    user: [], // 使用人
    userUnit: [], // 使用單位
    //
    locationCode: [], // 位置代號
    maintenanceCode: [, [Validators.maxLength(11)]], // 維修合約編號
    disposalDateFrom: [], // 處份日期(變賣或報廢)
    disposalDateTo: [], // 處份日期(變賣或報廢)
    rentStatus: [], // 出借狀態
    //
    dispose_Manufacturers: [], // 處份廠商
    dispose_Manufacturers_Summons: [, [Validators.maxLength(12)]], // 處份傳票編號
    soldAmountFrom: [, [Validators.max(999999999999)]], // 變賣金額
    soldAmountTo: [, [Validators.max(999999999999)]], // 變賣金額
    //
    disposeRemark: [], // 處份說明(變賣或報廢)
    purchaseRemark: [], // 採購說明
  });
  public readonly qf = computed(() => this.queryForm.controls);
  // 查詢結果表格（序號、checkbox、管理由 app-table-report 內建）
  tableData = signal<QueryASS13010Response[]>([]);
  totalRecords = signal<number>(0);
  tableLoading = signal<boolean>(false);
  lastQueryBody?: QueryASS13010Request;
  // 勾選匯出 PDF
  selectedItems: QueryASS13010Response[] = [];
  btnPDFLoading = false;
  columns: ReportColumn[] = [
    { field: 'ASSET_ID', header: '資產編號' },
    { field: 'GOODS_ID', header: '品項名稱' },
    { field: 'ASSET_STATUS_NAME', header: '資產狀態' },
    { field: 'DEPRE_YN_NAME', header: '資產類型' },
    { field: 'SUBPOENA_ID', header: '採購單號' },
    { field: 'GET_DATE', header: '購入日期', format: formatDate },
    { field: 'GET_COST', header: '購入金額', format: (v: unknown) => formatAmount(Number(v ?? 0)) },
    { field: 'BILL_DATE', header: '入帳日期', format: formatDate },
    { field: 'DEPRE_ID', header: '攤提代號' },
  ];
  // ----------------------------------------------------------------
  // 下拉選單（品項編號、採購單號來源待確認，先留空）
  assetsCodeOptions: Option[] = []; // queryASS13010AssetIdDropdown（資產編號）
  itemCodeOptions: Option[] = [];
  assetsStatusOptions: Option[] = []; // querySYS1000_DropDownList SYS_Type='ASSET_STATUS'
  assetsTypeOptions = getSYS1000Options('ASSET_TYPE');
  purchaseNumberOptions: Option[] = [];
  supplierCodeOptions: Option[] = []; // queryPOS2013（供應商編號、處分廠商）
  depreciationOptions: Option[] = []; // queryGLS1005_ledgerMD（會計科目借/貸、折舊、累計折舊）
  applicantCodeOptions: Option[] = []; // queryTBLUSER_Orgid（保管人、使用人）
  orgUnitOptions: Option[] = []; // querySYS3100（保管單位、使用單位）
  locationCodeOptions: Option[] = []; // queryPOS2002_DropDownList（位置代號）
  rentStatusOptions: Option[] = [
    { value: '1', label: '使用中' },
    { value: '6', label: '閒置中' }
  ];
  constructor(private readonly ass13010Service: ASS13010Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS13010', 'ass/ass13010cru', this.queryForm, this.onSubmit.bind(this));
    this.loadDropdownOptions();
  }

  onSelectionChange(items: QueryASS13010Response[]): void {
    this.selectedItems = items ?? [];
  }

  /** table-report 傳入的 body 可能為小寫 pageIndex/pageSize（見 normalizeQueryBody） */
  public queryFunction = (
    body: QueryASS13010Request & { pageSize?: number; pageIndex?: number },
  ): Observable<ApiResponse<QueryASS13010Response[]>> => {
    const pageSize = body.pageSize ?? body.PageSize ?? 30;
    const pageIndex = body.pageIndex ?? body.PageIndex ?? 1;
    const raw = this.queryForm.getRawValue();
    const payload: QueryASS13010Request = {
      PageSize: pageSize,
      PageIndex: pageIndex,
      OrderBy: body.OrderBy ?? null,
      Offset: body.Offset ?? null,
      SortBy: body.SortBy ?? null,
      ASSET_ID: raw.assetsCode || null,
      GOODS_ID: raw.itemCode || null,
      ASSET_STATUS: raw.assetsStatus || null,
      DEPRE_YN: raw.assetsType || null,
      ORI_ASSET_ID: raw.original_assetsCode || null,
      SUBPOENA_ID: raw.purchaseNumber || null,
      SUPPLIER_ID: raw.supplierCode || null,
      STYPE_D: raw.accounting_Borrow || null,
      STYPE_C: raw.accounting_Credit || null,
      EQUIP_ID: raw.deviceCode || null,
      STYPE_ID: raw.depreciation || null,
      STYPE_ID2: raw.totalDepreciation || null,
      RESI_VALUE_S: raw.residualFrom != null && raw.residualFrom !== '' ? Number(raw.residualFrom) : null,
      RESI_VALUE_E: raw.residualTo != null && raw.residualTo !== '' ? Number(raw.residualTo) : null,
      GET_DATE_S: raw.purchaseDateFrom || null,
      GET_DATE_E: raw.purchaseDateTo || null,
      GET_COST_S: raw.original_priceFrom ?? null,
      GET_COST_E: raw.original_priceTo ?? null,
      BILL_DATE_S: raw.entryDateFrom || null,
      BILL_DATE_E: raw.entryDateTo || null,
      EXP_YEAR_S: raw.depreciationLifeFrom != null && raw.depreciationLifeFrom !== '' ? Number(raw.depreciationLifeFrom) : null,
      EXP_YEAR_E: raw.depreciationLifeTo != null && raw.depreciationLifeTo !== '' ? Number(raw.depreciationLifeTo) : null,
      HOLD_EMP_ID: raw.keepingPerson || null,
      USE_EMP_ID: raw.user || null,
      HOLD_ORG_ID: raw.keepingUnit || null,
      USE_ORG_ID: raw.userUnit || null,
      LOCATION_ID: raw.locationCode || null,
      FIX_N: raw.maintenanceCode || null,
      HANDLE_DATE_S: raw.disposalDateFrom || null,
      HANDLE_DATE_E: raw.disposalDateTo || null,
      LEND_TYPE: raw.rentStatus || null,
      HANDLE_VENDOR: raw.dispose_Manufacturers || null,
      HANDLE_VID: raw.dispose_Manufacturers_Summons || null,
      ONSALE_AMT_S: raw.soldAmountFrom != null && raw.soldAmountFrom !== '' ? Number(raw.soldAmountFrom) : null,
      ONSALE_AMT_E: raw.soldAmountTo != null && raw.soldAmountTo !== '' ? Number(raw.soldAmountTo) : null,
      // 查詢時 `disposeRemark(處份說明)` 對應後端 `HANDLE_NOTE`
      HANDLE_NOTE: raw.disposeRemark || null,
      PURCHASE_NOTES: raw.purchaseRemark || null,
    };
    const cleanPayload = removeEmptyValues(payload) as QueryASS13010Request;
    return this.ass13010Service.queryASS13010(cleanPayload);
  };

  private loadDropdownOptions(): void {
    this.dropdownApiService.queryASS13010AssetIdDropdown().pipe(untilDestroyed(this)).subscribe(res => {
      this.assetsCodeOptions = res ?? [];
    });
    this.dropdownApiService.queryASS11040_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      this.itemCodeOptions = res ?? [];
    });
    this.dropdownApiService.queryASS13010DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      this.purchaseNumberOptions = res ?? [];
    });
    this.dropdownApiService.querySys1000({ SYS_Type: 'ASSET_STATUS' }).pipe(untilDestroyed(this)).subscribe(res => {
      this.assetsStatusOptions = (res ?? []).map(item => ({ value: item.No, label: item.Name }));
    });
    this.dropdownApiService.queryPos2013({ VEN_Flag: '' }).pipe(untilDestroyed(this)).subscribe(res => {
      this.supplierCodeOptions = res ?? [];
    });
    this.dropdownApiService.queryGls1005_ledgerMD().pipe(untilDestroyed(this)).subscribe(res => {
      this.depreciationOptions = res ?? [];
    });
    this.dropdownApiService.queryTblUserOrgid().pipe(untilDestroyed(this)).subscribe(res => {
      this.applicantCodeOptions = res ?? [];
    });
    this.dropdownApiService.querySys3100().pipe(untilDestroyed(this)).subscribe(res => {
      this.orgUnitOptions = res ?? [];
    });
    this.dropdownApiService.queryPos2002().pipe(untilDestroyed(this)).subscribe(res => {
      this.locationCodeOptions = res ?? [];
    });
  }

  onSubmit(frm: FormGroup): void {
    if (!this.hasPermission(Actions.Query)) return;
    this.handleSubmit(this.queryForm, () => {
      // 查詢結果更新時，清掉舊勾選，避免匯出按鈕狀態錯誤
      this.selectedItems = [];
      const raw = this.queryForm.getRawValue();
      // 供 app-table-report 排序／load more；篩選條件仍以表單 getRawValue() 為準
      this.lastQueryBody = {
        PageSize: 30,
        PageIndex: 1,
        OrderBy: null,
        Offset: null,
        SortBy: null,
      };

      this.tableLoading.set(true);
      this.queryStateService.setQueryState(this.ProgNo, raw);
      this.queryFunction(this.lastQueryBody)
        .pipe(
          finalize(() => {
            this.tableLoading.set(false);
            this.loading = false;
          }),
        )
        .subscribe({
          next: res => {
            if (res.Status !== '0000') return;
            this.tableData.set(res.Data ?? []);
            this.totalRecords.set(res.TotalCount ?? 0);
          },
        });
    });
  }

  onExportPDF(): void {
    const ids = (this.selectedItems ?? [])
      .map(x => x?.ID)
      .filter((id): id is number => id != null)
      .map(id => String(id));

    const idCsv = ids.join(',');
    if (!idCsv) return;

    const payload: ExportPDFASS13010Request = { ID: idCsv };

    this.btnPDFLoading = true;
    this.ass13010Service
      .exportPDFASS13010(payload)
      .pipe(
        finalize(() => (this.btnPDFLoading = false)),
        untilDestroyed(this),
      )
      .subscribe(blob => {
        if (!blob) return;
        const now = new Date();
        const timestamp =
          now.getFullYear().toString() +
          (now.getMonth() + 1).toString().padStart(2, '0') +
          now.getDate().toString().padStart(2, '0') +
          now.getHours().toString().padStart(2, '0') +
          now.getMinutes().toString().padStart(2, '0') +
          now.getSeconds().toString().padStart(2, '0');

        const fileName = `資產資料${timestamp}.pdf`;
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(blobUrl);
      });
  }

  onDelete(selectedItems: QueryASS13010Response[]): void {
    if (!this.hasPermission(Actions.Delete)) return;

    const ids = (selectedItems ?? [])
      .map(x => x?.ID)
      .filter((id): id is number => id != null);

    if (!ids.length) {
      this.messageService.warnBubble('請先勾選要刪除的資料');
      return;
    }

    const payload: DeleteASS13010Request = { IDS: ids };

    this.messageService.confirm({
      header: `是否確認刪除 ${ids.length} 筆資料？`,
      accept: () => {
        this.loading = true;
        this.tableLoading.set(true);

        this.ass13010Service
          .deleteASS13010(payload)
          .pipe(
            finalize(() => {
              this.loading = false;
              this.tableLoading.set(false);
            }),
            untilDestroyed(this),
          )
          .subscribe({
            next: res => {
              if (res?.Status !== '0000') {
                this.messageService.errorBubble(
                  `刪除失敗: ${res?.Message || res?.Error?.Message || '未知錯誤'}`,
                );
                return;
              }

              this.messageService.successBubble('刪除成功');
              this.selectedItems = [];

              if (this.lastQueryBody) {
                this.queryFunction(this.lastQueryBody)
                  .pipe(finalize(() => this.tableLoading.set(false)), untilDestroyed(this))
                  .subscribe({
                    next: result => {
                      if (result?.Status !== '0000') return;
                      this.tableData.set(result.Data ?? []);
                      this.totalRecords.set(result.TotalCount ?? 0);
                    },
                  });
              } else {
                this.onSubmit(this.queryForm);
              }
            },
          });
      },
    });
  }
}
