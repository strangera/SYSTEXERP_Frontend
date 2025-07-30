/// <reference types="@angular/localize" />
import { routes } from './app/app.routing';
import { bootstrapApplication, BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { MessageService, ConfirmationService, PrimeNGConfig } from 'primeng/api';
import { CustomheaderinterceptorService } from './app/interceptors/customheaderinterceptor.service';
import { AuthinterceptorService } from './app/interceptors/authinterceptor.service';
import { DateToISOStringInterceptor } from './app/interceptors/dateToISOStringInterceptor.interceptor';
import { ErrorinterceptorService } from './app/interceptors/errorinterceptor.service';
import { UrlSerializer, provideRouter } from '@angular/router';
import { LowerCaseUrlSerializer } from './app/utils/LowerCaseUrlSerializer';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { provideAnimations } from '@angular/platform-browser/animations';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { JwtModule } from '@auth0/angular-jwt';
import { environment } from './environments/environment';
import { AppComponent } from './app/app.component';
import { importProvidersFrom } from '@angular/core';
import { QueryCacheInterceptorService } from '@interceptors/querycacheinterceptor.service';

const currentUser = localStorage.getItem('UserInfo');

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
    importProvidersFrom(ConfirmDialogModule, ToastModule, DialogModule, BrowserModule, TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }), JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
        allowedDomains: [`${environment.ApiUrl}`], // 你的後端 API 網域
        disallowedRoutes: [`${environment.ApiUrl}/login`], // 登入 API 不需要帶 Token
      }
    })),
    provideRouter(routes), // 提供路由模組
    provideHttpClient(withInterceptorsFromDi()), // 啟用 HttpClient 並讓其支援 DI 提供的攔截器
    MessageService,
    ConfirmationService,
    PrimeNGConfig,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CustomheaderinterceptorService, // 先添加自定義頭部
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthinterceptorService, // 再處理認證
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: DateToISOStringInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorinterceptorService, // 最後處理錯誤
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: QueryCacheInterceptorService, // 查詢快取攔截器
      multi: true
    },
    { provide: UrlSerializer, useClass: LowerCaseUrlSerializer },
    provideAnimations(),
  ]
})
  .catch((err) => console.error(err));
