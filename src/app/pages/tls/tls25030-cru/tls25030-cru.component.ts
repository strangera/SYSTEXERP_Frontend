import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { PanelModule } from 'primeng/panel';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';

import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { EditorTextComponent } from '../../../shared/componentkit/editor-text/editor-text.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

const now = new Date();

@Component({
  selector: 'app-tls25030-cru',
  templateUrl: './tls25030-cru.component.html',
  styleUrl: './tls25030-cru.component.scss',
  standalone: true,
  imports: [MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, InputTextComponent, DropdownComponent, InputNumberComponent, CalendarComponent, EditorTextComponent, ButtonComponent, NgIf, TranslateModule]
})
export class TLS25030CRUComponent implements OnInit {
  ProgNo = '';
  formTitle = '';
  submitted = false;
  crudstatus = '';

  // submitted: boolean = false;
  dataForm = this.formBuilder.group({
    counterCode: [],  // 專櫃編號
    counterName: [],  // 櫃位名稱
    violationCategory: [],  // 違規類別編號
    deductionItem: [],  // 扣款項目
    amountStart: [],  // 金額開始
    amountEnd: [],  // 金額結束
    deductionDateStart: [now, [Validators.required]],  // 扣款日期起
    deductionDateEnd: [now, [Validators.required]],  // 扣款日期迄
    violationDateStart: [now, [Validators.required]],  // 違規日期起
    violationDateEnd: [now, [Validators.required]],  // 違規日期迄
    documentNumber: [],  // 單據編號
    issuingUnit: [],  // 開立單位
    createdBy: [],  // 建立者(輸入代號)
    floor: [],  // 樓層
    maintenanceDate: [now, [Validators.required]],  // 維護日
    status: [],  // 狀態
    whether: [],  // 狀態
    remark: [],
  });

  // 下拉選單選項
  counterCodeOptions: any[] = [];
  violationCategoryOptions: any[] = [];
  floorOptions: any[] = [];
  statusOptions: any[] = [];
  deductionItemOptions: any[] = [];
  organizationNumberOptions: any[] = [];
  whetherOptions: any[] = [];


  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
  ) {
  }

  ngOnInit(): void {

    this.ProgNo = '220034';
    const state = this.router.lastSuccessfulNavigation?.extras.state as {
      crudstatus: CRUDStatus,
      rowdata: any,
    };

    switch (state.crudstatus) {
      // 創建
      case CRUDStatus.Create:
        this.formTitle = 'create-conditions';
        this.crudstatus = CRUDStatus.Create;

        break;
      // 修改
      case CRUDStatus.Edit:
        this.formTitle = 'edit-conditions';
        this.crudstatus = CRUDStatus.Edit;

        this.Edit(state.rowdata);
        break;
      // 讀檔
      case CRUDStatus.Read:
        this.formTitle = 'display-conditions';
        this.crudstatus = CRUDStatus.Read;
        this.Read(state.rowdata);
        break;
    }
  }
  Edit(rowdata: any) {
    this.dataForm.patchValue(rowdata);
  }

  Read(rowdata: any) {
    this.dataForm.patchValue(rowdata);
    this.dataForm.disable();
  }


  canQuery(): boolean {
    return true;
  }

  // canAdd(): boolean {
  //   return true;
  // }

  // canEdit(): boolean {
  //   return true;
  // }

  onSubmit(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;

    if (frm.valid && this.canQuery()) {
      // 提交邏輯
    }
  }

  onSubmitQuery(frm: FormGroup) {
    // 查詢邏輯
    this.onSubmit(frm);
  }

  onCreate() {
    if (true) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: 'Create',
          dataForm: this.dataForm,
        },
        skipLocationChange: true,
      };
      this.router.navigate(['TLS2000/TLS25030'], extras);
    }
  }

  onEdit(data: any) {
    if (true) {
      let extras: NavigationExtras = {
        state: {
          crudstatus: 'Edit',
          rowdata: data,
          dataForm: this.dataForm,
        },
        skipLocationChange: true,
      };
      this.router.navigate(['/demoCRU'], extras);
    }
  }

  onDetail(data: any) {
    let extras: NavigationExtras = {
      state: {
        crudstatus: 'Read',
        rowdata: data,
        dataForm: this.dataForm,
      },
      skipLocationChange: true,
    };
    this.router.navigate(['TLS2000/TLS25030'], extras);
  }

  submitForm(frm: FormGroup) {
    // 查詢邏輯
    this.onSubmit(frm);
  }

  onClearForm() {
    this.dataForm.reset();  // 重置表單
  }

  onCancel() {
    this.router.navigate(['/demo']);
  }
}
