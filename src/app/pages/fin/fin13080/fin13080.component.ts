import { Component, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { IDropdownItem } from 'src/app/service/utility/dropDownList.service';
import { createPaginationConfig } from 'src/app/shared/componentkit/table/table.model';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { TooltipModule } from 'primeng/tooltip';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { InputNumberComponent } from "@shared/componentkit/input-number/input-number.component";
import {InputTextComponent} from '@shared/componentkit/input-text/input-text.component';
import { TableComponent } from '@shared/componentkit/table/table.component';

const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);

@Component({
  selector: 'app-fin13080',
  templateUrl: './fin13080.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    TranslateModule,
    ReactiveFormsModule,
    CalendarComponent,
    TooltipModule,
    InputNumberComponent,
    InputTextComponent,
    TableComponent
],
})
export class FIN13080Component extends BasicQueryPageComponent<any> implements OnInit {

  queryForm = this.formBuilder.group({
  No: [yesterday, Validators.required],
    Date: [''],
    INV_DeclareYM: [''],
    Invoice_No_Start: [''],
    Invoice_No_End: [''],

    ...createPaginationConfig([{ field: 'ECR_No', order: 1 }]),
  });
  //  { validators: this.validateRangeStartBeforeEnd });
  ECR_Options: { label: string; value: string }[] = [];

  payNoToTypeMap = new Map<string, string>();
  selectedItems: any[] = [];
  selectionMode = 'single';
  data: any[] = [];
  footerData: any[] = [];
  totalRecords = 0;
  PAY_NO = '';
  PAY_Type = '';
  TXN_Date = '';
  todayDisplay = '';





  constructor(

  ) {
    super();
  }




  ngOnInit(): void {
    this.queryForm.patchValue({

    });
  }

  onSubmit(form: FormGroup): void {
    this.submitted = true;
    if (form.invalid) return;

    this.loading = true;


  }


}

