import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { FIN41030Service } from '@service/api/fin/fin41030.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { FIN41030ApproveData, FIN41030QueryRow } from '../fin41030/fin41030.model';
@Component({
  selector: 'app-fin41030-cru',
  templateUrl: './fin41030-cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    DropdownComponent,
    ButtonComponent,
    TranslateModule,
  ],
})
export class FIN41030CRUComponent extends BasicCruPageComponent<FIN41030QueryRow> implements OnInit {
  budgetStatusOptions = [
    { value: 'Y', label: '已審核' },
    { value: 'N', label: '未審核' },
  ];

  dataForm = this.formBuilder.nonNullable.group({
    MID: [0],
    BudgetYear: [''],
    BudgetVersion: [''],
    BudgetStatus: [''],
  });

  constructor(private readonly fin41030Service: FIN41030Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN41030', this.dataForm);
    this.dataForm.disable();
  }

  onApprove(): void {
    const { MID, BudgetYear, BudgetVersion } = this.dataForm.getRawValue();
    this.messageService.confirm({
      header: '確認審核',
      message: '是否確認審核此筆資料？',
      accept: () => {
        this.loading = true;
        this.fin41030Service
          .approveFIN41030({
            Action: 'A',
            MID,
            BudgetYear,
            BudgetVersion,
          })
          .pipe(
            finalize(() => (this.loading = false)),
            untilDestroyed(this),
          )
          .subscribe({
            next: (res: { Status: string; Message?: string; Data: FIN41030ApproveData }) => {
              if (res.Status === '0000') {
                const msg = res.Message ?? res.Data?.ResultMessage ?? '審核成功';
                this.messageService.successBubble(msg);
                this.dataForm.patchValue({ BudgetStatus: 'Y' });
              }
            },
          });
      },
    });
  }

  onAntiApprove(): void {
    const { MID, BudgetYear, BudgetVersion } = this.dataForm.getRawValue();
    this.messageService.confirm({
      header: '確認反審核',
      message: '是否確認反審核此筆資料？',
      accept: () => {
        this.loading = true;
        this.fin41030Service
          .approveFIN41030({
            Action: 'U',
            MID,
            BudgetYear,
            BudgetVersion,
          })
          .pipe(
            finalize(() => (this.loading = false)),
            untilDestroyed(this),
          )
          .subscribe({
            next: (res: { Status: string; Message?: string; Data: FIN41030ApproveData }) => {
              if (res.Status === '0000') {
                const msg = res.Message ?? res.Data?.ResultMessage ?? '反審核成功';
                this.messageService.successBubble(msg);
                this.dataForm.patchValue({ BudgetStatus: 'N' });
              }
            },
          });
      },
    });
  }
}
