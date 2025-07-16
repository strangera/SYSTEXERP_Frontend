
import { Component, OnInit } from '@angular/core';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { DropDownListService, IDropdownItem } from '../../../service/utility/dropDownList.service';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
// import { TLS12020Service} from '../../../service/api/tls/tls12020.service';
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
    ven_name: [''],
    VEN_EngName: [''],
    brand: [''],
    create_store: [''],
    contact_person: [''],
    contact_phone: [''],
    contact_Datestart: [null],
    contact_Dateend: [null],
    contact_time: [''],
    contact_USR_Name: [''],
    willing_level: [''],
    ...createPaginationConfig([{ field: 'ECR_LocNo', order: 1 }]),
  });


  data: any[] = [];
  columns: Column[] = [
    { header: '位置編號', field: 'ECR_LocNo' },
    { header: '廠商統一編號', field: 'cus_uniform_id' },
    { header: '廠商名稱(中文)', field: 'ven_name' },
    { header: '廠商名稱(英文)', field: 'VEN_EngName' },
    { header: '品牌', field: 'brand' },
    { header: '資料作成店', field: 'create_store' },
    { header: '聯絡人', field: 'contact_person' },
    { header: '聯絡人電話', field: 'contact_phone' },
    { header: '訪談日期', field: 'contact_date' },
    { header: '訪談時間', field: 'contact_time' },
    { header: '訪談人員', field: 'contact_USR_Name' },
    { header: '意願等級', field: 'willing_level' },
  ];
  selectedItems: any[] = [];
  totalRecords = 0;
  uniformIDOptions: IDropdownItem[] = [];
  contact_USR_NameOptions: IDropdownItem[] = [];
  willing_level_Options: IDropdownItem[] = [];


  constructor(
    // private tls12020ervice: TLS12020Service,
    private locationOptionsService: LocationOptionsService,
    private dropDownListService: DropDownListService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS12020', 'TLS/TLS12020cru', this.queryForm, (form) => this.onSubmit(form));

    // 下拉選單資料
    // this.loadDropdownOptions();
  }

  onSubmit(frm: FormGroup) {
    // this.handleSubmit(frm, () => {
    //   this.tls12020Service.queryTLS12020(frm.getRawValue())
    //     .pipe(finalize(() => this.loading = false), untilDestroyed(this))
    //     .subscribe((res) => {
    //       this.data = res.Data;
    //       this.totalRecords = res.TotalCount;
    //       this.queryStateService.setQueryState(this.ProgNo, frm);
    //     });
    // });
  }

  //   onCreate(data?: any) {
  //     if (this.canPerformAction('20')) {
  //       this.navigateWithState(CRUDStatus.Create, data);
  //     }
  //   }

  //   onEdit(data: any) {
  //     if (this.canPerformAction('30')) {
  //       const newData = { ...data };


  //       this.navigateWithState(CRUDStatus.Edit, newData);
  //     }
  //   }

  //   onDetail(data: any) {
  //     if (this.canPerformAction('10')) {
  //       this.navigateWithState(CRUDStatus.Read, data);
  //     }
  //   }

  //   onLazyLoadData(event: any, queryForm: FormGroup) {
  //     queryForm.patchValue({
  //       pageSize: event.pageSize,
  //       pageIndex: event.pageIndex,
  //       SortBy: event.SortBy
  //     });
  //   }
}
