import { NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FileExportService } from '@shared/service/file-export.service';
import { ConfirmationService, MessageService, PrimeTemplate } from 'primeng/api';
import { Button, ButtonDirective } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';
import { environment } from 'src/environments/environment';
import { ConfirmOptions, NotificationService } from './notification.service';

@UntilDestroy()
@Component({
  selector: 'app-notification-message',
  templateUrl: './notification-message.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProgressBarModule, ConfirmDialogModule, PrimeTemplate, NgIf, Button, ToastModule, DialogModule, ButtonDirective, NgFor, NgTemplateOutlet],
})
export class NotificationMessageComponent implements OnInit {
  currentConfirmOpts?: ConfirmOptions;
  msgBoxHeader = '';
  msgBoxMessage = '';
  msgBoxDisplay = false;
  blockedDocument = false;
  inputBoxDisplay = false;
  inputBoxHeader = '';
  inputBoxMessage = '';
  inputBoxInputText = '';
  inputBoxOK?: (value: string) => void;
  inputBoxCancel?: () => void;
  showIcon = false; // 新增 showIcon 屬性，預設為 false
  extraButtons: { label: string; action: () => void; severity?: "success" | "info" | "warning" | "danger" | "help" | "primary" | "secondary" | "contrast" | null | undefined }[] = [];
  // ----------------------------------------------------------------
  constructor(
    private notificationService: NotificationService,
    public messageService: MessageService,
    private confirmationService: ConfirmationService,
    private fileExportService: FileExportService
  ) { }

  ngOnInit() {
    this.notificationService.bubbleMsg$.pipe(untilDestroyed(this)).subscribe((message) => {
      if (message) {
        this.messageService.add(message);
      } else {
        // 當收到的訊息是 null 時，執行清除動作
        this.messageService.clear();
      }
    });

    this.notificationService.boxMsg$.pipe(untilDestroyed(this)).subscribe((opts) => {
      this.msgBoxHeader = opts.header || 'Alert';
      this.msgBoxMessage = opts.message;
      this.msgBoxDisplay = true;
    });

    this.notificationService.confirmMsg$.pipe(untilDestroyed(this)).subscribe((opts) => {
      this.showIcon = opts.showIcon === true;
      this.extraButtons = opts.extraButtons || [];
      this.currentConfirmOpts = opts;

      this.confirmationService.confirm({
        header: opts.header,
        message: opts.message,
        icon: opts.icon,
        acceptLabel: opts.acceptLabel || '確定', // 傳遞 Label 並設定預設值
        rejectLabel: opts.rejectLabel || '取消', // 傳遞 Label 並設定預設值
        // 【重要】這裡不要寫任何邏輯，避免與 HTML 的按鈕點擊重複執行
        accept: () => { },
        reject: () => {
          if (opts.reject) {
            opts.reject();
          }
        }
      });
    });

    this.notificationService.blockUiMsg$.pipe(untilDestroyed(this)).subscribe((blocked) => {
      this.blockedDocument = blocked;
    });

    // this.notificationService.blockUiMsg$.pipe(untilDestroyed(this)).subscribe(() => {
    //   this.blockedDocument = false;
    // });

    this.notificationService.inputBoxMsg$.pipe(untilDestroyed(this)).subscribe((opts) => {
      this.inputBoxDisplay = true;
      this.inputBoxHeader = opts.header;
      this.inputBoxMessage = opts.message || '';
      this.inputBoxInputText = '';
      this.inputBoxOK = opts.ok;
      this.inputBoxCancel = opts.cancel;
    });
  }
  // ----------------------------------------------------------------
  hideAndCleanMsgBox() {
    this.msgBoxDisplay = false;
    this.msgBoxHeader = '';
    this.msgBoxMessage = '';
  }

  onClickInputBoxCancel() {
    if (this.inputBoxCancel) {
      this.inputBoxCancel();
    }
    this.inputBoxDisplay = false;
    this.cleanInputBox();
  }

  onClickInputBoxOK() {
    if (this.inputBoxOK) {
      this.inputBoxOK(this.inputBoxInputText);
    }
    this.inputBoxDisplay = false;
    this.cleanInputBox();
  }

  cleanInputBox() {
    this.inputBoxHeader = '';
    this.inputBoxMessage = '';
    this.inputBoxInputText = '';
    this.inputBoxOK = undefined;
    this.inputBoxCancel = undefined;
  }

  getIcon(severity: string): string {
    switch (severity) {
      case 'success':
        return 'pi-check-circle';
      case 'info':
        return 'pi-info-circle';
      case 'warn':
        return 'pi-exclamation-triangle';
      case 'error':
        return 'pi-times-circle';
      default:
        return 'pi-bell';
    }
  }

  getSeverity(severity: string): "success" | "info" | "warning" | "danger" | "help" | "primary" | "secondary" | "contrast" | null | undefined {
    switch (severity) {
      case 'success':
        return 'success';
      case 'info':
        return 'info';
      case 'warn':
        return 'warning';
      case 'error':
        return 'danger';
      default:
        return 'info';
    }
  }

  onExtraButtonClick(btn: { label: string; action: () => void }) {
    btn.action();
    this.confirmationService.close();
  }

  onConfirmAccept(cd: any) {
    // 1. 取得資料：確保你的 templateContext 結構正確
    // 注意：這裡直接抓 currentConfirmOpts 存下來的 context
    const resultData = this.currentConfirmOpts?.templateContext ?? null;

    // 2. 執行回調
    if (this.currentConfirmOpts?.accept) {
      this.currentConfirmOpts.accept(resultData);
    }

    // 3. 關閉視窗 (直接呼叫 service 的 close，不要呼叫 cd.accept())
    this.confirmationService.close();
  }

  // 2. 增加這兩個給 HTML 呼叫的方法(給標籤檔使用)
  onGlobalConfirmSave() {
    this.fileExportService.savePendingFile();
  }

  onGlobalClearPending() {
    this.fileExportService.clearPending();
  }

  /**
 * 取得錯誤檔並觸發下載
 * @param filePath 後端回傳的相對路徑
 */
  onDownloadErrorFile(filePath: string): void {
    if (!filePath) return;
    // 1. 組合完整的下載網址
    const fileUrl = `${environment.ApiUrl}/${filePath}`;
    // 2. 取得檔名（從路徑中切出最後一段）
    const fileName = filePath.split('/').pop() || 'ErrorData.xlsx';
    // 3. 建立隱藏的 <a> 標籤
    const link = document.createElement('a');
    link.href = fileUrl;
    // 4. 指定 download 屬性可以嘗試強制瀏覽器下載而非開啟
    // 注意：跨網域時 download 屬性可能失效，但搭配 _blank 仍能正常下載
    link.setAttribute('download', fileName);
    link.target = '_blank';
    link.style.display = 'none';
    // 5. 加入 DOM、觸發點擊後移除
    document.body.appendChild(link);
    link.click();
    // 延遲移除以確保某些瀏覽器能正確處理
    setTimeout(() => {
      document.body.removeChild(link);
    }, 100);
  }
}
