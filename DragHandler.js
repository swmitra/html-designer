/**
 * @author Swagatam Mitra
  
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";
    
    var startOffset = null;
    var isDragged = false;
    var dragSourceArea = null;
    var layout = null;
    
    
    function _isPinInEventOnDragSource(point){
        if(dragSourceArea){
            if( point.x >= dragSourceArea.left && point.x <= dragSourceArea.right
              && point.y >= dragSourceArea.top && point.y <= dragSourceArea.bottom){
                return true;                                              
            } else {
                return false;                                              
            }
        } else {
            return false;
        }
    }
    
    function _initDrag(event,element,point){
        if(element && element.tagName !== 'BODY'){
            $("#html-design-editor").trigger("design.editor.drag.activated");
            if(_isPinInEventOnDragSource(point) || (layout && layout.boxModel && layout.boxModel.cssRuleSet.element === element)){
                startOffset = point;
                isDragged = false;  
                $('.controlDiv').css('pointer-events','none');
                layout.open();
            } /*else {
                startOffset = point;
                isDragged = false;  
                $('.controlDiv').css('pointer-events','none');
                $("#html-design-editor").trigger("select.element",[element]);
                setTimeout(function(){ layout.open();},50);
            }*/
        }
    }
    
    function _doDrag(event,element,point){
        if(startOffset){
            layout.changeX(startOffset.x - point.x);
            layout.changeY(startOffset.y - point.y);
            startOffset = point;
            layout.refresh();
            //dragSourceArea = element.getBoundingClientRect();
            isDragged = true;
        }
    }
    
    function _endDrag(event,element,point){
        if(startOffset){
            $("#html-design-editor").trigger("design.editor.drag.deactivated");
            $("#hover-outline").hide();
            startOffset = null;
            isDragged = false;
            $('.controlDiv').css('pointer-events','all');
            dragSourceArea = element.getBoundingClientRect();
            layout.close();
        }
    }
    
    $(document).on("layout.decision","#html-design-editor", function(event,layoutObj){
        layout = layoutObj;
    });
    
    $(document).on("grouplayout.decision","#html-design-editor", function(event,layoutObj){
        layout = layoutObj;
    });
    
    $(document).on("element.selected","#html-design-editor",function(event,element){
        dragSourceArea = element.getBoundingClientRect();
    });
    
    $(document).on("multiselectarea.computed","#html-design-editor",function(event,unionArea){
        dragSourceArea = unionArea;
    });
    
    $(document).on("targetdom.element.mousedown","#html-design-editor", _initDrag);
    
    $(document).on("targetdom.element.mousemove","#html-design-editor", _doDrag);

    $(document).on("targetdom.element.mouseup targetdom.element.mouseout targetdom.element.mouseleave","#html-design-editor",_endDrag);   
});