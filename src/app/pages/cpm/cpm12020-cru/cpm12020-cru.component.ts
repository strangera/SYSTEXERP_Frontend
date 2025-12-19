import { AsyncPipe, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { CPM12020Response, Cpm12020Service } from '@service/api/cpm/cpm12020.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { PanelModule } from 'primeng/panel';
import { combineLatest, finalize, startWith, take } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';

//5.1.2.2 顧客意見責任單位維護 CRU
@Component({
  selector: 'app-cpm12020-cru',
  templateUrl: './cpm12020-cru.component.html',
  standalone: true,
  imports: [AsyncPipe, DropdownComponent, MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, InputTextComponent, ButtonComponent, NgIf, TranslateModule]
})
export class CPM12020CRUComponent extends BasicCruPageComponent<CPM12020Response> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    ID: [null],
    ORG_ID: [null as string | null, [Validators.required]],
    ORG_NAME: [{ value: null, disabled: true }],
    CLASS_CODE: [null, [Validators.required]],
    CLASS_NAME: [null as string | null, [Validators.required, Validators.maxLength(40)]],
  });
  CLASS_CODEOptions = getSYS1000Options('T211')
  ORG_IDOptions$ = this.dropdown.querySys3100();
  constructor(
    private readonly cpm12020Service: Cpm12020Service,
    private readonly dropdown: DropdownApiService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('CPM12020', this.dataForm);
    this.handleValueChanges();

    // 針對「編輯模式」的補強：如果 ID 有值，代表是編輯，手動帶入一次名稱
    const currentOrgId = this.dataForm.controls.ORG_ID.value;
    if (currentOrgId) {
      this.ORG_IDOptions$.pipe(take(1)).subscribe(options => {
        const selectedOrg = options?.find(opt => opt.value === currentOrgId);
        if (selectedOrg) {
          this.dataForm.patchValue({ ORG_NAME: selectedOrg['Name'] }, { emitEvent: false });
        }
      });
    }
  }
  private handleValueChanges() {
    // 1. 監聽 ORG_ID：確保初始化或改變時都能帶出 ORG_NAME
    this.dataForm.controls.ORG_ID.valueChanges
      .pipe(
        untilDestroyed(this),
        startWith(this.dataForm.controls.ORG_ID.value) // 關鍵：讓初始值也進入流
      )
      .subscribe((val) => {
        if (!val) return;
        this.ORG_IDOptions$.pipe(take(1)).subscribe(options => {
          const selectedOrg = options?.find(opt => opt.value === val);
          if (selectedOrg) {
            // 更新 ORG_NAME，emitEvent: false 避免觸發不必要的連鎖反應
            this.dataForm.controls.ORG_NAME.patchValue(selectedOrg['Name'], { emitEvent: false });
          }
        });
      });

    // 2. 監聽 ORG_ID 與 CLASS_CODE：自動組合成 CLASS_NAME
    combineLatest([
      this.dataForm.controls.ORG_ID.valueChanges.pipe(startWith(this.dataForm.controls.ORG_ID.value)),
      this.dataForm.controls.CLASS_CODE.valueChanges.pipe(startWith(this.dataForm.controls.CLASS_CODE.value))
    ])
      .pipe(untilDestroyed(this))
      .subscribe(([orgId, classCode]) => {
        // 編輯模式下，通常不需要「自動覆蓋」舊有的責任單位名稱，除非是手動切換
        // 如果你希望編輯時「改變代碼才連動」，可以加一個 if (!this.isFormCreateable) 的判斷
        if (!this.isFormCreateable && !this.dataForm.dirty) return;

        // 延遲一下確保 ORG_NAME 已經被上面的訂閱更新了
        setTimeout(() => {
          const orgName = this.dataForm.controls.ORG_NAME.value || '';
          const selectedClass = this.CLASS_CODEOptions.find(opt => opt.value === classCode);

          // 處理類別名稱 (去除 "01 - " 的前綴)
          const className = selectedClass?.label?.includes(' - ')
            ? selectedClass.label.split(' - ')[1]
            : (selectedClass?.label || '');

          if (classCode === '00') {
            this.dataForm.patchValue({ CLASS_NAME: orgName });
          } else if (orgName && className) {
            this.dataForm.patchValue({ CLASS_NAME: `${orgName}${className}` });
          }
        });
      });
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const params = {
        ...frm.getRawValue(),
        ID: this.isFormCreateable ? undefined : frm.getRawValue().ID
      }
      const $request = this.isFormCreateable ? this.cpm12020Service.insertCPM12020(params) : this.cpm12020Service.updateCPM12020(params);
      $request.pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(response => {
        this.messageService.successBubble(response.Message);
        if (this.isFormCreateable) {
          this.dataForm.reset();
        } else {
          this.onCancel();
        }
      })
    })
  }
}
