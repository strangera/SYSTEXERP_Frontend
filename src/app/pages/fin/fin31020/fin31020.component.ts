import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { createPaginationConfig } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { DropDownListService } from './../../../service/utility/dropDownList.service';

//1.3.1.2 應收調整科目設定維護
@Component({
  selector: 'app-fin31020',
  templateUrl: './fin31020.component.html',
  styleUrl: './fin31020.component.scss',
  standalone: true,
  imports: [DropdownComponent, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputNumberComponent, MultiSelectComponent, InputTextComponent, TableComponent, TranslateModule]
})
export class FIN31020Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    AccNoFrom: [""],
    minus: [1],
    remark: ["", Validators.maxLength(100)],
    ...createPaginationConfig([{ field: 'VouNo', order: 1 }]),
  });
  AccNoOptions: any[] = []; // 科目代號選項
  selectedItems: any[] = [];
  totalRecords = 0
  data: any[] = [];
  columns: any[] = [
    { field: 'col1', header: '調整科目代號', visible: true },
    { field: 'col2', header: '加減項', visible: true },
    { field: 'col3', header: '備註', visible: true },
    // 其他欄位
  ];
  minusOption: any[] = [
    { value: 1, label: '加項' },
    { value: 2, label: '減項' },
  ];
  constructor(
    private dropDownListService: DropDownListService
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('FIN31020', '/FIN/FIN31020CRU', this.queryForm, (frm) => this.onSubmit(frm));
    this.loadOptions();
  }
  private loadOptions(): void {
    // 科目代號
    this.dropDownListService.queryGLS1005_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => this.AccNoOptions = res.Data.map((x: any) => ({ label: `${x.No} - ${x.Name}`, value: x.No })));

  }
  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const v = frm.value;


    });
  }
}
