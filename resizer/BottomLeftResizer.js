/**
 * @author Swagatam Mitra
  
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";
    
    var startOffset = null;
    var layout = null;
    
    $(document).on("mousedown","#bottom-left-control",function(event){
        startOffset = {x:event.clientX,y:event.clientY};
        $("#element-resize-plane").show();
        event.stopPropagation();
        layout.open();
    });
    
    $(document).on("mousemove","#element-resize-plane",function(event){
        if(startOffset){
            var xMov = startOffset.x - event.clientX;
            var yMov = startOffset.y - event.clientY
            
            if(layout.xAxisAlignment === 'left'){
                layout.changeX(xMov);
            }
            
            if(layout.yAxisAlignment === 'bottom'){
                layout.changeY(yMov);
            }
            layout.changeWidth(xMov);
            layout.changeHeight(0 - yMov);
            
            layout.refresh();
            startOffset = {x:event.clientX,y:event.clientY};
            event.stopPropagation();
        }
    });
        
    $(document).on("mouseleave mouseout mouseup ","#element-resize-plane",function(event){
        if(startOffset){
            startOffset = null;
            $("#element-resize-plane").hide();
            event.stopPropagation();
            layout.close();
        }
    });
    
   $(document).on("layout.decision","#html-design-editor", function(event,layoutObj){
        layout = layoutObj;
     });
    
    $(document).on("grouplayout.decision","#html-design-editor", function(event,layoutObj){
        layout = layoutObj;
     });
    
});