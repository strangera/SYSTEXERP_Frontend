import {
  AfterViewInit, ChangeDetectionStrategy, Component, computed,
  DestroyRef, EventEmitter, inject, Input, OnInit, Output, signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { SystemDataService } from '@service/system/system-data.service';
import { FormStatusService } from '@shared/service/form-status.service';
import { OperationLogService } from '@shared/service/operation-log.service';
import { PermissionGuardService } from '@shared/service/permission-guard.service';
import { Button } from 'primeng/button';
import { combineLatest, timer } from 'rxjs';
import { filter } from 'rxjs/operators';
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
  permissionCode?: string;
}

@Component({
  selector: 'app-button',
  template: `
  <p-button [hidden]="!showButton() && (btnType === 'cancel' || btnType === 'clear')" id="customButton"
  (onClick)="handleClick()" [label]="label" [class]="class" [icon]="icon" [loading]="loading" [disabled]="effectiveDisabled()"
  [type]="type" [severity]="severity" [text]="text" [outlined]="outlined"
  [styleClass]="'w-max ' + styleClass"></p-button>
  `,
  styleUrl: './button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [Button],
  host: {
    '[attr.tabindex]': 'effectiveDisabled() ? "-1" : "0"',
    '(keydown.enter)': 'handleKeyboardClick($event)',
    '(keydown.space)': 'handleKeyboardClick($event)'
  }
})
export class ButtonComponent implements OnInit, AfterViewInit {
  @Input() btnType: 'default' | 'create' | 'edit' | 'delete' | 'query' | 'cancel' | 'clear' | 'submit' | 'next' | 'previous' | 'smartclear' | 'report' | 'back' | 'CSV' | 'textclear' = 'default';
  @Input() loading = false;
  @Output() clickEvent = new EventEmitter<void>();
  @Input() label: string | undefined;
  @Input() icon: string | undefined;
  @Input() severity: 'success' | 'info' | 'warning' | 'danger' | 'help' | 'primary' | 'secondary' | 'contrast' | null | undefined;
  @Input() class: string | undefined;
  @Input() type: ButtonType = 'button';
  @Input() text: boolean | undefined;
  @Input() outlined: boolean | undefined;
  @Input() form: FormGroup | undefined;
  @Input() styleClass = '';
  @Input() permissionCode: string | undefined;

  // Signal-backed getter/setter so effectiveDisabled() reacts to parent binding changes
  private readonly _disabled = signal<boolean | undefined | string>(undefined);
  @Input()
  set disabled(value: boolean | undefined | string) { this._disabled.set(value); }
  get disabled(): boolean | undefined | string { return this._disabled(); }

  private readonly permissionDisabled = signal(false);
  readonly showButton = signal(false);
  readonly effectiveDisabled = computed(() => this.permissionDisabled() || !!this._disabled());

  private readonly systemDataService = inject(SystemDataService);
  private readonly currentPageService = inject(CurrentPageService);
  private readonly permissionGuard = inject(PermissionGuardService);
  private readonly formStatusService = inject(FormStatusService);
  private readonly operationLogService = inject(OperationLogService);
  private readonly destroyRef = inject(DestroyRef);

  private initialFormValue: Record<string, unknown> | null = null;

  private readonly buttonConfig: Record<string, ButtonConfig> = {
    default: { label: '標籤', icon: undefined, class: '', disabled: false, type: 'button', severity: undefined },
    create: { label: '新增', icon: 'pi pi-plus', class: '', disabled: false, type: 'button', severity: undefined, permissionCode: '20' },
    clear: { label: '清除', icon: undefined, class: 'button-clear', text: true, disabled: false, type: 'button', severity: undefined },
    cancel: { label: '取消', icon: 'pi pi-undo', class: 'button-cancel', outlined: true, disabled: false, type: 'button', severity: 'secondary' },
    delete: { label: '刪除', icon: 'pi pi-trash', class: 'p-button-danger', disabled: false, type: 'button', severity: 'danger', permissionCode: '40' },
    edit: { label: '編輯', icon: 'pi pi-pencil', class: '', disabled: false, type: 'button', severity: undefined, permissionCode: '30' },
    query: { label: '查詢', icon: 'pi pi-search', class: '', disabled: false, type: 'submit', severity: undefined, permissionCode: '10' },
    submit: { label: '確認', icon: 'pi pi-check', class: '', disabled: false, type: 'submit', severity: undefined },
    next: { label: '下一步', icon: 'pi pi-arrow-right', class: '', disabled: false, type: 'button', severity: undefined },
    previous: { label: '上一步', icon: 'pi pi-arrow-left', class: 'button-previous', outlined: true, disabled: false, type: 'button', severity: undefined },
    back: { label: '離開', icon: 'pi pi-arrow-left', class: 'button-back', outlined: true, disabled: false, type: 'button', severity: 'secondary' },
    smartclear: { label: '清除', icon: 'pi pi-times', class: 'button-smart-clear', outlined: true, disabled: false, type: 'button', severity: 'secondary' },
    report: { label: '報表模式', icon: 'pi pi-file', class: '', disabled: false, type: 'button', severity: undefined },
    textclear: { label: '清除', icon: undefined, class: 'p-button-text p-button-sm', text: true, disabled: false, type: 'button', severity: null },
    CSV: { label: 'CSV', icon: 'pi pi-file-excel', class: '', disabled: false, type: 'button', severity: undefined },
  };

  ngOnInit(): void {
    const config = this.buttonConfig[this.btnType];
    this.label ??= config.label;
    this.icon ??= config.icon;
    this.class ??= config.class;
    this.text ??= config.text;
    this.outlined ??= config.outlined;
    this.severity ??= config.severity;
    this.type = config.type as ButtonType;
    this._disabled.set(this._disabled() ?? config.disabled ?? false);

    const permissionCode = this.permissionCode ?? config.permissionCode;

    combineLatest([
      this.systemDataService.menuUpdated.pipe(filter(menu => menu && menu.length > 0)),
      this.currentPageService.currentPageProgNo$.pipe(filter(progNo => !!progNo))
    ])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([, progNo]) => {
        if (permissionCode) {
          const funInfo = this.systemDataService.getUserPermissions(progNo!);
          const hasPermission = funInfo?.PrivilegeBehavior?.some(b => b.function_code === permissionCode);
          this.permissionDisabled.set(!hasPermission);
        }
      });
  }

  ngAfterViewInit(): void {
    if (this.btnType === 'cancel' || this.btnType === 'clear') {
      timer(1000).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
        this.initialFormValue = (this.form?.getRawValue() as Record<string, unknown>) ?? null;
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

  handleClick(): void {
    if (this.btnType === 'cancel' || this.btnType === 'clear') {
      if (this.form && this.initialFormValue) {
        this.form.reset(this.initialFormValue);
      } else {
        this.form?.reset();
      }
    }
    this.clickEvent.emit();
    this.operationLogService.logButtonClick(this.label);
  }

  handleKeyboardClick(event: KeyboardEvent): void {
    if (this.effectiveDisabled()) return;
    if (event.key === ' ') {
      event.preventDefault();
    }
    this.handleClick();
  }
}
