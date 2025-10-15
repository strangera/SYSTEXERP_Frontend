import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { Column, createPaginationConfig, formatAmount, formatDate } from '@shared/componentkit/table/table.model';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { FormsModule, ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TLS2D040Service } from '@service/api/tls/tls2-d040.service';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { CommonModule, DatePipe } from '@angular/common';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-tls2d040',
  templateUrl: './tls2d040.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    MultiSelectComponent,
    TableComponent,
    TranslateModule,
    CalendarRangeComponent,
    DropdownComponent,
    RadiobuttonComponent,
    CommonModule,
    CheckboxModule
  ]
})
export class TLS2D040Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    tlt_no: [[]],             // 專櫃編號
    source_type: [[]],        // 來源系統別
    CAP_Item: [[]],           // 扣款代碼
    AccNo: [[]],              // 會計科目
    tpy_bdate: ['', Validators.required],          // 扣款年月(起)
    tpy_edate: ['', Validators.required],          // 扣款年月(訖)
    VEN_No: [null],             // 廠商編號
    pod_no: [null],             // 活動代碼/名稱
    GUI_FLAG: [null],           // 開立發票
    org_id: [[]],             // 組織代碼
    close_flag: ['N'],         // 類型
    bus_type: [[]],           // 大分類代碼
    store_way: [null],          // 專櫃/自營櫃
    building_no: [[]],        // 館別
    FLOOR_NO: [[]],           // 樓層
    status: ['0'],        // 狀況(For匯總) 0=依專櫃 1=依扣款項目 2=依部門
    ShowNeg1: [false],          // 只顯示負值(只適用於專櫃統計)
    ShowNeg2: [false],          // 只顯示當月應收為負值
    ...createPaginationConfig([])
  });

  data: any[] = [];
  selectedItems: any[] = [];
  totalRecords = 0;

  //#region 下拉選單資料
  // 專櫃編號
  tltNoOptions: any[] = [];
  // 來源系統別
  sourceTypeOptions: any[] = [
    { Name: '1-合約扣款', No: '1' },
    { Name: '2-人工扣款', No: '2' },
    { Name: '4-罰款', No: '4' },
    { Name: '5-能源扣款', No: '5' },
    { Name: '8-溢欠款', No: '8' },
    { Name: '13-電子商務', No: '13' }
  ];
  // 扣款代碼
  capItemOptions: any[] = [];
  // 會計科目
  accNoOptions: any[] = [];
  // 組織代碼
  orgIdOptions: any[] = [];
  // 大分類代碼
  busTypeOptions: any[] = [];
  // 館別
  buildingNoOptions: any[] = [];
  // 樓層
  floorNoOptions: any[] = [];
  // 活動代碼/名稱
  podNoOptions: any[] = [];
  // 廠商編號
  VenNoOptions: any[] = [];
  // 開立發票
  guiFlagOptions: any[] = [
    { Name: '開立發票', No: 'Y' },
    { Name: '不開立發票', No: 'N' }
  ];
  // 狀況(For匯總)
  statusOptions: any[] = [
    { label: '依專櫃', value: '0' },
    { label: '依扣款項目', value: '1' },
    { label: '依部門', value: '2' },
    { label: '依會計科目', value: '3' }
  ];
  // 類型
  closeFlagOptions: any[] = [
    { label: '試算', value: 'N' },
    { label: '結算', value: 'Y' }
  ];
  // 專櫃/自營櫃
  storeWayOptions: any[] = [
    { Name: '專櫃', No: '1' },
    { Name: '自營', No: '2' }
  ];
  //#endregion

  columns: Column[] = [];

  constructor(
    private tls2d040Service: TLS2D040Service,
    private datepipe: DatePipe,
    private dropDownListService: DropDownListService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2D040', 'tls/tls2d040cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
    this.setColumns('0');
  }

  loadOptions() {
    // 載入專櫃編號下拉選單
    this.dropDownListService.queryTLTTALENT_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.tltNoOptions = response.Data.map((item: any) => ({ Name: `${item.No}-${item.Name}`, No: item.No }));
      });
    // 載入扣款代碼下拉選單
    this.dropDownListService.queryAPS1003_DropDownList({ cap_typeList: [] })
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.capItemOptions = response.Data.map((item: any) => ({ Name: `${item.No}-${item.Name}`, No: item.No }));
      });
    // 載入會計科目下拉選單
    this.dropDownListService.queryGLS1005_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.accNoOptions = response.Data.map((item: any) => ({ Name: `${item.No}-${item.Name}`, No: item.No }));
      });
    // 載入組織代碼下拉選單
    this.dropDownListService.querySYS3100_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.orgIdOptions = response.Data.map((item: any) => ({ Name: `${item.No}-${item.Name}`, No: item.No }));
      });
    // 載入大分類代碼下拉選單
    this.dropDownListService.queryPOS2003_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.busTypeOptions = response.Data.map((item: any) => ({ Name: `${item.No}-${item.Name}`, No: item.No }));
      });
    // 載入館別下拉選單
    this.dropDownListService.querySYS3800_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.buildingNoOptions = response.Data;
      });
    // 載入樓層下拉選單
    this.dropDownListService.querySYS3900_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.floorNoOptions = response.Data;
      });
    // 載入活動代碼下拉選單
    this.dropDownListService.queryTALPORDERM_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.podNoOptions = response.Data.map((item: any) => ({ Name: `${item.No}-${item.Name}`, No: item.No }));
      });
    //  載入廠商編號下拉選單
    this.dropDownListService.queryPOS2013_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.VenNoOptions = response.Data.map((item: any) => ({ Name: `${item.No}-${item.Name}`, No: item.No }));
      });
  }

  onSubmit(form: FormGroup) {
    this.handleSubmit(form, () => {
      const payload = {
        ...form.getRawValue(),
        tpy_bdate: form.value.tpy_bdate ? this.datepipe.transform(form.value.tpy_bdate, 'yyyyMM') : '',
        tpy_edate: form.value.tpy_edate ? this.datepipe.transform(form.value.tpy_edate, 'yyyyMM') : '',
        ShowNeg: form.value.status === '0' ? form.value.ShowNeg1 : form.value.ShowNeg2,
      }

      switch (form.value.status) {
        case '0':
          this.tls2d040Service.queryTLS2D040_TLT(payload)
            .pipe(untilDestroyed(this), finalize(() => this.loading = false))
            .subscribe(response => {
              this.setColumns(form.value.status);
              this.data = response.Data.mainData;
              this.totalRecords = response.TotalCount;
              this.queryStateService.setQueryState(this.ProgNo, form.getRawValue());
            });
          break;
        case '1':
          this.tls2d040Service.queryTLS2D040_ChargeItem(payload)
            .pipe(untilDestroyed(this), finalize(() => this.loading = false))
            .subscribe(response => {
              this.setColumns(form.value.status);
              this.data = response.Data.mainData;
              this.totalRecords = response.TotalCount;
              this.queryStateService.setQueryState(this.ProgNo, form.getRawValue());
            });
          break;
        case '2':
          this.tls2d040Service.queryTLS2D040_Department(payload)
            .pipe(untilDestroyed(this), finalize(() => this.loading = false))
            .subscribe(response => {
              this.setColumns(form.value.status);
              this.data = response.Data.mainData;
              this.totalRecords = response.TotalCount;
              this.queryStateService.setQueryState(this.ProgNo, form.getRawValue());
            }
            );
          break;
        case '3':
          this.tls2d040Service.queryTLS2D040_Detail(payload)
            .pipe(untilDestroyed(this), finalize(() => this.loading = false))
            .subscribe(response => {
              this.setColumns(form.value.status);
              this.data = response.Data.mainData;
              this.totalRecords = response.TotalCount;
              this.queryStateService.setQueryState(this.ProgNo, form.getRawValue());
            });
          break;
      }
    });
  }

  setColumns(status: string) {
    // 根據 status 設定不同的欄位
    switch (status) {
      case '0': // 依專櫃
        this.columns = [
          { field: 'tlt_no', header: '專櫃編號' },
          { field: 'tlt_name', header: '專櫃名稱' },
          { field: 'VEN_Name', header: '廠商' },
          { field: 'sam_yyymm', header: '扣款年月' },
          { field: 'GUI_FLAG', header: '是否開立發票', format: (value: any) => value === 'Y' ? '開立' : '不開立' },
          { field: 'tpy_namt', header: '扣款金額(未稅)', format: formatAmount }
        ];
        break;
      case '1': // 依扣款項目
        this.columns = [
          { field: 'CAP_Item', header: '扣款代碼' },
          { field: 'CAP_Name', header: '扣款名稱' },
          { field: 'sam_yyymm', header: '扣款年月' },
          { field: 'GUI_FLAG', header: '是否開立發票', format: (value: any) => value === 'Y' ? '開立' : '不開立' },
          { field: 'tpy_namt', header: '扣款金額(未稅)', format: formatAmount }
        ];
        break;
      case '2': // 依部門
        this.columns = [
          { field: 'CAP_Item', header: '扣款代碼' },
          { field: 'CAP_Name', header: '扣款名稱' },
          { field: 'org_id', header: '組織代碼' },
          { field: 'Org_Name', header: '組織名稱' },
          { field: 'sam_yyymm', header: '扣款年月' },
          { field: 'GUI_FLAG', header: '是否開立發票', format: (value: any) => value === 'Y' ? '開立' : '不開立' },
          { field: 'tpy_namt', header: '扣款金額(未稅)', format: formatAmount }
        ];
        break;
      case '3': // 依會計科目
        this.columns = [
          { field: 'tlt_no', header: '專櫃編號' },
          { field: 'tlt_name', header: '專櫃名稱' },
          {
            field: 'source_type', header: '來源系統別', format: (value: any) => this.sourceTypeOptions.find(opt => opt.No === value)?.Name || value
          },
          { field: 'CAP_Item', header: '扣款代碼' },
          { field: 'CAP_Name', header: '扣款名稱' },
          { field: 'org_id', header: '組織代碼' },
          { field: 'pod_no', header: '活動代碼' },
          { field: 'AccNo', header: '會計科目代碼' },
          { field: 'sam_yyymm', header: '扣款年月' },
          { field: 'GUI_FLAG', header: '是否開立發票', format: (value: any) => value === 'Y' ? '開立' : '不開立' },
          { field: 'tpy_namt', header: '扣款金額(未稅)', format: formatAmount },
          { field: 'remarks', header: '備註' }
        ];
        break;
    }
  }
}