import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { finalize, take } from 'rxjs/operators';
import { AuthService } from '../../service/system/auth.service';
import { UserCodeService } from '../../service/system/user-code.service';
import { NotificationService } from '../../shared/component/notification-message/notification.service';
import { EncryptionService } from '../../shared/service/encryption.service';
import { ValidationService } from '../../shared/service/validation.service';

const PASSWORD_EXPIRE_DAYS = 90;

@Component({
  selector: 'app-changepsw',
  template: `
  <div class="card">
    <div class="flex align-items-center justify-content-between mb-4 pb-2 border-bottom-1 surface-border">
      <div class="flex align-items-center gap-2">
        <i class="pi pi-shield text-primary text-3xl"></i>
        <div class="flex flex-column">
          <span class="text-xl font-bold text-900">修改使用者密碼</span>
          <span class="text-sm text-500 font-mono">Change User Password</span>
        </div>
      </div>
    </div>
    <form [formGroup]="userForm" (ngSubmit)="changePass()" class="sm:px-4 md:px-6 lg:px-8">
      <div class="grid fields">

        <div class="col-12 sm:col-6 flex flex-column gap-2">
          <label for="User_No">使用者代號</label>
          <input pInputText id="User_No" formControlName="User_No" class="w-full" />
        </div>

        <div class="col-12 sm:col-6 flex flex-column gap-2">
          <label for="User_Name">使用者姓名</label>
          <input pInputText id="User_Name" formControlName="User_Name" class="w-full" />
        </div>

        <div class="col-12 flex flex-column gap-2">
          <label for="Old_password">舊密碼 <span class="text-red-500">*</span></label>
          <p-password id="Old_password" formControlName="Old_password" styleClass="w-full" inputStyleClass="w-full"
            [feedback]="false" [toggleMask]="true"
            [ngClass]="{ 'ng-invalid ng-dirty': submitted && f['Old_password'].errors }"></p-password>
          @if (submitted && f['Old_password'].errors?.['required']) {
          <small class="p-error">請輸入舊密碼</small>
          }
        </div>

        <div class="col-12 flex flex-column gap-2">
          <label for="New_password">新密碼 <span class="text-red-500">*</span></label>
          <p-password id="New_password" formControlName="New_password" styleClass="w-full" inputStyleClass="w-full"
            [feedback]="true" [toggleMask]="true" promptLabel="設定密碼" weakLabel="太簡單" mediumLabel="中等複雜度"
            strongLabel="複雜密碼" [strongRegex]="strongRegex"
            [ngClass]="{ 'ng-invalid ng-dirty': submitted && f['New_password'].errors }">
            <ng-template pTemplate="footer">
              <p-divider></p-divider>
              <p class="mt-2 font-bold">密碼規則格式限制：</p>
              <ul class="pl-4 m-0 line-height-3">
                <li>字數限制：4 至 8 個字元</li>
                <li>至少一個英文小寫字母（a–z）</li>
                <li>至少一個數字（0–9）</li>
              </ul>
            </ng-template>
          </p-password>

          <div class="text-primary-500 text-sm flex align-items-center gap-1 mt-1">
            <i class="pi pi-exclamation-circle"></i>
            <span>密碼需要4-8碼，且包含英文小寫字母與數字</span>
          </div>

          @if (submitted && f['New_password'].errors) {
          @if (f['New_password'].errors['required']) { <small class="p-error">請輸入新密碼</small> }
          @if (f['New_password'].errors['minlength'] || f['New_password'].errors['maxlength'] ||
          f['New_password'].errors['passwordStrength']) {
          <small class="p-error">新密碼格式不符合規定</small>
          }
          }
        </div>

        <div class="col-12 flex flex-column gap-2">
          <label for="New_password2">重新輸入新密碼 <span class="text-red-500">*</span></label>
          <p-password id="New_password2" formControlName="New_password2" styleClass="w-full" inputStyleClass="w-full"
            [feedback]="false" [toggleMask]="true"
            [ngClass]="{ 'ng-invalid ng-dirty': submitted && (f['New_password2'].errors || userForm.errors?.['passwordsMismatch']) }"></p-password>

          @if (submitted) {
          @if (f['New_password2'].errors?.['required']) {
          <small class="p-error">請再次輸入新密碼</small>
          } @else if (userForm.errors?.['passwordsMismatch']) {
          <small class="p-error">兩次輸入的新密碼不一致</small>
          }
          }
        </div>

      </div>

      <div class="grid justify-content-end gap-2 m-0 border-top-1 surface-border pt-3">
        <p-button type="submit" label="確認修改" icon="pi pi-check" [loading]="loading"></p-button>
      </div>
    </form>
  </div>
  `,
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    DividerModule,
    TranslateModule,
  ],
})
export class ChangepswComponent implements OnInit {
  submitted = false;
  loading = false;
  strongRegex = '^(?=.*[a-z])(?=.*[0-9]).{4,8}$';

  // 宣告強型態表單
  userForm = this.formBuilder.group({
    User_No: [{ value: '', disabled: true }],
    User_Name: [{ value: '', disabled: true }],
    Old_password: ['', Validators.required],
    New_password: ['', [
      Validators.required,
      Validators.minLength(4),
      Validators.maxLength(8),
      this.validationService.passwordStrengthValidator()
    ]],
    New_password2: ['', [Validators.required, Validators.maxLength(8)]]
  }, {
    validators: this.validationService.passwordsMatchValidator('New_password', 'New_password2')
  });

  constructor(
    private readonly notemessage: NotificationService,
    private readonly encrypt: EncryptionService,
    private readonly userCodeService: UserCodeService,
    private readonly authService: AuthService,
    private readonly validationService: ValidationService,
    private readonly formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    const userInfo = this.authService.getUserInfo();
    if (userInfo) {
      this.userForm.patchValue({
        User_No: userInfo.user_No,
        User_Name: userInfo.user_Name
      });
    }
  }

  // 方便在 HTML 讀取 FormControls 的 getter
  get f() {
    return this.userForm.controls;
  }

  changePass(): void {
    this.submitted = true;
    this.notemessage.blockUi();

    // 驗證失敗安全守衛：立刻解除 UI 鎖定並攔截
    if (this.userForm.invalid) {
      this.notemessage.unblockUi();
      return;
    }

    this.notemessage.unblockUi();
    this.loading = true;

    // getRawValue() 可以順利取得被 disabled 的 User_No
    const formValues = this.userForm.getRawValue();
    const userNo = formValues.User_No;
    if (!userNo || !formValues.Old_password || !formValues.New_password) { return; }

    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + PASSWORD_EXPIRE_DAYS);

    const body = {
      User_No: userNo,
      Old_password: this.encrypt.getPassword(userNo, formValues.Old_password),
      New_password: this.encrypt.getPassword(userNo, formValues.New_password),
      PwdExpireDate: expireDate.toISOString(),
    };

    this.userCodeService.changePassword(body).pipe(take(1), finalize(() => this.loading = false)).subscribe((response) => {
      if (response?.Status === "0000") {
        this.notemessage.successBubble(response.Message, '更新成功');
        this.authService.logout();
      } else {
        this.notemessage.errorBubble(response?.Message || '未知錯誤', "更新失敗");
      }
    });
  }
}
