import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';

@Component({
  selector: 'app-editor-text',
  templateUrl: './editor-text.component.html',
  styleUrl: './editor-text.component.scss'
})
export class EditorTextComponent extends BasicKitComponent implements OnInit {
  @Input() label: string = '';
  @Input() controlName: string = '';
  @Input() control: FormControl = new FormControl;
  @Input() style: any = { height: '320px' }; // 可以接收一個樣式對象
  @Input() submitted: boolean = false; // 檢查欄位是否標準

  ngOnInit(): void {
    // Required *
    this.checkRequiredValidator(this.control);
    // Placeholder
    // this.setPlaceholder('輸入文字', this.control);
  }

  onValueChange(value: string) {
    this.control.setValue(value);
  }
}
