import { NgIf } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { validateRequired } from '@shared/componentkit/table-edit/validate-field.model';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { PanelModule } from 'primeng/panel';
import { Observable, finalize, forkJoin } from 'rxjs';
import { CPM12050Data, CPM12050Service, InsertCPM12050DetailRequest, InsertCPM12050Request, UpdateCPM12050Request } from '../../../service/api/cpm/cpm12050.service';
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
    TableEditComponent,
    CalendarComponent
  ]
})
export class CPM12050CRUComponent extends BasicCruPageComponent<CPM12050Data> implements OnInit {
  // 若觸發高權限編輯，則強制允許編輯 (繞過一般權限判斷)
  forceEditAll = false;

  // 當需要強制高權限編輯時，覆寫 canEdit 判斷
  override canEdit(): boolean {
    if (this.forceEditAll) {
      return true;
    }
    return super.canEdit();
  }
  dataForm = this.formBuilder.nonNullable.group({
    KIND_ID: [null as string | null, Validators.required],                        // 意見類型（必填）
    KIND_ID_SUB: [null as string | null, Validators.required],                    // 意見子類型（必填）
    SUGG_SOURCE: [null as string | null, Validators.required],                    // 建議來源（必填）
    ORG_ID_QUERY: [null as string | null, Validators.required],                   // 組織(查詢責任單位用)
    ORG_ID: [null as string | null, Validators.required],                         // 責任單位（必填）
    COMPLAIN_NOTES: [null, [Validators.required, Validators.maxLength(1000)]],    // 顧客意見內容（必填）
    CUST_NAME: [null, Validators.maxLength(20)],                                  // 客戶姓名
    SEX: [null],                                                                  // 性別
    CONTACT_ADDR: [null],                                                         // 聯絡地址
    CONTACT_TEL: [null, Validators.maxLength(30)],                                // 聯絡電話
    CELL_PHONE: [null, Validators.maxLength(30)],                                 // 手機號碼
    E_MAIL: [null, [Validators.email, Validators.maxLength(100)]],                // Email
    // SUGG_SOURCE_OTHER: [null, Validators.required],                               // 其他建議來源
    MEMBER_ID: [null],                                                            // 會員編號
    CRT_USR_No: [null as string | null],                                           // 建檔人編號
    CRT_USR_Name: [null as string | null],
    COMPLAIN_DATE: [null],
    ALERT_DATE: [null],
    ANSWER_YN: [null],
    SUGG_TYPE: [null],
    CLASS_EMAIL: [null],
  });
  ANSWER_YNOptions = [
    { label: '已建立', value: 'S' },
    { label: '已派單', value: 'W' },
    { label: '處理中', value: 'Y' },
    { label: '結案', value: 'Z' }
  ];
  SUGG_TYPEOptions = [
    { label: '客訴', value: '0' },
    { label: '表揚', value: '1' },

  ];

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
      header: '處理記錄',
      type: 'input',
      validate: [validateRequired]
    },
    {
      field: 'ANSWER_DATE',
      header: '處理日期時間',
      type: 'date',
      validate: [validateRequired]
    },
    {
      field: 'ANSWER_ID',
      header: '處理者',
      type: 'input',
      validate: [validateRequired]
    },

  ];

  // 判斷是否為已存在的明細（有 SEQ_ID 的為既有資料，不可編輯）
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  isExistingDetail = (rowData: Record<string, any>): boolean => !!rowData['SEQ_ID'];

  constructor(
    private cpm12050Service: CPM12050Service,
    private dropDownListService: DropDownListService,
    private dropdownApiService: DropdownApiService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('CPM12050', this.dataForm);
    // 讀取導航 state 是否帶入 forceEditAll
    const state = this.router.lastSuccessfulNavigation?.extras.state;
    this.forceEditAll = !!state?.['forceEditAll'];
    this.loadOptions();
    // 若為編輯或檢視狀態，帶回資料
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

    // 隱藏的建檔人欄位需自動帶入目前使用者，送出時傳至後端
    const user = this.authService.getUserInfo();
    if (user) {
      this.dataForm.patchValue({
        CRT_USR_No: user.user_No ?? null,
        CRT_USR_Name: user.user_Name ?? null
      });
    }

    // 設定表單控制項的可編輯狀態：
    // - 若由高權限打開（forceEditAll），則全部可編輯
    // - 若為 Edit 模式，僅允許特定欄位可編輯，其餘欄位設為唯讀/disabled
    this.configureFormControls();
  }

  // 依照 crudstatus 與 forceEditAll 設定各 form 控制項 enable/disable
  configureFormControls() {
    const editableOnEdit = ['CONTACT_ADDR', 'CONTACT_TEL', 'CELL_PHONE', 'E_MAIL'];
    // 若為高權限，全部啟用
    if (this.forceEditAll) {
      const ctrls: any = this.dataForm.controls as any;
      Object.keys(ctrls).forEach((name: string) => {
        ctrls[name].enable();
      });
      return;
    }
    // Create：全部啟用； Read：保持現狀（initializePage 會處理 disable）； Edit：只啟用白名單
    if (this.crudstatus === CRUDStatus.Create) {
      const ctrls: any = this.dataForm.controls as any;
      Object.keys(ctrls).forEach((name: string) => {
        ctrls[name].enable();
      });
      return;
    }
    if (this.crudstatus === CRUDStatus.Edit) {
      const ctrls: any = this.dataForm.controls as any;
      Object.keys(ctrls).forEach((name: string) => {
        if (editableOnEdit.includes(name)) {
          ctrls[name].enable();
        } else {
          ctrls[name].disable();
        }
      });
      return;
    }
    // Read 模式：由 initializePage 控制是否 disable，這裡不強制修改
  }

  onSubmit(form: FormGroup): void {
    const formValue = form.getRawValue();
    this.handleSubmit(form, () => {
      if (this.tableEditComponent) {
        const valid = this.tableEditComponent.validateAndShowErrors();
        if (!valid) {
          this.loading = false;
          return;
        }
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

            // 只呼叫主檔新增（新增模式無明細資料）
            this.cpm12050Service.insertCPM12050(insertRequest)
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
              ID: this.rowdata?.ID || 0,
              USR_NO: formValue.CRT_USR_No,
              USR_NAME: formValue.CRT_USR_Name,
              STATUS: this.rowdata?.STATUS!
            }
            // 過濾出新增的明細（沒有 SEQ_ID 的是新資料）
            const newDetails: InsertCPM12050DetailRequest[] = this.data
              .filter(item => !item.SEQ_ID)
              .map(item => ({
                ...item,
                SEQ_ID: this.rowdata?.SEQ_ID || '',
                USR_NO: formValue.CRT_USR_No,
                USR_NAME: formValue.CRT_USR_Name
              }));

            // 組合 API 請求：主檔修改 + 新明細新增（若有）
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const requests: Observable<any>[] = [
              this.cpm12050Service.updateCPM12050(updateRequest)
            ];
            if (newDetails.length > 0) {
              requests.push(this.cpm12050Service.insertCPM12050Detail(newDetails));
            }

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
    // 直接載入責任單位選項，與 ORG_ID_QUERY 無關，保持獨立
    this.dropdownApiService.queryCss1005()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.orgIdOptions = res || [];
      });
  }

  onOrgQueryChange(orgId: string) {
    // 不更動 orgIdOptions，讓 ORG_ID 與 ORG_ID_QUERY 完全獨立
    return;
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
