import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { TLS24080ResultData, Tls24080Service } from '@service/api/tls/tls24080.service';
import { DropDownListService, IDropdownItem } from '@service/utility/dropDownList.service';
import { InputNumberRangeComponent } from '@shared/componentkit/input-number-range/input-number-range.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { yesterday } from '@shared/models/system/query-form.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { addDaysToDate, Column, formatDateToYYYY_MM_DD } from '../../../shared/componentkit/table/table.model';
import { DiscCodeEditColumn, PayNoEditColumn, PreOrderEditColumn, TLTIdEditColumn, TLTNoEditColumn, VoidEditColumn } from './tls24080.model';

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
    TranslateModule,
    InputNumberRangeComponent,
    RadiobuttonComponent,
    TableReportComponent
  ],
})
export class TLS24080Component extends BasicQueryPageComponent<TLS24080ResultData> implements OnInit {
  queryForm = this.formBuilder.group({
    TXN_Date_Start: [yesterday, [Validators.required]], // 銷售日期起 // 預設昨天
    TXN_Date_End: [yesterday, [Validators.required]],   // 銷售日期迄 // 預設昨天
    UPD_Date_Start: [null], // 修正日期起
    UPD_Date_End: [null],   // 修正日期迄
    ECR_No: [null],  // 收銀機號
    TXN_No_Start: [null as null | number, [Validators.max(99999999)]],  // 領取交易序號 起
    TXN_No_End: [null as null | number, [Validators.max(99999999)]],  // 領取交易序號 迄
    EditType: ['TLTNoEdit', [Validators.required]],// 報表型態
    pageSize: [30],
    pageIndex: [1],
    SortBy: [[{ field: 'ID', order: 1 }]],
  });
  totalRecords = 0;
  lastQueryBody: any;
  ECR_NoOptions: IDropdownItem[] = [];
  EditTypeOptions = [
    { label: '專櫃編號修正', value: 'TLTNoEdit' },
    { label: '折數修正', value: 'DiscCodeEdit' },
    { label: '抽成類別修正', value: 'TLTIdEdit' },
    { label: '付款別修正', value: 'PayNoEdit' },
    { label: '是否為預售交易修正', value: 'PreOrderEdit' },
    { label: '交易資料作廢', value: 'VoidEdit' },
  ];
  data: TLS24080ResultData[] = [];
  columns: Column[] = TLTNoEditColumn;
  DataKeyName = 'TLTNoEdit';
  constructor(
    private readonly dropDownList: DropDownListService,
    public readonly tls24080Service: Tls24080Service,
  ) { super(); }
  ngOnInit(): void {
    this.initializePage('TLS24080');
    this.dropDownList.queryPOS1002_DropDownList().pipe(untilDestroyed(this)).subscribe(options => {
      this.ECR_NoOptions = options.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}` }));
    });
    this.queryForm.get('EditType')?.valueChanges.pipe(untilDestroyed(this)).subscribe(editType => {
      switch (editType) {
        case 'TLTNoEdit': this.columns = TLTNoEditColumn; this.DataKeyName = 'TLTNoEdit'; break;
        case 'DiscCodeEdit': this.columns = DiscCodeEditColumn; this.DataKeyName = 'DiscCodeEdit'; break;
        case 'TLTIdEdit': this.columns = TLTIdEditColumn; this.DataKeyName = 'TLTIdEdit'; break;
        case 'PayNoEdit': this.columns = PayNoEditColumn; this.DataKeyName = 'PayNoEdit'; break;
        case 'PreOrderEdit': this.columns = PreOrderEditColumn; this.DataKeyName = 'PreOrderEdit'; break;
        case 'VoidEdit': this.columns = VoidEditColumn; this.DataKeyName = 'VoidEdit'; break;
        default: this.columns = [];
      }
      setTimeout(() => {
        // 避免在初始化時，由 patchValue 觸發的第一次 valueChange 執行查詢，
        // 所以檢查 this.data 是否已有值 (代表已經執行過一次查詢)
        // 或者直接執行查詢，但確保查詢參數正確。
        this.onSubmit(this.queryForm);
      }, 0);
    })

    const EditType = this.queryStateService.getQueryState(this.ProgNo)?.value?.EditType;
    if (EditType) {
      this.queryForm.get('EditType')?.patchValue(EditType);
    } else {
      this.columns = TLTNoEditColumn;
    }
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body = {
        ...frm.value,
        TXN_Date_Start: formatDateToYYYY_MM_DD(frm.value.TXN_Date_Start),
        TXN_Date_End: formatDateToYYYY_MM_DD(frm.value.TXN_Date_End),
        UPD_Date_End: frm.value.UPD_Date_End ? addDaysToDate(frm.value.UPD_Date_End, 1) : null,
      }
      this.tls24080Service.queryTLS24080(body).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(res => {
        this.data = res.Data
        this.lastQueryBody = body;
        this.totalRecords = res.TotalCount;
      })
    });
  }
}
