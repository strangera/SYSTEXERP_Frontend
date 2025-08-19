import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonDynamicallyaddComponent } from '@shared/componentkit/button-dynamicallyadd/button-dynamicallyadd.component';
import { ButtonDynamicallydeleteComponent } from '@shared/componentkit/button-dynamicallydelete/button-dynamicallydelete.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { PanelModule } from 'primeng/panel';

@Component({
  selector: 'app-ass21030-cru',
  templateUrl: './ass21030-cru.component.html',
  styleUrl: './ass21030-cru.component.scss',
  standalone: !0,
  imports: [
    NgFor,
    NgIf,
    FormsModule,
    PanelModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    ButtonDynamicallyaddComponent,
    ButtonDynamicallydeleteComponent,
    DropdownComponent,
    InputTextComponent,
    MenubarComponent,
    TableComponent,
  ]
})
export class ASS21030CRUComponent extends BasicCruPageComponent<unknown> implements OnInit {

  public readonly dataForm = this.formBuilder.nonNullable.group({

  });
  public readonly df = computed(() => this.dataForm.controls);

  private readonly dfSignal = toSignal(this.dataForm.valueChanges);

  public ngOnInit(): void {
    this.initializePage('ASS21030', this.dataForm);
  }

  // public submitForm(frm: FormGroup): void {
  //   this.onSubmit(frm);
  // }

  public onSubmit(): void {
    this.handleSubmit(this.dataForm, () => {

      this.loading = !1;
    });
  }

  public onClear(): void {
    this.dataForm.reset();
  }




  // // 網站導覽設定
  // this.ProgNo = '320003';
  // // ----------------------------------------------------------------
  // this.funInfo = this.authService.getUserPermissions(this.ProgNo);
  // // 下拉選單--------------------------------------------------------
  // //  this.userCodeService.getUserCode().subscribe((data) => (this.Applicantcode = data));
  // this.organizationNumberService.getOrganizationNumbers().subscribe((data) => (this.Departmentcode = data));
  // this.floorService.getFloors().subscribe((data) => (this.floor = data));
  // // ----------------------------------------------------------------
  // const state = this.router.lastSuccessfulNavigation?.extras.state as {
  //   crudstatus: CRUDStatus;
  //   rowdata: any;
  // };

  // switch (state.crudstatus) {
  //   // 創建
  //   case CRUDStatus.Create:
  //     this.formTitle = 'create-conditions';
  //     this.accordionTabCss = 'create-accordionTab';
  //     this.crudstatus = CRUDStatus.Create;
  //     this.showConfirm = this.canAdd();
  //     break;
  //   // 修改
  //   case CRUDStatus.Edit:
  //     this.formTitle = 'edit-conditions';
  //     this.accordionTabCss = 'edit-accordionTab';
  //     this.crudstatus = CRUDStatus.Edit;
  //     this.showConfirm = this.canEdit();
  //     this.Edit(state.rowdata);
  //     break;
  //   // 讀檔
  //   case CRUDStatus.Read:
  //     this.formTitle = 'display-conditions';
  //     this.crudstatus = CRUDStatus.Read;
  //     this.Read(state.rowdata);
  //     break;
  // }

  // console.log(this.accordionTabCss);
  // }

  // //動態新增----------------------------------------------------------
  // createItem(): FormGroup {
  //   return this.formBuilder.group({

  //     itemCodeOptions: [],
  //     unit: [],
  //     returnQty: [],
  //     desc: [],
  //     cCat: [],

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
  //   Energytype: [],
  //   meterNo: [],
  //   floorCat: [],
  //   VFP: [],
  //   cCat: [],
  //   // ----------------------------------------------------------------
  //   items: this.formBuilder.array([this.createItem()]),
  // });
  // // Dropdown options
  // VFP: any[] = [];
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
  // Energytype: any[] = [{ value: 1, label: '水費' },
  // { value: 2, label: '電費' },
  // { value: 3, label: '瓦斯費' },];
  // meterPosCode: any[] = [
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
  // equipmentLocationOptions: any[] = [
  //   { value: 1, label: '010A000001' },
  //   { value: 2, label: '010A000002' },
  //   { value: 3, label: '010A000003' },
  //   { value: 4, label: '010A000004' },
  //   { value: 5, label: '010B000001' },
  //   { value: 6, label: '010B000002' },
  //   { value: 7, label: '010B000003' },
  //   { value: 8, label: '010B000004' },
  //   { value: 9, label: '010B000005' },
  //   { value: 10, label: '010B000006' },
  // ];
  // cCat: any[] = [
  //   { value: 1, label: '商場' },

  // ];


  // // ----------------------------------------------------------------
  // constructor(
  //   private router: Router,
  //   private formBuilder: FormBuilder,
  //   private messageService: NotificationService,
  //   private authService: AuthService,
  //   private translate: TranslateService,
  //   private userCodeService: UserCodeService,
  //   private organizationNumberService: OrganizationNumberService,
  //   private floorService: FloorService,

  // ) {
  //   super(); // 呼叫父類建構子
  // }

  // // ----------------------------------------------------------------
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
}
