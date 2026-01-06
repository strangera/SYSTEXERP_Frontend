import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { DropDownListService, IDropdownItem } from '@service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { InputNumberRangeComponent } from '@shared/componentkit/input-number-range/input-number-range.component';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { RadiobuttonYNComponent } from '@shared/componentkit/radiobutton-yn/radiobutton-yn.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model'; // 引入 ReportColumn
import { AccordionModule } from 'primeng/accordion';
import { CheckboxModule } from 'primeng/checkbox';
import { SelectButtonModule } from 'primeng/selectbutton';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';

@Component({
  selector: 'app-tls2f010',
  templateUrl: './tls2f010.component.html',
  standalone: true,
  imports: [InputNumberRangeComponent, CalendarComponent, InputTextComponent, SelectButtonModule, TableReportComponent, InputNumberComponent, AsyncPipe, RadiobuttonYNComponent, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarRangeComponent, DropdownComponent, MultiSelectComponent, CheckboxModule, TranslateModule]
})
export class TLS2F010Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    sam_yyymm: [''], // 結帳年月
    tlt_no: [''],
    PUR_GUIType: [''],
    PUR_GUINO: [''],
    PUR_GUIDate_Start: [''],
    PUR_GUIDate_End: [''],
    COMM_MONEY_TYPE: [''],
    COMM_YM: [''],
    sam_termno: [''],
    DEC_YM: [''],
    ven_no: [''],
    PUR_TaxType: [[]],
    ACP_GUIAmt_Start: [''],
    ACP_GUIAmt_End: [''],
    ACP_GUINet_Start: [''],
    ACP_GUINet_End: [''],
    ACP_GUITax_Start: [''],
    ACP_GUITax_End: [''],
    check_statusList: [[]],
    COMM_NUM_Start: [''],
    COMM_NUM_End: [''],
    CRT_USR_No: [''],
    PUR_GUIPaper: [''],
    CRT_Date_Start: [''],
    CRT_Date_End: [''],
    tlt_floorList: [[]],
    // 分頁欄位
    pageSize: [30],
    pageIndex: [1],
    SortBy: [[{ field: 'tlt_no', order: 1 }]],

  });

  columns: ReportColumn[] = [
    { field: 'col1', header: '品項代碼', visible: true },
    { field: 'col2', header: '品項名稱', visible: true },
    { field: 'col3', header: '大分類代碼', visible: true },
    { field: 'col4', header: '大分類名稱', visible: true },
    { field: 'col5', header: '中分類代碼', visible: true },
    { field: 'col6', header: '中分類名稱', visible: true },
    { field: 'col7', header: '小分類代碼', visible: true },
    { field: 'col8', header: '小分類名稱', visible: true },
    { field: 'col9', header: '品項類別區分', visible: true },
    { field: 'col10', header: '圖示說明', visible: true },
  ];
  invoiceFormatOptions: any[] = [
    { value: 1, label: '21/進項三聯式、電子計算機統一發票' },
    { value: 5, label: '27/彙總登陸每張稅額五百元以下之盡項二聯式收銀雞統一發票、載有稅額之其他憑證' },
  ];
  statusOptions = [
    { label: '未拋轉', value: '2' },
    { label: '已拋轉', value: '3' },
    { label: '已退回', value: '4' },
  ];
  taxTypeOptions = getSYS1000Options('PLU_TaxType');
  money_typeOptions = getSYS1000Options('money_type');
  sam_termnoOptions: { value: number, label: string }[] = []; // 期別選項

  totalRecords = 0;
  data: any[] = [];
  lastQueryBody: any = null;
  footerData: any = null;

  tlt_term_typeOptions = getSYS1000Options('tlt_term_type');
  ven_noOptions = this.dropdown.queryPos2013({ VEN_Flag: '' });
  tlt_noOptions = this.dropdown.queryTltTalent();
  org_idOptions = this.dropdown.querySys3100();
  tlt_floorOptions = this.dropdown.querySys3900();
  tlt_buildingOptions = this.dropdown.querySys3800();
  bus_typeOptions = this.dropdown.queryTltBusType();
  bus_classOptions: IDropdownItem[] = [];
  invoiceTypeOptions = getSYS1000Options('invoice_type');

  constructor(

    private readonly dropdown: DropdownApiService,
    private readonly dropDownListService: DropDownListService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2F010', '/tls/tls2f010cru', this.queryForm, (form) => this.onSubmit(form));
  }


  // ----------------------------------------------------------------
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      // this.ass11040Service.queryASS11040(frm.getRawValue()).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
      //   this.data = res.Data;
      //   this.totalRecords = res.TotalCount;
      //   this.lastQuery = frm.getRawValue();
      //   this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
      // })
    })
  }
}
