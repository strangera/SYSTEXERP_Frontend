import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-tls21040-cru',
    templateUrl: './tls21040-cru.component.html',
    standalone: true,
    imports: [
        MenubarComponent,
        ButtonComponent,
        PanelModule,
        FormsModule,
        ReactiveFormsModule,
        InputTextComponent,
        DropdownComponent,
        InputNumberComponent,
        NgIf,
        TranslateModule,
    ],
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
