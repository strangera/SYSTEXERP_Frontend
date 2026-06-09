import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { TLS27030Service } from '@service/api/tls/tls27030.service';
import { getSYS1000, getSYS1000Options } from '@service/system/sys1000.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { formatDate, formatDateTime, ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { FileUploadHandlerEvent } from 'primeng/fileupload';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { FileUploadComponent } from '../../../shared/componentkit/file-upload/file-upload.component';
@Component({
  selector: 'app-tls27030',
  templateUrl: './tls27030.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    FileUploadComponent,
    TranslateModule,
    TableReportComponent,
    MultiSelectComponent,
    ButtonComponent,
    CalendarComponent,
  ]
})
export class TLS27030Component extends BasicQueryPageComponent<unknown> implements OnInit {
  @ViewChild('fileUpload1') fileUpload1?: FileUploadComponent;
  @ViewChild('fileUpload2') fileUpload2?: FileUploadComponent;
  @ViewChild('fileUpload3') fileUpload3?: FileUploadComponent;
  allowedFileTypes = '.csv,.txt';
  lastQueryBody: any = null;
  totalRecords = 0;
  data: any[] = [];
  files1: File[] = [];
  files2: File[] = [];
  files3: File[] = [];
  CTBC_FileTypeListOptions = [
    {
      value: 'POS6118',
      label: '聯合信用卡',
    },
    {
      value: 'POS6118H',
      label: '聯合信用卡(宏誌)',
    },
    {
      value: 'POS6119',
      label: '中信信用卡',
    },
    {
      value: 'POS6119P',
      label: '中信信用卡-停車場',
    }
  ];
  CTBC_FileSrcListOptions = getSYS1000Options('FileSrc');
  CTBC_ProcStatusListOptions = getSYS1000Options('ProcStatus');
  queryForm = this.formBuilder.group({
    CTBC_SendTime: [null], // 檔案日期
    CTBC_FileTypeList: [null], // 檔案類型
    CTBC_FileSrcList: [null], // 檔案來源
    CTBC_ProcStatusList: [null], // 處理狀態
    pageSize: [30],
    pageIndex: [1],
  });
  columns: ReportColumn[] = [
    {
      field: 'CTBC_FileType', header: '檔案類型',
      format: (value) => this.CTBC_FileTypeListOptions.find(item => item.value === value)?.label || value
    },
    { field: 'CTBC_File', header: '檔案名稱' },
    {
      field: 'CTBC_FileSrc', header: '檔案來源',
      format: (value) => getSYS1000('FileSrc', value)
    },
    {
      field: 'CTBC_ProcStatus', header: '處理狀態',
      format: (value) => getSYS1000('ProcStatus', value)
    },
    { field: 'CTBC_Date', header: '檔案日期', format: formatDate },
    { field: 'CTBC_SendTime', header: '傳送時間', format: formatDateTime },
    { field: 'CTBC_ProcBegTime', header: '處理開始時間', format: formatDateTime },
    { field: 'CTBC_ProcEndTime', header: '處理結束時間', format: formatDateTime },
    { field: 'CTBC_ProcTotCnt', header: '總筆數', isTotal: true },
    { field: 'CTBC_ProcSuccCnt', header: '成功筆數', isTotal: true },
    { field: 'CTBC_ProcFailCnt', header: '失敗筆數', isTotal: true },
    { field: 'CTBC_ProcMsg', header: '回應訊息' },
    { field: 'CRT_USR_No', header: '建立者' },
    { field: 'CRT_Date', header: '建立日期', format: formatDate },
    { field: 'UPD_USR_No', header: '修改者' },
    { field: 'UPD_Date', header: '修改日期', format: formatDate },
  ];
  constructor(
    public readonly tls27030Service: TLS27030Service,
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS27030', 'TLS/TLS27030cru');
  }
  handleCustomUpload(event: FileUploadHandlerEvent, type: string) {
    if (event.files && event.files.length > 0) {
      const clientIp = this.authService.getUserInfo()?.client_ip || '';
      this.loading = true;

      this.tls27030Service.uploadTLS27030(event.files, clientIp, type).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(response => {
        this.loading = false;
        this.messageService.successBubble(response.Message);
        switch (type) {
          case 'NCML':
            this.files1 = [];
            this.fileUpload1?.fileUpload?.clear();
            break;
          case 'CTBC':
            this.files2 = [];
            this.fileUpload2?.fileUpload?.clear();
            break;
          case 'CTBCPrk':
            this.files3 = [];
            this.fileUpload3?.fileUpload?.clear();
            break;
        }
      });
    }
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body = {
        ...frm.value,
        TSDP_SendTime: frm.value.TSDP_SendTime ? formatDate(frm.value.TSDP_SendTime) : null,
      };
      this.tls27030Service.queryTLS27030(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((res) => {
        this.lastQueryBody = frm.value;
        this.data = res.Data;
        this.totalRecords = res.TotalCount;
        this.queryStateService.setQueryState(this.ProgNo, this.queryForm.value);
      });
    });
  }
}
