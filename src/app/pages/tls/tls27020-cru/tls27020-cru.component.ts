import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { PanelModule } from 'primeng/panel';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { NgIf } from '@angular/common';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { DropdownComponent, InputNumberComponent } from '@shared/componentkit';
import { InsertTLS27020, TLS27020Data, TLS27020Service, UpdateTLS27020 } from '@service/api/tls/tls27020.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { combineLatest, distinctUntilChanged, filter, finalize } from 'rxjs';

@Component({
  selector: 'app-tls27020-cru',
  templateUrl: './tls27020-cru.component.html',
  standalone: true,
  imports: [MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, CalendarComponent, InputTextComponent, ButtonComponent, NgIf, TranslateModule, InputNumberComponent, DropdownComponent]
})
export class TLS27020CRUComponent extends BasicCruPageComponent<TLS27020Data> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    TXN_Date: ['', Validators.required], // 銷售日期
    ECR_No: ['', Validators.required], // 收銀機號
    TLT_NO: [''], // 專櫃編號
    TLT_Name: [{ value: '', disabled: true }], // 櫃位名稱
    magneticCard: [''], // 磁卡編號 目前資料庫沒有
    ACT_PayAmt_ori: [{ value: '', disabled: true }], /*顯示用金額*/
    ACT_PayAmt: [null, [Validators.max(99999999.9999), Validators.required]], /*實際金額*/
    MOD_PayAmt: [null],
  });
  now = new Date();
  TLTTALENT_DropDownList: { No: string, Name: string, label: string }[] = [];
  ECR_NoOptions: { No: string, Name: string, label: string }[] = [];
  IsExist = false;
  constructor(
    private readonly dropDownList: DropDownListService,
    private readonly tLS27020Service: TLS27020Service,
  ) {
    super();
  }
  ngOnInit(): void {
    this.initializePage('TLS27020', this.dataForm);
    this.dropDownList.queryPOS1002_DropDownList().pipe(untilDestroyed(this)).subscribe(options => {
      this.ECR_NoOptions = options.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}` }));
    });
    this.dropDownList.queryTLTTALENT_DropDownList().pipe(untilDestroyed(this)).subscribe(res => {
      this.TLTTALENT_DropDownList = res.Data.map(item => ({
        ...item, label: `${item.No} - ${item.Name}`
      }));
      const selectedItem = this.TLTTALENT_DropDownList.find(item => item.No === this.rowdata?.TLT_NO)?.Name ?? '';
      this.dataForm.controls.TLT_Name.setValue(selectedItem);
      this.dataForm.controls.TLT_Name.disable({ emitEvent: false });
      this.dataForm.controls.TLT_NO.valueChanges.pipe(untilDestroyed(this)).subscribe(value => {
        const selectedItem = this.TLTTALENT_DropDownList.find(item => item.No === value)?.Name ?? '';

        this.dataForm.controls.TLT_Name.setValue(selectedItem);
        this.dataForm.controls.TLT_Name.disable({ emitEvent: false });
      });
    });
    combineLatest([
      this.dataForm.controls.TXN_Date.valueChanges,
      this.dataForm.controls.ECR_No.valueChanges
    ])
      .pipe(
        filter(([txnDate, ecrNo]) => !!txnDate && !!ecrNo), // 兩個都不為空
        distinctUntilChanged(([prevTxn, prevEcr], [currTxn, currEcr]) =>
          prevTxn === currTxn && prevEcr === currEcr
        ),
        untilDestroyed(this)
      )
      .subscribe(([txnDate, ecrNo]) => {
        const SYS_StoreNo = this.authService.currentUserValue?.SYS_StoreNo;
        if (!SYS_StoreNo) { return; }

        const body = {
          SYS_StoreNo,
          TXN_Date: txnDate,
          ECR_No: ecrNo,
        };
        this.tLS27020Service.queryIsExist(body).subscribe(res => {
          this.IsExist = res.Data;
        });
      });

  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const serviceCall = this.isFormCreateable
        ? this.tLS27020Service.insertTLS27020(this.createTLS27020(frm))
        : this.tLS27020Service.updateTLS27020(this.updateTLS27020(frm));
      serviceCall.pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe({
        next: (res) => {
          this.messageService.successBubble(res.Message);
          if (this.isFormCreateable) {
            this.dataForm.reset();
          } else if (this.isFormEditable) {
            this.onCancel();
          }
        },
      });
    });
  }
  createTLS27020(frm: FormGroup): InsertTLS27020 {
    return {
      SYS_StoreNo: this.authService.currentUserValue?.SYS_StoreNo,
      ...frm.value,
      ACT_PayAmt_ori: this.isFormCreateable ? undefined : frm.getRawValue().ACT_PayAmt_ori,
      MOD_PayAmt: this.isFormCreateable ? undefined : frm.getRawValue().MOD_PayAmt,
      magneticCard: undefined,
    }
  }
  updateTLS27020(frm: FormGroup): UpdateTLS27020 {
    return {
      id: this.rowdata?.id ?? 0,
      ACT_PayAmt_ori: this.rowdata?.ACT_PayAmt_ori ?? 0,
      BOOK_PayAmt: this.rowdata?.BOOK_PayAmt ?? 0,
      ACT_PayAmt: frm.getRawValue().ACT_PayAmt,
      MOD_PayAmt: frm.getRawValue().MOD_PayAmt,
    };
  }
}
