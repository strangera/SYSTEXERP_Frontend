import { AsyncPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Sys0780Service } from '@service/api/sys/sys0780.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '@others/component/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { NavigationHelperService } from 'src/app/reports/services/navigation-helper.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { DropdownApiService } from '../../../service/utility/dropdown-api.service';

@Component({
  selector: 'app-sys0780',
  templateUrl: './sys0780.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    ButtonComponent,
    TranslateModule,
    AsyncPipe,
  ],
})
export class SYS0780Component extends BasicQueryPageComponent<unknown> implements OnInit {
  readonly sys0780Service = inject(Sys0780Service);
  private readonly dropdown = inject(DropdownApiService);
  private readonly navHelper = inject(NavigationHelperService);

  readonly queryForm = this.formBuilder.group({
    prog_no: [null as string | null],
    ...createPaginationConfig([]),
  });

  readonly subModuleNoOptions = this.dropdown.querySys5000SubModuleNoGroup();

  ngOnInit(): void {
    this.initializePage('SYS0780');
  }

  showPermissionReport(): void {
    const { prog_no } = this.queryForm.getRawValue();
    if (!prog_no) {
      this.messageService.errorBubble('請選擇主系統項目代號/名稱');
      return;
    }
    this.navHelper.openInNewTab('reports/sys/sys0780report', { progNo: prog_no });
  }
}
