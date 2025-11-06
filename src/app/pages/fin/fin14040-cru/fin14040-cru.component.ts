import { Component, } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { PanelModule } from 'primeng/panel';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { NgFor, NgIf } from '@angular/common';


import { ButtonComponent } from '../../../shared/componentkit/button/button.component';

// 形成媒體申報檔 CRU
@Component({
  selector: 'app-fin14040-cru',
  templateUrl: './fin14040-cru.component.html',
  styleUrl: './fin14040-cru.component.scss',
  standalone: true,
  imports: [MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, InputNumberComponent, InputTextComponent, CalendarComponent, DropdownComponent, NgFor, ButtonComponent, NgIf, TranslateModule]
})
export class FIN14040CRUComponent{
  // 目前不使用
}
