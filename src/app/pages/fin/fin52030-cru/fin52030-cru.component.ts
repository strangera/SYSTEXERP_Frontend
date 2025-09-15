
import { NgIf } from '@angular/common';
import { Component, computed, OnInit, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FIN52030Service } from '@service/api/fin/fin52030.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column, formatAmount } from '@shared/componentkit/table/table.model';
import { NGXLogger } from 'ngx-logger';
import { CheckboxModule } from 'primeng/checkbox';
import { PanelModule } from 'primeng/panel';

@Component({
  selector: 'app-fin52030-cru',
  templateUrl: './fin52030-cru.component.html',
  styleUrl: './fin52030-cru.component.scss',
  standalone: !0,
  imports: [
    NgIf,
    CheckboxModule,
    FormsModule,
    PanelModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    CalendarComponent,
    DropdownComponent,
    InputTextComponent,
    MenubarComponent,
    TableComponent,
  ],
})
export class FIN52030CRUComponent extends BasicCruPageComponent<unknown> implements OnInit {

  public readonly dataForm = this.formBuilder.nonNullable.group({
    typeCode: new FormControl<string | void>(void 0, [Validators.required, Validators.maxLength(8)]),
    subpoenaName: new FormControl<string | void>(void 0, [Validators.required, Validators.maxLength(40)]),
    subpoenaType: new FormControl<string | void>(void 0, [Validators.required]),
    creator: new FormControl<string | void>(void 0),
    createDate: new FormControl<Date | void>(void 0),
    modifier: new FormControl<string | void>(void 0),
    modifyDate: new FormControl<Date | void>(void 0),
  });
  public readonly df = signal(this.dataForm.controls);

  public readonly filteredData = computed(() => {
    return this.service.FIN52030DetailData().filter(item => item).map(item => item);
  });

  public readonly totalRecords = computed(() => this.filteredData().length);

  public readonly columns: Column[] = [
    { field: '', header: '科目代號' },
    { field: '', header: '廠商/員工代號' },
    { field: '', header: '廠商/員工名稱' },
    { field: '', header: '摘要' },
    { field: '', header: '借方金額', format: formatAmount, isTotal: true },
    { field: '', header: '貸方金額', format: formatAmount, isTotal: true },
    { field: '', header: '組織代號' },
    { field: '', header: '對象別編號' },
    { field: '', header: '對帳KEY值' },
  ];

  constructor(
    public service: FIN52030Service,
    private logger: NGXLogger,
  ) {
    super();
    this.authService.getUserInfo() && (this.user = this.authService.getUserInfo()!);
  }

  ngOnInit(): void {
    this.initializePage('FIN52030', this.dataForm);

    this.service.getSubpoenaTypes();
    this.df().creator.setValue(this.user.user_Name);
    this.df().createDate.setValue(new Date());

    this.logger.debug(`init:`, [new Date().toString()]);
  }

  public onSubmit(): void {
    this.handleSubmit(this.dataForm, () => {

      this.submitted = !0;
      this.loading = !1;
    });
  }
}
