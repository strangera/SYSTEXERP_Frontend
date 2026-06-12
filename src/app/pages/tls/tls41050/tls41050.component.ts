import { AsyncPipe, NgStyle } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { formatAmount } from '@shared/componentkit/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { concatMap, finalize, from } from 'rxjs';
import { Tls41050Service } from '../../../service/api/tls/tls41050.service';
import { getSYS1000 } from '../../../service/system/sys1000.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { TableReportComponent } from '../../../shared/componentkit/table-report/table-report.component';
import { Column, formatDate } from '../../../shared/componentkit/table/table.model';
import { apiOption } from '../../../shared/models/sys/sysb000.model';
export interface POS1002 {
  ID: number; // decimal(19,0)

  SYS_StoreNo: string; // 門市店號
  ECR_No: string;      // 收銀機號
  ECR_Name: string;    // 收銀機名稱
  ECR_Type: string;    // 機台類型（1=集中、2=專櫃、5=離線、7=它社）

  ECR_TLT_No?: string;     // 所屬專櫃編號（可選）
  ECR_TLT_Name?: string;   // 所屬專櫃名稱（可選）
  ECR_USR_No?: string;     // 所屬收銀員（可選）
  ECR_USR_Name?: string;   // 收銀員姓名（可選）

  ECR_ActiveDate?: Date;   // 啟用日期（可選）
  ECR_ExpireDate?: Date;   // 到期日期（可選）
  ECR_CloseDate?: Date;    // 停用日期（可選）

  ECR_Status?: string;     // 狀態：A=啟用、C=停用、S=強制停用、T=訓練（可選）
  ECR_GUI_Type: string;    // 發票使用類別：00/03/07

  ECR_GUI_PeriodQty?: number; // 每期電子發票配號數量（可選）
  ECR_GUI_MinQty?: number;    // 最小安全存量（可選）

  CRT_Date?: Date;        // 建立日期（可選）
  CRT_USR_No?: string;    // 建立人員（可選）
  CRT_USR_Name?: string;  // 建立人員姓名（可選）

  UPD_Date?: Date;        // 變更日期（可選）
  UPD_USR_No?: string;    // 變更人員（可選）
  UPD_USR_Name?: string;  // 變更人員姓名（可選）
}

// 2.4.1.5 發票訊息維護作業
@Component({
  selector: 'app-tls41050',
  templateUrl: './tls41050.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputNumberComponent,
    DropdownComponent,
    MultiSelectComponent,
    TableReportComponent,
    TranslateModule,
    ButtonModule,
    NgStyle,
    AsyncPipe,
    TooltipModule
  ]
})
export class TLS41050Component extends BasicQueryPageComponent<POS1002> implements OnInit {
  private readonly dropDown = inject(DropdownApiService);
  queryForm = this.formBuilder.group({
    // POS1002 收銀機設定檔
    ECR_NoList: [[]],              // 收銀機號
    ECR_Name: [null],              // 收銀機名稱
    ECR_Type: [null],              // 機台類型 1=集中機台(統收)、2=專櫃機台(自收)、5=離線機台(不開立業主發票、不使用業主機台)、7=它社機台(開立業主發票、不使用業主機台)
    ECR_TLT_NoList: [[]],            // 專櫃編號
    ECR_TLT_Name: [null],          // 專櫃名稱
    ECR_Status: ['A'],            // 收銀機狀態（A=啟用、C=停用...）
    ECR_GUI_PeriodQty: [null],   // 每期電子發票預設配號數量
    ECR_GUI_MinQty: [null],      // 電子發票最小安全存量
    pageSize: [500],
    pageIndex: [1], // 你將初始頁碼改為 1
    SortBy: [[{ field: 'ECR_No', order: 1 }]],
  });
  // 表格
  // ----------------------------------------------------------------
  totalRecords = 0;// 分頁和排序參數 // 排序需要

  typeOptions = getSYS1000Options('ECR_Type');
  statusOptions = getSYS1000Options('ECR_Status');
  guiTypeOptions = getSYS1000Options('ECR_GUI_Type');

  POS1002_Option: apiOption[] = []; //收銀機號
  TLTTALENT_Option: apiOption[] = []; //專櫃編號
  ECR_NoListOptions = this.dropDown.queryPos1002Filtered();
  data: POS1002[] = [];
  columns: Column[] = [
    { field: 'ECR_No', header: '收銀機號' },
    { field: 'ECR_Name', header: '收銀機名稱' },
    { field: 'ECR_Type', header: '機台類型', format: (value) => getSYS1000('ECR_Type', value) },
    { field: 'ECR_TLT_No', header: '專櫃編號' },
    { field: 'ECR_TLT_Name', header: '櫃位名稱' },
    { field: 'ECR_USR_No', header: '收銀員' },
    { field: 'ECR_USR_Name', header: '收銀員姓名' },
    { field: 'ECR_ActiveDate', header: '啟用日期', format: formatDate },
    { field: 'ECR_ExpireDate', header: '到期日期', format: formatDate },
    { field: 'ECR_CloseDate', header: '停用日期', format: formatDate },
    { field: 'ECR_Status', header: '收銀機狀態', format: (value) => getSYS1000('ECR_Status', value) },
    { field: 'ECR_GUI_Type', header: '發票類別', format: (value) => getSYS1000('ECR_GUI_Type', value) },
    { field: 'ECR_GUI_PeriodQty', header: '發票預設配號數量', format: formatAmount },
    { field: 'ECR_GUI_MinQty', header: '發票安全存量', format: formatAmount },
  ];

  selectedItems: POS1002[] = [];// 多選項目
  lastQueryBody: Record<string, unknown> | null = null; // 給 app-table-report 使用
  queryTLS41050ForReport = (body: Record<string, unknown>) => this.tls41050Service.queryTLS41050(body);
  constructor(
    public readonly tls41050Service: Tls41050Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS41050', 'TLS/TLS41050cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body = frm.value;
      this.tls41050Service.queryTLS41050(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(response => {
        this.lastQueryBody = body;
        this.data = response.Data || [];
        this.totalRecords = response.TotalCount || response.Data.length;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      });
    });
  }

  isRowSelectable(): boolean { return true; }

  loadOptions() {
    this.tls41050Service.queryPOS1002_DropDownList({}).pipe(untilDestroyed(this)).subscribe((response) => {
      this.POS1002_Option = response.Data.map((item: any) => ({
        No: item.No, // 收銀機號
        Label: item.No + '-' + item.Name, // 組合成顯示用的Label
      }));
    });
    // 查專櫃主檔
    this.tls41050Service.queryTLTTALENT_DropDownList({}).pipe(untilDestroyed(this)).subscribe((response) => {
      this.TLTTALENT_Option = response.Data.map((item: any) => ({
        No: item.No, // 專櫃主代碼
        Label: item.No + '-' + item.Name, // 組合成顯示用的Label
      }));
    });
  }
  //---0731規格更新(EXP_DataFlag 刪除基本不會用到)---
  //下傳
  btnLoading = false;
  onUpload() {
    const storeNo = this.authService.getUserInfo()?.SYS_StoreNo ?? '';
    const items = this.selectedItems;
    if (!items.length) return;

    this.btnLoading = true;

    from(items).pipe(
      concatMap((item) => {
        const params = {
          SYS_StoreNo: storeNo,
          EXP_StoreNo: storeNo,
          EXP_Type: "POS1002",
          EXP_DocNo: storeNo + ";" + item.ECR_No,
          EXP_DataFlag: "S2P",
          EXP_Desc: ""
        };
        return this.tls41050Service.execSpFunc(params);
      }),
      finalize(() => this.btnLoading = false),
      untilDestroyed(this)
    ).subscribe(() => {
      this.messageService.successBubble('異動檔下傳成功');
      this.selectedItems = [];
      this.onSubmit(this.queryForm);
    });
  }
}
