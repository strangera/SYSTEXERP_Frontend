import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';

import { DropDownListService, IDropdownItem } from '@service/utility/dropDownList.service';
import { ASS11080Service } from '../../../service/api/ass/ass11080.service';
import { ASS11080Data } from './ass11080.model';

// 3.1.1.8 處分資產基本設定
@UntilDestroy()
@Component({
  selector: 'app-ass11080',
  templateUrl: './ass11080.component.html',
  styleUrl: './ass11080.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    ButtonComponent
  ]
})
export class ASS11080Component extends BasicCruPageComponent<ASS11080Data> implements OnInit {

  // 表單定義
  dataForm = this.formBuilder.group({
    /** 變賣傳票是否啟用 */
    PS: ['', [Validators.required]],
    /** 報廢傳票是否啟用 */
    PC: ['', [Validators.required]],
    /** 資產報廢->處分資產損失 */
    PC_LOSS: ['', [Validators.required]],
    /** 資產變賣->應收帳款 */
    AR: ['', [Validators.required]],
    /** 資產變賣->處分資產損失 */
    LOSS: ['', [Validators.required]],
    /** 資產變賣->處分資產收入 */
    GET: ['', [Validators.required]],
    /** 資產變賣->耗材報廢會科 */
    MTDAM: ['', [Validators.required]],
    /** 耗材盤點->耗材盤盈會科 */
    MTINVW: ['', [Validators.required]],
    /** 耗材盤點->耗材盤損會科 */
    MTINVL: ['', [Validators.required]],
  });

  // 下拉選項：是/否
  yesNoOptions = [
    { value: 'Y', label: '是' },
    { value: 'N', label: '否' }
  ];

  // 下拉選項：會計科目 (GLS1005)
  accountOptions: IDropdownItem[] = [];

  constructor(
    private ass11080Service: ASS11080Service,
    private dropDownListService: DropDownListService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS11080', this.dataForm);

    // 載入會計科目下拉選項
    this.loadAccountOptions();

    // 一進入頁面就載入設定資料
    this.onQuery();
  }

  /**
   * 載入會計科目下拉選項 (GLS1005)
   */
  private loadAccountOptions(): void {
    this.dropDownListService.queryGLS1005_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res) => {
          const rows = Array.isArray(res?.Data) ? res.Data : [];
          this.accountOptions = rows.map((x: IDropdownItem) => ({
            ...x,
            label: `${x.No} - ${x.Name}`,
            value: x.No
          }));
        },
        error: (err) => {
          console.error('載入會計科目選項失敗:', err);
          this.accountOptions = [];
        }
      });
  }

  /**
   * 重新查詢 - 載入設定資料
   */
  onQuery(): void {
    this.loading = true;
    this.messageService.blockUi();

    this.ass11080Service.queryASS11080()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res) => {
          if (res?.Data) {
            this.dataForm.patchValue(res.Data);
          }
          this.loading = false;
          this.messageService.unblockUi();
        },
        error: (err) => {
          console.error('查詢設定失敗:', err);
          this.messageService.errorBubble('查詢設定失敗');
          this.loading = false;
          this.messageService.unblockUi();
        }
      });
  }

  /**
   * 更新設定
   */
  onUpdate(): void {
    this.handleSubmit(this.dataForm, () => {
      const payload = this.dataForm.getRawValue() as ASS11080Data;

      this.ass11080Service.updateASS11080(payload)
        .pipe(untilDestroyed(this))
        .subscribe({
          next: (res) => {
            if (res?.Status === '0000') {
              this.messageService.successBubble('更新成功');
              this.submitted = false;
            } else {
              this.messageService.errorBubble(res?.Message || '更新失敗');
            }
            this.loading = false;
            this.messageService.unblockUi();
          },
          error: (err) => {
            console.error('更新設定失敗:', err);
            this.messageService.errorBubble('更新設定失敗');
            this.loading = false;
            this.messageService.unblockUi();
          }
        });
    });
  }
}
