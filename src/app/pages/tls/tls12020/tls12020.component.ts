
import { Component, OnInit } from '@angular/core';
import { formatDate } from '@angular/common';
import { untilDestroyed } from '@ngneat/until-destroy';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { DropDownListService, IDropdownItem } from '../../../service/utility/dropDownList.service';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TLS12020Service } from '../../../service/api/tls/tls12020.service';
import { LocationOptionsService } from '../../../service/api/dropdownservice/location-options.service';

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
  queryForm = this.formBuilder.group({
    ECR_LocNo: [''],
    cus_uniform_id: [''],
    ven_name: ['', Validators.maxLength(60)],
    VEN_EngName: ['', Validators.maxLength(60)],
    brand: [''],
    create_store: [''],
    contact_person: [''],
    contact_phone: [''],
    contact_Datestart: [null],
    contact_Dateend: [null],
    contact_time: [''],
    contact_USR_Name: ['', [Validators.required]], // 訪談人員（必填）
    willing_level: [null],
    ...createPaginationConfig([{ field: 'ECR_LocNo', order: 1 }]),
  });


  data: any[] = [];
  columns: Column[] = [
    { header: '位置編號', field: 'LOCATION_No' },
    { header: '廠商統一編號', field: 'ven_uniform' },
    { header: '廠商名稱(中文)', field: 'VEN_Name' },
    { header: '廠商名稱(英文)', field: 'VEN_EngName' },
    { header: '品牌', field: 'tlt_name' },
    { header: '聯絡人', field: 'VEN_ContactPerson' },
    { header: '聯絡人電話', field: 'VEN_BossTel' },
    { header: '訪談日期', field: 'contact_Date', visible: true, format: (value: any) => formatDate(value, 'yyyy/MM/dd', 'en-US') },
    { header: '訪談時間', field: 'contact_Time', visible: true, format: this.formatTimeHHmm },
    { header: '訪談人員', field: 'contact_USR_Name' },
    { header: '意願等級', field: 'willing_level' },
  ];

  selectedItems: any[] = [];
  totalRecords = 0;
  vendorUIDOptions: IDropdownItem[] = [];
  contact_USR_NameOptions: IDropdownItem[] = [];
  willinglevelOptions: IDropdownItem[] = [];
  locationOptions: IDropdownItem[] = [];


  constructor(
    private tls12020Service: TLS12020Service,
    private locationOptionsService: LocationOptionsService,
    private dropDownListService: DropDownListService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS12020', 'TLS/TLS12020cru', this.queryForm, (form) => this.onSubmit(form));
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
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

    this.dropDownListService.queryPOS2013_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      this.vendorUIDOptions = res.Data;
    });
    this.dropDownListService.queryTBLUSER_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      this.contact_USR_NameOptions = res.Data;
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
        request: {
          ...form.value,
          willing_level: form.value.willing_level || null,
          contact_Datestart: form.value.contact_Datestart
            ? new Date(form.value.contact_Datestart).toISOString()
            : null,
          contact_Dateend: form.value.contact_Dateend
            ? new Date(form.value.contact_Dateend).toISOString()
            : null,
        }
      };

      this.tls12020Service.queryTLS12020(params).subscribe({
        next: (res) => {
          this.data = res.Data ?? [];
          this.totalRecords = res.TotalCount ?? 0;
          this.queryStateService.setQueryState(this.ProgNo, params);
          this.loading = false;
          this.selectedItems = [];
        },
        error: (err) => {
          console.error('TLS12020 查詢失敗', err);
          this.loading = false;
        }
      });
    });
  }



}
