import { Component, OnInit, } from '@angular/core';
import { Validators, FormsModule, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { DropDownListService, IDropdownItem } from '../../../service/utility/dropDownList.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { NgClass, NgFor } from '@angular/common';
import { CommonModule } from '@angular/common';
import { SelectButtonModule } from 'primeng/selectbutton';
import { DropdownModule } from 'primeng/dropdown';
export interface KeyItem {
  code: string;
  x: number;
  y: number;
  label?: string;
  func?: string;
  KB_Switch?: string | boolean;
  KB_Display1?: string;
  KB_Display2?: string;
  KB_Color?: string;
  KB_Style?: string;
  type?: string;
}

@Component({
  selector: 'app-tls42010-cru',
  templateUrl: './tls42010-cru.component.html',
  styleUrls: ['./tls42010-cru.component.scss'],
  standalone: true,
  imports: [MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, InputTextComponent, ButtonComponent, TranslateModule, InputTextareaComponent, DropdownComponent, NgFor, NgClass, CommonModule, SelectButtonModule, DropdownModule]
})

export class TLS42010CRUComponent extends BasicCruPageComponent<any> implements OnInit {

  dataForm = this.formBuilder.nonNullable.group({
    USR_Level: ['', Validators.maxLength(6)],
    TSB_Name: [''],
    ECR_KBType: [''],
    ECR_KBDesc: [''],

    // 功能分頁
    func: [''],

    // 按鈕分頁
    KB_Switch: [''],
    KB_Display1: ['', Validators.maxLength(6)],
    KB_Display2:  ['', Validators.maxLength(6)],
    KB_Color: [''],
    KB_Style: ['']
  });


  xCount = 8;                 // 先給預設，之後可從 API 帶 TSB_XCount
  yCount = 5;                 // 先給預設，之後可從 API 帶 TSB_YCount
  keys: KeyItem[] = [];       // 左側鍵盤清單
  selected?: KeyItem;         // 目前選中的按鍵

  TSB_NameOptions: IDropdownItem[] = [];
  ECR_KBTypeOptions: IDropdownItem[] = [];
  KG_buttonOptions: IDropdownItem[] = [];
  KG_KeyPageOptions: IDropdownItem[] = [];
  KB_ColorOptions: IDropdownItem[] = [];
  KB_StyleOptions: IDropdownItem[] = [];
  KB_FuncOptions = [
    { label: '— 請選擇 —', value: '' },
    { label: '結帳 PAY', value: 'PAY' },
    { label: '折扣 DISC', value: 'DISC' },
    { label: '作廢 VOID', value: 'VOID' },
  ];
  KB_SwitchOptions = [
    { label: '啟用', value: 'Y' },
    { label: '不啟用', value: 'N' },
  ];
  tabOptions = [
    { label: '功能', value: 'func' },
    { label: '按鈕', value: 'button' },
    { label: '字型', value: 'font' },
    { label: '其他', value: 'other' },
  ];
  selectedTab: 'func' | 'button' | 'font' | 'other' = 'func';  // ← 預設顯示「功能」
  selectKey(k: KeyItem): void {
    this.selected = k;
    console.log('選中按鍵:', k);
  }


  constructor(
    private dropDownListService: DropDownListService

  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS42010', this.dataForm);
    this.buildGrid();

    // 監聽表單值改變
    this.dataForm.valueChanges.subscribe(val => {
      if (this.selected) {
        this.selected = { ...this.selected, ...val };
      }
    });
  }
  private buildGrid() {
    const arr: KeyItem[] = [];
    for (let y = 1; y <= this.yCount; y++) {
      for (let x = 1; x <= this.xCount; x++) {
        const code = `${x.toString().padStart(2, '0')}${y.toString().padStart(2, '0')}`;
        arr.push({ code, x, y, label: code, type: 'normal' });
      }
    }
    this.keys = arr;                 // ←← 關鍵：指派回 keys
    this.selected = this.keys[0];    // 可選：預設選第一顆
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.loading = true;
    });
  }
}
