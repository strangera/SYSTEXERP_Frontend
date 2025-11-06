import { Component, } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { PanelModule } from 'primeng/panel';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { InputTextRangeComponent } from '@shared/componentkit/input-text-range/input-text-range.component';
import { TableComponent } from '@shared/componentkit/table/table.component';

// 1.1.4.3 形成申報書cru
@Component({
  selector: 'app-fin14030-cru',
  templateUrl: './fin14030-cru.component.html',
  styleUrl: './fin14030-cru.component.scss',
  standalone: true,
  imports: [TableComponent, InputTextRangeComponent, MultiSelectComponent, CalendarRangeComponent, MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, DropdownComponent, InputTextComponent, CalendarComponent, ButtonComponent, TranslateModule]
})
export class FIN14030CRUComponent{
  // 目前不使用
}
