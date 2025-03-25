import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';

@Component({
  selector: 'app-input-posquickkey',
  templateUrl: './input-posquickkey.component.html',
  styleUrl: './input-posquickkey.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class InputPOSQuickkeyComponent extends BasicKitComponent implements OnInit {
  @Input() label: string = '';
  @Input() controlName: string = '';
  @Input() control: FormControl = new FormControl;
  @Input() submitted: boolean = false; // 檢查欄位是否標準
  visible: boolean = false;
  selectedValueID: number | null = null;

  quickkeyData = [
    { id: 1 },
    { id: 2 },
    { id: 3 },
    { id: 4 },
    { id: 5 },
    { id: 6 },
    { id: 7 },
    { id: 8 },
    { id: 9 },
    { id: 10 },
    { id: 11 },
    { id: 12 },
    { id: 13 },
    { id: 14 },
    { id: 15 },
    { id: 16 },
    { id: 17 },
    { id: 18 },
    { id: 19 },
    { id: 20 },
    { id: 21 },
    { id: 22 },
    { id: 23 },
    { id: 24 },
    { id: 25 },
  ];

  ngOnInit(): void {
    // Required *
    this.checkRequiredValidator(this.control);
    // Placeholder
    this.setPlaceholder('輸入文字', this.control);
    // IntLength
    this.checkIntLengthValidator(this.control);
  }

  showDialog() {
    this.visible = true;
  }

  onRowSelect(event: any) {
    this.selectedValueID = event.id;
    this.visible = false;
  }
}
