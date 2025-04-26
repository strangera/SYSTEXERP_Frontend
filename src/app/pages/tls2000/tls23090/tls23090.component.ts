import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { FunsrightInfo, PermissionsInfo } from '../../../shared/models/system/funsrightInfo';
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { HasPermissionsValue } from '../../../shared/directive/has-permission.directive';
import { CardTypeService } from '../../../service/basic/card-type.service';

@Component({
  selector: 'app-tls23090',
  templateUrl: './tls23090.component.html',
  styleUrls: ['./tls23090.component.scss']
})
export class TLS23090Component {

  ProgNo: string = '220018';

  // 權限
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
    saleStartDate: [, [Validators.required]], // 銷售開始日期
    saleEndDate: [, [Validators.required]],   // 銷售結束日期
    cashRegisterCode: [], // 收銀機代號
    counterCode: [], // 專櫃編號
    creditCardType: [], // 信用卡別
    creditCardNumber: [], // 信用卡號
    amount: [], // 金額
    recordsPerPage: [] // 每頁顯示筆數
  });

  // 表格資料
  data: any[] = [];
  filteredData: any[] = [...this.data];

  // 列定義
  columns: any[] = [
    { field: 'saleDate', header: '銷售日期', visible: true },
    { field: 'cashRegisterCode', header: '收銀機代號', visible: true },
    { field: 'transactionNumber', header: '交易序號', visible: true },
    { field: 'counterCodeOrName', header: '專櫃編號/名稱', visible: true },
    { field: 'creditCardType', header: '信用卡卡別', visible: true },
    { field: 'creditCardNumber', header: '信用卡卡號', visible: true },
    { field: 'amount', header: '金額', visible: true },
    { field: 'bonus', header: '紅利', visible: true },
    { field: 'installment', header: '分期', visible: true },
    { field: 'installmentPeriodType', header: '分期期別', visible: true },
    { field: 'installmentPeriods', header: '分期期數', visible: true },
    { field: 'downPayment', header: '頭期款分期金額', visible: true },
    { field: 'monthlyPayment', header: '每期分期金額', visible: true },
  ];

  // 切換的報表列定義
  reportColumns: any[] = [

    { field: 'salesDate', header: '銷售日期', visible: true },
    { field: 'cashierMachine', header: '收銀機', visible: true },
    { field: 'franchiseNumberName', header: '專櫃編號/名稱', visible: true },
    { field: 'aeCount', header: 'AE-筆數', visible: true },
    { field: 'aeAmount', header: 'AE-金額', visible: true },
    { field: 'daCount', header: 'DA-筆數', visible: true },
    { field: 'daAmount', header: 'DA-金額', visible: true },
    { field: 'masterCount', header: 'MASTER-筆數', visible: true },
    { field: 'masterAmount', header: 'MASTER-金額', visible: true },
    { field: 'visaCount', header: 'VISA-筆數', visible: true },
    { field: 'visaAmount', header: 'VISA-金額', visible: true },
    { field: 'jcbCount', header: 'JCB-筆數', visible: true },
    { field: 'jcbAmount', header: 'JCB-金額', visible: true },
    { field: 'unionPayCount', header: '銀聯卡-筆數', visible: true },
    { field: 'unionPayAmount', header: '銀聯卡-金額', visible: true },
    { field: 'otherCount', header: '其他-筆數', visible: true },
    { field: 'otherAmount', header: '其他-金額', visible: true },
    { field: 'totalCount', header: '合計-筆數', visible: true },
    { field: 'totalAmount', header: '合計-金額', visible: true },
  ];

  creditCardTypeOptions: any[] = [];
  recordsPerPageOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private cardTypeService: CardTypeService,
  ) { }

  ngOnInit(): void {
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    this.cardTypeService.getCardType().subscribe(data => {
      this.creditCardTypeOptions = data;
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
      // 提交查詢邏輯
      this.data = this.getMockData(); // 使用模擬數據
      this.filteredData = [...this.data];
      this.columns = this.getDefaultColumns(); // 顯示默認表格列
    }

    this.loading = false;
    this.messageService.unblockUi();
  }

  onSubmitQuery(frm: FormGroup) {
    this.onSubmit(frm);
  }

  onShowReport() {
    // 切換為報表的列顯示
    this.columns = [...this.reportColumns];
    this.data = this.getMockReportData(); // 使用模擬報表數據
    this.filteredData = [...this.data];
  }

  getDefaultColumns(): any[] {
    // 返回默認的表格列
    return [
      { field: 'saleDate', header: '銷售日期', visible: true },
      { field: 'cashRegisterCode', header: '收銀機代號', visible: true },
      { field: 'transactionNumber', header: '交易序號', visible: true },
      { field: 'counterCodeOrName', header: '專櫃編號/名稱', visible: true },
      { field: 'creditCardType', header: '信用卡卡別', visible: true },
      { field: 'creditCardNumber', header: '信用卡卡號', visible: true },
      { field: 'amount', header: '金額', visible: true },
      { field: 'bonus', header: '紅利', visible: true },
      { field: 'installment', header: '分期', visible: true },
      { field: 'installmentPeriodType', header: '分期期別', visible: true },
      { field: 'installmentPeriods', header: '分期期數', visible: true },
      { field: 'downPayment', header: '頭期款分期金額', visible: true },
      { field: 'monthlyPayment', header: '每期分期金額', visible: true },
    ];
  }

  getMockData(): any[] {
    // 返回模擬查詢數據
    return [
      { saleDate: '2024-10-25', cashRegisterCode: '001', transactionNumber: '123456', counterCodeOrName: 'A001', creditCardType: 'VISA', creditCardNumber: '1234-****-5678', amount: 1000, bonus: 100, installment: '是', installmentPeriodType: '一般', installmentPeriods: 3, downPayment: 300, monthlyPayment: 350 },
      // 模擬更多數據...
    ];
  }

  getMockReportData(): any[] {
    // 返回模擬報表數據
    return [
      { sequence: 1, salesDate: '2024-10-25', cashierMachine: '001', franchiseNumberName: 'A001', aeCount: 10, aeAmount: 1000, daCount: 5, daAmount: 500, masterCount: 7, masterAmount: 700, visaCount: 8, visaAmount: 800, jcbCount: 2, jcbAmount: 200, unionPayCount: 3, unionPayAmount: 300, otherCount: 1, otherAmount: 100, totalCount: 36, totalAmount: 3600 },
      // 模擬更多報表數據...
    ];
  }

  onClearForm() {
    this.queryForm.reset();
  }

  onCreate() {
    if (this.canAdd()) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: CRUDStatus.Create,
          queryform: this.queryForm.value,
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
          crudstatus: CRUDStatus.Edit,
          rowdata: data,
          queryform: this.queryForm.value,
        },
        skipLocationChange: true,
      };
      this.router.navigate(['/demo/demoInputTableCRU'], extras);
    }
  }

  onDetail(data: any) {
    let extras: NavigationExtras = {
      state: {
        crudstatus: CRUDStatus.Read,
        rowdata: data,
        queryform: this.queryForm.value,
      },
      skipLocationChange: true,
    };
    this.router.navigate(['/demo/demoInputTableCRU'], extras);
  }
}
