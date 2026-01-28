import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, OnDestroy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ButtonModule } from 'primeng/button';

import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { ExpandableEditTableComponent, ColumnDef } from '@shared/componentkit/expandable-edit-table/expandable-edit-table.component';

import { CommissionItem, ChargeDetail, YearChargeDetail, LevelChargeDetail } from '../../../../core/models/commission/commission-item.interface';
import { ContractInfo } from '../../../../core/models/contract/contract-info.interface';
import { SharedDropdownService } from '@shared/services/shared-dropdown.service';
import { Subscription } from 'rxjs';

interface TabOption {
  id: string;
  label: string;
  allowAdd: boolean;
  allowBatchDelete: boolean;
  showCheckbox: boolean;
}

@Component({
  selector: 'app-step3-commission',
  templateUrl: './step3-commission.component.html',
  styleUrls: ['./step3-commission.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    AccordionModule,
    DialogModule,
    ProgressSpinnerModule,
    ButtonModule,
    ButtonComponent,
    ExpandableEditTableComponent
  ]
})
export class Step3CommissionComponent implements OnInit, OnDestroy {
  @Input() commissionItems: CommissionItem[] = [];
  @Input() contractInfo: ContractInfo | null = null;
  @Input() isViewMode = false;

  @Output() dataChange = new EventEmitter<CommissionItem[]>();

  private subscriptions: Subscription[] = [];

  // 合約資訊顯示
  contractInfoData: any[] = [];
  contractInfoColumns: ColumnDef[] = [
    { field: 'apply_no', header: '專櫃招募編號', type: 'text', editable: false },
    { field: 'tlt_no', header: '專櫃編號', type: 'text', editable: false },
    { field: 'tlt_name', header: '櫃位名稱', type: 'text', editable: false },
    { field: 'VEN_Name', header: '廠商名稱', type: 'text', editable: false },
    { field: 'tlt_term_type_desc', header: '抽成別', type: 'text', editable: false },
    { field: 'tlt_bdate', header: '契約起始日', type: 'text', editable: false },
    { field: 'tlt_edate', header: '契約截止日', type: 'text', editable: false }
  ];

  // 抽成主表欄位
  commissionColumns: ColumnDef[] = [
    { field: 'tlt_id_desc', header: '銷售類別', type: 'dropdown', editable: true, style: 'min-width: 150px', options: [] },
    { field: 'cag_bdate', header: '開始日期', type: 'date', editable: true, style: 'min-width: 120px' },
    { field: 'cag_edate', header: '結束日期', type: 'date', editable: true, style: 'min-width: 120px' },
    { field: 'cag_taxtype', header: '稅別', type: 'dropdown', editable: true, style: 'min-width: 100px', options: [] },
    { field: 'sst_amount', header: '底抽金額', type: 'number', editable: true, style: 'min-width: 120px' },
    { field: 'sst_rate', header: '底抽%數', type: 'number', editable: true, style: 'min-width: 100px' },
    { field: 'remark', header: '折扣摘要', type: 'text', editable: false, style: 'min-width: 200px' }
  ];

  // 折扣設定明細欄位
  discountColumns: ColumnDef[] = [
    { field: 'is_enabled', header: '選用', type: 'checkbox', editable: true, style: 'width: 60px' },
    { field: 'barcode_desc', header: '折扣項目', type: 'text', editable: false },
    { field: 'tlt_bdate', header: '開始日期', type: 'date', editable: true },
    { field: 'tlt_edate', header: '結束日期', type: 'date', editable: true },
    { field: 'cag_charge_rate', header: '抽成%數', type: 'number', editable: true }
  ];

  // 年度業績抽成明細欄位
  annualColumns: ColumnDef[] = [
    { field: 'tlt_bdate', header: '開始日期', type: 'date', editable: true },
    { field: 'tlt_edate', header: '結束日期', type: 'date', editable: true },
    { field: 'year_amount', header: '年度業績金額', type: 'number', editable: true },
    { field: 'extra_rate', header: '額外抽成%數', type: 'number', editable: true }
  ];

  // 層級抽成明細欄位
  levelColumns: ColumnDef[] = [
    { field: 'is_enabled', header: '選用', type: 'checkbox', editable: true, style: 'width: 60px' },
    { field: 'barcode_desc', header: '層級項目', type: 'text', editable: false },
    { field: 'seq_no', header: '層級序號', type: 'number', editable: false },
    { field: 'level_bmount', header: '業績起始金額', type: 'number', editable: true },
    { field: 'level_eamount', header: '業績結束金額', type: 'number', editable: true },
    { field: 'level_charge_rate', header: '抽成%數', type: 'number', editable: true }
  ];

  // 明細頁籤設定
  settingTabs: TabOption[] = [
    { id: 'discount', label: '折扣設定', allowAdd: true, allowBatchDelete: true, showCheckbox: true },
    { id: 'annual', label: '年度業績', allowAdd: true, allowBatchDelete: true, showCheckbox: true },
    { id: 'level', label: '層級抽成', allowAdd: true, allowBatchDelete: true, showCheckbox: true }
  ];

  // 處理後的資料
  processedCommissionData: any[] = [];

  // 狀態
  loading = false;
  dataLoaded = true;
  commissionDataLoaded = true;
  showConfirmDialog = false;

  // 選項
  salesTypeOptions: any[] = [];
  taxTypeOptions: any[] = [];

  constructor(
    private sharedDropdownService: SharedDropdownService
  ) {
    // 初始化稅別選項
    this.taxTypeOptions = [
      { label: '應稅', value: '1' },
      { label: '免稅', value: '0' }
    ];
  }

  ngOnInit(): void {
    this.loadDropdownOptions();
    this.updateContractInfoDisplay();
    this.processCommissionData();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * 載入下拉選項
   */
  private loadDropdownOptions(): void {
    // 設定銷售類別選項 (從 T109 系統參數載入，這裡先用預設值)
    this.salesTypeOptions = [
      { label: '01-正常銷售', value: '01' },
      { label: '02-退貨', value: '02' },
      { label: '03-折扣', value: '03' }
    ];

    // 更新欄位選項
    const salesTypeColumn = this.commissionColumns.find(c => c.field === 'tlt_id_desc');
    if (salesTypeColumn) {
      salesTypeColumn.options = this.salesTypeOptions;
    }

    const taxTypeColumn = this.commissionColumns.find(c => c.field === 'cag_taxtype');
    if (taxTypeColumn) {
      taxTypeColumn.options = this.taxTypeOptions;
    }
  }

  /**
   * 更新合約資訊顯示
   */
  private updateContractInfoDisplay(): void {
    if (this.contractInfo) {
      this.contractInfoData = [{
        ...this.contractInfo,
        tlt_term_type_desc: this.getCommissionTypeDesc(this.contractInfo.tlt_term_type || '')
      }];
    }
  }

  /**
   * 取得抽成別描述
   */
  private getCommissionTypeDesc(type: string): string {
    const typeMap: { [key: string]: string } = {
      '1': '固定租金',
      '2': '底抽取高',
      '3': '一般抽成',
      '4': '底抽',
      '5': '級距抽成',
      '6': '底抽加層級'
    };
    return typeMap[type] || type;
  }

  /**
   * 處理抽成資料（加入 detailItems 用於表格顯示）
   */
  private processCommissionData(): void {
    this.processedCommissionData = this.commissionItems
      .filter(item => item._status !== 'deleted')
      .map(item => ({
        ...item,
        detailItems: this.getDetailItemsForTab('discount', item),
        remark: this.generateDiscountRemark(item)
      }));
  }

  /**
   * 取得對應頁籤的明細資料
   */
  private getDetailItemsForTab(tabValue: string, item: CommissionItem): any[] {
    switch (tabValue) {
      case 'discount':
        return item.ChargeDetails?.filter(d => d._status !== 'deleted') || [];
      case 'annual':
        return item.YearChargeDetails?.filter(d => d._status !== 'deleted') || [];
      case 'level':
        return item.LevelChargeDetails?.filter(d => d._status !== 'deleted') || [];
      default:
        return [];
    }
  }

  /**
   * 產生折扣摘要
   */
  private generateDiscountRemark(item: CommissionItem): string {
    const enabledDiscounts = item.ChargeDetails?.filter(d => d.is_enabled && d._status !== 'deleted') || [];
    if (enabledDiscounts.length === 0) return '';

    return enabledDiscounts.map(d => d.barcode_desc).join(', ');
  }

  /**
   * 檢查是否有抽成資料
   */
  hasCommissionData(): boolean {
    return this.commissionItems.some(item => item._status !== 'deleted');
  }

  /**
   * 取得抽成項目數量
   */
  getCommissionItemCount(): number {
    return this.commissionItems.filter(item => item._status !== 'deleted').length;
  }

  /**
   * 新增抽成項目
   */
  onAddCommissionItem(): void {
    const newItem: CommissionItem = {
      id: `temp_${Date.now()}`,
      apply_no: this.contractInfo?.apply_no || '',
      tlt_id: '',
      tlt_id_desc: '',
      cag_bdate: this.contractInfo?.tlt_contract_bdate || '',
      cag_edate: this.contractInfo?.tlt_contract_edate || '',
      cag_taxtype: '1',
      sst_amount: 0,
      sst_rate: 0,
      cap_saletype1: 'N',
      cap_saletype2: 'N',
      cap_saletype3: 'N',
      cap_saletype5: 'N',
      cag_remark: '',
      ChargeDetails: [],
      YearChargeDetails: [],
      LevelChargeDetails: [],
      _status: 'new'
    };

    this.commissionItems.push(newItem);
    this.processCommissionData();
    this.emitDataChange();
  }

  /**
   * 新增明細項目
   */
  onAddDetailItem(event: any): void {
    const { masterId, tabValue } = event;
    const masterItem = this.commissionItems.find(item => item.id === masterId);
    if (!masterItem) return;

    switch (tabValue) {
      case 'discount':
        const newDiscount: ChargeDetail = {
          id: Date.now(),
          apply_no: masterItem.apply_no,
          tlt_id: masterItem.tlt_id,
          cag_barcode: '',
          barcode_desc: '',
          is_configured: false,
          is_enabled: true,
          _status: 'new'
        };
        if (!masterItem.ChargeDetails) masterItem.ChargeDetails = [];
        masterItem.ChargeDetails.push(newDiscount);
        break;
      case 'annual':
        const newAnnual: YearChargeDetail = {
          id: Date.now(),
          apply_no: masterItem.apply_no,
          tlt_id: masterItem.tlt_id,
          tlt_bdate: masterItem.cag_bdate,
          tlt_edate: masterItem.cag_edate,
          year_amount: 0,
          extra_rate: 0,
          _status: 'new'
        };
        if (!masterItem.YearChargeDetails) masterItem.YearChargeDetails = [];
        masterItem.YearChargeDetails.push(newAnnual);
        break;
      case 'level':
        const newLevel: LevelChargeDetail = {
          id: Date.now(),
          apply_no: masterItem.apply_no,
          tlt_id: masterItem.tlt_id,
          seq_no: (masterItem.LevelChargeDetails?.length || 0) + 1,
          cag_barcode: '',
          barcode_desc: '',
          is_enabled: true,
          _status: 'new'
        };
        if (!masterItem.LevelChargeDetails) masterItem.LevelChargeDetails = [];
        masterItem.LevelChargeDetails.push(newLevel);
        break;
    }

    if (masterItem._status !== 'new') {
      masterItem._status = 'modified';
    }

    this.processCommissionData();
    this.emitDataChange();
  }

  /**
   * 主表欄位變更
   */
  onFieldChange(event: any): void {
    const { fieldName, newValue, rowData } = event;
    const item = this.commissionItems.find(i => i.id === rowData.id);
    if (item) {
      (item as any)[fieldName] = newValue;
      if (item._status !== 'new') {
        item._status = 'modified';
      }
      this.processCommissionData();
      this.emitDataChange();
    }
  }

  /**
   * 明細欄位變更
   */
  onDetailFieldChange(event: any): void {
    const { fieldName, newValue, rowData, masterId } = event;
    const masterItem = this.commissionItems.find(i => i.id === masterId);
    if (!masterItem) return;

    // 更新明細資料
    const detailTypes = ['ChargeDetails', 'YearChargeDetails', 'LevelChargeDetails'] as const;
    for (const type of detailTypes) {
      const detailArray = masterItem[type];
      if (!detailArray) continue;
      const detail = detailArray.find((d: any) => d.id === rowData.id);
      if (detail) {
        (detail as any)[fieldName] = newValue;
        if ((detail as any)._status !== 'new') {
          (detail as any)._status = 'modified';
        }
        break;
      }
    }

    if (masterItem._status !== 'new') {
      masterItem._status = 'modified';
    }

    this.processCommissionData();
    this.emitDataChange();
  }

  /**
   * 明細頁籤變更
   */
  onDetailTabChange(event: any): void {
    const { masterId, tabValue } = event;
    const masterItem = this.processedCommissionData.find(item => item.id === masterId);
    if (masterItem) {
      const originalItem = this.commissionItems.find(i => i.id === masterId);
      if (originalItem) {
        masterItem.detailItems = this.getDetailItemsForTab(tabValue, originalItem);
      }
    }
  }

  /**
   * 主表項目編輯
   */
  onItemEdit(event: any): void {
    // 編輯模式進入
  }

  /**
   * 主表項目儲存
   */
  onItemSave(event: any): void {
    const { row } = event;
    const item = this.commissionItems.find(i => i.id === row.id);
    if (item && item._status !== 'new') {
      item._status = 'modified';
    }
    this.emitDataChange();
  }

  /**
   * 主表項目取消
   */
  onItemCancel(event: any): void {
    this.processCommissionData();
  }

  /**
   * 明細編輯
   */
  onDetailEdit(event: any): void {
    // 編輯模式進入
  }

  /**
   * 明細儲存
   */
  onDetailSave(event: any): void {
    this.emitDataChange();
  }

  /**
   * 儲存前處理
   */
  onBeforeDetailSave(event: any): void {
    // 驗證等處理
  }

  /**
   * 明細取消
   */
  onDetailCancel(event: any): void {
    this.processCommissionData();
  }

  /**
   * 批次刪除主表項目
   */
  onBatchDelete(items: any[]): void {
    items.forEach(item => {
      const masterItem = this.commissionItems.find(i => i.id === item.id);
      if (masterItem) {
        if (masterItem._status === 'new') {
          const index = this.commissionItems.indexOf(masterItem);
          this.commissionItems.splice(index, 1);
        } else {
          masterItem._status = 'deleted';
        }
      }
    });
    this.processCommissionData();
    this.emitDataChange();
  }

  /**
   * 批次刪除明細項目
   */
  onDetailBatchDelete(event: any): void {
    const { masterId, items } = event;
    const masterItem = this.commissionItems.find(i => i.id === masterId);
    if (!masterItem) return;

    items.forEach((item: any) => {
      const detailTypes = ['ChargeDetails', 'YearChargeDetails', 'LevelChargeDetails'] as const;
      for (const type of detailTypes) {
        const detailArray = masterItem[type];
        if (!detailArray) continue;
        const detail = detailArray.find((d: any) => d.id === item.id);
        if (detail) {
          if ((detail as any)._status === 'new') {
            const index = detailArray.indexOf(detail as any);
            detailArray.splice(index, 1);
          } else {
            (detail as any)._status = 'deleted';
          }
          break;
        }
      }
    });

    if (masterItem._status !== 'new') {
      masterItem._status = 'modified';
    }

    this.processCommissionData();
    this.emitDataChange();
  }

  /**
   * 下拉選單變更
   */
  onDropdownChange(event: any): void {
    this.onFieldChange(event);
  }

  /**
   * 明細按鈕點擊
   */
  onDetailButtonClick(event: any): void {
    // 處理按鈕點擊事件
  }

  /**
   * 發送資料變更事件
   */
  private emitDataChange(): void {
    this.dataChange.emit([...this.commissionItems]);
  }
}
