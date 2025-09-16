import { convertDateToYYYYMM } from '@shared/componentkit/table/table.model';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { ASS21040Service } from '@service/api/ass/ass21040.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { finalize } from 'rxjs';
import { environment } from 'src/environments/environment';
import { getSYS1000Options } from '@service/system/sys1000.service';

@Component({
  selector: 'app-ass21040',
  templateUrl: './ass21040.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    CalendarComponent,
    TranslateModule,
  ],
})
export class ASS21040Component extends BasicQueryPageComponent<unknown> implements OnInit {
  queryForm = this.formBuilder.group({
    ENG_YYMM: [null, [Validators.required]],
    ENG_Type: [null, [Validators.required]],
  });
  totalRecords = 0;
  ENG_TypeOptions = getSYS1000Options('ENG_Type');
  constructor(
    private aSS21040Service: ASS21040Service
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('ASS21040', 'ass/ass21040', this.queryForm, (frm) => this.onSubmit(frm));
  }

  onSubmit(frm: FormGroup) {
    const storeNo = this.authService.currentUserValue?.SYS_StoreNo;
    const mid = this.authService.currentUserValue?.mid;
    if (storeNo && mid) {
      const body = {
        SYS_StoreNo: storeNo,
        Mid: Number(mid),
        EngTypes: frm.value.ENG_Type,
        ClearingYM: convertDateToYYYYMM(frm.value.ENG_YYMM)
      };
      this.handleSubmit(frm, () => {
        this.aSS21040Service.ClearingASS21040(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(response => {
          if (response.Data.IsClearingSuccess) {
            this.messageService.successBubble('結算成功');
          } else {
            this.messageService.errorBubble(response.Data.ErrorMsg);
          }
        });
      });
    }
  }
  onCancelClearing(frm: FormGroup) {
    const storeNo = this.authService.currentUserValue?.SYS_StoreNo;
    const mid = this.authService.currentUserValue?.mid;
    if (storeNo && mid) {
      const body = {
        SYS_StoreNo: storeNo,
        Mid: Number(mid),
        EngTypes: frm.value.ENG_Type,
        ClearingYM: convertDateToYYYYMM(frm.value.ENG_YYMM)
      };
      this.handleSubmit(frm, () => {
        this.aSS21040Service.CancelClearingASS21040(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(response => {
          if (response.Data.IsCancelClearingSuccess) {
            this.messageService.successBubble('取消結算成功');
          } else {
            this.messageService.errorBubble(response.Data.ErrorMsg);
          }
        });
      });
    }
  }

  onGenerateReport(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const storeNo = this.authService.currentUserValue?.SYS_StoreNo;
      const mid = this.authService.currentUserValue?.mid;
      if (storeNo && mid) {
        const body = {
          SYS_StoreNo: storeNo,
          Mid: Number(mid),
          EngTypes: frm.value.ENG_Type,
          ClearingYM: convertDateToYYYYMM(frm.value.ENG_YYMM)
        };
        this.aSS21040Service.printASS21040(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(response => {
          if (response.Data.Print_URL) {
            this.messageService.successBubble('列印成功');
            window.open(environment.ApiUrl + response.Data.Print_URL);
          } else {
            this.messageService.errorBubble(response.Message);
          }
        });
      }
    });
  }
}
