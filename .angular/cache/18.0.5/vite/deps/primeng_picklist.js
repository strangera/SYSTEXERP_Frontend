import {
  AngleDoubleDownIcon,
  AngleDoubleUpIcon,
  CDK_DRAG_CONFIG,
  CdkDrag,
  CdkDropList,
  CdkDropListGroup,
  DragDropModule,
  moveItemInArray,
  transferArrayItem
} from "./chunk-WK6HMTK7.js";
import {
  AngleDoubleLeftIcon,
  AngleDoubleRightIcon,
  AngleLeftIcon
} from "./chunk-OLNNINQM.js";
import {
  AngleUpIcon
} from "./chunk-Q5TUC47Q.js";
import {
  AngleDownIcon
} from "./chunk-FRJLQTFB.js";
import {
  SearchIcon
} from "./chunk-7ULWZIHY.js";
import {
  AngleRightIcon
} from "./chunk-VS6LC3GN.js";
import {
  ButtonDirective,
  ButtonModule
} from "./chunk-ONM5UDDM.js";
import "./chunk-RYNQJOQ2.js";
import {
  Ripple,
  RippleModule
} from "./chunk-K4IBBLEG.js";
import "./chunk-3LAVSDWL.js";
import {
  HomeIcon
} from "./chunk-X5C3BFOI.js";
import "./chunk-MIXIAWOW.js";
import {
  DomHandler
} from "./chunk-TKJMWDM5.js";
import {
  FilterService,
  PrimeNGConfig,
  PrimeTemplate,
  SharedModule
} from "./chunk-GXYDQWIA.js";
import {
  ObjectUtils,
  UniqueComponentId
} from "./chunk-2VN6LQR4.js";
import {
  CommonModule,
  DOCUMENT,
  NgClass,
  NgForOf,
  NgIf,
  NgStyle,
  NgTemplateOutlet,
  isPlatformBrowser
} from "./chunk-IRMOOF4Q.js";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  NgModule,
  Output,
  PLATFORM_ID,
  Renderer2,
  ViewChild,
  ViewEncapsulation$1,
  booleanAttribute,
  numberAttribute,
  setClassMetadata,
  ɵɵInputTransformsFeature,
  ɵɵadvance,
  ɵɵattribute,
  ɵɵclassMap,
  ɵɵcontentQuery,
  ɵɵdefineComponent,
  ɵɵdefineInjector,
  ɵɵdefineNgModule,
  ɵɵdirectiveInject,
  ɵɵelement,
  ɵɵelementContainer,
  ɵɵelementContainerEnd,
  ɵɵelementContainerStart,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵgetCurrentView,
  ɵɵlistener,
  ɵɵloadQuery,
  ɵɵnextContext,
  ɵɵproperty,
  ɵɵpureFunction1,
  ɵɵpureFunction2,
  ɵɵqueryRefresh,
  ɵɵreference,
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵtemplate,
  ɵɵtemplateRefExtractor,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵviewQuery
} from "./chunk-VAJ5724L.js";
import "./chunk-MOY5LPCH.js";
import "./chunk-MJQNUHK2.js";
import "./chunk-SAI3DHVA.js";
import "./chunk-RM45IPHL.js";

// node_modules/primeng/fesm2022/primeng-picklist.mjs
var _c0 = ["sourcelist"];
var _c1 = ["targetlist"];
var _c2 = ["sourceFilter"];
var _c3 = ["targetFilter"];
var _c4 = (a0) => ({
  "p-picklist p-component": true,
  "p-picklist-striped": a0
});
var _c5 = (a0) => ({
  $implicit: a0
});
var _c6 = (a0) => ({
  options: a0
});
var _c7 = (a0, a1) => ({
  $implicit: a0,
  index: a1
});
function PickList_div_1_AngleUpIcon_2_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "AngleUpIcon");
  }
  if (rf & 2) {
    ɵɵattribute("data-pc-section", "moveupicon");
  }
}
function PickList_div_1_3_ng_template_0_Template(rf, ctx) {
}
function PickList_div_1_3_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵtemplate(0, PickList_div_1_3_ng_template_0_Template, 0, 0, "ng-template");
  }
}
function PickList_div_1_AngleDoubleUpIcon_5_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "AngleDoubleUpIcon");
  }
  if (rf & 2) {
    ɵɵattribute("data-pc-section", "movetopicon");
  }
}
function PickList_div_1_6_ng_template_0_Template(rf, ctx) {
}
function PickList_div_1_6_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵtemplate(0, PickList_div_1_6_ng_template_0_Template, 0, 0, "ng-template");
  }
}
function PickList_div_1_AngleDownIcon_8_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "AngleDownIcon");
  }
  if (rf & 2) {
    ɵɵattribute("data-pc-section", "movedownicon");
  }
}
function PickList_div_1_9_ng_template_0_Template(rf, ctx) {
}
function PickList_div_1_9_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵtemplate(0, PickList_div_1_9_ng_template_0_Template, 0, 0, "ng-template");
  }
}
function PickList_div_1_AngleDoubleDownIcon_11_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "AngleDoubleDownIcon");
  }
  if (rf & 2) {
    ɵɵattribute("data-pc-section", "movebottomicon");
  }
}
function PickList_div_1_12_ng_template_0_Template(rf, ctx) {
}
function PickList_div_1_12_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵtemplate(0, PickList_div_1_12_ng_template_0_Template, 0, 0, "ng-template");
  }
}
function PickList_div_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r2 = ɵɵgetCurrentView();
    ɵɵelementStart(0, "div", 20)(1, "button", 15);
    ɵɵlistener("click", function PickList_div_1_Template_button_click_1_listener() {
      ɵɵrestoreView(_r2);
      const ctx_r2 = ɵɵnextContext();
      const sourcelist_r4 = ɵɵreference(6);
      return ɵɵresetView(ctx_r2.moveUp(sourcelist_r4, ctx_r2.source, ctx_r2.selectedItemsSource, ctx_r2.onSourceReorder, ctx_r2.SOURCE_LIST));
    });
    ɵɵtemplate(2, PickList_div_1_AngleUpIcon_2_Template, 1, 1, "AngleUpIcon", 13)(3, PickList_div_1_3_Template, 1, 0, null, 21);
    ɵɵelementEnd();
    ɵɵelementStart(4, "button", 15);
    ɵɵlistener("click", function PickList_div_1_Template_button_click_4_listener() {
      ɵɵrestoreView(_r2);
      const ctx_r2 = ɵɵnextContext();
      const sourcelist_r4 = ɵɵreference(6);
      return ɵɵresetView(ctx_r2.moveTop(sourcelist_r4, ctx_r2.source, ctx_r2.selectedItemsSource, ctx_r2.onSourceReorder, ctx_r2.SOURCE_LIST));
    });
    ɵɵtemplate(5, PickList_div_1_AngleDoubleUpIcon_5_Template, 1, 1, "AngleDoubleUpIcon", 13)(6, PickList_div_1_6_Template, 1, 0, null, 21);
    ɵɵelementEnd();
    ɵɵelementStart(7, "button", 15);
    ɵɵlistener("click", function PickList_div_1_Template_button_click_7_listener() {
      ɵɵrestoreView(_r2);
      const ctx_r2 = ɵɵnextContext();
      const sourcelist_r4 = ɵɵreference(6);
      return ɵɵresetView(ctx_r2.moveDown(sourcelist_r4, ctx_r2.source, ctx_r2.selectedItemsSource, ctx_r2.onSourceReorder, ctx_r2.SOURCE_LIST));
    });
    ɵɵtemplate(8, PickList_div_1_AngleDownIcon_8_Template, 1, 1, "AngleDownIcon", 13)(9, PickList_div_1_9_Template, 1, 0, null, 21);
    ɵɵelementEnd();
    ɵɵelementStart(10, "button", 15);
    ɵɵlistener("click", function PickList_div_1_Template_button_click_10_listener() {
      ɵɵrestoreView(_r2);
      const ctx_r2 = ɵɵnextContext();
      const sourcelist_r4 = ɵɵreference(6);
      return ɵɵresetView(ctx_r2.moveBottom(sourcelist_r4, ctx_r2.source, ctx_r2.selectedItemsSource, ctx_r2.onSourceReorder, ctx_r2.SOURCE_LIST));
    });
    ɵɵtemplate(11, PickList_div_1_AngleDoubleDownIcon_11_Template, 1, 1, "AngleDoubleDownIcon", 13)(12, PickList_div_1_12_Template, 1, 0, null, 21);
    ɵɵelementEnd()();
  }
  if (rf & 2) {
    const ctx_r2 = ɵɵnextContext();
    ɵɵattribute("data-pc-section", "sourceControls")("data-pc-group-section", "controls");
    ɵɵadvance();
    ɵɵproperty("disabled", ctx_r2.sourceMoveDisabled());
    ɵɵattribute("aria-label", ctx_r2.moveUpAriaLabel)("data-pc-section", "sourceMoveUpButton");
    ɵɵadvance();
    ɵɵproperty("ngIf", !ctx_r2.moveUpIconTemplate);
    ɵɵadvance();
    ɵɵproperty("ngTemplateOutlet", ctx_r2.moveUpIconTemplate);
    ɵɵadvance();
    ɵɵproperty("disabled", ctx_r2.sourceMoveDisabled());
    ɵɵattribute("aria-label", ctx_r2.moveTopAriaLabel)("data-pc-section", "sourceMoveTopButton");
    ɵɵadvance();
    ɵɵproperty("ngIf", !ctx_r2.moveTopIconTemplate);
    ɵɵadvance();
    ɵɵproperty("ngTemplateOutlet", ctx_r2.moveTopIconTemplate);
    ɵɵadvance();
    ɵɵproperty("disabled", ctx_r2.sourceMoveDisabled());
    ɵɵattribute("aria-label", ctx_r2.moveDownAriaLabel)("data-pc-section", "sourceMoveDownButton");
    ɵɵadvance();
    ɵɵproperty("ngIf", !ctx_r2.moveDownIconTemplate);
    ɵɵadvance();
    ɵɵproperty("ngTemplateOutlet", ctx_r2.moveDownIconTemplate);
    ɵɵadvance();
    ɵɵproperty("disabled", ctx_r2.sourceMoveDisabled());
    ɵɵattribute("aria-label", ctx_r2.moveBottomAriaLabel)("data-pc-section", "sourceMoveBottomButton");
    ɵɵadvance();
    ɵɵproperty("ngIf", !ctx_r2.moveBottomIconTemplate);
    ɵɵadvance();
    ɵɵproperty("ngTemplateOutlet", ctx_r2.moveBottomIconTemplate);
  }
}
function PickList_div_3_div_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "div", 24);
    ɵɵtext(1);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = ɵɵnextContext(2);
    ɵɵadvance();
    ɵɵtextInterpolate(ctx_r2.sourceHeader);
  }
}
function PickList_div_3_ng_container_2_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainer(0);
  }
}
function PickList_div_3_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "div", 22);
    ɵɵtemplate(1, PickList_div_3_div_1_Template, 2, 1, "div", 23)(2, PickList_div_3_ng_container_2_Template, 1, 0, "ng-container", 21);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = ɵɵnextContext();
    ɵɵproperty("id", ctx_r2.idSource + "_header");
    ɵɵattribute("data-pc-section", "sourceHeader")("data-pc-group-section", "header");
    ɵɵadvance();
    ɵɵproperty("ngIf", !ctx_r2.sourceHeaderTemplate);
    ɵɵadvance();
    ɵɵproperty("ngTemplateOutlet", ctx_r2.sourceHeaderTemplate);
  }
}
function PickList_div_4_ng_container_1_ng_container_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainer(0);
  }
}
function PickList_div_4_ng_container_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainerStart(0);
    ɵɵtemplate(1, PickList_div_4_ng_container_1_ng_container_1_Template, 1, 0, "ng-container", 16);
    ɵɵelementContainerEnd();
  }
  if (rf & 2) {
    const ctx_r2 = ɵɵnextContext(2);
    ɵɵadvance();
    ɵɵproperty("ngTemplateOutlet", ctx_r2.sourceFilterTemplate)("ngTemplateOutletContext", ɵɵpureFunction1(2, _c6, ctx_r2.sourceFilterOptions));
  }
}
function PickList_div_4_ng_template_2_SearchIcon_3_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "SearchIcon", 31);
  }
  if (rf & 2) {
    ɵɵproperty("styleClass", "p-picklist-filter-icon");
    ɵɵattribute("data-pc-section", "sourcefilterIcon");
  }
}
function PickList_div_4_ng_template_2_span_4_1_ng_template_0_Template(rf, ctx) {
}
function PickList_div_4_ng_template_2_span_4_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵtemplate(0, PickList_div_4_ng_template_2_span_4_1_ng_template_0_Template, 0, 0, "ng-template");
  }
}
function PickList_div_4_ng_template_2_span_4_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "span", 32);
    ɵɵtemplate(1, PickList_div_4_ng_template_2_span_4_1_Template, 1, 0, null, 21);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = ɵɵnextContext(3);
    ɵɵattribute("data-pc-section", "sourcefilterIcon");
    ɵɵadvance();
    ɵɵproperty("ngTemplateOutlet", ctx_r2.sourceFilterIconTemplate);
  }
}
function PickList_div_4_ng_template_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r5 = ɵɵgetCurrentView();
    ɵɵelementStart(0, "div", 27)(1, "input", 28, 3);
    ɵɵlistener("keyup", function PickList_div_4_ng_template_2_Template_input_keyup_1_listener($event) {
      ɵɵrestoreView(_r5);
      const ctx_r2 = ɵɵnextContext(2);
      return ɵɵresetView(ctx_r2.onFilter($event, ctx_r2.SOURCE_LIST));
    });
    ɵɵelementEnd();
    ɵɵtemplate(3, PickList_div_4_ng_template_2_SearchIcon_3_Template, 1, 2, "SearchIcon", 29)(4, PickList_div_4_ng_template_2_span_4_Template, 2, 2, "span", 30);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = ɵɵnextContext(2);
    ɵɵattribute("data-pc-section", "sourceFilter");
    ɵɵadvance();
    ɵɵproperty("disabled", ctx_r2.disabled);
    ɵɵattribute("placeholder", ctx_r2.sourceFilterPlaceholder)("aria-label", ctx_r2.ariaSourceFilterLabel)("data-pc-section", "sourceFilterInput");
    ɵɵadvance(2);
    ɵɵproperty("ngIf", !ctx_r2.sourceFilterIconTemplate);
    ɵɵadvance();
    ɵɵproperty("ngIf", ctx_r2.sourceFilterIconTemplate);
  }
}
function PickList_div_4_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "div", 25);
    ɵɵtemplate(1, PickList_div_4_ng_container_1_Template, 2, 4, "ng-container", 26)(2, PickList_div_4_ng_template_2_Template, 5, 7, "ng-template", null, 2, ɵɵtemplateRefExtractor);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const builtInSourceElement_r6 = ɵɵreference(3);
    const ctx_r2 = ɵɵnextContext();
    ɵɵattribute("data-pc-section", "sourceFilterContainer");
    ɵɵadvance();
    ɵɵproperty("ngIf", ctx_r2.sourceFilterTemplate)("ngIfElse", builtInSourceElement_r6);
  }
}
function PickList_ng_template_7_li_0_ng_container_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainer(0);
  }
}
function PickList_ng_template_7_li_0_Template(rf, ctx) {
  if (rf & 1) {
    const _r7 = ɵɵgetCurrentView();
    ɵɵelementStart(0, "li", 34);
    ɵɵlistener("click", function PickList_ng_template_7_li_0_Template_li_click_0_listener($event) {
      ɵɵrestoreView(_r7);
      const ctx_r7 = ɵɵnextContext();
      const item_r9 = ctx_r7.$implicit;
      const i_r10 = ctx_r7.index;
      const ctx_r2 = ɵɵnextContext();
      return ɵɵresetView(ctx_r2.onItemClick($event, item_r9, ctx_r2.selectedItemsSource, ctx_r2.SOURCE_LIST, ctx_r2.onSourceSelect, ctx_r2.idSource + "_" + i_r10));
    })("mousedown", function PickList_ng_template_7_li_0_Template_li_mousedown_0_listener() {
      ɵɵrestoreView(_r7);
      const i_r10 = ɵɵnextContext().index;
      const ctx_r2 = ɵɵnextContext();
      return ɵɵresetView(ctx_r2.onOptionMouseDown(i_r10, ctx_r2.SOURCE_LIST));
    })("dblclick", function PickList_ng_template_7_li_0_Template_li_dblclick_0_listener() {
      ɵɵrestoreView(_r7);
      const ctx_r2 = ɵɵnextContext(2);
      return ɵɵresetView(ctx_r2.onSourceItemDblClick());
    })("touchend", function PickList_ng_template_7_li_0_Template_li_touchend_0_listener() {
      ɵɵrestoreView(_r7);
      const ctx_r2 = ɵɵnextContext(2);
      return ɵɵresetView(ctx_r2.onItemTouchEnd());
    });
    ɵɵtemplate(1, PickList_ng_template_7_li_0_ng_container_1_Template, 1, 0, "ng-container", 16);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r7 = ɵɵnextContext();
    const item_r9 = ctx_r7.$implicit;
    const i_r10 = ctx_r7.index;
    const ctx_r2 = ɵɵnextContext();
    ɵɵproperty("id", ctx_r2.idSource + "_" + i_r10)("ngClass", ctx_r2.itemClass(item_r9, ctx_r2.idSource + "_" + i_r10, ctx_r2.selectedItemsSource))("cdkDragData", item_r9)("cdkDragDisabled", !ctx_r2.dragdrop);
    ɵɵattribute("data-pc-section", "item")("aria-selected", ctx_r2.isSelected(item_r9, ctx_r2.selectedItemsSource));
    ɵɵadvance();
    ɵɵproperty("ngTemplateOutlet", ctx_r2.itemTemplate)("ngTemplateOutletContext", ɵɵpureFunction2(8, _c7, item_r9, i_r10));
  }
}
function PickList_ng_template_7_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵtemplate(0, PickList_ng_template_7_li_0_Template, 2, 11, "li", 33);
  }
  if (rf & 2) {
    const item_r9 = ctx.$implicit;
    const ctx_r2 = ɵɵnextContext();
    ɵɵproperty("ngIf", ctx_r2.isItemVisible(item_r9, ctx_r2.SOURCE_LIST));
  }
}
function PickList_ng_container_8_li_1_ng_container_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainer(0);
  }
}
function PickList_ng_container_8_li_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "li", 36);
    ɵɵtemplate(1, PickList_ng_container_8_li_1_ng_container_1_Template, 1, 0, "ng-container", 21);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = ɵɵnextContext(2);
    ɵɵattribute("data-pc-section", "sourceEmptyMessage");
    ɵɵadvance();
    ɵɵproperty("ngTemplateOutlet", ctx_r2.emptyMessageSourceTemplate);
  }
}
function PickList_ng_container_8_li_2_ng_container_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainer(0);
  }
}
function PickList_ng_container_8_li_2_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "li", 36);
    ɵɵtemplate(1, PickList_ng_container_8_li_2_ng_container_1_Template, 1, 0, "ng-container", 21);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = ɵɵnextContext(2);
    ɵɵattribute("data-pc-section", "sourceEmptyMessage");
    ɵɵadvance();
    ɵɵproperty("ngTemplateOutlet", ctx_r2.emptyFilterMessageSourceTemplate);
  }
}
function PickList_ng_container_8_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainerStart(0);
    ɵɵtemplate(1, PickList_ng_container_8_li_1_Template, 2, 2, "li", 35)(2, PickList_ng_container_8_li_2_Template, 2, 2, "li", 35);
    ɵɵelementContainerEnd();
  }
  if (rf & 2) {
    const ctx_r2 = ɵɵnextContext();
    ɵɵadvance();
    ɵɵproperty("ngIf", !ctx_r2.filterValueSource || !ctx_r2.emptyFilterMessageSourceTemplate);
    ɵɵadvance();
    ɵɵproperty("ngIf", ctx_r2.filterValueSource);
  }
}
function PickList_ng_container_11_AngleRightIcon_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "AngleRightIcon");
  }
  if (rf & 2) {
    ɵɵattribute("data-pc-section", "movetotargeticon");
  }
}
function PickList_ng_container_11_AngleDownIcon_2_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "AngleDownIcon");
  }
  if (rf & 2) {
    ɵɵattribute("data-pc-section", "movetotargeticon");
  }
}
function PickList_ng_container_11_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainerStart(0);
    ɵɵtemplate(1, PickList_ng_container_11_AngleRightIcon_1_Template, 1, 1, "AngleRightIcon", 13)(2, PickList_ng_container_11_AngleDownIcon_2_Template, 1, 1, "AngleDownIcon", 13);
    ɵɵelementContainerEnd();
  }
  if (rf & 2) {
    const ctx_r2 = ɵɵnextContext();
    ɵɵadvance();
    ɵɵproperty("ngIf", !ctx_r2.viewChanged);
    ɵɵadvance();
    ɵɵproperty("ngIf", ctx_r2.viewChanged);
  }
}
function PickList_12_ng_template_0_Template(rf, ctx) {
}
function PickList_12_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵtemplate(0, PickList_12_ng_template_0_Template, 0, 0, "ng-template");
  }
}
function PickList_ng_container_14_AngleDoubleRightIcon_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "AngleDoubleRightIcon");
  }
  if (rf & 2) {
    ɵɵattribute("data-pc-section", "movealltotargeticon");
  }
}
function PickList_ng_container_14_AngleDoubleDownIcon_2_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "AngleDoubleDownIcon");
  }
  if (rf & 2) {
    ɵɵattribute("data-pc-section", "movealltotargeticon");
  }
}
function PickList_ng_container_14_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainerStart(0);
    ɵɵtemplate(1, PickList_ng_container_14_AngleDoubleRightIcon_1_Template, 1, 1, "AngleDoubleRightIcon", 13)(2, PickList_ng_container_14_AngleDoubleDownIcon_2_Template, 1, 1, "AngleDoubleDownIcon", 13);
    ɵɵelementContainerEnd();
  }
  if (rf & 2) {
    const ctx_r2 = ɵɵnextContext();
    ɵɵadvance();
    ɵɵproperty("ngIf", !ctx_r2.viewChanged);
    ɵɵadvance();
    ɵɵproperty("ngIf", ctx_r2.viewChanged);
  }
}
function PickList_15_ng_template_0_Template(rf, ctx) {
}
function PickList_15_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵtemplate(0, PickList_15_ng_template_0_Template, 0, 0, "ng-template");
  }
}
function PickList_ng_container_17_AngleLeftIcon_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "AngleLeftIcon");
  }
  if (rf & 2) {
    ɵɵattribute("data-pc-section", "movedownsourceticon");
  }
}
function PickList_ng_container_17_AngleUpIcon_2_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "AngleUpIcon");
  }
  if (rf & 2) {
    ɵɵattribute("data-pc-section", "movedownsourceticon");
  }
}
function PickList_ng_container_17_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainerStart(0);
    ɵɵtemplate(1, PickList_ng_container_17_AngleLeftIcon_1_Template, 1, 1, "AngleLeftIcon", 13)(2, PickList_ng_container_17_AngleUpIcon_2_Template, 1, 1, "AngleUpIcon", 13);
    ɵɵelementContainerEnd();
  }
  if (rf & 2) {
    const ctx_r2 = ɵɵnextContext();
    ɵɵadvance();
    ɵɵproperty("ngIf", !ctx_r2.viewChanged);
    ɵɵadvance();
    ɵɵproperty("ngIf", ctx_r2.viewChanged);
  }
}
function PickList_18_ng_template_0_Template(rf, ctx) {
}
function PickList_18_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵtemplate(0, PickList_18_ng_template_0_Template, 0, 0, "ng-template");
  }
}
function PickList_ng_container_20_AngleDoubleLeftIcon_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "AngleDoubleLeftIcon");
  }
  if (rf & 2) {
    ɵɵattribute("data-pc-section", "movealltosourceticon");
  }
}
function PickList_ng_container_20_AngleDoubleUpIcon_2_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "AngleDoubleUpIcon");
  }
  if (rf & 2) {
    ɵɵattribute("data-pc-section", "movealltosourceticon");
  }
}
function PickList_ng_container_20_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainerStart(0);
    ɵɵtemplate(1, PickList_ng_container_20_AngleDoubleLeftIcon_1_Template, 1, 1, "AngleDoubleLeftIcon", 13)(2, PickList_ng_container_20_AngleDoubleUpIcon_2_Template, 1, 1, "AngleDoubleUpIcon", 13);
    ɵɵelementContainerEnd();
  }
  if (rf & 2) {
    const ctx_r2 = ɵɵnextContext();
    ɵɵadvance();
    ɵɵproperty("ngIf", !ctx_r2.viewChanged);
    ɵɵadvance();
    ɵɵproperty("ngIf", ctx_r2.viewChanged);
  }
}
function PickList_21_ng_template_0_Template(rf, ctx) {
}
function PickList_21_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵtemplate(0, PickList_21_ng_template_0_Template, 0, 0, "ng-template");
  }
}
function PickList_div_23_div_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "div", 24);
    ɵɵtext(1);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = ɵɵnextContext(2);
    ɵɵadvance();
    ɵɵtextInterpolate(ctx_r2.targetHeader);
  }
}
function PickList_div_23_ng_container_2_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainer(0);
  }
}
function PickList_div_23_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "div", 22);
    ɵɵtemplate(1, PickList_div_23_div_1_Template, 2, 1, "div", 23)(2, PickList_div_23_ng_container_2_Template, 1, 0, "ng-container", 21);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = ɵɵnextContext();
    ɵɵproperty("id", ctx_r2.idTarget + "_header");
    ɵɵattribute("data-pc-section", "targetHead")("data-pc-group-section", "header");
    ɵɵadvance();
    ɵɵproperty("ngIf", !ctx_r2.targetHeaderTemplate);
    ɵɵadvance();
    ɵɵproperty("ngTemplateOutlet", ctx_r2.targetHeaderTemplate);
  }
}
function PickList_div_24_ng_container_1_ng_container_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainer(0);
  }
}
function PickList_div_24_ng_container_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainerStart(0);
    ɵɵtemplate(1, PickList_div_24_ng_container_1_ng_container_1_Template, 1, 0, "ng-container", 16);
    ɵɵelementContainerEnd();
  }
  if (rf & 2) {
    const ctx_r2 = ɵɵnextContext(2);
    ɵɵadvance();
    ɵɵproperty("ngTemplateOutlet", ctx_r2.targetFilterTemplate)("ngTemplateOutletContext", ɵɵpureFunction1(2, _c6, ctx_r2.targetFilterOptions));
  }
}
function PickList_div_24_ng_template_2_SearchIcon_3_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "SearchIcon", 31);
  }
  if (rf & 2) {
    ɵɵproperty("styleClass", "p-picklist-filter-icon");
    ɵɵattribute("data-pc-section", "targetfiltericon");
  }
}
function PickList_div_24_ng_template_2_span_4_1_ng_template_0_Template(rf, ctx) {
}
function PickList_div_24_ng_template_2_span_4_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵtemplate(0, PickList_div_24_ng_template_2_span_4_1_ng_template_0_Template, 0, 0, "ng-template");
  }
}
function PickList_div_24_ng_template_2_span_4_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "span", 32);
    ɵɵtemplate(1, PickList_div_24_ng_template_2_span_4_1_Template, 1, 0, null, 21);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = ɵɵnextContext(3);
    ɵɵattribute("data-pc-section", "targetfiltericon");
    ɵɵadvance();
    ɵɵproperty("ngTemplateOutlet", ctx_r2.targetFilterIconTemplate);
  }
}
function PickList_div_24_ng_template_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r11 = ɵɵgetCurrentView();
    ɵɵelementStart(0, "div", 27)(1, "input", 28, 5);
    ɵɵlistener("keyup", function PickList_div_24_ng_template_2_Template_input_keyup_1_listener($event) {
      ɵɵrestoreView(_r11);
      const ctx_r2 = ɵɵnextContext(2);
      return ɵɵresetView(ctx_r2.onFilter($event, ctx_r2.TARGET_LIST));
    });
    ɵɵelementEnd();
    ɵɵtemplate(3, PickList_div_24_ng_template_2_SearchIcon_3_Template, 1, 2, "SearchIcon", 29)(4, PickList_div_24_ng_template_2_span_4_Template, 2, 2, "span", 30);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = ɵɵnextContext(2);
    ɵɵattribute("data-pc-section", "targetFilter");
    ɵɵadvance();
    ɵɵproperty("disabled", ctx_r2.disabled);
    ɵɵattribute("placeholder", ctx_r2.targetFilterPlaceholder)("aria-label", ctx_r2.ariaTargetFilterLabel)("data-pc-section", "targetFilterInput");
    ɵɵadvance(2);
    ɵɵproperty("ngIf", !ctx_r2.targetFilterIconTemplate);
    ɵɵadvance();
    ɵɵproperty("ngIf", ctx_r2.targetFilterIconTemplate);
  }
}
function PickList_div_24_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "div", 25);
    ɵɵtemplate(1, PickList_div_24_ng_container_1_Template, 2, 4, "ng-container", 26)(2, PickList_div_24_ng_template_2_Template, 5, 7, "ng-template", null, 4, ɵɵtemplateRefExtractor);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const builtInTargetElement_r12 = ɵɵreference(3);
    const ctx_r2 = ɵɵnextContext();
    ɵɵattribute("data-pc-section", "targetFilterContainer");
    ɵɵadvance();
    ɵɵproperty("ngIf", ctx_r2.targetFilterTemplate)("ngIfElse", builtInTargetElement_r12);
  }
}
function PickList_ng_template_27_li_0_ng_container_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainer(0);
  }
}
function PickList_ng_template_27_li_0_Template(rf, ctx) {
  if (rf & 1) {
    const _r13 = ɵɵgetCurrentView();
    ɵɵelementStart(0, "li", 34);
    ɵɵlistener("click", function PickList_ng_template_27_li_0_Template_li_click_0_listener($event) {
      ɵɵrestoreView(_r13);
      const ctx_r13 = ɵɵnextContext();
      const item_r15 = ctx_r13.$implicit;
      const i_r16 = ctx_r13.index;
      const ctx_r2 = ɵɵnextContext();
      return ɵɵresetView(ctx_r2.onItemClick($event, item_r15, ctx_r2.selectedItemsTarget, ctx_r2.TARGET_LIST, ctx_r2.onTargetSelect, ctx_r2.idTarget + "_" + i_r16));
    })("mousedown", function PickList_ng_template_27_li_0_Template_li_mousedown_0_listener() {
      ɵɵrestoreView(_r13);
      const i_r16 = ɵɵnextContext().index;
      const ctx_r2 = ɵɵnextContext();
      return ɵɵresetView(ctx_r2.onOptionMouseDown(i_r16, ctx_r2.TARGET_LIST));
    })("dblclick", function PickList_ng_template_27_li_0_Template_li_dblclick_0_listener() {
      ɵɵrestoreView(_r13);
      const ctx_r2 = ɵɵnextContext(2);
      return ɵɵresetView(ctx_r2.onTargetItemDblClick());
    })("touchend", function PickList_ng_template_27_li_0_Template_li_touchend_0_listener() {
      ɵɵrestoreView(_r13);
      const ctx_r2 = ɵɵnextContext(2);
      return ɵɵresetView(ctx_r2.onItemTouchEnd());
    });
    ɵɵtemplate(1, PickList_ng_template_27_li_0_ng_container_1_Template, 1, 0, "ng-container", 16);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r13 = ɵɵnextContext();
    const item_r15 = ctx_r13.$implicit;
    const i_r16 = ctx_r13.index;
    const ctx_r2 = ɵɵnextContext();
    ɵɵproperty("id", ctx_r2.idTarget + "_" + i_r16)("ngClass", ctx_r2.itemClass(item_r15, ctx_r2.idTarget + "_" + i_r16, ctx_r2.selectedItemsTarget))("cdkDragData", item_r15)("cdkDragDisabled", !ctx_r2.dragdrop);
    ɵɵattribute("data-pc-section", "item")("aria-selected", ctx_r2.isSelected(item_r15, ctx_r2.selectedItemsTarget));
    ɵɵadvance();
    ɵɵproperty("ngTemplateOutlet", ctx_r2.itemTemplate)("ngTemplateOutletContext", ɵɵpureFunction2(8, _c7, item_r15, i_r16));
  }
}
function PickList_ng_template_27_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵtemplate(0, PickList_ng_template_27_li_0_Template, 2, 11, "li", 33);
  }
  if (rf & 2) {
    const item_r15 = ctx.$implicit;
    const ctx_r2 = ɵɵnextContext();
    ɵɵproperty("ngIf", ctx_r2.isItemVisible(item_r15, ctx_r2.TARGET_LIST));
  }
}
function PickList_ng_container_28_li_1_ng_container_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainer(0);
  }
}
function PickList_ng_container_28_li_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "li", 36);
    ɵɵtemplate(1, PickList_ng_container_28_li_1_ng_container_1_Template, 1, 0, "ng-container", 21);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = ɵɵnextContext(2);
    ɵɵattribute("data-pc-section", "targetEmptyMessage");
    ɵɵadvance();
    ɵɵproperty("ngTemplateOutlet", ctx_r2.emptyMessageTargetTemplate);
  }
}
function PickList_ng_container_28_li_2_ng_container_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainer(0);
  }
}
function PickList_ng_container_28_li_2_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "li", 36);
    ɵɵtemplate(1, PickList_ng_container_28_li_2_ng_container_1_Template, 1, 0, "ng-container", 21);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r2 = ɵɵnextContext(2);
    ɵɵattribute("data-pc-section", "targetEmptyMessage");
    ɵɵadvance();
    ɵɵproperty("ngTemplateOutlet", ctx_r2.emptyFilterMessageTargetTemplate);
  }
}
function PickList_ng_container_28_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainerStart(0);
    ɵɵtemplate(1, PickList_ng_container_28_li_1_Template, 2, 2, "li", 35)(2, PickList_ng_container_28_li_2_Template, 2, 2, "li", 35);
    ɵɵelementContainerEnd();
  }
  if (rf & 2) {
    const ctx_r2 = ɵɵnextContext();
    ɵɵadvance();
    ɵɵproperty("ngIf", !ctx_r2.filterValueTarget || !ctx_r2.emptyFilterMessageTargetTemplate);
    ɵɵadvance();
    ɵɵproperty("ngIf", ctx_r2.filterValueTarget);
  }
}
function PickList_div_29_AngleUpIcon_2_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "AngleUpIcon");
  }
  if (rf & 2) {
    ɵɵattribute("data-pc-section", "moveupicon");
  }
}
function PickList_div_29_3_ng_template_0_Template(rf, ctx) {
}
function PickList_div_29_3_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵtemplate(0, PickList_div_29_3_ng_template_0_Template, 0, 0, "ng-template");
  }
}
function PickList_div_29_AngleDoubleUpIcon_5_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "AngleDoubleUpIcon");
  }
  if (rf & 2) {
    ɵɵattribute("data-pc-section", "movetopicon");
  }
}
function PickList_div_29_6_ng_template_0_Template(rf, ctx) {
}
function PickList_div_29_6_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵtemplate(0, PickList_div_29_6_ng_template_0_Template, 0, 0, "ng-template");
  }
}
function PickList_div_29_AngleDownIcon_8_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "AngleDownIcon");
  }
  if (rf & 2) {
    ɵɵattribute("data-pc-section", "movedownicon");
  }
}
function PickList_div_29_9_ng_template_0_Template(rf, ctx) {
}
function PickList_div_29_9_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵtemplate(0, PickList_div_29_9_ng_template_0_Template, 0, 0, "ng-template");
  }
}
function PickList_div_29_AngleDoubleDownIcon_11_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "AngleDoubleDownIcon");
  }
  if (rf & 2) {
    ɵɵattribute("data-pc-section", "movebottomicon");
  }
}
function PickList_div_29_12_ng_template_0_Template(rf, ctx) {
}
function PickList_div_29_12_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵtemplate(0, PickList_div_29_12_ng_template_0_Template, 0, 0, "ng-template");
  }
}
function PickList_div_29_Template(rf, ctx) {
  if (rf & 1) {
    const _r17 = ɵɵgetCurrentView();
    ɵɵelementStart(0, "div", 37)(1, "button", 15);
    ɵɵlistener("click", function PickList_div_29_Template_button_click_1_listener() {
      ɵɵrestoreView(_r17);
      const ctx_r2 = ɵɵnextContext();
      const targetlist_r18 = ɵɵreference(26);
      return ɵɵresetView(ctx_r2.moveUp(targetlist_r18, ctx_r2.target, ctx_r2.selectedItemsTarget, ctx_r2.onTargetReorder, ctx_r2.TARGET_LIST));
    });
    ɵɵtemplate(2, PickList_div_29_AngleUpIcon_2_Template, 1, 1, "AngleUpIcon", 13)(3, PickList_div_29_3_Template, 1, 0, null, 21);
    ɵɵelementEnd();
    ɵɵelementStart(4, "button", 15);
    ɵɵlistener("click", function PickList_div_29_Template_button_click_4_listener() {
      ɵɵrestoreView(_r17);
      const ctx_r2 = ɵɵnextContext();
      const targetlist_r18 = ɵɵreference(26);
      return ɵɵresetView(ctx_r2.moveTop(targetlist_r18, ctx_r2.target, ctx_r2.selectedItemsTarget, ctx_r2.onTargetReorder, ctx_r2.TARGET_LIST));
    });
    ɵɵtemplate(5, PickList_div_29_AngleDoubleUpIcon_5_Template, 1, 1, "AngleDoubleUpIcon", 13)(6, PickList_div_29_6_Template, 1, 0, null, 21);
    ɵɵelementEnd();
    ɵɵelementStart(7, "button", 15);
    ɵɵlistener("click", function PickList_div_29_Template_button_click_7_listener() {
      ɵɵrestoreView(_r17);
      const ctx_r2 = ɵɵnextContext();
      const targetlist_r18 = ɵɵreference(26);
      return ɵɵresetView(ctx_r2.moveDown(targetlist_r18, ctx_r2.target, ctx_r2.selectedItemsTarget, ctx_r2.onTargetReorder, ctx_r2.TARGET_LIST));
    });
    ɵɵtemplate(8, PickList_div_29_AngleDownIcon_8_Template, 1, 1, "AngleDownIcon", 13)(9, PickList_div_29_9_Template, 1, 0, null, 21);
    ɵɵelementEnd();
    ɵɵelementStart(10, "button", 15);
    ɵɵlistener("click", function PickList_div_29_Template_button_click_10_listener() {
      ɵɵrestoreView(_r17);
      const ctx_r2 = ɵɵnextContext();
      const targetlist_r18 = ɵɵreference(26);
      return ɵɵresetView(ctx_r2.moveBottom(targetlist_r18, ctx_r2.target, ctx_r2.selectedItemsTarget, ctx_r2.onTargetReorder, ctx_r2.TARGET_LIST));
    });
    ɵɵtemplate(11, PickList_div_29_AngleDoubleDownIcon_11_Template, 1, 1, "AngleDoubleDownIcon", 13)(12, PickList_div_29_12_Template, 1, 0, null, 21);
    ɵɵelementEnd()();
  }
  if (rf & 2) {
    const ctx_r2 = ɵɵnextContext();
    ɵɵattribute("data-pc-section", "targetControls")("data-pc-group-section", "controls");
    ɵɵadvance();
    ɵɵproperty("disabled", ctx_r2.targetMoveDisabled());
    ɵɵattribute("aria-label", ctx_r2.moveUpAriaLabel)("data-pc-section", "targetMoveUpButton");
    ɵɵadvance();
    ɵɵproperty("ngIf", !ctx_r2.moveUpIconTemplate);
    ɵɵadvance();
    ɵɵproperty("ngTemplateOutlet", ctx_r2.moveUpIconTemplate);
    ɵɵadvance();
    ɵɵproperty("disabled", ctx_r2.targetMoveDisabled());
    ɵɵattribute("aria-label", ctx_r2.moveTopAriaLabel)("data-pc-section", "targetMoveTopButton");
    ɵɵadvance();
    ɵɵproperty("ngIf", !ctx_r2.moveTopIconTemplate);
    ɵɵadvance();
    ɵɵproperty("ngTemplateOutlet", ctx_r2.moveTopIconTemplate);
    ɵɵadvance();
    ɵɵproperty("disabled", ctx_r2.targetMoveDisabled());
    ɵɵattribute("aria-label", ctx_r2.moveDownAriaLabel)("data-pc-section", "targetMoveDownButton");
    ɵɵadvance();
    ɵɵproperty("ngIf", !ctx_r2.moveDownIconTemplate);
    ɵɵadvance();
    ɵɵproperty("ngTemplateOutlet", ctx_r2.moveDownIconTemplate);
    ɵɵadvance();
    ɵɵproperty("disabled", ctx_r2.targetMoveDisabled());
    ɵɵattribute("aria-label", ctx_r2.moveBottomAriaLabel)("data-pc-section", "targetMoveBottomButton");
    ɵɵadvance();
    ɵɵproperty("ngIf", !ctx_r2.moveBottomIconTemplate);
    ɵɵadvance();
    ɵɵproperty("ngTemplateOutlet", ctx_r2.moveBottomIconTemplate);
  }
}
var PickList = class _PickList {
  document;
  platformId;
  renderer;
  el;
  cd;
  filterService;
  config;
  /**
   * An array of objects for the source list.
   * @group Props
   */
  source;
  /**
   * An array of objects for the target list.
   * @group Props
   */
  target;
  /**
   * Text for the source list caption
   * @group Props
   */
  sourceHeader;
  /**
   * Index of the element in tabbing order.
   * @group Props
   */
  tabindex = 0;
  /**
   * Defines a string that labels the move to right button for accessibility.
   * @group Props
   */
  rightButtonAriaLabel;
  /**
   * Defines a string that labels the move to left button for accessibility.
   * @group Props
   */
  leftButtonAriaLabel;
  /**
   * Defines a string that labels the move to all right button for accessibility.
   * @group Props
   */
  allRightButtonAriaLabel;
  /**
   * Defines a string that labels the move to all left button for accessibility.
   * @group Props
   */
  allLeftButtonAriaLabel;
  /**
   * Defines a string that labels the move to up button for accessibility.
   * @group Props
   */
  upButtonAriaLabel;
  /**
   * Defines a string that labels the move to down button for accessibility.
   * @group Props
   */
  downButtonAriaLabel;
  /**
   * Defines a string that labels the move to top button for accessibility.
   * @group Props
   */
  topButtonAriaLabel;
  /**
   * Defines a string that labels the move to bottom button for accessibility.
   * @group Props
   */
  bottomButtonAriaLabel;
  /**
   * Text for the target list caption
   * @group Props
   */
  targetHeader;
  /**
   * When enabled orderlist adjusts its controls based on screen size.
   * @group Props
   */
  responsive;
  /**
   * When specified displays an input field to filter the items on keyup and decides which field to search (Accepts multiple fields with a comma).
   * @group Props
   */
  filterBy;
  /**
   * Locale to use in filtering. The default locale is the host environment's current locale.
   * @group Props
   */
  filterLocale;
  /**
   * Function to optimize the dom operations by delegating to ngForTrackBy, default algorithm checks for object identity. Use sourceTrackBy or targetTrackBy in case different algorithms are needed per list.
   * @group Props
   */
  trackBy = (index, item) => item;
  /**
   * Function to optimize the dom operations by delegating to ngForTrackBy in source list, default algorithm checks for object identity.
   * @group Props
   */
  sourceTrackBy;
  /**
   * Function to optimize the dom operations by delegating to ngForTrackBy in target list, default algorithm checks for object identity.
   * @group Props
   */
  targetTrackBy;
  /**
   * Whether to show filter input for source list when filterBy is enabled.
   * @group Props
   */
  showSourceFilter = true;
  /**
   * Whether to show filter input for target list when filterBy is enabled.
   * @group Props
   */
  showTargetFilter = true;
  /**
   * Defines how multiple items can be selected, when true metaKey needs to be pressed to select or unselect an item and when set to false selection of each item can be toggled individually. On touch enabled devices, metaKeySelection is turned off automatically.
   * @group Props
   */
  metaKeySelection = false;
  /**
   * Whether to enable dragdrop based reordering.
   * @group Props
   */
  dragdrop = false;
  /**
   * Inline style of the component.
   * @group Props
   */
  style;
  /**
   * Style class of the component.
   * @group Props
   */
  styleClass;
  /**
   * Inline style of the source list element.
   * @group Props
   */
  sourceStyle;
  /**
   * Inline style of the target list element.
   * @group Props
   */
  targetStyle;
  /**
   * Whether to show buttons of source list.
   * @group Props
   */
  showSourceControls = true;
  /**
   * Whether to show buttons of target list.
   * @group Props
   */
  showTargetControls = true;
  /**
   * Placeholder text on source filter input.
   * @group Props
   */
  sourceFilterPlaceholder;
  /**
   * Placeholder text on target filter input.
   * @group Props
   */
  targetFilterPlaceholder;
  /**
   * When present, it specifies that the component should be disabled.
   * @group Props
   */
  disabled = false;
  /**
   * Defines a string that labels the filter input of source list.
   * @group Props
   */
  ariaSourceFilterLabel;
  /**
   * Defines a string that labels the filter input of target list.
   * @group Props
   */
  ariaTargetFilterLabel;
  /**
   * Defines how the items are filtered.
   * @group Props
   */
  filterMatchMode = "contains";
  /**
   * Whether to displays rows with alternating colors.
   * @group Props
   */
  stripedRows;
  /**
   * Keeps selection on the transfer list.
   * @group Props
   */
  keepSelection = false;
  /**
   * Indicates the width of the screen at which the component should change its behavior.
   * @group Props
   */
  get breakpoint() {
    return this._breakpoint;
  }
  set breakpoint(value) {
    if (value !== this._breakpoint) {
      this._breakpoint = value;
      if (isPlatformBrowser(this.platformId)) {
        this.destroyMedia();
        this.initMedia();
      }
    }
  }
  /**
   * Callback to invoke when items are moved from target to source.
   * @param {PickListMoveToSourceEvent} event - Custom move to source event.
   * @group Emits
   */
  onMoveToSource = new EventEmitter();
  /**
   * Callback to invoke when all items are moved from target to source.
   * @param {PickListMoveAllToSourceEvent} event - Custom move all to source event.
   * @group Emits
   */
  onMoveAllToSource = new EventEmitter();
  /**
   * Callback to invoke when all items are moved from source to target.
   * @param {PickListMoveAllToTargetEvent} event - Custom move all to target event.
   * @group Emits
   */
  onMoveAllToTarget = new EventEmitter();
  /**
   * Callback to invoke when items are moved from source to target.
   * @param {PickListMoveToTargetEvent} event - Custom move to target event.
   * @group Emits
   */
  onMoveToTarget = new EventEmitter();
  /**
   * Callback to invoke when items are reordered within source list.
   * @param {PickListSourceReorderEvent} event - Custom source reorder event.
   * @group Emits
   */
  onSourceReorder = new EventEmitter();
  /**
   * Callback to invoke when items are reordered within target list.
   * @param {PickListTargetReorderEvent} event - Custom target reorder event.
   * @group Emits
   */
  onTargetReorder = new EventEmitter();
  /**
   * Callback to invoke when items are selected within source list.
   * @param {PickListSourceSelectEvent} event - Custom source select event.
   * @group Emits
   */
  onSourceSelect = new EventEmitter();
  /**
   * Callback to invoke when items are selected within target list.
   * @param {PickListTargetSelectEvent} event - Custom target select event.
   * @group Emits
   */
  onTargetSelect = new EventEmitter();
  /**
   * Callback to invoke when the source list is filtered
   * @param {PickListSourceFilterEvent} event - Custom source filter event.
   * @group Emits
   */
  onSourceFilter = new EventEmitter();
  /**
   * Callback to invoke when the target list is filtered
   * @param {PickListTargetFilterEvent} event - Custom target filter event.
   * @group Emits
   */
  onTargetFilter = new EventEmitter();
  /**
   * Callback to invoke when the list is focused
   * @param {Event} event - Browser event.
   * @group Emits
   */
  onFocus = new EventEmitter();
  /**
   * Callback to invoke when the list is blurred
   * @param {Event} event - Browser event.
   * @group Emits
   */
  onBlur = new EventEmitter();
  listViewSourceChild;
  listViewTargetChild;
  sourceFilterViewChild;
  targetFilterViewChild;
  templates;
  get moveUpAriaLabel() {
    return this.upButtonAriaLabel ? this.upButtonAriaLabel : this.config.translation.aria ? this.config.translation.aria.moveUp : void 0;
  }
  get moveTopAriaLabel() {
    return this.topButtonAriaLabel ? this.topButtonAriaLabel : this.config.translation.aria ? this.config.translation.aria.moveTop : void 0;
  }
  get moveDownAriaLabel() {
    return this.downButtonAriaLabel ? this.downButtonAriaLabel : this.config.translation.aria ? this.config.translation.aria.moveDown : void 0;
  }
  get moveBottomAriaLabel() {
    return this.bottomButtonAriaLabel ? this.bottomButtonAriaLabel : this.config.translation.aria ? this.config.translation.aria.moveDown : void 0;
  }
  get moveToTargetAriaLabel() {
    return this.rightButtonAriaLabel ? this.rightButtonAriaLabel : this.config.translation.aria ? this.config.translation.aria.moveToTarget : void 0;
  }
  get moveAllToTargetAriaLabel() {
    return this.allRightButtonAriaLabel ? this.allRightButtonAriaLabel : this.config.translation.aria ? this.config.translation.aria.moveAllToTarget : void 0;
  }
  get moveToSourceAriaLabel() {
    return this.leftButtonAriaLabel ? this.leftButtonAriaLabel : this.config.translation.aria ? this.config.translation.aria.moveToSource : void 0;
  }
  get moveAllToSourceAriaLabel() {
    return this.allLeftButtonAriaLabel ? this.allLeftButtonAriaLabel : this.config.translation.aria ? this.config.translation.aria.moveAllToSource : void 0;
  }
  get idSource() {
    return this.id + "_source";
  }
  get idTarget() {
    return this.id + "_target";
  }
  get focusedOptionId() {
    return this.focusedOptionIndex !== -1 ? this.focusedOptionIndex : null;
  }
  _breakpoint = "960px";
  itemTemplate;
  moveTopIconTemplate;
  moveUpIconTemplate;
  moveDownIconTemplate;
  moveBottomIconTemplate;
  moveToTargetIconTemplate;
  moveAllToTargetIconTemplate;
  moveToSourceIconTemplate;
  moveAllToSourceIconTemplate;
  targetFilterIconTemplate;
  sourceFilterIconTemplate;
  visibleOptionsSource;
  visibleOptionsTarget;
  selectedItemsSource = [];
  selectedItemsTarget = [];
  reorderedListElement;
  movedUp;
  movedDown;
  itemTouched;
  styleElement;
  id = UniqueComponentId();
  filterValueSource;
  filterValueTarget;
  fromListType;
  emptyMessageSourceTemplate;
  emptyFilterMessageSourceTemplate;
  emptyMessageTargetTemplate;
  emptyFilterMessageTargetTemplate;
  sourceHeaderTemplate;
  targetHeaderTemplate;
  sourceFilterTemplate;
  targetFilterTemplate;
  sourceFilterOptions;
  targetFilterOptions;
  SOURCE_LIST = -1;
  TARGET_LIST = 1;
  window;
  media;
  viewChanged;
  focusedOptionIndex = -1;
  focusedOption;
  focused = {
    sourceList: false,
    targetList: false
  };
  mediaChangeListener;
  constructor(document, platformId, renderer, el, cd, filterService, config) {
    this.document = document;
    this.platformId = platformId;
    this.renderer = renderer;
    this.el = el;
    this.cd = cd;
    this.filterService = filterService;
    this.config = config;
    this.window = this.document.defaultView;
  }
  ngOnInit() {
    if (this.responsive) {
      this.createStyle();
      this.initMedia();
    }
    if (this.filterBy) {
      this.sourceFilterOptions = {
        filter: (value) => this.filterSource(value),
        reset: () => this.resetSourceFilter()
      };
      this.targetFilterOptions = {
        filter: (value) => this.filterTarget(value),
        reset: () => this.resetTargetFilter()
      };
    }
  }
  ngAfterContentInit() {
    this.templates.forEach((item) => {
      switch (item.getType()) {
        case "item":
          this.itemTemplate = item.template;
          break;
        case "sourceHeader":
          this.sourceHeaderTemplate = item.template;
          break;
        case "targetHeader":
          this.targetHeaderTemplate = item.template;
          break;
        case "sourceFilter":
          this.sourceFilterTemplate = item.template;
          break;
        case "targetFilter":
          this.targetFilterTemplate = item.template;
          break;
        case "emptymessagesource":
          this.emptyMessageSourceTemplate = item.template;
          break;
        case "emptyfiltermessagesource":
          this.emptyFilterMessageSourceTemplate = item.template;
          break;
        case "emptymessagetarget":
          this.emptyMessageTargetTemplate = item.template;
          break;
        case "emptyfiltermessagetarget":
          this.emptyFilterMessageTargetTemplate = item.template;
          break;
        case "moveupicon":
          this.moveUpIconTemplate = item.template;
          break;
        case "movetopicon":
          this.moveTopIconTemplate = item.template;
          break;
        case "movedownicon":
          this.moveDownIconTemplate = item.template;
          break;
        case "movebottomicon":
          this.moveBottomIconTemplate = item.template;
          break;
        case "movetotargeticon":
          this.moveToTargetIconTemplate = item.template;
          break;
        case "movealltotargeticon":
          this.moveAllToTargetIconTemplate = item.template;
          break;
        case "movetosourceicon":
          this.moveToSourceIconTemplate = item.template;
          break;
        case "movealltosourceicon":
          this.moveAllToSourceIconTemplate = item.template;
          break;
        case "targetfiltericon":
          this.targetFilterIconTemplate = item.template;
          break;
        case "sourcefiltericon":
          this.sourceFilterIconTemplate = item.template;
          break;
        default:
          this.itemTemplate = item.template;
          break;
      }
    });
  }
  ngAfterViewChecked() {
    if (this.movedUp || this.movedDown) {
      let listItems = DomHandler.find(this.reorderedListElement, "li.p-highlight");
      let listItem;
      if (this.movedUp)
        listItem = listItems[0];
      else
        listItem = listItems[listItems.length - 1];
      DomHandler.scrollInView(this.reorderedListElement, listItem);
      this.movedUp = false;
      this.movedDown = false;
      this.reorderedListElement = null;
    }
  }
  onItemClick(event, item, selectedItems, listType, callback, itemId) {
    if (this.disabled) {
      return;
    }
    let index = this.findIndexInList(item, selectedItems);
    if (itemId)
      this.focusedOptionIndex = itemId;
    let selected = index != -1;
    let metaSelection = this.itemTouched ? false : this.metaKeySelection;
    if (metaSelection) {
      let metaKey = event.metaKey || event.ctrlKey || event.shiftKey;
      if (selected && metaKey) {
        selectedItems = selectedItems.filter((_, i) => i !== index);
      } else {
        if (!metaKey) {
          selectedItems = [];
        }
        selectedItems.push(item);
      }
    } else {
      if (selected) {
        selectedItems = selectedItems.filter((_, i) => i !== index);
      } else {
        selectedItems.push(item);
      }
    }
    this.setSelectionList(listType, selectedItems);
    callback.emit({
      originalEvent: event,
      items: selectedItems
    });
    this.itemTouched = false;
  }
  onOptionMouseDown(index, listType) {
    this.focused[listType === this.SOURCE_LIST ? "sourceList" : "targetList"] = true;
    this.focusedOptionIndex = index;
  }
  onSourceItemDblClick() {
    if (this.disabled) {
      return;
    }
    this.moveRight();
  }
  onTargetItemDblClick() {
    if (this.disabled) {
      return;
    }
    this.moveLeft();
  }
  onFilter(event, listType) {
    let query = event.target.value;
    if (listType === this.SOURCE_LIST)
      this.filterSource(query);
    else if (listType === this.TARGET_LIST)
      this.filterTarget(query);
  }
  filterSource(value = "") {
    this.filterValueSource = value.trim().toLocaleLowerCase(this.filterLocale);
    this.filter(this.source, this.SOURCE_LIST);
  }
  filterTarget(value = "") {
    this.filterValueTarget = value.trim().toLocaleLowerCase(this.filterLocale);
    this.filter(this.target, this.TARGET_LIST);
  }
  filter(data, listType) {
    let searchFields = this.filterBy.split(",");
    if (listType === this.SOURCE_LIST) {
      this.visibleOptionsSource = this.filterService.filter(data, searchFields, this.filterValueSource, this.filterMatchMode, this.filterLocale);
      this.onSourceFilter.emit({
        query: this.filterValueSource,
        value: this.visibleOptionsSource
      });
    } else if (listType === this.TARGET_LIST) {
      this.visibleOptionsTarget = this.filterService.filter(data, searchFields, this.filterValueTarget, this.filterMatchMode, this.filterLocale);
      this.onTargetFilter.emit({
        query: this.filterValueTarget,
        value: this.visibleOptionsTarget
      });
    }
  }
  isItemVisible(item, listType) {
    if (listType == this.SOURCE_LIST)
      return this.isVisibleInList(this.visibleOptionsSource, item, this.filterValueSource);
    else
      return this.isVisibleInList(this.visibleOptionsTarget, item, this.filterValueTarget);
  }
  isEmpty(listType) {
    if (listType == this.SOURCE_LIST)
      return this.filterValueSource ? !this.visibleOptionsSource || this.visibleOptionsSource.length === 0 : !this.source || this.source.length === 0;
    else
      return this.filterValueTarget ? !this.visibleOptionsTarget || this.visibleOptionsTarget.length === 0 : !this.target || this.target.length === 0;
  }
  isVisibleInList(data, item, filterValue) {
    if (filterValue && filterValue.trim().length) {
      for (let i = 0; i < data.length; i++) {
        if (item == data[i]) {
          return true;
        }
      }
    } else {
      return true;
    }
  }
  onItemTouchEnd() {
    if (this.disabled) {
      return;
    }
    this.itemTouched = true;
  }
  sortByIndexInList(items, list) {
    return items.sort((item1, item2) => ObjectUtils.findIndexInList(item1, list) - ObjectUtils.findIndexInList(item2, list));
  }
  moveUp(listElement, list, selectedItems, callback, listType) {
    if (selectedItems && selectedItems.length) {
      selectedItems = this.sortByIndexInList(selectedItems, list);
      for (let i = 0; i < selectedItems.length; i++) {
        let selectedItem = selectedItems[i];
        let selectedItemIndex = ObjectUtils.findIndexInList(selectedItem, list);
        if (selectedItemIndex != 0) {
          let movedItem = list[selectedItemIndex];
          let temp = list[selectedItemIndex - 1];
          list[selectedItemIndex - 1] = movedItem;
          list[selectedItemIndex] = temp;
        } else {
          break;
        }
      }
      if (this.dragdrop && (this.filterValueSource && listType === this.SOURCE_LIST || this.filterValueTarget && listType === this.TARGET_LIST))
        this.filter(list, listType);
      this.movedUp = true;
      this.reorderedListElement = listElement;
      callback.emit({
        items: selectedItems
      });
    }
  }
  moveTop(listElement, list, selectedItems, callback, listType) {
    if (selectedItems && selectedItems.length) {
      selectedItems = this.sortByIndexInList(selectedItems, list);
      for (let i = 0; i < selectedItems.length; i++) {
        let selectedItem = selectedItems[i];
        let selectedItemIndex = ObjectUtils.findIndexInList(selectedItem, list);
        if (selectedItemIndex != 0) {
          let movedItem = list.splice(selectedItemIndex, 1)[0];
          list.unshift(movedItem);
        } else {
          break;
        }
      }
      if (this.dragdrop && (this.filterValueSource && listType === this.SOURCE_LIST || this.filterValueTarget && listType === this.TARGET_LIST))
        this.filter(list, listType);
      listElement.scrollTop = 0;
      callback.emit({
        items: selectedItems
      });
    }
  }
  moveDown(listElement, list, selectedItems, callback, listType) {
    if (selectedItems && selectedItems.length) {
      selectedItems = this.sortByIndexInList(selectedItems, list);
      for (let i = selectedItems.length - 1; i >= 0; i--) {
        let selectedItem = selectedItems[i];
        let selectedItemIndex = ObjectUtils.findIndexInList(selectedItem, list);
        if (selectedItemIndex != list.length - 1) {
          let movedItem = list[selectedItemIndex];
          let temp = list[selectedItemIndex + 1];
          list[selectedItemIndex + 1] = movedItem;
          list[selectedItemIndex] = temp;
        } else {
          break;
        }
      }
      if (this.dragdrop && (this.filterValueSource && listType === this.SOURCE_LIST || this.filterValueTarget && listType === this.TARGET_LIST))
        this.filter(list, listType);
      this.movedDown = true;
      this.reorderedListElement = listElement;
      callback.emit({
        items: selectedItems
      });
    }
  }
  moveBottom(listElement, list, selectedItems, callback, listType) {
    if (selectedItems && selectedItems.length) {
      selectedItems = this.sortByIndexInList(selectedItems, list);
      for (let i = selectedItems.length - 1; i >= 0; i--) {
        let selectedItem = selectedItems[i];
        let selectedItemIndex = ObjectUtils.findIndexInList(selectedItem, list);
        if (selectedItemIndex != list.length - 1) {
          let movedItem = list.splice(selectedItemIndex, 1)[0];
          list.push(movedItem);
        } else {
          break;
        }
      }
      if (this.dragdrop && (this.filterValueSource && listType === this.SOURCE_LIST || this.filterValueTarget && listType === this.TARGET_LIST))
        this.filter(list, listType);
      listElement.scrollTop = listElement.scrollHeight;
      callback.emit({
        items: selectedItems
      });
    }
  }
  moveRight() {
    if (this.selectedItemsSource && this.selectedItemsSource.length) {
      for (let i = 0; i < this.selectedItemsSource.length; i++) {
        let selectedItem = this.selectedItemsSource[i];
        if (ObjectUtils.findIndexInList(selectedItem, this.target) == -1) {
          this.target?.push(this.source?.splice(ObjectUtils.findIndexInList(selectedItem, this.source), 1)[0]);
          if (this.visibleOptionsSource?.includes(selectedItem)) {
            this.visibleOptionsSource.splice(ObjectUtils.findIndexInList(selectedItem, this.visibleOptionsSource), 1);
          }
        }
      }
      this.onMoveToTarget.emit({
        items: this.selectedItemsSource
      });
      if (this.keepSelection) {
        this.selectedItemsTarget = [...this.selectedItemsTarget, ...this.selectedItemsSource];
      }
      this.selectedItemsSource = [];
      if (this.filterValueTarget) {
        this.filter(this.target, this.TARGET_LIST);
      }
    }
  }
  moveAllRight() {
    if (this.source) {
      let movedItems = [];
      for (let i = 0; i < this.source.length; i++) {
        if (this.isItemVisible(this.source[i], this.SOURCE_LIST)) {
          let removedItem = this.source.splice(i, 1)[0];
          this.target?.push(removedItem);
          movedItems.push(removedItem);
          i--;
        }
      }
      this.onMoveAllToTarget.emit({
        items: movedItems
      });
      if (this.keepSelection) {
        this.selectedItemsTarget = [...this.selectedItemsTarget, ...this.selectedItemsSource];
      }
      this.selectedItemsSource = [];
      if (this.filterValueTarget) {
        this.filter(this.target, this.TARGET_LIST);
      }
      this.visibleOptionsSource = [];
    }
  }
  moveLeft() {
    if (this.selectedItemsTarget && this.selectedItemsTarget.length) {
      for (let i = 0; i < this.selectedItemsTarget.length; i++) {
        let selectedItem = this.selectedItemsTarget[i];
        if (ObjectUtils.findIndexInList(selectedItem, this.source) == -1) {
          this.source?.push(this.target?.splice(ObjectUtils.findIndexInList(selectedItem, this.target), 1)[0]);
          if (this.visibleOptionsTarget?.includes(selectedItem)) {
            this.visibleOptionsTarget.splice(ObjectUtils.findIndexInList(selectedItem, this.visibleOptionsTarget), 1)[0];
          }
        }
      }
      this.onMoveToSource.emit({
        items: this.selectedItemsTarget
      });
      if (this.keepSelection) {
        this.selectedItemsSource = [...this.selectedItemsSource, ...this.selectedItemsTarget];
      }
      this.selectedItemsTarget = [];
      if (this.filterValueSource) {
        this.filter(this.source, this.SOURCE_LIST);
      }
    }
  }
  moveAllLeft() {
    if (this.target) {
      let movedItems = [];
      for (let i = 0; i < this.target.length; i++) {
        if (this.isItemVisible(this.target[i], this.TARGET_LIST)) {
          let removedItem = this.target.splice(i, 1)[0];
          this.source?.push(removedItem);
          movedItems.push(removedItem);
          i--;
        }
      }
      this.onMoveAllToSource.emit({
        items: movedItems
      });
      if (this.keepSelection) {
        this.selectedItemsSource = [...this.selectedItemsSource, ...this.selectedItemsTarget];
      }
      this.selectedItemsTarget = [];
      if (this.filterValueSource) {
        this.filter(this.source, this.SOURCE_LIST);
      }
      this.visibleOptionsTarget = [];
    }
  }
  isSelected(item, selectedItems) {
    return this.findIndexInList(item, selectedItems) != -1;
  }
  itemClass(item, id, selectedItems) {
    return {
      "p-picklist-item": true,
      "p-highlight": this.isSelected(item, selectedItems),
      "p-focus": id === this.focusedOptionId,
      "p-disabled": this.disabled
    };
  }
  findIndexInList(item, selectedItems) {
    return ObjectUtils.findIndexInList(item, selectedItems);
  }
  onDrop(event, listType) {
    let isTransfer = event.previousContainer !== event.container;
    let dropIndexes = this.getDropIndexes(event.previousIndex, event.currentIndex, listType, isTransfer, event.item.data);
    if (listType === this.SOURCE_LIST) {
      if (isTransfer) {
        transferArrayItem(event.previousContainer.data, event.container.data, dropIndexes.previousIndex, dropIndexes.currentIndex);
        let selectedItemIndex = ObjectUtils.findIndexInList(event.item.data, this.selectedItemsTarget);
        if (selectedItemIndex != -1) {
          this.selectedItemsTarget.splice(selectedItemIndex, 1);
          if (this.keepSelection) {
            this.selectedItemsTarget.push(event.item.data);
          }
        }
        if (this.visibleOptionsTarget)
          this.visibleOptionsTarget.splice(event.previousIndex, 1);
        this.onMoveToSource.emit({
          items: [event.item.data]
        });
      } else {
        moveItemInArray(event.container.data, dropIndexes.previousIndex, dropIndexes.currentIndex);
        this.onSourceReorder.emit({
          items: [event.item.data]
        });
      }
      if (this.filterValueSource) {
        this.filter(this.source, this.SOURCE_LIST);
      }
    } else {
      if (isTransfer) {
        transferArrayItem(event.previousContainer.data, event.container.data, dropIndexes.previousIndex, dropIndexes.currentIndex);
        let selectedItemIndex = ObjectUtils.findIndexInList(event.item.data, this.selectedItemsSource);
        if (selectedItemIndex != -1) {
          this.selectedItemsSource.splice(selectedItemIndex, 1);
          if (this.keepSelection) {
            this.selectedItemsTarget.push(event.item.data);
          }
        }
        if (this.visibleOptionsSource)
          this.visibleOptionsSource.splice(event.previousIndex, 1);
        this.onMoveToTarget.emit({
          items: [event.item.data]
        });
      } else {
        moveItemInArray(event.container.data, dropIndexes.previousIndex, dropIndexes.currentIndex);
        this.onTargetReorder.emit({
          items: [event.item.data]
        });
      }
      if (this.filterValueTarget) {
        this.filter(this.target, this.TARGET_LIST);
      }
    }
  }
  onListFocus(event, listType) {
    let listElement = this.getListElement(listType);
    const selectedFirstItem = DomHandler.findSingle(listElement, "li.p-picklist-item.p-highlight") || DomHandler.findSingle(listElement, "li.p-picklist-item");
    const findIndex = ObjectUtils.findIndexInList(selectedFirstItem, listElement.children);
    this.focused[listType === this.SOURCE_LIST ? "sourceList" : "targetList"] = true;
    const sourceIndex = this.focusedOptionIndex !== -1 ? this.focusedOptionIndex : selectedFirstItem ? findIndex : -1;
    const filteredIndex = this.findIndexInList(this.source[sourceIndex], this.visibleOptionsSource);
    this.changeFocusedOptionIndex(filteredIndex, listType);
    this.onFocus.emit(event);
  }
  onListBlur(event, listType) {
    this.focused[listType === this.SOURCE_LIST ? "sourceList" : "targetList"] = false;
    this.focusedOptionIndex = -1;
    this.focusedOption = null;
    this.onBlur.emit(event);
  }
  getListElement(listType) {
    return listType === this.SOURCE_LIST ? this.listViewSourceChild?.nativeElement : this.listViewTargetChild?.nativeElement;
  }
  getListItems(listType) {
    let listElemet = this.getListElement(listType);
    return DomHandler.find(listElemet, "li.p-picklist-item");
  }
  getLatestSelectedVisibleOptionIndex(visibleList, selectedItems) {
    const latestSelectedItem = [...selectedItems].reverse().find((item) => visibleList.includes(item));
    return latestSelectedItem !== void 0 ? visibleList.indexOf(latestSelectedItem) : -1;
  }
  getVisibleList(listType) {
    if (listType === this.SOURCE_LIST) {
      return this.visibleOptionsSource && this.visibleOptionsSource.length > 0 ? this.visibleOptionsSource : this.source && this.source.length > 0 ? this.source : null;
    }
    return this.visibleOptionsTarget && this.visibleOptionsTarget.length > 0 ? this.visibleOptionsTarget : this.target && this.target.length > 0 ? this.target : null;
  }
  setSelectionList(listType, selectedItems) {
    if (listType === this.SOURCE_LIST) {
      this.selectedItemsSource = selectedItems;
    } else {
      this.selectedItemsTarget = selectedItems;
    }
  }
  findNextOptionIndex(index, listType) {
    const items = this.getListItems(listType);
    const matchedOptionIndex = [...items].findIndex((link) => link.id === index);
    return matchedOptionIndex > -1 ? matchedOptionIndex + 1 : 0;
  }
  findPrevOptionIndex(index, listType) {
    const items = this.getListItems(listType);
    const matchedOptionIndex = [...items].findIndex((link) => link.id === index);
    return matchedOptionIndex > -1 ? matchedOptionIndex - 1 : 0;
  }
  onItemKeyDown(event, selectedItems, callback, listType) {
    switch (event.code) {
      case "ArrowDown":
        this.onArrowDownKey(event, selectedItems, callback, listType);
        break;
      case "ArrowUp":
        this.onArrowUpKey(event, selectedItems, callback, listType);
        break;
      case "Home":
        this.onHomeKey(event, selectedItems, callback, listType);
        break;
      case "End":
        this.onEndKey(event, selectedItems, callback, listType);
        break;
      case "Enter":
        this.onEnterKey(event, selectedItems, callback, listType);
        break;
      case "Space":
        this.onSpaceKey(event, selectedItems, callback, listType);
        break;
      case "KeyA":
        if (event.ctrlKey) {
          this.setSelectionList(listType, this.getVisibleList(listType));
          callback.emit({
            items: selectedItems
          });
          event.preventDefault();
        }
      default:
        break;
    }
  }
  getFocusedOption(index, listType) {
    if (index === -1)
      return null;
    if (listType === this.SOURCE_LIST) {
      return this.visibleOptionsSource && this.visibleOptionsSource.length ? this.visibleOptionsSource[index] : this.source && this.source.length ? this.source[index] : null;
    }
    return this.visibleOptionsTarget && this.visibleOptionsTarget.length ? this.visibleOptionsTarget[index] : this.target && this.target.length ? this.target[index] : null;
  }
  changeFocusedOptionIndex(index, listType) {
    const items = this.getListItems(listType);
    if (items?.length > 0) {
      let order = index >= items.length ? items.length - 1 : index < 0 ? 0 : index;
      this.focusedOptionIndex = items[order].getAttribute("id");
      this.focusedOption = this.getFocusedOption(order, listType);
      this.scrollInView(items[order].getAttribute("id"), listType);
    }
  }
  scrollInView(id, listType) {
    const element = DomHandler.findSingle(this.getListElement(listType), `li[id="${id}"]`);
    if (element) {
      element.scrollIntoView && element.scrollIntoView({
        block: "nearest",
        inline: "start"
      });
    }
  }
  onArrowDownKey(event, selectedItems, callback, listType) {
    const optionIndex = this.findNextOptionIndex(this.focusedOptionIndex, listType);
    this.changeFocusedOptionIndex(optionIndex, listType);
    if (event.shiftKey) {
      this.onEnterKey(event, selectedItems, callback, listType);
    }
    event.preventDefault();
  }
  onArrowUpKey(event, selectedItems, callback, listType) {
    const optionIndex = this.findPrevOptionIndex(this.focusedOptionIndex, listType);
    this.changeFocusedOptionIndex(optionIndex, listType);
    if (event.shiftKey) {
      this.onEnterKey(event, selectedItems, callback, listType);
    }
    event.preventDefault();
  }
  onEnterKey(event, selectedItems, callback, listType) {
    this.onItemClick(event, this.focusedOption, selectedItems, listType, callback);
    event.preventDefault();
  }
  onSpaceKey(event, selectedItems, callback, listType) {
    event.preventDefault();
    if (event.shiftKey && selectedItems && selectedItems.length > 0) {
      let visibleList = this.getVisibleList(listType);
      let lastSelectedIndex = this.getLatestSelectedVisibleOptionIndex(visibleList, selectedItems);
      if (lastSelectedIndex !== -1) {
        let focusedIndex = ObjectUtils.findIndexInList(this.focusedOption, visibleList);
        selectedItems = [...visibleList.slice(Math.min(lastSelectedIndex, focusedIndex), Math.max(lastSelectedIndex, focusedIndex) + 1)];
        this.setSelectionList(listType, selectedItems);
        callback.emit({
          items: selectedItems
        });
        return;
      }
    }
    this.onEnterKey(event, selectedItems, callback, listType);
  }
  onHomeKey(event, selectedItems, callback, listType) {
    if (event.ctrlKey && event.shiftKey) {
      let visibleList = this.getVisibleList(listType);
      let focusedIndex = ObjectUtils.findIndexInList(this.focusedOption, visibleList);
      selectedItems = [...visibleList.slice(0, focusedIndex + 1)];
      this.setSelectionList(listType, selectedItems);
      callback.emit({
        items: selectedItems
      });
    } else {
      this.changeFocusedOptionIndex(0, listType);
    }
    event.preventDefault();
  }
  onEndKey(event, selectedItems, callback, listType) {
    let visibleList = this.getVisibleList(listType);
    let lastIndex = visibleList && visibleList.length > 0 ? visibleList.length - 1 : null;
    if (lastIndex === null)
      return;
    if (event.ctrlKey && event.shiftKey) {
      let focusedIndex = ObjectUtils.findIndexInList(this.focusedOption, visibleList);
      selectedItems = [...visibleList.slice(focusedIndex, lastIndex)];
      this.setSelectionList(listType, selectedItems);
      callback.emit({
        items: selectedItems
      });
    } else {
      this.changeFocusedOptionIndex(lastIndex, listType);
    }
    event.preventDefault();
  }
  getDropIndexes(fromIndex, toIndex, droppedList, isTransfer, data) {
    let previousIndex, currentIndex;
    if (droppedList === this.SOURCE_LIST) {
      previousIndex = isTransfer ? this.filterValueTarget ? ObjectUtils.findIndexInList(data, this.target) : fromIndex : this.filterValueSource ? ObjectUtils.findIndexInList(data, this.source) : fromIndex;
      currentIndex = this.filterValueSource ? this.findFilteredCurrentIndex(this.visibleOptionsSource, toIndex, this.source) : toIndex;
    } else {
      previousIndex = isTransfer ? this.filterValueSource ? ObjectUtils.findIndexInList(data, this.source) : fromIndex : this.filterValueTarget ? ObjectUtils.findIndexInList(data, this.target) : fromIndex;
      currentIndex = this.filterValueTarget ? this.findFilteredCurrentIndex(this.visibleOptionsTarget, toIndex, this.target) : toIndex;
    }
    return {
      previousIndex,
      currentIndex
    };
  }
  findFilteredCurrentIndex(visibleOptions, index, options) {
    if (visibleOptions.length === index) {
      let toIndex = ObjectUtils.findIndexInList(visibleOptions[index - 1], options);
      return toIndex + 1;
    } else {
      return ObjectUtils.findIndexInList(visibleOptions[index], options);
    }
  }
  resetSourceFilter() {
    this.visibleOptionsSource = null;
    this.filterValueSource = null;
    this.sourceFilterViewChild && (this.sourceFilterViewChild.nativeElement.value = "");
  }
  resetTargetFilter() {
    this.visibleOptionsTarget = null;
    this.filterValueTarget = null;
    this.targetFilterViewChild && (this.targetFilterViewChild.nativeElement.value = "");
  }
  resetFilter() {
    this.resetSourceFilter();
    this.resetTargetFilter();
  }
  findNextItem(item) {
    let nextItem = item.nextElementSibling;
    if (nextItem)
      return !DomHandler.hasClass(nextItem, "p-picklist-item") || DomHandler.isHidden(nextItem) ? this.findNextItem(nextItem) : nextItem;
    else
      return null;
  }
  findPrevItem(item) {
    let prevItem = item.previousElementSibling;
    if (prevItem)
      return !DomHandler.hasClass(prevItem, "p-picklist-item") || DomHandler.isHidden(prevItem) ? this.findPrevItem(prevItem) : prevItem;
    else
      return null;
  }
  initMedia() {
    if (isPlatformBrowser(this.platformId)) {
      this.media = this.window.matchMedia(`(max-width: ${this.breakpoint})`);
      this.viewChanged = this.media.matches;
      this.bindMediaChangeListener();
    }
  }
  destroyMedia() {
    this.unbindMediaChangeListener();
  }
  bindMediaChangeListener() {
    if (this.media && !this.mediaChangeListener) {
      this.mediaChangeListener = this.renderer.listen(this.media, "change", (event) => {
        this.viewChanged = event.matches;
        this.cd.markForCheck();
      });
    }
  }
  unbindMediaChangeListener() {
    if (this.mediaChangeListener) {
      this.mediaChangeListener();
      this.mediaChangeListener = null;
    }
  }
  createStyle() {
    if (isPlatformBrowser(this.platformId)) {
      if (!this.styleElement) {
        this.renderer.setAttribute(this.el.nativeElement.children[0], this.id, "");
        this.styleElement = this.renderer.createElement("style");
        this.renderer.setAttribute(this.styleElement, "type", "text/css");
        this.renderer.appendChild(this.document.head, this.styleElement);
        let innerHTML = `
                @media screen and (max-width: ${this.breakpoint}) {
                    .p-picklist[${this.id}] {
                        flex-direction: column;
                    }

                    .p-picklist[${this.id}] .p-picklist-buttons {
                        padding: var(--content-padding);
                        flex-direction: row;
                    }

                    .p-picklist[${this.id}] .p-picklist-buttons .p-button {
                        margin-right: var(--inline-spacing);
                        margin-bottom: 0;
                    }

                    .p-picklist[${this.id}] .p-picklist-buttons .p-button:last-child {
                        margin-right: 0;
                    }
                }`;
        this.renderer.setProperty(this.styleElement, "innerHTML", innerHTML);
        DomHandler.setAttribute(this.styleElement, "nonce", this.config?.csp()?.nonce);
      }
    }
  }
  sourceMoveDisabled() {
    if (this.disabled || !this.selectedItemsSource.length) {
      return true;
    }
  }
  targetMoveDisabled() {
    if (this.disabled || !this.selectedItemsTarget.length) {
      return true;
    }
  }
  moveRightDisabled() {
    return this.disabled || ObjectUtils.isEmpty(this.selectedItemsSource);
  }
  moveLeftDisabled() {
    return this.disabled || ObjectUtils.isEmpty(this.selectedItemsTarget);
  }
  moveAllRightDisabled() {
    return this.disabled || ObjectUtils.isEmpty(this.source);
  }
  moveAllLeftDisabled() {
    return this.disabled || ObjectUtils.isEmpty(this.target);
  }
  destroyStyle() {
    if (this.styleElement) {
      this.renderer.removeChild(this.document.head, this.styleElement);
      this.styleElement = null;
      ``;
    }
  }
  ngOnDestroy() {
    this.destroyStyle();
    this.destroyMedia();
  }
  static ɵfac = function PickList_Factory(t) {
    return new (t || _PickList)(ɵɵdirectiveInject(DOCUMENT), ɵɵdirectiveInject(PLATFORM_ID), ɵɵdirectiveInject(Renderer2), ɵɵdirectiveInject(ElementRef), ɵɵdirectiveInject(ChangeDetectorRef), ɵɵdirectiveInject(FilterService), ɵɵdirectiveInject(PrimeNGConfig));
  };
  static ɵcmp = ɵɵdefineComponent({
    type: _PickList,
    selectors: [["p-pickList"]],
    contentQueries: function PickList_ContentQueries(rf, ctx, dirIndex) {
      if (rf & 1) {
        ɵɵcontentQuery(dirIndex, PrimeTemplate, 4);
      }
      if (rf & 2) {
        let _t;
        ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.templates = _t);
      }
    },
    viewQuery: function PickList_Query(rf, ctx) {
      if (rf & 1) {
        ɵɵviewQuery(_c0, 5);
        ɵɵviewQuery(_c1, 5);
        ɵɵviewQuery(_c2, 5);
        ɵɵviewQuery(_c3, 5);
      }
      if (rf & 2) {
        let _t;
        ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.listViewSourceChild = _t.first);
        ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.listViewTargetChild = _t.first);
        ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.sourceFilterViewChild = _t.first);
        ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.targetFilterViewChild = _t.first);
      }
    },
    hostAttrs: [1, "p-element"],
    inputs: {
      source: "source",
      target: "target",
      sourceHeader: "sourceHeader",
      tabindex: [2, "tabindex", "tabindex", numberAttribute],
      rightButtonAriaLabel: "rightButtonAriaLabel",
      leftButtonAriaLabel: "leftButtonAriaLabel",
      allRightButtonAriaLabel: "allRightButtonAriaLabel",
      allLeftButtonAriaLabel: "allLeftButtonAriaLabel",
      upButtonAriaLabel: "upButtonAriaLabel",
      downButtonAriaLabel: "downButtonAriaLabel",
      topButtonAriaLabel: "topButtonAriaLabel",
      bottomButtonAriaLabel: "bottomButtonAriaLabel",
      targetHeader: "targetHeader",
      responsive: [2, "responsive", "responsive", booleanAttribute],
      filterBy: "filterBy",
      filterLocale: "filterLocale",
      trackBy: "trackBy",
      sourceTrackBy: "sourceTrackBy",
      targetTrackBy: "targetTrackBy",
      showSourceFilter: [2, "showSourceFilter", "showSourceFilter", booleanAttribute],
      showTargetFilter: [2, "showTargetFilter", "showTargetFilter", booleanAttribute],
      metaKeySelection: [2, "metaKeySelection", "metaKeySelection", booleanAttribute],
      dragdrop: [2, "dragdrop", "dragdrop", booleanAttribute],
      style: "style",
      styleClass: "styleClass",
      sourceStyle: "sourceStyle",
      targetStyle: "targetStyle",
      showSourceControls: [2, "showSourceControls", "showSourceControls", booleanAttribute],
      showTargetControls: [2, "showTargetControls", "showTargetControls", booleanAttribute],
      sourceFilterPlaceholder: "sourceFilterPlaceholder",
      targetFilterPlaceholder: "targetFilterPlaceholder",
      disabled: [2, "disabled", "disabled", booleanAttribute],
      ariaSourceFilterLabel: "ariaSourceFilterLabel",
      ariaTargetFilterLabel: "ariaTargetFilterLabel",
      filterMatchMode: "filterMatchMode",
      stripedRows: [2, "stripedRows", "stripedRows", booleanAttribute],
      keepSelection: [2, "keepSelection", "keepSelection", booleanAttribute],
      breakpoint: "breakpoint"
    },
    outputs: {
      onMoveToSource: "onMoveToSource",
      onMoveAllToSource: "onMoveAllToSource",
      onMoveAllToTarget: "onMoveAllToTarget",
      onMoveToTarget: "onMoveToTarget",
      onSourceReorder: "onSourceReorder",
      onTargetReorder: "onTargetReorder",
      onSourceSelect: "onSourceSelect",
      onTargetSelect: "onTargetSelect",
      onSourceFilter: "onSourceFilter",
      onTargetFilter: "onTargetFilter",
      onFocus: "onFocus",
      onBlur: "onBlur"
    },
    features: [ɵɵInputTransformsFeature],
    decls: 30,
    vars: 74,
    consts: [["sourcelist", ""], ["targetlist", ""], ["builtInSourceElement", ""], ["sourceFilter", ""], ["builtInTargetElement", ""], ["targetFilter", ""], ["cdkDropListGroup", "", 3, "ngStyle", "ngClass"], ["class", "p-picklist-buttons p-picklist-source-controls", 4, "ngIf"], [1, "p-picklist-list-wrapper", "p-picklist-source-wrapper"], ["class", "p-picklist-header", 3, "id", 4, "ngIf"], ["class", "p-picklist-filter-container", 4, "ngIf"], ["cdkDropList", "", "role", "listbox", "aria-multiselectable", "true", 1, "p-picklist-list", "p-picklist-source", 3, "keydown", "focus", "blur", "cdkDropListDropped", "id", "cdkDropListData", "ngStyle"], ["ngFor", "", 3, "ngForOf", "ngForTrackBy"], [4, "ngIf"], [1, "p-picklist-buttons", "p-picklist-transfer-buttons"], ["type", "button", "pButton", "", "pRipple", "", 1, "p-button-icon-only", 3, "click", "disabled"], [4, "ngTemplateOutlet", "ngTemplateOutletContext"], [1, "p-picklist-list-wrapper", "p-picklist-target-wrapper"], ["cdkDropList", "", "role", "listbox", "aria-multiselectable", "true", 1, "p-picklist-list", "p-picklist-target", 3, "keydown", "focus", "blur", "cdkDropListDropped", "id", "cdkDropListData", "ngStyle"], ["class", "p-picklist-buttons p-picklist-target-controls", 4, "ngIf"], [1, "p-picklist-buttons", "p-picklist-source-controls"], [4, "ngTemplateOutlet"], [1, "p-picklist-header", 3, "id"], ["class", "p-picklist-title", 4, "ngIf"], [1, "p-picklist-title"], [1, "p-picklist-filter-container"], [4, "ngIf", "ngIfElse"], [1, "p-picklist-filter"], ["type", "text", "role", "textbox", 1, "p-picklist-filter-input", "p-inputtext", "p-component", 3, "keyup", "disabled"], [3, "styleClass", 4, "ngIf"], ["class", "p-picklist-filter-icon", 4, "ngIf"], [3, "styleClass"], [1, "p-picklist-filter-icon"], ["pRipple", "", "cdkDrag", "", "role", "option", 3, "id", "ngClass", "cdkDragData", "cdkDragDisabled", "click", "mousedown", "dblclick", "touchend", 4, "ngIf"], ["pRipple", "", "cdkDrag", "", "role", "option", 3, "click", "mousedown", "dblclick", "touchend", "id", "ngClass", "cdkDragData", "cdkDragDisabled"], ["class", "p-picklist-empty-message", 4, "ngIf"], [1, "p-picklist-empty-message"], [1, "p-picklist-buttons", "p-picklist-target-controls"]],
    template: function PickList_Template(rf, ctx) {
      if (rf & 1) {
        const _r1 = ɵɵgetCurrentView();
        ɵɵelementStart(0, "div", 6);
        ɵɵtemplate(1, PickList_div_1_Template, 13, 22, "div", 7);
        ɵɵelementStart(2, "div", 8);
        ɵɵtemplate(3, PickList_div_3_Template, 3, 5, "div", 9)(4, PickList_div_4_Template, 4, 3, "div", 10);
        ɵɵelementStart(5, "ul", 11, 0);
        ɵɵlistener("keydown", function PickList_Template_ul_keydown_5_listener($event) {
          ɵɵrestoreView(_r1);
          return ɵɵresetView(ctx.onItemKeyDown($event, ctx.selectedItemsSource, ctx.onSourceSelect, ctx.SOURCE_LIST));
        })("focus", function PickList_Template_ul_focus_5_listener($event) {
          ɵɵrestoreView(_r1);
          return ɵɵresetView(ctx.onListFocus($event, ctx.SOURCE_LIST));
        })("blur", function PickList_Template_ul_blur_5_listener($event) {
          ɵɵrestoreView(_r1);
          return ɵɵresetView(ctx.onListBlur($event, ctx.SOURCE_LIST));
        })("cdkDropListDropped", function PickList_Template_ul_cdkDropListDropped_5_listener($event) {
          ɵɵrestoreView(_r1);
          return ɵɵresetView(ctx.onDrop($event, ctx.SOURCE_LIST));
        });
        ɵɵtemplate(7, PickList_ng_template_7_Template, 1, 1, "ng-template", 12)(8, PickList_ng_container_8_Template, 3, 2, "ng-container", 13);
        ɵɵelementEnd()();
        ɵɵelementStart(9, "div", 14)(10, "button", 15);
        ɵɵlistener("click", function PickList_Template_button_click_10_listener() {
          ɵɵrestoreView(_r1);
          return ɵɵresetView(ctx.moveRight());
        });
        ɵɵtemplate(11, PickList_ng_container_11_Template, 3, 2, "ng-container", 13)(12, PickList_12_Template, 1, 0, null, 16);
        ɵɵelementEnd();
        ɵɵelementStart(13, "button", 15);
        ɵɵlistener("click", function PickList_Template_button_click_13_listener() {
          ɵɵrestoreView(_r1);
          return ɵɵresetView(ctx.moveAllRight());
        });
        ɵɵtemplate(14, PickList_ng_container_14_Template, 3, 2, "ng-container", 13)(15, PickList_15_Template, 1, 0, null, 16);
        ɵɵelementEnd();
        ɵɵelementStart(16, "button", 15);
        ɵɵlistener("click", function PickList_Template_button_click_16_listener() {
          ɵɵrestoreView(_r1);
          return ɵɵresetView(ctx.moveLeft());
        });
        ɵɵtemplate(17, PickList_ng_container_17_Template, 3, 2, "ng-container", 13)(18, PickList_18_Template, 1, 0, null, 16);
        ɵɵelementEnd();
        ɵɵelementStart(19, "button", 15);
        ɵɵlistener("click", function PickList_Template_button_click_19_listener() {
          ɵɵrestoreView(_r1);
          return ɵɵresetView(ctx.moveAllLeft());
        });
        ɵɵtemplate(20, PickList_ng_container_20_Template, 3, 2, "ng-container", 13)(21, PickList_21_Template, 1, 0, null, 16);
        ɵɵelementEnd()();
        ɵɵelementStart(22, "div", 17);
        ɵɵtemplate(23, PickList_div_23_Template, 3, 5, "div", 9)(24, PickList_div_24_Template, 4, 3, "div", 10);
        ɵɵelementStart(25, "ul", 18, 1);
        ɵɵlistener("keydown", function PickList_Template_ul_keydown_25_listener($event) {
          ɵɵrestoreView(_r1);
          return ɵɵresetView(ctx.onItemKeyDown($event, ctx.selectedItemsTarget, ctx.onTargetSelect, ctx.TARGET_LIST));
        })("focus", function PickList_Template_ul_focus_25_listener($event) {
          ɵɵrestoreView(_r1);
          return ɵɵresetView(ctx.onListFocus($event, ctx.TARGET_LIST));
        })("blur", function PickList_Template_ul_blur_25_listener($event) {
          ɵɵrestoreView(_r1);
          return ɵɵresetView(ctx.onListBlur($event, ctx.TARGET_LIST));
        })("cdkDropListDropped", function PickList_Template_ul_cdkDropListDropped_25_listener($event) {
          ɵɵrestoreView(_r1);
          return ɵɵresetView(ctx.onDrop($event, ctx.TARGET_LIST));
        });
        ɵɵtemplate(27, PickList_ng_template_27_Template, 1, 1, "ng-template", 12)(28, PickList_ng_container_28_Template, 3, 2, "ng-container", 13);
        ɵɵelementEnd()();
        ɵɵtemplate(29, PickList_div_29_Template, 13, 22, "div", 19);
        ɵɵelementEnd();
      }
      if (rf & 2) {
        ɵɵclassMap(ctx.styleClass);
        ɵɵproperty("ngStyle", ctx.style)("ngClass", ɵɵpureFunction1(64, _c4, ctx.stripedRows));
        ɵɵattribute("data-pc-name", "picklist")("data-pc-section", "root");
        ɵɵadvance();
        ɵɵproperty("ngIf", ctx.showSourceControls);
        ɵɵadvance();
        ɵɵattribute("data-pc-section", "sourceWrapper")("data-pc-group-section", "listWrapper");
        ɵɵadvance();
        ɵɵproperty("ngIf", ctx.sourceHeader || ctx.sourceHeaderTemplate);
        ɵɵadvance();
        ɵɵproperty("ngIf", ctx.filterBy && ctx.showSourceFilter !== false);
        ɵɵadvance();
        ɵɵproperty("id", ctx.idSource + "_list")("cdkDropListData", ctx.source)("ngStyle", ctx.sourceStyle);
        ɵɵattribute("aria-labelledby", ctx.idSource + "_header")("aria-activedescendant", ctx.focused["sourceList"] ? ctx.focusedOptionId : void 0)("tabindex", ctx.source && ctx.source.length > 0 ? ctx.tabindex : -1)("data-pc-section", "sourceList")("data-pc-group-section", "list");
        ɵɵadvance(2);
        ɵɵproperty("ngForOf", ctx.source)("ngForTrackBy", ctx.sourceTrackBy || ctx.trackBy);
        ɵɵadvance();
        ɵɵproperty("ngIf", ctx.isEmpty(ctx.SOURCE_LIST) && (ctx.emptyMessageSourceTemplate || ctx.emptyFilterMessageSourceTemplate));
        ɵɵadvance();
        ɵɵattribute("data-pc-section", "buttons")("data-pc-group-section", "controls");
        ɵɵadvance();
        ɵɵproperty("disabled", ctx.moveRightDisabled());
        ɵɵattribute("aria-label", ctx.moveToTargetAriaLabel)("data-pc-section", "moveToTargetButton");
        ɵɵadvance();
        ɵɵproperty("ngIf", !ctx.moveToTargetIconTemplate);
        ɵɵadvance();
        ɵɵproperty("ngTemplateOutlet", ctx.moveToTargetIconTemplate)("ngTemplateOutletContext", ɵɵpureFunction1(66, _c5, ctx.viewChanged));
        ɵɵadvance();
        ɵɵproperty("disabled", ctx.moveAllRightDisabled());
        ɵɵattribute("aria-label", ctx.moveAllToTargetAriaLabel)("data-pc-section", "moveAllToTargetButton");
        ɵɵadvance();
        ɵɵproperty("ngIf", !ctx.moveAllToTargetIconTemplate);
        ɵɵadvance();
        ɵɵproperty("ngTemplateOutlet", ctx.moveAllToTargetIconTemplate)("ngTemplateOutletContext", ɵɵpureFunction1(68, _c5, ctx.viewChanged));
        ɵɵadvance();
        ɵɵproperty("disabled", ctx.moveLeftDisabled());
        ɵɵattribute("aria-label", ctx.moveToSourceAriaLabel)("data-pc-section", "moveToSourceButton");
        ɵɵadvance();
        ɵɵproperty("ngIf", !ctx.moveToSourceIconTemplate);
        ɵɵadvance();
        ɵɵproperty("ngTemplateOutlet", ctx.moveToSourceIconTemplate)("ngTemplateOutletContext", ɵɵpureFunction1(70, _c5, ctx.viewChanged));
        ɵɵadvance();
        ɵɵproperty("disabled", ctx.moveAllLeftDisabled());
        ɵɵattribute("aria-label", ctx.moveAllToSourceAriaLabel)("data-pc-section", "moveAllToSourceButton");
        ɵɵadvance();
        ɵɵproperty("ngIf", !ctx.moveAllToSourceIconTemplate);
        ɵɵadvance();
        ɵɵproperty("ngTemplateOutlet", ctx.moveAllToSourceIconTemplate)("ngTemplateOutletContext", ɵɵpureFunction1(72, _c5, ctx.viewChanged));
        ɵɵadvance();
        ɵɵattribute("data-pc-section", "targetWrapper")("data-pc-group-section", "listwrapper");
        ɵɵadvance();
        ɵɵproperty("ngIf", ctx.targetHeader || ctx.targetHeaderTemplate);
        ɵɵadvance();
        ɵɵproperty("ngIf", ctx.filterBy && ctx.showTargetFilter !== false);
        ɵɵadvance();
        ɵɵproperty("id", ctx.idTarget + "_list")("cdkDropListData", ctx.target)("ngStyle", ctx.targetStyle);
        ɵɵattribute("aria-labelledby", ctx.idTarget + "_header")("aria-activedescendant", ctx.focused["targetList"] ? ctx.focusedOptionId : void 0)("tabindex", ctx.target && ctx.target.length > 0 ? ctx.tabindex : -1)("data-pc-section", "targetList")("data-pc-group-section", "list");
        ɵɵadvance(2);
        ɵɵproperty("ngForOf", ctx.target)("ngForTrackBy", ctx.targetTrackBy || ctx.trackBy);
        ɵɵadvance();
        ɵɵproperty("ngIf", ctx.isEmpty(ctx.TARGET_LIST) && (ctx.emptyMessageTargetTemplate || ctx.emptyFilterMessageTargetTemplate));
        ɵɵadvance();
        ɵɵproperty("ngIf", ctx.showTargetControls);
      }
    },
    dependencies: () => [NgClass, NgForOf, NgIf, NgTemplateOutlet, NgStyle, ButtonDirective, Ripple, CdkDropList, CdkDropListGroup, CdkDrag, AngleDoubleDownIcon, AngleDoubleLeftIcon, AngleDoubleRightIcon, AngleDoubleUpIcon, AngleDownIcon, AngleLeftIcon, AngleRightIcon, AngleUpIcon, SearchIcon],
    styles: ["@layer primeng{.p-picklist{display:flex}.p-picklist-buttons{display:flex;flex-direction:column;justify-content:center}.p-picklist-list-wrapper{flex:1 1 50%}.p-picklist-list{list-style-type:none;margin:0;padding:0;overflow:auto;min-height:12rem}.p-picklist-item{display:block;cursor:pointer;overflow:hidden;position:relative}.p-picklist-item:not(.cdk-drag-disabled){cursor:move}.p-picklist-item.cdk-drag-placeholder{opacity:0}.p-picklist-item.cdk-drag-animating{transition:transform .25s cubic-bezier(0,0,.2,1)}.p-picklist-filter{position:relative}.p-picklist-filter-icon{position:absolute;top:50%;margin-top:-.5rem}.p-picklist-filter-input{width:100%}.p-picklist-list.cdk-drop-list-dragging .p-picklist-item:not(.cdk-drag-placeholder){transition:transform .25s cubic-bezier(0,0,.2,1)}}\n"],
    encapsulation: 2,
    changeDetection: 0
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(PickList, [{
    type: Component,
    args: [{
      selector: "p-pickList",
      template: `
        <div [class]="styleClass" [ngStyle]="style" [ngClass]="{ 'p-picklist p-component': true, 'p-picklist-striped': stripedRows }" cdkDropListGroup [attr.data-pc-name]="'picklist'" [attr.data-pc-section]="'root'">
            <div class="p-picklist-buttons p-picklist-source-controls" *ngIf="showSourceControls" [attr.data-pc-section]="'sourceControls'" [attr.data-pc-group-section]="'controls'">
                <button
                    type="button"
                    [attr.aria-label]="moveUpAriaLabel"
                    pButton
                    pRipple
                    class="p-button-icon-only"
                    [disabled]="sourceMoveDisabled()"
                    (click)="moveUp(sourcelist, source, selectedItemsSource, onSourceReorder, SOURCE_LIST)"
                    [attr.data-pc-section]="'sourceMoveUpButton'"
                >
                    <AngleUpIcon *ngIf="!moveUpIconTemplate" [attr.data-pc-section]="'moveupicon'" />
                    <ng-template *ngTemplateOutlet="moveUpIconTemplate"></ng-template>
                </button>
                <button
                    type="button"
                    [attr.aria-label]="moveTopAriaLabel"
                    pButton
                    pRipple
                    class="p-button-icon-only"
                    [disabled]="sourceMoveDisabled()"
                    (click)="moveTop(sourcelist, source, selectedItemsSource, onSourceReorder, SOURCE_LIST)"
                    [attr.data-pc-section]="'sourceMoveTopButton'"
                >
                    <AngleDoubleUpIcon *ngIf="!moveTopIconTemplate" [attr.data-pc-section]="'movetopicon'" />
                    <ng-template *ngTemplateOutlet="moveTopIconTemplate"></ng-template>
                </button>
                <button
                    type="button"
                    [attr.aria-label]="moveDownAriaLabel"
                    pButton
                    pRipple
                    class="p-button-icon-only"
                    [disabled]="sourceMoveDisabled()"
                    (click)="moveDown(sourcelist, source, selectedItemsSource, onSourceReorder, SOURCE_LIST)"
                    [attr.data-pc-section]="'sourceMoveDownButton'"
                >
                    <AngleDownIcon *ngIf="!moveDownIconTemplate" [attr.data-pc-section]="'movedownicon'" />
                    <ng-template *ngTemplateOutlet="moveDownIconTemplate"></ng-template>
                </button>
                <button
                    type="button"
                    [attr.aria-label]="moveBottomAriaLabel"
                    pButton
                    pRipple
                    class="p-button-icon-only"
                    [disabled]="sourceMoveDisabled()"
                    (click)="moveBottom(sourcelist, source, selectedItemsSource, onSourceReorder, SOURCE_LIST)"
                    [attr.data-pc-section]="'sourceMoveBottomButton'"
                >
                    <AngleDoubleDownIcon *ngIf="!moveBottomIconTemplate" [attr.data-pc-section]="'movebottomicon'" />
                    <ng-template *ngTemplateOutlet="moveBottomIconTemplate"></ng-template>
                </button>
            </div>
            <div class="p-picklist-list-wrapper p-picklist-source-wrapper" [attr.data-pc-section]="'sourceWrapper'" [attr.data-pc-group-section]="'listWrapper'">
                <div [id]="idSource + '_header'" class="p-picklist-header" *ngIf="sourceHeader || sourceHeaderTemplate" [attr.data-pc-section]="'sourceHeader'" [attr.data-pc-group-section]="'header'">
                    <div class="p-picklist-title" *ngIf="!sourceHeaderTemplate">{{ sourceHeader }}</div>
                    <ng-container *ngTemplateOutlet="sourceHeaderTemplate"></ng-container>
                </div>
                <div class="p-picklist-filter-container" *ngIf="filterBy && showSourceFilter !== false" [attr.data-pc-section]="'sourceFilterContainer'">
                    <ng-container *ngIf="sourceFilterTemplate; else builtInSourceElement">
                        <ng-container *ngTemplateOutlet="sourceFilterTemplate; context: { options: sourceFilterOptions }"></ng-container>
                    </ng-container>
                    <ng-template #builtInSourceElement>
                        <div class="p-picklist-filter" [attr.data-pc-section]="'sourceFilter'">
                            <input
                                #sourceFilter
                                type="text"
                                role="textbox"
                                (keyup)="onFilter($event, SOURCE_LIST)"
                                class="p-picklist-filter-input p-inputtext p-component"
                                [disabled]="disabled"
                                [attr.placeholder]="sourceFilterPlaceholder"
                                [attr.aria-label]="ariaSourceFilterLabel"
                                [attr.data-pc-section]="'sourceFilterInput'"
                            />
                            <SearchIcon *ngIf="!sourceFilterIconTemplate" [styleClass]="'p-picklist-filter-icon'" [attr.data-pc-section]="'sourcefilterIcon'" />
                            <span class="p-picklist-filter-icon" *ngIf="sourceFilterIconTemplate" [attr.data-pc-section]="'sourcefilterIcon'">
                                <ng-template *ngTemplateOutlet="sourceFilterIconTemplate"></ng-template>
                            </span>
                        </div>
                    </ng-template>
                </div>

                <ul
                    #sourcelist
                    class="p-picklist-list p-picklist-source"
                    [id]="idSource + '_list'"
                    [attr.aria-labelledby]="idSource + '_header'"
                    (keydown)="onItemKeyDown($event, selectedItemsSource, onSourceSelect, SOURCE_LIST)"
                    (focus)="onListFocus($event, SOURCE_LIST)"
                    (blur)="onListBlur($event, SOURCE_LIST)"
                    cdkDropList
                    [cdkDropListData]="source"
                    (cdkDropListDropped)="onDrop($event, SOURCE_LIST)"
                    [ngStyle]="sourceStyle"
                    role="listbox"
                    aria-multiselectable="true"
                    [attr.aria-activedescendant]="focused['sourceList'] ? focusedOptionId : undefined"
                    [attr.tabindex]="source && source.length > 0 ? tabindex : -1"
                    [attr.data-pc-section]="'sourceList'"
                    [attr.data-pc-group-section]="'list'"
                >
                    <ng-template ngFor let-item [ngForOf]="source" [ngForTrackBy]="sourceTrackBy || trackBy" let-i="index" let-l="last">
                        <li
                            pRipple
                            cdkDrag
                            [id]="idSource + '_' + i"
                            [ngClass]="itemClass(item, idSource + '_' + i, selectedItemsSource)"
                            [cdkDragData]="item"
                            [cdkDragDisabled]="!dragdrop"
                            (click)="onItemClick($event, item, selectedItemsSource, SOURCE_LIST, onSourceSelect, idSource + '_' + i)"
                            (mousedown)="onOptionMouseDown(i, SOURCE_LIST)"
                            (dblclick)="onSourceItemDblClick()"
                            (touchend)="onItemTouchEnd()"
                            *ngIf="isItemVisible(item, SOURCE_LIST)"
                            role="option"
                            [attr.data-pc-section]="'item'"
                            [attr.aria-selected]="isSelected(item, selectedItemsSource)"
                        >
                            <ng-container *ngTemplateOutlet="itemTemplate; context: { $implicit: item, index: i }"></ng-container>
                        </li>
                    </ng-template>
                    <ng-container *ngIf="isEmpty(SOURCE_LIST) && (emptyMessageSourceTemplate || emptyFilterMessageSourceTemplate)">
                        <li class="p-picklist-empty-message" *ngIf="!filterValueSource || !emptyFilterMessageSourceTemplate" [attr.data-pc-section]="'sourceEmptyMessage'">
                            <ng-container *ngTemplateOutlet="emptyMessageSourceTemplate"></ng-container>
                        </li>
                        <li class="p-picklist-empty-message" *ngIf="filterValueSource" [attr.data-pc-section]="'sourceEmptyMessage'">
                            <ng-container *ngTemplateOutlet="emptyFilterMessageSourceTemplate"></ng-container>
                        </li>
                    </ng-container>
                </ul>
            </div>
            <div class="p-picklist-buttons p-picklist-transfer-buttons" [attr.data-pc-section]="'buttons'" [attr.data-pc-group-section]="'controls'">
                <button type="button" [attr.aria-label]="moveToTargetAriaLabel" pButton pRipple class="p-button-icon-only" [disabled]="moveRightDisabled()" (click)="moveRight()" [attr.data-pc-section]="'moveToTargetButton'">
                    <ng-container *ngIf="!moveToTargetIconTemplate">
                        <AngleRightIcon *ngIf="!viewChanged" [attr.data-pc-section]="'movetotargeticon'" />
                        <AngleDownIcon *ngIf="viewChanged" [attr.data-pc-section]="'movetotargeticon'" />
                    </ng-container>
                    <ng-template *ngTemplateOutlet="moveToTargetIconTemplate; context: { $implicit: viewChanged }"></ng-template>
                </button>
                <button type="button" [attr.aria-label]="moveAllToTargetAriaLabel" pButton pRipple class="p-button-icon-only" [disabled]="moveAllRightDisabled()" (click)="moveAllRight()" [attr.data-pc-section]="'moveAllToTargetButton'">
                    <ng-container *ngIf="!moveAllToTargetIconTemplate">
                        <AngleDoubleRightIcon *ngIf="!viewChanged" [attr.data-pc-section]="'movealltotargeticon'" />
                        <AngleDoubleDownIcon *ngIf="viewChanged" [attr.data-pc-section]="'movealltotargeticon'" />
                    </ng-container>
                    <ng-template *ngTemplateOutlet="moveAllToTargetIconTemplate; context: { $implicit: viewChanged }"></ng-template>
                </button>
                <button type="button" [attr.aria-label]="moveToSourceAriaLabel" pButton pRipple class="p-button-icon-only" [disabled]="moveLeftDisabled()" (click)="moveLeft()" [attr.data-pc-section]="'moveToSourceButton'">
                    <ng-container *ngIf="!moveToSourceIconTemplate">
                        <AngleLeftIcon *ngIf="!viewChanged" [attr.data-pc-section]="'movedownsourceticon'" />
                        <AngleUpIcon *ngIf="viewChanged" [attr.data-pc-section]="'movedownsourceticon'" />
                    </ng-container>
                    <ng-template *ngTemplateOutlet="moveToSourceIconTemplate; context: { $implicit: viewChanged }"></ng-template>
                </button>
                <button type="button" [attr.aria-label]="moveAllToSourceAriaLabel" pButton pRipple class="p-button-icon-only" [disabled]="moveAllLeftDisabled()" (click)="moveAllLeft()" [attr.data-pc-section]="'moveAllToSourceButton'">
                    <ng-container *ngIf="!moveAllToSourceIconTemplate">
                        <AngleDoubleLeftIcon *ngIf="!viewChanged" [attr.data-pc-section]="'movealltosourceticon'" />
                        <AngleDoubleUpIcon *ngIf="viewChanged" [attr.data-pc-section]="'movealltosourceticon'" />
                    </ng-container>
                    <ng-template *ngTemplateOutlet="moveAllToSourceIconTemplate; context: { $implicit: viewChanged }"></ng-template>
                </button>
            </div>
            <div class="p-picklist-list-wrapper p-picklist-target-wrapper" [attr.data-pc-section]="'targetWrapper'" [attr.data-pc-group-section]="'listwrapper'">
                <div [id]="idTarget + '_header'" class="p-picklist-header" *ngIf="targetHeader || targetHeaderTemplate" [attr.data-pc-section]="'targetHead'" [attr.data-pc-group-section]="'header'">
                    <div class="p-picklist-title" *ngIf="!targetHeaderTemplate">{{ targetHeader }}</div>
                    <ng-container *ngTemplateOutlet="targetHeaderTemplate"></ng-container>
                </div>
                <div class="p-picklist-filter-container" *ngIf="filterBy && showTargetFilter !== false" [attr.data-pc-section]="'targetFilterContainer'">
                    <ng-container *ngIf="targetFilterTemplate; else builtInTargetElement">
                        <ng-container *ngTemplateOutlet="targetFilterTemplate; context: { options: targetFilterOptions }"></ng-container>
                    </ng-container>
                    <ng-template #builtInTargetElement>
                        <div class="p-picklist-filter" [attr.data-pc-section]="'targetFilter'">
                            <input
                                #targetFilter
                                type="text"
                                role="textbox"
                                (keyup)="onFilter($event, TARGET_LIST)"
                                class="p-picklist-filter-input p-inputtext p-component"
                                [disabled]="disabled"
                                [attr.placeholder]="targetFilterPlaceholder"
                                [attr.aria-label]="ariaTargetFilterLabel"
                                [attr.data-pc-section]="'targetFilterInput'"
                            />
                            <SearchIcon *ngIf="!targetFilterIconTemplate" [styleClass]="'p-picklist-filter-icon'" [attr.data-pc-section]="'targetfiltericon'" />
                            <span class="p-picklist-filter-icon" *ngIf="targetFilterIconTemplate" [attr.data-pc-section]="'targetfiltericon'">
                                <ng-template *ngTemplateOutlet="targetFilterIconTemplate"></ng-template>
                            </span>
                        </div>
                    </ng-template>
                </div>
                <ul
                    #targetlist
                    class="p-picklist-list p-picklist-target"
                    [id]="idTarget + '_list'"
                    [attr.aria-labelledby]="idTarget + '_header'"
                    (keydown)="onItemKeyDown($event, selectedItemsTarget, onTargetSelect, TARGET_LIST)"
                    (focus)="onListFocus($event, TARGET_LIST)"
                    (blur)="onListBlur($event, TARGET_LIST)"
                    cdkDropList
                    [cdkDropListData]="target"
                    (cdkDropListDropped)="onDrop($event, TARGET_LIST)"
                    [ngStyle]="targetStyle"
                    role="listbox"
                    aria-multiselectable="true"
                    [attr.aria-activedescendant]="focused['targetList'] ? focusedOptionId : undefined"
                    [attr.tabindex]="target && target.length > 0 ? tabindex : -1"
                    [attr.data-pc-section]="'targetList'"
                    [attr.data-pc-group-section]="'list'"
                >
                    <ng-template ngFor let-item [ngForOf]="target" [ngForTrackBy]="targetTrackBy || trackBy" let-i="index" let-l="last">
                        <li
                            pRipple
                            cdkDrag
                            [id]="idTarget + '_' + i"
                            [ngClass]="itemClass(item, idTarget + '_' + i, selectedItemsTarget)"
                            [cdkDragData]="item"
                            [cdkDragDisabled]="!dragdrop"
                            (click)="onItemClick($event, item, selectedItemsTarget, TARGET_LIST, onTargetSelect, idTarget + '_' + i)"
                            (mousedown)="onOptionMouseDown(i, TARGET_LIST)"
                            (dblclick)="onTargetItemDblClick()"
                            (touchend)="onItemTouchEnd()"
                            *ngIf="isItemVisible(item, TARGET_LIST)"
                            role="option"
                            [attr.data-pc-section]="'item'"
                            [attr.aria-selected]="isSelected(item, selectedItemsTarget)"
                        >
                            <ng-container *ngTemplateOutlet="itemTemplate; context: { $implicit: item, index: i }"></ng-container>
                        </li>
                    </ng-template>
                    <ng-container *ngIf="isEmpty(TARGET_LIST) && (emptyMessageTargetTemplate || emptyFilterMessageTargetTemplate)">
                        <li class="p-picklist-empty-message" *ngIf="!filterValueTarget || !emptyFilterMessageTargetTemplate" [attr.data-pc-section]="'targetEmptyMessage'">
                            <ng-container *ngTemplateOutlet="emptyMessageTargetTemplate"></ng-container>
                        </li>
                        <li class="p-picklist-empty-message" *ngIf="filterValueTarget" [attr.data-pc-section]="'targetEmptyMessage'">
                            <ng-container *ngTemplateOutlet="emptyFilterMessageTargetTemplate"></ng-container>
                        </li>
                    </ng-container>
                </ul>
            </div>
            <div class="p-picklist-buttons p-picklist-target-controls" *ngIf="showTargetControls" [attr.data-pc-section]="'targetControls'" [attr.data-pc-group-section]="'controls'">
                <button
                    type="button"
                    [attr.aria-label]="moveUpAriaLabel"
                    pButton
                    pRipple
                    class="p-button-icon-only"
                    [disabled]="targetMoveDisabled()"
                    (click)="moveUp(targetlist, target, selectedItemsTarget, onTargetReorder, TARGET_LIST)"
                    [attr.data-pc-section]="'targetMoveUpButton'"
                >
                    <AngleUpIcon *ngIf="!moveUpIconTemplate" [attr.data-pc-section]="'moveupicon'" />
                    <ng-template *ngTemplateOutlet="moveUpIconTemplate"></ng-template>
                </button>
                <button
                    type="button"
                    [attr.aria-label]="moveTopAriaLabel"
                    pButton
                    pRipple
                    class="p-button-icon-only"
                    [disabled]="targetMoveDisabled()"
                    (click)="moveTop(targetlist, target, selectedItemsTarget, onTargetReorder, TARGET_LIST)"
                    [attr.data-pc-section]="'targetMoveTopButton'"
                >
                    <AngleDoubleUpIcon *ngIf="!moveTopIconTemplate" [attr.data-pc-section]="'movetopicon'" />
                    <ng-template *ngTemplateOutlet="moveTopIconTemplate"></ng-template>
                </button>
                <button
                    type="button"
                    [attr.aria-label]="moveDownAriaLabel"
                    pButton
                    pRipple
                    class="p-button-icon-only"
                    [disabled]="targetMoveDisabled()"
                    (click)="moveDown(targetlist, target, selectedItemsTarget, onTargetReorder, TARGET_LIST)"
                    [attr.data-pc-section]="'targetMoveDownButton'"
                >
                    <AngleDownIcon *ngIf="!moveDownIconTemplate" [attr.data-pc-section]="'movedownicon'" />
                    <ng-template *ngTemplateOutlet="moveDownIconTemplate"></ng-template>
                </button>
                <button
                    type="button"
                    [attr.aria-label]="moveBottomAriaLabel"
                    pButton
                    pRipple
                    class="p-button-icon-only"
                    [disabled]="targetMoveDisabled()"
                    (click)="moveBottom(targetlist, target, selectedItemsTarget, onTargetReorder, TARGET_LIST)"
                    [attr.data-pc-section]="'targetMoveBottomButton'"
                >
                    <AngleDoubleDownIcon *ngIf="!moveBottomIconTemplate" [attr.data-pc-section]="'movebottomicon'" />
                    <ng-template *ngTemplateOutlet="moveBottomIconTemplate"></ng-template>
                </button>
            </div>
        </div>
    `,
      changeDetection: ChangeDetectionStrategy.OnPush,
      encapsulation: ViewEncapsulation$1.None,
      host: {
        class: "p-element"
      },
      styles: ["@layer primeng{.p-picklist{display:flex}.p-picklist-buttons{display:flex;flex-direction:column;justify-content:center}.p-picklist-list-wrapper{flex:1 1 50%}.p-picklist-list{list-style-type:none;margin:0;padding:0;overflow:auto;min-height:12rem}.p-picklist-item{display:block;cursor:pointer;overflow:hidden;position:relative}.p-picklist-item:not(.cdk-drag-disabled){cursor:move}.p-picklist-item.cdk-drag-placeholder{opacity:0}.p-picklist-item.cdk-drag-animating{transition:transform .25s cubic-bezier(0,0,.2,1)}.p-picklist-filter{position:relative}.p-picklist-filter-icon{position:absolute;top:50%;margin-top:-.5rem}.p-picklist-filter-input{width:100%}.p-picklist-list.cdk-drop-list-dragging .p-picklist-item:not(.cdk-drag-placeholder){transition:transform .25s cubic-bezier(0,0,.2,1)}}\n"]
    }]
  }], () => [{
    type: Document,
    decorators: [{
      type: Inject,
      args: [DOCUMENT]
    }]
  }, {
    type: void 0,
    decorators: [{
      type: Inject,
      args: [PLATFORM_ID]
    }]
  }, {
    type: Renderer2
  }, {
    type: ElementRef
  }, {
    type: ChangeDetectorRef
  }, {
    type: FilterService
  }, {
    type: PrimeNGConfig
  }], {
    source: [{
      type: Input
    }],
    target: [{
      type: Input
    }],
    sourceHeader: [{
      type: Input
    }],
    tabindex: [{
      type: Input,
      args: [{
        transform: numberAttribute
      }]
    }],
    rightButtonAriaLabel: [{
      type: Input
    }],
    leftButtonAriaLabel: [{
      type: Input
    }],
    allRightButtonAriaLabel: [{
      type: Input
    }],
    allLeftButtonAriaLabel: [{
      type: Input
    }],
    upButtonAriaLabel: [{
      type: Input
    }],
    downButtonAriaLabel: [{
      type: Input
    }],
    topButtonAriaLabel: [{
      type: Input
    }],
    bottomButtonAriaLabel: [{
      type: Input
    }],
    targetHeader: [{
      type: Input
    }],
    responsive: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    filterBy: [{
      type: Input
    }],
    filterLocale: [{
      type: Input
    }],
    trackBy: [{
      type: Input
    }],
    sourceTrackBy: [{
      type: Input
    }],
    targetTrackBy: [{
      type: Input
    }],
    showSourceFilter: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    showTargetFilter: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    metaKeySelection: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    dragdrop: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    style: [{
      type: Input
    }],
    styleClass: [{
      type: Input
    }],
    sourceStyle: [{
      type: Input
    }],
    targetStyle: [{
      type: Input
    }],
    showSourceControls: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    showTargetControls: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    sourceFilterPlaceholder: [{
      type: Input
    }],
    targetFilterPlaceholder: [{
      type: Input
    }],
    disabled: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    ariaSourceFilterLabel: [{
      type: Input
    }],
    ariaTargetFilterLabel: [{
      type: Input
    }],
    filterMatchMode: [{
      type: Input
    }],
    stripedRows: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    keepSelection: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    breakpoint: [{
      type: Input
    }],
    onMoveToSource: [{
      type: Output
    }],
    onMoveAllToSource: [{
      type: Output
    }],
    onMoveAllToTarget: [{
      type: Output
    }],
    onMoveToTarget: [{
      type: Output
    }],
    onSourceReorder: [{
      type: Output
    }],
    onTargetReorder: [{
      type: Output
    }],
    onSourceSelect: [{
      type: Output
    }],
    onTargetSelect: [{
      type: Output
    }],
    onSourceFilter: [{
      type: Output
    }],
    onTargetFilter: [{
      type: Output
    }],
    onFocus: [{
      type: Output
    }],
    onBlur: [{
      type: Output
    }],
    listViewSourceChild: [{
      type: ViewChild,
      args: ["sourcelist"]
    }],
    listViewTargetChild: [{
      type: ViewChild,
      args: ["targetlist"]
    }],
    sourceFilterViewChild: [{
      type: ViewChild,
      args: ["sourceFilter"]
    }],
    targetFilterViewChild: [{
      type: ViewChild,
      args: ["targetFilter"]
    }],
    templates: [{
      type: ContentChildren,
      args: [PrimeTemplate]
    }]
  });
})();
var DragConfig = {
  zIndex: 1200
};
var PickListModule = class _PickListModule {
  static ɵfac = function PickListModule_Factory(t) {
    return new (t || _PickListModule)();
  };
  static ɵmod = ɵɵdefineNgModule({
    type: _PickListModule,
    declarations: [PickList],
    imports: [CommonModule, ButtonModule, SharedModule, RippleModule, DragDropModule, AngleDoubleDownIcon, AngleDoubleLeftIcon, AngleDoubleRightIcon, AngleDoubleUpIcon, AngleDownIcon, AngleLeftIcon, AngleRightIcon, AngleUpIcon, SearchIcon, HomeIcon],
    exports: [PickList, SharedModule, DragDropModule]
  });
  static ɵinj = ɵɵdefineInjector({
    providers: [{
      provide: CDK_DRAG_CONFIG,
      useValue: DragConfig
    }],
    imports: [CommonModule, ButtonModule, SharedModule, RippleModule, DragDropModule, AngleDoubleDownIcon, AngleDoubleLeftIcon, AngleDoubleRightIcon, AngleDoubleUpIcon, AngleDownIcon, AngleLeftIcon, AngleRightIcon, AngleUpIcon, SearchIcon, HomeIcon, SharedModule, DragDropModule]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(PickListModule, [{
    type: NgModule,
    args: [{
      imports: [CommonModule, ButtonModule, SharedModule, RippleModule, DragDropModule, AngleDoubleDownIcon, AngleDoubleLeftIcon, AngleDoubleRightIcon, AngleDoubleUpIcon, AngleDownIcon, AngleLeftIcon, AngleRightIcon, AngleUpIcon, SearchIcon, HomeIcon],
      exports: [PickList, SharedModule, DragDropModule],
      declarations: [PickList],
      providers: [{
        provide: CDK_DRAG_CONFIG,
        useValue: DragConfig
      }]
    }]
  }], null, null);
})();
export {
  PickList,
  PickListModule
};
//# sourceMappingURL=primeng_picklist.js.map
