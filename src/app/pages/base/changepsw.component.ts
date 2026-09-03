import { Component } from '@angular/core';
import { ChangePasswordComponent } from '../../shared/biz-components/change-password/change-password.component';

@Component({
  selector: 'app-changepsw',
  template: `
  <div class="card">
    <div class="flex align-items-center justify-content-between mb-4 pb-2 border-bottom-1 surface-border">
      <div class="flex align-items-center gap-2">
        <i class="pi pi-shield text-primary text-3xl"></i>
        <div class="flex flex-column">
          <span class="text-xl font-bold text-900">修改使用者密碼</span>
          <span class="text-sm text-500 font-mono">Change User Password</span>
        </div>
      </div>
    </div>
    <div class="sm:px-4 md:px-6 lg:px-8">
      <app-change-password [showUserInfo]="true" submitLabel="確認修改"></app-change-password>
    </div>
  </div>
  `,
  standalone: true,
  imports: [ChangePasswordComponent],
})
export class ChangepswComponent { }
