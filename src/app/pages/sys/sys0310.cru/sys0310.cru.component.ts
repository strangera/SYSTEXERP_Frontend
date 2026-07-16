import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { Sys0210Service } from '../../../service/api/sys/sys0210.service';
import { Sys0230Service } from '../../../service/api/sys/sys0230.service';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { Role, TreeNode } from '../../../shared/models/sys/role.model';
import { Sys0300Component } from '../sys0300/sys0300.component';
import { PrivilegeOutput, Sys0300Service } from '../sys0300/sys0300.service';

@Component({
  selector: 'app-sys0310.cru',
  templateUrl: './sys0310.cru.component.html',
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
export class SYS0310CRUComponent extends BasicCruPageComponent<Role> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    Role_No: [{ value: '', disabled: true }],
    Role_Name: [{ value: '', disabled: true }],
    Description: [{ value: '', disabled: true }],
  });

  moduleDataList: TreeNode[] = [];

  constructor(
    private sys0210Service: Sys0210Service,
    private sys0230Service: Sys0230Service,
    private sys0300Service: Sys0300Service,
    private cdr: ChangeDetectorRef,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('SYS0310', this.dataForm);
    this.fetchRolePrivileges();
  }

  private fetchRolePrivileges() {
    this.sys0210Service.queryRolePrivileges({ Role_No: `${this.rowdata?.Role_No}` })
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (response: ApiResponse<TreeNode[]>) => {
          if (response.Data && Array.isArray(response.Data)) {
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

  onSubmit(): void {
    const privilegeList: PrivilegeOutput[] = [];
    this.moduleDataList.forEach(m => this.sys0300Service.extractEnabledPrivileges(m, privilegeList));

    const body = {
      Role_No: this.dataForm.getRawValue().Role_No || '',
      data: privilegeList
    };

    this.loading = true;
    this.sys0230Service.updateRolePrivileges(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
      this.messageService.successBubble(res.Message);
      this.systemDataService.getFunRightsInfo().pipe(untilDestroyed(this)).subscribe(() => {
        this.onCancel();
      });
    });
  }
}
