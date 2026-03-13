import { CommonModule } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ASS13100Service } from '@service/api/ass/ass13100.service';
import { IDropdownItem } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { FileUploadComponent } from '@shared/componentkit/file-upload/file-upload.component';
import { InputTextRangeComponent } from '@shared/componentkit/input-text-range/input-text-range.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { FileUploadHandlerEvent } from 'primeng/fileupload';
import { finalize } from 'rxjs/operators';
import { ASS13100PrintRequest, ASS13100QueryRow, QueryASS13100Request } from './ass13100.model';

// 3.1.3.10 資產清點作業
@Component({
  selector: 'app-ass13100',
  templateUrl: './ass13100.component.html',
  styleUrl: './ass13100.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    InputTextRangeComponent,
    InputTextComponent,
    DropdownComponent,
    CalendarRangeQuickComponent,
    TableReportComponent,
    ButtonModule,
    DialogComponent,
    FileUploadComponent,
  ],
})
export class ASS13100Component extends BasicQueryPageComponent<ASS13100QueryRow> implements OnInit {
  @ViewChild(FileUploadComponent) fileUpload?: FileUploadComponent;

  /** 查詢條件 Form */
  readonly queryForm = this.formBuilder.group({
    InventoryNoFrom: new FormControl<string | null>(null),
    InventoryNoTo: new FormControl<string | null>(null),
    InventoryDateFrom: new FormControl<Date | null>(null),
    InventoryDateTo: new FormControl<Date | null>(null),
    InventoryPersonCode: new FormControl<string | null>(null),
    LocationCode: new FormControl<string | null>(null),
    InventoryStatus: new FormControl<string | null>(null),
    InventoryDataStatus: new FormControl<string | null>(null),
    Remark: new FormControl<string | null>(null),
    pageSize: new FormControl<number>(30),
    pageIndex: new FormControl<number>(1),
  });

  /** 下拉選項（查詢條件） */
  inventoryPersonOptions: { label: string; value: string }[] = [];
  locationOptions: { label: string; value: string }[] = [];
  inventoryStatusOptions: { label: string; value: string }[] = [];
  inventoryDataStatusOptions: { label: string; value: string }[] = [];

  /** 表格資料與狀態 */
  data: ASS13100QueryRow[] = [];
  totalRecords = 0;
  columns: ReportColumn[] = [
    { field: 'InventoryNo', header: '清點單號' },
    { field: 'InventoryDate', header: '清點日期' },
    { field: 'InventoryPersonCode', header: '清點人代碼' },
    { field: 'InventoryStatusName', header: '清點單狀態' },
  ];
  lastQueryBody?: QueryASS13100Request;
  selectedItems: ASS13100QueryRow[] = [];

  /** 上傳盤點機檔案 Dialog 狀態 */
  uploadDialogVisible = false;
  uploading = false;

  /** 查詢條件是否已完整輸入清點單號起迄 */
  get hasInventoryRange(): boolean {
    const from = (this.queryForm.controls.InventoryNoFrom.value ?? '').toString().trim();
    const to = (this.queryForm.controls.InventoryNoTo.value ?? '').toString().trim();
    return !!from && !!to;
  }

  constructor(
    public readonly service: ASS13100Service,
    private readonly dropdownApi: DropdownApiService,
    private readonly dropDownListService: DropDownListService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS13100', 'ass/ass13100cru', this.queryForm, frm => this.onSubmit(frm));
    this.loadDropdowns();

    // CRU 產生成功選「前往明細」時會先導向本頁並帶 openDetailInventoryNo，再導向 CRU 明細
    const state = this.router.lastSuccessfulNavigation?.extras?.state as { openDetailInventoryNo?: string } | undefined;
    const openDetailInventoryNo = state?.openDetailInventoryNo;
    if (openDetailInventoryNo) {
      this.navigateWithState(CRUDStatus.Read, { InventoryNo: openDetailInventoryNo } as ASS13100QueryRow, this.queryForm.getRawValue());
    }
  }

  /** 覆寫新增：導向 CRU 頁（新增模式） */
  override onCreate(): void {
    if (!this.hasPermission(this.Actions.Create)) {
      return;
    }
    super.onCreate(undefined, this.queryForm.getRawValue());
  }

  /** 載入下拉選單資料 */
  private loadDropdowns(): void {
    // 清點人 / 清點員工代碼：queryTBLUSER_DropDownList
    this.dropdownApi.queryTblUser()?.subscribe((options: { label: string; value: string }[] | null) => {
      this.inventoryPersonOptions = (options ?? []).map(x => ({
        label: `${x.label}`,
        value: x.value,
      }));
    });

    // 位置代碼：queryPOS2002_Location_DropDownList
    this.dropdownApi.queryPos2002Location()?.subscribe((options: IDropdownItem[] | null) => {
      this.locationOptions = (options ?? []).map(x => ({
        label: `${x.Name}`,
        value: x.No,
      }));
    });

    // 清點單狀態：SYS1000.SYS_TYPE = 'ASSET_CHK_STATUS'
    this.dropDownListService
      .querySYS1000_DropDownList({ SYS_Type: 'ASSET_CHK_STATUS' })
      .subscribe(res => {
        const list = res?.Data ?? [];
        this.inventoryStatusOptions = list.map(x => ({
          label: `${x.Name}`,
          value: x.No,
        }));
      });

    // 清點狀態(資料)：SYS1000.SYS_TYPE = 'CHK_STATUS'
    this.dropDownListService
      .querySYS1000_DropDownList({ SYS_Type: 'CHK_STATUS' })
      .subscribe(res => {
        const list = res?.Data ?? [];
        this.inventoryDataStatusOptions = list.map(x => ({
          label: `${x.Name}`,
          value: x.No,
        }));
      });
  }

  /** 查詢送出 */
  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const raw = frm.getRawValue();
      const body: QueryASS13100Request = {
        PageSize: raw.pageSize ?? 30,
        PageIndex: raw.pageIndex ?? 1,
        InventoryNoFrom: raw.InventoryNoFrom ?? null,
        InventoryNoTo: raw.InventoryNoTo ?? null,
        InventoryDateFrom: raw.InventoryDateFrom ? raw.InventoryDateFrom.toISOString() : null,
        InventoryDateTo: raw.InventoryDateTo ? raw.InventoryDateTo.toISOString() : null,
        InventoryPersonCode: raw.InventoryPersonCode ?? null,
        LocationCode: raw.LocationCode ?? null,
        InventoryStatus: raw.InventoryStatus ?? null,
        InventoryDataStatus: raw.InventoryDataStatus ?? null,
        Remark: raw.Remark ?? null,
      };

      this.lastQueryBody = body;
      this.loading = true;
      this.service
        .queryASS13100(body)
        .pipe(finalize(() => (this.loading = false)))
        .subscribe((res: ApiResponse<ASS13100QueryRow[]>) => {
          if (res?.Status === '0000') {
            this.data = res.Data ?? [];
            this.totalRecords = res.TotalCount ?? this.data.length;
            this.queryStateService.setQueryState(this.ProgNo, raw);
          } else {
            this.data = [];
            this.totalRecords = 0;
          }
        });
    });
  }

  /** 多筆刪除 */
  onDelete(event: ASS13100QueryRow[] | ASS13100QueryRow): void {
    const items = Array.isArray(event) ? event : [event];
    if (!items.length) {
      this.messageService.warnBubble('請先勾選要刪除的清點單');
      return;
    }

    const inventoryNoList = items
      .map(x => x.InventoryNo)
      .filter((x): x is string => !!x);

    if (!inventoryNoList.length) {
      this.messageService.warnBubble('選取的資料缺少清點單號，無法刪除');
      return;
    }

    this.messageService.confirm({
      header: '確認刪除',
      message: `是否確認刪除 ${inventoryNoList.length} 筆清點單？`,
      accept: () => {
        this.loading = true;
        this.service
          .deleteASS13100({ InventoryNoList: inventoryNoList })
          .pipe(finalize(() => (this.loading = false)))
          .subscribe(res => {
            if (res?.Status === '0000') {
              this.messageService.successBubble('刪除成功');
              this.selectedItems = [];
              this.onSubmit(this.queryForm);
            } else {
              this.messageService.errorBubble(res?.Message ?? '刪除失敗');
            }
          });
      },
    });
  }

  /** 開啟上傳盤點機檔案視窗 */
  openUploadDialog(): void {
    if (!this.hasInventoryRange) {
      this.messageService.warnBubble('請先輸入清點單號起迄');
      return;
    }

    this.fileUpload?.clearFiles();
    this.uploadDialogVisible = true;
  }

  /** 自訂上傳事件（由 app-file-upload 觸發） */
  handleCustomUpload(event: FileUploadHandlerEvent): void {
    if (!event.files || event.files.length === 0) {
      this.messageService.errorBubble('上傳檔案為空');
      return;
    }

    const raw = this.queryForm.getRawValue();
    const inventoryNoFrom = (raw.InventoryNoFrom ?? '').toString().trim();
    const inventoryNoTo = (raw.InventoryNoTo ?? '').toString().trim();

    if (!inventoryNoFrom || !inventoryNoTo) {
      this.messageService.warnBubble('請先輸入清點單號起迄');
      return;
    }

    const file = event.files[0];

    this.uploading = true;
    this.service
      .uploadASS13100DeviceFile(file, inventoryNoFrom, inventoryNoTo)
      .pipe(finalize(() => (this.uploading = false)))
      .subscribe({
        next: res => {
          if (res && (res as { Status?: string }).Status === '0000') {
            const message = (res as { Message?: string }).Message ?? '上傳成功';
            this.messageService.successBubble(message);
            this.uploadDialogVisible = false;
            this.fileUpload?.clearFiles();
          } else {
            const message = (res as { Message?: string } | null | undefined)?.Message ?? '上傳失敗';
            this.messageService.errorBubble(message);
          }
        },
        error: () => {
          this.messageService.errorBubble('上傳失敗（網路或伺服器錯誤）');
        },
      });
  }

  /** 確認上傳盤點機檔案 */
  confirmUpload(): void {
    // 目前上傳流程改由 app-file-upload 的 uploadHandler 觸發，這裡僅關閉視窗並清空檔案。
    this.uploadDialogVisible = false;
    this.fileUpload?.clearFiles();
  }

  /** 列印盤點表 */
  onPrintInventoryReport(): void {
    const raw = this.queryForm.getRawValue();
    const inventoryNoFrom = (raw.InventoryNoFrom ?? '').toString().trim();
    const inventoryNoTo = (raw.InventoryNoTo ?? '').toString().trim();

    if (!inventoryNoFrom || !inventoryNoTo) {
      this.messageService.warnBubble('請先輸入清點單號起迄');
      return;
    }

    const body: ASS13100PrintRequest = {
      InventoryNoFrom: inventoryNoFrom,
      InventoryNoTo: inventoryNoTo,
    };

    this.loading = true;
    this.service
      .printASS13100(body)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (response: HttpResponse<Blob>) => {
          const contentDisposition = response.headers.get('Content-Disposition');
          const filename = this.getFilenameFromHeader(contentDisposition, '.pdf');
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
            this.messageService.errorBubble('盤點表列印失敗');
          }
        },
        error: () => {
          this.messageService.errorBubble('盤點表列印失敗');
        },
      });
  }

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
      } catch {
        return encodedFilename;
      }
    }

    const filenameMatch = /filename="([^"]+)"/.exec(contentDisposition);
    if (filenameMatch && filenameMatch.length > 1) {
      try {
        return decodeURIComponent(filenameMatch[1].replace(/\+/g, ' '));
      } catch {
        return filenameMatch[1];
      }
    }

    return `download${defaultExtension}`;
  }
}
