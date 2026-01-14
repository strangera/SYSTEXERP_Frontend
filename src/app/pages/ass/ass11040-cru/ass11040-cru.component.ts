import { NgIf } from '@angular/common';
import { Component, OnInit, } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ASS11040Response, Ass11040Service } from '@service/api/ass/ass11040.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { EditorTextComponent } from '../../../shared/componentkit/editor-text/editor-text.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';

//3.1.1.4 品項資料維護作業 CRU
@Component({
  selector: 'app-ass11040-cru',
  templateUrl: './ass11040-cru.component.html',
  standalone: true,
  imports: [InputTextareaComponent, MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, InputNumberComponent, InputTextComponent, DropdownComponent, EditorTextComponent, ButtonComponent, NgIf, TranslateModule]
})
export class ASS11040CRUComponent extends BasicCruPageComponent<ASS11040Response> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    itemCode: [, [Validators.maxLength(13)]], // 品項代碼
    itemName: ['', [Validators.maxLength(32)]], // 品項代碼
    bigCategoryCode: [], // 大分類代碼
    midCategoryCode: [], // 中分類代碼
    smlCategoryCode: [], // 小分類代碼
    itemCategory: [], // 品項類別區分
    itemUnit: [], // 基本單位
    packageUnit: [], // 包裝單位
    warrantyMethod: [], // 保固方式
    maintenanceMethod: [], // 保養方式
    illustrate: [,], // 說明
  });
  itemCategoryOptions = getSYS1000Options('PROD_TYPE');
  itemUnitOptions = getSYS1000Options('UNIT');
  packageUnitOptions = getSYS1000Options('PACK_UNIT');

  bigCategoryCodeOptions: any[] = [
    { value: 1, label: 'A/裝潢工程' },
    { value: 2, label: 'B/其他工程' },
    { value: 3, label: 'C/電腦及電子零件產品' },
    { value: 4, label: 'D/電力及照明系統' },
    { value: 5, label: 'E/家電家具設備' },
    { value: 6, label: 'F/機消空電水零配件' },
    { value: 7, label: 'G/辦公及營運庶務' },
    { value: 8, label: 'K/印刷品(非廣告行銷)' },
  ];
  midCategoryCodeOptions: any[] = [
    { value: 23, label: '室內裝潢工程' },
    { value: 24, label: '室內裝潢備品' },
    { value: 21, label: '弱電系統' },
    { value: 22, label: '房屋和建築設備' },
    { value: 23, label: '停車場設備' },
    { value: 24, label: '其他工程' },
    { value: 25, label: '機電消防工程' },
    { value: 22, label: '電子產品及零件' },
  ];
  warrantyMethodOptions: any[] = [
    { value: 0, label: '廠商' },
    { value: 1, label: '公司' },
  ];
  maintenanceMethodOptions: any[] = [
    { value: 0, label: '廠商' },
    { value: 1, label: '公司' },
  ];
  constructor(
    private readonly ass11040Service: Ass11040Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS11040', this.dataForm);
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const params = {
        ...frm.getRawValue()
      }
      const $request = this.isFormCreateable ? this.ass11040Service.insertASS11040(params) : this.ass11040Service.updateASS11040(params);
      $request.pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(response => {
        this.messageService.successBubble(response.Message);
        if (this.isFormCreateable) {
          this.dataForm.reset();
        } else {
          this.onCancel();
        }
      })
    })
  }
}
