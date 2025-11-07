
import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { createPaginationConfig } from '@shared/componentkit/table/table.model';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';


// 2.2.18.1 換開品項維護作業
@Component({
  selector: 'app-tls2j010',
  templateUrl: './tls2j010.component.html',
  styleUrl: './tls2j010.component.scss',
  standalone: true,
  imports: [InputTextComponent, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, TableComponent, TranslateModule]
})
export class TLS2J010Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    CHG_ItemName: ['', [Validators.maxLength(10)]],
    ...createPaginationConfig([{ field: 'VouNo', order: 1 }]),
  });
  selectedItems: any[] = [];
  totalRecords = 0;
  data: any[] = [];
  columns: any[] = [
    { field: 'CRT_Date', header: '建立日期', visible: true },
    { field: 'CHG_ItemName', header: '品項名稱', visible: true },

  ];


  constructor(
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2J010', '/TLS/TLS2J010CRU', this.queryForm, (frm) => this.onSubmit(frm));
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {

    });
  }

}
