import { ExcelImportService, ImportExcelColumn } from '@shared/service/excel-import.service';
import { ExcelColumn, ExcelExportService } from '@shared/service/excel-export.service';
import { Component, OnInit, signal, ViewChild, } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { PanelModule } from 'primeng/panel';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { NgIf } from '@angular/common';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { untilDestroyed } from '@ngneat/until-destroy';
import { DropDownListService, IDropdownItem } from '@service/utility/dropDownList.service';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { IFin21020Data, IFin21020Detail, Fin21020Service } from '@service/api/fin/fin21020.service';
import { finalize } from 'rxjs';
// 引入驗證函式
import { validateRequired } from '@shared/componentkit/table-edit/validate-field.model';
import { FileSelectEvent } from 'primeng/fileupload';

//1.2.1.2 費率對照維護 CRU
@Component({
  selector: 'app-fin21020-cru',
  templateUrl: './fin21020-cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    ButtonComponent,
    NgIf,
    TranslateModule,
    TableEditComponent
  ]
})
export class FIN21020CRUComponent extends BasicCruPageComponent<IFin21020Data> implements OnInit {
  @ViewChild(TableEditComponent) tableEditComponent!: TableEditComponent; // 取得子元件實例
  dataForm = this.formBuilder.nonNullable.group({
    BNK_No: [null as string | null, [Validators.required]], // 公司銀行科目代號
  });
  bankCodeOptions: IDropdownItem[] = [];
  data: IFin21020Detail[] = [];
  selectedItems: IFin21020Detail[] = [];
  columns: EditColumn[] = [
    { field: 'Remit_BAmount', header: '金額下限', type: 'inputNumber', width: '9rem', maxLength: 10, min: 0, validate: [validateRequired], onFocus: (rowData) => { this.autoFillNextRow(rowData); } },
    { field: 'Remit_UAmount', header: '金額上限', type: 'inputNumber', width: '9rem', maxLength: 10, min: 0, validate: [validateRequired] },
    { field: 'Remit_Fee', header: '廠商負擔電匯手續費', type: 'inputNumber', width: '12rem', maxLength: 6, min: 0, validate: [validateRequired], onBlur: (rowData) => { this.autoFillCashBackAmt(rowData); } },
    { field: 'Comp_Remit_Fee', header: '公司負擔電匯手續費', type: 'inputNumber', width: '12rem', maxLength: 6, min: 0, validate: [validateRequired] },
    { field: 'Cash_Back_Amt', header: '廠商負擔電匯手續費回饋收入', type: 'inputNumber', width: '12rem', maxLength: 6, min: 0 },
  ];
  excelBtnLoading = signal(false);
  constructor(
    private readonly dropDownListService: DropDownListService,
    private readonly fin21020Service: Fin21020Service, // 注入服務
    private readonly excelExportService: ExcelExportService,
    private readonly excelImportService: ExcelImportService
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('FIN21020', this.dataForm);
    this.dropDownListService.queryGLS1005For1103_DropDownList().pipe(untilDestroyed(this)).subscribe(data => {
      this.bankCodeOptions = data.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}` }));
    });
    if (!this.isFormCreateable) {
      this.dataForm.get('BNK_No')?.disable();
      this.loading = true;
      const bnkNo = this.dataForm.value.BNK_No || '';
      this.fin21020Service.queryByBnkNo(bnkNo).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
        this.data = res.Data;
      });
    }
  }

  // 新增一個 `validateEntireRow` 函式，用於整行驗證
  validateEntireRow = (rowData: IFin21020Detail): { isValid: boolean, errorMessage: string } => {
    // 檢查金額下限與上限是否為有效數字
    if (rowData.Remit_BAmount == null || rowData.Remit_UAmount == null) {
      return { isValid: false, errorMessage: '金額下限和金額上限都必須填寫' };
    }

    // 檢查金額上限是否大於下限
    if (rowData.Remit_UAmount <= rowData.Remit_BAmount) {
      return { isValid: false, errorMessage: '金額上限必須大於金額下限' };
    }

    const rowIndex = this.data.indexOf(rowData);

    // 檢查第一行金額下限是否為0
    if (rowIndex === 0 && rowData.Remit_BAmount !== 0) {
      return { isValid: false, errorMessage: '第一筆的金額下限必需為0' };
    }

    // 檢查區間重疊邏輯 (使用 this.data)
    const isOverlapping = this.data.some((item, index) => {
      if (index === rowIndex) {
        return false;
      }

      // 檢查新區間是否與現有區間重疊
      return (
        rowData.Remit_BAmount != null &&
        rowData.Remit_UAmount != null &&
        item.Remit_BAmount != null &&
        item.Remit_UAmount != null &&
        (rowData.Remit_BAmount <= item.Remit_UAmount && rowData.Remit_UAmount >= item.Remit_BAmount)
      );
    });

    if (isOverlapping) {
      return { isValid: false, errorMessage: `新增的金額區間與現有資料重疊 (${rowData.Remit_BAmount}-${rowData.Remit_UAmount})` };
    }

    // 檢查上一行的金額上限 + 1 是否等於這一行的金額下限
    if (rowIndex > 0) {
      const prevRow = this.data[rowIndex - 1];
      if (prevRow.Remit_UAmount != null && rowData.Remit_BAmount !== (prevRow.Remit_UAmount + 1)) {
        return { isValid: false, errorMessage: `金額下限必需等於上一筆的金額上限加1 (${prevRow.Remit_UAmount + 1})` };
      }
    }

    return { isValid: true, errorMessage: '' };
  };

  // 依照上一筆自動帶入相同值+1
  autoFillNextRow(rowData: IFin21020Detail) {
    const rowIndex = this.data.indexOf(rowData);
    if (rowIndex > 0) {
      const prevRow = this.data[rowIndex - 1];
      if (typeof prevRow.Remit_UAmount === 'number') {
        rowData.Remit_BAmount = prevRow.Remit_UAmount + 1;
      }
    } else {
      rowData.Remit_BAmount = 0;
    }
  }

  // 依照Remit_Fee自動帶入Cash_Back_Amt
  autoFillCashBackAmt(rowData: IFin21020Detail) {
    rowData.Cash_Back_Amt = rowData.Remit_Fee;
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const tableValid = this.tableEditComponent.validateAndShowErrors();
      if (!tableValid) {
        this.loading = false;
        return;
      }
      const body = {
        id: this.rowdata?.id,
        BNK_No: frm.value.BNK_No,
        Details: this.data.filter(item => !item['_isAutoInsertCandidate']).map(item => ({
          id: item.id,
          Remit_BAmount: item.Remit_BAmount,
          Remit_UAmount: item.Remit_UAmount,
          Remit_Fee: item.Remit_Fee,
          Comp_Remit_Fee: item.Comp_Remit_Fee,
          Cash_Back_Amt: item.Cash_Back_Amt,
        })),
      };
      this.loading = false;
      const api = this.isFormCreateable ? this.fin21020Service.insertFIN21020(body) : this.fin21020Service.updateFIN21020(body);
      api.pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
        this.messageService.successBubble(res.Message);
      })
    });
  }
  isRowSelectable(row: IFin21020Detail, index: number, data: IFin21020Detail[]): boolean {
    return index === data.length - 2;
  }
  excelColumns: ExcelColumn[] = [
    { field: 'BNK_No', header: '公司銀行科目代號', width: 20 },
    { field: 'Remit_BAmount', header: '金額下限', width: 15 },
    { field: 'Remit_UAmount', header: '金額上限', width: 15 },
    { field: 'Remit_Fee', header: '廠商負擔電匯手續費', width: 25 },
    { field: 'Comp_Remit_Fee', header: '公司負擔電匯手續費', width: 25 },
    { field: 'Cash_Back_Amt', header: '廠商負擔電匯手續費回饋收入', width: 30 },
  ];
  async onExportExcel() {
    this.excelBtnLoading.set(true);
    try {
      const bnkNo = this.dataForm.get('BNK_No')?.value;
      const filteredData = this.data.filter((item: any) => !item['_isAutoInsertCandidate']);

      if (bnkNo && filteredData.length > 0) {
        const exportData = filteredData.map((item: any) => ({
          ...item,
          BNK_No: bnkNo,
          Remit_BAmount: item.Remit_BAmount || 0,
          Remit_UAmount: item.Remit_UAmount || 0,
          Remit_Fee: item.Remit_Fee || 0,
          Comp_Remit_Fee: item.Comp_Remit_Fee || 0,
          Cash_Back_Amt: item.Cash_Back_Amt || 0,
        }));
        await this.excelExportService.exportData(exportData, `費率對照維護${bnkNo}`, this.excelColumns);
      } else if (bnkNo) {
        await this.excelExportService.exportData([{ BNK_No: bnkNo }], `費率對照維護${bnkNo}`, this.excelColumns);
      } else {
        await this.excelExportService.exportTemplate(this.excelColumns, '費率對照維護');
      }
      this.messageService.successBubble('匯出成功');
    } catch (error: any) {
      console.error('匯出失敗:', error);
      this.messageService.errorBubble(`匯出失敗：${error.message}`);
    } finally {
      this.excelBtnLoading.set(false);
    }
  }
  importExcelColumn: ImportExcelColumn[] = [
    { field: 'BNK_No', header: '公司銀行科目代號', type: 'string' },
    { field: 'Remit_BAmount', header: '金額下限', type: 'number' },
    { field: 'Remit_UAmount', header: '金額上限', type: 'number' },
    { field: 'Remit_Fee', header: '廠商負擔電匯手續費', type: 'number' },
    { field: 'Comp_Remit_Fee', header: '公司負擔電匯手續費', type: 'number' },
    { field: 'Cash_Back_Amt', header: '廠商負擔電匯手續費回饋收入', type: 'number' },
  ];
  async onImportExcel(event: FileSelectEvent) {
    const file = event.files[0];
    this.excelBtnLoading.set(true);
    try {
      const importedData = await this.excelImportService.importExcel(file, this.importExcelColumn);

      // 如果匯入資料為空，直接返回
      if (!importedData || importedData.length === 0) {
        return;
      }

      // 取得所有匯入資料的 BNK_No，並檢查是否都相同
      const firstBnkNo = importedData[0].BNK_No;
      const isAllBnkNoSame = importedData.every((item: any) => item.BNK_No === firstBnkNo);

      if (!isAllBnkNoSame) {
        this.messageService.warnBubble('匯入失敗：Excel 檔案中的「公司銀行科目代號」不一致。');
        return;
      }

      // 檢查BNK_No是否為字串
      if (typeof firstBnkNo !== 'string') {
        this.messageService.warnBubble('匯入失敗：Excel 檔案中的「公司銀行科目代號」格式不正確，必須為字串。');
        return;
      }

      if (this.isFormCreateable) {
        // 處於新增模式時的驗證
        const isBnkNoValid = this.bankCodeOptions.some(item => item.No === firstBnkNo);
        if (!isBnkNoValid) {
          this.messageService.warnBubble('匯入失敗：「公司銀行科目代號」不在下拉選單中。');
          return;
        }

        // 驗證成功，更新表單和表格資料
        this.dataForm.get('BNK_No')?.setValue(firstBnkNo);
        this.data = importedData;
        this.messageService.successBubble(`成功匯入 ${importedData.length} 筆資料`);

      } else {
        // 處於編輯模式時的驗證
        const currentBnkNo = this.dataForm.get('BNK_No')?.value || '';
        if (firstBnkNo !== currentBnkNo) {
          this.messageService.warnBubble(`匯入失敗：匯入檔案的「公司銀行科目代號」(${firstBnkNo}) 與目前頁面不符 (${currentBnkNo})。`);
          return;
        }

        // 驗證成功，更新表格資料
        this.data = importedData;
        this.messageService.successBubble(`成功匯入 ${importedData.length} 筆資料`);
      }
    } catch (error: any) {
      this.messageService.warnBubble(error.message);
    } finally {
      this.excelBtnLoading.set(false);
    }
  }
}
