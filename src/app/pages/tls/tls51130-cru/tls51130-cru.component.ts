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
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';

// 只在這個 component 內直接呼叫小分類 API（不動 service 型別）
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

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
    InputNumberComponent
  ],
})
export class TLS51130CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  LOGOOptions: any[] = [];
  CAT_LOptions: any[] = [];
  CAT_MOptions: any[] = [];
  CAT_SOptions: any[] = [];

  private readonly apiUrl = environment.ApiUrl;

  dataForm = this.formBuilder.nonNullable.group({
    id: [0],
    LOGO_No: ['', Validators.required],
    CAT_LNo: ['', Validators.required],
    CAT_MNo: [''],
    CAT_SNo: [''],
    PLU_OrderPrcRate: [null, [Validators.min(0), Validators.max(99.99)]],
    DISC_Remark: [''],
  });

  constructor(
    private tls51130Service: TLS51130Service,
    private dropDownListService: DropDownListService,
    private http: HttpClient,
  ) {
    super();
  }

  private combine(code?: any, name?: any) {
    const a = (code ?? '').toString().trim();
    const b = (name ?? '').toString().trim();
    return a && b ? `${a}-${b}` : (a || b || '');
  }

  private loadMOptions(catLNo: string) {
    const param = { CAT_LNo: [catLNo] };
    return this.dropDownListService.queryPOS20031_DropDownList(param).pipe(
      tap((res: any) => {
        const nestedData = res?.Data || [];
        this.CAT_MOptions = nestedData.map((item: any) => ({
          label: this.combine(item.No, item.Name), // no-name
          value: (item.No ?? '').toString().trim(),
        }));
      })
    );
  }

  /** 這裡直呼 API，送 { CATList: [{CAT_LNo, CAT_MNo}] } */
  private loadSOptions(catLNo: string, catMNo: string) {
    const body = {
      CATList: [
        { CAT_LNo: (catLNo ?? '').toString().trim(), CAT_MNo: (catMNo ?? '').toString().trim() }
      ]
    };

    return this.http.post<any>(`${this.apiUrl}/queryPOS20032_DropDownList`, body).pipe(
      tap((res: any) => {
        const nestedData = res?.Data || [];
        this.CAT_SOptions = nestedData.map((item: any) => ({
          label: this.combine(item.No, item.Name), // no-name
          value: (item.No ?? '').toString().trim(),
        }));
      })
    );
  }

  ngOnInit(): void {
    this.initializePage('TLS51130', this.dataForm);

    // 品牌下拉：no-name
    this.dropDownListService.queryPLULOGO_HOS_No_DropDownList().subscribe((res) => {
      const nestedData = res?.Data || [];
      this.LOGOOptions = nestedData.map((item: any) => ({
        label: this.combine(item.No, item.Name),
        value: (item.No ?? '').toString().trim(),
      }));
    });

    // 大分類下拉：no-name
    this.dropDownListService.queryPOS2003_DropDownList().subscribe((res) => {
      const nestedData = res?.Data || [];
      this.CAT_LOptions = nestedData.map((item: any) => ({
        label: this.combine(item.No, item.Name),
        value: (item.No ?? '').toString().trim(),
      }));
    });

    // 大分類改變 → 查中分類
    this.dataForm.controls.CAT_LNo.valueChanges.subscribe((catLNo: string) => {
      catLNo = (catLNo ?? '').toString().trim();
      if (catLNo) {
        this.loadMOptions(catLNo).subscribe(() => {
          this.dataForm.controls.CAT_MNo.setValue('');
          this.CAT_SOptions = [];
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
      const catLNo = (this.dataForm.controls.CAT_LNo.value ?? '').toString().trim();
      catMNo = (catMNo ?? '').toString().trim();
      if (catLNo && catMNo) {
        this.loadSOptions(catLNo, catMNo).subscribe(() => {
          this.dataForm.controls.CAT_SNo.setValue('');
        });
      } else {
        this.CAT_SOptions = [];
        this.dataForm.controls.CAT_SNo.setValue('');
      }
    });

    // 編輯/檢視模式：預載中/小分類
    setTimeout(() => {
      if (this.crudstatus !== CRUDStatus.Create) {
        const incomingId =
          this.dataForm.controls.id.value ||
          (this as any).data?.id ||
          (this as any).detail?.id;

        if (incomingId != null) {
          this.dataForm.controls.id.setValue(incomingId);
        }

        const catLNo = (this.dataForm.controls.CAT_LNo.value ?? '').toString().trim();
        const catMNo = (this.dataForm.controls.CAT_MNo.value ?? '').toString().trim();
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
            const { id, ...createDto } = formValue;
            this.tls51130Service.insertTLS51130(createDto).subscribe(() => {
              this.messageService.successBubble('新增成功');
              this.dataForm.reset();
            });
          }
          break;

        case CRUDStatus.Edit:
          if (this.canEdit()) {
            const updateDto = {
              id: formValue.id,
              LOGO_No: formValue.LOGO_No,
              CAT_LNo: formValue.CAT_LNo,
              CAT_MNo: formValue.CAT_MNo,
              CAT_SNo: formValue.CAT_SNo,
              PLU_OrderPrcRate: formValue.PLU_OrderPrcRate,
              DISC_Remark: formValue.DISC_Remark,
            };

            this.tls51130Service.updateTLS51130(updateDto).subscribe(() => {
              this.messageService.successBubble('更新成功');
              this.onCancel();
            });
          }
          break;
      }
    });
  }
}
