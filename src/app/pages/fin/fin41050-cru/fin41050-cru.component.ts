import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { fin41050data, Fin41050Service } from '@service/api/fin/fin41050.service';
import { Fin55070Service } from '@service/api/fin/fin55070.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputNumberRangeComponent } from '@shared/componentkit/input-number-range/input-number-range.component';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableComponent } from '@others/component/table/table.component';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';

@Component({
  selector: 'app-fin41050-cru',
  standalone: true,
  templateUrl: './fin41050-cru.component.html',
  imports: [
    AccordionModule,
    ButtonComponent,
    ButtonModule,
    CalendarComponent,
    CommonModule,
    DropdownComponent,
    FormsModule,
    InputTextComponent,
    InputNumberComponent,
    InputNumberRangeComponent,
    MenubarComponent,
    ReactiveFormsModule,
    TableComponent,
    TranslateModule,
    PanelModule
  ]
})
export class FIN41050CRUComponent extends BasicCruPageComponent<fin41050data> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    //只有金額、備註 能修改
    ID: [null], // 主鍵ID，新增時為null，編輯時為存在的ID
    Org_ID: [{ value: null, disabled: true }], // 部門代號
    Budget_Version: [{ value: null, disabled: true }], // 版本
    Budget_Year: [{ value: null, disabled: true }], // 年度，4位數
    Budget_Month: [{ value: null, disabled: true }], // 月份，01-12
    AccNo: [{ value: null, disabled: true }], // 會計科目
    Budget: [null, [Validators.required]], // 預算金額
    Remark: [null, [Validators.maxLength(100)]], // 備註
  });
  //
  Org_ID_Options: { value: string; label: string }[] = []; // 供應商編號 下拉選項
  AccNo_Options: { value: string; label: string }[] = []; // 會計科目 下拉選項
  // ----------------------------------------------------------------
  constructor(
    private fin41050Service: Fin41050Service,
    private fin55070Service: Fin55070Service,
    private readonly dropDownListService: DropDownListService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('FIN41050', this.dataForm);
    this.loadOptions();
    console.log('讀取資料', this.dataForm.value);
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      switch (this.crudstatus) {
        case CRUDStatus.Create:
          //本作業不能新增
          break;
        case CRUDStatus.Edit:
          if (this.canEdit()) {
            const payload = {
              ID: frm.get('ID')?.value,
              Budget: frm.get('Budget')?.value,
              Remark: frm.get('Remark')?.value,
            }
            console.log('更新資料', payload);
            this.fin41050Service.updateFIN41050(payload).subscribe(() => {
              this.onCancel();
            });
          }
          break;
      }
    });
  }

  // 讀取dopropdown選項
  loadOptions() {
    {
      // 部門代號
      this.dropDownListService
        .querySYS3100_DropDownList()
        .pipe(untilDestroyed(this))
        .subscribe(res => {
          const list = res.Data ?? [];
          this.Org_ID_Options = list.map((item: { No?: string; Name?: string }) => ({
            value: item.No ?? '',
            label: `${item.No ?? ''} - ${item.Name ?? ''}`,
          }));
        });
      //會計科目
      this.fin55070Service.getAccNoList().subscribe(res => {
        this.AccNo_Options = res;
      });
    }
  }
}
