import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationService } from '@shared/component/notification-message/notification.service';
import { FunsrightInfo } from '@shared/models/system/funsrightInfo';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

@Component({
  selector: 'app-topbar-search',
  template: `
    <form [formGroup]="queryForm" (ngSubmit)="onSubmit(queryForm);" class="mx-2 w-full lg:w-auto">
      <p-iconField iconPosition="right" class="h-full w-full" styleClass="h-full">
        <p-autoComplete formControlName="query_data" [suggestions]="filteredProgs()" emptyMessage="查無此快速碼"
          (completeMethod)="filterProgNo($event)" optionLabel="label" placeholder="搜尋選單的名稱編號"
          styleClass="h-2.5rem lg:h-2rem w-full" inputStyleClass="text-base"
          (keydown.enter)="onSubmit(queryForm)" (onSelect)="onSubmit(queryForm)" />
        <!-- 這裡的 (click) 在 AutoComplete 的 InputIcon 上，不需要額外 A11Y 修正，因為 form 響應 enter -->
        <p-inputIcon styleClass="pi pi-search" (click)="onSubmit(queryForm)" />
      </p-iconField>
    </form>
  `,
  standalone: true,
  imports: [
    FormsModule, ReactiveFormsModule, IconFieldModule, AutoCompleteModule, InputIconModule
  ]
})
export class AppTopbarSearchComponent {
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  private readonly messageService = inject(NotificationService);

  public readonly queryForm = this.formBuilder.nonNullable.group({ query_data: [''] });
  public readonly filteredProgs = signal<{ label: string; value: FunsrightInfo }[]>([]);

  // ⚠️ 接收父元件傳入的、已添加 label 屬性的功能清單
  @Input({ required: true }) funRightsWithLabel: FunsrightInfo[] = [];

  @Output() navigateSuccess = new EventEmitter<void>(); // 導航成功後通知父組件

  filterProgNo(event: AutoCompleteCompleteEvent) {
    const query = event.query ? event.query.toLowerCase().replace(/\s+/g, '') : '';
    const funRights = this.funRightsWithLabel;

    if (!funRights.length || !query) {
      this.filteredProgs.set([]);
      return;
    }

    const filtered = funRights
      .filter(f => {
        if (f.prog_ispage !== 'Y') return false;

        // 2. 處理待比對的欄位，同樣移除所有空格並轉小寫
        const targetLabel = (f.label || '').toLowerCase().replace(/\s+/g, '');
        const targetNo = (f.prog_No || '').toLowerCase().replace(/\s+/g, '');
        const targetId = (f.prog_id || '').toLowerCase().replace(/\s+/g, '');
        const targetName = (f.prog_name || '').toLowerCase().replace(/\s+/g, '');

        return (
          targetLabel.includes(query) ||
          targetNo.includes(query) ||
          targetId.includes(query) ||
          targetName.includes(query)
        );
      })
      .map(f => ({ label: f.label!, value: f }));

    this.filteredProgs.set(filtered);
  }

  onSubmit(frm: FormGroup) {
    const query = frm.controls["query_data"].value;
    if (!query) { return; }

    let matchedItem: FunsrightInfo | undefined;
    // ⚠️ 使用 Input 接收的資料
    const funRights = this.funRightsWithLabel;

    // 搜尋邏輯
    if (typeof query === 'string') {
      const lowerCaseQuery = query.toLowerCase();
      // 搜尋條件改為涵蓋 prog_id, prog_name, prog_No 或完整的 label
      matchedItem = funRights.find(item =>
        (item.prog_id?.toLowerCase() === lowerCaseQuery ||
          item.prog_name?.toLowerCase().includes(lowerCaseQuery) ||
          item.prog_No?.toLowerCase() === lowerCaseQuery ||
          item.label?.toLowerCase().includes(lowerCaseQuery)
        ) &&
        item.prog_ispage === 'Y'
      );
    } else if (typeof query === 'object' && query !== null && 'value' in query) {
      // AutoComplete 選中時，query 是物件
      matchedItem = (query as { value: FunsrightInfo }).value;
    }

    if (matchedItem) {
      this.router.navigate([`/account/${matchedItem.prog_No.slice(0, 3).toLowerCase()}/${matchedItem.prog_No.toLowerCase()}`]);
      this.queryForm.reset();
      this.navigateSuccess.emit(); // 成功導航後發射事件
    } else {
      this.messageService.warnBubble('輸入的代碼不存在，或您目前無權限存取對應頁面。', '查無此快速碼');
    }
  }
}
