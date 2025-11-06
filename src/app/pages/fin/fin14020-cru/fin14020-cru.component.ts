import { Component, } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// Shared
import { TranslateModule } from '@ngx-translate/core';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { PanelModule } from 'primeng/panel';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { NgIf } from '@angular/common';

//1.1.4.2 資料結轉 CRU
@Component({
  selector: 'app-fin14020-cru',
  templateUrl: './fin14020-cru.component.html',
  styleUrl: './fin14020-cru.component.scss',
  standalone: true,
  imports: [MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, InputNumberComponent, InputTextComponent, CalendarComponent, DropdownComponent, ButtonComponent, NgIf, TranslateModule]
})
export class FIN14020CRUComponent{
  // 目前不使用
}
