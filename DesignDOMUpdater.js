/**
 * @author Swagatam Mitra
  
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";
    
    /*
        Serves Custom events with following structure 
        {
            template: template to be used for creation of new element
            containerElement: <will be used to remove/edit the element> or to append element 
        }
    */
    
    function _computeLeftAndTopInTargetDOM(eventParams){
        var shadowedDoc = document.getElementById('htmldesignerIframe').contentWindow.document;
        var hScrollComp = $(shadowedDoc).scrollLeft();
        var vScrollComp = $(shadowedDoc).scrollTop();
        var targetDOMOffset = eventParams.containerElement.offset();
        var rootOffset = $(shadowedDoc.body).offset();
        if(eventParams.containerElement[0].tagName === 'DIV'){
            rootOffset = {top:-1,left:-1};
        }
        var designDOMPos = {top:parseInt($(eventParams.template).css('top')),left:parseInt($(eventParams.template).css('left'))};
        var targetLeft = designDOMPos.left - targetDOMOffset.left + rootOffset.left + hScrollComp;
        var targetTop = designDOMPos.top - targetDOMOffset.top + rootOffset.top + vScrollComp;
        return {top:targetTop,left:targetLeft};
    }
    
    function _deleteElement(element){
        var elements = $(element);
        var count;
        for(count=0;count<elements.length;count++){
            $("#html-design-editor").trigger('element.deleted',[elements[count].id]);
        }
        
        $(element).remove();
    }
    
    function _appendNewElement(eventParams){
        var targetDOMPos = _computeLeftAndTopInTargetDOM(eventParams);
        var element = $(eventParams.template)
        .css('position','absolute')
        .css('top',targetDOMPos.top)
        .css('left',targetDOMPos.left)
        .css('pointer-events','')
        .appendTo(eventParams.containerElement).show();
        $("#html-design-editor").trigger('element.added',[element[0]]);
         $("#html-design-editor").trigger("select.element",[element[0]]);
    }
    
    function _isPositioned(element){
        var position = $(element).css('position');
        return (    position === 'absolute' 
                 || position === 'fixed'
                 || position === 'relative') 
                 ? true
                 : false;
    }
    
    function _changeParent(eventParams){
        var currentBoundingRect = eventParams.element.getBoundingClientRect();
        var newElement = $(eventParams.template).appendTo(eventParams.prospectiveParent);
        var newBoundingRect = newElement[0].getBoundingClientRect();
        $(eventParams.element).remove();
        var parentOffset = $(newElement).offsetParent().offset();
                
        function _compensatePosition(event,layout){
            layout.changeX(newBoundingRect.left - currentBoundingRect.left);
            layout.changeY(newBoundingRect.top - currentBoundingRect.top);
            $("#html-design-editor").off("layout.decision", _compensatePosition);
            $("#html-design-editor").trigger("refresh.selection");
        }
        
        $("#html-design-editor").on("layout.decision", _compensatePosition);
        
        $("#html-design-editor").trigger("select.element",[newElement[0]]);
    }
    
    $(document).on("design.editor.event","#html-design-editor",function(event, type, eventParams,profile){
        if(profile === 'html' || profile === 'custom'){
            if(type === 'create.new.element'){
                _appendNewElement(eventParams);
                $("#html-design-editor").trigger('html.element.dropped');
            } else if(type === 'change.element.parent'){
                _changeParent(eventParams);
                $("#html-design-editor").trigger('html.element.updated');
            } else if(type === 'delete.element'){
                _deleteElement(eventParams.element);
                $("#html-design-editor").trigger('html.element.removed');
            }
        }
    });
    
});