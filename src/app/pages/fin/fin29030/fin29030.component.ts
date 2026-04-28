import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DropdownApiService } from './../../../service/utility/dropdown-api.service';
// Shared
import { CommonModule } from '@angular/common';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { InputNumberRangeComponent } from '@shared/componentkit/input-number-range/input-number-range.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { option } from '@shared/models/sys/sysb000.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TableSubheaderComponent } from '../fin42010/fin42010-table/fin42010-table.component';
//

export interface FIN29030Data {
  id: number;
  IssueDate: Date; //開票日期
}

//1.2.9.3 開票明細表
@Component({
  selector: 'app-fin29030',
  templateUrl: './fin29030.component.html',
  styleUrl: './fin29030.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    ButtonComponent,
    ButtonModule,
    TableComponent,
    TableSubheaderComponent,
    TranslateModule,
    InputNumberRangeComponent,
    MultiSelectComponent,
    CommonModule,
    CalendarComponent,
    CalendarRangeComponent
  ]
})
export class FIN29030Component extends BasicQueryPageComponent<FIN29030Data> implements OnInit {
  //
  queryForm = this.formBuilder.group({
    IssueDateFrom: [], // 開票日期
    IssueDateTo: [], // 開票日期
    BNK_No: [], // 銀行代號
    CHK_NoFrom: [null, [Validators.max(999999999999)]], // 開票單號
    CHK_NoTo: [null, [Validators.max(999999999999)]], // 開票單號
    VEN_No: [], // 廠客代號
    ExpireDate: [], // 到期日
    CHK_Status: [[] as number[]], // 票據狀態
  });
  // ----------------------------------------------------------------
  totalRecords = 0;// 分頁和排序參數 // 排序需要

  BNK_No_Options: option[] = []; // 銀行代號 下拉
  VEN_No_Options: option[] = []; // 廠客代號 下拉
  // ０＝作廢，１＝未異動，２＝到期，３＝兌現，４＝撤票，５＝退票
  CHK_Status_Options =  // 票據狀態 下拉
    [
      { value: '0', label: '作廢' },
      { value: '1', label: '未異動' },
      { value: '2', label: '到期' },
      { value: '3', label: '兌現' },
      { value: '4', label: '撤票' },
      { value: '5', label: '退票' }
    ];

  selectedItems: FIN29030Data[] = [];
  data: FIN29030Data[] = [];
  filteredData = [...this.data];
  columns = [
    { field: 'CHK_No', header: '開票單號', visible: true },
    { field: 'CHK_Number', header: '票據號碼', visible: true },
    { field: 'CHK_Status', header: '票據狀態', visible: true },
    { field: 'BNK_No', header: '付款銀行', visible: true },
    { field: 'IssueDate', header: '開票日期', visible: true },
    { field: 'ExpireDate', header: '到期日', visible: true },
    { field: 'VEN_No', header: '廠客代號', visible: true },
    { field: 'VEN_Name', header: '廠客名稱', visible: true },
    { field: 'CHK_Amount', header: '票面金額', visible: true },
  ];

  // 控制變數
  btnLoading = false;

  constructor(
    private notificationService: NotificationService,
    private readonly dropDownListService: DropDownListService,
    private readonly dropdownApiService: DropdownApiService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN29030', 'fin/fin29030cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
  }

  onSubmit(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;
    this.notificationService.blockUi();
    // if (frm.valid && this.canQuery()) {
    //   // Submit logic here
    // }
    this.loading = false;
    this.notificationService.unblockUi();
  }

  //讀取下拉  
  loadOptions() {
    // 銀行代號 下拉 (queryAPS1002_DropDownList())
    this.dropdownApiService.queryAps1002().pipe(untilDestroyed(this)).subscribe((response) => {
      const list = Array.isArray(response) ? response : [];
      this.BNK_No_Options = list.map((item: any) => ({
        value: item.BNK_DepositAccNo, // 公司銀行科目 代號
        label: item.BNK_DepositAccNo + '-' + item.ACCCNAME, // 代碼+名稱
      }));
      // console.log('銀行代號 下拉:', response);
    });
    // 廠客代號 下拉
    this.dropdownApiService.queryPos2013({ VEN_Flag: '' }).pipe(untilDestroyed(this)).subscribe(response => {
      const list = Array.isArray(response) ? response : [];
      this.VEN_No_Options = list.map((item: any) => ({
        value: item.VEN_No, // 公司銀行科目 代號
        label: item.label, // 代碼+名稱
      }));
      // console.log('廠客代號 下拉', response);
    });
  }
}
