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
    
    var isFragmentModeOn = false;

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
        _synchDesignWithCode();
    }
    
    function _synchDesignWithCode(){
        var toBeUpdated = document.getElementById('htmldesignerIframe').contentWindow.document;
        $("#html-design-editor").trigger("deselect.all");
        if(isFragmentModeOn === true){
            $(toBeUpdated).find("#ad-fragment-container").html(DocumentManager.getCurrentDocument().getText());
        } else {
            toBeUpdated.documentElement.innerHTML = DocumentManager.getCurrentDocument().getText();
        }
    }

    function _showDesignView() {
        EditorManager.getCurrentFullEditor().setVisible(false, false);
        $designview.show();
        if (currentDoc != DocumentManager.getCurrentDocument() && FileUtils.getFileExtension(DocumentManager.getCurrentDocument().file._path) === 'html') {
            $("#htmldesignerIframe")[0].src = DocumentManager.getCurrentDocument().file._path;
            $("#htmldesignerShadowIframe")[0].src = DocumentManager.getCurrentDocument().file._path;
            currentDoc = DocumentManager.getCurrentDocument();
            $('#htmldesignerIframe').off('load', _showHTMLDesign);
            $('#htmldesignerIframe').on('load', _showHTMLDesign);
            $("#html-design-editor").trigger("design-dom-changed");
        } else if(currentDoc === DocumentManager.getCurrentDocument() && FileUtils.getFileExtension(DocumentManager.getCurrentDocument().file._path) === 'html'){
            _showHTMLDesign();
            $("#html-design-editor").trigger("design-dom-changed");
        }

        if (FileUtils.getFileExtension(DocumentManager.getCurrentDocument().file._path) === 'json') {
            $("#html-design-editor").trigger("handle-json-design-view");
            $('#htmldesignerIframe').off('load', _showDesign);
            $('#htmldesignerIframe').on('load', _showDesign);
            $("#html-design-editor").trigger("design-dom-changed");
        }
        $("#html-design-editor").trigger("design-editor-shown");
    }
    
    function _quitDesignView(){
        $("#html-design-editor").trigger("deselect.all");
        EditorManager.getCurrentFullEditor().setVisible(true, true);
        $designview.hide();
        EditorManager.getCurrentFullEditor()._codeMirror.refresh();
    }

    function _init() {
        $designview = $("#html-design-template");
    }
    
    exports.launch = _showDesignView;
    exports.hide = _quitDesignView;
    exports.init = _init;
});