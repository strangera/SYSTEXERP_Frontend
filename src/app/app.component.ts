import { Component, inject, OnInit } from '@angular/core';
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
  template: `<router-outlet></router-outlet>
    <app-notification-message></app-notification-message>
    <app-debug-sql-display></app-debug-sql-display>`,
  standalone: true,
  imports: [RouterOutlet, NotificationMessageComponent, ConfirmDialogModule, DebugSqlDisplayComponent],
})
export class AppComponent implements OnInit {
  private readonly primengConfig = inject(PrimeNGConfig);
  private readonly translate = inject(TranslateService);
  private readonly appInitService = inject(AppInitializationService);
  constructor() {
    this.translate.setDefaultLang('zh-tw');
    this.translate.use('zh-tw');
    this.appInitService.initialize();
  }
  ngOnInit(): void {
    this.primengConfig.ripple = true;
    this.primengConfig.setTranslation(PRIMENG_ZH_TW);
  }
}
