import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// component
import { AppComponent } from './app.component';
// routing
import { AppRoutingModule } from './app-routing.module';
// HttpInterceptor
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi, } from '@angular/common/http';
// Service
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

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}


// https://stackoverflow.com/questions/45975675/lazy-loading-browsermodule-has-already-been-loaded
// Import BrowserModule, BrowserAnimationsModule, HttpModule or HttpClientModule only once, preferably in your root module.
@NgModule({
  declarations: [
    AppComponent,
    NotificationMessageComponent,
  ],
  imports: [
    ConfirmDialogModule,
    ToastModule,
    DialogModule,
    // 模块
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
      useClass: ErrorinterceptorService,        // 最後處理錯誤
      multi: true
    },
  ],
  bootstrap: [
    AppComponent
  ],
})
export class AppModule { }
