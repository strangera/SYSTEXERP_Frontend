import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { DatePipe } from '@angular/common';
import { FIN15050Service, FIN15050Data, FIN15050QueryRequest } from '../../../service/api/fin/fin15050.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { InputTextRangeComponent } from '../../../shared/componentkit/input-text-range/input-text-range.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { AccordionModule } from 'primeng/accordion';
import { TranslateModule } from '@ngx-translate/core';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';

@Component({
  selector: 'app-fin15050',
  templateUrl: './fin15050.component.html',
  styleUrl: './fin15050.component.scss',
  standalone: true,
  imports: [
    MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule,
    InputTextComponent, InputTextRangeComponent, DropdownComponent, TableComponent, TranslateModule,
    CalendarComponent
  ]
})
export class FIN15050Component extends BasicQueryPageComponent<FIN15050Data> implements OnInit {
  queryForm = this.formBuilder.group({
    DeclareMonth: [null],                            // 申報年月
    UsageType: [null],                                 // 使用別
    Character: ['', [Validators.maxLength(2)]],        // 字軌
    InvoiceNumberStart: ['', [Validators.maxLength(10)]], // 發票號碼_起
    InvoiceNumberEnd: ['', [Validators.maxLength(10)]],   // 發票號碼_迄
    ...createPaginationConfig()
  });

  totalRecords = 0;
  data: FIN15050Data[] = [];
  selectedItems: FIN15050Data[] = [];

  columns: Column[] = [
    { field: 'DeclareYearMonth', header: '申報年月', visible: true },
    { field: 'UsageType', header: '使用別', visible: true },
    { field: 'Character', header: '字軌', visible: true },
    { field: 'InvoiceNumber', header: '發票號碼', visible: true },
    { field: 'IssueDate', header: '開立日期', visible: true },
    { field: 'BuyerName', header: '買受人名稱', visible: true },
    { field: 'Amount', header: '金額', visible: true }
  ];

  usageTypeOptions = [
    { label: '自用', value: '自用' },
    { label: '轉售', value: '轉售' }
  ];

  constructor(
    private fin15050Service: FIN15050Service,
    private validationService: ValidationService,
    private datePipe: DatePipe,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN15050', 'fin/fin15050qry', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    const fin15050QueryRequest: FIN15050QueryRequest = {
      ...frm.value
    };
    this.handleSubmit(frm, () => {
      this.fin15050Service.queryFIN15050(fin15050QueryRequest)
        .pipe(finalize(() => this.loading = false))
        .subscribe(response => {
          this.data = response.Data;
          this.totalRecords = response.TotalCount;
          this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
        });
    });
  }
}