import { CommonModule } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ASS13100Service } from '@service/api/ass/ass13100.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { Pos2002LocationItem } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarRangeComponent } from '@shared/components/calendar-range/calendar-range.component';
import { DialogComponent } from '@shared/components/dialog/dialog.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { FileUploadComponent } from '@shared/components/file-upload/file-upload.component';
import { InputTextRangeComponent } from '@shared/components/input-text-range/input-text-range.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { ReportColumn } from '@shared/components/table-report/table-report.model';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { AccordionModule } from 'primeng/accordion';
import { BreadcrumbModule } from "primeng/breadcrumb";
import { ButtonModule } from 'primeng/button';
import { FileSelectEvent, FileUploadHandlerEvent } from 'primeng/fileupload';
import { finalize } from 'rxjs/operators';
import {
  ASS13100ExportPDFRequest,
  ASS13100QueryRow,
  QueryASS13100Request,
  Status,
} from './ass13100.model';

// 3.1.3.10 資產清點作業
@Component({
  selector: 'app-ass13100',
  templateUrl: './ass13100.component.html',
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
    CalendarRangeComponent,
    TableReportComponent,
    ButtonModule,
    DialogComponent,
    FileUploadComponent,
    BreadcrumbModule
  ],
})
export class ASS13100Component extends BasicQueryPageComponent<ASS13100QueryRow> implements OnInit {
  @ViewChild(FileUploadComponent) fileUpload?: FileUploadComponent;

  /** 查詢條件 Form（API 欄位：CHK_ID_S/E, CHK_DATE_S/E, CHK_EMP_ID, LOCATION_ID, STATUS, CHK_STATUS, NOTES） */
  readonly queryForm = this.formBuilder.group({
    CHK_ID_S: new FormControl<string | null>(null),
    CHK_ID_E: new FormControl<string | null>(null),
    CHK_DATE_S: new FormControl<Date | null>(null),
    CHK_DATE_E: new FormControl<Date | null>(null),
    CHK_EMP_ID: new FormControl<string | null>(null),
    LOCATION_ID: new FormControl<string | null>(null),
    STATUS: new FormControl<string | null>(null),
    CHK_STATUS: new FormControl<string | null>(null),
    NOTES: new FormControl<string | null>(null),
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
    { field: 'CHK_ID', header: '清點單號' },
    { field: 'CHK_DATE', header: '清點日期' },
    { field: 'FIRST_CHK_EMP_ID', header: '清點人代碼' },
    { field: 'STATUS_NAME', header: '清點單狀態' },
  ];
  lastQueryBody?: QueryASS13100Request;
  selectedItems: ASS13100QueryRow[] = [];
  /** 已結案 的 checkbox 不可選取 */
  readonly isRowSelectable = (row: ASS13100QueryRow): boolean => row?.STATUS !== Status.Completed;

  /** 上傳盤點機檔案 Dialog 狀態 */
  uploadDialogVisible = false;
  uploading = false;
  uploadChkIdControl = new FormControl<string>('', { nonNullable: true });
  private selectedUploadFile: File | null = null;

  get canUploadDeviceFile(): boolean {
    return !!this.selectedUploadFile && !!this.uploadChkIdControl.value.trim() && !this.uploading;
  }

  /** 查詢條件是否已完整輸入清點單號起迄 */
  get hasInventoryRange(): boolean {
    const from = (this.queryForm.controls.CHK_ID_S.value ?? '').toString().trim();
    const to = (this.queryForm.controls.CHK_ID_E.value ?? '').toString().trim();
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

    // CRU 產生成功選「前往明細」時會先導向本頁並帶 openDetailCHK_ID / openDetailID，再導向 CRU 明細
    const state = this.router.lastSuccessfulNavigation?.extras?.state as {
      openDetailCHK_ID?: string;
      openDetailID?: number;
    } | undefined;
    const chkId = state?.openDetailCHK_ID;
    const id = state?.openDetailID;
    if (chkId != null) {
      this.navigateWithState(
        CRUDStatus.Read,
        { CHK_ID: chkId, ID: id } as ASS13100QueryRow,
        this.queryForm.getRawValue()
      );
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
    // 位置代碼：queryPOS2002_Location_DropDownList
    this.dropdownApi
      .queryPos2002Location()
      ?.subscribe((options: Pos2002LocationItem[] | null) => {
        this.locationOptions = (options ?? [])
          .filter((x: Pos2002LocationItem) => !!x.location_no)
          .map((x: Pos2002LocationItem) => ({
            label: `${x.location_no} - ${x.building_desc ?? ''} ${x.floor_desc ?? ''} ${x.area_desc ?? ''}`.trim(),
            value: x.location_no!,
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
        PageIndex: 1,

        CHK_ID_S: raw.CHK_ID_S ?? null,
        CHK_ID_E: raw.CHK_ID_E ?? null,
        CHK_DATE_S: raw.CHK_DATE_S ? raw.CHK_DATE_S.toISOString() : null,
        CHK_DATE_E: raw.CHK_DATE_E ? raw.CHK_DATE_E.toISOString() : null,
        CHK_EMP_ID: raw.CHK_EMP_ID ?? null,
        LOCATION_ID: raw.LOCATION_ID ?? null,
        STATUS: raw.STATUS ?? null,
        CHK_STATUS: raw.CHK_STATUS ?? null,
        NOTES: raw.NOTES ?? null,
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

    const ids = items
      .map(x => x.ID)
      .filter((x): x is number => x != null && typeof x === 'number');

    if (!ids.length) {
      this.messageService.warnBubble('選取的資料缺少 ID，無法刪除');
      return;
    }

    this.messageService.confirm({
      header: '確認刪除',
      message: `是否確認刪除 ${ids.length} 筆清點單？`,
      accept: () => {
        this.loading = true;
        this.service
          .deleteASS13100({ Ids: ids })
          .pipe(finalize(() => (this.loading = false)))
          .subscribe(res => {
            if (res?.Status === '0000') {
              this.messageService.successBubble('刪除成功');
              this.selectedItems = [];
              this.onSubmit(this.queryForm);
            }
          });
      },
    });
  }

  /** 開啟上傳盤點機檔案視窗 */
  /** 開啟上傳盤點機檔案視窗 */
  openUploadDialog(): void {
    // 未勾選
    if (!this.selectedItems || this.selectedItems.length === 0) {
      this.messageService.warnBubble('請先勾選一筆清點單');
      return;
    }

    // 僅允許單筆上傳
    if (this.selectedItems.length > 1) {
      this.messageService.warnBubble('上傳盤點機檔案一次只能選擇一筆清點單');
      return;
    }

    const selectedRow = this.selectedItems[0];
    const chkId = selectedRow.CHK_ID?.trim();

    if (!chkId) {
      this.messageService.warnBubble('選取的資料沒有清點單號');
      return;
    }

    this.selectedUploadFile = null;

    // 自動帶入勾選資料的清點單號
    this.uploadChkIdControl.setValue(chkId);

    this.fileUpload?.clearFiles();

    this.uploadDialogVisible = true;
  }

  onUploadFileSelect(event: FileSelectEvent): void {
    const files = event.files ?? [];
    this.selectedUploadFile = files.length > 0 ? files[0] : null;
  }

  /** 自訂上傳事件（由 app-file-upload 觸發） */
  handleCustomUpload(event: FileUploadHandlerEvent): void {
    const chkId = this.uploadChkIdControl.value.trim();
    if (!chkId) {
      this.messageService.warnBubble('請先輸入清點單號');
      return;
    }

    if (!event.files || event.files.length === 0) {
      this.messageService.errorBubble('上傳檔案為空');
      return;
    }

    const file = event.files[0];
    if (!file?.name.toLowerCase().endsWith('.csv')) {
      this.messageService.errorBubble('僅允許上傳 .csv 檔案');
      return;
    }

    this.uploading = true;
    this.service
      .uploadASS13100(file, chkId)
      .pipe(finalize(() => (this.uploading = false)))
      .subscribe({
        next: res => {
          if (res?.Status === '0000' && (res.Data?.ErrCode ?? 0) === 0) {
            this.messageService.successBubble(res.Message ?? '上傳成功');
            this.uploadDialogVisible = false;
            this.selectedUploadFile = null;
            this.uploadChkIdControl.setValue('');
            this.fileUpload?.clearFiles();
            return;
          }

          this.messageService.errorBubble(res.Data?.ErrMsg ?? res.Message ?? '上傳失敗');
        },
      });
  }

  /** 確認上傳盤點機檔案 */
  confirmUpload(): void {
    this.uploadDialogVisible = false;
    this.uploadChkIdControl.setValue('');
    this.selectedUploadFile = null;
    this.fileUpload?.clearFiles();
  }

  /** 匯出資產清點作業 PDF */
  onPrintInventoryReport(): void {
    // 未勾選
    if (!this.selectedItems || this.selectedItems.length === 0) {
      this.messageService.warnBubble('請先勾選一筆清點單');
      return;
    }

    // 僅允許單筆列印
    if (this.selectedItems.length > 1) {
      this.messageService.warnBubble('列印盤點表一次只能選擇一筆清點單');
      return;
    }

    const selectedRow = this.selectedItems[0];
    const chkId = selectedRow.CHK_ID?.trim();

    if (!chkId) {
      this.messageService.warnBubble('選取的資料沒有清點單號');
      return;
    }

    const body: ASS13100ExportPDFRequest = {
      CHK_ID_S: chkId,
      CHK_ID_E: chkId,
    };

    this.loading = true;

    this.service
      .exportPDFASS13100(body)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (response: HttpResponse<Blob>) => {
          const contentDisposition =
            response.headers.get('Content-Disposition');

          const filename =
            this.getFilenameFromHeader(
              contentDisposition,
              '.pdf'
            );

          const blob = response.body;

          if (blob && blob.size > 0) {
            const url =
              globalThis.URL.createObjectURL(blob);

            const a = document.createElement('a');

            a.href = url;
            a.download = filename;

            document.body.appendChild(a);
            a.click();

            globalThis.URL.revokeObjectURL(url);
            document.body.removeChild(a);
          }
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

  /** 下載盤點機上傳 CSV 範例 */
  downloadCsvTemplate(): void {
    const csvContent =
      '\uFEFF財產編號,數量\r\n' +
      'A000001,1\r\n' +
      'A000002,1\r\n';

    const blob = new Blob(
      [csvContent],
      { type: 'text/csv;charset=utf-8;' }
    );

    const url = globalThis.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'ASS13100_盤點機上傳範例.csv';

    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    globalThis.URL.revokeObjectURL(url);
  }

}
