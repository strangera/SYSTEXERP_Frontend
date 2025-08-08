import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { DatePipe } from '@angular/common';
import { FIN15060Service, FIN15060Data, FIN15060QueryRequest } from '../../../service/api/fin/fin15060.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { AccordionModule } from 'primeng/accordion';
import { TranslateModule } from '@ngx-translate/core';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';

@Component({
  selector: 'app-fin15060',
  templateUrl: './fin15060.component.html',
  styleUrl: './fin15060.component.scss',
  standalone: true,
  imports: [
    MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule,
    InputTextComponent, DropdownComponent, TableComponent, TranslateModule, CalendarComponent
  ]
})
export class FIN15060Component extends BasicQueryPageComponent<FIN15060Data> implements OnInit {
  queryForm = this.formBuilder.group({
    DeclareMonth: [null, [Validators.required]],     // 申報年月
    TaxCode: ['', [Validators.required, Validators.maxLength(5)]], // 稅籍編號
    ...createPaginationConfig()
  });

  totalRecords = 0;
  data: FIN15060Data[] = [];
  selectedItems: FIN15060Data[] = [];

  columns: Column[] = [
    { field: 'InvoiceDate', header: '開立發票(日期)', visible: true },
    { field: 'InvoiceNumber', header: '開立發票(字軌號碼)', visible: true },
    { field: 'BuyerName', header: '買受人(名稱)', visible: true },
    { field: 'BuyerUniform', header: '買受人(統一編號)', visible: true },
    { field: 'ItemName', header: '貨物或勞務(名稱)', visible: true },
    { field: 'ItemQty', header: '貨物或勞務(數量)', visible: true },
    { field: 'ExportType', header: '外銷方式', visible: true },
    { field: 'ProofDocName', header: '證明文件(名稱)', visible: true },
    { field: 'ProofDocNumber', header: '證明文件(號碼)', visible: true },
    { field: 'ProofDocAmount', header: '證明文件(金額)', visible: true },
    { field: 'ExportDeclType', header: '出口報單(類別)', visible: true },
    { field: 'ExportDeclNumber', header: '出口報單(號碼)', visible: true },
    { field: 'ExportDeclAmount', header: '出口報單(金額)', visible: true }
  ];

  constructor(
    private fin15060Service: FIN15060Service,
    private validationService: ValidationService,
    private datePipe: DatePipe,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN15060', 'fin/fin15060cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    const fin15060QueryRequest: FIN15060QueryRequest = {
      ...frm.value
    };
    this.handleSubmit(frm, () => {
      this.fin15060Service.queryFIN15060(fin15060QueryRequest)
        .pipe(finalize(() => this.loading = false))
        .subscribe(response => {
          this.data = response.Data;
          this.totalRecords = response.TotalCount;
          this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
        });
    });
  }
}