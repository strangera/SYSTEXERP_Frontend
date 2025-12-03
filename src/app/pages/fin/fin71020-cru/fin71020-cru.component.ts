import { Component, OnInit, ViewEncapsulation, computed, effect, signal } from '@angular/core';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FIN71020Service } from '@service/api/fin/fin71020.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { NGXLogger } from 'ngx-logger';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { FIN71020Data, FIN71020Insert, FIN71020Update } from '../fin71020/fin71020.model';

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

  public readonly tableLoading = signal<boolean>(!1);

  public readonly loadingEffect = effect(() => {
    this.loading = this.tableLoading()
      || this.service.orgLoading()
      || this.service.usrLoading();
  });

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
      const raw = <FIN71020Update | FIN71020Insert>{ ...this.dataForm.getRawValue() };
      const payload = Object.fromEntries(Object.entries(raw).filter(([_, v]) =>
        v !== null && v !== undefined && (!(Array.isArray(v)) || v.length > 0)
      )) as unknown as FIN71020Update | FIN71020Insert;

      this.tableLoading.set(!0);
      this.logger.debug(`onSubmit:`, [payload]);
      this.service.saveFIN71020(payload, this.isFormCreateable ? 'insert' : 'update').pipe(
        finalize(() => this.tableLoading.set(!1)),
      ).subscribe({
        next: res => {
          if (res.Status !== '0000') return;
          this.onCancel();
          this.messageService.successBubble(this.isFormCreateable ? '新增成功' : '更新成功');
        },
      });
    });
  }
}
