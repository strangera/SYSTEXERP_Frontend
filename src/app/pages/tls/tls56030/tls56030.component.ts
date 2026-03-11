import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { InputTextComponent } from "@shared/componentkit/input-text/input-text.component";
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize, map } from 'rxjs/operators';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { POS2023RTN_Data, QueryTLS56030Req, Tls56030Service } from './../../../service/api/tls/TLS56030.service';
@Component({
  selector: 'app-tls56030',
  templateUrl: './tls56030.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeComponent,
    TranslateModule,
    InputTextComponent,
    MultiSelectComponent,
    ReactiveFormsModule,
    ButtonModule,
    TableReportComponent
  ],
})
export class TLS56030Component extends BasicQueryPageComponent<POS2023RTN_Data> implements OnInit {
  queryForm = this.formBuilder.group({
    RPM_No: [null, [Validators.maxLength(20)]],   // 單號
    HOS_NoList: [null],                          // 倉別
    org_idList: [null],                          // 機構/單位
    LOGO_NoList: [null],                         // 品牌代碼 multi-select
    RPM_StatusList: [null],                      // 狀態
    APPLY_USRList: [null],                       // 申請人
    APPLY_Date_Start: [null],                  // 申請日期 起
    APPLY_Date_End: [null],                    // 申請日期 迄
    ...createPaginationConfig([{ field: 'RPM_No', order: 1 }]), // 分頁和排序參數
  });
  // Dropdown options
  warehouseOptions: { label: string, value: string }[] = []; // 倉別
  brandOptions: { label: string, value: string }[] = []; // 品牌代碼
  issuanceNoteStatusOptions: { label: string, value: string }[] = [];
  userOptions: { label: string, value: string }[] = [];
  departmentOptions: { label: string, value: string }[] = []; // 部門下拉選單選項

  totalRecords = 0;
  data: POS2023RTN_Data[] = [];
  selectedItems: POS2023RTN_Data[] = [];
  lastQueryBody: QueryTLS56030Req | null = null;
  columns: Column[] = [
    { field: 'RPM_No', header: '領退單編號', visible: true },
    { field: 'APPLY_Date', header: '申請日期', visible: true },
    { field: 'HOS_NAME', header: '倉別', visible: true },
    { field: 'LOGO_No', header: '品牌', visible: true },
    { field: 'Org_Name', header: '部門', visible: true },
    { field: 'RPM_Remark', header: '說明', visible: true },
    { field: 'APPLY_USR_Name', header: '申請人', visible: true },
    { field: 'APRV_USR_Name', header: '審核人', visible: true },
    { field: 'APRV_Date', header: '審核日期', visible: true },
    { field: 'RPM_Status_Name', header: '單據狀態', visible: true },
  ];


  constructor(
    private readonly dropDownListService: DropDownListService,
    public readonly tls56030Service: Tls56030Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS56030', '/TLS/TLS56030CRU', this.queryForm, (form) => this.onSubmit(form));
    // 倉別 (HOS_No)
    this.dropDownListService.getPOS2034Options().pipe(untilDestroyed(this),
      map(response => (response?.Data ?? []).map((x) => ({ label: `${x.No}-${x.Name}`, value: x.No })))
    ).subscribe(options => { this.warehouseOptions = options; });
    // 品牌代碼 (LOGO_No)
    this.dropDownListService.queryPLULOGO_DropDownList().pipe(
      untilDestroyed(this),
      map(res => (res?.Data ?? []).map((x) => ({ label: `${x.No}-${x.Name}`, value: x.No })))
    ).subscribe(options => this.brandOptions = options);

    // 申請人員、審核人員、結案人員 (共用人員下拉選單)
    this.dropDownListService.queryTBLUSER_DropDownList().pipe(untilDestroyed(this),
      map(res => (res?.Data ?? []).map((x) => ({ label: `${x.No}-${x.Name}`, value: x.No })))
    ).subscribe(options => {
      this.userOptions = options;
    });
    this.dropDownListService.querySYS3100_DropDownList().pipe(untilDestroyed(this)).subscribe(response => {
      this.departmentOptions = (response.Data || []).map((x) => ({
        label: `${x.No}-${x.Name}`,
        value: x.No
      }));
    });
    this.issuanceNoteStatusOptions = [
      { label: '已申請', value: '1' },
      { label: '已審核', value: '2' },
      { label: '已領退', value: '3' },
      { label: '已作廢', value: '9' },
    ];
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.tls56030Service.queryTLS56030(frm.value).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
        this.data = res.Data;
        this.lastQueryBody = frm.value;
        this.totalRecords = res.TotalCount ?? this.data.length;
      });
    });
  }
  isEditDisabled(row: POS2023RTN_Data): boolean {
    return row?.RPM_Status !== '1';
  }
  auditLoading = false;
  onAuditClick() {
    this.auditLoading = true;
    this.updateStatus('2');
  }
  issueLoading = false;
  onIssueClick() {
    this.issueLoading = true;
    this.updateStatus('3');
  }
  updateStatus(status: string) {
    const payload = {
      DetailList: this.selectedItems.map(item => ({
        RPM_No: item.RPM_No,
        RPM_Status: status,
      })),
    };
    this.tls56030Service.updateStatusTLS56030(payload).pipe(untilDestroyed(this)).subscribe(res => {
      this.messageService.successBubble(res?.Message ?? '更新成功');
      this.onSubmit(this.queryForm);
      if (status === '2') {
        this.auditLoading = false;
      } else if (status === '3') {
        this.issueLoading = false;
      }
    });
  }
  canAuditSelected(): boolean {
    return (
      this.selectedItems.length > 0 &&
      this.selectedItems.every(x => x.RPM_Status === '1')
    );
  }
  canIssueSelected(): boolean {
    return (
      this.selectedItems.length > 0 &&
      this.selectedItems.every(x => x.RPM_Status === '2')
    );
  }
}
