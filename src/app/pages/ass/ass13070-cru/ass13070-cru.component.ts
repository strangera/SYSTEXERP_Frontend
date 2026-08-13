import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ASS13070Service } from '@service/api/ass/ass13070.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { formatAmount, formatDate, ReportColumn } from '@shared/components/table-report/table-report.model';
import { FileExportService } from '@shared/service/file-export.service';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import {
  ASS13070QueryRow,
  ASS13070TransferRequest,
  ASS13070TransferResultRow,
} from '../ass13070/ass13070.model';

/** 3.1.3.7 財產保管單位設定／移轉作業（新增／移轉） */
@Component({
  selector: 'app-ass13070-cru',
  templateUrl: './ass13070-cru.component.html',
  standalone: true,
  providers: [DatePipe],
  imports: [
    AsyncPipe,
    MenubarComponent,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    PanelModule,
    ButtonComponent,
    DropdownComponent,
    CalendarComponent,
    TableReportComponent,
  ],
})
export class ASS13070CRUComponent extends BasicCruPageComponent<unknown> implements OnInit {
  public readonly dataForm = this.formBuilder.nonNullable.group({
    NEW_HOLD_ORG_ID: new FormControl<string | null>(null, [Validators.required]),
    NEW_HOLD_EMP_ID: new FormControl<string | null>(null, [Validators.required]),
    NEW_USE_ORG_ID: new FormControl<string | null>(null, [Validators.required]),
    NEW_USE_EMP_ID: new FormControl<string | null>(null, [Validators.required]),
    TRANSFER_DATE: new FormControl<Date | null>(null, [Validators.required]),
  });

  /** 由查詢頁勾選帶入（重置時還原） */
  private initialRows: ASS13070QueryRow[] = [];
  readonly tableRows = signal<(ASS13070QueryRow | ASS13070TransferResultRow)[]>([]);
  readonly transferCompleted = signal<boolean>(false);
  readonly tableLoading = signal<boolean>(false);

  readonly orgOptions$ = this.dropdownApi.querySys3100();
  empOptions: { label: string; value: string }[] = [];

  readonly columnsPreview: ReportColumn[] = [
    { field: 'DEPRE_YN_NAME', header: '財產類型' },
    { field: 'SUBPOENA_ID', header: '進貨單號' },
    { field: 'ASSET_ID', header: '財產編號' },
    {
      field: 'GOODS_NAME',
      header: '品項',
      format: (_v, _i, row: ASS13070QueryRow) =>
        row?.GOODS_NAME ?? (row?.GOODS_ID ? String(row.GOODS_ID) : ''),
    },
    { field: 'GET_DATE', header: '購入日期', format: formatDate },
    { field: 'FIR_GET_COST', header: '原購入金額', format: formatAmount },
    { field: 'ORI_ORG_NAME', header: '原保管單位' },
    { field: 'ORI_EMP_NAME', header: '原保管人' },
    { field: 'USE_ORG_NAME', header: '原使用單位' },
    { field: 'USE_EMP_NAME', header: '原使用人' },
  ];
  selectedRows: ASS13070QueryRow[] = [];
  readonly columnsResult: ReportColumn[] = [
    {
      field: 'DEPRE_YN',
      header: '財產類型',
      format: (v, _i, row: ASS13070TransferResultRow) => {
        const code = String(row?.DEPRE_YN ?? v ?? '');
        if (code === '1') return '資產';
        if (code === '2') return '列管品';
        return code;
      },
    },
    { field: 'SUBPOENA_ID', header: '進貨單號' },
    { field: 'ASSET_ID', header: '財產編號' },
    { field: 'GOODS_NAME', header: '品項' },
    {
      field: 'INPUT_DATE',
      header: '購入日期',
      format: v => (v != null && String(v) !== '' ? formatDate(String(v)) : ''),
    },
    {
      field: 'INPUT_DATE',
      header: '原購入日期',
      format: v => (v != null && String(v) !== '' ? formatDate(String(v)) : ''),
    },
    { field: 'FIR_GET_COST', header: '原購入金額', format: formatAmount },
    { field: 'ORI_ORG_NAME', header: '原保管單位' },
    { field: 'ORI_USER_NAME', header: '原保管人' },
    { field: 'ORI_USE_ORG_NAME', header: '原使用單位' },
    { field: 'ORI_USE_USER_NAME', header: '原使用人' },
    { field: 'HOLDER_ORG_NAME', header: '新保管單位' },
    { field: 'HOLDER_USER_NAME', header: '新保管人' },
    { field: 'USE_ORG_NAME', header: '新使用單位' },
    { field: 'USE_USER_NAME', header: '新使用人' },
  ];

  exportPdfLoading = false;
  exportExcelLoading = false;

  constructor(
    private readonly ass13070Service: ASS13070Service,
    private readonly dropdownApi: DropdownApiService,
    private readonly dropDownListService: DropDownListService,
    private readonly fileExportService: FileExportService,
    private readonly datePipe: DatePipe,
  ) {
    super();
  }

  ngOnInit(): void {
    const state = this.router.lastSuccessfulNavigation?.extras.state as
      | { ass13070Rows?: ASS13070QueryRow[] }
      | undefined;

    const rows = state?.ass13070Rows ?? [];

    if (rows.length === 0) {
      this.messageService.warnBubble('未帶入查詢資料，請由查詢頁勾選後進入');
      void this.router.navigate(['/account/ass/ass13070']);
      return;
    }

    // 保存查詢頁帶進來的原始資料
    this.initialRows = rows;

    // 顯示資料
    this.tableRows.set([...this.initialRows]);

    // 預設全部勾選
    this.selectedRows = [...this.initialRows];

    this.transferCompleted.set(false);

    this.initializePage('ASS13070', this.dataForm);
    this.loadEmpOptions();
  }

  private loadEmpOptions(): void {
    this.dropDownListService.queryTBLUSER_DropDownList().subscribe({
      next: res => {
        if (res.Status !== '0000') return;
        this.empOptions = (res.Data ?? []).map(item => ({
          label: `${item.No} - ${item.Name}`,
          value: item.No,
        }));
      },
    });
  }

  onConfirm(): void {
    this.submitted = true;

    if (this.dataForm.invalid) {
      this.messageService.errorBubble('請填寫完整必填欄位');
      return;
    }

    if (this.selectedRows.length === 0) {
      this.messageService.warnBubble('請至少勾選一筆財產資料');
      return;
    }

    const raw = this.dataForm.getRawValue();

    const handleDateStr =
      raw.TRANSFER_DATE != null
        ? this.datePipe.transform(raw.TRANSFER_DATE, 'yyyy-MM-dd') ?? ''
        : '';

    // API 使用的 ID
    const idList = this.selectedRows.map(r => r.ID).filter((id): id is number => id != null);

    const payload: ASS13070TransferRequest = {
      ID_LIST: idList,
      NEW_HOLD_ORG_ID: String(raw.NEW_HOLD_ORG_ID ?? ''),
      NEW_HOLD_EMP_ID: String(raw.NEW_HOLD_EMP_ID ?? ''),
      NEW_USE_ORG_ID: String(raw.NEW_USE_ORG_ID ?? ''),
      NEW_USE_EMP_ID: String(raw.NEW_USE_EMP_ID ?? ''),
      HANDLE_DATE: handleDateStr,
    };

    this.loading = true;

    this.ass13070Service
      .transferASS13070(payload)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(res => {
        if (res.Status !== '0000') {
          this.messageService.errorBubble(res.Message ?? '轉移財產失敗');
          return;
        }
        this.messageService.successBubble('轉移財產成功');
        this.loadTransferResult();
      });
  }

  private loadTransferResult(): void {
    this.tableLoading.set(true);
    const idList = this.selectedRows
      .map(r => r.ID)
      .filter((id): id is number => id != null);
    this.ass13070Service
      .transferResultASS13070({ ID_LIST: idList })
      .pipe(finalize(() => this.tableLoading.set(false)))
      .subscribe({
        next: res => {
          if (res.Status !== '0000') {
            this.messageService.errorBubble(res.Message ?? '取得轉移結果失敗');
            return;
          }
          this.onCancel();
          this.transferCompleted.set(true);
          this.tableRows.set(res.Data ?? []);
        },
      });
  }

  onReset(): void {
    this.submitted = false;
    this.transferCompleted.set(false);

    this.dataForm.reset({
      NEW_HOLD_ORG_ID: null,
      NEW_HOLD_EMP_ID: null,
      NEW_USE_ORG_ID: null,
      NEW_USE_EMP_ID: null,
      TRANSFER_DATE: null,
    });

    const rows = this.initialRows;

    this.tableRows.set(rows);

    // 重置後重新全部勾選
    this.selectedRows = [...rows];
  }

  onExportPdf(): void {

    // API 使用的 ID
    const idList = this.selectedRows
      .map(r => r.ID)
      .filter((id): id is number => id != null);
    if (idList.length === 0) return;
    const req$ = this.ass13070Service.exportPDFASS13070({ ID_LIST: idList });
    this.fileExportService
      .executeFileExport(req$, '.pdf', v => (this.exportPdfLoading = v))
      .subscribe();
  }

  onExportExcel(): void {
    const idList = this.selectedRows
      .map(r => r.ID)
      .filter((id): id is number => id != null);
    if (idList.length === 0) return;
    const req$ = this.ass13070Service.exportExcelASS13070({ ID_LIST: idList });
    this.fileExportService
      .executeFileExport(req$, '.xlsx', v => (this.exportExcelLoading = v))
      .subscribe();
  }
}
