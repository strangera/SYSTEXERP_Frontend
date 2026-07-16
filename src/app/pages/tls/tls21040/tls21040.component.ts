import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { TLS21040Data, TLS21040QueryRequest, Tls21040Service } from '@service/api/tls/tls21040.service';
import { getSYS1000, getSYS1000Options } from '@service/system/sys1000.service';
import { DropDownListService, IDropdownItem } from '@service/utility/dropDownList.service';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { formatYYYYMMDD, ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { FileExportService } from '@shared/service/file-export.service';
import { AccordionModule } from 'primeng/accordion';
import { FileSelectEvent } from 'primeng/fileupload';
import { finalize } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { formatDateTime } from './../../../others/component/table/table.model';

@Component({
  selector: 'app-tls21040',
  templateUrl: './tls21040.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    MultiSelectComponent,
    InputTextComponent,
    TableReportComponent,
    TranslateModule,
    DropdownComponent,
  ],
})
export class TLS21040Component extends BasicQueryPageComponent<TLS21040Data> implements OnInit {
  @ViewChild(TableReportComponent) tableReport?: TableReportComponent;
  // public readonly Actions = Actions;
  queryForm = this.formBuilder.group({
    CRD_BinCode: ['', [Validators.maxLength(16)]],
    BNK_No: ['', [Validators.maxLength(3)]],
    CRD_TypeList: [null],
    CRD_KindList: [null],
    pageSize: [1000],
    pageIndex: [1],
    SortBy: [[{ field: 'id', order: 1 }]],
  });
  lastQueryBody: TLS21040QueryRequest | null = null;
  totalRecords = 0;
  data: TLS21040Data[] = [];
  selectedItems: TLS21040Data[] = [];

  columns: ReportColumn[] = [
    { field: 'CRD_BinCode', header: '信用卡 BIN 碼', visible: true },
    { field: 'BNK_No', header: '發卡銀行代號', visible: true },
    { field: 'BNK_Name', header: '發卡銀行名稱', visible: true },
    { field: 'CRD_Type', header: '信用卡卡別', visible: true, format: (value: string) => getSYS1000('CRD_Type', value) },
    { field: 'CRD_Kind', header: '信用卡卡種', visible: true, format: (value: string) => getSYS1000('CRD_Kind', value) },
    { field: 'Active_Date', header: '生效日期', visible: true, format: formatYYYYMMDD },
    { field: 'Disable_Date', header: '終止日期', visible: true, format: formatYYYYMMDD },
    { field: 'CRT_Date', header: '建立日期', visible: false, format: formatDateTime },
    { field: 'CRT_USR_No', header: '建立人員', visible: false },
    { field: 'CRT_USR_Name', header: '建立人員姓名', visible: false },
    { field: 'UPD_Date', header: '變更日期', visible: false, format: formatDateTime },
    { field: 'UPD_USR_No', header: '變更人員', visible: false },
    { field: 'UPD_USR_Name', header: '變更人員姓名', visible: false },
  ];
  cardTypeOptions = getSYS1000Options('CRD_Type');
  cardCategoryOptions = getSYS1000Options('CRD_Kind');
  BNK_NoOptions: IDropdownItem[] = [];
  constructor(
    public readonly tls21040Service: Tls21040Service,
    private readonly fileExportService: FileExportService,
    private readonly dropDown: DropDownListService,
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS21040', 'TLS/TLS21040cru', this.queryForm, (form) => this.onSubmit(form));

    // 取得發卡銀行下拉 (APS1001, 不含分行)
    this.dropDown.queryAPS1001NoBranch_DropDownList({ SearchKeyword: '' }).pipe(untilDestroyed(this)).subscribe({
      next: (res) => {
        if (res && res.Data) {
          this.BNK_NoOptions = res.Data.map(item => ({ No: item.No, Name: item.Name, label: `${item.No}-${item.Name}`, value: item.No }));
        }
      },
    });
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.tls21040Service.queryTLS21040(frm.getRawValue()).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe((res) => {
        this.data = res.Data;
        this.lastQueryBody = frm.getRawValue();
        this.totalRecords = res.TotalCount;
        // 若查詢有資料，自動切換至報表模式以顯示匯出/匯入按鈕
        try { if (this.data && this.data.length > 0) (this.tableReport as any).IsPrint = true; } catch { }
        this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
      })
    });
  }
  onDelete(rows: TLS21040Data[]) {
    this.messageService.confirm({
      message: `是否確認刪除此信用卡卡種?`,
      header: `確認刪除`,
      accept: () => {
        const idsToDelete = rows.map(item => item.id);
        this.loading = true; // 設置載入狀態
        this.tls21040Service.deleteTLS21040(idsToDelete).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe({
          next: (response) => {
            if (response.Status === '0000') { // 假設 '0000' 為成功狀態碼
              this.messageService.successBubble('刪除成功');
              this.selectedItems = []; // 清空選取狀態
              this.onSubmit(this.queryForm);
            } else {
              console.error('刪除失敗響應:', response);
            }
          }
        });
      }
    });
  }

  isRowSelectable(rowData: TLS21040Data): boolean {
    return rowData.CanDel
  }

  onImportExcel(event: FileSelectEvent): void {
    const file = event.files[0];
    this.tls21040Service.uploadTLS21040(file).subscribe(res => {
      if (res.Status === '0000') {
        this.messageService.successBubble(res.Message);
      } else {
        this.messageService.errorBubble(
          res.Data.Errors.join('\n'),
          res.Message
        );
        if (res.Data.ErrorFilePath) {
          globalThis.open(environment.ApiUrl + res.Data.ErrorFilePath, '_blank');
        }
      }
    })
  }
  btnLoading = false;
  excelLoading = false;
  downloadTemplate() {
    const export$ = this.tls21040Service.downloadTLS21040Template().pipe(
    );
    this.fileExportService.executeFileExport(export$.pipe(untilDestroyed(this)), '.xlsx', (isLoading) => this.btnLoading = isLoading).subscribe();
  }

  /** 自動下載錯誤檔 */
  downloadErrorFile(filePath: string) {
    globalThis.open(`${environment.ApiUrl}/${filePath}`, '_blank');
  }
}
