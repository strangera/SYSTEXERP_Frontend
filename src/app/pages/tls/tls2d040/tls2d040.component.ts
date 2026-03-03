import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { QueryTLS2D040Request, TLS2D040Service } from '@service/api/tls/tls2-d040.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { CustomFooterTableComponent } from '@shared/componentkit/custom-footer-table/customFooterTable.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { Column, createPaginationConfig, formatAmount } from '@shared/componentkit/table/table.model';
import { saveAs } from 'file-saver';
import { AccordionModule } from 'primeng/accordion';
import { SortMeta } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';

interface TLS2D040FormValue {
  tlt_no: string[];
  source_type: string[];
  CAP_Item: string[];
  AccNo: string[];
  tpy_bdate: Date | null;
  tpy_edate: Date | null;
  VEN_No: string | null;
  pod_no: string | null;
  GUI_FLAG: string | null;
  org_id: string[];
  close_flag: string;
  bus_type: string[];
  store_way: string | null;
  building_no: string[];
  FLOOR_NO: string[];
  status: string;
  report_type: string;
  ShowNeg1: boolean;
  ShowNeg2: boolean;
  pageSize: number;
  pageIndex: number;
  SortBy: SortMeta[];
}
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
    MultiSelectComponent,
    TranslateModule,
    CalendarRangeComponent,
    DropdownComponent,
    RadiobuttonComponent,
    CommonModule,
    CheckboxModule,
    CustomFooterTableComponent,
    ButtonModule
  ]
})
export class TLS2D040Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    tlt_no: [[]],             // 專櫃編號
    source_type: [[]],        // 扣款來源
    CAP_Item: [[]],           // 扣款代碼
    AccNo: [[]],              // 會計科目
    tpy_bdate: [new Date(), Validators.required],          // 扣款年月(起)
    tpy_edate: [new Date(), Validators.required],          // 扣款年月(訖)
    VEN_No: [null],             // 廠商編號
    pod_no: [null],             // 活動代碼/名稱
    GUI_FLAG: [null],           // 開立發票
    org_id: [[]],             // 組織代碼
    close_flag: ['Y'],         // 類型 (統一都預設給後端 'Y'【結算】)
    bus_type: [[]],           // 大分類代碼
    store_way: [null],          // 專櫃/自營櫃
    building_no: [[]],        // 館別
    FLOOR_NO: [[]],           // 樓層
    status: ['0'],            // 狀況 (明細/彙總)
    report_type: ['0'],      // 彙總報表類型
    ShowNeg1: [false],          // 只顯示負值(只適用於專櫃統計)
    ShowNeg2: [false],          // 只顯示當月應收為負值
    ...createPaginationConfig([])
  });

  data: any[] = [];
  selectedItems: any[] = [];
  totalRecords = 0;
  footerData: any[] = [];

  //#region 下拉選單資料
  // 專櫃編號
  tltNoOptions: any[] = [];
  // 扣款來源
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
  // 狀況
  statusOptions: any[] = [
    { label: '明細', value: '0' },
    { label: '彙總', value: '1' },
  ];
  // 彙總報表類型
  reportTypeOptions: any[] =
    [
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
  btnLoading = false;
  btnLoading2 = false;
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
    this.setColumns('detail');

    //當勾選「只顯示負值」時，自動設定狀況與類型
    this.queryForm.get('ShowNeg1')?.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe((checked) => {
        if (checked) {
          this.queryForm.patchValue({
            status: '1',      // 彙總
            report_type: '0'  // 依專櫃
          }, { emitEvent: false });
        }
      });
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
    this.dropDownListService.queryTLTBUSTYPE_DropDownList()
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
        this.VenNoOptions = response.Data.map((item: any) => ({ Name: `${item.VEN_No}-${item.Name}`, No: item.VEN_No }));
      });
  }

  onSubmit(form: FormGroup) {
    this.handleSubmit(form, () => {
      const payload = {
        ...form.getRawValue(),
        tpy_bdate: form.value.tpy_bdate ? this.datepipe.transform(form.value.tpy_bdate, 'yyyyMM') : '',
        tpy_edate: form.value.tpy_edate ? this.datepipe.transform(form.value.tpy_edate, 'yyyyMM') : '',
        ShowNeg: (form.value.status === '1' && form.value.report_type === '0') ? form.value.ShowNeg1 : form.value.ShowNeg2,
      }

      // 明細查詢
      if (form.value.status === '0') {
        this.tls2d040Service.queryTLS2D040_Detail(payload)
          .pipe(untilDestroyed(this), finalize(() => this.loading = false))
          .subscribe(response => {
            this.setColumns('detail');
            this.data = response.Data.mainData;
            this.footerData = response.Data.totalData.map((item: any) => ({
              group_name: item.group_name,
              tpy_namt: item.total_Amt
            }));
            this.totalRecords = response.TotalCount;
            this.queryStateService.setQueryState(this.ProgNo, form.getRawValue());
          });
      }
      // 彙總查詢
      else {
        switch (form.value.report_type) {
          // 依專櫃
          case '0':
            this.tls2d040Service.queryTLS2D040_TLT(payload)
              .pipe(untilDestroyed(this), finalize(() => this.loading = false))
              .subscribe(response => {
                this.setColumns('0');
                this.data = response.Data.mainData;
                this.footerData = response.Data.totalData.map((item: any) => ({
                  group_name: item.group_name,
                  tpy_amt: item.total_Amt
                }));
                this.totalRecords = response.TotalCount;
                this.queryStateService.setQueryState(this.ProgNo, form.getRawValue());
              });
            break;
          // 依扣款項目
          case '1':
            this.tls2d040Service.queryTLS2D040_ChargeItem(payload)
              .pipe(untilDestroyed(this), finalize(() => this.loading = false))
              .subscribe(response => {
                this.setColumns('1');
                this.data = response.Data.mainData;
                this.footerData = response.Data.totalData.map((item: any) => ({
                  group_name: item.group_name,
                  tpy_amt: item.total_Amt
                }));
                this.totalRecords = response.TotalCount;
                this.queryStateService.setQueryState(this.ProgNo, form.getRawValue());
              });
            break;
          // 依部門
          case '2':
            this.tls2d040Service.queryTLS2D040_Department(payload)
              .pipe(untilDestroyed(this), finalize(() => this.loading = false))
              .subscribe(response => {
                this.setColumns('2');
                this.data = response.Data.mainData;
                this.footerData = response.Data.totalData.map((item: any) => ({
                  group_name: item.group_name,
                  tpy_amt: item.total_Amt
                }));
                this.totalRecords = response.TotalCount;
                this.queryStateService.setQueryState(this.ProgNo, form.getRawValue());
              }
              );
            break;
          // 依會計科目
          case '3':
            this.tls2d040Service.queryTLS2D040_Acct(payload)
              .pipe(untilDestroyed(this), finalize(() => this.loading = false))
              .subscribe(response => {
                this.setColumns('3');
                this.data = response.Data.mainData;
                this.footerData = response.Data.totalData.map((item: any) => ({
                  group_name: item.group_name,
                  tpy_amt: item.total_Amt
                }));
                this.totalRecords = response.TotalCount;
                this.queryStateService.setQueryState(this.ProgNo, form.getRawValue());
              });
            break;
        }
      }
    });
  }

  // 根據 report_type 設定不同的欄位
  setColumns(report_type: string) {
    switch (report_type) {
      case '0': // 依專櫃
        this.columns = [
          { field: 'tlt_no', header: '專櫃編號' },
          { field: 'tlt_name', header: '專櫃名稱' },
          { field: 'contract_subno', header: '版次' },
          { field: 'ven_no', header: '廠商編號' },
          { field: 'VEN_Name', header: '廠商名稱' },
          { field: 'sam_yyymm', header: '扣款年月' },
          { field: 'GUI_FLAG', header: '是否開立發票' },
          { field: 'tpy_amt', header: '扣款金額(含稅)', format: formatAmount, isTotal: true }
        ];
        break;
      case '1': // 依扣款項目
        this.columns = [
          { field: 'CAP_Item', header: '扣款代碼' },
          { field: 'CAP_Name', header: '扣款名稱' },
          { field: 'sam_yyymm', header: '扣款年月' },
          { field: 'GUI_FLAG', header: '是否開立發票' },
          { field: 'tpy_amt', header: '扣款金額(含稅)', format: formatAmount, isTotal: true }
        ];
        break;
      case '2': // 依部門
        this.columns = [
          { field: 'CAP_Item', header: '扣款代碼' },
          { field: 'CAP_Name', header: '扣款名稱' },
          { field: 'org_id', header: '組織代碼' },
          { field: 'Org_Name', header: '組織名稱' },
          { field: 'sam_yyymm', header: '扣款年月' },
          { field: 'GUI_FLAG', header: '是否開立發票' },
          { field: 'tpy_amt', header: '扣款金額(含稅)', format: formatAmount, isTotal: true }
        ];
        break;
      case '3': // 依會計科目
        this.columns = [
          { field: 'CAP_Item', header: '扣款代碼' },
          { field: 'CAP_Name', header: '扣款名稱' },
          { field: 'AccNo', header: '會計科目' },
          { field: 'AccCName', header: '科目中文名稱' },
          { field: 'sam_yyymm', header: '扣款年月' },
          { field: 'GUI_FLAG', header: '是否開立發票' },
          { field: 'tpy_amt', header: '扣款金額(含稅)', format: formatAmount, isTotal: true }
        ];
        break;
      case 'detail': // 明細
        this.columns = [
          { field: 'tlt_no', header: '專櫃編號' },
          { field: 'tlt_name', header: '專櫃名稱' },
          { field: 'contract_subno', header: '版次' },
          { field: 'source_type', header: '扣款來源', format: (value: any) => this.sourceTypeOptions.find(item => item.No === value)?.Name || value },
          { field: 'CAP_Item', header: '扣款代碼' },
          { field: 'CAP_Name', header: '扣款名稱' },
          { field: 'org_id', header: '組織代碼' },
          { field: 'pod_no', header: '活動代碼' },
          { field: 'AccNo', header: '會計科目' },
          { field: 'sam_yyymm', header: '扣款年月' },
          { field: 'GUI_FLAG', header: '是否開立發票' },
          { field: 'tpy_namt', header: '扣款金額(未稅)', format: formatAmount, isTotal: true },
          { field: 'remarks', header: '備註' }
        ];
        break;
    }
  }

  private buildExportPayload(): QueryTLS2D040Request & { OrderBy?: string; Offset?: number } {
    const raw = this.queryForm.getRawValue() as unknown as TLS2D040FormValue;

    const toArray = (val: string[] | undefined): string[] =>
      Array.isArray(val) ? val.filter(v => v !== '') : [];

    return {
      PageSize: 999999,
      PageIndex: 0,
      OrderBy: '',
      Offset: 0,
      SortBy: raw.SortBy ?? [],
      tlt_no: toArray(raw.tlt_no),
      source_type: toArray(raw.source_type),
      CAP_Item: toArray(raw.CAP_Item),
      AccNo: toArray(raw.AccNo),
      tpy_bdate: raw.tpy_bdate ? this.datepipe.transform(raw.tpy_bdate, 'yyyyMM') ?? '' : '',
      tpy_edate: raw.tpy_edate ? this.datepipe.transform(raw.tpy_edate, 'yyyyMM') ?? '' : '',
      VEN_No: raw.VEN_No ?? '',
      pod_no: raw.pod_no ?? '',
      GUI_FLAG: raw.GUI_FLAG ?? '',
      org_id: toArray(raw.org_id),
      close_flag: raw.close_flag ?? '',
      bus_type: toArray(raw.bus_type),
      store_way: raw.store_way ?? '',
      building_no: toArray(raw.building_no),
      FLOOR_NO: toArray(raw.FLOOR_NO),
      ShowNeg: raw.status === '1' && raw.report_type === '0' ? !!raw.ShowNeg1 : !!raw.ShowNeg2,
    };
  }

  onExportExcel(): void {
    if (!this.data || this.data.length === 0) {
      return;
    }

    const formValue = this.queryForm.value;
    const payload = this.buildExportPayload();

    this.btnLoading2 = true;

    let exportRequest$;

    if (formValue.status === '0') {
      // 明細匯出
      exportRequest$ = this.tls2d040Service.exportTLS2D040_Detail(payload);
    } else {
      // 彙總匯出，依 report_type 決定 API
      switch (formValue.report_type) {
        case '0':
          exportRequest$ = this.tls2d040Service.exportTLS2D040_TLT_Summary(payload);
          break;
        case '1':
          exportRequest$ = this.tls2d040Service.exportTLS2D040_ChargeItem_Summary(payload);
          break;
        case '2':
          exportRequest$ = this.tls2d040Service.exportTLS2D040_Department_Summary(payload);
          break;
        case '3':
          exportRequest$ = this.tls2d040Service.exportTLS2D040_Acct_Summary(payload);
          break;
        default:
          this.btnLoading2 = false;
          return;
      }
    }

    exportRequest$
      .pipe(untilDestroyed(this), finalize(() => this.btnLoading2 = false))
      .subscribe({
        next: (blob: Blob) => {
          if (!blob || blob.size === 0) {
            this.messageService?.warnBubble?.('沒有找到符合條件的資料，無法生成報表。');
            return;
          }
          saveAs(blob, '專櫃代扣款明細表.xlsx');
        }
      });
  }

  onExportPDF(): void {
    if (!this.data || this.data.length === 0) {
      return;
    }

    const formValue = this.queryForm.value;
    const payload = this.buildExportPayload();

    this.btnLoading = true;

    let exportRequest$;

    if (formValue.status === '0') {
      // 明細匯出
      exportRequest$ = this.tls2d040Service.exportTLS2D040PDF_Detail(payload);
    } else {
      // 彙總匯出，依 report_type 決定 API
      switch (formValue.report_type) {
        case '0':
          exportRequest$ = this.tls2d040Service.exportTLS2D040_TLT_SummaryPDF(payload);
          break;
        case '1':
          exportRequest$ = this.tls2d040Service.exportTLS2D040_ChargeItem_SummaryPDF(payload);
          break;
        case '2':
          exportRequest$ = this.tls2d040Service.exportTLS2D040_Department_SummaryPDF(payload);
          break;
        case '3':
          exportRequest$ = this.tls2d040Service.exportTLS2D040_Acct_SummaryPDF(payload);
          break;
        default:
          this.btnLoading = false;
          return;
      }
    }

    exportRequest$
      .pipe(untilDestroyed(this), finalize(() => this.btnLoading = false))
      .subscribe({
        next: (blob: Blob) => {
          if (!blob || blob.size === 0) {
            this.messageService?.warnBubble?.('沒有找到符合條件的資料，無法生成報表。');
            return;
          }
          saveAs(blob, '專櫃代扣款明細表.pdf');
        }
      });
  }
}
