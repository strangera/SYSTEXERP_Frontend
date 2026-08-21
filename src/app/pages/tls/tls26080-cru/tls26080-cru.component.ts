import { DatePipe, NgStyle } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, OnInit, signal, untracked, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TableComponent } from '@others/component/table/table.component';
import { AddButton, Column, ColumnGroup, createPaginationConfig, FieldChangeEvent } from '@others/component/table/table.model';
import { validateRequired } from '@others/component/table/validate-field.model';
import { ApprovalStatus, TLS26080Service } from '@service/api/tls/tls26080.service';
import { Option } from '@service/utility/dropdown-api.model';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarRangeComponent } from '@shared/components/calendar-range/calendar-range.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { DialogComponent } from '@shared/components/dialog/dialog.component';
import { DropdownTableComponent, FieldsConfig } from '@shared/components/dropdown-table/dropdown-table.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { ReportColumn } from '@shared/components/table-report/table-report.model';
import { ErrorReportService } from '@shared/service/error-report.service';
import { NGXLogger } from 'ngx-logger';
import { FileUpload, FileUploadHandlerEvent, FileUploadModule } from 'primeng/fileupload';
import { PanelModule } from 'primeng/panel';
import { finalize, map, Observable, tap } from 'rxjs';
import { DropdownApiService } from 'src/app/service/utility/dropdown-api.service';
import * as XLSX from 'xlsx-js-style';
import { WorkBook, WorkSheet } from 'xlsx-js-style';
import { CampaignData, TLS26080Data, TLS26080EditTable, TLS26080InsertPayload, TLS26080UpdatePayload } from '../tls26080/tls26080.model';

@Component({
  selector: 'app-tls26080-cru',
  templateUrl: './tls26080-cru.component.html',
  styleUrl: './tls26080-cru.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgStyle,
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
    TableComponent,
    TableReportComponent,
  ]
})
export class TLS26080CRUComponent extends BasicCruPageComponent<TLS26080Data> implements OnInit {

  public readonly ApprovalAction = ApprovalAction;
  public readonly dt = viewChild.required<TableComponent>('dt');
  public readonly fileUpload = viewChild.required<FileUpload>('fileUpload');

  private fieldChangeDebounceTimer: ReturnType<typeof setTimeout> | undefined = undefined;
  private readonly tltIdFetchingSet = new Set<number>();

  private readonly erroreportService = inject(ErrorReportService);

  private readonly usrData = computed(() => ({
    ...this.authService.currentUserValue,
  }));

  public readonly campaignForm = this.formBuilder.group({
    CampaignId: new FormControl<string | undefined>(undefined), // 活動編號
    CampaignName: new FormControl<string | undefined>(undefined), // 活動名稱
    ...createPaginationConfig([{ field: 'CampaignId', order: 1 }]),
  });
  public readonly cf = computed(() => this.campaignForm.controls);

  public readonly dataForm = this.formBuilder.group({
    pod_no: [null as string | null, [Validators.maxLength(25)]], // 活動單號
    pod_desc: [null as string | null, [Validators.required]], // 活動名稱
    pod_sdate: [this.service.dateS as Date | null, [Validators.required]], // 起始日期(起)
    pod_edate: [this.service.dateE as Date | null, [Validators.required]], // 起始日期(迄)
    pod_back_sdate: [null as Date | null, [Validators.required]], // 兌回日期(起)
    pod_back_edate: [null as Date | null, [Validators.required]], // 兌回日期(迄)
    pod_busdate: [null as Date | null, [Validators.required]], // 活動正檔日期
    pod_status: ['0', [Validators.required]], // 活動狀態 (0=未核准, 1=已核准, 9=刪除)
    pod_type: ['2', [Validators.required]], // 活動類型
    pod_type2: ['3', [Validators.required]], // 活動類型
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
        if (bsdate > bedate) return { invalidBackDateRange: true };

        // 兌回起始日期不可早於活動起始日期
        if (sdate && bsdate < sdate) return { invalidBackSDate: true };

        // 活動正檔日期必須在活動起始日期期間內
        if (!sdate || !edate || !busdate) return null;
        if (busdate < sdate || busdate >= edate) return { invalidBusDate: true };

        return null;
      }
    ]
  });
  public readonly df = computed(() => this.dataForm.controls);

  private readonly dfSignal = toSignal(this.dataForm.valueChanges);
  private readonly podDescSignal = toSignal(this.df().pod_desc.valueChanges);

  public readonly tls26080Data = signal<TLS26080Data[]>([]);
  public readonly tableData = signal<TLS26080EditTable[]>([]);
  public readonly totalRecords = signal<number>(0);
  public readonly campaignData = signal<CampaignData[]>([]);
  public readonly selectedItems = signal<TLS26080EditTable[]>([]);
  public readonly fieldChanges = signal<FieldChangeEvent<TLS26080EditTable> | undefined>(undefined, { equal: (a, b) => a?.field === b?.field && a?.index === b?.index && a?.value === b?.value });

  // 頁面專屬 Loading 狀態
  public readonly tableLoading = signal<boolean>(false);
  public readonly uploadLoading = signal<boolean>(false);
  public readonly downloadLoading = signal<boolean>(false);
  public readonly campaignLoading = signal<boolean>(false);

  public readonly isRowSelectable = (rowData: TLS26080EditTable) => rowData.pod_status !== '9';
  public readonly validateEntireRow = (rowData: TLS26080EditTable, rowIndex?: number): { isValid: boolean, errorMessage: string; } => {
    const tltNo = String(rowData?.tlt_no ?? '').trim();
    const tltId = String(rowData?.tlt_id ?? '').trim();

    if (!tltNo && !tltId) {
      return { isValid: true, errorMessage: '' };
    }

    const hasDuplicate = this.tableData().some((item, index) => {
      if (index === rowIndex) return false;
      if (item?._isAutoInsertCandidate) return false;

      const currentItemTltNo = String(item?.tlt_no ?? '').trim();
      const currentItemTltId = String(item?.tlt_id ?? '').trim();

      // 判斷當前遍歷的資料，其 tlt_no 與 tlt_id 是否與輸入的資料「雙雙相同」
      return currentItemTltNo === tltNo && currentItemTltId === tltId;
    });

    return hasDuplicate
      ? { isValid: false, errorMessage: '專櫃編號與抽成類別資料重複' }
      : { isValid: true, errorMessage: '' };
  };

  public readonly tltIdList = signal(new Map<number, Option[]>());

  // Dialog 相關
  public readonly displayDialog = signal<boolean>(false);
  public readonly selectedItemsDialog = signal<(Option & { talent_id: number })[]>([]);
  public readonly dialogData = signal<(Option & { talent_id: number })[]>([]);
  public readonly dialogLoading = signal<boolean>(false);

  public readonly dialogQueryForm = this.formBuilder.group({
    tlt_no: [null as string | null],
    tlt_name: [null as string | null],
  });
  public readonly dqf = computed(() => this.dialogQueryForm.controls);

  public readonly dialogColumns: ReportColumn[] = [
    { field: 'No', header: '專櫃編號' },
    { field: 'Name', header: '專櫃名稱' },
  ];

  public readonly queryTalentDialog = () => {
    this.dialogLoading.set(true);
    const campaign = this.selectedCampaign();
    return this.service.searchTltTalentForDialog({
      tlt_bdate: campaign ? new Date(campaign.StartTime) : this.df().pod_sdate.value,
      tlt_edate: campaign ? new Date(campaign.EndTime) : this.df().pod_edate.value,
    }).pipe(
      map(res => {
        const { tlt_no, tlt_name } = this.dialogQueryForm.getRawValue();
        return res.filter(item => {
          const no = item['No'] as string ?? '';
          const name = item['Name'] as string ?? '';
          if (tlt_no && !no.toLowerCase().includes(tlt_no.toLowerCase())) return false;
          if (tlt_name && !name.toLowerCase().includes(tlt_name.toLowerCase())) return false;
          return true;
        });
      }),
      tap(res => {
        this.dialogData.set(res);
        this.dialogLoading.set(false);
      }),
      map(res => ({ Status: '0000', Data: res, TotalCount: res.length }))
    );
  };

  private readonly lastOpenFlagCampaignId = signal<string | undefined>(undefined);
  private readonly lastDetailCampaignId = signal<string | undefined>(undefined);

  public readonly calcDateType = [
    { label: '活動起始日至截止日', value: 'Y' },
    { label: '正檔日至截止日', value: 'N' }
  ];

  public readonly getPodNo = computed(() => {
    return this.rowdata?.pod_no ?? undefined;
  });

  public readonly isSubmitDisabled = computed(() => {
    this.dfSignal(); // 僅用於觸發 computed 依賴（表單變更時重算）
    const data = this.tableData()?.filter(item => !item._isAutoInsertCandidate) || [];
    this.logger.debug(`isSubmitDisabled:`, [this.dataForm.valid, data]);

    // 基本表單驗證
    if (this.dataForm.invalid) return true;

    // 至少要有一筆專櫃資料
    if (!data.length) return true;

    // 驗證表格資料的必填欄位和數值範圍
    return data.some(item => {
      if (!item.tlt_no || !item.calc_date_type) return true;

      // 檢查 tpy_rate_D16 和 tpy_rate_D17 是否有值
      if (item.tpy_rate_D16 === undefined || item.tpy_rate_D16 === null) return true;
      if (item.tpy_rate_D17 === undefined || item.tpy_rate_D17 === null) return true;

      const rate_D16 = Number(item.tpy_rate_D16);
      const rate_D17 = Number(item.tpy_rate_D17);
      if (Number.isNaN(rate_D16) || Number.isNaN(rate_D17)) return true;

      if (rate_D16 < 0 || rate_D16 > 1 || rate_D17 < 0 || rate_D17 > 1) return true;

      return false;
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
    if (sdate === undefined || sdate === null) return;
    const base = new Date(sdate);
    if (Number.isNaN(base.getTime())) return;

    const newDate = new Date(base);
    newDate.setDate(newDate.getDate() + 7);

    this.dataForm.patchValue({ pod_busdate: newDate });
    this.logger.debug(`busDateEffect:`, [sdate, newDate]);
  }, { allowSignalWrites: true });

  /** 處理表格欄位變更事件 */
  public readonly fieldChangeEffect = effect(() => {
    const event = this.fieldChanges();
    const index = event?.index;
    if (!event || index === undefined) return;
    if (this.fieldChangeDebounceTimer !== undefined) clearTimeout(this.fieldChangeDebounceTimer);

    this.fieldChangeDebounceTimer = setTimeout(() => {
      const tableData = untracked(() => this.tableData());
      const rowData = event?.rowData;
      const talentId = tableData[index ?? 0]?.talent_id;
      this.logger.debug(`fieldChangeEffect:`, [event, tableData, this.tltIdList()]);

      this.executeFieldChange(event, index, tableData, rowData, talentId);
    }, 300);
  }, { allowSignalWrites: true });

  /** 根據選擇的活動更新表單 */
  public readonly campaignEffect = effect(() => {
    const podDesc = this.podDescSignal();
    const selected = this.selectedCampaign();
    if (!podDesc || !selected) return;
    const patch: {
      pod_no: string;
      pod_desc: string;
      pod_sdate: Date;
      pod_edate: Date;
      pod_back_sdate: Date | null;
      pod_back_edate: Date | null;
    } = {
      pod_no: selected.CampaignId,
      pod_desc: selected.CampaignId,
      pod_sdate: new Date(selected.StartTime),
      pod_edate: new Date(selected.EndTime),
      pod_back_sdate: selected.DiscountStartTime ? new Date(selected.DiscountStartTime) : null,
      pod_back_edate: selected.DiscountEndTime ? new Date(selected.DiscountEndTime) : null,
    };
    this.dataForm.patchValue(patch);
    this.logger.debug(`campaignEffect:`, [podDesc, selected]);
  }, { allowSignalWrites: true });

  /** 活動切換後，依新活動日期重載專櫃選項（openflag API） */
  public readonly campaignTalentOptionsEffect = effect(() => {
    const selected = this.selectedCampaign();
    if (!selected) return;
    if (this.lastOpenFlagCampaignId() === selected.CampaignId) return;
    this.lastOpenFlagCampaignId.set(selected.CampaignId);

    this.fetchTltTalentOptions({
      ven_no: '',
      tlt_bdate: new Date(selected.StartTime),
      tlt_edate: new Date(selected.EndTime),
    }).subscribe({
      next: res => {
        const options = res.map(item => ({
          ...item,
          No: item['No'] ?? item.value,
          Name: item['Name'] ?? item.label,
          value: item.value ?? item['No'],
          label: item.label ?? `${item['No']}-${item['Name']}`,
          talent_id: item.talent_id,
        }));
        this.service.tltTalentOptions.set(options);
      },
    });
  }, { allowSignalWrites: true });

  /** 新增模式選活動後，主動查詢 detail 並帶回合約分攤欄位 */
  public readonly createCampaignDetailEffect = effect(() => {
    if (!this.isFormCreateable) return;
    const selected = this.selectedCampaign();
    if (!selected) return;
    if (this.lastDetailCampaignId() === selected.CampaignId) return;
    this.lastDetailCampaignId.set(selected.CampaignId);

    this.tableLoading.set(true);
    this.service.loadTLS26080Detail(selected.CampaignId)
      .pipe(finalize(() => this.tableLoading.set(false)))
      .subscribe({
        next: res => {
          const data = res?.Data ?? [];

          // 【優化】批量查詢
          const ids = data.map((item: any) => Number(item.talent_id)).filter(Boolean);
          this.batchFetchTltIdOptions(ids);

          this.tableData.set(this.mapDetailRows(data));
          this.totalRecords.set(res?.TotalCount || data.length);
        },
      });
  }, { allowSignalWrites: true });

  /** 根據選擇的活動更新編號 */
  public readonly campaignIdEffect = effect(() => {
    const data = this.campaignData();
    if (!data || data.length === 0 || !this.selectedCampaign()) return;
    this.dataForm.patchValue({ pod_no: this.selectedCampaign()!.CampaignId });
    this.logger.debug(`campaignIdEffect:`, [data, this.selectedCampaign()]);
  }, { allowSignalWrites: true });

  /** 載入專櫃活動設定明細資料 */
  public readonly initEffect = effect(() => {
    if (this.isFormCreateable) return this.initEffect.destroy();
    const id = this.getPodNo();
    if (!id) return;

    this.tableLoading.set(true);
    this.service.loadTLS26080Detail(id)
      .pipe(finalize(() => this.tableLoading.set(false)))
      .subscribe({
        next: res => {
          const data = res.Data ?? [];

          // 【優化】先收集全部的 talent_id 並一次查詢
          const ids = data.map((item: any) => Number(item.talent_id)).filter(Boolean);
          this.batchFetchTltIdOptions(ids);

          this.tableData.set(this.mapDetailRows(data));
          this.totalRecords.set(res.TotalCount || 0);

          this.initEffect.destroy();
        },
      });
  }, { allowSignalWrites: true });

  // 用名稱顯示但用編號傳值
  public readonly fieldsConfig: FieldsConfig[] = [
    { field: 'CampaignId', header: '活動名稱', mainDataField: true },
  ];

  // 環友資料表
  public readonly campaignColumns: Column[] = [
    { field: 'CampaignId', header: '活動編號' },
    { field: 'CampaignName', header: '活動名稱' },
    { field: 'StartTime', header: '活動開始時間', format: v => this.datePipe.transform(v, 'YYYY/MM/dd') },
    { field: 'EndTime', header: '活動結束時間', format: v => this.datePipe.transform(v, 'YYYY/MM/dd') },
    { field: 'DiscountStartTime', header: '活動兌回日期起日', format: v => this.datePipe.transform(v, 'YYYY/MM/dd') },
    { field: 'DiscountEndTime', header: '活動兌回日期迄日', format: v => this.datePipe.transform(v, 'YYYY/MM/dd') },
    { field: 'AccountingType', header: '帳務拆分類別' },
    { field: 'Remark', header: '活動備註' },
  ];

  // 專櫃資料表
  public readonly counterColumns = computed<Column[]>(() => {
    const tltIdMap = this.tltIdList();

    return [
      {
        field: 'tlt_no',
        header: '專櫃編號',
        type: this.isFormReadable ? undefined : 'dropdown',
        showClear: false,
        options: this.service.tltTalentOptions(),
        optionLabel: 'label',
        optionValue: 'No',
        templateLabel: 'label',
        validate: [validateRequired],
        disabled: (r) => r.pod_status !== '0',
      },
      {
        field: 'tlt_name',
        header: '櫃位名稱',
        format: (v, _i, r) =>
          (v != null && String(v) !== '' ? String(v) : this.service.tltTalentMap().get(r.tlt_no)?.['Name']) ?? '',
      },
      {
        field: 'tlt_id',
        header: '抽成類別',
        type: this.isFormReadable ? undefined : 'dropdown',
        showClear: false,
        options: (r: any) => tltIdMap.get(r.talent_id) ?? [],
        optionLabel: 'label',
        optionValue: 'value',
        validate: [validateRequired],
        disabled: (r) => r.pod_status !== '0',
      },
      // {
      //   field: 'tlt_id_desc',
      //   header: '抽成類別名稱',
      //   format: (v, i, r) => {
      //     const opts = tltIdMap.get(r.talent_id);
      //     return opts?.find(opt => opt.value === r.tlt_id)?.['tlt_id_desc'] ?? '';
      //   }
      // },
      {
        field: 'calc_date_type',
        header: '預售起日計算',
        type: this.isFormReadable ? undefined : 'dropdown',
        showClear: false,
        options: this.calcDateType,
        optionLabel: 'label',
        optionValue: 'value',
        validate: [validateRequired],
        disabled: (r) => r.pod_status !== '0',
        format: v => v === 'Y' ? '活動起始日至截止日' : '正檔日至截止日',
      },
      {
        field: 'tpy_rate_D16',
        header: 'D16',
        groupField: 'groupField1',
        type: this.isFormReadable ? undefined : 'inputNumber',
        validate: [validateRequired, this.numVal.bind(this)],
        maxFractionDigits: 6,
        minFractionDigits: 0,
        min: 0,
        max: 1,
        disabled: (r) => !this.isRowEditable(r),
        format: v => (v === null || v === undefined || v === '') ? '' : Number(v).toString(),
        width: '4rem',
        textAlign: 'right',
        cellClass: (row: TLS26080EditTable) => (this.isImportContractRateMismatchD16(row) ? 'text-red-500' : ''),
      },
      {
        field: 'tpy_rate_D17',
        header: 'D17',
        groupField: 'groupField1',
        type: this.isFormReadable ? undefined : 'inputNumber',
        validate: [validateRequired, this.numVal.bind(this)],
        maxFractionDigits: 6,
        minFractionDigits: 0,
        min: 0,
        max: 1,
        disabled: (r) => !this.isRowEditable(r),
        format: v => (v === null || v === undefined || v === '') ? '' : Number(v).toString(),
        width: '4rem',
        textAlign: 'right',
        cellClass: (row: TLS26080EditTable) => (this.isImportContractRateMismatchD17(row) ? 'text-red-500' : ''),
      },
      {
        field: 'fare_rate_d16' as const,
        header: 'D16',
        groupField: 'groupField2',
        textAlign: 'right',
      },
      {
        field: 'fare_rate_d17' as const,
        header: 'D17',
        groupField: 'groupField2',
        textAlign: 'right',
      },
      {
        field: 'pod_status',
        header: '審核狀態',
        options: () => [{ value: '0', label: '未核准' }, { value: '1', label: '已核准' }],
        optionLabel: 'label',
        optionValue: 'value',
        format: this.service.approvalStatus,
      },
      {
        field: 'approved_usr_name',
        header: '審核人員',
      },
      {
        field: 'approved_date',
        header: '審核日期',
        format: v => this.datePipe.transform(v, 'YYYY/MM/dd')
      },
      // {
      //   field: 'approval_action',
      //   header: '審核反審核',
      //   type: 'checkbox',
      //   trueValue: '1',
      //   falseValue: '0',
      //   validate: [this.approvalVal.bind(this)],
      //   // disabled: (v, i, r) => !this.approvalVal(r).isValid,
      // }
    ];
  });

  public readonly addButton = computed((): AddButton[] => {
    const approval = (rowData: TLS26080EditTable) => {
      this.toggleApprovalStatus([rowData]);
      this.service.loadApproval(rowData).subscribe(this.onSubmit.bind(this));
    };

    return [
      {
        label: '核准', icon: 'pi pi-check-circle text-green-500',
        action: approval,
        disabled: (rowData: TLS26080Data) => rowData.pod_status !== ApprovalStatus.未核准,
      },
      {
        label: '反核准', icon: 'pi pi-undo text-orange-500',
        action: approval,
        disabled: (rowData: TLS26080Data) => rowData.pod_status !== ApprovalStatus.已核准,
      },
    ];
  });

  public readonly counterColumnsGroup = computed<ColumnGroup[]>(() => [
    { field: 'groupField1', header: '匯入分攤' },
    { field: 'groupField2', header: '合約分攤' },
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
    private readonly dropdown: DropdownApiService,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.initializePage('TLS26080', this.dataForm);
    if (this.isFormEditable) {
      this.df().pod_desc.disable({ emitEvent: false });
    }

    this.campaignLoading.set(true);

    this.service.loadAPS1003(['E']);

    this.service.loadCampaignData()
      .pipe(finalize(() => this.campaignLoading.set(false)))
      .subscribe({
        next: res => {
          if (res.Status !== '0000') return;
          this.campaignData.set(res.Data);
        },
      });

    this.fetchTltTalentOptions({ ven_no: '', tlt_bdate: this.df().pod_sdate.value, tlt_edate: this.df().pod_edate.value }).subscribe();

    this.logger.debug(`init:`, [this.rowdata, this.campaignData()]);
  }

  public onSubmit(): void {
    this.submitted = true;
    if (this.dataForm.invalid) {
      this.messageService.errorBubble('請填寫必填欄位');
      return;
    }

    this.handleSubmit(this.dataForm, () => {
      this.tableLoading.set(true);
      if (!this.dt().validateAndShowErrors()) {
        this.tableLoading.set(false);
        return;
      }

      const rowData = this.rowdata!;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars -- 排除 pod_type2，僅用於表單不送 API
      const { pod_type2, ...d } = this.dataForm.getRawValue();
      const validTableData = this.tableData().filter(item => !item._isAutoInsertCandidate);

      this.logger.debug(`beforeSubmit:`, [rowData, d, validTableData]);

      // 驗證邏輯與錯誤提示
      if (this.dataForm.invalid) {
        this.messageService.errorBubble('表單資料有誤，請確認後再送出');
        this.tableLoading.set(false);
        return;
      }

      if (!validTableData.length) {
        this.messageService.errorBubble('請至少新增一筆專櫃資料');
        this.tableLoading.set(false);
        return;
      }

      const tltTalentMap = this.service.tltTalentMap();
      const hasUnknownTlt = validTableData.some(
        item => !tltTalentMap.has(String(item.tlt_no)),
      );
      if (hasUnknownTlt) {
        this.messageService.errorBubble('專案編號不存在，無法儲存');
        this.tableLoading.set(false);
        return;
      }

      // 逐筆驗證表格資料
      for (const item of validTableData) {
        if (!item.tlt_no || !item.calc_date_type) {
          this.messageService.errorBubble('專櫃編號及計算天數類型為必填欄位，請確認後再送出');
          this.tableLoading.set(false);
          return;
        }

        if (item.tpy_rate_D16 === undefined || item.tpy_rate_D16 === null) {
          this.messageService.errorBubble('D16 費用比率為必填欄位，請確認後再送出');
          this.tableLoading.set(false);
          return;
        }
        if (item.tpy_rate_D17 === undefined || item.tpy_rate_D17 === null) {
          this.messageService.errorBubble('D17 費用比率為必填欄位，請確認後再送出');
          this.tableLoading.set(false);
          return;
        }

        const rate_D16 = Number(item.tpy_rate_D16);
        const rate_D17 = Number(item.tpy_rate_D17);
        if (Number.isNaN(rate_D16) || Number.isNaN(rate_D17)) {
          this.messageService.errorBubble('D16 和 D17 費用比率必須為有效的數字，請確認後再送出');
          this.tableLoading.set(false);
          return;
        }

        if (rate_D16 < 0 || rate_D16 > 1 || rate_D17 < 0 || rate_D17 > 1) {
          this.messageService.errorBubble('D16 和 D17 費用比率必須介於 0 到 1 之間，請確認後再送出');
          this.tableLoading.set(false);
          return;
        }
      }

      const raw = {
        ...d,
        pod_no: d.pod_no ?? '',
        pod_desc: this.selectedCampaign()?.CampaignName ?? d.pod_desc ?? '',
        pod_sdate: d.pod_sdate ?? this.service.dateS,
        pod_edate: d.pod_edate ?? this.service.dateE,
        pod_busdate: d.pod_busdate!,
        pod_back_sdate: d.pod_back_sdate!,
        pod_back_edate: d.pod_back_edate!,
        // fare_rate_* 僅 queryTLS26080_Detail 使用，不寫入 insert／update
        TALPORDERD_VOUCHERDetails: validTableData.map(item => {
          const { fare_rate_d16: _fr16, fare_rate_d17: _fr17, ...row } = item;
          return {
            ...row,
            pod_no: d.pod_no ?? '',
            tlt_no: this.service.tltTalentMap().get(item.tlt_no)?.value ?? '',
            tlt_name: this.service.tltTalentMap().get(item.tlt_no)?.['Name'] ?? '',
            calc_date_type: item.calc_date_type ?? 'Y',
            cap_item_D16: item.cap_item_D16 ?? 'D16',
            cap_item_D17: item.cap_item_D17 ?? 'D17',
            tpy_rate_D16: item.tpy_rate_D16,
            tpy_rate_D17: item.tpy_rate_D17,
            approved_date: item.approved_date ? new Date(item.approved_date).toISOString() : null,
            pod_status: item.pod_status ?? '0',
          };
        }),
      };
      const payload = Object.fromEntries(Object.entries(raw).filter(([k, v]) =>
        v !== null && v !== undefined && (!(Array.isArray(v)) || v.length > 0) && !k.startsWith('_')
      )) as unknown as TLS26080InsertPayload;

      const request = this.isFormEditable
        ? this.service.updateTLS26080({ ...rowData, ...payload } as TLS26080UpdatePayload)
        : this.service.insertTLS26080(payload);

      this.logger.debug(`submit:`, [d, payload]);
      request.pipe(finalize(() => this.tableLoading.set(false)))
        .subscribe({
          next: res => {
            if (res.Status !== '0000') return;
            this.onCancel();
            this.messageService.successBubble(this.isFormEditable ? '更新成功' : '新增成功');
          },
        });
    });
  }

  public toggleApprovalStatus(rowData: TLS26080EditTable[], from?: ApprovalAction): void {
    this.logger.debug(`toggleApprovalStatus:`, [rowData]);
    if (!rowData?.length) return this.messageService.errorBubble('請先勾選要審核的項目');

    const target = from ?? (rowData[0].pod_status === ApprovalStatus.已核准 ? ApprovalAction.Revoke : ApprovalAction.Approve);

    if (target === ApprovalAction.Approve) {
      const hasReviewedItems = rowData.some(row => row.pod_status === ApprovalStatus.已核准);
      if (hasReviewedItems) {
        this.messageService.warnBubble('您選取包含已審核的資料，無法進行審核。');
        return;
      }
    }

    if (target === ApprovalAction.Revoke) {
      const hasUnreviewedItems = rowData.some(row => row.pod_status === ApprovalStatus.未核准);
      if (hasUnreviewedItems) {
        this.messageService.warnBubble('您選取包含未審核的資料，無法進行反審核。');
        return;
      }
    }

    if (from === ApprovalAction.Approve || from === ApprovalAction.Revoke) {
      const message = target === ApprovalAction.Approve ? '確認是否審核?' : '確認是否反審核?';
      this.messageService.confirm({
        header: '確認',
        message,
        accept: () => this.applyApprovalStatus(rowData, target),
      });
      return;
    }

    this.applyApprovalStatus(rowData, target);
  }

  private applyApprovalStatus(rowData: TLS26080EditTable[], target: ApprovalAction): void {
    this.loading = true;
    const usrData = this.usrData();
    const approvedRows = rowData.filter(row => row.pod_status !== ApprovalStatus.已核准);
    const unapprovedRows = rowData.filter(row => row.pod_status !== ApprovalStatus.未核准);

    if (target === ApprovalAction.Approve && approvedRows.length) {
      const updateSet = new Set(approvedRows.map(row => row._rowKey));
      this.tableData.update(td => td.map(item => {
        if (!updateSet.has(item._rowKey)) return item;
        item.pod_status = ApprovalStatus.已核准;
        item.approved_usrno = usrData.user_No;
        item.approved_usr_name = usrData.user_Name;
        item.approved_date = new Date();
        return item;
      }));
      this.loading = false;
      return;
    }

    if (target === ApprovalAction.Revoke && unapprovedRows.length) {
      const updateSet = new Set(unapprovedRows.map(row => row._rowKey));
      this.tableData.update(td => td.map(item => {
        if (!updateSet.has(item._rowKey)) return item;
        item.pod_status = ApprovalStatus.未核准;
        item.approved_usrno = undefined;
        item.approved_usr_name = undefined;
        item.approved_date = undefined;
        return item;
      }));
    }

    this.loading = false;
  }

  public openDialog(): void {
    this.selectedItemsDialog.set([]);
    this.displayDialog.set(true);
    this.onQueryDialog();
  }

  public onQueryDialog(): void {
    this.queryTalentDialog()
      .subscribe();
  }

  public saveDialog(): void {
    const selected = this.selectedItemsDialog();
    if (!selected.length) {
      this.displayDialog.set(false);
      return;
    }

    const newRows: TLS26080EditTable[] = selected.map(item => ({
      _rowKey: crypto.randomUUID(),
      id: 0,
      talent_id: item.talent_id,
      tlt_id: '',
      tlt_id_desc: '',
      tlt_no: (item['No'] as string) ?? item.value,
      tlt_name: (item['Name'] as string) ?? '',
      calc_date_type: 'Y' as const,
      cap_item_D16: 'D16',
      tpy_rate_D16: 0,
      cap_item_D17: 'D17',
      tpy_rate_D17: 0,
      pod_no: this.getPodNo() ?? '',
      pod_status: '0' as const,
      approved_usrno: '',
      approved_usr_name: '',
      approved_date: undefined,
    }));

    // 預載抽成類別下拉選項
    const ids = selected.map(item => Number(item.talent_id)).filter(Boolean);
    this.batchFetchTltIdOptions(ids);

    this.tableData.update(td => [...td, ...newRows]);

    // 批次查詢 D16/D17 預設費率並回填
    for (const row of newRows) {
      this.service.queryTLS26080TLTTALENT_D16_D17({ tlt_no: row.tlt_no, tlt_id: '0' })
        .subscribe(res => {
          const d16d17 = res.Status === '0000' && res.Data ? res.Data : null;
          if (!d16d17) return;
          this.tableData.update(td => td.map(t => {
            if (t._rowKey !== row._rowKey) return t;
            return {
              ...t,
              tlt_id: d16d17.tlt_id ?? t.tlt_id,
              tpy_rate_D16: this.parseRateValue(d16d17.tpy_rate_D16),
              tpy_rate_D17: this.parseRateValue(d16d17.tpy_rate_D17),
              cap_item_D16: d16d17.cap_item_D16 ?? t.cap_item_D16,
              cap_item_D17: d16d17.cap_item_D17 ?? t.cap_item_D17,
            };
          }));
        });
    }

    this.selectedItemsDialog.set([]);
    this.displayDialog.set(false);
  }

  public onAddRow(): void {
    const blank: TLS26080EditTable = {
      _rowKey: crypto.randomUUID(),
      id: 0,
      talent_id: 0,
      tlt_id: '',
      tlt_id_desc: '',
      tlt_no: '',
      tlt_name: '',
      calc_date_type: 'Y',
      cap_item_D16: 'D16',
      tpy_rate_D16: 0,
      cap_item_D17: 'D17',
      tpy_rate_D17: 0,
      pod_no: this.getPodNo() ?? '',
      pod_status: '0',
      approved_usrno: '',
      approved_usr_name: '',
      approved_date: undefined,
    };
    this.tableData.update(td => [...td, blank]);
  }

  public handleUpload(event: FileUploadHandlerEvent): void {
    const { pod_sdate, pod_edate } = this.dataForm.getRawValue();
    if (pod_sdate == null || pod_edate == null) {
      this.messageService.errorBubble('請先選擇活動起始日期');
      this.fileUpload().clear();
      return;
    }

    const tlt_bdate = this.datePipe.transform(pod_sdate, 'yyyy-MM-dd');
    const tlt_edate = this.datePipe.transform(pod_edate, 'yyyy-MM-dd');
    if (!tlt_bdate || !tlt_edate) {
      this.messageService.errorBubble('請先選擇活動起始日期');
      this.fileUpload().clear();
      return;
    }

    const formData = new FormData();
    formData.append('tlt_bdate', tlt_bdate);
    formData.append('tlt_edate', tlt_edate);
    formData.append('file', event.files[0]);
    this.logger.debug(`handleUpload:`, [event, formData]);

    this.uploadLoading.set(true);
    this.service.uploadFile(formData).pipe(
      map(res => {
        if (res.Success) return res;
        if (res.ErrorFilePath) return res;
        throw new Error('上傳失敗 發生錯誤');
      }),
      finalize(() => this.uploadLoading.set(false))
    ).subscribe({
      next: res => {
        const data = res.queryTLS26080_DetailResponses || [];
        if (data.length > 0) {
          const ids = data.map((item: any) => Number(item.talent_id)).filter(Boolean);
          this.batchFetchTltIdOptions(ids);
          this.tableData.update(td => {
            if (td.length === 0) return data.map(item => ({
              ...item,
              _rowKey: crypto.randomUUID(),
              tlt_id_desc: this.service.tltTalentMap().get(item.tlt_no)?.['tlt_id_desc'] || '',
              tlt_name: this.service.tltTalentMap().get(item.tlt_no)?.['Name'] || '',
              pod_no: item.pod_no ?? this.getPodNo()!,
              tpy_rate_D16: Number(item.tpy_rate_D16),
              tpy_rate_D17: Number(item.tpy_rate_D17),
            }));
            return [
              ...td,
              ...data.map(item => ({
                ...item,
                _rowKey: crypto.randomUUID(),
                tlt_id_desc: this.service.tltTalentMap().get(item.tlt_no)?.['tlt_id_desc'] || '',
                tlt_name: this.service.tltTalentMap().get(item.tlt_no)?.['Name'] || '',
                pod_no: item.pod_no ?? this.getPodNo()!,
                tpy_rate_D16: Number(item.tpy_rate_D16),
                tpy_rate_D17: Number(item.tpy_rate_D17),
              })).filter(newItem => !td.some(existingItem => existingItem.tlt_no === newItem.tlt_no && existingItem.tlt_id === newItem.tlt_id)),
            ];
          });
        }
        if (!res.Success) {
          // Success = false 代表有部分失敗，提示匯入結果並提供錯誤檔
          this.erroreportService.showImportError(
            res.ErrorFilePath,
            `匯入完畢：成功 ${res.SuccessCount} 筆，失敗 ${res.ErrorCount} 筆`
          );
        } else {
          // 全部成功
          this.messageService.successBubble('上傳成功');
        }
      },
      error: err => this.messageService.errorBubble(err.message || '上傳失敗'),
    });

    this.fileUpload().clear();
  }

  private executeFieldChange(
    event: FieldChangeEvent<TLS26080EditTable>,
    index: number,
    tableData: TLS26080EditTable[],
    rowData: TLS26080EditTable,
    talentId: number
  ): void {
    switch (event.field) {
      case 'tlt_no': {
        // if (!this.duplicateVal(event.value, rowData).isValid) {
        //   this.messageService.errorBubble('專櫃編號重複');
        //   this.fieldChanges.set(undefined);
        //   this.tableData.update(td => [...td]);
        //   return;
        // }
        const newTalentId = this.service.tltTalentOptions().find(o => o.value === event.value)?.talent_id;
        if (newTalentId == null) {
          rowData._err = true;
          this.messageService.errorBubble('無法取得專櫃 ID');
          return;
        }

        this.service.queryTLS26080TLTTALENT_D16_D17({ tlt_no: event.value, tlt_id: '0' })
          .subscribe(d16Res => {
            const d16d17 = d16Res.Status === '0000' && d16Res.Data ? d16Res.Data : null;

            this.service.queryTltTalentCharge(newTalentId).subscribe(opts => {
              this.updateTltIdOptions(newTalentId);

              const tltId = d16d17?.tlt_id ?? opts?.[0]?.value ?? '0';
              const chargeOpt = opts.find(c => c.value === tltId);
              const tltIdDesc = chargeOpt?.['tlt_id_desc'] ?? opts?.[0]?.['tlt_id_desc'] ?? '';

              this.tableData.update(td =>
                td.map((t, i) => {
                  if (i !== index) return t;
                  return {
                    ...t,
                    talent_id: newTalentId,
                    tlt_no: event.value,
                    tlt_name: this.service.tltTalentMap().get(event.value)?.['Name'] ?? '',
                    tlt_id: tltId,
                    tlt_id_desc: tltIdDesc,
                    tpy_rate_D16: d16d17 ? this.parseRateValue(d16d17.tpy_rate_D16) : t.tpy_rate_D16,
                    tpy_rate_D17: d16d17 ? this.parseRateValue(d16d17.tpy_rate_D17) : t.tpy_rate_D17,
                    cap_item_D16: d16d17?.cap_item_D16 ?? t.cap_item_D16 ?? 'D16',
                    cap_item_D17: d16d17?.cap_item_D17 ?? t.cap_item_D17 ?? 'D17',
                  };
                })
              );
              this.updateTltIdOptions(talentId);
              this.fieldChanges.set(undefined);
            });
          });
        break;
      }

      case 'tlt_id': {
        const tltNo = tableData[index]?.tlt_no;
        if (!tltNo || !event.value) return;
        this.service.queryTLS26080TLTTALENT_D16_D17({ tlt_no: tltNo, tlt_id: event.value })
          .subscribe(res => {
            const d16d17 = res.Status === '0000' && res.Data ? res.Data : null;
            if (!d16d17) return;
            this.tableData.update(td => td.map((t, i) => {
              if (i !== index) return t;
              return {
                ...t,
                tpy_rate_D16: this.parseRateValue(d16d17.tpy_rate_D16),
                tpy_rate_D17: this.parseRateValue(d16d17.tpy_rate_D17),
                cap_item_D16: d16d17.cap_item_D16 ?? t.cap_item_D16,
                cap_item_D17: d16d17.cap_item_D17 ?? t.cap_item_D17,
              };
            }));
            this.fieldChanges.set(undefined);
          });
        break;
      }

      case 'approval_action': {
        this.toggleApprovalStatus([rowData]);
        return this.fieldChanges.set(undefined);
      }
      default: return;
    }
  }

  public async onExportExcelTemplate(): Promise<void> { // 加入 async
    const exampleByApi = true;
    const headerRow1 = ['專櫃編號', '櫃位名稱', '抽成類別', '抽成類別名稱', '正檔起日計算', '匯入分攤', null, '合約建檔'];
    const headerRow2 = [null, null, null, null, null, 'D16', 'D17', 'D16', 'D17'];
    const example = ['000064', 'gozo', '0', '少女裝', 'Y', '1', '5'];

    if (exampleByApi) {
      this.downloadLoading.set(true);
      this.service.downloadXLSXExample(true, {
        tlt_bdate: this.df().pod_sdate.value,
        tlt_edate: this.df().pod_edate.value,
      })
        .pipe(finalize(() => this.downloadLoading.set(false)))
        .subscribe({ next: res => this.logger.debug(`downloadXLSXExample:`, [res]) });
      return;
    }
    // 生成工作表
    const ws: WorkSheet = XLSX.utils.aoa_to_sheet([headerRow1, headerRow2, example]);

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

    const wb: WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '範本');
    const name = `專櫃活動設定匯入範本.xlsx`;
    // const name = `專櫃活動設定匯入範本-${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, name);
  }

  public onExportBlankExcelTemplate(): void {
    this.downloadLoading.set(true);
    this.service.downloadXLSXExample(false, {
      tlt_bdate: this.df().pod_sdate.value,
      tlt_edate: this.df().pod_edate.value,
    })
      .pipe(finalize(() => this.downloadLoading.set(false)))
      .subscribe({
        next: res => this.logger.debug(`downloadXLSXExample blank:`, [res]),
      });
  }

  private numVal(value: string | number): ValidationResult {
    // 將輸入值轉為字串並去除頭尾空白與 % 符號
    const normalized = typeof value === 'number' ? value.toString() : `${value ?? ''}`.trim().replace(/%$/, '');
    if (normalized === '') return { isValid: false, errorMessage: ['請輸入有效的數字'] };

    // 1. 檢查是否為合法數字
    const num = Number(normalized);
    if (Number.isNaN(num) || !Number.isFinite(num)) return { isValid: false, errorMessage: ['請輸入有效的數字'] };

    // 2. 商業邏輯檢查：數值必須介於 0 到 1 之間
    if (num < 0 || num > 1) return { isValid: false, errorMessage: ['請輸入 0 到 1 之間的數字'] };

    // 3. 資料庫 numeric(8, 6) 長度防呆
    // 將數字以小數點拆分，例如 "0.010000" 會變成 ["0", "010000"]
    const parts = normalized.split('.');
    const integerPart = parts[0].replace('-', ''); // 取整數部分（過濾掉負號，雖然前面已擋掉負數）
    const decimalPart = parts[1] || '';            // 取小數部分，若無小數則為空字串

    // 整數部分最多 2 位 (8 - 6 = 2)
    if (integerPart.length > 2) {
      return { isValid: false, errorMessage: ['整數部分不能超過 2 位數'] };
    }

    // 小數部分最多 6 位
    if (decimalPart.length > 6) {
      return { isValid: false, errorMessage: ['小數部分不能超過 6 位數'] };
    }

    return { isValid: true, errorMessage: [] };
  }

  /** 檢查專櫃編號是否重複 */
  private duplicateVal(value: string, rowData: TLS26080EditTable): ValidationResult {
    return this.tableData().some(item => item.tlt_no === value && rowData !== item)
      ? { isValid: false, errorMessage: ['專櫃編號重複'] }
      : { isValid: true, errorMessage: [] };
  }

  /** 檢查是否可進行審核操作 */
  private approvalVal(rowData: TLS26080EditTable): ValidationResult {
    const currentStatus = rowData?.pod_status;
    const err = rowData?._err;
    if (err) return { isValid: false, errorMessage: ['專櫃資料有誤，無法進行審核操作'] };
    if (currentStatus === '9') return { isValid: false, errorMessage: ['已作廢資料無法進行審核操作'] };
    return { isValid: true, errorMessage: [] };
  }

  public onDelete(): void {
    const selected = this.selectedItems();
    if (!selected.length) return;
    if (selected.some(item => item.pod_status === ApprovalStatus.已核准)) {
      this.messageService.warnBubble('已審核資料不可刪除');
      return;
    }
    this.messageService.confirm({
      header: '確認移除',
      message: '是否確認移除所選專櫃資料？',
      accept: () => {
        this.logger.debug(`onDelete:`, [this.tableData()]);
        const selectedKeys = new Set(selected.map(si => si._rowKey));
        this.tableData.update(td => td.filter(item => !selectedKeys.has(item._rowKey)));
      },
    });
  }

  /** 查詢並更新抽成類別選項（已快取或正在請求中則跳過） */
  private updateTltIdOptions(talentId: number): void {
    if (this.tltIdList().has(talentId) || this.tltIdFetchingSet.has(talentId)) return;
    this.tltIdFetchingSet.add(talentId);
    this.service.queryTltTalentCharge(talentId).subscribe({
      next: opt => {
        this.tltIdList.update(map => new Map(map).set(talentId, opt));
        this.tltIdFetchingSet.delete(talentId);
      },
      error: () => this.tltIdFetchingSet.delete(talentId),
    });
  }

  public onAutoCompleteInputChange(event: Record<string, string>): void {
    this.logger.debug(`onAutoCompleteInputChange:`, [event]);
  }

  public onformValueChanged(event: unknown): void {
    this.logger.debug(`onformValueChanged:`, [event]);
  }

  /** 匯入分攤 D16 費用比率與合約分攤不一致時標紅。 */
  private isImportContractRateMismatchD16(row: TLS26080EditTable): boolean {
    return this.importAndContractRatesDiffer(row.tpy_rate_D16, row.fare_rate_d16);
  }

  /** 匯入分攤 D17 費用比率與合約分攤不一致時標紅。 */
  private isImportContractRateMismatchD17(row: TLS26080EditTable): boolean {
    return this.importAndContractRatesDiffer(row.tpy_rate_D17, row.fare_rate_d17);
  }

  private importAndContractRatesDiffer(imported: number | null | undefined, contract: number | null | undefined): boolean {
    const a = Number(imported);
    const b = Number(contract);
    if (Number.isNaN(a) || Number.isNaN(b)) return false;
    return Number(a.toFixed(6)) !== Number(b.toFixed(6));
  }

  private isRowEditable(rowData: TLS26080EditTable): boolean {
    return rowData.pod_status !== ApprovalStatus.已核准 && rowData.pod_status !== ApprovalStatus.刪除;
  }

  private parseRateValue(value: string): number {
    if (value === undefined || value === null || value === '') return 0;
    const fallback = 0;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? fallback : parsed;
  }

  private mapDetailRows(data: TLS26080EditTable[]): TLS26080EditTable[] {
    return data.map(v => ({
      ...v,
      _rowKey: v.id ? String(v.id) : crypto.randomUUID(),
      tpy_rate_D16: Number(v.tpy_rate_D16),
      tpy_rate_D17: Number(v.tpy_rate_D17),
      fare_rate_d16: Number(v.fare_rate_d16 ?? 0),
      fare_rate_d17: Number(v.fare_rate_d17 ?? 0),
      approval_action: v.pod_status === '1' ? '1' : '0',
    }));
  }

  public fetchTltTalentOptions(venNoOrBody: string | Record<string, unknown>): Observable<(Option & { talent_id: number })[]> {
    const ven_no = typeof venNoOrBody === 'string' ? venNoOrBody : (venNoOrBody?.['ven_no'] as string) ?? '';
    const tlt_bdate = typeof venNoOrBody === 'string'
      ? this.df().pod_sdate.value
      : (venNoOrBody?.['tlt_bdate'] as Date | null | undefined) ?? this.df().pod_sdate.value;
    const tlt_edate = typeof venNoOrBody === 'string'
      ? this.df().pod_edate.value
      : (venNoOrBody?.['tlt_edate'] as Date | null | undefined) ?? this.df().pod_edate.value;
    return this.service.getTLTTalentOptions({ ven_no, tlt_bdate, tlt_edate }).pipe(
      map(res => res ?? []),
      tap(res => {
        const options = res.map(item => ({
          ...item,
          value: item['No'] ?? item.value,
          label: `${item['No'] ?? item.value}-${item['Name'] ?? item.label}`,
          talent_id: item.talent_id,
        } as Option & { talent_id: number }));
        this.service.tltTalentOptions.set(options);
        this.counterColumns();
      }),
    );
  }

  public batchFetchTltIdOptions(talentIds: number[]): void {
    const uniqueIds = Array.from(new Set(talentIds)).filter(id => id && !this.tltIdList().has(id));
    if (uniqueIds.length === 0) return;

    this.tableLoading.set(true);
    this.dropdown.batchQueryTltTalentCharge(uniqueIds).pipe(finalize(() => this.tableLoading.set(false))).subscribe({
      next: (res: any) => {

        if (res && Array.isArray(res)) { // 💡 修正判斷式
          const groupMap = new Map<number, Option[]>();

          uniqueIds.forEach(id => groupMap.set(id, []));

          res.forEach((item: any) => { // 💡 修正迴圈目標
            const tId = Number(item.talent_id);
            if (groupMap.has(tId)) {
              const opt: Option = {
                value: item.tlt_id,
                label: `${item.tlt_id}-${item.tlt_id_desc}`,
                ...item
              };
              groupMap.get(tId)?.push(opt);
            }
          });

          this.tltIdList.update(currentMap => {
            const newMap = new Map(currentMap);
            groupMap.forEach((options, tId) => {
              newMap.set(tId, options);
            });
            return newMap;
          });
        }
      }
    });
  }
}

interface ValidationResult {
  isValid: boolean;
  errorMessage: string[];
}

enum ApprovalAction {
  // 審核
  Approve = 'A',
  // 反審核
  Revoke = 'R',
}
