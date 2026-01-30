import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { FIN62030Data, FIN62030Service, QueryFIN62030Request } from '@service/api/fin/fin62030.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { DropdownComponent } from "@shared/componentkit/dropdown/dropdown.component";
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { Column, formatAmount, formatDate } from '@shared/componentkit/table/table.model';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';

@Component({
  selector: 'app-fin62030',
  templateUrl: './fin62030.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TableReportComponent,
    TranslateModule,
    DropdownComponent,
    ButtonModule
  ]
})
export class FIN62030Component extends BasicQueryPageComponent<FIN62030Data> implements OnInit {
  queryForm = this.formBuilder.group({
    Tran_NoFrom: [null],   // 調撥單號(起)
    Tran_NoTo: [null],   // 調撥單號(迄)
    pageSize: [30],
    pageIndex: [1], // 你將初始頁碼改為 1
  });

  data: FIN62030Data[] = [];
  selectedItems: FIN62030Data[] = [];
  lastQueryBody: QueryFIN62030Request | null = null;
  totalRecords = 0;
  tranNoOptions: any[] = [];

  columns: Column[] = [
    { field: 'Tran_No', header: '調撥單號' },
    { field: 'CRT_Date', header: '建立日期', format: formatDate },
    { field: 'Tran_Date', header: '轉帳日期', format: formatDate },
    { field: 'BNK_No_In', header: '調入銀行' },
    { field: 'BNK_Name_In', header: '調入帳號' },
    { field: 'BNK_No_Out', header: '調出銀行' },
    { field: 'BNK_Name_Out', header: '調出帳號' },
    { field: 'Tran_Amt', header: '金額', format: formatAmount },
    { field: 'Fee_Amt', header: '手續費', format: formatAmount },
    { field: 'Remark', header: '備註' }
  ];

  constructor(
    public readonly fin62030Service: FIN62030Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN62030', 'fin/fin62030cru', this.queryForm, (form) => this.onSubmit(form));
    this.fin62030Service.queryAPS4001Tran_No().subscribe(res => {
      this.tranNoOptions = res.Data.map((tranNo: string) => ({ label: tranNo, value: tranNo }));
    });
  }

  onSubmit(form: FormGroup) {
    this.handleSubmit(form, () => {
      this.fin62030Service.queryFIN62030(form.getRawValue())
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe(response => {
          this.data = response.Data;
          this.lastQueryBody = form.getRawValue();
          this.totalRecords = response.TotalCount;
          this.queryStateService.setQueryState(this.ProgNo, form.getRawValue());
        });
    });
  }

  onPreview() {
    this.navigateWithState(CRUDStatus.Edit, this.selectedItems, this.queryStateService.getQueryStateValue(this.ProgNo));
  }
}
