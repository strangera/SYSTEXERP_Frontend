import { AsyncPipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { TLS27010Service } from '@service/api/tls/tls27010.service';
import { getSYS1000, getSYS1000Options } from '@service/system/sys1000.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { FileUploadComponent } from '@shared/componentkit/file-upload/file-upload.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { formatDate, formatDateTime, ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { FileUploadHandlerEvent } from 'primeng/fileupload';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
@Component({
  selector: 'app-tls27010',
  templateUrl: './tls27010.component.html',
  standalone: true,
  imports: [
    AsyncPipe,
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    FileUploadComponent,
    TableReportComponent,
    InputTextComponent,
    ButtonComponent,
    CalendarComponent,
    MultiSelectComponent,
  ],
})
export class TLS27010Component extends BasicQueryPageComponent<unknown> implements OnInit {
  @ViewChild(FileUploadComponent) fileUpload?: FileUploadComponent;
  files: File[] = [];
  allowedFileTypes = '.csv,.txt';
  TSDP_FileSrcListOptions = getSYS1000Options('FileSrc');
  TSDP_ProcStatusListOptions = getSYS1000Options('ProcStatus');
  queryForm = this.formBuilder.group({
    TSDP_SendTime: [null], // 檔案日期
    TSDP_FileSrcList: [null], // 檔案來源
    TSDP_ProcStatusList: [null], // 處理狀態
    pageSize: [30],
    pageIndex: [1],
  });
  data: any[] = [];
  columns: ReportColumn[] = [
    { field: 'TSDP_File', header: '檔案名稱' },
    {
      field: 'TSDP_FileSrc', header: '檔案來源',
      format: (value) => getSYS1000('FileSrc', value)
    },
    {
      field: 'TSDP_ProcStatus', header: '處理狀態',
      format: (value) => getSYS1000('ProcStatus', value)
    },
    { field: 'TSDP_Date', header: '檔案日期', format: formatDate },
    { field: 'TSDP_SendTime', header: '傳送時間', format: formatDateTime },
    { field: 'TSDP_ProcBegTime', header: '處理開始時間', format: formatDateTime },
    { field: 'TSDP_ProcEndTime', header: '處理結束時間', format: formatDateTime },
    { field: 'TSDP_ProcTotCnt', header: '總筆數', isTotal: true },
    { field: 'TSDP_ProcSuccCnt', header: '成功筆數', isTotal: true },
    { field: 'TSDP_ProcFailCnt', header: '失敗筆數', isTotal: true },
    { field: 'TSDP_ProcMsg', header: '回應訊息' },
    { field: 'CRT_USR_No', header: '建立者' },
    { field: 'CRT_Date', header: '建立日期', format: formatDate },
    { field: 'UPD_USR_No', header: '修改者' },
    { field: 'UPD_Date', header: '修改日期', format: formatDate },
  ];
  totalRecords = 0;
  lastQueryBody: any = null;

  constructor(
    public readonly tls27010Service: TLS27010Service,
  ) { super() }

  ngOnInit(): void {
    this.initializePage('TLS27010', 'tls/tls27010cru');
  }

  handleCustomUpload(event: FileUploadHandlerEvent) {
    if (event.files && event.files.length > 0) {
      const clientIp = this.authService.currentUserValue?.client_ip || '';
      this.loading = true;
      const renamedFiles: File[] = event.files.map(originalFile => {
        const uniform = this.authService.currentUserValue?.STR_Uniform || '';
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2); // Get last 2 digits
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const formattedDate = `${year}${month}${day}`;

        const extension = originalFile.name.split('.').pop()?.toLowerCase(); // csv or txt
        const newName = `TSCDM${uniform}_${formattedDate}.${extension}`;

        return new File([originalFile], newName, {
          type: originalFile.type,
          lastModified: originalFile.lastModified,
        });
      });

      this.tls27010Service.uploadTLS27010(renamedFiles, clientIp).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(response => {
        this.loading = false;
        this.messageService.successBubble(response.Message);
        this.files = [];
        this.fileUpload?.fileUpload?.clear();
      });
    }
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body = {
        ...frm.value,
        TSDP_SendTime: frm.value.TSDP_SendTime ? formatDate(frm.value.TSDP_SendTime) : null,
      };
      this.tls27010Service.queryTLS27010(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((res) => {
        this.lastQueryBody = frm.value;
        this.data = res.Data;
        this.totalRecords = res.TotalCount;
        this.queryStateService.setQueryState(this.ProgNo, this.queryForm.value);
      });
    });
  }
}
