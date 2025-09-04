import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { TLS51130Service } from '../../../service/api/tls/tls51130.service';
import { DropDownListService } from '../../../service/utility/dropDownList.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { tap } from 'rxjs';


@Component({
    selector: 'app-tls51130-cru',
    templateUrl: './tls51130-cru.component.html',
    styleUrls: ['./tls51130-cru.component.scss'],
    standalone: true,
    imports: [
        MenubarComponent,
        ButtonComponent,
        PanelModule,
        FormsModule,
        ReactiveFormsModule,
        DropdownComponent,
        InputTextComponent,
        NgIf,
        TranslateModule,
    ],
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
  private loadMOptions(catLNo: string) {
  const param = { CAT_LNo: [catLNo] };
  return this.dropDownListService.queryPOS20031_DropDownList(param).pipe(
    tap((res: any) => {
      const nestedData = res?.Data || [];
      this.CAT_MOptions = nestedData.map((item: any) => ({
        label: `${item.No?.toString().trim()}/${item.Name?.toString().trim()}`.replace(/^\/|\/$/g, ''),
        value: item.No,
      }));
    })
  );
}

private loadSOptions(catLNo: string, catMNo: string) {
  const param = { CAT_LNo: [catLNo], CAT_MNo: [catMNo] };
  return this.dropDownListService.queryPOS20032_DropDownList(param).pipe(
    tap((res: any) => {
      const nestedData = res?.Data || [];
      this.CAT_SOptions = nestedData.map((item: any) => ({
        label: `${item.No?.toString().trim()}/${item.Name?.toString().trim()}`.replace(/^\/|\/$/g, ''),
        value: item.No,
      }));
    })
  );
}

  ngOnInit(): void {
  this.initializePage('TLS51130', this.dataForm);

  // 小工具：把 code/name 合併成 "code/name"
  const combine = (code?: any, name?: any) => {
    const a = (code ?? '').toString().trim();
    const b = (name ?? '').toString().trim();
    return a && b ? `${a}/${b}` : (a || b || '');
  };

  // 品牌（如也想合併可改成 label: combine(item.No, item.Name)）
  this.dropDownListService.queryPLULOGO_HOS_No_DropDownList().subscribe((res) => {
    const nestedData = res?.Data || [];
    this.LOGOOptions = nestedData.map((item: any) => ({
      label: item.Name,
      value: item.No,
    }));
  });

  // 初始化大分類：label 顯示 "編號/名稱"
  this.dropDownListService.queryPOS2003_DropDownList().subscribe((res) => {
    const nestedData = res?.Data || [];
    this.CAT_LOptions = nestedData.map((item: any) => ({
      label: combine(item.No, item.Name),
      value: item.No,
    }));
  });

  // 大分類改變 → 查中分類（label 也合併）
  this.dataForm.controls.CAT_LNo.valueChanges.subscribe((catLNo: string) => {
    if (catLNo) {
      const param = { CAT_LNo: [catLNo] };
      this.dropDownListService.queryPOS20031_DropDownList(param).subscribe((res) => {
        const nestedData = res?.Data || [];
        this.CAT_MOptions = nestedData.map((item: any) => ({
          label: combine(item.No, item.Name),
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

  // 中分類改變 → 查小分類（label 也合併）
  this.dataForm.controls.CAT_MNo.valueChanges.subscribe((catMNo: string) => {
    const catLNo = this.dataForm.controls.CAT_LNo.value;
    if (catLNo && catMNo) {
      const param = { CAT_LNo: [catLNo], CAT_MNo: [catMNo] };
      this.dropDownListService.queryPOS20032_DropDownList(param).subscribe((res) => {
        const nestedData = res?.Data || [];
        this.CAT_SOptions = nestedData.map((item: any) => ({
          label: combine(item.No, item.Name),
          value: item.No,
        }));
        this.dataForm.controls.CAT_SNo.setValue(''); // reset
      });
    } else {
      this.CAT_SOptions = [];
      this.dataForm.controls.CAT_SNo.setValue('');
    }
  });

  // 編輯模式：載入對應中/小分類選項（label 也用合併格式）
  // ✅ 不論 Edit 或 Read（只排除 Create），都預載中/小分類選項，讓檢視模式有 label
  setTimeout(() => {  // 確保 initializePage 已把值灌進表單
    if (this.crudstatus !== CRUDStatus.Create) {
      const catLNo = this.dataForm.controls.CAT_LNo.value;
      const catMNo = this.dataForm.controls.CAT_MNo.value;
      if (catLNo) {
        this.loadMOptions(catLNo).subscribe(() => {
          if (catMNo) {
            this.loadSOptions(catLNo, catMNo).subscribe();
          }
        });
      }
    }
  }, 0);
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