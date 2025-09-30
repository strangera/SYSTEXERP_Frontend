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
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { CheckboxModule } from 'primeng/checkbox';

export interface KeyItem {
  code: string;
  x: number;
  y: number;
  ID?: number;
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
    ColorPickerModule,
    CheckboxModule
  ]
})
export class TLS42010CRUComponent extends BasicCruPageComponent<any> implements OnInit {

  // 主檔 form
  dataForm = this.formBuilder.nonNullable.group({
    USR_Level: ['', [Validators.maxLength(6), Validators.required]],
    TSB_Name: ['', Validators.required],
    ECR_KBType: ['TCHBTN', Validators.required],
    ECR_KBDesc: ['', Validators.required],
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
    KB_Style: ['1'],
    KB_Font: ['Microsoft JhengHei'],
    KB_Size: [14],
    KB_FontColor: ['RGB:0,0,0'],
    FontColor: [null],
    KB_Fonttyped: ['NNN'],
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
  pos1008Map: Record<string, { width: number; height: number }> = {};
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
    { label: '粗體', index: 0 },
    { label: '斜體', index: 1 },
    { label: '底線', index: 2 },
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
    this.loadDropdowns();

    // 只要 form 有變動就同步到 selected key
    this.selectedKeyForm.valueChanges.subscribe(val => {
      if (this.selected) {
        Object.assign(this.selected, val);
      }
    });

    // 顏色監聽
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

    // === 編輯 / 檢視模式 ===
    if (this.crudstatus === CRUDStatus.Edit || this.crudstatus === CRUDStatus.Read) {
      if (this.rowdata?.USR_Level) {
        // 先查主檔
        this.tls42010Service.queryTLS42010M({ USR_Level: this.rowdata.USR_Level }).subscribe({
          next: (res) => {
            const master = res?.Data?.[0];
            if (master) {
              console.log('主檔資料:', master);

              // ⚠️ 主檔 ID 一定要存起來
              this.rowdata.ID = master.id;

              this.dataForm.patchValue({
                USR_Level: master.USR_Level,
                TSB_Name: master.TSB_Name,
                ECR_KBType: master.ECR_KBType,
                ECR_KBDesc: master.ECR_KBDesc,
                activePage: (master.kg_keypage ?? 1) - 1
              });
            }
          }
        });

        // 再查明細
        this.tls42010Service.queryTLS42010_Detail({
          USR_Level: [this.rowdata.USR_Level]
        }).subscribe({
          next: (res) => {
            this.applyDetail(res?.Data ?? []);
          },
        });
      }
    }
  }

  private loadDropdowns() {
    this.dropDownListService.queryPOS1008DropDownList().subscribe({
      next: (res) => {
        this.TSB_NameOptions = res?.Data?.map((item: any) => ({
          No: item.TSB_Name,
          Name: item.TSB_Name
        })) ?? [];

        res?.Data?.forEach((item: any) => {
          if (item.KB_ScanCode) {
            this.pos1008Map[item.KB_ScanCode] = {
              width: item.KB_Width ?? 1,
              height: item.KB_Height ?? 1
            };
          }
        });
      }
    });

    this.dropDownListService.querySYS1000_DropDownList({ SYS_Type: 'ECR_KBType' }).subscribe({
      next: (res) => {
        this.ECR_KBTypeOptions = res?.Data ?? [];
      }
    });

    const params = { SYS_Type: 'KB_Style', SYS_Status: 'A' };
    this.dropDownListService.querySYS1000_DropDownList(params).subscribe({
      next: (res) => {
        this.KB_StyleOptions = res?.Data?.map((item: any) => ({
          No: item.No ?? item.SYS_Code,
          Name: item.Name ?? item.SYS_Name
        })) ?? [];
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

  private applyDetail(detailList: any[]) {
    this.buildGrid();

    detailList.forEach((d: any) => {
      const scanCode = d.KB_Merge;
      const key = this.keys.find(k => k.code === scanCode);
      if (key) {
        Object.assign(key, {
          ID: d.ID && d.ID > 0 ? d.ID : 0,       // 明細自己的 ID，沒有就設 0
          MID: this.rowdata?.ID ?? 0,            // 每筆綁主檔 ID
          KB_Func: d.KB_Func,
          KB_Switch: d.KB_Switch,
          KB_Display1: d.KB_Display1,
          KB_Display2: d.KB_Display2,
          KB_Color: d.KB_Color,
          KB_Style: d.KB_Style,
          KB_Font: d.KB_Font,
          KB_Size: d.KB_Size,
          KB_Fonttyped: d.KB_Fonttyped,
          KB_Arg1: d.KB_Arg1,
          KB_Arg2: d.KB_Arg2,
          KB_Arg3: d.KB_Arg3,
          KB_FontColor: d.KB_FontColor
        });
      }
    });

    const first = this.keys.find(k => k.KB_Func || k.KB_Display1 || k.KB_Display2);
    if (first) {
      this.selectKey(first);
    } else {
      this.selectedKeyForm.reset({
        KB_Func: '',
        KB_Switch: 'Y',
        KB_Display1: '',
        KB_Display2: '',
        KB_Color: 'RGB:0,0,0',
        KB_Style: '1',
        KB_Font: 'Microsoft JhengHei',
        KB_Size: 14,
        KB_FontColor: 'RGB:0,0,0',
        KB_Fonttyped: 'NNN',
        KB_Arg1: '',
        KB_Arg2: '',
        KB_Arg3: ''
      });
    }
  }


  // ---------------- Key 選取 ----------------
  selectKey(k: KeyItem) {
    // 先把上一顆存起來
    if (this.selected) {
      Object.assign(this.selected, this.selectedKeyForm.getRawValue());
    }
    this.selected = k;
    const hasConfig =
      k.KB_Func || k.KB_Display1 || k.KB_Display2 ||
      k.KB_Arg1 || k.KB_Arg2 || k.KB_Arg3;
    if (hasConfig) {
      this.selectedKeyForm.patchValue({
        KB_Func: k.KB_Func ?? '',
        KB_Switch: k.KB_Switch ?? 'Y',
        KB_Display1: k.KB_Display1 ?? '',
        KB_Display2: k.KB_Display2 ?? '',
        KB_Color: k.KB_Color ?? 'RGB:0,0,0',
        KB_Style: k.KB_Style ?? '1',
        KB_Font: k.KB_Font ?? 'Microsoft JhengHei',
        KB_Size: k.KB_Size ?? 14,
        KB_FontColor: k.KB_FontColor ?? 'RGB:0,0,0',
        KB_Fonttyped: k.KB_Fonttyped ?? 'NNN',
        KB_Arg1: k.KB_Arg1 ?? '',
        KB_Arg2: k.KB_Arg2 ?? '',
        KB_Arg3: k.KB_Arg3 ?? ''
      });
    } else {
      this.selectedKeyForm.reset({
        KB_Func: '',
        KB_Switch: 'Y',
        KB_Display1: '',
        KB_Display2: '',
        KB_Color: 'RGB:0,0,0',
        KB_Style: '1',
        KB_Font: 'Microsoft JhengHei',
        KB_Size: 14,
        KB_FontColor: 'RGB:0,0,0',
        KB_Fonttyped: 'NNN',
        KB_Arg1: '',
        KB_Arg2: '',
        KB_Arg3: ''
      });
    }
  }

  // ---------------- Submit ----------------
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.loading = true;

      // log: 送出前 selectedKeyForm 與 keys[0] (KB_ScanCode='0101')
      const key0101 = this.keys.find(k => k.code === '0101');
      console.log('送出前 selectedKeyForm:', this.selectedKeyForm.getRawValue());
      console.log('送出前 keys[0] (KB_ScanCode=0101):', key0101);

      if (this.selected) {
        Object.assign(this.selected, this.selectedKeyForm.getRawValue());
      }

      // 先組明細
      const detailList = this.keys.map(k => {
        const hasConfig = k.KB_Func || k.KB_Display1 || k.KB_Display2;
        const pos1008 = this.pos1008Map[k.code] ?? { width: 1, height: 1 };

        return {
          ID: this.crudstatus === CRUDStatus.Create ? 0 : (k.ID ?? 0),
          ECR_KBType: frm.value.ECR_KBType,
          USR_Level: this.crudstatus === CRUDStatus.Create
            ? frm.value.USR_Level              // 新增用表單
            : this.rowdata?.USR_Level || frm.value.USR_Level, // 修改用 DB 值
          KB_ScanCode: k.code,
          KB_Func: hasConfig ? k.KB_Func : '',
          KB_Arg1: hasConfig ? k.KB_Arg1 : '',
          KB_Arg2: hasConfig ? k.KB_Arg2 : '',
          KB_Arg3: hasConfig ? k.KB_Arg3 : '',
          KB_Display1: hasConfig ? k.KB_Display1 : '',
          KB_Display2: hasConfig ? k.KB_Display2 : '',
          KB_Font: hasConfig ? k.KB_Font : 'Microsoft JhengHei',
          KB_Size: hasConfig ? k.KB_Size : 14,
          KB_Fonttyped: hasConfig
            ? (Array.isArray(k.KB_Fonttyped) ? k.KB_Fonttyped.join(',') : (k.KB_Fonttyped || 'NNN'))
            : 'NNN',
          KB_Style: hasConfig ? (k.KB_Style || '1') : '1',
          KB_Switch: hasConfig ? (k.KB_Switch || 'Y') : 'Y',
          KB_Width: pos1008.width,
          KB_Height: pos1008.height,
          KB_Merge: k.code,
          KB_Color: hasConfig ? k.KB_Color : 'RGB:0,0,0',
          KB_FontColor: hasConfig ? k.KB_FontColor : 'RGB:0,0,0',
          KG_KeyPage: frm.value.activePage + 1
        };
      });

      // === Create 模式 ===
      if (this.crudstatus === CRUDStatus.Create) {
        const payload = {
          ECR_KBType: frm.value.ECR_KBType,
          USR_Level: frm.value.USR_Level,
          ECR_KBDesc: frm.value.ECR_KBDesc,
          TSB_Name: frm.value.TSB_Name,
          POS1004Disc: detailList   // ⚠️ 新增用 POS1004Disc
        };

        this.tls42010Service.insertTLS42010M(payload).subscribe({
          next: (res) => {
            this.loading = false;
            console.log('Create 成功:', res);
          },
          error: () => (this.loading = false)
        });
      }

      else if (this.crudstatus === CRUDStatus.Edit) {
        const masterId = this.rowdata?.ID ?? 0;

        const detailList = this.keys.map(k => {
          const hasConfig = k.KB_Func || k.KB_Display1 || k.KB_Display2;
          const pos1008 = this.pos1008Map[k.code] ?? { width: 1, height: 1 };

          return {
            ID: k.ID && k.ID > 0 ? k.ID : 0,
            ECR_KBType: frm.value.ECR_KBType,
            USR_Level: frm.value.USR_Level,
            KB_ScanCode: k.code,
            KB_Func: hasConfig ? k.KB_Func : '',
            KB_Arg1: hasConfig ? k.KB_Arg1 : '',
            KB_Arg2: hasConfig ? k.KB_Arg2 : '',
            KB_Arg3: hasConfig ? k.KB_Arg3 : '',
            KB_Display1: hasConfig ? k.KB_Display1 : '',
            KB_Display2: hasConfig ? k.KB_Display2 : '',
            KB_Font: hasConfig ? k.KB_Font : 'Microsoft JhengHei',
            KB_Size: hasConfig ? k.KB_Size : 14,
            KB_Fonttyped: hasConfig
              ? (Array.isArray(k.KB_Fonttyped) ? k.KB_Fonttyped.join(',') : (k.KB_Fonttyped || 'NNN'))
              : 'NNN',
            KB_Style: hasConfig ? (k.KB_Style || '1') : '1',
            KB_Switch: hasConfig ? (k.KB_Switch || 'Y') : 'Y',
            KB_Width: pos1008.width,
            KB_Height: pos1008.height,
            KB_Merge: k.code,
            KB_Color: hasConfig ? k.KB_Color : 'RGB:0,0,0',
            KB_FontColor: hasConfig ? k.KB_FontColor : 'RGB:0,0,0',
            KG_KeyPage: frm.value.activePage + 1
          };
        });


        const payload = {
          ID: masterId, // 主檔 ID
          ECR_KBType: frm.value.ECR_KBType,
          USR_Level: frm.value.USR_Level,
          ECR_KBDesc: frm.value.ECR_KBDesc,
          TSB_Name: frm.value.TSB_Name,
          POS1004: detailList
        };

        this.tls42010Service.updateTLS42010M(payload).subscribe({
          next: (res) => {
            this.loading = false;
            console.log('Edit 成功:', res);
          },
          error: () => (this.loading = false)
        });
      }
    });
  }


  // ---------------- 其他 ----------------
  onTabChange(event: any) {
    this.selectedTab = event.value;
  }
  getControl(name: string): FormControl {
    return this.selectedKeyForm.get(name) as FormControl;
  }
  onTabChangeTab(event: any) {
    this.selectedTab = event.value;
  }
  toggleFonttyped(index: number, checked: boolean) {
    const current = this.selectedKeyForm.controls['KB_Fonttyped'].value || 'NNN';
    const arr = current.split('');
    arr[index] = checked ? 'Y' : 'N';
    this.selectedKeyForm.controls['KB_Fonttyped'].setValue(arr.join(''));
  }
}
