import { Component, OnInit, } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { FIN11010Data, FIN11010InsertRequest, FIN11010Service, FIN11010UpdateRequest } from '../../../service/api/fin/fin11010.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownOption } from '../../../shared/models/api/base-api.interface';
import { DatePipe, NgIf } from '@angular/common';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-fin11010-cru',
  templateUrl: './fin11010-cru.component.html',
  styleUrl: './fin11010-cru.component.scss',
  standalone: true,
  imports: [NgIf, MenubarComponent, ButtonComponent, PanelModule, FormsModule, ReactiveFormsModule, InputTextComponent, DropdownComponent, CalendarComponent]
})
export class FIN11010CRUComponent extends BasicCruPageComponent<FIN11010Data> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    id: [0], // 資料識別碼
    mid: [0], // 中間識別碼

    STO_Uniform: ['', [Validators.required, Validators.maxLength(8)]], // 公司代號(統一編號)
    STO_TaxName: ['', [Validators.required, Validators.maxLength(60)]], // 營業人名稱
    STO_TaxNo: ['', [Validators.required, Validators.maxLength(9)]], // 稅籍編號
    STO_ManagerName: ['', [Validators.required, Validators.maxLength(12)]], // 負責人姓名
    STO_Addr: ['', [Validators.required, Validators.maxLength(100)]], // 營業地址
    REP_OrgCode: ['', [Validators.required]], // 總繳代號
    STO_Direct: ['', Validators.required], // 是否採直接扣抵法
    STO_HQUniform: ['', [Validators.maxLength(8)]], // 總公司統編
    STO_ApplyFlag: ['', Validators.required], // 自行或委託辦理申報註記
    STO_ApplyName: ['', [Validators.required, Validators.maxLength(12)]], // (代理)申報人姓名
    STO_ApplyTEL: ['', [Validators.required, Validators.maxLength(15)]],
    STO_ApplyID: ['', [Validators.maxLength(50)]], // 代理申報人證書(登錄)字號
    REP_BegGUIYM: ['', Validators.required], // 申報年月起

    // 其他可能需要的欄位（根據 FIN11010Data 介面）
    STO_No: [''], // 門市編號
    REP_EndGUIYM: [''], // 申報年月迄
    STO_City: [''], // 城市
    STO_PostCode: [''], // 郵遞區號
    STO_AbbName: [''], // 簡稱
    STO_Status: ['1'], // 狀態，預設為 '1'
    STO_ApplyTEL_ext: ['', [Validators.maxLength(5)]], // 電話分機
    STO_AreaCode: [''], // 區碼

    // 系統欄位（通常不需要用戶輸入，由後端設定）
    CRT_Date: [''], // 建立日期
    CRT_USR_No: [''], // 建立人員編號
    CRT_USR_Name: [''], // 建立人員姓名
    UPD_Date: [''], // 更新日期
    UPD_USR_No: [''], // 更新人員編號
    UPD_USR_Name: [''], // 更新人員姓名
  });

  // 總繳代號選項
  repOrgCodeOptions: DropdownOption[] = [
    { No: '0', Name: '單一機構報繳' },
    { No: '1', Name: '總機構彙總報繳' },
    { No: '2', Name: '各單位(分支機構)分別申報' }
  ];

  // 是否採直接扣抵法選項
  directDeductOptions: DropdownOption[] = [
    { No: 'Y', Name: '是' },
    { No: 'N', Name: '否' }
  ];

  // 自行或委託辦理申報註記選項
  applyFlagOptions: DropdownOption[] = [
    { No: '1', Name: '本事業或關係企業職員申報(自行申報)' },
    { No: '2', Name: '記帳及報稅代理業務人申報(委託申報)' }
  ];


  constructor(private fin11010Service: FIN11010Service, private datePipe: DatePipe) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN11010', this.dataForm);
    if (this.crudstatus === 'Create') {
      this.fin11010Service.getFIN11010PreviousData().subscribe(res => {
        // 填入資料，指定狀態與申報年月起
        if (res) {
          this.dataForm.patchValue({
            ...res.Data,
            REP_BegGUIYM: res.Data.REP_BegGUIYM ? `${res.Data.REP_BegGUIYM.substring(0, 4)}/${res.Data.REP_BegGUIYM.substring(4, 6)}` : '',
            REP_EndGUIYM: res.Data.REP_EndGUIYM ? `${res.Data.REP_EndGUIYM.substring(0, 4)}/${res.Data.REP_EndGUIYM.substring(4, 6)}` : ''
          });
        }
      });
    }
    this.setFieldFormat();
    this.setReadOnlyFields();
  }

  onSubmit(form: FormGroup): void {
    const formValue = form.getRawValue();
    this.handleSubmit(form, () => {
      switch (this.crudstatus) {
        case CRUDStatus.Create:
          if (this.canAdd()) {
            const rb: FIN11010InsertRequest = {
              STO_Uniform: formValue.STO_Uniform,
              STO_TaxName: formValue.STO_TaxName,
              STO_TaxNo: formValue.STO_TaxNo,
              STO_ManagerName: formValue.STO_ManagerName,
              STO_AbbName: formValue.STO_AbbName,
              STO_City: formValue.STO_City,
              STO_PostCode: formValue.STO_PostCode,
              STO_Addr: formValue.STO_Addr,
              REP_OrgCode: formValue.REP_OrgCode,
              STO_Direct: formValue.STO_Direct,
              STO_HQUniform: formValue.STO_HQUniform,
              STO_ApplyFlag: formValue.STO_ApplyFlag,
              STO_ApplyName: formValue.STO_ApplyName,
              STO_ApplyTEL: formValue.STO_ApplyTEL,
              STO_ApplyTEL_ext: formValue.STO_ApplyTEL_ext,
              STO_AreaCode: formValue.STO_AreaCode,
              STO_ApplyID: formValue.STO_ApplyID,
              REP_BegGUIYM: this.datePipe.transform(formValue.REP_BegGUIYM, 'yyyyMM') ?? '',
            };
            this.fin11010Service.insertFIN11010(rb)
              .pipe(finalize(() => this.loading = false))
              .subscribe(() => {
                this.messageService.successBubble('新增成功');
                this.dataForm.reset();
              });
          }
          break;
        case CRUDStatus.Edit:
          if (this.canEdit()) {
            const rb: FIN11010UpdateRequest = {
              id: formValue.id,
              STO_Uniform: formValue.STO_Uniform,
              STO_TaxName: formValue.STO_TaxName,
              STO_TaxNo: formValue.STO_TaxNo,
              STO_ManagerName: formValue.STO_ManagerName,
              STO_AbbName: formValue.STO_AbbName,
              STO_City: formValue.STO_City,
              STO_PostCode: formValue.STO_PostCode,
              STO_Addr: formValue.STO_Addr,
              REP_OrgCode: formValue.REP_OrgCode,
              STO_Direct: formValue.STO_Direct,
              STO_HQUniform: formValue.STO_HQUniform,
              STO_ApplyFlag: formValue.STO_ApplyFlag,
              STO_ApplyName: formValue.STO_ApplyName,
              STO_ApplyTEL: formValue.STO_ApplyTEL,
              STO_ApplyTEL_ext: formValue.STO_ApplyTEL_ext,
              STO_AreaCode: formValue.STO_AreaCode,
              STO_ApplyID: formValue.STO_ApplyID,
              REP_BegGUIYM: this.datePipe.transform(formValue.REP_BegGUIYM, 'yyyyMM') ?? '',
            };
            this.fin11010Service.updateFIN11010(rb)
              .pipe(finalize(() => this.loading = false))
              .subscribe(() => {
                this.messageService.successBubble('更新成功');
                this.onCancel();
              });
          }
          break;
      }
    });
  }


  setReadOnlyFields() {
    // [公司代號(統編)、營業人名稱、稅籍編號、總繳代號、自行或委託辦理申報註記]欄位不能修改；
    this.dataForm.get('STO_Uniform')?.disable();
    this.dataForm.get('STO_TaxName')?.disable();
    this.dataForm.get('STO_TaxNo')?.disable();
    this.dataForm.get('REP_OrgCode')?.disable();
    this.dataForm.get('STO_ApplyFlag')?.disable();
  }

  setFieldFormat() {
    // 設定日期格式
    const year = this.dataForm.get('REP_BegGUIYM')?.value.substring(0, 4);
    const month = this.dataForm.get('REP_BegGUIYM')?.value.substring(4, 6);
    if (year && month) {
      this.dataForm.get('REP_BegGUIYM')?.setValue(`${year}/${month}`);
    }

    const year2 = this.dataForm.get('REP_EndGUIYM')?.value.substring(0, 4);
    const month2 = this.dataForm.get('REP_EndGUIYM')?.value.substring(4, 6);
    if (year2 && month2) {
      this.dataForm.get('REP_EndGUIYM')?.setValue(`${year2}/${month2}`);
    }
  }

}