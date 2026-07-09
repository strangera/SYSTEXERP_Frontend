import { DatePipe } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { TLS53010Data, TLS53010ExportRequest, TLS53010Service } from '@service/api/tls/tls53010.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { AddButton, ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { createPaginationConfig, formatDate } from '@shared/componentkit/table/table.model';
import saveAs from 'file-saver';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-tls53010',
  templateUrl: './tls53010.component.html',
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
    TableReportComponent,
    TranslateModule,
    ButtonModule
  ]
})
export class TLS53010Component extends BasicQueryPageComponent<TLS53010Data> implements OnInit {
  queryForm = this.formBuilder.group({
    PST_No: ['', Validators.maxLength(15)],                     // 盤點單編號
    HOS_No: [[]],                                               // 倉別代碼 (改為陣列)
    LOGO_No: [[]],                                              // 品牌代碼 (改為陣列)
    PST_DateStart: [null],    // 盤點基準日期(起)
    PST_DateEnd: [new Date(), Validators.required],             // 盤點基準日期(迄)
    PST_Status: [[]],                                           // 盤點狀態 (多選)
    ...createPaginationConfig([{ field: 'PST_No', order: -1 }]) // 分頁和排序參數
  });

  data: TLS53010Data[] = [];
  selectedItems: TLS53010Data[] = [];
  totalRecords = 0;
  lastQueryBody: any = null;

  // 下拉選單
  hosOptions: any[] = [];// 倉別選項
  logoOptions: any[] = [];// 品牌選項
  // 盤點狀態選項
  pstStatusOptions: any[] = [
    { value: '0', label: '盤點單開立-待盤點' },
    { value: '1', label: '初盤-盤點中' },
    { value: '2', label: '複盤-盤點完成' },
    { value: '3', label: '抽盤-小盤結案' },
    { value: '4', label: '已結案' },
    { value: '9', label: '作廢' }
  ];

  columns: ReportColumn[] = [
    { field: 'id', header: '序號', visible: false },
    { field: 'PST_No', header: '盤點單編號', visible: true },
    { field: 'HOS_No', header: '倉別代碼', visible: true },
    { field: 'HOS_NAME', header: '倉別名稱', visible: true },
    { field: 'LOGO_No', header: '品牌代碼', visible: true },
    { field: 'LOGO_CH_NAME', header: '品牌名稱', visible: true },
    {
      field: 'PST_Date',
      header: '盤點基準日期',
      visible: true,
      format: formatDate
    },
    {
      field: 'PST_Status',
      header: '盤點狀態',
      visible: true,
      format: (v) => this.pstStatusOptions.find(opt => opt.value === v)?.label || v,
    },
    { field: 'PST_Remark', header: '盤點備註', visible: false },
  ];

  buttonsLoading = false;
  addButton: AddButton[] = [
    {
      label: '列印',
      icon: 'pi pi-print text-cyan-500',
      action: (rowData: TLS53010Data) => { this.onPrint(rowData); },
    },
  ];

  constructor(
    public readonly tls53010Service: TLS53010Service,
    private datePipe: DatePipe,
    private dropDownListService: DropDownListService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS53010', 'tls/tls53010cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
  }

  onSubmit(frm: FormGroup) {
    const queryRequest = {
      ...frm.getRawValue(),
      PST_DateStart: this.datePipe.transform(frm.get('PST_DateStart')?.value, 'yyyy-MM-dd') || null,
      PST_DateEnd: this.datePipe.transform(frm.get('PST_DateEnd')?.value, 'yyyy-MM-dd') || null
    }
    this.handleSubmit(frm, () => {
      this.tls53010Service.queryTLS53010(queryRequest)
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe(response => {
          this.data = response.Data;
          this.totalRecords = response.TotalCount;
          this.lastQueryBody = queryRequest;
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

  // 列印
  onPrint(rowData: TLS53010Data) {
    this.buttonsLoading = true;

    this.tls53010Service.printTLS53010(this.createDetailQueryRequest(rowData))
      .pipe(
        untilDestroyed(this),
        finalize(() => {
          this.buttonsLoading = false;
        })
      )
      .subscribe({
        next: (response: HttpResponse<Blob>) => {
          this.downloadFile(response, '盤點單報表.pdf', 'application/pdf');
        },
        error: (err: any) => {
          console.error('列印失敗:', err);
        }
      });
  }
  exportSelectedLoading = false;
  // 匯出
  onExportSelected() {
    if (this.selectedItems.length === 0) {
      // 這裡可以依據你的專案習慣加入訊息提示，例如：this.messageService.warning('請至少選擇一筆資料');
      return;
    }

    this.exportSelectedLoading = true;

    // 提取所有勾選項目的 PST_No
    const request: TLS53010ExportRequest = {
      PST_NoList: this.selectedItems.map(item => item.PST_No)
    };

    this.tls53010Service.exportTLS53010Detail(request)
      .pipe(
        untilDestroyed(this),
        finalize(() => this.exportSelectedLoading = false)
      )
      .subscribe((response: HttpResponse<Blob>) => {
        this.downloadFile(response, '盤點單明細報表.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      });
  }

  private createDetailQueryRequest(rowData: TLS53010Data) {
    return {
      MID: 0,
      PST_No: rowData.PST_No || '',
      SYS_StoreNo: rowData.SYS_StoreNo || '',
      HOS_No: rowData.HOS_No || ''
    };
  }

  editDisabled(rowdata: TLS53010Data) {
    return rowdata.PST_Status !== '0';
  }
}
