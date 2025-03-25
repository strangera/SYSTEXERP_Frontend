import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// 權限相關
import {
  FunsrightInfo,
  PermissionsInfo,
} from '../../../models/system/funsrightInfo';
// 共用服務
import { AuthService } from '../../../service/system/auth.service';
import { NotificationService } from '../../../shared/service/notification.service';
import { BusinessTypeCodeService } from '../../../service/basic/business-type-code-service.service';
import { FloorService } from '../../../service/basic/floor.service';
import { HasPermissionsValue } from '../../../shared/directive/has-permission.directive';
import { ValidationService } from '../../../shared/service/validation.service';

const now = new Date();

@Component({
  selector: 'app-tls26030',
  templateUrl: './tls26030.component.html',
  styleUrls: ['./tls26030.component.scss']
})
export class TLS26030Component {

  ProgNo: string = '220037';

  // 權限變數
  funInfo: FunsrightInfo = {};
  addPermission: HasPermissionsValue = {
    progNo: this.ProgNo,
    permission: PermissionsInfo.add,
  };
  queryPermission: HasPermissionsValue = {
    progNo: this.ProgNo,
    permission: PermissionsInfo.query,
  };
  editPermission: HasPermissionsValue = {
    progNo: this.ProgNo,
    permission: PermissionsInfo.edit,
  };

  // 查詢表單
  loading: boolean = false;
  submitted: boolean = false;
  queryForm = this.formBuilder.group({
    saleDateStart: [now, [Validators.required]], // 銷售日期起
    saleDateEnd: [now, [Validators.required]],   // 銷售日期迄
    cashierCode: [],  // 收銀機號
    counterCode: [],  // 專櫃編號
    businessTypeCode: [],  // 業種
    machineStats: [],  // 依機台統計
  });

  // 下拉選單選項
  businessTypeCodeOptions: any[] = [];
  floorOptions: any[] = [];

  // 表格資料
// 表格資料
data: any[] = [
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: '001829', counterCodeName: '000043 / Ann by asin', preSaleAmount: '3,066', recognitionAmount: '0', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00001' },
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: '001890', counterCodeName: '000043 / Ann by asin', preSaleAmount: '4,742', recognitionAmount: '0', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00002' },
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: '001892', counterCodeName: '000043 / Ann by asin', preSaleAmount: '2,980', recognitionAmount: '0', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00003' },
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: '001893', counterCodeName: '000043 / Ann by asin', preSaleAmount: '2,780', recognitionAmount: '0', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00004' },
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: '001895', counterCodeName: '000043 / Ann by asin', preSaleAmount: '2,680', recognitionAmount: '0', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00005' },
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: 'P00001', counterCodeName: '000043 / Ann by asin', preSaleAmount: '0', recognitionAmount: '3,066', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00006' },
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: 'P00002', counterCodeName: '000043 / Ann by asin', preSaleAmount: '0', recognitionAmount: '4,742', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00007' },
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: 'P00006', counterCodeName: '000043 / Ann by asin', preSaleAmount: '0', recognitionAmount: '2,780', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00008' },
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: 'P00006', counterCodeName: '000043 / Ann by asin', preSaleAmount: '0', recognitionAmount: '2,680', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00009' },
  { salesDate: '2019/03/23', cashRegisterCode: '000701', transactionSerial: '002530', counterCodeName: '000070 / Yankee Candle', preSaleAmount: '1,200', recognitionAmount: '0', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000701', accountSerial: 'P00001' },
  { salesDate: '2019/03/23', cashRegisterCode: '000701', transactionSerial: '002531', counterCodeName: '000070 / Yankee Candle', preSaleAmount: '1,259', recognitionAmount: '0', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000701', accountSerial: 'P00002' },
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: '001890', counterCodeName: '000043 / Ann by asin', preSaleAmount: '4,742', recognitionAmount: '0', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00002' },
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: '001892', counterCodeName: '000043 / Ann by asin', preSaleAmount: '2,980', recognitionAmount: '0', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00003' },
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: '001893', counterCodeName: '000043 / Ann by asin', preSaleAmount: '2,780', recognitionAmount: '0', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00004' },
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: '001895', counterCodeName: '000043 / Ann by asin', preSaleAmount: '2,680', recognitionAmount: '0', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00005' },
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: 'P00001', counterCodeName: '000043 / Ann by asin', preSaleAmount: '0', recognitionAmount: '3,066', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00006' },
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: 'P00002', counterCodeName: '000043 / Ann by asin', preSaleAmount: '0', recognitionAmount: '4,742', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00007' },
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: 'P00006', counterCodeName: '000043 / Ann by asin', preSaleAmount: '0', recognitionAmount: '2,780', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00008' },
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: 'P00006', counterCodeName: '000043 / Ann by asin', preSaleAmount: '0', recognitionAmount: '2,680', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00009' },
  { salesDate: '2019/03/23', cashRegisterCode: '000701', transactionSerial: '002530', counterCodeName: '000070 / Yankee Candle', preSaleAmount: '1,200', recognitionAmount: '0', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000701', accountSerial: 'P00001' },
  { salesDate: '2019/03/23', cashRegisterCode: '000701', transactionSerial: '002531', counterCodeName: '000070 / Yankee Candle', preSaleAmount: '1,259', recognitionAmount: '0', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000701', accountSerial: 'P00002' },
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: '001890', counterCodeName: '000043 / Ann by asin', preSaleAmount: '4,742', recognitionAmount: '0', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00002' },
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: '001892', counterCodeName: '000043 / Ann by asin', preSaleAmount: '2,980', recognitionAmount: '0', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00003' },
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: '001893', counterCodeName: '000043 / Ann by asin', preSaleAmount: '2,780', recognitionAmount: '0', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00004' },
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: '001895', counterCodeName: '000043 / Ann by asin', preSaleAmount: '2,680', recognitionAmount: '0', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00005' },
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: 'P00001', counterCodeName: '000043 / Ann by asin', preSaleAmount: '0', recognitionAmount: '3,066', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00006' },
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: 'P00002', counterCodeName: '000043 / Ann by asin', preSaleAmount: '0', recognitionAmount: '4,742', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00007' },
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: 'P00006', counterCodeName: '000043 / Ann by asin', preSaleAmount: '0', recognitionAmount: '2,780', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00008' },
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: 'P00006', counterCodeName: '000043 / Ann by asin', preSaleAmount: '0', recognitionAmount: '2,680', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00009' },
  { salesDate: '2019/03/23', cashRegisterCode: '000701', transactionSerial: '002530', counterCodeName: '000070 / Yankee Candle', preSaleAmount: '1,200', recognitionAmount: '0', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000701', accountSerial: 'P00001' },
  { salesDate: '2019/03/23', cashRegisterCode: '000701', transactionSerial: '002531', counterCodeName: '000070 / Yankee Candle', preSaleAmount: '1,259', recognitionAmount: '0', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000701', accountSerial: 'P00002' },
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: '001890', counterCodeName: '000043 / Ann by asin', preSaleAmount: '4,742', recognitionAmount: '0', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00002' },
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: '001892', counterCodeName: '000043 / Ann by asin', preSaleAmount: '2,980', recognitionAmount: '0', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00003' },
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: '001893', counterCodeName: '000043 / Ann by asin', preSaleAmount: '2,780', recognitionAmount: '0', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00004' },
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: '001895', counterCodeName: '000043 / Ann by asin', preSaleAmount: '2,680', recognitionAmount: '0', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00005' },
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: 'P00001', counterCodeName: '000043 / Ann by asin', preSaleAmount: '0', recognitionAmount: '3,066', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00006' },
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: 'P00002', counterCodeName: '000043 / Ann by asin', preSaleAmount: '0', recognitionAmount: '4,742', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00007' },
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: 'P00006', counterCodeName: '000043 / Ann by asin', preSaleAmount: '0', recognitionAmount: '2,780', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00008' },
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: 'P00006', counterCodeName: '000043 / Ann by asin', preSaleAmount: '0', recognitionAmount: '2,680', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00009' },
  { salesDate: '2019/03/23', cashRegisterCode: '000701', transactionSerial: '002530', counterCodeName: '000070 / Yankee Candle', preSaleAmount: '1,200', recognitionAmount: '0', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000701', accountSerial: 'P00001' },
  { salesDate: '2019/03/23', cashRegisterCode: '000701', transactionSerial: '002531', counterCodeName: '000070 / Yankee Candle', preSaleAmount: '1,259', recognitionAmount: '0', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000701', accountSerial: 'P00002' },
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: '001890', counterCodeName: '000043 / Ann by asin', preSaleAmount: '4,742', recognitionAmount: '0', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00002' },
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: '001892', counterCodeName: '000043 / Ann by asin', preSaleAmount: '2,980', recognitionAmount: '0', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00003' },
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: '001893', counterCodeName: '000043 / Ann by asin', preSaleAmount: '2,780', recognitionAmount: '0', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00004' },
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: '001895', counterCodeName: '000043 / Ann by asin', preSaleAmount: '2,680', recognitionAmount: '0', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00005' },
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: 'P00001', counterCodeName: '000043 / Ann by asin', preSaleAmount: '0', recognitionAmount: '3,066', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00006' },
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: 'P00002', counterCodeName: '000043 / Ann by asin', preSaleAmount: '0', recognitionAmount: '4,742', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00007' },
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: 'P00006', counterCodeName: '000043 / Ann by asin', preSaleAmount: '0', recognitionAmount: '2,780', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00008' },
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: 'P00006', counterCodeName: '000043 / Ann by asin', preSaleAmount: '0', recognitionAmount: '2,680', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00009' },
  { salesDate: '2019/03/23', cashRegisterCode: '000701', transactionSerial: '002530', counterCodeName: '000070 / Yankee Candle', preSaleAmount: '1,200', recognitionAmount: '0', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000701', accountSerial: 'P00001' },
  { salesDate: '2019/03/23', cashRegisterCode: '000701', transactionSerial: '002531', counterCodeName: '000070 / Yankee Candle', preSaleAmount: '1,259', recognitionAmount: '0', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000701', accountSerial: 'P00002' },
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: '001890', counterCodeName: '000043 / Ann by asin', preSaleAmount: '4,742', recognitionAmount: '0', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00002' },
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: '001892', counterCodeName: '000043 / Ann by asin', preSaleAmount: '2,980', recognitionAmount: '0', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00003' },
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: '001893', counterCodeName: '000043 / Ann by asin', preSaleAmount: '2,780', recognitionAmount: '0', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00004' },
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: '001895', counterCodeName: '000043 / Ann by asin', preSaleAmount: '2,680', recognitionAmount: '0', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00005' },
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: 'P00001', counterCodeName: '000043 / Ann by asin', preSaleAmount: '0', recognitionAmount: '3,066', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00006' },
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: 'P00002', counterCodeName: '000043 / Ann by asin', preSaleAmount: '0', recognitionAmount: '4,742', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00007' },
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: 'P00006', counterCodeName: '000043 / Ann by asin', preSaleAmount: '0', recognitionAmount: '2,780', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00008' },
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: 'P00006', counterCodeName: '000043 / Ann by asin', preSaleAmount: '0', recognitionAmount: '2,680', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00009' },
  { salesDate: '2019/03/23', cashRegisterCode: '000701', transactionSerial: '002530', counterCodeName: '000070 / Yankee Candle', preSaleAmount: '1,200', recognitionAmount: '0', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000701', accountSerial: 'P00001' },
  { salesDate: '2019/03/23', cashRegisterCode: '000701', transactionSerial: '002531', counterCodeName: '000070 / Yankee Candle', preSaleAmount: '1,259', recognitionAmount: '0', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000701', accountSerial: 'P00002' },
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: '001890', counterCodeName: '000043 / Ann by asin', preSaleAmount: '4,742', recognitionAmount: '0', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00002' },
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: '001892', counterCodeName: '000043 / Ann by asin', preSaleAmount: '2,980', recognitionAmount: '0', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00003' },
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: '001893', counterCodeName: '000043 / Ann by asin', preSaleAmount: '2,780', recognitionAmount: '0', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00004' },
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: '001895', counterCodeName: '000043 / Ann by asin', preSaleAmount: '2,680', recognitionAmount: '0', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00005' },
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: 'P00001', counterCodeName: '000043 / Ann by asin', preSaleAmount: '0', recognitionAmount: '3,066', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00006' },
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: 'P00002', counterCodeName: '000043 / Ann by asin', preSaleAmount: '0', recognitionAmount: '4,742', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00007' },
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: 'P00006', counterCodeName: '000043 / Ann by asin', preSaleAmount: '0', recognitionAmount: '2,780', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00008' },
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: 'P00006', counterCodeName: '000043 / Ann by asin', preSaleAmount: '0', recognitionAmount: '2,680', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00009' },
  { salesDate: '2019/03/23', cashRegisterCode: '000701', transactionSerial: '002530', counterCodeName: '000070 / Yankee Candle', preSaleAmount: '1,200', recognitionAmount: '0', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000701', accountSerial: 'P00001' },
  { salesDate: '2019/03/23', cashRegisterCode: '000701', transactionSerial: '002531', counterCodeName: '000070 / Yankee Candle', preSaleAmount: '1,259', recognitionAmount: '0', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000701', accountSerial: 'P00002' },
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: '001890', counterCodeName: '000043 / Ann by asin', preSaleAmount: '4,742', recognitionAmount: '0', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00002' },
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: '001892', counterCodeName: '000043 / Ann by asin', preSaleAmount: '2,980', recognitionAmount: '0', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00003' },
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: '001893', counterCodeName: '000043 / Ann by asin', preSaleAmount: '2,780', recognitionAmount: '0', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00004' },
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: '001895', counterCodeName: '000043 / Ann by asin', preSaleAmount: '2,680', recognitionAmount: '0', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00005' },
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: 'P00001', counterCodeName: '000043 / Ann by asin', preSaleAmount: '0', recognitionAmount: '3,066', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00006' },
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: 'P00002', counterCodeName: '000043 / Ann by asin', preSaleAmount: '0', recognitionAmount: '4,742', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00007' },
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: 'P00006', counterCodeName: '000043 / Ann by asin', preSaleAmount: '0', recognitionAmount: '2,780', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00008' },
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: 'P00006', counterCodeName: '000043 / Ann by asin', preSaleAmount: '0', recognitionAmount: '2,680', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00009' },
  { salesDate: '2019/03/23', cashRegisterCode: '000701', transactionSerial: '002530', counterCodeName: '000070 / Yankee Candle', preSaleAmount: '1,200', recognitionAmount: '0', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000701', accountSerial: 'P00001' },
  { salesDate: '2019/03/23', cashRegisterCode: '000701', transactionSerial: '002531', counterCodeName: '000070 / Yankee Candle', preSaleAmount: '1,259', recognitionAmount: '0', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000701', accountSerial: 'P00002' },
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: '001890', counterCodeName: '000043 / Ann by asin', preSaleAmount: '4,742', recognitionAmount: '0', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00002' },
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: '001892', counterCodeName: '000043 / Ann by asin', preSaleAmount: '2,980', recognitionAmount: '0', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00003' },
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: '001893', counterCodeName: '000043 / Ann by asin', preSaleAmount: '2,780', recognitionAmount: '0', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00004' },
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: '001895', counterCodeName: '000043 / Ann by asin', preSaleAmount: '2,680', recognitionAmount: '0', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00005' },
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: 'P00001', counterCodeName: '000043 / Ann by asin', preSaleAmount: '0', recognitionAmount: '3,066', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00006' },
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: 'P00002', counterCodeName: '000043 / Ann by asin', preSaleAmount: '0', recognitionAmount: '4,742', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00007' },
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: 'P00006', counterCodeName: '000043 / Ann by asin', preSaleAmount: '0', recognitionAmount: '2,780', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00008' },
  { salesDate: '2019/03/23', cashRegisterCode: '000431', transactionSerial: 'P00006', counterCodeName: '000043 / Ann by asin', preSaleAmount: '0', recognitionAmount: '2,680', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000431', accountSerial: 'P00009' },
  { salesDate: '2019/03/23', cashRegisterCode: '000701', transactionSerial: '002530', counterCodeName: '000070 / Yankee Candle', preSaleAmount: '1,200', recognitionAmount: '0', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000701', accountSerial: 'P00001' },
  { salesDate: '2019/03/23', cashRegisterCode: '000701', transactionSerial: '002531', counterCodeName: '000070 / Yankee Candle', preSaleAmount: '1,259', recognitionAmount: '0', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000701', accountSerial: 'P00002' },
  { salesDate: '2019/03/23', cashRegisterCode: '000701', transactionSerial: '002532', counterCodeName: '000070 / Yankee Candle', preSaleAmount: '598', recognitionAmount: '0', recognitionBatch: '20190328001', saleStatus: '預售結帳', returnMachineDate: '', returnMachineCode: '', returnMachineSerial: '', accountDate: '2019/03/28', accountMachineCode: '000701', accountSerial: 'P00003' }
];

filteredData: any[] = [...this.data];

columns: any[] = [
  { field: 'salesDate', header: '銷售日期', visible: true },
  { field: 'cashRegisterCode', header: '收銀機號', visible: true },
  { field: 'transactionSerial', header: '交易序號', visible: true },
  { field: 'counterCodeName', header: '專櫃編號/名稱', visible: true },
  { field: 'preSaleAmount', header: '預售金額', visible: true },
  { field: 'recognitionAmount', header: '認列金額', visible: true },
  { field: 'recognitionBatch', header: '認列批號', visible: true },
  { field: 'saleStatus', header: '銷售狀態', visible: true },
  { field: 'returnMachineDate', header: '作廢/退貨日期', visible: true },
  { field: 'returnMachineCode', header: '作廢/退貨機號', visible: true },
  { field: 'returnMachineSerial', header: '作廢/退貨序號', visible: true },
  { field: 'accountDate', header: '結帳日期', visible: true },
  { field: 'accountMachineCode', header: '結帳機號', visible: true },
  { field: 'accountSerial', header: '結帳序號', visible: true }
];


  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private businessTypeCodeService: BusinessTypeCodeService,  // 業種 service
    private floorService: FloorService,  // 依機台統計 service
  ) {}

  ngOnInit(): void {
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    this.businessTypeCodeService.getBusinessTypeCodes().subscribe((data) => {
      this.businessTypeCodeOptions = data;
    });

    this.floorService.getFloors().subscribe((data) => {
      this.floorOptions = data;
    });
  }

  canQuery(): boolean {
    return this.funInfo.permissions?.includes(PermissionsInfo.query) as boolean;
  }

  canAdd(): boolean {
    return this.funInfo.permissions?.includes(PermissionsInfo.add) as boolean;
  }

  canEdit(): boolean {
    return this.funInfo.permissions?.includes(PermissionsInfo.edit) as boolean;
  }

  onSubmit(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;
    this.messageService.blockUi();

    if (frm.valid && this.canQuery()) {
      // 提交邏輯
    }

    this.loading = false;
    this.messageService.unblockUi();
  }

  onSubmitQuery(frm: FormGroup) {
    // 查詢邏輯
    this.onSubmit(frm);
  }

  onClearForm() {
    this.queryForm.reset();  // 重置表單
  }

  onCreate() {
    if (this.canAdd()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: 'Create',
          queryform: this.queryForm,
        },
        skipLocationChange: true,
      };
      this.router.navigate(['/demo/demoInputTableCRU'], extras);
    }
  }

  onEdit(data: any) {
    if (this.canEdit()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: 'Edit',
          rowdata: data,
          queryform: this.queryForm,
        },
        skipLocationChange: true,
      };
      this.router.navigate(['/demo/demoInputTableCRU'], extras);
    }
  }

  onDetail(data: any) {
    let extras: NavigationExtras = {
      state: {
        crudstatus: 'Read',
        rowdata: data,
        queryform: this.queryForm,
      },
      skipLocationChange: true,
    };
    this.router.navigate(['/demo/demoInputTableCRU'], extras);
  }
}
