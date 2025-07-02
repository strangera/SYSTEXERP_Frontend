import { Component } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { FIN13010Service } from '../../../service/api/fin/fin13010.service';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';

@Component({
  selector: 'app-fin13010',
  templateUrl: './fin13010.component.html',
  styleUrls: ['./fin13010.component.scss']
})
export class FIN13010Component extends BasicQueryPageComponent<any> {
  taxNumberOptions: any[] = [
    { value: '701702007', label: '701702007' },
    { value: '703902223', label: '703902223' },
  ];
    PUR_VoucherTypeOptions: any[] = [
    { value: '23', label: '三聯式、電子計算機及三聯式收銀機統一發票之進貨退出或折讓證明單' },
    { value: '24', label: '二聯式收銀機統一發票及載有稅額之其他憑證之進貨退出或折讓證明單' },
  ];

  queryForm = this.formBuilder.group({
    
    startSalesDate: [null],   // 領用日期(起)
    endSalesDate: [null],     // 領用日期(迄)
    taxNumber: [null],        // 稅籍編號
    Year: ['2025'],             // 查詢年
    Month: ['01'],            // 查詢月
    TXN_Ret_No_Start: [null], // 退出/折讓單號(起)
    TXN_Ret_No_End: [null],   // 退出/折讓單號(迄)
    PUR_GUINo: [null], // 字軌
    PUR_GUINo_Start: [null],
    PUR_GUINo_End: [null],
    PUR_GUIDate_Start: [null], // 領用日期(起)
    PUR_GUIDate_End: [null],   // 領用日期(迄)
    PUR_VoucherType: [null], // 發票狀態
    PUR_RepYYYYMM: [null], // 發票年月
    Source_Doc_No_Start: [], // 憑證單號(起)
    Source_Doc_No_End: [],   // 憑證單號(迄)
    Voucher_No_Start: [], // 發票號碼(起)
    Voucher_No_End: [],   // 發票號碼(迄)
    ...createPaginationConfig([{ field: 'startSalesDate', order: 1 }])
  });

  data: any[] = [];
  totalRecords = 0;

  columns: any[] = [
    { field: 'TXN_Ret_No', header: '退出/折讓單號', visible: true },
    { field: 'PUR_GUINo', header: '字軌', visible: true },
    { field: 'PUR_GUINo_Start', header: '發票號碼', visible: true },
    { field: 'PUR_GUIDate', header: '退出/折讓日期', visible: true },
    { field: 'PUR_VoucherType', header: '發票格式', visible: true },
    { field: 'Credit_Type', header: '區別', visible: true },  //折讓/退出
    { field: 'PUR_RepYYYYMM', header: '申報年月', visible: true },
    { field: 'PUR_Net', header: '退回/折讓金額', visible: true },
    { field: 'Source_Doc_No', header: '憑證單號', visible: true },
    { field: 'Voucher_No', header: '傳票編號', visible: true },

  ];

  constructor(private fin13010Service: FIN13010Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN13010','/FIN/FIN13010CRU', this.queryForm);
    
  }

  onSubmit(form: FormGroup): void {
    this.submitted = true;
    if (form.invalid) {
      this.messageService.warnBubble('請完整填寫查詢條件');
      return;
    }

    const payload = { ...form.value };
    for (const key in payload) {
      if (typeof payload[key] === 'string') {
        payload[key] = payload[key].trim();
        if (payload[key] === '') payload[key] = null;
      }
    }

    this.loading = true;
    this.messageService.blockUi();

    this.fin13010Service.queryFIN13010(payload).subscribe({
      next: (res) => {
        
          this.data = res.Data || [];
          this.totalRecords = res.TotalCount || this.data.length;
          this.queryStateService.setQueryState(this.ProgNo, payload);
          this.messageService.successBubble('查詢成功');
       
      },
      //       next: (res) => {
      //   if (res.Status === '0000') {
      //     this.data = res.Data || [];
      //     this.totalRecords = res.TotalCount || this.data.length;
      //     this.queryStateService.setQueryState(this.ProgNo, payload);
      //     this.messageService.successBubble('查詢成功');
      //   } else {
      //     this.messageService.errorBubble('查詢失敗');
      //     this.loading = false;
      //   }
      // },
      error: () => {
        this.messageService.errorBubble('查詢錯誤');
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
        this.messageService.unblockUi();
      }
    });
  }



  onClearForm(): void {
    this.queryForm.reset();
  }
}
