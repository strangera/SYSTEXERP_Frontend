import { Component, OnInit, ViewEncapsulation, computed } from '@angular/core';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FIN71020Service } from '@service/api/fin/fin71020.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { NGXLogger } from 'ngx-logger';
import { PanelModule } from 'primeng/panel';
import { finalize, tap } from 'rxjs';
import { FIN71020Data } from '../fin71020/fin71020.model';

@Component({
  selector: 'app-fin71020-cru',
  templateUrl: './fin71020-cru.component.html',
  styleUrls: ['./fin71020-cru.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: !0,
  imports: [
    FormsModule,
    PanelModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    DropdownComponent,
    InputNumberComponent,
    InputTextareaComponent,
    MenubarComponent,
    TableComponent,
  ]
})
export class FIN71020CRUComponent extends BasicCruPageComponent<FIN71020Data> implements OnInit {

  /**
   * keepUsrNo: 保管人代碼
   * keepOrgId: 保管單位
   * keepQuotaAmt: 零用金額度
   * keepRemark: 說明
   * items: 動態表單陣列
   */
  public readonly dataForm = this.formBuilder.nonNullable.group({
    usrNo: new FormControl<string | void>(void 0, [Validators.required]),
    orgId: new FormControl<string | void>(void 0, [Validators.required]),
    quotaAmt: new FormControl<number | void>(void 0, [Validators.required]),
    remark: new FormControl<string | void>(void 0),
    items: this.formBuilder.array([this.createItem()]),
  });
  public readonly df = computed(() => this.dataForm.controls);


  // Get the form array for dynamic items
  get items(): FormArray { return this.dataForm.get('items') as FormArray; }

  constructor(
    public readonly service: FIN71020Service,
    public readonly translate: TranslateService,
    private readonly logger: NGXLogger,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.initializePage('FIN71020', this.dataForm);

    this.logger.debug(`init:`, []);
  }

  public getFormControl(index: number, controlName: string): FormControl {
    return this.items.at(index).get(controlName) as FormControl;
  }

  public createItem(): FormGroup {
    return this.formBuilder.group({
      subjectCode: new FormControl<string | void>(void 0, [Validators.required]),
      subjectName: new FormControl<string | void>(void 0),
      vendorEmployeeCode: new FormControl<string | void>(void 0),
      vendorEmployeeName: new FormControl<string | void>(void 0, [Validators.required]),
      amount: new FormControl<number | void>(void 0, [Validators.required]),
      description: new FormControl<string | void>(void 0),
    });
  }

  public onSubmit(): void {
    this.handleSubmit(this.dataForm, () => {
      const payload = {
        ...this.dataForm.getRawValue(),
      };

      this.service.saveFIN71020(payload, this.isFormCreateable ? 'insert' : 'update').pipe(
        tap(res => res.Status === '2000' && this.onCancel()),
        finalize(() => this.loading = !1),
      ).subscribe();
    });
  }
}
