import { CommonModule, NgClass, NgFor } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ColorPickerModule } from 'primeng/colorpicker';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { PanelModule } from 'primeng/panel';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TabViewModule } from 'primeng/tabview';
import { finalize } from 'rxjs';
import { Tls42010Service } from '../../../service/api/tls/tls42010.service';
import { DropDownListService, IDropdownItem } from '../../../service/utility/dropDownList.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';

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
  KB_Merge?: string;
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
  copiedAttributes: Partial<KeyItem> | null = null;
  multiSelectMode = false;
  readonly CRUDStatus = CRUDStatus;
  selectedKeys: KeyItem[] = []; // shift 多選用

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
  pageOriginalNos: number[] = []; // 對應每個 pages 索引的原始頁碼（傳給後端）
  pageSavedFlags: boolean[] = []; // 對應 page 是否已存在於後端（true: 已儲存；false: 新增但未儲存）
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
  // 模板提供的按鍵預設寬高（若下拉只回傳整體模板尺寸）
  templateDefaultKeySize: { width: number; height: number } = { width: 1, height: 1 };
  TSB_NameOptions: IDropdownItem[] = [];
  ECR_KBTypeOptions: IDropdownItem[] = [];
  KB_StyleOptions: IDropdownItem[] = [];
  KB_FuncOptions: { label: string; value: string }[] = [];
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

  // 按鍵合併
  KB_MergeOptions: { label: string; value: string }[] = [
    { label: '按鍵往右合併', value: 'mergeRight' },
    { label: '按鍵往下合併', value: 'mergeDown' },
    { label: '取消合併', value: 'resetMerge' },
  ];
  KB_AttrOptions = [
    { label: '屬性複製', value: 'copy' },
    { label: '屬性貼上', value: 'paste' },
    { label: '清除設定', value: 'clear' },
  ];

  // 獲取合併按鈕的標籤
  getMergeButtonLabel(option: { label: string, value: string }): string {
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

  copyKeyAttributes() {
    if (!this.selected) return;
    const {
      KB_Func, KB_Display1, KB_Display2, KB_Color,
      KB_FontColor, KB_Style, KB_Font, KB_Size,
      KB_Fonttyped, KB_Switch, KB_Arg1, KB_Arg2, KB_Arg3
    } = this.selected;
    this.copiedAttributes = {
      KB_Func, KB_Display1, KB_Display2, KB_Color,
      KB_FontColor, KB_Style, KB_Font, KB_Size,
      KB_Fonttyped, KB_Switch, KB_Arg1, KB_Arg2, KB_Arg3
    };
    console.log('已複製屬性:', this.copiedAttributes);
  }
  pasteKeyAttributes(event: MouseEvent) {
    if (!this.copiedAttributes) return;
    const isMulti = event.shiftKey;
    const targets = isMulti && this.selectedKeys.length ? this.selectedKeys : [this.selected];
    targets.forEach(key => {
      if (!key) return;
      const originalId = key.ID;
      Object.assign(key, {
        ...this.copiedAttributes,
        ID: originalId,              // 保留原 ID
        KB_ScanCode: key.code,       // 保留原掃描碼
        code: key.code               // 不可覆蓋
      });
    });

    if (!isMulti && this.selected) {
      this.selectedKeyForm.patchValue(this.selected, { emitEvent: true });
    }

    console.log(' 屬性貼上到:', targets);
  }

  clearKeyAttributes(event: MouseEvent) {
    const isMulti = event.shiftKey;
    const targets = isMulti && this.selectedKeys.length ? this.selectedKeys : [this.selected];
    targets.forEach(key => {
      if (!key) return;
      Object.assign(key, {
        KB_Func: '',
        KB_Display1: '',
        KB_Display2: '',
        KB_Arg1: '',
        KB_Arg2: '',
        KB_Arg3: '',
        KB_Font: 'Microsoft JhengHei',
        KB_Size: 12,
        KB_Fonttyped: 'NNN',
        KB_Style: '1',
        KB_Switch: 'Y',
        // reset merge properties
        mergeRight: 0,
        mergeDown: 0,
        KB_Merge: '',
        // reset colors
        KB_Color: 'RGB:255,255,255',
        KB_FontColor: 'RGB:0,0,0'
      });
    });

    if (!isMulti && this.selected) {
      // also reset color pickers and merge form controls so UI reflects cleared state
      this.selectedKeyForm.patchValue({
        ...this.selected,
        color: null,
        FontColor: null,
        KB_Merge: this.selected.KB_Merge ?? ''
      }, { emitEvent: true });
      this.updateMergeDisplay();
    }
  }
  handleAttrAction(action: string, event: MouseEvent) {
    switch (action) {
      case 'copy': this.copyKeyAttributes(); break;
      case 'paste': this.pasteKeyAttributes(event); break;
      case 'clear': this.clearKeyAttributes(event); break;
    }
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
    // 初始化原始頁碼映射（第一頁原始為 1）
    this.pageOriginalNos = [1];
    this.pageSavedFlags = [false];
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
        const data: any[] = res?.Data ?? [];
        this.TSB_NameOptions = data.map((item: any) => ({ No: item.TSB_Name, Name: item.TSB_Name })) ?? [];

        // 若後端回傳的是模板層級的欄位（TSB_XCount/TSB_YCount/TSB_Width/TSB_Height），
        // 以第一筆為預設模板，更新 grid 大小與模板按鍵預設尺寸
        if (data.length) {
          const t: any = data[0];
          if (t.TSB_XCount != null) this.xCount = Number(t.TSB_XCount) || this.xCount;
          if (t.TSB_YCount != null) this.yCount = Number(t.TSB_YCount) || this.yCount;
          if (t.TSB_Width != null || t.TSB_Height != null) {
            this.templateDefaultKeySize = {
              width: Number(t.TSB_Width) || 1,
              height: Number(t.TSB_Height) || 1,
            };
          }
        }

        // 若回傳為逐鍵設定則填入 pos1008Map（以 KB_ScanCode 為 key）
        data.forEach((item: any) => {
          if (item.KB_ScanCode) {
            this.pos1008Map[item.KB_ScanCode] = {
              width: Number(item.KB_Width) || 1,
              height: Number(item.KB_Height) || 1,
            };
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
    this.dropDownListService.queryTLS42010FuncDropDownList().subscribe({
      next: (res) => {
        if (res?.Status === '0000' && res.Data?.length) {
          this.KB_FuncOptions = res.Data.map((item: any) => ({
            label: `${item.KB_Func} - ${item.KB_Desc}`, // 顯示代碼+名稱
            value: item.KB_Func
          }));
        }
      },
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
    // 新增頁面時，同步原始頁碼（使用目前的 index + 1 作為原始頁碼）
    this.pageOriginalNos.push(newPageIndex + 1);
    // 新增頁面尚未存到後端
    this.pageSavedFlags.push(false);
    setTimeout(() => {
      this.activeIndex = newPageIndex;
      this.dataForm.controls.activePage.setValue(newPageIndex);

      const newPage = this.pages[newPageIndex];
      if (newPage?.length) {
        this.selectKey(newPage[0]);
      }
    });
  }

  deletePage() {
    if (this.pages.length <= 1) {
      this.messageService.warnBubble('至少需要保留一頁');
      return;
    }

    this.messageService.confirm({
      message: `確定要刪除第 ${this.activeIndex + 1} 頁嗎？此操作無法復原。`,
      header: '刪除確認',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        // 若此頁尚未儲存到後端，直接在前端移除，不呼叫 API
        const isSaved = !!this.rowdata?.ID && !!this.pageSavedFlags[this.activeIndex];
        if (!isSaved) {
          // 直接在前端移除頁面
          this.pages.splice(this.activeIndex, 1);
          if (this.pageOriginalNos && this.pageOriginalNos.length > this.activeIndex) {
            this.pageOriginalNos.splice(this.activeIndex, 1);
          }
          if (this.pageSavedFlags && this.pageSavedFlags.length > this.activeIndex) {
            this.pageSavedFlags.splice(this.activeIndex, 1);
          }
          if (this.activeIndex >= this.pages.length) {
            this.activeIndex = this.pages.length - 1;
          }
          this.dataForm.controls.activePage.setValue(this.activeIndex);
          const currentPage = this.pages[this.activeIndex];
          if (currentPage?.length) {
            this.selectKey(currentPage[0]);
          }
          this.messageService.successBubble('頁面已刪除');
          return;
        }

        // 已儲存的頁面則呼叫後端刪除
        this.loading = true;
        const origPageNo = this.pageOriginalNos[this.activeIndex] ?? (this.activeIndex + 1);
        const payload = {
          USR_Level: this.rowdata?.USR_Level ?? this.dataForm.controls.USR_Level.value,
          KB_KeyPage: origPageNo
        };
        this.tls42010Service.deletepageTLS42010(payload)
          .pipe(finalize(() => (this.loading = false)), untilDestroyed(this))
          .subscribe({
            next: (res: any) => {
              const ok = res?.Status === '0000' || res?.Message?.includes('成功');
              if (ok) {
                // 刪除當前頁（僅在後端成功後）
                this.pages.splice(this.activeIndex, 1);
                // 同步原始頁碼陣列
                if (this.pageOriginalNos && this.pageOriginalNos.length > this.activeIndex) {
                  this.pageOriginalNos.splice(this.activeIndex, 1);
                }
                if (this.pageSavedFlags && this.pageSavedFlags.length > this.activeIndex) {
                  this.pageSavedFlags.splice(this.activeIndex, 1);
                }

                // 調整活動頁面索引
                if (this.activeIndex >= this.pages.length) {
                  this.activeIndex = this.pages.length - 1;
                }

                this.dataForm.controls.activePage.setValue(this.activeIndex);

                // 選擇新活動頁面的第一個按鍵
                const currentPage = this.pages[this.activeIndex];
                if (currentPage?.length) {
                  this.selectKey(currentPage[0]);
                }

                this.messageService.successBubble(res?.Message ?? '頁面已刪除');
              } else {
                console.warn('deletepageTLS42010 failed', { payload, res });
                const reqId = res?.Meta?.RequestId ? ` (RequestId: ${res.Meta.RequestId})` : '';
                this.messageService.errorBubble(res?.Message ? `${res.Message}${reqId}` : '刪除失敗，請稍後再試');
              }
            },
          });
      }
    });
  }
  private applyDetail(detailList: any[]) {
    if (!detailList?.length) return;
    const validPages = detailList.map(d => Number(d.KB_KeyPage) > 0 ? Number(d.KB_KeyPage) : 1);
    const maxPage = Math.max(...validPages, 1);

    // 建立足夠的頁面格線
    while (this.pages.length < maxPage) {
      this.pages.push(this.buildGrid(this.pages.length));
    }

    // 初始化並同步 pageOriginalNos，使索引對應到後端原始頁碼
    // 預設為 1..maxPage，之後以 detailList 中的 KB_KeyPage 實際值覆蓋
    this.pageOriginalNos = Array.from({ length: maxPage }, (_, i) => i + 1);
    // 初始化 saved flags：預設為 false，若 detailList 中有對應頁則設為 true
    this.pageSavedFlags = Array.from({ length: maxPage }, () => false);
    detailList.forEach((d: any) => {
      const pageIndex = (Number(d.KB_KeyPage) > 0 ? Number(d.KB_KeyPage) : 1) - 1;
      const scanCode = d.KB_ScanCode;

      while (this.pages.length <= pageIndex) {
        this.pages.push(this.buildGrid(this.pages.length));
      }
      const page = this.pages[pageIndex];
      if (!page) {
        return;
      }
      const key = page.find(k => k.code === scanCode);
      if (!key) {
        return;
      }

      let mergeRight = 0;
      let mergeDown = 0;
      if (typeof d.KB_Merge === 'string' && d.KB_Merge.includes(',')) {
        const [r, dwn] = d.KB_Merge.split(',').map((n: string) => parseInt(n) || 0);
        mergeRight = r;
        mergeDown = dwn;
      }

      Object.assign(key, {
        ID: d.ID && Number(d.ID) > 0 ? Number(d.ID) : undefined,
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
        mergeRight,
        mergeDown
      });

      // 確保原始頁碼映射正確（使用檔案中的 KB_KeyPage 原始值）
      this.pageOriginalNos[pageIndex] = Number(d.KB_KeyPage) > 0 ? Number(d.KB_KeyPage) : (pageIndex + 1);
      // 標記此頁為已儲存
      this.pageSavedFlags[pageIndex] = true;
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
    console.table(detailList.map(d => ({
      id: d.id,
      ID: d.ID,
      scan: d.KB_ScanCode
    })));

  }

  // ---------------- Key 選取 ----------------
  selectKey(k: KeyItem, event?: MouseEvent) {
    // 切換前，先把目前表單內容寫回目前選中的按鍵（編輯模式限定）
    if (this.crudstatus !== CRUDStatus.Read && this.selected) {
      Object.assign(this.selected, this.selectedKeyForm.getRawValue());
    }

    // Shift 多選模式（只有在非 Read 模式才允許）
    if (event?.shiftKey && this.crudstatus !== CRUDStatus.Read) {
      const exists = this.selectedKeys.includes(k);
      if (exists) {
        this.selectedKeys = this.selectedKeys.filter(x => x !== k);
      } else {
        this.selectedKeys.push(k);
      }
    } else {
      // 單選模式（查看或編輯都可）
      this.selected = k;
      this.selectedKeys = [k];
    }

    // 更新右側表單內容
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

    this.updateMergeDisplay();

    // 若是 Read 模式，把右側表單 disable（禁止編輯）
    if (this.crudstatus === CRUDStatus.Read) {
      this.selectedKeyForm.disable({ emitEvent: false });
    } else {
      this.selectedKeyForm.enable({ emitEvent: false });
    }
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
        const hasConfig =
          !!(k.KB_Func ||
            k.KB_Display1 ||
            k.KB_Display2 ||
            k.KB_Color !== 'RGB:255,255,255' ||
            k.KB_FontColor !== 'RGB:0,0,0' ||
            k.KB_Style !== '1' ||
            k.KB_Font !== 'Microsoft JhengHei' ||
            k.KB_Size !== 12);
        const pos1008 = this.pos1008Map[k.code] ?? this.templateDefaultKeySize ?? { width: 1, height: 1 };
        const mergeRight = k.mergeRight || 0;
        const mergeDown = k.mergeDown || 0;
        const mergeValue = mergeRight > 0 || mergeDown > 0 ? `${mergeRight},${mergeDown}` : '';
        const keyId =
          this.crudstatus === CRUDStatus.Create
            ? 0
            : (typeof k.ID === 'number' && k.ID > 0 ? k.ID : 0);
        return {
          ID: keyId,
          MID: this.rowdata?.ID ?? 0,
          ECR_KBType: frm.ECR_KBType,
          USR_Level:
            this.crudstatus === CRUDStatus.Create
              ? frm.USR_Level
              : this.rowdata?.USR_Level || frm.USR_Level,
          KB_ScanCode: k.code,
          KB_Func: hasConfig ? k.KB_Func || '' : '',
          KB_Arg1: hasConfig ? k.KB_Arg1 || '' : '',
          KB_Arg2: hasConfig ? k.KB_Arg2 || '' : '',
          KB_Arg3: hasConfig ? k.KB_Arg3 || '' : '',
          KB_Display1: hasConfig ? k.KB_Display1 || '' : '',
          KB_Display2: hasConfig ? k.KB_Display2 || '' : '',
          KB_Font: hasConfig ? k.KB_Font || 'Microsoft JhengHei' : 'Microsoft JhengHei',
          KB_Size: hasConfig ? k.KB_Size ?? 12 : 12,
          KB_Fonttyped: hasConfig ? k.KB_Fonttyped || 'NNN' : 'NNN',
          KB_Style: hasConfig ? k.KB_Style || '1' : '1',
          KB_Switch: hasConfig ? k.KB_Switch || 'Y' : 'Y',
          KB_Width: pos1008.width,
          KB_Height: pos1008.height,
          KB_Merge: mergeValue,
          KB_Color: hasConfig ? k.KB_Color || 'RGB:255,255,255' : 'RGB:255,255,255',
          KB_FontColor: hasConfig ? k.KB_FontColor || 'RGB:0,0,0' : 'RGB:0,0,0',
          KB_KeyPage: pageIndex + 1,
        };
      })
    );
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.loading = true;
      if (this.selected) {
        Object.assign(this.selected, this.selectedKeyForm.getRawValue());
      }
      const detailList = this.buildDetailList(frm.value);

      detailList.forEach(d => {
        if (d.ID == null || isNaN(Number(d.ID))) d.ID = 0;
      });

      const duplicates = detailList
        .map(d => `${d.ECR_KBType}-${d.USR_Level}-${d.KB_ScanCode}`)
        .filter((v, i, arr) => arr.indexOf(v) !== i);
      if (duplicates.length) {
        console.warn('偵測到重複按鍵:', duplicates);
        alert(`偵測到重複按鍵：${duplicates.join(', ')}`);
        this.loading = false;
        return;
      }
      console.table(
        detailList.map(d => ({
          Scan: d.KB_ScanCode,
          ID: d.ID,
          Func: d.KB_Func,
        }))
      );
      if (this.crudstatus === CRUDStatus.Create) {
        const payload = {
          ECR_KBType: frm.value.ECR_KBType,
          USR_Level: frm.value.USR_Level,
          ECR_KBDesc: frm.value.ECR_KBDesc,
          TSB_Name: frm.value.TSB_Name,
          POS1004Disc: detailList, // 後端對應 insert
        };
        this.tls42010Service
          .insertTLS42010M(payload)
          .pipe(finalize(() => (this.loading = false)), untilDestroyed(this))
          .subscribe({
            next: (res) => {
              this.messageService.successBubble(res.Message);
              this.loading = false;
            },
            complete: () => { this.onCancel(); },
            error: () => (this.loading = false),
          });
      } else {
        const payload = {
          ID: this.rowdata?.ID ?? 0,
          ECR_KBType: frm.value.ECR_KBType,
          USR_Level: frm.value.USR_Level,
          ECR_KBDesc: frm.value.ECR_KBDesc,
          TSB_Name: frm.value.TSB_Name,
          POS1004: detailList,
        };
        this.tls42010Service
          .updateTLS42010M(payload)
          .pipe(finalize(() => (this.loading = false)), untilDestroyed(this))
          .subscribe({
            next: (res) => {
              this.messageService.successBubble(res.Message);
              this.loading = false;
            },
            complete: () => { this.onCancel(); },
            error: () => (this.loading = false),
          });
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
      if (keyX >= this.xCount) return;
      const currentMerge = this.selected.mergeRight || 0;
      const maxMerge = this.xCount - keyX;
      this.selected.mergeRight = currentMerge >= maxMerge ? 0 : currentMerge + 1;
    } else if (value === 'mergeDown') {
      const currentPageY = (keyY - 1) % this.yCount + 1;
      if (currentPageY >= this.yCount) return;
      const currentMerge = this.selected.mergeDown || 0;
      const maxMerge = this.yCount - currentPageY;
      this.selected.mergeDown = currentMerge >= maxMerge ? 0 : currentMerge + 1;
    } else if (value === 'resetMerge') {
      this.selected.mergeRight = 0;
      this.selected.mergeDown = 0;
    }
    this.updateMergeDisplay();
  }

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
    const mergeRight = this.selected.mergeRight || 0;
    const mergeDown = this.selected.mergeDown || 0;
    const mergeValue = mergeRight > 0 || mergeDown > 0 ? `${mergeRight},${mergeDown}` : '';
    this.getControl('KB_Merge').setValue(mergeValue);
  }

  isKeyHidden(key: KeyItem, page: KeyItem[]): boolean {
    const keyX = parseInt(key.code.substring(0, 2));
    const keyY = parseInt(key.code.substring(2, 4));
    for (const k of page) {
      if (k !== key) {
        const kX = parseInt(k.code.substring(0, 2));
        const kY = parseInt(k.code.substring(2, 4));

        if (k.mergeRight && k.mergeRight > 0) {
          if (keyY === kY && keyX > kX && keyX <= kX + k.mergeRight) {
            return true;
          }
        }
        if (k.mergeDown && k.mergeDown > 0) {
          if (keyX === kX && keyY > kY && keyY <= kY + k.mergeDown) {
            return true;
          }
        }
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
