import { DatePipe } from '@angular/common';
import { Component, computed, effect, OnInit, signal, viewChild } from '@angular/core';
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
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { Column, FieldChangeEvent } from '@shared/componentkit/table/table.model';
import { ApprovalStatus } from '@shared/models/tls/approval-status.model';
import { NGXLogger } from 'ngx-logger';
import { FileUpload, FileUploadHandlerEvent, FileUploadModule } from 'primeng/fileupload';
import { PanelModule } from 'primeng/panel';
import { finalize, tap } from 'rxjs';
import * as XLSX from 'xlsx';
import { CampaignData, TLS26080Data, TLS26080Detail, TLS2608InsertPayload } from '../tls26080/tls26080.model';

@Component({
  selector: 'app-tls26080-cru',
  templateUrl: './tls26080-cru.component.html',
  styleUrl: './tls26080-cru.component.scss',
  standalone: !0,
  imports: [
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
    TableEditComponent,
  ]
})
export class TLS26080CRUComponent extends BasicCruPageComponent<TLS26080Data> implements OnInit {

  public readonly fileUpload = viewChild.required<FileUpload>('fileUpload');

  public readonly dataForm = this.formBuilder.nonNullable.group({
    pod_no: new FormControl<string | void>(void 0, [Validators.maxLength(10)]), // 活動單號
    pod_desc: new FormControl<string | void>(void 0, [Validators.required]), // 活動名稱
    pod_sdate: new FormControl<Date>(this.service.dateS, [Validators.required]), // 起始日期(起)
    pod_edate: new FormControl<Date>(this.service.dateE, [Validators.required]), // 起始日期(迄)
    pod_busdate: new FormControl<Date | void>(void 0, [Validators.required]), // 活動正檔日期
    pod_type: new FormControl<'2'>('2', [Validators.required]), // 活動類型
  });
  public readonly df = computed(() => this.dataForm.controls);

  public readonly tls26080Data = signal<TLS26080Data[]>([]);
  public readonly tableData = signal<TLS26080Detail[]>([]);
  public readonly totalRecords = signal(0);
  public readonly campaignData = signal<CampaignData[]>([]);

  // 頁面專屬 Loading 狀態
  public readonly tableLoading = signal<boolean>(!1);
  public readonly uploadLoading = signal<boolean>(!1);
  public readonly downloadLoading = signal<boolean>(!1);
  public readonly campaignLoading = signal<boolean>(!1);

  public readonly calcDateType = [
    { label: '活動起始日至截止日', value: 'Y' },
    { label: '正檔日至截止日', value: 'N' }
  ];

  private readonly podDescSignal = toSignal(this.df().pod_desc.valueChanges);

  private readonly selectedCampaign = computed(() => {
    const podDesc = this.podDescSignal();
    return this.campaignData().find(d => d.CampaignId === podDesc);
  });

  /** 根據選擇的活動名稱更新表單 */
  public readonly campaignEffect = computed(() => {
    const podDesc = this.podDescSignal();
    if (!podDesc || !this.selectedCampaign()) return;
    this.dataForm.patchValue({
      pod_no: this.selectedCampaign()!.CampaignId,
      pod_sdate: new Date(this.selectedCampaign()!.StartTime),
      pod_edate: new Date(this.selectedCampaign()!.EndTime),
    });
    this.logger.debug(`campaignEffect:`, [this.selectedCampaign(), podDesc]);
  });

  public readonly podNo = effect(() => {
    const data = this.campaignData();
    if (!data || data.length === 0) return;
    this.df().pod_no.patchValue(this.selectedCampaign()?.CampaignId);
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

  public readonly defaultInsertData = {
    pod_status: ApprovalStatus.未核准,
  };

  // 專櫃資料表
  public readonly counterColumns = computed<EditColumn[]>(() => [
    {
      field: 'talent_id',
      header: '專櫃編號',
      type: this.isFormReadable ? void 0 : 'dropdown',
      showClear: !1,
      options: this.service.tltTalentOptions(),
      optionLabel: 'label',
      optionValue: 'value',
      format: v => this.service.tltTalentMap().get(v) ?? v,
    },
    {
      field: 'tlt_id',
      header: '抽成類別',
      type: this.isFormReadable ? void 0 : 'dropdown',
      showClear: !1,
      options: this.service.tltTalentChargeOptions(),
      optionLabel: 'label',
      optionValue: 'value',
      format: v => this.service.tltTalentChargeMap().get(v)?.label ?? v,
    },
    {
      field: 'calc_date_type',
      header: '預售起日計算',
      type: this.isFormReadable ? void 0 : 'dropdown',
      showClear: !1,
      options: this.calcDateType,
      optionLabel: 'label',
      optionValue: 'value',
      format: v => v === 'Y' ? '活動起始日至截止日' : '正檔日至截止日',
    },
    {
      field: 'tpy_rate_D16',
      header: 'D16',
      groupField: 'groupField1',
      type: this.isFormReadable ? void 0 : 'percent',
      validate: [this.numVal],
      maxFractionDigits: 2,
      format: v => this.isFormReadable ? String(v) + '%' : v,
    },
    {
      field: 'tpy_rate_D17',
      header: 'D17',
      groupField: 'groupField1',
      type: this.isFormReadable ? void 0 : 'percent',
      validate: [this.numVal],
      maxFractionDigits: 2,
      format: v => this.isFormReadable ? String(v) + '%' : v,
    },
    { field: 'tpy_rate_3', header: 'D16', groupField: 'groupField2', },
    { field: 'tpy_rate_4', header: 'D17', groupField: 'groupField2', },
    { field: 'pod_status', header: '審核狀態', format: this.service.approvalStatus },
    { field: 'approved_usr_name', header: '審核人員' },
    { field: 'approved_date', header: '審核日期', format: v => this.datePipe.transform(v, 'YYYY/MM/dd') },
  ]);

  public readonly counterColumnsGroup: Column[] = [
    { field: 'groupField1', header: '匯入分攤' },
    { field: 'groupField2', header: '合約建檔' },
  ];

  /** 驗證表單和表格資料是否完整 */
  public readonly isSubmitDisabled = computed(() => {
    // 驗證表單是否有效
    // if (!this.dataForm.valid) return !0;

    if (!this.df().pod_sdate || !this.df().pod_edate || !this.df().pod_busdate) return !0;

    // 取得有效的表格資料（排除自動新增的候選行）
    const validTableData = this.tableData().filter(item => !item._isAutoInsertCandidate);

    // 至少要有一筆專櫃資料
    if (!validTableData.length) return !0;

    // 驗證每筆表格資料的必填欄位
    return validTableData.some(item => {
      if (!item.talent_id || !item.calc_date_type) return !0;

      const rate_D16 = Number(item.tpy_rate_D16);
      const rate_D17 = Number(item.tpy_rate_D17);
      if (isNaN(rate_D16) || isNaN(rate_D17)) return !0;

      const basisPoint_D16 = Math.round(rate_D16 * 100);
      const basisPoint_D17 = Math.round(rate_D17 * 100);
      if (basisPoint_D16 < 0 || basisPoint_D16 > 1e4 || basisPoint_D17 < 0 || basisPoint_D17 > 1e4) return !0;

      return !1;
    });
  });

  constructor(
    public readonly service: TLS26080Service,
    private readonly datePipe: DatePipe,
    private readonly logger: NGXLogger,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.initializePage('TLS26080', this.dataForm);
    if (!this.rowdata?.pod_no && !this.isFormCreateable) this.onCancel();

    if (!this.isFormCreateable) {
      this.tableLoading.set(!0);
      this.service.loadTLS26080Detail(this.rowdata!.pod_no).pipe(
        tap(res => {
          const data = res.Data;
          this.tableData.set(data.map(v => ({
            ...v,
            tpy_rate_D16: Number(v.tpy_rate_D16) / 100,
            tpy_rate_D17: Number(v.tpy_rate_D17) / 100,
          })));
          this.totalRecords.set(res.TotalCount || 0);
        }),
        finalize(() => this.tableLoading.set(!1))
      ).subscribe();
    }

    this.service.getTLTTalentOptions();
    this.service.loadAPS1003(['E']);

    this.campaignLoading.set(!0);
    this.service.loadCampaignData().pipe(
      tap(res => this.campaignData.set(res.Data)),
      finalize(() => this.campaignLoading.set(!1))
    ).subscribe();
  }

  public onSubmit(): void {
    this.handleSubmit(this.dataForm, () => {
      const d = this.dataForm.getRawValue();
      this.logger.debug(`onSubmit:`, [d]);
      const validTableData = this.tableData().filter(item => !item._isAutoInsertCandidate);
      if (!validTableData?.length) { this.loading = !1; return this.messageService.errorBubble('請至少新增一筆專櫃資料'); };

      const invalidRow = validTableData.find(item =>
        !item.talent_id || !item.calc_date_type);
      if (invalidRow) { this.loading = !1; return this.messageService.errorBubble('請填寫所有必填欄位'); };

      const payload = <TLS2608InsertPayload>{
        ...d,
        pod_sdate: d.pod_sdate!.toISOString(),
        pod_edate: d.pod_edate!.toISOString(),
        pod_busdate: d.pod_busdate!.toISOString(),
        TALPORDERD_VOUCHERDetails: validTableData.map(item => ({
          ...item,
          pod_no: d.pod_no!,
          pod_type: d.pod_type!,
          talent_id: Number(item.talent_id) || 0,
          tlt_id: String(item.tlt_id || '0'),
          tlt_no: String(item.tlt_no || item.talent_id || ''),
          tlt_name: String(item.tlt_name || ''),
          calc_date_type: String(item.calc_date_type || 'Y'),
          cap_item_D16: 'D16',
          cap_item_D17: 'D17',
          tpy_rate_D16: Math.round((Number(item.tpy_rate_D16 ?? 0) * 100)),
          tpy_rate_D17: Math.round((Number(item.tpy_rate_D17 ?? 0) * 100)),
          pod_status: String(item.pod_status || '0'),
        })),
      };

      this.loading = !0;
      this.service.insertTLS26080(payload).pipe(
        tap(() => this.dataForm.reset()),
        finalize(() => this.loading = !1),
      ).subscribe({
        next: () => { this.messageService.successBubble('新增成功'); this.onCancel(); },
        error: () => this.messageService.errorBubble('新增失敗'),
      });
    });
  }
  public onFieldChange(event: FieldChangeEvent<TLS26080Detail>): void {
    this.logger.debug(`onFieldChange:`, [event]);
    const { field, value, index, rowData } = event;
    const valueStr = String(value);
    if (!valueStr?.length) return;

    // 根據櫃位名稱取得專櫃編號及抽成類別選項
    if (field === 'tlt_name') this.service.getTLTTalentChargeOptions(valueStr);
  }

  private numVal(value: string): { isValid: boolean; errorMessage: string[]; } {
    const num = Number(value);
    if (isNaN(num) || !isFinite(num)) return { isValid: !1, errorMessage: ['請輸入有效的數字'] };

    // 使用基點法驗證，避免 JavaScript 浮點數精度問題
    const basisPoint = Math.round(num * 100);
    if (basisPoint < 0 || basisPoint > 10000) return { isValid: !1, errorMessage: ['請輸入 0 到 100 之間的數字'] };

    return { isValid: !0, errorMessage: [] };
  }

  public async handleUpload(event: FileUploadHandlerEvent): Promise<void> {
    const formData = new FormData();
    if (!formData) return;
    formData.append('file', event.files[0]);

    this.uploadLoading.set(!0);
    this.service.uploadFile(formData).pipe(
      tap(data => {
        if (data.length > 0) {
          this.tableData.set(data.map(item => ({
            ...item,
            tpy_rate_D16: Number(item.tpy_rate_D16) / 100,
            tpy_rate_D17: Number(item.tpy_rate_D17) / 100,
          })));
        }
      }),
      finalize(() => this.uploadLoading.set(!1))
    ).subscribe();

    this.fileUpload().clear();
    this.logger.debug(`fileUploadEffect:`, [formData]);
  }

  public onExportExcelTemplate(): void {
    const exampleByApi = !0;
    const headerRow1 = ['專櫃編號', '櫃位名稱', '抽成類別', '抽成類別名稱', '正檔起日計算', '匯入分攜', null, '合約建檔'];
    const headerRow2 = [null, null, null, null, null, 'D16', 'D17', 'D16', 'D17'];
    const example = ['000064', 'gozo', '0', '少女裝', 'Y', '1', '5'];

    if (exampleByApi) {
      this.downloadLoading.set(!0);
      this.service.downloadXLSXExample().pipe(
        finalize(() => this.downloadLoading.set(!1))
      ).subscribe();
      return;
    }

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
