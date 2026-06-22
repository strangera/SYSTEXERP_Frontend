import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output, signal } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { SystemDataService } from '@service/system/system-data.service';
import { NotificationService } from '@shared/component/notification-message/notification.service';
import { FormStatusService } from '@shared/service/form-status.service';
import { OperationLogService } from '@shared/service/operation-log.service';
import { PermissionGuardService } from '@shared/service/permission-guard.service';
import { Button } from 'primeng/button';
import { combineLatest, Subject, timer } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { CurrentPageService } from '../../../core/layout/app.menulist/current-page.service';
type ButtonType = 'button' | 'submit' | 'reset';

interface ButtonConfig {
  label: string;
  icon?: string;
  class?: string;
  text?: boolean;
  outlined?: boolean;
  disabled?: boolean;
  type?: ButtonType;
  severity?: 'success' | 'info' | 'warning' | 'danger' | 'help' | 'primary' | 'secondary' | 'contrast' | null;
  permissionCode?: string; // 加上這個，表示 permissionCode 可能是 string 或 undefined
}
@Component({
  selector: 'app-button',
  template: `
  <p-button [hidden]="!showButton() && (btnType === 'cancel' || btnType === 'clear')" id="customButton"
  (onClick)="handleClick()" [label]="label" [class]="class" [icon]="icon" [loading]="loading" [disabled]="disabled"
  [type]="type" [severity]="severity" [text]="text" [outlined]="outlined"
  [styleClass]="'w-max ' + styleClass"></p-button>
  `,
  styleUrl: './button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [Button],
  host: {
    '[attr.tabindex]': 'disabled ? "-1" : "0"', // 沒禁用時允許 Tab 聚焦
    '(keydown.enter)': 'handleKeyboardClick($event)',
    '(keydown.space)': 'handleKeyboardClick($event)'
  }
})
export class ButtonComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() btnType: 'default' | 'create' | 'edit' | 'delete' | 'query' | 'cancel' | 'clear' | 'submit' | 'next' | 'previous' | 'smartclear' | 'report' | 'back' | 'CSV' | 'textclear' = 'default';
  @Input() loading = false;
  @Output() clickEvent = new EventEmitter<void>();
  // --- 以下為按鈕配置 ---
  @Input() label: string | undefined;
  @Input() icon: string | undefined; // 圖示
  @Input() severity: 'success' | 'info' | 'warning' | 'danger' | 'help' | 'primary' | 'secondary' | 'contrast' | null | undefined;
  @Input() class: string | undefined;
  @Input() disabled: boolean | undefined | string;
  @Input() type: ButtonType = 'button'; // 原始html的type
  @Input() text: boolean | undefined; // 是否為文字按鈕
  @Input() outlined: boolean | undefined; // 是否為輪廓按鈕
  @Input() form: FormGroup | undefined;
  @Input() styleClass = '';
  public showButton = signal(false);

  private readonly systemDataService: SystemDataService = inject(SystemDataService);
  private readonly currentPageService: CurrentPageService = inject(CurrentPageService);
  private readonly permissionGuard = inject(PermissionGuardService);
  private readonly formStatusService = inject(FormStatusService);
  private readonly operationLogService = inject(OperationLogService);
  private readonly ngUnsubscribe = new Subject<void>();
  private readonly buttonConfig: Record<string, ButtonConfig> = {
    default: { label: '標籤', icon: undefined, class: '', disabled: false, type: 'button', severity: undefined },           // 預設
    create: { label: '新增', icon: 'pi pi-plus', class: '', disabled: false, type: 'button', severity: undefined, permissionCode: '20' },   // 新增
    clear: { label: '清除', icon: undefined, class: 'button-clear', text: true, disabled: false, type: 'button', severity: undefined },        // 清除
    cancel: { label: '取消', icon: 'pi pi-undo', class: 'button-cancel', outlined: true, disabled: false, type: 'button', severity: 'secondary' },       // 取消
    delete: { label: '刪除', icon: 'pi pi-trash', class: 'p-button-danger', disabled: false, type: 'button', severity: 'danger', permissionCode: '40' },// 刪除
    edit: { label: '編輯', icon: 'pi pi-pencil', class: '', disabled: false, type: 'button', severity: undefined, permissionCode: '30' },     // 編輯
    query: { label: '查詢', icon: 'pi pi-search', class: '', disabled: false, type: 'submit', severity: undefined, permissionCode: '10' },   // 查詢
    submit: { label: '確認', icon: 'pi pi-check', class: '', disabled: false, type: 'submit', severity: undefined },            // 確認
    next: { label: '下一步', icon: 'pi pi-arrow-right', class: '', disabled: false, type: 'button', severity: undefined },        // 下一步
    previous: { label: '上一步', icon: 'pi pi-arrow-left', class: 'button-previous', outlined: true, disabled: false, type: 'button', severity: undefined }, // 上一步
    back: { label: '離開', icon: 'pi pi-arrow-left', class: 'button-back', outlined: true, disabled: false, type: 'button', severity: 'secondary' },      // 離開
    smartclear: { label: '清除', icon: 'pi pi-times', class: 'button-smart-clear', outlined: true, disabled: false, type: 'button', severity: 'secondary' }, // 智慧清除
    report: { label: '報表模式', icon: 'pi pi-file', class: '', disabled: false, type: 'button', severity: undefined },// 報表模式
    textclear: { label: '清除', icon: undefined, class: 'p-button-text p-button-sm', text: true, disabled: false, type: 'button', severity: null },  //無背景按鈕
  };

  messageService: NotificationService = inject(NotificationService);
  cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  ngOnInit() {
    const config = this.buttonConfig[this.btnType];
    this.label ??= config.label;
    this.icon ??= config.icon;
    this.class ??= config.class;
    this.disabled ??= config.disabled;
    this.text ??= config.text;
    this.outlined ??= config.outlined;
    this.severity ??= config.severity;
    this.type = config.type as 'button' | 'submit' | 'reset';

    combineLatest([
      this.systemDataService.menuUpdated.pipe(filter(menu => menu && menu.length > 0)),
      this.currentPageService.currentPageProgNo$.pipe(filter(progNo => !!progNo))
    ])
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(([, progNo]) => {
        if (config.permissionCode) {
          const funInfo = this.systemDataService.getUserPermissions(progNo!);
          const hasPermission = funInfo?.PrivilegeBehavior?.some(b => b.function_code === config.permissionCode);
          this.disabled = !hasPermission;
        } else this.disabled ??= config.disabled;
        this.cdr.detectChanges(); // 確保 OnPush 變更檢測更新
      });
  }

  private initialFormValue: any;
  ngAfterViewInit(): void { // 這個寫法有點爛，但是目前想到最簡單的解法了
    // 在這裡使用 timer 延遲儲存初始值
    if (this.btnType === 'cancel' || this.btnType === 'clear') {
      timer(1000).pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
        this.initialFormValue = this.form?.getRawValue();
        this.showButton.set(true);
        const progNo = this.currentPageService.getCurrentProgNo();
        if (progNo) {
          this.formStatusService.notifyReady(progNo);
        }
      });
    }
  }

  hasPermission(action: string): boolean {
    const progNo = this.currentPageService.getCurrentProgNo();
    return this.permissionGuard.hasPermission(progNo as string, action);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  handleClick() {
    if (this.btnType === 'cancel' || this.btnType === 'clear') {
      if (this.form && this.initialFormValue) {
        // 重置表單到初始狀態
        this.form.reset(this.initialFormValue);
      } else if (this.form) {
        // 如果沒有初始值，則使用預設的 reset
        this.form.reset();
      }
    }
    this.clickEvent.emit();
    this.operationLogService.logButtonClick(this.label);
  }
  handleKeyboardClick(event: Event) {
    // 轉成KeyboardEvent
    const keyboardEvent = event as KeyboardEvent;
    if (this.disabled) return;

    // 如果是空白鍵，防止網頁滾動
    if (keyboardEvent.key === ' ') {
      keyboardEvent.preventDefault();
    }

    // 直接呼叫你原本就寫好的點擊邏輯
    this.handleClick();
  }
}
