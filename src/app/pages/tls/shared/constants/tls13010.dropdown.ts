// TLS13010 下拉選單選項 - 整理後版本（含洽談者）
import { Injectable } from '@angular/core';
import { Sysb800DropdownService } from '@service/api/sys/sysb800-dropdown.service';
import { Sysb900DropdownService } from '@service/api/sys/sysb900-dropdown.service';
import { catchError, forkJoin, map, Observable, of, retry, tap, timer } from 'rxjs';
import { LocationOptionsService } from 'src/app/shared/services/dropdownservice/location-options.service';
import { NegotiatorOptionsService } from 'src/app/shared/services/dropdownservice/negotiator-options.service';
import { BussclassDropdownService } from 'src/app/shared/services/dropdownservice/tltbussclass-options.service';
import { VendorCategoryOptionsService } from 'src/app/shared/services/dropdownservice/vendor-category-options.service';
import {
  APPLY_STATUS_OPTIONS,
  APPROVE_STATUS_OPTIONS,
  CAG_TAXTYPE_OPTIONS,
  CALC_TYPE_OPTIONS,
  CAP_SALE_TYPE_OPTIONS,
  CAP_SALE_TYPE_OPTIONS_E,
  CHECK_TYPE_OPTIONS,
  COMM_COMP_TYPE_OPTIONS,
  DECO_TYPE_OPTIONS,
  EDC_BANK_OPTIONS,
  INSTMS_TYPE_OPTIONS,
  INVOICE_TYPE_OPTIONS,
  METER_TYPE_OPTIONS,
  MONEY_TYPE_OPTIONS,
  OVERALL_STATUS_OPTIONS,
  PAYTYPE_OPTIONS,
  STORE_WAY_OPTIONS,
  TLT_CTYPE_MTOTAL_OPTIONS,
  TLT_KIND_OPTIONS,
  TLT_OPENFLAG_OPTIONS,
  TLT_TERM_TYPE_OPTIONS,
  TOTAL_AMT_UNIT_OPTIONS,
  TOTAL_AMT_VENDOR_UNIT_OPTIONS,
  TPY_TYPE_OPTIONS
} from './tls13010.constants';

// ========== 介面定義 ==========
export interface DropdownOption {
  value: string | number;
  label: string;
}

export interface Pos2013DropdownOption {
  value: string | number;
  label: string;
  VEN_No: string;
  No: string;
  Name: string;
  VEN_Address: string;
}

// ========== 轉換函數 ==========
const convertToDropdownOptions = (options: Record<string, string>): DropdownOption[] => {
  return Object.entries(options).map(([value, label]) => ({ value, label }));
};

// ========== 固定選項 ==========
export const TLS13010_DROPDOWN_OPTIONS = {
  decorationType: convertToDropdownOptions(DECO_TYPE_OPTIONS),
  moneyType: convertToDropdownOptions(MONEY_TYPE_OPTIONS),
  checkType: convertToDropdownOptions(CHECK_TYPE_OPTIONS),
  // commissionCompType: convertToDropdownOptions(TLT_TERM_TYPE_OPTIONS),
  // commCompType: [{ value: '2', label: '除稅' }], // 固定只有除稅選項
  tltTermType: convertToDropdownOptions(TLT_TERM_TYPE_OPTIONS),
  paytype: convertToDropdownOptions(PAYTYPE_OPTIONS),
  storeWay: convertToDropdownOptions(STORE_WAY_OPTIONS),
  invoiceType: convertToDropdownOptions(INVOICE_TYPE_OPTIONS),
  tltKind: convertToDropdownOptions(TLT_KIND_OPTIONS),
  openflagStatus: convertToDropdownOptions(TLT_OPENFLAG_OPTIONS),
  meterType: convertToDropdownOptions(METER_TYPE_OPTIONS),
  overallStatus: convertToDropdownOptions(OVERALL_STATUS_OPTIONS),
  tltCtypeMtotal: convertToDropdownOptions(TLT_CTYPE_MTOTAL_OPTIONS),
  tpyTypeOption: convertToDropdownOptions(TPY_TYPE_OPTIONS),
  cagTaxTypeOption: convertToDropdownOptions(CAG_TAXTYPE_OPTIONS),
  commCompType: convertToDropdownOptions(COMM_COMP_TYPE_OPTIONS),         // 抽成額計算方式
  approveStatusOptions: convertToDropdownOptions(APPROVE_STATUS_OPTIONS),
  applyStatusOptions: convertToDropdownOptions(APPLY_STATUS_OPTIONS),
  total_amt_unit: convertToDropdownOptions(TOTAL_AMT_UNIT_OPTIONS), //目標營業額單位(業主)
  total_amt_vendor_unit: convertToDropdownOptions(TOTAL_AMT_VENDOR_UNIT_OPTIONS),  //目標營業額單位(廠商)
  capSaletypeOptions: convertToDropdownOptions(CAP_SALE_TYPE_OPTIONS),  //銷售類型D
  capSaletypeOptionsE: convertToDropdownOptions(CAP_SALE_TYPE_OPTIONS_E),  //銷售類型E
  instmsTypeOptions: convertToDropdownOptions(INSTMS_TYPE_OPTIONS),
  edcBankOptions: convertToDropdownOptions(EDC_BANK_OPTIONS),
  calcTypeOptions: convertToDropdownOptions(CALC_TYPE_OPTIONS),
  yesNo: [{ value: 'Y', label: '是' }, { value: 'N', label: '否' }],
  depositPayment: [
    { value: '1', label: '現金' },
    { value: '2', label: '支票' },
    { value: '3', label: '匯款' }
  ],
  depositType: [
    { value: '1', label: '準時開業' },
    { value: '2', label: '施工保證' },
    { value: '3', label: '契約屆滿' }
  ]
} as const;

// ========== 動態載入服務 ==========
@Injectable({
  providedIn: 'root'
})
export class TLS13010DropdownService {
  // API 載入的選項
  public bustypeOptions: DropdownOption[] = [];
  public busClassOptions: DropdownOption[] = [];
  public busSClassOptions: DropdownOption[] = [];
  public buildingOptions: DropdownOption[] = [];
  public floorOptions: DropdownOption[] = [];
  public regionOptions: DropdownOption[] = [];
  public orgOptions: DropdownOption[] = [];
  public locationOptions: DropdownOption[] = [];
  public paperTypeOptions: DropdownOption[] = [];
  public discountTypeOptions: DropdownOption[] = [];
  public pos2013Options: Pos2013DropdownOption[] = [];
  public negotiatorOptions: DropdownOption[] = [];
  public payNoOptions: DropdownOption[] = [];

  // 載入狀態
  private loadingStates = {
    bustype: false,
    busclass: false,
    bussclass: false,
    location: false,
    discount: false,
    pos2013: false,
    negotiator: false,
    payNo: false
  };

  constructor(
    private sysb800Service: Sysb800DropdownService,
    private sysb900Service: Sysb900DropdownService,
    private bussclassService: BussclassDropdownService,
    private locationService: LocationOptionsService,
    private vendorCategoryService: VendorCategoryOptionsService,
    private negotiatorService: NegotiatorOptionsService,

  ) {
  }

  /**
   * 初始化所有選項（由外部呼叫）
   */
  public initialize(): Observable<any> {
    console.log('🚀 開始初始化所有下拉選單選項');

    return forkJoin({
      bustype: this.initBustypeOptionsWithRetry(),
      location: this.initLocationOptionsWithRetry(),
      discount: this.initDiscountOptionsWithRetry(),
      pos2013: this.initPOS2013OptionsWithRetry(),
      negotiator: this.initNegotiatorOptionsWithRetry(),
      payNo: this.initPayNoOptionsWithRetry()
    }).pipe(
      tap(results => {
        console.log('✅ 所有下拉選單選項載入完成:', {
          bustype: results.bustype.length,
          discount: results.discount.length,
          pos2013: results.pos2013.length,
          negotiator: results.negotiator.length,
          payNo: results.payNo.length
        });
      }),
      catchError(error => {
        console.error('❌ 初始化選項時發生錯誤:', error);
        return of({
          bustype: [],
          location: {},
          discount: [],
          pos2013: [],
          negotiator: [],
          payNo: []
        });
      })
    );
  }


  public initBustypeOptionsWithRetry(): Observable<DropdownOption[]> {
    return this.sysb800Service.getSystemTypes().pipe(
      retry({ count: 3, delay: () => timer(1000) }),
      map(response => response.map(item => ({
        value: item.value,
        label: item.label
      }))),
      tap(options => {
        this.bustypeOptions = options;
        console.log('✅ 大分類載入完成:', options.length);
      }),
      catchError(error => {
        console.error('❌ 大分類載入失敗:', error);
        return of([]);
      })
    );
  }

  /**
   * 載入大分類選項
   */
  private initBustypeOptions(): void {
    if (this.loadingStates.bustype) return;

    this.sysb800Service.getSystemTypes().subscribe({
      next: (response: any[]) => {
        this.bustypeOptions = response.map(item => ({
          value: item.value || item.code || item.id,
          label: item.label || item.name || item.description
        }));
        this.loadingStates.bustype = true;
        console.log('大分類選項載入完成:', this.bustypeOptions.length);
      },
      error: (error) => {
        console.error('載入大分類選項失敗:', error);
        this.bustypeOptions = [];
      }
    });
  }

  /**
   * 根據大分類載入中分類選項
   */
  loadBusClassOptions(busType: string): Observable<DropdownOption[]> {
    if (!busType) {
      this.busClassOptions = [];
      return new Observable(observer => {
        observer.next([]);
        observer.complete();
      });
    }

    console.log('載入中分類選項，大分類:', busType);
    this.loadingStates.busclass = false;

    return new Observable(observer => {
      this.sysb900Service.getSystemTypesByBustype([busType]).subscribe({
        next: (response) => {
          this.busClassOptions = response.map(item => ({
            value: item.value,
            label: item.label
          }));

          this.loadingStates.busclass = true;
          console.log('中分類選項載入完成:', this.busClassOptions.length);

          observer.next(this.busClassOptions);
          observer.complete();
        },
        error: (error) => {
          console.error('載入中分類選項失敗:', error);
          this.busClassOptions = [];
          this.loadingStates.busclass = true;
          observer.error(error);
        }
      });
    });
  }

  /**
   * 根據大分類和中分類載入小分類選項
   */
  loadBusSClassOptions(busType: string, busClass: string): Observable<DropdownOption[]> {
    if (!busType || !busClass) {
      this.busSClassOptions = [];
      return of([]); // 使用 of 更簡潔
    }

    console.log('載入小分類選項，大分類:', busType, '中分類:', busClass);
    this.loadingStates.bussclass = false;

    return this.bussclassService.getSystemTypesByBustype([busType], [busClass]).pipe(
      tap(response => {
        this.busSClassOptions = response.map(item => ({
          value: item.value,
          label: item.label
        }));
        this.loadingStates.bussclass = true;
        console.log('小分類選項載入完成:', this.busSClassOptions.length);
      }),
      map(() => this.busSClassOptions),
      catchError(error => {
        console.error('載入小分類選項失敗:', error);
        this.busSClassOptions = [];
        this.loadingStates.bussclass = true;
        return of([]); // 錯誤時回傳空陣列
      })
    );
  }

  /**
   * 清空中分類選項
   */
  clearBusClassOptions(): void {
    this.busClassOptions = [];
    this.loadingStates.busclass = false;
  }

  /**
   * 清空小分類選項
   */
  clearBusSClassOptions(): void {
    this.busSClassOptions = [];
    this.loadingStates.bussclass = false;
  }

  /**
   * 載入所有 Location 相關選項（T101）
   */
  public initLocationOptionsWithRetry(): Observable<any> {
    console.log('🔄 開始載入 Location 選項');

    return forkJoin({
      building: this.locationService.getBuildingOptions(),
      floor: this.locationService.getFloorOptions(),
      region: this.locationService.getRegionOptions(),
      org: this.locationService.getOrgOptions(),
      location: this.locationService.getLocationOptions(),
      paperType: this.locationService.getPaperTypeOptions('T101')
    }).pipe(
      retry({
        count: 2,
        delay: () => timer(1000)
      }),
      tap(results => {
        this.buildingOptions = results.building;
        this.floorOptions = results.floor;
        this.regionOptions = results.region;
        this.orgOptions = results.org;
        this.locationOptions = results.location;
        this.paperTypeOptions = results.paperType;

        console.log('✅ Location 選項載入完成:', {
          building: this.buildingOptions.length,
          floor: this.floorOptions.length,
          region: this.regionOptions.length,
          org: this.orgOptions.length,
          location: this.locationOptions.length,
          paperType: this.paperTypeOptions.length
        });
      }),
      catchError(error => {
        console.error('❌ 載入 Location 選項失敗:', error);
        this.buildingOptions = [];
        this.floorOptions = [];
        this.regionOptions = [];
        this.orgOptions = [];
        this.locationOptions = [];
        this.paperTypeOptions = [];
        return of({
          building: [],
          floor: [],
          region: [],
          org: [],
          location: [],
          paperType: []
        });
      })
    );
  }

  /**
 * 載入折扣別選項（含重試）
 */
  private initDiscountOptionsWithRetry(): Observable<DropdownOption[]> {
    console.log('🔄 開始載入折扣別選項');

    return this.locationService.getPaperTypeOptions('T102').pipe(
      retry({
        count: 2,
        delay: () => timer(1000)
      }),
      tap((response: any[]) => {
        this.discountTypeOptions = response;
        console.log('✅ 折扣別選項載入完成:', this.discountTypeOptions.length);
      }),
      catchError(error => {
        console.error('❌ 載入折扣別選項失敗:', error);
        this.discountTypeOptions = [];
        return of<DropdownOption[]>([]);
      })
    );
  }

  /**
 * 載入 POS2013 選項（含重試）
 */
  private initPOS2013OptionsWithRetry(): Observable<Pos2013DropdownOption[]> {
    console.log('🔄 開始載入 POS2013 選項');

    return this.vendorCategoryService.getVendorCategoryNoNameOptions("1").pipe(
      retry({
        count: 2,
        delay: () => timer(1000)
      }),
      tap((response: any[]) => {
        this.pos2013Options = response;
        console.log('✅ POS2013選項載入完成:', this.pos2013Options.length);
      }),
      catchError(error => {
        console.error('❌ 載入POS2013選項失敗:', error);
        this.pos2013Options = [];
        return of<Pos2013DropdownOption[]>([]);
      })
    );
  }

  /**
  * 載入洽談者選項（含重試）
  */
  private initNegotiatorOptionsWithRetry(): Observable<DropdownOption[]> {
    console.log('🔄 開始載入洽談者選項');

    return this.negotiatorService.getNegotiatorOptions().pipe(
      retry({
        count: 2,
        delay: () => timer(1000)
      }),
      tap((response: any[]) => {
        this.negotiatorOptions = response;
        console.log('✅ 洽談者選項載入完成:', this.negotiatorOptions.length);
      }),
      catchError(error => {
        console.error('❌ 載入洽談者選項失敗:', error);
        this.negotiatorOptions = [];
        return of<DropdownOption[]>([]);
      })
    );
  }

  /**
 * 載入支付編號選項（含重試）
 */
  public initPayNoOptionsWithRetry(): Observable<DropdownOption[]> {
    console.log('🔄 開始載入支付編號選項');

    return this.negotiatorService.getPOS1006Options().pipe(
      retry({
        count: 2,
        delay: () => timer(1000)
      }),
      tap((response: any[]) => {
        this.payNoOptions = response;
        console.log('✅ 支付編號選項載入完成:', this.payNoOptions.length);
      }),
      catchError(error => {
        console.error('❌ 載入支付編號選項失敗:', error);
        this.payNoOptions = [];
        return of<DropdownOption[]>([]);
      })
    );
  }

  /**
   * 取得洽談者選項的公開方法
   */
  public getNegotiatorOptionsData(): DropdownOption[] {
    return this.negotiatorOptions;
  }

  /**
  * 取得支付編號選項的公開方法
  */
  public getPayNoOptions(): DropdownOption[] {
    return this.payNoOptions;
  }

  /**
   * 取得折扣別選項的公開方法
   */
  public getDiscountTypeOptionsData(): DropdownOption[] {
    return this.discountTypeOptions;
  }

  /**
   * 搜尋洽談者（用於 AutoComplete）
   */
  searchNegotiatorOptions(): Observable<any[]> {
    return this.negotiatorService.getNegotiatorOptions();
  }

  /**
   * 取得 POS2013 選項（固定 VEN_Flag = "1"）
   */
  getPOS2013Options(): DropdownOption[] {
    return this.pos2013Options;
  }

  /**
  * 重新載入所有選項
  */
  reloadAllOptions(): Observable<any> {
    console.log('🔄 重新載入所有選項');

    // 清空資料
    this.bustypeOptions = [];
    this.busClassOptions = [];
    this.busSClassOptions = [];
    this.buildingOptions = [];
    this.floorOptions = [];
    this.regionOptions = [];
    this.orgOptions = [];
    this.locationOptions = [];
    this.paperTypeOptions = [];
    this.discountTypeOptions = [];
    this.pos2013Options = [];
    this.negotiatorOptions = [];
    this.payNoOptions = [];

    return this.initialize();
  }

  /**
   * 檢查是否全部載入完成
   */
  isAllLoaded(): boolean {
    return Object.values(this.loadingStates).every(loaded => loaded);
  }

  getPOS2013OptionsCount(): number {
    return this.pos2013Options.length;
  }

  getNegotiatorOptionsCount(): number {
    return this.negotiatorOptions.length;
  }

  getDiscountTypeOptionsCount(): number {
    return this.discountTypeOptions.length;
  }
}
