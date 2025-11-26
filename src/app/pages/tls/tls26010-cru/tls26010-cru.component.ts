import { TLS26010Service } from '@service/api/tls/tls26010.service';
import { ValidationService } from './../../../shared/service/validation.service';
// --Commonly used imports--
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, OnInit, ViewChild, } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PanelModule } from 'primeng/panel';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { EditorTextComponent } from '../../../shared/componentkit/editor-text/editor-text.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';


import { untilDestroyed } from '@ngneat/until-destroy';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Tls12010Service } from '../../../service/api/tls/tls12010.service';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { ExpandableEditTableComponent } from '../../../shared/componentkit/expandable-edit-table/expandable-edit-table.component';
import { apiOption } from '../../../shared/models/sys/sysb000.model';

export interface tls26010response {
  // TALPORDERM
  id: number; // 主鍵，自動編號

  pod_no: string; // 預售編號(readonly)
  pod_desc: string; // 預售名稱
  pod_sdate: Date; // 預售期間-起日
  pod_edate: Date; // 預售期間-迄日
  pod_status: string; // 核准狀態(readonly)
  approved_usr_name?: string; // 核准人員(readonly)
  approved_date?: Date; // 核准日期
  CanDelete?: number;
  CanEdit?: number;
}

// 明細檔
export interface tls26010response {
  pod_info: pod_info;
  ecr_list: ecr_list[];
  talent_list: talent_list[];
  status: string; // 狀態 (原始: 'orginal', 新增: 'new', 編輯: 'modified', 刪除: 'deleted')
}

export interface pod_info {
  id: number;
  mid: number;
  pod_no: string,
  pod_desc: string,
  pod_sdate: Date,
  pod_edate: Date,
  pod_status: string; // 狀態 (原始: 'orginal', 新增: 'new', 編輯: 'modified', 刪除: 'deleted')
}

export interface ecr_list {
  id: number,
  ECR_No: string,
  ECR_Name: string,
  tlt_no: string | null,
  tlt_name: string | null
  status?: string  // 加上可選屬性
}

export interface talent_list {
  id: number,
  tlt_no: string,
  tlt_name: string
}

// 預購活動檔期設定
@Component({
  selector: 'app-tls26010-cru',
  templateUrl: './tls26010-cru.component.html',
  styleUrl: './tls26010-cru.component.scss',
  standalone: true,
  imports: [
    TableComponent,
    TableEditComponent,
    TranslateModule,
    MenubarComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarComponent,
    CalendarRangeComponent,
    CommonModule,
    DropdownComponent,
    RadiobuttonComponent,
    EditorTextComponent,
    ExpandableEditTableComponent,
    InputTextComponent,
    InputNumberComponent,
    EditorTextComponent,
    NgFor,
    ButtonComponent,
    NgIf
  ]

})
export class TLS26010CRUComponent extends BasicCruPageComponent<tls26010response> implements OnInit {
  @ViewChild('ecrTable') ecrTable!: ExpandableEditTableComponent;
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    // TALPORDERM
    id: [{ value: null, disabled: true }], // 主鍵，自動編號
    pod_no: [''], // 預售編號(readonly)
    pod_desc: [''], // 預售名稱
    pod_sdate: [null], // 預售期間-起日
    pod_edate: [null], // 預售期間-迄日
    pod_status: [''], // 核准狀態(readonly)
    approved_usr_name: [''], // 核准人員(readonly)
    approved_date: [null], // 核准日期核准日期
    CanDelete: [],
    CanEdit: []
  });

  // #region 收銀機明細
  //----------------------------------------------------------------
  ecrData: ecr_list[] = [];
  orgEcrData: ecr_list[] = []; // ecr_list(備分)
  selectedECRItems: ecr_list[] = [];
  ecrLoading = false;
  // 預設新項目模板
  defaultNewECR = {
    id: 0, //新增
    ECR_No: '',
    ECR_Name: '',
    tlt_no: '',
    tlt_name: '',

    status: 'new'
  };

  // POS2020 展開式表格的欄位定義
  ecrColumn: EditColumn[] = [
    { field: 'ECR_No', header: '收銀機編號', type: 'input', width: '12rem' },
    { field: 'ECR_Name', header: '收銀機名稱', type: 'input', width: '12rem' }
  ];
  createDefaultNewECR() {
    this.defaultNewECR = {
      id: 0, //新增
      ECR_No: '',
      ECR_Name: '',
      tlt_no: '',
      tlt_name: '',

      status: 'new'
    };
  }
  //----------------------------------------------------------------

  contact_USR_Option: apiOption[] = [];  // 接洽人員代碼/名稱
  // ----------------------------------------------------------------
  constructor(
    private validationService: ValidationService,
    private tls12010Service: Tls12010Service,
    private tLS26010Service: TLS26010Service) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('TLS26010', this.dataForm);
    this.loadOptions();

    const pod_no = this.dataForm.get('pod_no')?.value;
    if (pod_no) {
      this.loadDetailData(pod_no);
    } else {
      if (this.crudstatus != CRUDStatus.Create)
        console.warn('無法讀取明細資料');
    }
  }

  onSubmit(frm: FormGroup) {
    this.messageService.blockUi();
    this.submitted = true;

    if (this.dataForm.invalid) {
      this.messageService.unblockUi();
      return;
    }

    const formValue = frm.getRawValue();
    const body = {
      ...formValue,
      // Detail: processedDetail, // 將明細資料加入請求體
    }
    switch (this.crudstatus) {
      case CRUDStatus.Create:
        if (this.canAdd()) {
          console.log('insert:', JSON.stringify(body, null, 2));
          console.log('detail', this.ecrData);
          // this.tls12010Service.insertTLS12010(body).pipe(untilDestroyed(this)).subscribe(() => {
          //   this.messageService.successBubble('新增成功');
          //   // this.onCancel(); // 儲存後，會清除資料留在原頁面，不返回列表
          //   this.dataForm.reset(); // 重置表單
          //   this.potentialDetail = []; // 清除明細
          // });
        }
        break;
      case CRUDStatus.Edit:
        if (this.canEdit()) {
          console.log('update:', JSON.stringify(body, null, 2));
          console.log('detail', this.ecrData);
          // this.tls12010Service.updateTLS12010(body).pipe(untilDestroyed(this)).subscribe(() => {
          //   this.messageService.successBubble('更新成功');
          //   this.onCancel(); // 儲存後，會返回列表
          // });
        }
        break;
    }

    this.messageService.unblockUi();
    this.submitted = false;
  }
  // 讀取dopropdown選項
  loadOptions() {
    // 查詢 接待人員
    this.tls12010Service.queryTBLUSER_DropDownList({}).pipe(untilDestroyed(this)).subscribe((response) => {
      this.contact_USR_Option = response.Data.map((item: any) => ({
        No: item.No, // 接待人員 代碼
        Name: item.Name, // 接待人員 名稱
        Label: item.No + '/' + item.Name, // 組合成顯示用的Label
      }));
      console.log('接洽人員代號:', this.contact_USR_Option);
    });
  }

  // 讀取明細資料
  async loadDetailData(pod_no: string): Promise<void> {
    console.log('要求pod_no資料:', pod_no);
    this.tLS26010Service.loadTLS26010Detail({ "pod_no": pod_no }).pipe(untilDestroyed(this)).subscribe((response) => {
      if (response.Status === '0000') {
        console.log('取得明細資料:', response.Data.ecr_list);
        this.ecrData = response.Data.ecr_list as unknown as ecr_list[];
        this.orgEcrData = this.ecrData;
        console.log('取得明細Table:', this.ecrData);
      } else {
        this.messageService.errorBubble(`讀取失敗: ${response.Message}`);
      }
    });
  }
  // #region 收銀機驗證
  validateECR = (rowData: ecr_list): { isValid: boolean; errorMessage: string } => {
    return { isValid: true, errorMessage: '' };
  };

  // #region 明細重製
  reset26010() {
    // 將明細檔重新刷新
    if (this.crudstatus == CRUDStatus.Create) {
      this.ecrData = [];
    } else if (this.crudstatus == CRUDStatus.Edit) {
      if (this.orgEcrData) {
        // 重製明細檔
        this.ecrData = this.orgEcrData;
        this.messageService.infoBubble('編輯模式重製完成');
      }
    } else {
      console.log('查看模式無須重製');
    }
  }
}