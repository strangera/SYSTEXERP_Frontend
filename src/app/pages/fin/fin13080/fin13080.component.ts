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
import { Fin13080Service } from 'src/app/service/api/fin/fin13080.service';
import { yesterday } from '@shared/models/system/query-form.model';


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
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  queryForm = this.formBuilder.group({
    No: [null, Validators.maxLength(16)],
    Date: [yesterday],
    INV_DeclareYM: [new Date()],
    Invoice_No_Start: [null, Validators.maxLength(8)],
    Invoice_No_End: [null, Validators.maxLength(8)],
    ...createPaginationConfig([{ field: 'No', order: 1 }]),
  });

  selectedItems: any[] = [];
  data: any[] = [];
  totalRecords = 0;
  Date: Date | null = null;

  columns: any[] = [
    { field: 'ID', header: '退回/折讓單號', visible: true },
    { field: 'Date', header: '退回/折讓日期', visible: true },
    { field: 'INV_DeclareYM', header: '發票年月', visible: true },
    { field: 'Invoice_No', header: '發票號碼', visible: true }
  ];

  constructor(
    private fin13080Service: Fin13080Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN13080', '/FIN/FIN13080cru', this.queryForm, (form) => this.onSubmit(form));

  }


  onSubmit(form: FormGroup): void {
    this.submitted = true;
    if (form.invalid) return;
    this.loading = true;

    const raw = form.value;
    const payload = {
      PageSize: raw.pageSize ?? 20,
      PageIndex: raw.pageIndex ?? 1,
      OrderBy: '',
      Offset: 0,
      SortBy: raw.SortBy ?? [{ field: 'No', order: 1 }],
      No: raw.No ?? '',
      Date: raw.Date ? this.formatDate(new Date(raw.Date)) : '',
      INV_DeclareYM: raw.INV_DeclareYM
        ? this.formatDate(new Date(raw.INV_DeclareYM)).substring(0, 7).replace('-', '') // e.g. "202509"
        : '',
      Invoice_No_Start: raw.Invoice_No_Start ? Number(raw.Invoice_No_Start) : null,
      Invoice_No_End: raw.Invoice_No_End ? Number(raw.Invoice_No_End) : null
    };


    this.fin13080Service.queryFIN13080(payload).subscribe({
      next: (res) => {
        this.data = (res?.Data ?? []).map((item: { Date?: string }) => ({
          ...item,
          Date: item.Date ? this.formatDate(new Date(item.Date)) : ''
        }));
        this.totalRecords = res?.TotalCount ?? this.data.length;
        this.loading = false;
      },
      error: (err) => {
        console.error('查詢 FIN13080 失敗:', err);
        this.messageService.errorBubble('查詢失敗，請稍後再試');
        this.loading = false;
      }
    });
  }

  // 刪除（或更新）
  // onDelete(rowData: any[]) {
  //   this.messageService.confirm({
  //     header: '是否確認刪除',
  //     accept: () => {
  //       this.fin13080Service.updateFIN13080({
  //         idList: rowData.map(item => item.id)
  //       }).subscribe((res) => {
  //         if (res.Status === '0000') {
  //           this.messageService.successBubble('刪除成功');
  //           this.onSubmit(this.queryForm);
  //         } else {
  //           this.messageService.errorBubble(res.Message);
  //         }
  //       });
  //     }
  //   });
  // }
}
