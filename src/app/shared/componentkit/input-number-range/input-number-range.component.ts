import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';
import { NgIf, NgClass } from '@angular/common';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { ControlMessagesComponent } from '../../component/control-messages/control-messages.component';

@Component({
  selector: 'app-input-number-range',
  templateUrl: './input-number-range.component.html',
  styleUrl: './input-number-range.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgIf, InputGroupModule, InputNumberModule, FormsModule, ReactiveFormsModule, NgClass, InputGroupAddonModule, ControlMessagesComponent]
})
export class InputNumberRangeComponent extends BasicKitComponent implements OnInit {
  @Input() label = '';
  @Input() startLabel!: string;
  @Input() endLabel!: string;
  @Input() suffix: string | undefined | null = null;
  @Input() startControl: FormControl = new FormControl(); // 開始值的 FormControl
  @Input() endControl: FormControl = new FormControl(); // 結束值的 FormControl
  @Input() submitted = false;
  @Input() step = 1;
  @Input() showButtons = false;
  @Input() minBoundary = 0; // 範圍的最小值限制
  @Input() maxBoundary = 99999999999; // 範圍的最大值限制
  @Input() minFractionDigits = 0;
  @Input() maxFractionDigits = 0;
  @Input() useGrouping = true;
  @Input() mode: 'decimal' | 'currency' = 'decimal';
  @Input() incrementButtonClass = '';
  @Input() decrementButtonClass = '';
  @Output() rangeChange = new EventEmitter<{ start: any, end: any }>();
  @Output() blurEvent = new EventEmitter<{ start: any, end: any }>();

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
