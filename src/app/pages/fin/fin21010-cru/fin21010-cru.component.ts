import { Component, OnInit, } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
// Shared
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
//
import { TranslateModule } from '@ngx-translate/core';
//
import { NgIf } from '@angular/common';
import { untilDestroyed } from '@ngneat/until-destroy';
import { APS1002, Fin21010Service } from '@service/api/fin/fin21010.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { apiOption } from '@shared/models/sys/sysb000.model';
import { PanelModule } from 'primeng/panel';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { ValidationService } from '../../../shared/service/validation.service';

//1.2.1.1 公司銀行資料維護 CRU
@Component({
  selector: 'app-fin21010-cru',
  templateUrl: './fin21010-cru.component.html',
  styleUrl: './fin21010-cru.component.scss',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, PanelModule, FormsModule, ReactiveFormsModule, InputTextComponent, DropdownComponent, NgIf, TranslateModule]
})
export class FIN21010CRUComponent extends BasicCruPageComponent<APS1002> implements OnInit {
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    //APS1002  公司銀行資料維護主檔
    id: [null], // 主鍵ID，新增時為null，編輯時為存在的ID

    BNK_No: ['', [Validators.required, Validators.maxLength(10), this.validationService.noChineseValidator]],     // 全省銀行代碼--- 下拉: BNK_NO+BNK_BRANCHNO銀行代碼、銀行名稱BNK_BRANCHNAME
    BNK_AccNo: [null, [Validators.required, Validators.maxLength(20), this.validationService.numberValidator]],  // 帳號
    BNK_AccName: [null, [Validators.required, Validators.maxLength(80)]],      // 帳戶名稱

    BNK_BranchNo: ['', [Validators.required, Validators.maxLength(4), this.validationService.noChineseValidator]],     // 銀行分行代號
    BNK_AccType: [null, [Validators.required, Validators.maxLength(2), this.validationService.noChineseValidator]],      // 存款代號 (SYS1000.BNK_ACCTYPE)
    BNK_AccStatus: ['0', [Validators.required, Validators.maxLength(1), this.validationService.noChineseValidator]],     // 帳戶狀態 (0=正常)

    // BNK_DepositAccNo: [null, [Validators.maxLength(14), this.validationService.noChineseValidator]],  // 公司銀行科目 //"下拉 GLS1005.ACCNO 讀取 ACCNO, ACCCNAME" (accNo like '1103%')
    BNK_DepositAccNo: [null, [Validators.maxLength(6), this.validationService.noChineseValidator]], // 公司銀行科目
    BNK_CheckInAccNo: [null, [Validators.maxLength(14), this.validationService.noChineseValidator]],  // 應收票據科目 //"下拉 GLS1005.ACCNO 讀取 ACCNO, ACCCNAME" (ClassNo 112 or 113)
    BNK_CheckOutAccNo: [null, [Validators.maxLength(14), this.validationService.noChineseValidator]], // 應付票據科目 //"下拉 GLS1005.ACCNO 讀取 ACCNO, ACCCNAME" (ClassNo 211 0r 212)
  });

  APS1004_Option: apiOption[] = []; // 先用 查詢銀行+分行資料表(APS1001 JOIN APS1004)

  // -----------看要不要由GLS1005_Option去mapping---------------------
  GLS1005_BNK_DepositAccNo_Option: apiOption[] = []; // 公司銀行科目  (accNo like '1103%')
  GLS1005_BNK_CheckInAccNo_Option: apiOption[] = []; // 應收票據科目 (ClassNo 112 or 113)
  GLS1005_BNK_CheckOutAccNo_Option: apiOption[] = []; // 應付票據科目  (ClassNo 211 0r 212)

  // 2. 新增一個陣列存原始清單，用於重複性檢查
  rawGls1005List: any[] = [];
  // ----------------------------------------------------------------

  BNK_AccType_Option: apiOption[] = []; // SYS1000.BNK_ACCTYPE 存款代號 -- 下拉選單
  // ----------------------------------------------------------------
  constructor(
    private fin21010Service: Fin21010Service,
    private dropdownApiService: DropdownApiService,
    private validationService: ValidationService
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('FIN21010', this.dataForm);
    this.loadOptions();

    console.log('讀取資料', this.dataForm.value);

    // 編輯模式也先抓 BNK_BranchNo
    if (this.crudstatus != CRUDStatus.Create) {
      this.reset_BNK_BranchNo();
    }

    // 發生變化時重新寫入分行代號
    this.dataForm.get('BNK_No')!.valueChanges.subscribe(() => {
      this.reset_BNK_BranchNo();
    });
  }

  // 當 BNK_No 發生變化時寫入 BNK_BranchNo
  reset_BNK_BranchNo() {
    // 指定BNK_BranchNo 為 BNK_No 後3碼
    const bnkNoControl = this.dataForm.controls.BNK_No as FormControl<string | null>;
    const branchControl = this.dataForm.controls.BNK_BranchNo as FormControl<string | null>;
    const bnkNoFull = bnkNoControl.value ?? '';

    if (bnkNoFull !== '') {
      const str = String(bnkNoFull);
      branchControl.setValue(str.substring(3, 7)); // 改成末四碼
    }
  }

  // 待確認 1.刪除卡控規則 2.BNK_No是否可以用前三碼去切
  onSubmit(frm: FormGroup) {
    this.messageService.blockUi();
    this.submitted = true;

    if (this.dataForm.invalid) {
      this.messageService.unblockUi();
      console.log('不可送出', this.dataForm.value);
      return;
    }

    const formValue = frm.getRawValue();
    console.log('formValue', formValue)
    switch (this.crudstatus) {
      case CRUDStatus.Create:
        if (this.canAdd()) {
          const currentAccNo = this.dataForm.get('BNK_DepositAccNo')?.value;
          const isExist = this.rawGls1005List.some(item => item.No === currentAccNo);

          if (isExist) {
            this.messageService.errorBubble('公司銀行科目代碼已存在，不可新增');
            return;
          }

          console.log('insert', formValue);
          this.fin21010Service.insertFIN21010(formValue).subscribe(() => {
            this.messageService.successBubble('新增成功');
            // this.onCancel(); // 儲存後，會清除資料留在原頁面，不返回列表
            this.dataForm.reset(); // 重置表單
          });
        }
        break;
      case CRUDStatus.Edit:
        if (this.canEdit()) {
          console.log('update', formValue);
          this.fin21010Service.updateFIN21010(formValue).subscribe(() => {
            // this.messageService.successBubble('更新成功');
            this.onCancel(); // 儲存後，會返回列表
          });
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

  // 讀取dopropdown選項
  loadOptions() {
    // 查 SYS1000.BNK_ACCTYPE 存款代號 -- 下拉選單
    this.dropdownApiService.querySys1000({ "SYS_Type": "BNK_ACCTYPE" }).pipe(untilDestroyed(this)).subscribe((response) => {
      const list = Array.isArray(response) ? response : [];
      this.BNK_AccType_Option = list.map((item: any) => ({
        No: item.No, // 存款代號 代號
        Name: item.Name, // 存款代號 名稱
      }));
      // console.log('SYS1000.BNK_ACCTYPE 存款代號:', this.BNK_AccType_Option);
    });

    // 查 公司銀行科目代號
    this.dropdownApiService.queryGls1005For1103().pipe(untilDestroyed(this)).subscribe((response) => {
      // 1. 確保 response 是陣列
      const list = Array.isArray(response) ? response : [];
      // 儲存原始清單供重複性檢查使用
      this.rawGls1005List = list; ㄑ

      this.GLS1005_BNK_DepositAccNo_Option = list.map((item: any) => ({
        No: item.No, // 公司銀行科目 代號
        Name: item.Name, // 公司銀行科目 名稱
        Label: item.No + '-' + item.Name, // 代碼+名稱
      }));
      console.log('公司銀行科目代號:', this.GLS1005_BNK_DepositAccNo_Option);
    });

    this.dropdownApiService.queryGls1005_BNK_CheckInAcc().pipe(untilDestroyed(this)).subscribe((response) => {
      const list = Array.isArray(response) ? response : [];
      this.GLS1005_BNK_CheckOutAccNo_Option = list.map((item: any) => ({
        No: item.No, // 應付票據科目 代號
        Name: item.Name, // 應付票據科目 名稱
        Label: item.No + '-' + item.Name, // 代號+名稱
      }));
      console.log('⭐ 應付票據科目:', this.GLS1005_BNK_CheckOutAccNo_Option);
    });

    this.dropdownApiService.queryGls1005_BNK_CheckOutAcc().pipe(untilDestroyed(this)).subscribe((response) => {
      const list = Array.isArray(response) ? response : [];
      this.GLS1005_BNK_CheckInAccNo_Option = list.map((item: any) => ({
        No: item.No, // 應收票據科目 代號
        Name: item.Name, // 應收票據科目 名稱
        Label: item.No + '-' + item.Name, // 代號+名稱
      }));
      console.log('⭐ 應收票據科目:', this.GLS1005_BNK_CheckInAccNo_Option);
    });

    // 查 APS1004 -- 下拉選單(
    // No: BNK_NO+BNK_BRANCHNO銀行代碼、
    // Name: 銀行名稱BNK_BRANCHNAME
    // ) 範圍: 全找
    this.dropdownApiService.queryAps1001({ "SearchKeyword": "" }).pipe(untilDestroyed(this)).subscribe((response) => {
      const list = Array.isArray(response) ? response : [];
      this.APS1004_Option = list.map((item: any) => ({
        No: item.No, // 全省銀行 代碼
        Name: item.Name, // 全省銀行 名稱
        Label: item.No + '-' + item.Name, // 代號+名稱
      }));
      console.log('全省銀行代碼:', this.APS1004_Option);
    });
  }
}
