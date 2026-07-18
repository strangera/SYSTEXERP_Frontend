import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { Sys0110Service } from '../../../service/api/sys/sys0110.service';
import { Sys0230Service } from '../../../service/api/sys/sys0230.service';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { TreeNode } from '../../../shared/models/sys/role.model';
import { UserData } from '../../../shared/models/sys/user.model';
import { Sys0300Component } from '../sys0300/sys0300.component';
import { PrivilegeOutput, Sys0300Service } from '../sys0300/sys0300.service';

@Component({
  selector: 'app-sys0320.cru',
  templateUrl: './sys0320.cru.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    NgIf,
    TranslateModule,
    Sys0300Component
  ],
})
export class SYS0320CRUComponent extends BasicCruPageComponent<UserData> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    user_No: [{ value: '', disabled: true }],
    user_Name: [{ value: '', disabled: true }],
  });

  // 權限模組清單
  moduleDataList: TreeNode[] = [];

  constructor(
    private sys0110Service: Sys0110Service,
    private sys0230Service: Sys0230Service,
    private sys0300Service: Sys0300Service,
    private cdr: ChangeDetectorRef,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('SYS0320', this.dataForm);
    this.fetchUserPrivileges();
  }

  /** 取得使用者權限資料 */
  private fetchUserPrivileges() {
    this.sys0110Service.queryUserPrivileges({ user_no: `${this.rowdata?.user_No}` })
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (response: ApiResponse<TreeNode[]>) => {
          if (response.Data && Array.isArray(response.Data)) {
            // 使用 Service 處理樹狀結構與初始狀態計算
            this.moduleDataList = response.Data.map(node => {
              let transformedNode = this.sys0300Service.setParentReferences(node);
              transformedNode = this.sys0300Service.sortNodeData(transformedNode);
              this.sys0300Service.traverseAndCalculateStatus(transformedNode);
              return transformedNode;
            });

            this.moduleDataList = this.sys0300Service.setInitialOpenState(this.moduleDataList);
            this.cdr.markForCheck();
          }
        }
      });
  }

  onPrivilegeChanged(node: TreeNode) {
    this.cdr.markForCheck();
  }

  /** 提交存檔 */
  onSubmit(): void {
    const privilegeList: PrivilegeOutput[] = [];
    this.moduleDataList.forEach(m => this.sys0300Service.extractEnabledPrivileges(m, privilegeList));

    const body = {
      user_no: this.dataForm.getRawValue().user_No || '',
      data: privilegeList
    };

    this.loading = true;
    this.sys0230Service.updateUserPrivileges(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
      this.messageService.successBubble(res.Message);
      this.systemDataService.getFunRightsInfo().pipe(untilDestroyed(this)).subscribe(() => {
        this.onCancel();
      });
    });
  }
}
