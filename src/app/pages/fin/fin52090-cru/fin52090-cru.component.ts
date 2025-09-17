import { NgIf } from '@angular/common';
import { Component, OnInit, computed } from '@angular/core';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FIN52090Service } from '@service/api/fin/fin52090.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { NGXLogger } from 'ngx-logger';
import { PanelModule } from 'primeng/panel';
import { tap } from 'rxjs';

@Component({
  selector: 'app-fin52090-cru',
  templateUrl: './fin52090-cru.component.html',
  styleUrl: './fin52090-cru.component.scss',
  standalone: true,
  imports: [
    NgIf,
    FormsModule,
    PanelModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    DropdownComponent,
    InputTextComponent,
    MenubarComponent,
  ],
})
export class FIN52090CRUComponent extends BasicCruPageComponent<unknown> implements OnInit {

  public dataForm = this.formBuilder.nonNullable.group({
    accountCode: new FormControl<string | void>(void 0, [Validators.required]),
    accountSummary: new FormControl<string | void>(void 0, [Validators.required, Validators.maxLength(100)]),
  });
  public readonly df = computed(() => this.dataForm.controls);

  constructor(
    public readonly service: FIN52090Service,
    private readonly logger: NGXLogger,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN52090', this.dataForm);
  }

  onSubmit(): void {
    this.handleSubmit(this.dataForm, () => {
      const payload = {
        ...this.dataForm.value,
      };

      this.service.submitFIN52090Data(payload).pipe(
        tap(res => this.logger.debug(`submitFIN52090Data:`, [res])),
      ).subscribe();
      this.logger.debug(`onSubmit:`, [payload]);
      this.submitted = !0;
      this.loading = !1;
    });
  }
}
