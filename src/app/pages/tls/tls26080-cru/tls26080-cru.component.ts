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
import { DropdownTableComponent, FieldsConfig } from '@shared/componentkit/dropdown-table/dropdown-table.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { Column, createPaginationConfig, FieldChangeEvent } from '@shared/componentkit/table/table.model';
import { validateRequired } from '@shared/componentkit/table/validate-field.model';
import { ApprovalStatus } from '@shared/models/tls/approval-status.model';
import { NGXLogger } from 'ngx-logger';
import { FileUpload, FileUploadHandlerEvent, FileUploadModule } from 'primeng/fileupload';
import { PanelModule } from 'primeng/panel';
import { finalize, map, tap } from 'rxjs';
import * as XLSX from 'xlsx';
import { CampaignData, TLS26080Data, TLS26080EditTable, TLS26080InsertPayload } from '../tls26080/tls26080.model';

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
    DropdownTableComponent,
    InputTextComponent,
    MenubarComponent,
    TableEditComponent,
  ]
})
export class TLS26080CRUComponent extends BasicCruPageComponent<TLS26080Data> implements OnInit {

  public readonly dt = viewChild.required<TableEditComponent>('dt');

  public readonly fileUpload = viewChild.required<FileUpload>('fileUpload');

  private readonly usrData = computed(() => ({
    ...this.authService.currentUserValue,
  }));

  public readonly campaignForm = this.formBuilder.group({
    CampaignId: new FormControl<string | void>(void 0, []), // 活動編號
    CampaignName: new FormControl<string | void>(void 0, []), // 活動名稱
    ...createPaginationConfig([{ field: 'CampaignId', order: 1 }]),
  });
  public readonly cf = computed(() => this.campaignForm.controls);

  public readonly dataForm = this.formBuilder.nonNullable.group({
    pod_no: new FormControl<string | void>(void 0, [Validators.maxLength(10)]), // 活動單號
    pod_desc: new FormControl<string | void>(void 0, [Validators.required]), // 活動名稱
    pod_sdate: new FormControl<Date>(this.service.dateS, [Validators.required]), // 起始日期(起)
    pod_back_sdate: new FormControl<Date | void>(void 0, [Validators.required]), // 兌回日期(起)
    pod_edate: new FormControl<Date>(this.service.dateE, [Validators.required]), // 起始日期(迄)
    pod_back_edate: new FormControl<Date | void>(void 0, [Validators.required]), // 兌回日期(迄)
    pod_busdate: new FormControl<Date | void>(void 0, [Validators.required]), // 活動正檔日期
    pod_type: new FormControl<'2'>('2', [Validators.required]), // 活動類型
    pod_type2: new FormControl<'3'>('3', [Validators.required]), // 活動類型
  }, {
    validators: [
      (group) => {
        const sdate = group.get('pod_sdate')?.value;
        const edate = group.get('pod_edate')?.value;
        const backSdate = group.get('pod_back_sdate')?.value;
        const backEdate = group.get('pod_back_edate')?.value;
        const busdate = group.get('pod_busdate')?.value;

        // 活動起始日期必須小於截止日期
        if (sdate && edate && sdate >= edate) {
          return { invalidDateRange: !0 };
        }

        // 兌回起始日期必須小於兌回截止日期
        if (backSdate && backEdate && backSdate >= backEdate) {
          return { invalidBackDateRange: !0 };
        }

        // 活動正檔日期必須在活動起始日期期間內
        if (busdate && sdate && edate && (busdate < sdate || busdate >= edate)) {
          return { invalidBusDate: !0 };
        }

        // 兌回日期必須在活動起始日期之後
        if (backSdate && edate && backSdate < edate) {
          return { invalidBackStartDate: !0 };
        }

        return null;
      }
    ]
  });
  public readonly df = computed(() => this.dataForm.controls);

  private readonly dfSignal = toSignal(this.dataForm.valueChanges);
  private readonly podDescSignal = toSignal(this.df().pod_desc.valueChanges);

  public readonly tls26080Data = signal<TLS26080Data[]>([]);
  public readonly tableData = signal<TLS26080EditTable[]>([]);
  public readonly totalRecords = signal(0);
  public readonly campaignData = signal<CampaignData[]>([]);
  public readonly selectedItems = signal<TLS26080EditTable[]>([]);

  // 頁面專屬 Loading 狀態
  public readonly tableLoading = signal<boolean>(!1);
  public readonly uploadLoading = signal<boolean>(!1);
  public readonly downloadLoading = signal<boolean>(!1);
  public readonly campaignLoading = signal<boolean>(!1);

  public readonly isRowSelectable = (rowData: TLS26080EditTable) => rowData.pod_status !== '9';

  public readonly calcDateType = [
    { label: '活動起始日至截止日', value: 'Y' },
    { label: '正檔日至截止日', value: 'N' }
  ];

  public readonly getPodNo = computed(() => {
    return this.rowdata?.pod_no || void 0;
  });

  public readonly initEffect = effect(() => {
    if (this.isFormCreateable) return this.initEffect.destroy();
    const id = this.getPodNo();
    if (!id) return;

    this.tableLoading.set(!0);
    this.service.loadTLS26080Detail(id).pipe(
      tap(res => this.logger.debug(`load:`, [this.rowdata, res])),
      finalize(() => this.tableLoading.set(!1)),
    ).subscribe({
      next: res => {
        if (res.Status !== '0000') return;
        const data = res.Data;
        this.tableData.set(data.map(v => ({
          ...v,
          tpy_rate_D16: Number(v.tpy_rate_D16),
          tpy_rate_D17: Number(v.tpy_rate_D17),
        })));
        this.totalRecords.set(res.TotalCount || 0);
      },
    });
  }, { allowSignalWrites: !0 });

  public readonly isSubmitDisabled = computed(() => {
    const dfSignal = this.dfSignal();
    const data = this.tableData();
    this.logger.debug(`isSubmitDisabled:`, [this.dataForm.valid, data]);

    // 基本表單驗證
    if (this.dataForm.invalid) return !0;

    // 取得有效的表格資料（排除自動新增的候選行）
    const validTableData = data?.filter(item => !item._isAutoInsertCandidate) || [];

    // 至少要有一筆專櫃資料
    if (!validTableData.length) return !0;

    // 驗證表格資料的必填欄位和數值範圍
    return validTableData.some(item => {
      if (!item.tlt_no || !item.calc_date_type) return !0;

      // 檢查 tpy_rate_D16 和 tpy_rate_D17 是否有值
      if (item.tpy_rate_D16 === void 0 || item.tpy_rate_D16 === null) return !0;
      if (item.tpy_rate_D17 === void 0 || item.tpy_rate_D17 === null) return !0;

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

  public readonly campaignIdEffect = effect(() => {
    const data = this.campaignData();
    if (!data || data.length === 0 || !this.selectedCampaign()) return;
    this.logger.debug(`campaignIdEffect:`, [data, this.df().pod_no, this.selectedCampaign()]);
    this.df().pod_no.patchValue(this.selectedCampaign()!.CampaignId);
  }, { allowSignalWrites: !0 });

  // 用名稱顯示但用編號傳值
  public readonly fieldsConfig: FieldsConfig[] = [
    { field: 'CampaignId', header: '活動名稱', mainDataField: !0 },
  ];

  // 環友資料表
  public readonly campaignColumns: Column[] = [
    { field: 'CampaignId', header: '活動編號' },
    { field: 'CampaignName', header: '活動名稱' },
    { field: 'StartTime', header: '活動開始時間', format: v => this.datePipe.transform(v, 'YYYY/MM/dd') },
    { field: 'EndTime', header: '活動結束時間', format: v => this.datePipe.transform(v, 'YYYY/MM/dd') },
    { field: 'AccountingType', header: '帳務拆分類別' },
    { field: 'Remark', header: '活動備註' },
  ];

  public readonly defaultInsertData: Partial<TLS26080EditTable> = {
    pod_status: ApprovalStatus.未核准,
  };

  // 專櫃資料表
  public readonly counterColumns = computed<EditColumn[]>(() => [
    {
      field: 'tlt_no',
      header: '專櫃編號',
      type: this.isFormReadable ? void 0 : 'dropdown',
      showClear: !1,
      options: this.service.tltTalentOptions(),
      optionLabel: 'Name',
      optionValue: 'No',
      templateLabel: 'label',
      validate: [validateRequired],
      disabled: (v, i, r) => r.pod_status !== '0',
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
      disabled: (v, i, r) => r.pod_status !== '0',
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
      disabled: (v, i, r) => r.pod_status !== '0',
      format: v => v === 'Y' ? '活動起始日至截止日' : '正檔日至截止日',
    },
    {
      field: 'tpy_rate_D16',
      header: 'D16',
      groupField: 'groupField1',
      type: this.isFormReadable ? void 0 : 'percent',
      validate: [this.numVal, validateRequired],
      maxFractionDigits: 2,
      disabled: (v, i, r) => r.pod_status !== '0',
      format: v => this.isFormReadable ? String(v) + '%' : v,
    },
    {
      field: 'tpy_rate_D17',
      header: 'D17',
      groupField: 'groupField1',
      type: this.isFormReadable ? void 0 : 'percent',
      validate: [this.numVal, validateRequired],
      maxFractionDigits: 2,
      disabled: (v, i, r) => r.pod_status !== '0',
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
    {
      field: 'pod_status',
      header: '審核狀態',
      options: () => [{ value: '0', label: '未核准' }, { value: '1', label: '已核准' }],
      optionLabel: 'label',
      optionValue: 'value',
      format: this.service.approvalStatus,
    },
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

    this.logger.debug(`init:`, [this.rowdata]);

    // this.service.getTLTTalentChargeOptions();
    this.service.getTLTTalentOptions();
    this.service.loadAPS1003(['E']);

    this.campaignLoading.set(!0);
    this.service.loadCampaignData().pipe(
      tap(res => this.logger.debug(`loadCampaignData:`, [res])),
      finalize(() => this.campaignLoading.set(!1))
    ).subscribe({
      next: res => {
        if (res.Status !== '0000') return;
        this.campaignData.set(res.Data);
      },
    });
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
        pod_back_sdate: d.pod_back_sdate!,
        pod_back_edate: d.pod_back_edate!,
        pod_busdate: d.pod_busdate!,
        TALPORDERD_VOUCHERDetails: validTableData.map(item => ({
          pod_no: d.pod_no!,
          talent_id: item.talent_id,
          tlt_id: item.tlt_id,
          tlt_no: this.service.tltTalentMap().get(item.tlt_no)?.['No'] ?? '',
          tlt_name: this.service.tltTalentMap().get(item.tlt_no)?.['Name'] ?? '',
          calc_date_type: item.calc_date_type ?? 'Y',
          cap_item_D16: 'D16',
          cap_item_D17: 'D17',
          tpy_rate_D16: item.tpy_rate_D16!,
          tpy_rate_D17: item.tpy_rate_D17!,
          pod_status: item.pod_status ?? '0',
        })),
      };

      const request = this.isFormEditable
        ? this.service.updateTLS26080(payload)
        : this.service.insertTLS26080(payload);

      this.logger.debug(`submit:`, [d, payload]);
      request.pipe(
        finalize(() => this.tableLoading.set(!1)),
      ).subscribe({
        next: res => {
          if (res.Status !== '0000') return;
          this.onCancel();
          this.messageService.successBubble(this.isFormEditable ? '更新成功' : '新增成功');
        },
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

    if (event.field === 'tlt_no') {
      this.service.tltTalentMap().get(event.value);
    }
  }

  public toggleApprovalStatus(): void {
    const selectedRows = this.selectedItems();
    if (!selectedRows?.length) {
      this.messageService.errorBubble('請先勾選要切換狀態的專櫃資料');
      return;
    }
    this.tableData.update(data => data.map(item => {
      if (!selectedRows.includes(item)) return item;

      // 切換審核狀態
      const isApproved = item.pod_status === ApprovalStatus.已核准;
      item.pod_status = isApproved ? ApprovalStatus.未核准 : ApprovalStatus.已核准;

      // 若切換為已核准,設定審核資訊;若切換為未核准,清除審核資訊
      if (!isApproved) {
        item.approved_usr_no = this.usrData().user_No;
        item.approved_usr_name = this.usrData().user_Name;
        item.approved_date = new Date();
      } else {
        item.approved_usr_no = void 0;
        item.approved_usr_name = void 0;
        item.approved_date = void 0;
      }

      return item;
    }));
    this.selectedItems.set([]);
  }

  public async handleUpload(event: FileUploadHandlerEvent): Promise<void> {
    const formData = new FormData();
    formData.append('file', event.files[0]);
    this.logger.debug(`handleUpload:`, [event]);

    this.uploadLoading.set(!0);
    this.service.uploadFile(formData).pipe(
      tap(res => this.logger.debug(`uploadFile:`, [event, res])),
      map(res => {
        if (res.Success) return res;
        this.service.dealErrorFilePath(res);
        throw new Error('上傳失敗 發生錯誤');
      }),
      finalize(() => this.uploadLoading.set(!1))
    ).subscribe({
      next: res => {
        const data = res.queryTLS26080_DetailResponses;

        this.tableData.set(data.map(item => ({
          ...item,
          pod_no: item.pod_no ?? this.getPodNo()!,
          tpy_rate_D16: Number(item.tpy_rate_D16),
          tpy_rate_D17: Number(item.tpy_rate_D17),
        })));
        this.messageService.successBubble('上傳成功');
      },
      error: err => this.messageService.errorBubble(err.message || '上傳失敗'),
    });

    this.fileUpload().clear();
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

  public onAutoCompleteInputChange(event: any): void {

  }

  public onformValueChanged(event: any): void {

  }
}
