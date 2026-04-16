import { AsyncPipe, DatePipe, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Option } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { DropdownRangeComponent } from '@shared/componentkit/dropdown-range/dropdown-range.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextRangeComponent } from '@shared/componentkit/input-text-range/input-text-range.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { Column, formatAmount } from '@shared/componentkit/table/table.model';
import { FileExportService } from '@shared/service/file-export.service';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { finalize } from 'rxjs';
import { ExportFIN55050Payload, FIN55050Detail, FIN55050Service } from '../../../service/api/fin/fin55050.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableSubheaderComponent } from './table-subheader/table-subheader.component';
export interface FIN55050Data {
  AccNo: string;
  AccCName: string;
  VouDate: string;
  _Details: FIN55050Detail[];
}
export interface GroupedFIN55050Detail extends FIN55050Detail {
  AccNo: string;
  AccCName: string;
  VouDate: string;
}

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
    AsyncPipe
  ]
})
export class FIN55050Component extends BasicQueryPageComponent<FIN55050Detail> implements OnInit {
  constructor(
    private fin55050Service: FIN55050Service,
    private location: Location,
    private readonly fileExportService: FileExportService,
    private readonly dropdown: DropdownApiService,
    private readonly datePipe: DatePipe,
  ) { super(); }
  PDFBtnLoading = false;
  XLSXBtnLoading = false;
  queryForm = this.formBuilder.group({
    DateFrom: [new Date('2026/02/01'), Validators.required],
    DateTo: [new Date('2026/02/05'), Validators.required],
    OrgIdList: [null],
    AccNoFrom: ['114101'],
    AccNoTo: ['114101'],
    VendorFrom: [null],
    VendorTo: [null],
    PTAFrom: [null],
    PTATo: [null],
    Target: [null],
    Project: [null],
    Notes: [null],
    VoucherType: [null],
    VouStatusList: [null],
    IsTarget: [null],
    ReportMode: ['1'],
  });
  data: GroupedFIN55050Detail[] = [];
  selectedItems: GroupedFIN55050Detail[] = [];
  totalRecords = 0;
  columns: Column[] = [
    { field: 'VouNo', header: '傳票號碼', visible: true, type: 'detail' },
    { field: 'Ven_Name', header: '廠商編號/簡稱', visible: true },
    { field: 'VouStatus', header: '狀態', visible: true },
    { field: 'ORG_ID', header: '部門', visible: true },
    { field: 'Org_Name', header: '部門名稱', visible: true },
    { field: 'ProjectNo', header: '活動', visible: true },
    { field: 'PTA', header: '立沖代號', visible: true },
    { field: 'NoteDesc', header: '摘要', visible: true },
    { field: 'AccAmt_D', header: '借方金額', visible: true, format: formatAmount, style: 'text-right' },
    { field: 'AccAmt_C', header: '貸方金額', visible: true, format: formatAmount, style: 'text-right' },
    { field: 'OpeningBal', header: '餘額', visible: true, format: formatAmount, style: 'text-right' },
  ];
  OrgIdListOptions = this.dropdown.querySys3100();
  AccNoListOptions = this.dropdown.queryGls1005();
  accNoOptions: Option[] = [];
  VendorNoListOptions = this.dropdown.queryPos2013({ VEN_Flag: '' });
  VouStatusListOptions: any[] = [{ label: '作廢', value: '0' }, { label: '建立', value: '1' }, { label: '確認', value: '2' }, { label: '過帳', value: '3' },];
  TargetNoListOptions: any[] = [];
  VouTypeListOptions: any[] = [];
  ngOnInit(): void {
    this.initializePage('FIN55050', 'account/fin/fin55050cru', this.queryForm, (form) => this.onSubmit(form));
    localStorage.setItem('FIN55050_CRU_PROGNO', 'FIN55050');
    this.loadOptions();
    this.AccNoListOptions.pipe(untilDestroyed(this)).subscribe(options => {
      this.accNoOptions = options ?? [];
    });
  }

  loadOptions() {
    this.fin55050Service.queryGLS1016_DropDownList().pipe(untilDestroyed(this)).subscribe(response => { this.TargetNoListOptions = response.Data?.map((item: any) => ({ label: `${item.No} - ${item.Name}`, value: item.No, })) ?? []; });
    this.fin55050Service.queryGLS1010_DropDownList().pipe(untilDestroyed(this)).subscribe(response => { this.VouTypeListOptions = response.Data?.map((item: any) => ({ label: `${item.No} - ${item.Name}`, value: item.No, })) ?? []; });
  }
  onSubmit(form: FormGroup) {
    this.handleSubmit(form, () => {
      this.fin55050Service.queryFIN55050(form.getRawValue()).pipe(untilDestroyed(this), finalize(() => (this.loading = false))).subscribe((response) => {
        this.data = this.restructureData(response.Data);
        this.data.forEach(item => {
          item['AccFullLabel'] = this.getAccNoLabel(item.AccNo);
        });
        this.totalRecords = response.TotalCount ?? this.data.length;
        this.queryStateService.setQueryState(this.ProgNo, form.getRawValue());
      });
    });
  }
  override onDetail(row: GroupedFIN55050Detail) {
    const vouNo = row?.VouNo;
    if (!vouNo) { this.messageService?.warnBubble?.('無法開啟，缺少傳票號碼。'); return; }
    const handoff = { vouNo, fromRoute: window.location.pathname, ts: Date.now(), };
    localStorage.setItem('FIN55050_CRU_HANDOFF', JSON.stringify(handoff));
    localStorage.setItem('FIN55050_CRU_PROGNO', this.ProgNo);
    const externalUrl = this.location.prepareExternalUrl('/account/fin/fin55050cru');
    const finalUrl = `${window.location.origin}${externalUrl}`;
    window.open(finalUrl, '_blank', 'noopener');
  }
  /** 從巢狀資料展平成清單 */
  restructureData(data: FIN55050Data[]): GroupedFIN55050Detail[] {
    const grouped: GroupedFIN55050Detail[] = [];
    (data ?? []).forEach(parent => {
      const details = parent._Details ?? [];
      const firstDetail = details[0];
      grouped.push({
        AccNo: parent.AccNo,
        AccCName: parent.AccCName,
        VouDate: parent.VouDate,
        VouNo: '',
        NoteDesc: '【期初餘額】',
        OpeningBal: firstDetail?.OpeningBal ?? 0,
        VouStatus: '',
        isVirtual: true
      } as any);
      let totalD = 0;
      let totalC = 0;
      details.forEach(detail => {
        totalD += (detail.AccAmt_D ?? 0);
        totalC += (detail.AccAmt_C ?? 0);
        grouped.push({
          ...detail,
          AccNo: parent.AccNo,
          AccCName: parent.AccCName,
          VouDate: parent.VouDate
        });
      });
      const lastDetail = details[details.length - 1];
      grouped.push({
        AccNo: parent.AccNo,
        AccCName: parent.AccCName,
        VouDate: '',
        VouNo: '',
        NoteDesc: '【本期合計】',
        AccAmt_D: totalD,
        AccAmt_C: totalC,
        OpeningBal: lastDetail?.OpeningBal ?? 0, // 最終餘額
        VouStatus: '',
        isVirtual: true
      } as any);
    });
    return grouped;
  }
  onExportPDF() {
    if ((this.data?.length ?? 0) === 0) return this.messageService?.warnBubble?.('目前沒有資料可匯出。');
    const payload = this.buildExportBody();
    if (!payload) return;
    const export$ = this.fin55050Service.exportFIN55050PDF(payload);
    this.fileExportService.executeFileExport(export$.pipe(untilDestroyed(this)), '.pdf', (isLoading) => this.PDFBtnLoading = isLoading).subscribe();
  }

  onExportXLSX() {
    if ((this.data?.length ?? 0) === 0) return this.messageService?.warnBubble?.('目前沒有資料可匯出。');
    const payload = this.buildExportBody();
    if (!payload) return;
    const export$ = this.fin55050Service.exportFIN55050Excel(payload);
    this.fileExportService.executeFileExport(export$.pipe(untilDestroyed(this)), '.xlsx', (isLoading) => this.XLSXBtnLoading = isLoading).subscribe();
  }
  /** 產生匯出 payload（不再使用 VOUDATE_*） */
  private buildExportBody(): ExportFIN55050Payload | null {
    const raw = this.queryForm.getRawValue();
    const from = this.datePipe.transform(raw?.DateFrom, 'yyyy-MM-dd');
    const to = this.datePipe.transform(raw?.DateTo, 'yyyy-MM-dd');
    const payload: ExportFIN55050Payload = {
      DateFrom: from ?? '',
      DateTo: to ?? '',
      OrgIdList: raw?.OrgIdList ?? [],
      AccNoFrom: raw?.AccNoFrom ?? '',
      AccNoTo: raw?.AccNoTo ?? '',
      VendorFrom: raw?.VendorFrom ?? '',
      VendorTo: raw?.VendorTo ?? '',
      PTAFrom: raw?.PTAFrom ?? '',
      PTATo: raw?.PTATo ?? '',
      Target: raw?.Target ?? '',
      Project: raw?.Project ?? '',
      Notes: raw?.Notes ?? '',
      VoucherType: raw?.VoucherType ?? '',
      VouStatusList: raw?.VouStatusList ?? [],
      IsTarget: raw?.IsTarget ?? '',
      ReportMode: raw?.ReportMode ?? '',
    };
    return payload;
  }
  getAccNoLabel(accNo: string | null): string {
    if (!accNo) return '';
    const found = this.accNoOptions.find(x => x.value === accNo);
    return found ? found.label : accNo;
  }
}
