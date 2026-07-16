import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { DividerModule } from 'primeng/divider';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { TableReportComponent } from 'src/app/shared/componentkit/table-report/table-report.component';
import { ReportColumn } from 'src/app/shared/componentkit/table-report/table-report.model';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { tblUser } from '../../../shared/models/sys/sysb000.model';
import { Sys0230Service } from './../../../service/api/sys/sys0230.service';

export interface RoleOption {
  ID: string;
  role_no: string;
  role_name: string;
  description: string;
  Match: boolean;
}

@Component({
  selector: 'app-sys0220-cru',
  templateUrl: './sys0220.cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DividerModule,
    TableReportComponent,
    NgIf,
    TranslateModule,
    DialogComponent,
  ],
})
export class SYS0220CRUComponent extends BasicCruPageComponent<tblUser> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    user_No: ['', [Validators.required, Validators.maxLength(10)]],
    user_Name: ['', [Validators.required, Validators.maxLength(20)]],
  });
  assignedRoles: RoleOption[] = [];
  availableRoles: RoleOption[] = [];
  originalAvailableRoles: RoleOption[] = [];
  selectedAssignedRoles: RoleOption[] = [];
  selectedAvailableRoles: RoleOption[] = [];
  assignedRolesColumns: ReportColumn[] = [
    { field: 'role_no', header: '角色代號', visible: true },
    { field: 'role_name', header: '角色名稱', visible: true },
    { field: 'description', header: '角色註記', visible: true },
  ];

  availableRolesColumns: ReportColumn[] = [
    { field: 'role_no', header: '角色代號', visible: true },
    { field: 'role_name', header: '角色名稱', visible: true },
  ];

  dialogVisible = false;

  filterDialogForm = this.formBuilder.nonNullable.group({
    filter_role_no: [''],
    filter_role_name: [''],
  });

  constructor(private sys0220Service: Sys0230Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('SYS0220', this.dataForm);
    this.loadRoles(this.dataForm.get('user_No')?.value ?? '');
    this.filterDialogForm.valueChanges.pipe(untilDestroyed(this)).subscribe(() => {
      this.filterAvailableRoles();
    });
  }
  loadRoles(userNo: string) {
    this.sys0220Service.queryUserRoles({ User_No: userNo }).subscribe((response) => {
      const allRoles = response.Data as RoleOption[];
      this.assignedRoles = allRoles.filter((role) => role.Match);
      this.originalAvailableRoles = allRoles.filter((role) => !role.Match);
      this.availableRoles = [...this.originalAvailableRoles]; // Initialize dialog data
    });
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const requestBody = {
        User_No: frm.getRawValue().user_No,
        RoleNoList: this.assignedRoles.map((role) => role.role_no),
      };

      this.sys0220Service
        .updateUserRoles(requestBody)
        .pipe(untilDestroyed(this), finalize(() => (this.loading = false)))
        .subscribe(() => {
          this.messageService.successBubble('更新成功');
          this.onCancel();
        });
    });
  }
  saveDialog() {
    this.dialogVisible = false;
    this.assignedRoles = [...this.assignedRoles, ...this.selectedAvailableRoles];
    this.availableRoles = this.availableRoles.filter(
      (dialogItem) => !this.selectedAvailableRoles.some((selectedItem) => selectedItem.ID === dialogItem.ID)
    );
    this.selectedAvailableRoles = [];
    this.filterDialogForm.reset();
  }
  onDelete(rolesToDelete: RoleOption[]) {
    this.availableRoles = [...this.availableRoles, ...rolesToDelete];
    this.assignedRoles = this.assignedRoles.filter(
      (assignedRole) => !rolesToDelete.some((deletedRole) => deletedRole.ID === assignedRole.ID)
    );
  }

  filterAvailableRoles(): void {
    const { filter_role_no, filter_role_name } = this.filterDialogForm.value;
    let filteredData = this.originalAvailableRoles;
    if (filter_role_no) {
      filteredData = filteredData.filter((role) => role.role_no.includes(filter_role_no));
    }
    if (filter_role_name) {
      filteredData = filteredData.filter((role) => role.role_name.includes(filter_role_name));
    }
    this.availableRoles = filteredData.filter(
      (availableRole) => !this.assignedRoles.some((assignedRole) => assignedRole.ID === availableRole.ID)
    );
  }
}
