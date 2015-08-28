/**
 * @author Swagatam Mitra
  
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";
    
    var AppInit       = brackets.getModule("utils/AppInit");        
    var UIBuilder = require("attribute/HTMLAttributeEditorUIBuilder");
    var AttributeToolBoxTemplate = require("text!attribute/html/attributeToolboxTemplate.html");
    
    var lastSelectedElement;
    
    //ADGroupElement prototype
    /*function ADGroupElement(elementArr){
        this.elements = elementArr;
    }
    
    ADGroupElement.prototype.attr = function (key,value){
        var index = 0;
        var element = null;
        for(index = 0;index< this.elements.length;index++){
            element = this.elements[index];
            $(
        }
    }*/
            
    $(document).on("element.selected","#html-design-editor",function(event,element){
        lastSelectedElement = element;
        UIBuilder.buildUI(lastSelectedElement);
    });
    
    
    
    $(document).on("deselect.all","#html-design-editor",function(event){
        lastSelectedElement = null;
    });
    
    function _showAttrEditor(){
        if(lastSelectedElement){
           $("#attribute-editor").show(); 
        }
    }
    
    function _hideAttrEditor(){
        $("#attribute-editor").hide();
    }
    
    $(document).on("click","#attr-editor-close", function(event){
        $("#attribute-editor").toggleClass("toolboxCollapsed");
        $(this).toggleClass("collapsed");
        event.preventDefault();
        event.stopPropagation();
    });
    
    $(document).on("click","#attribute-list-anchor", function(event){
        _showAttrEditor();
    });
        
    AppInit.appReady(function () {
        $("#docked-toolbox").append(AttributeToolBoxTemplate);
    });
    
    AppInit.htmlReady(function () {
    });
    
    

});