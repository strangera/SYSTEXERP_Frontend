import { NgIf, NgStyle } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputTextModule } from 'primeng/inputtext';
import { FieldStateDirective } from '@shared/directive/field-state.directive';
import { InputTextComponent } from '../input-text/input-text.component';

@Component({
  selector: 'app-input-text-range',
  templateUrl: './input-text-range.component.html',
  styleUrl: './input-text-range.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgIf,
    InputGroupModule,
    FormsModule,
    InputTextModule,
    ReactiveFormsModule,
    InputTextComponent,
    NgStyle
  ],
  hostDirectives: [FieldStateDirective],
})
export class InputTextRangeComponent implements OnInit {
  protected readonly fieldState = inject(FieldStateDirective, { self: true });

  // 必填欄位
  @Input() label = '';
  @Input() showLabel = true;
  @Input() startLabel!: string;
  @Input() endLabel!: string;
  @Input() controlName = '';
  @Input() startControlName = '';
  @Input() endControlName = '';
  @Input() startControl = new FormControl(); // 開始值的 FormControl
  @Input() endControl = new FormControl(); // 結束值的 FormControl
  @Input() submitted = false;
  // 自訂屬性
  @Input() errorForGroup = false;
  // 觸發事件
  @Output() startChange = new EventEmitter<string>();
  @Output() endChange = new EventEmitter<string>();

  ngOnInit(): void {
    this.fieldState.checkRequiredValidator(this.startControl, 0);
    this.fieldState.checkRequiredValidator(this.endControl, 1);
  }

  onStartInputChange(event: string) {
    this.startChange.emit(event);
  }

  onEndInputChange(event: string) {
    this.endChange.emit(event);
  }
}
