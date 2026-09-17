// 折舊攤提作業 (ASS13120)

import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ASS13120Service } from '@service/api/ass/ass13120.service';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';

import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarComponent } from '../../../shared/components/calendar/calendar.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';

//3.1.3.12  折舊攤提作業
@Component({
    selector: 'app-ass13120',
    templateUrl: './ass13120.component.html',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TranslateModule,
        AccordionModule,
        MenubarComponent,
        ButtonComponent,
        CalendarComponent,
    ],
})
export class ASS13120Component extends BasicQueryPageComponent<unknown> implements OnInit {
    private readonly destroyRef = inject(DestroyRef);
    private readonly ass13120Service = inject(ASS13120Service);
    queryForm = this.formBuilder.group({
        DepreYM: [null as Date | null, Validators.required],
    });

    // 最後傳票產生日期提示文字 (SP 已回傳完整說明句，如：最後傳票產生日期：2026年05月)
    lastVoucherInfo = '';
    creating = false;

    ngOnInit(): void {
        this.initializePage('ASS13120');
        this.loadLastVoucherDate();
    }

    loadLastVoucherDate(): void {
        this.ass13120Service
            .queryASS13120()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((res) => {
                // SP 回傳的 Result 已內含「最後傳票產生日期：」字樣，這裡只取冒號後的內容，
                // 避免跟畫面上固定的標籤文字重複顯示
                const raw = res?.Data?.Result ?? '';
                const idx = raw.indexOf('：');
                this.lastVoucherInfo = idx >= 0 ? raw.slice(idx + 1) : raw;
            });
    }

    onGenerate(form: FormGroup): void {
        this.handleSubmit(form, () => {
            const depreYM = this.toYYYYMM(form.value.DepreYM as Date | null);

            // 先查詢是否有尚未審核的資產
            this.loading = true;
            this.ass13120Service
                .queryASS13120()
                .pipe(
                    takeUntilDestroyed(this.destroyRef),
                    finalize(() => {
                        this.loading = false;
                    })
                )
                .subscribe({
                    next: (res) => {
                        const isHaveAssetNotApproved =
                            res?.Data?.IsHaveAssetNotApproved === true;

                        // 有未審核資產 → 跳確認視窗
                        if (isHaveAssetNotApproved) {
                            this.messageService.confirm({
                                header: '確認建立',
                                message: '目前尚有資產未審核，是否仍要繼續執行折舊攤提作業？',
                                accept: () => {
                                    this.createDepreciation(depreYM);
                                },
                            });

                            return;
                        }

                        // 沒有未審核資產 → 直接建立
                        this.createDepreciation(depreYM);
                    },
                });
        });
    }

    private createDepreciation(depreYM: string): void {
        this.creating = true;
        this.loading = true;

        this.ass13120Service
            .createASS13120({ DepreYM: depreYM })
            .pipe(
                takeUntilDestroyed(this.destroyRef),
                finalize(() => {
                    this.loading = false;
                    this.creating = false;
                    this.messageService.unblockUi();
                })
            )
            .subscribe({
                next: (res) => {
                    if (res?.Status === '0000' && res.Data?.IsSuccess) {
                        this.messageService.successBubble('建立成功');
                        this.queryForm.reset();
                        this.loadLastVoucherDate();
                        return;
                    }

                    if (res?.Data && !res.Data.IsSuccess) {
                        this.messageService.errorBubble(
                            res.Data.Message || '建立折舊傳票失敗'
                        );
                    }
                },
            });
    }

    private toYYYYMM(value: Date | null): string {
        if (!value) return '';
        const y = value.getFullYear();
        const m = `${value.getMonth() + 1}`.padStart(2, '0');
        return `${y}${m}`;
    }

}
