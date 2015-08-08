/**
 * @author Swagatam Mitra
  
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";
    
    var mouseDownOffset = null;
    var mouseUpOffset = null;
    
    function isAClick(){
        if(mouseDownOffset && mouseUpOffset){
            if(   mouseDownOffset.clientX === mouseUpOffset.clientX 
               && mouseDownOffset.clientY === mouseUpOffset.clientY
              ){
                return true;
            } else {
                return false;
            }
        }
    }
    
    function _getElementFromTargetDOM(event){
        var toBeReturned = null;
        var shadowedDoc = document.getElementById('htmldesignerIframe').contentWindow.document;
        var targetX = event.clientX - $(".eventListnerPane").offset().left/*+ $(shadowedDoc).scrollLeft()*/;
        var targetY = event.clientY - $(".eventListnerPane").offset().top /*+ $(shadowedDoc).scrollTop()*/;
        var targetElement = shadowedDoc.elementFromPoint(targetX,targetY);
        toBeReturned = [targetElement,{x:targetX,y:targetY}];  
        return toBeReturned;
    }
    
    function _getElementFromTragetDOMUnderSelectionOutline(event){
        var shadowedDoc = document.getElementById('htmldesignerIframe').contentWindow.document;
        var targetX = event.clientX - $(event.target).offset().left + $(shadowedDoc).scrollLeft() + $("#selection-outline").position().left;
        var targetY = event.clientY - $(event.target).offset().top + $(shadowedDoc).scrollTop() + $("#selection-outline").position().top;
        var targetElement = shadowedDoc.elementFromPoint(targetX,targetY);
        var toBeReturned = [targetElement,{x:targetX,y:targetY}];
        return toBeReturned;
    }
    
    $(document).on('click',".eventListnerPane",function(event){
        if(isAClick()){
            var params = _getElementFromTargetDOM(event);
            if(params[0] && params[0].tagName !== 'BODY'){
                if(event.ctrlKey === true || event.metaKey === true ){
                    $("#html-design-editor").trigger("multiselect.click", params);
                }else if(event.altKey === true ){
                    $("#html-design-editor").trigger("layeredselect.click",params);
                } else {
                    $("#html-design-editor").trigger("targetdom.element.click", params);
                }
            } else {
                $("#html-design-editor").trigger("deselect.all", params);
                $("#html-design-editor").trigger("groupdeselect.all", params);
                $("#html-design-editor").trigger("onbody.selection", params);
            }
        }
    });
    
    $(document).on('contextmenu',".eventListnerPane",function(event){
        $("#html-design-editor").trigger("targetdom.contextmenu", _getElementFromTargetDOM(event));
    });
    
    $(document).on('mouseover mouseout mouseleave mousedown mouseup dblclick mousemove',".eventListnerPane",function(event){ 
        if(event.type === 'mousedown'){
            mouseDownOffset = {clientX: event.clientX,clientY:event.clientY};
            mouseUpOffset = null;
        } else if(event.type === 'mouseup'){
            mouseUpOffset = {clientX: event.clientX,clientY:event.clientY};
        }
          
        var params = _getElementFromTargetDOM(event);
        if(params[0]){
            _handleQualifiedMouseEvents(event,params);
        }
    });
    
    function _handleQualifiedMouseEvents(event,params){
        if(event.shiftKey === true){
            $("#html-design-editor").trigger("containment"+event.type,params);
        } else if(event.ctrlKey === true){
            $("#html-design-editor").trigger("copy"+event.type,params);
        } else {
            if(event.type === 'mousedown' && params[0].tagName === 'BODY'){
                $("#html-design-editor").trigger("multiselect"+event.type,params);
            }else{
                if(event.altKey === false ){
                    $("#html-design-editor").trigger("targetdom.element."+event.type,params);
                }    
            }
        }
    }
    
    $(document).on('dblclick',".eventListnerPane",function(event){ 
        var params = _getElementFromTargetDOM(event);
        if(params[0]){
           $("#html-design-editor").trigger("targetdom-dblclick",params);
        }
    });
    
});