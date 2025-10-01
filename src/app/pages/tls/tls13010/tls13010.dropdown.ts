// TLS13010 下拉選單選項 - 整理後版本（含洽談者）
import { Injectable } from '@angular/core';
import { forkJoin, Observable, map } from 'rxjs';
import {
  DECO_TYPE_OPTIONS,
  MONEY_TYPE_OPTIONS,
  CHECK_TYPE_OPTIONS,
  COMM_COMP_TYPE_OPTIONS,
  TLT_TERM_TYPE_OPTIONS,
  PAYTYPE_OPTIONS,
  STORE_WAY_OPTIONS,
  INVOICE_TYPE_OPTIONS,
  TLT_KIND_OPTIONS,
  TLT_OPENFLAG_OPTIONS,
  METER_TYPE_OPTIONS,
  OVERALL_STATUS_OPTIONS,
  TLT_CTYPE_MTOTAL_OPTIONS,
  TPY_TYPE_OPTIONS,
  APPROVE_STATUS_OPTIONS,
  CAG_TAXTYPE_OPTIONS,
  TOTAL_AMT_UNIT_OPTIONS,
  TOTAL_AMT_VENDOR_UNIT_OPTIONS,
  APPLY_STATUS_OPTIONS,
  CAP_SALE_TYPE_OPTIONS,
  INSTMS_TYPE_OPTIONS,
  EDC_BANK_OPTIONS,
  CALC_TYPE_OPTIONS,
  CAP_SALE_TYPE_OPTIONS_E
} from './tls13010.constants';
import { Sysb800DropdownService } from '../../../service/api/sys/sysb800-dropdown.service';
import { LocationOptionsService } from '../../../service/api/dropdownservice/location-options.service';
import { Sysb900DropdownService } from '../../../service/api/sys/sysb900-dropdown.service';
import { BussclassDropdownService } from '../../../service/api/dropdownservice/tltbussclass-options.service';
import { VendorCategoryOptionsService } from './../../../service/api/dropdownservice/vendor-category-options.service';
import { NegotiatorOptionsService } from '../../../service/api/dropdownservice/negotiator-options.service';
import { DropDownListService } from '@service/utility/dropDownList.service';

// ========== 介面定義 ==========
export interface DropdownOption {
  value: string | number;
  label: string;
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
    { value: '3', label: '履約保證金' }
  ],
  depositType: [
    { value: '1', label: '準時開業' },
    { value: '2', label: '施工保證' },
    { value: '3', label: '契約屆滿保證票' }
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
  public pos2013Options: DropdownOption[] = [];
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
    this.initAllOptions();
  }

  /**
   * 初始化所有選項
   */
  private initAllOptions(): void {
    this.initBustypeOptions();
    this.initLocationOptions();
    this.initDiscountOptions();
    this.initPOS2013Options();
    this.initNegotiatorOptions();
    this.initPayNoOptions();
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
      return new Observable(observer => {
        observer.next([]);
        observer.complete();
      });
    }

    console.log('載入小分類選項，大分類:', busType, '中分類:', busClass);
    this.loadingStates.bussclass = false;

    return new Observable(observer => {
      this.bussclassService.getSystemTypesByBustype([busType], [busClass]).subscribe({
        next: (response) => {
          this.busSClassOptions = response.map(item => ({
            value: item.value,
            label: item.label
          }));

          this.loadingStates.bussclass = true;
          console.log('小分類選項載入完成:', this.busSClassOptions.length);

          observer.next(this.busSClassOptions);
          observer.complete();
        },
        error: (error) => {
          console.error('載入小分類選項失敗:', error);
          this.busSClassOptions = [];
          this.loadingStates.bussclass = true;
          observer.error(error);
        }
      });
    });
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
  private initLocationOptions(): void {
    if (this.loadingStates.location) return;

    forkJoin({
      building: this.locationService.getBuildingOptions(),
      floor: this.locationService.getFloorOptions(),
      region: this.locationService.getRegionOptions(),
      org: this.locationService.getOrgOptions(),
      location: this.locationService.getLocationOptions(),
      paperType: this.locationService.getPaperTypeOptions('T101')
    }).subscribe({
      next: (results) => {
        this.buildingOptions = results.building;
        this.floorOptions = results.floor;
        this.regionOptions = results.region;
        this.orgOptions = results.org;
        this.locationOptions = results.location;
        this.paperTypeOptions = results.paperType;
        this.loadingStates.location = true;

        console.log('Location 選項載入完成:', {
          building: this.buildingOptions.length,
          floor: this.floorOptions.length,
          region: this.regionOptions.length,
          org: this.orgOptions.length,
          location: this.locationOptions.length,
          paperType: this.paperTypeOptions.length
        });
      },
      error: (error) => {
        console.error('載入 Location 選項失敗:', error);
      }
    });
  }

  /**
   * 載入折扣別選項（T102）
   */
  private initDiscountOptions(): void {
    if (this.loadingStates.discount) return;

    this.locationService.getPaperTypeOptions('T102').subscribe({
      next: (response: any[]) => {
        this.discountTypeOptions = response;
        this.loadingStates.discount = true;
        console.log('折扣別選項載入完成:', this.discountTypeOptions.length);
      },
      error: (error) => {
        console.error('載入折扣別選項失敗:', error);
        this.discountTypeOptions = [];
        this.loadingStates.discount = true;
      }
    });
  }

  /**
   * 載入 POS2013 選項 (固定傳入 VEN_Flag = "1")
   */
  private initPOS2013Options(): void {
    if (this.loadingStates.pos2013) return;

    this.vendorCategoryService.getVendorCategoryNoNameOptions("1").subscribe({
      next: (response: any[]) => {
        this.pos2013Options = response;
        this.loadingStates.pos2013 = true;
        console.log('POS2013選項載入完成:', this.pos2013Options.length);
      },
      error: (error) => {
        console.error('載入POS2013選項失敗:', error);
        this.pos2013Options = [];
        this.loadingStates.pos2013 = true;
      }
    });
  }

  /**
   * 載入洽談者選項
   */
  private initNegotiatorOptions(): void {
    if (this.loadingStates.negotiator) return;

    this.negotiatorService.getNegotiatorOptions().subscribe({
      next: (response: any[]) => {
        this.negotiatorOptions = response;
        this.loadingStates.negotiator = true;
        console.log('洽談者選項載入完成:', this.negotiatorOptions.length);
      },
      error: (error) => {
        console.error('載入洽談者選項失敗:', error);
        this.negotiatorOptions = [];
        this.loadingStates.negotiator = true;
      }
    });
  }

  /**
    * 載入支付編號選項 (POS1006)
    */
  private initPayNoOptions(): void {
    if (this.loadingStates.payNo) return;

    this.negotiatorService.getPOS1006Options().subscribe({
      next: (response: any[]) => {
        this.payNoOptions = response;
        this.loadingStates.payNo = true;
        console.log('支付編號選項載入完成:', this.payNoOptions.length);
      },
      error: (error) => {
        console.error('載入支付編號選項失敗:', error);
        this.payNoOptions = [];
        this.loadingStates.payNo = true;
      }
    });
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
  reloadAllOptions(): void {
    this.loadingStates = {
      bustype: false,
      busclass: false,
      bussclass: false,
      location: false,
      discount: false,
      pos2013: false,
      negotiator: false,
      payNo: false
    };
    this.initAllOptions();
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
