import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { TLS12040Service } from '@service/api/tls/tls12040.service';
import { ContractInfo } from '../../core/models/contract/contract-info.interface';
import { LocationItem } from '../../core/models/contract/location-item.interface';
import { FareItem } from '../../core/models/deduction/fare-item.interface';
import { CommissionItem } from '../../core/models/commission/commission-item.interface';
import { ConditionItem } from '../../core/models/condition/condition-types.interface';
import { TLS12040SubmitData, SubmitResult } from '../../core/models/submit/submit-data.interface';
import { DataStatus, WizardMode } from '../../core';
import { formatDateForAPI } from '../../utils/date.utils';

@Injectable({
  providedIn: 'root'
})
export class SubmitDataService {

  constructor(
    private tls12040Service: TLS12040Service
  ) {}

  /**
   * 組裝並提交資料
   */
  submit(
    mode: WizardMode,
    contractInfo: ContractInfo,
    locationData: LocationItem[],
    fareItems: FareItem[],
    commissionItems: CommissionItem[],
    conditionItems: ConditionItem[]
  ): Observable<SubmitResult> {
    try {
      // 組裝資料
      const submitData = this.assembleSubmitData(
        mode,
        contractInfo,
        locationData,
        fareItems,
        commissionItems,
        conditionItems
      );

      // 呼叫 API
      return this.tls12040Service.submitFinalTLS12040(submitData).pipe(
        map((response: any) => ({
          success: response.Status === 'Success',
          message: response.Message || '儲存成功',
          data: response.Data
        })),
        catchError(error => {
          console.error('提交失敗:', error);
          return of({
            success: false,
            message: error?.message || '提交失敗，請稍後再試',
            data: null
          });
        })
      );
    } catch (error) {
      console.error('組裝資料失敗:', error);
      return of({
        success: false,
        message: '資料組裝失敗',
        data: null
      });
    }
  }

  /**
   * 組裝提交資料
   */
  private assembleSubmitData(
    mode: WizardMode,
    contractInfo: ContractInfo,
    locationData: LocationItem[],
    fareItems: FareItem[],
    commissionItems: CommissionItem[],
    conditionItems: ConditionItem[]
  ): TLS12040SubmitData {
    return {
      // 基本資料
      basic: this.assembleBasicData(mode, contractInfo),

      // 位置資料
      locations: this.assembleLocationData(locationData),

      // 代扣款資料
      fares: this.assembleFareData(fareItems),

      // 抽成資料
      commissions: this.assembleCommissionData(commissionItems),

      // 條件資料
      conditions: this.assembleConditionData(conditionItems),

      // 元數據
      metadata: {
        mode,
        submittedAt: new Date().toISOString(),
        version: '2.0'
      }
    };
  }

  /**
   * 組裝基本資料
   */
  private assembleBasicData(mode: WizardMode, contractInfo: ContractInfo): any {
    const data: any = {
      // 識別欄位
      id: mode === 'create' || mode === 'renewal' ? null : contractInfo.id,
      apply_no: contractInfo.apply_no || null,
      talent_id: contractInfo.talent_id || null,
      tlt_no: contractInfo.tlt_no || null,
      contract_no: contractInfo.contract_no || null,
      contract_subno: contractInfo.contract_subno || '1',

      // 廠商資訊
      ven_uniform: contractInfo.ven_uniform,
      ven_no: contractInfo.ven_no,
      vendor_ven_no: contractInfo.vendor_ven_no,
      VEN_Name: contractInfo.VEN_Name,

      // 基本資訊
      tlt_name: contractInfo.tlt_name,
      apply_type: contractInfo.apply_type,
      apply_date: formatDateForAPI(contractInfo.apply_date),
      apply_status: contractInfo.apply_status,
      contract_type: contractInfo.contract_type,
      approve_status: contractInfo.approve_status || '1',

      // 分類
      paper_type: contractInfo.paper_type,
      bus_type: contractInfo.bus_type,
      bus_class: contractInfo.bus_class,
      bus_sclass: contractInfo.bus_sclass,
      org_id: contractInfo.org_id,

      // 日期
      tlt_bdate: formatDateForAPI(contractInfo.tlt_bdate),
      tlt_edate: formatDateForAPI(contractInfo.tlt_edate),
      tlt_contract_bdate: formatDateForAPI(contractInfo.tlt_contract_bdate),
      tlt_contract_edate: formatDateForAPI(contractInfo.tlt_contract_edate),
      feedback_date: formatDateForAPI(contractInfo.feedback_date),
      due_date: formatDateForAPI(contractInfo.due_date),
      contact_Date: formatDateForAPI(contractInfo.contact_Date),

      // 洽談
      contact_USR_No: contractInfo.contact_USR_No,
      contact_USR_Name: contractInfo.contact_USR_Name,

      // 商務條件
      tlt_kind: contractInfo.tlt_kind,
      deco_type: contractInfo.deco_type,
      tlt_term_type: contractInfo.tlt_term_type,
      comm_comp_type: contractInfo.comm_comp_type || '2',
      edc_yn: contractInfo.edc_yn,
      tlt_ctype_mtotal: contractInfo.tlt_ctype_mtotal,
      overall_status: contractInfo.overall_status,
      rent_ahead: contractInfo.rent_ahead,
      rent_period: contractInfo.rent_period,
      base_rent: contractInfo.base_rent,
      deposit: contractInfo.deposit,

      // 業務設定
      comm_yn: contractInfo.comm_yn,
      rece_yn: contractInfo.rece_yn,
      pos_yn: contractInfo.pos_yn,
      cash_yn: contractInfo.cash_yn,
      money_type: contractInfo.money_type,
      store_way: contractInfo.store_way,
      check_type: this.formatCheckType(contractInfo.check_typeList),
      paytype: contractInfo.paytype,
      vip_yn: contractInfo.vip_yn,
      credit_card: contractInfo.credit_card,
      invoice_type: contractInfo.invoice_type,

      // 金額
      total_amt: contractInfo.total_amt,
      total_amt_unit: contractInfo.total_amt_unit,
      total_amt_vendor: contractInfo.total_amt_vendor,
      total_amt_vendor_unit: contractInfo.total_amt_vendor_unit,
      open_deposit: contractInfo.open_deposit,
      open_fees: contractInfo.open_fees,
      construct_deposit: contractInfo.construct_deposit,
      construct_fees: contractInfo.construct_fees,
      expiration_deposit: contractInfo.expiration_deposit,
      expiration_fees: contractInfo.expiration_fees,

      // 抄錶
      water_flag: contractInfo.water_flag,
      electric_flag: contractInfo.electric_flag,
      gas_flag: contractInfo.gas_flag,

      // 參加資訊
      cap_saletype1: contractInfo.cap_saletype1,
      cap_saletype2: contractInfo.cap_saletype2,
      cap_saletype3: contractInfo.cap_saletype3,
      cap_saletype5: contractInfo.cap_saletype5,

      // 聯絡資訊
      email: contractInfo.email,
      invoice_email: contractInfo.invoice_email,
      CHECK_TITLE: contractInfo.CHECK_TITLE,
      store_tel: contractInfo.store_tel,
      bank_id: contractInfo.bank_id,
      vendor_acct_name: contractInfo.vendor_acct_name,
      vendor_acct_no: contractInfo.vendor_acct_no,
      contact_tel: contractInfo.contact_tel,
      contact_fax: contractInfo.contact_fax,
      contact_addr: contractInfo.contact_addr,
      VEN_Address: contractInfo.VEN_Address,

      // 其他
      tlt_remark: contractInfo.tlt_remark,
      ticket_remarks: contractInfo.ticket_remarks,
      check_day: contractInfo.check_day
    };

    return data;
  }

  /**
   * 格式化對帳方式
   */
  private formatCheckType(checkTypeList: string[] | undefined): string {
    if (!checkTypeList || checkTypeList.length === 0) return '';
    return checkTypeList.join(',');
  }

  /**
   * 組裝位置資料
   */
  private assembleLocationData(locationData: LocationItem[]): any {
    const toInsert: any[] = [];
    const toUpdate: any[] = [];
    const toDelete: any[] = [];

    locationData.forEach(item => {
      const cleanItem = this.cleanLocationItem(item);

      switch (item._status) {
        case 'new':
          toInsert.push(cleanItem);
          break;
        case 'modified':
          toUpdate.push(cleanItem);
          break;
        case 'deleted':
          if (item.id && !String(item.id).startsWith('temp_')) {
            toDelete.push({ id: item.id });
          }
          break;
      }
    });

    return { toInsert, toUpdate, toDelete };
  }

  /**
   * 清理位置項目
   */
  private cleanLocationItem(item: LocationItem): any {
    return {
      id: String(item.id).startsWith('temp_') ? null : item.id,
      apply_no: item.apply_no,
      location_no: item.location_no,
      tlt_building: item.tlt_building,
      tlt_floor: item.tlt_floor,
      area_no: item.area_no,
      tlt_space: item.tlt_space
    };
  }

  /**
   * 組裝代扣款資料
   */
  private assembleFareData(fareItems: FareItem[]): any {
    const toInsert: any[] = [];
    const toUpdate: any[] = [];
    const toDelete: any[] = [];

    // 只處理已選擇的項目
    fareItems.filter(item => item.is_selected).forEach(item => {
      const cleanItem = this.cleanFareItem(item);

      switch (item._status) {
        case 'new':
          toInsert.push(cleanItem);
          break;
        case 'modified':
          toUpdate.push(cleanItem);
          break;
        case 'deleted':
          if (item.id && !String(item.id).startsWith('temp_')) {
            toDelete.push({ id: item.id });
          }
          break;
      }
    });

    // 處理取消選擇的項目（視為刪除）
    fareItems.filter(item => !item.is_selected && item._status === 'original').forEach(item => {
      if (item.id) {
        toDelete.push({ id: item.id });
      }
    });

    return { toInsert, toUpdate, toDelete };
  }

  /**
   * 清理代扣款項目
   */
  private cleanFareItem(item: FareItem): any {
    return {
      id: String(item.id).startsWith('temp_') ? null : item.id,
      apply_no: item.apply_no,
      cap_type: item.cap_type,
      cap_item: item.cap_item,
      cap_name: item.cap_name,
      tpy_bdate: formatDateForAPI(item.tpy_bdate),
      tpy_edate: formatDateForAPI(item.tpy_edate),
      tpy_type: item.tpy_type,
      tpy_qty: item.tpy_qty,
      tpy_unitamt: item.tpy_unitamt,
      tpy_amount: item.tpy_amount,
      tpy_totalamt: item.tpy_totalamt,
      tpy_rate: item.tpy_rate,
      down_payment: item.down_payment,
      period_nos: item.period_nos,
      day_account: item.day_account,
      interval: item.interval
    };
  }

  /**
   * 組裝抽成資料
   */
  private assembleCommissionData(commissionItems: CommissionItem[]): any {
    const masters = { toInsert: [] as any[], toUpdate: [] as any[], toDelete: [] as any[] };
    const chargeDetails = { toInsert: [] as any[], toUpdate: [] as any[], toDelete: [] as any[] };
    const yearChargeDetails = { toInsert: [] as any[], toUpdate: [] as any[], toDelete: [] as any[] };
    const levelChargeDetails = { toInsert: [] as any[], toUpdate: [] as any[], toDelete: [] as any[] };

    commissionItems.forEach(item => {
      const cleanMaster = this.cleanCommissionMaster(item);

      switch (item._status) {
        case 'new':
          masters.toInsert.push(cleanMaster);
          break;
        case 'modified':
          masters.toUpdate.push(cleanMaster);
          break;
        case 'deleted':
          if (item.id && !String(item.id).startsWith('temp_')) {
            masters.toDelete.push({ id: item.id });
          }
          break;
      }

      // 處理明細
      this.processCommissionDetails(item, chargeDetails, yearChargeDetails, levelChargeDetails);
    });

    return { masters, chargeDetails, yearChargeDetails, levelChargeDetails };
  }

  /**
   * 清理抽成主檔
   */
  private cleanCommissionMaster(item: CommissionItem): any {
    return {
      id: String(item.id).startsWith('temp_') ? null : item.id,
      apply_no: item.apply_no,
      tlt_id: item.tlt_id,
      tlt_id_desc: item.tlt_id_desc,
      cag_bdate: formatDateForAPI(item.cag_bdate),
      cag_edate: formatDateForAPI(item.cag_edate),
      cag_taxtype: item.cag_taxtype,
      sst_amount: item.sst_amount,
      sst_rate: item.sst_rate,
      cap_saletype1: item.cap_saletype1,
      cap_saletype2: item.cap_saletype2,
      cap_saletype3: item.cap_saletype3,
      cap_saletype5: item.cap_saletype5,
      cag_remark: item.cag_remark
    };
  }

  /**
   * 處理抽成明細
   */
  private processCommissionDetails(
    item: CommissionItem,
    chargeDetails: any,
    yearChargeDetails: any,
    levelChargeDetails: any
  ): void {
    // ChargeDetails
    item.ChargeDetails?.forEach(detail => {
      if (!detail.is_enabled) return;

      const cleanDetail = {
        id: detail.id,
        apply_no: detail.apply_no,
        tlt_id: detail.tlt_id,
        cag_barcode: detail.cag_barcode,
        tlt_bdate: formatDateForAPI(detail.tlt_bdate),
        tlt_edate: formatDateForAPI(detail.tlt_edate),
        cag_charge_rate: detail.cag_charge_rate
      };

      switch (detail._status) {
        case 'new':
          chargeDetails.toInsert.push(cleanDetail);
          break;
        case 'modified':
          chargeDetails.toUpdate.push(cleanDetail);
          break;
        case 'deleted':
          if (detail.id) chargeDetails.toDelete.push({ id: detail.id });
          break;
      }
    });

    // YearChargeDetails
    item.YearChargeDetails?.forEach(detail => {
      const cleanDetail = {
        id: detail.id,
        apply_no: detail.apply_no,
        tlt_id: detail.tlt_id,
        tlt_bdate: formatDateForAPI(detail.tlt_bdate),
        tlt_edate: formatDateForAPI(detail.tlt_edate),
        year_amount: detail.year_amount,
        extra_rate: detail.extra_rate
      };

      switch (detail._status) {
        case 'new':
          yearChargeDetails.toInsert.push(cleanDetail);
          break;
        case 'modified':
          yearChargeDetails.toUpdate.push(cleanDetail);
          break;
        case 'deleted':
          if (detail.id) yearChargeDetails.toDelete.push({ id: detail.id });
          break;
      }
    });

    // LevelChargeDetails
    item.LevelChargeDetails?.forEach(detail => {
      if (!detail.is_enabled) return;

      const cleanDetail = {
        id: detail.id,
        apply_no: detail.apply_no,
        tlt_id: detail.tlt_id,
        seq_no: detail.seq_no,
        cag_barcode: detail.cag_barcode,
        level_bmount: detail.level_bmount,
        level_eamount: detail.level_eamount,
        level_charge_rate: detail.level_charge_rate
      };

      switch (detail._status) {
        case 'new':
          levelChargeDetails.toInsert.push(cleanDetail);
          break;
        case 'modified':
          levelChargeDetails.toUpdate.push(cleanDetail);
          break;
        case 'deleted':
          if (detail.id) levelChargeDetails.toDelete.push({ id: detail.id });
          break;
      }
    });
  }

  /**
   * 組裝條件資料
   */
  private assembleConditionData(conditionItems: ConditionItem[]): any {
    const toInsert: any[] = [];
    const toUpdate: any[] = [];
    const toDelete: any[] = [];

    conditionItems.forEach(item => {
      const cleanItem = this.cleanConditionItem(item);

      switch (item._status) {
        case 'new':
          toInsert.push(cleanItem);
          break;
        case 'modified':
          toUpdate.push(cleanItem);
          break;
        case 'deleted':
          if (item.id && !String(item.id).startsWith('temp_')) {
            toDelete.push({ id: item.id });
          }
          break;
      }
    });

    return { toInsert, toUpdate, toDelete };
  }

  /**
   * 清理條件項目
   */
  private cleanConditionItem(item: ConditionItem): any {
    const base: any = {
      id: String(item.id).startsWith('temp_') ? null : item.id,
      apply_no: item.apply_no,
      condition_type: item.condition_type,
      cag_bdate: formatDateForAPI(item.cag_bdate),
      cag_edate: formatDateForAPI(item.cag_edate),
      cag_remark: item.cag_remark
    };

    // 根據類型添加額外欄位
    const extendedItem = item as any;
    if (extendedItem.rent_amount !== undefined) base.rent_amount = extendedItem.rent_amount;
    if (extendedItem.base_rent !== undefined) base.base_rent = extendedItem.base_rent;
    if (extendedItem.base_amount !== undefined) base.base_amount = extendedItem.base_amount;
    if (extendedItem.comm_rate !== undefined) base.comm_rate = extendedItem.comm_rate;
    if (extendedItem.level_no !== undefined) base.level_no = extendedItem.level_no;
    if (extendedItem.level_bamt !== undefined) base.level_bamt = extendedItem.level_bamt;
    if (extendedItem.level_eamt !== undefined) base.level_eamt = extendedItem.level_eamt;

    return base;
  }
}
