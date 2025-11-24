import { Component, OnInit } from '@angular/core';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';

@Component({
  selector: 'app-fin24010-cru',
  templateUrl: './fin24010-cru.component.html',
  standalone: true
})
export class FIN24010CRUComponent extends BasicCruPageComponent<any> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
  })

  constructor() {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('FIN24010', this.dataForm);
  }
}
