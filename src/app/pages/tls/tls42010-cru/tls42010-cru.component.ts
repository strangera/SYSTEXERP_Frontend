import { Component, OnInit } from '@angular/core';
import { Validators, FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, FormControl } from '@angular/forms';
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
  KB_Func?: string;
  KB_Switch?: string;
  KB_Display1?: string;
  KB_Display2?: string;
  KB_Color?: string;
  KB_Style?: string;
  KB_Font?: string;
  KB_Size?: number;
  KB_Fonttyped?: string;
  KB_FontColor?: string;
  KB_Arg1?: string;
  KB_Arg2?: string;
  KB_Arg3?: string;
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
export class TLS42010CRUComponent extends BasicCruPageComponent<any>
  implements OnInit {

  // 主檔 form
  dataForm = this.formBuilder.nonNullable.group({
    USR_Level: ['', Validators.maxLength(6)],
    TSB_Name: [''],
    ECR_KBType: ['TCHBTN'],
    ECR_KBDesc: [''],
    activePage: [0]
  });

  // 右側設定區 form
  selectedKeyForm: FormGroup = this.formBuilder.group({
    KB_Func: [''],
    KB_Switch: ['Y'],
    KB_Display1: ['', Validators.maxLength(5)],
    KB_Display2: ['', Validators.maxLength(5)],
    KB_Color: ['RGB:0,0,0'],
    color: [null],
    KB_Style: [''],
    KB_Font: ['微軟正黑體'],
    KB_Size: [14],
    KB_FontColor: ['RGB:0,0,0'],
    FontColor: [null],
    KB_Fonttyped: [''],
    KB_Arg1: [''],
    KB_Arg2: [''],
    KB_Arg3: ['']
  });

  // ---------------- Grid ----------------
  xCount = 8;
  yCount = 5;
  keys: KeyItem[] = [];
  selected?: KeyItem;

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
  KB_SizeOptions = [
    { label: '小 (12)', value: 12 },
    { label: '中 (14)', value: 14 },
    { label: '大 (16)', value: 16 }
  ];
  KB_FontOptions = [
    { label: '微軟正黑體', value: 'Microsoft JhengHei' },
    { label: '標楷體', value: 'DFKai-SB' },
    { label: '新細明體', value: 'PMingLiU' },
  ];
  KB_FonttypedOptions = [
    { label: '粗體', value: 'YNN' },
    { label: '斜體', value: 'NYN' },
    { label: '底線', value: 'NNY' },
  ];

  constructor(
    formBuilder: FormBuilder,
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
      }
    });

    // 鍵盤樣式下拉
    const params = { SYS_Type: 'KB_Style', SYS_Status: 'A' };
    this.dropDownListService.querySYS1000_DropDownList(params).subscribe({
      next: (res) => {
        this.KB_StyleOptions = res?.Data?.map((item: any) => ({
          No: item.No ?? item.SYS_Code,
          Name: item.Name ?? item.SYS_Name
        })) ?? [];
      }
    });

    // 顏色監聽（selectedKeyForm）
    this.selectedKeyForm.controls['color'].valueChanges.subscribe(value => {
      if (value) {
        this.selectedKeyForm.controls['KB_Color'].setValue(`RGB:${value.r},${value.g},${value.b}`);
      }
    });
    this.selectedKeyForm.controls['FontColor'].valueChanges.subscribe(value => {
      if (value) {
        this.selectedKeyForm.controls['KB_FontColor'].setValue(`RGB:${value.r},${value.g},${value.b}`);
      }
    });
  }

  // ---------------- Grid ----------------
  private buildGrid() {
    const onePage: KeyItem[] = [];
    for (let y = 1; y <= this.yCount; y++) {
      for (let x = 1; x <= this.xCount; x++) {
        const code = `${x.toString().padStart(2, '0')}${y.toString().padStart(2, '0')}`;
        onePage.push({ code, x, y });
      }
    }
    this.keys = [...onePage];
    this.selected = this.keys[0];
  }

  // 選中按鍵 → 把值帶進右側 form
  selectKey(k: KeyItem) {
    // 先存回上一顆的設定
    if (this.selected) {
      Object.assign(this.selected, this.selectedKeyForm.getRawValue());
    }

    this.selected = k;

    // 再把新選中的按鍵值 patch 進表單
    this.selectedKeyForm.patchValue({
      KB_Func: k.KB_Func ?? '',
      KB_Switch: k.KB_Switch ?? 'Y',
      KB_Display1: k.KB_Display1 ?? '',
      KB_Display2: k.KB_Display2 ?? '',
      KB_Color: k.KB_Color ?? 'RGB:0,0,0',
      KB_Style: k.KB_Style ?? '',
      KB_Font: k.KB_Font ?? '微軟正黑體',
      KB_Size: k.KB_Size ?? 14,
      KB_FontColor: k.KB_FontColor ?? 'RGB:0,0,0',
      KB_Fonttyped: k.KB_Fonttyped ?? '',
      KB_Arg1: k.KB_Arg1 ?? '',
      KB_Arg2: k.KB_Arg2 ?? '',
      KB_Arg3: k.KB_Arg3 ?? ''
    });
  }

  // 儲存主檔 + 全部按鍵
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.loading = true;

      // 先同步目前選中的按鍵值
      if (this.selected) {
        Object.assign(this.selected, this.selectedKeyForm.getRawValue());
      }

      // 把有設定過的按鍵濾出來
      const POS1004Disc = this.keys.filter(k =>
        k.KB_Func || k.KB_Display1 || k.KB_Display2
      ).map(k => ({
        ECR_KBType: frm.value.ECR_KBType,
        USR_Level: frm.value.USR_Level,
        KB_ScanCode: k.code,
        KB_Func: k.KB_Func,
        KB_Arg1: k.KB_Arg1,
        KB_Arg2: k.KB_Arg2,
        KB_Arg3: k.KB_Arg3,
        KB_Display1: k.KB_Display1,
        KB_Display2: k.KB_Display2,
        KB_Font: k.KB_Font,
        KB_Size: k.KB_Size,
        KB_Fonttyped: k.KB_Fonttyped,
        KB_Style: k.KB_Style,
        KB_Switch: k.KB_Switch,
        KB_Width: k.x,
        KB_Height: k.y,
        KB_Merge: '',
        KB_Color: k.KB_Color,
        KB_FontColor: k.KB_FontColor,
        KG_KeyPage: frm.value.activePage + 1
      }));

      const payload = {
        USR_Level: frm.value.USR_Level,
        TSB_Name: frm.value.TSB_Name,
        ECR_KBType: frm.value.ECR_KBType,
        ECR_KBDesc: frm.value.ECR_KBDesc,
        POS1004Disc
      };

      this.tls42010Service.insertTLS42010M(payload).subscribe({
        next: res => {
          this.loading = false;
          console.log('儲存成功:', res);
        },
        error: err => {
          this.loading = false;
          console.error('儲存失敗:', err);
        }
      });
    });
  }

  onTabChange(event: any) {
    this.selectedTab = event.value;
  }
  getControl(name: string): FormControl {
    return this.selectedKeyForm.get(name) as FormControl;
  }
  onTabChangeTab(event: any) {
    this.selectedTab = event.value;
  }
}
