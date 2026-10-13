import { Component, DestroyRef, computed, inject, model, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonComponent } from '@shared/components/button/button.component';
import { Actions } from '@shared/service/permission-guard.service';
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
  source = signal<'file' | 'fsc' | null>(null);
  loadingFsc = computed(() => this.loading() && this.source() === 'fsc');
  fscPreviewId = signal<string | null>(null);
  readonly Actions = Actions;
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
    this.source.set('file');
    this.run(this.service.previewImportSYSBC00(file), data => this.preview.set(data));
  }

  onLoadFsc(): void {
    this.resetOutput();
    this.source.set('fsc');
    this.run(this.service.previewFscSYSBC00(), data => {
      this.preview.set(data);
      this.fscPreviewId.set(data.PreviewId);
    });
  }

  onConfirm(): void {
    const request$ = this.confirmRequest();
    if (!request$ || !this.preview()) return;
    this.messageService.confirm({
      header: '確認匯入',
      message: '確定要將預覽內容寫入銀行基本資料嗎？寫入後無法一鍵復原。',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.errorMessage.set(null);
        this.run(request$, data => {
          this.messageService.successBubble(
            `匯入完成：新增銀行 ${data.BankNew}、新增分行 ${data.BranchNew}、更新分行 ${data.BranchUpdate}`);
          this.result.set(data);
          this.preview.set(null);
          this.fscPreviewId.set(null);
          this.imported.emit();
        }, data => {
          if (data?.Expired) {
            this.preview.set(null);
            this.fscPreviewId.set(null);
          }
        });
      },
    });
  }

  onHide(): void {
    this.selectedFile.set(null);
    this.resetOutput();
  }

  private confirmRequest(): Observable<ApiResponse<IPreviewImportSysbc00>> | null {
    if (this.source() === 'fsc') {
      const previewId = this.fscPreviewId();
      return previewId ? this.service.confirmFscSYSBC00(previewId) : null;
    }
    const file = this.selectedFile();
    return file ? this.service.confirmImportSYSBC00(file) : null;
  }

  private resetOutput(): void {
    const stagedId = this.fscPreviewId();
    if (stagedId) {
      this.fscPreviewId.set(null);
      this.service.discardFscSYSBC00(stagedId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    }
    this.source.set(null);
    this.preview.set(null);
    this.result.set(null);
    this.errorMessage.set(null);
    this.bankFilter.set('');
  }

  private run(
    request$: Observable<ApiResponse<IPreviewImportSysbc00>>,
    onSuccess: (data: IPreviewImportSysbc00) => void,
    onFail?: (data: IPreviewImportSysbc00 | null) => void,
  ): void {
    this.loading.set(true);
    request$.pipe(
      finalize(() => this.loading.set(false)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(res => {
      const data = res.Data;
      if (!data?.Success) {
        this.errorMessage.set(data?.Message || '處理失敗');
        onFail?.(data ?? null);
        return;
      }
      onSuccess(data);
    });
  }
}
