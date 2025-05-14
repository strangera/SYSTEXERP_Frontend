import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// component
import { AppComponent } from './app.component';
// routing
import { AppRoutingModule } from './app-routing.module';
// shared
import { SharedModule } from './shared/shared.module';
// HttpInterceptor
import { HTTP_INTERCEPTORS, HttpClientModule, } from '@angular/common/http';
// Service
import { AuthinterceptorService } from './interceptors/authinterceptor.service';
import { CustomheaderinterceptorService } from './interceptors/customheaderinterceptor.service';
import { ErrorinterceptorService } from './interceptors/errorinterceptor.service';
import { ConfirmationService, MessageService, PrimeNGConfig } from 'primeng/api';
import { NotificationService } from './shared/component/notification-message/notification.service';
import { NotificationMessageComponent } from './shared/component/notification-message/notification-message.component';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}


// https://stackoverflow.com/questions/45975675/lazy-loading-browsermodule-has-already-been-loaded
// Import BrowserModule, BrowserAnimationsModule, HttpModule or HttpClientModule only once, preferably in your root module.
@NgModule({
  declarations: [
    // 组件
    AppComponent,
    NotificationMessageComponent
  ],
  imports: [
    // 模块
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    SharedModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [
    // 依賴注入
    NotificationService,
    MessageService,
    ConfirmationService,
    PrimeNGConfig,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthinterceptorService,
      multi: true
    }, {
      provide: HTTP_INTERCEPTORS,
      useClass: CustomheaderinterceptorService,
      multi: true
    }, {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorinterceptorService,
      multi: true
    },
  ],
  bootstrap: [
    AppComponent
  ],
})
export class AppModule { }
