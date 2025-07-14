import { Component, Input, OnInit } from '@angular/core';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-input-textarea',
  templateUrl: './input-textarea.component.html',
  styleUrl: './input-textarea.component.scss'
})
export class InputTextareaComponent extends BasicKitComponent implements OnInit {
  @Input() label = '';
  @Input() controlName = '';
  @Input() control = new FormControl;
  @Input() submitted = false; // 檢查欄位是否標準
  @Input() customPlaceholder: string | undefined;

  ngOnInit(): void {
    if (this.customPlaceholder) {
      this.placeholder = this.customPlaceholder;
    }
    if (!this.control.disabled) {
      this.updateControlState(this.control);
    }
  }
}
