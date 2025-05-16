import { Component, Input } from '@angular/core';
import { AbstractControl, ControlContainer, FormArray, FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';

const now = new Date();

@Component({
  selector: 'app-step3',
  templateUrl: './step3.component.html',
  styleUrl: './step3.component.scss',
  viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective }],
})
export class Step3Component {
  @Input() formGroupName: string | undefined;

  giveawaytypeOptions: any = [
    { name: '優惠券', value: 1 },
    { name: '彩票', value: 2 },
    { name: '紅利', value: 3 },
    { name: '商品', value: 4 },
  ];

  tickettypeOptions: any = [
    { name: '兌幣券', value: 1 },
    { name: '折扣券', value: 2 },
    { name: '贈品優惠券', value: 3 },
    { name: '商品券', value: 4 },
  ];

  ticketclassificationOptions: any = [
    { name: '實體券', value: 1 },
    { name: '電子券', value: 2 },
    { name: '熱感機印券(POS)', value: 3 },
  ];

  usedaylist0 = [
    { name: '每日', value: 'usedayone' },
    { name: '限平日', value: 'usedayu' },
    { name: '限假日', value: 'usedayw' },
  ];
  usedaylist1 = [
    { name: '一', value: 'useday1' },
    { name: '二', value: 'useday2' },
    { name: '三', value: 'useday3' },
    { name: '四', value: 'useday4' },
    { name: '五', value: 'useday5' },
    { name: '六', value: 'useday6' },
    { name: '日', value: 'useday7' },
  ];

  giveawayunitOptions: any = [
    { name: '元', value: 1 },
    { name: '點', value: 2 },
    { name: '件', value: 3 },
    { name: '張', value: 4 },
  ];

  stepForm: FormGroup = this.formBuilder.group({
    items: this.formBuilder.array([this.formBuilder.group({
      giveawaytype: [1, Validators.required], // 贈品類別
      tickettype: [1, Validators.required], // 票券種類
      ticketclassification: [1, Validators.required], // 票券分類
      giveawaytitle: ['', Validators.required], // 贈品標題
      giveawaydescribe: ['', Validators.required], //  1-1 贈品說明
      usedstarttime: [now, Validators.required], // 票券使用起訖日期 (start-end datetime yyyy/mm/dd HH:mm)
      usedendtime: [now, Validators.required], // 票券使用起訖日期
      giveawaythresholdvalue: [0, Validators.required], // 滿額條件
      giveawaycount: [0, Validators.required], // 次數限制 (0 不限制)
      usedaylimits0: this.formBuilder.array(this.usedaylist0.map(level => this.formBuilder.control(false))), // 使用星期限制
      usedaylimits1: this.formBuilder.array(this.usedaylist1.map(level => this.formBuilder.control(false))), // 使用星期限制
      giveawayvalue: [0, Validators.required], // 價值
      giveawayunit: [1, Validators.required], // 單位
      // ----------------------------------------------------------------
      // 1-2 使用區域限制
      // 1-2 適用門市
      Instructionsofuse: ['', Validators.required], // 使用說明
    })]),
  });

  constructor(
    private formBuilder: FormBuilder,
    private controlContainer: ControlContainer,) { }

  ngOnInit(): void {

    this.stepForm = this.controlContainer.control?.get(this.formGroupName as string) as FormGroup;
    console.log(this.stepForm);
  }

  get items() {
    return this.stepForm.get('items') as FormArray;
  }

  getUsedayLimits0Controls(item: AbstractControl): FormArray {
    return item.get('usedaylimits0') as FormArray;
  }

  getUsedayLimits1Controls(item: AbstractControl): FormArray {
    return item.get('usedaylimits1') as FormArray;
  }


  addItem() {
    this.items.push(this.formBuilder.group({
      giveawaytype: [1, Validators.required], // 贈品類別
      tickettype: [1, Validators.required], // 票券種類
      ticketclassification: [1, Validators.required], // 票券分類
      giveawaytitle: ['', Validators.required], // 贈品標題
      giveawaydescribe: ['', Validators.required], //  1-1 贈品說明
      usedstarttime: [now, Validators.required], // 票券使用起訖日期 (start-end datetime yyyy/mm/dd HH:mm)
      usedendtime: [now, Validators.required], // 票券使用起訖日期
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
  }

  removeItem(index: number) {
    this.items.removeAt(index);
  }
}
