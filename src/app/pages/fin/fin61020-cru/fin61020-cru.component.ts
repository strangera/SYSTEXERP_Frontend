import { AsyncPipe, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Fin61020Service, QueryFIN61020Response } from '@service/api/fin/fin61020.service';
import { Option } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { PanelModule } from 'primeng/panel';
import { debounceTime, filter, finalize, Observable, tap } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';

@Component({
  selector: 'app-fin61020-cru',
  templateUrl: './fin61020-cru.component.html',
  standalone: true,
  imports: [AsyncPipe, MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, InputTextComponent, DropdownComponent, ButtonComponent, NgIf, TranslateModule]
})
export class FIN61020CRUComponent extends BasicCruPageComponent<QueryFIN61020Response> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    ID: [null],
    Sales_Id: [{ value: '系統自動給號', disabled: true }],
    User_no: [null, [Validators.maxLength(16), Validators.required]],
    User_Name: [{ value: null, disabled: true }],
    ORG_ID: [{ value: null, disabled: true }],
  });
  orgOptions = this.dropdown.querySys3100();
  userOptions = this.dropdown.queryTblUserOrgid();
  private loadedUserOptions: Option[] = [];
  constructor(
    private readonly fin61020Service: Fin61020Service,
    private readonly dropdown: DropdownApiService
  ) {
    super(); // 呼叫父類建構子
    this.userOptions = this.dropdown.queryTblUserOrgid().pipe(
      // 在數據到達時，同步更新 loadedUserOptions
      tap(options => {
        this.loadedUserOptions = (options) ?? [];
      })
    ) as Observable<Option[] | null>;
  }

  ngOnInit(): void {
    this.initializePage('FIN61020', this.dataForm);
    this.setupUserNoChangeMonitor();
  }
  /**
   * 監聽 User_no 欄位變化，並自動設置 User_Name 和 ORG_ID
   */
  private setupUserNoChangeMonitor(): void {
    this.dataForm.controls.User_no.valueChanges.pipe(
      untilDestroyed(this),
      debounceTime(100), // 防止在快速輸入時頻繁觸發
      filter(userNo => !!userNo), // 確保 userNo 存在
    ).subscribe((userNo) => {
      // 呼叫處理函數
      this.onUserNoChange(userNo!);
    });
  }

  /**
   * 根據選定的 User_no 查找並設置對應的 User_Name 和 ORG_ID
   * @param userNo 選定的員工編號
   */
  onUserNoChange(userNo: string): void {
    // 從已載入的列表中查找匹配的用戶
    const selectedUser = this.loadedUserOptions.find(u => u['user_No'] === userNo);

    if (selectedUser) {
      // 找到匹配項，更新表單欄位
      this.dataForm.patchValue({
        User_Name: selectedUser['user_Name'],
        ORG_ID: selectedUser['Org_ID']
      });
    } else {
      // 未找到，清空相關欄位 (通常不會發生，除非數據不同步)
      this.dataForm.patchValue({
        User_Name: null,
        ORG_ID: null
      });
    }
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.loading = true;
      const body = {
        ...frm.getRawValue(),
        ID: this.isFormCreateable ? undefined : frm.get('ID')?.value ?? 0
      };
      const serviceCall = this.isFormCreateable
        ? this.fin61020Service.insertFIN61020(body)
        : this.fin61020Service.updateFIN61020(body);
      serviceCall.pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(res => {
        this.messageService.successBubble(res.Message);
        if (this.isFormCreateable) {
          this.dataForm.reset();
        } else if (this.isFormEditable) {
          this.onCancel();
        }
      });
    })
  }
}
