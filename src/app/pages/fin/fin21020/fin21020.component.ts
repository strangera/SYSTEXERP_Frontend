import { ExcelColumn, ExcelExportService } from './../../../shared/service/excel-export.service';
import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { AddButton, Column, createPaginationConfig, formatAmount } from '@shared/componentkit/table/table.model';
import { Fin21020Service, IFin21020Data } from '@service/api/fin/fin21020.service';
import { finalize } from 'rxjs';
import { untilDestroyed } from '@ngneat/until-destroy';
import { DropDownListService, IDropdownItem } from '@service/utility/dropDownList.service';
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { Table, TableLazyLoadEvent, TableModule } from 'primeng/table';
import { CarService } from './carservice';
import { SkeletonModule } from 'primeng/skeleton';
import { NgFor } from '@angular/common';
// 1.2.1.2 費率對照維護
@Component({
  selector: 'app-fin21020',
  templateUrl: './fin21020.component.html',
  standalone: true,
  providers: [CarService],
  imports: [NgFor, SkeletonModule, TableModule, DialogComponent, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, DropdownComponent, InputNumberRangeComponent, TableComponent, TranslateModule]
})
export class FIN21020Component extends BasicQueryPageComponent<IFin21020Data> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    BNK_No: [null as string | null], // 公司銀行科目代號
    Remit_BAmount_Start: [null as number | null, [Validators.max(9999999999)]], // 金額下限 - 轉帳最低金額(起)
    Remit_BAmount_End: [null as number | null, [Validators.max(9999999999)]], // 金額下限 - 轉帳最低金額(迄)
    Remit_UAmount_Start: [null as number | null, [Validators.max(9999999999)]], // 金額上限 - 轉帳最高金額(起)
    Remit_UAmount_End: [null as number | null, [Validators.max(9999999999)]], // 金額上限 - 轉帳最高金額(迄)
    Remit_Fee: [null as number | null, [Validators.max(999999)]], // 廠商負擔電匯手續費
    Comp_Remit_Fee: [null as number | null, [Validators.max(999999)]], // 公司負擔電匯手續費
    Cash_Back_Amt: [null as number | null, [Validators.max(999999)]], // 廠商負擔電匯手續費回饋收入
    ...createPaginationConfig([{ field: 'BNK_No', order: 1 }, { field: 'Remit_BAmount', order: 1 }]), // 分頁和排序參數
  });
  totalRecords = 0;
  data: IFin21020Data[] = [];
  virtualData: IFin21020Data[] = [];
  selectedItems: IFin21020Data[] = [];
  columns: Column[] = [
    { field: 'BNK_No', header: '公司銀行科目代號' },
    { field: 'Remit_BAmount', header: '金額下限', format: formatAmount },
    { field: 'Remit_UAmount', header: '金額上限', format: formatAmount },
    { field: 'Remit_Fee', header: '廠商負擔電匯手續費', format: formatAmount },
    { field: 'Comp_Remit_Fee', header: '公司負擔電匯手續費', format: formatAmount },
    { field: 'Cash_Back_Amt', header: '廠商負擔電匯手續費回饋收入', format: formatAmount },
  ];
  bankCodeOptions: IDropdownItem[] = [];
  addButton: AddButton[] = [
    { label: '匯出單筆銀行科目', icon: 'pi pi-file-export', action: (rowData: IFin21020Data) => this.onExport(rowData) },
  ]

  constructor(
    private readonly dropDownListService: DropDownListService,
    private readonly fin21020Service: Fin21020Service, // 注入新的 service
    private readonly excelExportService: ExcelExportService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN21020', 'fin/fin21020cru', this.queryForm, (form) => this.onSubmit(form));
    this.dropDownListService.queryGLS1005For1103_DropDownList().pipe(untilDestroyed(this)).subscribe(data => {
      this.bankCodeOptions = data.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}` }));
    });
    // 監聽，當 BNK_No 變化時，並且變化的值是下拉選單中的值，延遲並打API
    this.dialogForm.get('BNK_No')?.valueChanges.pipe(untilDestroyed(this)).subscribe(bnkNo => {
      this.dataDialog = this.bankCodeOptions.filter(item => item.No !== bnkNo) ?? [];
    });
  }

  // ----------------------------------------------------------------
  @ViewChild('pTable') pTable!: Table;
  private lastQueryBody: any;
  private firstLoad = true;
  loadDataLazy(event: TableLazyLoadEvent) {// 一開始我根本沒做onSubmit 就會觸發loadDataLazy，應該要提交後才可以觸發，所以一開始應該table甚麼資料都不能有
    console.log('📄 loadDataLazy 收到分頁事件:', event);
    if (this.firstLoad && this.totalRecords === 0) {
      this.firstLoad = false;
      return;
    }
    // 如果沒有查詢條件，不執行後續邏輯
    if (!this.lastQueryBody) {
      return;
    }
    // --- 快取邏輯 ---
    const pageSize = event.rows;
    if (this.virtualData.length > 0) {
      const requestedDataSlice = this.virtualData.slice(event.first, (event.first ?? 0) + (pageSize ?? 20));
      if (requestedDataSlice.every(item => item !== null)) {
        return;
      }
    }
    // --- 快取邏輯結束 ---
    const body = {
      ...this.lastQueryBody, // 使用最後一次查詢的條件
      pageIndex: Math.ceil((event.first ?? 0) / (pageSize ?? 20) + 1),
      pageSize: pageSize,
      multiSortMeta: event.multiSortMeta
    };
    this.loading = true;
    this.fin21020Service.queryFIN21020(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
      this.totalRecords = res.TotalCount;
      // 確保 virtualData 陣列的長度與總筆數一致
      if (this.virtualData.length !== this.totalRecords) {
        this.virtualData = Array(this.totalRecords).fill(null);
      }
      this.virtualData.splice((event.first ?? 0), (event.rows ?? 0), ...res.Data);
      if (event.forceUpdate) { event.forceUpdate(); }
    })
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.lastQueryBody = frm.value; // 保存查詢條件
      this.fin21020Service.queryFIN21020(frm.value).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
        this.totalRecords = res.TotalCount; // 1. 先設定總筆數
        // this.virtualData.splice(0, res.Data.length, ...res.Data); // 3. 將第一頁資料填入這個虛擬陣列
        this.virtualData = Array.from({ length: this.totalRecords }); // 2. 根據總筆數初始化虛擬陣列
        // 這行可以移除，因為 data 已經被 virtualData 替代了
        // this.data = res.Data;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
        // 手動觸發一次表格載入事件
        this.pTable.reset();
      });
    });
  }
  // ----------------------------------------------------------------
  onDelete(selectedRows: IFin21020Data[]) {
    // 使用 Set 物件來獲取不重複的 BNK_No 列表
    const uniqueBnkNos = [...new Set(selectedRows.map(row => row.BNK_No))];
    // 將不重複的 BNK_No 列表用逗號串接成字串
    const bnkNosDisplay = uniqueBnkNos.join('<br>');
    this.confirmationService.confirm({
      // 在訊息中顯示不重複的 BNK_No 列表，並加上總筆數
      message: `<div class="flex flex-column justify-content-center align-items-center">
      是否確定要刪除<br><b>公司銀行科目代號為：</b> ${bnkNosDisplay}<br>
      </div>`,
      accept: () => {
        this.loading = true;
        // 呼叫刪除服務，傳入不重複的 BnkNos
        this.fin21020Service.deleteFIN21020(uniqueBnkNos).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
          this.messageService.successBubble(res.Message);
          this.selectedItems = [];
          this.onSubmit(this.queryForm);
        });
      }
    });
  }
  excelColumns: ExcelColumn[] = [
    { field: 'BNK_No', header: '公司銀行科目代號', width: 20 },
    { field: 'Remit_BAmount', header: '金額下限', width: 15 },
    { field: 'Remit_UAmount', header: '金額上限', width: 15 },
    { field: 'Remit_Fee', header: '廠商負擔電匯手續費', width: 25 },
    { field: 'Comp_Remit_Fee', header: '公司負擔電匯手續費', width: 25 },
    { field: 'Cash_Back_Amt', header: '廠商負擔電匯手續費回饋收入', width: 30 },
  ];
  onExport(rowData: IFin21020Data) {
    this.loading = true;
    const bnkNo = rowData.BNK_No || '';
    this.fin21020Service.queryByBnkNo(bnkNo).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
      this.excelExportService.exportData(res.Data, `費率對照維護${bnkNo}`, this.excelColumns);
    });
  }
  dialogVisible = signal(false);
  dataDialog: IDropdownItem[] = [];
  selectedItemsDialog: IDropdownItem[] = [];
  columnsDialog: Column[] = [
    { field: 'No', header: '公司銀行科目代號' },
    { field: 'Name', header: '公司銀行科目名稱' },
  ]
  dialogForm = this.formBuilder.nonNullable.group({
    BNK_No: [null, [Validators.required]], // 公司銀行科目代號
  });
  dialogSubmitted = signal(false);
  onCopyRate() {
    this.dialogVisible.set(true);
    this.dialogForm.reset();
    this.selectedItemsDialog = [];
    this.dialogSubmitted.set(false);
    this.dataDialog = [];
  }
  saveDialog() {
    this.confirmationService.confirm({
      message: '是否將被選擇的公司銀行科目代號資料全數刪除，並且將來源公司銀行科目代號的資料複製寫入?',
      accept: () => {
        this.loading = true;
        const body = {
          sourceBnkNo: this.dialogForm.getRawValue().BNK_No || '',
          targetBnkNos: this.selectedItemsDialog.map(item => item.No)
        }
        // 呼叫刪除服務，傳入不重複的 BnkNos
        this.fin21020Service.copyFIN21020(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
          this.messageService.successBubble(res.Message);
          this.selectedItemsDialog = [];
          this.dataDialog = [];
          this.dialogVisible.set(false);
          this.onSubmit(this.queryForm);
        });
      }
    });
  }
}
