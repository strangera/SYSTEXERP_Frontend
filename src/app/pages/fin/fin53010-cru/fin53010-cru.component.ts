import { Component, computed, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FIN53010Service } from '@service/api/fin/fin53010.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column } from '@shared/componentkit/table/table.model';
import { CheckboxModule } from 'primeng/checkbox';
import { PanelModule } from 'primeng/panel';

@Component({
  selector: 'app-fin53010-cru',
  templateUrl: './fin53010-cru.component.html',
  styleUrl: './fin53010-cru.component.scss',
  standalone: true,
  imports: [
    CheckboxModule,
    FormsModule,
    PanelModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    CalendarComponent,
    DropdownComponent,
    InputTextComponent,
    MenubarComponent,
    TableComponent,
  ],
})
export class FIN53010CRUComponent extends BasicCruPageComponent<unknown> implements OnInit {

  public readonly dataForm = this.formBuilder.nonNullable.group({

  });
  public readonly df = computed(() => this.dataForm.controls);

  public tableData: unknown[] = [];

  public readonly columns: Column[] = [

  ];

  constructor(
    public readonly service: FIN53010Service,
  ) {
    super();
  }

  public ngOnInit(): void {
    this.initializePage('FIN53010', this.dataForm);
  }

  public onSubmit(): void {
    this.handleSubmit(this.dataForm, () => {

      this.onCancel();
    });
  }

  // ngOnInit(): void {
  //   // 初始化
  //   this.ProgNo = '150016';
  //   //
  //   // ----------------------------------------------------------------
  //   this.funInfo = this.authService.getUserPermissions(this.ProgNo);
  //   this.userCodeService
  //     .getUserCode()
  //     .subscribe((data) => (this.usercode = data));

  //   // ----------------------------------------------------------------
  //   const state = this.router.lastSuccessfulNavigation?.extras.state as {
  //     crudstatus: CRUDStatus;
  //     rowdata: any;
  //   };

  //   switch (state.crudstatus) {
  //     // 創建
  //     case CRUDStatus.Create:
  //       this.formTitle = 'create-conditions';
  //       this.accordionTabCss = 'create-accordionTab';
  //       this.crudstatus = CRUDStatus.Create;
  //       this.showConfirm = this.canAdd();
  //       break;
  //     // 修改
  //     case CRUDStatus.Edit:
  //       this.formTitle = 'edit-conditions';
  //       this.accordionTabCss = 'edit-accordionTab';
  //       this.crudstatus = CRUDStatus.Edit;
  //       this.showConfirm = this.canEdit();
  //       this.Edit(state.rowdata);
  //       break;
  //     // 讀檔
  //     case CRUDStatus.Read:
  //       this.formTitle = 'display-conditions';
  //       this.crudstatus = CRUDStatus.Read;
  //       this.Read(state.rowdata);
  //       break;
  //   }

  //   console.log(this.accordionTabCss);
  // }
  // createItem(): FormGroup {
  //   return this.formBuilder.group({
  //     Accountcode: [],
  //     vendorCodeOptions: [],
  //     summary: [],
  //     Debitamount: [],
  //     Creditamount: [],
  //     Organizationcode: [],
  //     StandingInstructionCode: [],
  //     Activitycode: [],
  //     Objectnumber: [],
  //     ReconciliationKEYvalue: [],
  //   });
  // }

  // // ----------------------------------------------------------------
  // dataForm = this.formBuilder.nonNullable.group({
  //   Subpoenanumber: [],
  //   Subpoenatype: [],
  //   Subpoenadate: [],
  //   Subpoenastatus: [],
  //   Subpoenasummary: [],
  //   Makeupinvoice: [],
  //   builder: [],
  //   modifyer: [],
  //   builddate: [],
  //   modifydate: [],
  //   uickMenu: [],

  //   // ----------------------------------------------------------------
  //   items: this.formBuilder.array([this.createItem()]),
  // });
  // // Dropdown options
  // Activitycode: any[] = [
  //   { value: 1, label: '001' },
  //   { value: 2, label: '002' },
  //   { value: 3, label: '003' },
  //   { value: 4, label: '004' },
  //   { value: 5, label: '005' },
  //   { value: 6, label: '006' },
  //   { value: 7, label: '007' },
  //   { value: 8, label: '008' },
  //   { value: 9, label: '009' },
  //   { value: 10, label: '010' },
  // ];
  // StandingInstructionCode: any[] = [];
  // Organizationcode: any[] = [
  //   { value: 1, label: '100000' },
  //   { value: 2, label: '100100' },
  //   { value: 3, label: '101000' },
  //   { value: 4, label: '101100' },
  //   { value: 5, label: '101200' },
  //   { value: 6, label: '101300' },
  //   { value: 7, label: '101400' },
  //   { value: 8, label: '101500' },
  //   { value: 9, label: '101600' },
  //   { value: 10, label: '101700' },
  // ];
  // usercode: any[] = [];
  // Accountcode: any[] = [
  //   { value: 1, label: '110101' },
  //   { value: 2, label: '110102' },
  //   { value: 3, label: '110103' },
  //   { value: 4, label: '110111' },
  //   { value: 5, label: '110112' },
  //   { value: 6, label: '110199' },
  //   { value: 7, label: '110200' },
  //   { value: 8, label: '110201' },
  //   { value: 9, label: '110210' },
  //   { value: 10, label: '110220' },
  // ];
  // Makeupinvoice: any[] = [
  //   { value: 1, label: '是' },
  //   { value: 2, label: '否' },
  // ];
  // Subpoenatype: any[] = [
  //   { value: 1, label: '現金收入傳票' },
  //   { value: 2, label: '現金支出傳票' },
  //   { value: 3, label: '轉帳傳票' },
  // ];
  // Subpoenastatus: any[] = [
  //   { value: 1, label: '現金收入傳票' },
  //   { value: 2, label: '現金支出傳票' },
  //   { value: 3, label: '轉帳傳票' },
  // ];
  // vendorCodeOptions: any[] = [
  //   { value: 1, label: '00000000-1' },
  //   { value: 2, label: '00000000-2' },
  //   { value: 3, label: '00000000-4' },
  //   { value: 4, label: '00000000-5' },
  //   { value: 5, label: '00000000-7' },
  //   { value: 6, label: '00000000-8' },
  //   { value: 7, label: '00852492-1' },
  //   { value: 8, label: '01052878-1' },
  //   { value: 9, label: '01508949-1' },
  //   { value: 10, label: '01515462-1' },
  // ];
  // // ----------------------------------------------------------------
  // constructor(
  //   private router: Router,
  //   private formBuilder: FormBuilder,
  //   private messageService: NotificationService,
  //   private authService: AuthService,
  //   private translate: TranslateService,
  //   private userCodeService: UserCodeService
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
  //   this.router.navigate(['FIN5000/FIN53010']);
  // }
}
