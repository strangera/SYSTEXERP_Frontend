import { Component, Input } from '@angular/core';
import { TableComponent } from '../table.component';
import { COMMON_IMPORTS } from '../import-table';
import { DropDownListService } from '@service/utility/dropDownList.service';

@Component({
  selector: 'app-table-subheader',
  standalone: true,
  imports: [COMMON_IMPORTS],
  templateUrl: './table-subheader.component.html',
  styleUrl: './table-subheader.component.scss',
})
export class TableSubheaderComponent extends TableComponent {
  // 群組依據欄位名稱
  @Input() groupRowsByName: string = '';
  // 是否顯示群組表頭
  @Input() showGroupheader: boolean = true;
}
