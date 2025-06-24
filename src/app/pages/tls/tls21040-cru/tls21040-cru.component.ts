import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';

@Component({
  selector: 'app-tls21040-cru',
  templateUrl: './tls21040-cru.component.html',
})
export class TLS21040CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  dataForm = this.formBuilder.group({
    bankCode: [],
    bankName: [],
    cardType: [],
    cardCategory: [],
    ntRetrieve: [],
    retrieve: [],
    cardIdentifier: [],
  });

  cardTypeOptions: { value: string, label: string }[] = [
    { value: 'A', label: 'AE' },
    { value: 'D', label: '大來' },
    { value: 'J', label: 'JCB' },
    { value: 'M', label: 'MASTER' },
    { value: 'O', label: 'OTHER' },
    { value: 'U', label: 'U' },
    { value: 'V', label: 'VISA' },
  ];
  cardCategoryOptions: { value: string, label: string }[] = [
    { value: 'B', label: '商務卡' },
    { value: 'C', label: '普卡' },
    { value: 'G', label: '金卡' },
    { value: 'I', label: '無限卡' },
    { value: 'O', label: '其他' },
    { value: 'P', label: '白金卡' },
    { value: 'S', label: '御璽、鈦金、晶緻卡' },
    { value: 'T', label: '鈦金卡' },
  ];
  constructor(
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS21040', this.dataForm);
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
    });
  }
}
