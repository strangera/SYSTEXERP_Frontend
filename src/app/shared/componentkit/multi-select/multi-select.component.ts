import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';
import { MultiSelect } from 'primeng/multiselect';

@Component({
  selector: 'app-multi-select',
  templateUrl: './multi-select.component.html',
  styleUrl: './multi-select.component.scss'
})
export class MultiSelectComponent extends BasicKitComponent implements OnInit {
  @ViewChild('multiSelect') multiSelect!: MultiSelect;
  @Input() label = '';
  @Input() controlName = '';
  @Input() options: any[] = [];
  @Input() optionLabel = ''; // 資料的 Label
  @Input() optionValue = ''; // 資料的 Value
  @Input() control = new FormControl;
  @Input() submitted = false; // 檢查欄位是否標準
  @Input() variant: 'filled' | 'outlined' = 'outlined';

  ngOnInit(): void {
    if (!this.control.disabled) {
      this.updateControlState(this.control);
    }
  }
}
