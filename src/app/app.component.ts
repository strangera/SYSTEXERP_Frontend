import { Component, HostListener, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { PrimeNGConfig } from 'primeng/api';
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { PRIMENG_ZH_TW } from './core/config/primeng-i18n.config';
import { CurrentPageService } from './core/layout/app.menulist/current-page.service';
import { DebugSqlDisplayComponent } from './core/layout/debug-sql-display/debug-sql-display.component';
import { SystemDataService } from './service/system/system-data.service';
import { AppInitializationService } from './core/services/app.initialization.service';
import { NotificationMessageComponent } from './shared/component/notification-message/notification-message.component';
import { OperationLogService } from './shared/service/operation-log.service';

const NON_BUSINESS_CLICK_EXCLUDE_SELECTOR = [
  'app-topbar',
  'app-menulist',
  '.layout-topbar',
  'p-paginator',
  '.p-accordion-header',
  '.p-panel-header',
  '.p-checkbox',
  '.p-radiobutton',
  '.p-dropdown-trigger',
  '.p-multiselect-trigger',
  '.p-calendar button.p-datepicker-trigger',
].join(', ');

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
  private readonly operationLogService = inject(OperationLogService);
  private readonly currentPageService = inject(CurrentPageService);
  private readonly systemDataService = inject(SystemDataService);
  constructor() {
    this.translate.setDefaultLang('zh-tw');
    this.translate.use('zh-tw');
    this.appInitService.initialize();
  }
  ngOnInit(): void {
    this.primengConfig.ripple = true;
    this.primengConfig.setTranslation(PRIMENG_ZH_TW);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    const el = target.closest('button, p-button, a.p-menuitem-link');
    if (!el) return;

    if (el.closest('app-button')) return;
    if (el.closest(NON_BUSINESS_CLICK_EXCLUDE_SELECTOR)) return;

    const progNo = this.currentPageService.getCurrentProgNo();
    if (!progNo) return;
    if (!this.systemDataService.getUserPermissions(progNo)) return;

    const label = (
      el.getAttribute('aria-label') ||
      el.getAttribute('title') ||
      el.textContent ||
      ''
    ).replace(/\s+/g, ' ').trim();
    if (!label) return;

    this.operationLogService.logButtonClick(label);
  }
}
