import { Component, OnInit, } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
// Shared
//
import { TranslateModule } from '@ngx-translate/core';

//
import { NgIf } from '@angular/common';
import { PanelModule } from 'primeng/panel';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';

//1.2.5.1 產生電匯付款資料 CRU
@Component({
  selector: 'app-fin25010-cru',
  templateUrl: './fin25010-cru.component.html',
  styleUrl: './fin25010-cru.component.scss',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, PanelModule, FormsModule, ReactiveFormsModule, CalendarComponent, InputNumberRangeComponent, InputNumberComponent, DropdownComponent, NgIf, TranslateModule]
})
export class FIN25010CRUComponent implements OnInit {
  ProgNo = '';
  formTitle = '';
  submitted = false;
  crudstatus = '';

  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    settlementDate: [, [Validators.required]], // 收/付款日
    startFactoryID: [, [Validators.max(99999999999999)]], // 廠客代號
    endFactoryID: [, [Validators.max(99999999999999)]], // 廠客代號
    shouldPayId: [, [Validators.maxLength(14)]], // 應付帳款ID
    Subpoenastatus: [], // 傳票型態
    payoutMethod: [], // 付款方式
  });
  //
  // ----------------------------------------------------------------
  //
  Subpoenastatus: any[] = [
    { value: 1, label: '作廢' },
    { value: 2, label: '建立' },
    { value: 3, label: '確認' },
    { value: 4, label: '過帳' },
    { value: 5, label: '刪除' },
  ];
  payoutMethodOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
  ) {
    super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '120017';
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
    this.router.navigate(['/FIN2000/FIN25010']);
  }
}
