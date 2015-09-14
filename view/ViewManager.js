/**
 * @author Swagatam Mitra
  
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";

    var AppInit = brackets.getModule("utils/AppInit"),
        FileUtils = brackets.getModule("file/FileUtils"),
        Resizer = brackets.getModule("utils/Resizer"),
        CommandManager = brackets.getModule("command/CommandManager"),
        DocumentManager = brackets.getModule("document/DocumentManager"),
        EditorManager = brackets.getModule("editor/EditorManager");
    
    var ExtensionUtils = brackets.getModule("utils/ExtensionUtils");
    var MODULE_PATH = ExtensionUtils.getModulePath(module).replace("/view","");
    
    var DesignView = require("view/DesignViewHandler"),
        SourceView = require("view/SourceViewHandler"),
        StylesView = require("view/StylesViewHandler");
    
    var NWViewManager = require("view/NetworkViewManager");
    
    var ViewPresentationPresets = require("view/ViewPresentationPresets");
    
    var CommonUtils = require("CommonUtils");
    
    var _auxilaryHandlers = {};

    var HTMLDesignViewTemplate = require("text!html/html-design-view.html");
    var StatusBarViewOptionsTemplate = require("text!controlhtml/view-options.html");
    var DesignerSettingsTemplate = require("text!controlhtml/settingsTemplate.html");
    var StylesSplitViewTemplate = require("text!controlhtml/splitview-styles-template.html").split("{{module_path}}").join(MODULE_PATH);
    var SourceSplitViewTemplate = require("text!controlhtml/splitview-source-template.html");
    var SelectionControlTemplate = require("text!controlhtml/selection-pane.html");
    var MultiselectionControlTemplate = require("text!toolboxhtml/multiselectionToolboxTemplate.html").split("{{module_path}}").join(MODULE_PATH);
    var PreSelectionControlTemplate = require("text!controlhtml/hover-pane.html");
    var WidgetDragSourceTemplate = require("text!controlhtml/html-elements-catalog.html").split("{{module_path}}").join(MODULE_PATH);
    var ProspectiveParentTemplate = require("text!controlhtml/prospective-parent-highlight.html");
    var ParentTemplate = require("text!controlhtml/parent-highlight.html");
    var PreMultiselectionAreaTemplate = require("text!controlhtml/multiselect-draw-rect.html");
    var ContextMenuTemplate = require("text!controlhtml/context-menu-template.html");
    var WidgetCreateContextMenuTemplate = require("text!widgetprofiles/html/widget-create-context-template.html");
    var WidgetEditContextMenuTemplate = require("text!widgetprofiles/html/widget-edit-context-template.html");
    var WidgetTemplateEditorTemplate = require("text!widgetprofiles/html/widget-profile-edit-template.html");
    var MarkupEditTemplate = require("text!controlhtml/markupEditTemplate.html");
    var BorderToolBoxTemplate = require("text!toolboxhtml/genericBorderToolboxTemplate.html");
    var TransformToolBoxTemplate = require("text!toolboxhtml/transformToolboxTemplate.html");
    var BackgroundImageToolBoxTemplate = require("text!toolboxhtml/backgroundImageTemplate.html");
    var DockedLayoutTemplate = require("text!toolboxhtml/dockedLayoutTemplate.html").split("{{module_path}}").join(MODULE_PATH);;
    var LayoutToolBoxTemplate = require("text!toolboxhtml/layouttoolboxTemplate.html").split("{{module_path}}").join(MODULE_PATH);
    var NewToolBoxTemplate = require("text!toolboxhtml/toolboxTemplate.html").split("{{module_path}}").join(MODULE_PATH);
    var ShadowEditorTemplate = require("text!toolboxhtml/boxShadoweditorTemplate.html");
    var CSSEditorTemplate = require("text!toolboxhtml/cssToolboxTemplate.html").split("{{module_path}}").join(MODULE_PATH);
    var TransitionToolBoxTemplate = require("text!toolboxhtml/transitionToolboxTemplate.html").split("{{module_path}}").join(MODULE_PATH);
    var KeyframeToolBoxTemplate = require("text!toolboxhtml/keyframeToolboxTemplate.html");
    var KeyframeTimelineToolBoxTemplate = require("text!toolboxhtml/keyframeTimelineToolboxTemplate.html").split("{{module_path}}").join(MODULE_PATH);
    var TextToolBoxTemplate = require("text!toolboxhtml/textToolboxTemplate.html");
    var ToolShorcutsTemplate = require("text!toolboxhtml/toolShortcutTemplate.html");

    var $designview;
    var inDesignView = false;
    var inSplitView = false;
    var currentDoc;

    var applicationContext = null;

    var CODE_VIEW = "htmlcodeview",
        DESIGN_VIEW = "htmldesignview",
        SPLIT_VIEW = "htmlsplitview";

    function _applyStatusBarDarkTheme() {
        $("#status-bar").addClass("forcedStatusBarInfoDarkTheme");
        $("#status-info").contents().addClass("forcedStatusBarInfoDarkTheme");
        $("#status-indicators").addClass("forcedStatusBarIndicatorDarkTheme");
        $("#status-indicators").contents().addClass("forcedStatusBarIndicatorDarkTheme");
        $("#main-toolbar").hide();
        $("#status-file").hide();
        $(".content").addClass("forcedDesignContentTheme");
    }

    function _removeStatusBarDarkTheme() {
        $("#status-bar").removeClass("forcedStatusBarInfoDarkTheme");
        $("#status-info").contents().removeClass("forcedStatusBarInfoDarkTheme");
        $("#status-indicators").removeClass("forcedStatusBarIndicatorDarkTheme");
        $("#status-indicators").contents().removeClass("forcedStatusBarIndicatorDarkTheme");
        $("#status-file").show();
        $("#main-toolbar").show();
        $(".content").removeClass("forcedDesignContentTheme");
    }

    function _showCodeView() {
        _removeStatusBarDarkTheme();
        SourceView.hide();
        StylesView.hide();
        DesignView.hide();
        $('button[title="Design DropDown List"]').find(".data").html("Code View");
        inDesignView = false;
        inSplitView = false;
        applicationContext = false;
        $("#html-design-editor").trigger('application.context', [null]);
    }
    
    function _showDesignView(nwpath) {
        $("#html-design-template").show();
        if(nwpath){
            DesignView.nwlaunch(nwpath);
        } else {
            DesignView.launch();
            nwpath = DocumentManager.getCurrentDocument().file._path;
        }
        if(inSplitView){
            SourceView.hide();
            StylesView.hide();
            inSplitView = false;
        } else if(!inDesignView){
            _applyStatusBarDarkTheme();
        }
        $('button[title="Design DropDown List"]').find(".data").html("Design View");
        inDesignView = true;
        applicationContext = true;
        $("#html-design-editor").trigger('application.context', [nwpath]);
    }
    
    function _showSplitView() {
        if(!inDesignView){
            _showDesignView();
        } 
        
        SourceView.launch();
        StylesView.launch();
        $('button[title="Design DropDown List"]').find(".data").html("Split View");
        inSplitView = true;
        applicationContext = true;
    }
    
    function _isDesignHandlerPresent(extn){
        var reqd = false;
        var handler = _auxilaryHandlers[extn];
        if(handler){
            reqd = handler.apply();
        }
        return reqd;
    }
    
    function _handleDocChange() {
        var doc = DocumentManager.getCurrentDocument();
        if (applicationContext) {
            $("#html-design-editor").trigger('deselect.all');
        }
        if (doc) {
            var docPath = doc.file._path;
            var extn = FileUtils.getFileExtension(docPath);
            if (CommonUtils.isValidMarkupFile(extn) || _isDesignHandlerPresent(extn)) {
                $("#design-view-options").show();
                if (inDesignView) {
                    _showDesignView();
                } else if (inSplitView) {
                    _showSplitView();
                } else {
                    _showCodeView();
                }
                $("#html-design-editor").trigger('application.context', [docPath]);
            } else {
                $("#design-view-options").hide();
                 _showCodeView();
                $("#view-options-menu").text("CodeView");
            }
        }
    }
    
    $(document).on("open-nw-resource","#html-design-editor", function(event,path){
        _handleNetworkResource(path);
    });
    
    function _handleNetworkResource(path){
        if (applicationContext) {
            $("#html-design-editor").trigger('deselect.all');
        }
        if (path) {
            $("#design-view-options").show();
            if (inDesignView) {
                _showDesignView(path);
            } else if (inSplitView) {
                _showSplitView();
            } else {
                _showCodeView();
            }
            $("#html-design-editor").trigger('application.context', [path]);
        }
    }
    
    function _handleViewPresets(event){
        var CODE_VIEW = 49,//1
            DESIGN_VIEW = 50,//2
            DESIGN_MAJOR = 51,//3
            SOURCE_MAJOR = 52,//4
            STYLES_MAJOR = 53;//5
        
        if(event.shiftKey === false && event.altKey === false && event.ctrlKey === true
          && event.which === CODE_VIEW ){
           if(inSplitView || inDesignView){
               _showCodeView();
           }
           event.preventDefault();
           event.stopPropagation();
        }
        
        if(event.shiftKey === false && event.altKey === false && event.ctrlKey === true
          && event.which === DESIGN_VIEW ){
           _showDesignView();
           event.preventDefault();
           event.stopPropagation();
           $("#designer-content-placeholder").trigger("panelResizeUpdate");
        }
       
        if(event.shiftKey === false && event.altKey === false && event.ctrlKey === true
          && (event.which === DESIGN_MAJOR || event.which === SOURCE_MAJOR || event.which === STYLES_MAJOR )){
           if(!inSplitView){
               _showSplitView();
           }
           switch(event.which){
               case DESIGN_MAJOR: ViewPresentationPresets.applyDesignMajorPreset();break;
               case SOURCE_MAJOR: ViewPresentationPresets.applySourceMajorPreset();break;
               case STYLES_MAJOR: ViewPresentationPresets.applyStylesMajorPreset();break;
           }
           event.preventDefault();
           event.stopPropagation();
           $("#designer-content-placeholder").trigger("panelResizeUpdate");
           $("#html-design-editor").trigger("refresh-split-view");
        }
    }
    
    function _registerAuxilaryHandler(extn,handler){
        _auxilaryHandlers[extn] = handler;
    }
    
    $(window).on('keydown',_handleViewPresets);
    
    $( document).on( 'click', '#design-view-options .dropdown-menu li', function( event ) {
        var $target = $(event.currentTarget);
        $("#view-options-menu").text($target.find("a").text());
        CommandManager.get($target.data("option")).execute();
    });

    AppInit.htmlReady(function () {
        $(StatusBarViewOptionsTemplate).insertAfter("#status-language").hide();
        $(HTMLDesignViewTemplate).appendTo("#editor-holder").hide();
        $("#html-design-template").append(WidgetDragSourceTemplate);
        $("#info-overlay-plane").append(SourceSplitViewTemplate);
        $("#info-overlay-plane").append(StylesSplitViewTemplate);
        $("#info-overlay-plane").append(SelectionControlTemplate);
        $("#info-overlay-plane").append(PreMultiselectionAreaTemplate);
        $("#info-overlay-plane").append(BorderToolBoxTemplate);
        $("#info-overlay-plane").append(MarkupEditTemplate);
        $("#info-overlay-plane").append(MultiselectionControlTemplate);
        $("#info-overlay-plane").append(BackgroundImageToolBoxTemplate);
        $("#info-overlay-plane").append(TransformToolBoxTemplate);
        //$("#info-overlay-plane").append(LayoutToolBoxTemplate);
        $("#info-overlay-plane").append(ShadowEditorTemplate);
        //$("#info-overlay-plane").append(CSSEditorTemplate);
        $("#docked-toolbox").append(ToolShorcutsTemplate);
        $("#docked-toolbox").append(DockedLayoutTemplate);
        $("#docked-toolbox").append(CSSEditorTemplate);
        $(".eventListnerPane").append(ContextMenuTemplate);
        $("#html-design-template").append(WidgetCreateContextMenuTemplate);
        $("#html-design-template").append(WidgetEditContextMenuTemplate);
        $("#info-overlay-plane").append(PreSelectionControlTemplate);
        $("#info-overlay-plane").append(ProspectiveParentTemplate);
        $("#info-overlay-plane").append(ParentTemplate);
        //$("#info-overlay-plane").append(WidgetDragSourceTemplate);
        $("#info-overlay-plane").append(TransitionToolBoxTemplate);
        $("#info-overlay-plane").append(KeyframeToolBoxTemplate);
        $("#info-overlay-plane").append(TextToolBoxTemplate);
        $("#info-overlay-plane").append(KeyframeTimelineToolBoxTemplate);
        $("#design-toolbox-anchor").append(NewToolBoxTemplate);
        $("#design-modal-backdrop").append(WidgetTemplateEditorTemplate);
        $("#design-modal-backdrop").append(DesignerSettingsTemplate);
    });

    AppInit.appReady(function () {
        CommandManager.register("Show HTML split view", SPLIT_VIEW, _showSplitView);
        CommandManager.register("Show HTML Design", DESIGN_VIEW, _showDesignView);
        CommandManager.register("Show HTML Code", CODE_VIEW, _showCodeView);
	    DesignView.init();
        SourceView.init();
        StylesView.init();
	    $(DocumentManager).on("currentDocumentChange", _handleDocChange); 
        Resizer.makeResizable($("#css-editor")[0], Resizer.DIRECTION_VERTICAL, Resizer.POSITION_BOTTOM, 300, false, undefined, false);
        //Resizer.makeResizable($("#css-editor")[0], Resizer.DIRECTION_HORIZONTAL, Resizer.POSITION_RIGHT, 280, false, undefined, false);
    });

    $(DocumentManager).on("documentSaved", function () {
        if (applicationContext) {
            var docPath = DocumentManager.getCurrentDocument().file._path;
            $("#html-design-editor").trigger("save.application", [docPath]);
        }
    });
    
    exports.registerViewValidator = _registerAuxilaryHandler;

});