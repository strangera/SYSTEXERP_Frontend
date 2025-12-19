import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { PrimeNGConfig } from 'primeng/api';
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { AppInitializationService } from './app.initialization.service';
import { PRIMENG_ZH_TW } from './core/config/primeng-i18n.config';
import { DebugSqlDisplayComponent } from './core/layout/debug-sql-display/debug-sql-display.component';
import { NotificationMessageComponent } from './shared/component/notification-message/notification-message.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [RouterOutlet, NotificationMessageComponent, ConfirmDialogModule, DebugSqlDisplayComponent],
})
export class AppComponent implements OnInit {
  constructor(
    private readonly primengConfig: PrimeNGConfig,
    private readonly translate: TranslateService,
    private readonly appInitService: AppInitializationService
  ) {
    this.translate.setDefaultLang('zh-tw');
    this.translate.use('zh-tw');
    this.appInitService.initialize();
  }
  ngOnInit(): void {
    this.primengConfig.ripple = true;
    this.primengConfig.setTranslation(PRIMENG_ZH_TW);
  }
}
