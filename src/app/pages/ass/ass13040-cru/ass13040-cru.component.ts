import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PanelModule } from 'primeng/panel';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';

import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { EditorTextComponent } from '../../../shared/componentkit/editor-text/editor-text.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';

import { ButtonComponent } from '../../../shared/componentkit/button/button.component';

//3.1.3.4  批次報廢作業 CRU
@Component({
  selector: 'app-ass13040-cru',
  templateUrl: './ass13040-cru.component.html',
  styleUrl: './ass13040-cru.component.scss',
  standalone: true,
  imports: [MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, InputNumberComponent, DropdownComponent, CalendarComponent, EditorTextComponent, NgFor, InputTextComponent, ButtonComponent, NgIf, TranslateModule]
})
export class ASS13040CRUComponent extends BasicCruPageComponent<unknown> implements OnInit {

  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    // ----------------------------------------------------------------
    scrapCode: [, [Validators.maxLength(20)]], // 商品報廢單編號
    userCode: [, [Validators.required]], // 	報廢人員編號
    departmentCode: [, [Validators.required]], // 	部門代號
    scrapVendor: [], // 報廢廠商
    scrapDate: [, [Validators.required]], // 報廢申請日期
    assetsType: [], // 資產類型
    remark: [,], // 報廢案件說明

    items: this.formBuilder.array([
      this.createItem()
    ]),
  });
  // ----------------------------------------------------------------
  manageCodeOptions: any[] = [];
  userCodeOptions: any[] = [];
  departmentCodeOptions: any[] = [];
  scrapStatusOptions: any[] = [
    { value: 1, label: '已作廢' },
    { value: 2, label: '已審核' },
    { value: 3, label: '已申請' },];
  scrapVendorOptions: any[] = [];
  assetsTypeOptions: any[] = [];

  //
  constructor(
    private translate: TranslateService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS13040', this.dataForm);
  }

  // ----------------------------------------------------------------
  get items(): FormArray {
    return this.dataForm.get('items') as FormArray;
  }

  getFormControl(index: number, controlName: string): FormControl {
    return this.items.at(index).get(controlName) as FormControl;
  }
  // ----------------------------------------------------------------
  createItem(): FormGroup {
    return this.formBuilder.group({
      manageCode: [, [Validators.required]], // 	商品管理編號
      unit: [, [Validators.required]], // 	商品單位
      amount: [, [Validators.required]], // 	數量

      singleRemark: [,], // 單項說明
    });
  }
  onRemoveItem(index: number) {
    this.items.removeAt(index);
  }
  // ----------------------------------------------------------------
  Edit(rowdata: any) {
    this.dataForm.patchValue(rowdata);
  }

  Read(rowdata: any) {
    this.dataForm.patchValue(rowdata);
    this.dataForm.disable();
  }

  onAddItem(): void {
    this.items.push(this.createItem());
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      switch (this.crudstatus) {
        case CRUDStatus.Create:
          this.messageService.successBubble(this.translate.instant('success_message'));
          break;
        case CRUDStatus.Edit:
          this.messageService.successBubble(this.translate.instant('updated-successfully'));
          break;
        default:
          break;
      }
    });
  }

  submitForm(frm: FormGroup) {
    this.onSubmit(frm);
  }
}
