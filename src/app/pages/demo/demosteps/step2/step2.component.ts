import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { ControlContainer, FormArray, FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';

const now = new Date();

@Component({
  selector: 'app-step2',
  templateUrl: './step2.component.html',
  styleUrl: './step2.component.scss',
  viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective }],
})
export class Step2Component {
  @Input() formGroupName: string | undefined;

  //
  eventtypeOptions: any = [
    { name: '購幣', value: 1 },
    { name: '兌换', value: 2 },
    { name: '來店（會員認證）', value: 3 },
  ];
  // 滿門檻
  eventthresholdvalueunitOptions: any = [
    { name: '元', value: 1 },
    { name: '點', value: 2 },
    { name: '件', value: 3 },
    { name: '張', value: 4 },
  ];
  //
  coupontypeOptions: any = [
    { name: '促銷', value: 1 },
    { name: '折扣', value: 2 },
    { name: '免費', value: 3 },
    { name: '贈品', value: 4 },
    { name: '來店禮', value: 5 },
    { name: '生日禮', value: 6 },
    { name: '組合指定商品', value: 7 },
  ];
  //
  membershipLevels = [
    { name: '一般1', value: 'basic' },
    { name: '白銀', value: 'silver' },
    { name: '鈦金', value: 'platinum' }
  ];
  //
  sourceOptions = [
    { name: '台北市', value: 'basic' },
    { name: '新北市', value: 'basic' },
    { name: '桃園市', value: 'basic' },
  ];

  targetProducts = [

  ];

  stepForm: FormGroup = this.formBuilder.group({
    eventtype: [1, Validators.required], // 交易類別
    coupontype: [1, Validators.required], // 優惠券類型 (下拉選單 先寫死資料) 促銷，折扣，免費，贈品，來店禮，其他
    limitstarttime: [now, Validators.required], // 日期限制 (start-end datetime yyyy/mm/dd HH:mm)
    limitendtime: [now, Validators.required], //
    thresholdvalue: [0 as number, Validators.required], // 滿門檻 (輸入 ***)
    thresholdvalueunit: [1, Validators.required], // 滿門檻 (輸入 ***) 下拉選單 元，點，件，張
    usagecount: [0, Validators.required], // 次數限制 (0 不限制)
    getgiftcount: [0, Validators.required], // 取得贈品數
    memberships: this.formBuilder.array(this.membershipLevels.map(level => this.formBuilder.control(false))) // 會員等級 (自動帶入) 一般 白銀 鈦金
  });

  constructor(
    private formBuilder: FormBuilder,
    private controlContainer: ControlContainer,
    private cdr: ChangeDetectorRef,) { }

  ngOnInit(): void {
    console.log(this.formGroupName);
    this.stepForm = this.controlContainer.control?.get(this.formGroupName as string) as FormGroup;
    console.log(this.stepForm);
    this.cdr.markForCheck();
  }

  get memberships() {
    return this.stepForm.get('memberships') as FormArray;
  }
}
