import { DropDownListService, IDropdownItem } from './../../../service/utility/dropDownList.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, createPaginationConfig, formatAmount } from '@shared/componentkit/table/table.model';
import { untilDestroyed } from '@ngneat/until-destroy';
import { QueryPLUResponse, QueryTLS57040Request, Tls57040Service } from '@service/api/tls/tls57040.service';
import { DropdownTableComponent, FieldsConfig } from '@shared/componentkit/dropdown-table/dropdown-table.component';
import { debounceTime, finalize } from 'rxjs';
import { yesterday } from '@shared/models/system/query-form.model';
import { DetailData, QueryTLS57050Request, SummaryData, Tls57050Service } from '@service/api/tls/tls57050.service';
import { DatePipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { HttpResponse } from '@angular/common/http';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';

@Component({
  selector: 'app-tls57050',
  templateUrl: './tls57050.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    InputTextComponent,
    CalendarRangeComponent,
    ButtonComponent,
    TableComponent,
    TranslateModule,
    DropdownTableComponent,
    ButtonModule,
    InputNumberComponent
  ],
})
export class TLS57050Component extends BasicQueryPageComponent<DetailData | SummaryData> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    ReportType: [1, [Validators.required]],
    TXN_Date_Start: [yesterday, [Validators.required]],
    TXN_Date_End: [yesterday, [Validators.required]],
    LOGO_No: [null],
    VEN_No: [null],
    ECR_No: [null],
    TXN_SaleNoteNo: [null, [Validators.maxLength(30)]],
    TXN_No: [null, [Validators.maxLength(8)]],
    PLU_MagNo: ['', [Validators.maxLength(20)]],
    PLU_No: [null, [Validators.maxLength(20)]],
    PLU_OrgPLUNo: [null],
    ...createPaginationConfig([{ field: 'TXN_SaleNoteNo', order: 1 }]),
  });
  totalRecords = 0;
  displayModeOptions = [
    { value: 1, label: '匯總' },
    { value: 2, label: '明細' },
  ];
  warehouseOptions: IDropdownItem[] = [];
  ECR_NoOptions: IDropdownItem[] = [];
  brandCodeOptions: IDropdownItem[] = [];
  vendorOptions: IDropdownItem[] = [];
  // 商品管理編號 (dropdown-table)
  opLoading = false;
  opForm = this.formBuilder.group({
    queryNo: ['', [Validators.maxLength(20)]], // 管理編號
    PLU_Name: ['', [Validators.maxLength(60)]], // 商品名稱
    ...createPaginationConfig([{ field: 'PLU_MagNo', order: 1 }]),
  });
  suggestions: QueryPLUResponse[] = [];
  opData: QueryPLUResponse[] = [];
  opTotalRecords = 0;
  fieldsConfig: FieldsConfig[] = [
    { field: 'PLU_MagNo', header: '商品管理編號', mainDataField: true },
  ];
  opColumns: Column[] = [
    { field: 'PLU_MagNo', header: '商品管理編號' },
    { field: 'PLU_No', header: '國際條碼' },
    { field: 'PLU_OrgPLUNo', header: '廠商貨號' },
    { field: 'PLU_Name', header: '商品名稱' },
  ];
  data: (DetailData[] | SummaryData[]) = [];
  columns: Column[] = [];
  historyRequestBody: QueryTLS57050Request | null = null;

  constructor(
    private readonly dropDownListService: DropDownListService,
    private readonly tls57050Service: Tls57050Service,
    private readonly tls57040Service: Tls57040Service,
    private datePipe: DatePipe
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS57050', 'tls/tls57050cru', this.queryForm, (form) => this.onSubmit(form));
    this.updateTableColumns(this.queryForm.controls.ReportType.value);
    this.queryForm.controls.ReportType.valueChanges.pipe(untilDestroyed(this)).subscribe(mode => {
      this.updateTableColumns(mode);
    });
    this.dropDownListService.getPOS2034Options().pipe(untilDestroyed(this)).subscribe(response => {
      this.warehouseOptions = response.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}` }));// 倉別
    });
    this.dropDownListService.queryPOS1002_DropDownList().pipe(untilDestroyed(this)).subscribe(response => {
      this.ECR_NoOptions = response.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}` }));// 收銀機
    })
    this.dropDownListService.queryPLULOGO_DropDownList().pipe(untilDestroyed(this)).subscribe(response => {
      this.brandCodeOptions = response.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}` }));// 品牌
    })
    this.dropDownListService.queryPOS2013_DropDownList().pipe(untilDestroyed(this)).subscribe(response => {
      this.vendorOptions = response.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}` })); // 廠商
    })
  }
  updateTableColumns(displayMode: number | null) {
    if (displayMode === 1) { // 彙總模式
      this.columns = [
        { field: 'TXN_SaleNoteNo', header: '銷貨單號' },
        { field: 'TXN_Date', header: '交易日期' },
        { field: 'ECR_No', header: '收銀機號' },
        { field: 'TXN_No', header: '交易序號' },
        { field: 'LOGO_No', header: '品名' },
        { field: 'LOGO_CH_NAME', header: '品牌名稱' },
        { field: 'GUINO', header: '發票號碼' },
        { field: 'TXN_TotQty', header: '數量' },
        { field: 'PLU_SalePrc', header: '銷售定價', format: formatAmount },
        { field: 'TXN_TotSaleAmt', header: '銷售金額', format: formatAmount },
        { field: 'TotRebate', header: '整張折讓' },
        { field: 'TotDisc', header: '整張折扣' },
      ];
      this.data = [];
    } else if (displayMode === 2) { // 明細模式
      this.columns = [
        { field: 'TXN_SaleNoteNo', header: '銷貨單號' },
        { field: 'TXN_Date', header: '交易日期' },
        { field: 'ECR_No', header: '收銀機號' },
        { field: 'TXN_No', header: '交易序號' },
        { field: 'LOGO_No', header: '品名' },
        { field: 'LOGO_CH_NAME', header: '品牌名稱' },
        { field: 'GUINO', header: '發票號碼' },
        { field: 'PLU_MagNo', header: '商品管理編號' },
        { field: 'PLU_No', header: '國際條碼' },
        { field: 'PLU_Name', header: '品名' },
        { field: 'TXN_Qty', header: '數量' },
        { field: 'PLU_SalePrc', header: '銷售定價', format: formatAmount },
        { field: 'TXN_SaleAmt', header: '銷售金額', format: formatAmount },
        { field: 'TotRebate', header: '整張折讓' },
        { field: 'TotDisc', header: '整張折扣' },
      ];
      this.data = [];
    } else {
      this.columns = [];
      this.data = [];
    }
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {

      const formValue = frm.value;
      const displayMode = formValue.ReportType;
      const requestBody: QueryTLS57050Request = {
        ReportType: displayMode === 1 ? '彙總' : '明細',
        TXN_Date_Start: formValue.TXN_Date_Start ? this.datePipe.transform(formValue.TXN_Date_Start, 'yyyy-MM-dd') ?? undefined : undefined,
        TXN_Date_End: formValue.TXN_Date_End ? this.datePipe.transform(formValue.TXN_Date_End, 'yyyy-MM-dd') ?? undefined : undefined,
        LOGO_No: formValue.LOGO_No,
        VEN_No: formValue.VEN_No,
        ECR_No: formValue.ECR_No,
        TXN_SaleNoteNo: formValue.TXN_SaleNoteNo,
        TXN_No: formValue.TXN_No,
        PLU_MagNo: formValue.PLU_MagNo,
        PLU_No: formValue.PLU_No,
        PLU_OrgPLUNo: formValue.PLU_OrgPLUNo,
        pageIndex: frm.value.pageIndex,
        pageSize: frm.value.pageSize,
        SortBy: frm.value.SortBy,
      };

      this.tls57050Service.queryTLS57050(requestBody).pipe(
        untilDestroyed(this),
        finalize(() => this.loading = false)
      ).subscribe(response => {
        if (response.Data) {
          this.totalRecords = response.TotalCount || 0;
          this.historyRequestBody = requestBody;
          if (requestBody.ReportType === '明細') {
            this.data = response.Data.DetailData || [];
          } else {
            this.data = response.Data.SummaryData || [];
          }
          this.queryStateService.setQueryState(this.ProgNo, frm.value);
        } else {
          this.data = [];
          this.totalRecords = 0;
          this.messageService.warnBubble(response.Message || '沒有找到符合條件的資料。');
        }
      });
    })
  }
  // 商品管理編號 (dropdown-table) 的自動完成輸入事件
  onAutoCompleteInputChange(event: any) {
    const body = {
      queryNo: event.PLU_MagNo || '',
      PLU_MagNo: undefined,
      pageSize: 30,
      pageIndex: 1,
      SortBy: [{ field: 'PLU_MagNo', order: 1 }],
    }
    this.tls57040Service.queryPLUForDropdown(body).pipe(untilDestroyed(this), debounceTime(300)).subscribe((results) => {
      this.suggestions = [...results.Data.map(item => ({
        ...item,
        label: `${item.PLU_MagNo} - ${item.PLU_Name}`
      }))];
    });
  }
  // 商品管理編號 (dropdown-table) 的表單值改變事件
  onformValueChanged(event: QueryTLS57040Request) {
    this.opLoading = true;
    const body = {
      ...event,
      queryNo: undefined,
      PLU_MagNo: event.queryNo || '',
      PLU_No: event.PLU_No || '',
      PLU_OrgPLUNo: event.PLU_OrgPLUNo || '',
      PLU_Name: event.PLU_Name || '',
    };
    this.tls57040Service.queryPLUForDropdown(body).pipe(untilDestroyed(this), debounceTime(300)).subscribe((results) => {
      this.opData = [...results.Data]; // 更新data資料
      this.opTotalRecords = results.TotalCount;
      this.opLoading = false;
    });
  }
  onExportPDF() {
    if (!this.historyRequestBody) {
      this.messageService.warnBubble('請先執行查詢以產生報表。');
      return;
    }
    this.btnLoading = true;
    this.tls57050Service.exportTLS57050PDF(this.historyRequestBody).pipe(
      untilDestroyed(this),
      finalize(() => this.btnLoading = false)
    ).subscribe({
      next: (response: HttpResponse<Blob>) => {
        this.handleFileExport(response, '.pdf');
      },
    });
  }
  btnLoading = false;
  onExportXLSX() {
    if (!this.historyRequestBody) {
      this.messageService.warnBubble('請先執行查詢以產生報表。');
      return;
    }
    this.btnLoading = true;
    this.tls57050Service.exportTLS57050Excel(this.historyRequestBody).pipe(
      untilDestroyed(this),
      finalize(() => this.btnLoading = false)
    ).subscribe({
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
        return filenameMatch[1];
      }
    }

    return `download${defaultExtension}`;
  }
}
