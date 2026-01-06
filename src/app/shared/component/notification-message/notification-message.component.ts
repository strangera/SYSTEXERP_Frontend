import { NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ConfirmationService, MessageService, PrimeTemplate } from 'primeng/api';
import { Button, ButtonDirective } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmOptions, NotificationService } from './notification.service';

@UntilDestroy()
@Component({
  selector: 'app-notification-message',
  templateUrl: './notification-message.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ConfirmDialogModule, PrimeTemplate, NgIf, Button, ToastModule, DialogModule, ButtonDirective, NgFor, NgTemplateOutlet],
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
        reject: () => { }
      });
    });

    this.notificationService.blockUiMsg$.pipe(untilDestroyed(this)).subscribe((blocked) => {
      this.blockedDocument = blocked;
    });

    this.notificationService.blockUiMsg$.pipe(untilDestroyed(this)).subscribe(() => {
      this.blockedDocument = false;
    });

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
}
