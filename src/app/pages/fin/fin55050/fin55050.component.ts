import { AsyncPipe, DatePipe, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarRangeComponent } from '@shared/components/calendar-range/calendar-range.component';
import { DropdownRangeComponent } from '@shared/components/dropdown-range/dropdown-range.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputTextRangeComponent } from '@shared/components/input-text-range/input-text-range.component';
import { MultiSelectComponent } from '@shared/components/multi-select/multi-select.component';
import { RadiobuttonComponent } from '@shared/components/radiobutton/radiobutton.component';
import { yesterday } from '@shared/models/system/query-form.model';
import { FileExportService } from '@shared/service/file-export.service';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { finalize } from 'rxjs';
import { ExportFIN55050Payload, FIN55050Data, FIN55050Detail, FIN55050Service, GroupedFIN55050Detail } from '../../../service/api/fin/fin55050.service';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { TableSubheaderComponent } from './table-subheader/table-subheader.component';
import { VenUserPickerComponent } from './ven-user-picker/ven-user-picker.component';
@Component({
  selector: 'app-fin55050',
  templateUrl: './fin55050.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    TranslateModule,
    CalendarRangeComponent,
    RadiobuttonComponent,
    CheckboxModule,
    MultiSelectComponent,
    TableSubheaderComponent,
    InputTextRangeComponent,
    DropdownRangeComponent,
    DropdownComponent,
    ButtonModule,
    InputTextModule,
    VenUserPickerComponent,
    AsyncPipe
  ]
})
export class FIN55050Component extends BasicQueryPageComponent<FIN55050Detail> implements OnInit {
  constructor(
    private readonly fin55050Service: FIN55050Service,
    private readonly location: Location,
    private readonly fileExportService: FileExportService,
    private readonly dropdown: DropdownApiService,
    private readonly datePipe: DatePipe,
  ) { super(); }
  PDFBtnLoading = false;
  XLSXBtnLoading = false;
  XLSXSingleSheetBtnLoading = false;
  queryForm = this.formBuilder.group({
    DateFrom: [yesterday, Validators.required],
    DateTo: [yesterday, Validators.required],
    OrgIdList: [null],
    IsCludeDownOrg: ['N'],
    AccNoFrom: [null],
    AccNoTo: [null],
    VendorFrom: [null],
    VendorTo: [null],
    PTAFrom: [null],
    PTATo: [null],

    AmtFrom: [null],
    AmtTo: [null],

    Target: [null],
    Project: [null],
    Notes: [null],
    VoucherType: [null],
    VouStatusList: [null],
    IsTarget: [null],
    ReportMode: ['1'],
    ACCT_KEY: [null, [Validators.maxLength(30)]],
  });
  data: GroupedFIN55050Detail[] = [];
  selectedItems: GroupedFIN55050Detail[] = [];
  totalRecords = 0;
  lastQueryConditions: ExportFIN55050Payload | null = null;
  OrgIdListOptions = this.dropdown.querySys3100();
  AccNoListOptions = this.dropdown.queryGls1005();
  VouStatusListOptions = [
    { label: '作廢', value: '0' },
    { label: '建立', value: '1' },
    // { label: '確認', value: '2' }, // 需求#566: 傳票狀態的"確認"選項，請移除
    { label: '過帳', value: '3' },
  ];

  pickerVisible = false;
  pickerTarget: 'From' | 'To' = 'From';

  openPicker(target: 'From' | 'To'): void {
    this.pickerTarget = target;
    this.pickerVisible = true;
  }

  onPickerSelected(code: string): void {
    if (this.pickerTarget === 'From') {
      this.queryForm.controls.VendorFrom.setValue(code as unknown as null);
    } else {
      this.queryForm.controls.VendorTo.setValue(code as unknown as null);
    }
  }

  TargetNoListOptions: { label: string, value: string }[] = [];
  VouTypeListOptions: { label: string, value: string }[] = [];
  ngOnInit(): void {
    this.initializePage('FIN55050', 'account/fin/fin55050cru', this.queryForm, (form) => this.onSubmit(form));
    localStorage.setItem('FIN55050_CRU_PROGNO', 'FIN55050');
    this.loadOptions();
  }

  loadOptions() {
    this.fin55050Service.queryGLS1016_DropDownList().pipe(untilDestroyed(this)).subscribe(response => { this.TargetNoListOptions = response.Data?.map((item) => ({ label: `${item.No} - ${item.Name}`, value: item.No, })) ?? []; });
    this.fin55050Service.queryGLS1010_DropDownList().pipe(untilDestroyed(this)).subscribe(response => { this.VouTypeListOptions = response.Data?.map((item) => ({ label: `${item.No} - ${item.Name}`, value: item.No, })) ?? []; });
  }
  onSubmit(form: FormGroup) {
    this.handleSubmit(form, () => {
      const raw = this.queryForm.getRawValue();
      const from = this.datePipe.transform(raw?.DateFrom, 'yyyy-MM-dd');
      const to = this.datePipe.transform(raw?.DateTo, 'yyyy-MM-dd');
      const payload: ExportFIN55050Payload = {
        DateFrom: from ?? '',
        DateTo: to ?? '',
        OrgIdList: raw?.OrgIdList ?? [],
        IsCludeDownOrg: raw?.IsCludeDownOrg ?? 'N',
        AccNoFrom: raw?.AccNoFrom ?? '',
        AccNoTo: raw?.AccNoTo ?? '',
        VendorFrom: raw?.VendorFrom ?? '',
        VendorTo: raw?.VendorTo ?? '',
        PTAFrom: raw?.PTAFrom ?? '',
        PTATo: raw?.PTATo ?? '',

        AmtFrom: this.toNullableNumber(raw?.AmtFrom),
        AmtTo: this.toNullableNumber(raw?.AmtTo),

        Target: raw?.Target ?? '',
        Project: raw?.Project ?? '',
        Notes: raw?.Notes ?? '',
        VoucherType: raw?.VoucherType ?? '',
        VouStatusList: raw?.VouStatusList ?? [],
        IsTarget: raw?.IsTarget ?? '',
        ReportMode: raw?.ReportMode ?? '',
        ACCT_KEY: raw?.ACCT_KEY ?? '',
      };
      this.fin55050Service.queryFIN55050(payload).pipe(untilDestroyed(this), finalize(() => (this.loading = false))).subscribe((response) => {
        this.lastQueryConditions = payload;
        this.data = this.restructureData(response.Data);
        this.totalRecords = response.TotalCount ?? this.data.length;
        this.queryStateService.setQueryState(this.ProgNo, form.getRawValue());
      });
    });
  }
  override onDetail(row: GroupedFIN55050Detail) {
    if ((row as any)?.isVirtual) return;

    const vouNo = row?.VouNo;
    if (!vouNo) {
      this.messageService?.warnBubble?.('無法開啟，缺少傳票號碼。');
      return;
    }

    const handoff = {
      vouNo,
      fromRoute: globalThis.location.pathname,
      ts: Date.now(),
    };

    localStorage.setItem('FIN55050_CRU_HANDOFF', JSON.stringify(handoff));
    localStorage.setItem('FIN55050_CRU_PROGNO', this.ProgNo);

    const externalUrl = this.location.prepareExternalUrl('/account/fin/fin55050cru');
    const finalUrl = `${globalThis.location.origin}${externalUrl}`;
    globalThis.open(finalUrl, '_blank', 'noopener');
  }
  /** 從巢狀資料展平成清單 */
  restructureData(data: FIN55050Data[]): GroupedFIN55050Detail[] {
    const grouped: GroupedFIN55050Detail[] = [];

    (data ?? []).forEach(parent => {
      const details = parent._Details ?? [];
      if (details.length === 0) return;

      // 依後端 DataType 區分期初/明細/總計，避免把期初列、總計列也加進總計
      const openingRow = details.find(d => d.DataType === '期初') ?? details[0];
      const detailRows = details.filter(d => d.DataType === '明細');
      const totalRow = details.find(d => d.DataType === '總計');

      const openingBal = Number(openingRow?.OpeningBal ?? 0);
      const totalDebit = Number(totalRow?.AccAmt_D ?? 0);
      const totalCredit = Number(totalRow?.AccAmt_C ?? 0);
      // 期末餘額直接採用後端總計列(已依科目借貸方向算好)，前端不自行加減
      const endingBal = Number(totalRow?.OpeningBal ?? openingBal);

      // 期初餘額列
      grouped.push({
        ...openingRow,
        AccNo: parent.AccNo,
        AccCName: parent.AccCName,
        VouDate: '',
        VouNo: '【期初餘額】',
        Ven_Name: '',
        VouStatus: '',
        ORG_ID: '',
        Org_Name: '',
        ProjectNo: '',
        PTA: '',
        NoteDesc: '',
        AccAmt_D: null,
        AccAmt_C: null,
        OpeningBal: openingBal,
        isVirtual: true
      } as any);

      // 明細列
      detailRows.forEach(detail => {
        grouped.push({
          ...detail,
          AccNo: parent.AccNo,
          AccCName: parent.AccCName,
          VouDate: parent.VouDate,
          VouNo: detail.VouNo,
          Org_Name: detail.Org_Name,
          isVirtual: false
        } as any);
      });

      // 總計列
      grouped.push({
        ...(totalRow ?? details[0]),
        AccNo: parent.AccNo,
        AccCName: parent.AccCName,
        VouDate: '',
        VouNo: '',
        Ven_Name: '',
        VouStatus: '',
        ORG_ID: '',
        Org_Name: '【總計】',
        ProjectNo: '',
        PTA: '',
        NoteDesc: '',
        AccAmt_D: totalDebit,
        AccAmt_C: totalCredit,
        OpeningBal: endingBal,
        isVirtual: true
      } as any);
    });

    return grouped;
  }
  onExportPDF() {
    if (!this.data?.length || !this.lastQueryConditions) return this.messageService?.warnBubble?.('目前沒有資料可匯出。');
    const export$ = this.fin55050Service.exportFIN55050PDF(this.lastQueryConditions);
    this.fileExportService.executeFileExport(export$.pipe(untilDestroyed(this)), '.pdf', (isLoading) => this.PDFBtnLoading = isLoading).subscribe();
  }

  onExportXLSX() {
    if (!this.data?.length || !this.lastQueryConditions) return this.messageService?.warnBubble?.('目前沒有資料可匯出。');
    const payload: ExportFIN55050Payload = { ...this.lastQueryConditions, IsExportSingle: 'N' };
    const export$ = this.fin55050Service.exportFIN55050Excel(payload);
    this.fileExportService.executeFileExport(export$.pipe(untilDestroyed(this)), '.xlsx', (isLoading) => this.XLSXBtnLoading = isLoading).subscribe();
  }

  /** 匯出 Excel（不拆分頁，所有會科往下排列在同一頁） */
  onExportXLSXSingleSheet() {
    if (!this.data?.length || !this.lastQueryConditions) return this.messageService?.warnBubble?.('目前沒有資料可匯出。');
    const payload: ExportFIN55050Payload = { ...this.lastQueryConditions, IsExportSingle: 'Y' };
    const export$ = this.fin55050Service.exportFIN55050Excel(payload);
    this.fileExportService.executeFileExport(export$.pipe(untilDestroyed(this)), '.xlsx', (isLoading) => this.XLSXSingleSheetBtnLoading = isLoading).subscribe();
  }
  private toNullableNumber(value: unknown): number | null {
    if (value === null || value === undefined) {
      return null;
    }

    // 轉成字串
    const str = String(value)
      .trim()            // 去除前後空白
      .replaceAll(/,/g, ''); // 去除千分位逗號

    if (str === '') {
      return null;
    }

    const num = Number(str);
    return Number.isNaN(num) ? null : num;
  }
}
