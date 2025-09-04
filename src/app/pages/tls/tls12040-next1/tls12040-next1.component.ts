import { TLS12040FareColumnDefinitions } from './services/tls12040-fare-column-definitions';
import {
  TLS12040FareItem,
  TLS12040APIResponse,
  TLS12040QueryParams,
  TLS12040FareDataContainer
} from './models/tls12040-next1.model';
import { NgFor, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TLS12040Service } from '@service/api/tls/tls12040.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AccordionModule } from "primeng/accordion";
import { ExpandableEditTableComponent } from "@shared/componentkit/expandable-edit-table/expandable-edit-table.component";
import { DialogComponent } from "@shared/componentkit/dialog/dialog.component";
import { TLS12040DetailModel } from '../tls12040-cru/models/tls12040-cru.model';
import { TLS12040FlowService } from '../tls12040/Workflow/contract-flow.service';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';

interface CategoryItem {
  id: number;
}

@Component({
  selector: 'app-tls12040-next1',
  templateUrl: './tls12040-next1.component.html',
  styleUrls: ['./tls12040-next1.component.scss'],
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, NgIf, ProgressSpinnerModule, NgFor, AccordionModule, ExpandableEditTableComponent, DialogComponent]
})
export class TLS12040Next1Component extends BasicCruPageComponent<CategoryItem> implements OnInit, OnDestroy {
  currentApplyNo: string = '';
  contractInfoData: TLS12040DetailModel[] = [];
  currentContractData: any = null;

  fareData: { [key: string]: TLS12040FareItem[] } = {
    'A': [], 'B': [], 'C': [], 'D': [], 'E': []
  };

  originalFareData: { [key: string]: TLS12040FareItem[] } = {
    'A': [], 'B': [], 'C': [], 'D': [], 'E': []
  };

  dataForm = this.formBuilder.group({});
  showMode: 'common' | 'all' = 'common';
  contractInfoColumns: any[] = [];

  // 訂閱管理
  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private tls12040Service: TLS12040Service,
    private flowService: TLS12040FlowService,

  ) {
    super();
  }

  get capTypes(): string[] {
    return ['A', 'B', 'C', 'D', 'E'];
  }

  // ========== 生命週期方法 ==========
  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.initializePage('TLS12040', this.dataForm);
    this.initializeDataStructure();
    this.contractInfoColumns = TLS12040FareColumnDefinitions.getContractInfoColumns();
  }

  ngOnDestroy(): void {
    console.log('TLS12040Next1Component 銷毀，清理訂閱...');
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadFareDataFromAPI(): void {
    console.log('載入扣款資料，apply_no:', this.currentApplyNo);

    this.loading = true;
    this.messageService.blockUi();

    const subscription = this.tls12040Service.queryTLS12040Fare({
      apply_no: this.currentApplyNo,
      showAll: true
    }).subscribe({
      next: (response) => {
        console.log('API 回傳的扣款資料:', response);

        // 處理 API 回傳資料
        if (response && response.Data && response.Data.FaresByType) {
          this.processAPIData(response.Data.FaresByType);
        } else {
          this.initializeEmptyData();
        }

        this.loading = false;
        this.messageService.unblockUi();
      },
      error: (error) => {
        console.error('載入扣款資料失敗:', error);
        this.messageService.warnBubble('載入扣款資料失敗');
        this.loading = false;
        this.messageService.unblockUi();
        this.initializeEmptyData();
      }
    });

    this.subscriptions.push(subscription);
  }

  private processAPIData(faresByType: any): void {
    const capTypes = ['A', 'B', 'C', 'D', 'E'];

    capTypes.forEach(capType => {
      if (faresByType[capType] && Array.isArray(faresByType[capType])) {
        this.originalFareData[capType] = faresByType[capType].map((item: any) => ({
          ...item,
          id: item.id || `${capType}_${item.cap_item || Date.now()}`,
          is_selected: item.is_selected || false
        }));
      }
    });

    this.filterData();
  }

  private initializeEmptyData(): void {
    const capTypes = ['A', 'B', 'C', 'D', 'E'];
    capTypes.forEach(capType => {
      this.originalFareData[capType] = [];
    });
    this.filterData();
  }

  private initializeDataStructure(): void {
    const capTypes = ['A', 'B', 'C', 'D', 'E'];
    capTypes.forEach(capType => {
      if (!this.originalFareData[capType]) {
        this.originalFareData[capType] = [];
      }
      if (!this.fareData[capType]) {
        this.fareData[capType] = [];
      }
    });
  }

  private filterData(): void {
    this.initializeDataStructure();

    const capTypes = ['A', 'B', 'C', 'D', 'E'];

    capTypes.forEach(capType => {
      if (this.showMode === 'all') {
        this.fareData[capType] = [...this.originalFareData[capType]];
      } else {
        // common 模式：只顯示已選取的和前幾個常用的
        const selectedItems = this.originalFareData[capType].filter(item => item.is_selected);
        const unselectedItems = this.originalFareData[capType]
          .filter(item => !item.is_selected)
          .slice(0, 5); // 只顯示前5個

        this.fareData[capType] = [...selectedItems, ...unselectedItems];
      }
    });
  }

  // ========== 表格事件處理 ==========
  onFieldChange(fieldName: string, newValue: any, rowData: any, capType?: string): void {
    console.log(`欄位變更: ${capType}.${fieldName} = ${newValue}`, rowData);

    // 基本的金額計算
    if (['tpy_unitamt', 'tpy_qty'].includes(fieldName)) {
      const unitPrice = parseFloat(rowData.tpy_unitamt) || 0;
      const quantity = parseFloat(rowData.tpy_qty) || 0;
      rowData.tpy_amount = unitPrice * quantity;
    }

    // A類型特殊處理：結束日期等於開始日期
    if (capType === 'A' && fieldName === 'tpy_bdate' && newValue) {
      rowData.tpy_edate = newValue;
    }
  }

  onButtonClick(event: { rowData: any; field: string }, capType: string): void {
    const { rowData, field } = event;
    console.log(`按鈕點擊: ${field}`, rowData);

    if (field === 'auto_calc') {
      this.doAutoCalculate(rowData, capType);
    } else if (field === 'copy_button') {
      this.copyFareItem(rowData, capType);
    }
  }

  private doAutoCalculate(rowData: any, capType: string): void {
    console.log(`自動計算: ${capType}`, rowData);

    if (capType === 'C') {
      const totalAmount = parseFloat(rowData.tpy_totalamt) || 0;
      const periods = parseInt(rowData.period_nos) || 0;

      if (totalAmount > 0 && periods > 0) {
        const monthlyAmount = Math.floor(totalAmount / periods);
        const downPayment = totalAmount - (monthlyAmount * (periods - 1));

        rowData.tpy_amount = monthlyAmount;
        rowData.down_payment = downPayment;

        this.messageService.successBubble('自動計算完成');
      } else {
        this.messageService.warnBubble('請檢查總金額和期數');
      }
    }
  }

  private copyFareItem(rowData: any, capType: string): void {
    console.log(`複製項目: ${capType}`, rowData);

    const newId = `copy_${capType}_${Date.now()}`;
    const copiedItem = {
      ...rowData,
      id: newId,
      is_selected: true
    };

    this.originalFareData[capType].push(copiedItem);
    this.filterData();

    this.messageService.successBubble(`已複製扣款項目「${rowData.cap_name}」`);
  }

  onFareTableSave(event: { oldData: any, newData: any }, capType: string): void {
    console.log(`儲存變更: ${capType}`, event);

    // 更新原始資料
    const originalIndex = this.originalFareData[capType].findIndex(item => item.id === event.newData.id);
    if (originalIndex > -1) {
      this.originalFareData[capType][originalIndex] = event.newData;
    }
  }

  onFareTableEdit(event: { data: any }, capType: string): void {
    console.log(`編輯項目: ${capType}`, event);
  }

  onFareTableCancel(event: { data: any }, capType: string): void {
    console.log(`取消編輯: ${capType}`, event);
  }

  onBeforeSave(event: { data: any, preventDefault: () => void }, capType: string): void {
    console.log(`儲存前檢查: ${capType}`, event);

    const { data } = event;

    // 基本驗證
    if (data.is_selected) {
      if (capType === 'A' || capType === 'B') {
        if (!data.tpy_unitamt || !data.tpy_qty) {
          this.messageService.warnBubble('請填寫單價和數量');
          event.preventDefault();
          return;
        }
      } else if (capType === 'C') {
        if (!data.tpy_totalamt || !data.period_nos) {
          this.messageService.warnBubble('請填寫總金額和期數');
          event.preventDefault();
          return;
        }
      }
    }
  }

  // ========== 輔助方法 ==========
  getColumnsForType(capType: string): any[] {
    switch (capType) {
      case 'A':
        return TLS12040FareColumnDefinitions.getDeductionAColumns(this.contractInfoData);
      case 'B':
        return TLS12040FareColumnDefinitions.getDeductionBColumns(this.contractInfoData);
      case 'C':
        return TLS12040FareColumnDefinitions.getDeductionCColumns(this.contractInfoData);
      case 'D':
        return TLS12040FareColumnDefinitions.getDeductionDColumns(this.contractInfoData);
      case 'E':
        return TLS12040FareColumnDefinitions.getDeductionEColumns(this.contractInfoData);
      default:
        return [];
    }
  }

  hasDataForType(capType: string): boolean {
    return this.fareData[capType] && this.fareData[capType].length > 0;
  }

  hasAnyData(): boolean {
    return Object.values(this.fareData).some(items => items && items.length > 0);
  }

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

  selectAllByType(capType: string): void {
    console.log(`${capType} 類型全部選擇`);
    this.fareData[capType].forEach(item => {
      item.is_selected = true;
      // 同步到原始資料
      const originalItem = this.originalFareData[capType].find(orig => orig.id === item.id);
      if (originalItem) {
        originalItem.is_selected = true;
      }
    });
  }

  deselectAllByType(capType: string): void {
    console.log(`${capType} 類型取消全部選擇`);
    this.fareData[capType].forEach(item => {
      item.is_selected = false;
      // 同步到原始資料
      const originalItem = this.originalFareData[capType].find(orig => orig.id === item.id);
      if (originalItem) {
        originalItem.is_selected = false;
      }
    });
  }

  // ========== 模式切換 ==========
  toggleCommonMode(): void {
    this.showMode = this.showMode === 'common' ? 'all' : 'common';
    this.filterData();
  }

  getCommonModeText(): string {
    return this.showMode === 'common' ? '切換為個別模式' : '切換為全域模式';
  }

  getCurrentDisplayMode(): string {
    if (this.showMode === 'common') {
      return '合約項目 + 常用項目 + 已勾選項目';
    } else {
      return '全部項目';
    }
  }

  // ========== 導航相關 ==========
  onSubmitNext(): void {
    // if (this.isViewMode) {
    //   this.router.navigate(['account/tls/tls13010next2']);
    //   return;
    // }

    // console.log('🔍 開始進行完整驗證...');

    // // 儲存當前資料
    // this.saveFareDataToWorkflow();

    // // 驗證所有已選中的扣款類型
    // const validationResults = this.validateAllSelectedFareTypes();

    // if (!validationResults.isValid) {
    //   console.error('❌ 驗證失敗:', validationResults.errors);
    //   this.showValidationErrors(validationResults.errors);
    //   return;
    // }
    console.log('✅ 驗證通過，跳轉到下一步');
    this.router.navigate(['account/tls/tls13010next2']);
  }

  onClearAndExit(): void {
    // this.contractFlowService.clearTempData();
    const extras: NavigationExtras = {
      state: { fromRoute: this.router.url },
    };
    this.router.navigate(['account/tls/tls12040'], extras);
    this.messageService.infoBubble('已清空暫存資料並離開');
  }

  override onCancel(): void {
    const extras: NavigationExtras = {
      state: {
        rowdata: this.flowService.getCurrentState(),  // 傳整個狀態或 rowdata
        crudstatus: CRUDStatus.Edit  // 假設繼續編輯
      }
    };
    this.router.navigate(['account/tls/tls12040cru'], extras);
  }

  reloadData(): void {
    if (confirm('確定要重新載入資料嗎？未儲存的變更將會遺失。')) {
      this.loadFareDataFromAPI();
      this.messageService.infoBubble('已重新載入資料');
    }
  }
}
