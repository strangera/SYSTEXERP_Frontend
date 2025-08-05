import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
interface Message {
  severity: 'info' | 'success' | 'warn' | 'error';
  summary: string;
  detail: string;
}
interface ConfirmOptions {
  header?: string;
  message?: string;
  accept?: () => void;
  reject?: () => void;
  type?: 'confirm' | 'update' | 'delete'; // 添加类型
  showIcon?: boolean; // 新增是否顯示圖示的屬性
  extraButtons?: {
    label: string;
    action: () => void;
    severity?: string; // optional, like 'info', 'secondary'
  }[];
}
interface InputBoxOptions {
  header: string;
  message?: string;
  ok?: (value: string) => void;
  cancel?: () => void;
}
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private bubbleMsgSource = new BehaviorSubject<Message | null>(null);
  bubbleMsg$ = this.bubbleMsgSource.asObservable();
  private boxMsgSource = new Subject<{ header?: string; message: string }>();
  boxMsg$ = this.boxMsgSource.asObservable();
  private blockUiSource = new BehaviorSubject<boolean>(false);
  blockUiMsg$ = this.blockUiSource.asObservable();
  private confirmMsgSource = new Subject<ConfirmOptions>();
  confirmMsg$ = this.confirmMsgSource.asObservable();
  private inputBoxSource = new Subject<InputBoxOptions>();
  inputBoxMsg$ = this.inputBoxSource.asObservable();
  blockUi() { this.blockUiSource.next(true); }
  unblockUi() { this.blockUiSource.next(false); }
  confirm(opts: ConfirmOptions) { this.confirmMsgSource.next(opts); }
  showInputBox(options: InputBoxOptions) { this.inputBoxSource.next(options); }
  infoBox(message: string) { this.sendMessageBox('Information', message); }
  successBox(message: string) { this.sendMessageBox('Success', message); }
  warnBox(message: string) { this.sendMessageBox('Warning', message); }
  errorBox(message: string) { this.sendMessageBox('Error', message); }
  private sendMessageBox(header: string, message: string) { this.messageBox({ header, message }); }
  messageBox(options: { header?: string; message: string }) { this.boxMsgSource.next(options); }

  infoBubble(message: string, title = '資訊') {
    this.sendBubbleMessage('info', title, message);
  }
  successBubble(message: string, title = '成功') {
    this.sendBubbleMessage('success', title, message);
  }
  warnBubble(message: string, title = '警告') {
    this.sendBubbleMessage('warn', title, message);
  }
  errorBubble(message: string, title = '失敗') {
    this.sendBubbleMessage('error', title, message || '發生不明錯誤');
  }
  private sendBubbleMessage(severity: Message['severity'], summary: string, detail: string) {
    const formattedDetail = detail ? detail
      .replace(/\/r\/n/g, '<br>')
      .replace(/\/r/g, '<br>')
      .replace(/\/n/g, '<br>')
      .replace(/\\r\\n/g, '<br>')
      .replace(/\\r/g, '<br>')
      .replace(/\\n/g, '<br>') : '';
    this.bubbleMsgSource.next({ severity, summary, detail: formattedDetail });
  }

}
