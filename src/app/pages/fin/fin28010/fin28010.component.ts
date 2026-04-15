
import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Fin28010Service } from '@service/api/fin/fin28010.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { createPaginationConfig, formatAmount } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
@Component({
  selector: 'app-fin28010',
  templateUrl: './fin28010.component.html',
  standalone: true,
  imports: [CalendarComponent, DatePipe
    , ButtonModule, InputTextComponent, MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarRangeComponent, ButtonComponent, TableComponent, TranslateModule]
})

export class FIN28010Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    WSLIP_NO: ['', [Validators.required, Validators.maxLength(15)]],
    VouDate: [new Date(), [Validators.required,]],
    ...createPaginationConfig([{ field: 'AccNo', order: 1 }]),
  });
  selectedItems: any[] = [];
  totalRecords = 0;
  data: any[] = [];
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
    { field: 'd_amt', header: '借方金額', visible: true, format: formatAmount },
    { field: 'c_amt', header: '貸方金額', visible: true, format: formatAmount },
    { field: 'org_id', header: '組織代號', visible: true },
    { field: 'PTA', header: '立沖代號', visible: true },
  ];
  constructor(
    private fin28010Service: Fin28010Service,
    private datePipe: DatePipe,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('FIN28010', '/FIN/FIN28010CRU', this.queryForm, (frm) => this.onSubmit(frm));

  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const v = frm.getRawValue();
      const payload = {
        PageSize: 20,
        PageIndex: 1,
        OrderBy: '',
        Offset: 0,
        SortBy: [],
        WSLIP_NO: v.WSLIP_NO || '',
        VouDate: this.datePipe.transform(v.VouDate, 'yyyy-MM-dd') || ''
      };

      this.loading = true;
      this.messageService.blockUi();

      this.fin28010Service.queryFIN28010(payload).subscribe({
        next: (res: any) => {
          if (res.Status === '0000' || res.Status === '200') {
            const details = res.Data ?? [];

            if (!details.length) {
              this.messageService?.warnBubble?.('查無資料');
              return;
            }

            const header = details[0];
            const queryConditions = {
              form: frm.getRawValue(),
              details,
            };

            // 直接進入 CRU 顯示欄位與明細表
            this.onDetail(header, queryConditions);
          } else {
            this.messageService?.errorBubble?.(res.Message || '查詢失敗');
          }
        },

        complete: () => {
          this.loading = false;
          this.messageService.unblockUi();
        }
      });
    });
  }

}
