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
import { SuccessInterceptor } from './interceptors/successinterceptor.service';
import { DateToISOStringInterceptor } from './interceptors/dateToISOStringInterceptor.interceptor';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
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
    })
  ],
  providers: [
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
    {
      provide: HTTP_INTERCEPTORS,
      useClass: SuccessInterceptor,        // 最後處理錯誤
      multi: true
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
