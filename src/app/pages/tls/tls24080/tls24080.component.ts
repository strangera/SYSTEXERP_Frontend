import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { addDaysToDate, Column, formatDateToYYYY_MM_DD } from '../../../shared/componentkit/table/table.model';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { DiscCodeEditItem, PayNoEditItem, PreOrderEditItem, Tls24080Service, TLTIdEditItem, TLTNoEditItem, VoidEditItem } from '@service/api/tls/tls24080.service';
import { InputNumberRangeComponent } from '@shared/componentkit/input-number-range/input-number-range.component';
import { DropDownListService, IDropdownItem } from '@service/utility/dropDownList.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { finalize } from 'rxjs';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { DiscCodeEditColumn, PayNoEditColumn, PreOrderEditColumn, TLTIdEditColumn, TLTNoEditColumn, VoidEditColumn } from './tls24080.model';
import { createPaginationConfig } from '@shared/componentkit/table2/table2.model';
@Component({
  selector: 'app-tls24080',
  templateUrl: './tls24080.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeComponent,
    MultiSelectComponent,
    ButtonComponent,
    TableComponent,
    TranslateModule,
    InputNumberRangeComponent,
    RadiobuttonComponent
  ],
})
export class TLS24080Component extends BasicQueryPageComponent<TLTNoEditItem | DiscCodeEditItem | TLTIdEditItem | PayNoEditItem | PreOrderEditItem | VoidEditItem> implements OnInit {
  queryForm = this.formBuilder.group({
    TXN_Date_Start: [new Date(), [Validators.required]], // 銷售日期起
    TXN_Date_End: [new Date(), [Validators.required]],   // 銷售日期迄
    UPD_Date_Start: [null], // 修正日期起
    UPD_Date_End: [null],   // 修正日期迄
    ECR_No: [null],  // 收銀機號
    TXN_No_Start: [null as null | number, [Validators.max(99999999)]],  // 領取交易序號 起
    TXN_No_End: [null as null | number, [Validators.max(99999999)]],  // 領取交易序號 迄
    EditType: [null, [Validators.required]],// 報表型態
    ...createPaginationConfig([{ field: 'ID', order: 1 }]), // 分頁和排序參數
  });
  totalRecords = 0;
  ECR_NoOptions: IDropdownItem[] = [];
  EditTypeOptions = [
    { label: '專櫃編號修正', value: 'TLTNoEdit' },
    { label: '折數修正', value: 'DiscCodeEdit' },
    { label: '抽成類別修正', value: 'TLTIdEdit' },
    { label: '付款別修正', value: 'PayNoEdit' },
    { label: '是否為預售交易修正', value: 'PreOrderEdit' },
    { label: '交易資料作廢', value: 'VoidEdit' },
  ];
  data: TLTNoEditItem[] | DiscCodeEditItem[] | TLTIdEditItem[] | PayNoEditItem[] | PreOrderEditItem[] | VoidEditItem[] = [];
  columns: Column[] = [];
  constructor(
    private readonly dropDownList: DropDownListService,
    private readonly tls24080Service: Tls24080Service,
  ) { super(); }
  ngOnInit(): void {
    this.initializePage('TLS24080', 'TLS/TLS24080CRU', this.queryForm, (form) => this.onSubmit(form));
    this.dropDownList.queryPOS1002_DropDownList().pipe(untilDestroyed(this)).subscribe(options => {
      this.ECR_NoOptions = options.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}` }));
    });
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body = {
        ...frm.value,
        TXN_Date_Start: formatDateToYYYY_MM_DD(frm.value.TXN_Date_Start),
        TXN_Date_End: formatDateToYYYY_MM_DD(frm.value.TXN_Date_End),
        UPD_Date_End: addDaysToDate(frm.value.UPD_Date_End, 1)
      }
      this.tls24080Service.queryTLS24080(body).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(res => {
        switch (frm.value.EditType) {
          case 'TLTNoEdit': this.data = res.Data[0].TLTNoEdit as TLTNoEditItem[]; this.columns = TLTNoEditColumn; break;
          case 'DiscCodeEdit': this.data = res.Data[0].DiscCodeEdit as DiscCodeEditItem[]; this.columns = DiscCodeEditColumn; break;
          case 'TLTIdEdit': this.data = res.Data[0].TLTIdEdit as TLTIdEditItem[]; this.columns = TLTIdEditColumn; break;
          case 'PayNoEdit': this.data = res.Data[0].PayNoEdit as PayNoEditItem[]; this.columns = PayNoEditColumn; break;
          case 'PreOrderEdit': this.data = res.Data[0].PreOrderEdit as PreOrderEditItem[]; this.columns = PreOrderEditColumn; break;
          case 'VoidEdit': this.data = res.Data[0].VoidEdit as VoidEditItem[]; this.columns = VoidEditColumn; break;
        }
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      })
    });
  }
}
