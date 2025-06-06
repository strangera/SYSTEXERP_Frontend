import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { Column } from '../../../shared/componentkit/table/table.model';
import { SelectItem } from 'primeng/api';
import { ColumnDef } from '../../../shared/componentkit/expandable-edit-table/expandable-edit-table.component';

interface CategoryItem {
  id: number;
  CAT_LNo: string;
  CAT_LName: string;
  CAT_LRemark: string | null;
  CRT_USR_No: string | "";
  CRT_USR_Name: string | "";
}

interface InventoryItem {
  recruitmentNumber: string;
  counterNumber: string;
  brandName: string;
  vendorId: string;
  vendorName: string;
  versionNumber: string;
  commissionType: string;
  contractStartDate: string;
  contractEndDate: string;
  operationStartDate: string;
  operationEndDate: string;
}

// 佣金項目接口
interface CommissionItem {
  id: number;
  commissionType: string;
  commissionTypeName: string;
  taxType: number;
  discountSummary: string;
  transactionAmount: number;
  specialCommission: number;
  fullPointActivity: boolean;
  thousandDiscount: boolean;
  selectedSettingOption: string;
  discountSettingItems: DiscountSettingItem[];
  annualPerformanceItems: AnnualPerformanceItem[];
  discountLevelItems: DiscountLevelItem[];
  detailItems: any[];
}

// 折扣設置項目接口
interface DiscountSettingItem {
  selected: boolean;
  discountType: number;
  startDate: Date;
  endDate: Date;
  rate: number;
}

// 年度業績項目接口
interface AnnualPerformanceItem {
  selected: boolean;
  startDate: Date;
  endDate: Date;
  discountAmount: number;
  rate: number;
}

// 折扣等級項目接口
interface DiscountLevelItem {
  selected: boolean;
  discountType: number;
  startAmount: number;
  endAmount: number;
  rate: number;
}

@Component({
  selector: 'app-tls13010-next2',
  templateUrl: './tls13010-next2.component.html',
  styleUrls: ['./tls13010-next2.component.scss']
})
export class TLS13010Next2Component extends BasicCruPageComponent<CategoryItem> implements OnInit {
  @ViewChild('expandedContent') expandedContentTemplate!: TemplateRef<any>;

  dataForm: FormGroup;
  // 頂部選項卡選擇
  selectedSettingTab: string = 'discount';

  // 展開區域表格的動態列定義
  detailColumns: ColumnDef[] = [];

  // 各類型的列定義
  discountColumns: ColumnDef[] = [
    { field: 'selected', header: '選擇', type: 'checkbox', editable: true, },
    { field: 'discountType', header: '折扣別', type: 'dropdown', editable: true, },
    { field: 'startDate', header: '合約起始日', type: 'date', editable: true, },
    { field: 'endDate', header: '合約終止日', type: 'date', editable: true, },
    { field: 'rate', header: '抽成率 (%)', type: 'number', editable: true, }
  ];

  annualColumns: ColumnDef[] = [
    { field: 'selected', header: '選擇', type: 'checkbox', editable: true },
    { field: 'startDate', header: '帳務起', type: 'date', editable: true },
    { field: 'endDate', header: '帳務迄', type: 'date', editable: true },
    { field: 'discountAmount', header: '業績超過金額含', type: 'number', editable: true },
    { field: 'rate', header: '抽成率', type: 'number', editable: true }
  ];

  levelColumns: ColumnDef[] = [
    { field: 'selected', header: '選擇', type: 'checkbox', editable: true },
    { field: 'discountType', header: '折扣別', type: 'dropdown', editable: true },
    { field: 'startAmount', header: '業績計算金額(起)', type: 'number', editable: true },
    { field: 'endAmount', header: '業績計算金額(迄)', type: 'number', editable: true },
    { field: 'rate', header: '抽成率', type: 'number', editable: true }
  ];

  settingOptions: SelectItem[] = [
    { label: '折扣設定', value: 'discount' },
    { label: '年度總業績抽成設定', value: 'annual' },
    { label: '折扣別層級抽成設定', value: 'level' }
  ];

  settingTabs = [
    { id: 'discount', label: '折扣設定' },
    { id: 'annual', label: '年度總業績抽成設定' },
    { id: 'level', label: '折扣別層級抽成設定' }
  ];

  stocksColumns: Column[] = [
    { field: 'recruitmentNumber', header: '專櫃招募編號', visible: true },
    { field: 'counterNumber', header: '專櫃編號', visible: true },
    { field: 'brandName', header: '品牌(專櫃)名稱', visible: true },
    { field: 'vendorId', header: '廠商統編', visible: true },
    { field: 'vendorName', header: '廠商名稱', visible: true },
    { field: 'versionNumber', header: '版本編號', visible: true },
    { field: 'commissionType', header: '抽成別', visible: true },
    { field: 'contractStartDate', header: '合約起始日', visible: true },
    { field: 'contractEndDate', header: '合約終止日', visible: true },
    { field: 'operationStartDate', header: '營運起始日', visible: true },
    { field: 'operationEndDate', header: '營運終止日', visible: true },
  ];

  // 佣金表格列定義
  commissionColumns: ColumnDef[] = [
    { field: 'commissionType', header: '抽成類別', editable: true },
    { field: 'commissionTypeName', header: '抽成類別名稱', editable: true },
    { field: 'taxType', header: '稅別', editable: true },
    { field: 'discountSummary', header: '設定摘要', editable: true },
    { field: 'transactionAmount', header: '單筆交易金額(含)以上', editable: true, type: 'number' },
    { field: 'specialCommission', header: '特價抽成(%)', editable: true, type: 'number' },
    { field: 'fullPointActivity', header: '全館消費滿額集點活動', editable: true, type: 'checkbox' },
    { field: 'thousandDiscount', header: '滿仟送佰', editable: true, type: 'checkbox' },
  ];

  // 數據
  inventoryItems: InventoryItem[] = [];
  commissionItems: CommissionItem[] = [];

  // 下拉選項
  taxTypeOptions: any[] = [
    { label: '應稅', value: 1 },
    { label: '免稅', value: 2 }
  ];

  discounts: any[] = [
    { value: 1, label: '正品' },
    { value: 2, label: '95折' },
    { value: 3, label: '90折' },
    { value: 4, label: '85折' },
    { value: 5, label: '80折' },
    { value: 6, label: '75折' },
    { value: 7, label: '70折' },
    { value: 8, label: '65折' },
    { value: 9, label: '60折' },
    { value: 10, label: '55折' },
    { value: 11, label: '50折' },
    { value: 12, label: '特價' }
  ];

  constructor(
    private notificationService: NotificationService
  ) {
    super();
    this.dataForm = this.formBuilder.group({});

    // 初始化詳情列定義
    this.updateDetailColumns();
  }

  ngOnInit(): void {
    this.initializePage('TLS13010', this.dataForm);

    // 初始化庫存數據
    this.inventoryItems = [
      {
        recruitmentNumber: '001',
        counterNumber: 'A123',
        brandName: '品牌A',
        vendorId: '55667788',
        vendorName: '公司A',
        versionNumber: 'v1.0',
        commissionType: '固定',
        contractStartDate: '2021-01-01',
        contractEndDate: '2023-12-31',
        operationStartDate: '2021-02-01',
        operationEndDate: '2023-11-30'
      }
    ];

    // 僅調用一次初始化方法
    this.initializeSampleCommissionItems();
    this.updateDetailColumns();
    this.updateDetailItemsForDisplay();

    console.log('初始化後:');
    this.commissionItems.forEach(item => {
      console.log(`項目 ${item.id} 有 ${item.detailItems.length} 個詳細項目`);
    });
  }

  // 切換設置選項卡
  changeSettingTab(tab: string): void {
    console.log('切換設置選項卡', tab);
    this.selectedSettingTab = tab;
    this.updateDetailColumns();
    this.updateDetailItemsForDisplay();
  }

  // 更新詳情列定義
  updateDetailColumns(): void {
    console.log('更新詳情列定義', this.selectedSettingTab);
    switch (this.selectedSettingTab) {
      case 'discount':
        this.detailColumns = this.discountColumns;
        break;
      case 'annual':
        this.detailColumns = this.annualColumns;
        break;
      case 'level':
        this.detailColumns = this.levelColumns;
        break;
      default:
        this.detailColumns = this.discountColumns;
    }
  }

  // 獲取當前設置類型下的數據項
  getCurrentItems(rowData: CommissionItem): any[] {
    switch (this.selectedSettingTab) {
      case 'discount':
        return rowData.discountSettingItems;
      case 'annual':
        return rowData.annualPerformanceItems;
      case 'level':
        return rowData.discountLevelItems;
      default:
        return rowData.discountSettingItems;
    }
  }

  // 添加新項目
  addDetailItem(rowData: CommissionItem): void {
    console.log('添加新項目', this.selectedSettingTab);
    switch (this.selectedSettingTab) {
      case 'discount':
        this.addDiscountSettingItem(rowData);
        break;
      case 'annual':
        this.addAnnualPerformanceItem(rowData);
        break;
      case 'level':
        this.addDiscountLevelItem(rowData);
        break;
    }
    this.updateDetailItemsForDisplay();
  }

  // 刪除項目
  removeDetailItem(rowData: CommissionItem, index: number): void {
    switch (this.selectedSettingTab) {
      case 'discount':
        this.removeDiscountSettingItem(rowData, index);
        break;
      case 'annual':
        this.removeAnnualPerformanceItem(rowData, index);
        break;
      case 'level':
        this.removeDiscountLevelItem(rowData, index);
        break;
    }
    this.updateDetailItemsForDisplay();
  }

  // 獲取設置項標題
  getSettingTitle(): string {
    switch (this.selectedSettingTab) {
      case 'discount':
        return '折扣設定';
      case 'annual':
        return '年度總業績抽成設定';
      case 'level':
        return '折扣別層級抽成設定';
      default:
        return '折扣設定';
    }
  }

  // 初始化示例佣金項目
  initializeSampleCommissionItems(): void {
    console.log('初始化示例佣金項目');
    // 清空現有項目
    this.commissionItems = [];

    // 先添加初始空項
    this.addInitialCommissionItem();

    // 再添加幾個帶有數據的項目
    this.addSampleCommissionItems();
  }

  updateDetailItemsForDisplay(): void {
    console.log('更新詳細項目顯示, 選項卡:', this.selectedSettingTab);

    this.commissionItems.forEach(item => {
      // 清空當前 detailItems
      item.detailItems = [];

      // 根據當前選擇的選項卡類型複製對應的詳細數據
      switch (this.selectedSettingTab) {
        case 'discount':
          if (item.discountSettingItems && item.discountSettingItems.length > 0) {
            item.discountSettingItems.forEach(discountItem => {
              item.detailItems.push({ ...discountItem });
            });
          }
          break;
        case 'annual':
          if (item.annualPerformanceItems && item.annualPerformanceItems.length > 0) {
            item.annualPerformanceItems.forEach(annualItem => {
              item.detailItems.push({ ...annualItem });
            });
          }
          break;
        case 'level':
          if (item.discountLevelItems && item.discountLevelItems.length > 0) {
            item.discountLevelItems.forEach(levelItem => {
              item.detailItems.push({ ...levelItem });
            });
          }
          break;
      }

      console.log(`項目 ${item.id} 詳細項目數量:`, item.detailItems.length);
    });
  }

  // 添加示例數據
  addSampleCommissionItems(): void {
    // 示例1：折扣設置
    const commission1 = this.createCommissionItem(2);
    commission1.commissionType = 'A001';
    commission1.commissionTypeName = '一般折扣';
    commission1.taxType = 1;
    commission1.transactionAmount = 1000;
    commission1.specialCommission = 10;
    commission1.fullPointActivity = true;
    commission1.thousandDiscount = false;
    commission1.selectedSettingOption = 'discount';

    // 添加折扣設置示例數據
    commission1.discountSettingItems[0].selected = true;
    commission1.discountSettingItems[0].discountType = 1;
    commission1.discountSettingItems[0].rate = 15;

    commission1.discountSettingItems[1].selected = true;
    commission1.discountSettingItems[1].discountType = 2;
    commission1.discountSettingItems[1].rate = 12;

    // 更新摘要
    commission1.discountSummary = '折扣設定 1: 正品, 2021-01-01, 2023-12-31, 15%; 折扣設定 2: 95折, 2021-01-01, 2023-12-31, 12%';

    // 示例2：年度業績抽成
    const commission2 = this.createCommissionItem(3);
    commission2.commissionType = 'B002';
    commission2.commissionTypeName = '年度業績抽成';
    commission2.taxType = 2;
    commission2.transactionAmount = 5000;
    commission2.specialCommission = 5;
    commission2.fullPointActivity = false;
    commission2.thousandDiscount = true;
    commission2.selectedSettingOption = 'annual';

    // 添加年度業績示例數據
    commission2.annualPerformanceItems[0].selected = true;
    commission2.annualPerformanceItems[0].discountAmount = 100000;
    commission2.annualPerformanceItems[0].rate = 3;
    commission2.annualPerformanceItems[0].startDate = new Date('2023-01-01');
    commission2.annualPerformanceItems[0].endDate = new Date('2023-12-31');

    commission2.annualPerformanceItems[1].selected = true;
    commission2.annualPerformanceItems[1].discountAmount = 500000;
    commission2.annualPerformanceItems[1].rate = 5;
    commission2.annualPerformanceItems[1].startDate = new Date('2023-01-01');
    commission2.annualPerformanceItems[1].endDate = new Date('2023-12-31');

    // 更新摘要
    commission2.discountSummary = '年度業績 1: 2023-01-01-2023-12-31, 100000, 3%; 年度業績 2: 2023-01-01-2023-12-31, 500000, 5%';

    // 示例3：折扣層級抽成
    const commission3 = this.createCommissionItem(4);
    commission3.commissionType = 'C003';
    commission3.commissionTypeName = '折扣層級抽成';
    commission3.taxType = 1;
    commission3.transactionAmount = 2000;
    commission3.specialCommission = 8;
    commission3.fullPointActivity = true;
    commission3.thousandDiscount = true;
    commission3.selectedSettingOption = 'level';

    // 添加折扣層級示例數據
    commission3.discountLevelItems[0].selected = true;
    commission3.discountLevelItems[0].discountType = 3;
    commission3.discountLevelItems[0].startAmount = 0;
    commission3.discountLevelItems[0].endAmount = 10000;
    commission3.discountLevelItems[0].rate = 7;

    commission3.discountLevelItems[1].selected = true;
    commission3.discountLevelItems[1].discountType = 3;
    commission3.discountLevelItems[1].startAmount = 10001;
    commission3.discountLevelItems[1].endAmount = 50000;
    commission3.discountLevelItems[1].rate = 10;

    // 更新摘要
    commission3.discountSummary = '折扣層級 1: 90折, 0-10000, 7%; 折扣層級 2: 90折, 10001-50000, 10%';

    // 添加到列表
    this.commissionItems.push(commission1);
    this.commissionItems.push(commission2);
    this.commissionItems.push(commission3);
  }

  // 創建折扣設置項目
  createDiscountSettingItem(): DiscountSettingItem {
    const startDate = this.inventoryItems[0]?.contractStartDate
      ? new Date(this.inventoryItems[0].contractStartDate)
      : new Date();
    const endDate = this.inventoryItems[0]?.contractEndDate
      ? new Date(this.inventoryItems[0].contractEndDate)
      : new Date();

    return {
      selected: false,
      discountType: 0,
      startDate: startDate,
      endDate: endDate,
      rate: 0
    };
  }

  // 創建年度業績項目
  createAnnualPerformanceItem(): AnnualPerformanceItem {
    return {
      selected: false,
      startDate: new Date(),
      endDate: new Date(),
      discountAmount: 0,
      rate: 0
    };
  }

  // 創建折扣等級項目
  createDiscountLevelItem(): DiscountLevelItem {
    return {
      selected: false,
      discountType: 0,
      startAmount: 0,
      endAmount: 0,
      rate: 0
    };
  }

  // 添加初始佣金項目
  addInitialCommissionItem(): void {
    const newId = this.commissionItems.length + 1;
    this.commissionItems.push(this.createCommissionItem(newId));
  }

  // 創建佣金項目
  createCommissionItem(id: number): CommissionItem {
    const discountSettingItems: DiscountSettingItem[] = [];
    for (let i = 0; i < 5; i++) {
      discountSettingItems.push(this.createDiscountSettingItem());
    }

    // 創建5個空的年度業績項目
    const annualPerformanceItems: AnnualPerformanceItem[] = [];
    for (let i = 0; i < 5; i++) {
      annualPerformanceItems.push(this.createAnnualPerformanceItem());
    }

    // 創建5個空的折扣等級項目
    const discountLevelItems: DiscountLevelItem[] = [];
    for (let i = 0; i < 5; i++) {
      discountLevelItems.push(this.createDiscountLevelItem());
    }

    const item: CommissionItem = {
      id: id,
      commissionType: '',
      commissionTypeName: '',
      taxType: 1,
      discountSummary: '',
      transactionAmount: 0,
      specialCommission: 0,
      fullPointActivity: false,
      thousandDiscount: false,
      selectedSettingOption: 'discount', // 默認選擇折扣設定
      discountSettingItems: discountSettingItems,
      annualPerformanceItems: annualPerformanceItems,
      discountLevelItems: discountLevelItems,
      detailItems: [] // 初始化為空陣列
    };

    // 根據當前選擇的選項卡類型初始化 detailItems
    switch (this.selectedSettingTab) {
      case 'discount':
        item.detailItems = [...discountSettingItems];
        break;
      case 'annual':
        item.detailItems = [...annualPerformanceItems];
        break;
      case 'level':
        item.detailItems = [...discountLevelItems];
        break;
      default:
        item.detailItems = [...discountSettingItems];
    }

    return item;
  }

  // 添加新的佣金項目
  onAddCommissionItem(): void {
    const newId = this.commissionItems.length + 1;
    this.commissionItems.push(this.createCommissionItem(newId));
    this.updateDetailItemsForDisplay();
  }

  // 設置選項改變
  onSettingOptionChange(item: CommissionItem): void {
    // 可以在這裡添加自定義邏輯
    console.log('設置選項改變:', item.selectedSettingOption);
  }

  // 添加折扣設置項目
  addDiscountSettingItem(item: CommissionItem): void {
    item.discountSettingItems.push(this.createDiscountSettingItem());
    this.updateDetailItemsForDisplay();
  }

  // 添加年度業績項目
  addAnnualPerformanceItem(item: CommissionItem): void {
    item.annualPerformanceItems.push(this.createAnnualPerformanceItem());
    this.updateDetailItemsForDisplay();
  }

  // 添加折扣等級項目
  addDiscountLevelItem(item: CommissionItem): void {
    item.discountLevelItems.push(this.createDiscountLevelItem());
    this.updateDetailItemsForDisplay();
  }

  // 刪除折扣設置項目
  removeDiscountSettingItem(item: CommissionItem, index: number): void {
    item.discountSettingItems.splice(index, 1);
    this.updateDetailItemsForDisplay();
  }

  // 刪除年度業績項目
  removeAnnualPerformanceItem(item: CommissionItem, index: number): void {
    item.annualPerformanceItems.splice(index, 1);
    this.updateDetailItemsForDisplay();
  }

  // 刪除折扣等級項目
  removeDiscountLevelItem(item: CommissionItem, index: number): void {
    item.discountLevelItems.splice(index, 1);
    this.updateDetailItemsForDisplay();
  }

  // 表格項目編輯事件
  onItemEdit(item: any): void {
    console.log('項目編輯:', item);
  }

  // 表格項目保存事件
  onItemSave(event: { oldData: any, newData: any }): void {
    console.log('項目保存:', event);
    this.syncDetailItemsToSource(event.newData);
    this.updateDetailItemsForDisplay();
  }

  // 同步詳細項目到源數據
  syncDetailItemsToSource(itemData: CommissionItem): void {
    switch (this.selectedSettingTab) {
      case 'discount':
        itemData.discountSettingItems = [];
        itemData.detailItems.forEach(detail => {
          itemData.discountSettingItems.push({ ...detail });
        });
        break;
      case 'annual':
        itemData.annualPerformanceItems = [];
        itemData.detailItems.forEach(detail => {
          itemData.annualPerformanceItems.push({ ...detail });
        });
        break;
      case 'level':
        itemData.discountLevelItems = [];
        itemData.detailItems.forEach(detail => {
          itemData.discountLevelItems.push({ ...detail });
        });
        break;
    }
  }

  // 表格項目取消事件
  onItemCancel(item: any): void {
    console.log('項目取消:', item);
  }

  // 詳細內容保存
  onDetailSave(item: CommissionItem, settingType: string): void {
    // 根據設置類型生成摘要內容
    let formattedItems = '';
    this.syncDetailItemsToSource(item);
    switch (settingType) {
      case 'discount':
        // 處理折扣設置項目
        const selectedDiscounts = item.discountSettingItems.filter(i => i.selected);
        const formattedDiscounts = selectedDiscounts.map((discountItem, idx) => {
          const discountLabel = this.discounts.find(d => d.value == discountItem.discountType)?.label || '';
          const startDate = discountItem.startDate ? this.formatDate(discountItem.startDate) : '';
          const endDate = discountItem.endDate ? this.formatDate(discountItem.endDate) : '';
          return `折扣設定 ${idx + 1}: ${discountLabel}, ${startDate}, ${endDate}, ${discountItem.rate}%`;
        }).join('; ');
        formattedItems = formattedDiscounts;
        break;

      case 'annual':
        // 處理年度業績項目
        const selectedAnnuals = item.annualPerformanceItems.filter(i => i.selected);
        const formattedAnnuals = selectedAnnuals.map((annualItem, idx) => {
          const startDate = annualItem.startDate ? this.formatDate(annualItem.startDate) : '';
          const endDate = annualItem.endDate ? this.formatDate(annualItem.endDate) : '';
          return `年度業績 ${idx + 1}: ${startDate}-${endDate}, ${annualItem.discountAmount}, ${annualItem.rate}%`;
        }).join('; ');
        formattedItems = formattedAnnuals;
        break;

      case 'level':
        // 處理折扣等級項目
        const selectedLevels = item.discountLevelItems.filter(i => i.selected);
        const formattedLevels = selectedLevels.map((levelItem, idx) => {
          const discountLabel = this.discounts.find(d => d.value == levelItem.discountType)?.label || '';
          return `折扣層級 ${idx + 1}: ${discountLabel}, ${levelItem.startAmount}-${levelItem.endAmount}, ${levelItem.rate}%`;
        }).join('; ');
        formattedItems = formattedLevels;
        break;
    }

    // 更新摘要
    if (formattedItems) {
      item.discountSummary = formattedItems;
      // 更新選定的設置選項
      item.selectedSettingOption = settingType;
    }
  }

  // 詳細內容取消
  onDetailCancel(item: CommissionItem): void {
    // 這裡可以添加取消邏輯，如恢復到原始狀態
    console.log('詳細內容取消:', item);
    this.updateDetailItemsForDisplay();
  }

  // 詳細內容清除
  onDetailClear(item: CommissionItem, settingType: string): void {
    // 按類型清除不同的內容
    switch (settingType) {
      case 'discount':
        item.discountSettingItems.forEach(i => {
          i.selected = false;
          i.discountType = 0;
          i.rate = 0;
          // 保留起止日期
          i.startDate = this.inventoryItems[0]?.contractStartDate
            ? new Date(this.inventoryItems[0].contractStartDate)
            : new Date();
          i.endDate = this.inventoryItems[0]?.contractEndDate
            ? new Date(this.inventoryItems[0].contractEndDate)
            : new Date();
        });
        break;
      case 'annual':
        item.annualPerformanceItems.forEach(i => {
          i.selected = false;
          i.discountAmount = 0;
          i.rate = 0;
          // 重置日期
          i.startDate = new Date();
          i.endDate = new Date();
        });
        break;
      case 'level':
        item.discountLevelItems.forEach(i => {
          i.selected = false;
          i.discountType = 0;
          i.startAmount = 0;
          i.endAmount = 0;
          i.rate = 0;
        });
        break;
    }
    this.updateDetailItemsForDisplay();
  }

  // 日期格式化輔助函數
  formatDate(date: Date): string {
    if (!date) return '';

    try {
      return date.toISOString().split('T')[0];
    } catch (e) {
      return '';
    }
  }

  // 展開式表格的事件處理方法 - 修正為正確的參數類型
  onRowSave(event: any) {
    // 確認事件對象有預期的屬性
    if (event && 'oldData' in event && 'newData' in event) {
      console.log('儲存主表格行:', event);
      // 這裡可以加入實際的API儲存邏輯
    } else {
      console.warn('收到未預期的事件格式:', event);
    }
  }

  onRowCancel(event: any) {
    console.log('取消主表格編輯:', event);
  }

  onDetailEdit(event: any): void {
    console.log('詳細編輯開始:', event);
    // 這裡可以添加你需要的特定邏輯
  }

  onDetailTabChange(event: { rowData: any, tabId: string }) {
    const { rowData, tabId } = event;
    console.log('詳細選項卡切換:', tabId);

    // 更新詳細內容顯示
    this.selectedSettingTab = tabId; // 同步更新當前選中的選項卡
    this.updateDetailColumns(); // 更新詳細列定義
    this.updateDetailItemsForDisplay(); // 更新顯示的詳細資料
  }

  onSubmitNext(): void {
    this.router.navigate(['TLS/TLS13010NEXT3']);
  }

  // 批次刪除處理
  onBatchDelete(selectedItems: any[]) {
    console.log('批次刪除項目:', selectedItems);

    if (confirm(`確定要刪除選取的 ${selectedItems.length} 個項目嗎？`)) {
      // 從資料中移除選取的項目
      selectedItems.forEach(item => {
        const index = this.commissionItems.findIndex(x => x.id === item.id);
        if (index > -1) {
          this.commissionItems.splice(index, 1);
        }
      });

      console.log('刪除完成');
    }
  }

  // 新增明細項目處理
  onAddDetailItem(parentData: any) {
    console.log('新增明細項目:', parentData);

    // 根據當前選擇的選項卡類型添加對應的項目
    switch (this.selectedSettingTab) {
      case 'discount':
        this.addDiscountSettingItem(parentData);
        break;
      case 'annual':
        this.addAnnualPerformanceItem(parentData);
        break;
      case 'level':
        this.addDiscountLevelItem(parentData);
        break;
    }
  }

  // 明細批次刪除處理
  onDetailBatchDelete(event: { selectedDetails: any[], parentData: any, rowIndex: number }) {
    console.log('明細批次刪除:', event);

    const { selectedDetails, parentData } = event;

    if (confirm(`確定要刪除選取的 ${selectedDetails.length} 個明細項目嗎？`)) {
      // 從明細陣列中移除選取的項目
      selectedDetails.forEach(detail => {
        const detailIndex = parentData.detailItems.findIndex((d: any) => d.id === detail.id);
        if (detailIndex > -1) {
          parentData.detailItems.splice(detailIndex, 1);
        }

        // 同時從對應的設定陣列中移除
        switch (this.selectedSettingTab) {
          case 'discount':
            const discountIndex = parentData.discountSettingItems.findIndex((d: any) => d.id === detail.id);
            if (discountIndex > -1) {
              parentData.discountSettingItems.splice(discountIndex, 1);
            }
            break;
          case 'annual':
            const annualIndex = parentData.annualPerformanceItems.findIndex((d: any) => d.id === detail.id);
            if (annualIndex > -1) {
              parentData.annualPerformanceItems.splice(annualIndex, 1);
            }
            break;
          case 'level':
            const levelIndex = parentData.discountLevelItems.findIndex((d: any) => d.id === detail.id);
            if (levelIndex > -1) {
              parentData.discountLevelItems.splice(levelIndex, 1);
            }
            break;
        }
      });

      // 更新顯示
      this.updateDetailItemsForDisplay();
      console.log('明細刪除完成');
    }
  }
}
