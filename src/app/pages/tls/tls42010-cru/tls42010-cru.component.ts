import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { InputTextareaComponent } from '@shared/components/input-textarea/input-textarea.component';
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
import { POS1004Detail, Tls42010Service } from '../../../service/api/tls/tls42010.service';
import { DropDownListService, IDropdownItem } from '../../../service/utility/dropDownList.service';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { ColorUtil } from './color-util';
import { TlsKeyboardService } from './tls-keyboard.service';
import { TLS42010EditorComponent } from './tls42010-editor/tls42010-editor.component';
import { TLS42010GridComponent } from './tls42010-grid/tls42010-grid.component';
import { KeyItem, Tls42010Mapper } from './tls42010.mapper';
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
    CommonModule,
    SelectButtonModule,
    DropdownModule,
    TabViewModule,
    ButtonModule,
    DialogModule,
    ColorPickerModule,
    CheckboxModule,
    RadioButtonModule,
    TLS42010EditorComponent,
    TLS42010GridComponent
  ]
})
export class TLS42010CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    USR_Level: [null, [Validators.maxLength(6), Validators.required]],
    TSB_Name: [null, Validators.required],
    ECR_KBType: ['TCHBTN', Validators.required],
    ECR_KBDesc: [null, Validators.required],
    activePage: [0]
  });
  // 右側設定 form
  selectedKeyForm: FormGroup = this.formBuilder.group(Tls42010Mapper.KEY_FORM_CONFIG);
  xCount = 8;
  yCount = 5;
  pages: KeyItem[][] = [];   // 每頁獨立存 keys
  pageOriginalNos: number[] = []; // 對應每個 pages 索引的原始頁碼（傳給後端）
  pageSavedFlags: boolean[] = []; // 對應 page 是否已存在於後端（true: 已儲存；false: 新增但未儲存）
  selected?: KeyItem;
  // 儲存原始資料
  private rawDetailData: POS1004Detail[] = [];
  activeIndex = 0;
  private copiedAttributes: Partial<KeyItem> | null = null;
  selectedKeys: KeyItem[] = []; // shift 多選用
  // ---------------- Tab Options ----------------
  selectedTab: 'func' | 'button' | 'font' | 'other' = 'func';
  // ---------------- Dropdown Data ----------------
  pos1008Map: Record<string, { width: number; height: number }> = {};
  // 模板提供的按鍵預設寬高（若下拉只回傳整體模板尺寸）
  templateDefaultKeySize: { width: number; height: number } = { width: 1, height: 1 };
  TSB_NameOptions: IDropdownItem[] = [];
  ECR_KBTypeOptions = getSYS1000Options('ECR_KBType');
  KB_StyleOptions = getSYS1000Options('KB_Style');
  KB_FuncOptions$ = this.dropDownListService.queryTLS42010FuncDropDownList();
  // 按鍵合併
  constructor(
    private readonly dropDownListService: DropDownListService,
    private readonly tls42010Service: Tls42010Service,
    private readonly tlsKeyboardService: TlsKeyboardService
  ) { super(); }
  get pageCapacity() { return this.xCount * this.yCount; }
  get totalPages() { return this.pages.length; }
  get pageList() { return Array.from({ length: this.totalPages }, (_, i) => i); }
  get visibleKeys() {
    return this.pages[this.dataForm.controls.activePage.value] || [];
  }
  ngOnInit(): void {
    this.initializePage('TLS42010', this.dataForm);
    this.pages = [this.tlsKeyboardService.buildGrid(0, this.xCount, this.yCount)];
    this.refreshPageDisplay();
    // 初始化原始狀態
    this.pageOriginalNos = [1];
    this.pageSavedFlags = [false];
    this.selected = this.pages[0][0];
    this.loadDropdowns();
    this.resetAllMergeProperties();
    this.setupFormListeners();// 啟動統一監聽
    this.refreshPageDisplay();// 初次重繪畫面樣式
    // 編輯 / 檢視 模式查 API (保留你原本這段)
    if (!this.isFormCreateable && this.rowdata && this.rowdata?.USR_Level) {
      this.dataForm.controls.USR_Level.disable({ emitEvent: false });
      this.tls42010Service.queryTLS42010_Detail({ USR_Level: [this.rowdata.USR_Level] }).subscribe(res => {
        this.rawDetailData = res?.Data ?? [];
        this.applyDetail(this.rawDetailData);
      });
    }
    this.activeIndex = this.dataForm.controls.activePage.value || 0;
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
    this.copiedAttributes.KB_Merge = this.selected.KB_Merge;
    this.copiedAttributes.mergeRight = this.selected.mergeRight;
    this.copiedAttributes.mergeDown = this.selected.mergeDown;
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
      const ca = this.copiedAttributes as any;
      if (ca.mergeRight !== undefined) key.mergeRight = ca.mergeRight;
      if (ca.mergeDown !== undefined) key.mergeDown = ca.mergeDown;
      if (ca.KB_Merge !== undefined) key.KB_Merge = ca.KB_Merge;
      key.__isCopied = true;
    });

    if (!isMulti && this.selected) {
      const val = this.selected;
      this.selectedKeyForm.patchValue({
        KB_ScanCode: val.KB_ScanCode ?? val.code ?? '',
        KB_Func: val.KB_Func ?? '',
        KB_Switch: val.KB_Switch ?? 'Y',
        KB_Display1: val.KB_Display1 ?? '',
        KB_Display2: val.KB_Display2 ?? '',
        KB_Color: val.KB_Color ?? 'RGB:255,255,255',
        KB_Style: val.KB_Style ?? '1',
        KB_Font: val.KB_Font ?? 'Microsoft JhengHei',
        KB_Size: val.KB_Size ?? 12,
        KB_FontColor: val.KB_FontColor ?? 'RGB:0,0,0',
        KB_Fonttyped: val.KB_Fonttyped ?? 'NNN',
        KB_Arg1: val.KB_Arg1 ?? '',
        KB_Arg2: val.KB_Arg2 ?? '',
        KB_Arg3: val.KB_Arg3 ?? '',
        KB_Merge: val.KB_Merge ?? ''
      }, { emitEvent: true });
      const kc = val.KB_Color ?? '';
      if (typeof kc === 'string' && kc.startsWith('RGB:')) {
        const parts = kc.replace('RGB:', '').split(',').map((n: string) => Number(n));
        if (parts.length === 3) this.selectedKeyForm.controls['color'].setValue({ r: parts[0], g: parts[1], b: parts[2] }, { emitEvent: true });
      } else {
        this.selectedKeyForm.controls['color'].setValue(null, { emitEvent: true });
      }
      const fc = val.KB_FontColor ?? '';
      if (typeof fc === 'string' && fc.startsWith('RGB:')) {
        const parts = fc.replace('RGB:', '').split(',').map((n: string) => Number(n));
        if (parts.length === 3) this.selectedKeyForm.controls['FontColor'].setValue({ r: parts[0], g: parts[1], b: parts[2] }, { emitEvent: true });
      } else {
        this.selectedKeyForm.controls['FontColor'].setValue(null, { emitEvent: true });
      }
    }
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
        mergeRight: 0,
        mergeDown: 0,
        KB_Merge: '',
        KB_Color: 'RGB:255,255,255',
        KB_FontColor: 'RGB:0,0,0'
      });
      if ((key as any).__isCopied) delete (key as any).__isCopied;
    });

    if (!isMulti && this.selected) {
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
  private setupFormListeners() {
    // 1. 監聽整個表單：當一般文字、下拉選單變動時，同步回數據模型並重繪
    this.selectedKeyForm.valueChanges.pipe(untilDestroyed(this)).subscribe(val => {
      if (this.selected) {
        // 排除掉 UI 專用的 ColorPicker 物件欄位與合併暫存欄位，只同步資料欄位
        const { color, FontColor, KB_MergeType, ...dataFields } = val;
        Object.assign(this.selected, dataFields);
        this.refreshPageDisplay();
      }
    });
    // 2. 處理「按鍵顏色」選擇器連動 (color -> KB_Color)
    this.selectedKeyForm.controls['color'].valueChanges.pipe(untilDestroyed(this)).subscribe(v => {
      if (v && this.selected) {
        const rgbStr = `RGB:${v.r},${v.g},${v.b}`;
        this.selectedKeyForm.controls['KB_Color'].setValue(rgbStr, { emitEvent: false });
        this.selected.KB_Color = rgbStr;
        this.refreshPageDisplay();
      }
    });
    // 3. 處理「字型顏色」選擇器連動 (FontColor -> KB_FontColor)
    this.selectedKeyForm.controls['FontColor'].valueChanges.pipe(untilDestroyed(this)).subscribe(v => {
      if (v && this.selected) {
        const rgbStr = `RGB:${v.r},${v.g},${v.b}`;
        this.selectedKeyForm.controls['KB_FontColor'].setValue(rgbStr, { emitEvent: false });
        this.selected.KB_FontColor = rgbStr;
        this.refreshPageDisplay();
      }
    });
  }

  // ---------------- Dropdown ----------------
  private loadDropdowns() {
    this.dropDownListService.queryPOS1008DropDownList().subscribe(res => {
      const data: any[] = res?.Data ?? [];
      if (!data.length) return;
      // 1. 同步產生下拉選單與按鍵地圖 (一次迴圈搞定)
      this.TSB_NameOptions = [];
      data.forEach(item => {
        this.TSB_NameOptions.push({ No: item.TSB_Name, Name: item.TSB_Name });
        if (item.KB_ScanCode) {
          this.pos1008Map[item.KB_ScanCode] = {
            width: Number(item.KB_Width) || 1,
            height: Number(item.KB_Height) || 1,
          };
        }
      });
      // 2. 初始化模板規格 (只拿第一筆，語法簡化)
      const first = data[0];
      this.xCount = Number(first.TSB_XCount) || this.xCount;
      this.yCount = Number(first.TSB_YCount) || this.yCount;
      this.templateDefaultKeySize = {
        width: Number(first.TSB_Width) || 100, // 給予預設值防呆
        height: Number(first.TSB_Height) || 50,
      };
    });
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
    this.pages.push(this.tlsKeyboardService.buildGrid(newPageIndex, this.xCount, this.yCount));
    this.pageOriginalNos.push(newPageIndex + 1);// 新增頁面時，同步原始頁碼（使用目前的 index + 1 作為原始頁碼）
    this.pageSavedFlags.push(false);// 新增頁面尚未存到後端
    setTimeout(() => {
      this.activeIndex = newPageIndex;
      this.dataForm.controls.activePage.setValue(newPageIndex);
      const newPage = this.pages[newPageIndex];
      if (newPage?.length) this.selectKey(newPage[0]);
    });
  }

  deletePage() {
    this.messageService.confirm({
      message: `確定要刪除第 ${this.activeIndex + 1} 頁嗎？後續頁面將會往前遞補並重新編號。`,
      header: '刪除確認',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        // 1. 前端直接移除該頁
        this.pages.splice(this.activeIndex, 1);

        // 2. 核心：呼叫 Service 重新洗牌後面所有頁面的 code 與 y 座標
        this.tlsKeyboardService.reindexPages(this.pages, this.xCount, this.yCount);

        // 3. 同步修正長度陣列（因為後續要全刪全寫，這邊維持長度一致即可）
        if (this.pageOriginalNos.length > this.pages.length) {
          this.pageOriginalNos.pop();
        }
        // 全部標記為 false（或者你維持原本的，因為 onSubmit 會整批打包送出）
        this.pageSavedFlags = this.pages.map(() => false);

        // 4. 調整當前停留在哪一頁
        if (this.activeIndex >= this.pages.length) {
          this.activeIndex = this.pages.length - 1;
        }
        this.dataForm.controls.activePage.setValue(this.activeIndex);

        // 5. 重新選取新頁面的第一個按鍵並重繪
        const currentPage = this.pages[this.activeIndex];
        if (currentPage?.length) {
          this.selectKey(currentPage[0]);
        }

        this.refreshPageDisplay();
        this.messageService.successBubble('頁面已刪除並完成重新編號，請記得儲存變更。');
      }
    });
  }
  private applyDetail(detailList: POS1004Detail[]) {
    if (!detailList?.length) return;
    const mid = this.rowdata?.ID ?? 0;
    detailList.forEach(d => {
      const pageIndex = (Number(d.KB_KeyPage) > 0 ? Number(d.KB_KeyPage) : 1) - 1;
      while (this.pages.length <= pageIndex) {
        this.pages.push(this.tlsKeyboardService.buildGrid(this.pages.length, this.xCount, this.yCount));
      }
      const key = this.pages[pageIndex].find(k => k.code === d.KB_ScanCode);
      if (key) {
        Object.assign(key, Tls42010Mapper.fromBackend(d, mid));
        this.pageSavedFlags[pageIndex] = true;
      }
    });

    // 2. 第二次遍歷：根據 KB_Merge 反推合併範圍
    this.pages.forEach(page => {
      page.forEach(k => {
        // 如果我是 Master (ScanCode == KB_Merge)，我要找出有哪些 Slave 屬於我
        if (k.KB_Merge === k.code) {
          const mySlaves = page.filter(s => s.KB_Merge === k.code && s.code !== k.code);
          if (mySlaves.length > 0) {
            const maxSlaveX = Math.max(...mySlaves.map(s => s.x));
            const maxSlaveY = Math.max(...mySlaves.map(s => s.y));
            k.mergeRight = maxSlaveX - k.x;
            k.mergeDown = maxSlaveY - k.y;
          }
        }
      });
    });

    this.refreshPageDisplay();
    this.pages = [...this.pages];
    // 選取第一個有內容的按鍵
    const first = this.pages.flat().find(k => k.KB_Func || k.KB_Display1 || k.KB_Display2);
    if (first) this.selectKey(first);
  }

  // ---------------- Key 選取 ----------------
  selectKey(k: KeyItem, event?: MouseEvent) {
    if (!this.isFormReadable && this.selected) this.selectedKeyForm.markAsPristine();
    if (event?.shiftKey && !this.isFormReadable) {
      const exists = this.selectedKeys.includes(k);
      exists ? (this.selectedKeys = this.selectedKeys.filter(x => x !== k)) : this.selectedKeys.push(k);
    } else {
      this.selected = k;
      this.selectedKeys = [k];
    }
    // --- 這裡一定要改呼叫這個，ColorPicker 才會動 ---
    this.updateEditorForm(k);
    if (this.isFormReadable) {
      this.selectedKeyForm.disable({ emitEvent: false });
    } else {
      this.selectedKeyForm.enable({ emitEvent: false });
    }
  }
  onPageChange(newPageIndex: number) {
    this.activeIndex = newPageIndex;
    this.dataForm.controls.activePage.setValue(newPageIndex);
    this.refreshPageDisplay();
    const newPage = this.pages[newPageIndex];
    if (newPage?.length) {
      this.selectKey(newPage[0]);
    }
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {

      // 1. 送出前校正：因應 code 改變，重新整理每一個頁面內部的 KB_Merge 關聯
      this.pages.forEach(page => {
        page.forEach(k => {
          // 如果這個按鈕是被合併的 (isHidden = true)，找出現在是哪一個 Master 蓋住它
          if (this.tlsKeyboardService.calculateIsHidden(k, page)) {
            const master = this.tlsKeyboardService.findMasterKey(k.x, k.y, page);
            if (master) {
              k.KB_Merge = master.code; // 讓他綁定新洗牌後的 Master code
            }
          } else {
            // 如果自己就是 Master 且有合併別人，KB_Merge 就是自己的新 code
            if ((k.mergeRight && k.mergeRight > 0) || (k.mergeDown && k.mergeDown > 0)) {
              k.KB_Merge = k.code;
            } else {
              k.KB_Merge = '';
            }
          }
        });
      });

      // 2. 透過 Mapper 產生明細清單 (這時 idx + 1 就會是正確遞補後的頁碼)
      const detailList = this.pages.flatMap((page, idx) => page.map(k => {
        const baseSize = this.pos1008Map[k.code] ?? this.templateDefaultKeySize;
        return Tls42010Mapper.toBackend(
          k,
          idx + 1, // 這裡傳入的就是 1, 2, 3 頁碼
          frm.getRawValue(),
          this.crudstatus,
          this.rowdata,
          baseSize,
          page
        );
      }));

      // 3. ID 防呆
      detailList.forEach(d => {
        if (d.ID == null || isNaN(Number(d.ID))) d.ID = 0;
      });

      // 4. 重複性檢查
      const duplicates = detailList.map(d => `${d.ECR_KBType}-${d.USR_Level}-${d.KB_ScanCode}`).filter((v, i, arr) => arr.indexOf(v) !== i);
      if (duplicates.length) {
        this.messageService.errorBubble(`${duplicates.join(', ')}`, '偵測到重複按鍵：');
        this.loading = false;
        return;
      }

      // 5. 發送請求 (依據你的敘述，後端會對應此 USR_Level 進行全刪全改)
      const payload = {
        ID: this.isFormCreateable ? undefined : this.rowdata?.id,
        ECR_KBType: frm.getRawValue().ECR_KBType,
        USR_Level: frm.getRawValue().USR_Level,
        ECR_KBDesc: frm.getRawValue().ECR_KBDesc,
        TSB_Name: frm.getRawValue().TSB_Name,
        POS1004: detailList,
        POS1004Disc: detailList
      };

      const response = this.isFormCreateable
        ? this.tls42010Service.insertTLS42010M(payload)
        : this.tls42010Service.updateTLS42010M(payload);

      response.pipe(finalize(() => (this.loading = false)), untilDestroyed(this)).subscribe(res => {
        this.messageService.successBubble(res.Message);
        this.onCancel();
      });
    });
  }
  // ---------------- 其他 ----------------
  getControl(name: string): FormControl {
    return this.selectedKeyForm.get(name) as FormControl;
  }
  toggleFonttyped(index: number, checked: boolean) {
    const arr = (this.selectedKeyForm.controls['KB_Fonttyped'].value || 'NNN').split('');
    arr[index] = checked ? 'Y' : 'N';
    this.selectedKeyForm.controls['KB_Fonttyped'].setValue(arr.join(''));
  }

  toggleMergeOption(value: string) {
    if (!this.selected) return;
    if (value === 'resetMerge') {
      this.selected.mergeRight = 0;
      this.selected.mergeDown = 0;
    } else {
      const type = value as 'mergeRight' | 'mergeDown';
      this.selected[type] = this.tlsKeyboardService.getNextMergeValue(this.selected, type, this.xCount, this.yCount);
    }
    this.updateMergeDisplay();
  }

  updateMergeDisplay() {
    if (!this.selected) return;
    const currentValue = [];
    if (this.selected.mergeRight && this.selected.mergeRight > 0) currentValue.push('mergeRight');
    if (this.selected.mergeDown && this.selected.mergeDown > 0) currentValue.push('mergeDown');
    this.getControl('KB_MergeType').setValue(currentValue);
    const mergeRight = this.selected.mergeRight || 0;
    const mergeDown = this.selected.mergeDown || 0;
    const mergeValue = mergeRight > 0 || mergeDown > 0 ? `${mergeRight},${mergeDown}` : '';
    this.getControl('KB_Merge').setValue(mergeValue);
  }
  onCancelClicked(): void {
    // 2. 重置關鍵狀態變數
    this.activeIndex = 0;
    this.dataForm.controls.activePage.setValue(0);
    // 3. 重新初始化 pages (先回到只有一頁空白網格的狀態)
    this.pages = [this.tlsKeyboardService.buildGrid(0, this.xCount, this.yCount)];
    this.pageOriginalNos = [1];
    this.pageSavedFlags = [false];
    // 4. 利用原始暫存資料重新渲染
    if (this.rawDetailData?.length > 0) {
      this.applyDetail(this.rawDetailData);
    } else {
      this.refreshPageDisplay();
      this.selectKey(this.pages[0][0]);
    }
    // 5. 清除複製標記與 Form 狀態
    this.pages.flat().forEach(k => { if ((k as any).__isCopied) delete (k as any).__isCopied; });
    this.dataForm.markAsPristine();
    this.selectedKeyForm.markAsPristine();
  }
  /**
 * 預先計算目前頁面所有按鍵的顯示狀態與樣式
 * 避免在 HTML 模板中呼叫 function 導致效能下滑
 */
  refreshPageDisplay() {
    const currentPage = this.pages[this.activeIndex];
    if (!currentPage) return;

    currentPage.forEach(key => {
      key.isHidden = this.tlsKeyboardService.calculateIsHidden(key, currentPage);
      key.gridStyle = {
        'grid-column': key.mergeRight ? `span ${key.mergeRight + 1}` : 'span 1',
        'grid-row': key.mergeDown ? `span ${key.mergeDown + 1}` : 'span 1'
      };
      key.buttonStyle = {
        'background-color': ColorUtil.rgbToCss(key.KB_Color || ''),
        'color': ColorUtil.rgbToCss(key.KB_FontColor || ''),
        'font-size': key.KB_Size ? key.KB_Size + 'px' : '12px',
        'font-weight': key.KB_Fonttyped?.[0] === 'Y' ? 'bold' : 'normal',
        'font-style': key.KB_Fonttyped?.[1] === 'Y' ? 'italic' : 'normal',
        'text-decoration': key.KB_Fonttyped?.[2] === 'Y' ? 'underline' : 'none'
      };
    });
  }
  private updateEditorForm(k: KeyItem) {
    this.selectedKeyForm.patchValue(k, { emitEvent: false });
    this.selectedKeyForm.patchValue({
      color: ColorUtil.parseRgbToObj(k.KB_Color),     // 將解析邏輯移入 ColorUtil
      FontColor: ColorUtil.parseRgbToObj(k.KB_FontColor)
    }, { emitEvent: false });
  }
}
