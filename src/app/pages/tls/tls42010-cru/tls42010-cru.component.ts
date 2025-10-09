import { Component, OnInit } from '@angular/core';
import { Validators, FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
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
import { RadioButtonModule } from 'primeng/radiobutton';

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
  mergeRight?: number;
  mergeDown?: number;
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
    InputNumberComponent,
    NgFor,
    NgClass,
    CommonModule,
    SelectButtonModule,
    DropdownModule,
    TabViewModule,
    ButtonModule,
    DialogModule,
    ColorPickerModule,
    CheckboxModule,
    RadioButtonModule
  ]
})
export class TLS42010CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  activeIndex = 0;
  // 主檔 form
  dataForm = this.formBuilder.nonNullable.group({
    USR_Level: ['', [Validators.maxLength(6), Validators.required]],
    TSB_Name: ['', Validators.required],
    ECR_KBType: ['TCHBTN', Validators.required],
    ECR_KBDesc: ['', Validators.required],
    activePage: [0]
  });

  // 右側設定 form
  selectedKeyForm: FormGroup = this.formBuilder.group({
    KB_Func: [''],
    KB_Switch: ['Y'],
    KB_Display1: ['', Validators.maxLength(5)],
    KB_Display2: ['', Validators.maxLength(5)],
    KB_Color: ['RGB:255,255,255'],
    color: [null],
    KB_Style: ['1'],
    KB_Font: ['Microsoft JhengHei'],
    KB_Size: [12],
    KB_FontColor: ['RGB:0,0,0'],
    FontColor: [null],
    KB_Fonttyped: ['NNN'],
    KB_Arg1: [''],
    KB_Arg2: [''],
    KB_Arg3: [''],
    KB_Merge: [''],
    KB_MergeType: [[]]
  });

  // ---------------- Grid ----------------
  xCount = 8;
  yCount = 5;
  pages: KeyItem[][] = [];   // 每頁獨立存 keys
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

  // 新增按鍵合併選項（改為多次合併）
  KB_MergeOptions: { label: string; value: string }[] = [
    { label: '按鍵往右合併', value: 'mergeRight' },
    { label: '按鍵往下合併', value: 'mergeDown' },
  ];

  // 獲取合併按鈕的標籤
  getMergeButtonLabel(option: {label: string, value: string}): string {
    if (!this.selected) return option.label;

    if (option.value === 'mergeRight') {
      const mergeCount = this.selected.mergeRight || 0;
      return mergeCount > 0 ? `往右合併 (${mergeCount}格)` : option.label;
    } else if (option.value === 'mergeDown') {
      const mergeCount = this.selected.mergeDown || 0;
      return mergeCount > 0 ? `往下合併 (${mergeCount}格)` : option.label;
    }

    return option.label;
  }

  // 檢查合併按鈕是否應該顯示為選中狀態
  isMergeOptionSelected(value: string): boolean {
    if (!this.selected) return false;

    if (value === 'mergeRight') {
      return (this.selected.mergeRight || 0) > 0;
    } else if (value === 'mergeDown') {
      return (this.selected.mergeDown || 0) > 0;
    }

    return false;
  }

  constructor(
    formBuilder: FormBuilder,
    private dropDownListService: DropDownListService,
    private tls42010Service: Tls42010Service
  ) {
    super();
  }

  // ---------------- Computed ----------------
  get pageCapacity() { return this.xCount * this.yCount; }
  get totalPages() { return this.pages.length; }
  get pageList() { return Array.from({ length: this.totalPages }, (_, i) => i); }
  get visibleKeys() {
    return this.pages[this.dataForm.controls.activePage.value] || [];
  }

  // ---------------- Lifecycle ----------------
  ngOnInit(): void {
    this.initializePage('TLS42010', this.dataForm);
    this.pages = [this.buildGrid(0)];
    this.selected = this.pages[0][0];
    this.loadDropdowns();

    // 確保所有現有按鍵都有正確的初始合併屬性
    this.resetAllMergeProperties();

    // 同步選中的 key
    this.selectedKeyForm.valueChanges.subscribe(val => {
      if (this.selected) Object.assign(this.selected, val);
    });

    this.selectedKeyForm.controls['color'].valueChanges.subscribe(v => {
      if (v) this.selectedKeyForm.controls['KB_Color'].setValue(`RGB:${v.r},${v.g},${v.b}`);
    });
    this.selectedKeyForm.controls['FontColor'].valueChanges.subscribe(v => {
      if (v) this.selectedKeyForm.controls['KB_FontColor'].setValue(`RGB:${v.r},${v.g},${v.b}`);
    });

    // 新增：即時更新按鍵顏色、字型顏色和字型大小
    this.selectedKeyForm.controls['KB_Color'].valueChanges.subscribe(color => {
      if (this.selected) {
        this.selected.KB_Color = color;
      }
    });

    this.selectedKeyForm.controls['KB_FontColor'].valueChanges.subscribe(fontColor => {
      if (this.selected) {
        this.selected.KB_FontColor = fontColor;
      }
    });

    this.selectedKeyForm.controls['KB_Size'].valueChanges.subscribe(size => {
      if (this.selected) {
        this.selected.KB_Size = size;
      }
    });

    // 編輯 / 檢視 模式查 API
    if (this.crudstatus === CRUDStatus.Edit || this.crudstatus === CRUDStatus.Read) {
      if (this.rowdata?.USR_Level) {
        // 主檔
        this.tls42010Service.queryTLS42010M({ USR_Level: this.rowdata.USR_Level }).subscribe({
          next: (res) => {
            const master = res?.Data?.[0];
            if (master) {
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

        // 明細
        this.tls42010Service.queryTLS42010_Detail({ USR_Level: [this.rowdata.USR_Level] }).subscribe({
          next: (res) => this.applyDetail(res?.Data ?? [])
        });
      }
    }
    this.activeIndex = this.dataForm.controls.activePage.value || 0;
  }

  // ---------------- Dropdown ----------------
  private loadDropdowns() {
    this.dropDownListService.queryPOS1008DropDownList().subscribe({
      next: (res) => {
        this.TSB_NameOptions = res?.Data?.map((item: any) => ({ No: item.TSB_Name, Name: item.TSB_Name })) ?? [];
        res?.Data?.forEach((item: any) => {
          if (item.KB_ScanCode) {
            this.pos1008Map[item.KB_ScanCode] = { width: item.KB_Width ?? 1, height: item.KB_Height ?? 1 };
          }
        });
      }
    });

    this.dropDownListService.querySYS1000_DropDownList({ SYS_Type: 'ECR_KBType' }).subscribe(res => {
      this.ECR_KBTypeOptions = res?.Data ?? [];
    });

    this.dropDownListService.querySYS1000_DropDownList({ SYS_Type: 'KB_Style' }).subscribe(res => {
      this.KB_StyleOptions = res?.Data?.map((item: any) => ({
        No: item.No ?? item.SYS_Code,
        Name: item.Name ?? item.SYS_Name
      })) ?? [];
    });
  }

  // ---------------- Grid ----------------
  private buildGrid(pageIndex: number): KeyItem[] {
    const grid: KeyItem[] = [];
    const offsetY = pageIndex * this.yCount;
    for (let y = 1; y <= this.yCount; y++) {
      for (let x = 1; x <= this.xCount; x++) {
        const code = `${x.toString().padStart(2, '0')}${(y + offsetY).toString().padStart(2, '0')}`;
        grid.push({
          code,
          x,
          y: y + offsetY,
          mergeRight: 0,
          mergeDown: 0
        });
      }
    }
    return grid;
  }

  // 重置所有按鍵的合併屬性
  private resetAllMergeProperties(): void {
    this.pages.forEach(page => {
      page.forEach(key => {
        if (key.mergeRight === undefined) key.mergeRight = 0;
        if (key.mergeDown === undefined) key.mergeDown = 0;
      });
    });
  }

  addPage() {
    const newPageIndex = this.totalPages;
    this.pages.push(this.buildGrid(newPageIndex));
    setTimeout(() => {
      this.activeIndex = newPageIndex;
      this.dataForm.controls.activePage.setValue(newPageIndex);

      const newPage = this.pages[newPageIndex];
      if (newPage?.length) {
        this.selectKey(newPage[0]);
      }
    });
  }

  private applyDetail(detailList: any[]) {
    if (!detailList?.length) return;

    const maxPage = Math.max(...detailList.map(d => d.KG_KeyPage || 1));
    while (this.pages.length < maxPage) {
      this.pages.push(this.buildGrid(this.pages.length));
    }

    detailList.forEach((d: any) => {
      const pageIndex = (d.KG_KeyPage ?? 1) - 1;
      const scanCode = d.KB_ScanCode; // 使用 KB_ScanCode 而不是 KB_Merge

      const key = this.pages[pageIndex].find(k => k.code === scanCode);
      if (key) {
        // 解析 KB_Merge 欄位 (格式: "mergeRight,mergeDown")
        let mergeRight = 0;
        let mergeDown = 0;
        if (d.KB_Merge && typeof d.KB_Merge === 'string' && d.KB_Merge.includes(',')) {
          const mergeParts = d.KB_Merge.split(',');
          mergeRight = parseInt(mergeParts[0]) || 0;
          mergeDown = parseInt(mergeParts[1]) || 0;
        }

        Object.assign(key, {
          ID: d.ID && d.ID > 0 ? d.ID : 0,
          MID: this.rowdata?.ID ?? 0,
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
          KB_FontColor: d.KB_FontColor,
          mergeRight: mergeRight,
          mergeDown: mergeDown
        });
      }
    });
    const first = this.pages.flat().find(k => k.KB_Func || k.KB_Display1 || k.KB_Display2);
    if (first) {
      this.selected = first;
      this.selectedKeyForm.patchValue({
        KB_Func: first.KB_Func ?? '',
        KB_Switch: first.KB_Switch ?? 'Y',
        KB_Display1: first.KB_Display1 ?? '',
        KB_Display2: first.KB_Display2 ?? '',
        KB_Color: first.KB_Color ?? 'RGB:255,255,255',
        KB_Style: first.KB_Style ?? '1',
        KB_Font: first.KB_Font ?? 'Microsoft JhengHei',
        KB_Size: first.KB_Size ?? 12,
        KB_FontColor: first.KB_FontColor ?? 'RGB:0,0,0',
        KB_Fonttyped: first.KB_Fonttyped ?? 'NNN',
        KB_Arg1: first.KB_Arg1 ?? '',
        KB_Arg2: first.KB_Arg2 ?? '',
        KB_Arg3: first.KB_Arg3 ?? ''
      });
    }
  }
  // ---------------- Key 選取 ----------------
  selectKey(k: KeyItem) {
    if (this.crudstatus === CRUDStatus.Read) return;
    if (this.selected) {
      Object.assign(this.selected, this.selectedKeyForm.getRawValue());
    }
    this.selected = k;
    this.selectedKeyForm.patchValue({
      KB_Func: k.KB_Func ?? '',
      KB_Switch: k.KB_Switch ?? 'Y',
      KB_Display1: k.KB_Display1 ?? '',
      KB_Display2: k.KB_Display2 ?? '',
      KB_Color: k.KB_Color ?? 'RGB:255,255,255',
      KB_Style: k.KB_Style ?? '1',
      KB_Font: k.KB_Font ?? 'Microsoft JhengHei',
      KB_Size: k.KB_Size ?? 12,
      KB_FontColor: k.KB_FontColor ?? 'RGB:0,0,0',
      KB_Fonttyped: k.KB_Fonttyped ?? 'NNN',
      KB_Arg1: k.KB_Arg1 ?? '',
      KB_Arg2: k.KB_Arg2 ?? '',
      KB_Arg3: k.KB_Arg3 ?? ''
    });

    // 更新合併選項顯示
    this.updateMergeDisplay();
  }

  onPageChange(newPageIndex: number) {
    if (this.selected) {
      Object.assign(this.selected, this.selectedKeyForm.getRawValue());
    }
    this.activeIndex = newPageIndex;
    this.dataForm.controls.activePage.setValue(newPageIndex);
    const newPage = this.pages[newPageIndex];
    if (newPage?.length) {
      this.selectKey(newPage[0]);
    }
  }

  // ---------------- Submit ----------------
  private buildDetailList(frm: any) {
    return this.pages.flatMap((page, pageIndex) =>
      page.map(k => {
        const hasConfig = k.KB_Func || k.KB_Display1 || k.KB_Display2;
        const pos1008 = this.pos1008Map[k.code] ?? { width: 1, height: 1 };

        // 組合合併資訊到 KB_Merge
        const mergeRight = k.mergeRight || 0;
        const mergeDown = k.mergeDown || 0;
        const mergeValue = mergeRight > 0 || mergeDown > 0 ? `${mergeRight},${mergeDown}` : '';

        return {
          ID: this.crudstatus === CRUDStatus.Create ? 0 : (k.ID ?? 0),
          ECR_KBType: frm.ECR_KBType,
          USR_Level: this.crudstatus === CRUDStatus.Create ? frm.USR_Level : this.rowdata?.USR_Level || frm.USR_Level,
          KB_ScanCode: k.code,
          KB_Func: hasConfig ? k.KB_Func : '',
          KB_Arg1: hasConfig ? k.KB_Arg1 : '',
          KB_Arg2: hasConfig ? k.KB_Arg2 : '',
          KB_Arg3: hasConfig ? k.KB_Arg3 : '',
          KB_Display1: hasConfig ? k.KB_Display1 : '',
          KB_Display2: hasConfig ? k.KB_Display2 : '',
          KB_Font: hasConfig ? k.KB_Font : 'Microsoft JhengHei',
          KB_Size: hasConfig ? k.KB_Size : 12,
          KB_Fonttyped: hasConfig ? k.KB_Fonttyped || 'NNN' : 'NNN',
          KB_Style: hasConfig ? k.KB_Style || '1' : '1',
          KB_Switch: hasConfig ? k.KB_Switch || 'Y' : 'Y',
          KB_Width: pos1008.width,
          KB_Height: pos1008.height,
          KB_Merge: mergeValue,
          KB_Color: hasConfig ? k.KB_Color : 'RGB:255,255,255',
          KB_FontColor: hasConfig ? k.KB_FontColor : 'RGB:0,0,0',
          KG_KeyPage: pageIndex + 1
        };
      })
    );
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.loading = true;
      if (this.selected) Object.assign(this.selected, this.selectedKeyForm.getRawValue());
      const detailList = this.buildDetailList(frm.value);

      if (this.crudstatus === CRUDStatus.Create) {
        const payload = {
          ECR_KBType: frm.value.ECR_KBType,
          USR_Level: frm.value.USR_Level,
          ECR_KBDesc: frm.value.ECR_KBDesc,
          TSB_Name: frm.value.TSB_Name,
          POS1004Disc: detailList
        };
        this.tls42010Service.insertTLS42010M(payload).subscribe({ next: () => this.loading = false, error: () => this.loading = false });
      } else {
        const payload = {
          ID: this.rowdata?.ID ?? 0,
          ECR_KBType: frm.value.ECR_KBType,
          USR_Level: frm.value.USR_Level,
          ECR_KBDesc: frm.value.ECR_KBDesc,
          TSB_Name: frm.value.TSB_Name,
          POS1004: detailList
        };
        this.tls42010Service.updateTLS42010M(payload).subscribe({ next: () => this.loading = false, error: () => this.loading = false });
      }
    });
  }

  // ---------------- 其他 ----------------
  getControl(name: string): FormControl {
    return this.selectedKeyForm.get(name) as FormControl;
  }
  onTabChangeTab(event: any) {
    this.selectedTab = event.value;
  }
  toggleFonttyped(index: number, checked: boolean) {
    const arr = (this.selectedKeyForm.controls['KB_Fonttyped'].value || 'NNN').split('');
    arr[index] = checked ? 'Y' : 'N';
    this.selectedKeyForm.controls['KB_Fonttyped'].setValue(arr.join(''));
  }

  toggleMergeOption(value: string) {
    if (!this.selected) return;

    const keyX = parseInt(this.selected.code.substring(0, 2));
    const keyY = parseInt(this.selected.code.substring(2, 4));

    if (value === 'mergeRight') {
      // 檢查是否可以往右合併
      if (keyX >= this.xCount) {
        // 已經在最右邊，不能再往右
        return;
      }

      // 增加往右合併格數，如果已經是最大值則重置為0
      const currentMerge = this.selected.mergeRight || 0;
      const maxMerge = this.xCount - keyX; // 最多可以合併到右邊界

      if (currentMerge >= maxMerge) {
        this.selected.mergeRight = 0; // 重置
      } else {
        this.selected.mergeRight = currentMerge + 1; // 增加一格
      }
    }
    else if (value === 'mergeDown') {
      // 檢查是否可以往下合併
      const currentPageY = (keyY - 1) % this.yCount + 1; // 在當前頁面的Y座標
      if (currentPageY >= this.yCount) {
        // 已經在最下面，不能再往下
        return;
      }

      // 增加往下合併格數
      const currentMerge = this.selected.mergeDown || 0;
      const maxMerge = this.yCount - currentPageY; // 最多可以合併到下邊界

      if (currentMerge >= maxMerge) {
        this.selected.mergeDown = 0; // 重置
      } else {
        this.selected.mergeDown = currentMerge + 1; // 增加一格
      }
    }

    // 更新表單顯示
    this.updateMergeDisplay();
  }

  // 更新合併選項的顯示狀態
  updateMergeDisplay() {
    if (!this.selected) return;

    const currentValue = [];
    if (this.selected.mergeRight && this.selected.mergeRight > 0) {
      currentValue.push('mergeRight');
    }
    if (this.selected.mergeDown && this.selected.mergeDown > 0) {
      currentValue.push('mergeDown');
    }

    this.getControl('KB_MergeType').setValue(currentValue);

    // 將合併資訊編碼到 KB_Merge 欄位
    const mergeRight = this.selected.mergeRight || 0;
    const mergeDown = this.selected.mergeDown || 0;
    const mergeValue = mergeRight > 0 || mergeDown > 0 ? `${mergeRight},${mergeDown}` : '';
    this.getControl('KB_Merge').setValue(mergeValue);
  }

  // 檢查按鍵是否應該隱藏（被其他按鍵合併）
  isKeyHidden(key: KeyItem, page: KeyItem[]): boolean {
    const keyX = parseInt(key.code.substring(0, 2));
    const keyY = parseInt(key.code.substring(2, 4));

    for (const k of page) {
      if (k !== key) {
        const kX = parseInt(k.code.substring(0, 2));
        const kY = parseInt(k.code.substring(2, 4));

        // 檢查是否被往右合併覆蓋
        if (k.mergeRight && k.mergeRight > 0) {
          if (keyY === kY && keyX > kX && keyX <= kX + k.mergeRight) {
            return true;
          }
        }
        // 檢查是否被往下合併覆蓋
        if (k.mergeDown && k.mergeDown > 0) {
          if (keyX === kX && keyY > kY && keyY <= kY + k.mergeDown) {
            return true;
          }
        }
        // 檢查是否被同時往右往下合併覆蓋
        if (k.mergeRight && k.mergeRight > 0 && k.mergeDown && k.mergeDown > 0) {
          if (keyX > kX && keyX <= kX + k.mergeRight &&
              keyY > kY && keyY <= kY + k.mergeDown) {
            return true;
          }
        }
      }
    }
    return false;
  }

  getKeyGridStyle(key: KeyItem): Record<string, string> {
    const style: Record<string, string> = {};
    const mergeRight = key.mergeRight || 0;
    const mergeDown = key.mergeDown || 0;
    if (mergeRight > 0) {
      style['grid-column'] = `span ${mergeRight + 1}`;
    }

    if (mergeDown > 0) {
      style['grid-row'] = `span ${mergeDown + 1}`;
    }
    return style;
  }
  convertRGBToCss(rgbString: string): string {
    if (!rgbString || !rgbString.startsWith('RGB:')) {
      return '';
    }

    const rgbValues = rgbString.replace('RGB:', '');
    return `rgb(${rgbValues})`;
  }
}
