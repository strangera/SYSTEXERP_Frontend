import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { DialogModule } from 'primeng/dialog';
import { PanelModule } from 'primeng/panel';
import { StepperModule } from 'primeng/stepper';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs';
import {
  FIN32030Service,
  QueryFIN32030ARResponse,
  QueryFIN32030Response,
  QueryRecvItemResponse,
  RecvDetailResponse,
  CheckDetailItem
} from '../../../service/api/fin/fin32030.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TableEditComponent } from '../../../shared/componentkit/table-edit/table-edit.component';
import { Column, formatAmountWithFraction, formatDate } from '../../../shared/componentkit/table/table.model';
import { EditColumn } from '../../../shared/componentkit/table-edit/table-edit.model';


//1.3.2.3 收款沖帳維護 CRU
@Component({
  selector: 'app-fin32030-cru',
  templateUrl: './fin32030-cru.component.html',
  styleUrl: './fin32030-cru.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputNumberComponent,
    CalendarComponent,
    DropdownComponent,
    InputTextComponent,
    TranslateModule,
    DialogModule,
    TableComponent,
    TableEditComponent,
    StepperModule,
    ButtonModule
  ]
})
export class FIN32030CRUComponent extends BasicCruPageComponent<QueryFIN32030Response> implements OnInit {
  // 步驟控制
  activeStep = 0;

  // 步驟1: 基本資料表單
  step1Form = this.formBuilder.nonNullable.group({
    RCV_No: ['', [Validators.maxLength(20)]], // 收款單號
    RCV_Date: [new Date(), [Validators.required]], // 收款日期
    Sales_Id: [null as string | null], // 業務員代號
    Remark: ['', [Validators.maxLength(100)]], // 備註
  });

  // 步驟1: 應收帳款選擇
  selectedARItems: QueryFIN32030ARResponse[] = [];
  arDialogColumns: Column[] = [
    { field: 'ARS_ID', header: '應收ID', visible: true },
    { field: 'VEN_No', header: '廠客代號', visible: true },
    { field: 'VEN_Name', header: '廠客名稱', visible: true },
    { field: 'ARS_Amt', header: '應收金額', visible: true, format: formatAmountWithFraction, style: 'text-align: right' },
    { field: 'ARS_Date', header: '立帳日', visible: true, format: formatDate },
    { field: 'PaidAmt', header: '已收款金額', visible: true, format: formatAmountWithFraction, style: 'text-align: right' },
    { field: 'UnpaidAmt', header: '未收款金額', visible: true, format: formatAmountWithFraction, style: 'text-align: right' },
    { field: 'PTA_Date', header: '預計收款日', visible: true, format: formatDate },
    { field: 'NoteDesc', header: '摘要', visible: true },
  ];

  // 步驟1: 已選擇的應收帳款顯示欄位
  selectedARColumns: Column[] = [
    { field: 'ARS_ID', header: '應收ID', visible: true },
    { field: 'VEN_No', header: '廠客代號', visible: true },
    { field: 'VEN_Name', header: '廠客名稱', visible: true },
    { field: 'UnpaidAmt', header: '收款金額', visible: true, format: formatAmountWithFraction, style: 'text-align: right' },
  ];

  // 步驟2: 收款項目表格資料
  step2TableData: any[] = [];
  step2Columns: EditColumn[] = [
    {
      field: 'CAP_Item',
      header: '收款項目',
      type: 'dropdown',
      options: () => this.recvItemOptions,
      optionLabel: 'CAP_ItemName',
      optionValue: 'CAP_Item',
      showClear: true,
      validate: [
        (value: any) => ({
          isValid: !!value,
          errorMessage: ['收款項目為必填']
        })
      ]
    },
    {
      field: 'ARS_Amt',
      header: '收款金額',
      type: 'inputNumber',
      minFractionDigits: 2,
      maxFractionDigits: 2,
      min: 0,
      textAlign: 'right',
      aggregate: 'sum',
      validate: [
        (value: any) => ({
          isValid: value !== null && value !== undefined && value >= 0,
          errorMessage: ['收款金額為必填且必須大於等於0']
        })
      ]
    },
    {
      field: 'NoteDesc',
      header: '備註',
      type: 'input',
      maxLength: 100
    }
  ];

  // 步驟3: 票據資訊表格資料
  step3TableData: any[] = [];
  step3Columns: EditColumn[] = [
    {
      field: 'CHK_No',
      header: '票據號碼',
      type: 'input',
      maxLength: 50,
      validate: [
        (value: any) => ({
          isValid: !!value,
          errorMessage: ['票據號碼為必填']
        })
      ]
    },
    {
      field: 'CHK_Type',
      header: '票據種類',
      type: 'dropdown',
      options: () => this.checkTypeOptions,
      optionLabel: 'label',
      optionValue: 'value',
      defaultValueFunction: () => '1'
    },
    {
      field: 'CHK_Amt',
      header: '票面金額',
      type: 'inputNumber',
      minFractionDigits: 2,
      maxFractionDigits: 2,
      min: 0,
      textAlign: 'right',
      aggregate: 'sum',
      validate: [
        (value: any) => ({
          isValid: value !== null && value !== undefined && value >= 0,
          errorMessage: ['票面金額為必填且必須大於等於0']
        })
      ]
    },
    {
      field: 'Ticket_YN',
      header: '是否客票',
      type: 'dropdown',
      options: () => this.ticketYNOptions,
      optionLabel: 'label',
      optionValue: 'value',
      defaultValueFunction: () => 'N'
    },
    {
      field: 'BNK_No',
      header: '往來銀行代號',
      type: 'input',
      validate: [
        (value: any) => ({
          isValid: !!value,
          errorMessage: ['往來銀行代號為必填']
        })
      ]
    },
    {
      field: 'BNK_BranchNo',
      header: '分行代號',
      type: 'input',
      validate: [
        (value: any) => ({
          isValid: !!value,
          errorMessage: ['分行代號為必填']
        })
      ]
    },
    {
      field: 'BNK_AccNo',
      header: '客戶銀行帳號',
      type: 'input'
    },
    {
      field: 'VEN_No',
      header: '廠客代號',
      type: 'input'
    },
    {
      field: 'CHK_ReceDate',
      header: '收票日',
      type: 'date',
      dateFormat: 'yy/mm/dd'
    },
    {
      field: 'CHK_ExpireDate',
      header: '到期日',
      type: 'date',
      dateFormat: 'yy/mm/dd',
      validate: [
        (value: any) => ({
          isValid: !!value,
          errorMessage: ['到期日為必填']
        })
      ]
    },
    {
      field: 'CHK_PreDate',
      header: '預兌日',
      type: 'date',
      dateFormat: 'yy/mm/dd'
    },
    {
      field: 'CHK_Comment',
      header: '備註',
      type: 'input',
      maxLength: 200
    }
  ];

  // 收款項目下拉選項 (從 API 載入)
  recvItemOptions: QueryRecvItemResponse[] = [];

  // 應收未收查詢對話框
  showARDialog = false;
  arDialogLoading = false;
  arQueryForm = this.formBuilder.group({
    STO_No: [''],
    VEN_No: [''],
    DateFrom: [null],
    DateTo: [null],
  });
  arDialogData: QueryFIN32030ARResponse[] = [];

  // 業務員下拉選項 (TODO: 需要從 API 載入)
  salesOptions: any[] = [];

  // 票據種類選項
  checkTypeOptions = [
    { label: '支票', value: '1' },
    { label: '本票', value: '2' },
    { label: '匯票', value: '3' }
  ];

  // 是否客票選項
  ticketYNOptions = [
    { label: '是', value: 'Y' },
    { label: '否', value: 'N' }
  ];

  // 銀行下拉選項 (TODO: 需要從 API 載入)
  bankOptions: any[] = [];
  branchOptions: any[] = [];

  constructor(
    private readonly fin32030Service: FIN32030Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN32030', this.step1Form);

    // 載入收款項目選項
    this.loadRecvItemOptions();

    // TODO: 載入業務員選項
    // this.loadSalesOptions();

    // 檢查模式
    if (this.isFormReadable && this.rowdata) {
      // 檢視/編輯模式：載入收款資料
      const headerData = this.rowdata as QueryFIN32030Response;
      this.loadRecvData(headerData);

      if (this.isFormReadable) {
        this.step1Form.disable();
      }
    }
  }

  // ----------------------------------------------------------------
  // 步驟控制
  // ----------------------------------------------------------------

  /** 前往下一步 */
  nextStep(): void {
    if (this.activeStep === 0) {
      // 驗證步驟1
      if (!this.validateStep1()) {
        return;
      }
    } else if (this.activeStep === 1) {
      // 驗證步驟2
      if (!this.validateStep2()) {
        return;
      }
    }
    this.activeStep++;
  }

  /** 返回上一步 */
  prevStep(): void {
    if (this.activeStep > 0) {
      this.activeStep--;
    }
  }

  /** 驗證步驟1 */
  validateStep1(): boolean {
    this.step1Form.markAllAsTouched();
    if (this.step1Form.invalid) {
      this.messageService.errorBubble('請填寫必填欄位');
      return false;
    }
    if (this.selectedARItems.length === 0) {
      this.messageService.errorBubble('請至少選擇一筆應收帳款');
      return false;
    }
    return true;
  }

  /** 驗證步驟2 */
  validateStep2(): boolean {
    if (this.step2TableData.length === 0) {
      this.messageService.errorBubble('請至少新增一個收款項目');
      return false;
    }
    // TODO: 可以在這裡加入表格驗證邏輯
    return true;
  }

  // ----------------------------------------------------------------
  // 步驟1: 應收帳款選擇相關
  // ----------------------------------------------------------------

  /** 打開應收未收查詢對話框 */
  openARDialog(): void {
    this.showARDialog = true;
    // 重置查詢表單並載入資料
    this.arQueryForm.reset({
      STO_No: '',
      VEN_No: '',
      DateFrom: null,
      DateTo: null,
    });
    this.onQueryAR();
  }

  /** 查詢應收未收 */
  onQueryAR(): void {
    const queryValue = this.arQueryForm.value;

    this.arDialogLoading = true;
    this.fin32030Service.queryFIN32030AR({
      STO_No: queryValue.STO_No || null,
      VEN_No: queryValue.VEN_No || null,
      DateFrom: queryValue.DateFrom || null,
      DateTo: queryValue.DateTo || null,
    })
      .pipe(
        finalize(() => this.arDialogLoading = false),
        untilDestroyed(this)
      )
      .subscribe(response => {
        this.arDialogData = response.Data;
      });
  }

  /** 確認選擇應收帳款 */
  onConfirmARSelection(selected: QueryFIN32030ARResponse[]): void {
    if (!selected || selected.length === 0) {
      this.messageService.errorBubble('請至少選擇一筆應收帳款');
      return;
    }

    this.selectedARItems = selected;
    this.showARDialog = false;

    // 自動根據選中的應收帳款生成收款項目
    this.generateItemsFromAR();

    this.messageService.successBubble(`已選擇 ${selected.length} 筆應收帳款`);
  }

  /** 根據應收帳款生成收款項目 */
  generateItemsFromAR(): void {
    // 清空現有項目
    this.step2TableData = [];

    // 為每個應收帳款創建收款項目
    this.selectedARItems.forEach(ar => {
      this.step2TableData.push({
        CAP_Item: null, // 收款項目
        ARS_Amt: ar.UnpaidAmt || 0, // 預設為未收款金額
        NoteDesc: ar.NoteDesc || '', // 備註
      });
    });
  }

  /** 刪除選中的應收帳款 (從 app-table 刪除事件) */
  onDeleteSelectedAR(deletedItems: QueryFIN32030ARResponse[]): void {
    // 從 selectedARItems 中移除被刪除的項目
    deletedItems.forEach(deletedItem => {
      const index = this.selectedARItems.findIndex(item => item.ARS_ID === deletedItem.ARS_ID);
      if (index !== -1) {
        this.selectedARItems.splice(index, 1);
        // 同時移除對應的收款項目
        if (index < this.step2TableData.length) {
          this.step2TableData.splice(index, 1);
        }
      }
    });
  }

  /** 計算應收帳款總金額 */
  get totalARAmount(): number {
    return this.selectedARItems.reduce((sum, item) => sum + (item.UnpaidAmt || 0), 0);
  }

  // ----------------------------------------------------------------
  // 步驟2: 收款項目相關
  // ----------------------------------------------------------------

  /** 計算收款項目總金額 */
  get totalItemAmount(): number {
    return this.step2TableData.reduce((sum, item) => sum + (item.ARS_Amt || 0), 0);
  }

  /** 步驟2表格資料變更事件 */
  onStep2DataChange(data: any[]): void {
    this.step2TableData = data;
  }

  // ----------------------------------------------------------------
  // 步驟3: 票據資訊相關
  // ----------------------------------------------------------------

  /** 計算票據總金額 */
  get totalCheckAmount(): number {
    return this.step3TableData.reduce((sum, item) => sum + (item.CHK_Amt || 0), 0);
  }

  /** 步驟3表格資料變更事件 */
  onStep3DataChange(data: any[]): void {
    this.step3TableData = data;
  }

  // ----------------------------------------------------------------
  // API 資料載入
  // ----------------------------------------------------------------

  /** 載入收款項目選項 */
  loadRecvItemOptions(): void {
    this.fin32030Service.queryRecvItem({})
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.recvItemOptions = response.Data;
      });
  }

  /** 載入收款資料 (檢視/編輯模式) */
  loadRecvData(headerData: QueryFIN32030Response): void {
    this.fin32030Service.queryFIN32030RecvAll({ RCV_No: headerData.RCV_No })
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        if (response.Data && response.Data.length > 0) {
          const recvData = response.Data[0];

          // 填入步驟1表單資料
          this.step1Form.patchValue({
            RCV_No: recvData.RCV_No || '',
            RCV_Date: recvData.RCV_Date ? new Date(recvData.RCV_Date) : new Date(),
            Sales_Id: recvData.Sales_Id,
            Remark: recvData.Remark || ''
          });

          // 載入收款項目明細
          if (recvData.RecvItemsJson) {
            try {
              const recvItems: RecvDetailResponse[] = JSON.parse(recvData.RecvItemsJson);
              this.step2TableData = recvItems.map(item => ({
                CAP_Item: item.CAP_Item,
                ARS_Amt: item.ARS_Amt,
                NoteDesc: item.NoteDesc || ''
              }));
            } catch (e) {
              console.error('解析收款項目明細失敗:', e);
            }
          }

          // 載入票據明細
          if (recvData.ChecksJson) {
            try {
              const checks: CheckDetailItem[] = JSON.parse(recvData.ChecksJson);
              this.step3TableData = checks.map(check => ({
                CHK_No: check.CHK_No,
                CHK_Type: check.CHK_Type || '1',
                CHK_Amt: check.CHK_Amt,
                Ticket_YN: check.Ticket_YN || 'N',
                BNK_No: check.BNK_No,
                BNK_BranchNo: check.BNK_BranchNo,
                BNK_AccNo: check.BNK_AccNo || '',
                VEN_No: check.VEN_No || '',
                CHK_ReceDate: check.CHK_ReceDate ? new Date(check.CHK_ReceDate) : null,
                CHK_ExpireDate: check.CHK_ExpireDate ? new Date(check.CHK_ExpireDate) : null,
                CHK_PreDate: check.CHK_PreDate ? new Date(check.CHK_PreDate) : null,
                CHK_Comment: check.CHK_Comment || ''
              }));
            } catch (e) {
              console.error('解析票據明細失敗:', e);
            }
          }
        }
      });
  }

  // ----------------------------------------------------------------
  // 表單提交
  // ----------------------------------------------------------------

  /** 最終提交 (步驟3完成後) */
  onFinalSubmit(): void {
    // 驗證所有步驟
    this.step1Form.markAllAsTouched();

    if (this.step1Form.invalid) {
      this.messageService.errorBubble('請填寫所有必填欄位');
      return;
    }

    if (this.selectedARItems.length === 0) {
      this.messageService.errorBubble('請至少選擇一筆應收帳款');
      return;
    }

    if (this.step2TableData.length === 0) {
      this.messageService.errorBubble('請至少新增一個收款項目');
      return;
    }

    this.loading = true;

    const step1Value = this.step1Form.getRawValue();

    // 準備收款資料
    const recvRequest = {
      STO_No: '', // TODO: 從登入使用者取得組織代號
      RCV_No: step1Value.RCV_No || this.generateRCVNo(),
      RCV_Date: step1Value.RCV_Date.toISOString(),
      Sales_Id: step1Value.Sales_Id,
      CompNo: '', // TODO: 從登入使用者取得公司代號
      VouNo: null,
      Remark: step1Value.Remark,
      Status: 'A',
      UserId: '', // TODO: 從登入使用者取得
      UserName: '', // TODO: 從登入使用者取得
      Detail: this.step2TableData.map((item: any) => ({
        CAP_Item: item.CAP_Item,
        ARS_Amt: item.ARS_Amt,
        NoteDesc: item.NoteDesc
      }))
    };

    // 先儲存收款資料
    const recvApiCall = this.isFormCreateable
      ? this.fin32030Service.insertFIN32030Recv(recvRequest)
      : this.fin32030Service.updateFIN32030Recv(recvRequest);

    recvApiCall
      .pipe(
        untilDestroyed(this),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: () => {
          // 如果有票據資料，繼續儲存票據
          if (this.step3TableData && this.step3TableData.length > 0) {
            this.submitCheckData(recvRequest.RCV_No, this.step3TableData);
          } else {
            this.messageService.successBubble(
              this.isFormCreateable ? '新增收款沖帳成功' : '更新收款沖帳成功'
            );
            setTimeout(() => {
              this.onCancel();
            }, 500);
          }
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  /** 提交票據資料 */
  private submitCheckData(rcvNo: string, checks: any[]): void {
    const checkRequest = {
      STO_No: '', // TODO: 從登入使用者取得組織代號
      RCV_No: rcvNo,
      Sales_Id: this.step1Form.value.Sales_Id || '',
      UserId: '', // TODO: 從登入使用者取得
      UserName: '', // TODO: 從登入使用者取得
      Checks: checks.map((check: any) => ({
        CHK_No: check.CHK_No,
        VEN_No: check.VEN_No,
        BNK_No: check.BNK_No,
        BNK_BranchNo: check.BNK_BranchNo,
        BNK_AccNo: check.BNK_AccNo,
        CHK_ReceDate: check.CHK_ReceDate,
        CHK_ExpireDate: check.CHK_ExpireDate,
        CHK_PreDate: check.CHK_PreDate,
        CHK_Amt: check.CHK_Amt,
        CHK_Type: check.CHK_Type,
        Ticket_YN: check.Ticket_YN,
        CHK_Comment: check.CHK_Comment,
        AccNo: check.AccNo,
        ORG_ID: check.ORG_ID,
        ProjectNo: check.ProjectNo
      }))
    };

    const checkApiCall = this.isFormCreateable
      ? this.fin32030Service.insertFIN32030Check(checkRequest)
      : this.fin32030Service.updateFIN32030Check(checkRequest);

    checkApiCall
      .pipe(untilDestroyed(this))
      .subscribe({
        next: () => {
          this.messageService.successBubble(
            this.isFormCreateable ? '新增收款沖帳成功(含票據)' : '更新收款沖帳成功(含票據)'
          );
          setTimeout(() => {
            this.onCancel();
          }, 500);
        },
        error: () => {
          this.messageService.errorBubble('票據資料儲存失敗');
        }
      });
  }

  /** 產生收款單號 (R+YYYYMMDDXXX) */
  private generateRCVNo(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
    return `R${year}${month}${day}${random}`;
  }
}
