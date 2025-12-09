import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, computed, effect, OnInit, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TLS26080Service } from '@service/api/tls/tls26080.service';
import { Option } from '@service/utility/dropdown-api.model';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { DropdownTableComponent, FieldsConfig } from '@shared/componentkit/dropdown-table/dropdown-table.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { Column, ColumnGroup, createPaginationConfig, FieldChangeEvent } from '@shared/componentkit/table/table.model';
import { validateRequired } from '@shared/componentkit/table/validate-field.model';
import { ApprovalStatus } from '@shared/models/tls/approval-status.model';
import { NGXLogger } from 'ngx-logger';
import { FileUpload, FileUploadHandlerEvent, FileUploadModule } from 'primeng/fileupload';
import { PanelModule } from 'primeng/panel';
import { finalize, map } from 'rxjs';
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
    DialogComponent,
    DropdownComponent,
    DropdownTableComponent,
    InputTextComponent,
    MenubarComponent,
    TableEditComponent,
    TableReportComponent,
  ]
})
export class TLS26080CRUComponent extends BasicCruPageComponent<TLS26080Data> implements OnInit {

  public readonly dt = viewChild.required<TableEditComponent>('dt');

  public readonly fileUpload = viewChild.required<FileUpload>('fileUpload');

  private readonly usrData = computed(() => ({
    ...this.authService.currentUserValue,
  }));

  public readonly dialogQueryForm = this.formBuilder.group({
    No: new FormControl<string | void>(void 0), // 專櫃編號
    Name: new FormControl<string | void>(void 0), // 專櫃名稱
    ...createPaginationConfig([{ field: 'No', order: 1 }]),
  });
  public readonly dqf = computed(() => this.dialogQueryForm.controls);
  private readonly dqfNoSignal = toSignal(this.dqf().No.valueChanges);
  private readonly dqfNameSignal = toSignal(this.dqf().Name.valueChanges);

  public readonly campaignForm = this.formBuilder.group({
    CampaignId: new FormControl<string | void>(void 0), // 活動編號
    CampaignName: new FormControl<string | void>(void 0), // 活動名稱
    ...createPaginationConfig([{ field: 'CampaignId', order: 1 }]),
  });
  public readonly cf = computed(() => this.campaignForm.controls);

  public readonly dataForm = this.formBuilder.nonNullable.group({
    pod_no: new FormControl<string | void>(void 0, [Validators.maxLength(10)]), // 活動單號
    pod_desc: new FormControl<string | void>(void 0, [Validators.required]), // 活動名稱
    pod_sdate: new FormControl<Date>(this.service.dateS), // 起始日期(起)
    pod_back_sdate: new FormControl<Date | void>(void 0, [Validators.required]), // 兌回日期(起)
    pod_edate: new FormControl<Date>(this.service.dateE), // 起始日期(迄)
    pod_back_edate: new FormControl<Date | void>(void 0, [Validators.required]), // 兌回日期(迄)
    pod_busdate: new FormControl<Date | void>(void 0, [Validators.required]), // 活動正檔日期
    pod_status: new FormControl<'0' | '1' | '9'>('0', [Validators.required]), // 活動狀態
    pod_type: new FormControl<'2'>('2', [Validators.required]), // 活動類型
    pod_type2: new FormControl<'3'>('3', [Validators.required]), // 活動類型
  }, {
    validators: [
      (group) => {
        const sdate = group.get('pod_sdate')?.value;
        const edate = group.get('pod_edate')?.value;
        const bsdate = group.get('pod_back_sdate')?.value;
        const bedate = group.get('pod_back_edate')?.value;
        const busdate = group.get('pod_busdate')?.value;

        // 兌回起始日期必須小於兌回結束日期
        if (!bsdate || !bedate) return null;
        else if (bsdate && bedate && bsdate > bedate) return { invalidBackDateRange: !0 };

        // 活動正檔日期必須在活動起始日期期間內
        if (!sdate || !edate || !busdate) return null;
        else if (busdate && sdate && edate && (busdate < sdate || busdate >= edate)) return { invalidBusDate: !0 };

        return null;
      }
    ]
  });
  public readonly df = computed(() => this.dataForm.controls);

  private readonly dfSignal = toSignal(this.dataForm.valueChanges);
  private readonly podDescSignal = toSignal(this.df().pod_desc.valueChanges);

  public readonly tls26080Data = signal<TLS26080Data[]>([]);
  public readonly tableData = signal<TLS26080EditTable[]>([]);
  public readonly dialogData = signal<Option[]>([]);
  public readonly filteredDialogData = signal<Option[]>([]);
  public readonly totalRecords = signal<number>(0);
  public readonly dialogTotalRecords = signal<number>(0);
  public readonly campaignData = signal<CampaignData[]>([]);
  public readonly selectedItems = signal<TLS26080EditTable[]>([]);
  public readonly selectedItemsDialog = signal<Option[]>([]);
  public readonly displayDialog = signal<boolean>(!1);

  // 頁面專屬 Loading 狀態
  public readonly tableLoading = signal<boolean>(!1);
  public readonly uploadLoading = signal<boolean>(!1);
  public readonly downloadLoading = signal<boolean>(!1);
  public readonly campaignLoading = signal<boolean>(!1);
  public readonly dialogLoading = signal<boolean>(!1);

  public readonly isRowSelectable = (rowData: TLS26080EditTable) => rowData.pod_status !== '9';

  public readonly tltIdList = signal(new Map<number, Option[]>());

  public readonly calcDateType = [
    { label: '活動起始日至截止日', value: 'Y' },
    { label: '正檔日至截止日', value: 'N' }
  ];

  public readonly getPodNo = computed(() => {
    return this.rowdata?.pod_no || void 0;
  });

  public readonly isSubmitDisabled = computed(() => {
    const _df = this.dfSignal(); // 觸發用
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

  /** 根據選擇的活動起始日期更新正檔日期 */
  public readonly busDateEffect = effect(() => {
    const sdate = this.selectedCampaign()?.StartTime;
    if (sdate === void 0 || sdate === null) return;
    const base = new Date(sdate);
    if (isNaN(base.getTime())) return;

    const newDate = new Date(base);
    newDate.setDate(newDate.getDate() + 7);

    this.dataForm.patchValue({ pod_busdate: newDate });
    this.logger.debug(`busDateEffect:`, [sdate, newDate]);
  }, { allowSignalWrites: !0 });

  /** dialog 內的篩選 */
  public readonly dqfEffect = effect(() => {
    if (!this.displayDialog()) return;
    const nos = this.dqfNoSignal();
    const names = this.dqfNameSignal();
    this.filteredDialogData.set((!nos?.length && !names?.length)
      ? this.dialogData()
      : this.dialogData().filter(d => {
        if (nos && !d.value.includes(nos)) return !1;
        if (names && !d['Name'].includes(names)) return !1;
        return !0;
      }));
    this.dialogTotalRecords.set(this.filteredDialogData().length);
    this.selectedItemsDialog.update(items => items
      .filter(opt => this.tableData()
        .some(td => td.tlt_no === opt.value)));
  }, { allowSignalWrites: !0 });

  /** 根據選擇的活動更新表單 */
  public readonly campaignEffect = effect(() => {
    const podDesc = this.podDescSignal();
    if (!podDesc || !this.selectedCampaign()) return;
    this.dataForm.patchValue({
      pod_no: this.selectedCampaign()!.CampaignId,
      pod_desc: this.selectedCampaign()!.CampaignName,
      pod_sdate: new Date(this.selectedCampaign()!.StartTime),
      pod_edate: new Date(this.selectedCampaign()!.EndTime),
    });
    this.logger.debug(`campaignEffect:`, [podDesc, this.selectedCampaign()]);
  }, { allowSignalWrites: !0 });

  /** 根據選擇的活動更新編號 */
  public readonly campaignIdEffect = effect(() => {
    const data = this.campaignData();
    if (!data || data.length === 0 || !this.selectedCampaign()) return;
    this.dataForm.patchValue({ pod_no: this.selectedCampaign()!.CampaignId });
    this.logger.debug(`campaignIdEffect:`, [data, this.selectedCampaign()]);
  }, { allowSignalWrites: !0 });

  /** 載入專櫃活動設定明細資料 */
  public readonly initEffect = effect(() => {
    if (this.isFormCreateable) return this.initEffect.destroy();
    const id = this.getPodNo();
    if (!id) return;

    this.tableLoading.set(!0);
    this.logger.debug(`initEffect:`, [this.rowdata]);
    this.service.loadTLS26080Detail(id)
      .pipe(finalize(() => this.tableLoading.set(!1)))
      .subscribe({
        next: res => {
          const data = res.Data;
          for (const item of res.Data) this.service.queryTltTalentCharge(item.talent_id)
            .subscribe(opt => this.tltIdList.update(map => {
              const next = new Map(map);
              next.set(item.talent_id, opt);
              return next;
            }));

          this.tableData.set(data.map(v => ({
            ...v,
            tpy_rate_D16: Number(v.tpy_rate_D16),
            tpy_rate_D17: Number(v.tpy_rate_D17),
          })));
          this.totalRecords.set(res.TotalCount || 0);

          this.logger.debug(`inited:`, [this.tltIdList()]);
          this.initEffect.destroy();
        },
      });
  }, { allowSignalWrites: !0 });

  // 用名稱顯示但用編號傳值
  public readonly fieldsConfig: FieldsConfig[] = [
    { field: 'CampaignId', header: '活動名稱', mainDataField: !0 },
  ];

  public readonly dialogColumns = computed<Column[]>(() => [
    { field: 'No', header: '專櫃編號' },
    { field: 'Name', header: '專櫃名稱' },
  ]);

  // 環友資料表
  public readonly campaignColumns: Column[] = [
    { field: 'CampaignId', header: '活動編號' },
    { field: 'CampaignName', header: '活動名稱' },
    { field: 'StartTime', header: '活動開始時間', format: v => this.datePipe.transform(v, 'YYYY/MM/dd') },
    { field: 'EndTime', header: '活動結束時間', format: v => this.datePipe.transform(v, 'YYYY/MM/dd') },
    { field: 'AccountingType', header: '帳務拆分類別' },
    { field: 'Remark', header: '活動備註' },
  ];

  // 專櫃資料表
  public readonly counterColumns = computed<EditColumn[]>(() => {
    const tltIdMap = this.tltIdList();

    return [
      {
        field: 'tlt_no',
        header: '專櫃編號',
        type: this.isFormReadable ? void 0 : 'dropdown',
        showClear: !1,
        options: this.service.tltTalentOptions(),
        optionLabel: 'No',
        optionValue: 'No',
        templateLabel: 'label',
        validate: [validateRequired, this.duplicateVal.bind(this)],
        disabled: (v, i, r) => r.pod_status !== '0',
      },
      {
        field: 'tlt_name',
        header: '專櫃名稱',
      },
      {
        field: 'tlt_id',
        header: '抽成類別',
        type: this.isFormReadable ? void 0 : 'dropdown',
        showClear: !1,
        options: (r: any) => tltIdMap.get(r.talent_id) ?? [],
        optionLabel: 'label',
        optionValue: 'value',
        validate: [validateRequired],
        disabled: (v, i, r) => r.pod_status !== '0',
      },
      {
        field: 'tlt_id_desc',
        header: '抽成類別名稱',
        format: (v, i, r) => {
          const opts = tltIdMap.get(r.talent_id);
          return opts?.find(opt => opt.value === r.tlt_id)?.['tlt_id_desc'] ?? '';
        }
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
        validate: [validateRequired, this.numVal.bind(this)],
        maxFractionDigits: 2,
        disabled: (v, i, r) => r.pod_status !== '0',
        format: v => this.isFormReadable ? String(v) + '%' : v,
        width: '4rem',
        textAlign: 'right',
      },
      {
        field: 'tpy_rate_D17',
        header: 'D17',
        groupField: 'groupField1',
        type: this.isFormReadable ? void 0 : 'percent',
        validate: [validateRequired, this.numVal.bind(this)],
        maxFractionDigits: 2,
        disabled: (v, i, r) => r.pod_status !== '0',
        format: v => this.isFormReadable ? String(v) + '%' : v,
        width: '4rem',
        textAlign: 'right',
      },
      // {
      //   field: 'tpy_rate_3',
      //   header: 'D16',
      //   textAlign: 'right',
      //   groupField: 'groupField2',
      // },
      // {
      //   field: 'tpy_rate_4',
      //   header: 'D17',
      //   textAlign: 'right',
      //   groupField: 'groupField2',
      // },
      {
        field: 'pod_status',
        header: '審核狀態',
        options: () => [{ value: '0', label: '未核准' }, { value: '1', label: '已核准' }],
        optionLabel: 'label',
        optionValue: 'value',
        format: this.service.approvalStatus,
      },
      { field: 'approved_usr_name', header: '審核人員' },
      {
        field: 'approved_date',
        header: '審核日期',
        format: v => this.datePipe.transform(v, 'YYYY/MM/dd')
      },
    ];
  });

  public readonly counterColumnsGroup: ColumnGroup[] = [
    { field: 'groupField1', header: '匯入分攤' },
    // { field: 'groupField2', header: '合約建檔' },
  ];

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
    private readonly cdr: ChangeDetectorRef,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.initializePage('TLS26080', this.dataForm);

    this.campaignLoading.set(!0);
    this.dialogLoading.set(!0);

    this.service.loadAPS1003(['E']);

    this.service.loadCampaignData()
      .pipe(finalize(() => this.campaignLoading.set(!1)))
      .subscribe({
        next: res => {
          if (res.Status !== '0000') return;
          this.campaignData.set(res.Data);
        },
      });
    this.service.getTLTTalentOptions()
      .pipe(finalize(() => this.dialogLoading.set(!1)))
      .subscribe({
        next: res => {
          this.dialogData.set(res);
          this.filteredDialogData.set(res);
          this.dialogTotalRecords.set(res.length);
          this.counterColumns();
        },
      });

    this.logger.debug(`init:`, [this.rowdata, this.campaignData(), this.dialogData()]);
  }

  public onSubmit(): void {
    this.handleSubmit(this.dataForm, () => {
      this.tableLoading.set(!0);
      if (!this.dt().validateAndShowErrors()) return void this.tableLoading.set(!1);

      const { pod_type2, ...d } = this.dataForm.getRawValue();
      const validTableData = this.tableData().filter(item => !item._isAutoInsertCandidate);
      if (!validTableData.length) {
        this.tableLoading.set(!1);
        return void this.messageService.errorBubble('請至少新增一筆專櫃資料');
      }

      this.logger.debug(`beforeSubmit:`, [d, validTableData]);

      const raw = <TLS26080InsertPayload>{
        ...d,
        pod_status: d.pod_status ?? '0',
        pod_desc: this.selectedCampaign()?.CampaignName ?? d.pod_desc ?? '',
        TALPORDERD_VOUCHERDetails: validTableData.map(item => ({
          ...item,
          pod_no: d.pod_no!,
          tlt_no: this.service.tltTalentMap().get(item.tlt_no)?.value ?? '',
          tlt_name: this.service.tltTalentMap().get(item.tlt_no)?.['Name'] ?? '',
          calc_date_type: item.calc_date_type ?? 'Y',
          cap_item_D16: 'D16',
          cap_item_D17: 'D17',
          approved_date: item.approved_date ? new Date(item.approved_date).toISOString() : void 0,
          pod_status: item.pod_status ?? '0',
        })),
      };
      const payload = Object.fromEntries(Object.entries(raw).filter(([k, v]) =>
        v !== null && v !== void 0 && (!(Array.isArray(v)) || v.length > 0) && !k.startsWith('_')
      )) as unknown as TLS26080InsertPayload;

      const request = this.isFormEditable
        ? this.service.updateTLS26080(payload)
        : this.service.insertTLS26080(payload);

      this.logger.debug(`submit:`, [d, payload]);
      request.pipe(finalize(() => this.tableLoading.set(!1)))
        .subscribe({
          next: res => {
            if (res.Status !== '0000') return;
            this.onCancel();
            this.messageService.successBubble(this.isFormEditable ? '更新成功' : '新增成功');
          },
        });
    });
  }

  private numVal(value: string | number): ValidationResult {
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

  private duplicateVal(value: string, rowData: TLS26080EditTable): ValidationResult {
    return this.tableData().some(item => item.tlt_no === value && rowData !== item)
      ? { isValid: !1, errorMessage: ['專櫃編號不可重複'] }
      : { isValid: !0, errorMessage: [] };
  }

  public onFieldChange(event: FieldChangeEvent): void {
    this.logger.debug(`onFieldChange:`, [event]);
    const tltid = event.rowData.talent_id;

    if (event.field === 'tlt_no') {
      if (event.value && event.rowData.talent_id) {
        this.service.keyInTLS26080({
          ...event.rowData,
          tpy_rate_D16: String(event.rowData.tpy_rate_D16),
          tpy_rate_D17: String(event.rowData.tpy_rate_D17),
          tlt_no: event.value
        }, this.tableData().map(res => ({
          ...res,
          tpy_rate_D16: String(res.tpy_rate_D16) as unknown as number,
          tpy_rate_D17: String(res.tpy_rate_D17) as unknown as number,
        }))).subscribe(res => {
          const data = res.Data.queryTLS26080_DetailResponses[0];
          event.rowData.tlt_name = data.tlt_name;
          event.rowData.talent_id = data.talent_id;

          this.service.queryTltTalentCharge(data.talent_id)
            .subscribe(opt => this.tltIdList.update(map => {
              const next = new Map(map);
              next.set(data.talent_id, opt);
              return next;
            }));
        });
      }
    }

    // 載入抽成類別選項
    if (event.field === 'tlt_id' && this.tltIdList().has(tltid)) {
      this.service.queryTltTalentCharge(tltid)
        .subscribe(opt => this.tltIdList.update(map => {
          const next = new Map(map);
          next.set(tltid, opt);
          return next;
        }));
    }
  }

  public toggleApprovalStatus(): void {
    const selectedRows = this.selectedItems();
    this.logger.debug(`toggleApprovalStatus:`, [selectedRows, this.dt().validateAndShowErrors()]);
    this.tableData.update(td => td.map(item => {
      if (!selectedRows.includes(item)) return item;

      // 切換審核狀態
      const isApproved = item.pod_status === ApprovalStatus.已核准;
      item.pod_status = isApproved ? ApprovalStatus.未核准 : ApprovalStatus.已核准;

      // 若切換為已核准,設定審核資訊;若切換為未核准,清除審核資訊
      if (!isApproved) {
        item.approved_usrno = this.usrData().user_No;
        item.approved_usr_name = this.usrData().user_Name;
        item.approved_date = new Date();
      } else {
        item.approved_usrno = void 0;
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
    this.logger.debug(`handleUpload:`, [event, formData]);

    this.uploadLoading.set(!0);
    this.service.uploadFile(formData).pipe(
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
      this.service.downloadXLSXExample()
        .pipe(finalize(() => this.downloadLoading.set(!1)))
        .subscribe({ next: res => this.logger.debug(`downloadXLSXExample:`, [res]) });
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

  public saveDialog(): void {
    this.displayDialog.set(!1);
    this.tableData.update(data => {
      const idSet = new Set(data.map(v => v.tlt_no));
      const newItems = this.selectedItemsDialog()
        .filter(item => !idSet.has(item.value))
        .map(item => ({
          talent_id: data.length > 0 ? data[0].talent_id : 0,
          tlt_id: '0',
          tlt_no: item.value,
          tlt_id_desc: '',
          tlt_name: item['Name'],
          calc_date_type: 'N' as 'Y' | 'N',
          cap_item_D16: '',
          tpy_rate_D16: '0' as unknown as number,
          cap_item_D17: '',
          tpy_rate_D17: '0' as unknown as number,
          pod_no: '',
          pod_status: '0' as '0' | '1' | '9',
        }));
      for (let item of newItems) {
        this.service.keyInTLS26080(item, this.tableData()).subscribe(res => {
          if (res.Status !== '0000') return;
          const data = res.Data.queryTLS26080_DetailResponses[0];
          this.tableData.update(td => {
            return td.map(d => d.tlt_no === item.tlt_no ? {
              ...data,
              tpy_rate_D16: Number(data.tpy_rate_D16.slice(0, -1)),
              tpy_rate_D17: Number(data.tpy_rate_D17.slice(0, -1)),
              pod_no: this.getPodNo()!,
            } : d);
          });
          this.service.queryTltTalentCharge(data.talent_id)
            .subscribe(opt => this.tltIdList.update(map => {
              const next = new Map(map);
              next.set(data.talent_id, opt);
              return next;
            }));
        });
      }
      return [...data, ...newItems];
    });

    this.logger.debug(`saveDialog:`, [this.selectedItemsDialog(), this.tableData(), this.tltIdList()]);
  }

  public onAutoCompleteInputChange(event: Record<string, string>): void {
    return void this.logger.debug(`onAutoCompleteInputChange:`, [event]);
  }

  public onformValueChanged(event: unknown): void {
    return void this.logger.debug(`onformValueChanged:`, [event]);
  }
}

type ValidationResult = { isValid: boolean; errorMessage: string[]; };
