import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ASS21020Service } from '@service/api/ass/ass21020.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { Option } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { DropdownTableComponent, FieldsConfig } from '@shared/components/dropdown-table/dropdown-table.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputNumberComponent } from "@shared/components/input-number/input-number.component";
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { ReportColumn } from '@shared/components/table-report/table-report.model';
import { Column, createPaginationConfig, formatDate } from '@others/component/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { KeyFilterModule } from 'primeng/keyfilter';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { DropDownListService, IDropdownItem, TLTTALENT_TLT_SPACE } from './../../../service/utility/dropDownList.service';
import { ASS21020Data, ASS21020Delete, ASS21020Query, DeleteASS21020Key } from './ass21020.model';

@Component({
  selector: 'app-ass21020',
  templateUrl: './ass21020.component.html',
  standalone: true,
  imports: [
    AccordionModule,
    FormsModule,
    KeyFilterModule,
    PanelModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    DropdownComponent,
    InputNumberComponent,
    MenubarComponent,
    TableReportComponent,
    AsyncPipe,
    DropdownTableComponent,
    InputTextComponent
  ],
})
export class ASS21020Component extends BasicQueryPageComponent<ASS21020Data> implements OnInit {

  public readonly queryForm = this.formBuilder.group({
    EngTypes: [null],
    ENG_MeterNo: [null],
    TLT_No: [null, [Validators.maxLength(12)]],
    ENG_Rate: [null as number | null, [Validators.min(0), Validators.max(100)]],
    SYS_StoreNo: [this.authService.currentUserValue?.SYS_StoreNo ?? null],
    Mid: [this.authService.currentUserValue?.mid ?? null],
    pageSize: [30],
    pageIndex: [1],
    SortBy: [[{ field: 'ENG_Type', order: 1 }, { field: 'ENG_MeterNo', order: 1 }]]
  });
  ENG_TypeOptions = getSYS1000Options('ENG_Type');
  allENG_MeterNoOptions: Option[] = [];
  ENG_MeterNoOptions = this.dropdown.queryENG1001_ENG_MeterNo();
  TLT_NoOptions: IDropdownItem[] = [];

  data: ASS21020Data[] = [];
  selectedItems: ASS21020Data[] = [];
  totalRecords = 0;
  lastQueryBody: ASS21020Query | null = null;
  isRowSelectable = (rowData: ASS21020Data): boolean => rowData.CanDelete !== false;

  public readonly columns: ReportColumn[] = [
    { field: 'ENG_TypeDesc', header: '能源類型' },
    { field: 'ENG_MeterNo', header: '錶號' },
    { field: 'CRT_Date', header: '建立日期', format: formatDate },
    { field: 'CRT_USR_Name', header: '建立人員名稱' },
    { field: 'UPD_Date', header: '變更日期', format: formatDate },
    { field: 'UPD_USR_Name', header: '變更人員名稱' },
  ];
  public readonly extColumns: ReportColumn[] = [
    { field: 'TLT_No', header: '專櫃編號/名稱', format: (v, i, r) => `${v}${r?.TLT_Name ? '-' + r.TLT_Name : ''}` },
    { field: 'ENG_Rate', header: '面積比率(%)', format: v => `${v}%` },
  ];

  constructor(
    public readonly service: ASS21020Service,
    private readonly dropdown: DropdownApiService,
    private readonly dropDownListService: DropDownListService,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.initializePage('ASS21020', '/ass/ass21020cru', this.queryForm, this.onSubmit.bind(this));
    this.ENG_MeterNoOptions.pipe(untilDestroyed(this)).subscribe(options => {
      this.allENG_MeterNoOptions = options || [];
    });
    this.onFormValueChanged(this.tltNoOpForm.getRawValue() as unknown as Record<string, string>);
  }

  public onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const body = {
        ...frm.getRawValue(),
        TLT_No: frm.getRawValue().TLT_No?.TltNo || null,
      }
      this.service.queryASS21020(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
        this.data = res.Data;
        this.totalRecords = res.TotalCount;
        this.lastQueryBody = body;
        this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
      })
    });
  }

  public onDelete(items: ASS21020Data[]): void {
    const deleteKeys: DeleteASS21020Key[] = items.map(item => ({
      ENG_Type: item.ENG_Type,
      ENG_MeterNo: item.ENG_MeterNo
    }));
    this.messageService.confirm({
      header: '刪除確認',
      message: `確定要刪除嗎？刪除後無法恢復。`,
      accept: () => {
        this.loading = true;
        this.service.deleteASS21020({ DeleteKeys: deleteKeys } as ASS21020Delete).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
          if (res.Data.IsUpdateSuccess) {
            this.messageService.successBubble('已成功刪除選定的能源攤提設定！');
            this.selectedItems = [];
            this.onSubmit(this.queryForm);
          } else {
            this.messageService.errorBubble(res.Data.ErrorMsg);
          }
        });
      },
    });
  }

  // 1. TLT_No 相關屬性
  tltNoLoading = false;
  tltNoOpForm = this.formBuilder.group({
    TltNo: [null, [Validators.maxLength(100)]],
    ...createPaginationConfig([{ field: 'tlt_no', order: 1 }]), // 分頁和排序參數
  });
  tltNoSuggestions: TLTTALENT_TLT_SPACE[] = []; // 用於 p-autoComplete 的建議列表
  // 專櫃的 FieldsConfig
  tltNoFieldsConfig: FieldsConfig[] = [
    { field: 'TltNo', header: '專櫃編號', mainDataField: true }, // 主要輸入欄位
    { field: 'TltSpace', header: '面積' }, // 顯示在 AutoComplete 旁邊的額外資訊
  ];
  tltNoOpData: TLTTALENT_TLT_SPACE[] = []; // 用於 OverlayPanel 裡面的 Table 資料
  // OverlayPanel 裡面的 Table Columns
  tltNoOpColumns: Column[] = [
    { field: 'TltNo', header: '專櫃編號', sortField: 'tlt_no' },
    { field: 'TltName', header: '專櫃名稱', sortField: 'tlt_name' },
    { field: 'ApplyNo', header: '申請編號', sortField: 'apply_no' },
    { field: 'LocationNo', header: '位置編號', sortField: 'location_no' },
    { field: 'TltSpace', header: '面積', sortField: 'tlt_space' },
  ];

  tltNoOpTotalRecords = 0; // 總筆數 (初始為全部資料筆數)
  onAutoCompleteInputChange(event: Record<string, string>): void {
    const body = {
      ...event,
      TltNo: event['TltNo'] || '',
      pageSize: 30,
      pageIndex: 1,
      SortBy: [{ field: 'tlt_no', order: 1 }],
    }
    this.dropDownListService.queryTLTTALENT_TLT_SPACE(body).pipe(untilDestroyed(this)).subscribe((results) => {
      this.tltNoSuggestions = [...results.Data.map(item => ({
        ...item,
        label: item.TltNo + ' - ' + item.TltName + ' - ' + item.ApplyNo + ' - ' + item.LocationNo + ' (面積:' + item.TltSpace + ')',
      }))];
    });
  }

  onFormValueChanged(event: Record<string, string>): void {
    this.tltNoLoading = true;
    const body = {
      ...event,
      TltNo: event['TltNo'] || '',
      pageSize: event['pageSize'] ? Number(event['pageSize']) : 30,
      pageIndex: event['pageIndex'] ? Number(event['pageIndex']) : 1,
      SortBy: [{ field: 'tlt_no', order: 1 }],
    };
    this.dropDownListService.queryTLTTALENT_TLT_SPACE(body).pipe(untilDestroyed(this), finalize(() => this.tltNoLoading = false)).subscribe((results) => {
      this.tltNoOpData = results.Data;
      this.tltNoOpTotalRecords = results.TotalCount;
    });
  }
}
