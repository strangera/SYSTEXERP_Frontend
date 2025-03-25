import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';

@Component({
  selector: 'app-input-serial-number',
  templateUrl: './input-serial-number.component.html',
  styleUrl: './input-serial-number.component.scss'
})
export class InputSerialNumberComponent extends BasicKitComponent implements OnInit {
  @Input() label: string = '';
  @Input() controlName: string = '';
  @Input() control: FormControl = new FormControl();
  @Input() submitted: boolean = false; // 檢查欄位是否標準

  ngOnInit(): void {
    // Required *
    this.checkRequiredValidator(this.control);
    // Placeholder
    this.setPlaceholder('輸入數字', this.control);
    // IntLength
    this.checkIntLengthValidator(this.control);
  }
}
