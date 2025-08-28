import { Component, OnInit } from '@angular/core';
import { Validators, FormsModule, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { PanelModule } from 'primeng/panel';
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
    ColorPickerModule
  ]
})
export class TLS42010CRUComponent
  extends BasicCruPageComponent<any>
  implements OnInit {

  dataForm = this.formBuilder.nonNullable.group({
    USR_Level: ['', Validators.maxLength(6)],
    TSB_Name: [''],
    ECR_KBType: ['TCHBTN'],  // 預設值
    ECR_KBDesc: ['', Validators.required],

    func: [''],
    KG_button: [''],
    KG_KeyPage: [''],

    KB_Switch: [''],
    KB_Display1: ['', Validators.maxLength(5)],
    KB_Display2: ['', Validators.maxLength(5)],
    KB_Color: [''],
    color: [null as { r: number; g: number; b: number } | null],
    FontColor: [null as { r: number; g: number; b: number } | null],
    KB_Style: [''],  // 粗體/斜體/底線放這裡

    KB_Font: [''],
    KB_Size: [14],   // 預設字體大小
    KB_FontColor: [''],

    KB_Arg1: [''],
    KB_Arg2: [''],
    KB_Arg3: [''],
    activePage: [0]
  });

  // ---------------- Grid ----------------
  xCount = 8;
  yCount = 5;
  keys: KeyItem[] = [];
  selected?: KeyItem;
  KG_KeyPageOptions: { label: string; code: string }[] = [];
  KG_buttonOptions: { label: string; code: string }[] = [];

  // ---------------- Tab Options ----------------
  tabOptions = [
    { label: '功能', value: 'func' },
    { label: '按鈕', value: 'button' },
    { label: '字型', value: 'font' },
    { label: '其他', value: 'other' },
  ];
  selectedTab: 'func' | 'button' | 'font' | 'other' = 'func';

  // ---------------- Dropdown Data ----------------
  TSB_NameOptions: IDropdownItem[] = [];
  ECR_KBTypeOptions: IDropdownItem[] = [];

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
    { label: '小 (12)', value: 12 },
    { label: '中 (14)', value: 14 },
    { label: '大 (16)', value: 16 }
  ];
  KB_StyleOptions = [
    { label: '粗體', value: 'BOLD' },
    { label: '斜體', value: 'ITALIC' },
    { label: '底線', value: 'UNDERLINE' }
  ];
  KB_FontOptions = [
    { label: '微軟正黑體', value: 'Microsoft JhengHei' },
    { label: '標楷體', value: 'DFKai-SB' },
    { label: '新細明體', value: 'PMingLiU' },
  ];

  constructor(
    private dropDownListService: DropDownListService,
    private tls42010Service: Tls42010Service
  ) {
    super();
  }

  // ---------------- Computed ----------------
  get pageCapacity() { return this.xCount * this.yCount; }
  get totalPages() { return Math.max(1, Math.ceil(this.keys.length / this.pageCapacity)); }
  get pageList() { return Array.from({ length: this.totalPages }, (_, i) => i); }
  get visibleKeys() {
    const p = this.dataForm.controls.activePage.value;
    const start = p * this.pageCapacity;
    return this.keys.slice(start, start + this.pageCapacity);
  }

  // ---------------- Lifecycle ----------------
  ngOnInit(): void {
    this.initializePage('TLS42010', this.dataForm);
    this.buildGrid();

    // 收銀畫面名稱下拉
    this.dropDownListService.queryPOS1008DropDownList().subscribe({
      next: (res) => {
        this.TSB_NameOptions = res?.Data?.map(item => ({
          No: item.TSB_Name,
          Name: item.TSB_Name
        })) ?? [];
      }
    });

    // 鍵盤型態下拉
    this.dropDownListService.querySYS1000_DropDownList({ SYS_Type: 'ECR_KBType' }).subscribe({
      next: (res) => {
        this.ECR_KBTypeOptions = res?.Data ?? [];
        if (!this.dataForm.controls.ECR_KBType.value) {
          this.dataForm.controls.ECR_KBType.setValue('TCHBTN');
        }
      }
    });

    // 顏色監聽
    this.dataForm.controls.color.valueChanges.subscribe(value => {
      if (value) this.dataForm.controls.KB_Color.setValue(`RGB:${value.r},${value.g},${value.b}`);
    });
    this.dataForm.controls.FontColor.valueChanges.subscribe(value => {
      if (value) this.dataForm.controls.KB_FontColor.setValue(`RGB:${value.r},${value.g},${value.b}`);
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
    this.selected = this.keys[0];

    // 頁數下拉
    this.KG_KeyPageOptions = Array.from({ length: this.totalPages }, (_, i) => ({
      label: `第${i + 1}頁`,
      code: (i + 1).toString()
    }));

    // 初始化按鈕下拉
    this.updateButtonOptions({ value: '1' });
  }

  // ---------------- Tab Event ----------------
  onTabChange(e: any) {
    this.dataForm.controls.activePage.setValue(e.index);
  }

  // ---------------- 按鈕下拉 ----------------
  updateButtonOptions(event: any) {
    const pageValue = event?.value ?? '1';
    const pageIndex = Number(pageValue) - 1;
    const start = pageIndex * this.pageCapacity;
    const currentPageKeys = this.keys.slice(start, start + this.pageCapacity);

    this.KG_buttonOptions = currentPageKeys.map((k) => ({
      label: k.code,
      code: k.code
    }));
  }

  // ---------------- Submit ----------------
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.loading = true;

      const POS1004Disc = [{
        ECR_KBType: frm.value.ECR_KBType || 'TCHBTN',
        USR_Level: frm.value.USR_Level?.toString(),
        KB_ScanCode: this.selected?.code ?? '',
        KB_Func: frm.value.func,
        KB_Arg1: frm.value.KB_Arg1,
        KB_Arg2: frm.value.KB_Arg2,
        KB_Arg3: frm.value.KB_Arg3,
        KB_Display1: frm.value.KB_Display1,
        KB_Display2: frm.value.KB_Display2,
        KB_Font: frm.value.KB_Font,
        KB_Size: Number(frm.value.KB_Size) || 0,
        KB_Fonttyped: '',
        KB_Style: frm.value.KB_Style,
        KB_Switch: frm.value.KB_Switch,
        KB_Width: this.selected?.x ?? 0,
        KB_Height: this.selected?.y ?? 0,
        KB_Merge: '',
        KB_Color: frm.value.KB_Color,
        KB_FontColor: frm.value.KB_FontColor,
        KG_KeyPage: parseInt(frm.value.KG_KeyPage || '1', 10)
      }];

      const payload = {
        USR_Level: frm.value.USR_Level?.toString(),
        TSB_Name: frm.value.TSB_Name,
        ECR_KBType: frm.value.ECR_KBType || 'TCHBTN',
        ECR_KBDesc: frm.value.ECR_KBDesc || '',
        POS1004Disc
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

  // ---------------- Select ----------------
  selectKey(k: KeyItem): void {
    this.selected = k;
    console.log('選中按鍵:', k);
  }
}
