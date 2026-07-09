import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { TLS53020Data, TLS53020Service } from '@service/api/tls/tls53020.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { FileUploadComponent } from '@shared/componentkit/file-upload/file-upload.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { AddButton, ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { createPaginationConfig, formatDate } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { FileUploadHandlerEvent } from 'primeng/fileupload';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-tls53020',
  templateUrl: './tls53020.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    CalendarRangeComponent,
    ButtonComponent,
    TableReportComponent,
    TranslateModule,
    RadiobuttonComponent,
    MultiSelectComponent,
    DialogComponent,
    FileUploadComponent
  ],
})
export class TLS53020Component extends BasicQueryPageComponent<TLS53020Data> implements OnInit {
  queryForm = this.formBuilder.group({
    PST_No: ['', [Validators.maxLength(20)]], // 盤點單編號
    HOS_No: [[]], // 倉別代碼
    LOGO_No: [[]], // 品牌代碼
    PST_DateStart: [new Date(), Validators.required],    // 盤點基準日期(起)
    PST_DateEnd: [new Date(), Validators.required],             // 盤點基準日期(迄)
    PST_Status: [[]], // 盤點狀態
    PST_Type: [null], // 盤點類型
    ...createPaginationConfig([{ field: 'PST_Date', order: -1 }]),
  });

  // 匯入菜單 dialog
  queryForm2 = this.formBuilder.group({
    PST_No: [{ value: '', disabled: true }], // 盤點單編號
    PST_Type: [null, Validators.required], // 盤點類型
  });

  data: TLS53020Data[] = [];
  totalRecords = 0;
  selectedItems: TLS53020Data[] = [];
  lastQueryBody: any = null;

  // 下拉選單資料
  HOSNoOptions: any[] = []; // 倉別選項
  LOGONoOptions: any[] = []; // 品牌選項
  PSTStatusOptions: any[] = [ // 盤點狀態選項
    { label: '盤點單開立，待盤點', value: '0' },
    { label: '初盤，盤點中', value: '1' },
    { label: '複盤，盤點完成', value: '2' },
    { label: '抽盤，小盤結案', value: '3' },
    { label: '已結案', value: '4' },
    { label: '作廢', value: '9' },
  ];
  PSTTypeOptions: any[] = [ // 盤點類型選項
    { label: '初盤', value: '1' },
    { label: '複盤', value: '2' },
    { label: '抽盤', value: '3' },
    { label: '尚未盤點', value: '0' },
  ];

  // 用於匯入視窗的盤點類型選項（排除尚未盤點）
  PSTTypeOptionsForImport: any[] = [];

  columns: ReportColumn[] = [
    { field: 'PST_No', header: '盤點單編號', visible: true },
    { field: 'LOGO_No', header: '品牌代碼', visible: true },
    { field: 'LOGO_CH_NAME', header: '品牌名稱', visible: true },
    { field: 'HOS_No', header: '倉別代碼', visible: true },
    { field: 'HOS_NAME', header: '倉別', visible: true },
    {
      field: 'PST_Date',
      header: '盤點基準日',
      visible: true,
      format: formatDate
    },
    {
      field: 'PST_Type',
      header: '盤點類型',
      visible: true,
      format: (value) => this.PSTTypeOptions.find(item => item.value === value)?.label || value
    },
    {
      field: 'PST_Status',
      header: '狀態',
      visible: true,
      format: (value) => this.PSTStatusOptions.find(item => item.value === value)?.label || value
    },
  ];

  addButton: AddButton[] = [
    {
      label: '匯入',
      icon: '',
      action: (rowData: TLS53020Data) => { this.onImport(rowData); },
    }
  ];

  constructor(
    public readonly tls53020Service: TLS53020Service,
    private dropDownListService: DropDownListService,
    private datePipe: DatePipe
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS53020', '/tls/tls53020cru', this.queryForm, (form: FormGroup) => this.onSubmit(form));
    // 準備匯入視窗用的盤點類型選項（移除 value='0'）
    this.PSTTypeOptionsForImport = this.PSTTypeOptions.filter(item => String(item.value) !== '0');
    this.loadOptions();
  }

  onSubmit(frm: FormGroup): void {
    const queryRequest = {
      ...frm.getRawValue(),
      PST_DateStart: this.datePipe.transform(frm.get('PST_DateStart')?.value, 'yyyy-MM-dd') || null,
      PST_DateEnd: this.datePipe.transform(frm.get('PST_DateEnd')?.value, 'yyyy-MM-dd') || null
    };
    this.handleSubmit(this.queryForm, () => {
      this.tls53020Service.queryTLS53020(queryRequest)
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe(res => {
          this.data = res.Data;
          this.totalRecords = res.TotalCount;
          this.lastQueryBody = queryRequest;
          this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
        });
    });
  }

  loadOptions(): void {
    // 載入倉別選項
    this.dropDownListService.getPOS2034Options().subscribe(options => {
      this.HOSNoOptions = options.Data.map(item => ({
        value: item.No,
        label: `${item.No}-${item.Name}`
      }));
    });
    // 載入品牌選項
    this.dropDownListService.queryPLULOGO_DropDownList().subscribe(options => {
      this.LOGONoOptions = options.Data.map(item => ({
        value: item.No,
        label: `${item.No}-${item.Name}`
      }));
    });
  }

  // 匯入
  @ViewChild('fileUpload') fileUploadComponent!: FileUploadComponent;
  dialogVisible = false;
  fileUploadLoading = false;

  onImport(rowData: TLS53020Data): void {
    this.dialogVisible = true;
    this.initFileUpload(rowData);
  }

  onFileUpload(event: FileUploadHandlerEvent) {
    // 驗證表單
    if (this.queryForm2.invalid) {
      this.submitted = true;
      return;
    }

    // 上傳檔案
    const formData = new FormData();
    formData.append('PST_No', this.queryForm2.controls.PST_No.value || '');
    formData.append('PST_Type', this.queryForm2.controls.PST_Type.value || '');
    formData.append('file', event.files[0]);

    this.fileUploadLoading = true;
    this.tls53020Service.uploadTLS53020(formData)
      .pipe(untilDestroyed(this), finalize(() => this.fileUploadLoading = false))
      .subscribe(res => {
        if (res.Status === '0000') {
          this.messageService.successBubble(res.Message);
          this.dialogVisible = false;     // 關閉視窗
          this.onSubmit(this.queryForm);  // 重新整理列表
        } else {
          this.messageService.errorBubble(res.Message);
        }
      });
  }

  // 初始化匯入視窗
  initFileUpload(rowData: TLS53020Data) {
    this.fileUploadComponent.clearFiles();
    this.queryForm2.reset();
    this.queryForm2.get('PST_No')?.setValue(rowData?.PST_No || '');
    this.submitted = false;
  }
}
