import { Component, OnInit, } from '@angular/core';
import { Validators, FormsModule, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { DropDownListService, IDropdownItem } from '../../../service/utility/dropDownList.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { NgClass, NgFor } from '@angular/common';
import { CommonModule } from '@angular/common';

export interface KeyItem {
  code: string;        // 例如 "0101"
  x: number;           // 1-based
  y: number;           // 1-based
  label?: string;      // 顯示文字
  func?: string;       // 功能代碼
  type?: string;       // 字型/類型
}

@Component({
  selector: 'app-tls42010-cru',
  templateUrl: './tls42010-cru.component.html',
  styleUrls: ['./tls42010-cru.component.scss'],
  standalone: true,
  imports: [MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, InputTextComponent, ButtonComponent, TranslateModule, InputTextareaComponent, DropdownComponent, NgFor, NgClass, CommonModule]
})

export class TLS42010CRUComponent extends BasicCruPageComponent<any> implements OnInit {

  dataForm = this.formBuilder.nonNullable.group({
    USR_Level: ['', Validators.maxLength(6)],
    TSB_NameOptions: [''],
    ECR_KBDesc: [''],
    TSB_Name: [''],
    ECR_KBType: ['']

  });

  xCount = 8;                 // 先給預設，之後可從 API 帶 TSB_XCount
  yCount = 5;                 // 先給預設，之後可從 API 帶 TSB_YCount
  keys: KeyItem[] = [];       // 左側鍵盤清單
  selected?: KeyItem;         // 目前選中的按鍵

  TSB_NameOptions: IDropdownItem[] = [];
  ECR_KBTypeOptions: IDropdownItem[] = [];

  selectKey(k: KeyItem): void {
    this.selected = k;
    console.log('選中按鍵:', k);
  }


  constructor(
    private dropDownListService: DropDownListService

  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS42010', this.dataForm);
    this.buildGrid();
  }
  private buildGrid() {
    const arr: KeyItem[] = [];
    for (let y = 1; y <= this.yCount; y++) {
      for (let x = 1; x <= this.xCount; x++) {
        const code = `${x.toString().padStart(2, '0')}${y.toString().padStart(2, '0')}`;
        arr.push({ code, x, y, label: code, type: 'normal' });
      }
    }
    this.keys = arr;                 // ←← 關鍵：指派回 keys
    this.selected = this.keys[0];    // 可選：預設選第一顆
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.loading = true;
    });
  }
}
