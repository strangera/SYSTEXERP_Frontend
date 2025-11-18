/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { FIN29020Data, FIN29020Service } from '@service/api/fin/fin29020.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { InputNumberRangeComponent } from '@shared/componentkit/input-number-range/input-number-range.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column, createPaginationConfig, formatAmount } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';

@Component({
  selector: 'app-fin29020',
  templateUrl: './fin29020.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    CalendarRangeComponent,
    CalendarComponent,
    MultiSelectComponent,
    TableComponent,
    InputNumberRangeComponent
  ]
})
export class FIN29020Component extends BasicQueryPageComponent<FIN29020Data> implements OnInit {

  constructor(
    private fin29020Service: FIN29020Service,
    private dropDownListService: DropDownListService,
    private dropdownApiService: DropdownApiService,
  ) {
    super();
  }

  queryForm = this.formBuilder.group({
    IssueDateFrom: [null],
    IssueDateTo: [null],
    BankCodeList: [null],
    CheckNoFrom: [null],
    CheckNoTo: [null],
    VendorNoList: [null],
    DueDate: [null],
    CheckStatusList: [null],
    ...createPaginationConfig([])
  });

  data: FIN29020Data[] = [];
  selectedItems: FIN29020Data[] = [];
  totalRecords = 0;
  btnLoading = false;

  columns: Column[] = [
    { field: 'ID', header: '序號', hidden: true },
    { field: 'RemittanceNo', header: '匯款單號', visible: true },
    { field: 'BankCode', header: '銀行代號', visible: true },
    { field: 'RemittanceDate', header: '匯款日期', visible: true },
    { field: 'VendorName', header: '廠客名稱', visible: true },
    { field: 'RemittanceBankCode', header: '匯款銀行代號', visible: true },
    { field: 'PaymentBankName', header: '解款銀行名稱', visible: true },
    { field: 'BankAccount', header: '銀行帳號', visible: true },
    { field: 'AccountName', header: '帳戶名稱', visible: true },
    { field: 'AccountAmount', header: '帳款金額', visible: true, format: formatAmount },
    { field: 'RemittanceAmount', header: '匯款金額', visible: true, format: formatAmount },
  ];

  //#region 下拉選單
  BankCodeOptions: any[] = [];
  VendorNoOptions: any[] = [];
  CheckStatusListOptions: any[] = [
    { label: '作廢', value: '0' },
    { label: '未到期', value: '1' },
    { label: '到期', value: '2' },
    { label: '兌現', value: '3' },
    { label: '撤票', value: '4' },
    { label: '退票', value: '5' }
  ];

  //#endregion

  ngOnInit(): void {
    this.initializePage('FIN29020', 'account/fin/fin29020cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
  }

  onSubmit(form: FormGroup) {
    this.handleSubmit(form, () => {
      const payload = this.buildQueryPayload(form.getRawValue());
      this.fin29020Service.queryFIN29020(payload)
        .pipe(untilDestroyed(this), finalize(() => (this.loading = false)))
        .subscribe((response) => {
          this.data = response.Data ?? [];
          this.totalRecords = response.TotalCount ?? this.data.length;
          this.queryStateService.setQueryState(this.ProgNo, form.getRawValue());
        });
    });
  }

  loadOptions() {
    // 銀行代號下拉
    this.dropdownApiService.queryAps1001NoBranch().pipe(untilDestroyed(this)).subscribe((response) => {
      const list = Array.isArray(response) ? response : [];
      this.BankCodeOptions = list.map((item: any) => ({ label: `${item.No} - ${item.Name}`, value: item.No }));
    });
    // 廠客代號
    this.dropDownListService.queryPOS2013_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => this.VendorNoOptions = res.Data.map((x: any) => ({ label: `${x.No} - ${x.Name}`, value: x.No })));
  }

  /** 產生查詢 payload */
  private buildQueryPayload(raw: any): any {
    const issueFrom = this.toDateOnly(raw?.IssueDateFrom);
    const issueTo = this.toDateOnly(raw?.IssueDateTo);
    const dueDate = this.toDateOnly(raw?.DueDate);

    return {
      ...raw,
      IssueDateFrom: issueFrom,
      IssueDateTo: issueTo,
      DueDate: dueDate || '',
      BankCodeList: this.ensureArr(raw?.BankCodeList),
      VendorNoList: this.ensureArr(raw?.VendorNoList),
      CheckStatusList: this.ensureArr(raw?.CheckStatusList),
    };
  }

  // ========= 匯出 =========
  // TODO: 待實作
  onExportPDF() {
    // if ((this.selectedItems?.length ?? 0) === 0) return this.messageService?.warnBubble?.('請至少選取一筆資料進行匯出。');
    // const payload = {
    //   VouNoList: this.selectedItems.map(i => i.VouNo),
    //   PrintType: this.queryForm.controls.PrintType.value || 'A4R',
    // };
    // if (!payload) return;

    // this.btnLoading = true;
    // this.fin55010Service.exportFIN55010PDF(payload)
    //   .pipe(untilDestroyed(this), finalize(() => (this.btnLoading = false)))
    //   .subscribe({
    //     next: (r) => this.handleFileExport(r, '.pdf', '傳票列印'),
    //     error: () => this.messageService?.warnBubble?.('匯出 PDF 失敗。'),
    //   });
  }

  // ========= 本地工具 =========
  private toDateOnly(d: any): string | null {
    if (!d) return null;
    const dt = (d instanceof Date) ? d : new Date(d);
    if (isNaN(dt.getTime())) return null;
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const da = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${da}`;
  }

  private ensureArr<T = string>(val: any): T[] {
    if (val == null) return [];
    return Array.isArray(val) ? val : [val];
  }
}