import { Component, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { TooltipModule } from 'primeng/tooltip';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { InputNumberComponent } from "@shared/componentkit/input-number/input-number.component";
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { Fin13080Service } from 'src/app/service/api/fin/fin13080.service';
import { PanelModule } from 'primeng/panel';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { DropDownListService } from '@service/utility/dropDownList.service';

@Component({
  selector: 'app-fin13080-cru',
  templateUrl: './fin13080-cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    PanelModule,
    ButtonComponent,
    AccordionModule,
    TranslateModule,
    ReactiveFormsModule,
    CalendarComponent,
    TooltipModule,
    InputNumberComponent,
    InputTextComponent,

  ],
})
export class FIN13080CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  // ===== Form =====
  dataForm = this.formBuilder.nonNullable.group({
    No: [{ value: '自動編號', disabled: true }],
    Date: [null],
    INV_DeclareYM: [new Date()],
    Invoice_No_Start: [null, Validators.maxLength(8)],
    Invoice_No_End: [null, Validators.maxLength(8)],
  });

  selectedItems: any[] = [];
  data: any[] = [];
  totalRecords = 0;
  Date: Date | null = null;


  constructor(
    private fin13080Service: Fin13080Service,
      private dropDownListService: DropDownListService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN13080', this.dataForm);

  }


  onSubmit(form: FormGroup): void {
 if (form.valid) {
      const raw = form.getRawValue();

  } else {
      console.log('表單驗證未通過');
    }
  }
}
