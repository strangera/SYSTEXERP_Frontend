import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators, } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { AccordionModule } from 'primeng/accordion';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { createPaginationConfig } from '../../../others/component/table/table.model';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

@Component({
  selector: 'app-tls11010',
  templateUrl: './tls11010.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    MultiSelectComponent,
    InputTextComponent,
    InputNumberRangeComponent,
    TableReportComponent,
    TranslateModule,
  ],
})
export class TLS11010Component extends BasicQueryPageComponent<any> implements OnInit {
  data: any[] = [];
  selectedItems: any[] = [];
  totalRecords = 0;
  private lastQuerySig: string | null = null;
  private lazyTimer: any = null;
  lastQueryBody: any = null;
  queryTLS11010Fn = (body: any) => this.tls11010Service.queryData(body);

  // Options
  floorOptions: any[] = [];
  RegionCodeOptions: any[] = [];
  OrganizationCodeOptions: any[] = [];
  usageOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  LOCATION_Status_Options: any[] = [
    { value: '0', label: '未使用' },
    { value: '1', label: '使用中' },
    { value: '2', label: '保留中' },
    { value: '3', label: '停用' },
  ];

  // 查詢表單：一開始就是「全部沒選 / 沒輸入」的狀態
  queryForm = this.formBuilder.group({
    LOCATION_No: ['', Validators.maxLength(10)],
    org_id: [[]], // Multi-select -> 一開始空陣列
    building_no: [[]],
    FLOOR_NO: [[] as string[]],
    AREA_NO: [[] as string[]],
    GROSS_SPACE_Start: [null, [Validators.min(0), Validators.max(9999.999)]],
    GROSS_SPACE_End: [null, [Validators.min(0), Validators.max(9999.999)]],
    NET_SPACE_Start: [null, [Validators.min(0), Validators.max(9999.999)]],
    NET_SPACE_End: [null, [Validators.min(0), Validators.max(9999.999)]],
    LOCATION_Status: [[]],
    Purpose_no: [[] as string[]],
    ...createPaginationConfig([{ field: 'LOCATION_No', order: 1 }]),
  });

  // 使用 LOCATION_Status 當排序欄位，顯示時用 options 轉成中文標籤
  columns: any[] = [
    { field: 'LOCATION_No', header: '位置代碼', visible: true },

    { field: 'org_id', header: '組織代碼', visible: true },
    { field: 'org_name', header: '組織名稱', visible: true },
    {
      field: 'building_no',
      header: '館別',
      visible: true,
      format: (value: any) =>
        this.getLabelFromOptions(value, this.BUILDING_NO_Options),
    },
    {
      field: 'FLOOR_NO',
      header: '樓層',
      visible: true,
      format: (value: any) =>
        this.getLabelFromOptions(value, this.floorOptions),
    },
    {
      field: 'AREA_NO',
      header: '區域',
      visible: true,
      format: (value: any) =>
        this.getLabelFromOptions(value, this.RegionCodeOptions),
    },
    { field: 'GROSS_SPACE', header: '簽約坪數', visible: true },
    { field: 'NET_SPACE', header: '營業坪數', visible: true },

    {
      field: 'LOCATION_Status',
      header: '使用狀態',
      visible: true,
      format: (value: any) =>
        this.getLabelFromOptions(value, this.LOCATION_Status_Options),
    },

    { field: 'purpose_desc', header: '用途名稱', visible: true },
    { field: 'Draw_X', header: '平面圖X座標', visible: true },
    { field: 'Draw_Y', header: '平面圖Y座標', visible: true },
    { field: 'LOCATION_Name', header: '店位說明', visible: true },
  ];

  constructor(private tls11010Service: Tls11010Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage(
      'TLS11010',
      'tls/tls11010cru',
      this.queryForm,
      (f) => this.onSubmit(f),
    );

    // 載入各種下拉
    this.tls11010Service
      .getFloorOptions()
      .pipe(untilDestroyed(this))
      .subscribe((res) => (this.floorOptions = res));

    this.tls11010Service
      .getRegionOptions()
      .pipe(untilDestroyed(this))
      .subscribe((res) => (this.RegionCodeOptions = res));

    this.tls11010Service
      .getOrgOptions()
      .pipe(untilDestroyed(this))
      .subscribe((res) => {
        this.OrganizationCodeOptions =
          res?.map((x: any) => ({
            label: x.label, // table 顯示
            formLabel: `${x.value} - ${x.label}`, // 下拉顯示
            value: x.value,
          })) || [];
      });

    this.tls11010Service
      .getUsageOptions()
      .pipe(untilDestroyed(this))
      .subscribe((res) => {
        this.usageOptions =
          res?.map((x: any) => ({
            label: x.label,
            formLabel: `${x.value} - ${x.label}`,
            value: x.value,
          })) || [];
      });

    this.tls11010Service
      .getBuildingOptions()
      .pipe(untilDestroyed(this))
      .subscribe((res) => (this.BUILDING_NO_Options = res));
  }

  /** 給 API 用的 payload 轉換 */
  private buildApiPayload(formValue: any): any {
    const payload: any = { ...formValue };

    // 將空字串欄位轉為 null，以符合後端 char? 要求
    if (payload.building_no === '') payload.building_no = null;
    if (payload.LOCATION_No === '') payload.LOCATION_No = null;

    // MultiSelect：把可能是物件或字串，統一轉成「代碼字串」陣列
    const toCodeArray = (arr: any[]): string[] =>
      (arr || [])
        .map((x: any) => {
          if (x == null) return '';
          if (typeof x === 'string' || typeof x === 'number') return String(x);
          // 如果是 { value, label } 的物件
          if (typeof x === 'object' && 'value' in x) return String(x.value);
          return '';
        })
        .filter((v) => v !== '');

    if (Array.isArray(payload.LOCATION_Status)) {
      payload.LOCATION_Status = toCodeArray(payload.LOCATION_Status);
    }

    if (Array.isArray(payload.Purpose_no)) {
      payload.Purpose_no = toCodeArray(payload.Purpose_no);
    }

    return payload;
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      this.loading = true;
      this.messageService.blockUi();
      const rawFormValue = frm.getRawValue();
      const payload = this.buildApiPayload(rawFormValue);
      this.lastQueryBody = { ...payload };

      this.tls11010Service
        .queryData(payload)
        .pipe(untilDestroyed(this))
        .subscribe({
          next: (res) => {
            if (res.Status === '0000') {
              const rows = res?.Data || [];
              // 先把 null → ''（避免 table 顯示 null）
              const cleaned = this.convertNullToEmptyString(rows);
              // 保留裝飾用欄位
              this.data = this.decorateRowsForDisplay(cleaned);
              this.totalRecords = res?.TotalCount || this.data.length;

              // ✅ 跟 TLS11020 一樣：存「原始表單值」到查詢還原
              this.queryStateService.setQueryState(this.ProgNo, rawFormValue);
            }
            this.loading = false;
            this.messageService.unblockUi();
          },
          error: () => {
            this.loading = false;
            this.messageService.unblockUi();
          },
          complete: () => {
            this.loading = false;
            this.messageService.unblockUi();
          },
        });
    });
  }

  onDelete(selectedItems: any[]) {
    if (!selectedItems.length) return;

    const idList = selectedItems
      .filter(item => item && item.id != null)
      .map(item => item.id);

    if (idList.length === 0) {
      this.messageService.warnBubble('未找到有效的刪除項目');
      return;
    }

    this.messageService.confirm({
      message: '是否確認刪除所選位置資料?',
      header: '確認刪除',
      accept: () => {
        this.loading = true;
        this.tls11010Service
          .deleteData(idList)
          .pipe(untilDestroyed(this))
          .subscribe({
            next: (response: any) => {
              if (response?.Status === '0000') {
                this.messageService.successBubble('刪除成功');
                this.selectedItems = [];
                this.onSubmit(this.queryForm);
              } else {
                this.messageService.errorBubble(`刪除失敗: ${response?.Message}`);
              }
            },
            error: () => {
              this.messageService.errorBubble('刪除失敗');
            },
            complete: () => {
              this.loading = false;
            },
          });
      }
    });
  }

  override onEdit(data: any): void {
    if (!this.hasPermission('30')) return;

    const trimmedData = {
      ...data,
      AREA_NO: Array.isArray(data?.AREA_NO)
        ? data.AREA_NO.map((x: any) => String(x).trim())
        : String(data?.AREA_NO ?? '').trim(),
    };

    this.navigateWithState(CRUDStatus.Edit, trimmedData);
  }

  /** 將 null → ''（避免 UI 出現 null） */
  convertNullToEmptyString(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map((item) => this.convertNullToEmptyString(item));
    } else if (typeof obj === 'object' && obj !== null) {
      const newObj: any = {};
      Object.keys(obj).forEach((key) => {
        const value = obj[key];
        newObj[key] = value === null ? '' : this.convertNullToEmptyString(value);
      });
      return newObj;
    }
    return obj;
  }

  /**
   * 產生額外顯示欄位（目前保留 LOCATION_Status_*，方便之後需要時使用）
   */
  private decorateRowsForDisplay(rows: any[]): any[] {
    return rows.map((r) => {
      const statusCode = String(r?.LOCATION_Status ?? '').trim();
      const statusLabel = this.getLabelFromOptions(
        statusCode,
        this.LOCATION_Status_Options,
      );
      return {
        ...r,
        LOCATION_Status_Code: statusCode,
        LOCATION_Status_Label: statusLabel,
      };
    });
  }

  /** 安全取得 Options 的 label；同時相容 number / string */
  getLabelFromOptions(value: any, options: any[]): string {
    const trimmedValue = String(value ?? '').trim();
    const found = options?.find(
      (opt) => String(opt.value ?? '').trim() === trimmedValue,
    );
    return found ? found.label : trimmedValue;
  }

  /** 🔹 清除：回到「一開始都沒選、沒輸入」的狀態，並且更新還原用的 state */
  onClear(): void {
    const form = this.queryForm;

    // 保留目前的分頁設定
    const paging = {
      pageIndex: form.get('pageIndex')?.value ?? 1,
      pageSize: form.get('pageSize')?.value ?? 20,
      SortBy:
        form.get('SortBy')?.value ?? [{ field: 'LOCATION_No', order: 1 }],
    };

    // 先全部 reset（型別會回到控制項原本宣告的型別）
    form.reset();

    // 🔹 Text / number 類欄位：清成「沒輸入」
    form.get('LOCATION_No')?.setValue('');
    form.get('GROSS_SPACE_Start')?.setValue(null);
    form.get('GROSS_SPACE_End')?.setValue(null);
    form.get('NET_SPACE_Start')?.setValue(null);
    form.get('NET_SPACE_End')?.setValue(null);

    // 🔹 Multi-select / 陣列欄位：設成 []（用 any 避掉 TS 推斷成 null | undefined 的問題）
    (form.get('org_id') as any)?.setValue([]);
    (form.get('building_no') as any)?.setValue([]);
    (form.get('FLOOR_NO') as any)?.setValue([]);
    (form.get('AREA_NO') as any)?.setValue([]);
    (form.get('LOCATION_Status') as any)?.setValue([]);
    (form.get('Purpose_no') as any)?.setValue([]);

    // 🔹 把分頁設回去
    form.patchValue(paging);

    this.submitted = false;
    form.markAsPristine();
    form.markAsUntouched();

    // 🔥 重點：把「清空後」的條件寫回查詢還原
    const cleared = form.getRawValue();
    this.queryStateService.setQueryState(this.ProgNo, cleared);
  }
  override onLazyLoadData(event: any, form: FormGroup): void {
    // event 可能是你自己包的 LazyLoadEvent，也可能是 primeng 的 LazyLoadEvent
    // 所以這裡做容錯
    const evPageIndex =
      Number.isFinite(event?.pageIndex) ? Number(event.pageIndex)
        : Number.isFinite(event?.first) && Number.isFinite(event?.rows)
          ? Math.floor(Number(event.first) / Number(event.rows)) + 1
          : undefined;

    const evPageSize =
      Number.isFinite(event?.pageSize) ? Number(event.pageSize)
        : Number.isFinite(event?.rows) ? Number(event.rows)
          : undefined;

    const nextSort = Array.isArray(event?.SortBy) ? event.SortBy
      : Array.isArray(event?.multiSortMeta) ? event.multiSortMeta
        : form.value?.SortBy ?? [];

    const currSortSig = JSON.stringify(form.value?.SortBy ?? []);
    const nextSortSig = JSON.stringify(nextSort ?? []);

    // 排序改變 => 回到第 1 頁
    const nextPageIndex =
      currSortSig !== nextSortSig
        ? 1
        : (evPageIndex ?? form.value?.pageIndex ?? 1);

    const nextPageSize = evPageSize ?? form.value?.pageSize ?? 30;

    // 先把 paging/sort 寫回表單（避免你 onSubmit 用到舊值）
    form.patchValue(
      {
        pageIndex: nextPageIndex,
        pageSize: nextPageSize,
        SortBy: nextSort ?? [],
      },
      { emitEvent: false }
    );

    // 防止同樣狀態重複查
    const sig = JSON.stringify({
      pageIndex: form.value?.pageIndex,
      pageSize: form.value?.pageSize,
      SortBy: form.value?.SortBy,
      // 如果你想「條件變更也算」，可以把其他欄位也帶進來
    });

    if (sig === this.lastQuerySig) return;
    this.lastQuerySig = sig;

    // debounce：避免表格瞬間連續丟多次 lazy event
    if (this.lazyTimer) clearTimeout(this.lazyTimer);
    this.lazyTimer = setTimeout(() => this.onSubmit(form), 0);
  }

}
