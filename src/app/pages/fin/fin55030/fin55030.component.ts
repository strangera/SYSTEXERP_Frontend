import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '@shared/componentkit/table/table.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { Fin55070Service } from '@service/api/fin/fin55070.service';
import { AsyncPipe } from '@angular/common';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { FIN55050Service } from '../../../service/api/fin/fin55050.service';
@Component({
  selector: 'app-fin55030',
  templateUrl: './fin55030.component.html',
  styleUrl: './fin55030.component.scss',
  standalone: true,
  imports: [
    AsyncPipe, MultiSelectComponent, MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarRangeComponent, DropdownComponent, InputNumberRangeComponent, InputTextComponent, ButtonComponent, TableComponent, TranslateModule]
})

export class FIN55030Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    SSubpoenadate: [new Date(), [Validators.required]],
    ESubpoenadate: [new Date(), [Validators.required]],
    ORG_ID: [''],
    AccNoFrom: [''],
    VEN_No: [''],
    startserialticket: [''],
    endserialticket: [''],
    TargetNoList: [[]],
    Subpoenacode: [''],
    VouTypeList: [[]],
    ifOptions: [''],
    ...createPaginationConfig([{ field: 'ECR_Group', order: 1 }]),
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
  AccNo_Options = this.fin55070Service.getAccNoList();
  ORG_IDOptions = this.dropdown.querySys3100();
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

    });
  }

}
