import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PanelModule } from 'primeng/panel';
import { DialogModule } from 'primeng/dialog';
import { FIN25020Data } from '../fin25020/fin25020.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { Column } from '../../../shared/componentkit/table/table.model';

// 定義匯款來源單號資料介面
export interface TransferSourceData {
  SourceNo: string;
  SourceDate: string;
  VendorName: string;
  Amount: number;
}

//1.2.5.2 形成電匯明細資料 CRU
@Component({
  selector: 'app-fin25020-cru',
  templateUrl: './fin25020-cru.component.html',
  styleUrl: './fin25020-cru.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarComponent,
    InputTextComponent,
    DropdownComponent,
    ButtonComponent,
    NgIf,
    TranslateModule,
    DialogModule,
    TableComponent
  ]
})
export class FIN25020CRUComponent extends BasicCruPageComponent<FIN25020Data> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    CreateDate: [{ value: new Date(), disabled: true }, [Validators.required]], // 建立日期（系統日期，不可修改）
    TransferDate: [new Date(), [Validators.required]], // 匯款日期（預設系統日期，可修改）
    BankCode: ['', [Validators.required, Validators.maxLength(8)]], // 銀行代號
    BankName: [''], // 銀行名稱（自動帶入，唯讀）
    TransferSourceNo: ['', [Validators.required, Validators.maxLength(20)]], // 匯款來源單號
  });

  // 銀行下拉選項 (模擬資料)
  bankOptions: { label: string; value: string; name: string }[] = [
    { label: '004 - 台灣銀行', value: '004', name: '台灣銀行' },
    { label: '007 - 第一銀行', value: '007', name: '第一銀行' },
    { label: '012 - 台北富邦銀行', value: '012', name: '台北富邦銀行' },
    { label: '013 - 國泰世華銀行', value: '013', name: '國泰世華銀行' },
    { label: '017 - 兆豐國際商銀', value: '017', name: '兆豐國際商銀' },
  ];

  // 匯款來源單號下拉選項 (模擬資料 - 未匯款的資料)
  transferSourceOptions: { label: string; value: string }[] = [
    { label: 'PAY20140106001', value: 'PAY20140106001' },
    { label: 'PAY20140106002', value: 'PAY20140106002' },
    { label: 'PAY20140107001', value: 'PAY20140107001' },
    { label: 'PAY20140107002', value: 'PAY20140107002' },
  ];

  // 匯款來源單號查詢對話框
  showTransferSourceDialog = false;
  transferSourceQueryForm = this.formBuilder.group({
    SourceNo: [''],
  });
  transferSourceData: TransferSourceData[] = [];
  transferSourceColumns: Column[] = [
    { field: 'SourceNo', header: '匯款來源單號', visible: true },
    { field: 'SourceDate', header: '單據日期', visible: true },
    { field: 'VendorName', header: '廠商名稱', visible: true },
    { field: 'Amount', header: '金額', visible: true },
  ];

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN25020', this.dataForm);

    // 新增模式固定，因為這是「形成」的功能
    if (!this.isFormCreateable) {
      // 如果不是新增模式，導回列表頁
      this.onCancel();
    }
  }

  onBankChange(event: { value: string }): void {
    const selectedBank = this.bankOptions.find(bank => bank.value === event.value);
    if (selectedBank) {
      this.dataForm.patchValue({ BankName: selectedBank.name });
    }
  }

  // 開啟匯款來源單號查詢對話框
  openTransferSourceDialog(): void {
    this.showTransferSourceDialog = true;
    this.loadTransferSourceData();
  }

  // 載入匯款來源單號資料
  loadTransferSourceData(): void {
    // 這裡之後會串接真實的 API
    // const queryValue = this.transferSourceQueryForm.value;
    // this.fin25020Service.queryUnpaidTransferSource(queryValue)
    //   .pipe(untilDestroyed(this))
    //   .subscribe(response => {
    //     this.transferSourceData = response.Data;
    //   });

    // 目前使用模擬資料 - 未匯款的匯款來源單
    this.transferSourceData = [
      {
        SourceNo: 'PAY20140106001',
        SourceDate: '2014-01-06',
        VendorName: '台灣電力公司',
        Amount: 50000,
      },
      {
        SourceNo: 'PAY20140106002',
        SourceDate: '2014-01-06',
        VendorName: '中華電信',
        Amount: 30000,
      },
      {
        SourceNo: 'PAY20140107001',
        SourceDate: '2014-01-07',
        VendorName: '自來水公司',
        Amount: 15000,
      },
      {
        SourceNo: 'PAY20140107002',
        SourceDate: '2014-01-07',
        VendorName: '台灣中油',
        Amount: 80000,
      },
    ];
  }

  // 查詢匯款來源單號
  onQueryTransferSource(): void {
    this.loadTransferSourceData();
  }

  // 選擇匯款來源單號（雙擊）
  onSelectTransferSource(data: TransferSourceData): void {
    this.dataForm.patchValue({
      TransferSourceNo: data.SourceNo,
    });
    this.showTransferSourceDialog = false;
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const formValue = frm.getRawValue();

      // 確認形成 - 更新匯款日期及匯款銀行
      // const confirmRequest = {
      //   TransferDate: formValue.TransferDate,
      //   BankCode: formValue.BankCode,
      //   BankName: formValue.BankName,
      //   TransferSourceNo: formValue.TransferSourceNo,
      // };
      //
      // this.fin25020Service.confirmTransfer(confirmRequest)
      //   .pipe(untilDestroyed(this))
      //   .subscribe({
      //     next: () => {
      //       this.messageService.successBubble('形成電匯明細成功');
      //       this.loading = false;
      //       this.onCancel();
      //     },
      //     error: () => {
      //       this.loading = false;
      //     }
      //   });

      // 目前使用模擬確認形成
      console.log('確認形成電匯明細:', formValue);
      this.messageService.successBubble('形成電匯明細成功');
      this.loading = false;
      // 成功後回到列表頁
      setTimeout(() => {
        this.onCancel();
      }, 1000);
    });
  }
}
