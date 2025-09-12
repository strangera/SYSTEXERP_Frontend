
import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FIN52030Service } from '@service/api/fin/fin52030.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonDynamicallyaddComponent } from '@shared/componentkit/button-dynamicallyadd/button-dynamicallyadd.component';
import { ButtonDynamicallydeleteComponent } from '@shared/componentkit/button-dynamicallydelete/button-dynamicallydelete.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { Column } from '@shared/componentkit/table/table.model';
import { CheckboxModule } from 'primeng/checkbox';
import { PanelModule } from 'primeng/panel';

@Component({
  selector: 'app-fin52030-cru',
  templateUrl: './fin52030-cru.component.html',
  styleUrl: './fin52030-cru.component.scss',
  standalone: !0,
  imports: [
    NgFor,
    NgIf,
    CheckboxModule,
    FormsModule,
    PanelModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    ButtonDynamicallyaddComponent,
    ButtonDynamicallydeleteComponent,
    CalendarComponent,
    DropdownComponent,
    InputTextComponent,
    MenubarComponent,
  ],
})
export class FIN52030CRUComponent extends BasicCruPageComponent<unknown> implements OnInit {

  public readonly dataForm = this.formBuilder.group({

  });

  public readonly columns: Column[] = [

  ];


  constructor(
    public service: FIN52030Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN52030', this.dataForm);
  }

  public onSubmit(): void {
    this.handleSubmit(this.dataForm, () => {

      this.submitted = !0;
      this.loading = !1;
    });
  }
}
