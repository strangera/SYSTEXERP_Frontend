import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgIf, NgClass } from '@angular/common';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ControlMessagesComponent } from '../../component/control-messages/control-messages.component';

@Component({
  selector: 'app-input-textarea',
  templateUrl: './input-textarea.component.html',
  styleUrl: './input-textarea.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgIf, FormsModule, InputTextareaModule, ReactiveFormsModule, NgClass, ControlMessagesComponent]
})
export class InputTextareaComponent extends BasicKitComponent implements OnInit {
  @Input() override label = '';
  @Input() override controlName = '';
  @Input() control = new FormControl;
  @Input() submitted = false; // 檢查欄位是否標準
  @Input() customPlaceholder: string | undefined;
  @Input() styleClass: string | undefined = 'h-5rem';
  @Input() readonly = false; // 新增：唯讀模式

  ngOnInit(): void {
    if (this.customPlaceholder) {
      this.placeholder = this.customPlaceholder;
    }
    this.initControl(this.control);
  }

  // 新增：取得 textarea 的 CSS 類別
  get textareaClasses(): string {
    const classes = ['p-inputtextarea', 'overflow-y-auto'];

    if (this.styleClass) {
      classes.push(this.styleClass);
    }

    if (this.readonly) {
      classes.push('readonly-field');
    }

    if (this.submitted && this.control.errors) {
      classes.push('ng-invalid', 'ng-dirty');
    }

    return classes.join(' ');
  }
}
