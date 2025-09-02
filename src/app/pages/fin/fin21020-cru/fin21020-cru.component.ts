// fin21020-cru.component.ts
import { Component, OnInit, } from '@angular/core';
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
import { validateRequired, validateNumber } from '@shared/componentkit/table-edit/validate-field.model';

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
  dataForm = this.formBuilder.nonNullable.group({
    BNK_No: [null, [Validators.required]], // 公司銀行科目代號
  });
  bankCodeOptions: IDropdownItem[] = [];
  data: IFin21020Detail[] = [];
  selectedItems: IFin21020Detail[] = [];
  columns: Column[] = [
    // 序號由前端動態處理，不需要欄位
    // 金額下限，需要必填和數字驗證
    { field: 'Remit_BAmount', header: '金額下限', type: 'inputNumber', disabled: (index) => index === 0, validate: [validateRequired, validateNumber] },
    // 金額上限，需要必填和數字驗證
    { field: 'Remit_UAmount', header: '金額上限', type: 'inputNumber', validate: [validateRequired, validateNumber] },
    { field: 'Remit_Fee', header: '廠商負擔電匯手續費', type: 'inputNumber', validate: [validateRequired, validateNumber] },
    { field: 'Comp_Remit_Fee', header: '公司負擔電匯手續費', type: 'inputNumber', validate: [validateRequired, validateNumber] },
    { field: 'Cash_Back_Amt', header: '廠商負擔電匯手續費回饋收入', type: 'inputNumber', validate: [validateRequired, validateNumber] },
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
    // 檢查金額上限是否大於下限
    if (!rowData.Remit_BAmount || !rowData.Remit_UAmount) {
      return { isValid: false, errorMessage: '金額下限和金額上限都必須填寫' };
    }
    if (rowData.Remit_UAmount <= rowData.Remit_BAmount) {
      return { isValid: false, errorMessage: '金額上限必須大於金額下限' };
    }
    // 檢查區間重疊
    const isOverlapping = this.data.some(item => {
      // 排除自身
      if (item === rowData || !item.Remit_BAmount || !item.Remit_UAmount || !rowData.Remit_BAmount || !rowData.Remit_UAmount) {
        return false;
      }
      // 檢查新區間是否與現有區間重疊
      return (
        (rowData.Remit_BAmount <= item.Remit_UAmount) ||
        (rowData.Remit_UAmount <= item.Remit_UAmount) ||
        (item.Remit_BAmount >= rowData.Remit_BAmount && item.Remit_BAmount <= rowData.Remit_UAmount)
      );
    });
    if (isOverlapping) {
      return { isValid: false, errorMessage: '新增的金額區間與現有資料重疊' };
    }
    return { isValid: true, errorMessage: '' };
  };

  // 新增一個 `onDataChange` 函式，處理表格資料變動
  onDataChange(newData: IFin21020Detail[]) {
    this.data = newData;
    // 處理金額下限自動帶入邏輯
    if (this.data.length > 1) {
      for (let i = 1; i < this.data.length; i++) {
        // 如果前一行的金額上限有值，則自動帶入下限
        const prevRow = this.data[i - 1];
        const currentRow = this.data[i];
        if (prevRow.Remit_UAmount !== null && currentRow.Remit_BAmount === null) {
          currentRow.Remit_BAmount = (prevRow.Remit_UAmount as number) + 1;
        }
      }
    } else if (this.data.length === 1) {
      // 處理第一行的金額下限固定為 0
      this.data[0].Remit_BAmount = 0;
    }
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
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
