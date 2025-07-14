import { Component } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { FIN11210Data, FIN11210Service } from '../../../service/api/fin/fin11210.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-fin11210-cru',
    templateUrl: './fin11210-cru.component.html',
    styleUrl: './fin11210-cru.component.scss',
    standalone: true,
    imports: [MenubarComponent, ButtonComponent, PanelModule, FormsModule, ReactiveFormsModule, InputTextComponent, NgIf]
})
export class FIN11210CruComponent extends BasicCruPageComponent<FIN11210Data> {
  dataForm = this.formBuilder.nonNullable.group({
    code: ['', [Validators.required, Validators.maxLength(2)]], // 參數代碼
    content: ['', [Validators.required, Validators.maxLength(100)]], // 參數內容
  });

  constructor(private fin11210Service: FIN11210Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN11210', this.dataForm);
    if (this.isFormReadable) {
      this.dataForm.disable();
    }
  }

  onSubmit(frm: FormGroup) {
    this.submitted = true;

    // 呼叫新增資料的api
    console.log('Submitting form:', frm.value);
  }
}
