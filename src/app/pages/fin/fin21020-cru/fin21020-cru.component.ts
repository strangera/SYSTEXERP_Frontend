// fin21020-cru.component.ts
import { Component, OnInit, ViewChild, } from '@angular/core';
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
import { Column } from '@shared/componentkit/table-edit/table-edit.model';
import { IFin21020Data, IFin21020Detail, Fin21020Service } from '@service/api/fin/fin21020.service';
import { finalize } from 'rxjs';
// 引入驗證函式
import { validateRequired } from '@shared/componentkit/table-edit/validate-field.model';

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
    BNK_No: [null, [Validators.required]], // 公司銀行科目代號
  });
  bankCodeOptions: IDropdownItem[] = [];
  data: IFin21020Detail[] = [];
  selectedItems: IFin21020Detail[] = [];
  columns: Column[] = [
    { field: 'Remit_BAmount', header: '金額下限', type: 'inputNumber', width: '9rem', maxLength: 10, min: 0, validate: [validateRequired], onFocus: (rowData, value, col, index) => { this.autoFillNextRow(rowData, value, col, index); } },
    { field: 'Remit_UAmount', header: '金額上限', type: 'inputNumber', width: '9rem', maxLength: 10, min: 0, validate: [validateRequired] },
    { field: 'Remit_Fee', header: '廠商負擔電匯手續費', type: 'inputNumber', width: '12rem', maxLength: 6, min: 0, validate: [validateRequired], onBlur: (rowData, value, col, index) => { this.autoFillCashBackAmt(rowData, value, col, index); } },
    { field: 'Comp_Remit_Fee', header: '公司負擔電匯手續費', type: 'inputNumber', width: '12rem', maxLength: 6, min: 0, validate: [validateRequired] },
    { field: 'Cash_Back_Amt', header: '廠商負擔電匯手續費回饋收入', type: 'inputNumber', width: '12rem', maxLength: 6, min: 0 },
  ];
  constructor(
    private readonly dropDownListService: DropDownListService,
    private readonly fin21020Service: Fin21020Service, // 注入服務
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('FIN21020', this.dataForm);
    this.dropDownListService.queryGLS1005_DropDownList().pipe(untilDestroyed(this)).subscribe(data => {
      this.bankCodeOptions = data.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}` }));
    });
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
  autoFillNextRow(rowData: IFin21020Detail, value: number, col: Column, index: number) {
    const rowIndex = this.data.indexOf(rowData);
    if (rowIndex > 0) {
      const prevRow = this.data[rowIndex - 1];
      rowData.Remit_BAmount = prevRow.Remit_UAmount ? prevRow.Remit_UAmount + 1 : undefined;
    } else {
      rowData.Remit_BAmount = 0;
    }
  }

  // 依照Remit_Fee自動帶入Cash_Back_Amt
  autoFillCashBackAmt(rowData: IFin21020Detail, value: number, col: Column, index: number) {
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
        BNK_No: this.dataForm.get('BNK_No')?.value,
        Details: this.data.map(item => ({
          Remit_BAmount: item.Remit_BAmount,
          Remit_UAmount: item.Remit_UAmount,
          Remit_Fee: item.Remit_Fee,
          Comp_Remit_Fee: item.Comp_Remit_Fee,
          Cash_Back_Amt: item.Cash_Back_Amt,
        })),
      };
      this.loading = false;
      console.log(body);

      // this.fin21020Service.insertFin21020(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
      //   this.messageService.successBubble(res.Message || '新增成功');
      // });
    });
  }
}
