import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';

const now = new Date();

@Component({
  selector: 'app-demosteps',
  templateUrl: './demosteps.component.html',
  styleUrls: ['./demosteps.component.scss']
})
export class DemostepsComponent implements OnInit {
  membershipLevels = [
    { name: '一般', value: 'basic' },
    { name: '白銀', value: 'silver' },
    { name: '鈦金', value: 'platinum' }
  ];
  
  usedaylist0 = [
    { name: '每日', value: 'usedayone'},
    { name: '限平日', value: 'usedayu'},
    { name: '限假日', value: 'usedayw'},
  ];
  
  usedaylist1 = [
    { name: '一', value: 'useday1'},
    { name: '二', value: 'useday2'},
    { name: '三', value: 'useday3'},
    { name: '四', value: 'useday4'},
    { name: '五', value: 'useday5'},
    { name: '六', value: 'useday6'},
    { name: '日', value: 'useday7'},
  ];

  // Step 2 必要項目
  eventtypeOptions: any = [
    { name: '購幣', value: 1 },
    { name: '兌换', value: 2 },
    { name: '來店（會員認證）', value: 3 },
  ];
  
  coupontypeOptions: any = [
    { name: '促銷', value: 1 },
    { name: '折扣', value: 2 },
    { name: '免費', value: 3 },
    { name: '贈品', value: 4 },
    { name: '來店禮', value: 5 },
    { name: '生日禮', value: 6 },
    { name: '組合指定商品', value: 7 },
  ];

  //step3必要項目
  giveawaytypeOptions: any = [
    { name: '優惠卷', value: 1 },
    { name: '彩票', value: 2 },
    { name: '紅利', value: 3 },
    { name: '商品', value: 4 },
  ];

  formGroupStep1 = 'step1Info'; // 行銷設定
  formGroupStep2 = 'step2Info'; // 行銷設定
  formGroupStep3 = 'step3Info'; // 行銷設定

  isPreview: boolean = false; // 控制是否為預覽狀態

  userForm: FormGroup;

  constructor(private formBuilder: FormBuilder) {
    // 初始化 userForm
    this.userForm = this.formBuilder.group({
      step1Info: this.formBuilder.group({
        serialnumber: [0, [Validators.required, Validators.minLength(5), Validators.maxLength(10)]], // 行銷代號 (系統產生)
        promocode: [0, Validators.required], // 促銷代碼
        title: ['', Validators.required], // 行銷標題
        eventstarttime: [now, Validators.required], // 行銷期間
        eventendtime: [now, Validators.required], // 行銷期間
        description: ['', Validators.required], // 行銷說明
      }),
      step2Info: this.formBuilder.group({
        eventtype: [1, Validators.required], // 交易類別
        coupontype: [1, Validators.required], // 優惠卷類型
        limitstarttime: [now, Validators.required], // 日期限制
        limitendtime: [now, Validators.required],
        thresholdvalue: [0, Validators.required], // 滿門檻
        thresholdvalueunit: [1, Validators.required], // 滿門檻單位
        usagecount: [0, Validators.required], // 次數限制
        getgiftcount: [0, Validators.required], // 取得贈品數
        memberships: this.formBuilder.array(this.membershipLevels.map(level => this.formBuilder.control(false))), // 會員等級
      }),
      step3Info: this.formBuilder.group({
        items: this.formBuilder.array([]), // 動態表單數組
      }),
    });
  }

  ngOnInit(): void {
    // 假設這裡是獲取 Step3Component 的 data
    const step3Data = this.getDynamicStep3Data(); // 獲取動態數據
    this.setStep3Info(step3Data); // 設置 step3Info
  }

  getDynamicStep3Data() {
    // 這裡模擬從 Step3Component 獲取的數據，可以根據需要調整
    return [
      {
        giveawaytype: 1,
        tickettype: 1,
        ticketclassification: 1,
        giveawaytitle: '贈品1',
        giveawaydescribe: '贈品說明1',
        usedstarttime: now,
        usedendtime: now,
        giveawaythresholdvalue: 0,
        giveawaycount: 0,
        usedaylimits0: [false, false, true], // 例如只允許假日
        usedaylimits1: [false, true, false, false, false, false, false], // 例如只允許星期二
        giveawayvalue: 100,
        giveawayunit: 1,
        Instructionsofuse: '使用說明1',
      },
      // 可以添加更多項目
    ];
  }

  setStep3Info(data: any[]) {
    const itemsArray = this.userForm.get('step3Info.items') as FormArray;
    data.forEach(item => {
      itemsArray.push(this.formBuilder.group({
        giveawaytype: [1, Validators.required], // 贈品類別
      tickettype: [1, Validators.required], // 票卷種類
      ticketclassification: [1, Validators.required], // 票卷分類
      giveawaytitle: ['', Validators.required], // 贈品標題
      giveawaydescribe: ['', Validators.required], //  1-1 贈品說明
      usedstarttime: [now, Validators.required], // 票卷使用起訖日期 (start-end datetime yyyy/mm/dd HH:mm)
      usedendtime: [now, Validators.required], // 票卷使用起訖日期
      giveawaythresholdvalue: [0, Validators.required], // 滿額條件
      giveawaycount: [0, Validators.required], // 次數限制 (0 不限制)
      usedaylimits0: this.formBuilder.array(this.usedaylist0.map(level => this.formBuilder.control(false))), // 使用星期限制
      usedaylimits1: this.formBuilder.array(this.usedaylist1.map(level => this.formBuilder.control(false))), // 使用星期限制
      giveawayvalue: [0, Validators.required], // 價值
      giveawayunit: [0, Validators.required], // 單位
      // ----------------------------------------------------------------
      // 1-2 使用區域限制
      // 1-2 適用門市
      Instructionsofuse: ['', Validators.required], // 使用說明
      }));
    });
  }

  // 新增 getter 方法來獲取 items
  get items(): FormArray {
    return this.userForm.get('step3Info.items') as FormArray;
  }

  // 在顯示預覽資料時禁用整個表單
  togglePreview() {
    this.isPreview = !this.isPreview;
    if (this.isPreview) {
      this.userForm.disable(); // 禁用表單
    } else {
      this.userForm.enable(); // 啟用表單
    }
  }
}
