import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ASS11040Service } from '@service/api/ass/ass11040.service';
import {
  QueryASS11040DataWrapper,
  QueryASS11040Request,
  QueryASS11040Response,
} from '@pages/ass/ass11040/ass11040.model';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { removeEmptyValues } from '@shared/utils/object-utils';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
//3.1.1.4 品項資料維護作業
@UntilDestroy()
@Component({
  selector: 'app-ass11040',
  templateUrl: './ass11040.component.html',
  standalone: true,
  imports: [InputTextareaComponent, TableReportComponent, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputTextComponent, DropdownComponent, TranslateModule]
})
export class ASS11040Component extends BasicQueryPageComponent<QueryASS11040Response> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    itemCode: [null, [Validators.maxLength(13)]], // 品項代碼
    itemName: [null, [Validators.maxLength(64)]], // 品項名稱
    bigCategoryCode: [null as string | null], // 大分類代碼
    midCategoryCode: [null as string | null], // 中分類代碼
    smlCategoryCode: [null as string | null], // 小分類代碼
    itemCategory: [null], // 品項類別區分
    itemUnit: [null], // 基本單位
    packageUnit: [null], // 包裝單位
    warrantyMethod: [null], // 保固方式
    maintenanceMethod: [null], // 保養方式
    illustrate: [null, [Validators.maxLength(160)]], // 說明
  });

  itemCategoryOptions = getSYS1000Options('PROD_TYPE');
  itemUnitOptions = getSYS1000Options('UNIT');
  packageUnitOptions = getSYS1000Options('PACK_UNIT');
  bigCategoryCodeOptions: { value: string; label: string }[] = [];
  midCategoryCodeOptions: { value: string; label: string }[] = [];
  smlCategoryCodeOptions: { value: string; label: string }[] = [];

  warrantyMethodOptions: { value: string; label: string }[] = [
    { value: '0', label: '廠商' },
    { value: '1', label: '公司' },
  ];
  maintenanceMethodOptions: { value: string; label: string }[] = [
    { value: '0', label: '廠商' },
    { value: '1', label: '公司' },
  ];

  public readonly tableData = signal<QueryASS11040Response[]>([]);
  public readonly totalRecords = signal<number>(0);
  public readonly tableLoading = signal<boolean>(false);
  public lastQueryBody?: QueryASS11040Request;
  selectedRows: QueryASS11040Response[] = [];

  @ViewChild(TableReportComponent) tableReport!: TableReportComponent;

  columns: ReportColumn[] = [
    { field: 'GOODS_ID', header: '品項代碼', visible: true },
    { field: 'GOODS_NAME', header: '品項名稱', visible: true },
    { field: 'B_CLASS_ID', header: '大分類代碼', visible: true },
    { field: 'B_CLASS_NAME', header: '大分類名稱', visible: true },
    { field: 'M_CLASS_ID', header: '中分類代碼', visible: true },
    { field: 'M_CLASS_NAME', header: '中分類名稱', visible: true },
    { field: 'S_CLASS_ID', header: '小分類代碼', visible: true },
    { field: 'S_CLASS_NAME', header: '小分類名稱', visible: true },
    { field: 'MATERIAL_TYPE', header: '品項類別區分', visible: true },
  ];
  // ----------------------------------------------------------------

  constructor(public readonly ass11040Service: ASS11040Service) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('ASS11040', 'ass/ass11040cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadBigCategoryOptions();
    this.loadMidCategoryOptions('');
    this.loadSmlCategoryOptions('');
    // this.setupCategoryListeners(); 大中小分類欄位連動監聽
  }

  /** 載入大分類選項 */
  loadBigCategoryOptions(): void {
    this.ass11040Service.queryFACLASSM_DropDownList({}).pipe(untilDestroyed(this)).subscribe(res => {
      if (res.Status !== '0000') return;
      const data = res.Data?.Data ?? [];
      this.bigCategoryCodeOptions = data.map(item => ({
        value: item.CLASS_ID ?? '',
        label: `${item.CLASS_ID}-${item.CLASS_NAME}`
      }));
    });
  }

  /** 設定分類連動監聽 */
  // setupCategoryListeners(): void {
  //   // 監聽大分類變更 -> 載入中分類
  //   this.queryForm.controls.bigCategoryCode.valueChanges.pipe(untilDestroyed(this)).subscribe(bigCode => {
  //     // 清空中分類和小分類
  //     this.queryForm.controls.midCategoryCode.setValue(null);
  //     this.queryForm.controls.smlCategoryCode.setValue(null);
  //     this.midCategoryCodeOptions = [];
  //     this.smlCategoryCodeOptions = [];

  //     if (bigCode) {
  //       this.loadMidCategoryOptions(bigCode);
  //     }
  //   });

  //   // 監聽中分類變更 -> 載入小分類
  //   this.queryForm.controls.midCategoryCode.valueChanges.pipe(untilDestroyed(this)).subscribe(midCode => {
  //     // 清空小分類
  //     this.queryForm.controls.smlCategoryCode.setValue(null);
  //     this.smlCategoryCodeOptions = [];

  //     if (midCode) {
  //       this.loadSmlCategoryOptions(midCode);
  //     }
  //   });
  // }

  /** 載入中分類選項 */
  loadMidCategoryOptions(bigCategoryCode: string): void {
    this.ass11040Service.queryFACLASS1_DropDownList({ B_CLASS_ID: bigCategoryCode }).pipe(untilDestroyed(this)).subscribe(res => {
      if (res.Status !== '0000') return;
      const data = res.Data?.Data ?? [];
      this.midCategoryCodeOptions = data.map(item => ({
        value: item.M_CLASS_ID ?? '',
        label: `${item.M_CLASS_ID}-${item.M_CLASS_NAME}`
      }));
    });
  }

  /** 載入小分類選項 */
  loadSmlCategoryOptions(midCategoryCode: string): void {
    this.ass11040Service.queryFACLASS2_DropDownList({ M_CLASS_ID: midCategoryCode }).pipe(untilDestroyed(this)).subscribe(res => {
      if (res.Status !== '0000') return;
      const data = res.Data?.Data ?? [];
      this.smlCategoryCodeOptions = data.map(item => ({
        value: item.S_CLASS_ID ?? '',
        label: `${item.S_CLASS_ID}-${item.S_CLASS_NAME}`
      }));
    });
  }

  /**
   * 查詢函數（供 table-report 分頁查詢使用）
   */
  public queryFunction = (body: QueryASS11040Request): Observable<ApiResponse<QueryASS11040Response[]>> => {
    const rawFormValue = this.queryForm.getRawValue();
    const pageSize = (body as QueryASS11040Request & { pageSize?: number }).pageSize ?? body.PageSize;
    const pageIndex = (body as QueryASS11040Request & { pageIndex?: number }).pageIndex ?? body.PageIndex;
    const payload: QueryASS11040Request = {
      GOODS_ID: rawFormValue.itemCode || undefined,
      GOODS_NAME: rawFormValue.itemName || undefined,
      B_CLASS_ID: rawFormValue.bigCategoryCode || undefined,
      M_CLASS_ID: rawFormValue.midCategoryCode || undefined,
      S_CLASS_ID: rawFormValue.smlCategoryCode || undefined,
      MATERIAL_TYPE: rawFormValue.itemCategory || undefined,
      UNIT: rawFormValue.itemUnit || undefined,
      PACK_UNIT: rawFormValue.packageUnit || undefined,
      MT_MODE: rawFormValue.warrantyMethod || undefined,
      IVN_MODE: rawFormValue.maintenanceMethod || undefined,
      NOTES_KW: rawFormValue.illustrate || undefined,
      PageSize: pageSize,
      PageIndex: pageIndex,
      SortBy: body.SortBy,
    };
    const cleanPayload = removeEmptyValues(payload) as QueryASS11040Request;
    return this.ass11040Service.queryASS11040(cleanPayload).pipe(
      map((res: ApiResponse<QueryASS11040DataWrapper>) => ({
        ...res,
        Data: res.Data?.QueryData ?? [],
        TotalCount: res.Data?.TotalRows ?? res.Data?.TotalCount ?? res.TotalCount ?? 0,
      }))
    );
  };

  // ----------------------------------------------------------------
  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const rawFormValue = frm.getRawValue();
      const currentSort = this.tableReport?.multiSortMeta?.length
        ? [...this.tableReport.multiSortMeta]
        : undefined;
      this.lastQueryBody = {
        GOODS_ID: rawFormValue.itemCode || undefined,
        GOODS_NAME: rawFormValue.itemName || undefined,
        B_CLASS_ID: rawFormValue.bigCategoryCode || undefined,
        M_CLASS_ID: rawFormValue.midCategoryCode || undefined,
        S_CLASS_ID: rawFormValue.smlCategoryCode || undefined,
        MATERIAL_TYPE: rawFormValue.itemCategory || undefined,
        UNIT: rawFormValue.itemUnit || undefined,
        PACK_UNIT: rawFormValue.packageUnit || undefined,
        MT_MODE: rawFormValue.warrantyMethod || undefined,
        IVN_MODE: rawFormValue.maintenanceMethod || undefined,
        NOTES_KW: rawFormValue.illustrate || undefined,
        PageSize: 30,
        PageIndex: 1,
        SortBy: currentSort,
      } as QueryASS11040Request;

      this.tableLoading.set(true);
      this.queryStateService.setQueryState(this.ProgNo, rawFormValue);
      this.queryFunction(this.lastQueryBody)
        .pipe(
          untilDestroyed(this),
          finalize(() => {
            this.tableLoading.set(false);
            this.loading = false;
          })
        )
        .subscribe({
          next: res => {
            if (res.Status !== '0000') return;
            this.tableData.set(res.Data);
            this.totalRecords.set(res.TotalCount ?? 0);
          },
        });
    });
  }

}
