import { DatePipe, NgIf } from '@angular/common';
import { Component, OnInit, computed, effect, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TLS26080Service } from '@service/api/tls/tls26080.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column, RowEditSaveEvent } from '@shared/componentkit/table/table.model';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { ApprovalStatus } from '@shared/models/tls/approval-status.model';
import { NGXLogger } from 'ngx-logger';
import { FileUpload, FileUploadHandlerEvent, FileUploadModule } from 'primeng/fileupload';
import { PanelModule } from 'primeng/panel';
import { tap } from 'rxjs';
import * as XLSX from 'xlsx';
import { TLS26080Data, TLS26080Detail, TLS2608InsertPayload } from '../tls26080/tls26080.model';

@Component({
  selector: 'app-tls26080-cru',
  templateUrl: './tls26080-cru.component.html',
  styleUrl: './tls26080-cru.component.scss',
  standalone: !0,
  imports: [
    NgIf,
    FileUploadModule,
    FormsModule,
    PanelModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    CalendarComponent,
    CalendarRangeComponent,
    DropdownComponent,
    InputTextComponent,
    MenubarComponent,
    TableComponent,
  ]
})
export class TLS26080CRUComponent extends BasicCruPageComponent<TLS26080Data> implements OnInit {

  public dataForm = this.formBuilder.group({
    talent_id: new FormControl<number | undefined>(void 0), // 活動編號
    tlt_id: new FormControl<string | undefined>(void 0), // 專櫃編號
    tlt_id_desc: new FormControl<string | undefined>(void 0), // 專櫃名稱
    pod_no: new FormControl<string>('自動給號', [Validators.maxLength(10)]), // 活動單號
    pod_desc: new FormControl<string | undefined>(void 0, [Validators.required]), // 活動名稱
    pod_sdate: new FormControl<Date>(this.service.dateS, [Validators.required]), // 起始日期(起)
    pod_edate: new FormControl<Date>(this.service.dateE, [Validators.required]), // 起始日期(迄)
    pod_busdate: new FormControl<Date | undefined>(void 0, [Validators.required]), // 活動正檔日期
    pod_status: new FormControl<string>(ApprovalStatus.未核准), // 核准狀態
    pod_type: new FormControl<'1' | '2' | '8'>('2'), // 活動類型
    org_id: new FormControl<string | undefined>(void 0), // 部門
  });
  public readonly df = computed(() => this.dataForm.controls);

  public calcDateType = [
    { label: '活動起始日至截止日', value: 'Y' },
    { label: '正檔日至截止日', value: 'N' }
  ];

  private fileSignal = signal<FormData | undefined>(void 0);
  public fileUpload = viewChild.required<FileUpload>('fileUpload');

  private podDescSignal = toSignal(this.df().pod_desc.valueChanges);

  public readonly totalRecords = computed(() => this.service.TLS26080Detail().length);

  private readonly selectedCampaign = computed(() => {
    const podDesc = this.podDescSignal();
    return this.service.campaignData().find(campaign => campaign.CampaignId === podDesc);
  });

  // private counterData = new Map<string, CounterData>();
  // private deductionData = new Map<string, DeductionItem>();

  // public selectedCounter?: CounterData;

  public readonly fileUploadEffect = effect(() => {
    const file = this.fileSignal();
    if (!file) return;
    this.service.uploadFile(file);
    this.logger.debug(`fileUploadEffect:`, [file]);
  });

  /** 抓取全部podNos */
  public readonly podNosEffect = effect(() => {
    this.podNos.clear();
    for (const item of this.service.TLS26080Data()) this.podNos.add(item.pod_no);
    this.logger.debug(`podNos:`, [this.service.TLS26080Data(), Array.from(this.podNos)]);
  });

  /** 根據選擇的活動名稱更新表單 */
  public readonly campaignEffect = effect(() => {
    const podDesc = this.podDescSignal();
    if (!podDesc || !this.selectedCampaign()) return;
    this.dataForm.patchValue({
      pod_no: this.selectedCampaign()!.CampaignId,
      pod_sdate: new Date(this.selectedCampaign()!.StartTime),
      pod_edate: new Date(this.selectedCampaign()!.EndTime),
    });
    this.logger.debug(`campaignEffect:`, [this.selectedCampaign(), podDesc]);
  }, { allowSignalWrites: !0 });

  public readonly loadingEffect = effect(() => {
    this.loading = this.service.dataLoading()
      || this.service.approvalStatusLoading()
      || this.service.campaignLoading()
      || this.service.capItemsLoading()
      || this.service.fileUploadLoading()
      || this.service.exampleDownLoading();
  });

  // 環友資料表
  campaignColumns: Column[] = [
    { field: 'CampaignId', header: '活動編號' },
    { field: 'CampaignName', header: '活動名稱' },
    { field: 'StartTime', header: '活動開始時間', format: v => this.datePipe.transform(v, 'YYYY/MM/dd') },
    { field: 'EndTime', header: '活動結束時間', format: v => this.datePipe.transform(v, 'YYYY/MM/dd') },
    { field: 'AccountingType', header: '帳務拆分類別' },
    { field: 'Remark', header: '活動備註' },
  ];

  // 專櫃資料表
  public readonly counterColumns: Column[] = [
    { field: 'talent_id', header: '專櫃編號', type: 'inputNumber' },
    { field: 'tlt_name', header: '櫃位名稱', type: 'input' },
    { field: 'tlt_id', header: '抽成類別', type: 'inputNumber' },
    { field: 'tlt_id_desc', header: '抽成類別名稱', type: 'input' },
    {
      field: 'calc_date_type',
      header: '預售起日計算',
      type: 'dropdown',
      optionShowClear: !1,
      options: this.calcDateType,
      format: v => v === 'Y' ? '活動起始日至截止日' : '正檔日至截止日',
    },
    { field: 'tpy_rate_D16', header: 'D16', groupField: 'groupField1', type: 'inputNumber', validate: [this.numVal], suffix: '%', fractionDigits: 2 },
    { field: 'tpy_rate_D17', header: 'D17', groupField: 'groupField1', type: 'inputNumber', validate: [this.numVal], suffix: '%', fractionDigits: 2 },
    { field: 'tpy_rate_3', header: 'D16', groupField: 'groupField2', suffix: '%', fractionDigits: 2 },
    { field: 'tpy_rate_4', header: 'D17', groupField: 'groupField2', suffix: '%', fractionDigits: 2 },
    { field: 'pod_status', header: '審核狀態', format: this.service.approvalStatus },
    { field: 'approved_usr_name', header: '審核人員' },
    { field: 'approved_date', header: '審核日期', format: v => this.datePipe.transform(v, 'YYYY/MM/dd HH:mm') },
  ];

  public readonly counterColumnsGroup: Column[] = [
    { field: 'groupField1', header: '匯入分攤' },
    { field: 'groupField2', header: '合約建檔' },
  ];

  // 扣款項目資料表
  // deductionColumns: Column[] = [
  //   { field: 'itemCode', header: '扣款項目編號' },
  //   { field: 'itemName', header: '扣款項目名稱' },
  //   { field: 'amountOrRate', header: '金額/比率' }
  // ];

  private podNos = new Set<string>();

  constructor(
    public readonly service: TLS26080Service,
    private readonly datePipe: DatePipe,
    private readonly logger: NGXLogger,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.initializePage('TLS26080', this.dataForm);
    if (this.crudstatus !== CRUDStatus.Create) this.service.loadTLS26080Detail(this.rowdata!.pod_no || '');
    // this.service.loadTLS26080({ pod_sdate: this.df().pod_sdate.value!, pod_edate: this.df().pod_edate.value! });
    this.service.loadAPS1003(['E']);
    this.service.loadCampaignData();
    this.logger.debug(`init:`, [this.rowdata, this.crudstatus, this.dataForm.value]);
  }

  public onInsert(event: RowEditSaveEvent): void {
    const d = event.newData as TLS26080Detail;
    const payload: TLS26080Detail = {
      ...d,
      tlt_id: String(d.tlt_id),
      tlt_no: String(d.talent_id),
      pod_status: '0',
      cap_item_D16: 'D16',
      cap_item_D17: 'D17',
      tpy_rate_D16: String(d.tpy_rate_D16),
      tpy_rate_D17: String(d.tpy_rate_D17),
    };
    this.service.keyInTLS26080(payload);
    this.logger.debug(`onInsert:`, [d, event]);
  }

  // 表單提交
  public onSubmit(): void {
    this.handleSubmit(this.dataForm, () => {
      const d = this.dataForm.getRawValue();
      const payload = <TLS2608InsertPayload>{
        ...d,
        pod_no: d.pod_no,
        pod_desc: d.pod_desc,
        pod_sdate: d.pod_sdate,
        pod_edate: d.pod_edate,
        pod_busdate: d.pod_busdate,
        pod_type: d.pod_type,
        TALPORDERD_VOUCHERDetails: this.service.TLS26080Detail().map(item => ({
          ...item,
          pod_no: d.pod_no,
          pod_type: d.pod_type,
        })),
      };

      this.service.insertTLS26080(payload).pipe(
        tap(() => this.dataForm.reset()),
      ).subscribe({
        next: () => this.messageService.successBubble('新增成功'),
        error: () => this.messageService.errorBubble('新增失敗'),
      });
    });
  }

  private numVal(value: string): { isValid: boolean; errorMessage: string[]; } {
    this.logger.debug(`numValidator:`, [value]);
    const num = Number(value);
    if (isNaN(num) || !isFinite(num)) return { isValid: !1, errorMessage: ['請輸入有效的數字'] };
    if (num < 0 || num > 100) return { isValid: !1, errorMessage: ['請輸入有效的數字'] };
    return { isValid: !0, errorMessage: [] };
  }

  public async handleUpload(event: FileUploadHandlerEvent): Promise<void> {
    const formData = new FormData();
    formData.append('file', event.files[0]);
    this.fileSignal.set(formData);
    this.fileUpload().clear();
  }

  public onExportExcelTemplate(): void {
    /** 手動控制 local 生成或從 api 下載 */
    const exampleByApi = !0;
    const headerRow1 = ['專櫃編號', '櫃位名稱', '抽成類別', '抽成類別名稱', '正檔起日計算', '匯入分攤', null, '合約建檔'];
    const headerRow2 = [null, null, null, null, null, 'D16', 'D17', 'D16', 'D17'];
    const example = ['000064', 'gozo', '0', '少女裝', 'Y', '1.00%', '50.00%'];
    if (exampleByApi) return void this.service.downloadXLSXExample();

    // 生成工作表
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([headerRow1, headerRow2, example]);

    // 合併儲存格
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } }, // A1:A2
      { s: { r: 0, c: 1 }, e: { r: 1, c: 1 } }, // B1:B2
      { s: { r: 0, c: 2 }, e: { r: 1, c: 2 } }, // C1:C2
      { s: { r: 0, c: 3 }, e: { r: 1, c: 3 } }, // D1:D2
      { s: { r: 0, c: 4 }, e: { r: 1, c: 4 } }, // E1:E2
      { s: { r: 0, c: 5 }, e: { r: 0, c: 6 } }, // F1:G1（匯入分攤）
      { s: { r: 0, c: 7 }, e: { r: 0, c: 8 } }, // H1:I1（合約建檔）
    ];

    // 修改欄位大小
    ws['!cols'] = [
      { wch: 8 },  // A
      { wch: 8 },  // B
      { wch: 8 },  // C
      { wch: 12 }, // D
      { wch: 12 }, // E
      { wch: 8 },  // F
      { wch: 8 },  // G
      { wch: 8 },  // H
      { wch: 8 },  // I
    ];

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '範本');
    const name = `專櫃活動設定匯入範本.xlsx`;
    // const name = `專櫃活動設定匯入範本-${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, name);
  };
}
