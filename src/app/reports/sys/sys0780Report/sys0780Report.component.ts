import { AsyncPipe, CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { PrivilegeOutput, Sys0780Service } from '@service/api/sys/sys0780.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { TreeNode } from '@shared/models/sys/role.model';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ChipModule } from 'primeng/chip';
import { PanelModule } from 'primeng/panel';
import { TriStateCheckboxModule } from 'primeng/tristatecheckbox';
import { finalize } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'app-sys0780-report',
  templateUrl: './sys0780Report.component.html',
  styleUrls: ['./sys0780Report.component.scss'],
  standalone: true,
  imports: [
    TranslateModule, DropdownComponent, CalendarComponent, MultiSelectComponent,
    ReactiveFormsModule, FormsModule, AsyncPipe, ChipModule, CommonModule, PanelModule,
    TriStateCheckboxModule, CheckboxModule, ButtonModule
  ],
  providers: [DatePipe]
})
export class SYS0780ReportComponent extends BasicCruPageComponent<unknown> implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly datePipe = inject(DatePipe);
  private readonly fb = inject(FormBuilder);
  private readonly dropdown = inject(DropdownApiService);
  private readonly sys0780Service = inject(Sys0780Service);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly queryForm = this.fb.group({
    APPLY_DATE: [new Date(), [Validators.required]],
    prog_no: [{ value: null as string | null, disabled: true }],
    org_no: [null as string | null, [Validators.required]],
    role_no: [null as string | null, [Validators.required]],
    user_NoList: [[] as string[], [Validators.required]],
    user_No: [this.authService.currentUserValue?.user_No || null, [Validators.required]],
  });

  // 選項資料流
  subModuleNoOptions$ = this.dropdown.querySys5000SubModuleNo();
  orgIdOptions$ = this.dropdown.querySys3100();
  tblRoleOptions$ = this.dropdown.queryTblRole();
  tblUserOptions$ = this.dropdown.queryTblUser();
  userOptions: any[] = [];

  // 權限樹資料 (單一子模組)
  privilegeTree: TreeNode[] = [];

  ngOnInit(): void {
    this.initParamSubscription();
    this.tblUserOptions$.pipe(untilDestroyed(this)).subscribe(opts => this.userOptions = opts || []);
  }

  private initParamSubscription(): void {
    this.route.queryParams.pipe(untilDestroyed(this)).subscribe(params => {
      const progNo = params['progno']?.toUpperCase();
      if (progNo) {
        this.queryForm.patchValue({ prog_no: progNo });
        this.fetchPrivilegeTree(progNo);
      }
    });
  }

  /** 取得該子模組的權限結構 */
  private fetchPrivilegeTree(progNo: string) {
    // 這裡呼叫後端 API，傳入子模組代碼，取得其下的 Program 與 Actions
    this.sys0780Service.queryModulePrivileges({ prog_no: progNo })
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        if (res.Data) {
          // 處理樹狀結構（複用 Sys0300 邏輯）
          this.privilegeTree = res.Data.map(node => {
            let processed = this.sys0780Service.setParentReferences(node);
            processed = this.sys0780Service.sortNodeData(processed);
            this.sys0780Service.traverseAndCalculateStatus(processed);
            return processed;
          });
          this.cdr.markForCheck();
        }
      });
  }

  onCheckboxChange(node: TreeNode, newValue: boolean) {
    node.IsEnable = newValue === false ? null : newValue;
    this.sys0780Service.cascadeDown(node, node.IsEnable);
    this.sys0780Service.cascadeUp(node);
    this.cdr.markForCheck();
  }

  getUserLabel(userId: string): string {
    const found = this.userOptions.find(opt => opt.value === userId);
    return found ? found.label : userId;
  }

  removeUser(userId: string): void {
    const current = this.queryForm.controls.user_NoList.value || [];
    this.queryForm.patchValue({ user_NoList: current.filter(id => id !== userId) });
  }
  /** 清空所有已選人員 */
  clearAllUsers(): void {
    this.queryForm.patchValue({ user_NoList: [] });
  }

  onSubmit(frm: FormGroup) {
    if (frm.invalid) {
      this.submitted = true;
      return;
    }

    // 1. 提取權限資料
    const selectedPrivileges: PrivilegeOutput[] = [];
    this.privilegeTree.forEach(node =>
      this.sys0780Service.getEnabledPrivileges(node, selectedPrivileges)
    );

    // 2. 檢查是否至少勾選了一個功能
    if (selectedPrivileges.length === 0) {
      this.messageService.warnBubble('請至少選擇一項功能權限');
      return;
    }

    // 3. 組裝傳給後端的 Body
    const body = {
      ...frm.getRawValue(),
      APPLY_DATE: this.datePipe.transform(frm.value.APPLY_DATE, 'yyyy-MM-dd'),
      // 如果後端需要 user_NoList 轉成逗號隔開的字串，可在此處理
      user_nos: frm.value.user_NoList.join(','),
      privileges: selectedPrivileges
    };

    this.loading = true;
    this.sys0780Service.submitApplyReport(body)
      .pipe(
        untilDestroyed(this),
        finalize(() => this.loading = false)
      )
      .subscribe(res => {
        this.messageService.successBubble(res.Message || '申請已送出');
        this.onCancel(); // 回到上一頁或清空
      });
  }
}
