import { Component, OnInit, signal, viewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ASS11050Service } from '@service/api/ass/ass11050.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarComponent } from '@shared/components/calendar/calendar.component';
import { AccordionModule } from 'primeng/accordion';
import { finalize, map } from 'rxjs';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { ASS11050TreeDropdownComponent } from './ass11050-tree-dropdown/ass11050-tree-dropdown.component';

export interface ASS11050Tree {
  T_Id: string;
  T10Label: string;
  T20Label: string | null;
  T30Label: string | null;
  T_Name: string;
}

@Component({
  selector: 'app-ass11050',
  templateUrl: './ass11050.component.html',
  standalone: true,
  imports: [
    ASS11050TreeDropdownComponent,
    AccordionModule,
    ButtonComponent,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MenubarComponent,
    CalendarComponent,
  ]
})
export class ASS11050Component extends BasicQueryPageComponent<any> implements OnInit {
  private readonly treeDropdown = viewChild(ASS11050TreeDropdownComponent);

  queryForm = this.formBuilder.group({});

  ASS11050Tree = signal<ASS11050Tree[]>([]);
  leaveLabel = 'T_Name';
  listTitle = '類別架構圖';
  treeColumn = [
    { value: 'T10Label', label: '大分類' },
    { value: 'T20Label', label: '中分類' },
    { value: 'T30Label', label: '小分類' },
  ];
  treeElements = {
    treeColumn: this.treeColumn,
    listTitle: this.listTitle,
    leaveLabel: this.leaveLabel,
  };

  constructor(
    private ass11050Service: ASS11050Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('ass11050', '/ass/ass11050cru', this.queryForm, this.onSubmit.bind(this));
  }

  onSubmit(form: FormGroup) {
    this.handleSubmit(this.queryForm, () => {
      this.ass11050Service.getASS11050Tree()
        .pipe(
          map(res => res.Data || []),
          finalize(() => this.loading = false),
          untilDestroyed(this)
        )
        .subscribe(res => this.ASS11050Tree.set(res));
    });
  };

  onClear(): void {
    this.treeDropdown()?.resetFilter();
  }
}
