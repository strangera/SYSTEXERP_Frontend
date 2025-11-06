import { Component, OnInit, } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { PanelModule } from 'primeng/panel';
import { NgFor, NgIf } from '@angular/common';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';

@Component({
  selector: 'app-tls2j010-cru',
  templateUrl: './tls2j010-cru.component.html',
  styleUrl: './tls2j010-cru.component.scss',
  standalone: true,
  imports: [MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, NgFor, InputTextComponent, ButtonComponent, NgIf, TranslateModule]
})
export class TLS2J010CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    CHG_ItemName: ['', [Validators.maxLength(10)]],
  });
  // ----------------------------------------------------------------
  constructor(

  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS2J010', this.dataForm);
  }


  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.loading = true;

    });
  }
}
