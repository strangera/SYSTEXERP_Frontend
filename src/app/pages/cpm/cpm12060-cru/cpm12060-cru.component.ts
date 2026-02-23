import { AsyncPipe, NgIf } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Cpm12010Service } from '@service/api/cpm/cpm12010.service';
import { Cpm12060Service, detail12060Data } from '@service/api/cpm/cpm12060.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { formatDateTime } from '@shared/componentkit/table/table.model';
import { option } from '@shared/models/sys/sysb000.model';
import { PanelModule } from 'primeng/panel';
import { CPM11020Data } from '../../../service/api/cpm/cpm11020.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableEditComponent } from '../../../shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '../../../shared/componentkit/table-edit/table-edit.model';

//5.1.2.6  顧客意見處理狀況表 CRU
@Component({
  selector: 'app-cpm12060-cru',
  standalone: true,
  templateUrl: './cpm12060-cru.component.html',
  imports: [
    AsyncPipe,
    MenubarComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    ButtonComponent,
    NgIf,
    TranslateModule,
    TableEditComponent,
    DropdownComponent,
    CalendarComponent
  ]
})
export class CPM12060CRUComponent extends BasicCruPageComponent<CPM11020Data> implements OnInit {
  @ViewChild(TableEditComponent) tableEditComponent!: TableEditComponent;

  dataForm = this.formBuilder.nonNullable.group({
    ID: [null], // 主鍵識別碼
    SEQ_ID: ['', [Validators.required, Validators.maxLength(20)]], // 單號
    CUST_NAME: ['', [Validators.required, Validators.maxLength(60)]], // 客戶名稱
    SEX: ['', [Validators.required, Validators.maxLength(2)]], // 性別
    COMPLAIN_DATE: [null, [Validators.required]], // 提供日期
    ORG_ID: ['', [Validators.required, Validators.maxLength(10)]], // 處理單位
    STATUS: ['', [Validators.required, Validators.maxLength(1)]], // 處理狀態(S:已建立,W:已派單,Y:處理中,Z:結案)
    ANSWER_DATE_MM: ['', [Validators.maxLength(4)]], // 處理-時
  });

  // 獨立的主檔顯示表單 (唯讀參考)
  mainForm = this.formBuilder.nonNullable.group({
    SEQ_ID: [null as any], // 單號
    KIND_ID: [''], // 客戶意見類別代號
    KIND_Name: [''], // 客戶意見類別名稱
    KIND_ID_SUB: [''], // 客戶意見子類別代號
    KIND_SubName: [''], // 客戶意見子類別名稱
    CUST_NAME: [''], // 客戶名稱
    SEX: [''], // 性別
    CONTACT_ADDR: [''], // 聯絡住址
    CONTACT_TEL: [''], // 聯絡電話
    CELL_PHONE: [''], // 行動電話
    E_MAIL: [''], // 電子郵件
    COMPLAIN_NOTES: [''], // 客戶提供意見內容
    COMPLAIN_DATE: [null as Date | string | null], // 提供日期
    SUGG_SOURCE: [''], // 客戶意見來源別
    SUGG_SOURCE_NAME: [''], // 客戶意見來源別名稱
    SUGG_SOURCE_OTHER: [''], // 客戶意見來源別:其他
    ORG_ID: [''], // 處理單位
    MEMBER_ID: [''], // 會員編號
    STATUS: [''], // 狀態
    CRT_Date: [null as Date | string | null], // 建立日期
    CRT_USR_No: [''], // 建立者編號
    CRT_USR_Name: [''], // 建立者姓名
    ANSWER: [''], // 處理回覆
    ANSWER_DATE: [null as Date | string | null], // 回覆日期
    ANSWER_NAME: [''], // 回覆人員
  });

  // 處理狀態 下拉選單
  statusOptions: option[] = [
    { label: '已建立', value: 'S' },
    { label: '已派單', value: 'W' },
    { label: '處理中', value: 'Y' },
    { label: '結案', value: 'Z' },
  ]
  // 性別 下拉選單
  SEXOptions: option[] = [
    { label: '男', value: 'M' },
    { label: '女', value: 'F' },
  ]

  detailColumns: EditColumn[] = [
    { field: 'ANSWER', header: '處理內容' },
    { field: 'ANSWER_DATE', header: '處理時間', format: formatDateTime },
    { field: 'ANSWER_ID', header: '處理人員編號' },
    { field: 'CRT_Date', header: '建立日期', format: formatDateTime },
    { field: 'CRT_USR_Name', header: '建立者姓名' },
    { field: 'UPD_Date', header: '更新日期', format: formatDateTime },
    { field: 'UPD_USR_Name', header: '更新者姓名' }
  ];

  // 2. 新增存放資料的變數
  detailTableData: detail12060Data[] = [];
  selectedDetailItems: detail12060Data[] = [];
  displayDialog = false;

  constructor(
    private readonly cpm12010Service: Cpm12010Service,
    private readonly cpm12060Service: Cpm12060Service,
    private readonly dropdown: DropdownApiService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('CPM12060', this.dataForm);

    // 載入主檔資料
    const id = this.dataForm.get('ID')?.value;
    if (!id) return;
    this.loading = true; // 開啟載入狀態
    this.cpm12060Service.queryCPM12060_Main({ ID: id })
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        if (response?.Data && response.Data.length > 0) {
          this.mainForm.patchValue(response.Data[0]);
          console.log('主檔表格:', this.mainForm.value);
        }
      });

    // 載入明細資料
    const SEQ_ID = this.dataForm.get('SEQ_ID')?.value;
    if (!SEQ_ID) return;
    this.cpm12060Service.queryCPM12060_Detail({ SEQ_ID: SEQ_ID })
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        // console.log('明細資料:', response.Data);
        // 同樣賦值給明細變數
        this.detailTableData = response.Data ? [...response.Data] : [];
        console.log('明細資料:', this.detailTableData);
      });
  }

  onSubmit(dataForm: FormGroup): void {
    // 提交邏輯
    console.log('提交的表單資料:', dataForm.value);
  }
}
