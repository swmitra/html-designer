/**
 * @author Swagatam Mitra
  
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";
    
    var selectionArea;
    
     function _isContextOnSelection(point){
        if(selectionArea){
            if( point.x >= selectionArea.left && point.x <= selectionArea.right
              && point.y >= selectionArea.top && point.y <= selectionArea.bottom){
                return true;                                              
            } else {
                return false;                                              
            }
        } else {
            return false;
        }
    }
    
    function _hideContextMenu(){
        $("#designer-context-menu-cont")
        .removeClass('open')
        .hide();
    }
    
    $(document).on("targetdom.contextmenu","#html-design-editor", function(e,elem,point){
        if(_isContextOnSelection(point)){
            $("#context-delete-element").parent().removeClass("disabledli");
         }else {
            $("#context-delete-element").parent().addClass("disabledli");
         }
        $("#designer-context-menu-cont")
            .css('top',point.y)
            .css('left',point.x)
            .addClass('open')
            .show();
    });
    
    $(document).on("element.selected","#html-design-editor",function(event,element){
        selectionArea = element.getBoundingClientRect();
        _hideContextMenu();
    });
    
    $(document).on("multiselectarea.computed","#html-design-editor",function(event,unionArea){
        selectionArea = unionArea;
    });
    
    $(document).on("deselect.all","#html-design-editor",function(event){
        selectionArea = null;
        _hideContextMenu();
    });
    
    $(document).on("hide.contextmenu","#html-design-editor",function(event){
        _hideContextMenu();
    });
    
});