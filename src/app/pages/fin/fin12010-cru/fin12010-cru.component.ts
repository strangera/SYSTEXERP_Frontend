import { Component, OnInit, } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { ValidationService } from '../../../shared/service/validation.service';
import { UsageTypeService } from '../../../service/basic/usage-type.service';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';

//1.1.2.1 電子式發票各系統配號維護
@Component({
  selector: 'app-fin12010-cru',
  templateUrl: './fin12010-cru.component.html',
  styleUrl: './fin12010-cru.component.scss'
})
export class FIN12010CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    twodatemm: ['', [Validators.required]], // 發票年月
    wordTrack: ['', [Validators.required, Validators.maxLength(2)]], // 字軌
    startserialInvoice: [, [Validators.required, this.validationService.numberValidator, Validators.maxLength(8)]], // 發票號碼(起)
    endserialInvoice: [, [Validators.required, this.validationService.numberValidator, Validators.maxLength(8)]], // 發票號碼(迄)
    usageType: [[] as number[], [Validators.required,]], // 使用別
  });
  usageTypeOptions: any[] = [];
  constructor(
    private validationService: ValidationService,
    private usageTypeService: UsageTypeService,
  ) {
    super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.usageTypeService.getSystemTypes().subscribe(data => {
      this.usageTypeOptions = data;
    });
  }
  onSubmit(frm: FormGroup) {
  }
}
