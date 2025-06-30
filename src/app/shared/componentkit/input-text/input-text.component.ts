import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';

@Component({
  selector: 'app-input-text',
  templateUrl: './input-text.component.html',
  styleUrl: './input-text.component.scss'
})
export class InputTextComponent extends BasicKitComponent implements OnInit {
  @Input() label = '';
  @Input() controlName = '';
  @Input() control = new FormControl;
  @Input() submitted = false; // 檢查欄位是否標準
  @Input() disabled: boolean | undefined;
  @Input() showCopyButton = false;
  @Input() customPlaceholder: string | undefined;
  @Input() errorForGroup = false;
  @Input() showStar = false;
  value = '********************************************************************************************************************************************************************************************************************************************************************************************************';

  @Input() showButton = false;
  @Input() buttonLabel = '';
  @Input() buttonLoading = false;
  @Output() clickButton = new EventEmitter<any>();

  ngOnInit(): void {
    if (this.disabled) {
      this.control.disable({ emitEvent: false });
    }
    if (this.customPlaceholder) {
      this.placeholder = this.customPlaceholder;
    }
    this.updateControlState(this.control);
  }

  onClick(): void {
    this.clickButton.emit();
  }
}
