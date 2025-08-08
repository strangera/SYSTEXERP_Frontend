import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig, Column } from '../../../shared/componentkit/table/table.model';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { FIN11070Data, FIN11070Service } from '@service/api/fin/fin11070.service';

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
    DeclareYearMonth: [null, Validators.required],    // 申報年月
    ...createPaginationConfig([{ field: 'ID', order: 1 }])
  });

  totalRecords = 0;
  data: FIN11070Data[] = [];
  selectedItems: FIN11070Data[] = [];

  columns: Column[] = [
    {
      field: 'UploadProcessTime',
      header: '上傳處理時間',
      visible: true,
    },
    { field: 'ProcessResultDescription', header: '處理結果說明', visible: true }
  ];

  constructor(
    private fin11070Service: FIN11070Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN11070', 'fin/fin11070cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.fin11070Service.queryFIN11070(frm.value)
        .pipe(finalize(() => this.loading = false))
        .subscribe(response => {
          this.data = response.Data;
          this.totalRecords = response.TotalCount;
          this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
        });
    });
  }

  onExport() {
    // TODO: 待實作
  }
}