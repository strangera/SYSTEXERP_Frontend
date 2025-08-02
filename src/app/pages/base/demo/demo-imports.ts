import { AccordionModule } from 'primeng/accordion';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { CommonModule } from '@angular/common';

export const COMMON_IMPORTS = [
    ButtonComponent,
    MenubarComponent,
    AccordionModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule
];
