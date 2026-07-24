import { Component, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { TableComponent } from '@others/component/table/table.component';
import { fin13090Item, Fin13090Service } from '@service/api/fin/fin13090.service';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarRangeComponent } from '@shared/components/calendar-range/calendar-range.component';
import { InputTextRangeComponent } from '@shared/components/input-text-range/input-text-range.component';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { MultiSelectComponent } from '@shared/components/multi-select/multi-select.component';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs';
import { Column, createPaginationConfig, formatDate } from 'src/app/others/component/table/table.model';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';


@Component({
  selector: 'app-fin13090',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    TranslateModule,
    ReactiveFormsModule,
    CalendarRangeComponent,
    InputTextRangeComponent,
    MultiSelectComponent,
    TableComponent,
    ButtonModule,
  ],
  templateUrl: './fin13090.component.html'
})
export class FIN13090Component extends BasicQueryPageComponent<fin13090Item> implements OnInit {
  queryForm = this.formBuilder.group({
    VouNoStart: [null], // 傳票編號_起
    VouNoEnd: [null], // 傳票編號_迄
    VouDateStart: [new Date()], // 傳票日期_起 (預設當日)
    VouDateEnd: [new Date()], // 傳票日期_迄 (預設當日)
    InvoiceStatus: [[]], // 發票狀態多選：Y=發票已入 N=發票未入 空=全部

    ...createPaginationConfig([{ field: 'VouNo', order: 1 }]),
  });

  invoiceStatusOptions = [
    { label: '發票已入', value: 'Y' },
    { label: '發票未入', value: 'N' },
  ];

  selectedItems: fin13090Item[] = [];
  data: fin13090Item[] = [];
  totalRecords = 0;
  lastQueryBody: any = null;
  editDisabled = (row: fin13090Item): boolean => !!row?.IsLocked;
  columns: Column[] = [
    { field: 'VouNo', header: '傳票編號', visible: true },
    { field: 'VouDate', header: '傳票日期', visible: true, format: formatDate },
    // { field: 'PostFlag', header: '傳票狀態代碼', visible: true }, // (1=建立 2=確認 3=過帳)
    { field: 'PostFlagName', header: '傳票狀態', visible: true },
    // { field: 'TaxTotal', header: '進項稅額貸方', visible: true, format: formatAmount, align: 'right' },
  ];

  constructor(
    private fin13090Service: Fin13090Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN13090', '/FIN/FIN13090cru', this.queryForm, (form) => this.onSubmit(form));
    // 操作說明:
    // 1.輸入查詢條件後,按查詢
    // 2.點選列表資料後,顯示列表明細畫面進行輸入
  }

  onSubmit(frm: FormGroup): void {
    console.log('補登進項稅額作業_request:', JSON.stringify(frm.value, null, 2));
    this.handleSubmit(frm, () => {
      this.queryStateService.setQueryState(this.ProgNo, frm.value);
      this.fin13090Service.queryFIN13090(this.queryForm.value).pipe(untilDestroyed(this), finalize(() => (this.loading = false))).subscribe((response) => {
        this.lastQueryBody = frm.value;
        this.data = response.Data;
        this.totalRecords = response.TotalCount || response.Data.length;
      });
    });
  }
}
