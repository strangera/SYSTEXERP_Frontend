import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { Sysbq00Data, Sysbq00Request, Sysbq00Service } from '../../../service/api/sys/sysbq00.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-sysbq00-cru',
  templateUrl: './sysbq00.cru.component.html',
})
export class SYSBQ00CRUComponent extends BasicCruPageComponent<Sysbq00Data> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    data_type: ['', [Validators.required, Validators.maxLength(20)]],
    line1: ['', [Validators.maxLength(200)]],
    line2: ['', [Validators.maxLength(200)]],
    line3: ['', [Validators.maxLength(200)]],
    line4: ['', [Validators.maxLength(200)]],
    line5: ['', [Validators.maxLength(200)]],
  });

  constructor(private sysbq00Service: Sysbq00Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('SYSBQ00', this.dataForm);
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const value = frm.value;
      const request: Sysbq00Request = {
        ...value,
        id: this.rowdata?.id, // 只有編輯才需要 id
      };
      this.loading = true;
      const save$ = this.isFormCreateable
        ? this.sysbq00Service.insertSYSBQ00(request)
        : this.sysbq00Service.updateSYSBQ00(request);

      save$.pipe(finalize(() => this.loading = false)).subscribe(res => {
        this.messageService.successBubble(res.Message);

        if (this.isFormCreateable) {
          this.dataForm.reset();
          this.submitted = false;
        } else {
          this.onCancel();
        }
      });
    });
  }
}
