import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { SHARED_DROPDOWN_OPTIONS, DropdownOption } from '../constants/business.constants';
import { environment } from '../../../environments/environment';
// API 服務注入
import { Sysb800DropdownService } from '../../service/api/sys/sysb800-dropdown.service';
import { Sysb900DropdownService } from '../../service/api/sys/sysb900-dropdown.service';
import { LocationOptionsService } from '../../service/api/dropdownservice/location-options.service';
import { VendorCategoryOptionsService } from '../../service/api/dropdownservice/vendor-category-options.service';
import { NegotiatorOptionsService } from '../../service/api/dropdownservice/negotiator-options.service';
import { BankOptionsService } from '@service/api/dropdownservice/bank-option.service';
import { BussclassDropdownService } from '@service/api/dropdownservice/tltbussclass-options.service';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class SharedDropdownService {

  // ========== 固定選項 (來自 constants，不需要 API) ==========
  public readonly decorationOptions = [...SHARED_DROPDOWN_OPTIONS.decorationType];
  public readonly moneyTypeOptions = [...SHARED_DROPDOWN_OPTIONS.moneyType];
  public readonly checkTypeOptions = [...SHARED_DROPDOWN_OPTIONS.checkType];
  public readonly tltTermTypeOptions = [...SHARED_DROPDOWN_OPTIONS.tltTermType];
  public readonly storeWayOptions = [...SHARED_DROPDOWN_OPTIONS.storeWay];
  public readonly paytypeOptions = [...SHARED_DROPDOWN_OPTIONS.paytype];
  public readonly invoiceTypeOptions = [...SHARED_DROPDOWN_OPTIONS.invoiceType];
  public readonly tltKindOptions = [...SHARED_DROPDOWN_OPTIONS.tltKind];
  public readonly openflagOptions = [...SHARED_DROPDOWN_OPTIONS.openflagStatus];
  public readonly commCompTypeOptions = [...SHARED_DROPDOWN_OPTIONS.commCompType];
  public readonly approveStatusOptions = [...SHARED_DROPDOWN_OPTIONS.approveStatus];
  public readonly applyStatusOptions = [...SHARED_DROPDOWN_OPTIONS.applyStatus];
  public readonly tltctypemtotalOptions = [...SHARED_DROPDOWN_OPTIONS.tltctypemtotal];

  public readonly yesNoOptions = [...SHARED_DROPDOWN_OPTIONS.yesNo];

  public readonly totalAmtOptions = [...SHARED_DROPDOWN_OPTIONS.totalAmt];


  public readonly totalAmtVendorOptions = [...SHARED_DROPDOWN_OPTIONS.totalAmtVendor];

  public readonly depositPaymentOptions = [...SHARED_DROPDOWN_OPTIONS.depositPayment];

  public readonly overallStatusOptions = [...SHARED_DROPDOWN_OPTIONS.overallStatus];

  constructor(
    private sysb800Service: Sysb800DropdownService,
    private sysb900Service: Sysb900DropdownService,
    private locationService: LocationOptionsService,
    private vendorCategoryService: VendorCategoryOptionsService,
    private negotiatorService: NegotiatorOptionsService,
    private bankService: BankOptionsService,
    private bussclassService: BussclassDropdownService,
    private http: HttpClient
  ) { }

  // ========== 工具方法 ==========

  /**
   * 標準化 API 回應格式
   */
  private normalizeApiResponse(response: any): DropdownOption[] {
    if (Array.isArray(response)) {
      return response.map(item => ({
        value: item.value || item.code || item.id || item.Value || item.Code,
        label: item.label || item.name || item.description || item.Label || item.Name
      }));
    }
    return [];
  }

  /**
   * 通用的 API 呼叫方法 - 包含錯誤處理
   */
  private callApi<T>(apiName: string, apiCall: () => Observable<T>): Observable<DropdownOption[]> {
    console.log(`🚀 呼叫 ${apiName} API`);

    return apiCall().pipe(
      map((response: any) => {
        const normalizedData = this.normalizeApiResponse(response);
        console.log(`✅ ${apiName} 載入完成: ${normalizedData.length} 筆資料`);
        return normalizedData;
      }),
      catchError((error) => {
        console.error(`❌ ${apiName} 載入失敗:`, error);
        return of([]); // 回傳空陣列，避免中斷使用者操作
      })
    );
  }

  // ========== API 方法 ==========

  /**
   * 載入大分類選項
   */
  getBustypeOptions(): Observable<DropdownOption[]> {
    return this.callApi('大分類', () =>
      this.sysb800Service.getSystemTypes()
    );
  }

  /**
   * 根據大分類載入中分類選項
   */
  getBusClassOptions(busType: string): Observable<DropdownOption[]> {
    if (!busType) {
      console.log('⚠️ 大分類為空，回傳空的中分類選項');
      return of([]);
    }

    return this.callApi(`中分類(${busType})`, () =>
      this.sysb900Service.getSystemTypesByBustype([busType])
    );
  }

  getBusSClassOptions(busType: string, busClass: string): Observable<DropdownOption[]> {
    if (!busType || !busClass) {
      console.log('⚠️ 大分類或中分類為空，回傳空的小分類選項');
      return of([]);
    }

    return this.callApi(`小分類(${busClass})`, () =>
      this.bussclassService.getSystemTypesByBustype([busType], [busClass])
    );
  }

  /**
   * 載入館別選項
   */
  getBuildingOptions(): Observable<DropdownOption[]> {
    return this.callApi('館別', () =>
      this.locationService.getBuildingOptions()
    );
  }

  /**
   * 載入樓層選項
   */
  getFloorOptions(): Observable<DropdownOption[]> {
    return this.callApi('樓層', () =>
      this.locationService.getFloorOptions()
    );
  }

  /**
   * 載入區域選項
   */
  getRegionOptions(): Observable<DropdownOption[]> {
    return this.callApi('區域', () =>
      this.locationService.getRegionOptions()
    );
  }

  /**
   * 載入組織選項
   */
  getOrgOptions(): Observable<DropdownOption[]> {
    return this.callApi('組織', () =>
      this.locationService.getOrgOptions()
    );
  }

  /**
   * 載入位置選項
   */
  getLocationOptions(): Observable<DropdownOption[]> {
    return this.callApi('位置', () =>
      this.locationService.getLocationOptions()
    );
  }

  /**
   * 載入營業型態選項
   */
  getPaperTypeOptions(typeCode: string = 'T101'): Observable<DropdownOption[]> {
    return this.callApi(`營業型態(${typeCode})`, () =>
      this.locationService.getPaperTypeOptions(typeCode)
    );
  }

  /**
   * 載入廠商選項
   */
  getVendorOptions(venFlag: string = "1"): Observable<DropdownOption[]> {
    return this.callApi(`廠商(${venFlag})`, () =>
      this.vendorCategoryService.getVendorCategoryNoNameOptions(venFlag)
    );
  }

  /**
   * 載入洽談者選項
   */
  getNegotiatorOptions(): Observable<DropdownOption[]> {
    return this.callApi('洽談者', () =>
      this.negotiatorService.getNegotiatorOptions()
    );
  }

  getBankOptions(): Observable<DropdownOption[]> {
    return this.callApi('銀行', () =>
      this.bankService.getBankOptions()
    );
  }
  /**
 * 載入活動清單 (TALPORDERM)
 */
  getActivityOptions(mid: number, strNo: string, podType: string[] = [], podStatus = ''): Observable<DropdownOption[]> {
    if (!mid || !strNo) {
      console.warn(' mid 或 strNo 為空，回傳空的活動清單');
      return of([]);
    }

    const body = {
      mid,
      str_no: strNo,
      pod_type: podType,
      pod_status: podStatus
    };

    return this.callApi('活動清單', () =>
      this.http.post<any>(
        `${environment.ApiUrl}/Share/queryTALPORDERM_DropDownList`,
        body
      )
    );
  }



}
