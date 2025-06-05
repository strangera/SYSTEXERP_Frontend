import { Component, OnInit, } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { TranslateService } from '@ngx-translate/core';
import { UsageTypeService } from '../../../service/basic/usage-type.service';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';

interface ItemCol {
  col1: string; // 品項編號
  col2: string; // 品項名稱
  col3: string; // 使用別
}


// 1.1.3 銷項品項資料設定 CRU
@Component({
  selector: 'app-fin11030-cru',
  templateUrl: './fin11030-cru.component.html',
  styleUrl: './fin11030-cru.component.scss'
})
export class FIN11030CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    col1: ['', [Validators.required, Validators.maxLength(3)]], // 品項編號
    col2: ['', [Validators.required, Validators.maxLength(20)]], // 品項名稱
    col3: [null, [Validators.required]], // 使用別
    // items: this.formBuilder.array([this.createItem()]),
  });
  usageTypeOptions: any[] = [];

  constructor(
    private translate: TranslateService,
    private usageTypeService: UsageTypeService,
  ) {
    super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('FIN11030', this.dataForm);
    this.usageTypeService.getSystemTypes().subscribe(data => {
      this.usageTypeOptions = data;
    });
  }

  // ----------------------------------------------------------------
  // get items(): FormArray {
  //   return this.dataForm.get('items') as FormArray;
  // }

  // getFormControl(index: number, controlName: string): FormControl {
  //   return this.items.at(index).get(controlName) as FormControl;
  // }
  // ----------------------------------------------------------------
  // createItem(): FormGroup {
  //   return this.formBuilder.group({
  //     itemSerialnumber: [, [Validators.required, Validators.maxLength(3)]], // 品項編號
  //     itemName: ['', [Validators.required, Validators.maxLength(20)]], // 品項名稱
  //     usageType: [, [Validators.required]], // 使用別
  //   });
  // // }
  // onRemoveItem(index: number) {
  //   this.items.removeAt(index);
  // }
  // ----------------------------------------------------------------
  Edit(rowdata: any) {
    this.dataForm.patchValue(rowdata);
  }

  Read(rowdata: any) {
    this.dataForm.patchValue(rowdata);
    this.dataForm.disable();
  }

  // onAddItem(): void {
  //   this.items.push(this.createItem());
  // }

  onSubmit(frm: FormGroup) {
    this.messageService.blockUi();
    this.submitted = true;

    if (this.dataForm.invalid) {
      this.messageService.errorBubble(this.translate.instant('form_error_message'));
      this.messageService.unblockUi();
      return;
    }

    switch (this.crudstatus) {
      case CRUDStatus.Create:
        if (this.canAdd()) {
          // this.storeService.addMachine(frm.value as MachineForm).subscribe((response: any) => {
          this.messageService.successBubble(this.translate.instant('success_message'));
        }
        break;
      case CRUDStatus.Edit:
        if (this.canEdit()) {
          // this.storeService.updateMachine(frm.value as MachineForm).subscribe((response: any) => {
          this.messageService.successBubble(this.translate.instant('updated-successfully'));
        }
        break;
    }

    this.messageService.unblockUi();
    this.submitted = false;
  }

  // submitForm(frm: FormGroup) {
  //   // 查詢邏輯
  //   this.onSubmit(frm);
  // }//CRU
}
