import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, createPaginationConfig, formatAmount } from '../../../shared/componentkit/table/table.model';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TranslateModule } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { untilDestroyed } from '@ngneat/until-destroy';
import { CardModule } from 'primeng/card';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { TLS2C010Service } from '@service/api/tls/tls2-c010.service';
import { TabViewModule } from 'primeng/tabview';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { ButtonModule } from 'primeng/button';
import { saveAs } from 'file-saver';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-tls2c010',
  templateUrl: './tls2c010.component.html',
  styleUrl: './tls2c010.component.scss',
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarComponent, ButtonComponent, TranslateModule, CardModule, ScrollPanelModule, TabViewModule,
    TableComponent, ButtonComponent, ButtonModule
  ]
})
export class TLS2C010Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    TXN_Date: ['', Validators.required], // 銷售日期
    ...createPaginationConfig([]) // 分頁和排序參數
  });

  closeDate = ''; // 最近關帳日期

  data_yy_up: any[] = [];
  data_yy_down: any[] = [];
  data_ny_up: any[] = [];
  data_ny_down: any[] = [];
  data_nn_up: any[] = [];
  data_nn_down: any[] = [];

  columns_yy_up: Column[] = [];
  columns_yy_down: Column[] = [];
  columns_ny_up: Column[] = [];
  columns_ny_down: Column[] = [];
  columns_nn_up: Column[] = [];
  columns_nn_down: Column[] = [];

  constructor(
    private tls2c010Service: TLS2C010Service,
    private datePipe: DatePipe,
    private cd: ChangeDetectorRef,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2C010', 'tls/tls2c010cru', this.queryForm, (form) => this.onSubmit(form));
    // 取得最近關帳日期
    this.tls2c010Service.getTLS2C010Date()
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.closeDate = response.Data.CLS_DATE || '';
        // TXN_Date 為 closeDate - 1 天
        const nextDate = new Date(this.closeDate);
        nextDate.setDate(nextDate.getDate() - 1);
        this.queryForm.patchValue({ TXN_Date: this.datePipe.transform(nextDate, 'yyyy/MM/dd') || '' });
      });
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.tls2c010Service.queryTLS2C010(
        {
          TXN_Date: this.datePipe.transform(frm.value.TXN_Date, 'yyyy-MM-dd') || ''
        })
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe(response => {
          this.setColumns(response.Data);
          this.setData(response.Data);
          this.queryStateService.setQueryState(this.ProgNo, frm.value);
          this.cd.detectChanges();
        });
    });
  }

  setColumns(responseData: any) {
    // Helper function to create columns from data
    const createColumns = (data: any[]): Column[] => {
      if (!data?.[0]) return [];
      return Object.keys(data[0]).map(key => ({
        field: key,
        header: data[0][key],
        visible: true,
        format: formatAmount
      }));
    };

    // Set all columns using the helper function
    this.columns_yy_up = createColumns(responseData.YY_Detail?.UP_data);
    this.columns_yy_down = createColumns(responseData.YY_Detail?.DOWN_data);
    this.columns_ny_up = createColumns(responseData.NY_Detail?.UP_data);
    this.columns_ny_down = createColumns(responseData.NY_Detail?.DOWN_data);
    this.columns_nn_up = createColumns(responseData.NN_Detail?.UP_data);
    this.columns_nn_down = createColumns(responseData.NN_Detail?.DOWN_data);
  }

  setData(responseData: any) {
    // Wrap single objects in arrays for table component
    this.data_yy_up = [responseData.YY_Detail.UP_data[1]];
    this.data_yy_down = [responseData.YY_Detail.DOWN_data[1]];
    this.data_ny_up = [responseData.NY_Detail.UP_data[1]];
    this.data_ny_down = [responseData.NY_Detail.DOWN_data[1]];
    this.data_nn_up = [responseData.NN_Detail.UP_data[1]];
    this.data_nn_down = [responseData.NN_Detail.DOWN_data[1]];
  }

  exportBtnLoding = false;
  pdfBtnLoding = false;

  onExportExcel() {
    // 檢查 TXN_Date 是否有值
    if (!this.queryForm.value.TXN_Date) {
      this.messageService.errorBubble('請選擇銷售日期');
      return;
    }
    this.exportBtnLoding = true;
    // 呼叫 exportTLS2C010
    this.tls2c010Service.exportTLS2C010({
      FileName: '專櫃日暫存傳票報表',
      ReportTitle: '專櫃日暫存傳票報表',
      queryTLS2C010Request: {
        TXN_Date: this.datePipe.transform(this.queryForm.value.TXN_Date, 'yyyy-MM-dd') || ''
      }
    }).pipe(untilDestroyed(this))
      .subscribe({
        next: (response: HttpResponse<Blob>) => {
          if (response.body) {
            const contentDisposition = response.headers.get('content-disposition');
            let filename = '專櫃日暫存傳票報表.xlsx';
            if (contentDisposition) {
              const filenameRegex = /filename\*=UTF-8''(.+?)(?:\.xlsx)?$|filename="(.+?)(?:\.xlsx)?"$/;
              const matches = contentDisposition.match(filenameRegex);
              if (matches) {
                filename = matches[1] || matches[2] || filename;
                filename = decodeURIComponent(filename);
              }
              filename = filename.replace(/["']/g, '');
            }
            const blob = new Blob([response.body], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            saveAs(blob, filename);
            this.messageService.successBubble('匯出Excel成功');
            this.exportBtnLoding = false;
          } else {
            this.messageService.errorBubble('匯出Excel失敗：檔案內容為空');
          }
        },
        error: (err: any) => {
          this.messageService.errorBubble('匯出Excel失敗');
        }
      });
  }

  onExportPdf() {
    // 檢查 TXN_Date 是否有值
    if (!this.queryForm.value.TXN_Date) {
      this.messageService.errorBubble('請選擇銷售日期');
      return;
    }
    this.pdfBtnLoding = true;
    // 呼叫 exportTLS2C010PDF
    this.tls2c010Service.exportTLS2C010PDF({
      FileName: '專櫃日暫存傳票報表',
      ReportTitle: '專櫃日暫存傳票報表',
      queryTLS2C010Request: {
        TXN_Date: this.datePipe.transform(this.queryForm.value.TXN_Date, 'yyyy-MM-dd') || ''
      }
    }).pipe(untilDestroyed(this))
      .subscribe({
        next: (response: HttpResponse<Blob>) => {
          if (response.body) {
            // 從 response header 取得檔案名稱
            const contentDisposition = response.headers.get('content-disposition');
            let filename = '專櫃日暫存傳票報表.pdf';
            if (contentDisposition) {
              const filenameRegex = /filename\*=UTF-8''(.+?)(?:\.pdf)?$|filename="(.+?)(?:\.pdf)?"$/;
              const matches = contentDisposition.match(filenameRegex);
              if (matches) {
                filename = matches[1] || matches[2] || filename;
                filename = decodeURIComponent(filename);
              }
              filename = filename.replace(/["']/g, '');
            }
            const blob = new Blob([response.body], { type: 'application/pdf' });
            saveAs(blob, filename);
            this.messageService.successBubble('匯出PDF成功');
            this.pdfBtnLoding = false;
          } else {
            this.messageService.errorBubble('匯出PDF失敗：檔案內容為空');
          }
        },
        error: (err: any) => {
          this.messageService.errorBubble('匯出PDF失敗');
        }
      });
  }
}