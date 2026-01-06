import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { SYSBR00Service } from '../../../service/api/sys/sysbr00.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';

const QUERY_STORAGE_KEY = 'sysbr00Query';

@Component({
  selector: 'app-sysbr00',
  templateUrl: './sysbr00.component.html',
  styleUrls: ['./sysbr00.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    TableComponent,
  ],
})


// constructor(private sysbr00Service: SYSBR00Service) {    super();  }
export class SYSBR00Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    City_No: ['', [Validators.maxLength(4)]],
    City_Name: ['', [Validators.maxLength(8)]],
    City_Group: ['', [Validators.maxLength(6)]],
  });
  data: any = [];
  selectedItems: any = [];
  columns: any[] = [
    { field: 'CITY_No', header: '縣市代號' },
    { field: 'CITY_Name', header: '縣市名稱' },
    { field: 'CITY_Group', header: '群組' }
  ];
  constructor(private sysbr00Service: SYSBR00Service) { super(); }

  ngOnInit(): void {
    this.initializePage("SYSBR00", "/sys/sysbr00cru");
    this.handleQueryRestore(this.queryForm, QUERY_STORAGE_KEY, (form) => this.onSubmit(form));
  }
  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      this.sysbr00Service.queryCitiesByCondition(form.value).subscribe((response) => {
        this.data = response.Data;
        this.queryStateService.setQueryState(QUERY_STORAGE_KEY, form.value);
        this.loading = false;
      });
    });
  }

  deleteRow(rows: any[]): void {
    this.messageService.confirm({
      header: '刪除縣市', message: '是否確認刪除縣市', icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (Array.isArray(rows)) {
          rows.forEach((row: any) => {
            this.sysbr00Service.deleteCity(row.CITY_ID).subscribe(() => {
              this.onSubmit(this.queryForm); // 刪除後重新查詢
            });
          });
        }
      },
    });
  }
}



