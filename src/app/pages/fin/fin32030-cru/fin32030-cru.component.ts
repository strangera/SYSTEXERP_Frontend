import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { DialogModule } from 'primeng/dialog';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import {
  FIN32030Service,
  QueryFIN32030ARResponse,
  QueryFIN32030Response,
  QueryRecvItemResponse,
  RecvDetailResponse
} from '../../../service/api/fin/fin32030.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { Column, formatAmountWithFraction, formatDate } from '../../../shared/componentkit/table/table.model';


//1.3.2.3 收款沖帳維護 CRU
@Component({
  selector: 'app-fin32030-cru',
  templateUrl: './fin32030-cru.component.html',
  styleUrl: './fin32030-cru.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputNumberComponent,
    CalendarComponent,
    DropdownComponent,
    InputTextComponent,
    NgFor,
    NgIf,
    TranslateModule,
    DialogModule,
    TableComponent
  ]
})
export class FIN32030CRUComponent extends BasicCruPageComponent<QueryFIN32030Response> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    RCV_No: ['', [Validators.maxLength(20)]], // 收款單號
    RCV_Date: [new Date(), [Validators.required]], // 收款日期
    Sales_Id: [null as string | null], // 業務員代號
    Remark: ['', [Validators.maxLength(100)]], // 備註
    items: this.formBuilder.array<FormGroup>([]), // 收款項目明細
  });

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
  arDialogColumns: Column[] = [
    { field: 'ARS_ID', header: '應收ID', visible: true },
    { field: 'VEN_No', header: '廠客代號', visible: true },
    { field: 'VEN_Name', header: '廠客名稱', visible: true },
    { field: 'ARS_Amt', header: '應收金額', visible: true, format: formatAmountWithFraction, style: 'text-right' },
    { field: 'ARS_Date', header: '立帳日', visible: true, format: formatDate },
    { field: 'PaidAmt', header: '已收款金額', visible: true, format: formatAmountWithFraction, style: 'text-right' },
    { field: 'UnpaidAmt', header: '未收款金額', visible: true, format: formatAmountWithFraction, style: 'text-right' },
    { field: 'PTA_Date', header: '預計收款日', visible: true, format: formatDate },
    { field: 'NoteDesc', header: '摘要', visible: true },
  ];

  // 業務員下拉選項 (TODO: 需要從 API 載入)
  salesOptions: any[] = [];

  constructor(
    private readonly fin32030Service: FIN32030Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN32030', this.dataForm);

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
        this.dataForm.disable();
      }
    } else if (this.isFormCreateable) {
      // 新增模式：初始化一個空的收款項目
      this.addItem();
    }
  }

  // ----------------------------------------------------------------
  // FormArray 相關
  // ----------------------------------------------------------------
  get items(): FormArray {
    return this.dataForm.get('items') as FormArray;
  }

  getFormControl(index: number, controlName: string): FormControl {
    return this.items.at(index).get(controlName) as FormControl;
  }

  createItem(data?: RecvDetailResponse): FormGroup {
    return this.formBuilder.group({
      CAP_Item: [data?.CAP_Item || null, [Validators.required]], // 收款項目
      ARS_Amt: [data?.ARS_Amt || null, [Validators.required, Validators.min(0)]], // 收款金額
      NoteDesc: [data?.NoteDesc || '', [Validators.maxLength(100)]], // 備註
    });
  }

  addItem(): void {
    this.items.push(this.createItem());
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
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

          // 填入表單資料 (header 資訊)
          this.dataForm.patchValue({
            RCV_No: recvData.RCV_No || '',
            RCV_Date: recvData.RCV_Date ? new Date(recvData.RCV_Date) : new Date(),
            Sales_Id: recvData.Sales_Id,
            Remark: recvData.Remark || ''
          });

          // 載入收款項目明細
          if (recvData.RecvItemsJson) {
            try {
              const recvItems: RecvDetailResponse[] = JSON.parse(recvData.RecvItemsJson);
              this.items.clear();
              recvItems.forEach(item => {
                this.items.push(this.createItem(item));
              });
            } catch (e) {
              console.error('解析收款項目明細失敗:', e);
            }
          }
        }
      });
  }

  // ----------------------------------------------------------------
  // 應收未收查詢對話框
  // ----------------------------------------------------------------

  /** 開啟應收未收查詢對話框 */
  openARDialog(): void {
    this.showARDialog = true;
    this.loadARData();
  }

  /** 載入應收未收資料 */
  loadARData(): void {
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

  /** 查詢應收未收 */
  onQueryAR(): void {
    this.loadARData();
  }

  /** 選擇應收帳款（雙擊） */
  onSelectAR(data: QueryFIN32030ARResponse): void {
    // TODO: 實作選擇應收帳款後的邏輯
    // 可能需要新增到收款項目或建立沖帳記錄
    this.messageService.successBubble(`已選擇應收帳款: ${data.ARS_ID}`);
    this.showARDialog = false;
  }

  // ----------------------------------------------------------------
  // 表單提交
  // ----------------------------------------------------------------

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const formValue = frm.getRawValue();

      // 驗證至少要有一個收款項目
      if (!formValue.items || formValue.items.length === 0) {
        this.messageService.errorBubble('請至少新增一個收款項目');
        this.loading = false;
        return;
      }

      // 準備 API 請求參數
      const request = {
        STO_No: '', // 從登入使用者取得組織代號
        RCV_No: formValue.RCV_No || this.generateRCVNo(), // 新增時產生收款單號
        RCV_Date: formValue.RCV_Date,
        Sales_Id: formValue.Sales_Id,
        CompNo: '', // 從登入使用者取得公司代號
        VouNo: null, // 傳票號碼由後端產生
        Remark: formValue.Remark,
        Status: 'A', // 狀態
        UserId: '',
        UserName: '',
        Detail: formValue.items.map((item: { CAP_Item: string; ARS_Amt: number; NoteDesc: string }) => ({
          CAP_Item: item.CAP_Item,
          ARS_Amt: item.ARS_Amt,
          NoteDesc: item.NoteDesc
        }))
      };

      // 根據模式呼叫新增或更新 API
      const apiCall = this.isFormCreateable
        ? this.fin32030Service.insertFIN32030Recv(request)
        : this.fin32030Service.updateFIN32030Recv(request);

      apiCall
        .pipe(
          untilDestroyed(this),
          finalize(() => this.loading = false)
        )
        .subscribe({
          next: () => {
            this.messageService.successBubble(
              this.isFormCreateable ? '新增收款沖帳成功' : '更新收款沖帳成功'
            );
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
