import { Component, ViewChild, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Button } from 'primeng/button';
import { OverlayPanel, OverlayPanelModule } from 'primeng/overlaypanel';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { NotificationService } from '@shared/component/notification-message/notification.service';
import { FunsrightInfo } from '@shared/models/system/funsrightInfo';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef } from '@angular/core';
import { NgIf } from '@angular/common';
import { FavoriteStoreService } from './favorite-store.service';

@Component({
  selector: 'app-topbar-favorites',
  template: `
    <button type="button"
      class="favorites p-link layout-topbar-button border-1 w-2rem h-2rem p-2 m-0 justify-content-center align-items-center"
      pTooltip="我的最愛" (click)="toggleFavoritesPanel($event)">
      <i class="pi pi-star-fill text-yellow-400"></i>
    </button>
    <p-overlayPanel #op styleClass="select-none w-30rem p-0">
      <div class="flex flex-column gap-1">
        <div class="flex justify-content-between align-items-center">
          <span class="text-xl font-semibold">我的最愛</span>
          <div *ngIf="favoriteStore.favorites().length">
            <p-button *ngIf="!favoriteStore.editingFavorites()" icon="pi pi-pencil" (click)="favoriteStore.toggleEditing()" severity="secondary"
              label="編輯" styleClass="p-button-text p-button-sm" />
            <p-button *ngIf="favoriteStore.editingFavorites()" icon="pi pi-times" (click)="favoriteStore.toggleEditing()" severity="secondary"
              label="關閉" styleClass="p-button-text p-button-sm" />
          </div>
        </div>

        <p-table [value]="favoriteStore.favorites()" 
                selectionMode="multiple" 
                [selection]="favoriteStore.selectedFavorites()"
                (selectionChange)="favoriteStore.updateSelected($event)"
                [reorderableColumns]="favoriteStore.editingFavorites()" 
                (onRowReorder)="onRowReorder()" 
                dataKey="prog_No" 
                [scrollable]="true"
                [scrollHeight]="'25rem'" 
                class="p-datatable-sm">
          <ng-template pTemplate="header">
            <tr>
              <th *ngIf="favoriteStore.editingFavorites()" class="w-4rem text-center">
                <p-tableHeaderCheckbox />
              </th>
              <th *ngIf="favoriteStore.editingFavorites()" class="w-5rem text-center">
                排序
              </th>
              <th class="text-left">功能名稱</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-item let-rowIndex="rowIndex">
            <tr [pSelectableRow]="item" [pSelectableRowIndex]="rowIndex" [pReorderableRow]="rowIndex">
              <td *ngIf="favoriteStore.editingFavorites()" class="text-center">
                <p-tableCheckbox [value]="item" class="pointer-events-none" />
              </td>
              <td *ngIf="favoriteStore.editingFavorites()" class="text-center">
                <span class="pi pi-bars" pReorderableRowHandle></span>
              </td>
              <!-- 修正：直接顯示 prog_id 和 prog_name 的組合，以確保內容不為空 -->
              <td class="p-2 cursor-pointer" (click)="onFavoriteItemClick(item)">
                {{ item.prog_id }} {{ item.prog_name }}
              </td>
            </tr>
          </ng-template>

          <ng-template pTemplate="emptymessage">
            <tr>
              <td [attr.colspan]="favoriteStore.editingFavorites() ? 3 : 1" class="p-3 text-center">
                尚未加入任何最愛，<br>請至功能頁加入
              </td>
            </tr>
          </ng-template>
        </p-table>

        <p-button *ngIf="favoriteStore.editingFavorites()" severity="danger" icon="pi pi-trash" label="刪除所選"
          styleClass="w-full p-button-sm" (click)="deleteSelectedFavorites()"
          [disabled]="!favoriteStore.selectedFavorites().length" />
      </div>
    </p-overlayPanel>
  `,
  standalone: true,
  imports: [
    Button, NgIf, OverlayPanelModule, TableModule, TooltipModule
  ],
})
export class AppTopbarFavoritesComponent {
  @ViewChild('op') favoriteOverlayPanel!: OverlayPanel;
  private readonly router = inject(Router);
  private readonly messageService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  // 注入 Store，所有狀態和動作都從這裡來
  public readonly favoriteStore = inject(FavoriteStoreService);

  toggleFavoritesPanel(event: Event) {
    if (this.favoriteOverlayPanel) {
      this.favoriteOverlayPanel.toggle(event);
      // 確保在 Panel 開啟時，編輯狀態是關閉的。
      this.favoriteStore.editingFavorites.set(false);
      this.favoriteStore.selectedFavorites.set([]);
    }
  }

  onFavoriteItemClick(item: FunsrightInfo) {
    if (!item || this.favoriteStore.editingFavorites()) return;

    // 由於我們修正了模板，這裡 item.prog_name 肯定有值
    if (item.prog_ispage === 'N') {
      this.messageService.warnBubble(`您目前無檢視「${item.prog_name}」的權限，請聯絡系統管理員開啟權限。`, '無法開啟畫面');
      return;
    }

    // 導航邏輯
    this.router.navigate([`/account/${item.prog_No.slice(0, 3).toLowerCase()}/${item.prog_No.toLowerCase()}`]);
    this.favoriteOverlayPanel.hide();
  }

  deleteSelectedFavorites() {
    this.favoriteStore.deleteSelectedFavorites().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => this.messageService.successBubble('已成功刪除選定的最愛。'),
      error: error => this.messageService.errorBubble('刪除最愛失敗', error.message)
    });
  }

  onRowReorder() {
    // 這裡的 favorites() 已經在 PrimeNG 的 onRowReorder 內部被重新排序了
    const newOrder = [...this.favoriteStore.favorites()];
    this.favoriteStore.updateFavoritesOrder(newOrder).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => this.messageService.successBubble('我的最愛排序已更新。'),
      error: error => this.messageService.errorBubble('更新排序失敗', error.message)
    });
  }
}
