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
import { FIN41030QueryRow } from '../fin41030/fin41030.model';
@Component({
  selector: 'app-fin41030-cru',
  templateUrl: './fin41030-cru.component.html',
  styleUrl: './fin41030-cru.component.scss',
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
    budget_yy: [''],
    budget_version: [''],
    budget_status: [''],
  });

  constructor(private readonly fin41030Service: FIN41030Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN41030', this.dataForm);
    this.dataForm.disable();
  }

  onApprove(): void {
    const { budget_yy, budget_version } = this.dataForm.getRawValue();
    this.messageService.confirm({
      header: '確認審核',
      message: '是否確認審核此筆資料？',
      accept: () => {
        this.loading = true;
        this.fin41030Service
          .approveFIN41030({
            Action: 'A',
            budget_yy,
            budget_version,
          })
          .pipe(
            finalize(() => (this.loading = false)),
            untilDestroyed(this),
          )
          .subscribe({
            next: (res) => {
              if (res.Status === '0000') {
                this.messageService.successBubble(res.Message ?? '審核成功');
                this.dataForm.patchValue({ budget_status: 'Y' });
              } else {
                this.messageService.errorBubble(res.Message ?? '審核失敗');
              }
            },
          });
      },
    });
  }

  onAntiApprove(): void {
    const { budget_yy, budget_version } = this.dataForm.getRawValue();
    this.messageService.confirm({
      header: '確認反審核',
      message: '是否確認反審核此筆資料？',
      accept: () => {
        this.loading = true;
        this.fin41030Service
          .approveFIN41030({
            Action: 'U',
            budget_yy,
            budget_version,
          })
          .pipe(
            finalize(() => (this.loading = false)),
            untilDestroyed(this),
          )
          .subscribe({
            next: (res) => {
              if (res.Status === '0000') {
                this.messageService.successBubble(res.Message ?? '反審核成功');
                this.dataForm.patchValue({ budget_status: 'N' });
              } else {
                this.messageService.errorBubble(res.Message ?? '反審核失敗');
              }
            },
          });
      },
    });
  }
}
