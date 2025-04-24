import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';

@Component({
  selector: 'app-dateyy-one',
  templateUrl: './dateyy-one.component.html',
  styleUrl: './dateyy-one.component.scss'
})
export class DateyyOneComponent extends BasicKitComponent implements OnInit {
  @Input() label: string = '';
  @Input() control: FormControl = new FormControl;
  @Input() submitted: boolean = false; // 檢查欄位是否標準

  ngOnInit() {
    // Required *
    this.checkRequiredValidator(this.control);
    // Placeholder
    // this.setPlaceholder('請選擇年', this.control);
  }
}
