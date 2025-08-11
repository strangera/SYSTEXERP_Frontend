import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { apiOption, option } from '../../../shared/models/sys/sysb000.module';
import { Tls14030Service } from '../../../service/API/tls/tls14030.service';
import { Garantee_Ticket } from '../../../shared/models/tls/tls000.model';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { ReportTableGroupComponent } from '../../../shared/componentkit/report-table-group/report-table-group.component';
import { TranslateModule } from '@ngx-translate/core';

const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);

@Component({
  selector: 'app-tls14040',
  templateUrl: './tls14040.component.html',
  styleUrl: './tls14040.component.scss',
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, MultiSelectComponent, InputTextComponent, CalendarRangeQuickComponent, ButtonComponent, ReportTableGroupComponent, TranslateModule]
})

// 保證票彙總表
export class Tls14040Component extends BasicQueryPageComponent<Garantee_Ticket> implements OnInit {
  // 查詢表單：保證傳票
  queryForm = this.formBuilder.group({
    // id: [{ value: null, disabled: true }], // read only
    tlt_noList: [[]], // 專櫃編號
    tlt_name: [{ value: '', disabled: true }], // 專櫃名稱
    location_noList: [[]], // 位置

    area_noList: [[]], // 區域
    tlt_floorList: [[]], // 樓層
    bus_typeList: [[]], // 大分類

    tlt_openflagList: [[]], // 營運狀況 0閉店/撤櫃, 1=營業中, 2=合約結束, 9=核准時合約尚未開始
    org_idList: [[]], // 組織別

    contract_subno_start: [''], // 合約附號_起
    contract_subno_end: [''], // 合約附號_迄

    apply_statusList: [[]], // 申請案件狀態(1=洽談中 2=簽約中  5=已作廢)

    tlt_bdate: [yesterday], // 合約期間_起
    tlt_edate: [yesterday], // 合約期間_迄

    approve_statusList: [[]], // 審核狀態 1=未審核  2=已審核

    get_ticket_status_List: [[]], // 票據收票狀態 "0=未繳票  1=已繳票  2=已退票  9=封存"
    ticket_type_List: [[]], // 保證票型態 "1=準時開業保證票 2=施工保證票 3=契約屆滿保證票"
    ticket_kind_List: [[]], // 票據種類 非必填但有限制長度 "1=本票 2=支票 3=行銀保證函 9=其他"

    // ...createPaginationConfig([{ field: 'talent_id', order: 1 }]), // 分頁和排序參數
  });
  totalRecords = 0;// 分頁和排序參數 // 排序需要

  data: Garantee_Ticket[] = [];// 表格數據和篩選數據

  columns: any[] = [// 表格欄位定義
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '專櫃名稱', visible: true },
    { field: 'VEN_No', header: '廠商代號', visible: true },
    { field: 'VEN_Name', header: '廠商名稱', visible: true },
    { field: 'ticket_type', header: '保證票型態', visible: true },
    { field: 'tlt_bdate', header: '合約起日', visible: true },
    { field: 'tlt_edate', header: '合約迄日', visible: true },
    { field: 'levelname', header: 'TEAM別', visible: true },
    { field: 'org_name', header: '組織別', visible: true },
    { field: 'open_fees', header: '準時開業保證票', visible: true },
    { field: 'construct_fees', header: '施工保證票', visible: true },
    { field: 'expiration_fees', header: '契約屆滿保證票', visible: true },
    { field: 'remark', header: '保證票備註', visible: true },
  ];
  selectedItems: Garantee_Ticket[] = [];// 多選項目

  tlt_noListOption: apiOption[] = []; //專櫃編號列表
  locationOption: apiOption[] = []; //位置編號
  areaOption: apiOption[] = []; //區域
  floorOption: apiOption[] = []; //樓層
  bus_typeOption: apiOption[] = []; //大分類
  orgOption: apiOption[] = []; //組織

  tlt_openflagOption: option[] = [ //營業狀態
    { value: '0', label: '閉店/撤櫃' },
    { value: '1', label: '營業中' },
    { value: '2', label: '合約結束' },
    { value: '9', label: '核准時合約尚未開始' },
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
    { value: '3', label: '行銀保證函' },
    { value: '9', label: '其他' },
  ];

  constructor(
    private tls14030Service: Tls14030Service,
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS14040', '/TLS/TLS14040cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
  }
  // 提交查詢：處理表單並呼叫查詢 API
  onSubmit(frm: FormGroup): void {
    const formValue = frm.getRawValue();
    this.handleSubmit(frm, () => {
      this.tls14030Service.exportTLS14030(formValue).subscribe({
        next: (response) => {
          if (response.Status === '0000') {
            this.data = Array.isArray(response.Data) ? response.Data : [];
            this.totalRecords = response.TotalCount ?? this.data.length; // 使用安全寫法
            this.queryStateService.setQueryState(this.ProgNo, formValue);
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
          this.messageService.successBubble('選中項目刪除成功');
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

        console.log('locationOption:', this.locationOption);
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

        console.log('areaOption:', this.areaOption);
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

        console.log('floorOption:', this.floorOption);
      });

    // 大分類下拉
    this.tls14030Service
      .queryPOS2003_DropDownList({})
      .subscribe((response) => {
        this.bus_typeOption = response.Data.map((item: apiOption) => ({
          No: item.No,
          Name: item.Name,
          Label: item.No + '-' + item.Name,
        }));

        console.log('bus_typeOption:', this.bus_typeOption);
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

        console.log('orgOption:', this.orgOption);
      });

    // 專櫃編號 下拉
    this.tls14030Service
      .queryTLTTALENT_DropDownList({})
      .subscribe((response) => {
        this.tlt_noListOption = response.Data.map((item: apiOption) => ({
          No: item.No,
          Label: item.No + '-' + item.Name,
        }));

        console.log('專櫃編號:', response.Data);
      });
  }
}
