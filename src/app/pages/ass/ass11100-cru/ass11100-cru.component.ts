import { Component, OnInit, } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
// Shared
//
import { TranslateModule } from '@ngx-translate/core';
import { BasicCrupageComponent } from '../../../shared/componentextends/basic-crupage/basic-crupage.component';
//
import { NgIf } from '@angular/common';
import { PanelModule } from 'primeng/panel';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { EditorTextComponent } from '../../../shared/componentkit/editor-text/editor-text.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';

//3.1.1.10 倉別設定作業 CRU
@Component({
  selector: 'app-ass11100-cru',
  templateUrl: './ass11100-cru.component.html',
  styleUrl: './ass11100-cru.component.scss',
  standalone: true,
  imports: [MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, InputNumberComponent, InputTextComponent, DropdownComponent, EditorTextComponent, ButtonComponent, NgIf, TranslateModule]
})
export class ASS11100CRUComponent extends BasicCrupageComponent implements OnInit {
  //
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    storageType: [, [Validators.required, Validators.maxLength(10)]], // 倉別
    storageName: ['', [Validators.required, Validators.maxLength(50)]], // 倉別名稱
    organizationNumber: [, [Validators.required]], // 部門代號
    remark: [,], // 備註
  });
  //
  // ----------------------------------------------------------------
  //
  organizationNumberOptions: any[] = [];

  constructor(
    private formBuilder: FormBuilder,
  ) {
    super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '310010';

  }
  // ----------------------------------------------------------------
  Edit(rowdata: any) {
    this.dataForm.patchValue(rowdata);
  }

  Read(rowdata: any) {
    this.dataForm.patchValue(rowdata);
    this.dataForm.disable();
  }

  onSubmit(frm: FormGroup) {

  }

  submitForm(frm: FormGroup) {
    this.onSubmit(frm);
  }

  onCancel() {
  }
}
