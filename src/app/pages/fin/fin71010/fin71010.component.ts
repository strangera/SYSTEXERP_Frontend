import { Component, OnInit, computed, effect, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FIN71010Service } from '@service/api/fin/fin71010.service';
import { DropDownListService, IDropdownItem } from '@service/utility/dropDownList.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { NGXLogger } from 'ngx-logger';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { FIN71010Data } from './fin71010.model';

@Component({
  selector: 'app-fin71010',
  templateUrl: './fin71010.component.html',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    ButtonModule,
    DropdownComponent,
    MenubarComponent,
    PanelModule,
  ],
})
export class FIN71010Component extends BasicQueryPageComponent<FIN71010Data> implements OnInit {

  public readonly queryLoading = signal<boolean>(false);
  public readonly loadingEffect = effect(() => {
    this.loading = this.queryLoading();
  });

  public readonly editForm = this.formBuilder.group({
    MID: new FormControl<number | void>(void 0),
    SYS_StoreNo: new FormControl<string | void>({ value: void 0, disabled: true }),
    ECR_No: new FormControl<string | void>({ value: void 0, disabled: true }),
    APEXP_LID: new FormControl<string | void>(void 0),
    APEXP_LID_COMMON: new FormControl<string | void>(void 0),
    PTAX_LID: new FormControl<string | void>(void 0),
    PTAX_LID_COMMON: new FormControl<string | void>(void 0),
  });
  public readonly ef = computed(() => this.editForm.controls);

  public readonly hasData = signal<boolean>(false);
  public readonly savingLoading = signal<boolean>(false);

  public readonly gls1005Options = signal<IDropdownItem[] | null>(null);

  constructor(
    public readonly service: FIN71010Service,
    private readonly dropDownListService: DropDownListService,
    private readonly logger: NGXLogger,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.initializePage('FIN71010');
    this.loadDropdowns();
    this.loadData();
  }

  private loadDropdowns(): void {
    this.dropDownListService.queryGLS1005_DropDownList().subscribe({
      next: res => {
        const items = res.Status === '0000' ? res.Data.map(o => ({ ...o, DisplayName: `${o.No} - ${o.Name}` })) : [];
        this.gls1005Options.set(items);
      },
    });
  }

  public loadData(): void {
    this.queryLoading.set(true);
    this.service.queryFIN71010({}).pipe(
      finalize(() => this.queryLoading.set(false)),
    ).subscribe({
      next: res => {
        if (res.Status !== '0000' || !res.Data?.length) {
          this.hasData.set(false);
          return;
        }
        const row = res.Data[0];
        this.hasData.set(true);
        this.editForm.patchValue({
          MID: row.MID,
          SYS_StoreNo: row.SYS_StoreNo,
          ECR_No: row.ECR_No,
          APEXP_LID: row.APEXP_LID,
          APEXP_LID_COMMON: row.APEXP_LID_COMMON,
          PTAX_LID: row.PTAX_LID,
          PTAX_LID_COMMON: row.PTAX_LID_COMMON,
        });
        this.logger.debug('FIN71010 載入資料:', row);
      },
    });
  }

  public onSave(): void {
    const raw = this.editForm.getRawValue();
    this.savingLoading.set(true);
    this.service.updateFIN71010({
      MID: raw.MID as number,
      SYS_StoreNo: raw.SYS_StoreNo as string,
      ECR_No: raw.ECR_No as string,
      APEXP_LID: raw.APEXP_LID ?? null,
      APEXP_LID_COMMON: raw.APEXP_LID_COMMON ?? null,
      PTAX_LID: raw.PTAX_LID ?? null,
      PTAX_LID_COMMON: raw.PTAX_LID_COMMON ?? null,
    }).pipe(
      finalize(() => this.savingLoading.set(false)),
    ).subscribe({
      next: res => {
        if (res.Status !== '0000') return;
        this.messageService.successBubble('更新成功');
        this.loadData();
      },
    });
  }
}
