import { AsyncPipe, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropDownListService, IDropdownItem } from '@service/utility/dropDownList.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { InputNumberRangeComponent } from '@shared/componentkit/input-number-range/input-number-range.component';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { RadiobuttonYNComponent } from '@shared/componentkit/radiobutton-yn/radiobutton-yn.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { CheckboxModule } from 'primeng/checkbox';
import { PanelModule } from 'primeng/panel';
import { SelectButtonModule } from 'primeng/selectbutton';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
@Component({
  selector: 'app-tls2f010-cru',
  templateUrl: './tls2f010-cru.component.html',
  styleUrl: './tls2f010-cru.component.scss',
  standalone: true,
  imports: [TableComponent, TableEditComponent, NgIf, PanelModule, InputNumberRangeComponent, CalendarComponent, InputTextComponent, SelectButtonModule, TableReportComponent, InputNumberComponent, AsyncPipe, RadiobuttonYNComponent, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarRangeComponent, DropdownComponent, MultiSelectComponent, CheckboxModule, TranslateModule]
})
export class TLS2F010CRUComponent extends BasicCruPageComponent<any> implements OnInit {

  dataForm = this.formBuilder.nonNullable.group({
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
  });
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

  // 三個 table 用的 loading / 欄位定義 / 假資料
  queryLoading = false;

  // 換開發票 (表頭) 編輯 table 資料與欄位
  changeEditData: any[] = [
    {
      'col-1': 'insert',
      'col-2': '21',
      'col-3': 'AB12345678',
      'col-4': '2025-01-01',
      'col-5': '12345678',
      'col-6': 1000,
    },
  ];

  columns1: Column[] = [
    { field: 'col-1', header: '所屬結帳年月', visible: true },
    { field: 'col-2', header: '結帳方式', visible: true },
    { field: 'col-3', header: '帳次', visible: true },
    { field: 'col-4', header: '廠商編號', visible: true },
    { field: 'col-5', header: '專櫃編號', visible: true },
    { field: 'col-6', header: '應付貨款(免稅)', visible: true },
    { field: 'col-7', header: '廠商應開立發票額(收據)', visible: true },
    { field: 'col-8', header: '營業稅', visible: true },
    { field: 'col-9', header: '總額', visible: true },
    { field: 'col-10', header: '廠商應開立發票張數', visible: true },
  ];

  // 來源發票顯示用 table 欄位定義 (使用 data 陣列當資料來源)
  columns2: Column[] = [
    { field: 'col-1', header: '單據別' },
    { field: 'col-2', header: '發票/收據編號' },
    { field: 'col-3', header: '發票/收據日期' },
    { field: 'col-4', header: '所屬結帳年月' },
    { field: 'col-5', header: '申報年月' },
    { field: 'col-1', header: '廠商統一編號' },
    { field: 'col-2', header: '課稅別' },
    { field: 'col-3', header: '扣抵代號' },
    { field: 'col-4', header: '發票用途' },
    { field: 'col-5', header: '發票總額' },
    { field: 'col-2', header: '未稅金額' },
    { field: 'col-3', header: '稅額' },
    { field: 'col-4', header: '發票格式' },
    { field: 'col-5', header: '發票/收據狀況' },
  ];

  // 換開發票明細 編輯 table 資料與欄位
  detailEditData: any[] = [
    {
      status: 'insert',
      INV_ItemName: '測試商品',
      INV_Qty: 1,
      INV_SaleAmt: 1000,
    },
  ];

  columns3: EditColumn[] = [
    { field: 'INV_ItemName', header: '單據別', type: 'input', width: '200px' },
    { field: 'INV_Qty', header: '廠商編號', type: 'inputNumber', width: '120px' },
    { field: 'INV_SaleAmt', header: '發票/收據編號', type: 'inputNumber', width: '140px' },
    { field: 'INV_ItemName', header: '發票/收據日期', type: 'input', width: '200px' },
    { field: 'INV_Qty', header: '申報年月', type: 'inputNumber', width: '120px' },
    { field: 'INV_SaleAmt', header: '廠商統一編號', type: 'inputNumber', width: '140px' },
    { field: 'INV_ItemName', header: '課稅別', type: 'input', width: '200px' },
    { field: 'INV_Qty', header: '扣抵代號', type: 'inputNumber', width: '120px' },
    { field: 'INV_SaleAmt', header: '未稅金額', type: 'inputNumber', width: '140px' },
    { field: 'INV_ItemName', header: '稅額', type: 'input', width: '200px' },
    { field: 'INV_Qty', header: '應稅金額', type: 'inputNumber', width: '120px' },
    { field: 'INV_SaleAmt', header: '發票格式', type: 'inputNumber', width: '140px' },
    { field: 'INV_SaleAmt', header: '發票用途', type: 'inputNumber', width: '140px' },
  ];

  constructor(

    private readonly dropdown: DropdownApiService,
    private readonly dropDownListService: DropDownListService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2F010', this.dataForm);
  }
  onSubmit(frm: any): void {
    this.handleSubmit(frm, () => {
      // this.ass11040Service.queryASS11040(frm.getRawValue()).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
      //   this.data = res.Data;
      //   this.totalRecords = res.TotalCount;
      //   this.lastQuery = frm.getRawValue();
      //   this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
      // })
    })
  }

  // table-edit 資料變更事件 — 先簡單同步到本地變數
  onChangeEditDataChange(data: any[]): void {
    this.changeEditData = data;
  }

  onDetailEditDataChange(data: any[]): void {
    this.detailEditData = data;
  }

  // 單格欄位異動事件，目前先預留，不做任何處理
  // event 內容格式依 table-edit 元件定義，可之後再補實際商業邏輯
  onDetailFieldChange(_event: any): void {
    // no-op
  }
}

