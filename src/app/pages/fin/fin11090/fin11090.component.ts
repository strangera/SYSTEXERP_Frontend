import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { FIN11090Data, Fin11090Service } from '../../../service/api/fin/fin11090.service';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';

@Component({
  selector: 'app-fin11090',
  templateUrl: './fin11090.component.html',
  styleUrl: './fin11090.component.scss',
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarComponent, InputTextComponent, ButtonComponent, TableComponent, TranslateModule, CalendarRangeComponent]
})
export class FIN11090Component extends BasicQueryPageComponent<FIN11090Data> implements OnInit {
  queryForm = this.formBuilder.group({
    invoice_date: ['', [Validators.required]],
    cashier_no: ['', [Validators.required, Validators.maxLength(10)]],
    txn_seq: ['', [Validators.required, Validators.maxLength(10)]],
    prefix: ['', [Validators.required, Validators.maxLength(2)]],
    invoice_no: ['', [Validators.required, Validators.maxLength(8)]],
    void_date_from: [''],    // 作廢日期(起)
    void_date_to: [''],      // 作廢日期(迄)
    void_user: [''],          // 作廢人員
    ...createPaginationConfig([{ field: 'invoice_date', order: -1 }]),
  });
  totalRecords = 0;
  data: FIN11090Data[] = [];
  selectedItems: FIN11090Data[] = [];
  columns: Column[] = [
    { field: 'invoice_date', header: '發票日期', visible: true },
    { field: 'prefix', header: '字軌', visible: false },
    { field: 'invoice_no', header: '發票號碼', visible: true },
    { field: 'cashier_no', header: '收銀機號', visible: true },
    { field: 'txn_seq', header: '交易序號', visible: true },
    { field: 'invoice_amt', header: '交易金額', visible: true },
    { field: 'void_date', header: '作廢日期', visible: true },
    { field: 'void_user', header: '作廢人員', visible: true }
  ];

  constructor(private fin11090Service: Fin11090Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN11090', 'fin/fin11090cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.fin11090Service.queryFIN11090(frm.value).pipe(finalize(() => this.loading = false)).subscribe(response => {
        this.data = response.Data;
        this.totalRecords = response.TotalCount;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      });
    });
  }

  isRowSelectable(rowData: FIN11090Data): boolean {
    // 可根據業務規則調整
    return true;
  }

  onConfirm(selected: FIN11090Data[]) {
    // 實際業務可根據需求實作
    if (selected && selected.length) {
      // 例如送出選取資料
      // this.fin11090Service.insertFIN11090(selected).subscribe(...)
      this.messageService.successBubble('取消作廢紀錄並同步更新發票狀態');
    }
  }
}
