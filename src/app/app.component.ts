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
    this.primengConfig.setTranslation({
      today: '今天',
      dayNames: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
      dayNamesShort: ['日', '一', '二', '三', '四', '五', '六'],
      dayNamesMin: ['日', '一', '二', '三', '四', '五', '六'],
      monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
      monthNamesShort: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      dateFormat: 'yy/mm/dd',
      weekHeader: '週',
    });
  }
}
