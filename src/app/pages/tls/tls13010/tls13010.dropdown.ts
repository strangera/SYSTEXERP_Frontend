// TLS13010 下拉選單選項 - 整理後版本
import { Injectable } from '@angular/core';
import { forkJoin } from 'rxjs';
import {
  DECO_TYPE_OPTIONS,
  MONEY_TYPE_OPTIONS,
  CHECK_TYPE_OPTIONS,
  COMMISSION_COMP_TYPE_OPTIONS,
  TLT_TERM_TYPE_OPTIONS,
  BUSINESS_TYPE_OPTIONS,
  PAYTYPE_OPTIONS,
  STORE_WAY_OPTIONS,
  INVOICE_TYPE_OPTIONS,
  TLT_KIND_OPTIONS,
  TLT_OPENFLAG_OPTIONS,
  METER_TYPE_OPTIONS,
  OVERALL_STATUS_OPTIONS
} from './tls13010.constants';
import { Sysb800DropdownService } from '../../../service/API/sys/sysb800-dropdown.service';
import { LocationOptionsService } from '../../../service/API/dropdownservice/location-options.service';

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
  commissionCompType: convertToDropdownOptions(COMMISSION_COMP_TYPE_OPTIONS),
  commCompType: [{ value: '2', label: '除稅' }], // 固定只有除稅選項
  tltTermType: convertToDropdownOptions(TLT_TERM_TYPE_OPTIONS),
  businessType: convertToDropdownOptions(BUSINESS_TYPE_OPTIONS),
  paytype: convertToDropdownOptions(PAYTYPE_OPTIONS),
  storeWay: convertToDropdownOptions(STORE_WAY_OPTIONS),
  invoiceType: convertToDropdownOptions(INVOICE_TYPE_OPTIONS),
  tltKind: convertToDropdownOptions(TLT_KIND_OPTIONS),
  openflagStatus: convertToDropdownOptions(TLT_OPENFLAG_OPTIONS),
  meterType: convertToDropdownOptions(METER_TYPE_OPTIONS),
  overallStatus: convertToDropdownOptions(OVERALL_STATUS_OPTIONS),
  yesNo: [{ value: 'Y', label: '是' }, { value: 'N', label: '否' }],
  depositPayment: [
    { value: 1, label: '現金' },
    { value: 2, label: '支票' },
    { value: 3, label: '履約保證金' }
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
  public buildingOptions: DropdownOption[] = [];
  public floorOptions: DropdownOption[] = [];
  public regionOptions: DropdownOption[] = [];
  public orgOptions: DropdownOption[] = [];
  public locationOptions: DropdownOption[] = [];
  public paperTypeOptions: DropdownOption[] = [];

  // 載入狀態
  private loadingStates = {
    bustype: false,
    location: false
  };

  constructor(
    private sysb800Service: Sysb800DropdownService,
    private locationService: LocationOptionsService
  ) {
    this.initAllOptions();
  }

  /**
   * 初始化所有選項
   */
  private initAllOptions(): void {
    this.initBustypeOptions();
    this.initLocationOptions();
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
   * 載入所有 Location 相關選項
   */
  private initLocationOptions(): void {
    if (this.loadingStates.location) return;

    forkJoin({
      building: this.locationService.getBuildingOptions(),
      floor: this.locationService.getFloorOptions(),
      region: this.locationService.getRegionOptions(),
      org: this.locationService.getOrgOptions(),
      location: this.locationService.getLocationOptions(),
      paperType: this.locationService.getPaperTypeOptions()
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
   * 重新載入所有選項
   */
  reloadAllOptions(): void {
    this.loadingStates = { bustype: false, location: false };
    this.initAllOptions();
  }

  /**
   * 檢查是否全部載入完成
   */
  isAllLoaded(): boolean {
    return Object.values(this.loadingStates).every(loaded => loaded);
  }
}
