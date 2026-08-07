/**
 * TLS13010-V2 提交資料組裝服務
 *
 * 負責將前端 wizardState 資料轉換為後端 CleanContractRequest 格式
 */
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

// 類型定義
import { CommissionType } from '../../core/constants';
import {
  CleanCommissionDetails,
  CleanCommissionMaster,
  CleanCommissionMasters,
  CleanCommissions,
  CommissionItem
} from '../../core/models/commission';
import { CleanConditions, ConditionItem } from '../../core/models/condition';
import { CleanLocationInfo, LocationItem } from '../../core/models/contract';
import { CleanDeductions, CleanFareItem, FareItem } from '../../core/models/deduction';
import {
  CleanContractData,
  CleanContractInfo,
  CleanMetadata,
  CleanSubmitData,
  CommissionTypeChangeInfo
} from '../../core/models/workflow';

/**
 * 提交資料組裝服務
 */
@Injectable({
  providedIn: 'root'
})
export class SubmitDataService {

  /**
   * 組裝完整的提交資料
   */
  assembleSubmitData(
    step1Form: FormGroup,
    locationData: LocationItem[],
    fareItems: FareItem[],
    commissionItems: CommissionItem[],
    conditionItems: ConditionItem[],
    isNewContract: boolean,
    originalCommissionType?: string
  ): CleanSubmitData {
    const formData = step1Form.getRawValue();
    const talentId = formData.talent_id || '';
    const commissionType = (formData.tlt_term_type || '').toString().trim();

    // 組裝各部分資料
    const contractInfo = this.buildContractInfo(formData, locationData, isNewContract);
    const deductions = this.buildDeductions(fareItems);
    const commissions = this.buildCommissions(commissionItems, talentId);
    const conditions = this.buildConditions(conditionItems, talentId, commissionType);
    const metadata = this.buildMetadata(formData, isNewContract, deductions, commissions, conditions);
    const commissionTypeChange = this.buildCommissionTypeChange(originalCommissionType, commissionType);

    return {
      contractInfo,
      deductions,
      commissions,
      conditions,
      metadata,
      commissionTypeChange
    };
  }

  // ========== Step 1: 合約資料 ==========

  private buildContractInfo(
    formData: Record<string, unknown>,
    locationData: LocationItem[],
    isNewContract: boolean
  ): CleanContractInfo {
    const data: CleanContractData = {
      talent_id: this.str(formData['talent_id']),
      apply_no: this.str(formData['apply_no']),
      tlt_no: this.str(formData['tlt_no']),
      tlt_name: this.str(formData['tlt_name']),
      ven_uniform: this.str(formData['ven_uniform']),
      ven_no: this.str(formData['ven_no'] || formData['vendor_ven_no']),
      VEN_Name: this.str(formData['VEN_Name']),
      VEN_Address: this.str(formData['VEN_Address']),
      contract_subno: this.str(formData['contract_subno']),

      // 日期欄位
      tlt_bdate: this.formatDate(formData['tlt_bdate']),
      tlt_edate: this.formatDate(formData['tlt_edate']),
      tlt_contract_bdate: this.formatDate(formData['tlt_contract_bdate']),
      tlt_contract_edate: this.formatDate(formData['tlt_contract_edate']),
      feedback_date: this.formatDateOrNull(formData['feedback_date']),
      due_date: this.formatDateOrNull(formData['due_date']),
      contact_Date: this.formatDateOrNull(formData['contact_Date']),

      // 商務條件
      tlt_term_type: this.str(formData['tlt_term_type']).trim(),
      comm_comp_type: this.str(formData['comm_comp_type']),
      paper_type: this.str(formData['paper_type']),
      bus_type: this.str(formData['bus_type']),
      bus_class: this.str(formData['bus_class']),
      bus_sclass: this.str(formData['bus_sclass']),

      // 組織與聯絡
      org_id: this.str(formData['org_id']),
      contact_USR_No: this.str(formData['contact_USR_No']),
      contact_USR_Name: this.str(formData['contact_USR_Name']),

      // 狀態設定
      deco_type: this.str(formData['deco_type']),
      money_type: this.str(formData['money_type']),
      check_typeList: formData['check_typeList'] as string[] || [],
      edc_yn: this.str(formData['edc_yn']),
      tlt_openflag: this.str(formData['tlt_openflag']),
      comm_yn: this.str(formData['comm_yn']),
      rece_yn: this.str(formData['rece_yn']),
      pos_yn: this.str(formData['pos_yn']),
      cash_yn: this.str(formData['cash_yn']),
      store_way: this.str(formData['store_way']),
      paytype: this.str(formData['paytype']),
      vip_yn: this.str(formData['vip_yn']),

      // 費用相關
      base_rent: this.num(formData['base_rent']),
      deposit: this.num(formData['deposit']),
      credit_card: this.num(formData['credit_card']),
      check_day: this.num(formData['check_day']),
      open_fees: this.num(formData['open_fees']),
      total_amt: this.num(formData['total_amt']),
      total_amt_vendor: this.num(formData['total_amt_vendor']),
      construct_deposit: this.str(formData['construct_deposit']),
      construct_fees: this.num(formData['construct_fees']),
      expiration_deposit: this.str(formData['expiration_deposit']),
      expiration_fees: this.num(formData['expiration_fees']),
      open_deposit: this.str(formData['open_deposit']),

      // 其他設定
      invoice_type: this.str(formData['invoice_type']),
      tlt_kind: this.str(formData['tlt_kind']),
      tlt_ctype_mtotal: this.str(formData['tlt_ctype_mtotal']),
      overall_status: this.str(formData['overall_status']),
      rent_ahead: this.str(formData['rent_ahead']),
      rent_period: this.num(formData['rent_period']),
      water_flag: this.str(formData['water_flag']),
      electric_flag: this.str(formData['electric_flag']),
      gas_flag: this.str(formData['gas_flag']),
      cap_saletype1: this.str(formData['cap_saletype1']),
      cap_saletype2: this.str(formData['cap_saletype2']),
      cap_saletype3: this.str(formData['cap_saletype3']),
      cap_saletype4: this.str(formData['cap_saletype4']),
      cap_saletype5: this.str(formData['cap_saletype5']),

      // 聯絡資訊
      email: this.str(formData['email']),
      invoice_email: this.str(formData['invoice_email']),
      CHECK_TITLE: this.str(formData['CHECK_TITLE']),
      store_tel: this.str(formData['store_tel']),
      bank_id: this.str(formData['bank_id']),
      vendor_acct_name: this.str(formData['vendor_acct_name']),
      vendor_acct_no: this.str(formData['vendor_acct_no']),
      contact_tel: this.str(formData['contact_tel']),
      contact_fax: this.str(formData['contact_fax']),
      contact_addr: this.str(formData['contact_addr']),
      tlt_remark: this.str(formData['tlt_remark']),
      ticket_remarks: this.str(formData['ticket_remarks']),
      total_amt_unit: this.str(formData['total_amt_unit']),
      total_amt_vendor_unit: this.str(formData['total_amt_vendor_unit']),

      approve_status: this.str(formData['approve_status']) || '1',

      // 位置資訊
      locationInfo: this.buildLocationInfo(locationData)
    };

    return {
      operation: isNewContract ? 'INSERT' : 'UPDATE',
      data
    };
  }

  private buildLocationInfo(locationData: LocationItem[]): CleanLocationInfo[] {
    return locationData.map(loc => ({
      id: loc.id ? Number(loc.id) : undefined,
      location_no: this.str(loc.location_no),
      tlt_building: this.str(loc.tlt_building),
      tlt_floor: this.str(loc.tlt_floor),
      area_no: this.str(loc.area_no),
      tlt_space: loc.tlt_space || 0,
      sale_rate: loc.sale_rate ?? 0,
      tlt_bdate: this.formatDate(loc.tlt_bdate),
      tlt_edate: this.formatDate(loc.tlt_edate),
      _status: loc._status || 'original'
    }));
  }

  // ========== Step 2: 代扣款 ==========

  private buildDeductions(fareItems: FareItem[]): CleanDeductions {
    const toInsert: CleanFareItem[] = [];
    const toUpdate: CleanFareItem[] = [];
    const toDelete: CleanFareItem[] = [];

    for (const item of fareItems) {
      const cleanItem = this.convertFareItem(item);

      switch (item._status) {
        case 'new':
          toInsert.push(cleanItem);
          break;
        case 'modified':
          toUpdate.push(cleanItem);
          break;
        case 'deleted':
          if (item.id) {
            toDelete.push({ id: Number(item.id) } as CleanFareItem);
          }
          break;
        // 'original' 不需要處理
      }
    }

    return { toInsert, toUpdate, toDelete };
  }

  private convertFareItem(item: FareItem): CleanFareItem {
    return {
      id: item.id ? Number(item.id) : undefined,
      cap_type: this.str(item.cap_type),
      cap_item: this.str(item.cap_item),
      tpy_bdate: this.formatCompactDate(item.tpy_bdate),
      tpy_edate: this.formatCompactDate(item.tpy_edate),
      tpy_type: this.str(item.tpy_type),
      tpy_qty: item.tpy_qty,
      tpy_unitamt: item.tpy_unitamt,
      tpy_amount: item.tpy_amount ?? undefined,
      tpy_totalamt: item.tpy_totalamt ?? undefined,
      gui_flag: this.str(item.gui_flag) || 'Y',
      org_id: this.str(item.org_id),
      day_account: this.str(item.day_account),
      interval: item.interval ?? undefined,
      down_payment: item.down_payment ?? undefined,
      period_nos: item.period_nos ?? undefined,
      tpy_rate: item.tpy_rate,
      calc_type: this.str(item.calc_type),
      rent_plus_rate: item.rent_plus_rate,
      over_base_rate: item.over_base_rate,
      edc_bank: this.str(item.edc_bank),
      pay_no: this.str(item.pay_no),
      cap_saletype: this.str(item.cap_saletype),
      instms_type: this.str(item.instms_type)
    };
  }

  // ========== Step 3: 抽成設定 ==========

  private buildCommissions(commissionItems: CommissionItem[], talentId: string): CleanCommissions {
    const masters = this.buildCommissionMasters(commissionItems);
    const discountSettings = this.buildDiscountSettings(commissionItems, talentId);
    const annualSettings = this.buildAnnualSettings(commissionItems, talentId);
    const levelSettings = this.buildLevelSettings(commissionItems, talentId);

    return {
      masters,
      discountSettings,
      annualSettings,
      levelSettings
    };
  }

  private buildCommissionMasters(commissionItems: CommissionItem[]): CleanCommissionMasters {
    const toInsert: CleanCommissionMaster[] = [];
    const toUpdate: CleanCommissionMaster[] = [];
    const toDelete: CleanCommissionMaster[] = [];

    for (const item of commissionItems) {
      if (item._status === 'deleted') {
        if (item.id && !String(item.id).startsWith('temp_')) {
          toDelete.push({ id: Number(item.id) } as CleanCommissionMaster);
        }
        continue;
      }

      const cleanMaster: CleanCommissionMaster = {
        id: (item.id && !String(item.id).startsWith('temp_')) ? Number(item.id) : undefined,
        tlt_id: this.str(item.tlt_id),
        tlt_id_desc: this.str(item.tlt_id_desc),
        cag_taxtype: this.str(item.cag_taxtype),
        sst_amount: item.sst_amount,
        sst_rate: item.sst_rate,
        cap_saletype1: this.boolToYN(item.cap_saletype1),
        cap_saletype2: this.boolToYN(item.cap_saletype2),
        cap_saletype3: this.boolToYN(item.cap_saletype3),
        cap_saletype5: this.boolToYN(item.cap_saletype5),
        cag_bdate: this.formatDate(item.mainStartDate || item.cag_bdate),
        cag_edate: this.formatDate(item.mainEndDate || item.cag_edate)
      };

      if (item._status === 'new' || String(item.id).startsWith('temp_')) {
        toInsert.push(cleanMaster);
      } else if (item._status === 'modified') {
        toUpdate.push(cleanMaster);
      }
    }

    return { toInsert, toUpdate, toDelete };
  }

  private buildDiscountSettings(commissionItems: CommissionItem[], talentId: string): CleanCommissionDetails {
    const toInsert: unknown[] = [];
    const toUpdate: unknown[] = [];
    const toDelete: unknown[] = [];

    for (const commission of commissionItems) {
      if (commission._status === 'deleted') continue;

      for (const discount of (commission.discountSettingItems || [])) {
        if (!discount.selected) continue;

        const isNewItem = discount._status === 'new' || String(discount.id || '').startsWith('temp_');
        // 後端要求 id 必填；新增項目保留 temp_ ID 供 level charged_id 關聯比對
        const discountId = discount.id ? String(discount.id) : '0';

        const cleanDiscount = {
          id: discountId,
          tlt_id: this.str(commission.tlt_id),
          cag_barcode: this.str(discount.cag_barcode),
          tlt_bdate: this.formatDateOnly(discount.tlt_bdate),
          tlt_edate: this.formatDateOnly(discount.tlt_edate),
          cag_charge_rate: this.convertPercentageToRate(discount.cag_charge_rate || discount.discount_rate)
        };

        if (discount._status === 'deleted') {
          if (discountId) {
            toDelete.push({ id: discountId });
          }
        } else if (isNewItem) {
          toInsert.push(cleanDiscount);
        } else if (discount._status === 'modified') {
          toUpdate.push(cleanDiscount);
        }
      }
    }

    return { toInsert, toUpdate, toDelete };
  }

  private buildAnnualSettings(commissionItems: CommissionItem[], talentId: string): CleanCommissionDetails {
    const toInsert: unknown[] = [];
    const toUpdate: unknown[] = [];
    const toDelete: unknown[] = [];

    for (const commission of commissionItems) {
      if (commission._status === 'deleted') continue;

      for (const annual of (commission.annualPerformanceItems || [])) {
        if (!annual.selected) {
          continue;
        }

        const isNewItem = annual._status === 'new' || String(annual.id || '').startsWith('temp_');
        const hasValidId = annual.id && !String(annual.id).startsWith('temp_');

        const cleanAnnual = {
          id: hasValidId ? Number(annual.id) : 0,
          tlt_id: this.str(commission.tlt_id),
          tlt_bdate: this.formatDateOnly(annual.tlt_bdate),
          tlt_edate: this.formatDateOnly(annual.tlt_edate),
          year_amount: annual.year_amount,
          extra_rate: this.convertPercentageToRate(annual.extra_rate)
        };

        if (annual._status === 'deleted') {
          if (hasValidId) {
            toDelete.push({ id: Number(annual.id) });
          }
        } else if (isNewItem) {
          toInsert.push(cleanAnnual);
        } else if (annual._status === 'modified') {
          toUpdate.push(cleanAnnual);
        } else if (hasValidId && (annual._status === 'original' || !annual._status)) {
          // _status 仍為 original 時也加入 toUpdate，因為欄位變更事件有時沒有正確觸發 _status 更新
          toUpdate.push(cleanAnnual);
        }
      }
    }

    return { toInsert, toUpdate, toDelete };
  }

  private buildLevelSettings(commissionItems: CommissionItem[], talentId: string): CleanCommissionDetails {
    const toInsert: unknown[] = [];
    const toUpdate: unknown[] = [];
    const toDelete: unknown[] = [];

    for (const commission of commissionItems) {
      if (commission._status === 'deleted') continue;

      for (const level of (commission.discountLevelItems || [])) {
        if (!level.selected) continue;

        const isNewItem = level._status === 'new' || String(level.id || '').startsWith('temp_');
        // 後端要求 id 必填；保留 temp_ ID 供 discount/level 關聯比對
        const levelId = level.id ? String(level.id) : '0';
        const chargedId = level.charged_id ? String(level.charged_id) : '0';

        const cleanLevel = {
          id: levelId,
          charged_id: chargedId,
          tlt_id: this.str(commission.tlt_id),
          seq_no: level.seq_no ?? 1,  // 後端更新時需要此欄位
          cag_barcode: this.str(level.cag_barcode),
          level_bmount: level.level_bmount,
          level_eamount: level.level_eamount,
          level_charge_rate: this.convertPercentageToRate(level.level_charge_rate)
        };

        if (level._status === 'deleted') {
          if (levelId) {
            toDelete.push({ id: levelId });
          }
        } else if (isNewItem) {
          toInsert.push(cleanLevel);
        } else if (level._status === 'modified') {
          toUpdate.push(cleanLevel);
        }
      }
    }

    return { toInsert, toUpdate, toDelete };
  }

  // ========== Step 4: 租金設定 ==========

  private buildConditions(
    conditionItems: ConditionItem[],
    talentId: string,
    commissionType: string
  ): CleanConditions {
    const conditions: CleanConditions = {
      fixedRents: { toInsert: [], toUpdate: [], toDelete: [] },
      baseRentHigher: { toInsert: [], toUpdate: [], toDelete: [] },
      baseCommissions: { toInsert: [], toUpdate: [], toDelete: [] },
      graduated: { toInsert: [], toUpdate: [], toDelete: [] },
      baseTier: { toInsert: [], toUpdate: [], toDelete: [] }
    };

    // 根據抽成別分類處理條件項目
    // 注意：不對 seq_no 做重排，新增項目使用 max+1 策略，避免唯一索引衝突
    for (const item of conditionItems) {
      this.categorizeConditionItem(item, conditions, talentId, commissionType);
    }

    return conditions;
  }

  private categorizeConditionItem(
    item: ConditionItem,
    conditions: CleanConditions,
    talentId: string,
    commissionType: string
  ): void {
    const status = item._status || 'original';
    if (status === 'original') return; // 不需要處理未變更的資料

    // 根據抽成別判斷應該放入哪個分類
    switch (commissionType) {
      case CommissionType.FIXED_RENT: // '1' 固定租金
        this.addToRentOperations(item, conditions.fixedRents, talentId, status);
        break;

      case CommissionType.BASE_RENT_HIGHER: // '2' 底租抽成取高者
        this.addToRentOperations(item, conditions.baseRentHigher, talentId, status);
        break;

      case CommissionType.BASE_COMMISSION: // '4' 包底抽成
        this.addToLimitOperations(item, conditions.baseCommissions, talentId, status);
        break;

      case CommissionType.GRADUATED: // '5' 層級抽成
        this.addToLevelOperations(item, conditions.graduated, talentId, status);
        break;

      case CommissionType.BASE_TIER: // '6' 包底加層級
        this.addToLevelOperations(item, conditions.baseTier, talentId, status);
        break;

      // '3' 一般抽成 不需要 Step 4 租金設定
    }
  }

  private addToRentOperations(
    item: ConditionItem,
    operations: { toInsert: unknown[]; toUpdate: unknown[]; toDelete: unknown[] },
    talentId: string,
    status: string
  ): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rentItem = item as any;
    const cleanItem = {
      id: rentItem.id ? Number(rentItem.id) : undefined,
      talent_id: talentId,
      tlt_id: this.str(rentItem.tlt_id),
      cag_bdate: this.formatDate(rentItem.cag_bdate),
      cag_edate: this.formatDate(rentItem.cag_edate),
      base_rent: rentItem.base_rent || 0,
      cag_charge_rate: rentItem.cag_charge_rate || 0  // Step 4 不需要轉換，直接存原值
    };

    switch (status) {
      case 'new':
        operations.toInsert.push(cleanItem);
        break;
      case 'modified':
        operations.toUpdate.push(cleanItem);
        break;
      case 'deleted':
        if (rentItem.id) {
          operations.toDelete.push({ id: Number(rentItem.id) });
        }
        break;
    }
  }

  private addToLimitOperations(
    item: ConditionItem,
    operations: { toInsert: unknown[]; toUpdate: unknown[]; toDelete: unknown[] },
    talentId: string,
    status: string
  ): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const limitItem = item as any;
    const cleanItem = {
      id: limitItem.id ? Number(limitItem.id) : undefined,
      talent_id: talentId,
      tlt_id: this.str(limitItem.tlt_id),
      cag_bdate: this.formatDate(limitItem.cag_bdate),
      cag_edate: this.formatDate(limitItem.cag_edate),
      limit_amt: limitItem.limit_amt || 0,
      limit_charge_rate: limitItem.limit_charge_rate || 0  // Step 4 不需要轉換，直接存原值
    };

    switch (status) {
      case 'new':
        operations.toInsert.push(cleanItem);
        break;
      case 'modified':
        operations.toUpdate.push(cleanItem);
        break;
      case 'deleted':
        if (limitItem.id) {
          operations.toDelete.push({ id: Number(limitItem.id) });
        }
        break;
    }
  }

  private addToLevelOperations(
    item: ConditionItem,
    operations: { toInsert: unknown[]; toUpdate: unknown[]; toDelete: unknown[] },
    talentId: string,
    status: string
  ): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const levelItem = item as any;
    const cleanItem = {
      id: levelItem.id ? Number(levelItem.id) : undefined,
      talent_id: talentId,
      seq_no: levelItem.seq_no || 0,
      cag_bdate: this.formatDate(levelItem.cag_bdate),
      cag_edate: this.formatDate(levelItem.cag_edate),
      limit_amt: levelItem.limit_amt,
      start_number: levelItem.start_number || 0,
      end_number: levelItem.end_number || 0,
      charge_rate: levelItem.charge_rate || 0  // Step 4 不需要轉換，直接存原值
    };

    switch (status) {
      case 'new':
        operations.toInsert.push(cleanItem);
        break;
      case 'modified':
        operations.toUpdate.push(cleanItem);
        break;
      case 'deleted':
        if (levelItem.id || levelItem.seq_no) {
          operations.toDelete.push({
            id: levelItem.id ? Number(levelItem.id) : undefined,
            seq_no: levelItem.seq_no
          });
        }
        break;
    }
  }

  // ========== Metadata ==========

  private buildMetadata(
    formData: Record<string, unknown>,
    isNewContract: boolean,
    deductions: CleanDeductions,
    commissions: CleanCommissions,
    conditions: CleanConditions
  ): CleanMetadata {
    const totalOperations =
      deductions.toInsert.length + deductions.toUpdate.length + deductions.toDelete.length +
      commissions.masters.toInsert.length + commissions.masters.toUpdate.length + commissions.masters.toDelete.length +
      commissions.discountSettings.toInsert.length + commissions.discountSettings.toUpdate.length + commissions.discountSettings.toDelete.length +
      commissions.annualSettings.toInsert.length + commissions.annualSettings.toUpdate.length + commissions.annualSettings.toDelete.length +
      commissions.levelSettings.toInsert.length + commissions.levelSettings.toUpdate.length + commissions.levelSettings.toDelete.length;

    return {
      talentId: this.str(formData['talent_id']),
      contractId: this.str(formData['contract_no']),
      commissionType: this.str(formData['tlt_term_type']).trim(),
      isNewContract,
      submittedAt: this.formatDateTime(new Date()),
      totalOperations
    };
  }

  // ========== Commission Type Change ==========

  private buildCommissionTypeChange(
    originalType: string | undefined,
    newType: string
  ): CommissionTypeChangeInfo | null {
    if (!originalType || originalType === newType) {
      return null;
    }

    return {
      HasChanged: true,
      OriginalTermType: originalType,
      NewTermType: newType,
      ClearOperations: {
        clearRentDetails: this.needsClearRent(originalType, newType),
        clearCommissionMasters: this.needsClearCommission(originalType, newType),
        clearChargedDetails: this.needsClearCommission(originalType, newType),
        clearLimitDetails: this.needsClearLimit(originalType, newType),
        clearLevelDetails: this.needsClearLevel(originalType, newType)
      }
    };
  }

  private needsClearRent(oldType: string, newType: string): boolean {
    // 如果原本是固定租金或底租抽成取高者，需要清除租金資料
    const rentTypes = [CommissionType.FIXED_RENT, CommissionType.BASE_RENT_HIGHER];
    return rentTypes.includes(oldType as CommissionType) && !rentTypes.includes(newType as CommissionType);
  }

  private needsClearCommission(oldType: string, newType: string): boolean {
    // 如果原本有抽成設定，需要清除
    const commissionTypes = [
      CommissionType.BASE_RENT_HIGHER,
      CommissionType.GENERAL_COMMISSION,
      CommissionType.BASE_COMMISSION,
      CommissionType.GRADUATED,
      CommissionType.BASE_TIER
    ];
    return commissionTypes.includes(oldType as CommissionType) &&
      (newType === CommissionType.FIXED_RENT);
  }

  private needsClearLimit(oldType: string, newType: string): boolean {
    // 如果原本是包底抽成，需要清除包底資料
    return oldType === CommissionType.BASE_COMMISSION && newType !== CommissionType.BASE_COMMISSION;
  }

  private needsClearLevel(oldType: string, newType: string): boolean {
    // 如果原本是層級或包底加層級，需要清除層級資料
    const levelTypes = [CommissionType.GRADUATED, CommissionType.BASE_TIER];
    return levelTypes.includes(oldType as CommissionType) && !levelTypes.includes(newType as CommissionType);
  }

  // ========== 工具方法 ==========

  private str(value: unknown): string {
    if (value === null || value === undefined) return '';
    return String(value);
  }

  private num(value: unknown): number {
    if (value === null || value === undefined) return 0;
    const n = Number(value);
    return isNaN(n) ? 0 : n;
  }

  private boolToYN(value: unknown): string {
    if (value === true || value === 'Y' || value === 'y' || value === '1') {
      return 'Y';
    }
    return 'N';
  }

  /**
   * 格式化日期為 YYYY-MM-DD 字串
   */
  private formatDate(value: unknown): string {
    if (!value) return '';

    let dateObj: Date | null = null;

    if (value instanceof Date) {
      dateObj = value;
    } else if (typeof value === 'string') {
      // 嘗試解析日期字串
      const parsed = new Date(value);
      if (!isNaN(parsed.getTime())) {
        dateObj = parsed;
      } else {
        // 可能已經是正確格式，直接返回
        return value;
      }
    }

    if (dateObj) {
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    return '';
  }

  /**
   * 格式化日期時間為 YYYY-MM-DD HH:mm:ss 字串
   */
  private formatDateTime(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  /**
   * 格式化日期，如果為空則返回 null
   */
  private formatDateOrNull(value: unknown): string | null {
    const result = this.formatDate(value);
    return result || null;
  }

  /**
   * 格式化 DateOnly (不含時間) - 後端用
   */
  private formatDateOnly(value: unknown): string {
    return this.formatDate(value);
  }

  /**
   * 生成臨時 ID（用於新增項目）
   */
  private generateTempId(): string {
    return `temp_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * 解析 ID 為數字格式
   * 如果是 temp_ 開頭的臨時 ID，返回 undefined
   * 否則返回數字 ID
   */
  private parseNumericId(id: unknown): number | undefined {
    if (!id) return undefined;
    const idStr = String(id);
    if (idStr.startsWith('temp_')) return undefined;
    const numId = Number(id);
    return isNaN(numId) ? undefined : numId;
  }

  /**
   * 解析 ID 為字串格式
   * 如果是 temp_ 開頭的臨時 ID，返回 undefined
   * 否則返回字串 ID
   */
  private parseStringId(id: unknown): string | undefined {
    if (!id) return undefined;
    const idStr = String(id);
    if (idStr.startsWith('temp_')) return undefined;
    return idStr;
  }

  /**
   * 將百分比轉換為小數抽成率
   * 前端顯示: 10 (表示 10%)
   * 後端儲存: 0.1
   */
  private convertPercentageToRate(percentage: number | undefined | null): number {
    if (percentage === null || percentage === undefined) return 0;
    // 如果值已經是小數格式 (< 1)，直接返回
    if (percentage > 0 && percentage < 1) return percentage;
    // 否則除以 100 轉換為小數
    return percentage / 100;
  }

  /**
   * 格式化日期為 YYYYMM 緊湊格式（代扣款專用）
   */
  private formatCompactDate(date: unknown): string {
    if (!date) return '';

    try {
      let dateObj: Date;

      if (date instanceof Date) {
        dateObj = date;
      } else if (typeof date === 'string') {
        // 已經是 YYYYMM 格式，直接返回
        if (/^\d{6}$/.test(date)) {
          return date;
        }
        // YYYYMMDD 格式，取前6位
        if (/^\d{8}$/.test(date)) {
          return date.substring(0, 6);
        }
        // 其他格式嘗試解析
        dateObj = new Date(date);
      } else {
        return '';
      }

      if (isNaN(dateObj.getTime())) {
        return '';
      }

      // 格式化為 YYYYMM
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');

      return `${year}${month}`;
    } catch {
      return '';
    }
  }
}
