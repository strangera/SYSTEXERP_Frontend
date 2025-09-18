import { Component, computed, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FIN52080Service } from '@service/api/fin/fin52080.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { ValidationService } from '@shared/service/validation.service';
import { NGXLogger } from 'ngx-logger';
import { PanelModule } from 'primeng/panel';
import { testDorm } from '../fin52080/fin52080.model';

@Component({
  selector: 'app-fin52080-cru',
  templateUrl: './fin52080-cru.component.html',
  styleUrl: './fin52080-cru.component.scss',
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
  ]
})
export class FIN52080CRUComponent extends BasicCruPageComponent<testDorm> implements OnInit {

  /**
   * 會計科目代號維護
   * - AccNo: 科目代號
   * - AccCname: 科目名稱
   * - AccEname: 科目英文名稱 (非必填)
   * - AccDC: 借/貸
   * - Ledger_MD: 統制/明細
   * - ClassNo: 三碼代號
   * - ABAT_YN: 是否為沖帳代號
   * - Voucher_Type: 傳票格式
   * - Budget_YN: 是否為預算科目
   * - Org_YN: 是否設定部門代號
   * - rest_value: 折舊攤提年限
   * - rest_value2: 殘值年限
   * - Input_YN: 是否可輸
   */
  dataForm = this.formBuilder.nonNullable.group({
    AccNo: new FormControl<string | void>(void 0, [Validators.required, Validators.minLength(3), Validators.maxLength(8)]),
    AccCname: new FormControl<string>('', [Validators.required, Validators.maxLength(40)]),
    AccEname: new FormControl<string>('', [Validators.maxLength(50)]),
    AccDC: new FormControl<'0' | '1' | void>(void 0, [Validators.required]),
    Ledger_MD: new FormControl<'0' | '1' | void>(void 0, [Validators.required]),
    ClassNo: new FormControl<string[] | void>(void 0),
    ABAT_YN: new FormControl<'Y' | 'N'>('N', [Validators.required]),
    Voucher_Type: new FormControl<string[] | void>(void 0),
    Budget_YN: new FormControl<'Y' | 'N'>('N', [Validators.required]),
    Org_YN: new FormControl<'Y' | 'N'>('N', [Validators.required]),
    rest_value: new FormControl<string | void>(void 0, [Validators.maxLength(10), this.validationService.numberValidator]),
    rest_value2: new FormControl<string | void>(void 0, [Validators.maxLength(10), this.validationService.numberValidator]),
    Input_YN: new FormControl<'Y' | 'N'>('N', [Validators.required]),
  });
  public df = computed(() => this.dataForm.controls);

  constructor(
    public readonly service: FIN52080Service,
    private readonly validationService: ValidationService,
    private readonly logger: NGXLogger,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.initializePage('FIN52080', this.dataForm);

    this.logger.debug(`init:`, [this.rowdata, this.crudstatus]);
  }

  public onSubmit(): void {
    this.handleSubmit(this.dataForm, () => {


      this.loading = this.service.tableLoading;
    });


    // 送出前檢查 大+中+三碼 不可重複
    // const formValue = this.dataForm.getRawValue();
    // switch (this.crudstatus) {
    //   case CRUDStatus.Create:
    //     if (this.canAdd()) {
    //       console.log('insert', formValue);
    //       this.tls51080Service.insertTLS51080(formValue).subscribe(() => {
    //         this.messageService.successBubble('新增成功');
    //         // this.onCancel(); // 儲存後，會清除資料留在原頁面，不返回列表
    //         this.dataForm.reset(); // 重置表單
    //       });
    //     }
    //     break;
    //   case CRUDStatus.Edit:
    //     if (this.canEdit()) {
    //       console.log('update', formValue);
    //       this.tls51080Service.updateTLS51080(formValue).subscribe(() => {
    //         // this.messageService.successBubble('更新成功');
    //         this.onCancel(); // 儲存後，會返回列表
    //       });
    //     }
    //     break;
    // }
  }

  onClearForm() {
    this.dataForm.reset(); // 重置表單
  }
}
