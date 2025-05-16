import { SkeletonModule } from 'primeng/skeleton';
import { OrganizationChartModule } from 'primeng/organizationchart';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { PanelModule } from 'primeng/panel';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TabViewModule } from 'primeng/tabview';
import { DropdownModule } from 'primeng/dropdown';
import { DividerModule } from 'primeng/divider';
import { DataViewModule } from 'primeng/dataview';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputGroupModule } from 'primeng/inputgroup';
import { RippleModule } from 'primeng/ripple';
import { SplitButtonModule } from 'primeng/splitbutton';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ChipsModule } from 'primeng/chips';
import { InputMaskModule } from 'primeng/inputmask';
import { InputNumberModule } from 'primeng/inputnumber';
import { CascadeSelectModule } from 'primeng/cascadeselect';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessagesModule } from 'primeng/messages';
import { AccordionModule } from 'primeng/accordion';
import { TreeTableModule } from 'primeng/treetable';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { ListboxModule } from 'primeng/listbox';
import { PickListModule } from 'primeng/picklist';
import { FieldsetModule } from 'primeng/fieldset';
import { MenubarModule } from 'primeng/menubar';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ContextMenuModule } from 'primeng/contextmenu';
import { ProgressBarModule } from 'primeng/progressbar';
import { RadioButtonModule } from 'primeng/radiobutton';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { SidebarModule } from 'primeng/sidebar';
import { InputSwitchModule } from 'primeng/inputswitch';
import { TreeModule } from 'primeng/tree';
import { PanelMenuModule } from 'primeng/panelmenu';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { StepperModule } from 'primeng/stepper';
import { PaginatorModule } from 'primeng/paginator';
import { ImageModule } from 'primeng/image';
import { StepsModule } from 'primeng/steps';
import { FileUploadModule } from 'primeng/fileupload';
import { SpeedDialModule } from 'primeng/speeddial';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { EditorModule } from 'primeng/editor';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { MenubarComponent } from './component/menubar/menubar.component';
import { ControlMessagesComponent } from './component/control-messages/control-messages.component';
import { HasPermissionDirective } from './directive/has-permission.directive';
import { InputTextComponent } from './componentkit/input-text/input-text.component';
import { MultiSelectComponent } from './componentkit/multi-select/multi-select.component';
import { InputNumberComponent } from './componentkit/input-number/input-number.component';
import { InputNumberRangeComponent } from './componentkit/input-number-range/input-number-range.component';
import { RadiobuttonComponent } from './componentkit/radiobutton/radiobutton.component';
import { EditorTextComponent } from './componentkit/editor-text/editor-text.component';
import { FileUploadComponent } from './componentkit/file-upload/file-upload.component';
import { ButtonDynamicallyaddComponent } from './componentkit/button-dynamicallyadd/button-dynamicallyadd.component';
import { ButtonDynamicallydeleteComponent } from './componentkit/button-dynamicallydelete/button-dynamicallydelete.component';
import { ButtonComponent } from './componentkit/button/button.component';
import { DropdownComponent } from './componentkit/dropdown/dropdown.component';
import { CalendarComponent } from './componentkit/calendar/calendar.component';
import { CalendarRangeComponent } from './componentkit/calendar-range/calendar-range.component';
import { TableComponent } from './componentkit/table/table.component';
import { TableExpansionComponent } from './componentkit/table/table-expansion/table-expansion.component';
import { DropdownTableComponent } from './componentkit/dropdown-table/dropdown-table.component';
import { TreeDropdownComponent } from './componentkit/tree-dropdown/tree-dropdown.component';
import { InputTextareaComponent } from './componentkit/input-textarea/input-textarea.component';
import { CalendarRangeQuickComponent } from './componentkit/calendar-range-quick/calendar-range-quick.component';
import { TableExportComponent } from './componentkit/table/table-export/table-export.component';
import { MultiSelectTableComponent } from './componentkit/multi-select-table/multi-select-table.component';

@NgModule({
  declarations: [
    MenubarComponent,
    ControlMessagesComponent,
    ButtonComponent,
    DropdownComponent,
    InputTextComponent,
    InputNumberComponent,
    MultiSelectComponent,
    CalendarComponent,
    CalendarRangeComponent,
    CalendarRangeQuickComponent,
    TableComponent,
    TableExpansionComponent,
    TableExportComponent,
    DropdownTableComponent,
    MultiSelectTableComponent,
    TreeDropdownComponent,
    InputTextareaComponent,
    ButtonDynamicallyaddComponent,
    ButtonDynamicallydeleteComponent,
    InputNumberRangeComponent,
    FileUploadComponent,
    EditorTextComponent,
    RadiobuttonComponent,
    HasPermissionDirective,
  ],
  imports: [
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    DialogModule,
    TableModule,
    CardModule,
    DropdownModule,
    MultiSelectModule,
    InputNumberModule,
    InputTextareaModule,
    InputTextModule,
    PasswordModule,
    CalendarModule,
    CheckboxModule,
    MenubarModule,
    MessagesModule,
    ToastModule,
    InputSwitchModule,
    TranslateModule,
    ProgressSpinnerModule,
    PanelModule,
    OrganizationChartModule,
    ButtonModule,
    SkeletonModule,
    EditorModule,
    InputIconModule,
    IconFieldModule,
    InputGroupAddonModule,
    SelectButtonModule,

    DividerModule,
    DataViewModule,
    InputGroupModule,
    RippleModule,
    SplitButtonModule,
    ToggleButtonModule,
    BreadcrumbModule,
    AutoCompleteModule,
    ChipsModule,
    InputMaskModule,
    CascadeSelectModule,
    AccordionModule,
    TreeTableModule,
    ListboxModule,
    PickListModule,
    FieldsetModule,
    ConfirmDialogModule,
    ContextMenuModule,
    ProgressBarModule,
    RadioButtonModule,
    OverlayPanelModule,
    SidebarModule,
    TreeModule,
    PanelMenuModule,
    TagModule,
    ToolbarModule,
    StepperModule,
    PaginatorModule,
    ImageModule,
    StepsModule,
    FileUploadModule,
    SpeedDialModule,
  ],
  exports: [
    // Angular
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    FontAwesomeModule,
    // PrimeNG
    OrganizationChartModule,
    ProgressSpinnerModule,
    PanelModule,
    DialogModule,
    ButtonModule,
    DropdownModule,
    TableModule, // 這個都用共通就把他刪掉，不要佔空間
    CardModule,
    TabViewModule,
    DividerModule,
    InputTextModule,

    DataViewModule,
    MultiSelectModule,
    InputGroupModule,
    RippleModule,
    SplitButtonModule,
    ToggleButtonModule,
    BreadcrumbModule,
    ChipsModule,
    InputMaskModule,
    InputNumberModule,
    CascadeSelectModule,
    PasswordModule,
    MessagesModule,
    AccordionModule,
    TreeTableModule,
    CalendarModule,
    CheckboxModule,
    ListboxModule,
    PickListModule,
    FieldsetModule,

    ToastModule,
    ConfirmDialogModule,
    ContextMenuModule,
    ProgressBarModule,
    RadioButtonModule,
    OverlayPanelModule,
    SidebarModule,
    InputSwitchModule,
    TreeModule,

    PanelMenuModule,
    TagModule,
    ToolbarModule,
    StepperModule,
    PaginatorModule,
    ImageModule,
    StepsModule,
    FileUploadModule,
    SpeedDialModule,
    InputGroupAddonModule,
    IconFieldModule,
    InputIconModule,
    // Custom
    MenubarComponent,
    ControlMessagesComponent,
    ButtonComponent,
    DropdownComponent,
    HasPermissionDirective,
    ButtonDynamicallyaddComponent,
    ButtonDynamicallydeleteComponent,
    InputTextComponent,
    DropdownTableComponent,
    MultiSelectTableComponent,
    TreeDropdownComponent,
    InputTextareaComponent,
    InputNumberComponent,
    InputNumberRangeComponent,
    FileUploadComponent,
    EditorTextComponent,
    MultiSelectComponent,
    CalendarComponent,
    CalendarRangeComponent,
    CalendarRangeQuickComponent,
    TableComponent,
    TableExpansionComponent,
    RadiobuttonComponent,
  ],
})
export class SharedModule { }
