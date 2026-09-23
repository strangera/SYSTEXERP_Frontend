import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { TranslateModule } from '@ngx-translate/core';

import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarRangeComponent } from '@shared/components/calendar-range/calendar-range.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputNumberRangeComponent } from '@shared/components/input-number-range/input-number-range.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { MultiSelectComponent } from '@shared/components/multi-select/multi-select.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { ReportColumn } from '@shared/components/table-report/table-report.model';

import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { TLS13010Service } from '@service/api/tls/tls13010.service';
import { SharedDropdownService } from '@others/services/shared-dropdown.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownOption, formatApproveStatus, formatOpenflagStatus, Pos2013DropdownOption } from '@others/constants/business.constants';
import { ContractItem } from '../tls13020/components/query/query.component';

@Component({
  selector: 'app-tls13090',
  templateUrl: './tls13090.component.html',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    AccordionModule,
    ButtonModule,
    DialogModule,
    TooltipModule,
    TranslateModule,
    MenubarComponent,
    ButtonComponent,
    CalendarRangeComponent,
    DropdownComponent,
    InputNumberRangeComponent,
    InputTextComponent,
    MultiSelectComponent,
    TableReportComponent,
  ]
})
export class TLS13090Component extends BasicQueryPageComponent<ContractItem> implements OnInit {
  protected readonly apiService = inject(TLS13010Service);
  private readonly sharedDropdownService = inject(SharedDropdownService);
  private readonly destroyRef = inject(DestroyRef);

  queryForm = this.formBuilder.group({
    apply_no: [null as string | null],
    bus_type: [null as string | null],
    approve_statusList: [[] as string[]],
    tlt_no: [null as string | null],
    tlt_name: ['', [Validators.maxLength(50)]],
    ven_uniformList: [[] as string[]],
    location_no: [null as string | null],
    contract_subno_from: [null as number | null],
    contract_subno_to: [null as number | null],
    tlt_buildingList: [[] as string[]],
    area_no: [null as string | null],
    tlt_floor: [null as string | null],
    contact_USR_No: [[] as string[]],
    org_id: [null as string | null],
    feedback_date_from: [null as Date | null],
    feedback_date_to: [null as Date | null],
    due_date_from: [null as Date | null],
    due_date_to: [null as Date | null],
    contact_Date_from: [null as Date | null],
    contact_Date_to: [null as Date | null],
    paper_typeList: [[] as string[]],
    tlt_bdate_start_from: [null as Date | null],
    tlt_bdate_start_to: [null as Date | null],
    tlt_edate_start_from: [null as Date | null],
    tlt_edate_start_to: [null as Date | null],
    tlt_contract_bdate_from: [null as Date | null],
    tlt_contract_bdate_to: [null as Date | null],
    tlt_contract_edate_from: [null as Date | null],
    tlt_contract_edate_to: [null as Date | null],
    tlt_openflagList: [[] as string[]],
    pageSize: [500],
    pageIndex: [1],
    SortBy: [[{ field: 'tlt_no', order: 1 }]],
  });

  data: ContractItem[] = [];
  totalRecords = 0;
  lastQueryBody: Record<string, unknown> | null = null;
  selectedItems: ContractItem[] = [];

  private readonly formatDate = (value: string): string =>
    value ? new Date(value).toLocaleDateString() : '';

  columns: ReportColumn[] = [
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '專櫃名稱', visible: true, align: 'left' },
    {
      field: 'ven_uniform', header: '廠商統編/名稱', visible: true, align: 'left',
      format: (value: string, _i?: number, row?: ContractItem) =>
        [value, row?.VEN_Name].filter(Boolean).join(' / ')
    },
    {
      field: 'org_id', header: '組織代號/名稱', visible: true,
      format: (value: string) => this.orgLabel(value)
    },
    { field: 'bus_type', header: '大分類代號', visible: true },
    { field: 'approve_status', header: '合約狀態', visible: true, format: formatApproveStatus },
    { field: 'tlt_openflag', header: '營運狀態', visible: true, format: formatOpenflagStatus },
    { field: 'tlt_contract_bdate', header: '營運起始日', visible: true, format: this.formatDate },
    { field: 'tlt_contract_edate', header: '營運截止日', visible: true, format: this.formatDate },
    { field: 'contract_subno', header: '版本編號', visible: true },
  ];

  // === 下拉選項 ===
  industryCodeOptions: DropdownOption[] = [];
  vendorUIDOptions: Pos2013DropdownOption[] = [];
  locationNumberOptions: DropdownOption[] = [];
  regionOptions: DropdownOption[] = [];
  floorOptions: DropdownOption[] = [];
  buildingOptions: DropdownOption[] = [];
  negotiatorOptions: DropdownOption[] = [];
  organizationCodeOptions: DropdownOption[] = [];
  businessTypeOptions: DropdownOption[] = [];

  get approvalStatusOptions() { return this.sharedDropdownService.approveStatusOptions; }
  readonly openFlagOptions = getSYS1000Options('tlt_openflag');

  // === 批次更新對話框 ===
  showBatchOrgDialog = false;
  dialogForm = this.formBuilder.group({
    org_id: [null as string | null, [Validators.required]],
  });

  override ngOnInit(): void {
    this.initializePage('TLS13090', undefined, this.queryForm, (form) => this.onSubmit(form));
    this.loadDropdownOptions();
  }

  private loadDropdownOptions(): void {
    this.sharedDropdownService.getBustypeOptions().subscribe({ next: (opts) => this.industryCodeOptions = opts });
    this.sharedDropdownService.getVendorOptions('1').subscribe({ next: (opts) => this.vendorUIDOptions = opts });
    this.sharedDropdownService.getLocationOptions().subscribe({ next: (opts) => this.locationNumberOptions = opts });
    this.sharedDropdownService.getRegionOptions().subscribe({ next: (opts) => this.regionOptions = opts });
    this.sharedDropdownService.getFloorOptions().subscribe({ next: (opts) => this.floorOptions = opts });
    this.sharedDropdownService.getBuildingOptions().subscribe({ next: (opts) => this.buildingOptions = opts });
    this.sharedDropdownService.getNegotiatorOptions().subscribe({ next: (opts) => this.negotiatorOptions = opts });
    this.sharedDropdownService.getOrgOptions().subscribe({ next: (opts) => this.organizationCodeOptions = opts });
    this.sharedDropdownService.getPaperTypeOptions('T101').subscribe({ next: (opts) => this.businessTypeOptions = opts });
  }

  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const v = form.value;
      const payload = {
        ...v,
        contract_subno_from: v.contract_subno_from ? String(v.contract_subno_from) : undefined,
        contract_subno_to: v.contract_subno_to ? String(v.contract_subno_to) : undefined,
      };
      this.apiService.queryTLS13020(payload).pipe(
        this.withLoading(),
        takeUntilDestroyed(this.destroyRef),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ).subscribe((res: any) => {
        if (res.Status === '0000') {
          this.data = res.Data || [];
          this.totalRecords = res.TotalCount || this.data.length;
          this.lastQueryBody = payload;
          this.selectedItems = [];
          this.queryStateService.setQueryState(this.ProgNo, form.value);
          if (this.data.length === 0) this.messageService.infoBubble('查詢無資料');
        } else {
          this.messageService.errorBubble(res.Message || '查詢失敗');
        }
      });
    });
  }

  onBatchUpdateOrg(): void {
    this.dialogForm.reset();
    this.showBatchOrgDialog = true;
  }

  confirmBatchUpdateOrg(): void {
    const orgId = this.dialogForm.value.org_id;
    if (!orgId) {
      this.messageService.warnBubble('請選擇組織代號');
      return;
    }
    const talentIds = this.selectedItems.map(item => item.talent_id);
    this.apiService.updateOrgIdBatch(talentIds, orgId).pipe(
      this.withLoading(),
      takeUntilDestroyed(this.destroyRef),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ).subscribe((res: any) => {
      if (res?.Status === '0000') {
        this.messageService.successBubble(res.Message || '組織編號批次更新成功');
        this.showBatchOrgDialog = false;
        this.selectedItems = [];
        this.onSubmit(this.queryForm);
      } else {
        this.messageService.errorBubble(res?.Message || '批次更新失敗');
      }
    });
  }

  private orgLabel(code: string): string {
    if (!code) return '';
    const opt = this.organizationCodeOptions.find(o => o.value === code);
    return opt?.label ?? code;
  }
}
