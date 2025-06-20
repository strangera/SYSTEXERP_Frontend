import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { Column } from '../../../shared/componentkit/table/table.model';
import { Aps1004Request, Sys1004Service } from '../../../service/api/sys/sys1004.service';
import { ISysbc00Data, Sysbc00Service } from '../../../service/api/sys/sysbc00.service';
import { concatMap, finalize, forkJoin, Observable, of } from 'rxjs';

@Component({
  selector: 'app-sysbc00.cru',
  templateUrl: './sysbc00.cru.component.html',
})
// 銀行基本資料維護作業 CRU
export class SYSBC00CRUComponent extends BasicCruPageComponent<ISysbc00Data> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({// APS1001 銀行主檔
    id: [],
    BNK_No: ['', [Validators.maxLength(10)]], // 金資中心銀行代碼
    BNK_Name: ['', [Validators.maxLength(60)]], // 銀行名稱
    BNK_ShortName: ['', [Validators.maxLength(30)]], // 銀行簡稱
  });
  data: Aps1004Request[] = [];
  selectedRows: Aps1004Request[] = [];
  deleteRows: Aps1004Request[] = [];
  columns: Column[] = [
    { field: 'BNK_BranchNo', header: '分行代碼', type: 'input' },
    { field: 'BNK_BranchName', header: '分行名稱', type: 'input' },
    { field: 'ACC_LEN', header: '該行帳號最小長度', type: 'inputNumber', useGrouping: false },
    { field: 'ACC_LEN_MAX', header: '該行帳號最大長度', type: 'inputNumber', useGrouping: false },
  ];
  constructor(
    private sys1004Service: Sys1004Service,
    private sysbc00Service: Sysbc00Service
  ) {
    super();  // 呼叫父類建構子
  }
  ngOnInit(): void {
    this.initializePage('SYSBC00', this.dataForm);
    if (this.isFormEditable && this.dataForm.value.BNK_No) {
      const body = { BNK_No: this.dataForm.value.BNK_No };
      this.sys1004Service.queryAPS1004(body).subscribe(data => this.data = data.Data.map(item => ({ ...item, ID: item.id })));
    }
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.loading = true;

      const saveMain$ = this.isFormCreateable
        ? this.sysbc00Service.insertSYSBC00(frm.value)
        : this.sysbc00Service.updateSYSBC00(frm.value);

      saveMain$
        .pipe(
          // 儲存主檔完成 → 儲存子表
          concatMap(() => {
            const saveChildren$ = this.getSys1004SaveObservables(this.data);
            return saveChildren$.length > 0 ? forkJoin(saveChildren$) : of(null);
          }),
          // 子表完成 → 判斷是否有要刪除的
          concatMap(() => {
            console.log(this.deleteRows);

            const idList = this.deleteRows
              .map(item => item.id)
              .filter((id): id is number => id !== undefined);
            console.log(idList);

            if (idList.length === 0) {
              return of(null); // 沒有要刪除的
            }

            return this.sys1004Service.deleteAPS1004(idList);
          }),
          finalize(() => (this.loading = false))
        )
        .subscribe((finalRes) => {
          if (finalRes) {
            this.messageService.successBubble(finalRes.Message);
          }
          this.deleteRows = [];
          this.onCancel(); // 最後統一收尾
        });
    });
  }

  getSys1004SaveObservables(data: Aps1004Request[]): Observable<any>[] {
    const newItems = data.filter(d => !d.id);
    const updateItems = data.filter(d => !!d.id);

    return [
      ...newItems.map(item =>
        this.sys1004Service.insertAPS1004({ ...item, BNK_No: this.dataForm.value.BNK_No })
      ),
      ...updateItems.map(item =>
        this.sys1004Service.updateAPS1004({ ...item, BNK_No: this.dataForm.value.BNK_No })
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
    rows
      .filter(item => item.id !== undefined && !this.deleteRows.some(d => d.id === item.id))
      .forEach(item => this.deleteRows.push(item));

    // 清空選取列
    this.selectedRows = [];
  }

}
