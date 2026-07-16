import { NgIf } from '@angular/common';
import { Component, OnInit, ViewChild, } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Sysbp00Response, Sysbp00ResponseDetail, Sysbp00Service } from '@service/api/sys/sysbp00.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { TableEditComponent } from '@shared/components/table-edit/table-edit.component';
import { EditColumn } from '@shared/components/table-edit/table-edit.model';
import { validateRequired } from '@shared/components/table-edit/validate-field.model';
import { CheckboxModule } from 'primeng/checkbox';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';

@Component({
  selector: 'app-sysbp00.cru',
  templateUrl: './sysbp00.cru.component.html',
  standalone: true,
  imports: [TableEditComponent, MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, InputTextComponent, CheckboxModule, ButtonComponent, NgIf, TranslateModule]
})
// 參數資料設定維護 CRU
export class SYSBP00CRUComponent extends BasicCruPageComponent<Sysbp00Response> implements OnInit {
  @ViewChild(TableEditComponent) tableEditComponent!: TableEditComponent;
  dataForm = this.formBuilder.nonNullable.group({
    SYS_Type: ['', [Validators.required, Validators.maxLength(40)]],
  });
  data: Sysbp00ResponseDetail[] = [];
  selectedItems: Sysbp00ResponseDetail[] = [];
  editColumns: EditColumn[] = [
    { field: 'SYS_Code', header: '參數代號', width: '150px', type: 'input', validate: [validateRequired] },
    { field: 'SYS_Name', header: '參數名稱', width: '100%', type: 'input', textAlign: 'left', validate: [validateRequired] },
  ]
  validateEntireRow = (rowData: Sysbp00ResponseDetail): { isValid: boolean, errorMessage: string } => {
    const hasDuplicateSYS_Code = this.data.some(item =>
      item.SYS_Code === rowData.SYS_Code && item._TABLE_KEY !== rowData._TABLE_KEY
    );
    if (hasDuplicateSYS_Code) {
      return { isValid: false, errorMessage: '參數代號已重複' };
    }

    return { isValid: true, errorMessage: '' };
  };
  constructor(
    private readonly sysbp00Service: Sysbp00Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('SYSBP00', this.dataForm);
    if (!this.isFormCreateable) {
      this.data = this.rowdata?.Details ?? [];
      this.dataForm.disable();
    }
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const valid = this.tableEditComponent.validateAndShowErrors();
      if (!valid) {
        this.loading = false;
        return;
      }
      const params = this.data.map(item => ({
        ID: item.ID ?? 0,
        SYS_Code: item.SYS_Code,
        SYS_Name: item.SYS_Name,
        SYS_Sort: item.SYS_Sort,
        SYS_Type: frm.getRawValue().SYS_Type
      }));
      const $request = this.isFormCreateable ? this.sysbp00Service.insertSYSBP00(params) : this.sysbp00Service.updateSYSBP00(params);
      $request.pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(response => {
        this.messageService.successBubble(response.Message);
        if (this.isFormCreateable) {
          this.dataForm.reset();
          this.data = [];
        } else {
          this.onCancel();
        }
      })
    })
  }

  rowReorder() {
    this.data.forEach((rowData, index) => {
      rowData.SYS_Sort = index + 1;
    });
  }

  onClear() {
    if (this.isFormCreateable) {
      this.dataForm.reset();
      this.data = [];
    } else {
      this.data = this.rowdata?.Details ?? [];
    }
  }
}
