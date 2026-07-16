import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { FIN25020Service, QueryBankAccountResponse } from '../../../service/api/fin/fin25020.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../others/component/table/table.component';
import { AddButton, Column, formatDate } from '../../../others/component/table/table.model';

// 定義資料介面 (對應後端 Response)
export interface FIN25020Data {
  WSLIP_NO: string;
  D_Date: string | null;
  RMT_Date: string | null;
  BNK_id: number | null;
  BNK_AccName: string | null;
  VouStatus: string | null;
  VouNo: string | null;
  RemitCount: number | null;
  TotalRemitAmt: number | null;
}

//1.2.5.2 形成電匯明細資料
@Component({
  selector: 'app-fin25020',
  templateUrl: './fin25020.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    CalendarRangeComponent,
    InputTextComponent,
    TableComponent,
    TranslateModule,
    AsyncPipe
  ]
})
export class FIN25020Component extends BasicQueryPageComponent<FIN25020Data> implements OnInit {
  queryForm = this.formBuilder.group({
    WSLIP_NO: [null], // 匯款單號
    D_Date_Start: [null], // 建立日期起
    D_Date_End: [null], // 建立日期迄
    RMT_Date_Start: [null], // 匯款日期起
    RMT_Date_End: [null], // 匯款日期迄
    BNK_id: [null as number | null], // 銀行帳戶
    VouStatus: [''], // 轉傳票狀態
    pageSize: [20], // 每頁筆數 (小寫,配合 onLazyLoadData)
    pageIndex: [1], // 頁碼 (小寫,配合 onLazyLoadData)
    SortBy: [[{ field: 'WSLIP_NO', order: 1 }]], // 排序參數
  });

  totalRecords = 0;
  data: FIN25020Data[] = [];
  selectedItems: FIN25020Data[] = [];

  // 銀行帳戶下拉選項
  bankOptions: (QueryBankAccountResponse & { displayLabel: string })[] = [];

  // 轉傳票狀態選項
  vouStatusOptions: { label: string; value: string }[] = [
    { label: '全部', value: '' },
    { label: '已轉', value: 'Y' },
    { label: '未轉', value: 'N' },
  ];

  columns: Column[] = [
    { field: 'WSLIP_NO', header: '匯款單號', visible: true },
    { field: 'D_Date', header: '建立日期', visible: true, format: formatDate },
    { field: 'RMT_Date', header: '匯款日期', visible: true, format: formatDate },
    { field: 'BNK_id', header: '銀行代號', visible: true },
    { field: 'BNK_AccName', header: '銀行帳戶名稱', visible: true },
    { field: 'VouStatus', header: '轉傳票狀態', visible: true },
    { field: 'VouNo', header: '傳票號碼', visible: true },
    // { field: 'RemitCount', header: '匯款筆數', visible: true },
    // { field: 'TotalRemitAmt', header: '匯款總金額', visible: true },
  ];

  // 管理欄位自定義按鈕
  addButton: AddButton[] = [
    {
      label: '匯出PDF',
      icon: 'pi pi-file-pdf text-red-500',
      displayText: '',
      action: (rowData: FIN25020Data) => this.onExportPDF(rowData)
    },
    {
      label: '匯出Excel',
      icon: 'pi pi-file-excel text-green-500',
      displayText: '',
      action: (rowData: FIN25020Data) => this.onExportExcel(rowData)
    }
  ];

  constructor(
    private readonly fin25020Service: FIN25020Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN25020', 'fin/fin25020cru', this.queryForm, (form) => this.onSubmit(form));

    // 載入銀行帳戶選項
    this.fin25020Service.queryBankAccount({})
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.bankOptions = response.Data.map(item => ({
          ...item,
          displayLabel: `${item.BNK_id || item.id} - ${item.BNK_AccName}`
        }));
      });
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const formValue = frm.value;

      // 準備 API 請求參數 (表單用小寫,後端用大寫)
      const queryParams = {
        D_Date_Start: formValue.D_Date_Start,
        D_Date_End: formValue.D_Date_End,
        RMT_Date_Start: formValue.RMT_Date_Start,
        RMT_Date_End: formValue.RMT_Date_End,
        WSLIP_NO: formValue.WSLIP_NO,
        BNK_id: formValue.BNK_id,
        VouStatus: formValue.VouStatus,
        // 分頁和排序參數 (轉換為大寫給後端)
        PageIndex: formValue.pageIndex,
        PageSize: formValue.pageSize,
        SortBy: formValue.SortBy,
      };

      this.fin25020Service.queryFIN25020(queryParams)
        .pipe(
          finalize(() => this.loading = false),
          untilDestroyed(this)
        )
        .subscribe(response => {
          this.data = response.Data;
          this.totalRecords = response.TotalCount;
          this.queryStateService.setQueryState(this.ProgNo, formValue);
        });
    });
  }


  onDelete(selectedItems: FIN25020Data[]) {
    // 檢查是否有已轉傳票的資料
    const hasTransferred = selectedItems.some(item => item.VouStatus === '已轉');

    if (hasTransferred) {
      this.messageService.errorBubble('只能刪除未轉傳票的資料');
      return;
    }

    this.messageService.confirm({
      header: `是否確認刪除 ${selectedItems.length} 筆資料？`,
      accept: () => {
        const wslipNoList = selectedItems.map(item => item.WSLIP_NO);

        this.fin25020Service.deleteRemit({ PAM_NoList: wslipNoList })
          .pipe(untilDestroyed(this))
          .subscribe(() => {
            this.messageService.successBubble('刪除成功');
            this.onSubmit(this.queryForm);
          });
      }
    });
  }

  /**
   * 匯出單筆資料為 PDF
   */
  onExportPDF(rowData: FIN25020Data) {
    this.messageService.infoBubble(`正在匯出 PDF: ${rowData.WSLIP_NO}`);

    this.fin25020Service.exportFIN25020ToPdf({ WSLIP_NO: rowData.WSLIP_NO })
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (blob) => {
          this.downloadFile(blob, `FIN25020_${rowData.WSLIP_NO}.pdf`);
          this.messageService.successBubble('PDF 匯出成功');
        },
        error: (error) => {
          console.error('PDF 匯出失敗:', error);
          this.messageService.errorBubble('PDF 匯出失敗');
        }
      });
  }

  /**
   * 匯出單筆資料為 Excel
   */
  onExportExcel(rowData: FIN25020Data) {
    this.messageService.infoBubble(`正在匯出 Excel: ${rowData.WSLIP_NO}`);

    this.fin25020Service.exportFIN25020ToExcel({ WSLIP_NO: rowData.WSLIP_NO })
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (blob) => {
          this.downloadFile(blob, `FIN25020_${rowData.WSLIP_NO}.xlsx`);
          this.messageService.successBubble('Excel 匯出成功');
        },
        error: (error) => {
          console.error('Excel 匯出失敗:', error);
          this.messageService.errorBubble('Excel 匯出失敗');
        }
      });
  }

  /**
   * 下載檔案通用方法
   */
  private downloadFile(blob: Blob, fileName: string): void {
    const url = globalThis.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    globalThis.URL.revokeObjectURL(url);
  }

  isRowSelectable(rowData: FIN25020Data): boolean {
    return rowData.VouStatus !== '已轉';
  }
}
