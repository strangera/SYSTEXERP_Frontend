import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-notfound',
  template: `
    <div class="surface-ground flex align-items-center justify-content-center" style="min-height: calc(100vh - 70px);">
      <div class="flex flex-column align-items-center justify-content-center">
        <div class="p-1 border-round-3xl" style="background: linear-gradient(180deg, rgba(33, 150, 243, 0.4) 10%, rgba(33, 150, 243, 0) 30%);">

          <div class="w-full surface-card py-6 px-5 sm:px-6 flex flex-column align-items-center border-round-3xl shadow-1">
            <i class="pi pi-exclamation-triangle text-blue-500 text-5xl mb-3"></i>

            <span class="text-blue-500 font-bold text-3xl mb-1">404</span>

            <h1 class="text-900 font-bold text-3xl lg:text-5xl mb-2">找不到頁面</h1>

            <div class="text-600 mb-4 text-center">
              抱歉，您所請求的資源不存在或已被移除。
            </div>

            <p-button label="回首頁" icon="pi pi-home" (click)="goHome()" styleClass="p-button-outlined p-button-secondary"></p-button>
          </div>

        </div>
      </div>
    </div>
  `,
  standalone: true,
  imports: [ButtonModule],
})
export class NotfoundComponent {
  constructor(private readonly router: Router) { }

  goHome(): void {
    this.router.navigate(['/']);
  }
}
