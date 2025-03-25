import { Injectable } from '@angular/core';
import { BehaviorSubject, debounceTime, distinctUntilChanged, Subject } from 'rxjs';

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
  blockUiMsg$ = this.blockUiSource.pipe(
    debounceTime(1000),
    distinctUntilChanged()
  );

  unblockUiSource = new BehaviorSubject<boolean>(false);
  unblockUiMsg$ = this.unblockUiSource.asObservable();

  confirmMsgSource = new Subject<ConfirmOptions>();
  confirmMsg$ = this.confirmMsgSource.asObservable();

  inputBoxSource = new Subject<InputBoxOptions>();
  inputBoxMsg$ = this.inputBoxSource.asObservable();
  // ------------------------
  constructor() {

  }
  // ------------------------
  blockUi() {
    this.blockUiSource.next(true);
  }

  unblockUi() {
    this.blockUiSource.next(false);
    this.unblockUiSource.next(true);
  }

  confirm(opts: ConfirmOptions) {
    this.confirmMsgSource.next(opts);
  }

  showInputBox(opts: InputBoxOptions) {
    this.inputBoxSource.next(opts);
  }

  messageBox(opts: { header?: string; message: string }) {
    this.boxMsgSource.next(opts);
  }

  infoBox(message: string) {
    this.messageBox({ header: 'Information', message });
  }

  successBox(message: string) {
    this.messageBox({ header: 'Success', message });
  }

  warnBox(message: string) {
    this.messageBox({ header: 'Warning', message });
  }

  errorBox(message: string) {
    this.messageBox({ header: 'Error', message });
  }

  infoBubble(message: string) {
    this.bubbleMsgSource.next({ severity: 'info', summary: 'Info', detail: message });
  }

  successBubble(message: string) {
    this.bubbleMsgSource.next({ severity: 'success', summary: 'Success', detail: message });
  }

  warnBubble(message: string) {
    this.bubbleMsgSource.next({ severity: 'warn', summary: 'Warn', detail: message });
  }

  errorBubble(message: string) {
    this.bubbleMsgSource.next({ severity: 'error', summary: 'Error', detail: message });
  }
}
