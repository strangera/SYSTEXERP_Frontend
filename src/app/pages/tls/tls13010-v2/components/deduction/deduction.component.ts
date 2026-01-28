/**
 * TLS13010-V2 代扣款設定組件 (Step 2)
 *
 * 職責：
 * - 代扣款項目設定
 * - 扣款金額與費率設定
 * - 導航到抽成設定頁面
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
import { CheckboxModule } from 'primeng/checkbox';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalendarModule } from 'primeng/calendar';

// 共用組件
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';

// V2 服務與類型
import { WorkflowStep } from '../../core/constants';
import { FareItem } from '../../core/models/deduction';
import { WorkflowFacadeService } from '../../services/workflow';
import { DeductionValidatorService } from '../../services/validation';

// API 服務
import { TLS13010Service } from '@service/api/tls/tls13010.service';

interface CategoryItem {
  id: number;
}

@Component({
  selector: 'app-tls13010v2-deduction',
  templateUrl: './deduction.component.html',
  styleUrls: ['./deduction.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    FormsModule,
    MenubarComponent,
    ButtonComponent,
    ButtonModule,
    TableModule,
    CheckboxModule,
    InputNumberModule,
    CalendarModule
  ]
})
export class DeductionComponent extends BasicCruPageComponent<CategoryItem> implements OnInit, OnDestroy {

  // ========== CRUD 狀態管理 ==========
  override crudstatus: CRUDStatus = CRUDStatus.Create;
  readonly CRUDStatus = CRUDStatus;

  get isFormReadonly(): boolean {
    return this.crudstatus === CRUDStatus.Read;
  }

  // ========== 代扣款資料 ==========
  fareItems: FareItem[] = [];

  // 表格欄位
  columns = [
    { field: 'is_selected', header: '選擇', type: 'checkbox', width: '80px' },
    { field: 'fare_name', header: '扣款項目', type: 'text', width: '200px' },
    { field: 'fare_amount', header: '金額', type: 'number', width: '150px' },
    { field: 'fare_rate', header: '費率(%)', type: 'number', width: '120px' },
    { field: 'fare_bym', header: '起始年月', type: 'text', width: '120px' },
    { field: 'fare_eym', header: '結束年月', type: 'text', width: '120px' },
    { field: 'fare_remark', header: '備註', type: 'text', width: '200px' }
  ];

  private subscriptions: Subscription[] = [];

  constructor(
    public override router: Router,
    private workflowFacade: WorkflowFacadeService,
    private deductionValidator: DeductionValidatorService,
    private apiService: TLS13010Service
  ) {
    super();
  }

  // ========== 生命週期方法 ==========
  ngOnInit(): void {
    this.initializeBasics();
    this.loadFromWorkflow();
    this.loadFareOptions();
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
    const step2Data = this.workflowFacade.getStep2Data();
    if (step2Data && step2Data.length > 0) {
      this.fareItems = step2Data;
    }
  }

  private loadFareOptions(): void {
    // 如果沒有既有資料，初始化空陣列
    // TODO: 未來可從 API 載入預設的扣款項目選項
    if (this.fareItems.length === 0) {
      this.fareItems = [];
    }
  }

  // ========== 事件處理 ==========
  onItemSelect(item: FareItem): void {
    // 標記項目狀態變更
    if (item._status !== 'new') {
      item._status = 'modified';
    }
  }

  onItemChange(item: FareItem): void {
    // 標記項目狀態變更
    if (item._status !== 'new') {
      item._status = 'modified';
    }
  }

  // ========== 導航方法 ==========
  goToNextStep(): void {
    // 驗證資料
    const validation = this.deductionValidator.validate(this.fareItems);

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

    // 導航到下一步 (抽成設定)
    this.router.navigate(['account/tls/tls13010v2next2']);
  }

  goToPreviousStep(): void {
    // 儲存當前資料
    this.saveToWorkflow();

    // 返回上一步 (合約基本資料)
    this.router.navigate(['account/tls/tls13010v2cru']);
  }

  goBack(): void {
    // 返回查詢頁面
    this.router.navigate(['account/tls/tls13010v2']);
  }

  private saveToWorkflow(): void {
    this.workflowFacade.setStep2Data(this.fareItems);
  }

  // ========== 輔助方法 ==========
  get selectedCount(): number {
    return this.deductionValidator.getSelectedCount(this.fareItems);
  }

  get isNewMode(): boolean {
    return this.crudstatus === CRUDStatus.Create;
  }

  get isViewMode(): boolean {
    return this.crudstatus === CRUDStatus.Read;
  }
}
