import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig, Column, formatDate } from '../../../shared/componentkit/table/table.model';
import { apiOption, option } from '../../../shared/models/sys/sysb000.module';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { Tls41050Service } from '../../../service/api/tls/tls41050.service';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';

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
    styleUrl: './tls41050.component.scss',
    standalone: true,
    imports: [MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputTextComponent,InputNumberComponent, DropdownComponent, MultiSelectComponent, TableComponent, TranslateModule]
})
export class TLS41050Component extends BasicQueryPageComponent<POS1002> implements OnInit{
  // 0715 更新 收銀機號、所屬專櫃編號 串接api 用[]送出

  // 查詢
    queryForm = this.formBuilder.group({
      // POS1002 收銀機設定檔
      ECR_NoList: [[]],              // 收銀機號
      ECR_Name: [''],              // 收銀機名稱
      ECR_Type: [''],              // 機台類型 1=集中機台(統收)、2=專櫃機台(自收)、5=離線機台(不開立業主發票、不使用業主機台)、7=它社機台(開立業主發票、不使用業主機台)
      ECR_TLT_NoList: [[]],            // 專櫃編號
      ECR_TLT_Name: [''],          // 專櫃名稱
      ECR_Status: [''],            // 收銀機狀態（A=啟用、C=停用...）
      ECR_GUI_PeriodQty: [null],   // 每期電子發票預設配號數量
      ECR_GUI_MinQty: [null],      // 電子發票最小安全存量
  
      //分頁查詢
      ...createPaginationConfig([{ field: 'ECR_No', order: 1 }]), // 分頁和排序參數
    });
    // 表格
    // ----------------------------------------------------------------
    totalRecords = 0;// 分頁和排序參數 // 排序需要
  
    ECR_Type_Option: option[] = [ // 機台類型 1=集中機台(統收)、2=專櫃機台(自收)、5=離線機台(不開立業主發票、不使用業主機台)、7=它社機台(開立業主發票、不使用業主機台)
      {value: '1', label: '集中機台(統收)'},
      {value: '2', label: '專櫃機台(自收)'},
      {value: '5', label: '離線機台(不開立業主發票、不使用業主機台)'},
      {value: '7', label: '它社機台(開立業主發票、不使用業主機台)'}
    ];

    ECR_Status_Option: option[] = [ // 收銀機狀態 A=啟用(預設值)、C=停用、S=強制停用、T=訓練
      {value: 'A', label: '啟用'},
      {value: 'C', label: '停用'},
      {value: 'S', label: '強制停用'},
      {value: 'T', label: '訓練'}
    ]

    ECR_GUI_Type_Option: option[] = [ // 發票使用類別，00=不開發票、03=二聯式收銀機發票、07=電子發票(預設值)
      {value: '00', label: '不開發票'},
      {value: '03', label: '二聯式收銀機發票'},
      {value: '07', label: '電子發票'}
    ]

    POS1002_Option: apiOption[] = []; //收銀機號
    TLTTALENT_Option: apiOption[] = []; //專櫃編號
    
    data: POS1002[] = [];
    columns: Column[] = [
      { field: 'SYS_StoreNo', header: '收銀機所屬門市店號', visible: false },
      { field: 'ECR_No', header: '收銀機號', visible: true },
      { field: 'ECR_Name', header: '收銀機名稱', visible: true },
      {
        field: 'ECR_Type', header: '機台類型', visible: true
        , format: (value: string) =>
          this.ECR_Type_Option.find((option) => option.value === value)?.label ||
          value,
      },
      { field: 'ECR_TLT_No', header: '機台所屬專櫃編號', visible: true },
      { field: 'ECR_TLT_Name', header: '機台所屬專櫃名稱', visible: true },
      { field: 'ECR_USR_No', header: '機台所屬收銀員', visible: true },
      { field: 'ECR_USR_Name', header: '機台所屬收銀員姓名', visible: true },
      { field: 'ECR_ActiveDate', header: '啟用日期', visible: true,format: formatDate  },
      { field: 'ECR_ExpireDate', header: '到期日期', visible: true,format: formatDate },
      { field: 'ECR_CloseDate', header: '停用日期', visible: true,format: formatDate },
      {
        field: 'ECR_Status', header: '收銀機狀態', visible: true
        , format: (value: string) =>
          this.ECR_Status_Option.find((option) => option.value === value)?.label ||
          value,
      },
      {
        field: 'ECR_GUI_Type', header: '發票使用類別', visible: true
        , format: (value: string) =>
          this.ECR_GUI_Type_Option.find((option) => option.value === value)?.label ||
          value,
      },
      { field: 'ECR_GUI_PeriodQty', header: '機台每期電子發票預設配號數量', visible: true },
      { field: 'ECR_GUI_MinQty', header: '機台電子發票最小安全存量', visible: true },
    ];
  
    selectedItems: POS1002[] = [];// 多選項目
  
    // ----------------------------------------------------------------
    constructor(private tls41050Service: Tls41050Service) {
      super();
    }
  
    ngOnInit(): void {
      this.initializePage('TLS41050', 'TLS/TLS41050cru', this.queryForm, (form) => this.onSubmit(form));
      this.loadOptions();
    }
  
    onSubmit(frm: FormGroup) {
      console.log('查詢條件',frm.value);
      this.handleSubmit(frm, () => {
        this.tls41050Service.queryTLS41050(frm.value).subscribe({
          next: (response) => {
            if (response.Status === '0000') {
              this.data = response.Data || [];
              console.log('Result', this.data);
              this.totalRecords = response.TotalCount || response.Data.length;
              this.queryStateService.setQueryState(this.ProgNo, frm.value);
            } else {
              console.error('API error:', response.Status, response.Message);
            }
            this.loading = false;
            this.messageService.unblockUi();
          },
          error: (err: string) => {
            console.error('API error:', err);
            this.loading = false;
            this.messageService.unblockUi();
          },
        });
      });
    }
  
    isRowSelectable(): boolean {
      // return rowData.CanDel
      return false; //不予許刪除
    }

    loadOptions(){
      // 查收銀機號
      this.tls41050Service.queryPOS1002_DropDownList({}).subscribe((response) => {
        this.POS1002_Option = response.Data.map((item: any) => ({
          No: item.No, // 收銀機號
          Label: item.No + '/' + item.Name, // 組合成顯示用的Label
        }));
        console.log('收銀機號:', this.TLTTALENT_Option);
      });
      // 查專櫃主檔
      this.tls41050Service.queryTLTTALENT_DropDownList({}).subscribe((response) => {
        this.TLTTALENT_Option = response.Data.map((item: any) => ({
          No: item.No, // 專櫃主代碼
          Label: item.No + '/' + item.Name, // 組合成顯示用的Label
        }));
        console.log('專櫃主檔代號:', this.TLTTALENT_Option);
      });
    }
}
