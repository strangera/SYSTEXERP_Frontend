import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { TLS56010Service } from '@service/api/tls/tls56010.service';
import { DropDownListService, IDropdownItem, IPOS20032Request } from '@service/utility/dropDownList.service';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { formatAmount } from '@shared/componentkit/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { CheckboxModule } from 'primeng/checkbox';
import { TableModule } from 'primeng/table';
import { Subject, firstValueFrom } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { IQueryPOS2004DetailResponse, Tls52010Service } from '../../../service/api/tls/tls52010.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownTableComponent, FieldsConfig } from '../../../shared/componentkit/dropdown-table/dropdown-table.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';

export interface IPOS20031Request {
  CAT_LNo: string[];
}
interface IPLULOGOItem {
  No: string;
  Name: string;
  LOGO_EN_NAME: string;
}

@Component({
  selector: 'app-tls56010',
  templateUrl: './tls56010.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    CheckboxModule,
    TableComponent,
    TranslateModule,
    DropdownTableComponent,
    TableModule,
    MultiSelectComponent
  ]
})
export class TLS56010Component extends BasicQueryPageComponent<any> implements OnInit {

  queryForm = this.formBuilder.group({
    PLU_MagNo: [null, [Validators.maxLength(20)]], // 查詢編號 input
    CAT_LNo: [null],
    CAT_MNo: [null],
    CAT_SNo: [null],
    generalCode: [null],
    LOGO_No: [null],
    tltCode: [null],
    PLU_Name: [null],
    isSafetyStock: [false],
    ...createPaginationConfig([{ field: 'PLU_MagNo', order: 1 }]),
  });
  expansionRowsPerPageOptions: number[] = [30, 60, 90, 120, 150];
  private lazyLoadTrigger$ = new Subject<any>();
  // 在還原查詢狀態時暫時抑制分類欄位的 valueChanges 處理
  private suppressCategoryHandlers = false;
  // 管理編號
  suggestions: IQueryPOS2004DetailResponse[] = [];
  fieldsConfig: FieldsConfig[] = [
    { field: 'PLU_No', header: '國際條碼/商品管理編號/廠商貨號', mainDataField: true },
  ];
  onAutoCompleteInputChange(event: Record<'label', string>) {
    const body = {
      VEN_No: '',
      LOGO_No: '',
      queryNo: event.label || '',
      pageSize: 30,
      pageIndex: 1,
      SortBy: [{ field: 'PLU_No', order: 1 }],
    }
    this.tls52010Service.queryPOS2004Detail(body).pipe(untilDestroyed(this)).subscribe((results) => {
      this.suggestions = [...results.Data.map(item => ({
        ...item,
        label: item.PLU_No + '/' + item.PLU_MagNo + '/' + item.PLU_OrgPLUNo + ' - ' + item.PLU_Name
      }))];
    });
  }
  bigCategoryOptions: IDropdownItem[] = [];
  midCategoryOptions: IDropdownItem[] = [];
  smallCategoryOptions: IDropdownItem[] = [];
  managementIdOptions: IDropdownItem[] = [];
  brandCodeOptions: IDropdownItem[] = [];
  totalRecords = 0;
  data: any[] = [];
  filteredData: any[] = [...this.data];
  columns: Column[] = [
    { field: 'PLU_MagNo', header: '商品管理編號', visible: true },
    { field: 'PLU_No', header: '國際條碼', visible: true },
    { field: 'PLU_Name', header: '商品名稱', visible: true },
    { field: 'HOS_No', header: '倉別代碼', visible: true },
    { field: 'HOS_NAME', header: '倉別名稱', visible: true },
    { field: 'STK_CurrentQty', header: '現有庫存量', visible: true },
    { field: 'Calc_SafeQty', header: '安全庫存量', visible: true },
    { field: 'PLU_UNITNAME', header: '單位', visible: true },
    { field: 'PLU_SalePrc', header: '售價', visible: true, format: formatAmount },
    { field: 'LOGO_No', header: '品牌代碼', visible: true },
    { field: 'LOGO_CH_NAME', header: '品牌名稱', visible: true },
    { field: 'SaleQty_30Days', header: '30天銷售量', visible: true },
    { field: 'SaleQty_60Days', header: '60天銷售量', visible: true },
    { field: 'SaleQty_90Days', header: '90天銷售量', visible: true },
    { field: 'Unreceived_Qty', header: '已訂未到貨', visible: true },
  ];

  constructor(
    private dropDownListService: DropDownListService,
    private tls52010Service: Tls52010Service,
    private tls56010Service: TLS56010Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS56010', '/TLS/TLS56010cru', this.queryForm, (form) => this.onSubmit(form));

    // 大分類
    this.dropDownListService.queryPOS2003_DropDownList().subscribe({
      next: (res: { Data: any[]; TotalCount: number }) => {
        this.bigCategoryOptions = (res.Data ?? []).map(item => ({
          label: `${item.No}-${item.Name}`,
          value: item.No,
          Name: item.Name,
          No: item.No
        }));
      },
      error: () => this.messageService.errorBubble('載入大分類選單失敗')
    });

    // 大 → 中
    this.queryForm.get('CAT_LNo')?.valueChanges.pipe(debounceTime(300)).subscribe((bigCode) => {
      if (this.suppressCategoryHandlers) return;
      if (bigCode) {
        const params: IPOS20031Request = { CAT_LNo: [bigCode] };
        this.dropDownListService.queryPOS20031_DropDownList(params).subscribe({
          next: (res) => {
            this.midCategoryOptions = (res.Data ?? []).map(item => ({
              label: `${item.No}-${item.Name}`,
              value: item.No,
              Name: item.Name,
              No: item.No
            }));
            this.queryForm.patchValue({ CAT_MNo: null, CAT_SNo: null }, { emitEvent: false });
            this.smallCategoryOptions = [];
          },
          error: () => this.messageService.errorBubble('載入中分類選單失敗')
        });
      } else {
        this.midCategoryOptions = [];
        this.smallCategoryOptions = [];
        this.queryForm.patchValue({ CAT_MNo: null, CAT_SNo: null }, { emitEvent: false });
      }
    });

    // 中 → 小
    this.queryForm.get('CAT_MNo')?.valueChanges.pipe(debounceTime(300)).subscribe((midCode) => {
      if (this.suppressCategoryHandlers) return;
      const bigCode = this.queryForm.get('CAT_LNo')?.value;
      if (bigCode && midCode) {
        const params: IPOS20032Request = {
          CATList: [
            {
              CAT_LNo: bigCode,
              CAT_MNo: midCode
            }
          ]
        }
        this.dropDownListService.queryPOS20032_DropDownList(params).subscribe({
          next: (res) => {
            this.smallCategoryOptions = (res.Data ?? []).map(item => ({
              label: `${item.No}-${item.Name}`,
              value: item.No,
              Name: item.Name,
              No: item.No
            }));
            this.queryForm.patchValue({ CAT_SNo: null }, { emitEvent: false });
          },
          error: () => this.messageService.errorBubble('載入小分類選單失敗')
        });
      } else {
        this.smallCategoryOptions = [];
        this.queryForm.patchValue({ CAT_SNo: null }, { emitEvent: false });
      }
    });

    // 品牌
    this.dropDownListService.queryPLULOGO_DropDownList().subscribe({
      next: (res) => {
        const data = res.Data as unknown as IPLULOGOItem[];
        this.brandCodeOptions = (data ?? []).map(item => ({
          label: `${item.No}-${item.LOGO_EN_NAME}（${item.Name}）`,
          value: item.No,
          No: item.No,
          Name: item.Name,
          LOGO_EN_NAME: item.LOGO_EN_NAME
        }));
      },
      error: () => this.messageService.errorBubble('載入品牌選單失敗')
    });

    // TLT → 管理編號
    this.queryForm.get('tltCode')?.valueChanges.pipe(debounceTime(300)).subscribe((tltCode) => {
      if (tltCode) {
        const requestBody = `{"TLT_NO":"${tltCode}"}`;
        this.dropDownListService.queryPOS2004_DropDownList(requestBody).subscribe({
          next: (res) => {
            this.managementIdOptions = (res.Data ?? []).map(item => ({
              label: item.PLU_Name,
              value: item.PLU_No,
              No: item.PLU_No,
              Name: item.PLU_Name
            }));
            this.queryForm.patchValue({ generalCode: null }, { emitEvent: false });
          },
          error: () => this.messageService.errorBubble('載入管理編號選單失敗')
        });
      } else {
        this.managementIdOptions = [];
        this.queryForm.patchValue({ generalCode: null }, { emitEvent: false });
      }
    });

    // 合併快速的 lazyLoad 事件，避免重複送出查詢
    this.lazyLoadTrigger$.pipe(debounceTime(50), untilDestroyed(this)).subscribe(() => {
      this.onSubmit(this.queryForm);
    });
  }

  // 處理 table 的 lazyLoad 事件（只綁定到 template 一個 handler，避免重複呼叫）
  async onTableLazy(event: any) {
    // 儲存目前使用者選擇的分類值（以便在還原流程後還原，避免被舊的 queryState 覆蓋）
    const currentCats = {
      CAT_LNo: this.queryForm.get('CAT_LNo')?.value,
      CAT_MNo: this.queryForm.get('CAT_MNo')?.value,
      CAT_SNo: this.queryForm.get('CAT_SNo')?.value,
    };

    // 在還原期間暫時抑制 valueChanges 內的自動清除行為
    this.suppressCategoryHandlers = true;
    // 先用 base class 處理 pageIndex/pageSize/SortBy 的 patch
    try {
      super.onLazyLoadData(event, this.queryForm);
    } catch (e) {
      // ignore
    }
    const saved = this.queryStateService.getQueryStateValue(this.ProgNo);
    const proceed = async () => {
      // 確保中/小分類的 options 包含目前使用者選擇，若不足就主動載入
      try {
        if (currentCats.CAT_LNo) {
          // 若 mid 選項不包含使用者的 mid 值，則重新載入 mid 選單
          const hasMid = this.midCategoryOptions.some(o => o.value === currentCats.CAT_MNo);
          if (!hasMid) {
            const params = { CAT_LNo: [currentCats.CAT_LNo] } as IPOS20031Request;
            const res = await firstValueFrom(this.dropDownListService.queryPOS20031_DropDownList(params).pipe(untilDestroyed(this)));
            this.midCategoryOptions = (res.Data ?? []).map((item: any) => ({ label: `${item.No}-${item.Name}`, value: item.No, Name: item.Name, No: item.No }));
          }
        }
        if (currentCats.CAT_LNo && currentCats.CAT_MNo) {
          const hasSmall = this.smallCategoryOptions.some(o => o.value === currentCats.CAT_SNo);
          if (!hasSmall) {
            const params2: IPOS20032Request = { CATList: [{ CAT_LNo: currentCats.CAT_LNo, CAT_MNo: currentCats.CAT_MNo }] };
            const res2 = await firstValueFrom(this.dropDownListService.queryPOS20032_DropDownList(params2).pipe(untilDestroyed(this)));
            this.smallCategoryOptions = (res2.Data ?? []).map((item: any) => ({ label: `${item.No}-${item.Name}`, value: item.No, Name: item.Name, No: item.No }));
          }
        }
      } catch (e) {
        // ignore loading errors here; user selections will be restored regardless
      }

      // 還原使用者當前的分類選擇（若存在）以優先保留使用者操作
      const restore: any = {};
      if (currentCats.CAT_LNo !== null && currentCats.CAT_LNo !== undefined) restore.CAT_LNo = currentCats.CAT_LNo;
      if (currentCats.CAT_MNo !== null && currentCats.CAT_MNo !== undefined) restore.CAT_MNo = currentCats.CAT_MNo;
      if (currentCats.CAT_SNo !== null && currentCats.CAT_SNo !== undefined) restore.CAT_SNo = currentCats.CAT_SNo;
      if (Object.keys(restore).length) {
        this.queryForm.patchValue(restore, { emitEvent: false });
      }
      this.suppressCategoryHandlers = false;
      this.lazyLoadTrigger$.next(event);
    };

    if (saved && (saved.CAT_LNo || saved.CAT_MNo || saved.CAT_SNo)) {
      // 正規化 saved 的值（若為陣列則取首項）
      const norm = (v: any) => Array.isArray(v) ? (v[0] ?? null) : v ?? null;
      const big = norm(saved.CAT_LNo);
      const mid = norm(saved.CAT_MNo);
      const small = norm(saved.CAT_SNo);

      if (big) {
        // 先設定大分類，但不觸發 valueChanges，接著手動載中分類選項
        this.queryForm.patchValue({ CAT_LNo: big }, { emitEvent: false });
        const params = { CAT_LNo: [big] } as IPOS20031Request;
        this.dropDownListService.queryPOS20031_DropDownList(params).pipe(untilDestroyed(this)).subscribe({
          next: (res) => {
            this.midCategoryOptions = (res.Data ?? []).map((item: any) => ({
              label: `${item.No}-${item.Name}`,
              value: item.No,
              Name: item.Name,
              No: item.No
            }));
            if (mid) {
              // 設定中分類，並載入小分類
              this.queryForm.patchValue({ CAT_MNo: mid }, { emitEvent: false });
              const params2: IPOS20032Request = {
                CATList: [{ CAT_LNo: big, CAT_MNo: mid }]
              };
              this.dropDownListService.queryPOS20032_DropDownList(params2).pipe(untilDestroyed(this)).subscribe({
                next: (res2) => {
                  this.smallCategoryOptions = (res2.Data ?? []).map((item: any) => ({
                    label: `${item.No}-${item.Name}`,
                    value: item.No,
                    Name: item.Name,
                    No: item.No
                  }));
                  if (small) {
                    this.queryForm.patchValue({ CAT_SNo: small }, { emitEvent: false });
                  }
                  proceed();
                },
                error: () => {
                  this.messageService.errorBubble('載入小分類選單失敗');
                  proceed();
                }
              });
            } else {
              // 沒有中分類值，清空小分類
              this.smallCategoryOptions = [];
              this.queryForm.patchValue({ CAT_SNo: null }, { emitEvent: false });
              proceed();
            }
          },
          error: () => {
            this.messageService.errorBubble('載入中分類選單失敗');
            proceed();
          }
        });
      } else {
        // 沒有大分類，直接繼續
        proceed();
      }
    } else {
      // 沒有儲存分類，直接觸發查詢
      proceed();
    }
  }

  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      this.loading = true;
      this.messageService.infoBubble('查詢中,請稍候...');

      const v = form.getRawValue() as any;
      const toStr = (val: any) => Array.isArray(val) ? (val[0] ?? '') : (val ?? '');
      const toArr = (val: any) =>
        Array.isArray(val) ? val.filter((x) => x != null && x !== '') :
          (val != null && val !== '' ? [val] : []);
      const nonEmpty = (s?: string | null) => !!(s && s.trim().length);

      const normalizeSortBy = (sortBy: any) => {
        if (!Array.isArray(sortBy) || !sortBy.length) return [{ field: 'PLU_MagNo', order: 1 }];
        return sortBy
          .filter((s: any) => s && typeof s.field === 'string')
          .map((s: any) => ({ field: s.field, order: s.order === -1 ? 2 : (s.order ?? 1) }));
      };

      const body: any = {
        PageSize: Number(v.pageSize ?? 10),
        PageIndex: Number(v.pageIndex ?? 1),
        SortBy: normalizeSortBy(v.SortBy),
        ...(nonEmpty(toStr(v.CAT_LNo)) ? { CAT_LNo: toStr(v.CAT_LNo) } : {}),
        ...(nonEmpty(toStr(v.CAT_MNo)) ? { CAT_MNo: toStr(v.CAT_MNo) } : {}),
        ...(nonEmpty(toStr(v.CAT_SNo)) ? { CAT_SNo: toStr(v.CAT_SNo) } : {}),
        ...(nonEmpty(v.PLU_MagNo) ? { PLU_MagNo: v.PLU_MagNo.trim() } : {}),
        ...(toArr(v.LOGO_No).length ? { LOGO_No: toArr(v.LOGO_No) } : {}),
        isSafetyStock: !!v.isSafetyStock,
        CAT_LNo: v.CAT_LNo,
        CAT_MNo: v.CAT_MNo,
        CAT_SNo: v.CAT_SNo,
        PLU_MagNo: v.PLU_MagNo,
        LOGO_No: v.LOGO_No,
      };

      this.tls56010Service.queryTLS56010(body).subscribe({
        next: (res: { Data: any[]; TotalCount: number }) => {
          this.data = res?.Data ?? [];
          // 若後端沒有依 SortBy 排序，可在 client 端以 body.SortBy 做回退排序
          if (Array.isArray(body.SortBy) && body.SortBy.length) {
            this.filteredData = this.applyLocalSort([...this.data], body.SortBy);
          } else {
            this.filteredData = [...this.data];
          }
          this.totalRecords = res?.TotalCount ?? this.data.length;
          this.queryStateService.setQueryState(this.ProgNo, body);
          this.loading = false;
          this.messageService.unblockUi();
        },

      });
    });
  }

  // 當後端無法正確排序時，於 client 端對當前 page 的資料做回退排序
  private applyLocalSort(rows: any[], sortBy: any[]): any[] {
    if (!Array.isArray(sortBy) || !sortBy.length) return rows;
    const compareValue = (a: any, b: any) => {
      if (a == null && b == null) return 0;
      if (a == null) return -1;
      if (b == null) return 1;
      // numeric compare if both numeric
      const na = Number(a);
      const nb = Number(b);
      if (!isNaN(na) && !isNaN(nb)) return na - nb;
      // fallback string compare
      return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
    };

    return rows.sort((r1, r2) => {
      for (const s of sortBy) {
        const field = s?.field;
        const order = s?.order === -1 ? -1 : (s?.order === 2 ? -1 : 1); // support -1,1 or 2
        const v = compareValue(r1?.[field], r2?.[field]);
        if (v !== 0) return order === -1 ? -v : v;
      }
      return 0;
    });
  }
}
