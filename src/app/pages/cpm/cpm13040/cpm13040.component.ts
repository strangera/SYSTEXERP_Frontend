import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { CPM13040Service } from '@service/api/cpm/cpm13040.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CustomFooterTableComponent } from '@shared/componentkit/custom-footer-table/customFooterTable.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column, createPaginationConfig, formatAmount, LazyLoadEvent } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { formatDate } from './../../../shared/componentkit/table-report/table-report.model';
@Component({
  selector: 'app-cpm13040',
  templateUrl: './cpm13040.component.html',
  standalone: true,
  imports: [
    DropdownComponent,
    ButtonModule,
    CalendarRangeComponent,
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    CustomFooterTableComponent,
    TableComponent,
    MultiSelectComponent
  ]
})
export class CPM13040Component extends BasicQueryPageComponent<any> implements OnInit {
  multiSortMeta = [{ field: 'TXN_Date', order: 1 }];
  queryForm = this.formBuilder.group({
    TXN_Date_Start: [new Date(), [Validators.required]],
    TXN_Date_End: [new Date(), [Validators.required]],
    CRD_Kind: [[]],
    Org_ID: [[]],
    TLT_No: [[]],
    ...createPaginationConfig([{ field: 'TXN_Date', order: 1 }]),
    pageSize: [30],
  });
  expansionRowsPerPageOptions: number[] = [30, 60, 90, 120, 150];

  selectedItems: any[] = [];
  totalRecords = 0;
  data: any[] = []; // 明細表資料
  headerData: any[] = []; // 上方表格資料
  footerData: any = {};
  btnLoading = false;
  btnLoading2 = false;
  loadingHeader = false;
  CRD_Kind_Options = getSYS1000Options('CRD_Kind')
    .filter(opt => ['P', 'I', 'S'].includes(opt.value));

  org_id_Options: any[] = [];
  TLT_No_Options: { No: string, Name: string, label: string }[] = [];

  // 第一張表格：卡別彙總
  headerColumns: Column[] = [
    { field: 'CardType', header: '卡別', visible: true },
    { field: 'FreeHours', header: '時數', visible: true, format: formatAmount },
    { field: 'CardCounts', header: '卡數', visible: true, format: formatAmount },
  ];

  // 第二張表格：卡別明細
  columns: Column[] = [
    { field: 'TXN_Date', header: '日期', visible: true, format: formatDate },
    { field: 'CardType', header: '卡別', visible: true },
    { field: 'CRD_No', header: '聯名卡號', visible: true },
    {
      field: 'Org_ID', header: '組織名稱', visible: true, format: (value, _i, row) =>
        row?.Org_Name ?? row?.OrgName ?? this.org_id_Options.find(o => String(o.value) === String(value))?.label ?? value
    },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true },
    { field: 'TXN_GUINo', header: '發票號碼', visible: true },
    { field: 'TXN_PayAmt', header: '刷卡總金額', visible: true, format: formatAmount, isTotal: true },
  ];

  constructor(
    private readonly dropDownListService: DropDownListService,
    private readonly cpm13040Service: CPM13040Service,
    private readonly datePipe: DatePipe
  ) {
    super();
  }

  private formatMulti(val: any): string {
    try {
      if (Array.isArray(val)) return (val as any).join(',');
      return val ?? '';
    } catch {
      return '';
    }
  }

  private formatMultiArray(val: any): string[] {
    try {
      if (!val) return [];
      if (Array.isArray(val)) return val as string[];
      return [String(val)];
    } catch {
      return [];
    }
  }

  ngOnInit(): void {
    this.initializePage('CPM13040', '/CPM/CPM13040CRU', this.queryForm, (frm) => this.onSubmit(frm));

    // 組織下拉
    this.dropDownListService.querySYS3100_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.org_id_Options = (res.Data || []).map(item => ({
          ...item,
          label: `${item.No}-${item.Name}`,
          value: item.No
        }));
      });

    this.dropDownListService.queryTLTTALENT_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.TLT_No_Options = res.Data.map(item => ({
          value: item.No,
          label: `${item.No} - ${item.Name}`,
          ...item
        }));
      });

  }

  // ----------------------------------------------------------------
  onSubmit(frm: FormGroup) {
    this.submitted = true;
    if (frm.invalid) return;

    const v = frm.value;
    const payload = {
      TXN_Date_Start: this.datePipe.transform(v.TXN_Date_Start, 'yyyy-MM-dd'),
      TXN_Date_End: this.datePipe.transform(v.TXN_Date_End, 'yyyy-MM-dd'),
      CRD_Kind: this.formatMultiArray(v.CRD_Kind),
      Org_ID: this.formatMultiArray(v.Org_ID),
      TLT_No: this.formatMultiArray(v.TLT_No),
    };

    this.loading = true;
    this.loadingHeader = true;
    this.messageService.blockUi();

    // 重置分頁狀態
    this.totalRecords = 0;
    this.data = [];

    // 第一個 API: 卡別彙總表（headerColumns）
    this.cpm13040Service.queryCPM13040(payload)
      .pipe(finalize(() => this.loadingHeader = false))
      .subscribe({
        next: (res) => {
          this.headerData = res?.Data || [];
          console.log('Header 資料:', this.headerData);
        },
        error: (err) => console.error('Header 查詢失敗:', err)
      });

    // 第二個 API: 卡別明細表（columns）- 初始載入第一頁
    const pageSize = v.pageSize || 20;
    const pageIndex = v.pageIndex || 1;
    const offset = (pageIndex - 1) * pageSize;

    const detailPayload = {
      PageSize: pageSize,
      PageIndex: pageIndex,
      OrderBy: v.SortBy?.[0]?.field ?? undefined,
      Offset: offset,
      SortBy: v.SortBy ?? undefined,
      TXN_Date_Start: payload.TXN_Date_Start,
      TXN_Date_End: payload.TXN_Date_End,
      CRD_Kind: payload.CRD_Kind,
      Org_ID: payload.Org_ID,
      TLT_No: payload.TLT_No,
    };

    this.cpm13040Service.queryCPM13040Detail(detailPayload)
      .pipe(finalize(() => {
        this.loading = false;
        this.messageService.unblockUi();
      }))
      .subscribe({
        next: (res) => {
          console.log('完整 API 回應:', res);

          // 處理不同的 API 響應結構
          if (res?.Data) {
            // 情況1: res.Data 直接包含 QueryData 和 TotalData
            if (res.Data.QueryData) {
              this.data = res.Data.QueryData;
              if (res.Data.TotalData) {
                this.footerData = [{
                  group_name: '總計',
                  TXN_PayAmt: res.Data.TotalData.Total_TXN_PayAmt
                }];
              }
            }
            // 情況2: res.Data 就是陣列資料
            else if (Array.isArray(res.Data)) {
              this.data = res.Data;
              this.footerData = [];
            }
            // 情況3: 其他結構
            else {
              this.data = res.Data || [];
              this.footerData = [];
            }
          }
          // 直接在根層級有 QueryData
          else if (res?.QueryData) {
            this.data = res.QueryData;
            if (res.TotalData) {
              this.footerData = [{
                group_name: '總計',
                TXN_PayAmt: res.TotalData.Total_TXN_PayAmt
              }];
            }
          }
          else {
            this.data = [];
            this.footerData = [];
          }

          // 設定總筆數，優先使用 TotalCount，其次使用 data 長度
          this.totalRecords = res?.TotalCount || res?.Data?.TotalCount || this.data.length || 0;

          console.log('處理後 Detail 資料:', this.data, '長度:', this.data.length);
          console.log('處理後 Footer 資料:', this.footerData);
          console.log('處理後總筆數:', this.totalRecords);

          // 儲存查詢狀態，以便後續操作能恢復
          // 更新排序狀態並儲存查詢狀態
          this.multiSortMeta = frm.value.SortBy ?? this.multiSortMeta;
          this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
        },
      });
  }

  // 處理分頁載入事件
  override onLazyLoadData(event: LazyLoadEvent, frm: FormGroup) {
    if (!frm.valid) return;

    // 先讓父類更新 form 的 pageIndex/pageSize/SortBy 等
    super.onLazyLoadData(event, frm);

    const formValue = frm.value;
    const pageSize = formValue.pageSize ?? event.pageSize ?? 20;
    const pageIndex = formValue.pageIndex ?? event.pageIndex ?? 1;
    const offset = (pageIndex - 1) * pageSize;

    const payload = {
      TXN_Date_Start: this.datePipe.transform(formValue.TXN_Date_Start, 'yyyy-MM-dd'),
      TXN_Date_End: this.datePipe.transform(formValue.TXN_Date_End, 'yyyy-MM-dd'),
      CRD_Kind: this.formatMultiArray(formValue.CRD_Kind),
      Org_ID: this.formatMultiArray(formValue.Org_ID),
      TLT_No: this.formatMultiArray(formValue.TLT_No),
      PageSize: pageSize,
      PageIndex: pageIndex,
      OrderBy: formValue.SortBy?.[0]?.field ?? undefined,
      SortBy: formValue.SortBy ?? undefined,
      Offset: offset,
    };

    this.loading = true;
    this.messageService.blockUi();

    console.log('分頁載入事件:', event);
    console.log('分頁載入 payload:', payload);

    this.cpm13040Service.queryCPM13040Detail(payload)
      .pipe(finalize(() => {
        this.loading = false;
        this.messageService.unblockUi();
      }))
      .subscribe({
        next: (res) => {
          console.log('分頁載入完整 API 回應:', res);

          // 處理不同的 API 響應結構（與上面相同邏輯）
          if (res?.Data) {
            if (res.Data.QueryData) {
              this.data = res.Data.QueryData;
              if (res.Data.TotalData) {
                this.footerData = [{
                  group_name: '總計',
                  TXN_PayAmt: res.Data.TotalData.Total_TXN_PayAmt
                }];
              }
            }
            else if (Array.isArray(res.Data)) {
              this.data = res.Data;
              this.footerData = [];
            }
            else {
              this.data = res.Data || [];
              this.footerData = [];
            }
          }
          else if (res?.QueryData) {
            this.data = res.QueryData;
            if (res.TotalData) {
              this.footerData = [{
                group_name: '總計',
                TXN_PayAmt: res.TotalData.Total_TXN_PayAmt
              }];
            }
          }
          else {
            this.data = [];
            this.footerData = [];
          }

          this.totalRecords = res?.TotalCount || res?.Data?.TotalCount || this.data.length || 0;

          // 更新排序狀態與查詢快照
          this.multiSortMeta = frm.value.SortBy ?? this.multiSortMeta;
          this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());

          console.log('分頁處理後 Detail 資料:', this.data, '長度:', this.data.length);
          console.log('分頁處理後 Footer 資料:', this.footerData);
          console.log('分頁處理後總筆數:', this.totalRecords);
        },
      });
  }
  /** 匯出 PDF */
  onExportPDF() {
    if (this.data.length === 0) return;

    const v = this.queryForm.value;
    const payload = {
      TXN_Date_Start: this.datePipe.transform(v.TXN_Date_Start, 'yyyy-MM-dd'),
      TXN_Date_End: this.datePipe.transform(v.TXN_Date_End, 'yyyy-MM-dd'),
      CRD_Kind: this.formatMultiArray(v.CRD_Kind),
      Org_ID: this.formatMultiArray(v.Org_ID),
      TLT_No: this.formatMultiArray(v.TLT_No),
    };

    this.btnLoading = true;
    this.messageService.blockUi();

    this.cpm13040Service.exportCPM13040PDF(payload)
      .pipe(finalize(() => {
        this.btnLoading = false;
        this.messageService.unblockUi();
      }))
      .subscribe({
        next: (res) => {
          if (res.body) {
            const blob = new Blob([res.body], { type: 'application/pdf' });
            const url = globalThis.URL.createObjectURL(blob);

            // 建立 <a> 元素以觸發下載，檔名使用後端回傳的 Content-Disposition（若無則回退至預設）
            const a = document.createElement('a');
            a.href = url;
            const filenamePdf = this.getFilenameFromResponse(res, `POS聯名卡停車優惠明細_${this.datePipe.transform(new Date(), 'yyyyMMdd_HHmmss')}.pdf`);
            a.download = filenamePdf;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            globalThis.URL.revokeObjectURL(url);
          }
        },
      });
  }

  /** 匯出 Excel */
  onExportExcel() {
    if (this.data.length === 0) return;

    const v = this.queryForm.value;
    const payload = {
      TXN_Date_Start: this.datePipe.transform(v.TXN_Date_Start, 'yyyy-MM-dd'),
      TXN_Date_End: this.datePipe.transform(v.TXN_Date_End, 'yyyy-MM-dd'),
      CRD_Kind: this.formatMultiArray(v.CRD_Kind),
      Org_ID: this.formatMultiArray(v.Org_ID),
      TLT_No: this.formatMultiArray(v.TLT_No),
    };

    this.btnLoading2 = true;
    this.messageService.blockUi();

    this.cpm13040Service.exportCPM13040Excel(payload)
      .pipe(finalize(() => {
        this.btnLoading2 = false;
        this.messageService.unblockUi();
      }))
      .subscribe({
        next: (res) => {
          if (res.body) {
            const blob = new Blob([res.body], {
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });
            const url = globalThis.URL.createObjectURL(blob);

            // 建立 <a> 元素以觸發下載，檔名使用後端回傳的 Content-Disposition（若無則回退至預設）
            const a = document.createElement('a');
            a.href = url;
            const filenameXlsx = this.getFilenameFromResponse(res, `POS聯名卡停車優惠明細_${this.datePipe.transform(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`);
            a.download = filenameXlsx;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            globalThis.URL.revokeObjectURL(url);
          }
        },

      });
  }

  private getFilenameFromResponse(response: any, defaultName: string): string {
    try {
      const cd = response?.headers?.get?.('content-disposition') || response?.headers?.get?.('Content-Disposition');
      if (!cd) return defaultName;
      const fnStarMatch = cd.match(/filename\*=(?:UTF-8'')?([^;\n\r]+)/i);
      if (fnStarMatch && fnStarMatch[1]) {
        let name = fnStarMatch[1].trim();
        if (name.startsWith('"') && name.endsWith('"')) {
          name = name.substring(1, name.length - 1);
        }
        try { return decodeURIComponent(name); } catch { return name; }
      }
      const fnMatch = cd.match(/filename="?([^";]+)"?/i);
      if (fnMatch && fnMatch[1]) {
        return fnMatch[1];
      }
      return defaultName;
    } catch (e) {
      return defaultName;
    }
  }

}
