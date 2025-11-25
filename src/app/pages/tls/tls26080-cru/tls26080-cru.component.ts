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
import { validateRequired } from '@shared/componentkit/table/validate-field.model';
import { ApprovalStatus } from '@shared/models/tls/approval-status.model';
import { NGXLogger } from 'ngx-logger';
import { FileUpload, FileUploadHandlerEvent, FileUploadModule } from 'primeng/fileupload';
import { PanelModule } from 'primeng/panel';
import { finalize, tap } from 'rxjs';
import * as XLSX from 'xlsx';
import { CampaignData, TLS26080Data, TLS26080Detail, TLS26080InsertPayload } from '../tls26080/tls26080.model';

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

  public readonly dt = viewChild.required<TableEditComponent>('dt');

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

  private readonly dfSignal = toSignal(this.dataForm.valueChanges, { initialValue: this.dataForm.getRawValue() });
  private readonly podDescSignal = toSignal(this.df().pod_desc.valueChanges);

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

  /** 驗證表單和表格資料是否完整 */
  public readonly isSubmitDisabled = computed(() => {
    const data = this.dfSignal();
    this.logger.debug(`isSubmitDisabled:`, [data, this.tableData()]);

    // 表單必填欄位
    if (!data!.pod_sdate || !data!.pod_edate || !data!.pod_busdate) return !0;

    // 活動起迄日期必須正確
    if (data!.pod_sdate! > data!.pod_edate!) return !0;

    // 活動正檔日期必須在活動起迄日期之間
    if (data!.pod_busdate! < data!.pod_sdate! || data!.pod_busdate! >= data!.pod_edate!) return !0;

    // 取得有效的表格資料（排除自動新增的候選行）
    const validTableData = this.tableData().filter(item => !item._isAutoInsertCandidate);

    // 至少要有一筆專櫃資料
    if (!validTableData.length) return !0;

    // 驗證表格資料的必填欄位和數值範圍
    return validTableData.some(item => {
      if (!item.talent_id || !item.calc_date_type) return !0;

      // 檢查 tpy_rate_D16 和 tpy_rate_D17 是否有值
      if (item.tpy_rate_D16 === void 0 || item.tpy_rate_D16 === null || item.tpy_rate_D16 === '') return !0;
      if (item.tpy_rate_D17 === void 0 || item.tpy_rate_D17 === null || item.tpy_rate_D17 === '') return !0;

      const rate_D16 = Number(item.tpy_rate_D16);
      const rate_D17 = Number(item.tpy_rate_D17);
      if (isNaN(rate_D16) || isNaN(rate_D17)) return !0;

      const basisPoint_D16 = Math.round(rate_D16 * 100);
      const basisPoint_D17 = Math.round(rate_D17 * 100);
      if (basisPoint_D16 < 0 || basisPoint_D16 > 1e4 || basisPoint_D17 < 0 || basisPoint_D17 > 1e4) return !0;

      return !1;
    });
  });

  /** 根據選擇的活動名稱取得活動資料 */
  private readonly selectedCampaign = computed(() => {
    const podDesc = this.podDescSignal();
    return this.campaignData().find(d => d.CampaignId === podDesc);
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

  public readonly defaultInsertData: Partial<TLS26080Detail> = {
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
      optionLabel: 'Name',
      optionValue: 'No',
      templateLabel: 'label',
      validate: [validateRequired],
      format: v => this.service.tltTalentMap().get(v)?.label ?? v,
    },
    {
      field: 'tlt_id',
      header: '抽成類別',
      type: this.isFormReadable ? void 0 : 'dropdown',
      showClear: !1,
      options: this.service.tltIdOptions(),
      optionLabel: 'label',
      optionValue: 'value',
      validate: [validateRequired],
      // options: this.service.tltTalentChargeOptions(),
      // optionLabel: 'tlt_id_desc',
      // optionValue: 'tlt_id',
      // format: (v, i, r) => this.service.tltTalentChargeMap().get(r.talent_id)?.tlt_id_desc ?? v,
    },
    {
      field: 'calc_date_type',
      header: '預售起日計算',
      type: this.isFormReadable ? void 0 : 'dropdown',
      showClear: !1,
      options: this.calcDateType,
      optionLabel: 'label',
      optionValue: 'value',
      validate: [validateRequired],
      format: v => v === 'Y' ? '活動起始日至截止日' : '正檔日至截止日',
    },
    {
      field: 'tpy_rate_D16',
      header: 'D16',
      groupField: 'groupField1',
      type: this.isFormReadable ? void 0 : 'percent',
      validate: [this.numVal, validateRequired],
      maxFractionDigits: 2,
      format: v => this.isFormReadable ? String(v) + '%' : v,
    },
    {
      field: 'tpy_rate_D17',
      header: 'D17',
      groupField: 'groupField1',
      type: this.isFormReadable ? void 0 : 'percent',
      validate: [this.numVal, validateRequired],
      maxFractionDigits: 2,
      format: v => this.isFormReadable ? String(v) + '%' : v,
    },
    {
      field: 'tpy_rate_3',
      header: 'D16',
      groupField: 'groupField2',
    },
    {
      field: 'tpy_rate_4',
      header: 'D17',
      groupField: 'groupField2',
    },
    { field: 'pod_status', header: '審核狀態', format: this.service.approvalStatus },
    { field: 'approved_usr_name', header: '審核人員' },
    { field: 'approved_date', header: '審核日期', format: v => this.datePipe.transform(v, 'YYYY/MM/dd') },
  ]);

  public readonly counterColumnsGroup = computed<Column[]>(() => [
    { field: 'groupField1', header: '匯入分攤' },
    { field: 'groupField2', header: '合約建檔' },
  ]);

  public readonly loadingEffect = effect(() => {
    this.loading = this.tableLoading()
      || this.uploadLoading()
      || this.downloadLoading()
      || this.campaignLoading()
      || this.service.capItemsLoading()
      || this.service.tltTalentOptionsLoading();
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
        finalize(() => this.tableLoading.set(!1)),
        tap(res => {
          const data = res.Data;
          this.tableData.set(data.map(v => ({
            ...v,
            tpy_rate_D16: Number(v.tpy_rate_D16),
            tpy_rate_D17: Number(v.tpy_rate_D17),
          })));
          this.totalRecords.set(res.TotalCount || 0);
        }),
      ).subscribe();
    }

    // this.service.getTLTTalentChargeOptions();
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
      this.tableLoading.set(!0);
      if (!this.dt().validateAndShowErrors()) return void this.tableLoading.set(!1);

      const d = this.dataForm.getRawValue();
      const validTableData = this.tableData().filter(item => !item._isAutoInsertCandidate);
      if (!validTableData.length) {
        this.tableLoading.set(!1);
        return void this.messageService.errorBubble('請至少新增一筆專櫃資料');
      }

      /**
       * pod_sdate, pod_edate, pod_busdate 這三個後端要求ISO格式
       *
       * 但是interceptor會把Date拿掉尾端的Z，變成"yyyy-MM-ddTHH:mm:ss.sss"
       *
       * 導致日期範圍無法判斷
       */
      const payload: TLS26080InsertPayload = {
        ...d,
        pod_no: d.pod_no ?? '',
        pod_type: '2',
        pod_desc: this.selectedCampaign()?.CampaignName ?? d.pod_desc ?? '',
        pod_sdate: d.pod_sdate!,
        pod_edate: d.pod_edate!,
        pod_busdate: d.pod_busdate!,
        TALPORDERD_VOUCHERDetails: validTableData.map(item => ({
          pod_no: d.pod_no!,
          talent_id: Number(item.talent_id) ?? null,
          tlt_id: String(item.tlt_id),
          tlt_no: this.service.tltTalentMap().get(String(item.talent_id))?.['No'] ?? '',
          tlt_name: this.service.tltTalentMap().get(String(item.talent_id))?.['Name'] ?? '',
          calc_date_type: String(item.calc_date_type ?? 'Y'),
          cap_item_D16: 'D16',
          cap_item_D17: 'D17',
          tpy_rate_D16: item.tpy_rate_D16!,
          tpy_rate_D17: item.tpy_rate_D17!,
          pod_status: String(item.pod_status ?? '0'),
        })),
      };

      this.logger.debug(`onSubmit:`, [d, payload, structuredClone(payload), this.tableData()]);

      this.service.insertTLS26080(payload).pipe(
        tap(() => this.dataForm.reset()),
        finalize(() => this.tableLoading.set(!1)),
      ).subscribe({
        next: () => { this.messageService.successBubble('新增成功'); this.onCancel(); },
        error: () => this.messageService.errorBubble('新增失敗'),
      });
    });
  }

  private numVal(value: string | number): { isValid: boolean; errorMessage: string[]; } {
    const normalized = typeof value === 'number' ? value.toString() : `${value ?? ''}`.trim().replace(/%$/, '');
    if (normalized === '') return { isValid: !1, errorMessage: ['請輸入有效的數字'] };

    const decimalPart = normalized.split('.')[1];
    if (decimalPart && decimalPart.length > 2) return { isValid: !1, errorMessage: ['請輸入最多兩位小數的數字'] };

    const num = Number(normalized);
    if (isNaN(num) || !isFinite(num)) return { isValid: !1, errorMessage: ['請輸入有效的數字'] };

    const bp = Math.round(num * 100);
    if (bp < 0 || bp > 1e4) return { isValid: !1, errorMessage: ['請輸入 0 到 100 之間的數字'] };

    return { isValid: !0, errorMessage: [] };
  }

  public onFieldChange(event: FieldChangeEvent): void {
    this.logger.debug(`onFieldChange:`, [event]);

    if (event.field === 'talent_id') {
      this.service.tltTalentMap().get(event.value);
    }
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
            tpy_rate_D16: Number(item.tpy_rate_D16),
            tpy_rate_D17: Number(item.tpy_rate_D17),
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
    const headerRow1 = ['專櫃編號', '櫃位名稱', '抽成類別', '抽成類別名稱', '正檔起日計算', '匯入分攤', null, '合約建檔'];
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
