// tls13010-data-loader.service.ts

import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
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
   * 載入工作流程資料
   * @param component Component 實例
   */
  loadWorkflowData(component: any): void {
    const workflowData = this.contractFlowService.getCurrentData();

    if (workflowData.contractId) {
      // 統一使用 ContractFlowService 的模式判定
      if (this.contractFlowService.isNewContractMode()) {
        this.loadNewModeData(component);
      } else {
        this.loadEditModeData(component, workflowData);
      }
    } else {
      console.warn('❌ 沒有工作流程資料,重導向到查詢頁面');
      this.router.navigate(['account/tls/tls13010']);
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
      component.formInitService.initializeEmptyForm(component.dataForm);
      component.locationData = [];
      component.selectedBankInfo = null;

      setTimeout(() => {
        component.setFormControlsState();
        component.triggerAllDynamicValidators();
      }, 100);
    }
  }

  /**
   * 載入編輯模式資料
   * @param component Component 實例
   * @param workflowData 工作流程資料
   */
  loadEditModeData(component: any, workflowData: any): void {
    console.log('✏️ 載入編輯模式資料');

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
      setTimeout(() => {
        this.loadBusinessClassifications(component, savedFormData.bus_type);
      }, 100);
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

    // 重新設定控制狀態
    setTimeout(() => {
      component.setFormControlsState();
    }, 100);
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
      setTimeout(() => {
        this.loadBusinessClassifications(component, busType);
      }, 100);
    }

    // 重新設定控制狀態
    setTimeout(() => {
      component.setFormControlsState();
    }, 100);
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
      check_typeList: (queryData['check_typeList'] as string[]) || [],
      tlt_term_type: (queryData['tlt_term_type'] as string)?.trim() || '',
      comm_comp_type: queryData['comm_comp_type'] as string || '2',
      store_way: queryData['store_way'] as string,
      rece_yn: queryData['rece_yn'] as string,
      pos_yn: queryData['pos_yn'] as string,
      cash_yn: queryData['cash_yn'] as string,
      org_id: queryData['org_id'] as string,
      overall_status: queryData['overall_status'] as string,
      paytype: queryData['paytype'] as string,
      invoice_type: queryData['invoice_type'] as string,
      tlt_openflag: String(queryData['tlt_openflag'] || '').trim(),

      // 聯絡資訊
      email: queryData['email'] as string,
      invoice_email: queryData['invoice_email'] as string,
      CHECK_TITLE: queryData['CHECK_TITLE'] as string,
      store_tel: queryData['store_tel'] as string,
      bank_id: queryData['bank_id'] as string,
      vendor_acct_name: queryData['vendor_acct_name'] as string,
      vendor_acct_no: queryData['vendor_acct_no'] as string,
      contact_tel: queryData['contact_tel'] as string,
      contact_fax: queryData['contact_fax'] as string,
      contact_addr: queryData['contact_addr'] as string,
      VEN_Address: queryData['VEN_Address'] as string,
      tlt_remark: queryData['tlt_remark'] as string,

      // 其他欄位
      comm_yn: queryData['comm_yn'] as string,
      base_rent: queryData['base_rent'] as number,
      tlt_kind: queryData['tlt_kind'] as string,
      edc_yn: queryData['edc_yn'] as string,
      tlt_ctype_mtotal: queryData['tlt_ctype_mtotal'] as string,
      rent_ahead: queryData['rent_ahead'] as string,
      rent_period: queryData['rent_period'] as number,
      deposit: queryData['deposit'] as number,
      vip_yn: queryData['vip_yn'] as string,
      credit_card: queryData['credit_card'] as string,
      total_amt: queryData['total_amt'] as string,
      total_amt_vendor: queryData['total_amt_vendor'] as string,
      check_day: Number(queryData['check_day']) || 0,
      construct_fees: Number(queryData['construct_fees']) || 0,
      expiration_fees: Number(queryData['expiration_fees']) || 0,
      open_fees: Number(queryData['open_fees']) || 0,
      ticket_remarks: queryData['ticket_remarks'] as string,
      cap_saletype1: queryData['cap_saletype1'] as string,
      cap_saletype2: queryData['cap_saletype2'] as string,
      cap_saletype3: queryData['cap_saletype3'] as string,
      cap_saletype4: queryData['cap_saletype4'] as string,
      cap_saletype5: queryData['cap_saletype5'] as string,
      contact_USR_No: queryData['contact_USR_No'] as string,
      contact_USR_Name: queryData['contact_USR_Name'] as string,
      total_amt_unit: queryData['total_amt_unit'] as string,
      total_amt_vendor_unit: queryData['total_amt_vendor_unit'] as string,
      water_flag: queryData['water_flag'] as string || 'N',
      electric_flag: queryData['electric_flag'] as string || 'N',
      gas_flag: queryData['gas_flag'] as string || 'N',
    };
  }

  // ==================== 下拉選單載入 ====================

  /**
   * 載入所有初始下拉選單選項
   * @param component Component 實例
   * @returns Observable
   */
  loadAllInitialDropdownOptions(component: any): Observable<any> {
    console.log('📥 開始載入所有下拉選單選項');

    return forkJoin({
      // 位置相關(用於 selector panel)
      location: this.loadLocationWithDetailsOptions(component),

      // 廠商選項
      vendor: this.loadPOS2013Options(component),

      // 洽談者選項
      negotiator: this.loadNegotiatorOptions(component),

      // 銀行選項
      bank: this.loadBankDropdownOptions(component),

      // 🆕 新增:大分類選項
      bustype: this.loadBustypeOptions(component),

      // 🆕 新增:Location 相關選項(館別、樓層、區域、組織、單據別)
      locationBundle: this.loadLocationBundleOptions(component)
    }).pipe(
      tap(() => {
        console.log('✅ 所有下拉選單選項載入完成');

        // 🔍 診斷:顯示載入結果
        console.log('📊 下拉選單載入結果:', {
          bustype: component.bustypeOptions?.length || 0,
          building: component.buildingOptions?.length || 0,
          floor: component.floorOptions?.length || 0,
          region: component.regionOptions?.length || 0,
          org: component.orgOptions?.length || 0,
          paperType: component.paperTypeOptions?.length || 0,
          vendor: component.pos2013Options?.length || 0,
          negotiator: component.negotiatorOptions?.length || 0,
          bank: component.bankDropdownOptions?.length || 0
        });
      }),
      catchError(error => {
        console.error('❌ 載入下拉選單選項失敗:', error);
        this.messageService.errorBubble('載入選項資料失敗,請重新整理頁面');
        return of(null);
      })
    );
  }

  /**
   * 🆕 載入大分類選項
   * @param component Component 實例
   * @returns Observable
   */
  loadBustypeOptions(component: any): Observable<DropdownOption[]> {
    console.log('🔄 載入大分類選項');

    // 等待 Service 初始化
    return new Observable<DropdownOption[]>(observer => {
      // 延遲一點時間,確保 Service 初始化完成
      setTimeout(() => {
        if (this.tls13010DropdownService.bustypeOptions &&
          this.tls13010DropdownService.bustypeOptions.length > 0) {
          // Service 已經載入完成
          component.bustypeOptions = this.tls13010DropdownService.bustypeOptions;
          console.log('✅ 大分類載入完成(使用 Service 快取):', component.bustypeOptions.length);
          observer.next(component.bustypeOptions);
          observer.complete();
        } else {
          // Service 還沒載入完成,等待更久一點
          console.log('⏳ 等待大分類選項載入...');
          setTimeout(() => {
            component.bustypeOptions = this.tls13010DropdownService.bustypeOptions || [];
            console.log('✅ 大分類載入完成:', component.bustypeOptions.length);

            if (component.bustypeOptions.length === 0) {
              console.warn('⚠️ 大分類選項為空,可能需要檢查 API');
            }

            observer.next(component.bustypeOptions);
            observer.complete();
          }, 1000);
        }
      }, 300);
    }).pipe(
      catchError(error => {
        console.error('❌ 載入大分類失敗:', error);
        component.bustypeOptions = [];
        this.messageService.warnBubble('載入大分類選項失敗');
        return of<DropdownOption[]>([]);
      })
    );
  }

  /**
   * 🆕 載入 Location 相關選項(館別、樓層、區域、組織、單據別)
   * @param component Component 實例
   * @returns Observable
   */
  loadLocationBundleOptions(component: any): Observable<any> {
    console.log('🔄 批次載入 Location 相關選項');

    return forkJoin({
      building: this.locationOptionsService.getBuildingOptions(),
      floor: this.locationOptionsService.getFloorOptions(),
      region: this.locationOptionsService.getRegionOptions(),
      org: this.locationOptionsService.getOrgOptions(),
      paperType: this.locationOptionsService.getPaperTypeOptions('T101')
    }).pipe(
      tap(results => {
        // 將結果設定到 Component 屬性
        component.buildingOptions = results.building;
        component.floorOptions = results.floor;
        component.regionOptions = results.region;
        component.orgOptions = results.org;
        component.paperTypeOptions = results.paperType;

        console.log('✅ Location 選項批次載入完成:', {
          building: results.building.length,
          floor: results.floor.length,
          region: results.region.length,
          org: results.org.length,
          paperType: results.paperType.length
        });

        // 檢查是否有空陣列
        if (results.building.length === 0) {
          console.warn('⚠️ 館別選項為空');
        }
        if (results.floor.length === 0) {
          console.warn('⚠️ 樓層選項為空');
        }
        if (results.region.length === 0) {
          console.warn('⚠️ 區域選項為空');
        }
        if (results.org.length === 0) {
          console.warn('⚠️ 組織選項為空');
        }
      }),
      catchError(error => {
        console.error('❌ 載入 Location 選項失敗:', error);

        // 設定為空陣列
        component.buildingOptions = [];
        component.floorOptions = [];
        component.regionOptions = [];
        component.orgOptions = [];
        component.paperTypeOptions = [];

        this.messageService.warnBubble('載入位置相關選項失敗');

        return of({
          building: [],
          floor: [],
          region: [],
          org: [],
          paperType: []
        });
      })
    );
  }

  /**
   * 載入位置詳細選項
   * @param component Component 實例
   * @returns Observable
   */
  loadLocationWithDetailsOptions(component: any): Observable<DropdownOption[]> {
    const workflowData = this.contractFlowService.getCurrentData();
    const talentId = workflowData.queryRowData?.talent_id;

    return this.locationOptionsService.getLocationWithDetailsOptions(talentId).pipe(
      tap((data: DropdownOption[]) => {
        component.locationWithDetailsOptions = data;

        // 資料載入完成後,更新 selector 面板選項
        setTimeout(() => {
          component.updateSelectorPanelOptions();
        }, 100);
      }),
      catchError(err => {
        console.warn('❌ 載入位置選項失敗:', err);
        this.messageService.warnBubble('載入位置選項失敗,請重新整理頁面');
        return of([]);
      })
    );
  }

  /**
   * 載入 POS2013 廠商選項
   * @param component Component 實例
   * @returns Observable
   */
  loadPOS2013Options(component: any): Observable<Pos2013DropdownOption[]> {
    return this.vendorCategoryService.getVendorCategoryNoNameOptions("1").pipe(
      tap((response: any[]) => {
        component.pos2013Options = response;
      }),
      catchError(error => {
        console.error('❌ 載入POS2013選項失敗:', error);
        component.pos2013Options = [];
        this.messageService.warnBubble('載入廠商選項失敗,請重新整理頁面');
        return of([]);
      })
    );
  }

  /**
   * 載入洽談者選項
   * @param component Component 實例
   * @returns Observable
   */
  loadNegotiatorOptions(component: any): Observable<DropdownOption[]> {
    return this.negotiatorService.getNegotiatorOptions().pipe(
      tap((response: any[]) => {
        component.negotiatorOptions = response;
      }),
      catchError(error => {
        console.error('❌ 載入洽談者選項失敗:', error);
        component.negotiatorOptions = [];
        this.messageService.warnBubble('載入洽談者選項失敗');
        return of([]);
      })
    );
  }

  /**
   * 載入銀行下拉選項
   * @param component Component 實例
   * @returns Observable
   */
  loadBankDropdownOptions(component: any): Observable<DropdownOption[]> {
    return this.bankService.getBankOptions('').pipe(
      tap((options: DropdownOption[]) => {
        component.bankDropdownOptions = options;
      }),
      catchError(err => {
        console.warn('⚠️ 載入銀行選項失敗:', err);
        component.bankDropdownOptions = [];
        this.messageService.warnBubble('載入銀行選項失敗');
        return of([]);
      })
    );
  }

  // ==================== 業務分類載入 ====================

  /**
   * 載入業務分類
   * @param component Component 實例
   * @param busType 大分類代碼
   */
  loadBusinessClassifications(component: any, busType: string | undefined): void {
    if (!busType) return;

    const currentBusClass = component.dataForm.get('bus_class')?.value;
    const currentBusSClass = component.dataForm.get('bus_sclass')?.value;

    // 先載入中分類
    this.tls13010DropdownService.loadBusClassOptions(busType).subscribe({
      next: (busClassOptions: DropdownOption[]) => {
        const validBusClass = busClassOptions.find(option => option.value === currentBusClass);

        if (currentBusClass && validBusClass) {
          // 中分類有效,載入小分類
          this.loadBusSClassWithValidation(component, busType, currentBusClass, currentBusSClass ?? undefined);
        } else if (currentBusClass && !validBusClass) {
          console.warn('❌ 中分類無效,清空相關欄位');
          // 中分類無效,清空相關欄位
          component.dataForm.get('bus_class')?.setValue('');
          component.dataForm.get('bus_sclass')?.setValue('');
        }
      },
      error: (err) => {
        console.error('載入中分類失敗:', err);
        this.messageService.warnBubble('載入中分類選項失敗,請重新選擇大分類');
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
  loadBusSClassWithValidation(
    component: any,
    busType: string,
    busClass: string,
    currentBusSClass?: string
  ): void {
    this.tls13010DropdownService.loadBusSClassOptions(busType, busClass).subscribe({
      next: (busSClassOptions: DropdownOption[]) => {
        if (currentBusSClass) {
          const validBusSClass = busSClassOptions.find(option => option.value === currentBusSClass);

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

          // 延遲一點再載入工作流程資料,確保初始化完成
          setTimeout(() => {
            this.loadWorkflowData(component);
          }, 100);

          return true;
        } else {
          console.error('❌ 工作流程初始化失敗');
          this.messageService.errorBubble('載入資料失敗,請重新選擇要檢視的項目');
          this.router.navigate(['account/tls/tls13010']);
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
      this.router.navigate(['account/tls/tls13010']);
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
            contact_fax: potentialData.VEN_BossFax || ''
          }, { emitEvent: true });

          console.log('✅ 已載入潛在客戶資料');
          return true;
        } else {
          // 清空欄位
          formGroup.patchValue({
            tlt_name: '',
            bus_type: '',
            contact_tel: '',
            contact_fax: ''
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
          contact_fax: ''
        }, { emitEvent: true });

        return of(false);
      })
    );
  }
}
