/**
 * @author Swagatam Mitra
  
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";
    
    var lastSelectedElement;
    var clipBoardItem = null;
    
    $(document).on("element.selected","#html-design-editor",function(event,element){
        lastSelectedElement = element;
    });
    
    $(document).on("deselect.all","#html-design-editor",function(event){
        lastSelectedElement = null;
    });
    
    $(document).on("add-to-clipboard","#html-design-editor",function(event,context,item){
        clipBoardItem = item || lastSelectedElement;
        $("#html-design-editor").trigger("added-to-clipboard",[clipBoardItem,context]);
    });
    
    $(document).on("clear-clipboard","#html-design-editor",function(event,context){
        clipBoardItem = null;
        $("#html-design-editor").trigger("clipboard-cleared");
    });

});