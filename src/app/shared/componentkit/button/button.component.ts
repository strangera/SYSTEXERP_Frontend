import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss'
})
export class ButtonComponent implements OnInit {
  @Input() btnType: 'default' | 'create' | 'action' | 'edit' | 'delete' | 'query' | 'cancel' | 'clear' | 'submit' | 'next' | 'previous' | 'back' = 'default';
  @Input() loading = false;
  @Output() clickEvent = new EventEmitter<void>();
  // --- 以下為按鈕配置 ---
  @Input() label: string | undefined;
  @Input() icon: string | undefined; // 圖示
  @Input() severity: 'success' | 'info' | 'warning' | 'danger' | 'help' | 'primary' | 'secondary' | 'contrast' | null | undefined;
  @Input() class: string | undefined;
  @Input() disabled: boolean | undefined | string;
  @Input() type: 'button' | 'submit' | 'reset' = 'button'; // 原始html的type

  private readonly buttonConfig = {
    default: { label: '標籤', icon: 'pi pi-check', class: 'button-submit', disabled: false, type: 'button', severity: 'info' },           // 預設
    create: { label: '新增', icon: 'pi pi-plus', class: 'button-create', disabled: false, type: 'button', severity: 'info' },           // 新增
    action: { label: '新增', icon: 'pi pi-plus', class: 'button-create', disabled: false, type: 'button', severity: 'info' },           // 新增
    clear: { label: '清除', icon: undefined, class: 'button-clear', disabled: false, type: 'reset', severity: 'info' },                 // 清除
    cancel: { label: '取消', icon: 'pi pi-times', class: 'button-cancel', disabled: false, type: 'button', severity: 'secondary' },           // 取消
    delete: { label: '刪除', icon: 'pi pi-trash', class: 'button-delete', disabled: false, type: 'button', severity: 'danger' },           // 刪除
    edit: { label: '編輯', icon: 'pi pi-pencil', class: 'button-edit', disabled: false, type: 'button', severity: 'info' },               // 編輯
    query: { label: '查詢', icon: 'pi pi-search', class: 'button-query', disabled: false, type: 'submit', severity: 'info' },           // 查詢
    submit: { label: '確認', icon: 'pi pi-check', class: 'button-submit', disabled: false, type: 'submit', severity: 'info' },           // 確認
    next: { label: '下一步', icon: 'pi pi-arrow-right', class: 'button-next', disabled: false, type: 'button', severity: 'info' },       // 下一步
    previous: { label: '上一步', icon: 'pi pi-arrow-left', class: 'button-previous', disabled: false, type: 'button', severity: 'info' }, // 上一步
    back: { label: '離開', icon: 'pi pi-arrow-left', class: 'button-back', disabled: false, type: 'button', severity: 'secondary' },                 // 離開
  };

  ngOnInit() {
    const config = this.buttonConfig[this.btnType];
    if (this.label === undefined) this.label = config.label;
    if (this.icon === undefined) this.icon = config.icon;
    if (this.class === undefined) this.class = config.class;
    if (this.disabled === undefined) this.disabled = config.disabled;
    this.severity = config.severity as 'success' | 'info' | 'warning' | 'danger' | 'help' | 'primary' | 'secondary' | 'contrast' | null | undefined;
    this.type = config.type as 'button' | 'submit' | 'reset';
  }

  handleClick() {
    if (!this.disabled) {
      this.clickEvent.emit();
    }
  }
}
