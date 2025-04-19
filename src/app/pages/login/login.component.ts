import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs';
import { registerLocaleData } from '@angular/common';
import zhHant from '@angular/common/locales/zh-Hant';
import { AuthService } from '../../service/system/auth.service';
import { CommonService } from '../../shared/service/common.service';
import { userLogin } from '../../models/system/userLogin';
import { NotificationService } from '../../shared/service/notification.service';
import { Sys1000Service } from '../../service/SYS100/sys1000.service';

registerLocaleData(zhHant, 'zh-tw');

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  logoPath: string = 'assets/layout/images/login_logo.png';
  loginForm = this.formBuilder.group({
    account_id: ['admin' as string, Validators.required],
    account_psw: ['1' as string, Validators.required],
    client_ip: ['' as string]
  });
  submitted: boolean = false;
  loading: boolean = false;
  ipAddress: string = '';
  // constructor
  constructor(
    private authService: AuthService,
    private sys1000Service: Sys1000Service, // Router
    private formBuilder: FormBuilder,
    private notemessage: NotificationService,
    private route: ActivatedRoute,
    private router: Router,
    private commService: CommonService,
  ) {
  }

  ngOnInit(): void {
    // Get ipAddress
    this.commService.getIPAddress().subscribe((result: any) => {
      this.ipAddress = result.ip;
    });
  }

  async onSubmit(frm: FormGroup) {
    this.submitted = true;
    if (frm.invalid) {
      return;
    }

    this.loading = true;

    this.notemessage.blockUi();

    this.loginForm.value.client_ip = this.ipAddress;
    this.authService.login(this.loginForm.value as userLogin)
      .pipe(first())
      .subscribe({
        next: () => {
          this.notemessage.successBubble('登入成功');
          this.fetchSys1000Data();
          // get return url from query parameters or default to home page
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
          this.router.navigateByUrl(returnUrl);
        },
        error: error => {
          console.log('登入失敗');
          this.notemessage.errorBubble('登入失敗');
          this.loading = false;
        }
      });
    this.notemessage.unblockUi();
  }

  // 將 SYS1000 讀取邏輯封裝到一個方法內
  fetchSys1000Data() {
    this.sys1000Service.getData().subscribe({
      next: response => {
        // 將轉換後的數據存入 localStorage
        sessionStorage.setItem('SYSTEMSetting', JSON.stringify(response));
        console.log('SYS1000 response data saved successfully');
      },
      error: error => {
        console.error('Failed to load SYS1000 data', error);
        // 處理 SYS1000 錯誤
      }
    });
  }
}
