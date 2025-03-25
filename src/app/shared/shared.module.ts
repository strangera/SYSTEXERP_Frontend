import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
// FontAwesome
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
// primeng
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
import { AutoCompleteModule } from "primeng/autocomplete";
import { ChipsModule } from "primeng/chips";
import { InputMaskModule } from "primeng/inputmask";
import { InputNumberModule } from "primeng/inputnumber";
import { CascadeSelectModule } from "primeng/cascadeselect";
import { InputTextareaModule } from "primeng/inputtextarea";
import { InputTextModule } from "primeng/inputtext";
import { PasswordModule } from "primeng/password";
import { MessagesModule } from 'primeng/messages';
import { AccordionModule } from 'primeng/accordion';
import { TreeTableModule } from "primeng/treetable";
import { CalendarModule } from "primeng/calendar";
import { CheckboxModule } from 'primeng/checkbox';
import { ListboxModule } from 'primeng/listbox';
import { PickListModule } from 'primeng/picklist';
import { FieldsetModule  } from 'primeng/fieldset';
import { MenubarModule } from 'primeng/menubar';
import { TabMenuModule } from 'primeng/tabmenu';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ContextMenuModule} from 'primeng/contextmenu';
import { ProgressBarModule} from 'primeng/progressbar';
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
import { DropdownItemComponent } from './componentkit/dropdown-item/dropdown-item.component';
import { DatetimeRangeComponent } from './componentkit/datetime-range/datetime-range.component';
import { DateRangeComponent } from './componentkit/date-range/date-range.component';
import { MultiSelectComponent } from './componentkit/multi-select/multi-select.component';
import { InputNumberComponent } from './componentkit/input-number/input-number.component';
import { DatetimeOneComponent } from './componentkit/datetime-one/datetime-one.component';
import { CheckboxOneComponent } from './componentkit/checkbox-one/checkbox-one.component';
import { DatemmOneComponent } from './componentkit/datemm-one/datemm-one.component';
import { DatemmTwoComponent } from './componentkit/datemm-two/datemm-two.component';
import { InputNumberRangeComponent } from './componentkit/input-number-range/input-number-range.component';
import { DateyyOneComponent } from './componentkit/dateyy-one/dateyy-one.component';
import { InputSerialNumberComponent } from './componentkit/input-serial-number/input-serial-number.component';
import { InputSerialNumberRangeComponent } from './componentkit/input-serial-number-range/input-serial-number-range.component';
import { DateOneComponent } from './componentkit/date-one/date-one.component';
import { DropdownDefaultComponent } from './componentkit/dropdown-default/dropdown-default.component';
import { CheckboxComponent } from './componentkit/checkbox/checkbox.component';
import { RadiobuttonComponent } from './componentkit/radiobutton/radiobutton.component';
import { EditorTextComponent } from './componentkit/editor-text/editor-text.component';
import { DropdownMultlabelComponent } from './componentkit/dropdown-multlabel/dropdown-multlabel.component';
import { CheckbuttonToggleComponent } from './componentkit/checkbutton-toggle/checkbutton-toggle.component';
import { DatemmRangeComponent } from './componentkit/datemm-range/datemm-range.component';
import { TimeRangeComponent } from './componentkit/time-range/time-range.component';
import { TimeOneComponent } from './componentkit/time-one/time-one.component';
import { DataTableEditorComponent } from './componentkit/data-table-editor/data-table-editor.component';
import { FileUploadComponent } from './componentkit/file-upload/file-upload.component';
import { ButtonCreateComponent } from './componentkit/button-create/button-create.component';
import { ButtonQueryComponent } from './componentkit/button-query/button-query.component';
import { ButtonSubmitComponent } from './componentkit/button-submit/button-submit.component';
import { ButtonDynamicallyaddComponent } from './componentkit/button-dynamicallyadd/button-dynamicallyadd.component';
import { ButtonCancelComponent } from './componentkit/button-cancel/button-cancel.component';
import { ButtonDynamicallydeleteComponent } from './componentkit/button-dynamicallydelete/button-dynamicallydelete.component';
import { ButtonDemoComponent } from './componentkit/button-demo/button-demo.component';
import { ButtonClearComponent } from './componentkit/button-clear/button-clear.component';
import { DatebuttonRangeComponent } from './componentkit/datebutton-range/datebutton-range.component';
import { DataTableCheckComponent } from './componentkit/data-table-check/data-table-check.component';
import { ButtonDeleteComponent } from './componentkit/button-delete/button-delete.component';
import { InputTwoDialogComponent } from './componentkit/input-two-dialog/input-two-dialog.component';
import { InputThreeDialogComponent } from './componentkit/input-three-dialog/input-three-dialog.component';
import { ButtonActionComponent } from './componentkit/button-action/button-action.component';
import { InputPOSQuickkeyComponent } from './componentkit/input-posquickkey/input-posquickkey.component';
import { DateyyRangeComponent } from './componentkit/dateyy-range/dateyy-range.component';
import { DateqtrRangeComponent } from './componentkit/dateqtr-range/dateqtr-range.component';
import { DataTableSpanComponent } from './componentkit/data-table-span/data-table-span.component';
import { AddressFormComponent } from './componentkit/address-form/address-form.component';
import { OrganizationChartModule } from 'primeng/organizationchart';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgChartsModule  } from 'ng2-charts';
import { InputTwoListComponent } from './componentkit/input-two-list/input-two-list.component';
import { DataTableSettingComponent } from './componentkit/data-table-setting/data-table-setting.component';
import { DataTableGroupComponent } from './componentkit/data-table-group/data-table-group.component';
import { DataTableReportComponent } from './componentkit/data-table-report/data-table-report.component';
import { InputThreeLayerDialogComponent } from './componentkit/input-three-layer-dialog/input-three-layer-dialog.component';
import { ExcelExportComponent } from './componentkit/excel-export/excel-export.component';
import { CategorySelectorComponent } from './componentkit/category-selector/category-selector.component';
import { InputMultiDialogComponent } from './componentkit/input-multi-dialog/input-multi-dialog.component';
import { FilterMultiDialogComponent } from './filter-multi-dialog/filter-multi-dialog.component';
import { InputAPIMultiDailogComponent } from './componentkit/input-apimulti-dailog/input-apimulti-dailog.component';

@NgModule({
  declarations: [
    //

    MenubarComponent,
    ControlMessagesComponent,
    //
    ButtonCreateComponent,
    ButtonClearComponent,
    ButtonQueryComponent,
    ButtonSubmitComponent,
    ButtonCancelComponent,
    ButtonDeleteComponent,
    ButtonActionComponent,
    ButtonDynamicallyaddComponent,
    ButtonDynamicallydeleteComponent,
    ButtonDemoComponent,
    InputTextComponent,
    InputTwoDialogComponent,
    InputTwoListComponent,
    InputThreeDialogComponent,
    InputPOSQuickkeyComponent,
    InputNumberComponent,
    InputNumberRangeComponent,
    InputSerialNumberComponent,
    InputSerialNumberRangeComponent,
    InputThreeLayerDialogComponent,
    FileUploadComponent,
    EditorTextComponent,
    DataTableComponent,
    DataTableSettingComponent,
    DataTableEditorComponent,
    DataTableCheckComponent,
    DataTableSpanComponent,
    DataTableGroupComponent,
    DataTableReportComponent,
    DropdownDefaultComponent,
    DropdownItemComponent,
    DropdownMultlabelComponent,
    TimeOneComponent,
    TimeRangeComponent,
    DateOneComponent,
    DateRangeComponent,
    DatetimeOneComponent,
    DatetimeRangeComponent,
    DatemmOneComponent,
    DatemmTwoComponent,
    DatemmRangeComponent,
    DatebuttonRangeComponent,
    DateqtrRangeComponent,
    DateyyOneComponent,
    DateyyRangeComponent,
    CheckboxComponent,
    CheckboxOneComponent,
    CheckbuttonToggleComponent,
    MultiSelectComponent,
    RadiobuttonComponent,
    ExcelExportComponent,
    CategorySelectorComponent,
    InputMultiDialogComponent,
    FilterMultiDialogComponent,
    InputAPIMultiDailogComponent,
    // Directive
    HasPermissionDirective, AddressFormComponent,
    //
  ],
  imports: [
    NgChartsModule ,
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    // FontAwesome
    FontAwesomeModule,
    // primeng
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

    OrganizationChartModule
  ],
  exports: [
    NgChartsModule ,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    // FontAwesome
    FontAwesomeModule,
    // primeng
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
    //
    HasPermissionDirective,
    //
    ButtonCreateComponent,
    ButtonClearComponent,
    ButtonQueryComponent,
    ButtonSubmitComponent,
    ButtonCancelComponent,
    ButtonDeleteComponent,
    ButtonActionComponent,
    ButtonDynamicallyaddComponent,
    ButtonDynamicallydeleteComponent,
    ButtonDemoComponent,
    InputTextComponent,
    InputTwoDialogComponent,
    InputTwoListComponent,
    InputThreeDialogComponent,
    InputPOSQuickkeyComponent,
    InputNumberComponent,
    InputNumberRangeComponent,
    InputSerialNumberComponent,
    InputSerialNumberRangeComponent,
    InputThreeLayerDialogComponent,
    FileUploadComponent,
    EditorTextComponent,
    DataTableComponent,
    DataTableSettingComponent,
    DataTableEditorComponent,
    DataTableCheckComponent,
    DataTableGroupComponent,
    DataTableSpanComponent,
    DataTableReportComponent,
    DropdownDefaultComponent,
    DropdownItemComponent,
    DropdownMultlabelComponent,
    TimeOneComponent,
    TimeRangeComponent,
    DateOneComponent,
    DateRangeComponent,
    DatetimeOneComponent,
    DatetimeRangeComponent,
    DatemmOneComponent,
    DatemmTwoComponent,
    DatemmRangeComponent,
    DatebuttonRangeComponent,
    DateqtrRangeComponent,
    DateyyOneComponent,
    DateyyRangeComponent,
    CheckboxComponent,
    CheckboxOneComponent,
    CheckbuttonToggleComponent,
    MultiSelectComponent,
    RadiobuttonComponent,
    InputMultiDialogComponent,
    InputAPIMultiDailogComponent,
    //
    InputIconModule,
    IconFieldModule,
    FloatLabelModule,
    EditorModule,
    AddressFormComponent,
    ExcelExportComponent,
    FilterMultiDialogComponent,

    OrganizationChartModule
  ],
})
export class SharedModule { }
