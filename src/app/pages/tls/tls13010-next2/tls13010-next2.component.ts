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

// 佣金项目接口
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

// 折扣设置项目接口
interface DiscountSettingItem {
  selected: boolean;
  discountType: number;
  startDate: Date;
  endDate: Date;
  rate: number;
}

// 年度业绩项目接口
interface AnnualPerformanceItem {
  selected: boolean;
  startDate: Date;
  endDate: Date;
  discountAmount: number;
  rate: number;
}

// 折扣等级项目接口
interface DiscountLevelItem {
  selected: boolean;
  discountType: number;
  startAmount: number;
  endAmount: number;
  rate: number;
}

// // 展开详情中使用的列定义
// interface DetailTableColumn {
//   field: string;
//   header: string;
//   type?: string;
// }

@Component({
  selector: 'app-tls13010-next2',
  templateUrl: './tls13010-next2.component.html',
  styleUrls: ['./tls13010-next2.component.scss']
})
export class TLS13010Next2Component extends BasicCruPageComponent<CategoryItem> implements OnInit {
  @ViewChild('expandedContent') expandedContentTemplate!: TemplateRef<any>;

  dataForm: FormGroup;
  // 顶部选项卡选择
  selectedSettingTab: string = 'discount';

  // 展开区域表格的动态列定义
  detailColumns: ColumnDef[] = [];

  // 各类型的列定义
  discountColumns: ColumnDef[] = [
    { field: 'selected', header: '選擇', type: 'checkbox', editable: true, },
    { field: 'discountType', header: '折扣别', type: 'dropdown', editable: true, },
    { field: 'startDate', header: '合約起始日', type: 'date', editable: true, },
    { field: 'endDate', header: '合約終止日', type: 'date', editable: true, },
    { field: 'rate', header: '抽成率 (%)', type: 'inputNumber', editable: true, }
  ];

  annualColumns: ColumnDef[] = [
    { field: 'selected', header: '選擇', type: 'checkbox' },
    { field: 'startDate', header: '帳務起', type: 'calendar' },
    { field: 'endDate', header: '帳務迄', type: 'calendar' },
    { field: 'discountAmount', header: '業績超過金額含', type: 'inputNumber' },
    { field: 'rate', header: '抽成率', type: 'inputNumber' }
  ];

  levelColumns: ColumnDef[] = [
    { field: 'selected', header: '選擇', type: 'checkbox' },
    { field: 'discountType', header: '折扣别', type: 'dropdown' },
    { field: 'startAmount', header: '業績計算金額(起)', type: 'inputNumber' },
    { field: 'endAmount', header: '業績計算金額(迄)', type: 'inputNumber' },
    { field: 'rate', header: '抽成率', type: 'inputNumber' }
  ];

  settingOptions: SelectItem[] = [
    { label: '折扣設定', value: 'discount' },
    { label: '年度總業績抽成設定', value: 'annual' },
    { label: '折扣別層級抽成設定', value: 'level' }
  ];

  // 库存表格列定义
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

  // 佣金表格列定义
  commissionColumns: ColumnDef[] = [
    { field: 'commissionType', header: '抽成類別', editable: true },
    { field: 'commissionTypeName', header: '抽成類別名稱', editable: true },
    { field: 'taxType', header: '稅別', editable: true },
    { field: 'discountSummary', header: '設定摘要', editable: true },
    { field: 'transactionAmount', header: '單筆交易金額(含)以上', editable: true, type: 'inputNumber' },
    { field: 'specialCommission', header: '特價抽成(%)', editable: true, type: 'inputNumber' },
    { field: 'fullPointActivity', header: '全館消費滿額集點活動', editable: true, type: 'checkbox' },
    { field: 'thousandDiscount', header: '滿仟送佰', editable: true, type: 'checkbox' },
  ];

  // 数据
  inventoryItems: InventoryItem[] = [];
  commissionItems: CommissionItem[] = [];

  // 下拉选项
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

    // 初始化详情列定义
    this.updateDetailColumns();
  }

  ngOnInit(): void {
    this.initializePage('TLS13010', this.dataForm);

    // 初始化库存数据
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

    // 初始化佣金项目，添加假数据
    this.initializeSampleCommissionItems();
    this.updateDetailItemsForDisplay();
  }

  // 切换设置选项卡
  changeSettingTab(tab: string): void {
    this.selectedSettingTab = tab;
    this.updateDetailColumns();
  }

  // 更新详情列定义
  updateDetailColumns(): void {
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

  // 获取当前设置类型下的数据项
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

  // 添加新项目
  addDetailItem(rowData: CommissionItem): void {
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
  }

  // 删除项目
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
  }

  // 获取设置项标题
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

  // 初始化示例佣金项目
  initializeSampleCommissionItems(): void {
    // 先添加初始空项
    this.addInitialCommissionItem();

    // 再添加几个带有数据的项目
    this.addSampleCommissionItems();
  }

  updateDetailItemsForDisplay(): void {
    this.commissionItems.forEach(item => {
      // 清空当前detailItems
      item.detailItems = [];

      // 根据当前选项卡复制对应数据
      switch (this.selectedSettingTab) {
        case 'discount':
          item.discountSettingItems.forEach(discountItem => {
            item.detailItems.push({ ...discountItem });
          });
          break;
        case 'annual':
          item.annualPerformanceItems.forEach(annualItem => {
            item.detailItems.push({ ...annualItem });
          });
          break;
        case 'level':
          item.discountLevelItems.forEach(levelItem => {
            item.detailItems.push({ ...levelItem });
          });
          break;
      }
    });
  }

  // 添加示例数据
  addSampleCommissionItems(): void {
    // 示例1：折扣设置
    const commission1 = this.createCommissionItem(2);
    commission1.commissionType = 'A001';
    commission1.commissionTypeName = '一般折扣';
    commission1.taxType = 1;
    commission1.transactionAmount = 1000;
    commission1.specialCommission = 10;
    commission1.fullPointActivity = true;
    commission1.thousandDiscount = false;
    commission1.selectedSettingOption = 'discount';

    // 添加折扣设置示例数据
    commission1.discountSettingItems[0].selected = true;
    commission1.discountSettingItems[0].discountType = 1;
    commission1.discountSettingItems[0].rate = 15;

    commission1.discountSettingItems[1].selected = true;
    commission1.discountSettingItems[1].discountType = 2;
    commission1.discountSettingItems[1].rate = 12;

    // 更新摘要
    commission1.discountSummary = '折扣設定 1: 正品, 2021-01-01, 2023-12-31, 15%; 折扣設定 2: 95折, 2021-01-01, 2023-12-31, 12%';

    // 示例2：年度业绩抽成
    const commission2 = this.createCommissionItem(3);
    commission2.commissionType = 'B002';
    commission2.commissionTypeName = '年度業績抽成';
    commission2.taxType = 2;
    commission2.transactionAmount = 5000;
    commission2.specialCommission = 5;
    commission2.fullPointActivity = false;
    commission2.thousandDiscount = true;
    commission2.selectedSettingOption = 'annual';

    // 添加年度业绩示例数据
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

    // 示例3：折扣层级抽成
    const commission3 = this.createCommissionItem(4);
    commission3.commissionType = 'C003';
    commission3.commissionTypeName = '折扣層級抽成';
    commission3.taxType = 1;
    commission3.transactionAmount = 2000;
    commission3.specialCommission = 8;
    commission3.fullPointActivity = true;
    commission3.thousandDiscount = true;
    commission3.selectedSettingOption = 'level';

    // 添加折扣层级示例数据
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

  // 创建折扣设置项目
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

  // 创建年度业绩项目
  createAnnualPerformanceItem(): AnnualPerformanceItem {
    return {
      selected: false,
      startDate: new Date(),
      endDate: new Date(),
      discountAmount: 0,
      rate: 0
    };
  }

  // 创建折扣等级项目
  createDiscountLevelItem(): DiscountLevelItem {
    return {
      selected: false,
      discountType: 0,
      startAmount: 0,
      endAmount: 0,
      rate: 0
    };
  }

  // 添加初始佣金项目
  addInitialCommissionItem(): void {
    const newId = this.commissionItems.length + 1;
    this.commissionItems.push(this.createCommissionItem(newId));
  }

  // 创建佣金项目
  createCommissionItem(id: number): CommissionItem {
    // 创建10个空的折扣设置项目
    const discountSettingItems: DiscountSettingItem[] = [];
    for (let i = 0; i < 5; i++) {
      discountSettingItems.push(this.createDiscountSettingItem());
    }

    // 创建10个空的年度业绩项目
    const annualPerformanceItems: AnnualPerformanceItem[] = [];
    for (let i = 0; i < 5; i++) {
      annualPerformanceItems.push(this.createAnnualPerformanceItem());
    }

    // 创建10个空的折扣等级项目
    const discountLevelItems: DiscountLevelItem[] = [];
    for (let i = 0; i < 5; i++) {
      discountLevelItems.push(this.createDiscountLevelItem());
    }

    // 创建空的佣金项目
    return {
      id: id,
      commissionType: '',
      commissionTypeName: '',
      taxType: 1,
      discountSummary: '',
      transactionAmount: 0,
      specialCommission: 0,
      fullPointActivity: false,
      thousandDiscount: false,
      selectedSettingOption: 'discount', // 默认选择折扣设定
      discountSettingItems: discountSettingItems,
      annualPerformanceItems: annualPerformanceItems,
      discountLevelItems: discountLevelItems,
      detailItems: [{}] // 添加一个空对象，确保可以展开
    };
  }

  // 添加新的佣金项目
  onAddCommissionItem(): void {
    const newId = this.commissionItems.length + 1;
    this.commissionItems.push(this.createCommissionItem(newId));
    this.updateDetailItemsForDisplay();
  }

  // 设置选项改变
  onSettingOptionChange(item: CommissionItem): void {
    // 可以在这里添加自定义逻辑
    console.log('Setting option changed:', item.selectedSettingOption);
  }

  // 添加折扣设置项目
  addDiscountSettingItem(item: CommissionItem): void {
    item.discountSettingItems.push(this.createDiscountSettingItem());
  }

  // 添加年度业绩项目
  addAnnualPerformanceItem(item: CommissionItem): void {
    item.annualPerformanceItems.push(this.createAnnualPerformanceItem());
  }

  // 添加折扣等级项目
  addDiscountLevelItem(item: CommissionItem): void {
    item.discountLevelItems.push(this.createDiscountLevelItem());
  }

  // 删除折扣设置项目
  removeDiscountSettingItem(item: CommissionItem, index: number): void {
    item.discountSettingItems.splice(index, 1);
  }

  // 删除年度业绩项目
  removeAnnualPerformanceItem(item: CommissionItem, index: number): void {
    item.annualPerformanceItems.splice(index, 1);
  }

  // 删除折扣等级项目
  removeDiscountLevelItem(item: CommissionItem, index: number): void {
    item.discountLevelItems.splice(index, 1);
  }

  // 表格项目编辑事件
  onItemEdit(item: any): void {
    console.log('Item edit:', item);
  }

  // 表格项目保存事件
  onItemSave(event: { oldData: any, newData: any }): void {
    console.log('Item save:', event);
    this.syncDetailItemsToSource(event.newData);

    this.updateDetailItemsForDisplay();
  }

  // 在onItemSave后添加新方法：
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

  // 表格项目取消事件
  onItemCancel(item: any): void {
    console.log('Item cancel:', item);
  }

  // 详细内容保存
  onDetailSave(item: CommissionItem, settingType: string): void {
    // 根据设置类型生成摘要内容
    let formattedItems = '';
    this.syncDetailItemsToSource(item);
    switch (settingType) {
      case 'discount':
        // 处理折扣设置项目
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
        // 处理年度业绩项目
        const selectedAnnuals = item.annualPerformanceItems.filter(i => i.selected);
        const formattedAnnuals = selectedAnnuals.map((annualItem, idx) => {
          const startDate = annualItem.startDate ? this.formatDate(annualItem.startDate) : '';
          const endDate = annualItem.endDate ? this.formatDate(annualItem.endDate) : '';
          return `年度業績 ${idx + 1}: ${startDate}-${endDate}, ${annualItem.discountAmount}, ${annualItem.rate}%`;
        }).join('; ');
        formattedItems = formattedAnnuals;
        break;

      case 'level':
        // 处理折扣等级项目
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
      // 更新选定的设置选项
      item.selectedSettingOption = settingType;

    }
  }

  // 详细内容取消
  onDetailCancel(item: CommissionItem): void {
    // 这里可以添加取消逻辑，如恢复到原始状态
    console.log('Detail cancel:', item);
    this.updateDetailItemsForDisplay();
  }

  // 详细内容清除
  onDetailClear(item: CommissionItem, settingType: string): void {
    // 按类型清除不同的内容
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

  // 日期格式化辅助函数
  formatDate(date: Date): string {
    if (!date) return '';

    try {
      return date.toISOString().split('T')[0];
    } catch (e) {
      return '';
    }
  }



  // 展開式表格的事件處理方法 - 修正為正確的參數類型
  // 注意：這些方法需要明確接收正確的事件類型
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
    console.log('Detail edit started:', event);
    // 这里可以添加你需要的特定逻辑
  }

}
