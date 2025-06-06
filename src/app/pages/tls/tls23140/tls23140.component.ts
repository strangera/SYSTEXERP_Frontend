import { Component } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { TLS23140Service } from '../../../service/API/tls/tls23140.service';
import { TransactionMachineService } from '../../../service/basic/transaction-machine.service';

@Component({
  selector: 'app-tls23140',
  templateUrl: './tls23140.component.html',
  styleUrls: ['./tls23140.component.scss']
})
export class TLS23140Component extends BasicQueryPageComponent<any> {
  queryForm = this.formBuilder.group({
    transactionDateStart: [new Date(), [Validators.required]],
    transactionDateEnd: [new Date(), [Validators.required]],
    transactionMachine: [''],
    counterNumber: [''],
    voucherAmount: [''],
    transactionSerialNumber: [''],
    ...createPaginationConfig([{ field: 'transactionDate', order: 1 }])
  });

  data: any[] = [];
  totalRecords = 0;

  columns: any[] = [
    { field: 'transactionDate', header: '交易日期', visible: true },
    { field: 'transactionMachineNumber', header: '交易機號', visible: true },
    { field: 'franchiseNumber', header: '專櫃編號', visible: true },
    { field: 'franchiseName', header: '櫃位名稱', visible: true },
    { field: 'recruitmentNumber', header: '招募編號', visible: true },
    { field: 'transactionSerialNumber', header: '交易序號', visible: true },
    {
      field: 'voucherAmount', header: '有價券金額', visible: true,
      style: 'text-right',
      format: (val: number) => val?.toLocaleString('en-US') || '0'
    }
  ];

  transactionMachineOptions: any[] = [];

  constructor(
    private tls23140Service: TLS23140Service,
    private transactionMachineService: TransactionMachineService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23140', '', this.queryForm, (form) => this.onSubmit(form));

    this.transactionMachineService.getTransactionMachines().subscribe(data => {
      this.transactionMachineOptions = data;
    });
  }

  onSubmit(form: FormGroup): void {
    this.submitted = true;
    if (this.loading) return;

    if (form.invalid) {
      this.messageService.warnBubble('請確認欄位資料是否完整');
      return;
    }

    this.handleSubmit(form, () => {
      const payload = { ...form.value };

      // ✅ 將 'Y' / 'N' 轉成 true / false
      if (payload.IsHaveTERM_No === 'Y') {
        payload.IsHaveTERM_No = true;
      } else if (payload.IsHaveTERM_No === 'N') {
        payload.IsHaveTERM_No = false;
      }

      // ✅ 將空字串轉 null
      Object.keys(payload).forEach(key => {
        if (payload[key] === '') payload[key] = null;
      });

      console.log('查詢參數:', payload);

      this.tls23140Service.queryTLS23140(payload).subscribe({
        next: (res) => {
          console.log('查詢結果:', res);
          if (res.Status === '0000') {
            this.data = res.Data || [];
            this.totalRecords = res.TotalCount || this.data.length;
            this.queryStateService.setQueryState(this.ProgNo, payload);
            this.messageService.successBubble('查詢成功');
          } else {
            this.data = [];
            this.totalRecords = 0;
            this.messageService.errorBubble('查詢失敗');
          }
        },
        error: () => {
          this.data = [];
          this.totalRecords = 0;
          this.loading = false;
          this.messageService.errorBubble('查詢錯誤');
        },
        complete: () => {
          this.loading = false;
          this.messageService.unblockUi();
        }
      });
    });
  }


  getLabelFromOptions(value: any, options: any[]): string {
    const found = options?.find(opt => String(opt.value) === String(value));
    return found ? found.label : value;
  }
}
