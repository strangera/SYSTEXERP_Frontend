import { Component, OnInit, } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  // title = 'TSRDERP_Frontend';

  constructor(
    // private inactivityService: InactivityService, // Auto logout: Lyndon 20240923 close
    private primengConfig: PrimeNGConfig,
    private translate: TranslateService,
  ) {
    // https://www.alchemysoftware.com/livedocs/ezscript/Topics/Catalyst/Language.htm
    this.translate.setDefaultLang('zh-tw');// Set default language (Language Codes)
    this.translate.use('zh-tw');// Optionally use a specific language
  }
  ngOnInit(): void {
    this.primengConfig.ripple = true;// 啟用漣漪效果
  }
}
