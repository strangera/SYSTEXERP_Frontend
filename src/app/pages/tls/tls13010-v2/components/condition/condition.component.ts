/**
 * TLS13010-V2 條件設定組件 (Step 4)
 *
 * 職責：
 * - 根據抽成類型顯示對應的條件設定表單
 * - 儲存/更新合約資料
 * - 最終提交工作流程
 */
import { NgIf, NgFor, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
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
import { InputTextModule } from 'primeng/inputtext';

// 共用組件
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';

// V2 服務與類型
import { CommissionType, CommissionTypeLabels } from '../../core/constants';
import { ConditionItem } from '../../core/models/condition';
import { WorkflowFacadeService } from '../../services/workflow';
import { ConditionValidatorService } from '../../services/validation';

// API 服務
import { TLS13010Service } from '@service/api/tls/tls13010.service';

interface CategoryItem {
  id: number;
}

@Component({
  selector: 'app-tls13010v2-condition',
  templateUrl: './condition.component.html',
  styleUrls: ['./condition.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    FormsModule,
    MenubarComponent,
    ButtonComponent,
    ButtonModule,
    TableModule,
    InputNumberModule,
    InputTextModule
  ]
})
export class ConditionComponent extends BasicCruPageComponent<CategoryItem> implements OnInit, OnDestroy {

  // ========== CRUD 狀態管理 ==========
  override crudstatus: CRUDStatus = CRUDStatus.Create;
  readonly CRUDStatus = CRUDStatus;
  readonly CommissionType = CommissionType;

  get isFormReadonly(): boolean {
    return this.crudstatus === CRUDStatus.Read;
  }

  // ========== 條件資料 ==========
  // 使用 any[] 避免聯合類型在模板中的類型問題
  conditionItems: any[] = [];
  currentCommissionType: CommissionType | string = '';

  // 儲存中狀態
  isSaving = false;

  private subscriptions: Subscription[] = [];

  constructor(
    public override router: Router,
    private workflowFacade: WorkflowFacadeService,
    private conditionValidator: ConditionValidatorService,
    private apiService: TLS13010Service
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

    // 取得條件資料
    const step4Data = this.workflowFacade.getStep4Data();
    if (step4Data && step4Data.length > 0) {
      this.conditionItems = step4Data;
    } else {
      // 初始化預設條件
      this.initializeDefaultCondition();
    }
  }

  private initializeDefaultCondition(): void {
    // 根據抽成類型建立預設條件
    if (this.requiresCondition) {
      this.conditionItems = [this.createEmptyCondition()];
    }
  }

  private createEmptyCondition(): any {
    const baseCondition = {
      id: Date.now(),
      _status: 'new'
    };

    // 根據抽成類型添加對應欄位
    switch (this.currentCommissionType) {
      case CommissionType.FIXED_RENT:
        return { ...baseCondition, base_rent: 0 };

      case CommissionType.BASE_RENT_HIGHER:
        return { ...baseCondition, base_rent: 0, cag_charge_rate: 0 };

      case CommissionType.BASE_COMMISSION:
        return { ...baseCondition, package_base: 0, cag_charge_rate: 0 };

      case CommissionType.GRADUATED:
        return {
          ...baseCondition,
          seq_no: 1,
          start_number: 0,
          end_number: 0,
          charge_rate: 0
        };

      case CommissionType.BASE_TIER:
        return {
          ...baseCondition,
          package_base: 0,
          seq_no: 1,
          start_number: 0,
          end_number: 0,
          charge_rate: 0
        };

      default:
        return baseCondition;
    }
  }

  // ========== 事件處理 ==========
  addConditionItem(): void {
    const newItem = this.createEmptyCondition();

    // 如果是層級類型，自動設定序號
    if (this.currentCommissionType === CommissionType.GRADUATED ||
      this.currentCommissionType === CommissionType.BASE_TIER) {
      (newItem as any).seq_no = this.conditionItems.length + 1;
    }

    this.conditionItems = [...this.conditionItems, newItem];
  }

  removeConditionItem(index: number): void {
    const item = this.conditionItems[index];
    if (item._status === 'new') {
      this.conditionItems.splice(index, 1);
      this.conditionItems = [...this.conditionItems];
    } else {
      item._status = 'deleted';
    }
  }

  onItemChange(item: any): void {
    if (item._status !== 'new' && item._status !== 'deleted') {
      item._status = 'modified';
    }
  }

  // ========== 儲存與提交 ==========
  async onSave(): Promise<void> {
    // 驗證資料
    const validation = this.conditionValidator.validate(
      this.getActiveItems(),
      this.currentCommissionType
    );

    if (!validation.isValid) {
      this.messageService.errorBubble(validation.errors.join('\n'));
      return;
    }

    // 儲存到工作流程
    this.workflowFacade.setStep4Data(this.conditionItems);

    // 執行最終儲存
    this.isSaving = true;

    try {
      const submitData = this.workflowFacade.generateSubmitData();

      // TODO: 整合後端 API 後啟用
      // 暫時僅顯示成功訊息並清除資料
      console.log('Submit Data:', submitData);

      const message = this.crudstatus === CRUDStatus.Create ? '合約新增成功' : '合約更新成功';
      this.messageService.successBubble(message);

      // 清除工作流程資料
      this.workflowFacade.clearAllData();

      // 返回查詢頁面
      this.router.navigate(['account/tls/tls13010v2']);
    } catch (error: any) {
      console.error('儲存失敗:', error);
      this.messageService.errorBubble(`儲存失敗: ${error.message || '未知錯誤'}`);
    } finally {
      this.isSaving = false;
    }
  }

  // ========== 導航方法 ==========
  goToPreviousStep(): void {
    // 儲存當前資料
    this.workflowFacade.setStep4Data(this.conditionItems);

    // 返回上一步 (抽成設定)
    this.router.navigate(['account/tls/tls13010v2next2']);
  }

  goBack(): void {
    // 返回查詢頁面
    this.router.navigate(['account/tls/tls13010v2']);
  }

  // ========== 輔助方法 ==========
  get commissionTypeName(): string {
    return CommissionTypeLabels[this.currentCommissionType as CommissionType] || this.currentCommissionType;
  }

  get conditionDescription(): string {
    return this.conditionValidator.getConditionDescription(this.currentCommissionType);
  }

  get requiresCondition(): boolean {
    return this.conditionValidator.requiresConditionSetup(this.currentCommissionType);
  }

  getActiveItems(): any[] {
    return this.conditionItems.filter(item => item._status !== 'deleted');
  }

  get isNewMode(): boolean {
    return this.crudstatus === CRUDStatus.Create;
  }

  get isViewMode(): boolean {
    return this.crudstatus === CRUDStatus.Read;
  }

  // 檢查是否為層級類型（可新增多筆）
  get isGraduatedType(): boolean {
    return this.currentCommissionType === CommissionType.GRADUATED ||
      this.currentCommissionType === CommissionType.BASE_TIER;
  }

  // 取得條件值（用於顯示）
  getConditionValue(item: any, field: string): any {
    return item[field] ?? '';
  }
}
