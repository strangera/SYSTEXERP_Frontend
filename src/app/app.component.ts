import { Component, OnInit, } from '@angular/core';
import { AuthService } from './service/system/auth.service';
import { InactivityService } from './shared/service/inactivity.service';
import { PrimeNGConfig } from 'primeng/api';
import { userLogin } from './models/system/userLogin';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  // title = 'TSRDERP_Frontend';

  constructor(
    // private inactivityService: InactivityService, // Auto logout: Lyndon 20240923 close
    private authService: AuthService, // Check Login
    private primengConfig: PrimeNGConfig,
    private translate: TranslateService,
  ) {
    // https://www.alchemysoftware.com/livedocs/ezscript/Topics/Catalyst/Language.htm
    // Set default language (Language Codes)
    this.translate.setDefaultLang('zh-tw');
    // Optionally use a specific language
    this.translate.use('zh-tw');
  }

  ngOnInit(): void {
    // 啟用漣漪效果
    this.primengConfig.ripple = true;

    // 2024/7/11 Auto Login
    // this.autoLogin();


    // InactivityService will start monitoring user activity automatically
    /**
    if (!this.authService.isAuthenticated()) {
      console.log('A3');
      this.router.navigate(['/account/login']);
    }*/
  }

  autoLogin(): void {
    // Login
    // ----------------------------------------------------------------
    let jsonString = '{"account_id": "df", "account_psw": "df", "client_ip": "118.163.123.85"}';
    let accountData = JSON.parse(jsonString);
    this.authService.login(accountData as userLogin).subscribe(
      response => {
        console.log('Login successful', response);
      },
      error => {
        console.error('Login failed', error);
        // Handle login error
      }
    );
  }
}
