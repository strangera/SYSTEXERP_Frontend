import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { ButtonModule } from 'primeng/button';
import { AsyncPipe } from '@angular/common';
import { createPaginationConfig } from '@shared/componentkit/table/table.model';
import { Fin55070Service } from '@service/api/fin/fin55070.service';

@Component({
  selector: 'app-fin55110',
  templateUrl: './fin55110.component.html',
  styleUrl: './fin55110.component.scss',
  standalone: true,
  imports: [AsyncPipe, ButtonModule, TableComponent, MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarRangeComponent, DropdownComponent, ButtonComponent, TranslateModule]
})

export class FIN55110Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    SSubpoenadate: [new Date(), [Validators.required]],
    ESubpoenadate: [new Date(), [Validators.required]],
    ORG_ID: [''],
    AccNoFrom: [''],
    ...createPaginationConfig([{ field: 'ECR_Group', order: 1 }]),
  });

  ORG_IDOptions = this.dropdown.querySys3100();
  columns: any[] = [
    { field: 'SubpoenaDate', header: '科目' },
    { field: 'VouNo', header: '顧客代號/名稱' },
    { field: 'ORG_ID', header: '部門' },
    { field: 'Accountcode', header: '部門名稱' },
    { field: 'Accountcode', header: '活動' },
    { field: 'Accountcode', header: '借方金額' },
    { field: 'Accountcode', header: '貸方金額' },
    { field: 'Accountcode', header: '餘額' },
  ];
  Accountcode: any[] = [];
  totalRecords = 0;
  data: any[] = [];
  AccNo_Options = this.fin55070Service.getAccNoList();
  constructor(
    private dropdown: DropdownApiService,
    public readonly fin55070Service: Fin55070Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN55110', '/FIN/FIN55110CRU', this.queryForm, (frm) => this.onSubmit(frm));
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {

    });
  }
}
