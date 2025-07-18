// --Commonly used imports--
import { Component, OnInit, } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { TranslateModule } from '@ngx-translate/core';
//
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { PanelModule } from 'primeng/panel';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { EditorTextComponent } from '../../../shared/componentkit/editor-text/editor-text.component';
import { NgFor, NgIf } from '@angular/common';
import { ButtonDynamicallydeleteComponent } from '../../../shared/componentkit/button-dynamicallydelete/button-dynamicallydelete.component';
import { ButtonDynamicallyaddComponent } from '../../../shared/componentkit/button-dynamicallyadd/button-dynamicallyadd.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { apiOption,option } from '../../../shared/models/sys/sysb000.module';
import { Tls29010Service } from '../../../service/api/tls/tls29010.service';

// TALPORDERD_OPENDisc
export interface TALPORDERD_OPENDisc {
  id: number; // 主鍵，自動編號
  mid: number; // 主鍵，自動編號

  str_no: string; // 店部編號
  pod_no: string; // 活動編號(TALPORDERM)
  talent_id: number; // 合約編號系統
  tlt_id: string; // 抽成類別(0-9)

  tlt_no: string; // 專櫃編號
  cag_barcode: string; // 折數(條碼)
  use_flag: string; // 是否使用 Y/N

  CRT_Date: string; // 建立日期 (ISO 字串格式: YYYY-MM-DD)
  CRT_USR_No: string; // 建立人員代碼
  CRT_USR_Name: string; // 建立人員姓名
  UPD_Date: string; // 變更日期 (ISO 格式: YYYY-MM-DDTHH:mm:ss)
  UPD_USR_No: string; // 變更人員代碼
  UPD_USR_Name: string; // 變更人員姓名

  CanDel?: boolean;  //能否刪除(僅顯示)
}

@Component({
  selector: 'app-tls29010-cru',
  templateUrl: './tls29010-cru.component.html',
  styleUrl: './tls29010-cru.component.scss',
  standalone: true,
  imports: [MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, CalendarComponent, DropdownComponent, RadiobuttonComponent, EditorTextComponent, InputTextComponent, InputNumberComponent, EditorTextComponent, NgFor, ButtonDynamicallydeleteComponent, ButtonDynamicallyaddComponent, ButtonComponent, NgIf, TranslateModule]
})

// 2.2.9.1 折扣開放維護作業cru
export class TLS29010CRUComponent extends BasicCruPageComponent<TALPORDERD_OPENDisc> implements OnInit{

  // ----------------------------------------------------------------
      dataForm = this.formBuilder.nonNullable.group({
        // TALPORDERD_OPENDisc 
        // --專櫃活動設定主檔TALPORDERM (新增這四項 都要鎖定嗎) > 跟下面的其他欄位有連動關係嗎?--
        id: [{ value: null, disabled: true }], // 自動產生，不允許編輯
        mid: [{ value: null, disabled: true }], // 自動產生，不允許編輯
        str_no: ['', [Validators.required, Validators.maxLength(8)]],        // 店部編號
        pod_no: ['', [Validators.required, Validators.maxLength(12)]],       // 活動編號
        // ------
        talent_id: [null],                              // 合約編號系統 -- 這是哪來的
        tlt_id: [0, [Validators.required, Validators.maxLength(1), Validators.min(0),Validators.max(9)]], // 抽成類別(0-9) 送出時再轉成string
        tlt_no: ['', [Validators.required, Validators.maxLength(8)]],        // 專櫃編號(是從TLTTALENT取吧)
        cag_barcode: ['', [Validators.required, Validators.maxLength(13)]],  // 折數條碼 (條碼)
        use_flag: ['', [Validators.required, Validators.maxLength(1)]],      // 是否使用 Y/N
      });
    
      whetherOption: option[] = [ // 是否使用 Y/N
        {value: 'Y', label: '是'},
        {value: 'N', label: '否'}
      ];

      tlt_No_Option: apiOption[] = [];  // 專櫃編號下拉

      // ----------------------------------------------------------------
      constructor(private tls12010Service: Tls29010Service) {
        super(); // 呼叫父類建構子
      }
    
      ngOnInit(): void {
        this.initializePage('TLS29010', this.dataForm);
        this.loadOption();
        console.log('讀取資料', this.dataForm.value);
      }
    
      onSubmit(frm: FormGroup) {
        this.messageService.blockUi();
        this.submitted = true;
    
        if (this.dataForm.invalid) {
          this.messageService.unblockUi();
          return;
        }
    
        const formValue = frm.getRawValue();
        switch (this.crudstatus) {
          case CRUDStatus.Create:
            if (this.canAdd()) {
              console.log('insert', frm.value);
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

      loadOption(){
        // 專櫃編號
        this.tls12010Service
          .queryTLTTALENT_Status_DropDownList({})
          .subscribe((response) => {
            this.tlt_No_Option = response.Data.map((item: apiOption) => ({
              No: item.No,
              Name: item.Name,
              Label: item.No + '-' + item.Name,
            }));
      
            console.log('專櫃編號 下拉:', response.Data);
          });
      }
}
