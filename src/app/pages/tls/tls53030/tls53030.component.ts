import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { finalize, Observable } from 'rxjs';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig, Column, AddButton, formatDate, formatAmount } from '../../../shared/componentkit/table/table.model';
import { TLS53030Data, TLS53030DetailData, TLS53030Service } from '../../../service/api/tls/tls53030.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { untilDestroyed } from '@ngneat/until-destroy';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { HttpResponse } from '@angular/common/http';
import saveAs from 'file-saver';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';

@Component({
  selector: 'app-tls53030',
  templateUrl: './tls53030.component.html',
  styleUrl: './tls53030.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    MultiSelectComponent,
    CalendarRangeComponent,
    TableComponent,
    TranslateModule,
    RadiobuttonComponent
  ]
})
export class TLS53030Component extends BasicQueryPageComponent<TLS53030Data> implements OnInit {
  queryForm = this.formBuilder.group({
    PST_No: ['', Validators.maxLength(15)],                     // 盤點單編號
    HOS_No: [[]],                                               // 倉庫代碼 (改為陣列)
    LOGO_No: [[]],                                              // 品牌代碼 (改為陣列)
    PST_DateStart: [null],                                      // 盤點基準日期(起)
    PST_DateEnd: [new Date(), Validators.required],             // 盤點基準日期(迄)
    PST_Status: [[]],                                           // 盤點單狀態 (多選)
    showDiff: [true],                                          // 是否顯示盤點差異欄位
    ...createPaginationConfig([{ field: 'PST_No', order: -1 }]) // 分頁和排序參數
  });

  data: TLS53030Data[] = [];
  selectedItems: TLS53030Data[] = [];
  totalRecords = 0;

  // 下拉選單
  hosOptions: any[] = [];       // 倉別選項
  logoOptions: any[] = [];      // 品牌選項

  // 盤點單狀態選項
  pstStatusOptions: any[] = [
    { value: '0', label: '盤點資料維護作業-待盤點' },
    { value: '1', label: '初盤-盤點中' },
    { value: '2', label: '複盤-盤點完成' },
    { value: '3', label: '抽盤-小盤結案' },
    { value: '4', label: '已結案' },
    { value: '9', label: '作廢' }
  ];

  // 盤點類別選項
  pstTypeOptions: any[] = [
    { value: '1', label: '初盤' },
    { value: '2', label: '複盤' },
    { value: '3', label: '抽盤' }
  ];

  // 顯示差異選項
  showDiffOptions: any[] = [
    { label: '只顯示有差異資料', value: true },
    { label: '全部', value: false },
  ];

  columns: Column[] = [
    { field: 'id', header: '序號', visible: false },
    { field: 'PST_No', header: '盤點單編號', visible: true },
    { field: 'HOS_No', header: '倉庫代碼', visible: true },
    { field: 'HOS_NAME', header: '倉庫名稱', visible: true },
    { field: 'LOGO_No', header: '品牌代碼', visible: true },
    { field: 'LOGO_CH_NAME', header: '品牌名稱', visible: true },
    {
      field: 'PST_Date',
      header: '盤點基準日期',
      visible: true,
      format: formatDate
    },
    {
      field: 'PST_Type',
      header: '盤點類別',
      visible: true,
      format: (v) => this.pstTypeOptions.find(opt => opt.value === v)?.label || v,
    },
    {
      field: 'PST_Status',
      header: '盤點狀態',
      visible: true,
      format: (v) => this.pstStatusOptions.find(opt => opt.value === v)?.label || v,
    },
  ];

  loadingStates: Map<number, { export: boolean }> = new Map();
  addButton: AddButton[] = [
    {
      label: '列印試算表',
      icon: 'pi pi-file-pdf text-red-500',
      action: (rowData: TLS53030Data) => { this.onExportPDF(rowData); },
      loading: (rowData: TLS53030Data) => this.getLoadingState(rowData.id, 'export'),
    },
  ];

  // 取得 loading 狀態
  getLoadingState(id: number, action: 'export'): boolean {
    return this.loadingStates.get(id)?.[action] || false;
  }

  // 設定 loading 狀態
  setLoadingState(id: number, action: 'export', loading: boolean): void {
    if (!this.loadingStates.has(id)) {
      this.loadingStates.set(id, { export: false });
    }
    const state = this.loadingStates.get(id)!;
    state[action] = loading;
  }

  // 展開行設置
  expansionColumns: Column[] = [
    { field: 'PLU_PageNum', header: '貨架編號', visible: true },
    { field: 'PLU_MagNo', header: '商品管理編號', visible: true },
    { field: 'PLU_Name', header: '商品名稱', visible: true },
    { field: 'PLU_No', header: '國際條碼', visible: true },
    { field: 'PLU_Unit', header: '單位代碼', visible: true },
    { field: 'UNIT_NAME', header: '單位名稱', visible: true },
    { field: 'SYS_STOCK_QTY', header: '庫存量', visible: true, format: formatAmount },
    { field: 'PST_Qty1', header: '初盤數量', visible: true, format: formatAmount },
    { field: 'PST_Qty2', header: '複盤數量', visible: true, format: formatAmount },
    { field: 'PST_Qty3', header: '抽盤數量', visible: true, format: formatAmount },
    { field: 'DIFF_Qty', header: '差異量', visible: true, format: formatAmount },
  ];

  constructor(
    private tls53030Service: TLS53030Service,
    private datePipe: DatePipe,
    private dropDownListService: DropDownListService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS53030', '', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
    this.setupShowDiffWatcher();
  }

  onSubmit(frm: FormGroup) {
    const queryRequest = {
      ...frm.getRawValue(),
      PST_DateStart: this.datePipe.transform(frm.get('PST_DateStart')?.value, 'yyyy-MM-dd') || null,
      PST_DateEnd: this.datePipe.transform(frm.get('PST_DateEnd')?.value, 'yyyy-MM-dd') || null
    };

    this.handleSubmit(frm, () => {
      this.tls53030Service.queryTLS53030(queryRequest)
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe(response => {
          this.data = response.Data;
          this.totalRecords = response.TotalCount;
          this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
        });
    });
  }

  loadOptions() {
    // 倉別選項
    this.dropDownListService.getPOS2034Options()
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.hosOptions = response.Data.map(item => ({
          value: item.No,
          label: `${item.No}-${item.Name}`
        }));
      });

    // 品牌選項
    this.dropDownListService.queryPLULOGO_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.logoOptions = response.Data.map(item => ({
          value: item.No,
          label: `${item.No}-${item.Name}`
        }));
      });
  }

  // 監聽 showDiff 變化，動態顯示/隱藏差異量欄位
  setupShowDiffWatcher() {
    this.queryForm.controls.showDiff.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(showDiff => {
        const diffColumn = this.expansionColumns.find(col => col.field === 'DIFF_Qty');
        if (diffColumn) {
          diffColumn.visible = showDiff || false;
        }
      });
  }

  private extractFilenameFromResponse(response: HttpResponse<Blob>, defaultFilename: string): string {
    const contentDisposition = response.headers.get('content-disposition');
    let filename = defaultFilename;

    if (contentDisposition) {
      const filenameRegex = /filename\*=UTF-8''(.+?)(?:\.[^.]+)?$|filename="(.+?)(?:\.[^.]+)?"$/;
      const matches = contentDisposition.match(filenameRegex);
      if (matches) {
        filename = matches[1] || matches[2] || filename;
        filename = decodeURIComponent(filename);
      }
      filename = filename.replace(/["']/g, '');
    }

    return filename;
  }

  private downloadFile(response: HttpResponse<Blob>, defaultFilename: string, mimeType: string): void {
    if (!response.body) {
      console.error('下載失敗：檔案內容為空');
      return;
    }

    const filename = this.extractFilenameFromResponse(response, defaultFilename);
    const blob = new Blob([response.body], { type: mimeType });
    saveAs(blob, filename);
    console.log('下載成功:', filename);
  }

  // 匯出盤點試算表PDF
  onExportPDF(rowData: TLS53030Data) {
    this.setLoadingState(rowData.id, 'export', true);

    const payload = {
      MID: rowData.MID,
      PST_No: rowData.PST_No || '',
      SYS_StoreNo: rowData.SYS_StoreNo || '',
      HOS_No: rowData.HOS_No || '',
      PST_Date: this.datePipe.transform(rowData.PST_Date, 'yyyy-MM-dd') || ''
    };

    this.tls53030Service.exportTLS53030DetailPDF(payload)
      .pipe(
        untilDestroyed(this),
        finalize(() => {
          this.setLoadingState(rowData.id, 'export', false);
        })
      )
      .subscribe({
        next: (response: HttpResponse<Blob>) => {
          this.downloadFile(response, '盤點試算表.pdf', 'application/pdf');
        },
        error: (err: any) => {
          console.error('匯出失敗:', err);
        }
      });
  }

  // 載入明細資料
  loadDetails = (rowData: TLS53030Data): Observable<BaseQueryResponse<TLS53030DetailData>> => {
    return this.tls53030Service.queryTLS53030Detail(this.createDetailQueryRequest(rowData));
  }

  private createDetailQueryRequest(rowData: TLS53030Data) {
    return {
      MID: rowData.MID || 0,
      PST_No: rowData.PST_No || '',
      SYS_StoreNo: rowData.SYS_StoreNo || '',
      HOS_No: rowData.HOS_No || ''
    };
  }
}