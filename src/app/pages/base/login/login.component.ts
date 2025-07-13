import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { first } from 'rxjs';
import { NgIf, NgClass } from '@angular/common';
import { AuthService } from '../../../service/system/auth.service';
import { userLogin } from '../../../shared/models/system/userLogin';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { PasswordModule } from 'primeng/password';
import { Button, ButtonDirective } from 'primeng/button';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgIf,
    PasswordModule,
    NgClass,
    Button,
    ButtonDirective,
  ],
})
export class LoginComponent {
  logoPath = 'assets/layout/images/login_logo.png';
  loginForm = this.formBuilder.group({
    code: ['admin' as string, Validators.required],
    password: ['1' as string, Validators.required],
  });
  submitted = false;
  loading = false;
  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private notemessage: NotificationService,
  ) {
  }
  onSubmit(frm: FormGroup) {
    this.submitted = true;
    if (frm.invalid) return;
    this.loading = true;
    this.authService.login(this.loginForm.value as userLogin).pipe(first(), untilDestroyed(this)).subscribe({
      next: () => {
        this.notemessage.successBubble('登入成功');
        this.loading = false;
      },
      error: () => {
        this.loginForm.patchValue({ password: '' }); //清空密碼
        this.loading = false;
      }
    });
    this.notemessage.unblockUi();
  }
}
