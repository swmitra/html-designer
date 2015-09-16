/**
 * @author Swagatam Mitra
  
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";
    
    require("ResizeHandler");
    
    var lastSelectedElement = null;
    var defferedSelect = [];
    var multiselectArea = null;
    
    function _isSelectEventOnMultiSelectArea(point){
        if(multiselectArea && _isPointWithinGivenArea(point)){
            return true;                                              
        } else {
            return false;                                              
        }
    }
      
    function _isPointWithinGivenArea(point){
        if( point.x >= multiselectArea.left && point.x <= multiselectArea.right &&
            point.y >= multiselectArea.top && point.y <= multiselectArea.bottom ){
            return true;
        }else{
            return false;
        }
    }
    
    function getOffset( target ) {
        var _x = 0;
        var _y = 0;
        var targetParam = target;
        var _brdrTop,_brdrLeft;
        while( target && !isNaN( target.offsetLeft ) && !isNaN( target.offsetTop ) ) {
            _x += target.offsetLeft - target.scrollLeft;
            _y += target.offsetTop - target.scrollTop;
            target = target.offsetParent;
            if(target){
                _brdrTop = parseInt($(target).css("border-top-width")) || 0;
                _brdrLeft = parseInt($(target).css("border-left-width")) || 0;
                _x += _brdrLeft;
                _y += _brdrTop; 
            }
        }
        return { top: _y, left: _x, width: $(targetParam).outerWidth(false), height: $(targetParam).outerHeight(false) };
    }
    
    function _showControls(element,refresh){
        var transform = $(element).css('transform');
        var offset = null;
        if(transform && transform!== 'none'){
            offset = getOffset(element);
        } else {
            offset = element.getBoundingClientRect();
        }
        //var offset = element.getBoundingClientRect();//getOffset(element);
        /*var width = $(element).outerWidth(false),
            height = $(element).outerHeight(false);*/
                
        $("#selection-outline").css("top",offset.top+23);
        $("#selection-outline").css("left",offset.left+23);
        /*$("#selection-outline").css("width",width - 2);
        $("#selection-outline").css("height",height - 2);*/
        $("#selection-outline").css("width",offset.width - 2);
        $("#selection-outline").css("height",offset.height - 2);
        
        $("#selection-outline").css('transform',$(element).css('transform'));
        $("#selection-outline").css('transform-origin',$(element).css('transform-origin'));
        
        lastSelectedElement = element;
        //$(".controlDiv").show();
        //$("#html-design-editor").trigger("selection-area-computed",[offset,width,height]);
        if(refresh){
            $("#html-design-editor").trigger("element.selection.refreshed",[element]);
        } else {
            $("#html-design-editor").trigger("element.selected",[element]);
        }
    }
    
    function _handleSelection(element){
        $(".multiSelectStyle").removeClass("multiSelectStyle");
        $('#multiselection-toolbox').hide();
        _handleDeselection();
        _showControls(element);
        $("#selection-outline").show();
        defferedSelect = [];
        //_handleAfterPseudo(element);
    }
    
    function _handleDeselection(){
        $("#selection-outline").hide();
        lastSelectedElement = null;
    }
    
    function _refreshSelection(event,force){
        var asynchPromise = new $.Deferred();
        if(lastSelectedElement){
            _showControls(lastSelectedElement,force ? null : true); 
        }
        asynchPromise.resolve();
        return asynchPromise.promise();
    }
    
    $(document).on('deselect.all',"#html-design-editor",_handleDeselection);
    
    
    $(document).on("targetdom.element.click","#html-design-editor", function(event,element,point){
        if(!_isSelectEventOnMultiSelectArea(point)){
            _handleSelection(element);
            multiselectArea = null;
        }
     });
    
    $(document).on('refresh.element.selection',"#html-design-editor",_refreshSelection);
    
    //Layered selection management    
    function _makePointerEventOpaque(elements){
        var count = 0;
        for(count = 0;count<elements.length;count++){
            $(elements[count]).css("pointer-events",'auto');
        }
    }
    
    //use iteration to find the next element in z-index
    function _getNextElementAtPoint(point,doc,currentSelectedElement){
        var toBeReverted = [];
        var targetElement = doc.elementFromPoint(point.x,point.y);
        var isContainerFound = false;
        if(targetElement){
            //Reach the current selected element first
            while(!isContainerFound){
                if(targetElement === currentSelectedElement){
                    isContainerFound = true;
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
        //Find the next element in z-index now
        if(targetElement === currentSelectedElement){
            $(targetElement).css("pointer-events",'none');
            toBeReverted.push(targetElement);
            targetElement = doc.elementFromPoint(point.x,point.y);
        } else { //Beyond current selection so return null as we are exiting layers
            targetElement = null;
        }
        //revert pointer event opacity of modified elements
        _makePointerEventOpaque(toBeReverted);
        return targetElement;
    }
    
    
    $(document).on("layeredselect.click","#html-design-editor", function(event,element,point){
        // Change to be done here. Below code to be executed if the selection point for layered select is within the selected area
        var elementRect = lastSelectedElement.getBoundingClientRect();
        if( (point.x >= elementRect.left && point.x < elementRect.right) &&
            (point.y >= elementRect.top && point.y < elementRect.bottom)
          ){
                var doc = document.getElementById('htmldesignerIframe').contentWindow.document;
                var toBeSelected = _getNextElementAtPoint(point, doc,lastSelectedElement);
                if(toBeSelected){
                    _handleSelection(toBeSelected);
                }
        }
         
     });
    
    $(document).on("select.element","#html-design-editor", function(event,element,point){
        if(element){
            _handleSelection(element);
            multiselectArea = null;
        }
     });
    
    $(document).on("multiselectarea.computed","#html-design-editor", function(event,area){
         multiselectArea = area;
         lastSelectedElement = null;
     });
    
    exports.deSelectAll = _handleDeselection;
    exports.refreshSelection = _refreshSelection;
});