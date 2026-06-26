import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { tblUser } from '../../../shared/models/sys/sysb000.model';
import { Sys0230Service } from './../../../service/api/sys/sys0230.service';

export interface UserOption {
  ID: string;
  User_No: string;
  User_Name: string;
  Org_Id: string | null;
  Org_Name: string | null;
  Match: boolean;
}

// 4-2-2-2 角色之使用者設定維護 CRU
@Component({
  selector: 'app-sys0230-cru',
  templateUrl: './sys0230.cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    TableReportComponent,
    TranslateModule,
    DialogComponent,
  ],
})
export class SYS0230CRUComponent extends BasicCruPageComponent<tblUser> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    Role_No: [{ value: '', disabled: true }],
    Role_Name: [{ value: '', disabled: true }],
    Description: [{ value: '', disabled: true }],
  });

  assignedUsers: UserOption[] = [];
  private initialAssignedUsers: UserOption[] = [];
  selectedAssignedUsers: UserOption[] = [];

  private allUsersFromServer: UserOption[] = [];
  availableUsers: UserOption[] = [];
  selectedAvailableUsers: UserOption[] = [];

  dialogVisible = false;

  filterDialogForm = this.formBuilder.nonNullable.group({
    User_No: [''],
    User_Name: [''],
    Org_Id: [''],
  });

  assignedUsersColumns: ReportColumn[] = [
    { field: 'User_No', header: '使用者編號', visible: true },
    { field: 'User_Name', header: '使用者名稱', visible: true },
    { field: 'Org_Name', header: '組織名稱', visible: true },
  ];

  availableUsersColumns: ReportColumn[] = [
    { field: 'User_No', header: '使用者編號', visible: true },
    { field: 'User_Name', header: '使用者名稱', visible: true },
    { field: 'Org_Name', header: '組織名稱', visible: true },
  ];

  constructor(
    private sys0230Service: Sys0230Service,
    private readonly cdr: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('SYS0230', this.dataForm);
    this.loadRoleUsers(this.dataForm.get('Role_No')?.value ?? '');

    this.filterDialogForm.valueChanges.pipe(untilDestroyed(this)).subscribe(() => {
      this.filterAvailableUsers();
    });
  }

  loadRoleUsers(roleNo: string) {
    this.sys0230Service.queryRoleUsers({ Role_No: roleNo }).subscribe((response) => {
      this.allUsersFromServer = response.Data as UserOption[];
      this.assignedUsers = this.allUsersFromServer.filter((user: UserOption) => user.Match);
      this.initialAssignedUsers = [...this.assignedUsers];
      this.filterAvailableUsers();
    });
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const currentAssignedUserNos = this.assignedUsers.map((user) => user.User_No);
      const initialAssignedUserNos = this.initialAssignedUsers.map((user) => user.User_No);

      const deleteUserNoList = initialAssignedUserNos.filter(
        (userNo) => !currentAssignedUserNos.includes(userNo)
      );

      const requestBody = {
        Role_No: frm.getRawValue().Role_No,
        UserNoList: currentAssignedUserNos,
        DeleteUserNoList: deleteUserNoList,
      };

      this.sys0230Service
        .updateRoleUsers(requestBody)
        .pipe(
          untilDestroyed(this),
          finalize(() => (this.loading = false))
        )
        .subscribe(() => {
          this.messageService.successBubble('更新成功');
          this.onCancel();
        });
    });
  }

  saveDialog() {
    this.dialogVisible = false;
    this.assignedUsers = [...this.assignedUsers, ...this.selectedAvailableUsers];
    this.selectedAvailableUsers = [];
    this.filterDialogForm.reset();
    this.filterAvailableUsers();
  }

  onDelete(usersToDelete: UserOption[]) {
    this.assignedUsers = this.assignedUsers.filter(
      (assignedUser) => !usersToDelete.some((deletedUser) => deletedUser.ID === assignedUser.ID)
    );
    this.filterAvailableUsers();
  }

  filterAvailableUsers(): void {
    const { User_No, User_Name, Org_Id } = this.filterDialogForm.value;

    let filteredData = [...this.allUsersFromServer];

    if (User_No) {
      filteredData = filteredData.filter((user) => user.User_No.includes(User_No));
    }
    if (User_Name) {
      filteredData = filteredData.filter((user) => user.User_Name.includes(User_Name));
    }
    if (Org_Id) {
      filteredData = filteredData.filter((user) => user.Org_Id?.includes(Org_Id));
    }

    this.availableUsers = filteredData.filter(
      (availableUser) => !this.assignedUsers.some((assignedUser) => assignedUser.ID === availableUser.ID)
    );
  }

  onInsert() {
    this.availableUsers = [];
    this.dialogVisible = true;
  }

  onDialogShow() {
    this.filterAvailableUsers();
    this.cdr.detectChanges();
  }
}
