import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import { VendorCategoryOptionsService } from '@service/api/dropdownservice/vendor-category-options.service';
import { NegotiatorOptionsService } from '@service/api/dropdownservice/negotiator-options.service';
import { NotificationService } from '@shared/component/notification-message/notification.service';
import { LocationDataManagementService } from './location-data-management.service';
import { ContractFlowService } from '@pages/tls/tls13010/services/contract-flow.service';
import { TLS13010Service } from '@service/api/tls/tls13010.service';
import { LocationOptionsService } from '@service/api/dropdownservice/location-options.service';
import { BankOptionsService } from '@service/api/dropdownservice/bank-option.service';
import { DropdownOption, Pos2013DropdownOption, TLS13010DropdownService } from '@pages/tls/tls13010/tls13010.dropdown';
import { Tls12010Service } from '@service/api/tls/tls12010.service';


/**
 * TLS13010 資料載入服務
 * 負責所有資料載入、轉換和初始化邏輯
 * ✅ 已修正：加入 session 資料檢查，避免重複打 API
 */
@Injectable({
  providedIn: 'root'
})
export class TLS13010DataLoaderService {

  constructor(
    private contractFlowService: ContractFlowService,
    private tls13010Service: TLS13010Service,
    private tls12010Service: Tls12010Service,
    private locationOptionsService: LocationOptionsService,
    private vendorCategoryService: VendorCategoryOptionsService,
    private negotiatorService: NegotiatorOptionsService,
    private bankService: BankOptionsService,
    private tls13010DropdownService: TLS13010DropdownService,
    private locationManagementService: LocationDataManagementService,
    private messageService: NotificationService,
    private router: Router
  ) { }

  // ==================== 主要載入方法 ====================

  /**
   * ✅ 修正：載入工作流程資料（加入 session 檢查）
   * @param component Component 實例
   */
  loadWorkflowData(component: any): void {
    const workflowData = this.contractFlowService.getCurrentData();

    if (workflowData.contractId) {
      // 統一使用 ContractFlowService 的模式判定
      if (this.contractFlowService.isNewContractMode()) {
        this.loadNewModeData(component);
      } else if (this.contractFlowService.isViewMode()) {
        // ✅ 檢視模式：跳過 session，由 loadDataIfNeeded 從 API 載入最新資料
        console.log('🔍 檢視模式：跳過 session 載入，等待 API 載入最新資料');
      } else {
        // ✅ 編輯模式：先檢查 session
        this.loadEditModeDataWithSessionCheck(component, workflowData);
      }
    } else {
      console.warn('❌ 沒有工作流程資料,重導向到查詢頁面');
      this.router.navigate(['account/tls/tls13010'], {
        state: { fromRoute: this.router.url }
      });
    }
  }

  /**
   * 載入新增模式資料
   * @param component Component 實例
   */
  loadNewModeData(component: any): void {
    console.log('📝 載入新增模式資料');

    // 檢查是否有暫存的 Step1 資料
    const savedFormData = this.contractFlowService.getStep1Data();

    if (savedFormData && Object.keys(savedFormData).length > 0) {
      this.loadSavedFormData(component, savedFormData);
    } else {
      component.tlsBaseService.initializeEmptyForm(component.dataForm, 'TLS13010');
      component.locationData = [];
      component.selectedBankInfo = null;

      // ✅ 使用 queueMicrotask 替代 setTimeout(0)
      queueMicrotask(() => {
        component.setFormControlsState();
        component.triggerAllDynamicValidators();
      });
    }
  }

  /**
   * ✅ 新增：編輯模式資料載入（先檢查 session）
   * @param component Component 實例
   * @param workflowData 工作流程資料
   */
  private loadEditModeDataWithSessionCheck(component: any, workflowData: any): void {
    console.log('✏️ 載入編輯模式資料（先檢查 session）');

    const savedFormData = this.contractFlowService.getStep1Data();

    // ✅ 關鍵修正：檢查 session 資料是否完整且有效
    if (savedFormData && this.isSessionDataValid(savedFormData)) {
      console.log('✅ Session 資料有效，使用 session（不打 API）');
      this.loadSavedFormData(component, savedFormData);
    } else {
      // ❌ Session 無資料或資料不完整，才從 API 載入
      console.log('⚠️ Session 無有效資料，需要從 API 載入');
      this.loadEditModeData(component, workflowData);
    }
  }

  /**
   * ✅ 新增：檢查 session 資料是否有效且完整
   * @param step1Data Session 中的 step1 資料
   * @returns 是否有效
   */
  private isSessionDataValid(step1Data: any): boolean {
    if (!step1Data || typeof step1Data !== 'object') {
      console.log('❌ Session 資料不存在或格式錯誤');
      return false;
    }

    // ✅ 檢查關鍵必填欄位
    const requiredFields = [
      'talent_id',    // 專櫃ID
      'tlt_no',       // 專櫃編號
      'tlt_name',     // 專櫃名稱
      'ven_no',       // 廠商編號
      'tlt_bdate',    // 合約起日
      'tlt_edate'     // 合約迄日
    ];

    for (const field of requiredFields) {
      const value = step1Data[field];

      if (value === null || value === undefined || value === '') {
        console.log(`⚠️ Session 資料缺少必填欄位: ${field}，當前值:`, value);
        return false;
      }
    }

    // ✅ 額外檢查：確保日期欄位有效
    const dateFields = ['tlt_bdate', 'tlt_edate'];
    for (const field of dateFields) {
      const dateValue = step1Data[field];

      // 接受 Date 物件或有效的日期字串
      if (dateValue instanceof Date) {
        if (isNaN(dateValue.getTime())) {
          console.log(`⚠️ 日期欄位 ${field} 無效:`, dateValue);
          return false;
        }
      } else if (typeof dateValue === 'string') {
        const parsedDate = new Date(dateValue);
        if (isNaN(parsedDate.getTime())) {
          console.log(`⚠️ 日期欄位 ${field} 無法解析:`, dateValue);
          return false;
        }
      } else {
        console.log(`⚠️ 日期欄位 ${field} 格式不正確:`, dateValue);
        return false;
      }
    }

    console.log('✅ Session 資料驗證通過，所有必填欄位完整');
    return true;
  }

  /**
   * 載入編輯模式資料（原有方法，現在只在 session 無效時使用）
   * @param component Component 實例
   * @param workflowData 工作流程資料
   */
  loadEditModeData(component: any, workflowData: any): void {
    console.log('✏️ 從 API 載入編輯模式資料');

    const savedFormData = this.contractFlowService.getStep1Data();

    if (savedFormData && Object.keys(savedFormData).length > 0) {
      this.loadSavedFormData(component, savedFormData);
    } else if (workflowData.queryRowData) {
      this.loadDataFromQueryResult(component, workflowData.queryRowData);

      //  確保載入既有位置資料
      const currentTalentId = this.contractFlowService.getCurrentTalentId();
      if (currentTalentId) {
        this.loadExistingLocationData(component, currentTalentId);
      }
    }
  }

  /**
   * 載入暫存表單資料
   * @param component Component 實例
   * @param savedFormData 暫存的表單資料
   */
  loadSavedFormData(component: any, savedFormData: any): void {
    console.log('💾 載入暫存表單資料');

    // ✅ 防禦性檢查:確保 check_type 已轉換為 check_typeList
    if ((!savedFormData.check_typeList || savedFormData.check_typeList.length === 0) && savedFormData.check_type) {
      const checkTypeStr = String(savedFormData.check_type);
      savedFormData.check_typeList = checkTypeStr.split(',').filter((x: string) => x.trim()).filter((x: string) => x);
      console.log(`✅ Session 資料 check_type "${checkTypeStr}" 已轉換為 check_typeList:`, savedFormData.check_typeList);
    }

    // ✅ 額外防護：如果 check_typeList 仍然是空陣列但 check_type 有值，強制轉換
    if (savedFormData.check_type && Array.isArray(savedFormData.check_typeList) && savedFormData.check_typeList.length === 0) {
      const checkTypeStr = String(savedFormData.check_type);
      if (checkTypeStr && checkTypeStr !== '' && checkTypeStr !== 'null' && checkTypeStr !== 'undefined') {
        savedFormData.check_typeList = checkTypeStr.split(',').map((x: string) => x.trim()).filter((x: string) => x);
        console.log(`🔧 強制轉換 check_type "${checkTypeStr}" 為 check_typeList:`, savedFormData.check_typeList);
      }
    }

    // 載入表單資料
    component.dataForm.patchValue(savedFormData);

    // 載入銀行資訊
    if (savedFormData.selectedBankInfo) {
      component.selectedBankInfo = savedFormData.selectedBankInfo;
    } else {
      component.selectedBankInfo = null;
    }

    // 載入分類資料
    if (savedFormData.bus_type) {
      // ✅ 使用 queueMicrotask 替代 setTimeout
      queueMicrotask(() => {
        this.loadBusinessClassifications(component, savedFormData.bus_type);
      });
    }

    // 載入位置資料
    if (savedFormData.locationInfo && Array.isArray(savedFormData.locationInfo) && savedFormData.locationInfo.length > 0) {
      component.locationData = savedFormData.locationInfo.map((item: any) => ({
        ...item,
        _status: item._status || 'original',
        _isNew: item._isNew || false
      }));
    } else {
      const currentTalentId = this.contractFlowService.getCurrentTalentId();
      if (currentTalentId && !this.contractFlowService.isNewContractMode()) {
        this.loadExistingLocationData(component, currentTalentId);
      } else {
        component.locationData = [];
      }
    }

    // ✅ 使用 queueMicrotask 替代 setTimeout
    queueMicrotask(() => {
      component.setFormControlsState();
      component.triggerAllDynamicValidators();
    });
  }

  /**
   * 從查詢結果載入資料
   * @param component Component 實例
   * @param queryData 查詢資料
   */
  loadDataFromQueryResult(component: any, queryData: Record<string, unknown>): void {
    console.log('🔍 從查詢結果載入資料');

    const venUniform = queryData['ven_uniform'] as string;  // "00000000"
    const venNo = queryData['ven_no'] as string;            // "00000000-2"

    let matchedVendorVenNo = '';

    if (venNo && venNo.includes('-')) {
      // 優先用 ven_no
      matchedVendorVenNo = venNo;
    } else if (venUniform) {
      // 用統編找
      const matchedOption = component.pos2013Options.find((opt: any) => opt.No === venUniform);
      if (matchedOption) {
        matchedVendorVenNo = matchedOption.VEN_No;
      }
    }

    // 使用轉換方法設定表單值
    const formData = this.transformQueryDataToFormData(queryData, matchedVendorVenNo, venUniform, venNo);
    component.dataForm.patchValue(formData);

    // 載入業務分類
    const busType = queryData['bus_type'] as string;
    if (busType) {
      // ✅ 使用 queueMicrotask 替代 setTimeout
      queueMicrotask(() => {
        this.loadBusinessClassifications(component, busType);
      });
    }

    // ✅ 使用 queueMicrotask 替代 setTimeout
    queueMicrotask(() => {
      component.setFormControlsState();
    });
  }

  /**
   * 轉換查詢資料為表單資料格式
   * @param queryData 查詢資料
   * @param matchedVendorVenNo 匹配的廠商完整編號
   * @param venUniform 統編
   * @param venNo 廠商編號
   * @returns 表單資料格式
   */
  private transformQueryDataToFormData(
    queryData: Record<string, unknown>,
    matchedVendorVenNo: string,
    venUniform: string,
    venNo: string
  ): any {
    // ✅ 處理 check_type 轉換為 check_typeList
    let checkTypeList = (queryData['check_typeList'] as string[]) || [];

    // 如果 check_typeList 是空的,但 check_type 有值,則進行轉換
    if ((!checkTypeList || checkTypeList.length === 0) && queryData['check_type']) {
      const checkTypeStr = String(queryData['check_type']);
      if (checkTypeStr && checkTypeStr !== '' && checkTypeStr !== 'null' && checkTypeStr !== 'undefined') {
        checkTypeList = checkTypeStr.split(',').map((x: string) => x.trim()).filter((x: string) => x);
        console.log(`✅ check_type "${checkTypeStr}" 已轉換為 check_typeList:`, checkTypeList);
      }
    }

    // ✅ 額外防護：如果 check_typeList 仍然是空陣列但 check_type 有值，強制轉換
    if (queryData['check_type'] && Array.isArray(checkTypeList) && checkTypeList.length === 0) {
      const checkTypeStr = String(queryData['check_type']);
      if (checkTypeStr && checkTypeStr !== '' && checkTypeStr !== 'null' && checkTypeStr !== 'undefined') {
        checkTypeList = checkTypeStr.split(',').map((x: string) => x.trim()).filter((x: string) => x);
        console.log(`🔧 強制轉換 check_type "${checkTypeStr}" 為 check_typeList:`, checkTypeList);
      }
    }

    return {
      vendor_ven_no: matchedVendorVenNo,
      vendor_no: venUniform,

      // 基本資訊
      talent_id: queryData['talent_id'] as string,
      apply_no: queryData['apply_no'] as string,
      tlt_name: queryData['tlt_name'] as string,
      tlt_no: queryData['tlt_no'] as string,
      ven_no: venNo || venUniform,
      VEN_Name: queryData['VEN_Name'] as string,
      ven_uniform: venUniform,
      paper_type: queryData['paper_type'] as string,
      bus_type: queryData['bus_type'] as string,
      bus_class: queryData['bus_class'] as string,
      bus_sclass: queryData['bus_sclass'] as string,
      contract_subno: queryData['contract_subno'] as string,
      approve_status: queryData['approve_status'] as string,

      // 合約資訊
      feedback_date: queryData['feedback_date'] as string,
      due_date: queryData['due_date'] as string,
      tlt_bdate: queryData['tlt_bdate'] as string,
      tlt_edate: queryData['tlt_edate'] as string,
      contact_Date: queryData['contact_Date'] as string,
      tlt_contract_bdate: queryData['tlt_contract_bdate'] as string,
      tlt_contract_edate: queryData['tlt_contract_edate'] as string,

      // 商務條件
      deco_type: queryData['deco_type'] as string,
      money_type: queryData['money_type'] as string,
      check_typeList: checkTypeList,
      tlt_term_type: (queryData['tlt_term_type'] as string)?.trim() || '',
      comm_comp_type: queryData['comm_comp_type'] as string || '2',
      store_way: queryData['store_way'] as string,
      rece_yn: queryData['rece_yn'] as string,
      pos_yn: queryData['pos_yn'] as string,
      cash_yn: queryData['cash_yn'] as string,
      tlt_ctypemtotal: queryData['tlt_ctypemtotal'] as string,
      contract_type: queryData['contract_type'] as string,
      total_amt_unit: queryData['total_amt_unit'] as string,
      total_amt_vendor_unit: queryData['total_amt_vendor_unit'] as string,
      org_id: queryData['org_id'] as string,
      vip_yn: queryData['vip_yn'] as string,
      rent_ahead: queryData['rent_ahead'] as string,
      card_sales: queryData['card_sales'] as number,

      // 金額欄位
      monthly_rent: queryData['monthly_rent'] as number,
      rent_after_months: queryData['rent_after_months'] as number,
      rent_after: queryData['rent_after'] as number,
      rent_amount: queryData['rent_amount'] as number,
      open_deposit: queryData['open_deposit'] as string,
      open_fees: queryData['open_fees'] as number,
      construct_deposit: queryData['construct_deposit'] as string,
      construct_fees: queryData['construct_fees'] as number,
      expiration_deposit: queryData['expiration_deposit'] as string,
      expiration_fees: queryData['expiration_fees'] as number,

      // 聯絡資訊
      contact_USR_No: queryData['contact_USR_No'] as string,
      contact_USR_Name: queryData['contact_USR_Name'] as string,
      contact_tel: queryData['contact_tel'] as string,
      contact_fax: queryData['contact_fax'] as string,
      contact_email: queryData['contact_email'] as string,
      contact_usr_email: queryData['contact_usr_email'] as string,
      vendor_contact: queryData['vendor_contact'] as string,
      vendor_tel: queryData['vendor_tel'] as string,
      vendor_fax: queryData['vendor_fax'] as string,
      vendor_email: queryData['vendor_email'] as string,
      vendor_address: queryData['vendor_address'] as string,

      // 結算資訊
      settle_day: queryData['settle_day'] as number,
      paydays: queryData['paydays'] as number,
      paytype: queryData['paytype'] as string,
      payday: queryData['payday'] as number,
      due_days: queryData['due_days'] as number,
      invoice_type: queryData['invoice_type'] as string,

      // 其他資訊
      openflag: queryData['openflag'] as string,
      tlt_status: queryData['tlt_status'] as string,
      contract_desc: queryData['contract_desc'] as string,
      bank_code: queryData['bank_code'] as string,
      bank_name: queryData['bank_name'] as string,
      bank_account: queryData['bank_account'] as string,
      bank_account_name: queryData['bank_account_name'] as string,
      meter_type: queryData['meter_type'] as string,
      meter_reading: queryData['meter_reading'] as string,
    };
  }

  // ==================== 業務分類相關 ====================

  /**
   * 載入業務分類選項
   * @param component Component 實例
   * @param busType 大分類
   */
  loadBusinessClassifications(component: any, busType: string): void {
    if (!busType) {
      console.warn('⚠️ busType 為空,無法載入分類');
      return;
    }

    console.log('📂 載入業務分類:', busType);

    const currentBusClass = component.dataForm.get('bus_class')?.value;
    const currentBusSClass = component.dataForm.get('bus_sclass')?.value;

    // 載入中分類
    this.tls13010DropdownService.loadBusClassOptions(busType).subscribe({
      next: (options: DropdownOption[]) => {
        console.log(` 中分類已載入 (${options.length} 個)`);

        // 驗證中分類是否有效
        if (currentBusClass) {
          const validBusClass = options.find(option => option.value === currentBusClass);

          if (validBusClass) {
            console.log(' 中分類有效,載入小分類');
            // 中分類有效,載入小分類
            this.loadBusSClassAndValidate(component, busType, currentBusClass, currentBusSClass);
          } else {
            console.warn('❌ 中分類無效,清空中分類和小分類');
            // 中分類無效,清空兩個欄位
            component.dataForm.get('bus_class')?.setValue('');
            component.dataForm.get('bus_sclass')?.setValue('');
          }
        }
      },
      error: (err) => {
        console.error('❌ 載入中分類失敗:', err);
        this.messageService.warnBubble('載入中分類選項失敗');
      }
    });
  }

  /**
   * 載入並驗證小分類
   * @param component Component 實例
   * @param busType 大分類
   * @param busClass 中分類
   * @param currentBusSClass 當前小分類值
   */
  private loadBusSClassAndValidate(
    component: any,
    busType: string,
    busClass: string,
    currentBusSClass: string
  ): void {
    this.tls13010DropdownService.loadBusSClassOptions(busType, busClass).subscribe({
      next: (options: DropdownOption[]) => {
        console.log(` 小分類已載入 (${options.length} 個)`);

        // 驗證小分類是否有效
        if (currentBusSClass) {
          const validBusSClass = options.find(option => option.value === currentBusSClass);

          if (validBusSClass) {
            // 小分類有效,確保表單值正確
            component.dataForm.get('bus_sclass')?.setValue(currentBusSClass);
          } else {
            console.warn('❌ 小分類無效,清空欄位');
            // 小分類無效,清空欄位
            component.dataForm.get('bus_sclass')?.setValue('');
          }
        }
      },
      error: (err) => {
        console.error('載入小分類失敗:', err);
        this.messageService.warnBubble('載入小分類選項失敗');
      }
    });
  }

  /**
   * 載入並驗證小分類(用於動態變更)
   * @param component Component 實例
   * @param busType 大分類
   * @param busClass 中分類
   */
  loadAndValidateBusSClass(component: any, busType: string, busClass: string): void {
    this.tls13010DropdownService.loadBusSClassOptions(busType, busClass).subscribe({
      next: (options: DropdownOption[]) => {
        const currentBusSClass = component.dataForm.get('bus_sclass')?.value;

        if (currentBusSClass) {
          const validBusSClass = options.find(option => option.value === currentBusSClass);

          if (!validBusSClass) {
            // 小分類無效時清空
            component.dataForm.get('bus_sclass')?.setValue('');
          } else {
            console.log(' 小分類有效,保持原值');
          }
        }
      },
      error: (err) => {
        console.error('❌ 載入小分類失敗:', err);
        this.messageService.warnBubble('載入小分類選項失敗');
        component.dataForm.get('bus_sclass')?.setValue('');
      }
    });
  }

  /**
   * 確保分類資料已載入
   * @param component Component 實例
   * @param busType 大分類
   */
  ensureClassificationDataLoaded(component: any, busType: string): void {
    const currentBusClass = component.dataForm.get('bus_class')?.value;
    const currentBusSClass = component.dataForm.get('bus_sclass')?.value;

    console.log('🔍 確認分類資料:', { busType, currentBusClass, currentBusSClass });

    // 檢查中分類選項是否已載入
    if (currentBusClass && this.tls13010DropdownService.busClassOptions.length === 0) {
      console.log('🔄 重新載入中分類選項');
      this.tls13010DropdownService.loadBusClassOptions(busType).subscribe();
    }

    // 檢查小分類選項是否已載入
    if (currentBusClass && currentBusSClass && this.tls13010DropdownService.busSClassOptions.length === 0) {
      console.log('🔄 重新載入小分類選項');
      this.tls13010DropdownService.loadBusSClassOptions(busType, currentBusClass).subscribe();
    }
  }

  // ==================== 位置資料載入 ====================

  /**
   * 載入既有的位置資料
   * @param component Component 實例
   * @param talentId 專櫃ID
   */
  private loadExistingLocationData(component: any, talentId: string): void {
    this.locationManagementService.loadExistingLocationData(
      talentId,
      component.locationWithDetailsOptions
    ).subscribe({
      next: (locationData) => {
        component.locationData = locationData;
        // 強制觸發變更檢測
        component.locationData = [...component.locationData];
      },
      error: (err) => {
        console.warn('載入位置資料失敗:', err);
      }
    });
  }

  // ==================== Router State 處理 ====================

  /**
   * 處理 Router State (從其他程式跳轉進來)
   * @param component Component 實例
   * @returns Promise<boolean> 是否成功
   */
  async handleRouterState(component: any): Promise<boolean> {
    try {
      const navigation = this.router.getCurrentNavigation();
      const routerState = navigation?.extras?.state;

      console.log('🔍 檢查 router state:', routerState);

      if (routerState && (routerState['mode'] || routerState['talentId'])) {
        // 從其他程式跳轉進來
        console.log('🚀 從其他程式跳轉,初始化工作流程');

        const success = await this.contractFlowService.initializeFromRouterState(routerState);

        if (success) {
          console.log(' 工作流程初始化成功');

          // ✅ 使用 Promise.resolve().then() 確保初始化完成後載入
          // ✅ 檢視模式不再二次載入，避免 session 覆蓋 API 資料
          if (!this.contractFlowService.isViewMode()) {
            Promise.resolve().then(() => {
              this.loadWorkflowData(component);
            });
          } else {
            console.log('🔍 檢視模式：跳過延遲載入，由 loadDataIfNeeded 處理');
          }

          return true;
        } else {
          console.error('❌ 工作流程初始化失敗');
          this.messageService.errorBubble('載入資料失敗,請重新選擇要檢視的項目');
          this.router.navigate(['account/tls/tls13010'], {
            state: { fromRoute: this.router.url }
          });
          return false;
        }

      } else {
        // 正常流程:從查詢頁面進來,不做額外處理
        console.log('📋 正常流程,將在後續載入工作流程資料');
        return true;
      }

    } catch (error) {
      console.error('❌ 處理 router state 失敗:', error);
      this.messageService.errorBubble('初始化失敗,請重新操作');
      this.router.navigate(['account/tls/tls13010'], {
        state: { fromRoute: this.router.url }
      });
      return false;
    }
  }

  // ==================== 資料驗證 ====================

  /**
   * 驗證工作流程資料
   */
  validateWorkflowData(): void {
    const savedData = this.contractFlowService.getStep1Data();
    console.log('🔍 暫存資料驗證:');

    if (!savedData) {
      console.log('❌ 沒有暫存資料');
      return;
    }

    console.log('📋 暫存資料基本資訊:', {
      talent_id: savedData.talent_id,
      apply_no: savedData.apply_no,
      tlt_name: savedData.tlt_name
    });

    if (savedData.locationInfo) {
      console.log('🔍 暫存位置資料:', {
        類型: Array.isArray(savedData.locationInfo) ? '陣列' : typeof savedData.locationInfo,
        數量: Array.isArray(savedData.locationInfo) ? savedData.locationInfo.length : '非陣列',
        內容: savedData.locationInfo
      });

      if (Array.isArray(savedData.locationInfo)) {
        savedData.locationInfo.forEach((item: any, index: number) => {
          console.log(`  ${index + 1}. ID: ${item.id}, 位置: ${item.location_no}, 狀態: ${item._status}`);
        });
      }
    } else {
      console.log('🔭 沒有位置暫存資料');
    }
  }

  /**
 * 根據廠商統編載入潛在客戶資料
 * @param vendorNo 廠商統編
 * @param formGroup 要更新的表單
 */
  loadPotentialCustomerData(
    vendorNo: string,
    formGroup: FormGroup
  ): Observable<boolean> {
    const request = {
      PageSize: 1,
      PageIndex: 1,
      OrderBy: "",
      Offset: 0,
      SortBy: [],
      CreatedDateStart: null,
      CreatedDateEnd: null,
      contact_USR_Name: "",
      cus_uniform_id: [vendorNo],
      VEN_Name: "",
      VEN_EngName: "",
      tlt_name: "",
      tlt_EngName: "",
      bus_type: []
    };

    return this.tls12010Service.queryTLS12010(request).pipe(
      map(result => {
        if (result.Data && result.Data.length > 0) {
          const potentialData = result.Data[0];

          // 回填欄位
          formGroup.patchValue({
            tlt_name: potentialData.tlt_name || '',
            bus_type: potentialData.bus_type || '',
            contact_tel: potentialData.VEN_BossTel || '',
            contact_fax: potentialData.VEN_BossFax || '',
            contact_addr: potentialData.VEN_Addr || ''  // 郵寄地址帶入 VEN_Addr
          }, { emitEvent: true });

          console.log('✅ 已載入潛在客戶資料');
          return true;
        } else {
          // 清空欄位
          formGroup.patchValue({
            tlt_name: '',
            bus_type: '',
            contact_tel: '',
            contact_fax: '',
            contact_addr: ''
          }, { emitEvent: true });

          console.log('⚠️ 查無潛在客戶資料');
          return false;
        }
      }),
      catchError(err => {
        console.error('❌ 載入潛在客戶資料失敗:', err);

        // 清空欄位
        formGroup.patchValue({
          tlt_name: '',
          bus_type: '',
          contact_tel: '',
          contact_fax: '',
          contact_addr: ''
        }, { emitEvent: true });

        return of(false);
      })
    );
  }
}
