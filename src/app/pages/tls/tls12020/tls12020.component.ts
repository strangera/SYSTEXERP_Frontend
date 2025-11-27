
import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { yesterday } from '@shared/models/system/query-form.model';
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
    InterviewDateStart: [yesterday], // 原本 contact_Datestart
    InterviewDateEnd: [yesterday],   // 原本 contact_Dateend
    contact_USR_No: [null],
    contact_USR_Name: [this.authService.currentUserValue?.user_No], // 訪談人員
    willing_level: [null], // 後端要 string，不要 null
    ...createPaginationConfig([{ field: 'location_no', order: 1 }]), // 原本是 ECR_LocNo
  });



  data: any[] = [];
  columns: Column[] = [
    { header: '位置編號', field: 'LOCATION_No' },
    { header: '廠商統一編號', field: 'ven_uniform' },
    { header: '廠商名稱(中文)', field: 'VEN_Name' },
    { header: '廠商名稱(英文)', field: 'VEN_EngName' },
    { header: '品牌', field: 'tlt_name' },
    { header: '館別', field: 'building_no_name' },
    { header: '業種', field: 'bus_type_name' },
    { header: '聯絡人', field: 'VEN_ContactPerson' },
    { header: '聯絡人電話', field: 'VEN_BossTel' },
    { header: '訪談日期', field: 'contact_Date', visible: true, format: (value: any) => formatDate(value, 'yyyy/MM/dd', 'en-US') },
    { header: '訪談時間', field: 'contact_Time', visible: true, format: this.formatTimeHHmm },
    { header: '訪談人員', field: 'contact_USR_Name' },
    { header: '意願等級', field: 'willing_level_name' },
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

    //統編API
    this.dropDownListService.queryPOS2013_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.vendorUIDOptions = res.Data.map(item => ({
          label: `${item.Name} ${item.No}`, // 顯示中文+數字
          value: item.No,                   // 送出用的值
          Name: item.Name,                  // 加入 Name 屬性
          No: item.No                       // 加入 No 屬性
        }));
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
      const params = {
        ...form.value,
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
            const data = (res.Data ?? []).map((row: { building_no: string; bus_type: string; willing_level: string }) => ({
              ...row,
              building_no_name: this.buildingNoOptions.find(opt => opt.value === row.building_no)?.label || row.building_no,
              bus_type_name: this.industryCodeOptions.find(opt => opt.value === row.bus_type || opt.No === row.bus_type)?.label || row.bus_type,
              willing_level_name: this.willinglevelOptions.find(opt => opt.No === row.willing_level)?.label || row.willing_level
            }));
            this.data = data;
            this.totalRecords = res.TotalCount ?? 0;
            this.queryStateService.setQueryState(this.ProgNo, params);
            this.loading = false;
            this.selectedItems = [];
          },
        });
    });
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

      if (onSubmit) {
        onSubmit(queryForm!);
      }
    }
  }
}
