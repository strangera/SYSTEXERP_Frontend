import { NgIf } from '@angular/common';
import { Component, OnInit, } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownComponent } from "@shared/componentkit/dropdown/dropdown.component";
import { QueryStateService } from '@shared/service/query-state.service';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { FIN31020Data, FIN31020Service, InsertFIN31020Request, QueryFIN31020DetailRequest, UpdateFIN31020Request } from './../../../service/api/fin/fin31020.service';
import { DropDownListService } from './../../../service/utility/dropDownList.service';

//1.3.1.2 應收調整科目設定維護 CRU
@Component({
  selector: 'app-fin31020-cru',
  templateUrl: './fin31020-cru.component.html',
  standalone: true,
  imports: [NgIf, MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, InputTextComponent, ButtonComponent, TranslateModule, DropdownComponent]
})

export class FIN31020CRUComponent extends BasicCruPageComponent<FIN31020Data> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    Id: [0],  // 編輯時需要
    Mid: [0, [Validators.required]],  // 必填欄位
    CAR_AccNo: ["", [Validators.required]],
    CAR_Type: [1, [Validators.required]],
    Remark: ["", Validators.maxLength(100)],
  });

  AccNoOptions: { label: string; value: string }[] = []; // 科目代號選項
  minusOption: { value: number; label: string }[] = [
    { value: 1, label: '加項' },
    { value: 2, label: '減項' },
  ];

  // Getter 方法
  get isCreateMode(): boolean {
    return this.crudstatus === CRUDStatus.Create;
  }

  get isEditMode(): boolean {
    return this.crudstatus === CRUDStatus.Edit;
  }

  get isReadMode(): boolean {
    return this.crudstatus === CRUDStatus.Read;
  }

  get isCarAccNoDisabled(): boolean {
    return this.isEditMode || this.isReadMode;
  }
  constructor(
    private DropDownListService: DropDownListService,
    private fin31020Service: FIN31020Service,
    private queryStateService: QueryStateService
  ) {
    super();  // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('FIN31020', this.dataForm);
    this.loadOptions();
    this.setupFormBasedOnCrudStatus();
  }

  /**
   * 根據 CRUD 狀態設定表單
   */
  private setupFormBasedOnCrudStatus(): void {
    // 從 router state 取得資料
    const state = this.router.lastSuccessfulNavigation?.extras.state;

    if (state) {
      this.crudstatus = state['crudstatus'];
      const rowdata = state['rowdata'];

      switch (this.crudstatus) {
        case CRUDStatus.Create:
          // 新增模式：所有欄位都可編輯
          this.dataForm.get('CAR_AccNo')?.enable();
          break;

        case CRUDStatus.Edit:
          // 編輯模式：調整科目代號不可修改
          this.dataForm.get('CAR_AccNo')?.disable();

          if (rowdata && rowdata.CAR_AccNo) {
            // 查詢單筆資料
            this.loadDetailByAccNo(rowdata.CAR_AccNo);
          }
          break;

        case CRUDStatus.Read:
          // 查看模式：所有欄位都不可編輯
          this.dataForm.disable();

          if (rowdata && rowdata.CAR_AccNo) {
            this.loadDetailByAccNo(rowdata.CAR_AccNo);
          }
          break;
      }
    }
  }
  private loadOptions(): void {
    // 科目代號
    this.DropDownListService.queryGLS1005_ledgerMD_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => this.AccNoOptions = res.Data.map((x: { No: string; Name: string }) => ({ label: `${x.No} - ${x.Name}`, value: x.No })));

  }
  onSubmit(frm: FormGroup): void {
    if (frm.valid) {
      const formValue = frm.value;
      this.loading = true;

      if (this.crudstatus === CRUDStatus.Create) {
        // 新增
        const insertData: InsertFIN31020Request = {
          Mid: formValue.Mid,
          CAR_AccNo: formValue.CAR_AccNo,
          CAR_Type: formValue.CAR_Type.toString(),
          Remark: formValue.Remark || ''
        };

        this.fin31020Service.insertFIN31020(insertData)
          .pipe(
            untilDestroyed(this),
            finalize(() => this.loading = false)
          )
          .subscribe({
            next: (response) => {
              if (response.Status === '0000') {
                this.messageService.successBubble('新增成功');
                // 儲存來自 list 的查詢條件以便返回時還原並重新查詢
                try { this.queryStateService.setQueryState(this.ProgNo, this.queryData ?? {}); } catch { }
                this.router.navigate(['/account/fin/fin31020'], { state: { fromRoute: this.router.url } });
              } else {
                this.messageService.errorBubble('新增失敗: ' + response.Message);
              }
            },
          });
      } else if (this.crudstatus === CRUDStatus.Edit) {
        const updateData: UpdateFIN31020Request = {
          Id: formValue.Id,
          Mid: formValue.Mid,
          CAR_AccNo: this.dataForm.get('CAR_AccNo')?.value || formValue.CAR_AccNo,
          CAR_Type: formValue.CAR_Type.toString(),
          Remark: formValue.Remark || ''
        };

        this.fin31020Service.updateFIN31020(updateData)
          .pipe(
            untilDestroyed(this),
            finalize(() => this.loading = false)
          )
          .subscribe({
            next: (response) => {
              if (response.Status === '0000') {
                this.messageService.successBubble('更新成功');
                try { this.queryStateService.setQueryState(this.ProgNo, this.queryData ?? {}); } catch { }
                this.router.navigate(['/account/fin/fin31020'], { state: { fromRoute: this.router.url } });
              } else {
                this.messageService.errorBubble('更新失敗: ' + response.Message);
              }
            },

          });
      }
    } else {
      this.loading = false;
      this.markFormGroupTouched(frm);
      this.messageService.errorBubble('請檢查必填欄位是否已填寫完成');
    }
  }

  /**
   * 根據科目代號查詢單筆資料詳情
   * @param carAccNo 調整科目代號
   */
  loadDetailByAccNo(carAccNo: string): void {
    if (!carAccNo) return;

    this.loading = true;
    const request: QueryFIN31020DetailRequest = {
      CAR_AccNo: carAccNo
    };

    this.fin31020Service.queryFIN31020Detail(request)
      .pipe(
        untilDestroyed(this),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (response) => {
          if (response.Status === '0000' && response.Data) {
            this.dataForm.patchValue({
              Id: response.Data.Id,
              Mid: response.Data.Mid,
              CAR_AccNo: response.Data.CAR_AccNo,
              CAR_Type: parseInt(response.Data.CAR_Type),
              Remark: response.Data.Remark
            });

            if (this.crudstatus === CRUDStatus.Edit) {
              this.dataForm.get('CAR_AccNo')?.disable();
            }
          } else {
            this.messageService.errorBubble('查詢失敗: ' + response.Message);
          }
        },

      });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }

  // 覆寫取消返回，儲存原查詢條件再返回列表
  override onCancel(returnValue?: any) {
    try { this.queryStateService.setQueryState(this.ProgNo, this.queryData ?? {}); } catch { }
    super.onCancel(returnValue);
  }
}
