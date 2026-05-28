import { AsyncPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { QueryTLS46030Request, QueryTLS46030Response, Tls46030Service } from '@service/api/tls/tls46030.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { formatDate, formatDateTime, ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableReportComponent } from './table-report/table-report.component';
// 2.4.6.4  收銀機異動排程維護
@Component({
  selector: 'app-tls46030',
  templateUrl: './tls46030.component.html',
  standalone: true,
  imports: [AsyncPipe, MenubarComponent, ButtonComponent, DropdownComponent, AccordionModule, FormsModule, ReactiveFormsModule, TableReportComponent, CalendarRangeComponent, TranslateModule, InputTextComponent]
})
export class TLS46030Component extends BasicQueryPageComponent<QueryTLS46030Response> implements OnInit {
  private readonly dropDown = inject(DropdownApiService);
  public tls46030Service = inject(Tls46030Service);
  queryForm = this.formBuilder.group({
    ECR_SchNo: [null], // 排程編號
    ECR_SchDate_Start: [null], // 設定啟用日期(起)
    ECR_SchDate_End: [null], // 設定啟用日期(訖)
    ECR_SchStatus: [null], // 排程狀態
    ECR_No: [null], // 收銀機編號
    ECR_SchFinTime_Start: [null], // 排程作業完成時間(起)
    ECR_SchFinTime_End: [null], // 排程作業完成時間(訖)
    ECR_FLD_ID: [null], // 異動類型
    pageSize: [30],
    pageIndex: [1], // 你將初始頁碼改為 1
    SortBy: [[{ field: 'ECR_SchNo', order: 1 }]],
  });
  ECR_FLD_IDOptions = getSYS1000Options('ECR_FLD_ID');
  ECR_SchStatus_Options = getSYS1000Options('ECR_SchStatus');
  ECRNoOptions = this.dropDown.queryPos1002();
  data: QueryTLS46030Response[] = [];
  lastQueryParams: QueryTLS46030Request | null = null;
  totalRecords = 0;
  columns: ReportColumn[] = [
    { field: 'ECR_SchNo', header: '排程編號' },
    { field: 'ECR_SchDate', header: '設定啟用日期', format: formatDate },
    { field: 'ECR_SchStatus', header: '排程狀態' },
    { field: 'ECR_No', header: '收銀機號' },
    { field: 'ECR_Name', header: '收銀機名稱' }, // 新增這行
    { field: 'ECR_FLD_ID', header: '異動類型' },
    { field: 'ECR_FLD_OrgVal_Display', header: '原設定值' },
    { field: 'ECR_FLD_NewVal_Display', header: '新設定值' },
    { field: 'ECR_SchFinTime', header: '異動作業完成時間', format: formatDateTime },
  ];
  public editDisabled = (rowData: QueryTLS46030Response): boolean => rowData.ECR_SchStatus === 'F';
  constructor() { super(); }

  ngOnInit(): void {
    this.initializePage('TLS46030', 'TLS/TLS46030cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const frmValue = frm.value;
      this.tls46030Service.queryTLS46030(frmValue).pipe(finalize(() => this.loading = false)).subscribe((res) => {
        this.lastQueryParams = frmValue;
        this.data = res.Data;
        this.totalRecords = res.TotalCount;
        this.queryStateService.setQueryState(this.ProgNo, frmValue);
      });
    })
  }
}
