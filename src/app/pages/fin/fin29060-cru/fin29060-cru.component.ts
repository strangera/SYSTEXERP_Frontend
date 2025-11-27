import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FIN29060Service } from '@service/api/fin/fin29060.service';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { formatDate } from '@shared/componentkit/table/table.model';
import { PanelModule } from 'primeng/panel';
import { DropDownListService } from '../../../service/utility/dropDownList.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';

// 表格資料介面
export interface FIN29060CRUData {
  AccCName: string;          // 科目中文名稱
  id: number;                // ID
  mid: number;               // Mid
  gls3001_id: number;        // GLS3001 ID
  VouNo: string;             // 傳票號碼
  CompNo: string;            // 公司編號
  SerNo: number;             // 序號
  AccDC: string;             // 借貸别
  AccNo: string;             // 科目代號
  AccAmt: number;            // 金額
  ORG_ID: string;            // 組織ID
  DetailNo: string;          // 明細編號
  SubDetailNo: string;       // 子明細編號
  ProjectNo: string;         // 專案編號
  NoteDesc: string;          // 備註說明
  PTA: string;               // PTA
  CRT_Date: string;          // 建立日期
  CRT_USR_No: string;        // 建立人員代號
  CRT_USR_Name: string;      // 建立人員姓名
  UPD_Date: string;          // 更新日期
  UPD_USR_No: string;        // 更新人員代號
  UPD_USR_Name: string;      // 更新人員姓名
}

//1.2.9.6 廠商付款明細表 CRU
@Component({
  selector: 'app-fin29060-cru',
  templateUrl: './fin29060-cru.component.html',
  standalone: true,
  imports: [PanelModule, MenubarComponent, FormsModule, ReactiveFormsModule, ButtonComponent, TableComponent, TranslateModule]
})

export class FIN29060CRUComponent extends BasicCruPageComponent<FIN29060CRUData> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    VouNo: [""],
  });

  // 表格相關屬性
  data: FIN29060CRUData[] = [];
  selectedItems: FIN29060CRUData[] = [];
  totalRecords = 0;

  // 表格欄位定義
  columns = [
    { field: 'VouNo', header: '傳票號碼', visible: true },
    { field: 'CompNo', header: '公司編號', visible: true },
    { field: 'SerNo', header: '序號', visible: true },
    { field: 'AccNo', header: '科目代號', visible: true },
    { field: 'AccCName', header: '科目名稱', visible: true },
    { field: 'AccDC', header: '借貸别', visible: true },
    { field: 'AccAmt', header: '金額', visible: true },
    { field: 'DetailNo', header: '明細編號', visible: true },
    { field: 'SubDetailNo', header: '子明細編號', visible: true },
    { field: 'ProjectNo', header: '專案編號', visible: true },
    { field: 'NoteDesc', header: '備註說明', visible: true },
    { field: 'CRT_Date', header: '建立日期', visible: true, format: formatDate },
    { field: 'CRT_USR_Name', header: '建立人員', visible: true },
    { field: 'UPD_Date', header: '更新日期', visible: true, format: formatDate },
    { field: 'UPD_USR_Name', header: '更新人員', visible: true }
  ];



  constructor(
    private DropDownListService: DropDownListService,
    private fin29060Service: FIN29060Service
  ) {
    super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('FIN29060', this.dataForm);

  }



  onSubmit(frm: FormGroup): void {
    // 表單提交邏輯
    console.log('Form submitted:', frm.value);
  }
}
