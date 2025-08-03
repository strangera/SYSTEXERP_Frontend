import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';
import { NgIf, NgClass } from '@angular/common';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputTextModule } from 'primeng/inputtext';
import { ControlMessagesComponent } from '../../component/control-messages/control-messages.component';

@Component({
  selector: 'app-input-text-range',
  templateUrl: './input-text-range.component.html',
  styleUrl: './input-text-range.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgIf, InputGroupModule, FormsModule, InputTextModule, ReactiveFormsModule, NgClass, ControlMessagesComponent]
})
export class InputTextRangeComponent extends BasicKitComponent implements OnInit {
  @Input() label = '';
  @Input() startLabel!: string;
  @Input() endLabel!: string;
  @Input() startControl: FormControl = new FormControl(); // 開始值的 FormControl
  @Input() endControl: FormControl = new FormControl(); // 結束值的 FormControl
  @Input() submitted = false;
  @Output() rangeChange = new EventEmitter<{ start: any, end: any }>();
  @Output() blurEvent = new EventEmitter<{ start: any, end: any }>();
  @Input() errorForGroup = false;

  ngOnInit(): void {
    if (this.startControl.enabled && this.endControl.enabled) {
      this.updateControlState(this.startControl, this.endControl);
    }
  }

  onStartInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.rangeChange.emit({ start: input.value, end: this.endControl.value });
  }

  onEndInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.rangeChange.emit({ start: this.startControl.value, end: input.value });
  }

  onStartBlur(event: Event) {
    this.blurEvent.emit({ start: this.startControl.value, end: this.endControl.value });
  }

  onEndBlur(event: Event) {
    this.blurEvent.emit({ start: this.startControl.value, end: this.endControl.value });
  }
}
