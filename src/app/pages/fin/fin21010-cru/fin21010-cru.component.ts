import { AsyncPipe, NgIf } from '@angular/common';
import { Component, OnInit, } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { APS1002, Fin21010Service } from '@service/api/fin/fin21010.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { PanelModule } from 'primeng/panel';
import { catchError, map, Observable, of, switchMap, timer } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { ValidationService } from '../../../shared/service/validation.service';
@Component({
  selector: 'app-fin21010-cru',
  templateUrl: './fin21010-cru.component.html',
  standalone: true,
  imports: [AsyncPipe, MenubarComponent, ButtonComponent, PanelModule, FormsModule, ReactiveFormsModule, InputTextComponent, DropdownComponent, NgIf, TranslateModule]
})
export class FIN21010CRUComponent extends BasicCruPageComponent<APS1002> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    id: [null], // 主鍵ID，新增時為null，編輯時為存在的ID
    BNK_id: [null],
    BNK_DepositAccNo: [null, [Validators.required, Validators.maxLength(6), this.validationService.noChineseValidator], [this.bnkIdDuplicateValidator()]], // 公司銀行科目
    BNK_No: [null, [Validators.required, Validators.maxLength(10), this.validationService.noChineseValidator]],     // 全省銀行代碼--- 下拉: BNK_NO+BNK_BRANCHNO銀行代碼、銀行名稱BNK_BRANCHNAME
    BNK_AccNo: [null, [Validators.required, Validators.maxLength(20), this.validationService.numberValidator]],  // 帳號
    BNK_AccName: [null, [Validators.required, Validators.maxLength(80)]],      // 帳戶名稱
    BNK_BranchNo: [null, [Validators.required, Validators.maxLength(4), this.validationService.noChineseValidator]],     // 銀行分行代號
    BNK_AccType: [null, [Validators.required, Validators.maxLength(2), this.validationService.noChineseValidator]],      // 存款代號 (SYS1000.BNK_ACCTYPE)
    BNK_AccStatus: ['0', [Validators.required, Validators.maxLength(1), this.validationService.noChineseValidator]],     // 帳戶狀態 (0=正常)
    BNK_CheckInAccNo: [null, [Validators.maxLength(14), this.validationService.noChineseValidator]],  // 應收票據科目 //"下拉 GLS1005.ACCNO 讀取 ACCNO, ACCCNAME" (ClassNo 112 or 113)
    BNK_CheckOutAccNo: [null, [Validators.maxLength(14), this.validationService.noChineseValidator]], // 應付票據科目 //"下拉 GLS1005.ACCNO 讀取 ACCNO, ACCCNAME" (ClassNo 211 0r 212)
  });
  APS1004_Option = this.dropdownApiService.queryAps1001({ "SearchKeyword": "" });
  GLS1005_BNK_DepositAccNo_Option = this.dropdownApiService.queryGls1005For1103();
  GLS1005_BNK_CheckInAccNo_Option = this.dropdownApiService.queryGls1005_BNK_CheckOutAcc();
  GLS1005_BNK_CheckOutAccNo_Option = this.dropdownApiService.queryGls1005_BNK_CheckInAcc();
  BNK_AccType_Option = getSYS1000Options('BNK_AccType'); // 存款代號選項
  constructor(
    private readonly fin21010Service: Fin21010Service,
    private readonly dropdownApiService: DropdownApiService,
    private readonly validationService: ValidationService,
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('FIN21010', this.dataForm);
    // 編輯模式也先抓 BNK_BranchNo
    if (this.crudstatus != CRUDStatus.Create) {
      this.reset_BNK_BranchNo();
      this.dataForm.get('BNK_DepositAccNo')!.disable();
    }
    // 發生變化時重新寫入分行代號
    this.dataForm.get('BNK_No')!.valueChanges.subscribe(() => {
      this.reset_BNK_BranchNo();
    });
  }
  // 實作驗證器邏輯
  bnkIdDuplicateValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) return of(null);

      // 如果是「修改模式」，需要把目前的 ID 傳給後端進行排除
      const currentId = this.dataForm.get('id')?.value || 0;

      // 使用 timer 做 debounce (500ms)，避免使用者打字時一直觸發 API
      return timer(500).pipe(
        switchMap(() => this.fin21010Service.checkDuplicateBNKid(control.value, currentId)),
        map(response => {
          // 假設 API 回傳 Data 為 true 代表已存在（重覆）
          return response.Data === true ? { bnkIdDuplicate: true } : null;
        }),
        catchError(() => of(null)) // 發生 API 錯誤時不阻擋儲存
      );
    };
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

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const formValue = frm.getRawValue();
      const body = {
        ...formValue,
        BNK_id: formValue.BNK_DepositAccNo ?? '',
      }
      const request$ = this.isFormCreateable ? this.fin21010Service.insertFIN21010(body) : this.fin21010Service.updateFIN21010(body);
      request$.subscribe(() => {
        if (this.isFormCreateable) {
          this.messageService.successBubble('新增成功');
          this.dataForm.reset(); // 重置表單
        } else {
          this.messageService.successBubble('修改成功');
          this.onCancel(); // 儲存後，會返回列表
        }
      });
    });
  }
}
