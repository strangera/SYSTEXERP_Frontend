
import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { getSYS1000, getSYS1000Options } from '@service/system/sys1000.service';
import { transformOptionsForExport } from '@shared/componentextends/basic-print/basic-print-data.component';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { TLS12020Service } from '../../../service/api/tls/tls12020.service';
import { DropDownListService, IDropdownItem } from '../../../service/utility/dropDownList.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';

@Component({
  selector: 'app-tls12020',
  templateUrl: './tls12020.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    TranslateModule,
    ReactiveFormsModule,
    DropdownComponent,
    InputTextComponent,
    CalendarRangeComponent,
    TableComponent,
  ],
})
export class TLS12020Component extends BasicQueryPageComponent<any> implements OnInit {
  industryCodeOptions: IDropdownItem[] = [];
  queryForm = this.formBuilder.group({
    location_no: [null],
    ven_uniform: [null], // 原本 vendorUID, 廠商統一編號
    VEN_Name: [null, Validators.maxLength(60)], // 原本 ven_name
    VEN_EngName: [null, Validators.maxLength(60)],
    building_no: [null], // 館別（必填）
    InterviewDateStart: [new Date()], // 原本 contact_Datestart
    InterviewDateEnd: [new Date()],   // 原本 contact_Dateend
    contact_USR_No: [null],
    contact_USR_Name: [null], // 訪談人員
    willing_level: [null], // 後端要 string，不要 null
    ...createPaginationConfig([{ field: 'location_no', order: 1 }]), // 原本是 ECR_LocNo
    pageSize: [30], // 本頁預設送後端每頁 30 筆
  });

  // expansion 明細分頁選項（只在本頁使用）
  expansionRowsPerPageOptions: number[] = [30, 60, 90, 120, 150];



  data: any[] = [];
  columns: Column[] = [
    { header: '位置編號', field: 'LOCATION_No' },
    { header: '廠商統一編號', field: 'ven_uniform' },
    { header: '廠商名稱(中文)', field: 'VEN_Name' },
    { header: '廠商名稱(英文)', field: 'VEN_EngName' },
    { header: '品牌', field: 'tlt_name' },
    // { header: '館別', field: 'building_no' },
    { header: '館別', field: 'building_name' },
    // { header: '業種', field: 'bus_type_no' },
    { header: '業種', field: 'bus_type_name' },
    { header: '聯絡人', field: 'VEN_ContactPerson' },
    { header: '聯絡人電話', field: 'VEN_BossTel' },
    { header: '訪談日期', field: 'contact_Date', visible: true, format: (value: any) => formatDate(value, 'yyyy/MM/dd', 'en-US') },
    { header: '訪談時間', field: 'contact_Time', visible: true, format: this.formatTimeHHmm },
    { header: '訪談人員', field: 'contact_USR_Name' },
    { header: '意願等級', field: 'willing_level', format: (v) => getSYS1000('T116', v), exportFormat: transformOptionsForExport(getSYS1000Options('T116')) },
  ];

  selectedItems: any[] = [];
  totalRecords = 0;
  vendorUIDOptions: IDropdownItem[] = [];
  contact_USR_NameOptions: IDropdownItem[] = [];
  willinglevelOptions: IDropdownItem[] = [];
  locationOptions: IDropdownItem[] = [];
  buildingNoOptions: IDropdownItem[] = [];
  constructor(
    private tls12020Service: TLS12020Service,
    private dropDownListService: DropDownListService
  ) {
    super();
  }

  ngOnInit(): void {

    if (history.state?.clearQuery) {
      this.queryStateService.clearQueryState('TLS12020');
    }


    // 串業種 options
    this.dropDownListService.queryTLTBUSTYPE_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      if (res?.Status === '0000') {
        this.industryCodeOptions = res.Data.map(item => ({
          ...item,
          label: item.Name,
          value: item.No
        }));
      }
    });
    this.initializePage('TLS12020', 'TLS/TLS12020cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadDropdownOptions();

    this.dropDownListService.queryTBLUSER_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      this.contact_USR_NameOptions = res.Data;
    });

    this.dropDownListService.queryPOS2002_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.locationOptions = res.Data.map(item => ({
          ...item,
          value: item.No,
          label: item.Name
        }));
      });

    // 統編 API (POS2013)：顯示採用 `${item.No}-${item.Name}` 並去重相同 No+Name
    this.dropDownListService.queryPOS2013_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        const data = res.Data || [];
        const seen = new Set<string>();
        this.vendorUIDOptions = [];
        for (const item of data) {
          const baseNo = item.No ?? '';
          const name = item.Name ?? item.ShortName ?? '';
          const key = `${baseNo}|${name}`; // 去重依據仍為 No + Name
          if (seen.has(key)) continue;
          seen.add(key);
          const displayNo = item.VEN_No ?? baseNo; // 下拉顯示使用 VEN_No（若存在）否則回落為 No
          this.vendorUIDOptions.push({
            label: `${displayNo}-${name}`,
            value: baseNo,
            Name: name,
            No: baseNo,
            ShortName: item.ShortName,
            VEN_No: item.VEN_No
          });
        }
      });

    this.dropDownListService.queryTBLUSER_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      this.contact_USR_NameOptions = res.Data;
    });
    this.dropDownListService.querySYS3800_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      this.buildingNoOptions = res.Data.map(x => ({ label: x.Name, value: x.No, Name: x.Name, No: x.No }));
    });

    this.willinglevelOptions = [
      { No: '?', Name: '?', label: '未確認' },
      { No: 'A', Name: 'A', label: '交涉中(基本條件合意)' },
      { No: 'B', Name: 'B', label: '交涉中(反應良好)' },
      { No: 'C', Name: 'C', label: '交涉中(反應不好)' },
      { No: 'D', Name: 'D', label: '保留' },
      { No: 'F', Name: 'F', label: '無意進駐' },
    ];


  }
  loadDropdownOptions() {
    this.dropDownListService.queryTBLUSER_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      this.contact_USR_NameOptions = res.Data.map(item => ({
        ...item,
        label: item.Name,
        value: item.No
      }));
    });

  }
  formatTimeHHmm(value: string): string {
    if (!value || value.length !== 4) return '';
    return `${value.slice(0, 2)}:${value.slice(2)}`;
  }

  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const rawSortBy = Array.isArray(form.value.SortBy) ? form.value.SortBy as any[] : [];
      const mappedSortBy = rawSortBy.map(s => ({
        ...s,
        field: this.mapSortFieldForBackend(s.field as string | undefined),
      }));

      const params = {
        ...form.value,
        SortBy: mappedSortBy,
        willing_level: form.value.willing_level || null,
        contact_Datestart: form.value.contact_Datestart
          ? new Date(form.value.contact_Datestart).toISOString()
          : null,
        contact_Dateend: form.value.contact_Dateend
          ? new Date(form.value.contact_Dateend).toISOString()
          : null,
      };

      this.tls12020Service
        .queryTLS12020(params)
        .pipe(finalize(() => (this.loading = false)))
        .subscribe({
          next: (res) => {
            const data = res.Data;
            this.data = data;
            this.totalRecords = res.TotalCount ?? 0;
            this.queryStateService.setQueryState(this.ProgNo, params);
            this.loading = false;
            this.selectedItems = [];
          },
        });
    });
  }
  private mapSortFieldForBackend(field: string | undefined): string | undefined {
    switch (field) {
      case 'building_no_name':
        return 'building_no';
      case 'bus_type_name':
        return 'bus_type';
      case 'willing_level_name':
        return 'willing_level';
      default:
        return field;
    }
  }
  override initializePage(
    progNo: string,
    cruPage?: string,
    queryForm?: FormGroup,
    onSubmit?: (form: FormGroup) => void
  ) {
    // 先執行父類初始化（但取消原 onSubmit）
    super.initializePage(progNo, cruPage, queryForm, undefined);

    // 取出上次查詢條件
    const query = this.queryStateService.getQueryStateValue(progNo);
    if (query) {

      // 將上次查詢條件回填到查詢表單（避免修改共用元件）
      try {
        const fill: any = { ...query };
        // 將可能的 ISO/字符串時間轉回 Date
        if (fill.InterviewDateStart) {
          fill.InterviewDateStart = new Date(fill.InterviewDateStart);
        }
        if (fill.InterviewDateEnd) {
          fill.InterviewDateEnd = new Date(fill.InterviewDateEnd);
        }
        // 如果保存時有 contact_Datestart/contact_Dateend，保留為 null（後端用），但不覆寫表單上的 InterviewDate* 欄位
        this.queryForm.patchValue(fill);
      } catch (e) {
        // ignore patch errors
      }

      if (onSubmit) {
        onSubmit(queryForm!);
      }
    }
  }
}
