import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { ValidationService } from '../../../shared/service/validation.service';
import { BigCategoryCodeService } from './../../../service/basic/big-category-code.service';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { TLS5000Service } from '../../../service/api/tls/tls5000.service';
import { MidCategoryCodeService } from '../../../service/basic/mid-category-code.service';
import { debounceTime } from 'rxjs';
import { Tls51010DropDownListService } from '../../../service/api/tls/tls51010-dropdown.service';
import { Tls51020DropDownService } from '../../../service/api/tls/tls51020-dropdown.service';

interface CategoryItem {
  id: number;
  CAT_LNo: string;
  CAT_LName?: string;
  CAT_MNo: string;
  CAT_MName?: string;
  CAT_SNo: string;
  CAT_SName: string;
  CAT_SRemark: string | null;
  CRT_Date?: string;
  CRT_USR_No: string;
  CRT_USR_Name: string;
  UPD_Date?: string;
  UPD_USR_No?: string;
  UPD_USR_Name?: string;
  CanDel?: boolean; // 新增 CanDel 屬性
}

@Component({
  selector: 'app-tls51030-cru',
  templateUrl: './tls51030-cru.component.html',
  styleUrls: ['./tls51030-cru.component.scss']
})
export class TLS51030CRUComponent extends BasicCruPageComponent<CategoryItem> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    id: [0],
    CAT_SNo: ['', [Validators.required, Validators.maxLength(3), this.validationService.numberValidator]],
    CAT_SName: ['', [Validators.required, Validators.maxLength(32)]],
    CAT_LNo: ['', [Validators.required]],
    CAT_MNo: ['', [Validators.required]],
    CAT_SRemark: ['', [Validators.maxLength(200)]],
  });

  // 修正：判斷是否可以編輯大分類代碼
  // CanDel = true：可刪除項目，大分類代碼可以編輯（返回 false）
  // CanDel = false：不可刪除項目，大分類代碼不能編輯（返回 true）
  get isCATSNoDisabled(): boolean {
    return this.crudstatus === CRUDStatus.Read ||
      (this.crudstatus === CRUDStatus.Edit && this.rowdata?.CanDel === false);
  }

  bigCategoryOptions: { value: string, label: string }[] = [];
  middleCategoryOptions: { value: string, label: string }[] = [];

  constructor(
    private validationService: ValidationService,
    private apiService: TLS5000Service,
    private bigCategoryCodeService: Tls51010DropDownListService,
    private middleCategoryCodeService: Tls51020DropDownService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS51030', this.dataForm);
    this.bigCategoryCodeService.getSystemTypes().subscribe({
      next: (response) => {
        this.bigCategoryOptions = response;
        this.loadInitialData();
      },
      error: (error) => {
        console.error('獲取大分類代碼失敗:', error);
        this.messageService.errorBubble('無法載入大分類代碼，請稍後重試');
      }
    });



    this.dataForm.controls.CAT_LNo.valueChanges.pipe(debounceTime(300)).subscribe(catLNo => {
      if (catLNo) {
        this.middleCategoryCodeService.getSystemTypesByCatLNo(catLNo).subscribe({
          next: (response) => {
            this.middleCategoryOptions = response;
            const currentCatMNo = this.dataForm.controls.CAT_MNo.value;
            if (currentCatMNo && !response.find(opt => opt.value === currentCatMNo)) {
              this.dataForm.controls.CAT_MNo.setValue('');
            }
          },
          error: (error) => {
            console.error('獲取中分類代碼失敗:', error);
            this.messageService.errorBubble('無法載入中分類代碼，請稍後重試');
            this.middleCategoryOptions = [];
            this.dataForm.controls.CAT_MNo.setValue('');
          }
        });
      } else {
        this.middleCategoryOptions = [];
        this.dataForm.controls.CAT_MNo.setValue('');
      }
    });

    // 新增：在初始化後立即設置大分類代碼的禁用狀態
    this.updateCATSNoDisabledState();
  }

  // 新增：自定義清空方法，保留大分類代碼
  clearFormExceptCATSNo(): void {
    const catSNoControl = this.dataForm.get('CAT_SNo');
    const isCAT_MNoDisabled = catSNoControl?.disabled || false;  // 新增：檢查是否被禁用
    const currentCATSNo = catSNoControl?.value;

    this.dataForm.reset();

    // 修正：只有在欄位被禁用且有值時才恢復
    if (isCAT_MNoDisabled && currentCATSNo) {
      this.dataForm.patchValue({
        CAT_SNo: currentCATSNo,
        id: 0
      });
    } else {
      this.dataForm.patchValue({
        id: 0
      });
    }

    this.updateCATSNoDisabledState();
  }

  // 修正：更新大分類代碼欄位的禁用狀態
  private updateCATSNoDisabledState(): void {
    const field = this.dataForm.get('CAT_SNo');
    if (field) {
      // 編輯模式且 CanDel = false 時才禁用大分類代碼
      if (this.crudstatus === CRUDStatus.Edit && this.rowdata?.CanDel === false) {
        field.disable();
      } else {
        field.enable();
      }
    }
  }

  private loadInitialData(): void {
    if (this.crudstatus === CRUDStatus.Edit || this.crudstatus === CRUDStatus.Read) {
      if (this.rowdata) {
        const catLNo = this.rowdata.CAT_LNo;
        if (catLNo) {
          this.middleCategoryCodeService.getSystemTypesByCatLNo(catLNo).subscribe({
            next: (response) => {
              this.middleCategoryOptions = response;
            },
            error: (error) => {
              console.error('初始載入中分類代碼失敗:', error);
              this.messageService.errorBubble('無法載入中分類代碼，請稍後重試');
              this.middleCategoryOptions = [];
              this.dataForm.controls.CAT_MNo.setValue('');
            }
          });
        }
      } else {
        console.error('rowdata is missing in Edit/View mode');
        this.messageService.errorBubble('無法載入資料，請返回查詢頁面重試');
        this.onCancel();
      }
    }
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      switch (this.crudstatus) {
        case CRUDStatus.Create:
          if (this.canAdd()) {
            this.apiService.insertTLS51030(frm.value).subscribe({
              next: (response: any) => {
                if (response.Status === '0000') {
                  this.messageService.successBubble('新增成功');
                  this.dataForm.reset();
                } else {
                  console.error('API error:', response.Status, response.Message);
                  this.messageService.errorBubble(`新增失敗: ${response.Message || '未知錯誤'}`);
                }
              },
              error: (err: any) => {
                console.error('API error:', err.status, err.message, err.error);
                this.messageService.errorBubble('新增失敗，請檢查網路連線或聯繫管理員');
              }
            });
          }
          break;
        case CRUDStatus.Edit:
          if (this.canEdit()) {
            this.apiService.updateTLS51030(frm.value).subscribe({
              next: (response: any) => {
                if (response.Status === '0000') {
                  this.messageService.successBubble('更新成功');
                  this.onCancel();
                } else {
                  console.error('API error:', response.Status, response.Message);
                  this.messageService.errorBubble(`更新失敗: ${response.Message || '未知錯誤'}`);
                }
              },
              error: (err: any) => {
                console.error('API error:', err.status, err.message, err.error);
                this.messageService.errorBubble('更新失敗，請檢查網路連線或聯繫管理員');
              }
            });
          }
          break;
      }
    });
  }
}
