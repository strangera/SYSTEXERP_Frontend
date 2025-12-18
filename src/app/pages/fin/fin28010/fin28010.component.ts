
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Fin28010Service } from '@service/api/fin/fin28010.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { createPaginationConfig } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
@Component({
  selector: 'app-fin28010',
  templateUrl: './fin28010.component.html',
  standalone: true,
  imports: [CalendarComponent,
    ButtonModule, InputTextComponent, MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarRangeComponent, ButtonComponent, TableComponent, TranslateModule]
})

export class FIN28010Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    WSLIP_NO: ['', [Validators.maxLength(12)]],
    Voucher_Date: [null as Date | null, [Validators.required,]],
    ...createPaginationConfig([{ field: 'AccNo', order: 1 }]),
  });
  selectedItems: any[] = [];
  totalRecords = 0;
  data: any[] = [];
  btnLoading = false;
  selectAll = false;
  get selectedCount(): number {
    return this.selectedItems?.length ?? 0;
  }
  columns: any[] = [
    { field: 'AccNo', header: '科目代號', visible: true },
    { field: 'AccCName', header: '會計科目名稱', visible: true },
    { field: 'VEN_No', header: '廠商編號', visible: true },
    { field: 'VEN_Name', header: '廠商名稱', visible: true },
    { field: 'NoteDesc', header: '摘要', visible: true },
    { field: 'd_amt', header: '借方金額', visible: true },
    { field: 'c_amt', header: '貸方金額', visible: true },
    { field: 'org_id', header: '組織代號', visible: true },
    { field: 'PTA', header: '立沖代號', visible: true },
  ];
  constructor(
    private fin28010Service: Fin28010Service,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('FIN28010', '/FIN/FIN28010CRU', this.queryForm, (frm) => this.onSubmit(frm));

  }
  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const raw = frm.getRawValue();

      const payload = {
        PageSize: raw.PageSize,
        PageIndex: raw.PageIndex,
        OrderBy: raw.OrderBy ?? '',
        Offset: (raw.PageIndex - 1) * raw.PageSize,
        SortBy: raw.SortBy ?? [],

        WSLIP_NO: raw.WSLIP_NO,
        Voucher_Date: raw.Voucher_Date
          ? this.formatDate(raw.Voucher_Date)
          : null
      };

      this.btnLoading = true;

      this.fin28010Service
        .queryFIN28010(payload)
        .pipe(finalize(() => (this.btnLoading = false)))
        .subscribe({
          next: (res) => {
            if (res.Status === '0000') {
              this.data = res.Data ?? [];
              this.totalRecords = res.TotalCount ?? this.data.length;
            } else {
              this.messageService.errorBubble(res.Message || '查詢失敗');
            }
          }
        });
    });
  }
  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}/${m}/${d}`;
  }

}
