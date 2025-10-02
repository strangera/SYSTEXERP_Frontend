import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';
import { NgIf, NgStyle } from '@angular/common';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputTextModule } from 'primeng/inputtext';
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
  ]
})
export class InputTextRangeComponent extends BasicKitComponent implements OnInit {
  // 必填欄位
  @Input() override label = '';
  @Input() showLabel = true;
  @Input() startLabel!: string;
  @Input() endLabel!: string;
  @Input() override controlName = '';
  @Input() startControlName = '';
  @Input() endControlName = '';
  @Input() startControl = new FormControl(); // 開始值的 FormControl
  @Input() endControl = new FormControl(); // 結束值的 FormControl
  @Input() submitted = false;
  // 自訂屬性
  @Input() errorForGroup = false;
  // 觸發事件
  @Output() startChange = new EventEmitter<Event>();
  @Output() endChange = new EventEmitter<Event>();
  // @Output() blurEvent = new EventEmitter<{ start: any, end: any }>(); // 用於觸發輸入框失焦事件

  ngOnInit(): void {
    this.checkRequiredValidator(this.startControl, 0);
    this.checkRequiredValidator(this.endControl, 1);
  }

  onStartInputChange(event: Event) {
    this.startChange.emit(event);
  }

  onEndInputChange(event: Event) {
    this.endChange.emit(event);
  }

  // onStartBlur(event: Event) {
  //   this.blurEvent.emit({ start: this.startControl.value, end: this.endControl.value });
  // }

  // onEndBlur(event: Event) {
  //   this.blurEvent.emit({ start: this.startControl.value, end: this.endControl.value });
  // }
}
