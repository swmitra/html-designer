/**
 * @author Swagatam Mitra
  
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";
       
    var RAD2DEG = 180 / Math.PI;  
    var elementToRotate = null;
    var mouseDown = false;
    var rotationEntryPoint = null;
    var rotationReferencePoint = null;
    var elementCenter = null;
    
    function _updateRotation(e,targetDOMElement,targetDOMEventPoint){
        if(mouseDown){
            console.warn(" rotation control 2");
            rotationReferencePoint = Math.atan2(elementCenter.centerY - targetDOMEventPoint.y, targetDOMEventPoint.x - elementCenter.centerX);
            var rotationAngle = (rotationEntryPoint - rotationReferencePoint) * RAD2DEG;
            $(elementToRotate).css('-webkit-transform','rotate('+rotationAngle+'deg)');
            $("#selection-outline").css('-webkit-transform','rotate('+rotationAngle+'deg)');
        }
    }
    
    
    function bindRotationHandler(element){
        elementToRotate = element;
        elementCenter = {centerX:0,centerY:0};
        elementCenter.centerX = $(elementToRotate).offset().left + $(elementToRotate).width()/2;
        elementCenter.centerY = $(elementToRotate).offset().top + $(elementToRotate).height()/2;
        $("#selection-outline").css('-webkit-transform',$(element).css('-webkit-transform'));        
    }
    
    $(document).on('targetdom.element.mousemove',"#html-design-editor",_updateRotation);
    
    $(document).on('targetdom.element.mouseup',"#html-design-editor",function(event){
        rotationEntryPoint = null;
        mouseDown = false;
    });
    
    $(document).on('mousedown',"#element-rotation-control",function(event){
        mouseDown = true;
        rotationEntryPoint = Math.atan2(elementCenter.centerY - event.pageY, event.pageX - elementCenter.centerX);
        event.preventDefault();
        event.stopPropagation();
    });
    
    $(document).on('mouseup',".controlDiv",function(event){
        rotationEntryPoint = null;
        mouseDown = false;
        $("#html-design-editor").trigger('html.element.updated');
        event.preventDefault();
        event.stopPropagation();
    });
    
    exports.bindRotationHandler = bindRotationHandler;
    
});