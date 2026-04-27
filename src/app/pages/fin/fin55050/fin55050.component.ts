import { AsyncPipe, DatePipe, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { DropdownRangeComponent } from '@shared/componentkit/dropdown-range/dropdown-range.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextRangeComponent } from '@shared/componentkit/input-text-range/input-text-range.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { yesterday } from '@shared/models/system/query-form.model';
import { FileExportService } from '@shared/service/file-export.service';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { finalize } from 'rxjs';
import { ExportFIN55050Payload, FIN55050Data, FIN55050Detail, FIN55050Service, GroupedFIN55050Detail } from '../../../service/api/fin/fin55050.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableSubheaderComponent } from './table-subheader/table-subheader.component';
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
    private readonly fin55050Service: FIN55050Service,
    private readonly location: Location,
    private readonly fileExportService: FileExportService,
    private readonly dropdown: DropdownApiService,
    private readonly datePipe: DatePipe,
  ) { super(); }
  PDFBtnLoading = false;
  XLSXBtnLoading = false;
  queryForm = this.formBuilder.group({
    DateFrom: [yesterday, Validators.required],
    DateTo: [yesterday, Validators.required],
    OrgIdList: [null],
    AccNoFrom: [null],
    AccNoTo: [null],
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
  lastQueryConditions: ExportFIN55050Payload | null = null;
  OrgIdListOptions = this.dropdown.querySys3100();
  AccNoListOptions = this.dropdown.queryGls1005();
  VendorNoListOptions = this.dropdown.queryPos2013({ VEN_Flag: '' });
  VouStatusListOptions = [{ label: '作廢', value: '0' }, { label: '建立', value: '1' }, { label: '確認', value: '2' }, { label: '過帳', value: '3' },];
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
      this.fin55050Service.queryFIN55050(payload).pipe(untilDestroyed(this), finalize(() => (this.loading = false))).subscribe((response) => {
        this.lastQueryConditions = payload;
        this.data = this.restructureData(response.Data);
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
      if (details.length === 0) return;

      details.forEach((detail, index) => {
        const isFirst = index === 0;
        const isLast = index === details.length - 1;

        const newRow: any = {
          ...detail,
          AccNo: parent.AccNo,
          AccCName: parent.AccCName,
          VouDate: isFirst || isLast ? '' : parent.VouDate, // 第一筆與最後一筆不顯示日期
          // 需求 1: 在傳票號碼欄位顯示【期初餘額】
          VouNo: isFirst ? '【期初餘額】' : (isLast ? '' : detail.VouNo),
          // 需求 4: 對準部門名稱(Org_Name)顯示【總計】
          Org_Name: isLast ? '【總計】' : detail.Org_Name,
          isVirtual: isFirst || isLast
        };

        // 需求 2: 這裡直接 push，不再額外手動 push 虛擬列，避免多餘空白行
        grouped.push(newRow);
      });
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
    const export$ = this.fin55050Service.exportFIN55050Excel(this.lastQueryConditions);
    this.fileExportService.executeFileExport(export$.pipe(untilDestroyed(this)), '.xlsx', (isLoading) => this.XLSXBtnLoading = isLoading).subscribe();
  }
}
