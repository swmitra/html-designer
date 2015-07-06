/**
 * @author Swagatam Mitra
  
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";
     
    var AppInit       = brackets.getModule("utils/AppInit");
    
    var currentContext = { type:'pointer', profile:'html', template: null};
    var newElement = null;
    var newElementID = null;
    var targetContainer = null;
    
    var ProfileSelector = require("widgetprofiles/WidgetProfileSelector");
    
    function _initDrag(){
        $("#element-drawing-plane").show();
    }
    
    $(document).on("bind-dragsources","#widget-toolbox",function(event){
        $( ".widgetDragSource" ).draggable({
          helper: _createWidgetLook,
          start: _initDrag,
          cursorAt: { top: 10, left: 10 }
        });
    });
    
    $(document).on('mousedown',".widgetDragSource",function(event){
        currentContext.profile = this.dataset.profile;
        currentContext.type=this.id.replace('ad-element-','');
        if(currentContext.type != 'pointer'){
           $("#element-drawing-plane").show();
        } else {
            $("#element-drawing-plane").empty();
            $("#element-drawing-plane").hide(); 
        } 
    });
    
    function _endDrag(event,ui){
      $("#element-drawing-plane").hide();
        _sendNewElementToTargetDOM(event,ui);
    }
    
    //Layered selection management    
    function _makePointerEventOpaque(elements){
        var count = 0;
        for(count = 0;count<elements.length;count++){
            $(elements[count]).css("pointer-events",'auto');
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
            }else if(targetElement.tagName === 'DIV' || targetElement.tagName === 'BODY'){
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
    
    function _create(event,ui){
        var shadowedDoc = document.getElementById('htmldesignerIframe').contentWindow.document;
        var targetX = event.clientX - $("#element-drawing-plane").offset().left - event.offsetX;
        var targetY = event.clientY - $("#element-drawing-plane").offset().top - event.offsetY;
        targetContainer = _getContainerAtPoint(shadowedDoc,{x:targetX,y:targetY});
        if(!targetContainer){
            targetContainer = shadowedDoc.body;
        }
        return {x:targetX,y:targetY};
    }
    
    function _createWidgetLook(){
        var template = ProfileSelector.getProfile(currentContext.profile).getTemplate(currentContext.type);
        newElement = $(template.template).clone();
        newElementID = template.uid;
        return newElement;
    }
    
    function _sendNewElementToTargetDOM(event,ui){
        var targetPoint = _create(event,ui);
        if(newElement[0]){
            $(newElement).css('left',targetPoint.x+'px').css('top',targetPoint.y+'px').removeAttr("class");
            var newWidgettemplate = newElement[0].outerHTML;
            var parentElement = $(targetContainer || document.getElementById('htmldesignerIframe').contentWindow.document.body);
           
            $("#html-design-editor")
            .trigger(
                "design.editor.event"
                ,[
                    'create.new.element'
                    ,{ template : newWidgettemplate, containerElement:parentElement,uid:newElementID}
                    ,currentContext.profile
                    ,currentContext.type
                ]
              );
            newElement.remove();
            $("#element-drawing-plane").hide();
            newElement = null;
        }
    }
    
    AppInit.appReady(function () {
        $( ".widgetDragSource" ).draggable({
          helper: _createWidgetLook,
          start: _initDrag,
          cursorAt: { top: 10, left: 10 }
        });
        
        $("#element-drawing-plane").droppable({
          accept: "*",
          drop: _sendNewElementToTargetDOM
        });
        
        $("#element-drawing-plane").on('dragenter dragleave dragover',function(event){
            event.preventDefault();
        });
        
    });
    
});