import { Component, DestroyRef, computed, inject, model, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonComponent } from '@shared/components/button/button.component';
import { NotificationService } from '@shared/components/notification-message/notification.service';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { Observable, finalize } from 'rxjs';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { IPreviewImportSysbc00, Sysbc00Service } from '../../../../service/api/sys/sysbc00.service';

@Component({
  selector: 'app-sysbc00-import-dialog',
  templateUrl: './sysbc00-import-dialog.component.html',
  standalone: true,
  imports: [DialogModule, TableModule, TabViewModule, ButtonComponent],
})
export class Sysbc00ImportDialogComponent {
  private readonly service = inject(Sysbc00Service);
  private readonly messageService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  visible = model(false);
  imported = output<void>();
  selectedFile = signal<File | null>(null);
  loading = signal(false);
  preview = signal<IPreviewImportSysbc00 | null>(null);
  result = signal<IPreviewImportSysbc00 | null>(null);
  errorMessage = signal<string | null>(null);
  bankFilter = signal('');

  filteredBranches = computed(() => {
    const branches = this.preview()?.Branches ?? [];
    const bank = this.bankFilter().trim();
    return bank ? branches.filter(b => b.BNK_No === bank) : branches;
  });

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile.set(input.files?.[0] ?? null);
    this.resetOutput();
  }

  onBankFilterInput(event: Event): void {
    this.bankFilter.set((event.target as HTMLInputElement).value);
  }

  onPreview(): void {
    const file = this.selectedFile();
    if (!file) {
      this.messageService.warnBubble('請先選擇要上傳的檔案。');
      return;
    }
    this.resetOutput();
    this.run(this.service.previewImportSYSBC00(file), data => this.preview.set(data));
  }

  onConfirm(): void {
    const file = this.selectedFile();
    if (!file || !this.preview()) return;
    this.messageService.confirm({
      header: '確認匯入',
      message: '確定要將預覽內容寫入銀行基本資料嗎？寫入後無法一鍵復原。',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.errorMessage.set(null);
        this.run(this.service.confirmImportSYSBC00(file), data => {
          this.messageService.successBubble(
            `匯入完成：新增銀行 ${data.BankNew}、新增分行 ${data.BranchNew}、更新分行 ${data.BranchUpdate}`);
          this.result.set(data);
          this.preview.set(null);
          this.imported.emit();
        });
      },
    });
  }

  onHide(): void {
    this.selectedFile.set(null);
    this.resetOutput();
  }

  private resetOutput(): void {
    this.preview.set(null);
    this.result.set(null);
    this.errorMessage.set(null);
    this.bankFilter.set('');
  }

  private run(request$: Observable<ApiResponse<IPreviewImportSysbc00>>, onSuccess: (data: IPreviewImportSysbc00) => void): void {
    this.loading.set(true);
    request$.pipe(
      finalize(() => this.loading.set(false)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(res => {
      const data = res.Data;
      if (!data?.Success) {
        this.errorMessage.set(data?.Message || '處理失敗');
        return;
      }
      onSuccess(data);
    });
  }
}
