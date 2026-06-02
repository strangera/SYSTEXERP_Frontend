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
        level: environment.production ? NgxLoggerLevel.OFF : NgxLoggerLevel.TRACE, // 設定log等級
        serverLogLevel: NgxLoggerLevel.ERROR, // 設定伺服器log等級
        // serverLoggingUrl: `${environment.ApiUrl}/log`, // 設定伺服器接收log的API
        // enableSourceMaps: !environment.production,
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
