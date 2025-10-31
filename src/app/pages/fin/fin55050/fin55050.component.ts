/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { FIN55050Service, FIN55050Detail } from '../../../service/api/fin/fin55050.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TranslateModule } from '@ngx-translate/core';
import { Column, createPaginationConfig, formatAmount, formatDate } from '@shared/componentkit/table/table.model';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { FormsModule, ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { CheckboxModule } from 'primeng/checkbox';
import { MultiSelectComponent } from "@shared/componentkit/multi-select/multi-select.component";
import { TableSubheaderComponent } from "@shared/componentkit/table/table-subheader/table-subheader.component";
import { InputTextRangeComponent } from '@shared/componentkit/input-text-range/input-text-range.component';
import { Router } from '@angular/router';

// === 和你現有 interface 對齊 ===
export interface FIN55050Data {
  AccNo: string;
  AccCName: string;
  VouDate: string;
  _Details: FIN55050Detail[];
}
export interface GroupedFIN55050Detail extends FIN55050Detail {
  AccNo: string;
  AccCName: string;
  VouDate: string;
}

// === 引入 Store（放在本資料夾） ===
import { FIN55050Store } from './fin55050.store';

@Component({
  selector: 'app-fin55050',
  templateUrl: './fin55050.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    TranslateModule,
    CalendarRangeComponent,
    RadiobuttonComponent,
    CheckboxModule,
    MultiSelectComponent,
    TableSubheaderComponent,
    InputTextRangeComponent
  ]
})


export class FIN55050Component extends BasicQueryPageComponent<FIN55050Detail> implements OnInit {
    readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  queryForm = this.formBuilder.group({
    DateFrom: [this.yesterday, Validators.required],
    DateTo: [this.yesterday, Validators.required],
    OrgIdList: [null],
    AccNoList: [null],
    VendorNoList: [null],
    PTAFrom: [null],
    PTATo: [null],
    TargetNoList: [null],
    Notes: [null],
    VouTypeList: [null],
    VouStatusList: [null],
    IsTarget: ['Y', Validators.required],
    ...createPaginationConfig([])
  });

  data: FIN55050Detail[] = [];
  selectedItems: FIN55050Detail[] = [];
  totalRecords = 0;

  columns: Column[] = [
    { field: 'VouNo', header: '傳票號碼', visible: true, type: 'detail' },
    { field: 'Ven_Name', header: '廠商代號/簡稱', visible: true },
    { field: 'VouStatus', header: '狀態', visible: true },
    { field: 'ORG_ID', header: '部門', visible: true },
    { field: 'Org_Name', header: '部門名稱', visible: true },
    { field: 'ProjectNo', header: '活動', visible: true },
    { field: 'PTA', header: '立沖代號', visible: true },
    { field: 'NoteDesc', header: '摘要', visible: true },
    { field: 'AccAmt_D', header: '借方金額', visible: true, format: formatAmount },
    { field: 'AccAmt_C', header: '貸方金額', visible: true, format: formatAmount },
    { field: 'OpeningBal', header: '餘額', visible: true, format: formatAmount },
  ];

  //#region 下拉選單資料
  OrgIdListOptions: any[] = []; // 部門
  AccNoListOptions: any[] = []; // 科目代號
  VendorNoListOptions: any[] = []; // 廠商代號
  VouStatusListOptions: any[] = [
    { label: '作廢', value: '0' },
    { label: '建立', value: '1' },
    { label: '確認', value: '2' },
    { label: '過帳', value: '3' },
  ];
  TargetNoListOptions: any[] = []; // 對象別編號
  VouTypeListOptions: any[] = [];  // 傳票型態
  //#endregion

  constructor(
    private fin55050Service: FIN55050Service,
    private dropDownListService: DropDownListService,
    private fin55050Store: FIN55050Store,   // 注入 Store
    // private router: Router                   // 注入 Router（for detail 導頁）
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN55050', 'axxount/fin/fin55050cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
  }

  onSubmit(form: FormGroup) {
    this.handleSubmit(form, () => {
      this.fin55050Service.queryFIN55050(form.getRawValue())
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe(response => {
          // 1) 先把「完整原始 Data（含 _Details）」存進 Store
          this.fin55050Store.setResponse(response.Data);

          // -- Debug: 確認真的寫入 store 了
          console.log('[FIN55050] Store saved', {
            dataCount: response?.Data?.length ?? 0,
            vouNoIndexSize: this.fin55050Store.getVouNoSize(),
            vouNoKeysSample: this.fin55050Store.getVouNoKeys().slice(0, 5)
          });

          // 2) 列表要用的扁平化資料
          this.data = this.restructureData(response.Data);
          this.totalRecords = response.TotalCount;

          // 3) 保存查詢狀態
          this.queryStateService.setQueryState(this.ProgNo, form.getRawValue());
        });
    });
  }

  // 點「明細」按鈕（或雙擊）時呼叫，帶 vouNo 去 CRU
  override onDetail(row: GroupedFIN55050Detail) {
    const vouNo = row?.VouNo;
    if (!vouNo) { return; }
    // 這裡只帶 key，CRU 直接從 store 取
    this.router.navigate(['account/fin/fin55050cru'], { state: { vouNo } });
  }

  loadOptions() {
    // 部門
    this.dropDownListService.querySYS3100_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.OrgIdListOptions = response.Data
          .map((item: any) => ({ label: `${item.No} - ${item.Name}`, value: item.No }));
      });
    // 科目代號
    this.dropDownListService.queryGLS1005_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.AccNoListOptions = response.Data
          .map((item: any) => ({ label: `${item.No} - ${item.Name}`, value: item.No }));
      });
    // 廠商代號
    this.dropDownListService.queryPOS2013_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.VendorNoListOptions = response.Data
          .map((item: any) => ({ label: `${item.No} - ${item.Name}`, value: item.No }));
      });
  }

  restructureData(data: FIN55050Data[]): GroupedFIN55050Detail[] {
    const groupedDetails: GroupedFIN55050Detail[] = [];
    (data ?? []).forEach(item => {
      (item._Details ?? []).forEach(detail => {
        groupedDetails.push({
          ...detail,
          AccNo: item.AccNo,
          AccCName: item.AccCName,
          VouDate: item.VouDate
        });
      });
    });
    return groupedDetails;
  }

  // 匯出Excel（預留）
  exportExcelLoading = false;
  onExportExcel(event: any) {
    this.exportExcelLoading = true;
    console.log(event);
  }
}
