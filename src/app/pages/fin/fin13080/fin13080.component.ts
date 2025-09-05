import { Component, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { createPaginationConfig } from 'src/app/shared/componentkit/table/table.model';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { TooltipModule } from 'primeng/tooltip';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { InputNumberComponent } from "@shared/componentkit/input-number/input-number.component";
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
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
    No: ['', Validators.maxLength(16)],
    Date: [yesterday],
    INV_DeclareYM: [''],
    Invoice_No_Start: ['', Validators.maxLength(8)],
    Invoice_No_End: ['', Validators.maxLength(8)],

    ...createPaginationConfig([{ field: 'ECR_No', order: 1 }]),
  });

  selectedItems: any[] = [];
  data: any[] = [];
  totalRecords = 0;

   columns: any[] = [
    { field: 'No', header: '退回/折讓單號', visible: true },
    { field: 'Date', header: '退回/折讓日期', visible: true },
    { field: 'INV_DeclareYM', header: '發票年月', visible: true },
    { field: 'Invoice_No', header: '發票號碼', visible: true }
  ]

  constructor(

  ) {
    super();
  }



  ngOnInit(): void {
    this.initializePage('TLS22010', '/TLS/TLS22010cru', this.queryForm);

  }

  onSubmit(form: FormGroup): void {
    this.submitted = true;
    if (form.invalid) return;

    this.loading = true;


  }
  // onDelete(rowData: FIN13080Data[]) {
    // this.messageService.confirm({
    //   header: '是否確認刪除',
    //   accept: () => {
    //     this.fin13080Service.deleteFIN13080({
    //       idList: rowData.map(item => item.id)
    //     }).subscribe((res) => {
    //       if (res.Status === '0000') {
    //         this.messageService.successBubble('刪除成功');
    //         this.onSubmit(this.queryForm);
    //       } else {
    //         this.messageService.errorBubble(res.Message);
    //       }
    //     });
    //   }
    // });
  // }

}

