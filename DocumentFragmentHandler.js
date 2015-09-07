/**
 * @author Swagatam Mitra
  
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";
    
    var AppInit       = brackets.getModule("utils/AppInit"),
        FileUtils   = brackets.getModule("file/FileUtils"),
        CommandManager      = brackets.getModule("command/CommandManager"),
        DocumentManager = brackets.getModule("document/DocumentManager"),
        EditorManager = brackets.getModule("editor/EditorManager");
    
    var FileSystem = brackets.getModule("filesystem/FileSystem");
    
    
    function _cleanUpMainMarkup(){
        $(document.getElementById('htmldesignerIframe').contentWindow.document.body).find('*').not("link,script,style").hide();
    }
    
    function _loadFragment(){
        var currentDoc = DocumentManager.getCurrentDocument();
        var designDOM = document.getElementById('htmldesignerIframe').contentWindow.document.body;
        var container = $(designDOM).find("#ad-fragment-container");
        if(container.length === 0){
            $('<div id="ad-fragment-container"></div>').appendTo(designDOM);
            container = $(designDOM).find("#ad-fragment-container");
        }
        container.html(currentDoc.getText(true));
        $("#html-design-editor").trigger("design-editor-shown");        
    }
    
    function _loadFragmentInMainContext(){
        $("#html-design-editor").trigger("deselect.all");     
        _cleanUpMainMarkup();
        _loadFragment();
        $("#htmldesignerIframe").show();
        $("#html-design-editor").trigger("fragmentDesignModeon");  
        $("#html-design-editor").trigger("design-dom-changed");
    }
    
    function _setFramePath(){
        $("#htmldesignerIframe")[0].src = $("#main-doc-path")[0].value;
        //$("#htmldesignerShadowIframe")[0].src = $("#main-doc-path")[0].value;
        _hideLinkPanel();
        window.setTimeout(_loadFragmentInMainContext,6000);
    }
    
    function _handleFragmentLoading(){ 
        //$("#htmldesignerIframe").hide();
        $("#htmldesignerIframe")[0].src = "about:blank";
        //$("#htmldesignerShadowIframe")[0].src = "about:blank";
        window.setTimeout(_setFramePath,2000);
    }
    
    function _hideLinkPanel(){
        $("#fragment-link-panel").hide();
    }
    
    $(document).on("targetdom.element.click","#html-design-editor", _hideLinkPanel);
    
    $(document).on("change","#main-doc-path", _handleFragmentLoading);
    
    function _showFragmentLinkPanel(){
        $("#main-doc-path")[0].value = "";
        $("#fragment-link-panel").show();
    }
    
    $(document).on("launch-fragment-linker","#html-design-editor", function(event){
        _showFragmentLinkPanel();
    });
    
    $(document).on("click", "#browse-main-doc", function(event){
        FileSystem.showOpenDialog(false, false, "Please Select file", '', null,
            function (err, files) {
                if (!err) {
                    $("#main-doc-path").val(files[0]);
                    $("#main-doc-path").trigger('change');
                } else {
                //    result.reject();
                }
            });
    
    });
    
    $(document).on("click", "#close-fragment-link-panel",  _hideLinkPanel);
    
    $(document).on("click", "#load-as-fragment",  _showFragmentLinkPanel);
    
    AppInit.appReady(function () {
        CommandManager.register("Launch fragment link", "launch.fragment.linker", _showFragmentLinkPanel);
    });
});