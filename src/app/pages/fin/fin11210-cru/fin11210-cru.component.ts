import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { FIN11210Data, InsertFIN11210Request, UpdateFIN11210Request, FIN11210Service } from '../../../service/api/fin/fin11210.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { NgIf } from '@angular/common';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { finalize } from 'rxjs';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { DropDownListService } from '@service/utility/dropDownList.service';

@Component({
  selector: 'app-fin11210-cru',
  templateUrl: './fin11210-cru.component.html',
  standalone: true,
  imports: [
    NgIf,
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    TranslateModule,
    DropdownComponent
  ]
})
export class FIN11210CRUComponent extends BasicCruPageComponent<FIN11210Data> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    ECR_No: [null, [Validators.required]],     // 收銀機號
    ARG_No: [null, [Validators.required]],     // 參數代號
    ARG_Data: [null, [Validators.required]],  // 參數內容
    ARG_Desc: [{ value: null, disabled: true }]        // 參數說明
  });

  ECR_No_Options: any[] = [
    { Name: '全機台', No: 'ALL' }
  ];
  ARG_No_Options: any[] = [];

  constructor(
    private fin11210Service: FIN11210Service,
    private dropDownListService: DropDownListService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN11210', this.dataForm);
    this.loadOptions();
    if (this.crudstatus === CRUDStatus.Edit) {
      // 編輯時 僅可編輯參數內容
      this.dataForm.get('ECR_No')?.disable();
      this.dataForm.get('ARG_No')?.disable();
      this.dataForm.get('ARG_Desc')?.disable();
    }
  }

  onSubmit(form: FormGroup): void {
    const formValue = form.getRawValue();
    this.handleSubmit(form, () => {
      // 新增
      if (this.crudstatus === CRUDStatus.Create) {
        const insertRequest: InsertFIN11210Request = {
          ECR_No: formValue.ECR_No || '',
          ARG_No: formValue.ARG_No || '',
          ARG_Data: formValue.ARG_Data || '',
          ARG_Desc: formValue.ARG_Desc || ''
        }
        this.fin11210Service.insertFIN11210(insertRequest)
          .pipe(untilDestroyed(this), finalize(() => this.loading = false))
          .subscribe(() => {
            this.messageService.successBubble('新增成功');
            this.dataForm.reset(); // 重置表單
          });
      }
      // 修改
      else if (this.crudstatus === CRUDStatus.Edit) {
        const updateRequest: UpdateFIN11210Request = {
          ID: this.rowdata?.ID!,
          ARG_Data: formValue.ARG_Data || ''
        }
        this.fin11210Service.updateFIN11210(updateRequest)
          .pipe(untilDestroyed(this), finalize(() => this.loading = false))
          .subscribe(() => {
            this.messageService.successBubble('修改成功');
            this.onCancel();  // 返回查詢頁
          });
      }
    });
  }

  loadOptions() {
    // 取得收銀機號下拉選單資料
    this.dropDownListService.queryPOS1002_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.ECR_No_Options.push(...response.Data);
      });
    // 取得參數代號下拉選單資料
    this.dropDownListService.querySYS1000_DropDownList({ SYS_Type: 'ARG_NO' })
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.ARG_No_Options = response.Data
          .map(item => ({
            No: item.No,
            Name: `${item.No} - ${item.Name}`
          }));
      });
  }

  onARGNoChange(event: any) {
    this.dataForm.patchValue({
      ARG_Desc: this.ARG_No_Options.find(x => x.No === event)?.Name.split(' - ')[1] || ''
    });
  }
}