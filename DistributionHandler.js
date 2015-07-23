/**
 * @author Swagatam Mitra
  
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";

    var layout,
        reference,
        referenceElement;
    
    
    function _distributeHorizontally(){
        if(layout){
            layout.open();
            layout.distributeHorizontally(reference,$("#distribute-horz-input").val(),null);
            layout.refresh();
            layout.close();
            $("#html-design-editor").trigger("groupReselect");
        }
    }
    
    function _distributeVertically(){ 
        if(layout){
            layout.open();
            layout.distributeVertically(reference,$("#distribute-vert-input").val(),null);
            layout.refresh();
            layout.close();
            $("#html-design-editor").trigger("groupReselect");
        }
    }
    
    function _normalizeHeight(){
        if(layout){
            layout.open();
            var height = 0;
            if(referenceElement){
                height = referenceElement.getBoundingClientRect().height;
            } else {
                height = $("#normalize-height-input").val() || (reference.bottom - reference.top);
            }
            layout.changeHeightTo(height);
            layout.refresh();
            layout.close();
            $("#html-design-editor").trigger("groupReselect");
        }
    }
    
    function _normalizeWidth(){ 
        if(layout){
            layout.open();
            var width = 0;
            if(referenceElement){
                width = referenceElement.getBoundingClientRect().width;
            } else {
                width = $("#normalize-width-input").val() || (reference.right - reference.left);
            }
            layout.changeWidthTo(width);
            layout.refresh();
            layout.close();
            $("#html-design-editor").trigger("groupReselect");
        }
    }
    
    $(document).on("grouplayout.decision","#html-design-editor", function(event,layoutObj){
        layout = layoutObj;
     });
    
    $(document).on("groupreference.selected","#html-design-editor", function(event,referenceObj){
        referenceElement = referenceObj;
     });
    
    $(document).on("multiselectarea.computed","#html-design-editor",function(event,unionArea){
        reference = unionArea;
        $("#distribute-horz-input").val("");
        $("#distribute-vert-input").val("");
        $("#normalize-width-input").val("");
        $("#normalize-height-input").val("");
    });
    
    $(document).on('element.selected',"#html-design-editor",function(){
        reference = null;
        referenceElement = null;
    });
    
    $(document).on('deselect.all',"#html-design-editor",function(){
        reference = null;
        referenceElement = null;
    });
    
    $(document).on('click',"#distribute-horz",function(){
        _distributeHorizontally();
    });
    
    $(document).on('click',"#distribute-vert",function(){
        _distributeVertically();
    });
    
    $(document).on('click',"#normalize-height",function(){
        _normalizeHeight();
    });
    
    $(document).on('click',"#normalize-width",function(){
        _normalizeWidth();
    });
    
});