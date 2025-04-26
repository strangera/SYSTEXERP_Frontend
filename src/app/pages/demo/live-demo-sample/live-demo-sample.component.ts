import { SystemTypeService } from './../../../service/basic/system-type.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';

@Component({
  selector: 'app-live-demo-sample',
  templateUrl: './live-demo-sample.component.html',
  styleUrl: './live-demo-sample.component.scss',
})
export class LiveDemoSampleComponent
  extends BasicQpageComponent
  implements OnInit {
  //
  columns: any[] = [
    { field: 'id', header: 'ID', visible: true },
    { field: 'code', header: '代碼檔', visible: true },
    { field: 'name', header: '作業名稱', visible: true },
  ];
  filterFields: any[] = ['code', 'name'];
  systemTypeOptions = [
    { id: 1, code: '4101', name: '公司基本資料維護作業 (4101)' },
    { id: 2, code: '4102', name: '廠商基本資料維護作業 (4102)' },
    { id: 3, code: '4103', name: '組織階層設定作業 (4103)' },
    { id: 4, code: '4104', name: '組織碼設定作業 (4104)' },
    { id: 5, code: '4105', name: '區域基本資料維護作業 (4105)' },
    { id: 6, code: '4106', name: '樓層基本資料維護作業 (4106)' },
    { id: 7, code: '4107', name: '業種基本資料維護作業 (4107)' },
    { id: 8, code: '4108', name: '商品類別維護作業 (4108)' },
    { id: 9, code: '4109', name: '小分類維護作業 (4109)' },
    { id: 10, code: '4110', name: '銀行基本資料維護作業 (4110)' },
    { id: 11, code: '4111', name: '參數資料設定維護 (4111)' },
    { id: 12, code: '4112', name: '簽核權限設定維護 (4112)' },
    { id: 13, code: '4113', name: '縣市區域資料維護作業 (4113)' },
  ];

  // 1. 銀行資料查詢
  backsearchplaceholder: string = '模糊查詢:機構代碼, 機構名稱';
  backcolumns: any[] = [
    { field: 'id', header: 'ID', visible: true },
    { field: 'code', header: '機構代碼', visible: true },
    { field: 'name', header: '機構名稱', visible: true },
  ];
  backOptions = [
    { id: 1, code: '004', name: '臺灣銀行股份有限公司' },
    { id: 2, code: '0040037', name: '臺灣銀行營業部' },
    { id: 3, code: '0040059', name: '臺灣銀行公庫部' },
    { id: 4, code: '0040071', name: '臺灣銀行館前分行' },
    { id: 5, code: '0040082', name: '臺灣銀行信託部' },
    { id: 6, code: '0040093', name: '臺灣銀行臺南分行' },
    { id: 7, code: '0040107', name: '臺灣銀行臺中分行' },
    { id: 8, code: '0040118', name: '臺灣銀行高雄分行' },
    { id: 9, code: '0040129', name: '臺灣銀行基隆分行' },
    { id: 10, code: '0040130', name: '臺灣銀行中興新村分行' },
    { id: 11, code: '0040141', name: '臺灣銀行嘉義分行' },
    { id: 12, code: '0040152', name: '臺灣銀行新竹分行' },
    { id: 13, code: '0040163', name: '臺灣銀行彰化分行' },
    { id: 14, code: '0040174', name: '臺灣銀行屏東分行' },
    { id: 15, code: '005', name: '臺灣土地銀行股份有限公司' },
    { id: 16, code: '0050027', name: '臺灣土地銀行基隆分行' },
    { id: 17, code: '0050038', name: '臺灣土地銀行中和分行' },
    { id: 18, code: '0050049', name: '臺灣土地銀行南港分行' },
    { id: 19, code: '0050050', name: '臺灣土地銀行台北分行' },
    { id: 20, code: '0050061', name: '臺灣土地銀行民權分行' },
    { id: 21, code: '0050072', name: '臺灣土地銀行古亭分行' },
    { id: 22, code: '0050083', name: '臺灣土地銀行長安分行' },
    { id: 23, code: '0050094', name: '臺灣土地銀行士林分行' },
    { id: 24, code: '0050108', name: '臺灣土地銀行三重分行' },
    { id: 25, code: '0050119', name: '臺灣土地銀行宜蘭分行' },
    { id: 26, code: '0050120', name: '臺灣土地銀行羅東分行' },
    { id: 27, code: '0050131', name: '臺灣土地銀行桃園分行' },
    { id: 28, code: '0050142', name: '臺灣土地銀行中壢分行' },
    { id: 29, code: '0050153', name: '臺灣土地銀行石門分行' },
    { id: 30, code: '0050164', name: '臺灣土地銀行新竹分行' },
    { id: 31, code: '0050175', name: '臺灣土地銀行竹東分行' },
    { id: 32, code: '0050186', name: '臺灣土地銀行花蓮分行' },
    { id: 33, code: '0050197', name: '臺灣土地銀行玉里分行' },
    { id: 34, code: '0050201', name: '臺灣土地銀行苗栗分行' },
    { id: 35, code: '0050212', name: '臺灣土地銀行頭份分行' },
    { id: 36, code: '0050223', name: '臺灣土地銀行豐原分行' },
    { id: 37, code: '0050234', name: '臺灣土地銀行大甲分行' },
    { id: 38, code: '0050245', name: '臺灣土地銀行台中分行' },
    { id: 39, code: '0050256', name: '臺灣土地銀行南投分行' },
    { id: 40, code: '0050267', name: '臺灣土地銀行員林分行' },
    { id: 41, code: '0050278', name: '臺灣土地銀行斗六分行' },
    { id: 42, code: '0050289', name: '臺灣土地銀行北港分行' },
    { id: 43, code: '0050290', name: '臺灣土地銀行嘉義分行' },
    { id: 44, code: '0050304', name: '臺灣土地銀行新營分行' },
    { id: 45, code: '0050315', name: '臺灣土地銀行永康分行' },
    { id: 46, code: '0050326', name: '臺灣土地銀行台南分行' },
    { id: 47, code: '006', name: '合作金庫商業銀行股份有限公司' },
    { id: 48, code: '0060017', name: '合作金庫商業銀行財務部' },
    { id: 49, code: '0060028', name: '合作金庫商業銀行館前分行' },
    { id: 50, code: '0060039', name: '合作金庫商業銀行西門分行' },
    { id: 51, code: '0060040', name: '合作金庫商業銀行延平分行' },
    { id: 52, code: '0060051', name: '合作金庫商業銀行大稻埕分行' },
    { id: 53, code: '0060062', name: '合作金庫商業銀行東門分行' },
    { id: 54, code: '0060073', name: '合作金庫商業銀行松山分行' },
    { id: 55, code: '0060084', name: '合作金庫商業銀行新店分行' },
    { id: 56, code: '0060095', name: '合作金庫商業銀行永和分行' },
    { id: 57, code: '0060109', name: '合作金庫商業銀行三重分行' },
    { id: 58, code: '0060110', name: '合作金庫商業銀行板橋分行' },
    { id: 59, code: '0060121', name: '合作金庫商業銀行基隆分行' },
    { id: 60, code: '0060132', name: '合作金庫商業銀行宜蘭分行' },
    { id: 61, code: '0060143', name: '合作金庫商業銀行蘇澳分行' },
    { id: 62, code: '0060154', name: '合作金庫商業銀行桃園分行' },
    { id: 63, code: '0060165', name: '合作金庫商業銀行中壢分行' },
    { id: 64, code: '0060176', name: '合作金庫商業銀行新竹分行' },
  ];

  // 廠商資料查詢

  // 商品資料查詢
  queryForm = this.formBuilder.group({
    name: ['', [Validators.required, Validators.maxLength(13)]], // Input Text
    address: ['', [Validators.maxLength(10)]], // Inupt Number
    systemid: [, [Validators.required]], // Inupt Number
    posquickkeyid: [, [Validators.required]], // Inupt Number
  });

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '900001';
    this.cruPage = '/demo/demoInputTableCRU';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    // ----------------------------------------------------------------
  }

  // ----------------------------------------------------------------
  onSubmit(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;
    this.messageService.blockUi();

    if (frm.valid && this.canQuery()) {
      // 提交邏輯
      // Service
      // this.xxxService.queryMachine(frm.value as xxxInterface)
      //  .subscribe((response: any) => {
      //    this.rows = response.xxx;
      // });
    }

    this.loading = false;
    this.messageService.unblockUi();
  }

  onSubmitQuery(frm: FormGroup) {
    // 查詢邏輯
    this.onSubmit(frm);
  }
}
