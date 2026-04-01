import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { getSYS1000, getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { FileUploadComponent } from '@shared/componentkit/file-upload/file-upload.component';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { formatDateTime } from '@shared/componentkit/table-report/table-report.model';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column, createPaginationConfig, formatAmount } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { FileUploadHandlerEvent } from 'primeng/fileupload';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { TLS42020Data, TLS42020DetailQueryRequest, TLS42020Service } from '../../../service/api/tls/tls42020.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { formatDate } from '../tls2f010-cru/tls2f010-table-report.model';

@Component({
  selector: 'app-tls42020',
  templateUrl: './tls42020.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    MultiSelectComponent,
    TableComponent,
    TranslateModule,
    DialogComponent,
    FileUploadComponent,
    RadiobuttonComponent,
    CalendarComponent,
    ButtonModule,
    AsyncPipe
  ]
})
export class TLS42020Component extends BasicQueryPageComponent<TLS42020Data> implements OnInit {
  queryForm = this.fb.group({
    menuType: [null],                               // 菜單類別(多選)
    TLT_No: [null],                                  // 專櫃編號(多選)
    SBM_BegDate: [null],  // 開始日期(起)
    SBM_EndDate: [null],  // 結束日期(起)
    ...createPaginationConfig([{ field: "TLT_No", order: 0 }])
  });
  @ViewChild('fileUpload') fileUploadComponent!: FileUploadComponent;
  totalRecords = 0;
  data: TLS42020Data[] = [];
  selectedItems: TLS42020Data[] = [];
  queryForm2 = this.fb.group({
    uploadType: ['0', Validators.required],  // 異動方式
  });
  dialogVisible = false;
  uploadTypeOptions = [
    { label: '先刪除後新增', value: '0' },
    { label: '更新', value: '1' },
    { label: '新增', value: '2' }
  ];
  menuTypeOptions = getSYS1000Options('SBM_Type');
  tltNoOptions = this.dropDown.queryTltTalent();
  columns: Column[] = [
    { field: 'SBM_Type', header: '菜單類別', format: value => getSYS1000('SBM_Type', value), },
    { field: 'TLT_No', header: '專櫃編號' },
    { field: 'TLT_Name', header: '專櫃名稱' },
    { field: 'SBM_BegDate', header: '起始日期', format: formatDate },
    { field: 'SBM_EndDate', header: '結束日期', format: formatDate },
    { field: 'crt_date', header: '建立日期', visible: false, format: formatDateTime },
    { field: 'crt_usr_no', header: '建立者編號', visible: false },
    { field: 'crt_usr_name', header: '建立者姓名', visible: false },
    { field: 'upd_date', header: '更新日期', visible: false, format: formatDateTime },
    { field: 'upd_usr_no', header: '更新者編號', visible: false },
    { field: 'upd_usr_name', header: '更新者姓名', visible: false }
  ];

  // 展開詳細資料欄位定義
  expansionColumns: Column[] = [
    { field: 'SBM_BtnNo', header: '菜單按鍵序號' },
    { field: 'PLU_MagNo', header: '商品管理碼' },
    { field: 'PLU_No', header: '國際條碼' },
    { field: 'PLU_Name', header: '商品名稱' },
    { field: 'PLU_PrnName', header: '商品列印名稱' },
    { field: 'PLU_FixPrc', header: '商品定價', format: formatAmount },
    { field: 'PLU_SalePrc', header: '商品售價', format: formatAmount },
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly tls42020Service: TLS42020Service,
    private readonly datePipe: DatePipe,
    private readonly dropDown: DropdownApiService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS42020', 'tls/tls42020cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      this.tls42020Service.queryTLS42020(frm.getRawValue()).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(response => {
        this.data = response.Data;
        this.totalRecords = response.TotalCount;
        this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
      });
    });
  }
  // 載入詳細資料
  loadDetails = (rowData: TLS42020Data): Observable<any> => {
    const request: TLS42020DetailQueryRequest = {
      MID: rowData.mid,
      STO_No: rowData.STO_No,
      SBM_Type: rowData.SBM_Type?.toString() ?? '',
      TLT_No: rowData.TLT_No, // 這裡要大寫
      SBM_BegDate: this.datePipe.transform(rowData.SBM_BegDate, 'yyyy-MM-ddTHH:mm:ss') ?? '',
    };

    return this.tls42020Service.queryTLS42020Detail(request);
  };
  // 刪除資料
  onDelete(selectedItems: TLS42020Data[]) {
    this.messageService.confirm({
      header: `是否確認刪除 ${selectedItems.length} 筆資料？`,
      accept: () => {
        this.tls42020Service.deleteTLS42020({ idList: selectedItems.map(item => item.id) }).subscribe((res) => {
          this.messageService.successBubble('刪除成功');
          this.onSubmit(this.queryForm);
        });
      }
    });
  }

  // 檔案上傳事件
  onFileUpload(event: FileUploadHandlerEvent) {
    const file = event.files[0];
    this.tls42020Service.uploadTLS42020(file, this.queryForm2.value.uploadType!).pipe(untilDestroyed(this)).subscribe(res => {
      if (res.Status !== '0000') {
        this.messageService.errorBubble(res.Message);
        return;
      }
      this.messageService.successBubble(res.Message);
      // 使用封裝的清空方法
      this.fileUploadComponent.clearFiles();
      // 關閉對話框
      this.dialogVisible = false;
      // 重新查詢資料
      this.onSubmit(this.queryForm);
    });
  }

  // 下載範例檔案
  downloadTemplate() {
    this.tls42020Service.downloadRule().subscribe(response => {
      if (!response.Data.FileData) return;

      const byteCharacters = atob(response.Data.FileData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], {
        type: response.Data.ContentType
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'TLS42020收銀菜單設定_範例檔案.xlsx';
      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    });
  }

  // 檔案下傳功能
  btnLoading = false;
  onUpload() {
    this.btnLoading = true;
    this.tls42020Service.ExecSpFuncTLS42020({
      idList: this.selectedItems.map(item => item.id)
    }).pipe(untilDestroyed(this), finalize(() => this.btnLoading = false)).subscribe(res => {
      this.messageService.successBubble('下傳成功');
      this.onSubmit(this.queryForm);
    });
  }
}
