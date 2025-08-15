import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrandCodeService } from '../../../service/basic/brand-code.service';
import { ManagementIDService } from '../../../service/basic/management-id.service';
import { DisplayModeService } from '../../../service/basic/display-mode.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { Column } from '@shared/componentkit/table/table.model';
import { TableComponent } from '@shared/componentkit/table/table.component';

@Component({
  selector: 'app-tls57060',
  templateUrl: './tls57060.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    InputTextComponent,
    CalendarRangeComponent,
    ButtonComponent,
    TranslateModule,
    TableComponent
  ],
})
export class TLS57060Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    salesNo: [],
    salesDateFrom: [],
    salesDateTo: [],
    brandCode: [],
    managementID: [],
    countryCode: [],
    warehouseNo: [],
    displayMode: [],
  });
  totalRecords = 0;
  brandCodeOptions: any[] = [];
  managementIDOptions: any[] = [];
  displayModeOptions: any[] = [];
  data: any[] = [];
  columns: Column[] = [
    { field: 'name', header: 'Name', visible: true },
    { field: 'age', header: 'Age', visible: true },
    { field: 'email', header: 'Email', visible: true },
    // Other columns
  ];

  constructor(
    private brandCodeService: BrandCodeService,
    private managementIDService: ManagementIDService,
    private displayModeService: DisplayModeService,
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS57060', 'tls/tls57060cru', this.queryForm, (form) => this.onSubmit(form));
    this.brandCodeService.getSystemTypes().subscribe((data) => (this.brandCodeOptions = data));
    this.managementIDService.getSystemTypes().subscribe((data) => (this.managementIDOptions = data));
    this.displayModeService.getDisplayModes().subscribe((data) => (this.displayModeOptions = data));
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => { });
  }
}
