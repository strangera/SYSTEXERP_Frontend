/// <reference types="@angular/localize" />
import { DatePipe } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { bootstrapApplication, BrowserModule } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, UrlSerializer } from '@angular/router';
import { JwtModule } from '@auth0/angular-jwt';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { ConfirmationService, MessageService, PrimeNGConfig } from 'primeng/api';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routing';
import { AuthinterceptorService } from './app/core/interceptors/authinterceptor.service';
import { CustomheaderinterceptorService } from './app/core/interceptors/customheaderinterceptor.service';
import { DateToISOStringInterceptor } from './app/core/interceptors/dateToISOStringInterceptor.interceptor';
import { ErrorinterceptorService } from './app/core/interceptors/errorinterceptor.service';
import { LowerCaseUrlSerializer } from './app/core/utils/LowerCaseUrlSerializer';
import { environment } from './environments/environment';
import { QueryCacheInterceptorService } from './app/core/interceptors/querycacheinterceptor.service';

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

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(BrowserModule,
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
    provideRouter(routes), // 提供路由模組
    provideHttpClient(withInterceptorsFromDi()), // 啟用 HttpClient 並讓其支援 DI 提供的攔截器
    MessageService,
    ConfirmationService,
    PrimeNGConfig,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CustomheaderinterceptorService, // 添加自定義頭部
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthinterceptorService, // 再處理認證
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: DateToISOStringInterceptor, // 序列化日期
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorinterceptorService, // 處理錯誤
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: QueryCacheInterceptorService, // 查詢快取攔截器
      multi: true
    },
    { provide: UrlSerializer, useClass: LowerCaseUrlSerializer },
    DatePipe,
    provideAnimations(),
  ]
})
  .catch((err) => console.error(err));
