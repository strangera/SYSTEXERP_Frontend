import { Component, OnInit, signal } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Fin21020Service, IFin21020Data, IQueryFin21020Request } from '@service/api/fin/fin21020.service';
import { DropDownListService, IDropdownItem } from '@service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { AddButton, Column, createPaginationConfig, formatAmount } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { ExcelColumn, ExcelExportService } from './../../../shared/service/excel-export.service';
// 1.2.1.2 費率對照維護
@Component({
  selector: 'app-fin21020',
  templateUrl: './fin21020.component.html',
  standalone: true,
  imports: [TableReportComponent, DialogComponent, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, DropdownComponent, InputNumberRangeComponent, TableComponent, TranslateModule]
})
export class FIN21020Component extends BasicQueryPageComponent<IFin21020Data> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    BNK_No: [null as string | null], // 公司銀行科目代號
    Remit_BAmount_Start: [null as number | null, [Validators.max(9999999999)]], // 金額下限 - 轉帳最低金額(起)
    Remit_BAmount_End: [null as number | null, [Validators.max(9999999999)]], // 金額下限 - 轉帳最低金額(迄)
    Remit_UAmount_Start: [null as number | null, [Validators.max(9999999999)]], // 金額上限 - 轉帳最高金額(起)
    Remit_UAmount_End: [null as number | null, [Validators.max(9999999999)]], // 金額上限 - 轉帳最高金額(迄)
    Remit_Fee_Start: [null as number | null, [Validators.max(999999)]],
    Remit_Fee_End: [null as number | null, [Validators.max(999999)]],
    Comp_Remit_Fee_Start: [null as number | null, [Validators.max(999999)]],
    Comp_Remit_Fee_End: [null as number | null, [Validators.max(999999)]],
    Cash_Back_Amt_Start: [null as number | null, [Validators.max(999999)]],
    Cash_Back_Amt_End: [null as number | null, [Validators.max(999999)]],
    ...createPaginationConfig([{ field: 'BNK_No', order: 1 }, { field: 'Remit_BAmount', order: 1 }])
  });
  selectedItems: IFin21020Data[] = [];
  columns: Column[] = [
    { field: 'BNK_No', header: '公司銀行科目代號' },
    { field: 'BNK_Name', header: '公司銀行科目名稱' },
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
  btnLoading = false;
  lastQueryBody?: IQueryFin21020Request;
  totalRecords = 0;
  data: IFin21020Data[] = [];
  constructor(
    private readonly dropDownListService: DropDownListService,
    public readonly fin21020Service: Fin21020Service, // 注入新的 service
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
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body = {
        ...frm.value,
        pageSize: 30,
        pageIndex: 1, // 你將初始頁碼改為 1
        SortBy: [{ field: 'BNK_No', order: 1 }, { field: 'Remit_BAmount', order: 1 }],
      }
      this.fin21020Service.queryFIN21020(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
        this.lastQueryBody = body;
        this.totalRecords = res.TotalCount;
        this.data = res.Data;


        this.queryStateService.setQueryState(this.ProgNo, frm.value);
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
    this.btnLoading = true;
    const bnkNo = rowData.BNK_No || '';
    this.fin21020Service.queryByBnkNo(bnkNo).pipe(untilDestroyed(this), finalize(() => this.btnLoading = false)).subscribe(res => {
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
