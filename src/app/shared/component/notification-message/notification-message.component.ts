import { Component, OnInit } from '@angular/core';
import { NotificationService } from './notification.service';
import { ConfirmationService, MessageService, PrimeTemplate } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { NgIf } from '@angular/common';
import { Button, ButtonDirective } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-notification-message',
  templateUrl: './notification-message.component.html',
  styleUrl: './notification-message.component.scss',
  standalone: true,
  imports: [ConfirmDialogModule, PrimeTemplate, NgIf, Button, ToastModule, DialogModule, ButtonDirective]
})
export class NotificationMessageComponent implements OnInit {
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
  extraButtons: { label: string; action: () => void; severity?: string }[] = [];
  // ----------------------------------------------------------------
  constructor(
    private notificationService: NotificationService,
    public messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) { }

  ngOnInit() {
    this.notificationService.bubbleMsg$.subscribe((message) => {
      if (message) {
        this.messageService.add(message);
      }
    });

    this.notificationService.boxMsg$.subscribe((opts) => {
      this.msgBoxHeader = opts.header || 'Alert';
      this.msgBoxMessage = opts.message;
      this.msgBoxDisplay = true;
    });

    this.notificationService.confirmMsg$.subscribe((opts) => {
      this.showIcon = opts.showIcon === true; // 只有明確設定為 true 時才顯示圖示
      this.extraButtons = opts.extraButtons || [];
      this.confirmationService.confirm({
        header: opts.header,
        message: opts.message,
        accept: () => {
          this.confirmationService.close();
          if (opts.accept) {
            opts.accept();
          }
        },
        reject: () => {
          this.confirmationService.close();
          if (opts.reject) {
            opts.reject();
          }
        }
      });
    });

    this.notificationService.blockUiMsg$.subscribe((blocked) => {
      this.blockedDocument = blocked;
    });

    this.notificationService.blockUiMsg$.subscribe(() => {
      this.blockedDocument = false;
    });

    this.notificationService.inputBoxMsg$.subscribe((opts) => {
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
}
