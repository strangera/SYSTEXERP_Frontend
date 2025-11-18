import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Fin55070Service } from '@service/api/fin/fin55070.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { DropdownRangeComponent } from '@shared/componentkit/dropdown-range/dropdown-range.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { AccordionModule } from 'primeng/accordion';
import { FIN55050Service } from '../../../service/api/fin/fin55050.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
@Component({
  selector: 'app-fin55030',
  templateUrl: './fin55030.component.html',
  styleUrl: './fin55030.component.scss',
  standalone: true,
  imports: [
    AsyncPipe,
    AccordionModule,
    MultiSelectComponent,
    MenubarComponent,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeComponent,
    DropdownComponent,
    DropdownRangeComponent,
    InputNumberRangeComponent,
    InputTextComponent,
    ButtonComponent,
    TableComponent,
    TranslateModule
  ]
})

// FIN55030 立沖科目餘額表
export class FIN55030Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    SVOUDATE: [new Date(), [Validators.required]], // 日期 GLS3001.VOUDATE
    EVOUDATE: [new Date(), [Validators.required]],
    ORG_ID: [''],   // 部門代碼 GLS3001.ORG_ID
    SACCNO: [''], // 科目代號 GLS3003.ACCNO
    EACCNO: [''],
    SDetailNo: [''], // 廠商代號 GLS3001.DetailNo
    EDetailNo: [''],
    SPTA: [''], // 立沖代號 GLS3003.PTA
    EPTA: [''],
    SubDetailNo: [[]], // 對象別編號 GLS3001.SubDetailNo
    PostFlag: [''], // 傳票狀態 GLS3001.PostFlag
    ifOptions: [''], // 是否為對象別(是-->IS NOT NULL, 否-->IS NULL)

    // ...createPaginationConfig([{ field: 'ECR_Group', order: 1 }]),
  });

  columns: any[] = [
    { field: 'invoiceDate', header: '傳票日期', visible: true },
    { field: 'invoiceNumber', header: '傳票號碼', visible: true },
    { field: 'customerCodeName', header: '顧客代號/名稱', visible: true },
    { field: 'departmentName', header: '部門名稱', visible: true },
    { field: 'voucherCode', header: '立沖代號', visible: true },
    { field: 'summary', header: '摘要', visible: true },
    { field: 'debitAmount', header: '借方金額(總額)', visible: true },
    { field: 'creditAmount', header: '貸方金額(總額)', visible: true }
  ];
  data: any[] = [];
  totalRecords = 0;
  AccNo_Options: any[] = [];
  ORG_IDOptions: any[] = [];
  VenNoOptions: any[] = [];
  TargetNoListOptions: any[] = [];
  VouTypeListOptions: any[] = [];
  ifOptions = [
    { label: '是', value: 'Y' },
    { label: '否', value: 'N' }
  ]
  constructor(
    private dropdown: DropdownApiService,
    public readonly fin55070Service: Fin55070Service,
    private dropDownListService: DropDownListService,
    private fin55050Service: FIN55050Service,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('FIN55030', '/FIN/FIN55030CRU', this.queryForm, (frm) => this.onSubmit(frm));
    this.loadOptions();
  }
  loadOptions() {
    this.fin55070Service.getAccNoList().subscribe(res => {
      this.AccNo_Options = res;
    });
    this.dropdown.querySys3100().subscribe(res => {
      this.ORG_IDOptions = res || [];
    });
    this.dropDownListService.queryPOS2013_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.VenNoOptions = response.Data.map((item: any) => ({ Name: `${item.No}-${item.Name}`, No: item.No }));
      });
    this.fin55050Service.queryGLS1016_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.TargetNoListOptions = response.Data?.map((item: any) => ({
          label: `${item.No} - ${item.Name}`,
          value: item.No,
        })) ?? [];
      });
    this.fin55050Service.queryGLS1010_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.VouTypeListOptions = response.Data?.map((item: any) => ({
          label: `${item.No} - ${item.Name}`,
          value: item.No,
        })) ?? [];
      });
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      console.log('api尚未提供')
    });
  }
}
