import { NgIf } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { validateRequired } from '@shared/componentkit/table-edit/validate-field.model';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { PanelModule } from 'primeng/panel';
import { finalize, forkJoin } from 'rxjs';
import { CPM12050Data, CPM12050Service, InsertCPM12050DetailRequest, InsertCPM12050Request, UpdateCPM12050DetailRequest, UpdateCPM12050Request } from '../../../service/api/cpm/cpm12050.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { InputTextareaComponent } from '../../../shared/componentkit/input-textarea/input-textarea.component';

@Component({
  selector: 'app-cpm12050-cru',
  templateUrl: './cpm12050-cru.component.html',
  standalone: true,
  imports: [
    NgIf,
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    InputTextareaComponent,
    DropdownComponent,
    TranslateModule,
    TableEditComponent
  ]
})
export class CPM12050CRUComponent extends BasicCruPageComponent<CPM12050Data> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    KIND_ID: [null as string | null, Validators.required],           // 意見類型（必填）
    KIND_ID_SUB: [null as string | null, Validators.required],       // 意見子類型（必填）
    SUGG_SOURCE: [null as string | null, Validators.required],       // 建議來源（必填）
    ORG_ID_QUERY: [null as string | null, Validators.required],                     // 組織(查詢責任單位用)
    ORG_ID: [null as string | null, Validators.required],            // 責任單位（必填）
    COMPLAIN_NOTES: [null, [Validators.required, Validators.maxLength(1000)]],    // 顧客意見內容（必填）
    CUST_NAME: [null, Validators.maxLength(20)],                              // 客戶姓名
    SEX: [null],                                    // 性別
    CONTACT_ADDR: [null],                           // 聯絡地址
    CONTACT_TEL: [null, Validators.maxLength(30)],                            // 聯絡電話
    CELL_PHONE: [null, Validators.maxLength(30)],                             // 手機號碼
    E_MAIL: [null, [Validators.email, Validators.maxLength(100)]],                                 // Email
    SUGG_SOURCE_OTHER: [null, Validators.required],                      // 其他建議來源
    MEMBER_ID: [null],                              // 會員編號
    CRT_USR_No: [null],                                 // 建檔人編號
    CRT_USR_Name: [null]                                // 建檔人姓名
  });

  //#region 下拉選單
  // 性別選項
  sexOptions = [
    { label: '男', value: 'M' },
    { label: '女', value: 'F' }
  ];
  // 意見類型選項
  kindIdOptions: any[] = [];
  // 意見子類型選項
  kindIdSubOptions: any[] = [];
  // 建議來源選項
  suggSourceOptions = [
    { label: 'WEB', value: 'WEB' },
    { label: 'APP', value: 'APP' },
  ];
  // 組織選項
  orgIdQueryOptions: any[] = [];
  // 責任單位選項
  orgIdOptions: any[] = [];
  //#endregion

  // 編輯table設定
  @ViewChild(TableEditComponent) tableEditComponent!: TableEditComponent;
  data: any[] = [];
  columns: EditColumn[] = [
    {
      field: 'ANSWER',
      header: '回覆內容',
      type: 'input',
      validate: [validateRequired]
    },
    {
      field: 'ANSWER_ID',
      header: '回覆人員編號',
      type: 'input',
      validate: [validateRequired]
    },
    {
      field: 'CRT_USR_No',
      header: '使用者編號',
      type: 'input',
      validate: [validateRequired]
    },
    {
      field: 'CRT_USR_Name',
      header: '使用者名稱',
      type: 'input',
      validate: [validateRequired]
    }
  ];

  constructor(
    private cpm12050Service: CPM12050Service,
    private dropDownListService: DropDownListService,
    private dropdownApiService: DropdownApiService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('CPM12050', this.dataForm);
    this.loadOptions();
    if (this.rowdata) {
      // 預先載入下拉選項
      this.onKindChange(this.rowdata.KIND_ID!);
      this.onOrgQueryChange(this.rowdata.ORG_ID!);
      // 設定表單值
      this.dataForm.patchValue({
        KIND_ID: this.rowdata.KIND_ID,
        KIND_ID_SUB: this.rowdata.KIND_ID_SUB,
        ORG_ID_QUERY: this.rowdata.ORG_ID,
        ORG_ID: this.rowdata.CLASS_ID,
      });
      // 帶回明細資料
      this.cpm12050Service.queryCPM12050Detail({
        ID: this.rowdata.ID,
        SEQ_ID: this.rowdata.SEQ_ID!
      })
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe(response => {
          this.data = response.Data
        });
    }
  }

  onSubmit(form: FormGroup): void {
    const formValue = form.getRawValue();
    this.handleSubmit(form, () => {
      const valid = this.tableEditComponent.validateAndShowErrors();
      if (!valid) {
        this.loading = false;
        return;
      }
      switch (this.crudstatus) {
        case CRUDStatus.Create:
          if (this.canAdd()) {
            // 新增主檔request
            const insertRequest: InsertCPM12050Request = {
              ...formValue,
              USR_NO: formValue.CRT_USR_No,
              USR_NAME: formValue.CRT_USR_Name
            }

            // 新增明細request
            const insertDetailRequest: InsertCPM12050DetailRequest[] = this.data
              .map(item => ({
                ...item,
                ID: this.rowdata?.ID || 0,
                USR_NO: item.CRT_USR_No,
                USR_NAME: item.CRT_USR_Name
              }));

            // 使用 forkJoin 同時呼叫主檔和明細新增 API
            const requests = [
              this.cpm12050Service.insertCPM12050(insertRequest),
              this.cpm12050Service.insertCPM12050Detail(insertDetailRequest)
            ];

            forkJoin(requests)
              .pipe(
                untilDestroyed(this),
                finalize(() => this.loading = false)
              )
              .subscribe(() => {
                this.messageService.successBubble('新增成功');
                this.dataForm.reset(); // 重置表單
              });

          }
          break;
        case CRUDStatus.Edit:
          if (this.canEdit()) {
            // 修改主檔request
            const updateRequest: UpdateCPM12050Request = {
              ...formValue,
              USR_NO: formValue.CRT_USR_No,
              USR_NAME: formValue.CRT_USR_Name,
              STATUS: this.rowdata?.STATUS!
            }
            // 修改明細request
            const updateDetailRequest: UpdateCPM12050DetailRequest[] = this.data
              .map(item => ({
                ...item,
                ID: this.rowdata?.ID || 0,
                USR_NO: item.CRT_USR_No,
                USR_NAME: item.CRT_USR_Name
              }));
            // 使用 forkJoin 同時呼叫主檔和明細修改 API
            const requests = [
              this.cpm12050Service.updateCPM12050(updateRequest),
              this.cpm12050Service.updateCPM12050Detail(updateDetailRequest)
            ];
            forkJoin(requests)
              .pipe(
                untilDestroyed(this),
                finalize(() => this.loading = false)
              )
              .subscribe(() => {
                this.messageService.successBubble('修改成功');
                this.onCancel();
              });
          }
          break;
      }
    });
  }

  loadOptions() {
    // 獲取組織下拉選項
    this.dropDownListService.querySYS3100_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.orgIdQueryOptions = res.Data.map(item => ({
          ...item,
          value: item.No,
          label: `${item.No} - ${item.Name}`,
        }));
      })
    // 獲取意見類型下拉選項
    this.dropDownListService.queryCSS1002DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.kindIdOptions = this.kindIdOptions.concat(
          res.Data.map(item => ({
            value: item.No,
            label: `${item.No} - ${item.Name}`,
          }))
        );
      })
  }

  onOrgQueryChange(orgId: string) {
    if (!orgId) {
      this.orgIdOptions = [];
      this.dataForm.patchValue({ ORG_ID: null });
      return
    };
    this.dropdownApiService.queryCss1005({ ORG_ID: orgId })
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.orgIdOptions = res || [];
      });
  }

  onKindChange(kindId: string) {
    if (!kindId) {
      this.kindIdSubOptions = [];
      this.dataForm.patchValue({ KIND_ID_SUB: null });
      return;
    }
    this.dropDownListService.queryCSS1003DropDownList(kindId)
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.kindIdSubOptions = res.Data.map(item => ({
          value: item.No,
          label: `${item.No} - ${item.Name}`,
        }));
      })
  }
}