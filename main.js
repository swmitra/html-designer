/**
 * @author Swagatam Mitra
  
 */


/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";
    
    var ExtensionUtils = brackets.getModule("utils/ExtensionUtils");
    
    require("lib/jquery.ruler");
    require("lib/jQuery-Knob/js/jquery.knob");
    require("lib/DOMParserHTMLExtension");
    require("lib/jquery-ui-1.10.3.custom");
    require("lib/numeric-1.2.6.min");
    require("lib/bootstrap-colorpicker/js/bootstrap-colorpicker");
    
    require("DesignDOMUpdater");
    require("PersistenceManager");
    require("TargetDOMEventRouter");
    require("ContainmentEditHandler");
    require("DragHandler");
    require("PrecisionPositionHandler");
    require("PreSelectionHandler");
    require("PrecisionResizeHandler");
    require("BoxModelCreator");
    require("BoxModelMarker");
    require("LayoutDecisionManager");
    require("SelectAndDrawCreationHandler");
    //require("DragAndDropCreationHandler");
    require("SelectionHandler");
    require("view/ViewManager");
    require("ElementCopyHandler");
    require("MultiSelectionDrawControl");
    require("MultiSelectionClickControl");
    require("MultiSelectionHandler");
    require("AlignmentHandler");
    require("ContextMenuHandler");
    require("ContextMenuActionHandler");
    require("ElementDeleteHandler");
    require("ElementSearchHandler");
    require("DocumentFragmentHandler");
    require("DesignScrollManager");
    require("DesignAreaSandboxingHandler");
    require("ElementHrchyBreadcrumbHandler");
    require("ElementMarkupEditHandler");
    require("BorderRadiusHandler");
    require("DistributionHandler");
    require("InteractionModeHandler");
    
    require("DesignerSettingsManager");
    
    require("grid/GridOptionsManager");
    require("propertysheet/GenericToolBoxHandler");
    require("propertysheet/GenericBorderToolBoxHandler");
    require("propertysheet/BorderToolboxHandler");
    require("propertysheet/BorderRadiusToolboxHandler");
    require("propertysheet/BackgroundGradientToolboxHandler");
	require("propertysheet/BackgroundImageToolboxHandler");
    require("propertysheet/BackgroundColorToolboxHandler");
    require("propertysheet/TransformToolboxHandler");
	require("propertysheet/LayoutToolboxHandler");
    require("propertysheet/ShadowToolboxHandler");
    require("propertysheet/TargetSelectorHandler");
    require("propertysheet/RuleSetEditor");
    require("propertysheet/WidgetToolboxHandler");
    require("propertysheet/TransitionToolboxHandler");
    require("propertysheet/KeyframeToolboxHandler");
    require("propertysheet/KeyframeTimelineToolboxHandler");
    require("propertysheet/TextToolboxHandler");
    require("propertysheet/DockedToolboxHandler");
    //require("propertysheet/TransformControlHandler");
    
    
    require("attribute/HTMLAttributeEditor");
    require("stylemodule/RuleSetFinder");
    require("stylemodule/CSSRuleSetManager");
    require("stylemodule/RuleSetCreator");
    require("stylemodule/RuleSetRemover");
    require("stylemodule/RuleSetUpdater");
    require("stylemodule/CSSPersistenceManager");
    require("stylemodule/StylesheetManager");
    
    require("responsive/ResponsiveUIControlManager");
    require("responsive/ActiveBreakpointListner");
    
    require("editmodule/EditContext");
    
    //require("OnlineUserTrackingClient").init();
    
    ExtensionUtils.loadStyleSheet(module, "css/html-design-view.css");
    ExtensionUtils.loadStyleSheet(module, "css/ruler.css");
    ExtensionUtils.loadStyleSheet(module, "css/topcoat-desktop-dark.css");
    ExtensionUtils.loadStyleSheet(module, "css/breadcrumb.css");
    ExtensionUtils.loadStyleSheet(module, "lib/jquery-ui-1.10.3.custom.css");
    ExtensionUtils.loadStyleSheet(module, "lib/bootstrap/css/bootstrap.css");
    ExtensionUtils.loadStyleSheet(module, "lib/bootstrap-colorpicker/css/bootstrap-colorpicker.css");
    
});