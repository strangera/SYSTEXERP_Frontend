
import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Fin28010Service } from '@service/api/fin/fin28010.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableComponent } from '@others/component/table/table.component';
import { createPaginationConfig, formatAmount } from '@others/component/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
@Component({
  selector: 'app-fin28010',
  templateUrl: './fin28010.component.html',
  standalone: true,
  imports: [CalendarComponent, ButtonModule, InputTextComponent, MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, ButtonComponent, TranslateModule, DialogComponent, TableComponent]
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

  // 匯款單號開窗
  wslipDialogVisible = false;
  wslipDialogLoading = false;
  wslipDialogData: any[] = [];
  wslipDialogTotalRecords = 0;
  selectedWslipItem: any = null;
  wslipDialogColumns: any[] = [
    { field: 'WSLIP_NO', header: '匯款單號', visible: true },
    { field: 'RMT_Date', header: '匯款日期', visible: true },
    { field: 'BNK_id', header: '銀行代號', visible: true },
    { field: 'Status', header: '狀態', visible: true },
  ];

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

  openWslipDialog(): void {
    setTimeout(() => {
      this.wslipDialogVisible = true;
      this.wslipDialogLoading = true;
      this.fin28010Service.queryFIN28010WslipList({
        PageSize: 100, PageIndex: 1, Offset: 0, SortBy: []
      }).subscribe({
        next: (res: any) => {
          if (res.Status === '0000' || res.Status === '200') {
            this.wslipDialogData = res.Data ?? [];
            this.wslipDialogTotalRecords = res.TotalCount ?? this.wslipDialogData.length;
          } else {
            this.messageService?.warnBubble?.(res.Message || '查無資料');
          }
        },
        complete: () => { this.wslipDialogLoading = false; }
      });
    }, 0);
  }

  onWslipSelect(rows: any): void {
    const row = Array.isArray(rows) ? rows[0] : rows;
    if (!row?.WSLIP_NO) return;
    this.queryForm.patchValue({ WSLIP_NO: row.WSLIP_NO });
    this.wslipDialogVisible = false;
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
