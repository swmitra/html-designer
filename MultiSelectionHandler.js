/**
 * @author Swagatam Mitra
  
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";
    
    var multiselectTemplate = '<div class="multiSelectedElement" style="position:absolute;border:1px solid blue;pointer-events:none;"></div>';
    
    var elementGroup;
    var multiselectMarkers;
    var multiSelectArea;
    var currentRefIndex;
    
    function _isSelectEventOnMultiSelectArea(point){
        if(multiSelectArea){
            if( point.x >= multiSelectArea.left && point.x <= multiSelectArea.right
              && point.y >= multiSelectArea.top && point.y <= multiSelectArea.bottom){
                return true;                                              
            } else {
                return false;                                              
            }
        } else {
            return false;
        }
    }
    
    function _removeMultiSelectMarkers(){
        $(".multiSelectedElement").remove();
        $('#multiselection-toolbox').hide();
        //elementGroup = null;
        multiselectMarkers = [];
        multiSelectArea = null;
        currentRefIndex = null;
    }
    
    function _markReference(index){
        if(currentRefIndex === index){
            $(".blinkinghighlight").removeClass("blinkinghighlight");
            currentRefIndex = -1;
        } else {
            currentRefIndex = index;
            $(".blinkinghighlight").removeClass("blinkinghighlight");
            multiselectMarkers[index].addClass("blinkinghighlight");
            $("#html-design-editor").trigger("groupreference.selected",[elementGroup[index]]);
        }
    }
    
    function _unionRect(rect1,rect2){
        return {
            left: Math.min(rect1.left,rect2.left)
           ,top: Math.min(rect1.top,rect2.top)
           ,bottom: Math.max(rect1.bottom,rect2.bottom)
           ,right: Math.max(rect1.right,rect2.right)
        }
    }
    
    function _showSelectionArea(area){
        if(area){
            $("#selection-outline").addClass("multiSelectStyle");
            $(".controlDiv").addClass("multiSelectStyle");
            $("#selection-outline")
            .css("top",area.top+23)
            .css("left",area.left+23)
            .css("width",area.right - area.left - 2)
            .css("height",area.bottom - area.top - 2)
            .show();
            $('#multiselection-toolbox').show();
        } else {
            $("#selection-outline").removeClass("multiSelectStyle");
            $(".controlDiv").removeClass("multiSelectStyle");
            $('#multiselection-toolbox').hide();
            $("#selection-outline").hide();
        }
        multiSelectArea = area;
    }
   
    function _markMultiSelectElements(elements){
        var index=0;
        var boundingRect = null;
        var unionArea = null;
        var marker;
        multiselectMarkers = [];
        for(index = 0;index<elements.length;index++){
            boundingRect = elements[index].getBoundingClientRect();
            unionArea = unionArea ? _unionRect(unionArea,boundingRect) : boundingRect;
            marker = $(multiselectTemplate)
            .css('top',boundingRect.top+23)
            .css('left',boundingRect.left+23)
            .css('width',boundingRect.width - 2)
            .css('height',boundingRect.height - 2)
            .appendTo("#info-overlay-plane");
            
            multiselectMarkers.push(marker);
        }
        
        _showSelectionArea(unionArea);
        
        $("#html-design-editor").trigger('multiselectarea.computed',[unionArea]);
        elementGroup = elements;
        $("#html-design-editor").trigger("multiselect.done",[elementGroup]);
        
    }
    
    function _refreshSelection(){
        var index=0;
        var boundingRect = null;
        var unionArea = null;
        var marker;
        if(elementGroup){
            for(index = 0;index<elementGroup.length;index++){
                boundingRect = elementGroup[index].getBoundingClientRect();
                unionArea = unionArea ? _unionRect(unionArea,boundingRect) : boundingRect;
                marker = multiselectMarkers[index];
                marker
                .css('top',boundingRect.top+23)
                .css('left',boundingRect.left+23)
                .css('width',boundingRect.width - 2)
                .css('height',boundingRect.height - 2);
            }
            _showSelectionArea(unionArea);
        
            $("#html-design-editor").trigger('multiselectarea.computed',[unionArea]);
        }
    }
    
    $(document).on('grouprefresh.element.selection',"#html-design-editor",_refreshSelection);
   
    $(document).on("multiselection.done","#html-design-editor", function(event,elements){
        $("#html-design-editor").trigger('deselect.all');
        _removeMultiSelectMarkers();
        _markMultiSelectElements(elements);
    });
    
    $(document).on("groupdeselect.all","#html-design-editor", function(event,elements){
        _removeMultiSelectMarkers();
        $("#html-design-editor").trigger('multiselectarea.computed',[null]);
    });
    
    $(document).on("groupReselect","#html-design-editor", function(event){
        var elements = elementGroup;
        var refIndex = currentRefIndex;
        $("#html-design-editor").trigger('deselect.all');
        _removeMultiSelectMarkers();
        _markMultiSelectElements(elements);
        _markReference(refIndex);
    });
    
    $(document).on("targetdom.element.click","#html-design-editor", function(event,element,point){
        if(_isSelectEventOnMultiSelectArea(point)){
            if(elementGroup.indexOf(element) != -1){
                _markReference(elementGroup.indexOf(element));
            } else {
                $("#html-design-editor").trigger("select.element",[element]);
            }
        }
     });
    
    $(document).on('design-editor-shown',"#html-design-editor",_removeMultiSelectMarkers); 
    
    $(document).on('element.selected',"#html-design-editor",_removeMultiSelectMarkers); 
});