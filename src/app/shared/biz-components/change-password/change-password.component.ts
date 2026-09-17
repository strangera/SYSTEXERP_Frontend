import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, OnInit, output } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { finalize, take } from 'rxjs';
import { AuthService } from '../../../service/system/auth.service';
import { UserCodeService } from '../../../service/system/user-code.service';
import { NotificationService } from '../../components/notification-message/notification.service';
import { EncryptionService } from '../../service/encryption.service';
import { ValidationService } from '../../service/validation.service';

const PASSWORD_EXPIRE_DAYS = 90;

/**
 * 共用「修改使用者密碼」表單邏輯：欄位驗證、加密送出、送出後登出，三個呼叫端（changepsw 獨立頁、
 * pages 根元件強制跳窗、sso-dashboard 強制跳窗/選單觸發）統一呼叫本元件，不再各自重複定義。
 */
@Component({
  selector: 'app-change-password',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    DividerModule,
  ],
  template: `
  <form [formGroup]="form" (ngSubmit)="onSubmit()">
    <span class="p-text-secondary block mb-4">更新您的密碼</span>

    @if (showUserInfo()) {
    <div class="grid fields">
      <div class="col-12 sm:col-6 flex flex-column gap-2">
        <label for="cp-User_No">使用者代號</label>
        <input pInputText id="cp-User_No" formControlName="User_No" class="w-full" />
      </div>
      <div class="col-12 sm:col-6 flex flex-column gap-2">
        <label for="cp-User_Name">使用者姓名</label>
        <input pInputText id="cp-User_Name" formControlName="User_Name" class="w-full" />
      </div>
    </div>
    }

    <div class="field grid">
      <label for="cp-Old_password" class="col-12 mb-2 md:col-2 md:mb-0">舊密碼</label>
      <div class="col-12 md:col-10">
        <p-password id="cp-Old_password" formControlName="Old_password" class="w-full" styleClass="w-full"
          inputStyleClass="w-full" autocomplete="current-password" placeholder="請輸入舊密碼" [toggleMask]="true"
          [feedback]="false" />
        @if (submitted && f['Old_password'].errors?.['required']) {
        <small class="p-error block">舊密碼為必填項。</small>
        }
      </div>
    </div>

    <div class="field grid">
      <label for="cp-New_password" class="col-12 mb-2 md:col-2 md:mb-0">新密碼</label>
      <div class="col-12 md:col-10">
        <p-password id="cp-New_password" class="w-full" styleClass="w-full" inputStyleClass="w-full"
          autocomplete="new-password" formControlName="New_password" placeholder="請輸入新密碼" [maxLength]="20"
          [toggleMask]="true" [feedback]="true" [strongRegex]="strongRegex" promptLabel="設定密碼" weakLabel="太簡單"
          mediumLabel="中等複雜度" strongLabel="符合規則" appendTo="body">
          <ng-template pTemplate="footer">
            <div class="flex flex-column">
              <p-divider />
              <p class="mt-2">密碼規則格式限制：</p>
              <ul class="pl-2 ml-2 mt-0" style="line-height: 1.5">
                <li>字數限制：4 至 20 個字元</li>
                <li>至少一個英文小寫字母（a–z）</li>
                <li>至少一個數字（0–9）</li>
              </ul>
            </div>
          </ng-template>
        </p-password>
        @if (submitted && f['New_password'].errors?.['required']) {
        <small class="p-error block">新密碼為必填項。</small>
        }
        @if (submitted && f['New_password'].errors?.['minlength']) {
        <small class="p-error block">密碼長度至少 4 個字元。</small>
        }
        @if (submitted && f['New_password'].errors?.['maxlength']) {
        <small class="p-error block">密碼長度最多 20 個字元。</small>
        }
        @if (submitted && f['New_password'].errors?.['invalidPasswordStrength']) {
        <small class="p-error block">密碼需包含至少一個英文小寫字母與一個數字。</small>
        }
      </div>
    </div>

    <div class="field grid">
      <label for="cp-New_password2" class="col-12 mb-2 md:col-2 md:mb-0">確認密碼</label>
      <div class="col-12 md:col-10">
        <p-password id="cp-New_password2" class="w-full" styleClass="w-full" inputStyleClass="w-full"
          autocomplete="new-password" formControlName="New_password2" placeholder="請再次輸入密碼" [maxLength]="20"
          [toggleMask]="true" appendTo="body" [feedback]="false" />
        @if (submitted && f['New_password2'].errors?.['required']) {
        <small class="p-error block">確認密碼為必填項。</small>
        } @else if (submitted && form.errors?.['passwordsMismatch']) {
        <small class="p-error block">密碼與確認密碼不符。</small>
        }
      </div>
    </div>

    <div class="flex gap-2 mt-3" [class.justify-content-between]="secondaryAction() !== 'none' || showExtendButton()"
      [class.justify-content-end]="secondaryAction() === 'none' && !showExtendButton()">
      <div class="flex gap-2">
        @if (secondaryAction() === 'logout') {
        <p-button label="登出" severity="secondary" type="button" (onClick)="authService.logout()" />
        }
        @if (secondaryAction() === 'cancel') {
        <p-button label="取消" severity="secondary" type="button" (onClick)="cancelled.emit()" />
        }
        @if (showExtendButton()) {
        <p-button label="沿用舊密碼" severity="secondary" type="button" [loading]="extending"
          (onClick)="onExtendPassword()" />
        }
      </div>
      <p-button [label]="submitLabel()" [loading]="loading" type="submit" />
    </div>
  </form>
  `,
})
export class ChangePasswordComponent implements OnInit {
  /** 送出按鈕文字，各呼叫端可自訂（例如「確認修改」／「確定」） */
  readonly submitLabel = input('確定');
  /** 提交按鈕旁的次要動作：none 不顯示／logout 直接登出／cancel 關閉視窗（不觸發送出） */
  readonly secondaryAction = input<'none' | 'logout' | 'cancel'>('none');
  /** 是否顯示使用者代號／姓名唯讀欄位（獨立頁面用） */
  readonly showUserInfo = input(false);
  /** 是否顯示「沿用舊密碼」按鈕（僅密碼已到期強制跳窗時傳入 true） */
  readonly showExtendButton = input(false);
  /** secondaryAction 為 cancel 時，點擊觸發，讓呼叫端自行關閉視窗 */
  readonly cancelled = output<void>();
  /** 沿用舊密碼展延到期日成功後觸發，讓呼叫端自行關閉視窗 */
  readonly extended = output<void>();

  private readonly formBuilder = inject(FormBuilder);
  private readonly notemessage = inject(NotificationService);
  private readonly encryptionService = inject(EncryptionService);
  private readonly userCodeService = inject(UserCodeService);
  private readonly validationService = inject(ValidationService);
  private readonly destroyRef = inject(DestroyRef);
  readonly authService = inject(AuthService);

  submitted = false;
  loading = false;
  extending = false;
  /** p-password 強度提示用：至少一個英文小寫字母與一個數字，4-20 碼 */
  readonly strongRegex = '^(?=.*[a-z])(?=.*[0-9]).{4,20}$';

  form = this.formBuilder.group({
    User_No: [{ value: '', disabled: true }],
    User_Name: [{ value: '', disabled: true }],
    Old_password: ['', Validators.required],
    New_password: ['', [
      Validators.required,
      Validators.minLength(4),
      Validators.maxLength(20),
      this.validationService.passwordStrengthValidator(),
    ]],
    New_password2: ['', [Validators.required, Validators.maxLength(20)]],
  }, {
    validators: this.validationService.passwordsMatchValidator('New_password', 'New_password2'),
  });

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {
    const userInfo = this.authService.currentUserValue;
    if (userInfo) {
      this.form.patchValue({
        User_No: userInfo.user_No,
        User_Name: userInfo.user_Name,
      });
    }
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    this.loading = true;

    const formValues = this.form.getRawValue();
    const userNo = formValues.User_No ?? '';

    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + PASSWORD_EXPIRE_DAYS);

    const body = {
      User_No: userNo,
      Old_password: this.encryptionService.getPassword(userNo, formValues.Old_password ?? ''),
      New_password: this.encryptionService.getPassword(userNo, formValues.New_password ?? ''),
      PwdExpireDate: expireDate.toISOString(),
    };

    this.userCodeService.changePassword(body).pipe(
      take(1),
      finalize(() => this.loading = false),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((response) => {
      if (response?.Status === '0000') {
        this.notemessage.successBubble(response.Message, '更新成功');
        this.authService.logout();
      } else {
        this.notemessage.errorBubble(response?.Message || '未知錯誤', '更新失敗');
      }
    });
  }

  /** 沿用舊密碼：不驗證表單，直接依 Token 身分展延密碼到期日 90 天，不需重新輸入舊密碼 */
  onExtendPassword(): void {
    this.extending = true;

    this.userCodeService.extendPassword().pipe(
      take(1),
      finalize(() => this.extending = false),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((response) => {
      if (response?.Status === '0000') {
        this.authService.updatePwdExpireDate(response.Data?.PwdExpireDate);
        this.notemessage.successBubble(response.Message || '密碼到期日已成功展延', '展延成功');
        this.extended.emit();
      } else {
        this.notemessage.errorBubble(response?.Message || '未知錯誤', '展延失敗');
      }
    });
  }
}
