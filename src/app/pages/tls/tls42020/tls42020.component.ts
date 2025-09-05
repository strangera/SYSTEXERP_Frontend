import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { untilDestroyed } from '@ngneat/until-destroy';

import { TLS42020Service, TLS42020DetailData, TLS42020Data } from '../../../service/api/tls/tls42020.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, createPaginationConfig, formatAmount } from '@shared/componentkit/table/table.model';
import { DropDownListService } from '@service/utility/dropDownList.service';

// Shared & UI Components
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { AccordionModule } from 'primeng/accordion';
import { TranslateModule } from '@ngx-translate/core';
import { FileSelectEvent, FileUploadHandlerEvent } from 'primeng/fileupload';
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { FileUploadComponent } from '@shared/componentkit/file-upload/file-upload.component';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';

@Component({
  selector: 'app-tls42020',
  templateUrl: './tls42020.component.html',
  styleUrl: './tls42020.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    MultiSelectComponent,
    CalendarRangeComponent,
    TableComponent,
    TranslateModule,
    DialogComponent,
    FileUploadComponent,
    RadiobuttonComponent
  ]
})
export class TLS42020Component extends BasicQueryPageComponent<TLS42020Data> implements OnInit {
  queryForm = this.fb.group({
    menuType: [[]],                               // 菜單類別(多選)
    tltNo: [[]],                                  // 專櫃編號(多選)
    SBM_BegDate_s: [null, Validators.required],  // 開始日期(起)
    SBM_BegDate_e: [null, Validators.required],  // 開始日期(迄)
    SBM_EndDate_s: [null, Validators.required],  // 結束日期(起)
    SBM_EndDate_e: [null, Validators.required],  // 結束日期(迄)
    ...createPaginationConfig([])
  });

  totalRecords = 0;
  data: TLS42020Data[] = [];
  selectedItems: TLS42020Data[] = [];

  // 匯入菜單 dialog
  queryForm2 = this.fb.group({
    uploadType: [0, Validators.required],  // 異動方式                         
  });

  dialogVisible = false;

  uploadTypeOptions = [
    { label: '先刪除後新增', value: 0 },
    { label: '更新', value: 1 },
    { label: '新增', value: 2 }
  ];

  // 下拉選單選項
  menuTypeOptions: { label: string; value: string }[] = [];
  tltNoOptions: { label: string; value: string }[] = [];

  // 主表格欄位定義
  columns: Column[] = [
    {
      field: 'SBM_Type',
      header: '菜單類別',
      visible: true,
      format: (value: number) => value === 1 ? '一般菜單' : '員工菜單'
    },
    { field: 'TLT_No', header: '專櫃編號', visible: true },
    { field: 'TLT_Name', header: '專櫃名稱', visible: true },
    { field: 'SBM_BegDate', header: '起始日期', visible: false },
    { field: 'SBM_EndDate', header: '結束日期', visible: false },
    { field: 'STO_No', header: '店舖編號', visible: false },
    { field: 'id', header: 'ID', visible: false },
    { field: 'mid', header: 'MID', visible: false },
    { field: 'crt_date', header: '建立日期', visible: false },
    { field: 'crt_usr_no', header: '建立者編號', visible: false },
    { field: 'crt_usr_name', header: '建立者姓名', visible: false },
    { field: 'upd_date', header: '更新日期', visible: false },
    { field: 'upd_usr_no', header: '更新者編號', visible: false },
    { field: 'upd_usr_name', header: '更新者姓名', visible: false }
  ];

  // 展開詳細資料欄位定義
  expansionColumns: Column[] = [
    { field: 'SBM_BtnNo', header: '菜單按鍵序號', visible: true },
    { field: 'PLU_MagNo', header: '商品貨號', visible: true },
    { field: 'PLU_No', header: '國際條碼', visible: true },
    { field: 'PLU_Name', header: '商品名稱', visible: true },
    { field: 'PLU_PrnName', header: '商品列印名稱', visible: true },
    { field: 'PLU_FixPrc', header: '商品定價', visible: true, format: formatAmount },
    { field: 'PLU_SalePrc', header: '商品售價', visible: true, format: formatAmount },
    { field: 'SBM_SeqNo', header: '序號', hidden: true },
    { field: 'SBM_Type', header: '子菜單類別', hidden: true },
    { field: 'TLT_No', header: '專櫃編號', hidden: true },
    { field: 'SBM_BegDate', header: '開始日期', hidden: true },
    { field: 'SBM_EndDate', header: '結束日期', hidden: true },
    { field: 'STO_No', header: '店舖編號', hidden: true },
    { field: 'ID', header: 'ID', hidden: true },
    { field: 'MID', header: 'MID', hidden: true },
    { field: 'CRT_Date', header: '建立日期', hidden: true },
    { field: 'CRT_USR_No', header: '建立者編號', hidden: true },
    { field: 'CRT_USR_Name', header: '建立者姓名', hidden: true },
    { field: 'UPD_Date', header: '更新日期', hidden: true },
    { field: 'UPD_USR_No', header: '更新者編號', hidden: true },
    { field: 'UPD_USR_Name', header: '更新者姓名', hidden: true }
  ];

  constructor(
    private fb: FormBuilder,
    private tls42020Service: TLS42020Service,
    private dropDownListService: DropDownListService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS42020', 'tls/tls42020cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      this.tls42020Service.queryTLS42020(frm.getRawValue())
        .pipe(
          untilDestroyed(this),
          finalize(() => this.loading = false)
        )
        .subscribe(response => {
          this.data = response.Data;
          this.totalRecords = response.TotalCount;
          this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
        });
    });
  }

  private loadOptions(): void {
    // 載入菜單類別選項
    this.menuTypeOptions = [
      { label: '一般菜單', value: '1' },
      { label: '員工菜單', value: '2' }
    ];

    // 載入專櫃編號選項
    this.dropDownListService.queryTLTTALENT_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.tltNoOptions = res.Data.map((item: any) => ({
          label: `${item.No}-${item.Name}`,
          value: item.No
        }));
      });
  }

  loadDetails = (rowData: TLS42020Data): Observable<any> => {
    return this.tls42020Service.queryTLS42020Detail({
      tltNo: rowData.TLT_No
    });
  };

  onDelete(rowData: TLS42020Data[]) {
    this.messageService.confirm({
      header: '是否確認刪除',
      accept: () => {
        this.tls42020Service.deleteTLS42020({
          idList: rowData.map(item => item.id)
        }).subscribe((res) => {
          if (res.Status === '0000') {
            this.messageService.successBubble('刪除成功');
            this.onSubmit(this.queryForm);
          } else {
            this.messageService.errorBubble(res.Message);
          }
        });
      }
    });
  }

  onImport(event: FileSelectEvent) {
    this.dialogVisible = true;
  }

  onFileSelect(event: FileSelectEvent) {
    // TODO: 檔案檢查邏輯
  }

  onFileUpload(event: FileUploadHandlerEvent) {
    const file = event.files[0];
    this.tls42020Service.uploadTLS42020(file).pipe(untilDestroyed(this)).subscribe(res => {
      if (res.Status === '0000') {
        this.messageService.successBubble(res.Message);
      } else {
        this.messageService.errorBubble(res.Message);
      }
    });
  }
}