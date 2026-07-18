import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PanelModule } from 'primeng/panel';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';

import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

import { untilDestroyed } from '@ngneat/until-destroy';
import { EditFIN41020Request, FIN41020Data, FIN41020Service } from '@service/api/fin/fin41020.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { finalize } from 'rxjs';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { TableEditComponent } from '../fin13040-cru/fin13040-table-edit/fin13040-table-edit.component';
import { EditColumn } from '../fin13040-cru/fin13040-table-edit/fin13040-table-edit.model';

@Component({
  selector: 'app-fin41020-cru',
  templateUrl: './fin41020-cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    ButtonComponent,
    NgIf,
    TranslateModule,
    TableEditComponent,
  ],
})
export class FIN41020CRUComponent extends BasicCruPageComponent<FIN41020Data> implements OnInit {
  // 表單初始化
  dataForm = this.formBuilder.nonNullable.group({
    OrgId: ['', [Validators.required]], // 部門代號
    BudgetYear: ['', [Validators.required]], // 年度
    BudgetVersion: ['', [Validators.required]], // 版本
    AccNo: ['', [Validators.required]], // 會計科目
  });

  data: any[] = [];
  initData: any[] = []; // 用於儲存初始資料以供重置
  selectedRows: any[] = [];
  deleteRows: any[] = [];
  columns: EditColumn[] = [
    { field: 'MonthNo', header: '月', type: 'input', disabled: () => true, minLength: 1 },
    { field: 'Budget', header: '金額', type: 'inputNumber', disabled: () => this.isFormReadable },
    { field: 'Remark', header: '備註', type: 'input', disabled: () => this.isFormReadable },
  ];

  constructor(
    private translate: TranslateService,
    private fin41020Service: FIN41020Service,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化程式
    this.ProgNo = '140002';
    this.initializePage('FIN41020', this.dataForm);
    console.log(this.dataForm.value);

    this.loadData();

    const state = this.router.lastSuccessfulNavigation?.extras.state as {
      crudstatus: CRUDStatus;
      rowdata: any;
    };

    // 根據 CRUD 狀態來設置不同的邏輯
    switch (state.crudstatus) {
      case CRUDStatus.Edit:
        this.formTitle = 'edit-conditions';
        this.accordionTabCss = 'edit-accordionTab';
        this.crudstatus = CRUDStatus.Edit;

        this.Edit(state.rowdata);
        break;
      case CRUDStatus.Read:
        this.formTitle = 'display-conditions';
        this.crudstatus = CRUDStatus.Read;
        this.Read(state.rowdata);
        break;
    }

  }

  // 編輯邏輯
  Edit(rowdata: any) {
    this.dataForm.patchValue(rowdata);
  }

  // 讀取邏輯
  Read(rowdata: any) {
    this.dataForm.patchValue(rowdata);
    this.dataForm.disable();
  }

  // 提交邏輯
  onSubmit(frm: FormGroup) {
    if (this.crudstatus === CRUDStatus.Edit) {
      const updateRequest: EditFIN41020Request = {
        ORG_ID: this.dataForm.getRawValue().OrgId,
        AccNo: this.dataForm.getRawValue().AccNo,
        BudgetYear: this.dataForm.getRawValue().BudgetYear,
        BudgetVersion: this.dataForm.getRawValue().BudgetVersion,
        Details: this.data
          .filter(item => item.MonthNo !== '合計')
          .map(item => ({
            MonthNo: item.MonthNo.replace('月', ''),
            Budget: item.Budget,
            Remark: item.Remark
          }))
      };

      this.fin41020Service.editFIN41020(updateRequest)
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe(response => {
          if (response.Data.ErrCode !== 0) {
            this.messageService.errorBubble(response.Data.ErrMsg || '修改失敗');
          }
          else {
            this.messageService.successBubble(response.Data.ErrMsg || '修改成功');
          }
          this.onCancel();  // 返回查詢頁
        })
    }
  }

  accordionTabCss = '';

  // 載入資料
  loadData() {
    this.fin41020Service.queryFIN41020(this.dataForm.value)
      .pipe(untilDestroyed(this), finalize(() => this.loading = false))
      .subscribe(response => {
        this.data = [
          { MonthNo: '01月', Budget: response.Data[0]?.M01, Remark: response.Data[0]?.R01 },
          { MonthNo: '02月', Budget: response.Data[0]?.M02, Remark: response.Data[0]?.R02 },
          { MonthNo: '03月', Budget: response.Data[0]?.M03, Remark: response.Data[0]?.R03 },
          { MonthNo: '04月', Budget: response.Data[0]?.M04, Remark: response.Data[0]?.R04 },
          { MonthNo: '05月', Budget: response.Data[0]?.M05, Remark: response.Data[0]?.R05 },
          { MonthNo: '06月', Budget: response.Data[0]?.M06, Remark: response.Data[0]?.R06 },
          { MonthNo: '07月', Budget: response.Data[0]?.M07, Remark: response.Data[0]?.R07 },
          { MonthNo: '08月', Budget: response.Data[0]?.M08, Remark: response.Data[0]?.R08 },
          { MonthNo: '09月', Budget: response.Data[0]?.M09, Remark: response.Data[0]?.R09 },
          { MonthNo: '10月', Budget: response.Data[0]?.M10, Remark: response.Data[0]?.R10 },
          { MonthNo: '11月', Budget: response.Data[0]?.M11, Remark: response.Data[0]?.R11 },
          { MonthNo: '12月', Budget: response.Data[0]?.M12, Remark: response.Data[0]?.R12 },
          { MonthNo: '合計', Budget: response.Data[0]?.TotalAmount, Remark: response.Data[0]?.RemarkAny },
        ];

        this.initData = JSON.parse(JSON.stringify(this.data)); // 深拷貝初始資料
        console.log('初始資料已載入並保存到 initData', this.initData);
      });
  }


  // 重置表格資料
  resetTable() {
    if (!this.initData) return;
    this.data = JSON.parse(JSON.stringify(this.initData));
  }
}
