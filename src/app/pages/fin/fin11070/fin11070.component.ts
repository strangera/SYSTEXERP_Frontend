import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig, Column, formatDate } from '../../../shared/componentkit/table/table.model';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { FIN11070Data, FIN11070Service } from '@service/api/fin/fin11070.service';
import { DatePipe } from '@angular/common';
import { untilDestroyed } from '@ngneat/until-destroy';
import { ValidationService } from '@shared/service/validation.service';

@Component({
  selector: 'app-fin11070',
  templateUrl: './fin11070.component.html',
  styleUrl: './fin11070.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarComponent,
    TableComponent,
    TranslateModule,
  ]
})
export class FIN11070Component extends BasicQueryPageComponent<FIN11070Data> implements OnInit {
  queryForm = this.formBuilder.group({
    GUI_YYMM: ['', [Validators.required, this.validationService.evenMonthValidator, this.validationService.maxMonthValidator]],    // 申報年月
    ...createPaginationConfig([])
  });

  totalRecords = 0;
  data: FIN11070Data[] = [];
  selectedItems: FIN11070Data[] = [];

  columns: Column[] = [
    {
      field: 'SYS_StoreNo',
      header: '分店編號',
      visible: true,
    },
    {
      field: 'TXN_No',
      header: '發票年月',
      visible: true,
    },
    {
      field: 'TXN_Time',
      header: '預計處理時間',
      visible: true,
      format: formatDate
    },
    {
      field: 'TXN_ProcStatus',
      header: '處理狀態',
      visible: true,
      format: (value: string) => value === 'Y' ? '已處理' : '待處理'
    },
    {
      field: 'TXN_RspnTime',
      header: '實際處理時間',
      visible: true,
      format: formatDate
    },
    {
      field: 'TXN_RspnCode',
      header: '回應代碼',
      visible: true,
    },
    {
      field: 'TXN_RspnMsg',
      header: '回應訊息',
      visible: true,
    }
  ];

  constructor(
    private fin11070Service: FIN11070Service,
    private datePipe: DatePipe,
    private validationService: ValidationService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN11070', 'fin/fin11070cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const requestData = {
        ...frm.value,
        MID: 0,                    // 固定為0
        SYS_StoreNo: '10',        // 固定為 '10'
        GUI_YYMM: this.PreviousMonth,  // 申報年月 (YYYYmm格式)
      };

      this.fin11070Service.queryFIN11070(requestData)
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe(response => {
          this.data = response.Data;
          this.totalRecords = response.TotalCount;
          this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
        });
    });
  }

  downloadFIN11070() {
    // 檢查必填欄位
    if (this.queryForm.controls['GUI_YYMM'].invalid) {
      this.queryForm.controls['GUI_YYMM'].markAsDirty();
      this.submitted = true;
      return;
    }
    const requestData = {
      MID: 0,
      STO_No: '10',
      GUI_YYMM: this.PreviousMonth,
    };

    this.fin11070Service.downloadFIN11070(requestData)
      .pipe(untilDestroyed(this), finalize(() => this.loading = false))
      .subscribe(response => {
        // 預設檔名
        let filename = 'download.txt';

        // 嘗試從 Content-Disposition 取檔名
        const contentDisposition = response.headers.get('content-disposition');
        if (contentDisposition) {
          const matches =
            /filename\*?=['"]?UTF-8''?([^;\n]*)/i.exec(contentDisposition) ||
            /filename="?([^;\n"]*)"?/i.exec(contentDisposition);

          if (matches && matches[1]) {
            filename = decodeURIComponent(matches[1]);
          }
        }

        // 建立 Blob
        const blob = new Blob([response.body!], { type: 'text/plain;charset=utf-8' });

        // 用 <a> 動態下載
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();

        // 清理
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      });
  }

  insertFIN11070() {
    // 檢查必填欄位
    if (this.queryForm.controls['GUI_YYMM'].invalid) {
      this.queryForm.controls['GUI_YYMM'].markAsDirty();
      this.submitted = true;
      return;
    }
    const requestData = {
      MID: 0,
      SYS_StoreNo: '10',
      GUI_YYMM: this.PreviousMonth,
    };

    this.fin11070Service.insertFIN11070(requestData)
      .pipe(untilDestroyed(this), finalize(() => this.loading = false))
      .subscribe(response => {
        if (response.Data[0].Status === '0') {
          this.messageService.errorBubble(response.Data[0].Errormsg);
        } else {
          this.messageService.successBubble('寫入產製空白發票成功');
          this.onSubmit(this.queryForm);
        }
      });
  }

  // 月份減少一個月
  get PreviousMonth(): string {
    let currentDate = this.queryForm.value.GUI_YYMM;
    let yyyyMM = '';
    if (currentDate) {
      yyyyMM = this.datePipe.transform(currentDate, 'yyyyMM') ?? '';
      let year = parseInt(yyyyMM.substring(0, 4));
      let month = parseInt(yyyyMM.substring(4, 6)) - 1;
      let date = new Date(year, month, 1);
      date.setMonth(date.getMonth() - 1);
      yyyyMM = this.datePipe.transform(date, 'yyyyMM') ?? '';
    }

    return yyyyMM;
  }
}