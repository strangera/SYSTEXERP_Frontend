import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { DialogModule } from 'primeng/dialog';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { FIN25020Service, QueryBankAccountResponse, QueryRemitDetailResponse, QueryRemitHeaderResponse, QueryUnremittedPAMResponse } from '../../../service/api/fin/fin25020.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { Column, formatAmount } from '../../../shared/componentkit/table/table.model';
import { FIN25020Data } from '../fin25020/fin25020.component';

//1.2.5.2 形成電匯明細資料 CRU
@Component({
  selector: 'app-fin25020-cru',
  templateUrl: './fin25020-cru.component.html',
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
    BNK_id: [null as number | null, [Validators.required]],
    // 檢視模式專用欄位（永遠 disabled）
    BankInfo: [{ value: '', disabled: true }],   // 付款銀行代號 (含銀行名稱)
    BNK_FULLNAME: [{ value: '', disabled: true }],   // 銀行帳戶全稱
    VouStatus: [{ value: '', disabled: true }],  // 轉傳票狀態
    VouNo: [{ value: '', disabled: true }],      // 傳票號碼
    TransferSourceNo: [{ value: '', disabled: true }], // 檢視模式顯示用
  });

  // 銀行下拉選項 (從 API 載入)
  bankOptions: (QueryBankAccountResponse & { displayLabel: string })[] = [];

  // 電匯來源單號查詢對話框
  showTransferSourceDialog = false;
  transferSourceQueryForm = this.formBuilder.group({
    PAM_No: [''],
    D_Date_Start: [null],
    D_Date_End: [null],
  });
  transferSourceData: QueryUnremittedPAMResponse[] = [];
  // 對話框中暫存的多選結果
  selectedTransferSources: QueryUnremittedPAMResponse[] = [];
  // 主表單中已確認的選擇列表
  confirmedTransferSources: QueryUnremittedPAMResponse[] = [];

  private readonly formatDate = (value: string) => {
    if (!value) return '';
    const date = new Date(value);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  };

  transferSourceColumns: Column[] = [
    { field: 'PAM_No', header: '電匯來源單號', visible: true },
    { field: 'D_Date', header: '建立日期', visible: true, format: this.formatDate },
    { field: 'Remit_Status', header: '是否形成電匯', visible: true, format: (value: string) => value === 'Y' ? '是' : value === 'N' ? '否' : value },
  ];

  // 主表單中顯示已選單號的欄位
  confirmedSourceColumns: Column[] = [
    { field: 'PAM_No', header: '電匯來源單號', visible: true },
    { field: 'D_Date', header: '建立日期', visible: true, format: this.formatDate },
    { field: 'Remit_Status', header: '是否形成電匯', visible: true, format: (value: string) => value === 'Y' ? '是' : value === 'N' ? '否' : value },
  ];

  // 檢視模式：電匯明細資料
  remitDetailData: QueryRemitDetailResponse[] = [];
  remitDetailColumns: Column[] = [
    { field: 'VEN_No', header: '廠商編號', visible: true, align: 'left' },
    { field: 'VEN_Name', header: '廠商名稱', visible: true, align: 'left' },
    { field: 'ACP_Amt', header: '收/付金額', visible: true, format: formatAmount, align: 'right', isTotal: true },
    { field: 'RMT_Amt', header: '匯款金額', visible: true, format: formatAmount, align: 'right', isTotal: true },
    { field: 'RMT_Fee', header: '廠商負擔匯款手續費', visible: true, format: formatAmount, align: 'center', isTotal: true },
    { field: 'CASH_BACK_AMT', header: '廠商負擔電匯手續費回饋收入', visible: true, format: formatAmount, align: 'center', isTotal: true },
    { field: 'COMP_WIRE_FEE', header: '公司負擔匯款手續費', visible: true, format: formatAmount, align: 'center', isTotal: true },
    { field: 'RMT_BNKNO', header: '匯款銀行代號', visible: true, align: 'center' },
    { field: 'BNK_FULLNAME', header: '銀行名稱', visible: true, align: 'left' },
    { field: 'RMT_BnkAccNo', header: '銀行帳號', visible: true, align: 'left' },
    { field: 'RMT_BnkAccName', header: '匯款銀行帳戶名稱', visible: true, align: 'left' },
  ];

  constructor(
    private readonly fin25020Service: FIN25020Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN25020', this.dataForm);

    // 載入銀行帳戶選項
    this.loadBankAccounts();

    // 檢查是否為檢視模式（使用 BasicCruPageComponent 的 rowdata 和 crudstatus）
    if (this.isFormReadable && this.rowdata) {
      // 檢視模式：載入電匯明細
      const headerData = this.rowdata as FIN25020Data;
      this.loadRemitDetail(headerData);
      // 將表單設為唯讀
      this.dataForm.disable();
    } else if (!this.isFormCreateable) {
      // 新增模式固定，因為這是「形成」的功能
      // 如果不是新增模式，導回列表頁
      this.onCancel();
    }
  }

  // 載入電匯明細資料（檢視模式）
  loadRemitDetail(headerData: FIN25020Data): void {
    this.fin25020Service.queryRemitDetail({ WSLIP_NO: headerData.WSLIP_NO })
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        const header: QueryRemitHeaderResponse = response.Data.Header;
        this.remitDetailData = response.Data.Details;

        this.dataForm.patchValue({
          TransferSourceNo: header.WSLIP_NO,
          CreateDate: header.D_Date ? new Date(header.D_Date) : new Date(),
          TransferDate: header.RMT_Date ? new Date(header.RMT_Date) : new Date(),
          BNK_id: headerData.BNK_id,
          BankInfo: header.BankInfo ?? '',
          VouStatus: header.VouStatus ?? '',
          VouNo: header.VouNo ?? '',
        });
      });
  }

  // 載入銀行帳戶選項
  loadBankAccounts(): void {
    this.fin25020Service.queryBankAccount({})
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        // 格式化顯示: BNK_id - BNK_AccName
        this.bankOptions = response.Data.map(item => ({
          ...item,
          displayLabel: `${item.BNK_id || item.id} - ${item.BNK_AccName}`
        }));
        console.log('Bank Options:', this.bankOptions);
      });
  }

  // 開啟電匯來源單號查詢對話框
  openTransferSourceDialog(): void {
    // 帶入已確認的選擇，讓使用者可以修改
    this.selectedTransferSources = [...this.confirmedTransferSources];
    this.showTransferSourceDialog = true;
    this.loadTransferSourceData();
  }

  // 載入電匯來源單號資料
  loadTransferSourceData(): void {
    const queryValue = this.transferSourceQueryForm.value;

    this.fin25020Service.queryUnremittedPAM({
      PAM_No: queryValue.PAM_No || null,
      D_Date_Start: queryValue.D_Date_Start || null,
      D_Date_End: queryValue.D_Date_End || null,
    })
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.transferSourceData = response.Data;
      });
  }

  // 查詢電匯來源單號
  onQueryTransferSource(): void {
    this.loadTransferSourceData();
  }

  // 確認選擇電匯來源單號（多選）
  confirmTransferSourceSelection(): void {
    if (!this.selectedTransferSources || this.selectedTransferSources.length === 0) {
      this.messageService.errorBubble('請至少選擇一筆電匯來源單號');
      return;
    }
    this.confirmedTransferSources = [...this.selectedTransferSources];
    this.showTransferSourceDialog = false;
  }

  formatCreateDate(): string {
    const date = this.dataForm.controls.CreateDate.value;
    if (!date) return '';
    return new Intl.DateTimeFormat('zh-TW', {
      year: 'numeric', month: 'numeric', day: 'numeric',
      hour: 'numeric', minute: '2-digit', second: '2-digit',
      hour12: true
    }).format(date);
  }

  formatTransferDate(): string {
    const date = this.dataForm.controls.TransferDate.value;
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  }

  onSubmit(frm: FormGroup): void {
    if (this.confirmedTransferSources.length === 0) {
      this.messageService.errorBubble('請選擇至少一筆電匯來源單號');
      return;
    }

    this.handleSubmit(frm, () => {
      const formValue = frm.getRawValue();

      // 準備 API 請求參數（多筆 PAM_NoList）
      const confirmRequest = {
        RMT_Date: formValue.TransferDate,
        BNK_id: formValue.BNK_id,
        PAM_NoList: this.confirmedTransferSources.map(x => x.PAM_No)
      };

      this.fin25020Service.confirmRemit(confirmRequest)
        .pipe(
          untilDestroyed(this),
          finalize(() => this.loading = false)
        )
        .subscribe({
          next: () => {
            this.messageService.successBubble('形成電匯明細成功');
            setTimeout(() => {
              this.onCancel();
            }, 500);
          },
          error: () => {
            this.loading = false;
          }
        });
    });
  }
}
