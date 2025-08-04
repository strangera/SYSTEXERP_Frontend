import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { Column } from '../../../shared/componentkit/table/table.model';
import { Aps1004Request, Sys1004Service } from '../../../service/api/sys/sys1004.service';
import { ISysbc00Data, Sysbc00Service } from '../../../service/api/sys/sysbc00.service';
import { concatMap, finalize, forkJoin, Observable, of } from 'rxjs';
import { validateDuplicate, validateMaxLength, validateMaxNumber, validateRequired } from '../../../shared/componentkit/table/validate-field.model';
import { untilDestroyed } from '@ngneat/until-destroy';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-sysbc00.cru',
  templateUrl: './sysbc00.cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    TableComponent,
    NgIf,
    TranslateModule,
  ],
})
// 銀行基本資料維護作業 CRU
export class SYSBC00CRUComponent extends BasicCruPageComponent<ISysbc00Data> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({// APS1001 銀行主檔
    id: [],
    BNK_No: ['', [Validators.required, Validators.maxLength(10)]], // 金資中心銀行代碼
    BNK_Name: ['', [Validators.required, Validators.maxLength(60)]], // 銀行名稱
    BNK_ShortName: ['', [Validators.required, Validators.maxLength(30)]], // 銀行簡稱
  });
  data: Aps1004Request[] = [];
  selectedRows: Aps1004Request[] = [];
  deleteRows: Aps1004Request[] = [];
  columns: Column[] = [
    { field: 'BNK_BranchNo', header: '分行代碼', type: 'input', validate: [validateDuplicate, validateRequired, validateMaxLength(10)] },
    { field: 'BNK_BranchName', header: '分行名稱', type: 'input', validate: [validateRequired, validateMaxLength(100)] },
    { field: 'ACC_LEN', header: '該行帳號最小長度', type: 'inputNumber', useGrouping: false, validate: [validateRequired, validateMaxNumber(99999999)] },
    { field: 'ACC_LEN_MAX', header: '該行帳號最大長度', type: 'inputNumber', useGrouping: false, validate: [validateRequired, validateMaxNumber(99999999)] },
  ];
  constructor(
    private sys1004Service: Sys1004Service,
    private sysbc00Service: Sysbc00Service
  ) {
    super();
  }
  ngOnInit(): void {
    this.initializePage('SYSBC00', this.dataForm);
    if (!this.isFormCreateable && this.dataForm.value.BNK_No) {
      this.dataForm.get('BNK_No')?.disable();
      const body = { BNK_No: this.dataForm.getRawValue().BNK_No };
      this.sys1004Service.queryAPS1004(body).pipe(untilDestroyed(this)).subscribe(data => {
        this.data = data.Data.map(item => ({ ...item, ID: item.id }));
      });
    }
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.loading = true;

      const isCreate = this.isFormCreateable;

      const saveMain$ = isCreate
        ? this.sysbc00Service.insertSYSBC00(frm.getRawValue())
        : this.sysbc00Service.updateSYSBC00(frm.getRawValue());

      saveMain$
        .pipe(
          untilDestroyed(this),
          concatMap(() => {
            const saveChildren$ = this.getSys1004SaveObservables(this.data);
            return saveChildren$.length > 0 ? forkJoin(saveChildren$) : of(null);
          }), concatMap(() => {
            const idList = this.deleteRows.map(item => item.id).filter((id): id is number => id !== undefined);
            return idList.length > 0 ? this.sys1004Service.deleteAPS1004(idList) : of(null);
          }), finalize(() => (this.loading = false))
        )
        .subscribe(() => {
          this.messageService.successBubble(isCreate ? '新增成功' : '修改成功');
          this.deleteRows = [];
          if (isCreate) {
            this.dataForm.reset();
            this.data = [];
            this.selectedRows = [];
          } else {
            this.onCancel();
          }
        });
    });
  }


  getSys1004SaveObservables(data: Aps1004Request[]): Observable<any>[] {
    const newItems = data.filter(d => !d.id);
    const updateItems = data.filter(d => !!d.id);

    return [
      ...newItems.map(item =>
        this.sys1004Service.insertAPS1004({ ...item, BNK_No: this.dataForm.getRawValue().BNK_No })
      ),
      ...updateItems.map(item =>
        this.sys1004Service.updateAPS1004({ ...item, BNK_No: this.dataForm.getRawValue().BNK_No })
      ),
    ];
  }

  resetTable() {
    this.data = [];
    this.selectedRows = [];
  }

  // 刪除資料的方法
  onDelete(rows: Aps1004Request[]) {
    // 將畫面資料中刪除這些 row
    this.data = this.data.filter(item => !rows.includes(item));
    // 將有 id 的項目（表示是資料庫已存在的）加進 deleteRows，避免重複
    rows.filter(item => item.id !== undefined && !this.deleteRows.some(d => d.id === item.id)).forEach(item => this.deleteRows.push(item));
    // 清空選取列
    this.selectedRows = [];
  }

}
