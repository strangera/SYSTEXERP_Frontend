
import { NgIf } from '@angular/common';
import { Component, OnInit, computed, effect } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ASS21010Service, EngType } from '@service/api/ass/ass21010.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { InputTextareaComponent } from '@shared/componentkit/input-textarea/input-textarea.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column } from '@shared/componentkit/table/table.model';
import { PanelModule } from 'primeng/panel';
import { ASS21010Payload } from '../ass21010/ass21010.model';

@Component({
  selector: 'app-ass21010-cru',
  templateUrl: './ass21010-cru.component.html',
  styleUrl: './ass21010-cru.component.scss',
  standalone: !0,
  imports: [
    NgIf,
    FormsModule,
    PanelModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    DropdownComponent,
    InputTextComponent,
    InputTextareaComponent,
    MenubarComponent,
    MultiSelectComponent,
    TableComponent,
  ]
})
export class ASS21010CRUComponent extends BasicCruPageComponent<unknown> implements OnInit {

  public readonly dataForm = this.formBuilder.nonNullable.group({
    ENG_Type: new FormControl<EngType | undefined>(void 0, [Validators.required]),
    ENG_MeterNo: new FormControl<string | undefined>(void 0, [Validators.required, Validators.minLength(5), Validators.maxLength(5)]),
    Location_No: new FormControl<string | undefined>(void 0, [Validators.required]),
    ENG_Remark: new FormControl<string | undefined>(void 0, [Validators.maxLength(500), Validators.required]),
  });
  public readonly df = computed(() => this.dataForm.controls);

  // 變化追蹤
  private readonly dfSignal = toSignal(this.dataForm.valueChanges);
  private readonly engTypeSignal = toSignal(this.df().ENG_Type.valueChanges);

  /** 能源類型變更處理 */
  public readonly engTypeEffect = effect(() => {
    const types = this.engTypeSignal();
    if (!types?.length) return;
    this.service.loadEngMeterNo(types);
    console.log(`Eng type changes:`, [types]);
  }, { allowSignalWrites: !0 });

  public readonly columns: Column[] = [
    { field: 'ENG_Type', header: '能源類型' },
    { field: 'ENG_MeterNo', header: '錶號' },
    { field: 'Location_No', header: '能源位置編號' },
    { field: 'ENG_Remark', header: '備註' },
  ];

  /** 表單變化追蹤 */
  public readonly dfEffect = effect(() => {
    console.log(`dfEffect:`, [this.dfSignal()]);
  });

  constructor(
    public readonly service: ASS21010Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ASS21010', this.dataForm);

    this.service.loadEngType();
    this.service.loadLocationNo();
  }

  public onSubmit(): void {
    this.handleSubmit(this.dataForm, () => {
      const d = this.dataForm.value;
      const payload: ASS21010Payload = {
        ENG_Type: d.ENG_Type || '',
        ENG_MeterNo: d.ENG_MeterNo || '',
        Location_No: d.Location_No || '',
        ENG_Remark: d.ENG_Remark || '',
        ID: 0,
        SYS_StoreNo: '',
        Mid: 0,
      };

      this.service.updateASS21010(payload);
      console.log(`onSubmit:`, [payload]);
      this.loading = !1;
    });
  }

  public onClear(): void {
    this.dataForm.reset();
  };








  // //動態新增----------------------------------------------------------
  // createItem(): FormGroup {
  //   return this.formBuilder.group({

  //     itemCodeOptions: [],
  //     unit: [],
  //     returnQty: [],
  //     desc: [],
  //   });
  // }

  // //非動態新增 ----------------------------------------------------------
  // dataForm = this.formBuilder.nonNullable.group({
  //   meterPosCode: [],
  //   floor: [],
  //   area: [],
  //   SN: [],
  //   xCoordinate: [],
  //   yCoordinate: [],
  //   desc: [],
  //   placementDesc: [],
  //   // ----------------------------------------------------------------
  //   items: this.formBuilder.array([this.createItem()]),
  // });
  // // Dropdown options
  // floor: any[] = [];
  // area: any[] = [];
  // Departmentcode: any[] = [];
  // itemCodeOptions: any[] = [
  //   { value: 1, label: '3A24210000001' },
  //   { value: 2, label: '3A24210000002' },
  //   { value: 3, label: '3A24210000003' },
  //   { value: 4, label: '3A24210000004' },
  //   { value: 5, label: '3A24210000005' },
  //   { value: 6, label: '3A24210000006' },
  //   { value: 7, label: '3A24210000007' },
  //   { value: 8, label: '3A24210000008' },
  //   { value: 9, label: '3A24210000009' },
  //   { value: 10, label: '3A24210000010' },
  // ];



  // get items(): FormArray {
  //   return this.dataForm.get('items') as FormArray;
  // }

  // getFormControl(index: number, controlName: string): FormControl {
  //   return this.items.at(index).get(controlName) as FormControl;
  // }
  // // ----------------------------------------------------------------

  // onRemoveItem(index: number) {
  //   this.items.removeAt(index);
  // }
  // // ----------------------------------------------------------------
  // Edit(rowdata: any) {
  //   this.dataForm.patchValue(rowdata);
  // }

  // Read(rowdata: any) {
  //   this.dataForm.patchValue(rowdata);
  //   this.dataForm.disable();
  // }

  // onAddItem(): void {
  //   this.items.push(this.createItem());
  // }

  // onSubmit(frm: FormGroup) {
  //   this.messageService.blockUi();
  //   this.submitted = true;

  //   if (this.dataForm.invalid) {
  //     this.messageService.errorBubble(
  //       this.translate.instant('form_error_message')
  //     );
  //     this.messageService.unblockUi();
  //     return;
  //   }

  //   switch (this.crudstatus) {
  //     case CRUDStatus.Create:
  //       if (this.canAdd()) {
  //         // this.storeService.addMachine(frm.value as MachineForm).subscribe((response: any) => {
  //         this.messageService.successBubble(
  //           this.translate.instant('success_message')
  //         );
  //       }
  //       break;
  //     case CRUDStatus.Edit:
  //       if (this.canEdit()) {
  //         // this.storeService.updateMachine(frm.value as MachineForm).subscribe((response: any) => {
  //         this.messageService.successBubble(
  //           this.translate.instant('updated-successfully')
  //         );
  //       }
  //       break;
  //   }

  //   this.messageService.unblockUi();
  //   this.submitted = false;
  // }

  // submitForm(frm: FormGroup) {
  //   // 查詢邏輯
  //   this.onSubmit(frm);
  // } //CRU

  // onCancel() {
  //   this.router.navigate(['ASS2000/ASS21010']);
  // }
}
