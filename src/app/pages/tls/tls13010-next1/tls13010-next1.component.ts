import { Column } from './../../../shared/componentkit/table/table.model';
import { ColumnDef } from '../../../shared/componentkit/expandable-edit-table/expandable-edit-table.component';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { TLS13010Service } from '../../../service/API/tls/tls13010.service';
import { ContractFlowService, WorkflowStep } from '../../../service/API/tls/tls13010contract-flow/contract-flow.service';

// 介面定義
interface CategoryItem {
  id: number;
  CAT_LNo: string;
  CAT_LName: string;
  CAT_LRemark: string | null;
  CRT_USR_No: string | "";
  CRT_USR_Name: string | "";
}

// 統一的扣款項目介面
interface FareItem {
  id?: string | number;
  serialNumber?: number;
  isNew: boolean;
  cap_item: string;           // 扣款代碼
  cap_name: string;           // 扣款名稱
  tpy_bdate: string;          // 扣款起始年月
  tpy_edate?: string;         // 扣款結束年月
  tpy_type?: string;          // 費用計算方式
  tpy_qty?: number;           // 數量
  tpy_unitamt?: number;       // 單價
  tpy_amount?: number;        // 每月扣款金額
  tpy_totalamt?: number;      // 扣款總金額
  day_account?: string;       // 是否以日計算
  interval?: number;          // 計算週期
  down_payment?: number;      // 頭期款
  period_nos?: number;        // 期數
  tpy_1stamt?: number;        // 首期金額
  cap_saletype?: string;      // 銷售類型
  edc_bank?: string;          // 收單行
  instms_type?: string;       // 分期期數
  pay_no?: string;            // 扣款別編號
  gui_flag: string;           // 是否開立發票
  tpy_rate?: number;          // 費用計算比率
  org_id: string;             // 組織代碼
  is_commonly_used?: string;  // 是否為常用
  _status?: 'new' | 'modified' | 'deleted' | 'original';
}

@Component({
  selector: 'app-tls13010-next1',
  templateUrl: './tls13010-next1.component.html',
  styleUrls: ['./tls13010-next1.component.scss']
})
export class TLS13010Next1Component extends BasicCruPageComponent<CategoryItem> implements OnInit, OnDestroy {

  private subscriptions: Subscription[] = [];

  // 顯示模式控制
  showOnlyCommonlyUsed = true; // 預設顯示常用項目
  showOnlySelected = false; // 是否只顯示已勾選項目

  // 當前合約資料
  currentTalentId: string = '';
  currentContractData: any = null;

  // 表格欄位定義 - A 類型（一次扣款）
  deductionAColumns: ColumnDef[] = [
    { field: 'isNew', header: '是否新增', type: 'checkbox', editable: true, style: 'min-width: 100px' },
    { field: 'cap_item', header: '扣款代號', type: 'text', editable: false, style: 'min-width: 120px' },
    { field: 'cap_name', header: '扣款名稱', type: 'text', editable: false, style: 'min-width: 150px' },
    { field: 'tpy_bdate', header: '扣款起始年月', type: 'date', editable: true, style: 'min-width: 150px' },
    { field: 'tpy_type', header: '單位', type: 'text', editable: true, style: 'min-width: 100px' },
    { field: 'tpy_unitamt', header: '單價', type: 'number', editable: true, style: 'min-width: 120px' },
    { field: 'tpy_qty', header: '數量', type: 'number', editable: true, style: 'min-width: 100px' },
    { field: 'tpy_amount', header: '扣款金額', type: 'number', editable: true, style: 'min-width: 120px' },
    { field: 'org_id', header: '組織', type: 'text', editable: true, style: 'min-width: 100px' },
    {
      field: 'gui_flag',
      header: '是否開立發票',
      type: 'dropdown',
      editable: true,
      style: 'min-width: 130px',
      options: [
        { label: '開立', value: 'Y' },
        { label: '未開立', value: 'N' }
      ]
    }
  ];

  // 表格欄位定義 - B 類型（每月扣款）
  deductionBColumns: ColumnDef[] = [
    { field: 'isNew', header: '是否新增', type: 'checkbox', editable: true, style: 'min-width: 100px' },
    { field: 'cap_item', header: '扣款代號', type: 'text', editable: false, style: 'min-width: 120px' },
    { field: 'cap_name', header: '扣款名稱', type: 'text', editable: false, style: 'min-width: 150px' },
    { field: 'tpy_bdate', header: '扣款起始年月', type: 'date', editable: true, style: 'min-width: 150px' },
    { field: 'tpy_edate', header: '扣款結束年月', type: 'date', editable: true, style: 'min-width: 150px' },
    { field: 'tpy_type', header: '單位', type: 'text', editable: true, style: 'min-width: 100px' },
    { field: 'tpy_unitamt', header: '單價', type: 'number', editable: true, style: 'min-width: 120px' },
    { field: 'tpy_qty', header: '數量', type: 'number', editable: true, style: 'min-width: 100px' },
    { field: 'tpy_amount', header: '扣款金額(未稅)', type: 'number', editable: true, style: 'min-width: 120px' },
    {
      field: 'gui_flag',
      header: '是否開立發票',
      type: 'dropdown',
      editable: true,
      style: 'min-width: 130px',
      options: [
        { label: '開立', value: 'Y' },
        { label: '未開立', value: 'N' }
      ]
    },
    {
      field: 'day_account',
      header: '是否以日計算',
      type: 'dropdown',
      editable: true,
      style: 'min-width: 130px',
      options: [
        { label: '是', value: 'Y' },
        { label: '否', value: 'N' }
      ]
    },
    { field: 'interval', header: '扣款週期數(月)', type: 'number', editable: true, style: 'min-width: 150px' }
  ];

  // 表格欄位定義 - C 類型（平均分攤）
  deductionCColumns: ColumnDef[] = [
    { field: 'isNew', header: '是否新增', type: 'checkbox', editable: true, style: 'min-width: 100px' },
    { field: 'cap_item', header: '扣款代號', type: 'text', editable: false, style: 'min-width: 120px' },
    { field: 'cap_name', header: '扣款名稱', type: 'text', editable: false, style: 'min-width: 150px' },
    { field: 'tpy_bdate', header: '扣款起始年月', type: 'date', editable: true, style: 'min-width: 150px' },
    { field: 'tpy_edate', header: '扣款結束年月', type: 'date', editable: true, style: 'min-width: 150px' },
    { field: 'tpy_totalamt', header: '總金額', type: 'number', editable: true, style: 'min-width: 120px' },
    { field: 'down_payment', header: '預收款', type: 'number', editable: true, style: 'min-width: 120px' },
    { field: 'period_nos', header: '期數', type: 'number', editable: true, style: 'min-width: 100px' },
    { field: 'tpy_amount', header: '每月金額', type: 'number', editable: true, style: 'min-width: 120px' },
    { field: 'tpy_1stamt', header: '首期金額', type: 'number', editable: true, style: 'min-width: 120px' },
    { field: 'org_id', header: '組織', type: 'text', editable: true, style: 'min-width: 100px' },
    {
      field: 'gui_flag',
      header: '是否開立發票',
      type: 'dropdown',
      editable: true,
      style: 'min-width: 130px',
      options: [
        { label: '開立', value: 'Y' },
        { label: '未開立', value: 'N' }
      ]
    }
  ];

  // 表格欄位定義 - D 類型（比率分攤）
  deductionDColumns: ColumnDef[] = [
    { field: 'isNew', header: '是否新增', type: 'checkbox', editable: true, style: 'min-width: 100px' },
    { field: 'cap_item', header: '扣款代號', type: 'text', editable: false, style: 'min-width: 120px' },
    { field: 'cap_name', header: '扣款名稱', type: 'text', editable: false, style: 'min-width: 150px' },
    { field: 'tpy_bdate', header: '扣款起始年月', type: 'date', editable: true, style: 'min-width: 150px' },
    { field: 'tpy_edate', header: '扣款結束年月', type: 'date', editable: true, style: 'min-width: 150px' },
    { field: 'tpy_type', header: '單位', type: 'text', editable: true, style: 'min-width: 100px' },
    { field: 'tpy_rate', header: '比率或元', type: 'number', editable: true, style: 'min-width: 120px' },
    {
      field: 'org_id',
      header: '組織',
      type: 'dropdown',
      editable: true,
      style: 'min-width: 100px',
      options: [
        { label: '102220', value: '102220' },
        { label: '102221', value: '102221' },
        { label: '102222', value: '102222' }
      ]
    },
    {
      field: 'gui_flag',
      header: '是否開立發票',
      type: 'dropdown',
      editable: true,
      style: 'min-width: 130px',
      options: [
        { label: '開立', value: 'Y' },
        { label: '未開立', value: 'N' }
      ]
    }
  ];

  // 表格欄位定義 - E 類型（活動扣款）- 與 D 類型相同
  deductionEColumns: ColumnDef[] = [
    { field: 'isNew', header: '是否新增', type: 'checkbox', editable: true, style: 'min-width: 100px' },
    { field: 'cap_item', header: '扣款代號', type: 'text', editable: false, style: 'min-width: 120px' },
    { field: 'cap_name', header: '扣款名稱', type: 'text', editable: false, style: 'min-width: 150px' },
    { field: 'tpy_bdate', header: '扣款起始年月', type: 'date', editable: true, style: 'min-width: 150px' },
    { field: 'tpy_edate', header: '扣款結束年月', type: 'date', editable: true, style: 'min-width: 150px' },
    { field: 'tpy_type', header: '單位', type: 'text', editable: true, style: 'min-width: 100px' },
    { field: 'tpy_rate', header: '比率或元', type: 'number', editable: true, style: 'min-width: 120px' },
    {
      field: 'org_id',
      header: '組織',
      type: 'dropdown',
      editable: true,
      style: 'min-width: 100px',
      options: [
        { label: '102220', value: '102220' },
        { label: '102221', value: '102221' },
        { label: '102222', value: '102222' }
      ]
    },
    {
      field: 'gui_flag',
      header: '是否開立發票',
      type: 'dropdown',
      editable: true,
      style: 'min-width: 130px',
      options: [
        { label: '開立', value: 'Y' },
        { label: '未開立', value: 'N' }
      ]
    }
  ];

  // 資料陣列
  // 原始資料（用於篩選）
  originalFareData: { [key: string]: FareItem[] } = {
    'A': [],
    'B': [],
    'C': [],
    'D': [],
    'E': []
  };

  // 顯示的資料（篩選後）
  fareData: { [key: string]: FareItem[] } = {
    'A': [],
    'B': [],
    'C': [],
    'D': [],
    'E': []
  };

  dataForm = this.formBuilder.group({});

  constructor(
    private tls13010Service: TLS13010Service,
    private contractFlowService: ContractFlowService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS13010', this.dataForm);
    this.loadWorkflowData();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // 載入工作流程資料
  private loadWorkflowData(): void {
    const workflowData = this.contractFlowService.getCurrentData();
    console.log('載入工作流程資料:', workflowData);

    if (workflowData.queryRowData?.talent_id) {
      this.currentTalentId = workflowData.queryRowData.talent_id;
      this.currentContractData = workflowData.queryRowData;

      // 載入已暫存的扣款資料
      const savedFareData = this.contractFlowService.getStepData(WorkflowStep.DEDUCTION);
      if (savedFareData && Object.keys(savedFareData).length > 0) {
        console.log('載入已暫存的扣款資料:', savedFareData);
        this.originalFareData = savedFareData;
        this.filterData();
      } else {
        // 沒有暫存資料，從 API 載入
        this.loadFareDataFromAPI();
      }
    } else {
      console.warn('沒有 talent_id，重導向到前一步');
      this.router.navigate(['/TLS/TLS13010CRU']);
    }
  }

  // 從 API 載入扣款資料
  private loadFareDataFromAPI(): void {
    if (!this.currentTalentId) {
      console.warn('沒有 talent_id，無法載入扣款資料');
      return;
    }

    this.loading = true;
    this.messageService.blockUi();

    const subscription = this.tls13010Service.queryTLS13010Fare(this.currentTalentId).subscribe({
      next: (response) => {
        console.log('API 回傳的扣款資料:', response);

        if (response && response.Data && response.Data.FaresByType) {
          // 轉換 API 資料格式
          this.originalFareData = this.transformApiData(response.Data.FaresByType);
          this.filterData();
          this.saveFareDataToWorkflow();
          this.messageService.successBubble('扣款資料載入成功');
        } else {
          console.log('API 沒有回傳扣款資料');
          this.messageService.infoBubble('沒有找到既有的扣款資料');
          // 這裡不載入假資料，保持空白狀態
          this.originalFareData = {
            'A': [],
            'B': [],
            'C': [],
            'D': [],
            'E': []
          };
          this.filterData();
        }

        this.loading = false;
        this.messageService.unblockUi();
      },
      error: (error) => {
        console.error('載入扣款資料失敗:', error);
        this.messageService.warnBubble('載入扣款資料失敗');
        this.loading = false;
        this.messageService.unblockUi();

        // 發生錯誤時也保持空白狀態
        this.originalFareData = {
          'A': [],
          'B': [],
          'C': [],
          'D': [],
          'E': []
        };
        this.filterData();
      }
    });

    this.subscriptions.push(subscription);
  }

  // 轉換 API 資料格式
  private transformApiData(apiData: any): { [key: string]: FareItem[] } {
    const transformed: { [key: string]: FareItem[] } = {
      'A': [],
      'B': [],
      'C': [],
      'D': [],
      'E': []
    };

    Object.keys(apiData).forEach(capType => {
      if (transformed[capType] && Array.isArray(apiData[capType])) {
        transformed[capType] = apiData[capType].map((item: any, index: number) => ({
          id: item.id || `${capType}_${index}_${Date.now()}`,
          serialNumber: index + 1,
          isNew: false, // 從 API 載入的都是既有資料
          cap_item: item.cap_item || '',
          cap_name: item.cap_name || '',
          tpy_bdate: item.tpy_bdate || '',
          tpy_edate: item.tpy_edate || '',
          tpy_type: item.tpy_type || '',
          tpy_qty: item.tpy_qty || 0,
          tpy_unitamt: item.tpy_unitamt || 0,
          tpy_amount: item.tpy_amount || 0,
          tpy_totalamt: item.tpy_totalamt || 0,
          day_account: item.day_account || 'N',
          interval: item.interval || 1,
          down_payment: item.down_payment || 0,
          period_nos: item.period_nos || 0,
          tpy_1stamt: item.tpy_1stamt || 0,
          cap_saletype: item.cap_saletype || '',
          edc_bank: item.edc_bank || '',
          instms_type: item.instms_type || '',
          pay_no: item.pay_no || '',
          gui_flag: item.gui_flag || 'Y',
          tpy_rate: item.tpy_rate || 0,
          org_id: item.org_id || '102220',
          is_commonly_used: item.is_commonly_used || 'N',
          _status: 'original'
        }));
      }
    });

    console.log('轉換後的資料:', transformed);
    return transformed;
  }

  // 篩選資料的方法
  filterData(): void {
    Object.keys(this.originalFareData).forEach(capType => {
      if (this.showOnlySelected) {
        // 只顯示已勾選的項目
        this.fareData[capType] = this.originalFareData[capType].filter(item => item.isNew);
      } else if (this.showOnlyCommonlyUsed) {
        // 只顯示常用項目
        this.fareData[capType] = this.originalFareData[capType].filter(item => item.is_commonly_used === 'Y');
      } else {
        // 顯示所有項目
        this.fareData[capType] = [...this.originalFareData[capType]];
      }
    });

    console.log('篩選後的資料:', this.fareData);
  }

  // 暫存扣款資料到工作流程
  private saveFareDataToWorkflow(): void {
    this.contractFlowService.saveStep2Data(this.originalFareData);
    console.log('已暫存扣款資料到工作流程');
  }

  // 切換顯示模式的方法
  toggleCommonlyUsed(): void {
    this.showOnlyCommonlyUsed = !this.showOnlyCommonlyUsed;
    this.showOnlySelected = false;
    this.filterData();
  }

  toggleSelectedOnly(): void {
    this.showOnlySelected = !this.showOnlySelected;
    this.showOnlyCommonlyUsed = false;
    this.filterData();
  }

  showAllItems(): void {
    this.showOnlyCommonlyUsed = false;
    this.showOnlySelected = false;
    this.filterData();
  }

  // 獲取顯示按鈕的文字
  getToggleCommonlyUsedText(): string {
    return this.showOnlyCommonlyUsed ? '顯示全部項目' : '僅顯示常用項目';
  }

  getToggleSelectedText(): string {
    return this.showOnlySelected ? '顯示全部項目' : '僅顯示已勾選項目';
  }

  // 各類型的全選與取消選擇方法
  selectAllByType(capType: string): void {
    this.fareData[capType].forEach(item => item.isNew = true);
    this.updateOriginalData(capType);
    this.saveFareDataToWorkflow();
  }

  deselectAllByType(capType: string): void {
    this.fareData[capType].forEach(item => item.isNew = false);
    this.updateOriginalData(capType);
    this.saveFareDataToWorkflow();
  }

  // 更新原始資料中的選取狀態
  private updateOriginalData(capType: string): void {
    this.fareData[capType].forEach(displayItem => {
      const originalItem = this.originalFareData[capType].find(item => item.id === displayItem.id);
      if (originalItem) {
        originalItem.isNew = displayItem.isNew;
      }
    });
  }

  // 表格事件處理
  onFareTableSave(event: { oldData: any, newData: any }, capType: string): void {
    const { newData } = event;

    // 標記狀態
    if (newData._status === 'original') {
      newData._status = 'modified';
    }

    // 更新原始資料
    const originalIndex = this.originalFareData[capType].findIndex(item => item.id === newData.id);
    if (originalIndex > -1) {
      this.originalFareData[capType][originalIndex] = { ...newData };
    }

    console.log(`${capType} 類型扣款資料已更新:`, newData);
    this.saveFareDataToWorkflow();
    this.messageService.successBubble('扣款資料已儲存');
  }

  onFareTableEdit(rowData: any, capType: string): void {
    console.log(`開始編輯 ${capType} 類型扣款資料:`, rowData);
  }

  onFareTableCancel(rowData: any, capType: string): void {
    console.log(`取消編輯 ${capType} 類型扣款資料:`, rowData);
  }

  // 處理項目選擇變更
  onItemSelectionChange(capType: string): void {
    this.updateOriginalData(capType);
    this.saveFareDataToWorkflow();
  }

  // 獲取已選擇項目數量
  getSelectedCount(capType: string): number {
    return this.fareData[capType].filter(item => item.isNew).length;
  }

  // 獲取總項目數量
  getTotalCount(capType: string): number {
    return this.fareData[capType].length;
  }

  // 獲取扣款類型的中文名稱
  getCapTypeName(capType: string): string {
    const typeNames: { [key: string]: string } = {
      'A': '一次扣款',
      'B': '每月扣款',
      'C': '平均分攤',
      'D': '比率分攤',
      'E': '活動扣款'
    };
    return typeNames[capType] || capType;
  }

  // 獲取對應的表格欄位定義
  getColumnsForType(capType: string): ColumnDef[] {
    switch (capType) {
      case 'A': return this.deductionAColumns;
      case 'B': return this.deductionBColumns;
      case 'C': return this.deductionCColumns;
      case 'D': return this.deductionDColumns;
      case 'E': return this.deductionEColumns;
      default: return [];
    }
  }

  // 導航相關方法
  onSubmitNext(): void {
    // 確保最新資料已暫存
    this.saveFareDataToWorkflow();

    // 檢查是否有勾選的項目
    const hasSelectedItems = Object.keys(this.originalFareData).some(capType =>
      this.originalFareData[capType].some(item => item.isNew)
    );

    if (!hasSelectedItems) {
      this.messageService.warnBubble('請至少選擇一個扣款項目');
      return;
    }

    this.router.navigate(['TLS/TLS13010NEXT2']);
    this.messageService.infoBubble('進入下一步：抽成設定');
  }

  override onCancel(): void {
    if (confirm('是否要離開此頁面？未儲存的變更將會遺失。')) {
      this.router.navigate(['/TLS/TLS13010CRU']);
    }
  }

  // 表單提交相關方法
  submitForm(frm: FormGroup): void {
    this.onSubmit(frm);
  }

  onSubmit(frm: FormGroup): void {
    this.submitted = true;
    this.loading = true;
    this.messageService.blockUi();

    if (frm.valid && this.canQuery()) {
      console.log('扣款資料提交:', this.originalFareData);
      this.saveFareDataToWorkflow();
      this.messageService.successBubble('扣款資料已儲存');
    }

    this.loading = false;
    this.messageService.unblockUi();
  }

  canQuery(): boolean {
    return true;
  }

  // 匯出給模板使用的變數
  get capTypes(): string[] {
    return ['A', 'B', 'C', 'D', 'E'];
  }

  // 檢查是否有資料變更
  hasUnsavedChanges(): boolean {
    return Object.keys(this.originalFareData).some(capType =>
      this.originalFareData[capType].some(item =>
        item._status === 'new' || item._status === 'modified' || item._status === 'deleted'
      )
    );
  }

  // 重新載入資料
  reloadData(): void {
    if (confirm('確定要重新載入資料嗎？未儲存的變更將會遺失。')) {
      this.loadFareDataFromAPI();
      this.messageService.infoBubble('已重新載入資料');
    }
  }

  // 儲存所有變更
  saveAllChanges(): void {
    this.saveFareDataToWorkflow();
    this.messageService.successBubble('所有變更已儲存');
  }

  // 檢查是否有資料可顯示
  hasAnyData(): boolean {
    return Object.keys(this.originalFareData).some(capType =>
      this.originalFareData[capType].length > 0
    );
  }

  // 獲取總選擇項目數
  getTotalSelectedCount(): number {
    return Object.keys(this.originalFareData).reduce((total, capType) =>
      total + this.getSelectedCount(capType), 0
    );
  }

  // 獲取總項目數
  getTotalItemCount(): number {
    return Object.keys(this.originalFareData).reduce((total, capType) =>
      total + this.getTotalCount(capType), 0
    );
  }

  // 檢查特定類型是否有資料
  hasDataForType(capType: string): boolean {
    return this.fareData[capType] && this.fareData[capType].length > 0;
  }

  // 獲取目前顯示模式描述
  getCurrentDisplayMode(): string {
    if (this.showOnlyCommonlyUsed) {
      return '僅常用項目';
    } else if (this.showOnlySelected) {
      return '僅已勾選項目';
    } else {
      return '全部項目';
    }
  }
}
