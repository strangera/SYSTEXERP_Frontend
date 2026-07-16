import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { DeleteTLS51140Request, QueryTLS51140Request, QueryTLS51140ResponseData, Tls51140Service } from '@service/api/tls/tls51140.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { MultiSelectComponent } from '@shared/components/multi-select/multi-select.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { Column } from '@others/component/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-tls51140',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    MultiSelectComponent,
    ButtonComponent,
    TranslateModule,
    TableReportComponent,
    AsyncPipe
  ],
  templateUrl: './tls51140.component.html'
})
export class Tls51140Component extends BasicQueryPageComponent<QueryTLS51140ResponseData> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    ECR_No: [null],
    TLT_NO: [null],
    PageSize: [30],
    PageIndex: [1],
  });
  totalRecords = 0;
  data: QueryTLS51140ResponseData[] = [];
  selectedItems: QueryTLS51140ResponseData[] = [];
  lastQueryBody: QueryTLS51140Request | null = null;
  columns: Column[] = [
    { field: 'TLT_NO', header: '專櫃編號' },
    { field: 'TLT_Name', header: '專櫃名稱' },
    { field: 'HOS_No', header: '倉庫代碼' },
    { field: 'HOS_Name', header: '倉庫名稱' },
  ];
  ECR_NoOptions = this.dropdown.queryPos1002EcrType({ ECR_Type: '1' });
  TLT_NoOptions = this.dropdown.queryTltTalentStoreWay({ store_way: '2' });

  constructor(
    public readonly tls51140Service: Tls51140Service,
    private readonly dropdown: DropdownApiService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS51140', 'tls/tls51140cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const request = this.queryForm.getRawValue();
      this.tls51140Service.queryTLS51140(request).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
        this.data = res.Data;
        this.lastQueryBody = request;
        this.totalRecords = res.TotalCount;
        this.queryStateService.setQueryState(this.ProgNo, this.queryForm.value);
      });
    });
  }
  onDelete(event: QueryTLS51140ResponseData[]) {
    if (!event || !event.length) {
      return;
    }
    this.messageService.confirm({
      header: '刪除確認',
      message: '確定要刪除選取的資料嗎?',
      accept: () => {
        const request: DeleteTLS51140Request = {
          TLT_NO_List: event.map(item => item.TLT_NO)
        };
        this.loading = true;
        this.tls51140Service.deleteTLS51140(request).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
          if (res.Status === '0000') {
            this.messageService.successBubble(res.Message);
            this.onSubmit(this.queryForm);
          } else {
            this.messageService.errorBubble(res.Message);
          }
        });
      },
    })
  }
}
