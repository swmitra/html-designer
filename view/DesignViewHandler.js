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

    var $designview;
    var currentDoc;
    
    var HRulerTemplate = require("text!html/hRulerTemplate.html");
    var VRulerTemplate = require("text!html/vRulerTemplate.html");
    
    var CommonUtils = require("CommonUtils");
    
    var isFragmentModeOn = false;
    var isNWResource = false;

    function _showRuler() {
        $("#html-design-editor").ruler({
            vRuleSize: 22,
            hRuleSize: 22,
            hRulerTemplate: HRulerTemplate,
            vRulerTemplate: VRulerTemplate,
            showCrosshair: true,
            showMousePos: true,
            showGuidePos: true,
            forceCreate: true,
            xOrigin: 0,
            yOrigin: 0,
            xOffset: 0,
            yOffset: 0,
            anchor: $("#html-design-editor"),
            guide: $(document.getElementById('htmldesignerIframe').contentWindow.document),
            scrollListner: $("#scrollPlane")  ,
            resizeListner: $(document.getElementById('htmldesignerIframe').contentWindow.document.body),
            mousePosContainer: $("#status-cursor")
        });
    }
    
    $(document).on('fragmentDesignModeon',"#html-design-editor",function(){
        isFragmentModeOn = true;
    });
    
    $(document).on('design-dom-changed',"#html-design-editor",function(){
        isFragmentModeOn = false;
    });
    
    function _showDesign(){
        _showRuler();
    }
    
    function _showHTMLDesign(){
        _showRuler();
        if(DocumentManager.getCurrentDocument().isDirty){
            _synchDesignWithCode();
        }
        $('#htmldesignerIframe').off('ready', _showHTMLDesign);
    }
    
    function _synchDesignWithCode(){
        if(!isNWResource){
            var toBeUpdated = document.getElementById('htmldesignerIframe').contentWindow.document;
            $("#html-design-editor").trigger("deselect.all");
            if(isFragmentModeOn === true){
                $(toBeUpdated).find("#ad-fragment-container").html(DocumentManager.getCurrentDocument().getText());
            } else {
                toBeUpdated.documentElement.innerHTML = DocumentManager.getCurrentDocument().getText();
            }
        }
    }

    function _showDesignView() {
        isNWResource = false;
        EditorManager.getCurrentFullEditor().setVisible(false, false);
        $designview.show();
        _showRuler();
        if (/*currentDoc != DocumentManager.getCurrentDocument() &&*/ CommonUtils.isValidMarkupFile(FileUtils.getFileExtension(DocumentManager.getCurrentDocument().file._path))) {
            $("#htmldesignerIframe")[0].src = DocumentManager.getCurrentDocument().file._path;
            currentDoc = DocumentManager.getCurrentDocument();
            $('#htmldesignerIframe').off('ready', _showHTMLDesign);
            $('#htmldesignerIframe').on('ready', _showHTMLDesign);
            $("#html-design-editor").trigger("design-dom-changed");
        } /*else if(currentDoc === DocumentManager.getCurrentDocument() && CommonUtils.isValidMarkupFile(FileUtils.getFileExtension(DocumentManager.getCurrentDocument().file._path))){
            _showHTMLDesign();
            $("#html-design-editor").trigger("design-dom-changed");
        }*/
        $("#html-design-editor").trigger("design-editor-shown");
        $("#html-design-editor").trigger("groupdeselect.all");
    }
    
    function _showNWDesignView(path){
        isNWResource = true;
        EditorManager.getCurrentFullEditor().setVisible(false, false);
        $designview.show();
        _showRuler();
        $("#htmldesignerIframe")[0].src = path;
        $('#htmldesignerIframe').off('load', _showHTMLDesign);
        $('#htmldesignerIframe').on('load', _showHTMLDesign);
        $("#html-design-editor").trigger("design-dom-changed");
        $("#html-design-editor").trigger("design-editor-shown");
        $("#html-design-editor").trigger("groupdeselect.all");
    }
    
    function _quitDesignView(){
        $("#html-design-editor").trigger("deselect.all");
        $("#htmldesignerIframe")[0].src = "";
        
        EditorManager.getCurrentFullEditor().setVisible(true, true);
        
        $designview.hide();
        EditorManager.getCurrentFullEditor()._codeMirror.refresh();
    }

    function _init() {
        $designview = $("#html-design-template");
    }
    
    exports.nwlaunch = _showNWDesignView;
    exports.launch = _showDesignView;
    exports.hide = _quitDesignView;
    exports.init = _init;
});