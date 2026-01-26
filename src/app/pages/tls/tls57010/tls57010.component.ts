import { AsyncPipe, NgIf } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Tls57010DataItem, Tls57010Request, Tls57010Service } from '@service/api/tls/tls57010.service';
import { QueryPLUResponse, Tls57040Service } from '@service/api/tls/tls57040.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { CustomFooterTableComponent } from '@shared/componentkit/custom-footer-table/customFooterTable.component';
import { DropdownTableComponent, FieldsConfig } from '@shared/componentkit/dropdown-table/dropdown-table.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { ColumnGroup, ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { convertDateToYYYYMM, formatAmount, LazyLoadEvent } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';

@Component({
  selector: 'app-tls57010',
  templateUrl: './tls57010.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    MultiSelectComponent,
    ButtonComponent,
    NgIf,
    ButtonModule,
    TranslateModule,
    AsyncPipe,
    DropdownComponent,
    CustomFooterTableComponent,
    CalendarRangeQuickComponent,
    InputTextComponent,
    DropdownTableComponent
  ],
})
export class TLS57010Component extends BasicQueryPageComponent<Tls57010DataItem> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    pageIndex: [1],
    pageSize: [20],
    SortBy: [[{ field: 'PO_No', order: 1 }]], // 預設排序
    APPLY_Date_Start: [new Date()],
    APPLY_Date_End: [new Date()],
    PO_NO: [null, [Validators.maxLength(16)]],
    VEN_No: [null],
    PLU_MagNo: [null, [Validators.maxLength(20)]],
    PO_StatusList: [null],
    LOGO_NoList: [null],
    ShowType: ['M', [Validators.required]],
  });
  VEN_NoOptions = this.dropdown.queryPos2013TltTalent(); // 廠商選項
  PO_StatusListOptions = getSYS1000Options('PO_Status');
  LOGO_NoListOptions = this.dropdown.queryPluLogo(); // 品牌選項
  showTypeOptions = [
    { label: '彙總', value: 'M' },
    { label: '明細', value: 'D' },
  ]
  totalRecords = 0;
  lastQueryBody: Tls57010Request | null = null;
  DetailSumData: Tls57010DataItem[] = [];
  footerData: Tls57010DataItem[] = [];
  data: Tls57010DataItem[] = [];
  columns: ReportColumn[] = [];
  columnGroup: ColumnGroup[] = [
    { field: 'POD', header: '採購金額' },
  ]
  constructor(
    public readonly tls57040Service: Tls57040Service,
    public readonly tls57010Service: Tls57010Service,
    private readonly dropdown: DropdownApiService,
    private readonly cdr: ChangeDetectorRef,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS57010');
    this.updateTableColumns('M');
    this.queryForm.get('ShowType')?.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(val => {
        setTimeout(() => {
          this.updateTableColumns(val);
          this.data = [];
          this.footerData = [];
          this.totalRecords = 0;
          this.cdr.detectChanges();
        });
      });
  }
  updateTableColumns(displayMode: string | null) {
    if (displayMode === 'M') { // 彙總模式
      this.columns = [
        // 採購單資訊 (作為彙總依據)
        { field: 'APPLY_Date', header: '採購日期' },
        { field: 'PO_No', header: '採購單號' },
        { field: 'SYS_Name', header: '單據狀態' }, // 明細/總會都有

        // 彙總數量 (明細和彙總都有這些欄位)
        { field: 'OrderedQty', header: '採購量', format: formatAmount, isTotal: true, isSubTotal: true },
        { field: 'ReceivedQty', header: '已進量', format: formatAmount, isTotal: true, isSubTotal: true },

        // 彙總金額
        { field: 'POD_BuyNet', header: '進價(未稅)', format: formatAmount, isTotal: true, isSubTotal: true, groupField: 'POD' },
        { field: 'POD_SaleAmt', header: '定價(含稅)', format: formatAmount, isTotal: true, isSubTotal: true, groupField: 'POD' },

        // 註: SYS_Name, OrderedQty, ReceivedQty, RemainingQty, POD_BuyNet, POD_SaleAmt
        // 由於彙總資料只有這些，不再包含 PLU 相關欄位。
      ];
      this.data = [];
    } else if (displayMode === 'D') { // 明細模式
      this.columns = [
        // 基本資訊
        { field: 'APPLY_Date', header: '採購日期' }, // 明細/總會都有
        { field: 'PO_No', header: '採購單號' },     // 明細/總會都有
        { field: 'SYS_Name', header: '單據狀態' }, // 明細/總會都有

        // 商品資訊 (明細獨有)
        { field: 'PLU_No', header: '國際條碼' },
        { field: 'PLU_MagNo', header: '管理編號' },
        { field: 'PLU_Name', header: '品名' },

        // 數量
        { field: 'OrderedQty', header: '採購量', format: formatAmount, isSubTotal: true, isTotal: true },
        { field: 'ReceivedQty', header: '已進量', format: formatAmount, isSubTotal: true, isTotal: true },

        // 金額
        { field: 'POD_BuyNet', header: '進價(未稅)', format: formatAmount, isSubTotal: true, isTotal: true, groupField: 'POD' },
        { field: 'POD_SaleAmt', header: '定價(含稅)', format: formatAmount, isSubTotal: true, isTotal: true, groupField: 'POD' },
      ];
      this.data = [];
    } else {
      this.columns = [];
      this.data = [];
    }
  }
  override onLazyLoadData(event: LazyLoadEvent, form: FormGroup) {
    form.value.pageIndex = event.pageIndex;
    form.value.pageSize = event.pageSize;
    form.value.SortBy = event.SortBy;
    this.onSubmit(form);
  }
  onSubmit(frm: FormGroup) {
    this.updateTableColumns(frm.value.ShowType);
    this.handleSubmit(frm, () => {
      const body = {
        ...frm.value,
        STK_YM: convertDateToYYYYMM(frm.value.STK_YM),
        SortBy: frm.value.ShowType === 'M' ?
          [
            { field: 'PO_No', order: 1 }] :
          [
            { field: 'PO_No', order: 1 }, { field: 'APPLY_Date', order: 1 },
          ]
      }
      this.tls57010Service.queryTLS57010(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((res) => {
        this.DetailSumData = res.DetailSumData;
        this.lastQueryBody = body;
        this.footerData = [{ ...res.SumData }]
        this.data = res.Data;
        this.totalRecords = res.TotalCount;
      })
    })
  }
  onExportPDF() {
    if (!this.lastQueryBody) {
      this.messageService.warnBubble('請先執行查詢以產生報表。');
      return;
    }
    this.btnLoading = true;
    this.tls57010Service.exportTLS57010PDF(this.lastQueryBody).pipe(untilDestroyed(this), finalize(() => this.btnLoading = false)).subscribe({
      next: (response: HttpResponse<Blob>) => {
        this.handleFileExport(response, '.pdf');
      },
    });
  }
  btnLoading = false;
  onExportXLSX() {
    if (!this.lastQueryBody) {
      this.messageService.warnBubble('請先執行查詢以產生報表。');
      return;
    }
    this.btnLoading = true;
    this.tls57010Service.exportTLS57010(this.lastQueryBody).pipe(untilDestroyed(this), finalize(() => this.btnLoading = false)).subscribe({
      next: (response: HttpResponse<Blob>) => {
        this.handleFileExport(response, '.xlsx');
      },
    });
  }

  // 處理檔案匯出的通用邏輯
  private handleFileExport(response: HttpResponse<Blob>, fileExtension: string): void {
    const contentDisposition = response.headers.get('Content-Disposition');
    const filename = this.getFilenameFromHeader(contentDisposition, fileExtension);
    const blob = response.body;

    if (blob && blob.size > 0) {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } else {
      this.messageService.warnBubble('沒有找到符合條件的資料，無法生成報表。');
    }
  }

  // 輔助方法：從 header 獲取檔名
  private getFilenameFromHeader(contentDisposition: string | null, defaultExtension: string): string {
    if (!contentDisposition) {
      return `download${defaultExtension}`;
    }

    const filenameStarMatch = /filename\*=([^;]+)/.exec(contentDisposition);
    if (filenameStarMatch && filenameStarMatch.length > 1) {
      const encodedFilename = filenameStarMatch[1];
      try {
        const decoded = decodeURIComponent(encodedFilename.replace(/^UTF-8''/, ''));
        return decoded;
      } catch (error) {
        console.error('Failed to decode filename*', error);
        return encodedFilename;
      }
    }

    const filenameMatch = /filename="([^"]+)"/.exec(contentDisposition);
    if (filenameMatch && filenameMatch.length > 1) {
      try {
        return decodeURIComponent(filenameMatch[1].replace(/\+/g, ' '));
      } catch (error) {
        console.error('Failed to decode filename', error);
        return filenameMatch[1];
      }
    }

    return `download${defaultExtension}`;
  }
  // 商品管理編號 (dropdown-table)
  suggestions: QueryPLUResponse[] = [];
  fieldsConfig: FieldsConfig[] = [
    { field: 'PLU_No', header: '國際條碼/商品管理編號/廠商貨號', mainDataField: true },
  ];

  // 商品管理編號 (dropdown-table) 的自動完成輸入事件
  onAutoCompleteInputChange(event: Record<'label', string>) {
    const body = {
      queryNo: event.label || '',
      PLU_MagNo: undefined,
      pageSize: 30,
      pageIndex: 1,
      SortBy: [{ field: 'PLU_MagNo', order: 1 }],
    }
    this.tls57040Service.queryPLUForDropdown(body).pipe(untilDestroyed(this)).subscribe((results) => {
      this.suggestions = [...results.Data.map(item => ({
        ...item,
        label: item.PLU_No + '/' + item.PLU_MagNo + '/' + item.PLU_OrgPLUNo + ' - ' + item.PLU_Name
      }))];
    });
  }
}
