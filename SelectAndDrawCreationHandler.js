/**
 * @author Swagatam Mitra
  
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";
       
    var currentContext = { type:'pointer', profile:'html', template: null};
    var startOffset = null;
    var newElement = null;
    var newElementID = null;
    var targetContainer = null;
    
    var ProfileSelector = require("widgetprofiles/WidgetProfileSelector");
    
    function _enableSelectPointer(event){
        if($("input:focus").length === 0 && $("textarea:focus").length === 0){
            if(event.which === 86){
                $("#ad-element-pointer").click();
            }
        }
    }
    
    $(document).on('click',".widgetDrawSource",function(event){
        $(".widgetDragSourceSelected").removeClass("widgetDragSourceSelected");
        $(this).addClass("widgetDragSourceSelected");
        currentContext.profile = this.dataset.profile;
        currentContext.type=this.id.replace('ad-element-','');
        if(currentContext.type != 'pointer'){
           $("#element-drawing-plane").show();
        } else {
            $("#element-drawing-plane").empty();
            $("#element-drawing-plane").hide(); 
        }
        event.preventDefault();
        event.stopPropagation();
    });
    
    //Layered selection management    
    function _makePointerEventOpaque(elements){
        var count = 0;
        for(count = 0;count<elements.length;count++){
            $(elements[count]).css("pointer-events",'auto');
        }
    }
    
    function _isContainer(tagName){
        switch(tagName){
            case 'DIV':
            case 'SPAN':
            case 'BODY':
            case 'P':return true;
            default: return false;
        }
    }
    
    //use iteration to find the next element in z-index
    function _getContainerAtPoint(doc,point){
        var toBeReverted = [];
        var isContainerFound = false;
        var targetElement = doc.elementFromPoint(point.x,point.y);
        
        while(!isContainerFound && targetElement){
            if(targetElement.tagName === 'HTML'){
                targetElement = null;
            }else if(_isContainer(targetElement.tagName)){
                isContainerFound =  true;
            } else {
                $(targetElement).css("pointer-events",'none');
                toBeReverted.push(targetElement);
                targetElement = doc.elementFromPoint(point.x,point.y);
            }
        }
        //revert pointer event opacity of modified elements
        _makePointerEventOpaque(toBeReverted);
        return targetElement;
    }
    
    $(document).on('mousedown',"#element-drawing-plane",function(event){
        startOffset = { x:event.clientX,y:event.clientY };
        var shadowedDoc = document.getElementById('htmldesignerIframe').contentWindow.document;
        var targetX = event.clientX - $(event.target).offset().left /*+ $(shadowedDoc).scrollLeft()*/;
        var targetY = event.clientY - $(event.target).offset().top /*+ $(shadowedDoc).scrollTop()*/;
        targetContainer = _getContainerAtPoint(shadowedDoc,{x:targetX,y:targetY});
        if(!targetContainer){
            targetContainer = shadowedDoc.body;
        }
        event.preventDefault();
        event.stopPropagation();
    });
    
    function _createWidget(){
        var template = ProfileSelector.getProfile(currentContext.profile).getTemplate(currentContext.type);
        newElement = $(template.template).appendTo("#element-drawing-plane").css('pointer-events','none').css('position','absolute');
        newElementID = template.uid;
        
    }
    
    $(document).on('mousemove',"#element-drawing-plane",function(event){
       if(startOffset){
           if(newElement){
               newElement.css('width', (event.clientX - startOffset.x));
               newElement.css('height', (event.clientY - startOffset.y));
               
               if(event.clientX < startOffset.x){
                   newElement.css('left',event.clientX-$("#element-drawing-plane").offset().left);
                   newElement.css('width', (startOffset.x - event.clientX));
               } else {
                   newElement.css('width', (event.clientX - startOffset.x));
               }
               
               if(event.clientY < startOffset.y){
                   newElement.css('top',event.clientY-$("#element-drawing-plane").offset().top);
                   newElement.css('height', (startOffset.y - event.clientY));
               } else {
                   newElement.css('height', (event.clientY - startOffset.y));
               }
               
           } else {
               _createWidget();
               
               if(event.clientX < startOffset.x){
                   newElement.css('left',event.clientX-$("#element-drawing-plane").offset().left);
                   newElement.css('width', (startOffset.x - event.clientX));
               } else {
                   newElement.css('left',startOffset.x-$("#element-drawing-plane").offset().left);
                   newElement.css('width', (event.clientX - startOffset.x));
               }
               
               if(event.clientY < startOffset.y){
                   newElement.css('top',event.clientY-$("#element-drawing-plane").offset().top);
                   newElement.css('height', (startOffset.y - event.clientY));
               } else {
                   newElement.css('top', startOffset.y-$("#element-drawing-plane").offset().top);
                   newElement.css('height', (event.clientY - startOffset.y));
               }
           }
            event.preventDefault();
            event.stopPropagation();
       }
    });
    
    function _sendNewElementToTargetDOM(){
        if(newElement){
            var newWidgettemplate = newElement[0].outerHTML;
            var parentElement = $(targetContainer || document.getElementById('htmldesignerIframe').contentWindow.document.body);
            $("#html-design-editor")
            .trigger(
                "design.editor.event"
                ,['create.new.element'
                  ,{ template : newWidgettemplate, containerElement:parentElement,uid:newElementID}
                  ,currentContext.profile
                 ]
              );
            newElement.remove();
            newElement = null;
        }
    }
    
    $(window).on('keyup',_enableSelectPointer);
    
    $(document).on('mouseup',"#element-drawing-plane",function(event){
        startOffset = null;
        _sendNewElementToTargetDOM();
        event.preventDefault();
        event.stopPropagation();
    });
    
});