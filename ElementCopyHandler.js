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
    var layout;
    
    var preservedPosition = null;
    var CSSCloner = require("stylemodule/CSSRulesetCloneHandler");
    var IDGen = require("widgetprofiles/UIDGenerator");
    
    function _isPinInEventOnDragSource(point){
        if( point.x >= dragSourceArea.left && point.x <= (dragSourceArea.left + dragSourceArea.width)
          && point.y >= dragSourceArea.top && point.y <= (dragSourceArea.top + dragSourceArea.height)){
            return true;                                              
        } else {
            return false;                                              
        }
    }
    
    function _initCopyDrag(event,element,point){
        if( target && _isPinInEventOnDragSource(point)){
            startOffset = point;
            isDragged = false; 
            currentParent = target.parentNode;
            
            var decendents = $(target).find("[id]");
            if(target.id){
                decendents.push(target);
            }
            var newElementTemplate = target.outerHTML;
            var decendent = null;
            var newID = null;
            var idMap = {};
            for(var count=0;count<decendents.length;count++){
                decendent = decendents[count];
                newID = decendent.tagName.toLowerCase()+IDGen.getID()+"-"+count;
                newElementTemplate = newElementTemplate.split(decendent.id).join(newID);
                idMap[decendent.id] = newID;
            } 
            target = $(newElementTemplate)
                .appendTo(currentParent).show();
            CSSCloner.cloneCSSRules(decendents,idMap);
            
            $("#html-design-editor").trigger("select.element",[target[0]]);
            setTimeout(function(){ layout.open();},50);
        }
    }
    
    function _doCopyDrag(event,element,point){
        if(target && startOffset){
            $("#html-design-editor").trigger("design.editor.copy.drag.activated");
            layout.changeX(startOffset.x - point.x);
            layout.changeY(startOffset.y - point.y);
            startOffset = point;
            $("#html-design-editor").trigger("refresh.element.selection");
            isDragged = true;
        }
    }
    
    function _endCopyDrag(event,element,point){
        if(target && startOffset){
            $("#html-design-editor").trigger("design.editor.drag.deactivated");
            $("#hover-outline").hide();
            startOffset = null;
            //target = null;
            isDragged = false;
            $('.controlDiv').css('pointer-events','all');
            layout.close();
            $("#html-design-editor").trigger("html.element.dropped");
        }
    }
    
    $(document).on("layout.decision","#html-design-editor", function(event,layoutObj){
        layout = layoutObj;
     });
    
    $(document).on("element.selected","#html-design-editor",function(event,element){
        dragSourceArea = element.getBoundingClientRect();
        target = element;
    });
            
    $(document).on("copymousedown","#html-design-editor", _initCopyDrag);
    
    $(document).on("copymousemove","#html-design-editor", _doCopyDrag);

    $(document)
        .on("copymouseup copymouseout copymouseleave ","#html-design-editor"
        ,_endCopyDrag);
        
});