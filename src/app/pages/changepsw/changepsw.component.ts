import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { NotificationService } from '../../shared/service/notification.service';
import { EncryptionService } from '../../shared/service/encryption.service';
import { UserCodeService } from './../../service/basic/user-code.service';
import { AuthService } from '../../service/system/auth.service';

export interface UserInfo {
  AccessToken: string;
  USER_PwdExpireDate: string;
  id: string;
  user_Name: string;
  user_No: string;
  user_email: string;
}

@Component({
  selector: 'app-changepsw',
  templateUrl: './changepsw.component.html',
  styleUrls: ['./changepsw.component.scss'],
  providers: [MessageService]
})
export class ChangepswComponent implements OnInit {
  passwordForm: FormGroup;
  userInfo: UserInfo | null = null;
  formButtonLoading = false; // 控制按鈕的載入狀態
  strongRegex = '^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>\-_+=`~[\]\\;\']).{4,8}$';

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private notemessage: NotificationService,
    private encrypt: EncryptionService,
    private userCodeService: UserCodeService,
    private authService: AuthService,
  ) {
    this.passwordForm = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', [Validators.required]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.passwordsMatchValidator
    });
  }

  ngOnInit(): void {
    const userInfoString = sessionStorage.getItem('UserInfo');
    if (userInfoString) {
      try {
        this.userInfo = JSON.parse(userInfoString) as UserInfo;
      } catch (error) {
        console.error('Failed to parse user info from sessionStorage', error);
      }
    }
  }

  passwordsMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { mismatch: true };
  }

  onSubmit(): void {
    if (!this.userInfo) {
      console.error('用戶代碼無效');
      return;
    }

    if (this.passwordForm.invalid) {
      this.messageService.add({ severity: 'warn', summary: '格式錯誤', detail: '請確認密碼格式及輸入是否一致' });
      return;
    }

    if(this.passwordForm.valid){
      this.formButtonLoading = true;

      const { oldPassword, newPassword } = this.passwordForm.value;

      const query = {
        User_No: this.userInfo.user_No,
        Old_password: this.encrypt.getPassword(this.userInfo.user_No, oldPassword),
        New_password: this.encrypt.getPassword(this.userInfo.user_No, newPassword),
        PwdExpireDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 密碼到期日設為90天後
      };

      this.userCodeService.changePassword(query).subscribe({
        next: () => {
          this.notemessage.successBubble('密碼修改成功');
          this.messageService.add({ severity: 'success', summary: '成功', detail: '密碼已變更' });
          this.passwordForm.reset();
          this.authService.logout();
        },
        error: (error) => {
          console.error('密碼修改失敗:', error);
          this.notemessage.errorBubble('密碼修改失敗，請稍後再試。');
        }
      });
      this.formButtonLoading = false;
    }
    }
}
