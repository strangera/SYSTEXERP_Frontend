import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { FIN11090, FIN11090QueryResponse, Fin11090Service } from '../../../service/api/fin/fin11090.service';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';

@Component({
  selector: 'app-fin11090',
  templateUrl: './fin11090.component.html',
  styleUrl: './fin11090.component.scss'
})

export class FIN11090Component extends BasicQueryPageComponent<FIN11090> implements OnInit {
  queryForm = this.formBuilder.group({
    // 依需求調整查詢欄位
    // 範例：字軌、發票號碼、發票日期、收銀機代號、交易序號
    prefix: ['', [Validators.required, Validators.maxLength(2)]],            // 字軌
    invoice_no: ['', [Validators.required, Validators.maxLength(8)]],        // 發票號碼
    invoice_date: ['', [Validators.required]],                               // 發票日期
    cashier_no: ['', [Validators.required, Validators.maxLength(10)]],       // 收銀機代號
    txn_seq: ['', [Validators.required, Validators.maxLength(6)]],           // 交易序號
    ...createPaginationConfig([{ field: 'invoice_date', order: -1 }]), // 預設依日期新到舊排序
  });

  totalRecords = 0;
  data: FIN11090[] = [];
  columns: Column[] = [
    { field: 'invoice_date', header: '發票日期', visible: true },
    { field: 'cashier_no', header: '收銀機代號', visible: true },
    { field: 'txn_seq', header: '交易序號', visible: true },
    { field: 'invoice_no', header: '發票號碼', visible: true },
    { field: 'invoice_amt', header: '交易金額', visible: true },
    // 依實際需求可再補充欄位
  ];

  selectedItems: FIN11090QueryResponse[] = [];

  constructor(private fin11090Service: Fin11090Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN11090', 'fin/fin11090cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.fin11090Service.queryFIN11090(frm.value).subscribe({
        next: (response) => {
          if (response.Status === '0000') {
            this.data = response.Data || [];
            this.totalRecords = response.TotalCount || this.data.length;
            this.queryStateService.setQueryState(this.ProgNo, frm.value);
          } else {
            this.messageService.errorBubble(`查詢失敗: ${response.Message}`);
          }
          this.loading = false;
          this.messageService.unblockUi();
        },
        error: () => {
          this.loading = false;
          this.messageService.unblockUi();
        },
      });
    });
  }

  isRowSelectable(rowData: FIN11090): boolean {
    return true;
  }

  onConfirm(selectedItems: FIN11090QueryResponse[]) {
    this.messageService.successBubble('取消作廢紀錄並同步更新發票狀態');
    console.log('已選擇項目:', selectedItems);
    // 接api
  }
}
