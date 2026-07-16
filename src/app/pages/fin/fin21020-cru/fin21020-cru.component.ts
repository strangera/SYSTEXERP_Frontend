import { NgIf } from '@angular/common';
import { Component, OnInit, signal, ViewChild, } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Fin21020Service, IFin21020Data, IFin21020Detail } from '@service/api/fin/fin21020.service';
import { Option } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { TableEditComponent } from '@shared/components/table-edit/table-edit.component';
import { EditColumn } from '@shared/components/table-edit/table-edit.model';
import { validateRequired } from '@shared/components/table-edit/validate-field.model';
import { ErrorReportService } from '@shared/service/error-report.service';
import { ExcelColumn, ExcelExportService } from '@shared/service/excel-export.service';
import { ExcelImportService, ImportExcelColumn } from '@shared/service/excel-import.service';
import { FileSelectEvent } from 'primeng/fileupload';
import { PanelModule } from 'primeng/panel';
import { finalize, map } from 'rxjs';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
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
  aps1002Options = signal<Option[]>([]);
  data: IFin21020Detail[] = [];
  selectedItems: IFin21020Detail[] = [];
  columns: EditColumn[] = [
    { field: 'Remit_BAmount', header: '金額下限', type: 'inputNumber', maxLength: 10, min: 0, validate: [validateRequired] },
    { field: 'Remit_UAmount', header: '金額上限', type: 'inputNumber', maxLength: 10, min: 0, validate: [validateRequired] },
    { field: 'Remit_Fee', header: '廠商負擔電匯手續費', type: 'inputNumber', maxLength: 6, min: 0, validate: [validateRequired], onBlur: (rowData) => { this.autoFillCashBackAmt(rowData); } },
    { field: 'Cash_Back_Amt', header: '廠商負擔電匯手續費回饋收入', type: 'inputNumber', maxLength: 6, min: 0 },
    { field: 'Comp_Remit_Fee', header: '公司負擔電匯手續費', type: 'inputNumber', maxLength: 6, min: 0, validate: [validateRequired] },
  ];
  excelBtnLoading = signal(false);
  constructor(
    private readonly fin21020Service: Fin21020Service, // 注入服務
    private readonly excelExportService: ExcelExportService,
    private readonly excelImportService: ExcelImportService,
    private readonly errorReportService: ErrorReportService,
    private readonly dropdownApiService: DropdownApiService
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('FIN21020', this.dataForm);
    this.dropdownApiService.queryAps1002().pipe(
      map(options => options?.filter(opt => opt['ACCCNAME'] !== null && opt['ACCCNAME'] !== undefined) ?? []),
      untilDestroyed(this)
    ).subscribe(options => {
      this.aps1002Options.set(options);
    });
    if (!this.isFormCreateable) {
      this.dataForm.get('BNK_No')?.disable();
      this.loading = true;
      const bnkNo = this.dataForm.value.BNK_No || '';
      this.fin21020Service.queryByBnkNo(bnkNo).pipe(
        untilDestroyed(this),
        finalize(() => this.loading = false)
      ).subscribe(res => {
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

  // 2. 建立一個 Getter 來動態計算下一筆的預設值
  get currentDefaultInsertData() {
    // 過濾掉還在編輯中的 candidate row，只看已確認的資料
    const actualData = this.data.filter(item => !item['_isAutoInsertCandidate']);

    if (actualData.length > 0) {
      const lastRow = actualData[actualData.length - 1];
      // 如果最後一筆有填上限，預設值就是 上限 + 1
      if (typeof lastRow.Remit_UAmount === 'number') {
        return {
          Remit_BAmount: lastRow.Remit_UAmount + 1,
          Remit_UAmount: null,
          Remit_Fee: null,
          Cash_Back_Amt: null,
          Comp_Remit_Fee: null
        };
      }
    }

    // 如果完全沒資料，第一筆預設下限為 0
    return {
      Remit_BAmount: 0,
      Remit_UAmount: null,
      Remit_Fee: null,
      Cash_Back_Amt: null,
      Comp_Remit_Fee: null
    };
  }

  // 依照Remit_Fee自動帶入Cash_Back_Amt
  autoFillCashBackAmt(rowData: IFin21020Detail) {
    if (!rowData.Cash_Back_Amt || !rowData.Remit_Fee) {
      return;
    }
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
      const api = this.isFormCreateable ? this.fin21020Service.insertFIN21020(body) : this.fin21020Service.updateFIN21020(body);
      api.pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
        this.messageService.successBubble(res.Message);
        if (this.isFormCreateable) {
          this.dataForm.reset();
          this.data = [];
        } else {
          this.onCancel();
        }
      })
    });
  }
  // 最後一筆才可以刪除
  isRowSelectable(row: IFin21020Detail, index: number, data: IFin21020Detail[]): boolean {
    if (data.filter(item => !item['_isAutoInsertCandidate']).length === 0) {
      return false;
    }
    const lastValidIndex = data.findLastIndex(item => !item['_isAutoInsertCandidate']);
    const isSelectable = !row['_isAutoInsertCandidate'] && index === lastValidIndex;

    return isSelectable;
  }
  excelColumns: ExcelColumn[] = [
    { field: 'BNK_No', header: '公司銀行科目代號', width: 20 },
    { field: 'Remit_BAmount', header: '金額下限', width: 15 },
    { field: 'Remit_UAmount', header: '金額上限', width: 15 },
    { field: 'Remit_Fee', header: '廠商負擔電匯手續費', width: 25 },
    { field: 'Cash_Back_Amt', header: '廠商負擔電匯手續費回饋收入', width: 35 },
    { field: 'Comp_Remit_Fee', header: '公司負擔電匯手續費', width: 25 },
  ];
  async onExportExcel() {
    this.excelBtnLoading.set(true);
    try {
      const bnkNo = this.dataForm.get('BNK_No')?.value;
      const filteredData = this.data.filter(item => !item['_isAutoInsertCandidate']);

      if (bnkNo && filteredData.length > 0) {
        const exportData = filteredData.map(item => ({
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
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('匯出失敗:', error);
        this.messageService.errorBubble(`匯出失敗：${error.message}`);
      } else {
        console.error('匯出失敗:', error);
        this.messageService.errorBubble('匯出失敗：未知錯誤');
      }
    } finally {
      this.excelBtnLoading.set(false);
    }
  }
  importExcelColumn: ImportExcelColumn[] = [
    { field: 'BNK_No', header: '公司銀行科目代號', type: 'string' },
    { field: 'Remit_BAmount', header: '金額下限', type: 'number' },
    { field: 'Remit_UAmount', header: '金額上限', type: 'number' },
    { field: 'Remit_Fee', header: '廠商負擔電匯手續費', type: 'number' },
    { field: 'Cash_Back_Amt', header: '廠商負擔電匯手續費回饋收入', type: 'number' },
    { field: 'Comp_Remit_Fee', header: '公司負擔電匯手續費', type: 'number' },
  ];
  async onImportExcel(event: FileSelectEvent) {
    const file = event.files[0];
    this.excelBtnLoading.set(true);
    let errorUrl: string | null = null;

    try {
      // 1. 建立一個暫存陣列，用來模擬匯入後的資料狀態，以便檢查區間連續性
      // 如果你希望「匯入」是完全取代現有畫面資料，這裡就用空陣列開始
      const tempImportData: IFin21020Detail[] = [];

      const customValidator = (rowData: IFin21020Detail): string => {
        let err = '';
        // --- A. 銀行科目檢核 ---
        if (rowData.BNK_No) {
          const exists = this.aps1002Options().some(opt => String(opt.value) === String(rowData.BNK_No));
          if (!exists) err += `[公司銀行科目代號] ${rowData.BNK_No} 不存在; `;
        } else {
          err += `[公司銀行科目代號] 必填; `;
        }

        // --- B. 單欄位必填 ---
        if (rowData.Remit_BAmount == null) err += `[金額下限] 必填; `;
        if (rowData.Remit_UAmount == null) err += `[金額上限] 必填; `;
        if (rowData.Remit_Fee == null) err += `[廠商負擔電匯手續費] 必填; `;
        if (rowData.Comp_Remit_Fee == null) err += `[公司負擔電匯手續費] 必填; `;

        // --- C. 區間與連續性檢查 (關鍵！) ---
        // 為了讓 validateEntireRow 能在匯入時檢查「Excel 內部的連續性」
        // 我們暫時把 rowData 加入 tempImportData，並讓 validate 針對這個暫存檔跑
        tempImportData.push(rowData);

        // 這裡我們需要暫時修改 validateEntireRow 指向的對象，或是直接在這裡寫邏輯
        // 為了不改動原有 function，我們透過變換 this.data 達成
        const originalData = this.data;
        this.data = tempImportData;

        const rowResult = this.validateEntireRow(rowData);

        this.data = originalData; // 檢查完立刻還原，避免污染畫面

        if (!rowResult.isValid) {
          err += `${rowResult.errorMessage}; `;
        }

        return err;
      };

      const result = await this.excelImportService.importExcel(
        file, this.importExcelColumn, customValidator
      );

      // --- 核心修正點：只要有錯誤，絕對不准更新畫面 ---
      if (result.hasErrors && result.errorBlob) {
        errorUrl = globalThis.URL.createObjectURL(result.errorBlob);
        this.errorReportService.showImportError(errorUrl, '匯入失敗：Excel 資料含有邏輯錯誤，請下載報告修正全部紅字後重新匯入。');
        // 這裡直接中斷，不執行下方的 this.data = result.data
        this.excelBtnLoading.set(false);
        return;
      }

      if (!result.data || result.data.length === 0) {
        this.messageService.warnBubble('Excel 內無有效資料。');
        return;
      }

      // --- D. 批次一致性檢查 ---
      const firstBnkNo = result.data[0]?.BNK_No;
      const isAllBnkNoSame = result.data.every(item => item.BNK_No === firstBnkNo);
      if (!isAllBnkNoSame) {
        this.messageService.warnBubble('匯入失敗：Excel 檔案中的「公司銀行科目代號」不一致。');
        return;
      }

      // 全部檢查都通過了，才一次性更新畫面
      this.data = result.data;
      this.dataForm.get('BNK_No')?.setValue(firstBnkNo);
      this.messageService.successBubble(`成功匯入 ${result.data.length} 筆資料`);

    } catch (error: unknown) {
      console.error('匯入系統異常:', error);
      this.messageService.errorBubble('匯入失敗：發生系統預料之外的錯誤');
    } finally {
      this.excelBtnLoading.set(false);
    }
  }
}
