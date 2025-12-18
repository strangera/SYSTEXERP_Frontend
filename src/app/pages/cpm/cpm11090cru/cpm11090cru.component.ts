import { DatePipe, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Cpm11090Service, QueryCPM11090Response } from '@service/api/cpm/cpm11090.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
@Component({
  selector: 'app-cpm11090-cru',
  templateUrl: './cpm11090cru.component.html',
  standalone: true,
  imports: [CalendarComponent, MenubarComponent, PanelModule, FormsModule, ReactiveFormsModule, InputTextComponent, DropdownComponent, ButtonComponent, NgIf, TranslateModule]
})
export class CPM11090CRUComponent extends BasicCruPageComponent<QueryCPM11090Response> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    SeqId: [null as unknown as string], // 登錄編號
    ByMissingPeople: [null, [Validators.required, Validators.maxLength(20)]], // 被尋人姓名
    salutation: [null], // 被尋人稱謂
    CollectionSites: [null, [Validators.required, Validators.maxLength(50)]], // 集合地點
    // missinG_PEOPLE: [null, [Validators.maxLength(20)]], // 尋人者
    RelationsName: [null], // 與被尋人關係
    RecDate: [new Date(), [Validators.required]], // 登錄日期
  });
  SALUTATIONOPTIONS = getSYS1000Options('SALUTATION');
  RELATIONSOPTIONS = getSYS1000Options('RELATIONS');
  constructor(
    private readonly cpm11090Service: Cpm11090Service,
    private readonly datePipe: DatePipe
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('CPM11090', this.dataForm);
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const params = {
        ...frm.getRawValue(),
        seQ_ID: this.isFormCreateable ? undefined : String(frm.getRawValue().SeqId),
        by_MISSING_PEOPLE: frm.getRawValue().ByMissingPeople,
        SALUTATION: frm.getRawValue().salutation,
        collectioN_SITES: frm.getRawValue().CollectionSites,
        // missinG_PEOPLE: frm.getRawValue().missinG_PEOPLE,
        relations: frm.getRawValue().RelationsName,
        reC_DATE: this.datePipe.transform(frm.getRawValue().RecDate, 'yyyy-MM-dd') || ''
      }
      const $request = this.isFormCreateable ? this.cpm11090Service.insertCPM11090(params) : this.cpm11090Service.updateCPM11090(params);
      $request.pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(response => {
        this.messageService.successBubble(response.Message);
        if (this.isFormCreateable) {
          this.dataForm.reset();
        } else {
          this.onCancel();
        }
      })
    })
  }
  RebroadcastLoading = false;
  onRebroadcast() {
    this.RebroadcastLoading = true;
    this.cpm11090Service.broadcastCPM11090(String(this.dataForm.getRawValue().SeqId)).pipe(
      untilDestroyed(this), finalize(() => this.RebroadcastLoading = false)
    ).subscribe(response => {
      this.messageService.successBubble(response.Message);
      this.onCancel();
    });
  }
  CloseLoading = false;
  onClose() {
    this.CloseLoading = true;
    this.cpm11090Service.finishedCPM11090({ seQ_ID: String(this.dataForm.getRawValue().SeqId) }).pipe(
      untilDestroyed(this), finalize(() => this.CloseLoading = false)
    ).subscribe(response => {
      this.messageService.successBubble(response.Message);
      this.onCancel();
    });
  }
}
