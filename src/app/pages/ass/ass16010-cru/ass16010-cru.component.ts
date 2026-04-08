import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ASS16010Data } from '@service/api/ass/ass16010.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { PanelModule } from 'primeng/panel';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';

@Component({
  selector: 'app-ass16010-cru',
  templateUrl: './ass16010-cru.component.html',
  styleUrl: './ass16010-cru.component.scss',
  standalone: true,
  imports: [MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, DropdownComponent, RadiobuttonComponent, ButtonComponent, NgIf, TranslateModule]
})
export class ASS16010CRUComponent extends BasicCruPageComponent<ASS16010Data> implements OnInit {

  ngOnInit(): void {
    // 初始化
    this.initializePage('ASS16010', this.dataForm);
  }

  // 下拉選單--------------------------------------------------------
  // ----------------------------------------------------------------
  // const state = this.router.lastSuccessfulNavigation?.extras.state as {
  //   crudstatus: CRUDStatus;
  //   rowdata: any;
  // };

  // switch (state.crudstatus) {
  //   // 創建
  //   case CRUDStatus.Create:
  //     this.formTitle = 'create-conditions';
  //     this.accordionTabCss = 'create-accordionTab';
  //     this.crudstatus = CRUDStatus.Create;

  //     break;
  //   // 修改
  //   case CRUDStatus.Edit:
  //     this.formTitle = 'edit-conditions';
  //     this.accordionTabCss = 'edit-accordionTab';
  //     this.crudstatus = CRUDStatus.Edit;

  //     this.Edit(state.rowdata);
  //     break;
  //   // 讀檔
  //   case CRUDStatus.Read:
  //     this.formTitle = 'display-conditions';
  //     this.crudstatus = CRUDStatus.Read;
  //     this.Read(state.rowdata);
  //     break;
  // }

  // console.log(this.accordionTabCss);

  //動態新增----------------------------------------------------------
  createItem(): FormGroup {
    return this.formBuilder.group({
      Accountcode: [],
    });
  }

  //非動態新增 ----------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    whCategory: [],
    invType: [],
    categoryOptions: [],
    // ----------------------------------------------------------------
    items: this.formBuilder.array([this.createItem()]),
  });

  // Dropdown options
  whCategory = [
    { value: 1, label: '總公司' },
    { value: 2, label: '測試' },
  ];
  invType = [
    { value: 1, label: '全盤(不分類)' },
    { value: 2, label: '部份盤(以中分類)' },
  ];
  categoryOptions = [
    { value: 1, label: '裝潢工程' },
    { value: 2, label: '其他工程' },
    { value: 3, label: '電腦及電子零件產品' },
    { value: 4, label: '電力及照明系統' },
    { value: 5, label: '家電家俱設備' },
    { value: 6, label: '機消空電水零配件' },
    { value: 7, label: '辦公及營運庶務' },
    { value: 8, label: '印刷品(非廣告行銷)' },
    { value: 9, label: '印刷品(廣告行銷)' },
    { value: 10, label: '衛生及醫療庶務用品' },
    { value: 11, label: '營運機電設備' },
    { value: 12, label: '資訊軟體及系統' },
    { value: 13, label: '運輸及物流設備' },
    { value: 14, label: '其他財物用品' },
    { value: 15, label: '環境衛生及安全維護' },
  ];

  // ----------------------------------------------------------------
  constructor(
    private translate: TranslateService,

  ) {
    super(); // 呼叫父類建構子
  }

  // ----------------------------------------------------------------
  get items(): FormArray {
    return this.dataForm.get('items') as FormArray;
  }

  getFormControl(index: number, controlName: string): FormControl {
    return this.items.at(index).get(controlName) as FormControl;
  }
  // ----------------------------------------------------------------

  onRemoveItem(index: number) {
    this.items.removeAt(index);
  }
  // ----------------------------------------------------------------

  Edit(rowdata: any) {
    this.dataForm.patchValue(rowdata);
  }

  Read(rowdata: any) {
    this.dataForm.patchValue(rowdata);
    this.dataForm.disable();
  }

  onAddItem(): void {
    this.items.push(this.createItem());
  }


  onSubmit(frm: FormGroup) {
    this.messageService.blockUi();

    if (this.dataForm.invalid) {
      this.messageService.errorBubble(
        this.translate.instant('form_error_message')
      );
      this.messageService.unblockUi();
      return;
    }

    this.messageService.unblockUi();
  }

}

