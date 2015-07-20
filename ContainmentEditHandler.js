/**
 * @author Swagatam Mitra
  
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";
    
    var startOffset = null;
    var target = null;
    var isDragged = false;
    var dragSourceArea = null;
    var currentParent = null;
    var currentProspectiveParent = null;
    var layout;
    
    var preservedPosition = null;
    
    function _doCleanUp(event){
       if(event.which === 16){
           $("#parent-highlighter").hide(); 
           $("#prospective-parent-highlighter").hide();
           if(startOffset){
              layout.rollBack(preservedPosition);
              layout.refresh();
           }
           startOffset = null;
           currentParent = null;
           $(window).off('keyup',_doCleanUp);
           $(target).css('pointer-events','auto');
           $('.controlDiv').css('pointer-events','all');
           $("#html-design-editor").trigger("design.editor.drag.deactivated");
       } 
    }
    
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
        if(targetElement){
            while(!isContainerFound){
                if(_isContainer(targetElement.tagName) || target){
                    isContainerFound =  true;
                } else {
                    $(targetElement).css("pointer-events",'none');
                    toBeReverted.push(targetElement);
                    targetElement = doc.elementFromPoint(point.x,point.y);
                    if(!targetElement){
                       isContainerFound = true; 
                    }
                }
            }
        }
        //revert pointer event opacity of modified elements
        _makePointerEventOpaque(toBeReverted);
        return targetElement;
    }
    
    function _highlightProspectiveParent(point){
        var shadowedDoc = document.getElementById('htmldesignerIframe').contentWindow.document;
        var prospectiveParent = _getContainerAtPoint(shadowedDoc,point);
        if(!prospectiveParent){
            prospectiveParent = document.getElementById('htmldesignerIframe').contentWindow.document.body;
        }
        if(prospectiveParent !== currentParent && prospectiveParent !== currentProspectiveParent){
            var boundingRect = prospectiveParent.getBoundingClientRect();
            currentProspectiveParent = prospectiveParent;
            $("#prospective-parent-highlighter").css("top",boundingRect.top+23);
            $("#prospective-parent-highlighter").css("left",boundingRect.left+23);
            $("#prospective-parent-highlighter").css("width",boundingRect.width);
            $("#prospective-parent-highlighter").css("height",boundingRect.height);
            $("#prospective-parent-highlighter").css('-webkit-transform',$(prospectiveParent).css('-webkit-transform'));
            $("#prospective-parent-highlighter").show();
        }
    }
    
    function _highlightCurrentParent(element){
        var boundingRect = element.getBoundingClientRect();
        $("#parent-highlighter").css("top",boundingRect.top+23);
        $("#parent-highlighter").css("left",boundingRect.left+23);
        $("#parent-highlighter").css("width",boundingRect.width);
        $("#parent-highlighter").css("height",boundingRect.height);
        $("#parent-highlighter").css('-webkit-transform',$(element).css('-webkit-transform'));
        $("#parent-highlighter").show();
    }
    
    function _isPinInEventOnDragSource(point){
        if( point.x >= dragSourceArea.left && point.x <= (dragSourceArea.left + dragSourceArea.width)
          && point.y >= dragSourceArea.top && point.y <= (dragSourceArea.top + dragSourceArea.height)){
            return true;                                              
        } else {
            return false;                                              
        }
    }
    
    function _initCDrag(event,element,point){
        if( target && _isPinInEventOnDragSource(point)){
            startOffset = point;
            isDragged = false; 
            currentParent = target.parentNode;
            currentProspectiveParent = null;
            _highlightCurrentParent(target.parentNode);
            $(target).css('pointer-events','none');
            $(window).on('keyup',_doCleanUp);
            preservedPosition = layout.createSavePoint();
            $('.controlDiv').css('pointer-events','none');
            layout.open();
            $("#html-design-editor").trigger("design.editor.drag.activated");
        }
    }
    
    function _doCDrag(event,element,point){
        if(target && startOffset){
            _highlightProspectiveParent(point);
            layout.changeX(startOffset.x - point.x);
            layout.changeY(startOffset.y - point.y);
            startOffset = point;
            $("#html-design-editor").trigger("refresh.element.selection");
            isDragged = true;
        }
    }
    
    function _endCDrag(event,element,point){
        if(target && startOffset){
            $(target).css('pointer-events','auto');
            $("#html-design-editor")
            .trigger(
                "design.editor.event"
                ,['change.element.parent'
                ,{ element : target, prospectiveParent:currentProspectiveParent,template:target.outerHTML},'html']
              );
            $("#html-design-editor").trigger("design.editor.drag.deactivated");
            $("#hover-outline").hide();
            startOffset = null;
            isDragged = false;
            $("#parent-highlighter").hide(); 
            $("#prospective-parent-highlighter").hide();
            startOffset = null;
            $(window).off('keyup',_doCleanUp);
            currentParent = null;
            $('.controlDiv').css('pointer-events','all');
            layout.close();
            //$("#html-design-editor").trigger("select.element",[layout.boxModel.targetElement]);
        }
    }
    
    $(document).on("layout.decision","#html-design-editor", function(event,layoutObj){
        layout = layoutObj;
     });
    
    $(document).on("element.selected","#html-design-editor",function(event,element){
        dragSourceArea = element.getBoundingClientRect();
        target = element;
    });
            
    $(document).on("containmentmousedown","#html-design-editor", _initCDrag);
    
    $(document).on("containmentmousemove","#html-design-editor", _doCDrag);

    $(document)
        .on("containmentmouseup containmentmouseout containmentmouseleave","#html-design-editor"
        ,_endCDrag);
        
});