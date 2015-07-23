/**
 * @author Swagatam Mitra
  
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";
    
    var AppInit       = brackets.getModule("utils/AppInit");
    
    var SelectionUtility = require("SelectionUtility");
    var topLeftPoint,
        bottomRightPoint,
        $preMultiselectionArea;
    
    function _initMultiSelect(event,element,point){
        topLeftPoint = point;
        $preMultiselectionArea
        .css('left',point.x+23)
        .css('top',point.y+23)
        .css('width',0)
        .css('height',0)
        .show();
        $(window).on('keyup',_cleanUp);
    }
    
    function _drawMultiSelectRect(event,element,point){
        if(topLeftPoint){
          if(point.x < topLeftPoint.x){
               $preMultiselectionArea.css('left',point.x+23);
               $preMultiselectionArea.css('width', (topLeftPoint.x - point.x));
           } else {
               $preMultiselectionArea.css('width', (point.x - topLeftPoint.x));
           }

           if(point.y < topLeftPoint.y){
               $preMultiselectionArea.css('top',point.y+23);
               $preMultiselectionArea.css('height', (topLeftPoint.y - point.y));
           } else {
               $preMultiselectionArea.css('height', (point.y - topLeftPoint.y));
           }
        }
    }
    
    function _cleanUp(){
        if(event.which === 17){
            $preMultiselectionArea.hide();
            topLeftPoint = null;
            $(window).off('keyup',_cleanUp);
        }
    }
    
    function _doMultiSelect(event,element,point){
        bottomRightPoint = point;
    
        if(topLeftPoint && bottomRightPoint){
            //swap the points if drawn in reverse
            if(bottomRightPoint.x < topLeftPoint.x ){
                bottomRightPoint = topLeftPoint;
                topLeftPoint = point;
            }
            
            var content = $(document.getElementById('htmldesignerIframe').contentWindow.document.body).children();
            var elements = SelectionUtility.getElementInRect(  content
                                                              ,topLeftPoint.x,topLeftPoint.y
                                                              ,bottomRightPoint.x,bottomRightPoint.y
                                                            );
            $preMultiselectionArea.hide();
            if(elements.length > 0){
                $("#html-design-editor").trigger("multiselection.done",[elements]);
            }
            topLeftPoint = null;
        }
    }
    
    $(document).on("multiselectmousedown","#html-design-editor", _initMultiSelect);
    
    $(document).on("multiselectmousemove targetdom.element.mousemove","#html-design-editor", _drawMultiSelectRect);

    $(document).on("multiselectmouseup multiselectmouseout multiselectmouseleave targetdom.element.mouseup targetdom.element.mouseout targetdom.element.mouseleave","#html-design-editor",_doMultiSelect);
    
   
    AppInit.appReady(function () {
        $preMultiselectionArea = $(".preMultiSelectionArea");
    });
    
});