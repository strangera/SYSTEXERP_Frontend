import { ValidationService } from './../../../shared/service/validation.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { PanelModule } from 'primeng/panel';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { NgIf } from '@angular/common';

// 2.4.1.2 收銀機EDC資料維護 CRU
@Component({
    selector: 'app-tls41020-cru',
    templateUrl: './tls41020-cru.component.html',
    styleUrl: './tls41020-cru.component.scss',
    standalone: true,
    imports: [
        MenubarComponent,
        PanelModule,
        FormsModule,
        ReactiveFormsModule,
        InputNumberComponent,
        CalendarComponent,
        DropdownComponent,
        InputTextComponent,
        ButtonComponent,
        NgIf,
        TranslateModule,
    ],
})
export class TLS41020CRUComponent
  extends BasicCruPageComponent<any>
  implements OnInit {
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    id: [],
    // POS1002EDC 收銀機EDC設定檔
    SYS_StoreNo: ['000', [Validators.required, Validators.maxLength(10)]], // 收銀機所屬門市店號
    ECR_No: [, [Validators.required, Validators.maxLength(6)]], // 收銀機號
    EDC_No: [, [Validators.required, Validators.maxLength(8)]], // 信用卡刷卡機代碼
    ECR_LocNo: [, [Validators.maxLength(10)]], // 收銀機位置 #JOIN POS1002
    EDC_BegDate: [, [Validators.required]], // 啟用日期
    EDC_EdnDate: [, [Validators.required]], // 停用日期
    EDC_Status: [, [Validators.required, Validators.maxLength(2)]], // 信用卡刷卡機狀態 A=啟用 C=停用
    ECR_TLT_No: [, [Validators.maxLength(20)]], // 機台所屬專櫃編號
    ECR_TLT_Name: ['', [Validators.maxLength(60)]], // 機台所屬櫃位名稱
    //
    EDC_IP1: [, [Validators.maxLength(20)]], // 第一台信用卡刷卡機IP
    EDC_IP2: [, [Validators.maxLength(20)]], // 第二台信用卡刷卡機IP
    EDC_IP3: [, [Validators.maxLength(20)]], // 第三台信用卡刷卡機IP
    EDC_TmID1: [, [Validators.maxLength(8)]], // 第一台信用卡刷卡機端末機代碼
    EDC_TmID2: [, [Validators.maxLength(8)]], // 第二台信用卡刷卡機端末機代碼
    EDC_TmID3: [, [Validators.maxLength(8)]], // 第三台信用卡刷卡機端末機代碼
  });
  // ----------------------------------------------------------------
  EDC_Status_Option: any[] = [
    { value: 'A', label: '啟用' },
    { value: 'C', label: '停用' },
  ];

  constructor(
    private validationService: ValidationService,
    private translate: TranslateService,
    //
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('TLS41020', this.dataForm);
  }

  onSubmit(frm: FormGroup) {
    // 修改：使用父類的 handleSubmit 方法
    this.handleSubmit(frm, () => {
      switch (this.crudstatus) {
        case CRUDStatus.Create:
          if (this.canAdd()) {
            // this.sysb500Service.insertSYSB500(frm.value).subscribe(() => {
            //   this.messageService.successBubble('新增成功');
            //   this.onCancel(); // 新增成功後返回查詢頁面
            // });
          }
          break;
        case CRUDStatus.Edit:
          if (this.canEdit()) {
            // this.sysb500Service.updateSYSB500(frm.value).subscribe(() => {
            //   this.messageService.successBubble('更新成功');
            //   this.onCancel(); // 更新成功後返回查詢頁面
            // });
          }
          break;
      }
    });
  }

  submitForm(frm: FormGroup) {
    this.onSubmit(frm);
  }

  onClearForm() {
    this.dataForm.reset(); // 重置表單
  }
}
