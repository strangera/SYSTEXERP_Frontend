import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { finalize } from 'rxjs';

import { getSYS1000Options$ } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { AddButton } from '../../../others/component/table/table.model';
import { FIN23010Data, FIN23010Service, QueryFIN23010Request } from '../../../service/api/fin/fin23010.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarRangeComponent } from '../../../shared/components/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputNumberRangeComponent } from '../../../shared/components/input-number-range/input-number-range.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { TableReportComponent } from '../../../shared/components/table-report/table-report.component';
import { ReportColumn, formatAmount } from '../../../shared/components/table-report/table-report.model';
import { VenEmpPicked, VenEmpPickerComponent } from '../fin23010-cru/ven-emp-picker/ven-emp-picker.component';

//1.2.3.1 暫付款申請作業
@Component({
  selector: 'app-fin23010',
  templateUrl: './fin23010.component.html',
  styleUrl: './fin23010.component.scss',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarRangeComponent, InputNumberRangeComponent, DropdownComponent, InputTextComponent, TableReportComponent, VenEmpPickerComponent, ButtonModule, InputTextModule, AsyncPipe, TranslateModule]
})
export class FIN23010Component extends BasicQueryPageComponent<FIN23010Data> implements OnInit {
  private readonly finService = inject(FIN23010Service);
  private readonly dropdown = inject(DropdownApiService);
  private readonly datePipe = inject(DatePipe);

  queryForm = this.formBuilder.group({
    advanceSheetNumber: [''], // 預支單號
    startRequestDate: [null as Date | null], // 申請日期
    endRequestDate: [null as Date | null], // 申請日期
    startAdvanceAmount: [null as number | null], // 預支金額
    endAdvanceAmount: [null as number | null], // 預支金額
    startWriteOffDate: [null as Date | null], // 預計核銷日
    endWriteOffDate: [null as Date | null], // 預計核銷日
    requsetEmployee: [''], // 申請員工(EMP_No)
    payoutMethod: [null as string | null], // 付款方式
    transferAccount: [null as string | null], // 匯款銀行代號
    bankAccount: [''], // 銀行帳號
    accountName: [''], // 帳戶名稱
    ticketTitle: [''], // 統一編號/身分證字號
    startExpectPayDate: [null as Date | null], // 預計付款日
    endExpectPayfDate: [null as Date | null], // 預計付款日
    summary: [''], // 摘要
  });

  addButton: AddButton[] = [
    {
      label: '送審',
      icon: 'pi pi-send',
      action: (rowData: FIN23010Data) => this.onSend(rowData),
      disabled: (rowData: FIN23010Data) => !this.hasPermission(this.Actions.SendToEIP) || rowData.IsSend != "1",
    }
  ];

  readonly payoutMethodOptions$ = getSYS1000Options$(this.systemDataService, 'VEN_PayType');
  readonly bankOptions$ = this.dropdown.queryAps1001NoBranch();

  data: FIN23010Data[] = [];
  totalRecords = 0;
  lastQueryBody: QueryFIN23010Request | null = null;
  selectedItems: FIN23010Data[] = [];
  voiding = false;

  readonly tableQueryFunction = (body: QueryFIN23010Request) => this.finService.queryFIN23010(body);

  isRowSelectable(row: FIN23010Data): boolean { return row.CanVoid === '1'; }

  /** 僅「建立中」(StatusCode='1') 可編輯，比照 SP_FIN23010GetById 的 CanEdit 規則 */
  editDisabled = (row: FIN23010Data): boolean => row.CanEdit !== '1';

  columns: ReportColumn[] = [
    { field: 'PrepNo', header: '預支單號' },
    { field: 'PrepAmt', header: '預支金額', align: 'right', format: formatAmount },
    { field: 'ApplyDate', header: '申請日期' },
    { field: 'PlanCloseDate', header: '預計核銷日' },
    { field: 'VenNo', header: '員工代號' },
    { field: 'VenName', header: '員工名稱' },
    { field: 'PayTypeName', header: '付款方式' },
    { field: 'BnkNo', header: '匯款銀行代號' },
    { field: 'BnkAccNo', header: '銀行帳號' },
    { field: 'BnkAccountName', header: '帳戶名稱' },
    { field: 'VenCheckTitle', header: '統一編號/身分證字號' },
    { field: 'Summary', header: '摘要' },
    { field: 'PlanPayDate', header: '預計付款日' },
    { field: 'StatusName', header: '狀態' },
    { field: 'VouStatusName', header: '傳票狀態' },
  ];

  pickerVisible = false;

  ngOnInit(): void {
    this.initializePage('FIN23010', 'fin/fin23010cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const payload = this.buildQueryBodyFromForm();
      this.finService.queryFIN23010(payload).pipe(
        finalize(() => (this.loading = false)),
      ).subscribe(res => {
        this.data = res.Data ?? [];
        this.totalRecords = res.TotalCount ?? 0;
        this.lastQueryBody = payload;
        this.selectedItems = [];
        this.queryStateService.setQueryState(this.ProgNo, form.getRawValue());
      });
    });
  }

  openPicker(): void {
    this.pickerVisible = true;
  }

  onPickerSelected(picked: VenEmpPicked): void {
    this.queryForm.controls.requsetEmployee.setValue(picked.code);
  }

  onDelete() {
    if (!this.selectedItems.length) return;
    const ids = this.selectedItems.map(row => row.id);
    this.messageService.confirm({
      header: '作廢確認',
      message: `是否作廢選取的 ${ids.length} 筆暫付款申請資料？`,
      accept: () => {
        this.voiding = true;
        let remaining = ids.length;
        const failedMessages: string[] = [];
        ids.forEach(id => {
          this.finService.voidFIN23010(id).pipe(
            finalize(() => {
              remaining -= 1;
              if (remaining === 0) {
                this.voiding = false;
                if (failedMessages.length) {
                  this.messageService.errorBubble(failedMessages.join('；'), '部分作廢失敗');
                } else {
                  this.messageService.successBubble('作廢成功');
                }
                this.onSubmit(this.queryForm);
              }
            }),
          ).subscribe(res => {
            if (!res.Data?.Success) {
              failedMessages.push(res.Data?.Message || '作廢失敗');
            }
          });
        });
      },
    });
  }

  /** EIP送審 */
  onSend(data: FIN23010Data): void {
    this.messageService.confirm({
      header: '送審確認',
      message: `是否送審單號: ${data.PrepNo} 暫付款申請資料？`,
      accept: () => {
        this.voiding = true;

        this.finService.sendFIN23010(data.id).pipe(
          finalize(() => {
            this.voiding = false;
          }),
        ).subscribe({
          next: res => {
            if (!res.Data?.Success) {
              this.messageService.errorBubble(
                res.Data?.Message || '送審失敗',
                '送審失敗'
              );
              return;
            }

            this.messageService.successBubble(
              res.Data?.Message || '送審成功'
            );

            this.onSubmit(this.queryForm);
          },
          error: () => {
            this.messageService.errorBubble(
              '送審失敗，請稍後再試。',
              '送審失敗'
            );
          },
        });
      },
    });
  }

  /** 從表單組出查詢條件(過濾空值) */
  private buildQueryBodyFromForm(): QueryFIN23010Request {
    const raw = this.queryForm.getRawValue();
    const toDateStr = (v: Date | null) => v ? (this.datePipe.transform(v, 'yyyy-MM-dd') ?? undefined) : undefined;

    const payload: QueryFIN23010Request = {
      PREP_NO: raw.advanceSheetNumber || undefined,
      APPY_DateS: toDateStr(raw.startRequestDate),
      APPY_DateE: toDateStr(raw.endRequestDate),
      PREP_AmtS: raw.startAdvanceAmount ?? undefined,
      PREP_AmtE: raw.endAdvanceAmount ?? undefined,
      CLOSE_DateS: toDateStr(raw.startWriteOffDate),
      CLOSE_DateE: toDateStr(raw.endWriteOffDate),
      VEN_No: raw.requsetEmployee || undefined,
      VEN_PayType: raw.payoutMethod || undefined,
      BNK_No: raw.transferAccount || undefined,
      BNK_AccNo: raw.bankAccount || undefined,
      BNK_AccountName: raw.accountName || undefined,
      VEN_CheckTitle: raw.ticketTitle || undefined,
      PAY_DateS: toDateStr(raw.startExpectPayDate),
      PAY_DateE: toDateStr(raw.endExpectPayfDate),
      Summary: raw.summary || undefined,
      pageIndex: 1,
      pageSize: 1000,
    };
    return payload;
  }
}