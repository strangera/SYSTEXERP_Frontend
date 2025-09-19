import { Component, OnInit, computed } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FIN52090Service } from '@service/api/fin/fin52090.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { NGXLogger } from 'ngx-logger';
import { PanelModule } from 'primeng/panel';
import { finalize, tap } from 'rxjs';
import { FIN52090Query } from '../fin52090/fin52090.model';

@Component({
  selector: 'app-fin52090-cru',
  templateUrl: './fin52090-cru.component.html',
  styleUrl: './fin52090-cru.component.scss',
  standalone: true,
  imports: [
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
    AccNo: new FormControl<string | void>(void 0, [Validators.required]),
    NoteDesc: new FormControl<string | void>(void 0, [Validators.required, Validators.maxLength(100)]),
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

    this.service.getAccNo();

    this.logger.debug(`init:`, [this.rowdata, this.crudstatus, this.service.accNo()]);
  }

  onSubmit(): void {
    this.handleSubmit(this.dataForm, () => {
      const payload = <FIN52090Query>{
        AccNo: this.df().AccNo.value ?? '',
        NoteDesc: this.df().NoteDesc.value ?? '',
      };

      this.logger.debug(`onSubmit:`, [payload]);

      this.service.saveFIN52090Data(payload).pipe(
        finalize(() => this.loading = !1),
      ).subscribe(res => {
        if (res.Status !== '0000') return this.messageService.errorBubble('資料儲存失敗，請再次檢查欄位');
        this.messageService.successBubble('資料儲存成功');
        this.onCancel();
      });
    });
  }
}
