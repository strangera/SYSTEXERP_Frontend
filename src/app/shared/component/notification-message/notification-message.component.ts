import { Component } from '@angular/core';
import { NotificationService } from './notification.service';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-notification-message',
  templateUrl: './notification-message.component.html',
  styleUrl: './notification-message.component.scss'
})
export class NotificationMessageComponent {
  msgBoxHeader: string = '';
  msgBoxMessage: string = '';
  msgBoxDisplay: boolean = false;
  blockedDocument: boolean = false;
  inputBoxDisplay: boolean = false;
  inputBoxHeader: string = '';
  inputBoxMessage: string = '';
  inputBoxInputText: string = '';
  inputBoxOK?: (value: string) => void;
  inputBoxCancel?: () => void;
  // ----------------------------------------------------------------
  constructor(
    private notificationService: NotificationService,
    private messageService: MessageService,
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
}
