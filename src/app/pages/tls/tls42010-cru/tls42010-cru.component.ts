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
import { TabViewModule } from 'primeng/tabview';
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
  imports: [MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, InputTextComponent, ButtonComponent, TranslateModule, InputTextareaComponent, DropdownComponent, NgFor, NgClass, CommonModule, SelectButtonModule, DropdownModule, TabViewModule]
})

export class TLS42010CRUComponent extends BasicCruPageComponent<any> implements OnInit {

  dataForm = this.formBuilder.nonNullable.group({
    USR_Level: ['', Validators.maxLength(6)],
    TSB_Name: [''],
    ECR_KBType: [''],
    ECR_KBDesc: [''],

    // 功能分頁
    func: [''],
    KG_button: [''],
    KG_KeyPage: [''],
    // 按鈕分頁
    KB_Switch: [''],
    KB_Display1: ['', Validators.maxLength(6)],
    KB_Display2: ['', Validators.maxLength(6)],
    KB_Color: [''],
    KB_Style: [''],
    // 字型分頁
    KB_Font: [''],
    KB_Size: [''],
    KB_FontColor: [''],
    //其他分頁
    KB_Arg1: [''],
    KB_Arg2: [''],
    KB_Arg3: [''],
    activePage: [0]

  });


  xCount = 8;                 // 先給預設，之後可從 API 帶 TSB_XCount
  yCount = 5;                 // 先給預設，之後可從 API 帶 TSB_YCount
  keys: KeyItem[] = [];       // 左側鍵盤清單
  selected?: KeyItem;         // 目前選中的按鍵

  tabOptions = [
    { label: '功能', value: 'func' },
    { label: '按鈕', value: 'button' },
    { label: '字型', value: 'font' },
    { label: '其他', value: 'other' },
  ];

  TSB_NameOptions: IDropdownItem[] = [];
  ECR_KBTypeOptions: IDropdownItem[] = [];
  KG_buttonOptions: IDropdownItem[] = [];
  KG_KeyPageOptions: IDropdownItem[] = [];
  KB_ColorOptions: IDropdownItem[] = [];//按鍵顏色
  KB_StyleOptions: IDropdownItem[] = [];//按鍵形狀
  KB_FontOptions: IDropdownItem[] = [];//顯示字型
  KB_FontColorOptions: IDropdownItem[] = [];//字型顏色
  //功能代碼/名稱
  KB_FuncOptions = [
    { label: '— 請選擇 —', value: '' },
    { label: '結帳 PAY', value: 'PAY' },
    { label: '折扣 DISC', value: 'DISC' },
    { label: '作廢 VOID', value: 'VOID' },
  ];
  //按鈕分頁是否啟用
  KB_SwitchOptions = [
    { label: '啟用', value: 'Y' },
    { label: '不啟用', value: 'N' },
  ];
  //顯示字型大小
  KB_SizeOptions = [
    { label: '粗體', value: 'YNN' },
    { label: '斜體', value: 'NYN' },
    { label: '底線', value: 'NNY' },
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
  // 2) 一頁容量 / 總頁數 / 本頁資料
  get pageCapacity() { return this.xCount * this.yCount; }
  get totalPages() { return Math.max(1, Math.ceil(this.keys.length / this.pageCapacity)); }
  get pageList() { return Array.from({ length: this.totalPages }, (_, i) => i); }
  get visibleKeys() {
    const p = this.dataForm.controls.activePage.value;
    const start = p * this.pageCapacity;
    return this.keys.slice(start, start + this.pageCapacity);
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
    // 監聽頁碼改變
    this.dataForm.controls.activePage.valueChanges.subscribe(p => {
      const vk = this.visibleKeys;
      if (vk.length && !vk.includes(this.selected!)) {
        this.selected = vk[0];
      }
    });
  }
  // 測試分頁用
  private buildGrid() {
    const onePage: KeyItem[] = [];
    for (let y = 1; y <= this.yCount; y++) {
      for (let x = 1; x <= this.xCount; x++) {
        const code = `${x.toString().padStart(2, '0')}${y.toString().padStart(2, '0')}`;
        onePage.push({ code, x, y, label: code, type: 'normal' });
      }
    }

    // 先放第 1 頁
    this.keys = [...onePage];

    // 再塞第 2 頁（複製一份並讓 code 不重複）
    const page2 = onePage.map(k => {
      const newCode = `${k.code}`;
      return { ...k, code: newCode, label: newCode }; // label 跟 code 同步
    });
    this.keys.push(...page2);

    // 預設選第一顆
    this.selected = this.keys[0];
  }


  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.loading = true;
    });
  }
  // 切頁事件（TabView 的 onChange 只需要把 index 寫回 form）
  onTabChange(e: any) {
    this.dataForm.controls.activePage.setValue(e.index);
  }
}
