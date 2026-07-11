import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { FIN41060Service } from '@service/api/fin/fin41060.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { FIN41060QueryRow, FIN41060UpdateData } from '../fin41060/fin41060.model';

@Component({
  selector: 'app-fin41060-cru',
  templateUrl: './fin41060-cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    ButtonComponent,
    TranslateModule,
  ],
})
export class FIN41060CRUComponent extends BasicCruPageComponent<FIN41060QueryRow> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    Org_ID: [''],
    Org_Name: [''],
    Budget_Year: [''],
    Budget_Version: [''],
    Audit_Status_NM: [''],
  });

  constructor(private readonly fin41060Service: FIN41060Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN41060', this.dataForm);
    this.dataForm.disable();
  }

  /** 審核 / 反審核按鈕僅在進入編輯模式時顯示，不檢查權限 */
  get showAuditButtons(): boolean {
    return this.crudstatus === CRUDStatus.Edit;
  }

  onApprove(): void {
    this.runAudit('Y', '審核');
  }

  onAntiApprove(): void {
    this.runAudit('N', '反審核');
  }

  private runAudit(action: 'Y' | 'N', label: string): void {
    const { Org_ID, Budget_Year, Budget_Version } = this.dataForm.getRawValue();
    this.messageService.confirm({
      header: `確認${label}`,
      message: `是否確認${label}此筆資料？`,
      accept: () => {
        this.loading = true;
        this.fin41060Service
          .updateFIN41060({
            Org_ID,
            Budget_Year,
            Budget_Version,
            Action: action,
          })
          .pipe(
            finalize(() => (this.loading = false)),
            untilDestroyed(this),
          )
          .subscribe({
            next: (res: { Status: string; Message?: string; Data: FIN41060UpdateData }) => {
              if (res.Status === '0000') {
                const msg = res.Message ?? res.Data?.ErrMsg ?? `${label}成功`;
                this.messageService.successBubble(msg);
                this.dataForm.patchValue({
                  Audit_Status_NM: action === 'Y' ? '是' : '否',
                });
              }
            },
          });
      },
    });
  }
}
