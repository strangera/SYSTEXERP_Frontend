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
import { Column, FieldChangeEvent, RowEditSaveEvent } from '@shared/componentkit/table/table.model';
import { ApprovalStatus } from '@shared/models/tls/approval-status.model';
import { NGXLogger } from 'ngx-logger';
import { FileUpload, FileUploadHandlerEvent, FileUploadModule } from 'primeng/fileupload';
import { PanelModule } from 'primeng/panel';
import { tap } from 'rxjs';
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
    pod_no: new FormControl<string>('自動給號', [Validators.maxLength(10)]), // 活動單號
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
    this.loading = this.service.tableLoading()
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

  public readonly defaultInsertData = {
    pod_status: ApprovalStatus.未核准,
  };

  // 專櫃資料表
  public readonly counterColumns = computed<EditColumn[]>(() => [
    // {
    //   field: 'talent_id',
    //   header: '專櫃編號',
    //   // type: 'inputNumber',
    //   type: this.isFormReadable ? void 0 : 'dropdown',
    //   showClear: !1,
    //   options: this.service.tltTalentOptions,
    //   optionLabel: 'label',
    //   optionValue: 'value',
    // },
    {
      field: 'tlt_name',
      header: '櫃位名稱',
      // type: input,
      type: this.isFormReadable ? void 0 : 'dropdown',
      showClear: !1,
      options: this.service.tltTalentOptions,
      optionLabel: 'label',
      optionValue: 'value',
    },
    // {
    //   field: 'tlt_id',
    //   header: '抽成類別',
    //   // type: 'inputNumber',
    //   type: this.isFormReadable ? void 0 : 'dropdown',
    //   options: (rowData: TLS26080Detail) => this.service.tltTalentChargeMap().get(rowData.talent_id as string) || [],
    //   showClear: !1,
    //   optionLabel: 'label',
    //   optionValue: 'value',
    // },
    {
      field: 'tlt_id_desc',
      header: '抽成類別',
      // type: input,
      type: this.isFormReadable ? void 0 : 'dropdown',
      options: (rowData: TLS26080Detail) => this.service.tltTalentChargeMap().get(rowData.talent_id as string) || [],
      showClear: !1,
      optionLabel: 'label',
      optionValue: 'value',
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

    if (!this.isFormCreateable) this.service.loadTLS26080Detail(this.rowdata!.pod_no).pipe(
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

    this.service.getTLTTalentOptions();
    this.service.loadAPS1003(['E']);
    this.service.loadCampaignData().pipe(
      tap(res => this.campaignData.set(res.Data)),
    ).subscribe();
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
    this.service.keyInTLS26080(payload, this.tableData);
    this.logger.debug(`onInsert:`, [d, event]);
  }

  public onSubmit(): void {
    this.handleSubmit(this.dataForm, () => {
      const d = Object.fromEntries(
        Object.entries(this.df())
          .map(([k, v]) => [k, v.value])
          .filter(([_, v]) => v !== null && v !== void 0 && v !== '')
      ) as Partial<TLS2608InsertPayload>;

      const payload = <TLS2608InsertPayload>{
        ...d,
        TALPORDERD_VOUCHERDetails: this.tableData().map(item => ({
          ...item,
          pod_no: d.pod_no!,
          pod_type: d.pod_type!,
        })),
      };

      this.service.insertTLS26080(payload).pipe(
        tap(() => this.dataForm.reset()),
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
    if (num < 0 || num > 100) return { isValid: !1, errorMessage: ['請輸入有效的數字'] };
    return { isValid: !0, errorMessage: [] };
  }

  public async handleUpload(event: FileUploadHandlerEvent): Promise<void> {
    const formData = new FormData();
    if (!formData) return;
    formData.append('file', event.files[0]);
    this.service.uploadFile(formData, this.tableData);
    this.fileUpload().clear();
    this.logger.debug(`fileUploadEffect:`, [formData]);
  }

  public onExportExcelTemplate(): void {
    /** 手動控制 local 生成或從 api 下載 */
    const exampleByApi = !0;
    const headerRow1 = ['專櫃編號', '櫃位名稱', '抽成類別', '抽成類別名稱', '正檔起日計算', '匯入分攤', null, '合約建檔'];
    const headerRow2 = [null, null, null, null, null, 'D16', 'D17', 'D16', 'D17'];
    const example = ['000064', 'gozo', '0', '少女裝', 'Y', '1', '5'];
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
