/**
 * TLS13010-V2 抽成設定組件 (Step 3)
 *
 * 職責：
 * - 抽成項目設定
 * - 抽成比率與日期範圍設定
 * - 折扣設定管理
 * - 導航到條件設定頁面
 */
import { NgIf, NgFor } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

// 基礎組件
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalendarModule } from 'primeng/calendar';
import { AccordionModule } from 'primeng/accordion';

// 共用組件
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';

// V2 服務與類型
import { CommissionType, CommissionTypeLabels } from '../../core/constants';
import { CommissionItem, DiscountSettingItem } from '../../core/models/commission';
import { WorkflowFacadeService } from '../../services/workflow';
import { CommissionValidatorService } from '../../services/validation';

interface CategoryItem {
  id: number;
}

@Component({
  selector: 'app-tls13010v2-commission',
  templateUrl: './commission.component.html',
  styleUrls: ['./commission.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    FormsModule,
    MenubarComponent,
    ButtonComponent,
    ButtonModule,
    TableModule,
    InputNumberModule,
    CalendarModule,
    CalendarComponent,
    AccordionModule
  ]
})
export class CommissionComponent extends BasicCruPageComponent<CategoryItem> implements OnInit, OnDestroy {

  // ========== CRUD 狀態管理 ==========
  override crudstatus: CRUDStatus = CRUDStatus.Create;
  readonly CRUDStatus = CRUDStatus;

  get isFormReadonly(): boolean {
    return this.crudstatus === CRUDStatus.Read;
  }

  // ========== 抽成資料 ==========
  commissionItems: CommissionItem[] = [];
  currentCommissionType: CommissionType | string = '';

  // 表格欄位
  columns = [
    { field: 'charge_rate', header: '抽成比率(%)', type: 'number', width: '150px' },
    { field: 'cag_bdate', header: '起始日期', type: 'date', width: '150px' },
    { field: 'cag_edate', header: '結束日期', type: 'date', width: '150px' },
    { field: 'cag_remark', header: '備註', type: 'text', width: '200px' }
  ];

  private subscriptions: Subscription[] = [];

  constructor(
    public override router: Router,
    private workflowFacade: WorkflowFacadeService,
    private commissionValidator: CommissionValidatorService
  ) {
    super();
  }

  // ========== 生命週期方法 ==========
  ngOnInit(): void {
    this.initializeBasics();
    this.loadFromWorkflow();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // ========== 初始化方法 ==========
  private initializeBasics(): void {
    this.ProgNo = 'TLS13010';

    // 根據工作流程狀態設定 CRUD 模式
    const status = this.workflowFacade.getCurrentStatus();
    if (status.isNewMode) {
      this.crudstatus = CRUDStatus.Create;
    } else if (status.isViewMode) {
      this.crudstatus = CRUDStatus.Read;
    } else {
      this.crudstatus = CRUDStatus.Edit;
    }
  }

  private loadFromWorkflow(): void {
    // 取得抽成類型
    const step1Data = this.workflowFacade.getStep1Data();
    if (step1Data) {
      this.currentCommissionType = step1Data.tlt_term_type || '';
    }

    // 取得抽成資料
    const step3Data = this.workflowFacade.getStep3Data();
    if (step3Data && step3Data.length > 0) {
      this.commissionItems = step3Data;
    }
  }

  // ========== 事件處理 ==========
  addCommissionItem(): void {
    // 取得合約日期作為預設
    const step1Data = this.workflowFacade.getStep1Data();

    const newItem: CommissionItem = {
      id: Date.now(),
      tlt_id: step1Data?.talent_id || '',
      tlt_id_desc: '',
      cag_taxtype: '',
      discountSummary: '',
      sst_amount: 0,
      sst_rate: 0,
      cap_saletype1: false,
      cap_saletype2: false,
      cap_saletype5: false,
      selectedSettingOption: '',
      discountSettingItems: [],
      annualPerformanceItems: [],
      discountLevelItems: [],
      detailItems: [],
      charge_rate: 0,
      cag_bdate: step1Data?.tlt_bdate || '',
      cag_edate: step1Data?.tlt_edate || '',
      cag_remark: '',
      _status: 'new'
    };

    this.commissionItems = [...this.commissionItems, newItem];
  }

  removeCommissionItem(index: number): void {
    const item = this.commissionItems[index];
    if (item._status === 'new') {
      // 新增的項目直接移除
      this.commissionItems.splice(index, 1);
      this.commissionItems = [...this.commissionItems];
    } else {
      // 既有項目標記為刪除
      item._status = 'deleted';
    }
  }

  onItemChange(item: CommissionItem): void {
    if (item._status !== 'new' && item._status !== 'deleted') {
      item._status = 'modified';
    }
  }

  // ========== 折扣設定 ==========
  addDiscountItem(commission: CommissionItem): void {
    if (!commission.discountSettingItems) {
      commission.discountSettingItems = [];
    }

    const newDiscount: DiscountSettingItem = {
      id: Date.now(),
      selected: true,
      cag_barcode: '',
      tlt_bdate: '',
      tlt_edate: '',
      cag_charge_rate: 0,
      discount_rate: 0,
      is_configured: false,
      is_enabled: true,
      _status: 'new'
    };

    commission.discountSettingItems.push(newDiscount);
    this.onItemChange(commission);
  }

  removeDiscountItem(commission: CommissionItem, index: number): void {
    if (commission.discountSettingItems) {
      const item = commission.discountSettingItems[index];
      if (item._status === 'new') {
        commission.discountSettingItems.splice(index, 1);
      } else {
        item._status = 'deleted';
      }
      this.onItemChange(commission);
    }
  }

  // ========== 導航方法 ==========
  goToNextStep(): void {
    // 驗證資料
    const validation = this.commissionValidator.validate(
      this.getActiveItems(),
      this.currentCommissionType
    );

    if (!validation.isValid) {
      this.messageService.errorBubble(validation.errors.join('\n'));
      return;
    }

    // 顯示警告
    if (validation.warnings.length > 0) {
      console.warn('驗證警告:', validation.warnings);
    }

    // 儲存到工作流程
    this.saveToWorkflow();

    // 導航到下一步 (條件設定)
    this.router.navigate(['account/tls/tls13010v2next3']);
  }

  goToPreviousStep(): void {
    // 儲存當前資料
    this.saveToWorkflow();

    // 返回上一步 (代扣款設定)
    this.router.navigate(['account/tls/tls13010v2next1']);
  }

  goBack(): void {
    // 返回查詢頁面
    this.router.navigate(['account/tls/tls13010v2']);
  }

  private saveToWorkflow(): void {
    this.workflowFacade.setStep3Data(this.commissionItems);
  }

  // ========== 輔助方法 ==========
  get commissionTypeName(): string {
    return this.commissionValidator.getCommissionTypeName(this.currentCommissionType);
  }

  get requiresCommission(): boolean {
    return this.commissionValidator.requiresCommissionSetup(this.currentCommissionType);
  }

  getActiveItems(): CommissionItem[] {
    return this.commissionItems.filter(item => item._status !== 'deleted');
  }

  getActiveDiscounts(commission: CommissionItem): DiscountSettingItem[] {
    return (commission.discountSettingItems || []).filter(item => item._status !== 'deleted');
  }

  get isNewMode(): boolean {
    return this.crudstatus === CRUDStatus.Create;
  }

  get isViewMode(): boolean {
    return this.crudstatus === CRUDStatus.Read;
  }
}
