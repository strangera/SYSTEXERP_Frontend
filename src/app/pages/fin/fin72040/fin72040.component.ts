import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { InputNumberRangeComponent } from '@shared/componentkit/input-number-range/input-number-range.component';
import { AccordionModule } from 'primeng/accordion';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { AddButton, Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { apiOption } from '../../../shared/models/sys/sysb000.model';

export interface sample72040 {
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

@Component({
  selector: 'app-fin72040',
  templateUrl: './fin72040.component.html',
  styleUrl: './fin72040.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    CalendarRangeQuickComponent,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    InputNumberRangeComponent,
    DropdownComponent,
    TableComponent,
    TranslateModule]
})
export class FIN72040Component extends BasicQueryPageComponent<sample72040> implements OnInit {
  // 查詢
  queryForm = this.formBuilder.group({
    // 檔案說明:
    //  POS2064M 收支主檔(I/O)
    //  POS2064 收支明細檔(I/O) 
    //  tblUser 使用者資料檔(O)
    KeepQuota_No: [null, [Validators.required]], // 支出請款單號

    //分頁查詢
    ...createPaginationConfig([{ field: 'KeepQuota_No', order: 1 }]), // 分頁和排序參數
  });
  // 表格
  // ----------------------------------------------------------------
  totalRecords = 0;// 分頁和排序參數 // 排序需要

  KeepQuota_Options: apiOption[] = [
    { No: 'KQ001', Name: '請款單1', Label: 'KQ001 - 請款單1' },
    { No: 'KQ002', Name: '請款單2', Label: 'KQ002 - 請款單2' },
    { No: 'KQ003', Name: '請款單3', Label: 'KQ003 - 請款單3' },
  ];

  data: sample72040[] = [];
  columns: Column[] = [
    { field: 'type01', header: '支出請款單號', visible: false },
    { field: 'type02', header: '傳票號碼', visible: true },
    { field: 'type03', header: '申請金額', visible: true },
    { field: 'type04', header: '申請日期', visible: true },
    { field: 'type05', header: '申請人', visible: true },
  ];

  selectedItems: sample72040[] = [];// 多選項目

  addButton: AddButton[] = [
    {
      label: '確定撥補',
      icon: 'fa-regular fa-file-pdf',
      action: (rowData) => this.onBtnToss(rowData), // 傳入 rowData 並指定非 Excel
      loading: () => this.btnLoading
    }
  ];

  // ----------------------------------------------------------------
  constructor(
    private readonly dropdownApiService: DropdownApiService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN72040', 'FIN/FIN72040cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      console.log('撥補request:', JSON.stringify(frm.value, null, 2));
      this.loading = false;
      // this.tls51080Service.queryTLS51080(frm.value).subscribe({
      //   next: (response) => {
      //     if (response.Status === '0000') {
      //       this.data = response.Data || [];
      //       console.log('Result', this.data);
      //       this.totalRecords = response.TotalCount || response.Data.length;
      //       this.queryStateService.setQueryState(this.ProgNo, frm.value);
      //     } else {
      //       console.error('API error:', response.Status, response.Message);
      //     }
      //     this.loading = false;
      //     this.messageService.unblockUi();
      //   },
      //   error: (err: string) => {
      //     console.error('API error:', err);
      //     this.loading = false;
      //     this.messageService.unblockUi();
      //   },
      // });
    });
  }

  isRowSelectable(rowData: sample72040): boolean {
    return rowData.CanDel
  }

  // 撥補
  btnLoading = false;
  onBtnToss(rowData: sample72040) {
    if (!rowData || !rowData.id) {
      this.messageService.errorBubble('找不到該筆資料的 ID');
      return;
    }

    // 根據 API 需求包裝參數，對應您原本程式碼中的 PC_id
    // const formValue = { ID: rowData.id };

    this.btnLoading = true;
    // this.tls12010Service.exportTLS12010(formValue)
    //   .pipe(
    //     finalize(() => this.btnExcelLoading = false),
    //     untilDestroyed(this)
    //   )
    //   .subscribe({
    //     next: (blob: Blob) => {
    //       this.downloadFile(blob, `潛在客戶明細_${rowData.id}_${new Date().getTime()}.xlsx`);
    //       this.messageService.successBubble('匯出 Excel 成功');
    //     },
    //     error: (err) => {
    //       console.error(err);
    //       this.messageService.errorBubble('匯出失敗');
    //     }
    //   });
  }

  loadOptions() {
    //  this.dropdownApiService.queryAps1002().pipe(untilDestroyed(this)).subscribe((response) => {
    //       const list = Array.isArray(response) ? response : [];
    //       this.KeepQuota_Options = list.map((item: any) => ({
    //         No: item.BNK_DepositAccNo, // 公司銀行科目 代號
    //         Name: item.ACCCNAME,
    //         Label: item.BNK_DepositAccNo + '-' + item.ACCCNAME, // 代碼+名稱
    //       }));
    //       // console.log('銀行代號 下拉:', response);
    //     });
  }
}
