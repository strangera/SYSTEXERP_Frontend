import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { formatDate } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { FIN31020Data, FIN31020Service } from './../../../service/api/fin/fin31020.service';
import { DropDownListService } from './../../../service/utility/dropDownList.service';

//1.3.1.2 應收調整科目設定維護
@Component({
  selector: 'app-fin31020',
  templateUrl: './fin31020.component.html',
  styleUrl: './fin31020.component.scss',
  standalone: true,
  imports: [MultiSelectComponent, DropdownComponent, MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, TableComponent, InputTextComponent, TranslateModule]
})
export class FIN31020Component extends BasicQueryPageComponent<FIN31020Data> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    CAR_AccNo: [""],
    CAR_Type: [['1', '2']],
    Remark: ["", Validators.maxLength(100)],
    pageSize: [30],
    pageIndex: [1], // 你將初始頁碼改為 1
    SortBy: [[{ field: 'CAR_AccNo', order: 1 }]],
  });
  AccNoOptions: { label: string; value: string }[] = []; // 科目代號選項
  selectedItems: FIN31020Data[] = [];
  totalRecords = 0
  data: FIN31020Data[] = [];
  columns = [
    { field: 'CAR_AccNo', header: '調整科目代號', visible: true },
    { field: 'CAR_Type', header: '加減項', visible: true, format: (v: string) => v === '1' ? '加項' : '減項' },
    { field: 'Remark', header: '備註', visible: true },
    { field: 'CRT_Date', header: '建立日期', visible: true, format: formatDate },
    { field: 'CRT_USR_No', header: '建立人員代號', visible: true },
    { field: 'CRT_USR_Name', header: '建立人員姓名', visible: true },
    { field: 'UPD_Date', header: '變更日期', visible: true, format: formatDate },
    { field: 'UPD_USR_No', header: '變更人員代號', visible: true },
    { field: 'UPD_USR_Name', header: '變更人員姓名', visible: true },
  ];
  minusOption = [
    { value: '1', label: '加項' },
    { value: '2', label: '減項' },
  ];
  constructor(
    private dropDownListService: DropDownListService,
    private fin31020Service: FIN31020Service
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
      .subscribe(res => this.AccNoOptions = res.Data.map((x: { No: string; Name: string }) => ({ label: `${x.No} - ${x.Name}`, value: x.No })));

  }
  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const formValue = frm.value;
      this.fin31020Service
        .queryFIN31020(formValue)
        .pipe(
          untilDestroyed(this),
          finalize(() => {
            this.loading = false;
          })
        )
        .subscribe({
          next: (response) => {
            if (response && response.Data) {
              this.data = response.Data
              this.totalRecords = response.TotalCount || 0;
            } else {
              this.data = [];
              this.totalRecords = 0;
            }
          },
        });
    });
  }
}
