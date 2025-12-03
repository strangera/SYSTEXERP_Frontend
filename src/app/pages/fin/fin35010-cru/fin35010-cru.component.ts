import { AsyncPipe, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Fin35010Service } from '@service/api/fin/fin35010.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { InputNumberComponent } from "@shared/componentkit/input-number/input-number.component";
import { InputTextareaComponent } from "@shared/componentkit/input-textarea/input-textarea.component";
import { PanelModule } from 'primeng/panel';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { UpdateType } from '../fin35010/fin35010.model';

@Component({
  selector: 'app-fin35010-cru',
  templateUrl: './fin35010-cru.component.html',
  standalone: true,
  imports: [AsyncPipe, MenubarComponent, ButtonComponent, PanelModule, FormsModule, ReactiveFormsModule, InputTextComponent, DropdownComponent, CalendarComponent, NgIf, TranslateModule, InputNumberComponent, InputTextareaComponent]
})
export class FIN35010CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    In_Date: [new Date(), [Validators.required]],
    Deposit_Type: [null, [Validators.required]], // 保證類別
    CHK_Type: [null, [Validators.required]],
    Status: [{ value: '0', disabled: true }, [Validators.required]],
    CHK_No: [null, [Validators.maxLength(10)]],
    CHK_Amt: [null, [Validators.required, Validators.max(9999999999)]],
    CHK_ExpireDate: [null],
    Deposit_Date: [null],
    Return_Date: [null],
    VEN_No: [null],
    VEN_Name: [{ value: null, disabled: true }],
    tlt_no: [null],
    return_edate: [null],
    return_get_person: [null, [Validators.maxLength(50)]],
    Remark: [null, [Validators.maxLength(160)]],
  });
  VEN_NoOptions = this.dropdown.queryPos2013({ VEN_Flag: '' });
  tlt_noOptions = this.dropdown.queryTltTalent();
  // 保證金類型 (1=押金 2=履約保證金 3=施工保證金 4=開業保證金)
  Deposit_TypeOptions = [
    { value: '1', label: '押金' },
    { value: '2', label: '履約保證金' },
    { value: '3', label: '施工保證金' },
    { value: '4', label: '開業保證金' },
  ];
  // 票據種類 (1=支票 2=本票 3=銀行保證函 4=其他)
  CHK_TypeOptions = [
    { value: '1', label: '支票' },
    { value: '2', label: '本票' },
    { value: '3', label: '銀行保證函' },
    { value: '4', label: '其他' },
  ];
  // (0=未繳票 1=已繳票 2=已退票 3=封存)
  StatusOptions = [
    { value: '0', label: '未繳票' },
    { value: '1', label: '已繳票' },
    { value: '2', label: '已退票' },
    { value: '3', label: '封存' },
  ]
  constructor(
    public readonly fin35010Service: Fin35010Service,
    private readonly dropdown: DropdownApiService
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('FIN35010', this.dataForm);
    if (this.isFormCreateable && this.rowdata) {
      switch (this.rowdata) {
        case UpdateType.Deposit: this.formTitle = '新增【繳票】資訊'; break;
        case UpdateType.CancelDeposit: this.formTitle = '新增【取消繳票】資訊'; break;
        case UpdateType.Refund: this.formTitle = '新增【退票】資訊'; break;
        case UpdateType.CancelRefund: this.formTitle = '新增【取消退票】資訊'; break;
        default: break;
      }
    }
  }
  onReadContractAdd() {

  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => { });
  }
}
