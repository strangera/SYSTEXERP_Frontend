import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { FieldsConfig } from '@shared/components/dropdown-table/dropdown-table.component';
import { AccordionModule } from 'primeng/accordion';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarRangeComponent } from '../../../shared/components/calendar-range/calendar-range.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { MultiSelectComponent } from '../../../shared/components/multi-select/multi-select.component';
import { TableReportComponent } from '../../../shared/components/table-report/table-report.component';
import { ReportColumn } from '../../../shared/components/table-report/table-report.model';
import { Column, createPaginationConfig, formatAmount, formatDate } from '../../../others/component/table/table.model';
import { apiOption, option } from '../../../shared/models/sys/sysb000.model';
import { Garantee_Ticket, Tls14030Service } from './../../../service/api/tls/tls14030.service';

// 保證傳票
@Component({
  selector: 'app-tls14030',
  templateUrl: './tls14030.component.html',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, MultiSelectComponent, InputTextComponent, CalendarRangeComponent, TableReportComponent, TranslateModule]
})
export class Tls14030Component extends BasicQueryPageComponent<Garantee_Ticket> implements OnInit {
  // 查詢表單：保證傳票
  queryForm = this.formBuilder.group({
    // id: [{ value: null, disabled: true }], // read only
    ven_uniformList: [[]], // 統一編號
    tlt_noList: [[]], // 專櫃編號
    test: [''], // 測試用的 control
    tlt_name: [''], // 專櫃名稱
    location_noList: [[]], // 位置

    area_noList: [[]], // 區域
    tlt_floorList: [[]], // 樓層
    bus_typeList: [[]], // 大分類

    tlt_bdate: [''], // 合約期間_起
    tlt_edate: [''], // 合約期間_迄
    org_idList: [[]], // 組織別
    tlt_openflagList: [[]], // 營運狀況 0閉店/撤櫃, 1=營業中, 2=合約結束, 9=核准時合約尚未開始

    contract_subno_start: [''], // 合約附號_起
    contract_subno_end: [''], // 合約附號_迄
    apply_statusList: [[]], // 申請案件狀態(1=洽談中 2=簽約中  5=已作廢)

    approve_statusList: [[]], // 申請狀態 1=未審核  2=已審核
    get_ticket_status_List: [[]], // 票據收票狀態 "0=未繳票  1=已繳票  2=已退票  9=封存"
    ticket_type_List: [[]], // 保證票型態 "1=準時開業保證票 2=施工保證票 3=契約屆滿"

    ticket_kind_List: [[]], // 票據種類 非必填但有限制長度 "1=本票 2=支票 3=銀行保證函 9=其他"

    pageSize: [1000],
    pageIndex: [1], // 你將初始頁碼改為 1
    SortBy: [[{ field: 'tlt_no', order: 1 }]],
  });
  lastQueryBody: any;
  totalRecords = 0;// 分頁和排序參數 // 排序需要

  data: Garantee_Ticket[] = [];// 表格數據和篩選數據
  columns: ReportColumn[] = [// 表格欄位定義
    { field: 'tlt_no', header: '專櫃編號', visible: true, align: 'left' },
    { field: 'tlt_name', header: '專櫃名稱', visible: true, align: 'left' },
    { field: 'VEN_No', header: '廠商編號', visible: true, align: 'left' },
    { field: 'VEN_Name', header: '廠商名稱', visible: true, align: 'left' },
    {
      field: 'ticket_type', header: '保證票型態', visible: true,
      format: (value: string) =>
        this.ticket_typeOption.find((option) => option.value === value)?.label ||
        value
      , align: 'left'
    },
    { field: 'ticket_no', header: '票據編號', visible: true, align: 'left' },
    {
      field: 'ticket_kind', header: '票據種類', visible: true,
      format: (value: string) =>
        this.ticket_kindOption.find((option) => option.value === value)?.label ||
        value,
      exportFormat: [
        { '1': '本票' },
        { '2': '支票' },
        { '3': '銀行保證函' },
        { '9': '其他' }
      ]
      , align: 'left'
    },
    { field: 'ticket_amount', header: '保證票金額', visible: true, format: formatAmount, align: 'right' },
    { field: 'expiry_date', header: '票據到期日期', visible: true, format: formatDate },
    {
      field: 'get_ticket_status', header: '票據收票狀態', visible: true,
      format: (value: string) =>
        this.get_ticket_statusOption.find((option) => option.value === value)?.label ||
        value
      , align: 'left'
    },
    { field: 'get_date', header: '繳票日期', visible: true, format: formatDate }, // date這邊以string呈現
    { field: 'return_date', header: '退票日期', visible: true, format: formatDate },
    { field: 'close_date', header: '封存日期', visible: true, format: formatDate },
    { field: 'ticket_remarks', header: '保證票摘要-合約主檔', visible: true, align: 'left' },
    { field: 'remark', header: '備註', visible: true, align: 'left' },
  ];
  selectedItems: Garantee_Ticket[] = [];// 多選項目

  ven_uniformOption: apiOption[] = []; // 統一編號列表
  tlt_noListOption: option[] = []; //專櫃編號列表
  tlt_no_14030_ListOption: option[] = []; // 專櫃編號列表 (TLS14030)
  locationOption: apiOption[] = []; //位置編號
  areaOption: apiOption[] = []; //區域
  floorOption: apiOption[] = []; //樓層
  bus_typeOption: apiOption[] = []; //大分類
  orgOption: apiOption[] = []; //組織

  tlt_openflagOption: option[] = [ //營業狀態
    { value: '0', label: '已撤櫃' },
    { value: '1', label: '營業中' },
    { value: '9', label: '合約未生效' },
  ];

  apply_statusOption: option[] = [ //申請案件狀態
    // 1=洽談中 2=簽約中  5=已作廢
    { value: '1', label: '洽談中' },
    { value: '2', label: '簽約中' },
    { value: '5', label: '已作廢' },
  ];

  approveOption: option[] = [ //申請狀態
    // 1=未審核  2=已審核
    { value: '1', label: '未審核' },
    { value: '2', label: '已審核' },
  ];

  get_ticket_statusOption: option[] = [ //票據收票狀態
    { value: '0', label: '未繳票' },
    { value: '1', label: '已繳票' },
    { value: '2', label: '已退票' },
    { value: '9', label: '封存' },
  ];

  ticket_typeOption: option[] = [ //保證票型態
    { value: '1', label: '準時開業保證票' },
    { value: '2', label: '施工保證票' },
    { value: '3', label: '契約屆滿保證票' },
  ];

  ticket_kindOption: option[] = [ //票據種類
    { value: '1', label: '本票' },
    { value: '2', label: '支票' },
    { value: '3', label: '銀行保證函' },
    { value: '9', label: '其他' },
  ];

  // ===================================================
  opLoading = false;
  opForm = this.formBuilder.group({
    TLT_NO: ['', [Validators.maxLength(12)]], // 專櫃編號
    ven_uniform: ['', [Validators.maxLength(12)]], // 統一編號
    ...createPaginationConfig([{ field: 'No', order: 1 }]), // 分頁和排序參數
  });
  suggestions: any[] = [];
  fieldsConfig: FieldsConfig[] = [
    { field: 'Label', header: '專櫃編號/名稱', mainDataField: true },
  ];
  opData: any[] = [];// overlayPanel 裡面的table
  opColumns: Column[] = [
    { field: 'No', header: '專櫃編號', align: 'left' },
    { field: 'Name', header: '專櫃名稱' },
    { field: 'contract_subno', header: '版次' },
  ];
  opTotalRecords = 0;

  constructor(
    public readonly tls14030Service: Tls14030Service,
    private readonly dropDownListService: DropDownListService,
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS14030', '/TLS/TLS14030cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
  }
  // 提交查詢：處理表單並呼叫查詢 API
  onSubmit(frm: FormGroup): void {
    const formValue = frm.getRawValue();
    formValue.tlt_name = '';
    console.log('14030要求', formValue);
    this.handleSubmit(frm, () => {
      this.tls14030Service.queryTLS14030(formValue).subscribe({
        next: (response) => {
          if (response.Status === '0000') {
            this.lastQueryBody = formValue;
            this.data = response.Data || [];
            this.totalRecords = response.TotalCount || response.Data.length; // 排序需要
            this.queryStateService.setQueryState(this.ProgNo, formValue);

            console.log('取得資料', this.data);
          }
          this.loading = false;
          this.messageService.unblockUi();
        },
        error: () => {
          this.loading = false;
          this.messageService.unblockUi();
        },
      });
    });
  }
  // 刪除項目
  onDelete(data: Garantee_Ticket | Garantee_Ticket[]): void {
    this.messageService.confirm({
      message: `是否確認刪除選中的保證票?`,
      header: `確認刪除`,
      accept: () => {
        const items = Array.isArray(data) ? data : [data];
        if (items.length === 0) return;

        const idList = items
          .filter(item => item && item.id != null)
          .map(item => item.id);

        if (idList.length === 0) {
          this.messageService.warnBubble('未找到有效的刪除項目');
          return;
        }

        this.tls14030Service.deleteTLS14030({ idList }).subscribe({
          next: (response) => {
            if (response.Status === '0000') {
              this.messageService.successBubble('刪除成功');
            } else {
              console.error('API error:', response.Status, response.Message);
              this.messageService.errorBubble(`刪除失敗: ${response.Message}`);
            }
          },
          error: (err: string) => {
            console.error('API error:', err);
            this.messageService.errorBubble('刪除失敗');
          },
          complete: () => {
            this.onSubmit(this.queryForm); // 刷新資料
          },
        });

        this.selectedItems = [];
      },
    });
  }


  isRowSelectable(rowData: Garantee_Ticket): boolean {
    return rowData.CanDel
  }

  loadOptions() {
    // 部門下拉
    this.tls14030Service
      .queryPOS2002_DropDownList({})
      .subscribe((response) => {
        this.locationOption = response.Data.map((item: apiOption) => ({
          No: item.No,
          Name: item.Name,
          Label: item.No + '-' + item.Name,
        }));

        // console.log('locationOption:', this.locationOption);
      });

    // 區域下拉
    this.tls14030Service
      .querySYS3A00_DropDownList({})
      .subscribe((response) => {
        this.areaOption = response.Data.map((item: apiOption) => ({
          No: item.No,
          Name: item.Name,
          Label: item.No + '-' + item.Name,
        }));

        // console.log('areaOption:', this.areaOption);
      });

    // 樓層下拉
    this.tls14030Service
      .querySYS3900_DropDownList({})
      .subscribe((response) => {
        this.floorOption = response.Data.map((item: apiOption) => ({
          No: item.No,
          Name: item.Name,
          Label: item.No + '-' + item.Name,
        }));

        // console.log('floorOption:', this.floorOption);
      });

    // 大分類下拉
    this.tls14030Service
      .queryTLTBUSTYPE_DropDownList({})
      .subscribe((response) => {
        this.bus_typeOption = response.Data.map((item: apiOption) => ({
          No: item.No,
          Name: item.Name,
          Label: item.No + '-' + item.Name,
        }));

        // console.log('bus_typeOption:', this.bus_typeOption);
      });

    // 組織 下拉
    this.tls14030Service
      .querySYS3100_DropDownList({})
      .subscribe((response) => {
        this.orgOption = response.Data.map((item: apiOption) => ({
          No: item.No,
          Name: item.Name,
          Label: item.No + '-' + item.Name,
        }));

        // console.log('orgOption:', this.orgOption);
      });

    // 專櫃編號 下拉
    this.tls14030Service
      .queryTLTTALENT_DropDownList({})
      .subscribe((response) => {
        this.tlt_noListOption = response.Data.map((item: apiOption) => ({
          No: item.No,
          Label: item.No + '-' + item.Name,
        }));

        // console.log('專櫃編號:', response.Data);
      });
    //統一編號 下拉
    this.dropDownListService.queryPOS2013_DropDownList({}).subscribe((response) => {
      //去除掉重複的統一編號，並且加上 Label 欄位
      this.ven_uniformOption = response.Data
        .filter((item: apiOption, index: number, self: apiOption[]) => {
          return index === self.findIndex((t) => t.No === item.No);
        })
        .map((item: apiOption) => ({
          No: item.No,
          Name: item.Name,
          Label: item.No + '-' + item.Name,
        }));
      // console.log('統一編號:', response.Data);
    });
  }

  onAutoCompleteInputChange(event: any) {
    const body = {
      ...event,
      TLT_NO: '',
      ven_uniform: '',
      pageSize: 30,
      pageIndex: 1,
      SortBy: [{ field: 'TLT_NO', order: 1 }],
    }
    this.tls14030Service.queryTalentDropDown(body).pipe(untilDestroyed(this)).subscribe((results) => {
      // 關鍵修正：將資料加工處理，加上 Label 欄位
      this.suggestions = results.Data.map((item: any) => ({
        ...item,
        // 假設 API 回傳編號為 No, 名稱為 Name，組合成您要的 Label
        Label: `${item.No}-${item.Name}`
      }));
    });
  }
  onformValueChanged(event: any) {
    this.opLoading = true;
    const body = {
      TLT_NO: event.TLT_NO || '',
      ven_uniform: event.ven_uniform || '',
    };
    this.tls14030Service.queryTalentDropDown(body).pipe(untilDestroyed(this)).subscribe((results) => {
      this.opData = [...results.Data]; // 更新data資料
      this.opTotalRecords = results.TotalCount;
      this.opLoading = false;
    });
  }
}
