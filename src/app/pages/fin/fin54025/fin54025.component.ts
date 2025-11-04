
import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { createPaginationConfig } from '@shared/componentkit/table/table.model';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonModule } from 'primeng/button';
import { NgStyle, NgIf, DatePipe } from '@angular/common';
@Component({
  selector: 'app-fin54025',
  templateUrl: './fin54025.component.html',
  styleUrl: './fin54025.component.scss',
  standalone: true,
  imports: [NgStyle,
    NgIf, ButtonModule, MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputNumberRangeComponent, CalendarRangeComponent, ButtonComponent, TableComponent, TranslateModule]
})

export class FIN54025Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    SSubpoenadate: [new Date(), [Validators.required]],
    ESubpoenadate: [new Date(), [Validators.required]],
    startserialticket: [''],
    endserialticket: [''],
    ...createPaginationConfig([{ field: 'ECR_Group', order: 1 }]),
  });
  selectedItems: any[] = [];
  totalRecords = 0;
  data: any[] = [];

  get selectedCount(): number {
    return this.selectedItems?.length ?? 0;
  }
  columns: any[] = [
    { field: 'invoiceNumber', header: '傳票號碼', visible: true },
    { field: 'invoiceCategory', header: '傳票種類', visible: true },
    { field: 'invoiceDate', header: '傳票日期', visible: true },
    { field: 'invoiceStatus', header: '傳票狀態', visible: true },
    { field: 'invoiceSummary', header: '傳票摘要', visible: true },
    { field: 'invoiceType', header: '傳票型態', visible: true },
    { field: 'invoiceAmount', header: '傳票金額', visible: true },
    { field: 'detailCount', header: '明細筆數', visible: true }
  ];
  // TypeScript Options

  constructor(

  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('FIN54025', '/FIN/FIN54025CRU', this.queryForm, (frm) => this.onSubmit(frm));
  }
  onReview(selectedItems: any[]): void {
    if (!selectedItems || selectedItems.length === 0) {
      this.messageService.warnBubble('請先勾選要審核的項目');
      return;
    }

    // // 依照 API 格式，包成 selectList
    // const payload = {
    //   PAY_Type: this.PAY_Type,
    //   selectList: selectedItems.map(item => ({
    //     ID: item.ID,
    //     PAY_NO: item.PAY_NO,
    //   }))
    // };
    // this.loading = true;
    // this.tls2a010Service.updateTLS2A010(payload).subscribe({
    //   next: () => {
    //     this.messageService.successBubble('審核完成');
    //     this.onSubmit(this.queryForm);
    //     this.loading = false;
    //   },
    // });
  }
  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {

    });
  }

}
