import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';

@Component({
  selector: 'app-dropdown-item',
  templateUrl: './dropdown-item.component.html',
  styleUrl: './dropdown-item.component.scss'
})
export class DropdownItemComponent extends BasicKitComponent implements OnInit {
  @Input() label: string = '';
  @Input() controlName: string = '';
  @Input() options: any[] = [];
  @Input() optionLabel: string = ''; // 資料的 Label
  @Input() optionValue: string = ''; // 資料的 Value
  @Input() control: FormControl = new FormControl;
  @Input() submitted: boolean = false; // 檢查欄位是否標準

  ngOnInit(): void {
    // Required *
    this.checkRequiredValidator(this.control);
    // Placeholder
    this.setPlaceholder('請選擇', this.control);
  }
}
