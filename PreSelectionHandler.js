/**
 * @author Swagatam Mitra 
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";
    
    var isPreSelectionActivated = true;
    var preselectedElement = null;
    var lastSelectedElement = null;
       
    function _showPreControls(element){
        var boundingRect = element.getBoundingClientRect();
        $("#hover-outline").css("top",boundingRect.top+23);
        $("#hover-outline").css("left",boundingRect.left+23);
        $("#hover-outline").css("width",boundingRect.width);
        $("#hover-outline").css("height",boundingRect.height);
        $("#hover-outline").show();
        preselectedElement = element;
    }
    
    function _handlePreSelection(element){
        if(preselectedElement !== element){
            _handleDeselection();
            if(isPreSelectionActivated && element && element.tagName !== 'BODY' && element.tagName !== 'HTML' && lastSelectedElement!== element){
                _showPreControls(element);
            }
        }
    }
    
    function _handleDeselection(){
        $("#hover-outline").hide();
        preselectedElement = null;
    }
    
    $(document).on("panelResizeStart", "#designer-content-placeholder", function () {
        isPreSelectionActivated = false;
    });
    
    $(document).on("panelResizeEnd", "#designer-content-placeholder", function () {
        isPreSelectionActivated = true;
    });
    
    $(document).on("targetdom.element.mousemove copymousemove","#html-design-editor",function(event,element,point){
        _handlePreSelection(element);
    });
    
    $(document).on("mouseout","#scrollPlane",function(event){
        _handleDeselection();
    });
    
    $(document).on("targetdom.element.mouseout targetdom.element.mouseleave","#html-design-editor",function(){
        _handleDeselection();
    });
    
    $(document).on("element.selected","#html-design-editor",function(event,element){
        lastSelectedElement = element;
        _handleDeselection();
    });
    
    $(document).on("deselect.all","#html-design-editor",function(event,element){
        lastSelectedElement = null;
        _handleDeselection();
    });
    
});