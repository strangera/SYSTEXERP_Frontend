import { Component, OnInit } from '@angular/core';
import { Validators, FormsModule, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { PanelModule } from 'primeng/panel';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { DropDownListService, IDropdownItem } from '../../../service/utility/dropDownList.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { NgClass, NgFor, CommonModule } from '@angular/common';
import { SelectButtonModule } from 'primeng/selectbutton';
import { DropdownModule } from 'primeng/dropdown';
import { TabViewModule } from 'primeng/tabview';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ColorPickerModule } from 'primeng/colorpicker';
import { Tls42010Service } from '../../../service/api/tls/tls42010.service';


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
  imports: [
    MenubarComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonComponent,
    TranslateModule,
    InputTextareaComponent,
    DropdownComponent,
    InputTextComponent,
    NgFor,
    NgClass,
    CommonModule,
    SelectButtonModule,
    DropdownModule,
    TabViewModule,
    ButtonModule,
    DialogModule,
    ColorPickerModule,
    InputNumberComponent
  ]
})
export class TLS42010CRUComponent
  extends BasicCruPageComponent<any>
  implements OnInit {

  dataForm = this.formBuilder.nonNullable.group({
    USR_Level: ['', Validators.maxLength(6)],
    TSB_Name: [''],
    ECR_KBType: [''],
    ECR_KBDesc: [''],

    func: [''],
    KG_button: [''],
    KG_KeyPage: [''],

    KB_Switch: [''],
    KB_Display1: ['', Validators.maxLength(5)],
    KB_Display2: ['', Validators.maxLength(5)],
    KB_Color: [''],
    color: [null as { r: number; g: number; b: number } | null],
    FontColor: [null as { r: number; g: number; b: number } | null],
    KB_Style: [''],

    KB_Font: [''],
    KB_Size: [''],
    KB_FontColor: [''],

    KB_Arg1: [''],
    KB_Arg2: [''],
    KB_Arg3: [''],
    activePage: [0]
  });

  xCount = 8;
  yCount = 5;
  keys: KeyItem[] = [];
  selected?: KeyItem;

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
  KB_ColorOptions: IDropdownItem[] = [];
  KB_StyleOptions: IDropdownItem[] = [];

  KB_FontColorOptions: IDropdownItem[] = [];

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

  KB_SizeOptions = [
    { label: '粗體', value: 'YNN' },
    { label: '斜體', value: 'NYN' },
    { label: '底線', value: 'NNY' },
  ];
  KB_FontOptions = [
    { label: '微軟正黑體', value: 'Microsoft JhengHei' },
    { label: '標楷體', value: 'DFKai-SB' },
    { label: '新細明體', value: 'PMingLiU' },
    { label: '毛毛粗體', value: 'PMingmeow' },
    { label: '貓貓本體', value: 'meoww' },

  ];
  selectedTab: 'func' | 'button' | 'font' | 'other' = 'func';

  // Pickr
  showColorPicker = false;
  tempColor = 'rgba(213, 31, 14, 1)';
  pickr: any;

  constructor(
    private dropDownListService: DropDownListService,
    private tls42010Service: Tls42010Service
  ) {
    super();
  }

  // ---------------- Grid ----------------
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
    // 載入收銀畫面名稱下拉
    this.dropDownListService.queryPOS1008DropDownList().subscribe({
      next: (res) => {
        this.TSB_NameOptions = res?.Data?.map(item => ({
          No: item.TSB_Name,   // 下拉的值
          Name: item.TSB_Name  // 下拉顯示文字
        })) ?? [];
        console.log('TSB_NameOptions:', this.TSB_NameOptions);
      },
    });
    this.dropDownListService.querySYS1000_DropDownList({ SYS_Type: 'ECR_KBType' }).subscribe({
      next: (res) => {
        this.ECR_KBTypeOptions = res?.Data ?? [];

        // 預設值 = TCHBTN
        this.dataForm.controls.ECR_KBType.setValue('TCHBTN');
      },
      error: (err) => {
        console.error('載入鍵盤型態下拉失敗:', err);
      }
    });





    this.dataForm.valueChanges.subscribe(val => {
      if (this.selected) {
        this.selected = { ...this.selected, ...val };
      }
    });

    this.dataForm.controls.activePage.valueChanges.subscribe(p => {
      const vk = this.visibleKeys;
      if (vk.length && !vk.includes(this.selected!)) {
        this.selected = vk[0];
      }
    });
    //按鍵顏色
    this.dataForm.controls.color.valueChanges.subscribe(value => {
      // {"r": 176,"g": 60, "b": 60}
      // 變成[RGB:xxx,xxx,xxx]
      if (!value) { return; }
      this.dataForm.controls.KB_Color.setValue(`RGB:${value.r},${value.g},${value.b}`);
    });
    //字型顏色
    this.dataForm.controls.FontColor.valueChanges.subscribe(value => {
      // {"r": 176,"g": 60, "b": 60}
      // 變成[RGB:xxx,xxx,xxx]
      if (!value) { return; }
      this.dataForm.controls.KB_FontColor.setValue(`RGB:${value.r},${value.g},${value.b}`);
    });
  }

  // ---------------- Grid ----------------
  private buildGrid() {
    const onePage: KeyItem[] = [];
    for (let y = 1; y <= this.yCount; y++) {
      for (let x = 1; x <= this.xCount; x++) {
        const code = `${x.toString().padStart(2, '0')}${y.toString().padStart(2, '0')}`;
        onePage.push({ code, x, y, label: code, type: 'normal' });
      }
    }
    this.keys = [...onePage];
    const page2 = onePage.map(k => {
      const newCode = `${k.code}`;
      return { ...k, code: newCode, label: newCode };
    });
    this.keys.push(...page2);
    this.selected = this.keys[0];
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.loading = true;

      const payload = {
        USR_Level: frm.value.USR_Level,
        TSB_Name: frm.value.TSB_Name,
        ECR_KBType: frm.value.ECR_KBType,
        ECR_KBDesc: frm.value.ECR_KBDesc,
        KB_Switch: frm.value.KB_Switch,
        KB_Display1: frm.value.KB_Display1,
        KB_Display2: frm.value.KB_Display2,
        KB_Color: frm.value.KB_Color,
        KB_Style: frm.value.KB_Style,
        KB_Font: frm.value.KB_Font,
        KB_Size: frm.value.KB_Size,
        KB_FontColor: frm.value.KB_FontColor,
        KB_Arg1: frm.value.KB_Arg1,
        KB_Arg2: frm.value.KB_Arg2,
        KB_Arg3: frm.value.KB_Arg3,
        Keys: this.keys  // 按鍵配置表也送出去
      };

      this.tls42010Service.insertTLS42010M(payload).subscribe({
        next: (res) => {
          this.loading = false;
          console.log('新增成功:', res);
        },
        error: (err) => {
          this.loading = false;
          console.error('新增失敗:', err);
        }
      });
    });
  }


  onTabChange(e: any) {
    this.dataForm.controls.activePage.setValue(e.index);
  }

  selectKey(k: KeyItem): void {
    this.selected = k;
    console.log('選中按鍵:', k);
  }
}
