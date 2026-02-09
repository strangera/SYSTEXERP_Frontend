import { AsyncPipe, NgIf } from '@angular/common';
import { Component, OnInit, } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { Fin31010Service, QueryFin31010Response } from '@service/api/fin/fin31010.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextareaComponent } from "@shared/componentkit/input-textarea/input-textarea.component";
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';

//1.3.1.1 收款項目對照會計科目維護 CRU
@Component({
  selector: 'app-fin31010-cru',
  templateUrl: './fin31010-cru.component.html',
  standalone: true,
  imports: [CalendarComponent, DropdownComponent, MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, InputTextComponent, ButtonComponent, NgIf, AsyncPipe, InputTextareaComponent]
})
export class FIN31010CRUComponent extends BasicCruPageComponent<QueryFin31010Response> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    id: [null], // PK
    CAP_Item: [{ value: '系統自動給號', disabled: true }], // 收款項目代號
    CAP_Name: [null, [Validators.maxLength(30)]], // 收款項目名稱
    AccNo: [null], // 會計科目代號
    Remark: [null, [Validators.maxLength(100)]], // 備註
    CRT_Date: [{ value: null, disabled: true }], // CRT_USR_No
    CRT_USR_No: [{ value: null, disabled: true }], // CRT_USR_No
    CRT_USR_Name: [{ value: null, disabled: true }], // CRT_USR_Name
    UPD_Date: [{ value: null, disabled: true }], // UPD_Date
    UPD_USR_No: [{ value: null, disabled: true }], // UPD_USR_No
    UPD_USR_Name: [{ value: null, disabled: true }], // UPD_USR_Name
  });
  AccNoOptions = this.dropdown.queryGls1005_ledgerMD();

  constructor(
    private readonly fin31010Service: Fin31010Service,
    private readonly dropdown: DropdownApiService,
  ) {
    super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('FIN31010', this.dataForm);
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const $req = this.isFormCreateable ? this.fin31010Service.insertFin31010(frm.getRawValue()) : this.fin31010Service.updateFin31010(frm.getRawValue());
      $req.pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
        this.messageService.successBubble(res.Message);
        if (this.isFormCreateable) {
          this.dataForm.reset();
        } else {
          this.onCancel();
        }
      });
    });
  }
}
