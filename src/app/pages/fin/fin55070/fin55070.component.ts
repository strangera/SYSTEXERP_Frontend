import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
// Shared
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';

import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { FIN55070Data, Fin55070Service } from '@service/api/fin/fin55070.service';
import {FIN52030Service} from'@service/api/fin/fin52030.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';

import { untilDestroyed } from '@ngneat/until-destroy';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-fin55070',
  templateUrl: './fin55070.component.html',
  styleUrl: './fin55070.component.scss',
  standalone: true,
  imports: [ButtonModule,TableModule,CommonModule,MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarRangeComponent, RadiobuttonComponent, DropdownComponent, CheckboxModule, ButtonComponent, TableComponent, TranslateModule]
})
export class FIN55070Component extends BasicQueryPageComponent<FIN55070Data> implements OnInit {

  ORG_IDOptions = this.dropdown.querySys3100();
  AccNo_Options=this.fin52030Service.getAccNoList();
  queryForm = this.formBuilder.nonNullable.group({
     DateFrom: [new Date(), [Validators.required]],
     DateTo: [new Date(), [Validators.required]],
     Ledger_MD: [''],
     OrgId: [],
     AccNoFrom: [],
     AccNoTo: [],
     ShowAll: [false],
     PrintSign: [false],
   });

  typeOptions: any[] = [
    { value: '', label: '全部' },
    { value: '0', label: '統制' },
    { value: '1', label: '明細' },
  ];
   display : any[] = [
      { value: true, label: '顯示' },
      { value: false, label: '不顯示' },

    ]



  // Table data
  data: any[] = [

  ];
  columns: any[] = [
   { field: 'AccNo', header: '科目代號', visible: true },
  { field: 'AccCname', header: '科目名稱', visible: true },
  { field: 'Prior_DAmt', header: '前期借方金額', visible: true },
  { field: 'Prior_CAmt', header: '前期貸方金額', visible: true },
  { field: 'Curr_DAmt', header: '本期借方金額', visible: true },
  { field: 'Curr_CAmt', header: '本期貸方金額', visible: true },
  { field: 'Total_DAmt', header: '累積借方金額', visible: true },
  { field: 'Total_CAmt', header: '累積貸方金額', visible: true }
  ];



  // TypeScript Options
  AccountcodeOptions: any[] = [];
  constructor(
    public readonly fin55070Service: Fin55070Service,
    public readonly fin52030Service: FIN52030Service,
    private readonly dropdown: DropdownApiService

  ) {
    super(); // 呼叫父類建構子
  }


  ngOnInit(): void {


  }

  onSubmit(frm: FormGroup) {
     this.handleSubmit(frm, () => {
          const body = {
            ...frm.value
          }
          this.fin55070Service.queryFIN55070(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(response => {
            this.data = response.Data
          });
        });
  }

  onClearForm() {
    this.queryForm.reset(); // 重置表單
  }

     loadCarsLazy(event: any) {
       
    }
    
      onExportPDF() {
        this.btnLoading = true;
      }
      btnLoading = false;
      onExportXLSX() {
        this.btnLoading = true;
      }

      getColumnSum(field: string): number {
  return this.data.reduce((sum, row) => sum + (Number(row[field]) || 0), 0);
}

}
