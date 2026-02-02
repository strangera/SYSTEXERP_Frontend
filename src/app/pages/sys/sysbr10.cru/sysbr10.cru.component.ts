import { NgIf } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';

import { PanelModule } from 'primeng/panel';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { EditorTextComponent } from '../../../shared/componentkit/editor-text/editor-text.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';

import { untilDestroyed } from '@ngneat/until-destroy';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { Base64Service } from '@shared/service/base64.service';
import { finalize } from 'rxjs';
import { MaintainSYSBR10Request, QuerySYSBR10DetailResponse, QuerySYSBR10Response, SYSBR10Service } from '../../../service/api/sys/sysbr10.service';

@Component({
  selector: 'app-sysbr10.cru',
  templateUrl: './sysbr10.cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeComponent,
    DropdownComponent,
    InputTextComponent,
    EditorTextComponent,
    NgIf,
    TableEditComponent,
    TranslateModule,
  ],
})
export class SYSBR10CRUComponent extends BasicCruPageComponent<QuerySYSBR10Response> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    Pub_StartDate: [null, Validators.required],
    Pub_EndDate: [null, Validators.required],
    pub_enable: ['N', Validators.required],
    Pub_Type: [null as string | null, Validators.required],
    Pub_Event: [null, Validators.required],
    Pub_Description: [null as string | null, Validators.required],
  });
  User_NoOptions$ = this.dropdown.queryTblUser();
  Org_IDOptions$ = this.dropdown.querySys3100();
  Role_NoOptions$ = this.dropdown.queryTblRole();
  Pub_TypeOptions = getSYS1000Options('T115')
  YNOptions = getSYS1000Options('YES_NO');

  detailList: QuerySYSBR10DetailResponse[] = [];

  detailcolumns: EditColumn[] = [
    {
      field: 'User_No', header: '使用者編號', type: 'dropdown',
      options: () => this.User_NoOptions$,
      optionsAsync: true,
      optionLabel: 'label',
      optionValue: 'value'
    },
    {
      field: 'Org_ID', header: '組織代碼', type: 'dropdown',
      options: () => this.Org_IDOptions$,
      optionsAsync: true,
      optionLabel: 'label',
      optionValue: 'value'
    },
    {
      field: 'Role_No', header: '角色代號', type: 'dropdown',
      options: () => this.Role_NoOptions$,
      optionsAsync: true,
      optionLabel: 'label',
      optionValue: 'value'
    },
  ];

  constructor(
    private readonly sysbr10Service: SYSBR10Service,
    private readonly dropdown: DropdownApiService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('SYSBR10', this.dataForm);
    if (!this.isFormCreateable && this.rowdata) {
      this.loading = true;
      if (this.dataForm.get('Pub_Type')?.value === '3') {
        this.dataForm.get('Pub_Type')?.disable();
      }
      this.dataForm.get('Pub_Description')?.setValue(
        Base64Service.decode(this.rowdata.Pub_Description)
      )
      this.messageService?.blockUi?.();
      this.sysbr10Service.querySYSBR10Detail({ pos5101_id: this.rowdata.id }).subscribe(res => {
        this.detailList = res?.Data ?? [];
        this.loading = false;
        this.messageService?.unblockUi?.();
      });
    }
  }
  @ViewChild(TableEditComponent) tableEditComponent!: TableEditComponent;
  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const valid = this.tableEditComponent.validateAndShowErrors();
      if (!valid) {
        this.loading = false;
        return this.messageService.errorBubble('請填寫公告可顯示範圍');
      };
      const value = form.getRawValue();
      const payload: MaintainSYSBR10Request = {
        id: this.isFormCreateable ? undefined : this.rowdata?.id,
        Pub_StartDate: value.Pub_StartDate,
        Pub_EndDate: value.Pub_EndDate,
        pub_enable: value.pub_enable || 'N',
        Pub_Type: value.Pub_Type,
        Pub_Event: value.Pub_Event,
        Pub_Description: value.Pub_Description,
        DetailList: this.detailList.map(d => ({
          id: d._dataStatus === 'new' ? undefined : d.id,
          User_No: d.User_No,
          Org_ID: d.Org_ID,
          Role_No: d.Role_No
        }))
      };
      const request$ = this.isFormCreateable ? this.sysbr10Service.insertSYSBR10(payload) : this.sysbr10Service.updateSYSBR10(payload);
      request$.pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(res => {
        if (this.isFormCreateable) {
          this.messageService.successBubble(res.Message || '新增成功');
          this.dataForm.reset();
          this.detailList = [];
        } else {
          this.messageService.successBubble(res.Message || '更新成功');
          this.onCancel();
        }
      });
    });
  }
}
