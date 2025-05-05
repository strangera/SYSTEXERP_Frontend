import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { BigCategoryCodeService } from './../../../service/basic/big-category-code.service';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { TLS5000Service } from '../../../service/API/TLS0000/tls5000.service';
import { MidCategoryCodeService } from '../../../service/basic/mid-category-code.service';
import { debounceTime } from 'rxjs';

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

  bigCategoryOptions: { value: string, label: string }[] = [];
  middleCategoryOptions: { value: string, label: string }[] = [];

  constructor(
    private validationService: ValidationService,
    private apiService: TLS5000Service,
    private bigCategoryCodeService: BigCategoryCodeService,
    private middleCategoryCodeService: MidCategoryCodeService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('250003', this.dataForm);
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
                  this.onCancel();
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

  submitForm(frm: FormGroup): void {
    this.onSubmit(frm);
  }

  onClearForm(): void {
    this.dataForm.reset();
    this.middleCategoryOptions = [];
  }
}
