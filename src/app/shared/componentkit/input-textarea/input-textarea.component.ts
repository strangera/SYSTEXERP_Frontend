import { NgClass, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnInit, inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { EnterToTabDirective } from '@shared/directive/enter-to-tab.directive';
import { FieldStateDirective } from '@shared/directive/field-state.directive';

@Component({
  selector: 'app-input-textarea',
  templateUrl: './input-textarea.component.html',
  styleUrl: './input-textarea.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgIf, FormsModule, InputTextareaModule, ReactiveFormsModule, NgClass, EnterToTabDirective],
  hostDirectives: [FieldStateDirective],
})
export class InputTextareaComponent implements OnInit {
  protected readonly fieldState = inject(FieldStateDirective, { self: true });

  @Input() label = '';
  @Input() controlName = '';
  @Input() control = new FormControl;
  @Input() submitted = false; // 檢查欄位是否標準
  @Input() customPlaceholder: string | undefined;
  @Input() styleClass: string | undefined = 'h-5rem';
  @Input() readonly = false; // 新增：唯讀模式
  @Input() rows = 5;

  ngOnInit(): void {
    if (this.customPlaceholder) {
      this.fieldState.placeholder = this.customPlaceholder;
    }
    this.fieldState.initControl(this.control, this.controlName, this.label);
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
