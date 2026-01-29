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
import { DataStatus } from '../../../../core/constants/workflow-step.enum';
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
  @Input() discountOptions: any[] = [];

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
    { field: 'tlt_id', header: '抽成類別', editable: false },
    { field: 'tlt_id_desc', header: '抽成類別名稱', editable: true, type: 'text' },
    { field: 'cag_taxtype', header: '稅別', editable: true, type: 'dropdown', options: [] },
    { field: 'sst_amount', header: '單筆交易金額(含)以上', editable: true, type: 'number' },
    { field: 'sst_rate', header: '特價抽成(%)', editable: true, type: 'number', allowDecimal: true, decimalPlaces: 3 },
    {
      field: 'remark',
      header: '折扣摘要',
      type: 'textarea',
      editable: false,
      style: 'max-width: 250px; white-space: pre-wrap; word-break: break-word; text-align: left;'
    },
    { field: 'cap_saletype2', header: '會員卡集點', editable: true, type: 'checkbox' },
    { field: 'cap_saletype1', header: '滿件送佰', editable: true, type: 'checkbox' },
    { field: 'cap_saletype3', header: '收取禮卷', editable: true, type: 'checkbox' },
    { field: 'cap_saletype5', header: '收取商品提貨單', editable: true, type: 'checkbox' }
  ];

  // 折扣設定明細欄位
  discountColumns: ColumnDef[] = [
    { field: 'is_selected', header: '是否新增', type: 'checkbox', editable: true, style: 'width: 80px' },
    { field: 'barcode_desc', header: '折扣別', type: 'text', editable: false },
    { field: 'tlt_bdate', header: '合約起始日', type: 'date', editable: true },
    { field: 'tlt_edate', header: '合約終止日', type: 'date', editable: true },
    { field: 'cag_charge_rate', header: '抽成率(%)', type: 'number', editable: true }
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
    { field: 'is_selected', header: '是否新增', type: 'checkbox', editable: true, style: 'width: 80px' },
    { field: 'barcode_desc', header: '折扣別', type: 'text', editable: false },
    { field: 'contract_period', header: '合約期間', type: 'text', editable: false },
    { field: 'level_bmount', header: '業績計算金額(起)', type: 'number', editable: true },
    { field: 'level_eamount', header: '業績計算金額(迄)', type: 'number', editable: true },
    { field: 'level_charge_rate', header: '抽成率(%)', type: 'number', editable: true }
  ];

  // 明細頁籤設定
  settingTabs: TabOption[] = [
    { id: 'discount', label: '折扣設定', allowAdd: false, allowBatchDelete: false, showCheckbox: false },
    { id: 'level', label: '折扣別層級抽成設定', allowAdd: false, allowBatchDelete: false, showCheckbox: false },
    { id: 'annual', label: '年度總業績抽成設定', allowAdd: true, allowBatchDelete: true, showCheckbox: true }
  ];

  // 當前內層分頁
  selectedSettingTab = 'discount';

  // 處理後的資料
  processedCommissionData: any[] = [];

  // 狀態
  loading = false;
  dataLoaded = true;
  commissionDataLoaded = true;
  showConfirmDialog = false;

  // 選項
  taxTypeOptions: any[] = [];

  constructor(
    private sharedDropdownService: SharedDropdownService
  ) {
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

  // ========== 下拉選項 ==========
  private loadDropdownOptions(): void {
    const taxTypeColumn = this.commissionColumns.find(c => c.field === 'cag_taxtype');
    if (taxTypeColumn) {
      taxTypeColumn.options = this.taxTypeOptions;
    }
  }

  // ========== 合約資訊 ==========
  private updateContractInfoDisplay(): void {
    if (this.contractInfo) {
      this.contractInfoData = [{
        ...this.contractInfo,
        tlt_term_type_desc: this.getCommissionTypeDesc(this.contractInfo.tlt_term_type || '')
      }];
    }
  }

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

  // ========== 資料處理 ==========

  /**
   * 處理抽成資料（加入 detailItems 用於表格顯示）
   */
  processCommissionData(): void {
    this.processedCommissionData = this.commissionItems
      .filter(item => item._status !== 'deleted')
      .map(item => {
        const processedItem: any = {
          ...item,
          cap_saletype1: item.cap_saletype1 === 'Y',
          cap_saletype2: item.cap_saletype2 === 'Y',
          cap_saletype3: item.cap_saletype3 === 'Y',
          cap_saletype5: item.cap_saletype5 === 'Y',
          remark: this.formatRemarkText(item)
        };

        // 根據當前分頁設定 detailItems
        processedItem.detailItems = this.getDetailItemsForTab(this.selectedSettingTab, item);

        return processedItem;
      });
  }

  /**
   * 取得對應頁籤的明細資料
   */
  private getDetailItemsForTab(tabValue: string, item: CommissionItem): any[] {
    switch (tabValue) {
      case 'discount':
        return (item.ChargeDetails || [])
          .filter(d => d._status !== 'deleted')
          .map(d => ({ ...d, _originalType: 'discount' }));

      case 'level': {
        // Level 只顯示對應已勾選 discount 的項目
        const selectedDiscountIds = new Set(
          (item.ChargeDetails || [])
            .filter(d => (d as any).is_selected && d._status !== 'deleted')
            .map(d => d.id)
        );

        return (item.LevelChargeDetails || [])
          .filter(d => d._status !== 'deleted' && d.charged_id && selectedDiscountIds.has(d.charged_id))
          .map(d => {
            const correspondingDiscount = (item.ChargeDetails || []).find(cd => cd.id === d.charged_id);
            return {
              ...d,
              _originalType: 'level',
              is_selected: true,
              contract_period: this.formatContractPeriod(correspondingDiscount?.tlt_bdate, correspondingDiscount?.tlt_edate)
            };
          });
      }

      case 'annual':
        return (item.YearChargeDetails || [])
          .filter(d => d._status !== 'deleted')
          .map(d => ({ ...d, _originalType: 'annual' }));

      default:
        return [];
    }
  }

  // ========== 折扣摘要 ==========

  private formatRemarkText(item: CommissionItem): string {
    const selectedDiscounts = (item.ChargeDetails || [])
      .filter(d => (d as any).is_selected && d._status !== 'deleted');

    if (selectedDiscounts.length === 0) return '';

    return selectedDiscounts
      .sort((a, b) => (a.cag_barcode || '').localeCompare(b.cag_barcode || ''))
      .map(d => {
        const startDate = this.formatDateString(d.tlt_bdate);
        const endDate = this.formatDateString(d.tlt_edate);
        const rate = (d.cag_charge_rate || 0);
        return `${d.cag_barcode}-(${startDate}-${endDate})-${rate}`;
      })
      .join(',');
  }

  private formatDateString(date: any): string {
    if (!date) return '';
    if (date instanceof Date) {
      return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
    }
    return String(date).replace(/-/g, '/');
  }

  private formatContractPeriod(startDate: any, endDate: any): string {
    const start = this.formatDateString(startDate);
    const end = this.formatDateString(endDate);
    if (!start || !end) return '';
    return `${start} ~ ${end}`;
  }

  // ========== 預設項目建立 ==========

  private createDefaultDiscountItems(parentItem: CommissionItem): ChargeDetail[] {
    if (!this.discountOptions || this.discountOptions.length === 0) {
      return [];
    }

    const contractStartDate = this.contractInfo?.tlt_contract_bdate || '';
    const contractEndDate = this.contractInfo?.tlt_contract_edate || '';

    return this.discountOptions.map(option => {
      const isDefault = option.value === '000';
      return {
        id: `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        apply_no: parentItem.apply_no,
        tlt_id: parentItem.tlt_id,
        cag_barcode: option.value,
        tlt_bdate: contractStartDate,
        tlt_edate: contractEndDate,
        cag_charge_rate: 0,
        barcode_desc: option.label || '',
        is_configured: isDefault,
        is_enabled: isDefault,
        is_selected: isDefault,
        _status: 'new' as DataStatus
      } as ChargeDetail;
    });
  }

  private createDefaultLevelItems(parentItem: CommissionItem): LevelChargeDetail[] {
    if (!this.discountOptions || this.discountOptions.length === 0) {
      return [];
    }

    return this.discountOptions.map((option, index) => {
      const correspondingDiscount = (parentItem.ChargeDetails || []).find(
        d => d.cag_barcode === option.value
      );
      const isDefault = option.value === '000';

      return {
        id: `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        charged_id: correspondingDiscount?.id || undefined,
        apply_no: parentItem.apply_no,
        tlt_id: parentItem.tlt_id,
        seq_no: index + 1,
        cag_barcode: option.value,
        level_bmount: 0,
        level_eamount: 0,
        level_charge_rate: 0,
        barcode_desc: option.label || '',
        is_configured: isDefault,
        is_enabled: isDefault,
        is_selected: isDefault,
        _status: 'new' as DataStatus
      } as LevelChargeDetail;
    });
  }

  private generateNewTltId(): string {
    const existingIds = this.commissionItems
      .filter(item => item._status !== 'deleted')
      .map(item => parseInt(item.tlt_id))
      .filter(id => !isNaN(id))
      .sort((a, b) => a - b);

    for (let i = 0; i <= 9; i++) {
      if (!existingIds.includes(i)) {
        return i.toString();
      }
    }
    return '0';
  }

  // ========== 狀態查詢 ==========

  hasCommissionData(): boolean {
    return this.commissionItems.some(item => item._status !== 'deleted');
  }

  getCommissionItemCount(): number {
    return this.commissionItems.filter(item => item._status !== 'deleted').length;
  }

  // ========== 新增 ==========

  onAddCommissionItem(): void {
    const applyNo = this.contractInfo?.apply_no || '';
    const newTltId = this.generateNewTltId();

    // 先建立 ChargeDetails，再用它來建立 LevelChargeDetails（需要 charged_id 關聯）
    const tempParent: CommissionItem = {
      apply_no: applyNo,
      tlt_id: newTltId
    } as CommissionItem;
    const chargeDetails = this.createDefaultDiscountItems(tempParent);

    const newItem: CommissionItem = {
      id: `temp_${Date.now()}`,
      apply_no: applyNo,
      tlt_id: newTltId,
      tlt_id_desc: '新抽成類別',
      cag_bdate: this.contractInfo?.tlt_contract_bdate || '',
      cag_edate: this.contractInfo?.tlt_contract_edate || '',
      cag_taxtype: '1',
      sst_amount: 0,
      sst_rate: 0,
      cap_saletype1: this.contractInfo?.cap_saletype1 || 'N',
      cap_saletype2: this.contractInfo?.cap_saletype2 || 'N',
      cap_saletype3: this.contractInfo?.cap_saletype3 || 'N',
      cap_saletype5: this.contractInfo?.cap_saletype5 || 'N',
      cag_remark: '',
      ChargeDetails: chargeDetails,
      YearChargeDetails: [],
      LevelChargeDetails: this.createDefaultLevelItems({
        apply_no: applyNo,
        tlt_id: newTltId,
        ChargeDetails: chargeDetails
      } as CommissionItem),
      _status: 'new'
    };

    // 新增時強制切回 discount 分頁
    this.selectedSettingTab = 'discount';

    this.commissionItems.push(newItem);
    this.processCommissionData();
    this.emitDataChange();
  }

  onAddDetailItem(event: any): void {
    const { masterId, tabValue } = event;
    const masterItem = this.commissionItems.find(item => item.id === masterId);
    if (!masterItem) return;

    switch (tabValue) {
      case 'discount': {
        const newDiscount: ChargeDetail = {
          id: `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
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
      }
      case 'annual': {
        const newAnnual: YearChargeDetail = {
          id: `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
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
      }
      case 'level': {
        const newLevel: LevelChargeDetail = {
          id: `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
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
    }

    if (masterItem._status !== 'new') {
      masterItem._status = 'modified';
    }

    this.processCommissionData();
    this.emitDataChange();
  }

  // ========== 欄位變更 ==========

  onFieldChange(event: any): void {
    const { fieldName, newValue, rowData } = event;
    const item = this.commissionItems.find(i => i.id === rowData.id);
    if (item) {
      if (['cap_saletype1', 'cap_saletype2', 'cap_saletype3', 'cap_saletype5'].includes(fieldName)) {
        (item as any)[fieldName] = newValue ? 'Y' : 'N';
      } else {
        (item as any)[fieldName] = newValue;
      }
      if (item._status !== 'new') {
        item._status = 'modified';
      }
      this.processCommissionData();
      this.emitDataChange();
    }
  }

  onDetailFieldChange(event: any): void {
    const { fieldName, newValue, rowData, masterId } = event;
    const masterItem = this.commissionItems.find(i => i.id === masterId);
    if (!masterItem) return;

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

        // discount 的 is_selected 變更時同步 level
        if (type === 'ChargeDetails' && fieldName === 'is_selected') {
          this.syncDiscountSelectionToLevel(masterItem, detail as ChargeDetail, newValue);
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

  private syncDiscountSelectionToLevel(masterItem: CommissionItem, discountItem: ChargeDetail, selected: boolean): void {
    if (!masterItem.LevelChargeDetails) return;

    if (selected) {
      const existingLevel = masterItem.LevelChargeDetails.find(
        l => l.charged_id === discountItem.id && l._status !== 'deleted'
      );
      if (!existingLevel) {
        const newLevel: LevelChargeDetail = {
          id: `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          charged_id: discountItem.id,
          apply_no: masterItem.apply_no,
          tlt_id: masterItem.tlt_id,
          seq_no: masterItem.LevelChargeDetails.length + 1,
          cag_barcode: discountItem.cag_barcode,
          barcode_desc: discountItem.barcode_desc,
          level_bmount: 0,
          level_eamount: 0,
          level_charge_rate: 0,
          is_configured: true,
          is_enabled: true,
          _status: 'new'
        };
        masterItem.LevelChargeDetails.push(newLevel);
      }
    } else {
      masterItem.LevelChargeDetails
        .filter(l => l.charged_id === discountItem.id)
        .forEach(l => { (l as any).is_selected = false; });
    }
  }

  // ========== 頁籤切換 ==========

  onDetailTabChange(event: any): void {
    const { tabValue } = event;
    this.selectedSettingTab = tabValue || 'discount';
    this.processCommissionData();
  }

  // ========== 編輯/儲存/取消 ==========

  onItemEdit(event: any): void { }

  onItemSave(event: any): void {
    const { row } = event;
    const item = this.commissionItems.find(i => i.id === row.id);
    if (item && item._status !== 'new') {
      item._status = 'modified';
    }
    this.emitDataChange();
  }

  onItemCancel(event: any): void {
    this.processCommissionData();
  }

  onDetailEdit(event: any): void { }

  onDetailSave(event: any): void {
    this.emitDataChange();
  }

  onBeforeDetailSave(event: any): void { }

  onDetailCancel(event: any): void {
    this.processCommissionData();
  }

  // ========== 刪除 ==========

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

  // ========== 其他事件 ==========

  onDropdownChange(event: any): void {
    this.onFieldChange(event);
  }

  onDetailButtonClick(event: any): void { }

  // ========== 資料發送 ==========

  private emitDataChange(): void {
    this.dataChange.emit([...this.commissionItems]);
  }
}
