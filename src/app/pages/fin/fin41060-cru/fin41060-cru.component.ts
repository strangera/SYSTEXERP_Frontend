import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { PanelModule } from 'primeng/panel';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { FIN41060QueryRow } from '../fin41060/fin41060.model';

@Component({
  selector: 'app-fin41060-cru',
  templateUrl: './fin41060-cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    ButtonComponent,
    TranslateModule,
  ],
})
export class FIN41060CRUComponent extends BasicCruPageComponent<FIN41060QueryRow> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    Org_ID: [''],
    Org_Name: [''],
    Budget_Year: [''],
    Budget_Version: [''],
    Audit_Status_NM: [''],
  });

  ngOnInit(): void {
    this.initializePage('FIN41060', this.dataForm);
    this.dataForm.disable();
  }
}
