/**
 * @author Swagatam Mitra
  
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";
    
    var AppInit       = brackets.getModule("utils/AppInit");
    var FileSystem = brackets.getModule("filesystem/FileSystem");
    var ProjectManager = brackets.getModule("project/ProjectManager");
    
    function _findStyleSheets() {
        var styleSheets = document.getElementById('htmldesignerIframe').contentWindow.document.styleSheets;
        var sheetCount, setCount, styleSheet;
        var toBeReturned = [];
        for (sheetCount = 0; sheetCount < styleSheets.length ; sheetCount++) {
            styleSheet = document.getElementById('htmldesignerIframe').contentWindow.document.styleSheets[sheetCount];
            if(styleSheet.href){
                toBeReturned.push(styleSheet);
            }
        }
        return toBeReturned;
    }
    
    $(document).on("design-dom-changed","#html-design-editor",function(){
        setTimeout(function(){
            $("#html-design-editor").trigger("stylesheets-in-dom",[_findStyleSheets()]);
        },500);
        
        setTimeout(function(){
            $("#html-design-editor").trigger("stylesheets-in-dom",[_findStyleSheets()]);
        },6000);
    });
    
    /*$(document).on("element.selected","#html-design-editor",function(){
        setTimeout(function(){
            $("#html-design-editor").trigger("stylesheets-in-dom",[_findStyleSheets()]);
        },500);
    });*/
    
    function _createNewStyleSheet(cssPath){
        var stylePath = cssPath.replace(ProjectManager.getProjectRoot()._path,"");
        var styleNode =  document.getElementById('htmldesignerIframe').contentWindow.document.createElement('LINK');
            styleNode = $(styleNode).appendTo(document.getElementById('htmldesignerIframe').contentWindow.document.head)[0];
            //styleSheet = styleNode.sheet;
            styleNode.href = stylePath;
            styleNode.rel = "stylesheet";
        $("#html-design-editor").trigger('html.element.updated');
        $("#html-design-editor").trigger("design-dom-changed");
    }
    
    $(document).on("click","#create-new-stylesheet",function(){
        FileSystem.showOpenDialog(false, false, "Please Select CSS file", '', null,
            function (err, files) {
                if (!err) {
                    _createNewStyleSheet(files[0]);
                } else {
                //    result.reject();
                }
            });
    });
        
});