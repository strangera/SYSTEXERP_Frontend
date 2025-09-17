import { Component, OnInit, } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { Tls51080Service } from '../../../service/api/tls/tls51080.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ValidationService } from '@shared/service/validation.service';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { apiOption } from '@shared/models/sys/sysb000.model';

export interface testDorm {
  AccNo: string, // 科目代號
  AccCname: string, // 科目名稱
  AccEname: string, // 科目英文名稱
  AccDC: string, // 借/貸
  Ledger_MD: string, // 統制/明細
  ClassNo: string, // 三碼代號
  ABAT_YN: string, // 是否為沖帳代號
  Voucher_Type: string, // 傳票格式
  Budget_YN: string, // 是否為預算科目
  Org_YN: string, // 是否設定部門代號
  rest_value: number, // 折舊攤提年限
  rest_value2: number, // 殘值年限
  Input_YN: string, // 是否可輸

  //---可能也會需要下面這些---
  CRT_Date?: Date,
  CRT_USR_No?: string,
  CRT_USR_Name?: string,
  UPD_Date?: Date,
  UPD_USR_No?: string,
  UPD_USR_Name?: string,
}

@Component({
    selector: 'app-fin52080-cru',
    templateUrl: './fin52080-cru.component.html',
    styleUrl: './fin52080-cru.component.scss',
    standalone: true,
    imports: [
      MenubarComponent,
      ButtonComponent,
      PanelModule,
      FormsModule,
      ReactiveFormsModule,
      InputTextComponent,
      DropdownComponent,
      DialogComponent,
      NgIf, 
      TranslateModule,
      TableComponent
    ]
})
export class FIN52080CRUComponent extends BasicCruPageComponent<testDorm> implements OnInit {
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    //會計科目代號維護
    AccNo: ['', [Validators.required, Validators.maxLength(8)]], //  科目代號
    AccCname: ['', [Validators.required, Validators.maxLength(40)]], // 科目名稱
    AccEname: ['', [Validators.maxLength(50) ]], // 科目英文名稱 (非必填)
    AccDC: ['',[Validators.required, Validators.maxLength(1)]], //  借/貸  //借:0/貸:1
    Ledger_MD: ['',[Validators.required, Validators.maxLength(1)]], //  統制/明細  //統制:0/明細:1
    ClassNo: ['',[Validators.required, Validators.maxLength(3)]], //  三碼代號 // 自動帶入科目編號前三碼
    ABAT_YN: ['N',[Validators.maxLength(1)]], //  是否為沖帳代號 Y/N
    Voucher_Type: ['',[Validators.required, Validators.maxLength(1)]], //  傳票格式 // 下方下拉
    Budget_YN: ['N',[Validators.required, Validators.maxLength(1)]], //  是否為預算科目 Y/N
    Org_YN: ['N',[Validators.required, Validators.maxLength(1)]], //  是否設定部門代號 Y/N
    rest_value: [null, [ Validators.maxLength(10),this.validationService.numberValidator]], //  折舊攤提年限 (不用新增/編輯這個)
    rest_value2: [null, [ Validators.maxLength(10),this.validationService.numberValidator]], //  殘值年限 (不用新增/編輯這個)
    Input_YN: ['N',[Validators.required, Validators.maxLength(1)]], //  是否可輸
  });

  ClassNo_Option: apiOption[] = [ //中類代碼
      {No: '1', Name: '下拉1'},
      {No: '2', Name: '下拉2'},
      {No: '3', Name: '下拉3'}
    ]

    AccDC_Option: apiOption[] = [ // 借/貸
      {No: '0', Name: '借'},
      {No: '1', Name: '貸'}
    ]

    Ledger_MD_Option: apiOption[] = [ // 統制/明細
      {No: '0', Name: '統制'},
      {No: '1', Name: '明細'}
    ]

    whether_Option: apiOption[] = [ // 是否
      {No: 'Y', Name: '是'},
      {No: 'N', Name: '否'}
    ]

    Voucher_Type_Option: apiOption[] = [ // 傳票格式
      {No: '0', Name: '無特定'},
      {No: '1', Name: '應付票據'},
      {No: '2', Name: '應收票據'},
      {No: '3', Name: '應付帳款'},

      {No: '4', Name: '應收帳款'},
      {No: '5', Name: '進項稅額'},
      {No: '6', Name: '銷項稅額'},
      {No: '7', Name: '銀行存款'},

      {No: 'A', Name: '應付費用'},
      {No: 'B', Name: '代收稅款'},
      {No: 'C', Name: '固定資產'},
      {No: 'D', Name: '現金'},
      {No: 'E', Name: '應收保證票據'}
    ]

  constructor(
    private tls51080Service: Tls51080Service,
    private validationService: ValidationService
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('FIN52080', this.dataForm);
  }

  onSubmit(frm: FormGroup) {
    this.messageService.blockUi();
    this.submitted = true;

    if (this.dataForm.invalid) {
      this.messageService.unblockUi();
      return;
    }
    
    // 送出前檢查 大+中+三碼 不可重複
    const formValue = frm.getRawValue();
    switch (this.crudstatus) {
      case CRUDStatus.Create:
        if (this.canAdd()) {
          console.log('insert', formValue);
          // this.tls51080Service.insertTLS51080(formValue).subscribe(() => {
          //   this.messageService.successBubble('新增成功');
          //   // this.onCancel(); // 儲存後，會清除資料留在原頁面，不返回列表
          //   this.dataForm.reset(); // 重置表單
          // });
        }
        break;
      case CRUDStatus.Edit:
        if (this.canEdit()) {
          console.log('update', formValue);
          // this.tls51080Service.updateTLS51080(formValue).subscribe(() => {
          //   // this.messageService.successBubble('更新成功');
          //   this.onCancel(); // 儲存後，會返回列表
          // });
        }
        break;
    }

    this.messageService.unblockUi();
    this.submitted = false;
  }

  submitForm(frm: FormGroup) {
    this.onSubmit(frm);
  }

  onClearForm() {
    this.dataForm.reset(); // 重置表單
  }
}
