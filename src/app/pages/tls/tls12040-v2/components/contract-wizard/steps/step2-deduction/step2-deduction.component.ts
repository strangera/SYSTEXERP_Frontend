import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, OnDestroy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { ExpandableEditTableComponent, ColumnDef } from '@shared/componentkit/expandable-edit-table/expandable-edit-table.component';
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';

import { FareItem, FaresByType } from '../../../../core/models/deduction/fare-item.interface';
import { ContractInfo } from '../../../../core/models/contract/contract-info.interface';
import { TLS12040Service } from '@service/api/tls/tls12040.service';
import { Subscription } from 'rxjs';

interface CapTypeInfo {
  key: string;
  name: string;
}

interface CalculationResult {
  monthlyAmount: number;
  downPayment: number;
  totalAmount: number;
  periods: number;
}

@Component({
  selector: 'app-step2-deduction',
  templateUrl: './step2-deduction.component.html',
  styleUrls: ['./step2-deduction.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    AccordionModule,
    ProgressSpinnerModule,
    ButtonComponent,
    ExpandableEditTableComponent,
    DialogComponent
  ]
})
export class Step2DeductionComponent implements OnInit, OnDestroy {
  @Input() fareItems: FareItem[] = [];
  @Input() contractInfo: ContractInfo | null = null;
  @Input() isViewMode = false;

  @Output() dataChange = new EventEmitter<FareItem[]>();

  private subscriptions: Subscription[] = [];

  // 扣款類型
  capTypes: CapTypeInfo[] = [
    { key: 'A', name: 'A - 一次扣款' },
    { key: 'B', name: 'B - 每月扣款' },
    { key: 'C', name: 'C - 平均分攤' },
    { key: 'D', name: 'D - 比率分攤' },
    { key: 'E', name: 'E - 活動扣款' }
  ];

  // 依類型分組的資料
  fareData: FaresByType = {
    A: [], B: [], C: [], D: [], E: []
  };

  // 各類型顯示模式
  showModeByType: { [key: string]: 'common' | 'all' } = {
    A: 'common', B: 'common', C: 'common', D: 'common', E: 'common'
  };

  // 合約資訊顯示
  contractInfoData: any[] = [];
  contractInfoColumns: ColumnDef[] = [
    { field: 'apply_no', header: '專櫃招募編號', type: 'text', editable: false },
    { field: 'tlt_no', header: '專櫃編號', type: 'text', editable: false },
    { field: 'tlt_name', header: '櫃位名稱', type: 'text', editable: false },
    { field: 'VEN_Name', header: '廠商名稱', type: 'text', editable: false },
    { field: 'tlt_bdate', header: '契約起始日', type: 'text', editable: false },
    { field: 'tlt_edate', header: '契約截止日', type: 'text', editable: false }
  ];

  // 各類型欄位定義
  private columnDefinitions: { [key: string]: ColumnDef[] } = {};

  loading = false;
  shouldForceEdit = true;

  // 計算對話框
  showCalculationDialog = false;
  calculationResult: CalculationResult | null = null;
  currentCalculatingItem: FareItem | null = null;

  constructor(
    private tls12040Service: TLS12040Service
  ) {
    this.initializeColumnDefinitions();
  }

  ngOnInit(): void {
    this.groupFaresByType();
    this.updateContractInfoDisplay();
    this.shouldForceEdit = !this.isViewMode;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * 初始化欄位定義
   */
  private initializeColumnDefinitions(): void {
    // A 類型 - 一次扣款
    this.columnDefinitions['A'] = [
      { field: 'is_selected', header: '選用', type: 'checkbox', editable: true, style: 'width: 60px' },
      { field: 'cap_item', header: '項目代碼', type: 'text', editable: false },
      { field: 'cap_name', header: '扣款項目', type: 'text', editable: false },
      { field: 'tpy_bdate', header: '開始日期', type: 'date', editable: true },
      { field: 'tpy_edate', header: '結束日期', type: 'date', editable: true },
      { field: 'tpy_qty', header: '數量', type: 'number', editable: true },
      { field: 'tpy_unitamt', header: '單價', type: 'number', editable: true },
      { field: 'tpy_amount', header: '金額', type: 'number', editable: true }
    ];

    // B 類型 - 每月扣款
    this.columnDefinitions['B'] = [
      { field: 'is_selected', header: '選用', type: 'checkbox', editable: true, style: 'width: 60px' },
      { field: 'cap_item', header: '項目代碼', type: 'text', editable: false },
      { field: 'cap_name', header: '扣款項目', type: 'text', editable: false },
      { field: 'tpy_bdate', header: '開始日期', type: 'date', editable: true },
      { field: 'tpy_edate', header: '結束日期', type: 'date', editable: true },
      { field: 'tpy_qty', header: '數量', type: 'number', editable: true },
      { field: 'tpy_unitamt', header: '單價', type: 'number', editable: true },
      { field: 'tpy_amount', header: '金額', type: 'number', editable: true }
    ];

    // C 類型 - 平均分攤
    this.columnDefinitions['C'] = [
      { field: 'is_selected', header: '選用', type: 'checkbox', editable: true, style: 'width: 60px' },
      { field: 'cap_item', header: '項目代碼', type: 'text', editable: false },
      { field: 'cap_name', header: '扣款項目', type: 'text', editable: false },
      { field: 'tpy_bdate', header: '開始日期', type: 'date', editable: true },
      { field: 'tpy_edate', header: '結束日期', type: 'date', editable: true },
      { field: 'tpy_totalamt', header: '總金額', type: 'number', editable: true },
      { field: 'down_payment', header: '頭期款', type: 'number', editable: true },
      { field: 'period_nos', header: '期數', type: 'number', editable: true },
      { field: 'tpy_amount', header: '每期金額', type: 'number', editable: false },
      {
        field: 'calculate',
        header: '計算',
        type: 'button',
        editable: false,
        style: 'width: 80px',
        buttonLabel: '計算',
        buttonIcon: 'pi pi-calculator',
        buttonClass: 'p-button-sm'
      }
    ];

    // D 類型 - 比率分攤
    this.columnDefinitions['D'] = [
      { field: 'is_selected', header: '選用', type: 'checkbox', editable: true, style: 'width: 60px' },
      { field: 'cap_item', header: '項目代碼', type: 'text', editable: false },
      { field: 'cap_name', header: '扣款項目', type: 'text', editable: false },
      { field: 'tpy_bdate', header: '開始日期', type: 'date', editable: true },
      { field: 'tpy_edate', header: '結束日期', type: 'date', editable: true },
      { field: 'tpy_rate', header: '比率(%)', type: 'number', editable: true }
    ];

    // E 類型 - 活動扣款
    this.columnDefinitions['E'] = [
      { field: 'is_selected', header: '選用', type: 'checkbox', editable: true, style: 'width: 60px' },
      { field: 'cap_item', header: '項目代碼', type: 'text', editable: false },
      { field: 'cap_name', header: '扣款項目', type: 'text', editable: false },
      { field: 'tpy_bdate', header: '開始日期', type: 'date', editable: true },
      { field: 'tpy_edate', header: '結束日期', type: 'date', editable: true },
      { field: 'tpy_qty', header: '數量', type: 'number', editable: true },
      { field: 'tpy_unitamt', header: '單價', type: 'number', editable: true },
      { field: 'tpy_amount', header: '金額', type: 'number', editable: true }
    ];
  }

  /**
   * 將扣款項目依類型分組
   */
  private groupFaresByType(): void {
    this.fareData = { A: [], B: [], C: [], D: [], E: [] };

    this.fareItems.forEach(item => {
      const type = item.cap_type as keyof FaresByType;
      if (this.fareData[type]) {
        this.fareData[type].push(item);
      }
    });
  }

  /**
   * 更新合約資訊顯示
   */
  private updateContractInfoDisplay(): void {
    if (this.contractInfo) {
      this.contractInfoData = [this.contractInfo];
    }
  }

  /**
   * 取得類型名稱
   */
  getCapTypeName(capType: string): string {
    const typeInfo = this.capTypes.find(t => t.key === capType);
    return typeInfo?.name || capType;
  }

  /**
   * 取得類型欄位
   */
  getColumnsForType(capType: string): ColumnDef[] {
    return this.columnDefinitions[capType] || [];
  }

  /**
   * 檢查該類型是否有資料
   */
  hasDataForType(capType: string): boolean {
    const data = this.fareData[capType as keyof FaresByType];
    if (!data || data.length === 0) return false;

    const mode = this.showModeByType[capType];
    if (mode === 'common') {
      return data.some((item: FareItem) => item.is_commonly_used === 'Y' && item._status !== 'deleted');
    }
    return data.some(item => item._status !== 'deleted');
  }

  /**
   * 取得顯示的資料
   */
  getDisplayDataForType(capType: string): FareItem[] {
    const data = this.fareData[capType as keyof FaresByType] || [];
    const mode = this.showModeByType[capType];

    let filteredData = data.filter(item => item._status !== 'deleted');

    if (mode === 'common') {
      filteredData = filteredData.filter(item => item.is_commonly_used === 'Y');
    }

    return filteredData;
  }

  /**
   * 切換顯示模式
   */
  toggleCommonModeByType(capType: string): void {
    this.showModeByType[capType] = this.showModeByType[capType] === 'common' ? 'all' : 'common';
  }

  /**
   * 取得模式按鈕文字
   */
  getCommonModeTextByType(capType: string): string {
    return this.showModeByType[capType] === 'common' ? '顯示全部' : '僅顯示常用';
  }

  /**
   * 取得當前模式文字
   */
  getCurrentDisplayModeByType(capType: string): string {
    return this.showModeByType[capType] === 'common' ? '常用項目' : '全部項目';
  }

  /**
   * 檢查是否為 outlined 模式
   */
  isOutlinedMode(capType: string): boolean {
    return this.showModeByType[capType] === 'all';
  }

  /**
   * 切換全部顯示模式
   */
  toggleAllCommonMode(): void {
    const allCommon = Object.values(this.showModeByType).every(mode => mode === 'common');
    const newMode = allCommon ? 'all' : 'common';

    Object.keys(this.showModeByType).forEach(key => {
      this.showModeByType[key] = newMode;
    });
  }

  /**
   * 取得全域模式按鈕文字
   */
  getAllCommonModeText(): string {
    const allCommon = Object.values(this.showModeByType).every(mode => mode === 'common');
    return allCommon ? '全部顯示所有項目' : '全部顯示常用項目';
  }

  /**
   * 取得全域顯示模式文字
   */
  getAllDisplayMode(): string {
    const modes = Object.values(this.showModeByType);
    const commonCount = modes.filter(m => m === 'common').length;

    if (commonCount === modes.length) return '全部群組：常用項目';
    if (commonCount === 0) return '全部群組：所有項目';
    return `混合模式 (${commonCount}/${modes.length} 為常用)`;
  }

  /**
   * 全選某類型
   */
  selectAllByType(capType: string): void {
    const data = this.fareData[capType as keyof FaresByType];
    data.forEach(item => {
      if (item._status !== 'deleted') {
        item.is_selected = true;
        if (item._status !== 'new') {
          item._status = 'modified';
        }
      }
    });
    this.emitDataChange();
  }

  /**
   * 取消全選某類型
   */
  deselectAllByType(capType: string): void {
    const data = this.fareData[capType as keyof FaresByType];
    data.forEach(item => {
      if (item._status !== 'deleted') {
        item.is_selected = false;
        if (item._status !== 'new') {
          item._status = 'modified';
        }
      }
    });
    this.emitDataChange();
  }

  /**
   * 取得選中項目總數
   */
  getTotalSelectedCount(): number {
    let count = 0;
    Object.values(this.fareData).forEach(items => {
      count += items.filter((item: FareItem) => item.is_selected && item._status !== 'deleted').length;
    });
    return count;
  }

  /**
   * 選項變更處理
   */
  onItemSelectionChange(capType: string): void {
    this.emitDataChange();
  }

  /**
   * 欄位值變更處理
   */
  onFieldChange(fieldName: string, newValue: any, rowData: FareItem, capType: string): void {
    if (rowData._status !== 'new') {
      rowData._status = 'modified';
    }

    // 自動計算金額
    if (['tpy_qty', 'tpy_unitamt'].includes(fieldName)) {
      const qty = rowData.tpy_qty || 0;
      const unitAmt = rowData.tpy_unitamt || 0;
      rowData.tpy_amount = qty * unitAmt;
    }

    this.emitDataChange();
  }

  /**
   * 按鈕點擊處理
   */
  onButtonClick(event: any, capType: string): void {
    const { column, row } = event;

    if (column.field === 'calculate' && capType === 'C') {
      this.showCalculationForItem(row);
    }
  }

  /**
   * 顯示計算對話框
   */
  private showCalculationForItem(item: FareItem): void {
    this.currentCalculatingItem = item;

    const totalAmount = item.tpy_totalamt || 0;
    const downPayment = item.down_payment || 0;
    const periods = item.period_nos || 1;

    const remainingAmount = totalAmount - downPayment;
    const monthlyAmount = periods > 0 ? Math.floor(remainingAmount / periods) : 0;

    this.calculationResult = {
      totalAmount,
      downPayment,
      periods,
      monthlyAmount
    };

    this.showCalculationDialog = true;
  }

  /**
   * 計算對話框關閉
   */
  onCalculationDialogClose(visible: boolean): void {
    this.showCalculationDialog = visible;
    if (!visible) {
      this.currentCalculatingItem = null;
      this.calculationResult = null;
    }
  }

  /**
   * 儲存計算結果
   */
  onCalculationSave(): void {
    if (this.currentCalculatingItem && this.calculationResult) {
      this.currentCalculatingItem.tpy_amount = this.calculationResult.monthlyAmount;
      this.currentCalculatingItem.down_payment = this.calculationResult.downPayment;

      if (this.currentCalculatingItem._status !== 'new') {
        this.currentCalculatingItem._status = 'modified';
      }

      this.emitDataChange();
    }

    this.showCalculationDialog = false;
    this.currentCalculatingItem = null;
    this.calculationResult = null;
  }

  /**
   * 表格儲存處理
   */
  onFareTableSave(event: any, capType: string): void {
    const { row } = event;
    if (row._status !== 'new') {
      row._status = 'modified';
    }
    this.emitDataChange();
  }

  /**
   * 表格編輯處理
   */
  onFareTableEdit(event: any, capType: string): void {
    // 編輯模式進入
  }

  /**
   * 表格取消處理
   */
  onFareTableCancel(event: any, capType: string): void {
    // 取消編輯
  }

  /**
   * 儲存前處理
   */
  onBeforeSave(event: any, capType: string): void {
    // 儲存前驗證
  }

  /**
   * 發送資料變更事件
   */
  private emitDataChange(): void {
    // 合併所有類型的資料
    const allItems: FareItem[] = [];
    Object.values(this.fareData).forEach(items => {
      allItems.push(...items);
    });

    this.dataChange.emit(allItems);
  }
}
