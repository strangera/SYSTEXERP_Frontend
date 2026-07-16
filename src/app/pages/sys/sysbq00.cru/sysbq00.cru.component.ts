import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { Sysbq00Data, Sysbq00DropDownItem, Sysbq00Request, Sysbq00Service } from '../../../service/api/sys/sysbq00.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { TableEditComponent } from '../../../shared/components/table-edit/table-edit.component';
import { EditColumn } from '../../../shared/components/table-edit/table-edit.model';
import { validateRequired } from '../../../shared/components/table-edit/validate-field.model';

interface LineRow {
  line_name: string | null;
}

@Component({
  selector: 'app-sysbq00-cru',
  templateUrl: './sysbq00.cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent, ButtonComponent, PanelModule, FormsModule,
    ReactiveFormsModule, DropdownComponent, TableEditComponent, TranslateModule,
  ],
})
export class SYSBQ00CRUComponent extends BasicCruPageComponent<Sysbq00Data> implements OnInit {
  private readonly sysbq00Service = inject(Sysbq00Service);
  private readonly destroyRef = inject(DestroyRef);

  dataForm = this.formBuilder.nonNullable.group({
    sys_type: new FormControl<string | null>(null, [Validators.required]),
    act_code: new FormControl<string | null>(null, [Validators.required]),
  });

  private readonly allDropDownData = signal<Sysbq00DropDownItem[]>([]);
  private readonly selectedSysType = signal<string | null>(null);
  private initializingDropdowns = true;

  sysTypeOptions = computed(() =>
    this.allDropDownData().reduce<{ label: string; value: string }[]>((acc, item) => {
      if (!acc.some(x => x.value === item.parent_prog_no)) {
        acc.push({ label: `${item.parent_prog_no} ${item.parent_prog_name ?? ''}`, value: item.parent_prog_no });
      }
      return acc;
    }, [])
  );

  actCodeOptions = computed(() => {
    const sys = this.selectedSysType();
    if (!sys) return [];
    return this.allDropDownData()
      .filter(item => item.parent_prog_no === sys)
      .map(item => ({ label: `${item.child_prog_no} ${item.child_prog_name ?? ''}`, value: item.child_prog_no }));
  });

  tableData = signal<LineRow[]>([
    { line_name: null }, { line_name: null }, { line_name: null },
    { line_name: null }, { line_name: null },
  ]);
  selectedItems: LineRow[] = [];

  readonly editColumns: EditColumn[] = [
    {
      field: 'line_name',
      header: '簽核欄名稱',
      type: 'input',
      maxLength: 200,
      validate: [validateRequired],
    },
  ];

  ngOnInit(): void {
    this.initializePage('SYSBQ00', this.dataForm);

    this.dataForm.controls.sys_type.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(val => {
        this.selectedSysType.set(val);
        if (!this.initializingDropdowns) {
          this.dataForm.controls.act_code.reset(null);
        }
      });

    this.sysbq00Service.getSYSBQ00DropDown()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        this.allDropDownData.set(res.Data ?? []);

        if (!this.isFormCreateable && this.rowdata) {
          this.selectedSysType.set(this.rowdata.sys_type ?? null);
          this.dataForm.patchValue({
            sys_type: this.rowdata.sys_type ?? null,
            act_code: this.rowdata.data_type,
          });
          this.tableData.set([
            { line_name: this.rowdata.line1 ?? null },
            { line_name: this.rowdata.line2 ?? null },
            { line_name: this.rowdata.line3 ?? null },
            { line_name: this.rowdata.line4 ?? null },
            { line_name: this.rowdata.line5 ?? null },
          ]);
        }

        this.initializingDropdowns = false;
      });
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const value = frm.getRawValue();
      const lines = this.tableData();

      const request: Sysbq00Request = {
        id: this.rowdata?.id,
        data_type: value.act_code ?? '',
        line1: lines[0]?.line_name ?? '',
        line2: lines[1]?.line_name ?? '',
        line3: lines[2]?.line_name ?? '',
        line4: lines[3]?.line_name ?? '',
        line5: lines[4]?.line_name ?? '',
      };

      this.loading = true;
      const save$ = this.isFormCreateable
        ? this.sysbq00Service.insertSYSBQ00(request)
        : this.sysbq00Service.updateSYSBQ00(request);

      save$.pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading = false)
      ).subscribe(res => {
        this.messageService.successBubble(res.Message);

        if (this.isFormCreateable) {
          this.dataForm.reset();
          this.selectedSysType.set(null);
          this.tableData.set([
            { line_name: null }, { line_name: null }, { line_name: null },
            { line_name: null }, { line_name: null },
          ]);
          this.submitted = false;
        } else {
          this.onCancel();
        }
      });
    });
  }
}
