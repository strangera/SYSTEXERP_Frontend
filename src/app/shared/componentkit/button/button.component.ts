import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output, signal } from '@angular/core';
import { AuthService } from '../../../service/system/auth.service';
import { CurrentPageService } from '../../../layout/app.menulist/current-page.service';
import { Subject, takeUntil, timer } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { Button } from 'primeng/button';
import { NotificationService } from '@shared/component/notification-message/notification.service';
interface ButtonConfig {
  label: string;
  icon?: string;
  class?: string;
  text?: boolean;
  outlined?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  severity?: 'success' | 'info' | 'warning' | 'danger' | 'help' | 'primary' | 'secondary' | 'contrast' | null;
  permissionCode?: string; // 加上這個，表示 permissionCode 可能是 string 或 undefined
}
@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  standalone: true,
  imports: [Button]
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
  @Input() type: 'button' | 'submit' | 'reset' = 'button'; // 原始html的type
  @Input() text: boolean | undefined; // 是否為文字按鈕
  @Input() outlined: boolean | undefined; // 是否為輪廓按鈕
  @Input() form: FormGroup | undefined;
  @Input() styleClass = '';
  public showButton = signal(false);

  private authService: AuthService = inject(AuthService);
  private currentPageService: CurrentPageService = inject(CurrentPageService);
  private ngUnsubscribe = new Subject<void>();
  private readonly buttonConfig: Record<string, ButtonConfig> = {
    default: { label: '標籤', icon: undefined, class: '', disabled: false, type: 'button', severity: undefined },           // 預設
    create: { label: '新增', icon: 'pi pi-plus', class: '', disabled: false, type: 'button', severity: undefined, permissionCode: '20' },   // 新增
    clear: { label: '清除', icon: undefined, class: 'button-clear', text: true, disabled: false, type: 'button', severity: undefined },        // 清除
    cancel: { label: '取消', icon: 'fas fa-undo', class: 'button-cancel', outlined: true, disabled: false, type: 'button', severity: 'secondary' },       // 取消
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
    if (this.label === undefined) this.label = config.label;
    if (this.icon === undefined) this.icon = config.icon;
    if (this.class === undefined) this.class = config.class;
    if (this.disabled === undefined) this.disabled = config.disabled;
    if (this.text === undefined) this.text = config.text;
    if (this.outlined === undefined) this.outlined = config.outlined;
    this.severity = config.severity as 'success' | 'info' | 'warning' | 'danger' | 'help' | 'primary' | 'secondary' | 'contrast' | null | undefined;
    this.type = config.type as 'button' | 'submit' | 'reset';

    this.currentPageService.currentPageProgNo$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(progNo => {
      if (config.permissionCode && progNo) {
        const funInfo = this.authService.getUserPermissions(progNo);
        const hasPermission = funInfo?.PrivilegeBehavior?.some(behavior => behavior.function_code === config.permissionCode);
        this.disabled = !hasPermission; // 如果沒有權限，則禁用按鈕
      } else {
        if (this.disabled === undefined) this.disabled = config.disabled; // 如果沒有權限代碼或程式編號，則使用預設的禁用狀態
      }
    });
  }

  private initialFormValue: any;
  ngAfterViewInit(): void { // 這個寫法有點爛，但是目前想到最簡單的解法了
    // 在這裡使用 timer 延遲儲存初始值
    if (this.btnType === 'cancel' || this.btnType === 'clear') {
      setTimeout(() => {
        if (this.btnType === 'cancel') {
          this.disabled = true;
        }
        this.initialFormValue = this.form?.getRawValue();
        this.form?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
          if (this.btnType === 'cancel') {
            this.disabled = false;
          }
        });

        this.showButton.set(true);
      }, 0);
    }
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
  }
}
