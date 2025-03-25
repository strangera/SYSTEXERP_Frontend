import { Component, Input } from '@angular/core';
import { ControlContainer, FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';

const now = new Date();

@Component({
  selector: 'app-step1',
  templateUrl: './step1.component.html',
  styleUrl: './step1.component.scss',
  viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective }],
})
export class Step1Component {
  @Input() formGroupName: string | undefined;
  stepForm: FormGroup = this.formBuilder.group({
    serialnumber: [0, [Validators.required, Validators.minLength(5), Validators.maxLength(10)]], // 行銷代號 (系統產生)
    promocode: [0, Validators.required], // 促銷代碼 (下拉選單，補充代銷代碼生產方式)
    title: ['', Validators.required], // 行銷標題
    eventstarttime: [now, Validators.required], // 行銷期間 (start-end datetime yyyy/mm/dd HH:mm)
    eventendtime: [now, Validators.required], // 行銷期間
    description: ['', Validators.required], // 行銷說明
  });

  constructor(
    private formBuilder: FormBuilder,
    private controlContainer: ControlContainer,) {}

  ngOnInit(): void {
    this.stepForm = this.controlContainer.control?.get(this.formGroupName as string) as FormGroup;
  }
}
