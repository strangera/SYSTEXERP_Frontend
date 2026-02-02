import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, ViewChild, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { TableEditComponent } from '@shared/componentkit/table-edit/table-edit.component';
import { EditColumn } from '@shared/componentkit/table-edit/table-edit.model';
import { Base64Service } from '@shared/service/base64.service';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { MaintainSYSBR10Request, QuerySYSBR10DetailResponse, QuerySYSBR10Response, SYSBR10Service } from '../../../service/api/sys/sysbr10.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { EditorTextComponent } from '../../../shared/componentkit/editor-text/editor-text.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';

@Component({
  selector: 'app-sysbr10.cru',
  templateUrl: './sysbr10.cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeComponent,
    DropdownComponent,
    InputTextComponent,
    EditorTextComponent,
    TableEditComponent,
    TranslateModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SYSBR10CRUComponent extends BasicCruPageComponent<QuerySYSBR10Response> implements OnInit {
  // 2. 使用 inject 取代 constructor，並注入必要服務
  private readonly sysbr10Service = inject(SYSBR10Service);
  private readonly dropdown = inject(DropdownApiService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild(TableEditComponent) tableEditComponent!: TableEditComponent;

  // 3. 使用 Signal 管理明細資料
  detailList = signal<QuerySYSBR10DetailResponse[]>([]);

  dataForm = this.formBuilder.nonNullable.group({
    Pub_StartDate: [null as Date | null, Validators.required],
    Pub_EndDate: [null as Date | null, Validators.required],
    pub_enable: ['N', Validators.required],
    Pub_Type: [null as string | null, Validators.required],
    Pub_Event: [null as Date | null, Validators.required],
    Pub_Description: [null as string | null, Validators.required],
  });

  User_NoOptions$ = this.dropdown.queryTblUser();
  Org_IDOptions$ = this.dropdown.querySys3100();
  Role_NoOptions$ = this.dropdown.queryTblRole();
  Pub_TypeOptions = getSYS1000Options('T115');
  YNOptions = getSYS1000Options('YES_NO');

  detailcolumns: EditColumn[] = [
    {
      field: 'User_No', header: '使用者編號', type: 'dropdown',
      options: () => this.User_NoOptions$,
      optionsAsync: true,
      optionLabel: 'label',
      optionValue: 'value'
    },
    {
      field: 'Org_ID', header: '組織代碼', type: 'dropdown',
      options: () => this.Org_IDOptions$,
      optionsAsync: true,
      optionLabel: 'label',
      optionValue: 'value'
    },
    {
      field: 'Role_No', header: '角色代號', type: 'dropdown',
      options: () => this.Role_NoOptions$,
      optionsAsync: true,
      optionLabel: 'label',
      optionValue: 'value'
    },
  ];

  ngOnInit(): void {
    this.initializePage('SYSBR10', this.dataForm);

    if (!this.isFormCreateable && this.rowdata) {
      this.loading = true;

      // 處理特殊類型禁用
      if (this.dataForm.get('Pub_Type')?.value === '3') {
        this.dataForm.get('Pub_Type')?.disable();
      }

      // Base64 解碼
      if (this.rowdata.Pub_Description) {
        this.dataForm.get('Pub_Description')?.setValue(
          Base64Service.decode(this.rowdata.Pub_Description)
        );
      }

      this.messageService.blockUi();
      this.sysbr10Service.querySYSBR10Detail({ pos5101_id: this.rowdata.id })
        .pipe(
          finalize(() => {
            this.loading = false;
            this.messageService.unblockUi();
            this.cdr.markForCheck(); // 確保非同步回來的 UI 更新
          }),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe(res => {
          this.detailList.set(res?.Data ?? []);
        });
    }
  }

  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      // 驗證 TableEdit
      const isTableValid = this.tableEditComponent.validateAndShowErrors();
      if (!isTableValid) {
        this.loading = false;
        this.messageService.unblockUi();
        this.cdr.markForCheck();
        return this.messageService.errorBubble('請填寫公告可顯示範圍');
      }

      const value = form.getRawValue();
      const payload: MaintainSYSBR10Request = {
        id: this.isFormCreateable ? undefined : this.rowdata?.id,
        Pub_StartDate: value.Pub_StartDate,
        Pub_EndDate: value.Pub_EndDate,
        pub_enable: value.pub_enable || 'N',
        Pub_Type: value.Pub_Type,
        Pub_Event: value.Pub_Event,
        Pub_Description: value.Pub_Description,
        DetailList: this.detailList().map(d => ({
          id: d._dataStatus === 'new' ? undefined : d.id,
          User_No: d.User_No,
          Org_ID: d.Org_ID,
          Role_No: d.Role_No
        }))
      };

      const request$ = this.isFormCreateable
        ? this.sysbr10Service.insertSYSBR10(payload)
        : this.sysbr10Service.updateSYSBR10(payload);

      request$
        .pipe(
          finalize(() => {
            this.loading = false;
            this.cdr.markForCheck();
          }),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe(res => {
          if (this.isFormCreateable) {
            this.messageService.successBubble(res.Message || '新增成功');
            this.dataForm.reset();
            this.detailList.set([]);
          } else {
            this.messageService.successBubble(res.Message || '更新成功');
            this.onCancel();
          }
        });
    });
  }
}
