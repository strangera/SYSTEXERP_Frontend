import { AsyncPipe, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { PrivilegeOutput, Sys0780Service } from '@service/api/sys/sys0780.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { Option } from '@service/utility/dropdown-api.model';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { TreeNode } from '@shared/models/sys/role.model';
import { FileExportService } from '@shared/service/file-export.service';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ChipModule } from 'primeng/chip';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { PanelModule } from 'primeng/panel';
import { TriStateCheckboxModule } from 'primeng/tristatecheckbox';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-sys0780-report',
  templateUrl: './sys0780Report.component.html',
  styleUrls: ['./sys0780Report.component.scss'],
  standalone: true,
  imports: [
    TranslateModule, DropdownComponent, CalendarComponent, MultiSelectComponent,
    ReactiveFormsModule, FormsModule, AsyncPipe, ChipModule, PanelModule,
    TriStateCheckboxModule, CheckboxModule, ButtonModule, InputTextareaModule
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
  private readonly fileExportService = inject(FileExportService);
  private readonly destroyRef = inject(DestroyRef);

  readonly isPdfExporting = signal(false);
  readonly isWordExporting = signal(false);

  readonly queryForm = this.fb.group({
    APPLY_DATE: [new Date(), [Validators.required]],
    prog_no: [{ value: null as string | null, disabled: true }],
    org_no: [null as string | null, [Validators.required]],
    role_no: [null as string | null],
    user_NoList: [[] as string[], [Validators.required]],
    user_No: [this.authService.currentUserValue?.user_No || null, [Validators.required]],
  });

  readonly subModuleNoOptions$ = this.dropdown.querySys5000SubModuleNo();
  readonly orgIdOptions$ = this.dropdown.querySys3100();
  readonly tblRoleOptions$ = this.dropdown.queryTblRole();
  readonly tblUserOptions$ = this.dropdown.queryTblUser();
  userOptions: Option[] = [];

  privilegeTree: TreeNode[] = [];

  ngOnInit(): void {
    this.initParamSubscription();
    this.tblUserOptions$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(opts => this.userOptions = opts || []);
  }

  private initParamSubscription(): void {
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        const progNo = params['progno']?.toUpperCase();
        if (progNo) {
          this.queryForm.patchValue({ prog_no: progNo });
          this.fetchPrivilegeTree(progNo);
        }
      });
  }

  private fetchPrivilegeTree(progNo: string): void {
    this.sys0780Service.queryModulePrivileges({ prog_no: progNo })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (res.Data) {
          this.privilegeTree = res.Data.map(node => {
            const processed = this.sys0780Service.setParentReferences(node);
            this.sys0780Service.sortNodeData(processed);
            this.sys0780Service.traverseAndCalculateStatus(processed);
            return processed;
          });
          this.cdr.markForCheck();
        }
      });
  }

  onCheckboxChange(node: TreeNode, newValue: boolean): void {
    node.IsEnable = newValue === false ? null : newValue;
    this.sys0780Service.cascadeDown(node, node.IsEnable);
    this.sys0780Service.cascadeUp(node);
    this.cdr.markForCheck();
  }

  getUserLabel(userId: string): string {
    return this.userOptions.find(opt => opt['value'] === userId)?.['label'] ?? userId;
  }

  removeUser(userId: string): void {
    const current = this.queryForm.controls.user_NoList.value ?? [];
    this.queryForm.patchValue({ user_NoList: current.filter(id => id !== userId) });
  }

  clearAllUsers(): void {
    this.queryForm.patchValue({ user_NoList: [] });
  }

  private extractWithRemark(nodes: TreeNode[], list: PrivilegeOutput[]): void {
    nodes.forEach(node => {
      node.actions?.forEach(act => {
        if (act.IsEnable === true) {
          list.push({ prog_no: node.id, function_code: act.id, isEnable: 'Y', remark: node['remark'] });
        }
      });
      if (node.children?.length) {
        this.extractWithRemark(node.children, list);
      }
    });
  }

  private buildExportBody(): { body: object; privileges: PrivilegeOutput[] } | null {
    if (this.queryForm.invalid) {
      this.submitted = true;
      this.messageService.warnBubble('請填寫完整申請資訊');
      return null;
    }
    const selectedPrivileges: PrivilegeOutput[] = [];
    this.extractWithRemark(this.privilegeTree, selectedPrivileges);
    if (selectedPrivileges.length === 0) {
      this.messageService.warnBubble('請至少選擇一項功能權限');
      return null;
    }
    return {
      body: {
        ...this.queryForm.getRawValue(),
        APPLY_DATE: this.datePipe.transform(this.queryForm.value.APPLY_DATE, 'yyyy-MM-dd'),
        privileges: selectedPrivileges,
      },
      privileges: selectedPrivileges,
    };
  }

  onExportPDF(): void {
    const result = this.buildExportBody();
    if (!result) return;
    const export$ = this.sys0780Service.exportPDFSYS0780(result.body);
    this.fileExportService
      .executeFileExport(export$.pipe(takeUntilDestroyed(this.destroyRef)), '.pdf', isLoading => this.isPdfExporting.set(isLoading))
      .subscribe();
  }

  onExportWord(): void {
    const result = this.buildExportBody();
    if (!result) return;
    const export$ = this.sys0780Service.exportWordSYS0780(result.body);
    this.fileExportService
      .executeFileExport(export$.pipe(takeUntilDestroyed(this.destroyRef)), '.doc', isLoading => this.isWordExporting.set(isLoading))
      .subscribe();
  }
}
