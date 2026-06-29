/// <reference types="@angular/localize" />
import { DatePipe } from '@angular/common';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { ErrorHandler, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { PreloadAllModules, provideRouter, UrlSerializer, withPreloading } from '@angular/router';
import { JwtModule } from '@auth0/angular-jwt';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { ConfirmationService, MessageService, PrimeNGConfig } from 'primeng/api';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routing';
import { authInterceptor } from './app/core/interceptors/auth.interceptor';
import { customHeaderInterceptor } from './app/core/interceptors/custom-header.interceptor';
import { dateToISOStringInterceptor } from './app/core/interceptors/date-to-iso-string.interceptor';
import { debugHeaderInterceptor } from './app/core/interceptors/debug-header.interceptor';
import { errorInterceptor } from './app/core/interceptors/error.interceptor';
import { httpRequestInterceptor } from './app/core/interceptors/http-request.interceptor';
import { queryCacheInterceptor } from './app/core/interceptors/query-cache.interceptor';
import { GlobalErrorHandler } from './app/core/services/global-error-handler/global-error-handler';
import { LowerCaseUrlSerializer } from './app/core/utils/LowerCaseUrlSerializer';
import { environment } from './environments/environment';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export function tokenGetter() {
  const currentUser = localStorage.getItem('UserInfo');
  if (currentUser) {
    return JSON.parse(currentUser).AccessToken;
  }
  return null;
}

const primeNgProviders = [
  MessageService,
  ConfirmationService,
  PrimeNGConfig,
];

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(),
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
        }
      }),
      JwtModule.forRoot({
        config: {
          tokenGetter: tokenGetter,
          allowedDomains: [`${environment.ApiUrl}`], // 你的後端 API 網域
          disallowedRoutes: [`${environment.ApiUrl}/login`], // 登入 API 不需要帶 Token
        }
      }),
      LoggerModule.forRoot({
        // 【地雷 6】ngx-logger 僅作為「本地 console 記錄器」：開發環境輸出 TRACE、production 全關。
        // 伺服器端錯誤回報「不」走 ngx-logger，統一由 GlobalErrorHandler 手動 POST 至 ClientLog API，
        // 以便完整帶入 user_No / url 等 ERP 需要的欄位（單一來源，避免雙軌）。
        //
        // 移除原本的 serverLogLevel：它被設成 ERROR，但 serverLoggingUrl 是註解狀態，
        // 等於「設了等級卻沒有接收 URL」→ 設定形同虛設，且與 GlobalErrorHandler 重複，易誤導後人。
        level: environment.production ? NgxLoggerLevel.OFF : NgxLoggerLevel.TRACE, // 設定 log 等級
        timestampFormat: 'yyyy-MM-dd HH:mm:ss:SSS',
      }),
    ),
    provideRouter(
      routes,
      ...(environment.production ? [withPreloading(PreloadAllModules)] : [])
    ),
    provideHttpClient(withInterceptors([
      authInterceptor,
      customHeaderInterceptor,
      dateToISOStringInterceptor,
      debugHeaderInterceptor,
      errorInterceptor,
      httpRequestInterceptor,
      queryCacheInterceptor
    ])), // 啟用 HttpClient 並讓其支援 DI 提供的攔截器
    ...primeNgProviders,
    { provide: UrlSerializer, useClass: LowerCaseUrlSerializer },
    DatePipe,
    { provide: ErrorHandler, useClass: GlobalErrorHandler }
  ]
})
  .catch((err) => console.error(err));
