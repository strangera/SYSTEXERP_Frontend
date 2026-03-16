import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { EditorTextComponent } from '@shared/componentkit/editor-text/editor-text.component';
import { ExpandableEditTableComponent } from '@shared/componentkit/expandable-edit-table/expandable-edit-table.component';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { Tls51070Service } from '../../../service/api/tls/tls51070.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { apiOption, option } from '../../../shared/models/sys/sysb000.model';
import { CRUDStatus } from './../../../shared/models/system/CRUDstatus';

// POS2064M 收支主檔
export interface sample72050 {
  'id': string;
  'STO_No': string; // 公司編號/店號
  'HOS_No': string; // 倉庫代碼 STO_NO+HOS_NO唯一值 STO_NO+HOS_NO唯一值
  'HOS_NAME': string; // 倉庫名稱
  'org_id': string; // 組織代碼/組織名稱
  'org_name': string; // 部門名稱
  'building_no': string; // 館別代碼
  'HOS_Remark'?: string; // 備註說明

  'CRT_Date': Date;
  'CRT_USR_No': string;
  'CRT_USR_Name': string;
  'UPD_Date': Date;
  'UPD_USR_No': string;
  'UPD_USR_Name': string;

  'CanDel': boolean; //能否刪除(僅顯示)
}

// POS2064 收支明細檔
export interface POS2064 {
  id: number | null; // 明細ID，新增時為null
  type01: string; // 會計費用科目
  type02: string; // 項目摘要
  type03: string; // 組織代號
  type04: string; // 明細類別
  type05: string; // 發票格式
  type06: string; // 發票/收據號碼
  type07: string; // 發票日期
  type08: string; // 申報年月
  type09: string; // 廠商統一編號
  type10: string; // 發票用途
  type11: string; // 發票總金額
  type12: string; // 課稅別
  type13: string; // 發票未稅金額
  type14: string; // 發票稅額
  type15: string; // 扣抵代號
  type16: string; // 彙總張數
  status: string; // 狀態 (原始: 'orginal', 新增: 'new', 編輯: 'modified', 刪除: 'deleted')
}
@Component({
  selector: 'app-fin72050-cru',
  templateUrl: './fin72050-cru.component.html',
  styleUrl: './fin72050-cru.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarComponent,
    CommonModule,
    DropdownComponent,
    RadiobuttonComponent,
    EditorTextComponent,
    ExpandableEditTableComponent,
    InputTextComponent,
    InputNumberComponent,
    EditorTextComponent,
    NgFor,
    NgIf,
    ButtonComponent,
    TranslateModule,
    TableEditComponent,
    ButtonModule]
})
export class FIN72050CRUComponent extends BasicCruPageComponent<sample72050> implements OnInit {
  isRefreshing = false; // 是否是重製表單狀態(預設為false)
  orgdataForm: any;
  dataForm = this.formBuilder.group({
    id: [{ value: 0, disabled: true }], // 主鍵ID;
    Pettycashcustodian: [null], // 保管人
    applyDate: [null], // 盤點日期

  });
  // 基本資料dropdown
  Pettycashcustodian_Options: apiOption[] = [
    { No: 'PC001', Name: '保管人1', Label: 'PC001 - 保管人1' },
    { No: 'PC002', Name: '保管人2', Label: 'PC002 - 保管人2' },
    { No: 'PC003', Name: '保管人3', Label: 'PC003 - 保管人3' },
  ];

  vendorOptions: option[] = [];  //廠商編號: 資料讀 POS2013
  // ---POS2064 -------------
  POS2064Detail: POS2064[] = [];
  // ---------明細 (POS2064) 編輯表格 至少要一筆-------------------------------------------------------
  // #region POS2064定義
  // 廠商編號	下拉
  POS2064Data: POS2064[] = [];
  orgPOS2064Data: POS2064[] = []; // POS2064(備分)
  selectedPOS2064Items: POS2064[] = [];
  // 預設新項目模板
  defaultNew2064 = {
    id: 0, //新增
    type01: 'item.type01',
    type02: 'item.type02',
    type03: 'item.type03',
    type04: 'item.type04',
    type05: 'item.type05',
    type06: 'item.type06',
    type07: 'item.type07',
    type08: 'item.type08',
    type09: 'item.type09',
    type10: 'item.type10',
    type11: 'item.type11',
    type12: 'item.type12',
    type13: 'item.type13',
    type14: 'item.type14',
    type15: 'item.type15',
    type16: 'item.type16',

    status: 'new'
  };

  // POS2064 展開式表格的欄位定義
  POS2064DataColumn: EditColumn[] = []; // 等廠商編號好了再寫入POS2064欄位(廠商下拉)
  // 預設 POS2064 新項目模板 (最後進價=POS2004的標準進價PLU_OrderPrc)
  createDefaultNew2064() {
    this.defaultNew2064 = {
      id: 0,
      type01: 'item.type01',
      type02: 'item.type02',
      type03: 'item.type03',
      type04: 'item.type04',
      type05: 'item.type05',
      type06: 'item.type06',
      type07: 'item.type07',
      type08: 'item.type08',
      type09: 'item.type09',
      type10: 'item.type10',
      type11: 'item.type11',
      type12: 'item.type12',
      type13: 'item.type13',
      type14: 'item.type14',
      type15: 'item.type15',
      type16: 'item.type16',

      status: 'new'
    };
  }

  constructor(
    private tls51070Service: Tls51070Service,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('FIN72050', this.dataForm);
  }

  // #region onSubmit
  onSubmit(frm: FormGroup) {
    this.messageService.blockUi();
    this.submitted = true;

    this.handleSubmit(frm, () => {
      switch (this.crudstatus) {
        case CRUDStatus.Create:
          if (this.canAdd()) {
            console.log('讀取表單', frm);
            // this.tls51070Service.insertTLS51070(requestBody).subscribe(async (response) => {
            //   this.messageService.successBubble('POS2004主檔新增成功');

            //   const newSeqNo = response?.Data; // 回傳的 IMG_SeqNo
            //   console.log('新增取號:', newSeqNo);
            //   this.onCancel();
            // });
          }
          break;
        case CRUDStatus.Edit:
          if (this.canEdit()) {
            console.log('讀取表單', frm);
            // this.tls51070Service.updateTLS51070(requestBody).subscribe({
            //   next: async () => {
            //     // 用 this.img1001Data 裡的 IMG_SeqNo 呼叫 createImage
            //     const seqNo = this.dataForm.get('PLU_MagNo')?.value; //圖片編號抓商品管理碼
            //     this.onCancel(); // 儲存後，會返回列表
            //   }
            // });
          }
          break;
      }
    });

    this.messageService.unblockUi();
    this.submitted = false;
  }

  onClearForm() {
    this.dataForm.reset(); // 重置表單
  }
}
