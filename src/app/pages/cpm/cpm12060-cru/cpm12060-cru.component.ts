import { NgIf } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { CPM12060Data, Cpm12060Service, detail12060Data, main12060Data } from '@service/api/cpm/cpm12060.service';
import { CalenderoneComponent } from '@shared/componentkit/calenderone/calenderone.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { formatDateTime } from '@shared/componentkit/table/table.model';
import { option } from '@shared/models/sys/sysb000.model';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
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
    CalenderoneComponent
  ]
})
export class CPM12060CRUComponent extends BasicCruPageComponent<CPM11020Data> implements OnInit {
  @ViewChild(TableEditComponent) tableEditComponent!: TableEditComponent;

  dataForm = this.formBuilder.nonNullable.group({
    SEQ_ID: ['', [Validators.required, Validators.maxLength(20)]], // 單號
    CUST_NAME: ['', [Validators.required, Validators.maxLength(60)]], // 客戶名稱
    SEX: ['', [Validators.required, Validators.maxLength(2)]], // 性別
    COMPLAIN_DATE: [null, [Validators.required]], // 提供日期
    ORG_ID: ['', [Validators.required, Validators.maxLength(10)]], // 處理單位
    STATUS: ['', [Validators.required, Validators.maxLength(1)]], // 處理狀態(S:已建立,W:已派單,Y:處理中,Z:結案)
    ANSWER_DATE_MM: ['', [Validators.maxLength(4)]], // 處理-時
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

  // 1. 在原有的 columns 下方新增主檔與明細的欄位定義
  mainColumns: EditColumn[] = [
    { field: 'SEQ_ID', header: '單號' },
    { field: 'CUST_NAME', header: '客戶名稱' },
    { field: 'SEX', header: '性別' },
    { field: 'CONTACT_TEL', header: '電話' },
    { field: 'COMPLAIN_NOTES', header: '意見內容' },
    { field: 'STATUS', header: '狀態' },
    { field: 'ANSWER', header: '處理回覆' }
  ];

  detailColumns: EditColumn[] = [
    { field: 'CRT_USR_Name', header: '處理人員' },
    { field: 'ANSWER', header: '處理內容' },
    { field: 'ANSWER_DATE', header: '處理時間', format: formatDateTime },
    { field: 'UPD_USR_Name', header: '最後更新人' }
  ];

  // 2. 新增存放資料的變數
  mainTableData: main12060Data[] = [];
  detailTableData: detail12060Data[] = [];
  selectedMainItems: main12060Data[] = [];
  selectedDetailItems: detail12060Data[] = [];
  displayDialog = false;

  constructor(
    private readonly cpm12060Service: Cpm12060Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('CPM12060', this.dataForm);
    // 載入主檔資料
    const id = 1; //目前沒給，先用預設的
    this.loading = true; // 開啟載入狀態
    this.cpm12060Service.queryCPM12060_Main({ ID: id })
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        // console.log('主檔資料:', response.Data);
        this.mainTableData = response.Data ? [...response.Data] : [];
        console.log('主檔資料已更新至變數:', this.mainTableData);
      });

    // 載入明細資料
    this.cpm12060Service.queryCPM12060_Detail({ ID: id })
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        // console.log('明細資料:', response.Data);
        // 同樣賦值給明細變數
        this.detailTableData = response.Data ? [...response.Data] : [];
        console.log('明細資料已更新至變數:', this.detailTableData);
      });
  }

  // loadDetailData(): void {
  //   const id = this.rowdata?.ID;
  //   if (!id) return;

  //   this.cpm11020Service.queryCPM11020Detail({ ID: id })
  //     .pipe(untilDestroyed(this))
  //     .subscribe(response => {
  //       if (response.Data) {
  //         const detail = response.Data;

  //         // 儲存原始主表單資料
  //         this.originalMainData = {
  //           Device_ID: detail.MainData.Device_ID,
  //           Device_Name: detail.MainData.Device_Name,
  //           Device_TotQty: detail.MainData.Device_TotQty.toString(),
  //         };

  //         // 填充主表單資料
  //         // this.dataForm.patchValue(this.originalMainData);

  //         // 填充明細資料
  //         if (detail.Details && detail.Details.length > 0) {
  //           this.data = [...detail.Details];
  //           this.originalData = [...detail.Details];
  //         }
  //       }
  //     });
  // }

  // 3. 實作查詢方法
  onDetail(event: CPM12060Data) {
    this.displayDialog = true;
    this.loading = true;

    const req = { ID: Number(event.SEQ_ID) }; // 根據介面定義

    // 同時取得主檔與明細
    this.cpm12060Service.queryCPM12060_Main(req).subscribe(res => {
      this.mainTableData = res.Data; // app-table-edit 通常接收陣列
    });

    this.cpm12060Service.queryCPM12060_Detail(req).pipe(
      finalize(() => this.loading = false)
    ).subscribe(res => {
      this.detailTableData = res.Data;
    });
  }

  onSubmit(dataForm: FormGroup): void {
    // 提交邏輯
    console.log('提交的表單資料:', dataForm.value);
  }
}
