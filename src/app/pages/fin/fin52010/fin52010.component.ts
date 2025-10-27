import { DatePipe } from '@angular/common';
import { Component, computed, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FIN52010Service } from '@service/api/fin/fin52010.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { NGXLogger } from 'ngx-logger';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { FIN52010Data } from './fin52010.model';

@Component({
  selector: 'app-fin52010',
  templateUrl: './fin52010.component.html',
  styleUrl: './fin52010.component.scss',
  standalone: true,
  imports: [
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonComponent,
    CalendarComponent,
    CalendarRangeComponent,
    DropdownComponent,
    InputTextComponent,
    MenubarComponent,
  ],
})
export class FIN52010Component extends BasicQueryPageComponent<FIN52010Data> implements OnInit {

  public readonly dataForm = this.formBuilder.nonNullable.group({
    AccYear: new FormControl<string>(new Date().getFullYear().toString()),
    OpenDate: new FormControl<Date>(new Date(), [Validators.required]),
    CloseDate: new FormControl<Date>(new Date(), [Validators.required]),
    DefaultVouDate: new FormControl<Date | void>(void 0),
    ORG_ID: new FormControl<string | void>(void 0, [Validators.required]),
    AccNoTotPL: new FormControl<string | void>(void 0, [Validators.required]),
    AccNoCurPL: new FormControl<string | void>(void 0, [Validators.required]),
    CashAccNo: new FormControl<string | void>(void 0),
    AccNoAR: new FormControl<string | void>(void 0),
    AccNoAP: new FormControl<string | void>(void 0),
    AccNoInTax: new FormControl<string | void>(void 0),
    AccNoOutTax: new FormControl<string | void>(void 0),
    AccNoPost: new FormControl<string | void>(void 0),
    AccNoRemitFee: new FormControl<string | void>(void 0),
    advanceExpenseAccNo: new FormControl<string | void>(void 0),
    billTransferCon: new FormControl<'N' | 'Y'>('N'),
  });
  public readonly df = computed(() => this.dataForm.controls);

  public readonly canSave = computed(() => {
    return this.dataForm.valid;
  });

  constructor(
    public service: FIN52010Service,
    private readonly logger: NGXLogger,
    private readonly date: DatePipe,
  ) {
    super();
    this.user = this.authService.getUserInfo();
  }

  public ngOnInit(): void {
    this.initializePage('FIN52010', void 0, this.dataForm);
    const store = this.queryStateService.getQueryState(this.ProgNo);
    if (store?.value) this.dataForm.setValue(store.value);

    this.service.getOrgNoList();
    this.service.getTblUsrOrgList();
    this.service.getSYS1000();

    this.service.loadFIN52010(this.user!.CompNo).pipe(
      finalize(() => this.logger.debug(`loadFIN52010:`, [this.user]))
    ).subscribe(res => {
      this.dataForm.patchValue({
        AccYear: res.AccYear,
        OpenDate: res.OpenDate ? new Date(res.OpenDate) : void 0,
        CloseDate: res.CloseDate ? new Date(res.CloseDate) : void 0,
        ORG_ID: res.ORG_ID,
        AccNoTotPL: res.AccNoTotPL,
        AccNoCurPL: res.AccNoCurPL,
        CashAccNo: res.CashAccNo,
        AccNoAR: res.AccNoAR,
        AccNoAP: res.AccNoAP,
        AccNoInTax: res.AccNoInTax,
        AccNoOutTax: res.AccNoOutTax,
        AccNoPost: res.AccNoPost,
        AccNoRemitFee: res.AccNoRemitFee,
        // advanceExpenseAccNo: res.advanceExpenseAccNo,
        // billTransferCon: res.billTransferCon as 'N' | 'Y',
      });
    });


    // this.loading = !0;
    // this.ProgNo = '150007';
    // // Initialize dropdown options
    // this.funInfo = this.authService.getUserPermissions(this.ProgNo);

    // this.IfdisplayService.getOptions().subscribe(
    //   (data) => (this.displayOptions2 = data)
    // );
    // this.AnalysisdateCService.getOptions().subscribe(
    //   (data) => (this.AnalysisdateCOptions = data)
    // );
    // this.vendorService.getVendors().subscribe((data) => {
    //   this.vendorOptions = data;
    // });
    // this.flippingstateService.getOptions().subscribe((data) => {
    //   this.FlippingstateOptions = data;
    // });
    // this.organizationNumberService
    //   .getOrganizationNumbers()
    //   .subscribe((data) => {
    //     this.departmentOptions = data;
    //   });
    // // this.accountingaccountService.getOptions().subscribe((data) => {
    // //   this.accountingaccountOptions = data;
    // // });
  }

  onSubmit(): void {
    this.handleSubmit(this.dataForm, () => {

      this.messageService.successBubble('更新成功');
      this.loading = !1;
      this.queryStateService.setQueryState(this.ProgNo, this.dataForm.getRawValue());
      this.logger.debug(`onSubmit:`, []);
    });
  };
  // console.log(frm.value);
  // this.submitted = true;
  // this.loading = true;
  // this.notificationService.blockUi();

  // if (frm.valid && this.canQuery()) {
  //   // Submit logic here
  // }

  //   this.loading = false;
  //   this.notificationService.unblockUi();
  // }

  // onSubmitQuery(frm: FormGroup) {
  //   this.onSubmit(frm);
  // }

  // onCreate() {
  //   if (this.canAdd()) {
  //     let extras: NavigationExtras = {
  //       state: {
  //         crudstatus: CRUDStatus.Create,
  //         queryform: this.queryForm,
  //       },
  //       skipLocationChange: true,
  //     };
  //     this.router.navigate(['FIN3000/FIN34030CRU'], extras);
  //   }
  // }

  // onEdit(data: any) {
  //   if (this.canEdit()) {
  //     let extras: NavigationExtras = {
  //       state: {
  //         crudstatus: CRUDStatus.Edit,
  //         rowdata: data,
  //         queryform: this.queryForm,
  //       },
  //       skipLocationChange: true,
  //     };
  //     this.router.navigate(['/demoCRU'], extras);
  //   }
  // }

  // onDetail(data: any) {
  //   let extras: NavigationExtras = {
  //     state: {
  //       crudstatus: CRUDStatus.Read,
  //       rowdata: data,
  //       queryform: this.queryForm,
  //     },
  //     skipLocationChange: true,
  //   };
  //   this.router.navigate(['/demoCRU'], extras);
  // }
  // onClearForm() {
  //   this.queryForm.reset(); // 重置表單
  // }
}
