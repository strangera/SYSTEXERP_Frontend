import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ASS21020Service } from '@service/api/ass/ass21020.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from "@shared/componentkit/input-number/input-number.component";
import { AccordionModule } from 'primeng/accordion';
import { KeyFilterModule } from 'primeng/keyfilter';
import { PanelModule } from 'primeng/panel';
import { ASS21020Data, ASS21020Delete, DeleteASS21020Key } from './ass21020.model';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { AsyncPipe } from '@angular/common';
import { BehaviorSubject, filter, finalize } from 'rxjs';
import { untilDestroyed } from '@ngneat/until-destroy';
import { DropdownTableComponent, FieldsConfig } from '@shared/componentkit/dropdown-table/dropdown-table.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { Option } from '@service/utility/dropdown-api.model';
import { Column } from '@shared/componentkit/table/table.model';

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
    ENG_Rate: [null, [Validators.min(0), Validators.max(100)]],
    SYS_StoreNo: [this.authService.currentUserValue?.SYS_StoreNo ?? null],
    Mid: [this.authService.currentUserValue?.mid ?? null],
    pageSize: [30],
    pageIndex: [1],
    SortBy: [[{ field: 'ENG_Type', order: 1 }, { field: 'ENG_MeterNo', order: 1 }]]
  });
  ENG_TypeOptions = getSYS1000Options('ENG_Type');
  allENG_MeterNoOptions: Option[] = [];
  ENG_MeterNoOptions = this.dropdown.queryENG1001_ENG_MeterNo();
  TLT_NoOptions = this.dropdown.queryTLTTALENT_TLT_SPACE();

  data: ASS21020Data[] = [];
  selectedItems: ASS21020Data[] = [];
  totalRecords = 0;
  lastQueryBody: any = {};

  public readonly columns: ReportColumn[] = [
    { field: 'ENG_TypeDesc', header: '能源類型' },
    { field: 'ENG_MeterNo', header: '錶號' },
    { field: 'CRT_Date', header: '建立日期' },
    { field: 'CRT_USR_Name', header: '建立人員名稱' },
    { field: 'UPD_Date', header: '變更日期' },
    { field: 'UPD_USR_Name', header: '變更人員名稱' },
  ];
  public readonly extColumns: ReportColumn[] = [
    { field: 'TLT_No', header: '專櫃編號/名稱', format: (v, i, r) => `${v}${r?.TLT_Name ? '-' + r.TLT_Name : ''}` },
    { field: 'ENG_Rate', header: '面積比率(%)', format: v => `${v}%` },
    { field: 'ENG_Remark', header: '備註' },
  ];

  constructor(
    public readonly service: ASS21020Service,
    private readonly dropdown: DropdownApiService,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.initializePage('ASS21020', '/ass/ass21020cru', this.queryForm, this.onSubmit.bind(this));
    // 取得所有專櫃資料
    this.dropdown.queryTLTTALENT_TLT_SPACE().pipe(untilDestroyed(this)).subscribe(data => {
      if (data) {
        this.tltNoDataSubject.next(data);
        this.tltNoOpTotalRecords = data.length;
        this.tltNoLoading = false;
      }
    });
    // 訂閱 tltNoDataSubject，用於初始化 opData
    this.tltNoDataSubject.pipe(filter(data => data.length > 0)).subscribe(data => {
      this.tltNoOpData = data; // 初始化 Overlay Panel Table 資料
    });
    this.ENG_MeterNoOptions.pipe(untilDestroyed(this)).subscribe(options => {
      this.allENG_MeterNoOptions = options || [];
    });
  }

  public onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      this.service.queryASS21020(frm.getRawValue()).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
        this.data = res.Data;
        this.totalRecords = res.TotalCount;
        this.lastQueryBody = frm.getRawValue();
        this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
      })
    });
  }

  public onDelete(items: ASS21020Data[]): void {
    if (!items || items.length === 0) {
      this.messageService.errorBubble('請至少選擇一筆資料進行刪除！');
      return;
    }

    // 構造新的多筆刪除 Payload
    const deleteKeys: DeleteASS21020Key[] = items.map(item => ({
      ENG_Type: item.ENG_Type,
      ENG_MeterNo: item.ENG_MeterNo
    }));

    // 組裝最終的 API Request Body
    const payload: ASS21020Delete = { DeleteKeys: deleteKeys };
    this.confirmationService.confirm({
      message: `確定要作廢合約嗎？作廢後無法恢復。`,
      accept: () => {
        this.loading = true;
        this.service.deleteASS21020(payload).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
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
  tltNoLoading = true;
  private tltNoDataSubject = new BehaviorSubject<Option[]>([]);
  tltNoSuggestions: Option[] = []; // 用於 p-autoComplete 的建議列表
  tltNoOpData: Option[] = []; // 用於 OverlayPanel 裡面的 Table 資料

  // 專櫃的 FieldsConfig
  tltNoFieldsConfig: FieldsConfig[] = [
    { field: 'TltNo', header: '專櫃編號', mainDataField: true }, // 主要輸入欄位
    { field: 'TltSpace', header: '面積' }, // 顯示在 AutoComplete 旁邊的額外資訊
  ];

  // OverlayPanel 裡面的 Table Columns
  tltNoOpColumns: Column[] = [
    { field: 'TltNo', header: '專櫃編號' },
    { field: 'TltName', header: '專櫃名稱' },
    { field: 'ApplyNo', header: '申請編號' },
    { field: 'LocationNo', header: '位置編號' },
  ];

  // 由於是前端篩選，dialogForm 只需要一個控制項用於 table 篩選
  tltNoOpForm = this.formBuilder.group({
    // 用一個控制項來處理專櫃編號/名稱的綜合篩選
    filterText: ['', [Validators.maxLength(100)]],
  });
  tltNoOpTotalRecords = 0; // 總筆數 (初始為全部資料筆數)
  onAutoCompleteInputChange(event: Record<string, string>): void {
    const inputValue = event['TltNo'].toLowerCase();
    const allData = this.tltNoDataSubject.getValue();

    if (inputValue === '') {
      this.tltNoSuggestions = [];
      return;
    }
    this.tltNoSuggestions = allData.filter(item =>
    (item['TltNo']?.toLowerCase().includes(inputValue) ||
      item['TltName']?.toLowerCase().includes(inputValue))
    ).slice(0, 10);

    this.filterTableData(inputValue);
  }

  onFormValueChanged(event: any): void {
    // 只取 filterText 的值
    const filterText = (event.filterText || '').toLowerCase();
    this.filterTableData(filterText);
  }

  // 4. 前端篩選 Table 資料的核心邏輯
  filterTableData(filterValue: string): void {
    const allData = this.tltNoDataSubject.getValue();
    if (filterValue === '') {
      this.tltNoOpData = allData;
    } else {
      this.tltNoOpData = allData.filter(item =>
        item['TltNo']?.toLowerCase().includes(filterValue) ||
        item['TltName']?.toLowerCase().includes(filterValue) ||
        item['ApplyNo']?.toLowerCase().includes(filterValue) ||
        item['LocationNo']?.toLowerCase().includes(filterValue)
      );
    }
    this.tltNoOpTotalRecords = this.tltNoOpData.length;
  }
}
