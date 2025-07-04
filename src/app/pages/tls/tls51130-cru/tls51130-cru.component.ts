import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { TLS51130Service } from '../../../service/api/tls/tls51130.service';
import { DropDownListService } from '../../../service/api/dropdownservice/dropDownList.service';


@Component({
  selector: 'app-tls51130-cru',
  templateUrl: './tls51130-cru.component.html',
  styleUrls: ['./tls51130-cru.component.scss'],
})
export class TLS51130CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  LOGOOptions: any[] = [];
  CAT_LOptions: any[] = [];
  CAT_MOptions: any[] = [];
  CAT_SOptions: any[] = [];

  dataForm = this.formBuilder.nonNullable.group({
    LOGO_No: ['', Validators.required],
    CAT_LNo: ['', Validators.required],
    CAT_MNo: [''],
    CAT_SNo: [''],
    PLU_OrderPrcRate: [''],
    DISC_Remark: [''],
  });

  constructor(
    private tls51130Service: TLS51130Service,
    private dropDownListService: DropDownListService,
    
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS51130', this.dataForm);
    

    this.dropDownListService.queryPLULOGO_HOS_No_DropDownList().subscribe((res) => {
      const nestedData = res?.Data || [];
      this.LOGOOptions = nestedData.map((item) => ({
        label: item.Name,
        value: item.No,
      }));
    });

    // 初始化大分類
    this.dropDownListService.queryPOS2003_DropDownList().subscribe((res) => {
      const nestedData = res?.Data || [];
      this.CAT_LOptions = nestedData.map((item) => ({
        label: item.Name,
        value: item.No,
      }));
    });

    // 大分類改變 → 查中分類
    this.dataForm.controls.CAT_LNo.valueChanges.subscribe((catLNo: string) => {
      if (catLNo) {
        const param = { CAT_LNo: [catLNo] };
        this.dropDownListService.queryPOS20031_DropDownList(param).subscribe((res) => {
          const nestedData = res?.Data || [];
          this.CAT_MOptions = nestedData.map((item) => ({
            label: item.Name,
            value: item.No,
          }));
          this.dataForm.controls.CAT_MNo.setValue(''); // reset
          this.CAT_SOptions = []; // reset 小分類
          this.dataForm.controls.CAT_SNo.setValue('');
        });
      } else {
        this.CAT_MOptions = [];
        this.CAT_SOptions = [];
        this.dataForm.controls.CAT_MNo.setValue('');
        this.dataForm.controls.CAT_SNo.setValue('');
      }
    });

    // 中分類改變 → 查小分類
    this.dataForm.controls.CAT_MNo.valueChanges.subscribe((catMNo: string) => {
      const catLNo = this.dataForm.controls.CAT_LNo.value;
      if (catLNo && catMNo) {
        const param = {
          CAT_LNo: [catLNo],
          CAT_MNo: [catMNo],
        };
        this.dropDownListService.queryPOS20032_DropDownList(param).subscribe((res) => {
          const nestedData = res?.Data || [];
          this.CAT_SOptions = nestedData.map((item) => ({
            label: item.Name,
            value: item.No,
          }));
          this.dataForm.controls.CAT_SNo.setValue(''); // reset
        });
      } else {
        this.CAT_SOptions = [];
        this.dataForm.controls.CAT_SNo.setValue('');
      }
    });
    // 如果是編輯模式且有值，就觸發查詢中分類與小分類
if (this.crudstatus === CRUDStatus.Edit) {
  const catLNo = this.dataForm.controls.CAT_LNo.value;
  const catMNo = this.dataForm.controls.CAT_MNo.value;

  if (catLNo) {
    const paramL = { CAT_LNo: [catLNo] };
    this.dropDownListService.queryPOS20031_DropDownList(paramL).subscribe((res) => {
      const midData = res?.Data || [];
      this.CAT_MOptions = midData.map((item) => ({ label: item.Name, value: item.No }));

      // 若原本就有中分類值，再查小分類
      if (catMNo) {
        const paramM = {
          CAT_LNo: [catLNo],
          CAT_MNo: [catMNo]
        };
        this.dropDownListService.queryPOS20032_DropDownList(paramM).subscribe((res2) => {
          const subData = res2?.Data || [];
          this.CAT_SOptions = subData.map((item) => ({ label: item.Name, value: item.No }));
        });
      }
    });
  }}
  }

  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const formValue = form.getRawValue();

      switch (this.crudstatus) {
        case CRUDStatus.Create:
          if (this.canAdd()) {
            this.tls51130Service.insertTLS51130(formValue).subscribe(() => {
              this.messageService.successBubble('新增成功');
              this.dataForm.reset();
            });
          }
          break;
        case CRUDStatus.Edit:
          if (this.canEdit()) {
            this.tls51130Service.updateTLS51130(formValue).subscribe(() => {
              this.messageService.successBubble('更新成功');
              this.onCancel();
            });
          }
          break;
      }
    });
  }
}