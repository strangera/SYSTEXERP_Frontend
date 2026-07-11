import { AsyncPipe, NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { ValidationService } from '@shared/service/validation.service';
import { PanelModule } from 'primeng/panel';
import { Observable, debounceTime, finalize, map, of, switchMap, take, tap } from 'rxjs';
import { InsertTLS51030Request, QueryTLS51030Response, Tls51030Service, UpdateTLS51030Request } from 'src/app/service/api/tls/tls51030.service';
@Component({
  selector: 'app-tls51030-cru',
  templateUrl: './tls51030-cru.component.html',
  standalone: true,
  imports: [
    NgIf,
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    InputTextareaComponent,
    TranslateModule,
    AsyncPipe
  ]
})
export class TLS51030CRUComponent extends BasicCruPageComponent<QueryTLS51030Response> implements OnInit {
  private readonly validationService = inject(ValidationService);
  private readonly tls51030Service = inject(Tls51030Service);
  private readonly dropdownApiService = inject(DropdownApiService);

  // 定義嚴格型態的資料表單
  readonly dataForm = this.formBuilder.nonNullable.group({
    id: [0],
    CAT_SNo: ['', [Validators.required, Validators.maxLength(3), this.validationService.numberValidator]],
    CAT_SName: ['', [Validators.required, Validators.maxLength(32)]],
    CAT_LNo: ['', [Validators.required]],
    CAT_MNo: ['', [Validators.required]],
    CAT_SRemark: ['', [Validators.maxLength(200)]],
  });

  // 下拉選單數據流：大分類直接綁定
  readonly bigCategoryOptions$ = this.dropdownApiService.queryPos2003();

  // 核心最佳實踐：將中分類選項設計為響應式數據流 (Reactive Data Stream)
  middleCategoryOptions$!: Observable<any[] | null>;

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS51030', this.dataForm);

    // 防呆機制：若已審核或不可刪除項目，編輯模式下禁用金鑰欄位
    if (this.isFormEditable && this.rowdata?.CanDel === false) {
      this.dataForm.controls.CAT_SNo.disable();
    }

    // 頂級實踐：利用 RxJS 算子鏈完爆大中小分類的動態連動，不寫任何重複的 subscribe
    this.middleCategoryOptions$ = this.dataForm.controls.CAT_LNo.valueChanges.pipe(
      debounceTime(300),
      switchMap((catLNo) => {
        if (!catLNo) {
          this.dataForm.controls.CAT_MNo.setValue('');
          return of([]);
        }
        // 帶入大分類陣列參數查詢中分類
        return this.dropdownApiService.queryPos20031({ CAT_LNo: [catLNo] }).pipe(
          tap((response) => {
            // 自動清洗邏輯：如果目前選中的中分類，不在新載入的大分類選項中，自動清空
            const currentCatMNo = this.dataForm.controls.CAT_MNo.value;
            if (currentCatMNo && !response?.some(opt => opt.No === currentCatMNo)) {
              this.dataForm.controls.CAT_MNo.setValue('');
            }
          }),
          // 轉化格式為共用元件所需要的 value / label
          map((response) => response?.map(item => ({ value: item.No, label: `${item.No} - ${item.Name}` })) || [])
        );
      })
    );

    // 初始進入頁面時 (Edit / Read 模式)，主動觸發一次大分類的變更，讓中分類下拉選單正確回填
    const initCatLNo = this.dataForm.controls.CAT_LNo.value;
    if (initCatLNo) {
      // 延遲發送確保 middleCategoryOptions$ 數據鏈已被接收
      setTimeout(() => this.dataForm.controls.CAT_LNo.setValue(initCatLNo, { emitEvent: true }));
    }
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      this.loading = true;
      const formValue = frm.getRawValue();

      // 採用你最喜歡的策略物件組合式 API 調用
      const apiCall = this.isFormCreateable
        ? {
          obs: this.tls51030Service.insertTLS51030(formValue as InsertTLS51030Request),
          msg: '新增成功',
          after: () => this.dataForm.reset(),
        }
        : this.isFormEditable
          ? {
            obs: this.tls51030Service.updateTLS51030(formValue as UpdateTLS51030Request),
            msg: '更新成功',
            after: () => this.onCancel(),
          }
          : null;

      if (!apiCall) {
        this.loading = false;
        return;
      }

      apiCall.obs
        .pipe(
          take(1),
          finalize(() => this.loading = false)
        )
        .subscribe(() => {
          this.messageService.successBubble(apiCall.msg);
          apiCall.after();
        });
    });
  }
}
