import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi, } from '@angular/common/http';
import { AuthinterceptorService } from './interceptors/authinterceptor.service';
import { CustomheaderinterceptorService } from './interceptors/customheaderinterceptor.service';
import { ErrorinterceptorService } from './interceptors/errorinterceptor.service';
import { ConfirmationService, MessageService, PrimeNGConfig } from 'primeng/api';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { NotificationMessageComponent } from './shared/component/notification-message/notification-message.component';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
// import { SuccessInterceptor } from './interceptors/successinterceptor.service';
import { DateToISOStringInterceptor } from './interceptors/dateToISOStringInterceptor.interceptor';
import { JwtModule } from '@auth0/angular-jwt';
import { environment } from '../environments/environment';
import { UrlSerializer } from '@angular/router';
import { LowerCaseUrlSerializer } from './utils/LowerCaseUrlSerializer';

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

@NgModule({
  declarations: [
    AppComponent,
    NotificationMessageComponent,
  ],
  imports: [
    ConfirmDialogModule,
    ToastModule,
    DialogModule,
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    JwtModule.forRoot({ // 配置 JwtModule，用於 AuthService 中的 isTokenExpired
      config: {
        tokenGetter: tokenGetter,
        allowedDomains: [`${environment.ApiUrl}`], // 你的後端 API 網域
        disallowedRoutes: [`${environment.ApiUrl}/login`], // 登入 API 不需要帶 Token
      }
    })
  ],
  providers: [
    provideHttpClient(withInterceptorsFromDi()), // 啟用 HttpClient 並讓其支援 DI 提供的攔截器
    MessageService,
    ConfirmationService,
    PrimeNGConfig,
    { provide: UrlSerializer, useClass: LowerCaseUrlSerializer },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CustomheaderinterceptorService, // 先添加自定義頭部
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthinterceptorService,         // 再處理認證
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: DateToISOStringInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorinterceptorService,        // 最後處理錯誤
      multi: true
    },
    // {
    //   provide: HTTP_INTERCEPTORS,
    //   useClass: SuccessInterceptor,        // 最後處理錯誤
    //   multi: true
    // },
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
