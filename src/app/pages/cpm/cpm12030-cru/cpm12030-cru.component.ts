import { AsyncPipe, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { CPM12030Data, Cpm12030Service, CSS1004Data } from '@service/api/cpm/cpm12030.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
@Component({
  selector: 'app-cpm12030-cru',
  templateUrl: './cpm12030-cru.component.html',
  standalone: true,
  imports: [TableEditComponent, AsyncPipe, MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, InputTextComponent, DropdownComponent, ButtonComponent, NgIf, TranslateModule]
})
export class CPM12030CRUComponent extends BasicCruPageComponent<CPM12030Data> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    ID: [0],
    KIND_ID: [null, [Validators.required, Validators.maxLength(10)]], // 子類別編號
    KIND_SubID: [null, [Validators.required, Validators.maxLength(40)]], // 責任單位名稱類別名稱
    KIND_SubName: [null, [Validators.required]], // 客戶意見主類別
  });
  KIND_IDOptions$ = this.dropdown.queryCss1002();
  CLASS_IDOptions$ = this.dropdown.queryCss1005();
  ORG_IDOptions$ = this.dropdown.querySys3100();
  columns: EditColumn[] = [
    {
      field: 'ORG_ID', header: '組織', type: 'dropdown', options: () => this.ORG_IDOptions$, optionsAsync: true, optionLabel: 'label', optionValue: 'value',
      showClear: false
    },
    {
      field: 'CLASS_ID', header: '責任單位', type: 'dropdown', options: () => this.CLASS_IDOptions$, optionsAsync: true, optionLabel: 'label', optionValue: 'value',
      showClear: false
    },
  ];
  data: CSS1004Data[] = [];
  constructor(
    private readonly cpm12030Service: Cpm12030Service,
    private readonly dropdown: DropdownApiService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('CPM12030', this.dataForm);
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const params = {
        ...frm.getRawValue()
      }
      const $request = this.isFormCreateable ? this.cpm12030Service.createCPM12030(params) : this.cpm12030Service.updateCPM12030(params);
      $request.pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(response => {
        this.messageService.successBubble(response.Message);
        if (this.isFormCreateable) {
          this.dataForm.reset();
        } else {
          this.onCancel();
        }
      })
    })
  }
}
