/**
 * @author Swagatam Mitra
  
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, document, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";

    var FileSystem = brackets.getModule("filesystem/FileSystem");
    
	var AttributeTemplate = require("text!attribute/html/attributeTemplate.html");
    var attributes = JSON.parse(require("text!attribute/HTMLAttributeMetaData.json")); 
    var commonAttrs = attributes.html.common;
    
    function _buildEditorUI(selectedElement){
        var tagName = selectedElement.tagName;
        $("#attribute-editor > .attributeContainer").remove();
        _buildCommonAttrEntry(selectedElement);
        var specificAttrs = attributes.html[tagName];
        if(tagName === 'INPUT'){
            _buildSpecificAttrEntry(selectedElement,specificAttrs.attrs);
            var type = $(selectedElement).attr('type');
            if(type){
                type = specificAttrs.filter[type];
                if(type){
                    _buildSpecificAttrEntry(selectedElement,type);
                }
             }
        } else {
            _buildSpecificAttrEntry(selectedElement,specificAttrs);
        }
    }
    
    function _buildSpecificAttrEntry(selectedElement, specificAttrs){
       for( var i in specificAttrs){
            _buildUIFragment(selectedElement,specificAttrs[i]);
        } 
    }
    
    function _buildCommonAttrEntry(selectedElement){
       for( var i in commonAttrs){
            _buildUIFragment(selectedElement,commonAttrs[i]);
        } 
    }
    
    function _buildUIFragment(selectedElement, attr){
        switch (attr.type){
            case 'text': _buildTextEntryFragment(selectedElement,attr); break;
            case 'number': _buildNumberEntryFragment(selectedElement,attr); break;
            case 'path': _buildPathEntryFragment(selectedElement,attr); break;
            case 'list': _buildListEntryFragment(selectedElement,attr); break;
            case 'select' : _buildSelectEntryFragment(selectedElement,attr);break;
            case 'toggle' : _buildToggleFragment(selectedElement,attr);break;
        }
    }
    
    function _buildTextEntryFragment(selectedElement, attr){
       var entry = $(AttributeTemplate).appendTo("#attribute-editor");
       entry.find(".attr-key").html(attr.key);
       entry.find(".attr-value").val(attr.key === 'value' ? $(selectedElement).val() : $(selectedElement).attr(attr.key));
       entry.find(".attr-value").on('change',function(){
           if(attr.key === 'value'){
                $(selectedElement).val(entry.find(".attr-value").val()); 
           } else {
                var oldval = $(selectedElement).attr(attr.key);
                $(selectedElement).attr(attr.key,entry.find(".attr-value").val() || '');
                if(oldval && entry.find(".attr-value").val() && attr.key === "id"){
                    $("#html-design-editor").trigger("id-attribute-update",[oldval,entry.find(".attr-value").val()]);
                }
           }
           $("#html-design-editor").trigger("refresh.element.selection");
           $("#html-design-editor").trigger('html.element.updated');
       });
       return entry;
    }
    
    function _buildToggleFragment(selectedElement, attr){
       var entry = $(AttributeTemplate).appendTo("#attribute-editor");
        entry.find(".attr-key").html(attr.key);
        entry.find(".attr-value").hide();
        entry.find(".attr-value-select").hide();
        entry.find(".attr-toggle").show();
        entry.find(".attr-toggle-input").prop('checked',/*$(selectedElement).prop(attr.key)*/selectedElement.hasAttribute(attr.key));
        entry.find(".attr-toggle-input").on('change',function(){
           if(entry.find(".attr-toggle-input").prop('checked')){
               selectedElement.setAttributeNode(document.createAttribute(attr.key));
           } else {
               selectedElement.removeAttribute(attr.key);
           }
           //$(selectedElement).prop(attr.key,entry.find(".attr-toggle-input").prop('checked'));
           $("#html-design-editor").trigger("refresh.element.selection");
           $("#html-design-editor").trigger('html.element.updated');
        });
    }
    
    function _buildNumberEntryFragment(selectedElement, attr){
        var entry = _buildTextEntryFragment(selectedElement,attr);
        entry.find(".attr-value").attr('type','number');
    }
    
    function _buildSelectEntryFragment(selectedElement, attr){
        var entry = $(AttributeTemplate).appendTo("#attribute-editor");
        entry.find(".attr-key").html(attr.key);
        entry.find(".attr-value").hide();
        for(var i in attr.options){
          var option = document.createElement('OPTION');
          $(option).val(attr.options[i]).html(attr.options[i]).appendTo(entry.find(".attr-value-select"));
        }
        entry.find(".attr-value-select").show();
        entry.find(".attr-value-select").val($(selectedElement).attr(attr.key));
        entry.find(".attr-value-select").on('change',function(){
           $(selectedElement).attr(attr.key,entry.find(".attr-value-select").val());
           $("#html-design-editor").trigger("select.element",[selectedElement]);
           $("#html-design-editor").trigger('html.element.updated');
        });
    }
    
    function _buildPathEntryFragment(selectedElement, attr){
       var entry = _buildTextEntryFragment(selectedElement,attr);
       entry.find(".path-browse").show();
       
       entry.find(".path-browse").on('click',function(){
        FileSystem.showOpenDialog(false, false, "Please Select file", '', null,
            function (err, files) {
                if (!err) {
                    entry.find(".attr-value").val(files[0]);
                    entry.find(".attr-value").trigger('change');
                } else {
                //    result.reject();
                }
            });
       });
    }
    
    function _buildListEntryFragment(selectedElement, attr){  
    }
    
    exports.buildUI = _buildEditorUI;

});