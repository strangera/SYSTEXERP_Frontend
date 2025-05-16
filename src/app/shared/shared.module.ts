import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
// FontAwesome
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
// primeng
import { SkeletonModule } from 'primeng/skeleton';
import { BlockUIModule } from 'primeng/blockui';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { PanelModule } from 'primeng/panel';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { TreeSelectModule } from 'primeng/treeselect';
import { SelectButtonModule } from 'primeng/selectbutton';
import { MenuModule } from 'primeng/menu';
import { ColorPickerModule } from 'primeng/colorpicker';
import { TabViewModule } from 'primeng/tabview';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { DropdownModule } from 'primeng/dropdown';
import { SplitterModule } from 'primeng/splitter';
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
import { TabMenuModule } from 'primeng/tabmenu';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ContextMenuModule } from 'primeng/contextmenu';
import { ProgressBarModule } from 'primeng/progressbar';
import { RadioButtonModule } from 'primeng/radiobutton';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { SidebarModule } from 'primeng/sidebar';
import { InputSwitchModule } from 'primeng/inputswitch';
import { TreeModule } from 'primeng/tree';
import { StyleClassModule } from 'primeng/styleclass';
import { ChartModule } from 'primeng/chart';
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
import { FloatLabelModule } from 'primeng/floatlabel';
import { EditorModule } from 'primeng/editor';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';

// Component
import { MenubarComponent } from './component/menubar/menubar.component';
import { ControlMessagesComponent } from './component/control-messages/control-messages.component';
// Pipe
import { HasPermissionDirective } from './directive/has-permission.directive';
//
import { InputTextComponent } from './componentkit/input-text/input-text.component';
import { DataTableComponent } from './componentkit/data-table/data-table.component';
import { MultiSelectComponent } from './componentkit/multi-select/multi-select.component';
import { InputNumberComponent } from './componentkit/input-number/input-number.component';
import { InputNumberRangeComponent } from './componentkit/input-number-range/input-number-range.component';
import { RadiobuttonComponent } from './componentkit/radiobutton/radiobutton.component';
import { EditorTextComponent } from './componentkit/editor-text/editor-text.component';
import { FileUploadComponent } from './componentkit/file-upload/file-upload.component';
import { ButtonDynamicallyaddComponent } from './componentkit/button-dynamicallyadd/button-dynamicallyadd.component';
import { ButtonDynamicallydeleteComponent } from './componentkit/button-dynamicallydelete/button-dynamicallydelete.component';
import { DataTableCheckComponent } from './componentkit/data-table-check/data-table-check.component';
import { DataTableSpanComponent } from './componentkit/data-table-span/data-table-span.component';
import { OrganizationChartModule } from 'primeng/organizationchart';
import { NgChartsModule } from 'ng2-charts';
import { DataTableSettingComponent } from './componentkit/data-table-setting/data-table-setting.component';
import { DataTableGroupComponent } from './componentkit/data-table-group/data-table-group.component';
import { DataTableReportComponent } from './componentkit/data-table-report/data-table-report.component';
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

@NgModule({
  declarations: [
    MenubarComponent,
    ControlMessagesComponent,
    // componentKit
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
    DropdownTableComponent,
    TreeDropdownComponent,
    InputTextareaComponent,

    ButtonDynamicallyaddComponent,
    ButtonDynamicallydeleteComponent,
    InputNumberRangeComponent,
    FileUploadComponent,
    EditorTextComponent,
    DataTableComponent,
    DataTableSettingComponent,
    DataTableCheckComponent,
    DataTableSpanComponent,
    DataTableGroupComponent,
    DataTableReportComponent,
    RadiobuttonComponent,
    
    // Directive
    HasPermissionDirective,
    //
  ],
  imports: [
    NgChartsModule,
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    // FontAwesome
    FontAwesomeModule,
    // primeng
    SkeletonModule,
    BlockUIModule,
    ProgressSpinnerModule,
    PanelModule,
    DialogModule,
    TableModule,
    ButtonModule,
    CardModule,
    ChipModule,
    TreeSelectModule,
    SelectButtonModule,
    MenuModule,
    ColorPickerModule,
    TabViewModule,
    BadgeModule,
    AvatarModule,
    DropdownModule,
    SplitterModule,
    DividerModule,
    DataViewModule,
    MultiSelectModule,
    InputGroupModule,
    RippleModule,
    SplitButtonModule,
    ToggleButtonModule,
    BreadcrumbModule,
    AutoCompleteModule,
    ChipsModule,
    InputMaskModule,
    InputNumberModule,
    CascadeSelectModule,
    InputTextareaModule,
    InputTextModule,
    PasswordModule,
    MessagesModule,
    AccordionModule,
    TreeTableModule,
    CalendarModule,
    CheckboxModule,
    ListboxModule,
    PickListModule,
    FieldsetModule,
    MenubarModule,
    TabMenuModule,
    MessageModule,
    ToastModule,
    ConfirmDialogModule,
    ContextMenuModule,
    ProgressBarModule,
    RadioButtonModule,
    OverlayPanelModule,
    SidebarModule,
    InputSwitchModule,
    TreeModule,
    StyleClassModule,
    ChartModule,
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
    //
    InputIconModule,
    IconFieldModule,
    FloatLabelModule,
    EditorModule,
    TranslateModule,

    OrganizationChartModule,
  ],
  exports: [
    NgChartsModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    // FontAwesome
    FontAwesomeModule,
    // primeng
    SkeletonModule,
    BlockUIModule,
    ProgressSpinnerModule,
    PanelModule,
    DialogModule,
    TableModule,
    ButtonModule,
    CardModule,
    ChipModule,
    TreeSelectModule,
    SelectButtonModule,
    MenuModule,
    ColorPickerModule,
    TabViewModule,
    BadgeModule,
    AvatarModule,
    DropdownModule,
    SplitterModule,
    DividerModule,
    DataViewModule,
    MultiSelectModule,
    InputGroupModule,
    RippleModule,
    SplitButtonModule,
    ToggleButtonModule,
    BreadcrumbModule,
    AutoCompleteModule,
    ChipsModule,
    InputMaskModule,
    InputNumberModule,
    CascadeSelectModule,
    InputTextareaModule,
    InputTextModule,
    PasswordModule,
    MessagesModule,
    AccordionModule,
    TreeTableModule,
    CalendarModule,
    CheckboxModule,
    ListboxModule,
    PickListModule,
    FieldsetModule,
    MenubarModule,
    TabMenuModule,
    MessageModule,
    ToastModule,
    ConfirmDialogModule,
    ContextMenuModule,
    ProgressBarModule,
    RadioButtonModule,
    OverlayPanelModule,
    SidebarModule,
    InputSwitchModule,
    TreeModule,
    StyleClassModule,
    ChartModule,
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
    // other
    MenubarComponent,
    ControlMessagesComponent,
    ButtonComponent,
    DropdownComponent,
    //
    HasPermissionDirective,
    ButtonDynamicallyaddComponent,
    ButtonDynamicallydeleteComponent,
    InputTextComponent,
    DropdownTableComponent,
    TreeDropdownComponent,
    InputTextareaComponent,
    InputNumberComponent,
    InputNumberRangeComponent,
    FileUploadComponent,
    EditorTextComponent,
    DataTableComponent,
    DataTableSettingComponent,
    DataTableCheckComponent,
    DataTableGroupComponent,
    DataTableSpanComponent,
    DataTableReportComponent,
    MultiSelectComponent,
    CalendarComponent,
    CalendarRangeComponent,
    CalendarRangeQuickComponent,
    TableComponent,
    TableExpansionComponent,
    RadiobuttonComponent,
    //
    InputIconModule,
    IconFieldModule,
    FloatLabelModule,
    EditorModule,
  

    OrganizationChartModule,
  ],
})
export class SharedModule { }
