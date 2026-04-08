import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Fin31010Service, QueryFin31010Request, QueryFin31010Response } from '@service/api/fin/fin31010.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { Column, formatDateTime } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';

//1.3.1.1 收款項目對照會計科目維護
@Component({
  selector: 'app-fin31010',
  templateUrl: './fin31010.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    TableReportComponent,
    TranslateModule,
    MultiSelectComponent,
    AsyncPipe
  ]
})
export class FIN31010Component extends BasicQueryPageComponent<QueryFin31010Response> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    CAP_Item: [null, [Validators.maxLength(2)]], // 收款項目代號
    CAP_Name: [null, [Validators.maxLength(30)]], // 收款項目名稱
    AccNo: [null], // 會計科目代號
    Remark: [null, [Validators.maxLength(100)]], // 備註
    pageSize: [30],
    pageIndex: [1],
    SortBy: [[{ field: 'CAP_Item', order: 1 }]],
  });
  totalRecords = 0;
  lastQueryBody: QueryFin31010Request | null = null;
  data: QueryFin31010Response[] = [];
  columns: Column[] = [
    { field: 'CAP_Item', header: '收款項目代號', visible: true },
    { field: 'CAP_Name', header: '收款項目名稱', visible: true },
    { field: 'AccNo', header: '會計科目代號', visible: true },
    { field: 'AccCname', header: '會計科目名稱', visible: true },
    { field: 'Remark', header: '備註', visible: true },
    { field: 'CRT_Date', header: '建立日期', visible: false, format: formatDateTime },
    { field: 'CRT_USR_No', header: '建立人員', visible: false },
    { field: 'CRT_USR_Name', header: '建立人員名稱', visible: false },
    { field: 'UPD_Date', header: '變更日期', visible: false, format: formatDateTime },
    { field: 'UPD_USR_No', header: '變更人員', visible: false },
    { field: 'UPD_USR_Name', header: '變更人員名稱', visible: false },
  ];
  selectedRows: QueryFin31010Response[] = [];
  AccNoOptions = this.dropdown.queryGls1005_ledgerMD();
  constructor(
    public readonly fin31010Service: Fin31010Service,
    private readonly dropdown: DropdownApiService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('FIN31010', 'fin/fin31010cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.fin31010Service.queryFin31010(frm.value).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(response => {
        this.data = response.Data
        this.lastQueryBody = frm.value;
        this.totalRecords = response.TotalCount;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      });
    });
  }
  onDelete() {
    this.messageService.confirm({
      header: `是否確定刪除 ${this.selectedRows.length} 筆資料?`,
      accept: () => {
        const capItems = this.selectedRows.map(item => item.CAP_Item);
        this.fin31010Service.deleteFin31010(capItems).subscribe(res => {
          this.messageService.successBubble(res.Message);
          this.onSubmit(this.queryForm); // 重新載入資料
        });
      }
    })
  }
}
