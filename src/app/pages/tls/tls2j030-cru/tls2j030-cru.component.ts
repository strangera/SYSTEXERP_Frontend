import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { PanelModule } from 'primeng/panel';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropDownListService } from './../../../service/utility/dropDownList.service';
import { TranslateModule } from '@ngx-translate/core';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableComponent } from '@shared/componentkit/table/table.component';

@Component({
  selector: 'app-tls2j030-cru',
  templateUrl: './tls2j030-cru.component.html',
  styleUrl: './tls2j030-cru.component.scss',
  standalone: true,
  imports: [
    TableEditComponent, MenubarComponent,
    PanelModule, ReactiveFormsModule, ButtonComponent, TranslateModule, InputTextComponent,TableComponent],
})
export class TLS2J030CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  /** 表單定義 */
  dataForm = this.formBuilder.nonNullable.group({
    TXN_GUIBegNo: [''],
  });
  selectedItems: any[] = [];
  data: any[] = [];
  columnsnatural: EditColumn[] = [];
  columnschange: EditColumn[] = [];
  columnsdetail: EditColumn[] = [];
  constructor(
    private dropDownListService: DropDownListService,
  ) {
    super();
  }
  ngOnInit(): void {
    this.initializePage('TLS2J030', this.dataForm);
  }

  /** 送出 */
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.loading = true;

    });
  }
}
